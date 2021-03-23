"use strict";
exports.__esModule = true;
exports.isDev = exports.isProd = void 0;
function isProd() {
    return process.env.NODE_ENV === "production";
}
exports.isProd = isProd;
function isDev() {
    return process.env.NODE_ENV === "development";
}
exports.isDev = isDev;
