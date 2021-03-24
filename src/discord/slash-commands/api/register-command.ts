import { Client } from "discord.js";
import { SlashCommand } from "./SlashCommand";

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

  const guild = (client as any).api.applications(clientId).guilds(guildId);
  const result = await guild.commands.post({ data: slashCommand }); //Update command with patch
}
