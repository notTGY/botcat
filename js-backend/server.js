import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import pg from 'pg';
import cors from 'cors';
dotenv.config();
const port = process.env.PORT || 3000;
const domain = process.env.DOMAIN || `http://localhost:${port}`

const app = express();

app.use(cors('*'));
app.use(express.static('public'));

const getDB = async () => {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  return client;
}

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 15);
}

const commands = {
  '/start': async (msg) => {
    const chatId = msg.chat.id;
    const endpointId = generateRandomString();

    const client = await getDB()

    await client.query(`DELETE FROM endpoints WHERE chat_id = $1`, [chatId]);
    await client.query(`INSERT INTO endpoints (id, chat_id) VALUES ($1, $2)`, [endpointId, chatId]);

    const url = `${domain}/${endpointId}`
    const dashboardUrl = `${domain}/?dashboardId=${endpointId}`
    bot.sendMessage(
      chatId,
      `Welcome to the bot, use ${url} to send notification, use ${dashboardUrl} to see dashboard`,
      {
        parse_mode: 'Markdown',
        buttons: [
          {
            text: 'Send notification',
            url: url,
          },
          {
            text: 'See dashboard',
            url: dashboardUrl,
          }
        ]
      }
    );
    
  }
}

const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });
bot.on('message', (msg) => {
  if (!msg) return
  commands[msg.text](msg)
})

app.get('/v/:id', async (req, res) => {
  const endpointId = req.params.id
  const client = await getDB()
  const rows = await client.query(`SELECT chat_id FROM endpoints WHERE id = $1`, [endpointId])
  if (rows.rows.length === 0) {
    res.status(404).json({ message: 'not found' })
    return
  }
  const chatId = rows.rows[0].chat_id
  const rows2 = await client.query(`SELECT * FROM notifications WHERE chat_id = $1`, [chatId])
  const data = rows2.rows

  res.json(data)
})

app.delete('/v/:id', async (req, res) => {
  const endpointId = req.params.id
  const client = await getDB()
  const rows = await client.query(`SELECT chat_id FROM endpoints WHERE id = $1`, [endpointId])
  if (rows.rows.length === 0) {
    res.status(404).json({ message: 'not found' })
    return
  }
  const chatId = rows.rows[0].chat_id
  await client.query(`DELETE FROM notifications WHERE chat_id = $1`, [chatId])
  res.status(204).send('ok')
})

app.get('/:id', async (req, res, next) => {
  const endpointId = req.params.id
  if (!endpointId) {
    express.static('public')(req, res, next)
    return
  }
  const message = req.query.message
  const ip = req.ip

  const client = await getDB()
  const rows = await client.query(`SELECT chat_id FROM endpoints WHERE id = $1`, [endpointId])
  if (!rows.rows.length) {
    res.status(404).json({ message: 'not found' })
    return
  }
  const chatId = rows.rows[0].chat_id

  // log this notification into database
  await client.query(
    `INSERT INTO notifications (chat_id, message, ip) VALUES ($1, $2, $3)`,
    [chatId, message, ip],
  )

  bot.sendMessage(
    chatId,
    `${message || 'ping'} ${ip}`,
  )
  res.send('ok')
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})