import "./env";
import logging from "./logging";
import { startBot } from "./discord";
import { getGuilds } from "./discord/guilds";
import { registerAll } from "./discord/slash-commands/register-all";

const log = logging("cli");
const args = process.argv.slice(2); //first two are "node" and script path

const firstArg = args[0];

switch (firstArg) {
  case "registerCommands":
    registerAll();
    break;
  case "testDiscord":
    startBot();
    break;
  case "listGuilds":
    getGuilds();
    break;
}
