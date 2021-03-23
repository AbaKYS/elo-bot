import "./env";
import app from "./http";
//import slackBot from "./slack-bot";
//import config from "./config";
import logging from "./logging";

const log = logging("index");
log.info("Elo ranking server");


//if (config.slackApiToken) {
//  slackBot(config.slackApiToken).catch(console.error);
//}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  log.info({ port }, "Listening on port %s", port);
});
