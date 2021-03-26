import { Client, MessageEmbed } from "discord.js";
import api from "../../api";
import logger from "../../logging";
import { SlashCommandListener } from "./api/listen-to-commands";
import { registerCommand } from "./api/register-command";
import { SlashCommand } from "./api/SlashCommand";

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
        const rankings = allPlayers
          .map((player, index) => `${index + 1}. **${player.name}** with elo **${player.elo}** elo.`)
          .join("\n");
        const stats = await api.stats();
        const winnerNames = stats.biggestUpset?.winners
          .map((winner) => winner.name)
          .join(", ");
        const loserNames = stats.biggestUpset?.losers
          .map((loser) => loser.name)
          .join(", ");

        const probability = Math.round(
          100 * (stats.biggestUpset?.probability ?? 0)
        );
        const embed = new MessageEmbed()
          .setTitle("Statistics")
          .addField("Player rankings", rankings)
          .addField("\u200b", "\u200b")
          .addField("General stats", `
          Total amount of games played: **${stats.gamesPlayed}**.
          The highest elo of all times is **${stats.highestElo?.name}** with an elo of **${stats.highestElo?.elo}** at \`${stats.highestElo?.time.toLocaleDateString('nb')}\`
          The lowest elo of all times is **${stats.lowestElo?.name}** with an elo of **${stats.lowestElo?.elo}** at \`${stats.lowestElo?.time.toLocaleDateString('nb')}\`
          The biggest upset was where **${winnerNames}** won against **${loserNames}**. The elo difference was **${stats.biggestUpset?.eloDifference}** and **${winnerNames}** had a **${probability}%** chance to win. This happened on the \`${stats.biggestUpset?.time.toLocaleDateString('nb')}\``)
          .setTimestamp(new Date())

        return {
          embeds: [embed],
        };
      } catch (err) {
        log.error({ err }, "Failed to get players: %s", err.message);
      }
      return { content: "Players not found" };
    }

    // A specific player
    try {
      const profile = await api.getPlayerProfile(playerName);
      const playerRank = (await api.getRankings())
        .map((player, index) => ({rank: index + 1, player}))
        .find(({player}) => player.name === profile?.name)?.rank;
      const historyForPlayer = await api.getHistoryForPlayer(playerName, 0);
      const totalAmountOfGamesPlayed = historyForPlayer.length;
      const totalAmountOfLosses = historyForPlayer.filter((h) =>
        h.losers.some((p) => p === playerName)
      ).length;
      const totalAmountOfWins = totalAmountOfGamesPlayed - totalAmountOfLosses;
      if (profile && historyForPlayer) {
        const embed = new MessageEmbed()
          .setTitle(`Statistics: ${profile.name}`)
          .addField("Ranking", `Current elo is **${profile.elo}**.\nRanked as player **#${playerRank}** on the leaderboard.`)
          .addField("\u200b", `**${profile.name}** has played **${totalAmountOfGamesPlayed}** matches and has won **${totalAmountOfWins}** and lost **${totalAmountOfLosses}**.
          Last activity was \`${profile.lastActivity.toLocaleString()}\``)
          .setTimestamp(Date.now())
        return { embeds: [embed]};
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
