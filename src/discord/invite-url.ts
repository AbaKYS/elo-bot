/**
 * Get the invite url for this bot.
 */
export function getUrl() {
  const clientId = process.env.DISCORD_BOT_CLIENT_ID;
  const permissions = process.env.DISCORD_BOT_PERMISSIONS || 0;
  return `https://discordapp.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=${permissions}`;

}

export function getOauthUrl(){
  const clientId = process.env.DISCORD_BOT_CLIENT_ID;
  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=0&scope=bot%20applications.commands`
}

