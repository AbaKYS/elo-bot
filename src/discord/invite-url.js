"use strict";
exports.__esModule = true;
exports.getUrl = void 0;
/**
 * Get the invite url for this bot.
 */
function getUrl() {
    var clientId = process.env.DISCORD_BOT_CLIENT_ID;
    var permissions = process.env.DISCORD_BOT_PERMISSIONS || 0;
    return "https://discordapp.com/oauth2/authorize?client_id=" + clientId + "&scope=bot&permissions=" + permissions;
}
exports.getUrl = getUrl;
