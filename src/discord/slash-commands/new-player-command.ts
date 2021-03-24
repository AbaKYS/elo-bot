import { Client } from "discord.js";
import api from "../../api";
import { SlashCommandListener } from "./api/listen-to-commands";
import { registerCommand } from "./api/register-command";
import { SlashCommand } from "./api/SlashCommand";

export const newPlayerCommand: SlashCommand = {
  name: "newplayer",
  description: "Add a new player",
  options: [
    {
      type: 3,
      name: "name",
      description: "Player name. This will be used in other commands.",
      default: false,
      required: true,
    },
  ],
};

export async function registerNewPlayerCommand(
  client: Client,
  guildId: string
) {
  return registerCommand(client, guildId, newPlayerCommand);
}

export const newPlayerCommandHandler: SlashCommandListener = {
  async onCommand(client, interaction) {
    const playerName = interaction.data?.options?.[0].value;
    if (playerName) {
      api.newPlayer(playerName);
      return { content: `Player ${playerName} has been added` };
    }
    return { content: "No name found, now kys" };
  },
};
