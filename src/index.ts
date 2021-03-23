import app from "./http";
//import slackBot from "./slack-bot";
import pkgJson from "../package.json";
import config from "./config";
import logging from "./logging";

const args = process.argv.slice(2); //first two are "node" and script path
const log = logging("index");
log.info("Elo ranking server %s", pkgJson.version);

if (args[0] === "registerCommands") {

}

//if (config.slackApiToken) {
//  slackBot(config.slackApiToken).catch(console.error);
//}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  log.info({ port }, "Listening on port %s", port);
});
