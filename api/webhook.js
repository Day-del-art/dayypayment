import fs from "fs"
import TelegramBot from "node-telegram-bot-api"

const bot = new TelegramBot(process.env.BOT_TOKEN)

const OWNER_ID = 7840998703
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

  if (data.status !== "PAID")
    return res.status(200).send("IGNORED")

  const match = data.description?.match(/Telegram\s+(\d+)/i)
  if (!match) return res.status(400).send("NO TELEGRAM ID")

  const chatId = match[1]
  const amount = Number(data.amount)
  const orderId = data.order_id
  const buyerUrl = data.payment_url || "-"

  const db = load(DB_FILE)
  const tx = load(TX_FILE)

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
