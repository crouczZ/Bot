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
// --- GİZLİ XƏTALARI VƏ DİSCORD-UN MESAJLARINI GÖRMƏK ÜÇÜN ---
client.on('debug', m => console.log('🔍 DİSCORD SİSTEMİ:', m));
process.on('unhandledRejection', err => console.error('❌ GİZLİ XƏTA:', err));

client.login(TOKEN);

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
// 🛠️ SLASH KOMANDALARIN SİYAHISI
// ---------------------------------------------------------
const commands = [
  // Moderasiya
  new SlashCommandBuilder().setName('çək').setDescription('İstifadəçini səs kanalına çəkir.').addUserOption(o => o.setName('istifadəçi').setDescription('Kim?').setRequired(true)),
  new SlashCommandBuilder().setName('mute').setDescription('İstifadəçini susdurur.').addUserOption(o => o.setName('istifadəçi').setDescription('Kim?').setRequired(true)).addIntegerOption(o => o.setName('müddət').setDescription('Dəqiqə?').setRequired(true)),
  new SlashCommandBuilder().setName('unmute').setDescription('Mute cəzasını qaldırır.').addUserOption(o => o.setName('istifadəçi').setDescription('Kim?').setRequired(true)),
  new SlashCommandBuilder().setName('nick').setDescription('Adı dəyişdirir.').addUserOption(o => o.setName('istifadəçi').setDescription('Kim?').setRequired(true)).addStringOption(o => o.setName('ad').setDescription('Yeni ad').setRequired(true)),
  new SlashCommandBuilder().setName('nick-reset').setDescription('Adı sıfırlayır.').addUserOption(o => o.setName('istifadəçi').setDescription('Kim?').setRequired(true)),
  new SlashCommandBuilder().setName('sil').setDescription('1-100 arası mesaj silir.').addIntegerOption(o => o.setName('say').setDescription('Say?').setRequired(true)),

  // Profil & Məlumat
  new SlashCommandBuilder().setName('avatar').setDescription('Avatarı göstərir.').addUserOption(o => o.setName('istifadəçi').setDescription('Kim?').setRequired(false)),
  new SlashCommandBuilder().setName('banner').setDescription('Banneri göstərir.').addUserOption(o => o.setName('istifadəçi').setDescription('Kim?').setRequired(false)),
  new SlashCommandBuilder().setName('istifadeci').setDescription('İstifadəçi məlumatı.').addUserOption(o => o.setName('istifadəçi').setDescription('Kim?').setRequired(false)),
  new SlashCommandBuilder().setName('sunucu').setDescription('Server məlumatları.'),
  new SlashCommandBuilder().setName('say').setDescription('Üzv statistikası.'),
  new SlashCommandBuilder().setName('rollar').setDescription('Server rolları.'),

  // Statistika
  new SlashCommandBuilder().setName('mesaj').setDescription('Yazı statistikası.').addUserOption(o => o.setName('istifadəçi').setDescription('Kim?').setRequired(false)),
  new SlashCommandBuilder().setName('ses').setDescription('Səs statistikası.').addUserOption(o => o.setName('istifadəçi').setDescription('Kim?').setRequired(false)),
  
  // Əyləncə & Partner
  new SlashCommandBuilder().setName('afk').setDescription('AFK ol.').addStringOption(o => o.setName('səbəb').setDescription('Niyə?').setRequired(false)),
  new SlashCommandBuilder().setName('etiraf').setDescription('Gizli etiraf.').addStringOption(o => o.setName('mətn').setDescription('Etirafın?').setRequired(true)),
  new SlashCommandBuilder().setName('ship').setDescription('Sevgi uyğunluğu.').addUserOption(o => o.setName('istifadəçi').setDescription('Kimlə?').setRequired(true)),
  new SlashCommandBuilder().setName('partner').setDescription('Partnerlik təklifi.').addUserOption(o => o.setName('istifadəçi').setDescription('Kimə?').setRequired(true)),
  new SlashCommandBuilder().setName('partner-ayril').setDescription('Partnerliyi bitir.'),
  new SlashCommandBuilder().setName('partner-profil').setDescription('Partner profili.'),
  new SlashCommandBuilder().setName('yardim').setDescription('Komandalar menyusu.')
];

