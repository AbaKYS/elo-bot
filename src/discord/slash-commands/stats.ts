import { Client } from "discord.js";
import api from "../../api";
import { SlashCommandListener } from "./api/listen-to-commands";
import { registerCommand } from "./api/register-command";
import { SlashCommand } from "./api/SlashCommand";
import logger from "../../logging";

const log = logger("statsCommand");

export const statsCommand: SlashCommand = {
  name: "stats",
  description: "Get the stats of all players, or a specific player.",
  options: [
    {
      type: 3,
      name: "name",
      description:
        "Name of a specific player. Leave this empty to get all players. Type general for general stats",
      default: false,
      required: false,
    },
  ],
};

export async function registerStatsCommand(client: Client, guildId: string) {
  return registerCommand(client, guildId, statsCommand);
}

export const statsCommandHandler: SlashCommandListener = {
  async onCommand(client, interaction) {
    const playerName = interaction.data?.options?.[0].value;
    // All players
    if (!playerName) {
      try {
        const allPlayers = await api.getRankings();
        const content = allPlayers
          .map(
            (player, index) =>
              `On ${index + 1}. we find ${player.name}, with an elo of ${
                player.elo
              }.`
          )
          .join("\n");
        return {
          content,
        };
      } catch (err) {
        log.error({ err }, "Failed to get players: %s", err.message);
      }
      return { content: "Players not found" };
    }

    if (playerName == "general") {
      try {
        const stats = await api.stats();
        return {
          content:
            `Total amount of games played ${stats.gamesPlayed} \n` +
            `----------------------- \n` +
            `The one with highest elo of all times is ${stats.highestElo?.name} with an elo of ${stats.highestElo?.elo} on the ${stats.highestElo?.time}  \n` +
            `----------------------- \n` +
            `The one with the lowest elo of all times is ${stats.lowestElo?.name} with an elo of ${stats.lowestElo?.elo} on the ${stats.lowestElo?.time} \n` +
            `----------------------- \n` +
            `The biggest upset was ${stats.biggestUpset?.winners} vs ${stats.biggestUpset?.losers} where ${stats.biggestUpset?.winners} won against ${stats.biggestUpset?.losers}. The elo difference was ${stats.biggestUpset?.eloDifference} and ${stats.biggestUpset?.winners} had a ${stats.biggestUpset?.probability} ` +
            `probability to win. This happened on the ${stats.biggestUpset?.time} \n` +
            `----------------------- \n`,
        };
      } catch (err) {
        log.error({ err }, "Failed get stats: %s", err.message);
      }
    }

    // A specific player
    try {
      const profile = await api.getPlayerProfile(playerName);
      if (profile) {
        return {
          content: `${profile.name}'s elo is ${
            profile.elo
          }, and the last activity was ${profile.lastActivity.toLocaleString()}`,
        };
      } else {
        return { content: "Failed to find player " + playerName };
      }
    } catch (err) {
      log.error(
        { err, playerName },
        "Failed to find player %s: %s",
        playerName,
        err.message
      );
    }
    return { content: "No name found, now kys" };
  },
};
