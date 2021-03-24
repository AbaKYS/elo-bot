import logging from "../logging";
import { Bot } from "./bot";
import { getUrl } from "./invite-url";
import {
  newMatchCommand,
  newMatchCommandHandler,
} from "./slash-commands/new-match";
import {
  newPlayerCommand,
  newPlayerCommandHandler,
} from "./slash-commands/new-player-command";
import { statsCommand, statsCommandHandler } from "./slash-commands/stats";
import {
  undoLastMatchCommand,
  undoLastMatchHandler,
} from "./slash-commands/undo-last-match";

const log = logging("discord");

export async function startBot() {
  const bot = new Bot();

  const inviteUrl = getUrl();
  log.info({ inviteUrl }, "Invite the bot by using this link: %s", inviteUrl);

  // Load handlers here
  log.info("Loaded " + bot.messageHandlers.length + " message handlers");

  bot.slashCommandHandlers.set(newPlayerCommand.name, newPlayerCommandHandler);
  bot.slashCommandHandlers.set(undoLastMatchCommand.name, undoLastMatchHandler);
  bot.slashCommandHandlers.set(newMatchCommand.name, newMatchCommandHandler);
  bot.slashCommandHandlers.set(statsCommand.name, statsCommandHandler);

  await bot.start();
}
