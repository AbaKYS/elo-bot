import { Client } from "discord.js";
import { registerCommand } from "./register-command";
import { SlashCommand } from "./SlashCommand";

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
