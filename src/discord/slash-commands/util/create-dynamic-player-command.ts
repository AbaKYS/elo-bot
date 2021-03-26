import { SlashCommand, SlashCommandChoice, SlashCommandOption } from "../api/SlashCommand";
import api from "../../../api";
import { SlashCommandCreator } from "../../bot";

export function createDynamicPlayerCommand(command: SlashCommand, apply: (command: SlashCommand & {options: SlashCommandOption[]}, players: SlashCommandChoice[]) => void): SlashCommandCreator {
  return async () => {
    if (!command.options) {
      throw new Error(
        "The underlying command has changed! Please update this method"
      );
    }

    const players: string[] = await api.getPlayerNames();
    const playerChoices: SlashCommandChoice[] = players.map((player) => ({
      name: player,
      value: player,
    }));
    apply(command as SlashCommand & {options: SlashCommandOption[]}, playerChoices);
    return command;
  }
}
