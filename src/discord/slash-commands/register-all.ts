import { Client } from "discord.js";
import logging from "../../logging";
import { activeGuilds } from "../guilds";
import { registerNewMatchCommand } from "./new-match";
import { registerNewPlayerCommand } from "./new-player-command";
import { registerStatsCommand } from "./stats";
import { registerUndoLastMatchCommand } from "./undo-last-match";
import { registerHistoryCommand } from "./history";

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
          await registerUndoLastMatchCommand(client, guildId);
          log.info({ guildId }, "Registered undoLastMatchCommand");
          await registerNewMatchCommand(client, guildId);
          log.info({ guildId }, "Registered newMatchCommand");
          await registerStatsCommand(client, guildId);
          log.info({ guildId }, "Registered statsCommand");
          await registerHistoryCommand(client, guildId);
          log.info({ guildId }, "Registered historyCommand");
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
