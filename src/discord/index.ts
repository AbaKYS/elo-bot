import { Bot } from "./bot";
import { getUrl } from "./invite-url";
import logging from "../logging";

const log = logging("discord");

export function startBot() {
  const bot = new Bot();

  const inviteUrl = getUrl();
  log.info({ inviteUrl }, "Invite the bot by using this link: %s", inviteUrl);

  log.info("Loaded " + bot.messageHandlers.length + " message handlers");
  bot.start();
}
