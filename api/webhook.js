import fs from "fs"
import TelegramBot from "node-telegram-bot-api"

// 🔥 LANGSUNG DI SINI, GA PAKE ENV
const BOT_TOKEN = "8233360544:AAGutP4mXOdp1l0Z1hYBr-F4HRMmA_qL9LI"
const OWNER_ID = 7840998703

const bot = new TelegramBot(BOT_TOKEN)

const DB_FILE = "./database.json"
const TX_FILE = "./transactions.json"

function load(file) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}))
  return JSON.parse(fs.readFileSync(file))
}

function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).send("Method Not Allowed")

  const data = req.body

  // cuma proses PAID
  if (data.status !== "PAID")
    return res.status(200).send("IGNORED")

  /*
    contoh payload:
    {
      status: "PAID",
      amount: 10000,
      order_id: "TRX-xxx-7840998703",
      description: "Deposit Telegram 7840998703",
      payment_url: "https://app.pakasir.com/pay/dayy/10000?...”
    }
  */

  const match = data.description?.match(/Telegram\s+(\d+)/i)
  if (!match) return res.status(400).send("NO TELEGRAM ID")

  const chatId = match[1]
  const amount = Number(data.amount)
  const orderId = data.order_id
  const buyerUrl = data.payment_url || "-"

  const db = load(DB_FILE)
  const tx = load(TX_FILE)

  // ❌ anti double paid
  if (tx[orderId]) return res.status(200).send("DUPLICATE")

  tx[orderId] = {
    chatId,
    amount,
    buyerUrl,
    time: Date.now()
  }
  save(TX_FILE, tx)

  if (!db[chatId]) db[chatId] = { id: chatId, balance: 0 }

  db[chatId].balance += amount
  save(DB_FILE, db)

  // notif user
  await bot.sendMessage(
    chatId,
    `✅ <b>PEMBAYARAN MASUK</b>\n\n💰 +Rp${amount.toLocaleString("id-ID")}`,
    { parse_mode: "HTML" }
  )

  // notif owner
  await bot.sendMessage(
    OWNER_ID,
    `💸 <b>BUYER MASUK</b>\n\n` +
    `👤 <code>${chatId}</code>\n` +
    `💰 Rp${amount.toLocaleString("id-ID")}\n` +
    `🔗 ${buyerUrl}`,
    { parse_mode: "HTML" }
  )

  return res.status(200).send("OK")
}  const tx = load(TX_FILE)

  // 🔒 ANTI DOUBLE PAID
  if (tx[orderId]) return res.status(200).send("DUPLICATE")

  tx[orderId] = {
    chatId,
    amount,
    buyerUrl,
    time: Date.now()
  }
  save(TX_FILE, tx)

  if (!db[chatId]) db[chatId] = { id: chatId, balance: 0 }

  db[chatId].balance += amount
  save(DB_FILE, db)

  // USER
  await bot.sendMessage(
    chatId,
    `✅ <b>PEMBAYARAN BERHASIL</b>\n\n` +
    `💰 Saldo +<b>Rp${amount.toLocaleString("id-ID")}</b>`,
    { parse_mode: "HTML" }
  )

  // OWNER
  await bot.sendMessage(
    OWNER_ID,
    `💸 <b>BUYER MASUK</b>\n\n` +
    `👤 User: <code>${chatId}</code>\n` +
    `💰 Nominal: <b>Rp${amount.toLocaleString("id-ID")}</b>\n` +
    `🔗 Buyer URL:\n${buyerUrl}`,
    { parse_mode: "HTML" }
  )

  return res.status(200).send("OK")
    }
