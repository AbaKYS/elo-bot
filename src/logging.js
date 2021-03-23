"use strict";
exports.__esModule = true;
exports.rootLogger = void 0;
var pino_1 = require("pino");
var is_env_1 = require("./util/is-env");
var loggerName = process.env.LOG_ROOT_NAME || "elo-bot";
exports.rootLogger = pino_1["default"]({
    name: loggerName,
    level: is_env_1.isDev() ? "debug" : "info",
    prettyPrint: is_env_1.isDev()
});
function default_1(name) {
    return exports.rootLogger.child({
        name: loggerName + ":" + name
    });
}
exports["default"] = default_1;
