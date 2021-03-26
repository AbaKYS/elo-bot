export type SlashCommandName = string;

export interface SlashCommandChoice {
  name: string;
  value: string | number;
}

export interface SlashCommandOption {
  type: 3 | number;
  /** Option name. No spaces. Must be lowercase */
  name: string;
  /** Human readable description */
  description: string;
  default: boolean;
  required?: boolean;
  /** Only for subcommand type */
  options?: SlashCommandOption[];
  /** Only for int and string type */
  choices?: SlashCommandChoice[];
}

export interface SlashCommand {
  /** No spaces. Must be lowercase For `/mycommand` */
  name: SlashCommandName;
  /** Human readable description. */
  description: string;
  options?: SlashCommandOption[];
}

/**
 * For {@link SlashCommand.name} and {@link SlashCommandOption.name}
 */
export const nameRegex = /^[\w-]{1,32}$/;
