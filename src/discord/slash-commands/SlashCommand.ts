import { SlashCommandOption } from "./register-command";

export interface SlashCommand {
  /** No spaces. For `/myCommand` */
  name: string;
  /** Human readable description. */
  description: string;
  options: SlashCommandOption[];
}
