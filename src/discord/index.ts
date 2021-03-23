import { Bot } from "./bot";
import { getUrl } from "./invite-url";
import logging from "../logging";
import { listenToCommands } from "./slash-commands/register-command";
import { newPlayerCommand } from "./slash-commands/new-player-command";

const log = logging("discord");

export async function startBot() {
  const bot = new Bot();

  const inviteUrl = getUrl();
  log.info({ inviteUrl }, "Invite the bot by using this link: %s", inviteUrl);

  // Load handlers here
  log.info("Loaded " + bot.messageHandlers.length + " message handlers");

  bot.slashCommandHandlers.set(newPlayerCommand, () => {

  });


  await bot.start();
}