// 💎 MÖHTƏŞƏM LOG FUNKSİYASI
async function advancedLog(guild, channelId, { action, user, color, fields, description, thumbnail }) {
  if (!channelId || channelId === "ID") return;
  const ch = await guild.channels.fetch(channelId).catch(() => null);
  if (!ch) return;

  const embed = new EmbedBuilder().setColor(color || COLORS.DEFAULT).setTimestamp();
  if (user) { embed.setAuthor({ name: `${action} | ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) }); embed.setFooter({ text: `ID: ${user.id}` }); } 
  else { embed.setTitle(action); }

  if (description) embed.setDescription(description);
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (fields) embed.addFields(fields);

  ch.send({ embeds: [embed] }).catch(() => null);
}

// ---------------------------------------------------------
// 🚀 BOT İŞƏ DÜŞƏNDƏ
// ---------------------------------------------------------
client.once('ready', async () => {
  console.log(`🔥 ULTRA BOT ONLAYNDIR: ${client.user.tag}`);
  try { await client.application.commands.set(commands); console.log("✅ Bütün komandalar yükləndi!"); } catch (e) {}
});

// ---------------------------------------------------------
// 💬 MESAJLAR & AFK & STATİSTİKA
// ---------------------------------------------------------
client.on("messageCreate", msg => {
  if (!msg.guild || msg.author?.bot) return;

  // 1. AFK Sistemi
  if (afkData.has(msg.author.id)) { afkData.delete(msg.author.id); msg.reply(`👋 Xoş gəldin! AFK rejimindən çıxdın.`).then(m => setTimeout(() => m.delete(), 5000)); }
  msg.mentions.users.forEach(u => { if (afkData.has(u.id)) msg.reply(`💤 **${u.username}** hazırda AFK-dır. Səbəb: \`${afkData.get(u.id)}\``); });

  // 2. Mətn Statistikası
  if (!userStats.has(msg.author.id)) userStats.set(msg.author.id, { messages: 0, voice: 0 });
  userStats.get(msg.author.id).messages += 1;

  // 3. Loglar (Söyüş, Komanda, Etiket)
  if (msg.mentions.users.size > 0) advancedLog(msg.guild, LOGS.MENTION, { action: "📣 Etiketləmə", user: msg.author, color: COLORS.INFO, fields: [{ name: "Kanal", value: `${msg.channel}` }] });
  if (msg.content.startsWith("!")) advancedLog(msg.guild, LOGS.COMMAND, { action: "⚙️ Komanda", user: msg.author, color: COLORS.DEFAULT, fields: [{ name: "Mətn", value: `\`${msg.content}\`` }] });
  
  const badWords = ["kufur1", "kufur2"];
  if (badWords.some(w => msg.content.toLowerCase().includes(w))) advancedLog(msg.guild, LOGS.PROFANITY, { action: "🚫 Qadağan Söz", user: msg.author, color: COLORS.DANGER, fields: [{ name: "Kanal", value: `${msg.channel}` }, { name: "Mesaj", value: `\`${msg.content}\`` }] });
});

// ---------------------------------------------------------
// 🗑️ MESAJ SİLİNMƏ / REDAKTƏ LOGU
// ---------------------------------------------------------
client.on("messageDelete", async msg => {
  if (!msg.guild || msg.author?.bot) return;
  const contentStr = msg.content ? `\`\`\`\n${msg.content}\n\`\`\`` : "*Şəkil/Embed ola bilər*";
  advancedLog(msg.guild, LOGS.MESSAGE_DELETE, { action: "🗑️ Mesaj Silindi", user: msg.author, color: COLORS.DANGER, fields: [{ name: "👤 Yazan", value: `${msg.author}`, inline: true }, { name: "💬 Kanal", value: `${msg.channel}`, inline: true }, { name: "📝 İçərik", value: contentStr }] });
});

