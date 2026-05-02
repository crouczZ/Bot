const express = require('express');
const app = express();

// 🌐 RENDER ÜÇÜN 7/24 CANLI TUTMA SERVERİ
app.get('/', (req, res) => res.send('Bot 7/24 Aktivdir və Problemsiz İşləyir!'));
app.listen(process.env.PORT || 3000, () => console.log('✅ Veb server işə düşdü!'));

const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  EmbedBuilder, 
  AuditLogEvent, 
  SlashCommandBuilder, 
  PermissionFlagsBits 
} = require('discord.js');

// 🔑 TOKEN BURADA GİZLƏDİLİR (Render "Environment Variables" bölməsindən oxuyacaq)

const TOKEN = process.env.TOKEN;

// 📂 LOG KANALLARININ ID-LƏRİ
const LOGS = {
  BAN: "ID", TIMEOUT: "ID", JOIN: "ID", LEAVE: "ID", NICKNAME: "ID",
  INVITE: "ID", MESSAGE_DELETE: "ID", ATTACHMENT: "ID", MESSAGE_EDIT: "ID",
  STICKER: "ID", EMBED: "ID", MENTION: "ID", COMMAND: "ID", CHANNEL: "ID",
  CHANNEL_PERM: "ID", ROLE: "ID", ROLE_PERM: "ID", ROLE_GIVE: "ID", EMOJI: "ID",
  VOICE: "ID", SERVER: "ID", WARNING: "ID", PROFANITY: "ID"
};

const COLORS = {
  SUCCESS: "#2ecc71", DANGER: "#e74c3c", WARNING: "#f1c40f", 
  INFO: "#3498db", UPDATE: "#e67e22", DEFAULT: "#2b2d31"
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildModeration
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User]
});

// 💾 MÜVƏQQƏTİ YADDAŞ BAZALARI (AFK, Partner, Statistika üçün)
const afkData = new Map();
const partnerData = new Map();
const userStats = new Map();

// ---------------------------------------------------------
// ⚡ SLASH KOMANDALARININ İCRASI
// ---------------------------------------------------------
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options, member, guild, user } = interaction;
  const targetUser = options.getUser('istifadəçi') || user;
  const targetMember = options.getMember('istifadəçi') || member;
  const embed = new EmbedBuilder().setColor('#2b2d31');

  try {
    // 🛡️ Moderasiya
    if (['mute', 'unmute', 'nick', 'nick-reset', 'çək', 'sil'].includes(commandName)) {
      if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: '❌ Yetkin yoxdur!', ephemeral: true });
      if (commandName === 'sil') {
        const amount = options.getInteger('say');
        if (amount < 1 || amount > 100) return interaction.reply({ content: '1-100 arası olmalıdır.', ephemeral: true });
        await interaction.channel.bulkDelete(amount, true);
        return interaction.reply({ content: `✅ ${amount} mesaj silindi.`, ephemeral: true });
      } else if (commandName === 'nick') {
        await targetMember.setNickname(options.getString('ad')); return interaction.reply({ content: `✅ Ləqəb dəyişdi.` });
      } else if (commandName === 'nick-reset') {
        await targetMember.setNickname(null); return interaction.reply({ content: `✅ Ləqəb sıfırlandı.` });
      } else if (commandName === 'mute') {
        await targetMember.timeout(options.getInteger('müddət') * 60000); return interaction.reply({ content: `✅ Susduruldu.` });
      } else if (commandName === 'unmute') {
        await targetMember.timeout(null); return interaction.reply({ content: `✅ Mute qaldırıldı.` });
      } else if (commandName === 'çək') {
        if (!targetMember.voice.channel || !member.voice.channel) return interaction.reply({ content: 'Səs kanalında olmalısınız.', ephemeral: true });
        await targetMember.voice.setChannel(member.voice.channel); return interaction.reply({ content: `✅ Kanalına çəkildi.` });
      }
    }

    // 👤 Profil & Statistika
    if (commandName === 'avatar') return interaction.reply({ embeds: [embed.setTitle("Avatar").setImage(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))] });
    if (commandName === 'sunucu') return interaction.reply({ embeds: [embed.setTitle(`${guild.name}`).addFields({ name: 'Sahibi', value: `<@${guild.ownerId}>` }, { name: 'Üzvlər', value: `${guild.memberCount}` })] });
    if (commandName === 'say') return interaction.reply({ embeds: [embed.setDescription(`👥 Toplam: **${guild.memberCount}**\n🟢 Onlayn: **${guild.members.cache.filter(m => m.presence?.status === 'online').size}**`)] });
    if (commandName === 'mesaj') return interaction.reply({ embeds: [embed.setTitle('💬 Mesaj').setDescription(`**${(userStats.get(targetUser.id) || {messages: 0}).messages}** mesaj.`)] });
    if (commandName === 'ses') return interaction.reply({ embeds: [embed.setTitle('🎙️ Səs').setDescription(`**${(userStats.get(targetUser.id) || {voice: 0}).voice}** dəfə qoşulub.`)] });
    
    // 🎉 Əyləncə & Partner
    if (commandName === 'afk') { afkData.set(user.id, options.getString('səbəb') || 'Səbəb yoxdur'); return interaction.reply({ content: `✅ AFK oldun.` }); }
    if (commandName === 'etiraf') { await interaction.channel.send({ embeds: [embed.setTitle('🤫 Etiraf').setDescription(`"${options.getString('mətn')}"`).setColor('Purple')] }); return interaction.reply({ content: '✅ Göndərildi.', ephemeral: true }); }
    if (commandName === 'ship') { const percent = Math.floor(Math.random() * 101); let bar = '🟥'.repeat(Math.floor(percent/10)) + '⬜'.repeat(10-Math.floor(percent/10)); return interaction.reply({ embeds: [embed.setTitle('💘 Uyğunluq').setDescription(`${user} x ${targetUser}\n\n**%${percent}** [${bar}]`).setColor(percent > 50 ? 'Pink' : 'DarkButNotBlack')] }); }
    if (commandName === 'partner') { if (user.id === targetUser.id) return interaction.reply('Özünlə olmaz.'); partnerData.set(user.id, targetUser.id); partnerData.set(targetUser.id, user.id); return interaction.reply(`🎉 Artıq partnersiniz: ${targetUser}`); }
    if (commandName === 'partner-profil') { if (!partnerData.has(user.id)) return interaction.reply({ content: 'Partnerin yoxdur.', ephemeral: true }); return interaction.reply({ embeds: [embed.setTitle('💞 Partner').setDescription(`<@${partnerData.get(user.id)}>`)] }); }
    if (commandName === 'yardim') return interaction.reply({ embeds: [embed.setTitle('📚 Komandalar').setDescription('`/yardim`, `/çək`, `/mute`, `/sil`, `/afk`, `/ship`, `/partner`, `/mesaj`, `/ses` ...')] });

  } catch (err) { console.error(err); interaction.reply({ content: 'Xəta oldu!', ephemeral: true }).catch(()=>{}); }
});

// --- GİZLİ XƏTALARI GÖRMƏK ÜÇÜN KODU BURA QOYURUQ ---
client.on('debug', m => console.log('🔍 DİSCORD SİSTEMİ:', m));
process.on('unhandledRejection', err => console.error('❌ GİZLİ XƏTA:', err));

client.login(TOKEN);
