import "./env";
import app from "./http";
//import slackBot from "./slack-bot";
import config from "./config";
import logging from "./logging";
import { startBot } from "./discord";

const log = logging("index");
log.info("Elo ranking server");

//if (config.slackApiToken) {
//  slackBot(config.slackApiToken).catch(console.error);
//}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  log.info({ port }, "Listening on port %s", port);
});

if (config.discordToken) {
  startBot();
} else {
  log.warn("No discord token found! Check the .env file");
}

process.on("SIGINT", () => {
  log.info("Process interrupted. Exiting");
  process.exit(0);
});
