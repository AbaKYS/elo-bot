import logging from "../logging";
import { Bot } from "./bot";
import { getUrl } from "./invite-url";
import {
  historyCommand,
  historyCommandHandler,
} from "./slash-commands/history";
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

  bot.addHandler(newPlayerCommand, newPlayerCommandHandler);
  bot.addHandler(undoLastMatchCommand, undoLastMatchHandler);
  bot.addHandler(newMatchCommand, newMatchCommandHandler);
  bot.addHandler(statsCommand, statsCommandHandler);
  bot.addHandler(historyCommand, historyCommandHandler);

  await bot.start();
}
