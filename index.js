const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// Veb server (Render-in işləməsi üçün)
const app = express();
app.get('/', (req, res) => res.send('Test Server Aktivdir'));
app.listen(10000, () => console.log('✅ Veb server isledi'));

// Discord Bot Testi
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`🚀 TEST UĞURLU! Bot onlayndır: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
