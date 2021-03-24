import { Client } from "discord.js";
import api from "../../api";
import { SlashCommandListener } from "./api/listen-to-commands";
import { registerCommand } from "./api/register-command";
import { SlashCommand } from "./api/SlashCommand";
import logger from "../../logging";

const log = logger("statsCommand");

export const statsCommand: SlashCommand = {
  name: "stats",
  description: "Hvis man ikke skriver inn navn kommer stats på alle spillerne",
  options: [
    {
      type: 3,
      name: "name",
      description: "Spilleren du ønsker å se stats til",
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
    if (!playerName) {
      try {
        const allPlayers = await api.getRankings();
        const content = allPlayers
          .map(
            (player, index) =>
              "On " +
              index +
              ". We find " +
              player.name +
              " with an elo of " +
              player.elo
          )
          .join("\n");
        return {
          content,
        };
      } catch (err) {
        log.error({ err }, "Failed to get list %s: %s", err.message);
      }
      return { content: "List not found" };
    }

    try {
      const profile = await api.getPlayerProfile(playerName);
      if (profile) {
        return {
          content: `${profile.name} sin elo er ${profile.elo} og siste aktivitet var på ${profile.lastActivity}`,
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
