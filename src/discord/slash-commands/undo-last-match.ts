import { Client } from "discord.js";
import api from "../../api";
import logger from "../../logging";
import { SlashCommandListener } from "./api/listen-to-commands";
import { registerCommand } from "./api/register-command";
import { SlashCommand } from "./api/SlashCommand";
import { joinNames } from "./util/join-names";

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
      const lastGame = await api.undoLastGame();

      const winners = joinNames(lastGame.winners);
      const losers = joinNames(lastGame.losers);
      return {
        content: `A match where ${winners} won over ${losers} has been deleted`,
      };
    } catch (err) {
      log.error({ err }, "Failed to register name: %s", err.message);
      return { content: "Failed to register the game: " + err.message };
    }
  },
};
