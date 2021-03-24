import { Client } from "discord.js";
import api from "../../api";
import { SlashCommandListener } from "./api/listen-to-commands";
import { registerCommand } from "./api/register-command";
import { SlashCommand } from "./api/SlashCommand";

export const undoLastMatchCommand: SlashCommand = {
  name: "undoMatch",
  description: "Removes last match",
};

export async function registerUndoLastMatchCommand(
  client: Client,
  guildId: string
) {
  return registerCommand(client, guildId, undoLastMatchCommand);
}

export const undoLastMatchHandler: SlashCommandListener = {
  async onCommand(client, interaction) {
    api.undoLastGame();
    return { content: "Last match deleted" };
  },
};
