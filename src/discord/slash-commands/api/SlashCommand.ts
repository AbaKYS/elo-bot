export type SlashCommandName = string;

export interface SlashCommandOption {
  type: 3 | number;
  /** Option name. No spaces. Must be lowercase */
  name: string;
  /** Human readable description */
  description: string;
  default: boolean;
  required: boolean;
}

export interface SlashCommand {
  /** No spaces. Must be lowercase For `/mycommand` */
  name: SlashCommandName;
  /** Human readable description. */
  description: string;
  options?: SlashCommandOption[];
}
