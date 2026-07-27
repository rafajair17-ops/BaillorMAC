import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';

const required = ['DISCORD_TOKEN', 'DISCORD_CHANNEL_ID'];
for (const key of required) if (!process.env[key]) throw new Error(`Defina ${key} no arquivo .env`);

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
const attempts = new Map();

function cors(req, res, next) {
  const origin = req.headers.origin;
  if (allowedOrigin === '*' || origin === allowedOrigin) res.setHeader('Access-Control-Allow-Origin', allowedOrigin === '*' ? '*' : origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}
function rateLimit(req, res, next) {
  const ip = req.ip, now = Date.now(), list = (attempts.get(ip) || []).filter(t => now - t < 60_000);
  if (list.length >= 10) return res.status(429).json({ error: 'Muitas solicitações. Tente novamente em um minuto.' });
  list.push(now); attempts.set(ip, list); next();
}

app.use(cors);
app.get('/health', (_, res) => res.json({ ok: client.isReady() }));
app.post('/api/tickets', rateLimit, upload.single('ticket'), async (req, res) => {
  try {
    if (!req.file || !req.body.data) return res.status(400).json({ error: 'Ticket ausente.' });
    const data = JSON.parse(req.body.data);
    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
    if (!channel?.isTextBased()) return res.status(500).json({ error: 'Canal do Discord inválido.' });
    const attachment = new AttachmentBuilder(req.file.buffer, { name: req.file.originalname || 'ticket-bennys.jpg' });
    const message = await channel.send({
      content: `🔧 **Novo orçamento — Mecânica Bennys**\nMecânico: \`${data.mechanicId}\` • Cliente: \`${data.clientId}\`\nTotal: **${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(data.total)}**`,
      files: [attachment]
    });
    res.status(201).json({ ok: true, imageUrl: message.attachments.first()?.url || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Não foi possível publicar o ticket.' });
  }
});

await client.login(process.env.DISCORD_TOKEN);
app.listen(process.env.PORT || 3000, () => console.log('Bot Bennys online.'));
