import TelegramBot, { CallbackQuery } from "node-telegram-bot-api"
import { getNewToriItems, getToriItemName } from "./tori"
import { Order } from "./db"

export const startCommand = async (bot: TelegramBot, chatId: number) => {
  const message = `
Hello! I am Toripoliisi. I will keep an eye on your Tori searches and notify you for new items. Tori also provides \
such feature, called Hakuvahti, which can be used in two ways: emails and push-notifications. However, there are few \
issues with the hakuvahti: the email is sent only daily, and the mobile app is super annoying, sending fake \
notifications, and overall being buggy and unusable at times. In addition, even the push notifications seem to arrive \
later to some users, so using external service such as this Toripoliisi seems to give some advantage.

Source code can be found from [Github](https://github.com/Migho/toripoliisi-js). Some of \
the apartments can cause issues because Tori keeps updating the listing time (wtf tori?), this is a known issue and \
I currently have no time or plans to fix it. If you are a developer, pull requests are welcome.

Commands:
/start - get this message.
/add - order me to keep track of a new search. Paste a tori search URL in the same message after the command.
/list - list all your personal searches.
/remove - remove an order.
/stats - get common user statistics
`

  await bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  })
}

export const removeCommand = async (bot: TelegramBot, chatId: number) => {
  const orders = await Order.findAll({ where: { chatId } })

  if (orders.length === 0) {
    await bot.sendMessage(chatId, "You have no active searches.")
  } else {
    const listOfRemovableOrders = orders.map((o) => {
      return [{ text: getToriItemName(o.url), callback_data: o.id.toString() }]
    })

    await bot.sendMessage(chatId, "Which one would you like to remove?", {
      reply_markup: {
        inline_keyboard: listOfRemovableOrders,
      },
    })
  }
}

export const addCommand = async (bot: TelegramBot, chatId: number, url: string) => {
  if (!url) {
    await bot.sendMessage(chatId, "Please provide the URL after the command.")
  } else {
    try {
      if (url.includes("m.tori.fi/")) {
        url = url.replace("m.tori.fi/", "tori.fi/")
      }
      const newestItem = await getNewToriItems(url)

      if (newestItem.length > 0) {
        await Order.create({
          chatId: chatId,
          url: url,
          newestToriItemId: newestItem[0].id,
          newestToriItemTimestamp: newestItem[0].timestamp,
        })
      } else {
        await Order.create({
          chatId: chatId,
          url: url,
        })
      }

      await bot.sendMessage(chatId, "URL added!")
    } catch (e) {
      console.log(e)
      await bot.sendMessage(chatId, "Unknown error occurred. Please check the URL.")
    }
  }
}

export const listCommand = async (bot: TelegramBot, chatId: number) => {
  const orders = await Order.findAll({ where: { chatId } })

  if (orders.length === 0) {
    await bot.sendMessage(chatId, "You have no active searches.")
  } else {
    const listOfItems = orders.map((o) => `[${getToriItemName(o.url)}](${o.url})`).join("\n")

    await bot.sendMessage(chatId, `You have ${orders.length} active search(es):\n\n${listOfItems}`, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    })
  }
}

export const statsCommand = async (bot: TelegramBot, chatId: number) => {
  const ordersTotal = await Order.count()
  const uniqueUsers = await Order.findAll({
    attributes: [[Order.sequelize.fn("DISTINCT", Order.sequelize.col("chatId")), "chatId"]],
  })

  await bot.sendMessage(chatId, `There are ${ordersTotal} active searches and ${uniqueUsers.length} unique users.`)
}

export const debugListCommand = async (bot: TelegramBot, chatId: number) => {
  const orders = await Order.findAll({ where: { chatId } })
  await bot.sendMessage(chatId, JSON.stringify(orders, null, 2), {
    disable_web_page_preview: true,
  })
}

export const unknownCommand = async (bot: TelegramBot, chatId: number) => {
  await bot.sendMessage(chatId, "I don't know that command.")
}

export const callbackQuery = async (bot: TelegramBot, callbackQuery: CallbackQuery) => {
  const callbackData = callbackQuery.data
  const messageId = callbackQuery.message.message_id
  const chatId = callbackQuery.message.chat.id

  try {
    await Order.destroy({ where: { id: callbackData } })
  } catch (error) {
    await bot.sendMessage(chatId, "There was a problem. Nothing was removed, please try again.")
    return
  }

  await bot.editMessageReplyMarkup(null, { chat_id: chatId, message_id: messageId })
  await bot.sendMessage(chatId, "Removed!")
}

export const checkAllOrders = async (bot: TelegramBot) => {
  const allOrders = await Order.findAll()

  for (const order of allOrders) {
    try {
      const newItems = await getNewToriItems(order.url, order.newestToriItemTimestamp)

      if (newItems.length > 0) {
        await order.update({
          newestToriItemId: newItems[0].id,
          newestToriItemTimestamp: newItems[0].timestamp,
        })
      }

      for (const item of newItems) {
        const subject = item.subject.replace("[", "(").replace("]", ")")
        await bot.sendMessage(
          order.chatId,
          `New item: [${subject}](${item.url})${item.price ? ` - ${item.price}` : ``}`,
          {
            parse_mode: "Markdown",
          }
        )
      }
    } catch (error) {
      console.log(error)
    }
  }
}
