import logging from "../logging";
import { Bot } from "./bot";
import { getOauthUrl, getUrl } from "./invite-url";
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
import {
  winChanceCommand,
  winChanceHandler
} from "./slash-commands/win-chance";
import { createDynamicPlayerCommand } from "./slash-commands/util/create-dynamic-player-command";

const log = logging("discord");

export async function startBot() {
  const bot = new Bot();

  const inviteUrl = getUrl();
  log.info(
    { inviteUrl, oauth: getOauthUrl() },
    "Invite the bot by using this link: %s",
    inviteUrl
  );

  // Load handlers here
  log.info("Loaded " + bot.messageHandlers.length + " message handlers");

  bot.addHandler(newPlayerCommand, newPlayerCommandHandler);
  bot.addHandler(undoLastMatchCommand, undoLastMatchHandler);
  bot.addHandler(newMatchCommand, newMatchCommandHandler);
  bot.addHandler(statsCommand, statsCommandHandler);
  bot.addHandler(historyCommand, historyCommandHandler);
  bot.addHandler(winChanceCommand, winChanceHandler);

  bot.addDynamicCommand(["start", "newPlayer"], createDynamicPlayerCommand(historyCommand, ((cmd, p) => {
    cmd.options[0].choices = p;
    // cmd.options[1].choices = [{name: '1', value: 1}, {name: '2', value: 2}];
  })));
  bot.addDynamicCommand(["start", "newPlayer"], createDynamicPlayerCommand(newMatchCommand, ((cmd, p) => {
    cmd.options[0].choices = p;
    cmd.options[1].choices = p;
  })));
  bot.addDynamicCommand(["start", "newPlayer"], createDynamicPlayerCommand(winChanceCommand, ((cmd, p) => {
    cmd.options[0].choices = p;
    cmd.options[1].choices = p;
  })));

  bot.addDynamicCommand(["start", "newPlayer"], createDynamicPlayerCommand(statsCommand, (cmd, p) => {
    cmd.options[0].choices = p;
  }));

  await bot.start();
}
