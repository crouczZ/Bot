const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Debug Modu Aktivdir'));
app.listen(10000, () => console.log('✅ Veb server isledi'));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// --- DEBUK (YOX LAMA) HİSSƏSİ ---
const token = process.env.TOKEN;

if (!token) {
    console.log("❌ SƏHV: Render-də 'TOKEN' tapılmadı! Environment Variables hissəsini yoxla.");
} else {
    console.log(`🔍 MƏLUMAT: Token tapıldı. Uzunluğu: ${token.length}`);
    console.log(`🔍 MƏLUMAT: Tokenin ilk 4 hərfi: ${token.substring(0, 4)}`);
}

client.once('ready', () => {
    console.log(`🚀 BOT ONLAYNDIR: ${client.user.tag}`);
});

client.login(token).catch(err => {
    console.log("❌ DISCORD GİRİŞ XƏTASI:", err.message);
});
