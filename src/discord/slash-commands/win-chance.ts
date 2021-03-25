import { Client } from "discord.js";
import api from "../../api";
import logger from "../../logging";
import { SlashCommandListener } from "./api/listen-to-commands";
import { registerCommand } from "./api/register-command";
import { SlashCommand } from "./api/SlashCommand";
import { find } from "./util/find-option";

const log = logger("winchanceCommand");

export const winChanceCommand: SlashCommand = {
  name: "winchance",
  description: "Gives a win chance between two players",
  options: [
    {
      type: 3,
      name: "winner",
      description: "The player who wants to win",
      default: false,
      required: true,
    },
    {
      type: 3,
      name: "loser",
      description: "The player that should lose",
      default: false,
      required: true,
    },
  ],
};

export async function registerWinChanceCommand(
  client: Client,
  guildId: string
) {
  return registerCommand(client, guildId, winChanceCommand);
}

export const winChanceHandler: SlashCommandListener = {
  async onCommand(client, interaction) {
    const options = interaction.data?.options;
    const winner = find<string>("winner", options);
    const loser = find<string>("loser", options);

    if (winner && loser) {
      try {
        const winChance = await api.getWinChanceBetweenTwoPlayers(
          winner,
          loser
        );
        const percent = Math.round(100 * winChance);
        return {
          content: `**${winner}** has a **${percent}%** chance to beat **${loser}**`,
        };
      } catch (err) {
        log.error({ err }, "Failed to get winchance: %s", err.message);
        return { content: "Failed to get winchance: " + err.message };
      }
    }
    return { content: "Try to write in a name you stupid fuck, now kys" };
  },
};
