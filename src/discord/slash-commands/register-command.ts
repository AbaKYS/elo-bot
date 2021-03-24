import {
  Client,
  GuildMember,
  MessageEmbed,
  MessageMentionTypes,
  Snowflake,
  User,
} from "discord.js";
import logging from "../../logging";

export interface SlashCommandOption {
  type: 3 | number;
  /** Option name. No spaces */
  name: string;
  /** Human readable description */
  description: string;
  default: boolean;
  required: boolean;
}
export interface SlashCommand {
  /** No spaces. For `/myCommand` */
  name: string;
  /** Human readable description. */
  description: string;
  options: SlashCommandOption[];
}

/**
 * Register a command for the bot. This is a one-time thing.
 * Create commands with https://rauf.wtf/slash/.
 * @param client
 * @param guildId the guild to register commands in. Global commands are cached for an hour
 * @param slashCommand
 */
export async function registerCommand(
  client: Client,
  guildId: string,
  slashCommand: SlashCommand
) {
  const clientId = client.user?.id || process.env.DISCORD_BOT_CLIENT_ID || "";

  const guild = (client as any).api
  .applications(clientId)
  .guilds(guildId);
  const result = await guild.commands.post({ data: slashCommand }); //Update command with patch
}

enum InteractionType {
  PING = 1,
  ApplicationCommand = 2,
}

interface ApplicationCommandInteractionDataOption {
  name: string;
  value?: any;
  options?: ApplicationCommandInteractionDataOption[];
}

interface ApplicationCommandInteractionData {
  id: Snowflake;
  name: string;
  options?: ApplicationCommandInteractionDataOption[];
}

export interface Interaction {
  id: Snowflake;
  type: InteractionType;
  data?: ApplicationCommandInteractionData;
  guild_id?: Snowflake;
  channel_id?: Snowflake;
  member?: GuildMember; // member when in guild, user when in direct message
  user?: User;
  token: string;
  version: 1 | number;
}

interface InteractionApplicationCommandCallbackData {
  tts?: boolean;
  content?: string; // A message
  embeds?: MessageEmbed[];
  allowed_mentions?: MessageMentionTypes;
  /** set to 64 to make your response ephemeral */
  flags?: 64 | number;
}

export interface SlashCommandListener {
  onCommand(
    client: Client,
    command: SlashCommand,
    interaction: Interaction
  ): Promise<InteractionApplicationCommandCallbackData>;
}

export function listenToCommands(
  client: Client,
  command: SlashCommand,
  listener: SlashCommandListener
) {
  const log = logging("SlashCommand:" + command.name);

  client.ws.on(
    "INTERACTION_CREATE" as any,
    async (interaction: Interaction) => {
      try {
        const responseMessage = await listener.onCommand(
          client,
          command,
          interaction
        );

        (client as any).api
          .interactions(interaction.id, interaction.token)
          .callback.post({
            data: {
              type: 4, // ChannelMessageWithSource - respond to an interaction with a message
              data: responseMessage,
            },
          });

        // Alternatively to send followup messages
        //new Discord.WebhookClient(client.user.id, interaction.token).send('hello world')
      } catch (err) {
        log.error({ command }, "Failed to get response for command");
      }
    }
  );
}
