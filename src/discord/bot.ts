import discord from "discord.js";
import logging from "../logging";
import { TinyEmitter } from "tiny-emitter";
import {
  Interaction,
  SlashCommandListener,
} from "./slash-commands/api/listen-to-commands";
import {
  SlashCommand,
  SlashCommandName,
} from "./slash-commands/api/SlashCommand";
import { registerCommand } from "./slash-commands/api/register-command";
import { activeGuilds } from "./guilds";

const log = logging("bot");

export interface BotOptions {
  token?: string;
}

export interface DiscordMessageHandler {
  handle(message: discord.Message): void;
}

export type SlashCommandCreator = () => Promise<SlashCommand>;
export type Event = string;

export const events = new TinyEmitter();

export class Bot {
  public client: discord.Client;
  options: BotOptions;
  isReady = false;

  public messageHandlers: DiscordMessageHandler[] = [];
  private slashCommandHandlers: Map<
    SlashCommandName,
    SlashCommandListener
  > = new Map();
  private slashCommandCreators: Map<Event, SlashCommandCreator[]> = new Map();

  constructor(options: BotOptions = {}) {
    this.client = new discord.Client();
    this.options = options;

    this.options.token = this.options.token || process.env.DISCORD_BOT_TOKEN;
  }

  /**
   * @param event when the command should be re-registered
   * @param createSlashCommand the function that creates the new slash command
   */
  public addDynamicCommand(
    event: string|string[],
    createSlashCommand: SlashCommandCreator
  ) {
    const events = Array.isArray(event) ? event : [event];
    for (let e of events) {
      let creators = this.slashCommandCreators.get(e);
      if (!creators) {
        creators = [];
      }
      creators.push(createSlashCommand);
      this.slashCommandCreators.set(e, creators);
    }
  }

  // TODO: get an even for when new players are added, and re-run the createSlashCommand.

  public addHandler(
    slashCommand: SlashCommand,
    listener: SlashCommandListener
  ) {
    this.slashCommandHandlers.set(slashCommand.name.toLowerCase(), listener);
  }

  public async start() {
    if (!this.options.token || this.options.token === "<missing>") {
      log.error(
        {
          tokenUri: `https://discord.com/developers/applications/${process.env.DISCORD_BOT_CLIENT_ID}/bot`,
        },
        "Discord token is missing! Set it in .env as DISCORD_BOT_TOKEN"
      );
      return;
    }

    this.listenToReady();
    this.listenToSlashCommands();
    this.listenToMessages();

    try {
      log.info("Logging in to discord...");
      await this.client.login(this.options.token);
      log.info("Logged in");
    } catch (err) {
      log.error(
        { err, token: this.options.token },
        "Failed to log in to discord: %s",
        err.message
      );
    }
  }

  private listenToReady() {
    this.client.once("ready", () => {
      this.isReady = true;

      const servers = this.client.guilds.cache.map((guild) => guild.name);
      log.info({ servers }, "Discord client is ready");
      this.client.user?.setActivity("!help", {
        type: "WATCHING",
      });

      this.listenToCustomEvents();
      events.emit("start");
    });
  }

  private listenToCustomEvents() {
    const eventNames = this.slashCommandCreators.keys();
    for (const ev of eventNames) {
      const guilds = activeGuilds();

      events.on(ev, async () => {
        const handlers = this.slashCommandCreators.get(ev) ?? [];
        for (const handler of handlers) {
          for (const guild of guilds) {
            registerCommand(this.client, guild, await handler());
          }
        }
      });
    }
  }

  private listenToMessages() {
    this.client.on("message", (message) => {
      this.handleMessage(message);
    });
  }

  handleMessage(message: discord.Message) {
    this.messageHandlers.forEach((handler) => {
      handler.handle(message);
    });
  }

  private listenToSlashCommands() {
    this.client.ws.on(
      "INTERACTION_CREATE" as any,
      (interaction: Interaction) => {
        this.handleInteractions(interaction);
      }
    );
  }

  /** Interactions are also known as slash commands. */
  private async handleInteractions(interaction: Interaction) {
    const commandName = interaction.data?.name;
    if (!commandName) {
      log.warn(
        { interaction },
        "No command name found in interaction %s",
        interaction.id
      );
      return;
    }
    const handler = this.slashCommandHandlers.get(commandName);

    if (!handler) {
      log.warn(
        { interaction },
        "No handler found for interaction %s",
        interaction.id
      );
      return;
    }

    try {
      const responseMessage = await handler.onCommand(this.client, interaction);
      (this.client as any).api
        .interactions(interaction.id, interaction.token)
        .callback.post({
          data: {
            type: 4,
            data: responseMessage,
          },
        });

      // Alternatively to send followup messages
      //new Discord.WebhookClient(client.user.id, interaction.token).send('hello world')
    } catch (err) {
      log.error(
        { err, interaction },
        "Failed to get response for command %s (%s)",
        commandName,
        interaction.id
      );
    }
  }
}
