require("dotenv").config()

import dotenv from "dotenv"
dotenv.config()

import TelegramBot from "node-telegram-bot-api"
import cron from "node-cron"
import * as actions from "./actions"

const TOKEN = process.env.TOKEN
if (!TOKEN) throw new Error("Bot token is not provided")
const bot = new TelegramBot(TOKEN, { polling: true })

bot.onText(/\/start/, (msg) => actions.startCommand(bot, msg.chat.id))
bot.onText(/\/remove/, (msg) => actions.removeCommand(bot, msg.chat.id))
bot.onText(/\/add (.+)/, (msg, match) => actions.addCommand(bot, msg.chat.id, match[1]))
bot.onText(/\/list/, (msg) => actions.listCommand(bot, msg.chat.id))
bot.onText(/\/stats/, (msg) => actions.statsCommand(bot, msg.chat.id))
bot.onText(/\/debuglist/, (msg) => actions.debugListCommand(bot, msg.chat.id))
bot.on("callback_query", (callbackQuery) => actions.callbackQuery(bot, callbackQuery))

cron.schedule("* * * * *", () => {
  actions.checkAllOrders(bot)
})

console.log("Toribot started!")
