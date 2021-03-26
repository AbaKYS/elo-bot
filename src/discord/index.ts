import api from "../api";
import logging from "../logging";
import { Bot } from "./bot";
import { getOauthUrl, getUrl } from "./invite-url";
import {
  SlashCommand,
  SlashCommandChoice,
} from "./slash-commands/api/SlashCommand";
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
  winChanceHandler,
} from "./slash-commands/win-chance";

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

  bot.addDynamicCommand("start", createDynamicNewMatchCommand);
  bot.addDynamicCommand("newPlayer", createDynamicNewMatchCommand);

  await bot.start();
}

async function createDynamicNewMatchCommand(): Promise<SlashCommand> {
  if (!newMatchCommand.options) {
    throw new Error(
      "The underlying command has changed! Please update this method"
    );
  }

  const players: string[] = await api.getPlayerNames();
  const playerChoices: SlashCommandChoice[] = players.map((player) => ({
    name: player,
    value: player,
  }));
  newMatchCommand.options[0].choices = playerChoices;
  newMatchCommand.options[1].choices = playerChoices;
  return newMatchCommand;
}
