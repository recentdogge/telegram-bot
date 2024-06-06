import TelegramBot from 'node-telegram-bot-api';
import Anthropic from '@anthropic-ai/sdk';
import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPISM_API_KEY });

telegramBot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    telegramBot.sendMessage(chatId, 'Bot started.');
});

telegramBot.on('message', async (msg) => {
    try {
        const chatId = msg.chat.id;
        const messageText = msg.text;
    
        if (msg.from && msg.from.is_bot) return;
        if (messageText.startsWith('/')) return;
    
        telegramBot.sendChatAction(chatId, 'typing');
    
        const resp = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 1024,
            system: `Today is January 1, 2024.`,
            messages: [
                { "role": "user", "content": messageText }
            ]
        });
    
        telegramBot.sendMessage(chatId, resp.content[0].text);
    } catch (err) {
        console.error(err);
    }
});


console.log('Telegram Bot started.');

app.listen(process.env.PORT || 3000, () => {
    console.log(`Example app listening on port ${process.env.PORT || 3000}!`);
});