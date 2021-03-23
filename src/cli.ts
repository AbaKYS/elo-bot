import "./env";
import logging from "./logging";
import { startBot } from "./discord";


const log = logging("cli");
const args = process.argv.slice(2); //first two are "node" and script path

const firstArg = args[0];

switch(firstArg) {
  case "registerCommands": break;
  case "testDiscord": startBot(); break;
}
if (firstArg) {
  process.exit(0);
}