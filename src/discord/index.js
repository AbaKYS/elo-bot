"use strict";
exports.__esModule = true;
exports.startBot = void 0;
var bot_1 = require("./bot");
var invite_url_1 = require("./invite-url");
var logging_1 = require("../logging");
var log = logging_1["default"]("discord");
function startBot() {
    var bot = new bot_1.Bot();
    var inviteUrl = invite_url_1.getUrl();
    log.info({ inviteUrl: inviteUrl }, "Invite the bot by using this link: %s", inviteUrl);
    log.info("Loaded " + bot.messageHandlers.length + " message handlers");
    bot.start();
}
exports.startBot = startBot;
