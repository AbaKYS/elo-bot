import { Client } from "discord.js";
import api from "../../api";
import logger from "../../logging";
import { SlashCommandListener } from "./api/listen-to-commands";
import { registerCommand } from "./api/register-command";
import { SlashCommand, SlashCommandChoice } from "./api/SlashCommand";
import { find } from "./util/find-option";

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
    const options = interaction.data?.options;
    const winner = find<string>("winnername", options);
    const loser = find<string>("losername", options);

    if (!loser || !winner) {
      return {
        content: `Winner or loser is missing: winner: '${winner}', loser: '${loser}'.`,
      };
    }

    try {
      const matchStats = await api.resolveGame({ winner, loser });
      const probability = Math.round(100 * (matchStats.probability ?? 0));
      return {
        content:
          `Congratulations **${winner}** you gained **${matchStats.deltaElo}** elo with a **${probability}%** to win and you now have an elo of **${matchStats.winner.elo}**!` +
          ` **${loser}** you can just go and kys with a trash elo of **${matchStats.loser.elo}**.`,
      };
    } catch (err) {
      log.error({ err }, "Failed to register game: %s", err.message);
      return { content: "Failed to register the game: " + err.message };
    }
  },
};

export async function createDynamicNewMatchCommand(): Promise<SlashCommand> {
  if (!newMatchCommand.options) {
    throw new Error(
      "The underlying command has changed! Please update this method"
    );
  }

  const players: string[] = await api.getPlayerNames();
  const playerChoices: SlashCommandChoice[] = players.map((player) => ({
    name: player,
    value: player,
  }));
  newMatchCommand.options[0].choices = playerChoices;
  newMatchCommand.options[1].choices = playerChoices;
  return newMatchCommand;
}
