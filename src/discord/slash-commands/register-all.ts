import { Client } from "discord.js";
import { activeGuilds } from "../guilds";
import { registerNewPlayerCommand } from "./new-player-command";
import logging from "../../logging";

export function registerAll() {
  const log = logging("registerAll");

  const client = new Client();
  client.on("ready", async () => {
    const guilds = activeGuilds();

    try {
      for (const guildId of guilds) {
        try {
          log.info("Registering for guild %s", guildId);
          await registerNewPlayerCommand(client, guildId);
          log.info({ guildId }, "Registered newPlayerCommand");
        } catch (err) {
          log.error(
            { err },
            "Failed to register newPlayerCommand: %s",
            err.message
          );
        }
      }
    } catch (err) {
      log.error(err);
    }

    process.exit(0);
  });

  client.login(process.env.DISCORD_BOT_TOKEN);
}
