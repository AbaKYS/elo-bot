import { Client } from "discord.js";
import api from "../../api";
import logger from "../../logging";
import { SlashCommandListener } from "./api/listen-to-commands";
import { registerCommand } from "./api/register-command";
import { SlashCommand } from "./api/SlashCommand";
import { find } from "./util/find-option";
import { joinStrings } from "./util/join-names";

const log = logger("history");

export const historyCommand: SlashCommand = {
  name: "history",
  description:
    "Gives history of the last matches. Enter a name to show history of the player",
  options: [
    {
      type: 3,
      name: "name",
      description: "The player you want to check the history of",
      default: false,
      required: false,
    },
    {
      type: 4,
      name: "amount",
      description: "Amount of games you want showed",
      default: false,
      required: false,
    },
  ],
};

export async function registerHistoryCommand(client: Client, guildId: string) {
  return registerCommand(client, guildId, historyCommand);
}

export const historyCommandHandler: SlashCommandListener = {
  async onCommand(client, interaction) {
    const options = interaction.data?.options;
    const playerName = find<string>("name", options);
    const amountOfGames = find<number>("amount", options);

    try {
      let histories;
      if (playerName) {
        // History for a specific player
        histories = await api.getHistoryForPlayer(playerName, amountOfGames);
      } else {
        // Histories for all players
        histories = await api.getHistory(amountOfGames);
      }

      log.debug(
        "Found %s histories for player '%s'",
        histories.length,
        playerName
      );

      const content =
        histories
          .map(
            ({ winners, losers, time, deltaElo }) =>
              `\`${time.toLocaleString()}\` - **${joinStrings(
                winners
              )}** beat **${joinStrings(
                losers
              )}** and gained **${deltaElo}** elo.`
          )
          .join(`\n`) || "No matches found";
      return { content: content };
    } catch (err) {
      log.error({ err }, "Failed to fetch history: %s", err.message);
      return { content: "Failed to fetch history: " + err.message };
    }
  },
};
