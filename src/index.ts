import dotenv from "dotenv";
// const dotenv = require("dotenv");
dotenv.config();

import * as app from "./app.js";
import * as bot from "./bot.js";

bot.init();
bot.sessionInit();

process.on("uncaughtException", async () => {
  await bot.bot.stopPolling();
  bot.init();
});
process.on("SIGSEGV", async () => {
  await bot.bot.stopPolling();
  bot.init();
});

app.run();
