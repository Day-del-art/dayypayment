export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).send("Method Not Allowed")

  const data = req.body

  /*
    data contoh:
    {
      status: "PAID",
      amount: 10000,
      description: "Deposit Telegram 123456"
    }
  */

  if (data.status === "PAID") {
    console.log("PAYMENT PAID:", data)

    // nanti di sini:
    // - nambah saldo
    // - kirim notif bot
  }

  res.status(200).send("OK")
}