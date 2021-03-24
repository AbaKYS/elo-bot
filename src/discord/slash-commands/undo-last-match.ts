import { Client } from "discord.js";
import api from "../../api";
import { SlashCommandListener } from "./api/listen-to-commands";
import { registerCommand } from "./api/register-command";
import { SlashCommand } from "./api/SlashCommand";
import logger from "../../logging";

const log = logger("statsCommand");

export const undoLastMatchCommand: SlashCommand = {
  name: "undomatch",
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
    try {
      await api.undoLastGame();
      return { content: "Last match deleted." };
    } catch (err) {
      log.error({ err }, "Failed to register name: %s", err.message);
      return { content: "Failed to register the game: " + err.message };
    }
  },
};
