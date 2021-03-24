import { Client, Snowflake } from "discord.js";
import logging from "../logging";

export function getGuilds() {
  const log = logging("getGuilds");

  const client = new Client();
  client.on("ready", () => {
    const guilds = client.guilds.cache.map((guild) => guild.id);
    log.info({ guilds }, "Got guilds");
    process.exit(0);
  });

  client.login(process.env.DISCORD_BOT_TOKEN);
}

export function activeGuilds(): Snowflake[] {
  return process.env.GUILD_IDS?.split(",") || [];
}
