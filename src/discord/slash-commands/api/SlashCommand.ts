import { SlashCommandOption } from "./register-command";

export type SlashCommandName = string;

export interface SlashCommand {
  /** No spaces. For `/myCommand` */
  name: SlashCommandName;
  /** Human readable description. */
  description: string;
  options?: SlashCommandOption[];
}
