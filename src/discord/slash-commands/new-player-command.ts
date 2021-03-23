import { Client } from "discord.js";
import {
  registerCommand,
  SlashCommand,
} from "./register-command";

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

export function registerNewPlayerCommand(client: Client, guildId: string) {
  registerCommand(client, guildId, newPlayerCommand);
}