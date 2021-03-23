const app = require("./http");
const slackBot = require("./slack-bot");
const pkgJson = require("../package");
const config = require("./config");

if (config.slackApiToken) {
  slackBot(config.slackApiToken).catch(console.error);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Listening on", port);
});

console.log("Elo ranking server %s", pkgJson.version);
