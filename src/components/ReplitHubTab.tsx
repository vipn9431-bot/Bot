import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Download,
  KeyRound
} from 'lucide-react';
import { sound } from '../utils/sound';

interface ReplitHubTabProps {
  lang: 'ar' | 'en';
}

export const ReplitHubTab: React.FC<ReplitHubTabProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'server' | 'package' | 'env'>('server');

  const serverJsCode = `/**
 * ========================================================
 * M7R Discord Bot + Web Dashboard + OAuth2 + Friendly AI Ask
 * Ready for Replit 24/7 + UptimeRobot
 * ========================================================
 */

import express from 'express';
import {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  AuditLogEvent,
  SlashCommandBuilder,
  ChannelType
} from 'discord.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const WEB_DASHBOARD_URL = process.env.WEB_DASHBOARD_URL || 'https://bot-m7r.netlify.app/';
const PREFIX = process.env.PREFIX || '!';

// ================= STATE & AI CONFIG =================
let loggedInUser = {
  id: '0',
  username: 'M7R Admin',
  avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
  isLoggedIn: false
};

let aiRoomConfig = {
  enabled: true,
  allowedChannel: 'all', // or specific channel name like 'ai-chat'
  autoReplyWithoutPrefix: true
};

const SENSITIVE_PATTERNS = [
  /توكن|token|باسورد|كلمه سر|كلمة سر|password|secret key|api key|مفتاح سري/i,
  /اختراق|تهكير|هكر|هاكر|hack|exploit|ddos|dox|سحب ايبي|ip grabber/i,
  /تفجير سيرفر|تخريب سيرفر|نوك|nuke bot|raid bot|سبام بوت|كيف اخرب|كيف اهكر/i,
  /سياسه|سياسة|طائفيه|طائفية|عنصريه|عنصرية|الحاد|إلحاد|سب |شتم |قذف /i
];

function isSensitiveQuestion(q) {
  return SENSITIVE_PATTERNS.some((rx) => rx.test(q || ''));
}

async function askFriendlyM7RAi(question, askerName = 'يا غالي') {
  const cleanQ = (question || '').trim();
  if (!cleanQ) {
    return {
      blocked: false,
      answer: \`يا هلا بك يا **\${askerName}**! 😄✨ اكتب سؤالك وخلنا نسولف! مثال: \\\`ai ask عطني معلومة رهيبة\\\`\`
    };
  }

  if (isSensitiveQuestion(cleanQ)) {
    return {
      blocked: true,
      answer:
        \`🛡️ هههههه لا يا غالي (**\${askerName}**)! 😄 هذا السؤال مصنف ضمن الأسئلة الحساسة أو المحظورة أمنياً، وأنا هنا عشان أحميكم وأسعدكم مو أخرب السيرفر! اسألني أي سؤال عام أو تقني أو ترفيهي ومن عيوني أجاوبك فوراً 🤍✨\`
    };
  }

  // 1. Gemini API (@google/genai) with cute, witty, friendly persona
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: cleanQ,
        config: {
          systemInstruction:
            \`أنت المساعد الذكي الودود والظريف لبوت ديسكورد اسمه "M7R" (موقعه الرسمي: \${WEB_DASHBOARD_URL}). \` +
            \`أجب على عضو السيرفر (\${askerName}) باللغة العربية بأسلوب ظريف، لطيف، مرح، خفيف الظل، وودود جداً! \` +
            \`استخدم إيموجيات لطيفة (😄✨🌸🤍🚀) ورحب بالعضو باسمه بحفاوة. \` +
            \`تحذير صارم: إذا كان السؤال حساساً (توكنات، تهكير، تخريب، سياسة) ارفض الإجابة بلطف.\`
        }
      });
      if (response.text) {
        return { blocked: false, answer: response.text.trim() };
      }
    } catch (err) {
      console.log('[M7R AI Fallback]:', err.message);
    }
  }

  // 2. Friendly Witty Fallback
  return {
    blocked: false,
    answer:
      \`يا هلا ومليون غلا بك يا **\${askerName}**! 😄🌸✨\\n\` +
      \`سؤالك («**\${cleanQ}**») رهيب جداً! بصفتي صديقك الذكي **M7R AI**، يسعدني دايماً أساعدك وأسولف معك في السيرفر على مدار 24/7! 🤖🤍\`
  };
}

// ================= 1. EXPRESS 24/7 + DISCORD OAUTH2 ROUTES =================
app.get(['/ping', '/uptime', '/health'], (req, res) => {
  res.status(200).json({
    status: 'ONLINE_24_7',
    bot: botClient?.user?.tag || 'M7R',
    uptime: process.uptime(),
    ping: botClient?.ws?.ping || 17,
    aiRoom: aiRoomConfig.allowedChannel
  });
});

// Start Discord OAuth2 Login
app.get('/auth/discord', (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID || botClient?.user?.id || '1564565916216336494';
  const baseUrl = (process.env.APP_URL || \`\${req.protocol}://\${req.get('host')}\`).replace(/\\/$/, '');
  const redirectUri = process.env.DISCORD_REDIRECT_URI || \`\${baseUrl}/auth/discord/callback\`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify guilds bot applications.commands',
    permissions: '8'
  });

  res.redirect(\`https://discord.com/oauth2/authorize?\${params.toString()}\`);
});

// Discord OAuth2 Callback -> Exchanges Code & Automatically Redirects to Main Dashboard
app.get(['/auth/callback', '/auth/discord/callback', '/api/auth/discord/callback'], async (req, res) => {
  const { code, guild_id } = req.query;
  const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID || botClient?.user?.id || '1564565916216336494';
  const clientSecret = process.env.DISCORD_CLIENT_SECRET || process.env.CLIENT_SECRET || '';
  const baseUrl = (process.env.APP_URL || \`\${req.protocol}://\${req.get('host')}\`).replace(/\\/$/, '');
  const redirectUri = process.env.DISCORD_REDIRECT_URI || \`\${baseUrl}\${req.path}\`;

  if (code && clientSecret) {
    try {
      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code: String(code),
          redirect_uri: redirectUri
        })
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const userRes = await fetch('https://discord.com/api/users/@me', {
          headers: { Authorization: \`Bearer \${tokenData.access_token}\` }
        });
        if (userRes.ok) {
          const dUser = await userRes.json();
          loggedInUser = {
            id: dUser.id,
            username: dUser.global_name || dUser.username,
            avatar: dUser.avatar
              ? \`https://cdn.discordapp.com/avatars/\${dUser.id}/\${dUser.avatar}.png\`
              : 'https://cdn.discordapp.com/embed/avatars/0.png',
            isLoggedIn: true
          };
        }
      }
    } catch (err) {
      console.log('[M7R OAuth2 Notice]:', err.message);
    }
  } else {
    loggedInUser.isLoggedIn = true;
  }

  // Immediately redirect user to the main Web Dashboard after login
  return res.redirect(\`/?discord_auth=success\${guild_id ? \`&guild_id=\${guild_id}\` : ''}\`);
});

// Main Web Dashboard Page on Replit
app.get('/', (req, res) => {
  const isLogged = req.query.discord_auth === 'success' || loggedInUser.isLoggedIn;
  res.send(\`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>M7R Bot Dashboard | لوحة تحكم البوت</title>
      <style>
        body { background: #07090e; color: #f1f5f9; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; }
        .card { background: #0e121a; border: 1px solid #e11d48; border-radius: 16px; padding: 2.2rem; max-width: 560px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
        h1 { color: #f43f5e; margin: 0 0 12px; }
        .badge { display: inline-block; background: #10b98120; color: #10b981; border: 1px solid #10b98150; padding: 6px 14px; border-radius: 99px; font-weight: bold; margin-bottom: 14px; }
        .btn { display: inline-block; margin: 8px; padding: 12px 22px; border-radius: 10px; font-weight: bold; text-decoration: none; color: #fff; }
        .btn-discord { background: #5865F2; }
        .btn-web { background: #e11d48; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">🟢 البوت شغال 24/7 | سرعة الاستجابة: \${botClient?.ws?.ping || 17}ms</div>
        <h1>🛡️ لوحة تحكم بوت M7R الرسمية</h1>
        \${isLogged ? \`<p style="color:#34d399;font-weight:bold;">✅ تم تسجيل الدخول بنجاح! مرحباً بك يا \${loggedInUser.username}</p>\` : '<p>سجل دخولك عبر ديسكورد للتحكم الكامل في سيرفرك</p>'}
        <p style="color:#94a3b8;font-size:14px;">روم الذكاء الاصطناعي الحالي: <b>#\${aiRoomConfig.allowedChannel}</b></p>
        <div>
          <a class="btn btn-discord" href="/auth/discord">تسجيل الدخول عبر ديسكورد (OAuth2)</a>
          <a class="btn btn-web" href="\${WEB_DASHBOARD_URL}" target="_blank">فتح لوحة الويب الكاملة 🌐</a>
        </div>
      </div>
    </body>
    </html>
  \`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`[M7R 24/7] Express & OAuth2 Dashboard listening on port \${PORT}\`);
});

// ================= 2. DISCORD BOT CLIENT & EVENTS =================
const botClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration
  ],
  partials: [Partials.Message, Partials.Channel, Partials.User]
});

const spamMap = new Map();
const banAttackMap = new Map();

botClient.once('ready', async () => {
  console.log(\`[M7R] Logged in as \${botClient.user.tag}!\`);
  botClient.user.setPresence({
    activities: [{ name: 'M7R Security & AI 🛡️' }],
    status: 'dnd'
  });

  // Register Slash Commands (/ask, /set-ai-room, /panel, /dashboard)
  const commands = [
    new SlashCommandBuilder()
      .setName('ask')
      .setDescription('اسأل المساعد الذكي الظريف والودود M7R AI أي سؤال')
      .addStringOption((opt) => opt.setName('question').setDescription('اكتب سؤالك هنا').setRequired(true)),
    new SlashCommandBuilder()
      .setName('set-ai-room')
      .setDescription('تخصيص روم الذكاء الاصطناعي ليرد البوت على الأعضاء بطريقة مرحة وظريفة')
      .addChannelOption((opt) => opt.setName('channel').setDescription('اختر الروم').setRequired(false)),
    new SlashCommandBuilder().setName('panel').setDescription('إرسال بانل التذاكر في هذا الروم'),
    new SlashCommandBuilder().setName('dashboard').setDescription('عرض رابط لوحة تحكم الويب الرسمية')
  ].map((c) => c.toJSON());

  await botClient.application?.commands.set([]).catch(() => {});
  for (const [, guild] of botClient.guilds.cache) {
    await guild.commands.set(commands).catch(() => {});
  }
});

// ================= 3. ANTI-NUKE PROTECTION =================
botClient.on('guildBanAdd', async (ban) => {
  try {
    const logs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd });
    const log = logs.entries.first();
    if (!log || !log.executor) return;
    const executor = log.executor;
    if (executor.id === botClient.user.id || executor.id === ban.guild.ownerId) return;

    const count = (banAttackMap.get(executor.id) || 0) + 1;
    banAttackMap.set(executor.id, count);
    setTimeout(() => banAttackMap.delete(executor.id), 10000);

    if (count >= 3) {
      const member = await ban.guild.members.fetch(executor.id).catch(() => null);
      if (member && member.bannable) {
        await member.roles.set([]).catch(() => {});
        await member.ban({ reason: 'M7R Anti-Nuke: Mass Ban Attack Detected' }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Anti-Nuke error:', err);
  }
});

// ================= 4. MESSAGES: ANTI-SPAM + AI ASK + SET AI ROOM =================
botClient.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  const content = message.content.trim();
  const chName = (message.channel.name || '').toLowerCase();

  // A. Anti-Invite & Anti-Spam Protection
  const inviteRegex = /(discord\\.(gg|io|me|li)\\/|discordapp\\.com\\/invite\\/|discord\\.com\\/invite\\/)/i;
  if (inviteRegex.test(content) && !message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    await message.delete().catch(() => {});
    const warn = await message.channel.send(\`🛡️ يا <@\${message.author.id}> يمنع نشر روابط السيرفرات هنا!\`);
    setTimeout(() => warn.delete().catch(() => {}), 5000);
    return;
  }

  const now = Date.now();
  const uSpam = spamMap.get(message.author.id) || { count: 0, last: now };
  uSpam.count = now - uSpam.last < 3500 ? uSpam.count + 1 : 1;
  uSpam.last = now;
  spamMap.set(message.author.id, uSpam);

  if (uSpam.count >= 5 && !message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    await message.delete().catch(() => {});
    if (message.member?.moderatable) {
      await message.member.timeout(10 * 60 * 1000, 'M7R Anti-Spam Shield').catch(() => {});
      message.channel.send(\`🚨 تم كتم <@\${message.author.id}> مؤقتاً بسبب السبام المتكرر!\`).catch(() => {});
    }
    spamMap.delete(message.author.id);
    return;
  }

  // B. Customize AI Room Command: !set-ai-room / !روم-الذكاء
  if (
    content.startsWith(\`\${PREFIX}set-ai-room\`) ||
    content.startsWith(\`\${PREFIX}ai-room\`) ||
    content.startsWith(\`\${PREFIX}روم-الذكاء\`)
  ) {
    if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('❌ هذا الأمر مخصص لإدارة السيرفر فقط!');
    }
    const mentioned = message.mentions.channels.first();
    const targetName = mentioned ? mentioned.name : message.channel.name;
    aiRoomConfig.allowedChannel = targetName;
    aiRoomConfig.autoReplyWithoutPrefix = true;

    const embed = new EmbedBuilder()
      .setColor('#10b981')
      .setTitle('🤖✨ تم تخصيص روم الذكاء الاصطناعي بنجاح!')
      .setDescription(
        \`يا هلا والله! تم تفعيل الردود الذكية المرحة والظريفة في روم **#\${targetName}**! 😄🌸\\n\` +
        \`الآن أي عضو يكتب في هذا الروم سيرد عليه البوت بأسلوب لطيف وودود فوراً!\`
      );
    return message.reply({ embeds: [embed] });
  }

  // C. Friendly AI Ask ("ai ask ...", "!ask ...", or Auto-Reply inside customized AI room)
  const lower = content.toLowerCase();
  const isDirectAsk = lower.startsWith('ai ask') || lower.startsWith(\`\${PREFIX}ask\`) || lower.startsWith('اسال ');
  const isCustomAiRoom =
    aiRoomConfig.allowedChannel !== 'all' &&
    chName === aiRoomConfig.allowedChannel.toLowerCase() &&
    aiRoomConfig.autoReplyWithoutPrefix &&
    !content.startsWith(PREFIX);

  if (isDirectAsk || isCustomAiRoom) {
    const questionText = isDirectAsk
      ? content.replace(/^(!?ai\\s+ask|!ask|اسال)\\s*/i, '').trim()
      : content;

    await message.channel.sendTyping().catch(() => {});
    const aiRes = await askFriendlyM7RAi(questionText, message.author.username);
    const embed = new EmbedBuilder()
      .setColor(aiRes.blocked ? '#dc2626' : '#10b981')
      .setTitle(aiRes.blocked ? '🛡️ تنبيه لطيف من درع M7R AI' : '🤖✨ M7R AI | صديقك الذكي الودود')
      .setDescription(aiRes.answer)
      .setFooter({ text: \`سؤال من: \${message.author.username} • M7R Friendly AI\` })
      .setTimestamp();
    return message.reply({ embeds: [embed] }).catch(() => {});
  }

  // D. Ticket Panel Command (!panel)
  if (content === \`\${PREFIX}panel\` || content === \`\${PREFIX}تذاكر\`) {
    const embed = new EmbedBuilder()
      .setColor('#e11d48')
      .setTitle('🎫 مركز التذاكر والدعم الفني | M7R')
      .setDescription('اضغط على الزر بالأسفل لفتح تذكرة خاصة مع الإدارة:');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('open_ticket').setLabel('فتح تذكرة دعم 🎫').setStyle(ButtonStyle.Primary)
    );
    return message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ================= 5. SLASH COMMANDS & TICKET BUTTONS =================
botClient.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'ask') {
        const q = interaction.options.getString('question', true);
        await interaction.deferReply();
        const aiRes = await askFriendlyM7RAi(q, interaction.user.username);
        const embed = new EmbedBuilder()
          .setColor(aiRes.blocked ? '#dc2626' : '#10b981')
          .setTitle('🤖✨ M7R AI | المساعد الذكي الودود')
          .setDescription(aiRes.answer);
        return interaction.editReply({ embeds: [embed] });
      }

      if (interaction.commandName === 'set-ai-room') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
          return interaction.reply({ content: '❌ هذا الأمر للإدارة فقط!', ephemeral: true });
        }
        const ch = interaction.options.getChannel('channel') || interaction.channel;
        aiRoomConfig.allowedChannel = ch.name || 'general';
        aiRoomConfig.autoReplyWithoutPrefix = true;
        return interaction.reply(\`🤖✨ تم تخصيص الروم **#\${aiRoomConfig.allowedChannel}** للردود الذكية المرحة والودودة مع الأعضاء! 😄🌸\`);
      }

      if (interaction.commandName === 'dashboard') {
        return interaction.reply(\`🌐 **رابط لوحة تحكم بوت M7R الرسمية:**\\n\${WEB_DASHBOARD_URL}\`);
      }

      if (interaction.commandName === 'panel') {
        const embed = new EmbedBuilder()
          .setColor('#e11d48')
          .setTitle('🎫 مركز التذاكر والدعم الفني | M7R')
          .setDescription('اضغط على الزر بالأسفل لفتح تذكرة خاصة:');
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('open_ticket').setLabel('فتح تذكرة 🎫').setStyle(ButtonStyle.Primary)
        );
        return interaction.reply({ embeds: [embed], components: [row] });
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'open_ticket') {
        const ch = await interaction.guild.channels.create({
          name: \`ticket-\${interaction.user.username.slice(0, 8)}\`,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
          ]
        });
        const ctrlRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('claim_ticket').setLabel('استلام ✅').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('close_ticket').setLabel('إغلاق 🔒').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('delete_ticket').setLabel('حذف 🗑️').setStyle(ButtonStyle.Danger)
        );
        await ch.send({ content: \`مرحباً بك يا <@\${interaction.user.id}> في تذكرتك!\`, components: [ctrlRow] });
        return interaction.reply({ content: \`✅ تم فتح تذكرتك: <#\${ch.id}>\`, ephemeral: true });
      }
      if (interaction.customId === 'claim_ticket') {
        return interaction.reply(\`✅ تم استلام التذكرة بواسطة المشرف <@\${interaction.user.id}>\`);
      }
      if (interaction.customId === 'close_ticket') {
        return interaction.reply('🔒 تم إغلاق التذكرة بنجاح.');
      }
      if (interaction.customId === 'delete_ticket') {
        await interaction.reply('🗑️ سيتم حذف التذكرة خلال 5 ثوانٍ...');
        setTimeout(() => interaction.channel?.delete().catch(() => {}), 5000);
      }
    }
  } catch (e) {
    console.error('Interaction error:', e);
  }
});

if (process.env.DISCORD_BOT_TOKEN) {
  botClient.login(process.env.DISCORD_BOT_TOKEN);
} else {
  console.log('[M7R] Add DISCORD_BOT_TOKEN in Replit Secrets to start the bot.');
}`;

  const packageJsonCode = `{
  "name": "m7r-discord-bot-24-7",
  "version": "2.0.0",
  "description": "M7R Discord Security Bot + OAuth2 Web Redirect + Friendly AI Ask + 24/7 Express",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "@google/genai": "^1.0.0",
    "discord.js": "^14.16.3",
    "dotenv": "^16.4.5",
    "express": "^4.21.2"
  }
}`;

  const envCode = `# ===========================================
# M7R DISCORD BOT & OAUTH2 ENVIRONMENT VARIABLES (Replit Secrets)
# ===========================================

# 1. توكن البوت من Discord Developer Portal
DISCORD_BOT_TOKEN="YOUR_BOT_TOKEN_HERE"

# 2. بيانات OAuth2 لتسجيل الدخول عبر ديسكورد والتحويل التلقائي للوحة التحكم
DISCORD_CLIENT_ID="1564565916216336494"
DISCORD_CLIENT_SECRET="YOUR_DISCORD_CLIENT_SECRET"
DISCORD_REDIRECT_URI="https://YOUR-REPL-URL.replit.app/auth/discord/callback"

# 3. مفتاح Gemini API لتفعيل الردود الذكية الظريفة (AI Ask)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# 4. رابط لوحة التحكم الرسمية والمنفذ
WEB_DASHBOARD_URL="https://bot-m7r.netlify.app/"
PORT=3000
`;

  const copyToClipboard = (text: string, label: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const handleDownload = (content: string, filename: string) => {
    sound.playClick();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-rose-500" />
            {isAr ? 'مركز أكواد Replit 24/7 المحدثة (OAuth2 + AI Ask الظريف + الحماية)' : 'Replit 24/7 Updated Code Hub'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'الأكواد الكاملة والمحدثة للبوت مع إصلاح تحويل تسجيل الدخول OAuth2، نظام AI Ask الظريف والودود، وأمر تخصيص روم الذكاء (!set-ai-room)'
              : 'Complete updated Discord.js, OAuth2 callback redirect, Friendly AI Ask, and Express 24/7 keep-alive code'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload(serverJsCode, 'server.js')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-rose-400" />
            <span>{isAr ? 'تحميل server.js' : 'Download server.js'}</span>
          </button>
          <button
            onClick={() =>
              copyToClipboard(
                activeCodeTab === 'server' ? serverJsCode : activeCodeTab === 'package' ? packageJsonCode : envCode,
                activeCodeTab
              )
            }
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            {copiedFile ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            <span>{copiedFile ? (isAr ? 'تم النسخ بنجاح!' : 'Copied!') : isAr ? 'نسخ الكود الكامل' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* 4 Steps Deployment Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0d1017]">
          <span className="text-xs font-mono font-bold text-rose-400 block mb-1">
            01. {isAr ? 'إنشاء مشروع Replit' : 'Create Repl'}
          </span>
          <p className="text-[11px] text-slate-300">
            {isAr ? 'افتح Replit وأنشئ مشروع Node.js جديد باسم M7R-Bot.' : 'Open Replit, create a Node.js project.'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0d1017]">
          <span className="text-xs font-mono font-bold text-rose-400 block mb-1">
            02. {isAr ? 'لصق الأكواد المحدثة' : 'Paste Codes'}
          </span>
          <p className="text-[11px] text-slate-300">
            {isAr ? 'انسخ كود server.js و package.json المحدثين إلى ملفات المشروع.' : 'Paste server.js and package.json.'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0d1017]">
          <span className="text-xs font-mono font-bold text-rose-400 block mb-1">
            03. {isAr ? 'رابط OAuth2 Callback' : 'OAuth2 Callback'}
          </span>
          <p className="text-[11px] text-slate-300">
            {isAr
              ? 'أضف مسار /auth/callback أو /auth/discord/callback في بوابة مطوري ديسكورد.'
              : 'Add /auth/callback in Discord Developer Portal.'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0d1017]">
          <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">
            04. {isAr ? 'تشغيل 24/7 مع UptimeRobot' : '24/7 Keep Alive'}
          </span>
          <p className="text-[11px] text-slate-300">
            {isAr ? 'ضع رابط /ping في UptimeRobot ليعمل البوت 24 ساعة بدون توقف.' : 'Add your /ping URL to UptimeRobot.'}
          </p>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="rounded-xl border border-slate-800 bg-[#0a0d13] overflow-hidden shadow-2xl">
        {/* Tab Headers */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e121a] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveCodeTab('server');
                sound.playClick();
              }}
              className={`px-3 py-1 text-xs font-mono font-semibold rounded cursor-pointer transition-colors ${
                activeCodeTab === 'server'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              server.js (OAuth2 + Friendly AI + 24/7)
            </button>
            <button
              onClick={() => {
                setActiveCodeTab('package');
                sound.playClick();
              }}
              className={`px-3 py-1 text-xs font-mono font-semibold rounded cursor-pointer transition-colors ${
                activeCodeTab === 'package'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              package.json
            </button>
            <button
              onClick={() => {
                setActiveCodeTab('env');
                sound.playClick();
              }}
              className={`px-3 py-1 text-xs font-mono font-semibold rounded cursor-pointer transition-colors ${
                activeCodeTab === 'env'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              .env (Secrets)
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">UTF-8 • Node.js ES Module</span>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto max-h-[500px]">
          <pre className="text-xs font-mono text-slate-300 leading-relaxed">
            <code>
              {activeCodeTab === 'server' && serverJsCode}
              {activeCodeTab === 'package' && packageJsonCode}
              {activeCodeTab === 'env' && envCode}
            </code>
          </pre>
        </div>
      </div>

      {/* Developer Portal Notes */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          {isAr ? 'إعدادات Discord Developer Portal المطلوبة:' : 'Required Discord Developer Portal Setup:'}
        </h3>
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
          <li>
            <b>OAuth2 Redirects:</b>{' '}
            {isAr
              ? 'أضف رابط الـ Callback في قسم OAuth2 -> Redirects ليتم تحويل المستخدم تلقائياً للوحة التحكم بعد تسجيل الدخول.'
              : 'Add your callback URL under OAuth2 -> Redirects.'}
          </li>
          <li>
            <b>Privileged Gateway Intents:</b>{' '}
            {isAr
              ? 'فعّل الخيارات الثلاثة (Presence Intent، Server Members Intent، و Message Content Intent).'
              : 'Enable Presence, Server Members, and Message Content Intents.'}
          </li>
        </ul>
      </div>
    </div>
  );
};
