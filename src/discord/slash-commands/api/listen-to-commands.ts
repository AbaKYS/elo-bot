import {
  Client,
  GuildMember,
  MessageEmbed,
  MessageMentionTypes,
  Snowflake,
  User,
} from "discord.js";
import logging from "../../../logging";
import { SlashCommand } from "./SlashCommand";

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
        const responseMessage = await listener.onCommand(client, interaction);

        (client as any).api
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
        log.error({ command }, "Failed to get response for command");
      }
    }
  );
}
