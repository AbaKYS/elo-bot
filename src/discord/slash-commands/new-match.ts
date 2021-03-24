import { Client } from "discord.js";
import api from "../../api";
import logger from "../../logging";
import { SlashCommandListener } from "./api/listen-to-commands";
import { registerCommand } from "./api/register-command";
import { SlashCommand } from "./api/SlashCommand";

const log = logger("new-match");

export const newMatchCommand: SlashCommand = {
  name: "registermatch",
  description: "Registers a match, winner first and loser last",
  options: [
    {
      type: 3,
      name: "winnername",
      description: "Type in playername of the winner",
      default: false,
      required: true,
    },
    {
      type: 3,
      name: "losername",
      description: "Type in the playername of the loser",
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
      (option) => option.name === "winnername"
    )?.value;
    const loser: string = interaction.data?.options?.find(
      (option) => option.name === "losername"
    )?.value;

    if (!loser || !winner) {
      return {
        content: `Winner or loser is missing: winner: '${winner}', loser: '${loser}'.`,
      };
    }

    try {
      api.resolveGame({ winner, loser });
      return {
        content: `Congratulations ${winner}! ${loser} you can just go and kys`,
      };
    } catch (err) {
      log.error({ err }, "Failed to register game: %s", err.message);
      return { content: "Failed to register the game: " + err.message };
    }
  },
};