client.on("messageUpdate", (o, n) => {
  if (!n.guild || n.author?.bot || o.content === n.content) return;
  advancedLog(n.guild, LOGS.MESSAGE_EDIT, { action: "✏️ Mesaj Redaktə", user: n.author, color: COLORS.UPDATE, fields: [{ name: "Kanal", value: `${n.channel}` }, { name: "🔴 Köhnə", value: `\`${o.content || ' '}\`` }, { name: "🟢 Yeni", value: `\`${n.content || ' '}\`` }] });
});

// ---------------------------------------------------------
// 🔊 SƏS STATİSTİKASI & LOGLAR
// ---------------------------------------------------------
client.on("voiceStateUpdate", (o, n) => {
  const u = n.member.user;
  if (!o.channel && n.channel) {
    if (!userStats.has(u.id)) userStats.set(u.id, { messages: 0, voice: 0 });
    userStats.get(u.id).voice += 1;
    advancedLog(n.guild, LOGS.VOICE, { action: "🔊 Səsə Qoşuldu", user: u, color: COLORS.SUCCESS, description: `Kanal: **${n.channel.name}**` });
  } else if (o.channel && !n.channel) {
    advancedLog(n.guild, LOGS.VOICE, { action: "🔇 Səsdən Çıxdı", user: u, color: COLORS.DANGER, description: `Kanal: **${o.channel.name}**` });
  } else if (o.channel && n.channel && o.channel.id !== n.channel.id) {
    advancedLog(n.guild, LOGS.VOICE, { action: "🔄 Kanal Dəyişdi", user: u, color: COLORS.INFO, description: `**${o.channel.name}** ➜ **${n.channel.name}**` });
  }
});

// ---------------------------------------------------------
// 👤 QATILMA / ÇIXMA / ROL / LƏQƏB LOGLARI
// ---------------------------------------------------------
client.on("guildMemberAdd", m => advancedLog(m.guild, LOGS.JOIN, { action: "✅ Qatıldı", user: m.user, color: COLORS.SUCCESS, description: `Üzv Sayı: **${m.guild.memberCount}**` }));
client.on("guildMemberRemove", m => advancedLog(m.guild, LOGS.LEAVE, { action: "❌ Çıxdı", user: m.user, color: COLORS.DANGER, description: `Üzv Sayı: **${m.guild.memberCount}**` }));

client.on("guildMemberUpdate", async (o, n) => {
  if (o.nickname !== n.nickname) advancedLog(n.guild, LOGS.NICKNAME, { action: "📝 Ləqəb Dəyişdi", user: n.user, color: COLORS.UPDATE, fields: [{ name: "Köhnə", value: `\`${o.nickname || o.user.username}\``, inline:true }, { name: "Yeni", value: `\`${n.nickname || n.user.username}\``, inline:true }] });
  
  if (!o.isCommunicationDisabled() && n.isCommunicationDisabled()) {
    const end = Math.floor(n.communicationDisabledUntilTimestamp / 1000);
    advancedLog(n.guild, LOGS.TIMEOUT, { action: "⏳ Timeout Verildi", user: n.user, color: COLORS.WARNING, fields: [{ name: "Bitiş", value: `<t:${end}:R>` }] });
  }

  const added = n.roles.cache.filter(r => !o.roles.cache.has(r.id));
  const removed = o.roles.cache.filter(r => !n.roles.cache.has(r.id));
  added.forEach(r => advancedLog(n.guild, LOGS.ROLE_GIVE, { action: "➕ Rol Verildi", user: n.user, color: COLORS.SUCCESS, fields: [{ name: "Rol", value: `${r}` }] }));
  removed.forEach(r => advancedLog(n.guild, LOGS.ROLE_GIVE, { action: "➖ Rol Alındı", user: n.user, color: COLORS.DANGER, fields: [{ name: "Rol", value: `${r}` }] }));
});

client.on("guildBanAdd", ban => advancedLog(ban.guild, LOGS.BAN, { action: "🔨 Banlandı", user: ban.user, color: COLORS.DANGER }));

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

client.login(TOKEN);
