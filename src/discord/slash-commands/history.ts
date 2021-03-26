import { Client, MessageEmbed } from "discord.js";
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
    let amountOfGames = find<number>("amount", options);

    try {
      let histories;
      if (amountOfGames === 0 || !amountOfGames) {
        amountOfGames = 10;
      }
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
      const embed = new MessageEmbed()
        .setTitle('History')
        .setDescription(`Latest ${amountOfGames} games for ${playerName ? playerName : 'all players'}.`)
        .addField('\u200b', '\u200b');
      if (histories.length === 0){
        embed.addField("No matches found.", "\u200b");
      } else {
        embed
        .addFields(histories.map(({winners, losers, time, deltaElo}) =>
          ({
            name: `${time.toLocaleString('nb')}`,
            value: `**${joinStrings(winners)}** beat **${joinStrings(losers)}**, gaining **${deltaElo}** elo.`,
            inline: false
          })
        ));
      }
      return { embeds: [embed]};
    } catch (err) {
      log.error({ err }, "Failed to fetch history: %s", err.message);
      return { content: "Failed to fetch history: " + err.message };
    }
  },
};
