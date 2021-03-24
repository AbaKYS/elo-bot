import discord from "discord.js";
import logging from "../logging";
import { SlashCommandListener } from "./slash-commands/listen-to-commands";
import { SlashCommand } from "./slash-commands/SlashCommand";

const log = logging("bot");

export interface BotOptions {
  token?: string;
}

export interface DiscordMessageHandler {
  handle(message: discord.Message): void;
}

export class Bot {
  public client: discord.Client;
  options: BotOptions;
  isReady = false;

  public messageHandlers: DiscordMessageHandler[] = [];
  public slashCommandHandlers: Map<
    SlashCommand,
    SlashCommandListener
  > = new Map();

  constructor(options: BotOptions = {}) {
    this.client = new discord.Client();
    this.options = options;

    this.options.token = this.options.token || process.env.DISCORD_BOT_TOKEN;
  }

  public async start() {
    this.client.once("ready", () => {
      this.isReady = true;

      const servers = this.client.guilds.cache.map((guild) => guild.name);
      log.info({ servers }, "Discord client is ready");
      this.client.user?.setActivity("!help", {
        type: "WATCHING",
      });
    });

    this.client.on("message", (message) => {
      this.handleMessage(message);
    });

    if (!this.options.token || this.options.token === "<missing>") {
      log.error("Discord token is missing!");
    } else {
      try {
        log.info("Logging in to discord...");
        await this.client.login(this.options.token);
        log.info("Logged in");
      } catch (err) {
        log.error(
          { token: this.options.token },
          "Failed to log in to discord: %s",
          err
        );
      }
    }
  }

  handleMessage(message: discord.Message) {
    this.messageHandlers.forEach((handler) => {
      handler.handle(message);
    });
  }
}
