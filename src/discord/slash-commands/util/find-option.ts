import { ApplicationCommandInteractionDataOption } from "../api/listen-to-commands";

export function find<T>(
  name: string,
  options: undefined | ApplicationCommandInteractionDataOption[]
): T | undefined {
  return options?.find((it) => it.name === name)?.value as T | undefined;
}
