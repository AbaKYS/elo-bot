import fs from "fs";
import path from "path";

const config = {
  mongoUrl: process.env.MONGO_URI || "mongodb://localhost:27017/elo-rankings",
  slackApiToken: process.env.SLACK_API_TOKEN,
  slackChannel: process.env.SLACK_CHANNEL || "elo-rankings",
  discordToken: process.env.DISCORD_BOT_TOKEN,
};

// Overwrite configuration from local file if this exists
if (fs.existsSync(path.join(__dirname, "../config.json"))) {
  Object.assign(config, require("../config"));
}

export default config;
