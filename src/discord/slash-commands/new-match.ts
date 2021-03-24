import { Client } from "discord.js";
import api from "../../api";
import logger from "../../logging";
import { SlashCommandListener } from "./api/listen-to-commands";
import { registerCommand } from "./api/register-command";
import { SlashCommand } from "./api/SlashCommand";
import { registerUndoLastMatchCommand } from "./undo-last-match";

const log = logger("new-match");

export const newMatchCommand: SlashCommand = {
  name: "registerMatch",
  description: "Registers a match, winner first and loser last",
  options: [
    {
      type: 3,
      name: "WinnerName",
      description: "Type inn playername of winner",
      default: false,
      required: true,
    },
    {
      type: 3,
      name: "LoserName",
      description: "Type inn the playername of the loser",
      default: false,
      required: true,
    },
  ],
};

export async function registerNewMatchCommand(client: Client, guildId: string) {
  return registerCommand(client, guildId, newMatchCommand);
}

export const newMatchCommandHandler: SlashCommandListener = {
  async onCommand(client, interaction) {
    const winner = interaction.data?.options?.find(
      (option) => option.name === "WinnerName"
    )?.value;
    const loser = interaction.data?.options?.find(
      (option) => option.name === "LoserName"
    )?.value;

    if (!loser || !winner) {
      return {
        content: `Winner or loser is missing: winner: '${winner}', loser: '${loser}'.`,
      };
    }

    try {
      api.resolveGame({ winner, loser });
      return { content: `Congratulations ${winner} and to ${loser}: kys` };
    } catch (err) {
      log.error({ err }, "Failed to register game: %s", err.message);
      return { content: "Failed to register the game: " + err.message };
    }
  },
};
