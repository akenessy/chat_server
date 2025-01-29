"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var username = "admin";
var password = encodeURIComponent("DFNX47Dmm"); // Кодируем спецсимволы
var host = "biequapeyfun.beget.app";
var dbname = "chat";
var uri = "mongodb://" + username + ":" + password + "@" + host + "/" + dbname;
mongoose_1.default.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
}, function (err) {
    if (err) {
        throw Error(err);
    }
});
