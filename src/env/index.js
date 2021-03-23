"use strict";
exports.__esModule = true;
var dotenv_1 = require("dotenv");
var path_1 = require("path");
function localFile(fileName) {
    return path_1["default"].resolve(process.cwd(), fileName);
}
if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = "production";
}
var env = process.env.NODE_ENV || "production";
dotenv_1["default"].config({
    path: localFile(".env." + env + ".local")
});
dotenv_1["default"].config({
    path: localFile(".env." + env)
});
dotenv_1["default"].config({
    path: localFile(".env")
});
