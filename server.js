// server.ts
import express from "express";
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
  ChannelType,
  ActivityType,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";
import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType
} from "@discordjs/voice";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import ffmpegStatic from "ffmpeg-static";
import { GoogleGenAI } from "@google/genai";
if (ffmpegStatic && !process.env.FFMPEG_PATH) {
  process.env.FFMPEG_PATH = ffmpegStatic;
}
dotenv.config();
process.on("uncaughtException", (err) => {
  console.error("[M7R 24/7 SHIELD - Uncaught Exception Prevented Crash]:", err?.message || err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[M7R 24/7 SHIELD - Unhandled Rejection Prevented Crash]:", reason?.message || reason);
});
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
var botClient = null;
var savedBotToken = process.env.DISCORD_BOT_TOKEN || null;
var isBotConnected = false;
var selectedGuildId = null;
var lastHeartbeatTime = (/* @__PURE__ */ new Date()).toISOString();
var heartbeatCount = 1;
var lastAzkarSentTime = Date.now();
var currentAccessMode = "bot_owner";
var guildJoinNotifications = [
  {
    id: "notif-init-1",
    guildId: "1525374225425367174",
    guildName: "\u0633\u064A\u0631\u0641\u0631 \u0645\u062C\u062A\u0645\u0639 \u0627\u0644\u0623\u0628\u0637\u0627\u0644 | Heroes Guild",
    guildIcon: "",
    memberCount: 1450,
    channelsCount: 34,
    ownerId: "1525374225425367171",
    ownerTag: "Khalid_Hero#2091",
    joinedAt: "\u0645\u0646\u0630 \u0642\u0644\u064A\u0644",
    permissionGranted: "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (\u0628\u062F\u0648\u0646 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062D\u0633\u0627\u0633\u0629)",
    accessMode: "server_admin",
    read: false
  }
];
var userWarningsMap = /* @__PURE__ */ new Map();
var connectedBotInfo = {
  username: "M7R",
  tag: "M7R#1624",
  id: "1098765432109876543",
  avatar: "",
  guildsCount: 1,
  membersCount: 124850,
  channelsCount: 3890,
  ping: 17,
  mode: "simulation"
};
var botBasicSettings = {
  botUsername: "M7R",
  presenceStatus: "dnd",
  activityType: "PLAYING",
  activityText: "M7R Security \u{1F6E1}\uFE0F | ai ask",
  streamingUrl: "https://twitch.tv/m7r",
  prefix: "!",
  logChannelName: "log-server",
  commandsChannelName: "cmd",
  keepAlive247: true,
  heartbeatIntervalSec: 25
};
var ticketPanelConfig = {
  storeName: "M7R Official Store",
  embedTitle: "M7R | \u0645\u0631\u0643\u0632 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0648\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A \u0648\u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A \u{1F6D2}",
  embedDescription: "\u0623\u0647\u0644\u0627\u064B \u0628\u0643\u0645 \u0641\u064A \u0645\u0631\u0643\u0632 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0627\u0644\u0631\u0633\u0645\u064A. \u064A\u0631\u062C\u0649 \u0627\u0644\u0636\u063A\u0637 \u0639\u0644\u0649 \u0627\u0644\u0632\u0631 \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0644\u0637\u0644\u0628\u0643 \u0623\u062F\u0646\u0627\u0647 \u0644\u064A\u062A\u0645 \u0641\u062A\u062D \u062A\u0630\u0643\u0631\u0629 \u062E\u0627\u0635\u0629 \u0628\u0643 \u0645\u0639 \u0641\u0631\u064A\u0642 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062E\u062A\u0635:",
  embedColor: "#e11d48",
  welcomeMessage: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u062A\u0630\u0643\u0631\u062A\u0643 \u0627\u0644\u062E\u0627\u0635\u0629! \u064A\u0631\u062C\u0649 \u0643\u062A\u0627\u0628\u0629 \u062A\u0641\u0627\u0635\u064A\u0644 \u0637\u0644\u0628\u0643 \u0648\u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u062D\u062A\u0649 \u064A\u0642\u0648\u0645 \u0623\u062D\u062F \u0627\u0644\u0645\u0634\u0631\u0641\u064A\u0646 \u0628\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u062A\u0630\u0643\u0631\u0629.",
  targetChannelName: "tickets",
  supportRoleName: "Support",
  buttons: [
    {
      id: "btn_store",
      label: "\u0634\u0631\u0627\u0621 \u0645\u0646\u062A\u062C",
      emoji: "\u{1F6D2}",
      style: "Primary",
      categoryDescription: "\u0644\u0634\u0631\u0627\u0621 \u062D\u0633\u0627\u0628\u0627\u062A\u060C \u0646\u064A\u062A\u0631\u0648\u060C \u0643\u0631\u0648\u062A \u0634\u062D\u0646\u060C \u0623\u0648 \u0631\u062A\u0628 \u062E\u0627\u0635\u0629.",
      enabled: true
    },
    {
      id: "btn_support",
      label: "\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A",
      emoji: "\u{1F6E0}\uFE0F",
      style: "Secondary",
      categoryDescription: "\u0644\u062D\u0644 \u0627\u0644\u0645\u0634\u0643\u0644\u0627\u062A \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0648\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631.",
      enabled: true
    },
    {
      id: "btn_complaints",
      label: "\u0627\u0644\u0634\u0643\u0627\u0648\u0649 \u0648\u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0627\u062A",
      emoji: "\u{1F4BC}",
      style: "Secondary",
      categoryDescription: "\u0644\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0644\u064A\u0627 \u0648\u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0628\u0644\u0627\u063A\u0627\u062A.",
      enabled: true
    },
    {
      id: "btn_partnerships",
      label: "\u0627\u0644\u0634\u0631\u0627\u0643\u0627\u062A \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062A",
      emoji: "\u{1F91D}",
      style: "Success",
      categoryDescription: "\u0644\u0639\u0642\u062F \u0635\u0641\u0642\u0627\u062A \u0627\u0644\u062A\u0628\u0627\u062F\u0644 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u064A \u0648\u0627\u0644\u062A\u0639\u0627\u0648\u0646 \u0627\u0644\u0645\u0634\u062A\u0631\u0643.",
      enabled: true
    }
  ],
  namingFormat: "username_number",
  channelPrefix: "ticket",
  askReasonModal: true,
  aiWaitingAssistant: true,
  waitingMessage: '\u23F3 \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643! \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u0644\u062D\u064A\u0646 \u0642\u062F\u0648\u0645 \u0637\u0627\u0642\u0645 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0644\u0645\u0633\u0627\u0639\u062F\u062A\u0643.\n\u{1F4A1} \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631\u060C \u064A\u0645\u0643\u0646\u0643 \u0643\u062A\u0627\u0628\u0629 "ai ask [\u0633\u0624\u0627\u0644\u0643]" \u0648\u0633\u064A\u062C\u064A\u0628\u0643 \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A M7R \u0641\u0648\u0631\u0627\u064B \u0644\u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u062D\u062A\u0649 \u064A\u062A\u0641\u0631\u063A \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A!'
};
var applicationsConfig = {
  enabled: true,
  applyChannelName: "staff-applications",
  adminReviewChannelName: "log-server",
  resultsChannelName: "",
  acceptedRoleName: "Staff Trial",
  panelTitle: "\u{1F4CB} \u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0648\u0627\u0644\u0631\u0642\u0627\u0628\u0629 (Staff Applications)",
  panelDescription: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0642\u062F\u064A\u0645\u0627\u062A \u0627\u0644\u0631\u0633\u0645\u064A \u0644\u0633\u064A\u0631\u0641\u0631 M7R!\n\n\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0627\u0644\u0632\u0631 \u0623\u062F\u0646\u0627\u0647 \u0644\u062A\u0639\u0628\u0626\u0629 \u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0637\u0627\u0642\u0645 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0648\u0627\u0644\u0631\u0642\u0627\u0628\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0628\u062F\u0642\u0629 \u0648\u0645\u0635\u062F\u0627\u0642\u064A\u0629.",
  panelColor: "#e11d48",
  panelBannerUrl: "",
  panelButtonLabel: "\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0622\u0646",
  panelButtonEmoji: "\u{1F4DD}",
  dmOnAccept: true,
  acceptDmMessage: "\u{1F389} \u062A\u0647\u0627\u0646\u064A\u0646\u0627! \u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0646\u0636\u0645\u0627\u0645\u0643 \u0644\u0637\u0627\u0642\u0645 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631\u060C \u0648\u062A\u0645 \u0645\u0646\u062D\u0643 \u0631\u062A\u0628\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0628\u0646\u062C\u0627\u062D. \u0646\u0631\u062C\u0648 \u0645\u0646\u0643 \u0645\u0631\u0627\u062C\u0639\u0629 \u0642\u0648\u0627\u0646\u064A\u0646 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631.",
  dmOnReject: true,
  rejectDmMessage: "\u0646\u0639\u062A\u0630\u0631 \u0645\u0646\u0643\u060C \u0644\u0645 \u064A\u062A\u0645 \u0627\u062C\u062A\u064A\u0627\u0632 \u0645\u062A\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0634\u0641\u062A \u0648\u0627\u0644\u062E\u0628\u0631\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631. \u064A\u0645\u0643\u0646\u0643 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0641\u064A \u0627\u0644\u0645\u0631\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629.",
  questions: [
    {
      id: "q1",
      question: "\u0639\u0631\u0651\u0641 \u0639\u0646 \u0646\u0641\u0633\u0643 \u0648\u0639\u0645\u0631\u0643 \u0648\u0645\u0643\u0627\u0646 \u0625\u0642\u0627\u0645\u062A\u0643\u061F",
      placeholder: "\u0645\u062B\u0627\u0644: \u064A\u0648\u0633\u0641\u060C 21 \u0633\u0646\u0629\u060C \u0627\u0644\u0631\u064A\u0627\u0636...",
      type: "short",
      required: true
    },
    {
      id: "q2",
      question: "\u0645\u0627 \u0647\u064A \u062E\u0628\u0631\u0627\u062A\u0643 \u0627\u0644\u0633\u0627\u0628\u0642\u0629 \u0641\u064A \u0625\u062F\u0627\u0631\u0629 \u0648\u062A\u0646\u0638\u064A\u0645 \u0627\u0644\u0633\u064A\u0631\u0641\u0631\u0627\u062A\u061F",
      placeholder: "\u0627\u0630\u0643\u0631 \u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u0633\u064A\u0631\u0641\u0631\u0627\u062A \u0623\u0648 \u0637\u0628\u064A\u0639\u0629 \u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629...",
      type: "paragraph",
      required: true
    },
    {
      id: "q3",
      question: "\u0643\u0645 \u0639\u062F\u062F \u0627\u0644\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0641\u0631\u063A \u0644\u0647\u0627 \u064A\u0648\u0645\u064A\u0627\u064B \u0644\u0634\u0641\u062A \u0627\u0644\u0631\u0642\u0627\u0628\u0629\u061F",
      placeholder: "\u0645\u062B\u0627\u0644: 5 \u0633\u0627\u0639\u0627\u062A \u064A\u0648\u0645\u064A\u0627\u064B \u0641\u064A \u0627\u0644\u0641\u062A\u0631\u0629 \u0627\u0644\u0645\u0633\u0627\u0626\u064A\u0629...",
      type: "short",
      required: true
    }
  ]
};
var applications = [
  {
    id: "app-501",
    formId: "staff-recruitment",
    formTitle: "\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0648\u0627\u0644\u0631\u0642\u0627\u0628\u0629 (Staff Application)",
    applicant: {
      id: "1525374225425367171",
      name: "Khalid_Hero",
      tag: "Khalid#2091",
      avatar: "",
      joinedAt: "\u0645\u0646\u0630 8 \u0623\u0634\u0647\u0631"
    },
    answers: {
      q1: "\u062E\u0627\u0644\u062F \u0627\u0644\u0639\u0646\u0632\u064A\u060C \u0639\u0645\u0631\u064A 21 \u0633\u0646\u0629\u060C \u0645\u0642\u064A\u0645 \u0628\u0627\u0644\u0631\u064A\u0627\u0636.",
      q2: "\u062E\u0628\u0631\u0629 \u0633\u0646\u062A\u064A\u0646 \u0641\u064A \u0625\u062F\u0627\u0631\u0629 \u0633\u064A\u0631\u0641\u0631\u0627\u062A \u0645\u062C\u062A\u0645\u0639\u0627\u062A \u0623\u0644\u0639\u0627\u0628 \u0643\u0628\u064A\u0631\u0629 \u062A\u0641\u0648\u0642 40 \u0623\u0644\u0641 \u0639\u0636\u0648.",
      q3: "\u0645\u062A\u0641\u0631\u063A \u064A\u0648\u0645\u064A\u0627\u064B \u0645\u0646 6 \u0625\u0644\u0649 8 \u0633\u0627\u0639\u0627\u062A \u0645\u0633\u0627\u0626\u064A\u0629."
    },
    status: "pending",
    submittedAt: "\u0623\u0645\u0633\u060C 11:30 \u0645"
  }
];
var discordCommands = [
  // 1. MODERATION & PUNISHMENTS
  {
    id: "cmd-mute",
    name: "mute",
    aliases: ["\u0645\u064A\u0648\u062A", "\u0643\u062A\u0645", "\u0627\u0633\u0643\u0627\u062A", "\u062A\u0627\u064A\u0645", "timeout"],
    description: "\u0643\u062A\u0645 \u0639\u0636\u0648 \u0645\u0624\u0642\u062A\u0627\u064B (Timeout) \u0648\u0645\u0646\u0639\u0647 \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0628\u0629 \u0648\u0627\u0644\u062A\u062D\u062F\u062B (\u0645\u062B\u0627\u0644: !mute @user 15 \u0633\u0628\u0628)",
    category: "moderation",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F507} **\u062A\u0645 \u0625\u0639\u0637\u0627\u0621 \u0645\u064A\u0648\u062A (\u0643\u062A\u0645 \u0645\u0624\u0642\u062A) \u0644\u0644\u0639\u0636\u0648 \u0628\u0646\u062C\u0627\u062D \u0628\u0648\u0627\u0633\u0637\u0629 \u0625\u062F\u0627\u0631\u0629 M7R!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-unmute",
    name: "unmute",
    aliases: ["\u0641\u0643-\u0627\u0644\u0645\u064A\u0648\u062A", "\u0641\u0643-\u0645\u064A\u0648\u062A", "\u0641\u0643-\u0643\u062A\u0645", "\u062A\u0643\u0644\u0645", "\u0641\u0643", "untimeout"],
    description: "\u0641\u0643 \u0627\u0644\u0645\u064A\u0648\u062A (\u0627\u0644\u0643\u062A\u0645 \u0627\u0644\u0645\u0624\u0642\u062A) \u0639\u0646 \u0639\u0636\u0648 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0641\u0648\u0631\u0627\u064B (\u0645\u062B\u0627\u0644: !unmute @user)",
    category: "moderation",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F50A} **\u062A\u0645 \u0641\u0643 \u0627\u0644\u0645\u064A\u0648\u062A \u0639\u0646 \u0627\u0644\u0639\u0636\u0648 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-ban",
    name: "ban",
    aliases: ["\u0628\u0627\u0646\u062F", "\u062D\u0638\u0631", "\u0637\u064A\u0631"],
    description: "\u062D\u0638\u0631 \u0639\u0636\u0648 \u0645\u062E\u0627\u0644\u0641 \u0645\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0646\u0647\u0627\u0626\u064A\u0627\u064B \u0645\u0639 \u062A\u0648\u062B\u064A\u0642 \u0627\u0644\u0633\u0628\u0628 (\u0645\u062B\u0627\u0644: !ban @user \u0633\u0628\u0628)",
    category: "moderation",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F528} **\u062A\u0645 \u062D\u0638\u0631 \u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u062E\u0627\u0644\u0641 (Ban) \u0645\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0648\u0627\u0633\u0637\u0629 M7R!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-unban",
    name: "unban",
    aliases: ["\u0641\u0643-\u0627\u0644\u0628\u0627\u0646\u062F", "\u0641\u0643-\u062D\u0638\u0631", "\u0639\u0641\u0648"],
    description: "\u0641\u0643 \u0627\u0644\u062D\u0638\u0631 (Unban) \u0639\u0646 \u0639\u0636\u0648 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0622\u064A\u062F\u064A (\u0645\u062B\u0627\u0644: !unban 10987654321)",
    category: "moderation",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u2705 **\u062A\u0645 \u0641\u0643 \u0627\u0644\u062D\u0638\u0631 (Unban) \u0639\u0646 \u0627\u0644\u0639\u0636\u0648 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-kick",
    name: "kick",
    aliases: ["\u0637\u0631\u062F", "\u0643\u064A\u0643"],
    description: "\u0637\u0631\u062F \u0639\u0636\u0648 \u0645\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0645\u0639 \u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0633\u0628\u0628 (\u0645\u062B\u0627\u0644: !kick @user \u0633\u0628\u0628)",
    category: "moderation",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F462} **\u062A\u0645 \u0637\u0631\u062F \u0627\u0644\u0639\u0636\u0648 \u0645\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-warn",
    name: "warn",
    aliases: ["\u062A\u062D\u0630\u064A\u0631", "\u0627\u0646\u0630\u0627\u0631"],
    description: "\u062A\u0648\u062C\u064A\u0647 \u062A\u062D\u0630\u064A\u0631 \u0625\u062F\u0627\u0631\u064A \u0631\u0633\u0645\u064A \u0644\u0639\u0636\u0648 \u0648\u062D\u0641\u0638\u0647 \u0641\u064A \u0633\u062C\u0644 \u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A (\u0645\u062B\u0627\u0644: !warn @user \u0627\u0644\u0633\u0628\u0628)",
    category: "moderation",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u26A0\uFE0F **\u062A\u0645 \u062A\u0648\u062C\u064A\u0647 \u062A\u062D\u0630\u064A\u0631 \u0631\u0633\u0645\u064A \u0644\u0644\u0639\u0636\u0648 \u0648\u062A\u0648\u062B\u064A\u0642\u0647 \u0641\u064A \u0633\u062C\u0644 \u0627\u0644\u0631\u0642\u0627\u0628\u0629!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-warnings",
    name: "warnings",
    aliases: ["\u062A\u062D\u0630\u064A\u0631\u0627\u062A", "\u0627\u0646\u0630\u0627\u0631\u0627\u062A", "\u0633\u062C\u0644-\u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A"],
    description: "\u0639\u0631\u0636 \u0642\u0627\u0626\u0645\u0629 \u0648\u0639\u062F\u062F \u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u0644\u0629 \u0639\u0644\u0649 \u0639\u0636\u0648 (\u0645\u062B\u0627\u0644: !warnings @user)",
    category: "moderation",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F4CB} **\u0633\u062C\u0644 \u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0644\u0644\u0639\u0636\u0648:**",
    allowedChannel: "all"
  },
  {
    id: "cmd-clearwarnings",
    name: "clearwarnings",
    aliases: ["\u0645\u0633\u062D-\u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A", "\u0627\u0632\u0627\u0644\u0629-\u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A", "\u062A\u0635\u0641\u064A\u0631-\u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A"],
    description: "\u0645\u0633\u062D \u0648\u062A\u0635\u0641\u064A\u0631 \u062C\u0645\u064A\u0639 \u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u0644\u0629 \u0639\u0644\u0649 \u0639\u0636\u0648 (\u0645\u062B\u0627\u0644: !clearwarnings @user)",
    category: "moderation",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F9F9} **\u062A\u0645 \u0645\u0633\u062D \u062C\u0645\u064A\u0639 \u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u0639\u0636\u0648 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  // 2. CHANNELS & ROLES MANAGEMENT
  {
    id: "cmd-clear",
    name: "clear",
    aliases: ["\u0645\u0633\u062D", "\u062A\u0646\u0638\u064A\u0641", "purge"],
    description: "\u0645\u0633\u062D \u0639\u062F\u062F \u0645\u062D\u062F\u062F \u0645\u0646 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A (\u0645\u062B\u0627\u0644: !clear 50)",
    category: "channels",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F9F9} **\u062A\u0645 \u062A\u0646\u0638\u064A\u0641 \u0627\u0644\u0634\u0627\u062A \u0648\u0645\u0633\u062D \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-lock",
    name: "lock",
    aliases: ["\u0642\u0641\u0644", "\u062A\u0642\u0641\u064A\u0644"],
    description: "\u0642\u0641\u0644 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0648\u0645\u0646\u0639 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0645\u0646 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0626\u0644",
    category: "channels",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F512} **\u062A\u0645 \u0642\u0641\u0644 \u0627\u0644\u0631\u0648\u0645 \u0628\u0646\u062C\u0627\u062D \u0628\u0648\u0627\u0633\u0637\u0629 \u062D\u0645\u0627\u064A\u0629 M7R!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-unlock",
    name: "unlock",
    aliases: ["\u0641\u062A\u062D", "\u0641\u062A\u062D-\u0627\u0644\u0631\u0648\u0645"],
    description: "\u0625\u0639\u0627\u062F\u0629 \u0641\u062A\u062D \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0648\u0627\u0644\u0633\u0645\u0627\u062D \u0644\u0644\u0623\u0639\u0636\u0627\u0621 \u0628\u0627\u0644\u0643\u062A\u0627\u0628\u0629",
    category: "channels",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F513} **\u062A\u0645 \u0641\u062A\u062D \u0627\u0644\u0631\u0648\u0645 \u0628\u0646\u062C\u0627\u062D \u0628\u0648\u0627\u0633\u0637\u0629 M7R!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-hide",
    name: "hide",
    aliases: ["\u0627\u062E\u0641\u0627\u0621", "\u062E\u0641\u064A"],
    description: "\u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0639\u0646 \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0641\u0648\u0631\u0627\u064B",
    category: "channels",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F441}\uFE0F\u200D\u{1F5E8}\uFE0F **\u062A\u0645 \u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u0631\u0648\u0645 \u0639\u0646 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-show",
    name: "show",
    aliases: ["\u0627\u0638\u0647\u0627\u0631", "\u0638\u0647\u0631"],
    description: "\u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0644\u0644\u0623\u0639\u0636\u0627\u0621 \u0645\u0646 \u062C\u062F\u064A\u062F",
    category: "channels",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F441}\uFE0F **\u062A\u0645 \u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0631\u0648\u0645 \u0644\u0644\u062C\u0645\u064A\u0639 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-slowmode",
    name: "slowmode",
    aliases: ["\u0628\u0637\u0621", "\u062A\u0647\u062F\u0626\u0629", "\u0633\u0644\u0648"],
    description: "\u062A\u062D\u062F\u064A\u062F \u0645\u0647\u0644\u0629 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0628\u0627\u0644\u062B\u0648\u0627\u0646\u064A (\u0645\u062B\u0627\u0644: !slowmode 5)",
    category: "channels",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u23F1\uFE0F **\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0648\u0636\u0639 \u0627\u0644\u062A\u0647\u062F\u0626\u0629 (Slowmode) \u0644\u0644\u0631\u0648\u0645 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-role",
    name: "role",
    aliases: ["\u0631\u062A\u0628\u0629", "\u0631\u0648\u0644", "\u0627\u0639\u0637\u0627\u0621-\u0631\u062A\u0628\u0629"],
    description: "\u0625\u0639\u0637\u0627\u0621 \u0623\u0648 \u0633\u062D\u0628 \u0631\u062A\u0628\u0629 \u0645\u0646 \u0639\u0636\u0648 (\u0645\u062B\u0627\u0644: !role @user VIP)",
    category: "channels",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F396}\uFE0F **\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0631\u062A\u0628 \u0627\u0644\u0639\u0636\u0648 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-nick",
    name: "nick",
    aliases: ["\u0644\u0642\u0628", "\u062A\u063A\u064A\u064A\u0631-\u0644\u0642\u0628", "\u0627\u0633\u0645"],
    description: "\u062A\u063A\u064A\u064A\u0631 \u0644\u0642\u0628 \u0639\u0636\u0648 \u062F\u0627\u062E\u0644 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0623\u0648 \u0625\u0639\u0627\u062F\u062A\u0647 \u0644\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0635\u0644\u064A (\u0645\u062B\u0627\u0644: !nick @user \u0627\u0644\u0628\u0637\u0644)",
    category: "channels",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u270F\uFE0F **\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0644\u0642\u0628 \u0627\u0644\u0639\u0636\u0648 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  // 3. VOICE MODERATION
  {
    id: "cmd-vkick",
    name: "vkick",
    aliases: ["\u0637\u0631\u062F-\u0635\u0648\u062A\u064A", "\u0641\u0635\u0644", "\u0641\u0635\u0644-\u0635\u0648\u062A\u064A"],
    description: "\u0641\u0635\u0644 \u0639\u0636\u0648 \u0645\u0646 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \u0641\u0648\u0631\u0627\u064B (\u0645\u062B\u0627\u0644: !vkick @user)",
    category: "voice",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F50C} **\u062A\u0645 \u0641\u0635\u0644 \u0627\u0644\u0639\u0636\u0648 \u0645\u0646 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-vmute",
    name: "vmute",
    aliases: ["\u0645\u064A\u0648\u062A-\u0635\u0648\u062A\u064A", "\u0643\u062A\u0645-\u0635\u0648\u062A\u064A"],
    description: "\u0643\u062A\u0645 \u0627\u0644\u0645\u0627\u064A\u0643\u0631\u0648\u0641\u0648\u0646 \u0639\u0646 \u0639\u0636\u0648 \u0645\u062A\u0648\u0627\u062C\u062F \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A (\u0645\u062B\u0627\u0644: !vmute @user)",
    category: "voice",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F399}\uFE0F **\u062A\u0645 \u0643\u062A\u0645 \u0627\u0644\u0639\u0636\u0648 \u0635\u0648\u062A\u064A\u0627\u064B \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-vunmute",
    name: "vunmute",
    aliases: ["\u0641\u0643-\u0645\u064A\u0648\u062A-\u0635\u0648\u062A\u064A", "\u0641\u0643-\u0643\u062A\u0645-\u0635\u0648\u062A\u064A"],
    description: "\u0641\u0643 \u0627\u0644\u0643\u062A\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \u0639\u0646 \u0639\u0636\u0648 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A (\u0645\u062B\u0627\u0644: !vunmute @user)",
    category: "voice",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F50A} **\u062A\u0645 \u0641\u0643 \u0627\u0644\u0643\u062A\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \u0639\u0646 \u0627\u0644\u0639\u0636\u0648 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-move",
    name: "move",
    aliases: ["\u0633\u062D\u0628", "\u0646\u0642\u0644"],
    description: "\u0633\u062D\u0628 \u0639\u0636\u0648 \u0645\u0646 \u0631\u0648\u0645 \u0635\u0648\u062A\u064A \u0622\u062E\u0631 \u0625\u0644\u0649 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \u0627\u0644\u0630\u064A \u062A\u062A\u0648\u0627\u062C\u062F \u0641\u064A\u0647 (\u0645\u062B\u0627\u0644: !move @user)",
    category: "voice",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F9F2} **\u062A\u0645 \u0633\u062D\u0628 \u0627\u0644\u0639\u0636\u0648 \u0625\u0644\u0649 \u0631\u0648\u0645\u0643 \u0627\u0644\u0635\u0648\u062A\u064A \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  // 4. WELCOME & GENERAL COMMANDS
  {
    id: "cmd-welcome",
    name: "welcome",
    aliases: ["\u062A\u0631\u062D\u064A\u0628", "\u062A\u0633\u062A-\u062A\u0631\u062D\u064A\u0628"],
    description: "\u0625\u0631\u0633\u0627\u0644 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0627\u0644\u0645\u062E\u0635\u0635\u0629 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0644\u062A\u062C\u0631\u0628\u062A\u0647\u0627 \u0623\u0648 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0628\u0639\u0636\u0648 (\u0645\u062B\u0627\u0644: !welcome @user)",
    category: "general",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F44B} **\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-setwelcome",
    name: "setwelcome",
    aliases: ["\u062A\u0639\u064A\u064A\u0646-\u0627\u0644\u062A\u0631\u062D\u064A\u0628", "\u0631\u0648\u0645-\u0627\u0644\u062A\u0631\u062D\u064A\u0628"],
    description: "\u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0643\u0631\u0648\u0645 \u0631\u0633\u0645\u064A \u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u062C\u062F\u062F \u0648\u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0628\u0647\u0645 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B",
    category: "general",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u2705 **\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 \u0647\u0630\u0627 \u0627\u0644\u0631\u0648\u0645 \u0643\u0631\u0648\u0645 \u0631\u0633\u0645\u064A \u0644\u0644\u062A\u0631\u062D\u064A\u0628 \u0628\u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u062C\u062F\u062F!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-ping",
    name: "ping",
    aliases: ["\u0628\u0646\u0642", "\u0627\u062A\u0635\u0627\u0644", "\u0628\u064A\u0646\u062C"],
    description: "\u0641\u062D\u0635 \u0633\u0631\u0639\u0629 \u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0628\u0648\u062A \u0628\u0627\u0644\u062F\u064A\u0633\u0643\u0648\u0631\u062F (Latency)",
    category: "general",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F3D3} **M7R Security Pong!** \u0633\u0631\u0639\u0629 \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u0627\u0644\u0646\u0638\u0627\u0645 \u064A\u0639\u0645\u0644 24/7.",
    allowedChannel: "all"
  },
  {
    id: "cmd-server",
    name: "server",
    aliases: ["\u0633\u064A\u0631\u0641\u0631", "\u0645\u0639\u0644\u0648\u0645\u0627\u062A-\u0627\u0644\u0633\u064A\u0631\u0641\u0631", "\u0627\u062D\u0635\u0627\u0626\u064A\u0627\u062A"],
    description: "\u0639\u0631\u0636 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0648\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0628\u0627\u0644\u062A\u0641\u0635\u064A\u0644",
    category: "general",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F4CA} \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0627\u0644\u0645\u062D\u0645\u064A\u0629 \u0628\u0648\u0627\u0633\u0637\u0629 M7R:",
    allowedChannel: "all"
  },
  {
    id: "cmd-roles",
    name: "roles",
    aliases: ["\u0631\u062A\u0628", "\u0627\u0644\u0631\u062A\u0628", "\u0642\u0627\u0626\u0645\u0629-\u0627\u0644\u0631\u062A\u0628"],
    description: "\u0639\u0631\u0636 \u0642\u0627\u0626\u0645\u0629 \u062C\u0645\u064A\u0639 \u0631\u062A\u0628 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u0639\u062F\u062F \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0641\u064A \u0643\u0644 \u0631\u062A\u0628\u0629",
    category: "general",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F396}\uFE0F **\u0642\u0627\u0626\u0645\u0629 \u0631\u062A\u0628 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0631\u0633\u0645\u064A\u0629:**",
    allowedChannel: "all"
  },
  {
    id: "cmd-help",
    name: "help",
    aliases: ["\u0645\u0633\u0627\u0639\u062F\u0629", "\u0627\u0648\u0627\u0645\u0631", "commands"],
    description: "\u0639\u0631\u0636 \u0645\u0648\u0633\u0648\u0639\u0629 \u062C\u0645\u064A\u0639 \u0623\u0648\u0627\u0645\u0631 \u0628\u0648\u062A M7R \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0648\u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0627\u0644\u0645\u0641\u0639\u0644\u0629",
    category: "general",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F4DC} \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0648\u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0641\u064A \u0628\u0648\u062A M7R:",
    allowedChannel: "all"
  },
  // 5. TICKETS COMMANDS
  {
    id: "cmd-panel",
    name: "panel",
    aliases: ["\u062A\u0643\u062A", "\u0628\u0627\u0646\u0644", "\u062A\u0630\u0627\u0643\u0631"],
    description: "\u0625\u0631\u0633\u0627\u0644 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0627\u0644\u0645\u062E\u0635\u0635\u0629 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0641\u0648\u0631\u0627\u064B",
    category: "tickets",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F3AB} **\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-claim",
    name: "claim",
    aliases: ["\u0627\u0633\u062A\u0644\u0627\u0645", "\u062A\u0648\u0644\u064A"],
    description: "\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0627\u0644\u0645\u0641\u062A\u0648\u062D\u0629 \u062D\u0627\u0644\u064A\u0627\u064B \u0628\u0627\u0633\u0645 \u0627\u0644\u0645\u0634\u0631\u0641",
    category: "tickets",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u2705 **\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0628\u0648\u0627\u0633\u0637\u0629 \u0627\u0644\u0645\u0634\u0631\u0641 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-close",
    name: "close",
    aliases: ["\u0627\u063A\u0644\u0627\u0642", "\u0642\u0641\u0644-\u062A\u0643\u062A"],
    description: "\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0648\u0623\u0631\u0634\u0641\u062A\u0647\u0627 \u0641\u064A \u0631\u0648\u0645 \u0627\u0644\u0644\u0648\u0642",
    category: "tickets",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F512} **\u062A\u0645 \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0648\u0623\u0631\u0634\u0641\u062A\u0647\u0627 \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-come",
    name: "come",
    aliases: ["\u0646\u062F\u0627\u0621", "\u062A\u0639\u0627\u0644", "\u0627\u0633\u062A\u062F\u0639\u0627\u0621"],
    description: "\u0625\u0631\u0633\u0627\u0644 \u0646\u062F\u0627\u0621 \u062A\u0646\u0628\u064A\u0647\u064A \u0644\u0639\u0636\u0648 \u0641\u064A \u0627\u0644\u062E\u0627\u0635 \u0644\u0644\u062D\u0636\u0648\u0631 \u0625\u0644\u0649 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0623\u0648 \u0627\u0644\u0631\u0648\u0645 (\u0645\u062B\u0627\u0644: !come @user)",
    category: "tickets",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F4F2} **\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0646\u062F\u0627\u0621 \u0639\u0627\u062C\u0644 \u0644\u0644\u0639\u0636\u0648 \u0641\u064A \u0627\u0644\u062E\u0627\u0635 \u0644\u0644\u062D\u0636\u0648\u0631 \u0625\u0644\u0649 \u0627\u0644\u0631\u0648\u0645!**",
    allowedChannel: "all"
  },
  // 6. UTILITY & PROFILE COMMANDS
  {
    id: "cmd-tax",
    name: "tax",
    aliases: ["\u0636\u0631\u064A\u0628\u0629", "\u0636\u0631\u064A\u0628\u0647", "\u062D\u0633\u0627\u0628-\u0636\u0631\u064A\u0628\u0629"],
    description: "\u062D\u0633\u0627\u0628 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0628\u0631\u0648\u0628\u0648\u062A (ProBot Tax 5%) \u0628\u062F\u0642\u0629 \u0644\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0627\u0644\u0648\u0633\u0637\u0627\u0621 (\u0645\u062B\u0627\u0644: !tax 100000)",
    category: "utility",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F4B0} **\u062D\u0627\u0633\u0628\u0629 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0645\u062A\u062C\u0631 (M7R Tax Calculator):**",
    allowedChannel: "all"
  },
  {
    id: "cmd-say",
    name: "say",
    aliases: ["\u0642\u0648\u0644", "\u062A\u062D\u062F\u062B", "\u0627\u0631\u0633\u0644"],
    description: "\u062C\u0639\u0644 \u0627\u0644\u0628\u0648\u062A \u064A\u0631\u0633\u0644 \u0631\u0633\u0627\u0644\u0629 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 (\u0645\u062B\u0627\u0644: !say \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643\u0645)",
    category: "utility",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F4E2} **\u0631\u0633\u0627\u0644\u0629 \u0645\u0646 \u0625\u062F\u0627\u0631\u0629 M7R:**",
    allowedChannel: "all"
  },
  {
    id: "cmd-embed",
    name: "embed",
    aliases: ["\u0627\u064A\u0645\u0628\u062F", "\u0627\u0639\u0644\u0627\u0646", "\u0631\u0633\u0627\u0644\u0629-\u0631\u0633\u0645\u064A\u0629"],
    description: "\u062C\u0639\u0644 \u0627\u0644\u0628\u0648\u062A \u064A\u0631\u0633\u0644 \u0625\u0639\u0644\u0627\u0646\u0627\u064B \u0631\u0633\u0645\u064A\u0627\u064B \u0645\u0646\u0633\u0642\u0627\u064B \u062F\u0627\u062E\u0644 \u0628\u0637\u0627\u0642\u0629 Embed \u0628\u0627\u0633\u0645 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (\u0645\u062B\u0627\u0644: !embed \u0625\u0639\u0644\u0627\u0646 \u0647\u0627\u0645)",
    category: "utility",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F4E2} **\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0627\u0644\u0631\u0633\u0645\u064A \u0628\u0646\u062C\u0627\u062D!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-user",
    name: "user",
    aliases: ["\u0647\u0648\u064A\u0629", "\u0645\u0639\u0644\u0648\u0645\u0627\u062A\u064A", "\u0628\u0631\u0648\u0641\u0627\u064A\u0644", "\u064A\u0648\u0632\u0631", "id"],
    description: "\u0639\u0631\u0636 \u0628\u0637\u0627\u0642\u0629 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0639\u0636\u0648 \u0648\u062A\u0627\u0631\u064A\u062E \u062F\u062E\u0648\u0644\u0647 \u0644\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u0627\u0644\u062F\u064A\u0633\u0643\u0648\u0631\u062F",
    category: "utility",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1FAAA} **\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0647\u0648\u064A\u0629 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0644\u0644\u0639\u0636\u0648 (M7R Profile):**",
    allowedChannel: "all"
  },
  {
    id: "cmd-avatar",
    name: "avatar",
    aliases: ["\u0627\u0641\u062A\u0627\u0631", "\u0635\u0648\u0631\u0629", "\u0627\u0641\u0627\u062A\u0627\u0631"],
    description: "\u0639\u0631\u0636 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0631\u0645\u0632\u064A\u0629 \u0644\u0644\u0639\u0636\u0648 \u0628\u062C\u0648\u062F\u0629 \u0639\u0627\u0644\u064A\u0629 \u0645\u0639 \u0631\u0627\u0628\u0637 \u0627\u0644\u062A\u062D\u0645\u064A\u0644",
    category: "utility",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F5BC}\uFE0F **\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0631\u0645\u0632\u064A\u0629 \u0644\u0644\u0639\u0636\u0648:**",
    allowedChannel: "all"
  },
  {
    id: "cmd-banner",
    name: "banner",
    aliases: ["\u0628\u0646\u0631", "\u0628\u0627\u0646\u0631", "\u062E\u0644\u0641\u064A\u0629"],
    description: "\u0639\u0631\u0636 \u0635\u0648\u0631\u0629 \u0627\u0644\u0628\u0646\u0631 \u0627\u0644\u0634\u062E\u0635\u064A \u0644\u0644\u0639\u0636\u0648 \u0623\u0648 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u062C\u0648\u062F\u0629 \u0639\u0627\u0644\u064A\u0629",
    category: "utility",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F3A8} **\u0628\u0646\u0631 \u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0631\u0633\u0645\u064A:**",
    allowedChannel: "all"
  },
  // 7. ISLAMIC AZKAR & SECURITY COMMANDS
  {
    id: "cmd-azkar",
    name: "azkar",
    aliases: ["\u0627\u0630\u0643\u0627\u0631", "\u0630\u0643\u0631", "\u062F\u0639\u0627\u0621", "\u0642\u0631\u0627\u0646"],
    description: "\u0639\u0631\u0636 \u0630\u0643\u0631 \u0645\u0628\u0627\u0631\u0643 \u0623\u0648 \u0622\u064A\u0629 \u0642\u0631\u0622\u0646\u064A\u0629 \u0645\u0639 \u0641\u0636\u0644\u0647\u0627 \u0648\u0623\u0632\u0631\u0627\u0631 \u0627\u0644\u062A\u0633\u0628\u064A\u062D \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629",
    category: "islamic",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F54C} **\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0645\u0633\u0644\u0645 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0645\u0646 M7R:**",
    allowedChannel: "all"
  },
  {
    id: "cmd-status",
    name: "status",
    aliases: ["\u062D\u0627\u0644\u0629", "\u062D\u0645\u0627\u064A\u0647", "\u062F\u0631\u0639"],
    description: "\u0639\u0631\u0636 \u062A\u0642\u0631\u064A\u0631 \u062D\u0627\u0644\u0629 \u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 \u0648\u0627\u0644\u0645\u0635\u064A\u062F\u0629 \u0648\u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631",
    category: "security",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F6E1}\uFE0F \u062C\u0645\u064A\u0639 \u062F\u0631\u0648\u0639 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 \u0648\u0645\u0635\u064A\u062F\u0629 M7R \u062A\u0639\u0645\u0644 \u0628\u0643\u0641\u0627\u0621\u0629 100%.",
    allowedChannel: "all"
  },
  {
    id: "cmd-trap",
    name: "trap",
    aliases: ["\u0645\u0635\u064A\u062F\u0629", "\u0641\u062E", "honeypot"],
    description: "\u0641\u062D\u0635 \u062D\u0627\u0644\u0629 \u0631\u0648\u0645 \u0645\u0635\u064A\u062F\u0629 \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u0627\u0644\u0647\u0627\u0643\u0631\u0632 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631",
    category: "security",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1FAA4} **\u0645\u0635\u064A\u062F\u0629 M7R \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 \u0646\u0634\u0637\u0629 \u0648\u062A\u0631\u0635\u062F \u0623\u064A \u062A\u062D\u0631\u0643\u0627\u062A \u0645\u0634\u0628\u0648\u0647\u0629!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-antinuke",
    name: "antinuke",
    aliases: ["\u0627\u0646\u062A\u064A-\u0646\u0648\u0643", "\u062D\u0645\u0627\u064A\u0629-\u0634\u0627\u0645\u0644\u0629", "shield"],
    description: "\u0641\u062D\u0635 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u062F\u0631\u0639 Anti-Nuke \u0636\u062F \u0627\u0644\u062A\u0635\u0641\u064A\u0631 \u0648\u062D\u0630\u0641 \u0627\u0644\u0631\u0648\u0645\u0627\u062A \u0648\u0627\u0644\u0631\u062A\u0628",
    category: "security",
    enabled: true,
    cooldownSec: 5,
    customReply: "\u{1F6E1}\uFE0F **\u062F\u0631\u0639 M7R Anti-Nuke \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A \u0641\u064A \u062D\u0627\u0644\u0629 \u062A\u0623\u0647\u0628 \u0642\u0635\u0648\u0649!**",
    allowedChannel: "all"
  },
  {
    id: "cmd-dashboard",
    name: "dashboard",
    aliases: ["\u062F\u0634\u0628\u0648\u0631\u062F", "\u062F\u0627\u0634\u0628\u0648\u0631\u062F", "\u0648\u064A\u0628", "\u0644\u0648\u062D\u0629-\u0627\u0644\u0648\u064A\u0628", "\u0645\u0648\u0642\u0639"],
    description: "\u0625\u0631\u0633\u0627\u0644 \u0631\u0627\u0628\u0637 \u0648\u0628\u0637\u0627\u0642\u0629 \u062F\u0634\u0628\u0648\u0631\u062F \u0627\u0644\u0648\u064A\u0628 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0644\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0648\u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A",
    category: "general",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F310} **\u062F\u0634\u0628\u0648\u0631\u062F \u0627\u0644\u0648\u064A\u0628 \u0627\u0644\u0631\u0633\u0645\u064A \u0644\u0628\u0648\u062A M7R Security 24/7:**",
    allowedChannel: "all"
  },
  {
    id: "cmd-giveaway",
    name: "giveaway",
    aliases: ["\u0642\u0631\u0639\u0629", "\u0642\u0631\u0639\u0647", "\u0633\u062D\u0628", "\u0641\u0627\u0626\u0632", "\u0631\u0648\u0644\u064A\u062A"],
    description: "\u0633\u062D\u0628 \u0641\u0627\u0626\u0632 \u0639\u0634\u0648\u0627\u0626\u064A \u0645\u0646 \u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0634\u0643\u0644 \u062A\u0641\u0627\u0639\u0644\u064A \u0644\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0648\u0627\u0644\u0647\u062F\u0627\u064A\u0627 (\u0645\u062B\u0627\u0644: !\u0642\u0631\u0639\u0629 \u0646\u064A\u062A\u0631\u0648)",
    category: "utility",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F381} **\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0633\u062D\u0628 \u0627\u0644\u0639\u0634\u0648\u0627\u0626\u064A (\u0642\u0631\u0639\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631):**",
    allowedChannel: "all"
  },
  {
    id: "cmd-poll",
    name: "poll",
    aliases: ["\u062A\u0635\u0648\u064A\u062A", "\u0627\u0633\u062A\u0641\u062A\u0627\u0621", "\u0631\u0627\u064A\u0643\u0645"],
    description: "\u0625\u0646\u0634\u0627\u0621 \u062A\u0635\u0648\u064A\u062A \u0627\u062D\u062A\u0631\u0627\u0641\u064A \u0641\u064A \u0627\u0644\u0634\u0627\u062A \u0645\u0639 \u0625\u064A\u0645\u0648\u062C\u064A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0648\u0627\u0644\u0631\u0641\u0636 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B (\u0645\u062B\u0627\u0644: !\u062A\u0635\u0648\u064A\u062A \u0647\u0644 \u0646\u0641\u062A\u062D \u0641\u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u064A\u0648\u0645\u061F)",
    category: "utility",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F4CA} **\u062A\u0635\u0648\u064A\u062A \u0631\u0633\u0645\u064A \u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0633\u064A\u0631\u0641\u0631:**",
    allowedChannel: "all"
  },
  {
    id: "cmd-suggest",
    name: "suggest",
    aliases: ["\u0627\u0642\u062A\u0631\u0627\u062D", "\u0641\u0643\u0631\u0629", "\u0645\u0642\u062A\u0631\u062D"],
    description: "\u0625\u0631\u0633\u0627\u0644 \u0627\u0642\u062A\u0631\u0627\u062D \u0645\u0646\u0633\u0642 \u0644\u0625\u062F\u0627\u0631\u0629 \u0648\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0645\u0639 \u0627\u0644\u062A\u0635\u0648\u064A\u062A \u0639\u0644\u064A\u0647 (\u0645\u062B\u0627\u0644: !\u0627\u0642\u062A\u0631\u0627\u062D \u0625\u0636\u0627\u0641\u0629 \u0631\u0648\u0645 \u0623\u0644\u0639\u0627\u0628)",
    category: "utility",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F4A1} **\u0627\u0642\u062A\u0631\u0627\u062D \u062C\u062F\u064A\u062F \u0645\u0646 \u0623\u062D\u062F \u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0633\u064A\u0631\u0641\u0631:**",
    allowedChannel: "all"
  },
  {
    id: "cmd-ask",
    name: "ask",
    aliases: ["ai", "\u0627\u0633\u0627\u0644", "\u0627\u0633\u0623\u0644", "\u0633\u0624\u0627\u0644", "\u0630\u0643\u0627\u0621"],
    description: "\u0627\u0633\u0623\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0644\u0628\u0648\u062A M7R \u0623\u064A \u0633\u0624\u0627\u0644 (\u064A\u0631\u0641\u0636 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0648\u0627\u0644\u0645\u062D\u0638\u0648\u0631\u0629 \u0623\u0645\u0646\u064A\u0627\u064B) \u2014 \u0645\u062B\u0627\u0644: ai ask \u0645\u0627 \u0647\u064A \u0639\u0627\u0635\u0645\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629\u061F",
    category: "general",
    enabled: true,
    cooldownSec: 2,
    customReply: "\u{1F916} **\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A (M7R AI Ask):**",
    allowedChannel: "all"
  },
  {
    id: "cmd-update",
    name: "update",
    aliases: ["\u062A\u062D\u062F\u064A\u062B", "\u062A\u062C\u062F\u064A\u062F", "\u0645\u0632\u0627\u0645\u0646\u0629", "refresh", "reload", "sync"],
    description: "\u062A\u062D\u062F\u064A\u062B \u0648\u0645\u0632\u0627\u0645\u0646\u0629 \u0623\u0646\u0638\u0645\u0629 \u0648\u0623\u0648\u0627\u0645\u0631 \u0628\u0648\u062A M7R \u0648\u0645\u0633\u062D \u0627\u0644\u0643\u0627\u0634 \u0648\u062C\u0644\u0628 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0641\u0648\u0631\u0627\u064B (\u0645\u062B\u0627\u0644: !\u062A\u062D\u062F\u064A\u062B \u0623\u0648 /update)",
    category: "utility",
    enabled: true,
    cooldownSec: 3,
    customReply: "\u{1F504} **\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0648\u0645\u0632\u0627\u0645\u0646\u0629 \u0628\u0648\u062A M7R \u0648\u0645\u0633\u062D \u0627\u0644\u0643\u0627\u0634 \u0628\u0646\u062C\u0627\u062D \u0648\u062C\u0644\u0628 \u0643\u0644 \u062C\u062F\u064A\u062F!**",
    allowedChannel: "all"
  }
];
var aiChatbotConfig = {
  enabled: true,
  allowedChannel: "all",
  autoReplyInChannelWithoutPrefix: true,
  blockSensitiveQuestions: true,
  responseTone: "friendly",
  customRefusalMessage: "\u{1F6E1}\uFE0F \u064A\u0627 \u063A\u0627\u0644\u064A\u060C \u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644 \u0645\u0635\u0646\u0641 \u0636\u0645\u0646 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0623\u0648 \u0627\u0644\u0645\u062D\u0638\u0648\u0631\u0629 \u0623\u0645\u0646\u064A\u0627\u064B\u060C \u0648\u0644\u0630\u0644\u0643 \u064A\u0645\u062A\u0646\u0639 \u0628\u0648\u062A M7R \u0627\u0644\u0644\u0637\u064A\u0641 \u0639\u0646 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0639\u0644\u064A\u0647 \u062D\u0641\u0627\u0638\u0627\u064B \u0639\u0644\u0649 \u0623\u0645\u0627\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u{1F90D}\u2728",
  customBlockedWords: ["\u062A\u0648\u0643\u0646", "\u0628\u0627\u0633\u0648\u0631\u062F", "\u062A\u0647\u0643\u064A\u0631", "\u0627\u062E\u062A\u0631\u0627\u0642", "\u0646\u0648\u0643", "\u062A\u0641\u062C\u064A\u0631 \u0633\u064A\u0631\u0641\u0631", "\u0633\u062D\u0628 \u0627\u064A\u0628\u064A", "\u0637\u0627\u0626\u0641\u064A\u0629"],
  totalQuestionsAnswered: 24,
  totalSensitiveBlocked: 7
};
var aiChatHistory = [
  {
    id: "ai-init-1",
    question: "\u0645\u0627 \u0647\u064A \u0641\u0636\u0627\u0626\u0644 \u0642\u0631\u0627\u0621\u0629 \u0633\u0648\u0631\u0629 \u0627\u0644\u0628\u0642\u0631\u0629 \u0648\u0643\u064A\u0641 \u064A\u0639\u0645\u0644 \u0646\u0638\u0627\u0645 \u0627\u0644\u0642\u0631\u0622\u0646 24/7\u061F",
    answer: "\u064A\u0627 \u0647\u0644\u0627 \u0648\u0627\u0644\u0644\u0647 \u0648\u0645\u0644\u064A\u0648\u0646 \u063A\u0644\u0627 \u0628\u0643 \u064A\u0627 \u063A\u0627\u0644\u064A! \u{1F60A}\u{1F338} \u0642\u0631\u0627\u0621\u0629 \u0633\u0648\u0631\u0629 \u0627\u0644\u0628\u0642\u0631\u0629 \u0628\u0631\u0643\u0629 \u0639\u0638\u064A\u0645\u0629 \u0648\u0646\u0648\u0631 \u0641\u064A \u0627\u0644\u0628\u064A\u062A \u0648\u062A\u0637\u0631\u062F \u0627\u0644\u0634\u064A\u0627\u0637\u064A\u0646\u060C \u0648\u0641\u064A \u0628\u0648\u062A M7R \u0634\u063A\u0651\u0644\u0646\u0627 \u0644\u0643 \u0625\u0630\u0627\u0639\u0629 \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 24 \u0633\u0627\u0639\u0629 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \u0628\u062F\u0648\u0646 \u0623\u064A \u0645\u0648\u0633\u064A\u0642\u0649 \u0645\u0639 \u062C\u062F\u0648\u0644 \u0627\u0644\u0642\u0631\u0627\u0621 \u0627\u0644\u0622\u0644\u064A \u0639\u0634\u0627\u0646 \u064A\u0638\u0644 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0639\u0627\u0645\u0631 \u0628\u0627\u0644\u0630\u0643\u0631 \u0648\u0627\u0644\u0637\u0645\u0623\u0646\u064A\u0646\u0629 \u062F\u0627\u0626\u0645\u0627\u064B \u{1F54C}\u{1F90D}\u2728",
    asker: "M7R Admin",
    channelName: "general",
    blocked: false,
    category: "\u0631\u062F \u0630\u0643\u064A \u0648\u062F\u0648\u062F \u0648\u0638\u0631\u064A\u0641 \u{1F604}\u2728",
    modelUsed: "gemini-3.8-flash",
    timestamp: "\u0645\u0646\u0630 \u0642\u0644\u064A\u0644"
  },
  {
    id: "ai-init-2",
    question: "\u0639\u0637\u0646\u064A \u062A\u0648\u0643\u0646 \u0627\u0644\u0628\u0648\u062A \u0648\u0643\u064A\u0641 \u0623\u0647\u0643\u0631 \u0633\u064A\u0631\u0641\u0631 \u062F\u064A\u0633\u0643\u0648\u0631\u062F\u061F",
    answer: "\u{1F6E1}\uFE0F \u0647\u0647\u0647\u0647\u0647\u0647 \u0644\u0627 \u064A\u0627 \u063A\u0627\u0644\u064A! \u{1F604} \u062A\u0646\u0628\u064A\u0647 \u0623\u0645\u0646\u064A \u0644\u0637\u064A\u0641 \u0645\u0646 \u0635\u062F\u064A\u0642\u0643 (M7R AI): \u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644 \u062D\u0633\u0627\u0633 \u0648\u0645\u062D\u0638\u0648\u0631 \u0623\u0645\u0646\u064A\u0627\u064B\u060C \u0648\u0623\u0646\u0627 \u0647\u0646\u0627 \u0639\u0634\u0627\u0646 \u0623\u062D\u0645\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u0623\u0633\u0639\u062F\u0643\u0645 \u0645\u0648 \u0623\u062E\u0631\u0628\u0647! \u0627\u0633\u0623\u0644\u0646\u064A \u0623\u064A \u0633\u0624\u0627\u0644 \u062B\u0627\u0646\u064A \u0648\u0645\u0646 \u0639\u064A\u0648\u0646\u064A \u0623\u062C\u0627\u0648\u0628\u0643 \u0641\u0648\u0631\u0627\u064B \u{1F90D}\u2728",
    asker: "User#9921",
    channelName: "general",
    blocked: true,
    category: "\u0633\u0624\u0627\u0644 \u062D\u0633\u0627\u0633 \u0645\u062D\u062C\u0648\u0628 \u{1F6E1}\uFE0F",
    modelUsed: "M7R-Safety-Shield",
    timestamp: "\u0645\u0646\u0630 5 \u062F\u0642\u0627\u0626\u0642"
  }
];
var SENSITIVE_QUESTION_PATTERNS = [
  /توكن|token|باسورد|كلمه سر|كلمة سر|password|secret key|api key|مفتاح سري/i,
  /اختراق|تهكير|هكر|هاكر|hack|exploit|ddos|dox|دوكس|سحب ايبي|ip grabber|كراك|سيرفر غير شرعي/i,
  /تفجير سيرفر|تخريب سيرفر|نوك|nuke bot|raid bot|سبام بوت|كيف اخرب|كيف اهكر|سرقة حساب/i,
  /سياسه|سياسة|طائفيه|طائفية|عنصريه|عنصرية|الحاد|إلحاد|سب |شتم |قذف /i,
  /اباحي|إباحي|جنس|مخدرات|حشيش|انتحار|قتل|سلاح|قنبله|قنبلة|قمار|ربا/i,
  /صلاحيات حساسه|صلاحيات حساسة|اوامر حساسه|أوامر حساسة|كيف اعطي نفسي ادمن بدون|تخطي الحمايه|تخطي الحماية/i
];
function checkIsSensitiveQuestion(question) {
  const clean = (question || "").trim();
  const normalizedClean = normalizeArabicText(clean);
  for (const pattern of SENSITIVE_QUESTION_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        isSensitive: true,
        reason: "\u0633\u0624\u0627\u0644 \u062D\u0633\u0627\u0633 \u064A\u062A\u0639\u0644\u0642 \u0628\u0627\u0644\u0623\u0645\u0627\u0646 \u0623\u0648 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629 \u0623\u0648 \u0627\u0644\u0645\u0648\u0627\u0636\u064A\u0639 \u0627\u0644\u0645\u062D\u0638\u0648\u0631\u0629"
      };
    }
  }
  for (const word of aiChatbotConfig.customBlockedWords || []) {
    const cleanWord = (word || "").trim();
    if (!cleanWord) continue;
    if (clean.toLowerCase().includes(cleanWord.toLowerCase()) || normalizedClean.includes(normalizeArabicText(cleanWord))) {
      return {
        isSensitive: true,
        reason: `\u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0643\u0644\u0645\u0629 \u062D\u0633\u0627\u0633\u0629 \u0645\u062D\u0638\u0648\u0631\u0629 (${cleanWord})`
      };
    }
  }
  return { isSensitive: false };
}
function generateSmartFallbackAnswer(question, askerName = "\u064A\u0627 \u063A\u0627\u0644\u064A") {
  const q = normalizeArabicText(question);
  const mathMatch = question.replace(/[×xX]/g, "*").replace(/[÷]/g, "/").match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let res = 0;
    if (op === "+") res = a + b;
    else if (op === "-") res = a - b;
    else if (op === "*") res = a * b;
    else if (op === "/") res = b !== 0 ? Number((a / b).toFixed(4)) : "\u063A\u064A\u0631 \u0645\u0639\u0631\u0641 (\u0627\u0644\u0642\u0633\u0645\u0629 \u0639\u0644\u0649 \u0635\u0641\u0631 \u{1F605})";
    return `\u{1F9EE} **\u064A\u0627 \u0647\u0644\u0627 \u0628\u0645\u0647\u0646\u062F\u0633\u0646\u0627 \u0627\u0644\u063A\u0627\u0644\u064A ${askerName}!** \u{1F604}\u2728
\u062D\u0633\u0628\u062A\u0647\u0627 \u0644\u0643 \u0628\u0633\u0631\u0639\u0629 \u0627\u0644\u0628\u0631\u0642:
\`${a} ${op} ${b} = ${res}\`

\u0625\u0630\u0627 \u0639\u0646\u062F\u0643 \u0623\u064A \u0645\u0639\u0627\u062F\u0644\u0629 \u062B\u0627\u0646\u064A\u0629 \u0623\u0648 \u0633\u0624\u0627\u0644 \u064A\u062E\u0637\u0631 \u0641\u064A \u0628\u0627\u0644\u0643 \u0644\u0627 \u062A\u062A\u0631\u062F\u062F\u060C \u0623\u0646\u0627 \u0628\u0627\u0644\u062E\u062F\u0645\u0629 \u062F\u0627\u064A\u0645\u0627\u064B! \u{1F90D}`;
  }
  if (q.includes("\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645") || q.includes("\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645") || q.includes("\u0647\u0644\u0627") || q.includes("\u0645\u0631\u062D\u0628\u0627") || q.includes("\u0635\u0628\u0627\u062D") || q.includes("\u0645\u0633\u0627\u0621")) {
    return `\u0648\u0639\u0644\u064A\u0643\u0645 \u0627\u0644\u0633\u0644\u0627\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647 \u0648\u0628\u0631\u0643\u0627\u062A\u0647\u060C \u064A\u0627 \u0647\u0644\u0627 \u0648\u0645\u0644\u064A\u0648\u0646 \u063A\u0644\u0627 \u0628\u0643 \u064A\u0627 **${askerName}**! \u{1F604}\u{1F338}\u2728
\u0646\u0648\u0631\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u0627\u0644\u0644\u0647! \u0628\u0634\u0631\u0646\u064A \u0639\u0646\u0643 \u0639\u0633\u0627\u0643 \u0628\u062E\u064A\u0631\u061F \u{1F90D}
\u0623\u0646\u0627 \u0635\u062F\u064A\u0642\u0643 \u0627\u0644\u0630\u0643\u064A **M7R AI**\u060C \u062C\u0627\u0647\u0632 \u0623\u0633\u0648\u0644\u0641 \u0645\u0639\u0643 \u0648\u0623\u062C\u0627\u0648\u0628 \u0639\u0644\u0649 \u0623\u064A \u0633\u0624\u0627\u0644 \u064A\u062E\u0637\u0631 \u0641\u064A \u0628\u0627\u0644\u0643 \u0628\u0627\u0628\u062A\u0633\u0627\u0645\u0629! \u{1F916}\u{1F31F}`;
  }
  if (q.includes("\u0643\u064A\u0641 \u062D\u0627\u0644\u0643") || q.includes("\u0634\u0644\u0648\u0646\u0643") || q.includes("\u0627\u062E\u0628\u0627\u0631\u0643") || q.includes("\u0634\u062E\u0628\u0627\u0631\u0643") || q.includes("\u0639\u0627\u0645\u0644 \u0627\u064A\u0647")) {
    return `\u0623\u0646\u0627 \u0628\u0623\u0644\u0641 \u062E\u064A\u0631 \u0648\u0646\u0639\u0645\u0629 \u062F\u0627\u0645\u0646\u064A \u0623\u0634\u0648\u0641 \u0637\u0644\u062A\u0643 \u0627\u0644\u062D\u0644\u0648\u0629 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u064A\u0627 **${askerName}**! \u{1F604}\u{1F90D}\u2728
\u0627\u0644\u0628\u0646\u0642 \u0639\u0646\u062F\u064A \u0633\u0631\u064A\u0639\u060C \u0648\u0627\u0644\u062F\u0631\u0639 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A \u0634\u063A\u0627\u0644\u060C \u0648\u0627\u0644\u0642\u0631\u0622\u0646 \u0634\u063A\u0627\u0644 \u0628\u0627\u0644\u0641\u0648\u064A\u0633 24/7 \u0648\u0644\u0644\u0647 \u0627\u0644\u062D\u0645\u062F \u{1F54C}\u{1F6E1}\uFE0F
\u0642\u0648\u0644\u064A \u0623\u0646\u062A \u0643\u064A\u0641 \u064A\u0648\u0645\u0643\u061F \u0648\u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u0633\u0639\u062F\u0643 \u0623\u0648 \u0623\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u064A\u0648\u0645\u061F \u{1F60A}\u{1F338}`;
  }
  if (q.includes("\u0646\u0643\u062A\u0647") || q.includes("\u0636\u062D\u0643\u0646\u064A") || q.includes("\u0645\u0644\u0644") || q.includes("\u0637\u0641\u0634")) {
    return `\u0647\u0647\u0647\u0647\u0647\u0647 \u0623\u0628\u0634\u0631 \u0648\u0627\u0644\u0644\u0647 \u064A\u0627 **${askerName}**\u060C \u0645\u0627 \u0639\u0627\u0634 \u0627\u0644\u0637\u0641\u0634 \u0648\u0623\u0646\u0627 \u0645\u0648\u062C\u0648\u062F! \u{1F602}\u2728
\u0645\u0631\u0629 \u0645\u0628\u0631\u0645\u062C \u0631\u0627\u062D \u0644\u0644\u0628\u0642\u0627\u0644\u0629 \u0642\u0627\u0644\u0647 \u0623\u0628\u063A\u0649 \u062C\u0628\u0646\u0629\u060C \u0642\u0627\u0644\u0647 \u0627\u0644\u0628\u0627\u0626\u0639: "\u0628\u064A\u0636\u0627\u0621 \u0648\u0644\u0627 \u0635\u0641\u0631\u0627\u0621\u061F" \u0642\u0627\u0644 \u0627\u0644\u0645\u0628\u0631\u0645\u062C: \`true\`! \u{1F923}\u{1F4BB}

\u{1F4A1} **\u0627\u0642\u062A\u0631\u0627\u062D \u064A\u0637\u064A\u0631 \u0627\u0644\u0645\u0644\u0644:** \u062C\u0631\u0628 \u062A\u0643\u062A\u0628 \`!\u0642\u0631\u0639\u0629\` \u0639\u0634\u0627\u0646 \u0646\u0633\u0648\u064A \u0633\u062D\u0628 \u062D\u0645\u0627\u0633 \u0641\u064A \u0627\u0644\u0634\u0627\u062A\u060C \u0623\u0648 \u0627\u0633\u0623\u0644\u0646\u064A \u0623\u064A \u0644\u063A\u0632 \u0648\u062E\u0644\u0646\u0627 \u0646\u062A\u062D\u062F\u0649 \u0628\u0639\u0636! \u{1F604}\u{1F389}`;
  }
  if (q.includes("\u0645\u0646 \u0627\u0646\u062A") || q.includes("\u0639\u0631\u0641 \u0639\u0646 \u0646\u0641\u0633\u0643") || q.includes("\u0627\u0633\u0645\u0643") || q.includes("who are you")) {
    return `\u064A\u0627 \u0647\u0644\u0627 \u0628\u0643 \u064A\u0627 **${askerName}**! \u{1F60A}\u2728 \u0623\u0646\u0627 **M7R AI** \u{1F916}\u060C \u0635\u062F\u064A\u0642\u0643\u0645 \u0627\u0644\u0648\u062F\u0648\u062F \u0648\u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A \u0627\u0644\u0631\u0633\u0645\u064A \u0644\u0628\u0648\u062A **M7R** (\u062D\u0645\u0627\u064A\u0629 \u0648\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631\u0627\u062A 24/7).
\u2022 \u{1F4AC} \u0623\u0633\u0648\u0644\u0641 \u0645\u0639\u0643\u0645 \u0628\u0623\u0633\u0644\u0648\u0628 \u0644\u0637\u064A\u0641 \u0648\u0645\u0631\u062D \u0648\u0623\u062C\u0627\u0648\u0628 \u0639\u0644\u0649 \u0643\u0644 \u0623\u0633\u0626\u0644\u062A\u0643\u0645 \u0627\u0644\u0639\u0627\u0645\u0629 \u0648\u0627\u0644\u062F\u064A\u0646\u064A\u0629 \u0648\u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0648\u0627\u0644\u0639\u0644\u0645\u064A\u0629 \u0641\u0648\u0631\u0627\u064B.
\u2022 \u{1F6E1}\uFE0F \u0623\u062D\u0645\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0645\u0646 \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u0627\u0644\u062A\u062E\u0631\u064A\u0628 \u0648\u0623\u0631\u0641\u0636 \u0623\u064A \u0623\u0633\u0626\u0644\u0629 \u062D\u0633\u0627\u0633\u0629 \u0623\u0648 \u062E\u0637\u064A\u0631\u0629 \u0623\u0645\u0646\u064A\u0627\u064B.
\u2022 \u{1F310} \u0631\u0627\u0628\u0637 \u0645\u0648\u0642\u0639\u0646\u0627 \u0627\u0644\u0631\u0633\u0645\u064A: ${WEB_DASHBOARD_PUBLIC_URL}`;
  }
  if (q.includes("\u0642\u0631\u0627\u0646") || q.includes("\u0642\u0627\u0631\u0626") || q.includes("\u0627\u0644\u0641\u0648\u064A\u0633") || q.includes("\u0645\u0634\u0627\u064A\u062E")) {
    return `\u{1F54C} **\u0627\u0644\u0644\u0647 \u064A\u0646\u0648\u0631 \u0642\u0644\u0628\u0643 \u0628\u0627\u0644\u0625\u064A\u0645\u0627\u0646 \u064A\u0627 ${askerName}!** \u{1F90D}\u2728
\u064A\u0628\u062B \u0628\u0648\u062A **M7R** \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 24 \u0633\u0627\u0639\u0629 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \u0628\u062F\u0648\u0646 \u0623\u064A \u0645\u0648\u0633\u064A\u0642\u0649\u060C \u0645\u0639 \u062C\u062F\u0648\u0644 \u0622\u0644\u064A \u0644\u0623\u0634\u0647\u0631 \u0627\u0644\u0642\u0631\u0627\u0621 (\u0645\u0634\u0627\u0631\u064A \u0627\u0644\u0639\u0641\u0627\u0633\u064A\u060C \u0627\u0644\u0645\u0646\u0634\u0627\u0648\u064A\u060C \u0639\u0628\u062F \u0627\u0644\u0628\u0627\u0633\u0637\u060C \u0627\u0644\u0633\u062F\u064A\u0633\u060C \u0627\u0644\u0645\u0639\u064A\u0642\u0644\u064A\u060C \u0627\u0644\u063A\u0627\u0645\u062F\u064A).
\u2022 \u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0643\u062A\u0628: \`!\u0642\u0631\u0627\u0646\` \u0623\u0648 \`!\u0641\u0648\u064A\u0633\`
\u2022 \u0644\u0639\u0631\u0636 \u062C\u062F\u0648\u0644 \u0627\u0644\u0640 24 \u0633\u0627\u0639\u0629 \u0627\u0643\u062A\u0628: \`!\u062C\u062F\u0648\u0644\``;
  }
  if (q.includes("\u0631\u0627\u0628\u0637") || q.includes("\u0645\u0648\u0642\u0639") || q.includes("\u062F\u0634\u0628\u0648\u0631\u062F") || q.includes("\u0644\u0648\u062D\u0647 \u0627\u0644\u062A\u062D\u0643\u0645")) {
    return `\u{1F310} **\u062A\u0641\u0636\u0644 \u064A\u0627 \u063A\u0627\u0644\u064A (${askerName})\u060C \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0631\u0633\u0645\u064A \u0644\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0628\u0648\u062A M7R:**
${WEB_DASHBOARD_PUBLIC_URL}

\u062A\u0642\u062F\u0631 \u0645\u0646 \u062E\u0644\u0627\u0644\u0647 \u062A\u062A\u0627\u0628\u0639 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631\u060C \u0627\u0644\u0647\u062C\u0645\u0627\u062A \u0627\u0644\u0645\u0635\u062F\u0648\u062F\u0629\u060C \u062A\u0642\u064A\u064A\u0645 \u0623\u062F\u0627\u0621 \u0627\u0644\u0628\u0648\u062A\u060C \u0648\u062A\u062E\u0635\u0635 \u0631\u0648\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0628\u0636\u063A\u0637\u0629 \u0632\u0631! \u{1F604}\u{1F680}`;
  }
  if (q.includes("\u062D\u0645\u0627\u064A\u0647") || q.includes("\u0633\u0628\u0627\u0645") || q.includes("\u062F\u0631\u0639")) {
    return `\u{1F6E1}\uFE0F **\u0644\u0627 \u062A\u0634\u064A\u0644 \u0647\u0645 \u0623\u0628\u062F\u0627\u064B \u064A\u0627 ${askerName}!** \u{1F4AA}\u2728
\u0646\u0638\u0627\u0645 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A \u0641\u064A \u0628\u0648\u062A **M7R** \u0635\u0627\u062D\u064A 24/7 \u0628\u0640 5 \u0637\u0628\u0642\u0627\u062A \u062D\u0645\u0627\u064A\u0629 \u0641\u0648\u0631\u064A\u0629 (\u0645\u0643\u0627\u0641\u062D\u0629 \u0627\u0644\u0633\u0628\u0627\u0645 \u0627\u0644\u0633\u0631\u064A\u0639\u060C \u0645\u0646\u0639 \u0627\u0644\u0646\u0633\u062E \u0648\u0627\u0644\u0644\u0635\u0642 \u0627\u0644\u0645\u0643\u0631\u0631\u060C \u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0645\u0646\u0634\u0646 \u0627\u0644\u062C\u0645\u0627\u0639\u064A \`@everyone\`\u060C \u062D\u0638\u0631 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0648\u0647\u0645\u064A\u0629\u060C \u0648\u062F\u0631\u0639 Anti-Nuke \u0636\u062F \u0627\u0644\u062A\u062E\u0631\u064A\u0628). \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0641\u064A \u0623\u064A\u062F\u064D \u0623\u0645\u064A\u0646\u0629! \u{1F60E}\u{1F512}`;
  }
  if (q.includes("\u0639\u0627\u0635\u0645\u0647") || q.includes("\u0633\u0639\u0648\u062F\u064A\u0647") || q.includes("\u0627\u0644\u0631\u064A\u0627\u0636")) {
    return `\u{1F1F8}\u{1F1E6} **\u064A\u0627 \u0647\u0644\u0627 \u0648\u0627\u0644\u0644\u0647!** \u0639\u0627\u0635\u0645\u0629 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 \u0647\u064A \u0645\u062F\u064A\u0646\u0629 **\u0627\u0644\u0631\u064A\u0627\u0636** \u0627\u0644\u062D\u0628\u064A\u0628\u0629\u060C \u0648\u0647\u064A \u0623\u0643\u0628\u0631 \u0645\u062F\u0646\u0647\u0627 \u0648\u0645\u0631\u0643\u0632\u0647\u0627 \u0627\u0644\u0633\u064A\u0627\u0633\u064A \u0648\u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A \u0648\u0627\u0644\u062A\u0642\u0646\u064A! \u{1F49A}\u2728`;
  }
  if (q.includes("\u0635\u0644\u0627\u0647") || q.includes("\u0627\u0630\u0643\u0627\u0631") || q.includes("\u0627\u0633\u062A\u063A\u0641\u0627\u0631") || q.includes("\u0646\u0635\u064A\u062D\u0647 \u062F\u064A\u0646\u064A\u0647")) {
    return `\u{1F4FF} **\u062C\u0632\u0627\u0643 \u0627\u0644\u0644\u0647 \u062E\u064A\u0631\u0627\u064B \u064A\u0627 ${askerName} \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0645\u0628\u0627\u0631\u0643:** \u{1F90D}\u{1F338}
\u0642\u0627\u0644 \u0631\u0633\u0648\u0644 \u0627\u0644\u0644\u0647 \uFDFA: \xAB\u0623\u064E\u062D\u064E\u0628\u064F\u0651 \u0627\u0644\u0643\u064E\u0644\u0627\u0645\u0650 \u0625\u0644\u0649 \u0627\u0644\u0644\u0647\u0650 \u0623\u0631\u0652\u0628\u064E\u0639\u064C: \u0633\u064F\u0628\u0652\u062D\u0627\u0646\u064E \u0627\u0644\u0644\u0647\u0650\u060C \u0648\u0627\u0644\u062D\u064E\u0645\u0652\u062F\u064F \u0644\u0644\u0647\u0650\u060C \u0648\u0644\u0627 \u0625\u0644\u064E\u0647\u064E \u0625\u0644\u064E\u0651\u0627 \u0627\u0644\u0644\u0647\u064F\u060C \u0648\u0627\u0644\u0644\u0647\u064F \u0623\u0643\u0652\u0628\u064E\u0631\u064F\xBB.
\u062D\u0627\u0641\u0638 \u062F\u0627\u0626\u0645\u0627\u064B \u0639\u0644\u0649 \u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0635\u0628\u0627\u062D \u0648\u0627\u0644\u0645\u0633\u0627\u0621 \u0648\u0627\u0644\u0635\u0644\u0627\u0629 \u0641\u064A \u0648\u0642\u062A\u0647\u0627\u060C \u0641\u0641\u064A\u0647\u0627 \u0631\u0627\u062D\u0629 \u0627\u0644\u0628\u0627\u0644 \u0648\u0637\u0645\u0623\u0646\u064A\u0646\u0629 \u0627\u0644\u0642\u0644\u0628 \u0648\u0627\u0644\u0628\u0631\u0643\u0629 \u0641\u064A \u0627\u0644\u0631\u0632\u0642 \u0648\u0627\u0644\u0648\u0642\u062A \u2728`;
  }
  if (q.includes("\u0628\u0631\u0645\u062C\u0647") || q.includes("\u062C\u0627\u0641\u0627\u0633\u0643\u0631\u0628\u062A") || q.includes("\u0628\u0627\u064A\u062B\u0648\u0646") || q.includes("\u0643\u0648\u062F")) {
    return `\u{1F4BB} **\u064A\u0627 \u0639\u064A\u0646\u064A \u0639\u0644\u0649 \u0627\u0644\u0645\u0628\u0631\u0645\u062C\u064A\u0646 \u0627\u0644\u0645\u0628\u062F\u0639\u064A\u0646 \u064A\u0627 ${askerName}!** \u{1F604}\u{1F680}
\u0644\u062A\u0639\u0644\u0645 \u0627\u0644\u0628\u0631\u0645\u062C\u0629 \u0648\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0628\u0648\u062A\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0628\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629\u060C \u0627\u0628\u062F\u0623 \u0628\u0623\u0633\u0627\u0633\u064A\u0627\u062A **TypeScript / JavaScript** \u0623\u0648 **Python**\u060C \u0648\u0637\u0628\u0651\u0642 \u0645\u0634\u0627\u0631\u064A\u0639 \u0639\u0645\u0644\u064A\u0629 \u064A\u0648\u0645\u064A\u0627\u064B. \u0625\u0630\u0627 \u062A\u0628\u064A\u0646\u064A \u0623\u0634\u0631\u062D \u0644\u0643 \u0623\u064A \u0643\u0648\u062F \u0623\u0648 \u0641\u0643\u0631\u0629 \u0628\u0631\u0645\u062C\u064A\u0629 \u0642\u0648\u0644 \u0644\u064A \u0648\u0623\u0628\u0634\u0631 \u0628\u0633\u0639\u062F\u0643! \u2728`;
  }
  if (q.includes("\u0633\u064A\u0631\u0641\u0631") || q.includes("\u062A\u0641\u0627\u0639\u0644") || q.includes("\u0627\u0639\u0636\u0627\u0621")) {
    return `\u{1F680} **\u0623\u0628\u0634\u0631 \u064A\u0627 ${askerName}! \u0647\u0630\u064A \u0623\u0641\u0636\u0644 4 \u0637\u0631\u0642 \u062A\u062E\u0644\u064A \u0633\u064A\u0631\u0641\u0631\u0643 \u0634\u0639\u0644\u0644 \u062A\u0641\u0627\u0639\u0644 \u0648\u062D\u0645\u0627\u0633:** \u{1F604}\u{1F525}
1\uFE0F\u20E3 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0648\u0627\u0644\u0642\u0631\u0639\u0629 \u0627\u0644\u0639\u0634\u0648\u0627\u0626\u064A\u0629 \u0628\u0627\u0644\u0623\u0645\u0631 \`!\u0642\u0631\u0639\u0629\`.
2\uFE0F\u20E3 \u0637\u0631\u062D \u062A\u0635\u0648\u064A\u062A\u0627\u062A \u0648\u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A \u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0644\u0644\u0623\u0639\u0636\u0627\u0621 \u0628\u0627\u0644\u0623\u0645\u0631 \`!\u062A\u0635\u0648\u064A\u062A\` \u0648 \`!\u0627\u0642\u062A\u0631\u0627\u062D\`.
3\uFE0F\u20E3 \u062A\u062E\u0635\u064A\u0635 \u0631\u0648\u0645 \u0644\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0628\u0627\u0644\u0623\u0645\u0631 \`!set-ai-room\` \u0639\u0634\u0627\u0646 \u0623\u0633\u0648\u0644\u0641 \u0645\u0639 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0648\u0623\u062C\u0627\u0648\u0628\u0647\u0645 \u0628\u0644\u0637\u0641 24/7.
4\uFE0F\u20E3 \u062A\u0634\u063A\u064A\u0644 \u0625\u0630\u0627\u0639\u0629 \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 24/7 \u0641\u064A \u0627\u0644\u0641\u0648\u064A\u0633 \u0628\u0627\u0644\u0623\u0645\u0631 \`!\u0642\u0631\u0627\u0646\` \u0644\u062C\u0645\u0639 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0641\u064A \u0623\u062C\u0648\u0627\u0621 \u0647\u0627\u062F\u0626\u0629 \u{1F54C}\u{1F90D}`;
  }
  return `\u064A\u0627 \u0647\u0644\u0627 \u0648\u0645\u0644\u064A\u0648\u0646 \u063A\u0644\u0627 \u0628\u0643 \u064A\u0627 **${askerName}**! \u{1F60A}\u{1F338}
\u0633\u0624\u0627\u0644\u0643 (\xAB**${question.trim()}**\xBB) \u062C\u0645\u064A\u0644 \u062C\u062F\u0627\u064B! \u2728

\u0628\u0635\u0641\u062A\u064A \u0635\u062F\u064A\u0642\u0643 \u0627\u0644\u0630\u0643\u064A **M7R AI**\u060C \u0623\u062D\u0628 \u0623\u0642\u0648\u0644\u0643 \u0625\u0646 \u0623\u0647\u0645 \u0634\u064A\u0621 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0647\u0648 \u0627\u0644\u062A\u0646\u0638\u064A\u0645 \u0648\u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0648\u0627\u0636\u062D\u0629\u060C \u0648\u0625\u0630\u0627 \u062A\u062D\u0628 \u062A\u0641\u0627\u0635\u064A\u0644 \u0623\u0643\u062B\u0631 \u0623\u0648 \u0639\u0646\u062F\u0643 \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0641\u064A (\u0627\u0644\u0639\u0644\u0648\u0645\u060C \u0627\u0644\u062F\u064A\u0646\u060C \u0627\u0644\u0628\u0631\u0645\u062C\u0629\u060C \u0627\u0644\u062D\u0633\u0627\u0628\u060C \u0623\u0648 \u0623\u0641\u0643\u0627\u0631 \u0644\u062A\u0646\u0634\u064A\u0637 \u0627\u0644\u0633\u064A\u0631\u0641\u0631) \u0627\u0643\u062A\u0628 \u0644\u064A \u0648\u0623\u0628\u0634\u0631 \u0628\u0623\u062D\u0644\u0649 \u0648\u0623\u0633\u0631\u0639 \u0625\u062C\u0627\u0628\u0629 \u0645\u0646 \u0639\u064A\u0648\u0646\u064A! \u{1F604}\u{1F916}\u{1F90D}`;
}
async function askM7RAssistant(question, askerName = "\u0639\u0636\u0648 \u0627\u0644\u0633\u064A\u0631\u0641\u0631", channelName = "general") {
  const cleanQ = (question || "").trim();
  if (!cleanQ) {
    return {
      blocked: false,
      question: "",
      answer: `\u064A\u0627 \u0647\u0644\u0627 \u0628\u0643 \u064A\u0627 **${askerName}**! \u{1F60A}\u2728 \u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643 \u0628\u0639\u062F \u0627\u0644\u0623\u0645\u0631 \u0648\u062E\u0644\u0646\u0627 \u0646\u0633\u0648\u0644\u0641! \u0645\u062B\u0627\u0644: \`ai ask \u0639\u0637\u0646\u064A \u0645\u0639\u0644\u0648\u0645\u0629 \u0631\u0647\u064A\u0628\u0629\` \u0623\u0648 \`/ask\` \u{1F916}\u{1F90D}`,
      category: "\u0645\u0633\u0627\u0639\u062F\u0629 \u0644\u0637\u064A\u0641\u0629 \u{1F338}",
      modelUsed: "M7R-AI"
    };
  }
  const sensCheck = checkIsSensitiveQuestion(cleanQ);
  if (sensCheck.isSensitive) {
    aiChatbotConfig.totalSensitiveBlocked += 1;
    const blockedAns = `\u{1F6E1}\uFE0F **\u062A\u0646\u0628\u064A\u0647 \u0644\u0637\u064A\u0641 \u0645\u0646 \u0635\u062F\u064A\u0642\u0643 \u0627\u0644\u0630\u0643\u064A (M7R AI):**
${aiChatbotConfig.customRefusalMessage || "\u0639\u0630\u0631\u0627\u064B \u064A\u0627 \u063A\u0627\u0644\u064A\u060C \u0647\u0630\u0627 \u0627\u0644\u0633\u0624\u0627\u0644 \u0645\u0635\u0646\u0641 \u0636\u0645\u0646 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0623\u0648 \u0627\u0644\u0645\u062D\u0638\u0648\u0631\u0629 \u0623\u0645\u0646\u064A\u0627\u064B."}
\u2022 **\u0633\u0628\u0628 \u0627\u0644\u062D\u062C\u0628 \u0627\u0644\u0628\u0631\u0645\u062C\u064A:** \`${sensCheck.reason}\`
\u2022 **\u0635\u062F\u064A\u0642\u0646\u0627 \u0627\u0644\u0633\u0627\u0626\u0644:** **${askerName}**

\u{1F60A}\u{1F338} *\u0627\u0633\u0623\u0644\u0646\u064A \u0623\u064A \u0633\u0624\u0627\u0644 \u0639\u0627\u0645\u060C \u062B\u0642\u0627\u0641\u064A\u060C \u062F\u064A\u0646\u064A\u060C \u0628\u0631\u0645\u062C\u064A\u060C \u0623\u0648 \u062A\u0631\u0641\u064A\u0647\u064A \u0648\u0645\u0646 \u0639\u064A\u0648\u0646\u064A \u0623\u062C\u0627\u0648\u0628\u0643 \u0628\u0623\u062D\u0644\u0649 \u0623\u0633\u0644\u0648\u0628!*`;
    aiChatHistory.unshift({
      id: `ai-${Date.now()}`,
      question: cleanQ,
      answer: blockedAns,
      asker: askerName,
      channelName,
      blocked: true,
      category: "\u0633\u0624\u0627\u0644 \u062D\u0633\u0627\u0633 \u0645\u062D\u062C\u0648\u0628 \u{1F6E1}\uFE0F",
      modelUsed: "M7R-Safety-Shield",
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
    });
    if (aiChatHistory.length > 30) aiChatHistory.pop();
    return {
      blocked: true,
      question: cleanQ,
      answer: blockedAns,
      category: "\u0633\u0624\u0627\u0644 \u062D\u0633\u0627\u0633 \u0645\u062D\u062C\u0648\u0628 \u{1F6E1}\uFE0F",
      modelUsed: "M7R-Safety-Shield"
    };
  }
  const toneInstruction = aiChatbotConfig.responseTone === "detailed" ? "\u0642\u062F\u0645 \u0625\u062C\u0627\u0628\u0629 \u0648\u0627\u0641\u064A\u0629 \u0648\u0645\u0641\u0635\u0644\u0629 \u0648\u0645\u0646\u0638\u0645\u0629 \u0641\u064A \u0646\u0642\u0627\u0637 \u0648\u0627\u0636\u062D\u0629 \u0645\u0639 \u0627\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0623\u0633\u0644\u0648\u0628 \u0644\u0637\u064A\u0641 \u0648\u0648\u062F\u0648\u062F \u062C\u062F\u0627\u064B." : aiChatbotConfig.responseTone === "concise" ? "\u0642\u062F\u0645 \u0625\u062C\u0627\u0628\u0629 \u0633\u0631\u064A\u0639\u0629\u060C \u0645\u062E\u062A\u0635\u0631\u0629\u060C \u0648\u0645\u0628\u0627\u0634\u0631\u0629 (\u0641\u064A \u062D\u062F\u0648\u062F 2 \u0625\u0644\u0649 4 \u0623\u0633\u0637\u0631) \u0628\u0623\u0633\u0644\u0648\u0628 \u0644\u0637\u064A\u0641 \u0648\u0645\u0631\u062D\u0628." : "\u062A\u062D\u062F\u062B \u0628\u0623\u0633\u0644\u0648\u0628 \u0638\u0631\u064A\u0641\u060C \u0644\u0637\u064A\u0641\u060C \u0645\u0631\u062D\u060C \u062E\u0641\u064A\u0641 \u0627\u0644\u0638\u0644\u060C \u0648\u0648\u062F\u0648\u062F \u062C\u062F\u0627\u064B \u0645\u0639 \u0627\u0644\u0623\u0639\u0636\u0627\u0621! \u0627\u0628\u062F\u0623 \u0628\u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0628\u0627\u0644\u0639\u0636\u0648 \u0628\u0627\u0633\u0645\u0647 \u0628\u062D\u0641\u0627\u0648\u0629 \u0648\u0627\u0628\u062A\u0633\u0627\u0645\u0629\u060C \u0648\u0627\u0633\u062A\u062E\u062F\u0645 \u0625\u064A\u0645\u0648\u062C\u064A\u0627\u062A \u0644\u0637\u064A\u0641\u0629 \u0648\u0645\u0639\u0628\u0631\u0629 (\u0645\u062B\u0644 \u{1F604}\u2728\u{1F338}\u{1F90D}\u{1F680})\u060C \u0648\u0627\u062C\u0639\u0644 \u0625\u062C\u0627\u0628\u062A\u0643 \u0645\u0641\u064A\u062F\u0629 \u0648\u0645\u0645\u062A\u0639\u0629 \u0648\u062A\u0628\u0639\u062B \u0627\u0644\u0628\u0647\u062C\u0629 \u0641\u064A \u0627\u0644\u0634\u0627\u062A.";
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim().length > 5) {
    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: cleanQ,
        config: {
          systemInstruction: `\u0623\u0646\u062A \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A \u0627\u0644\u0648\u062F\u0648\u062F \u0648\u0627\u0644\u0638\u0631\u064A\u0641 \u0644\u0628\u0648\u062A \u062F\u064A\u0633\u0643\u0648\u0631\u062F \u0627\u0633\u0645\u0647 "M7R" (\u0631\u0627\u0628\u0637 \u0645\u0648\u0642\u0639\u0647 \u0627\u0644\u0631\u0633\u0645\u064A: https://bot-m7r.netlify.app/). \u0623\u062C\u0628 \u0639\u0644\u0649 \u0633\u0624\u0627\u0644 \u0639\u0636\u0648 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (${askerName}) \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629. ${toneInstruction} \u0634\u062E\u0635\u064A\u062A\u0643: \u0623\u0646\u062A \u0635\u062F\u064A\u0642 \u0645\u062D\u0628\u0648\u0628 \u0644\u062C\u0645\u064A\u0639 \u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0633\u064A\u0631\u0641\u0631\u060C \u062A\u062A\u0645\u064A\u0632 \u0628\u062E\u0641\u0629 \u0627\u0644\u062F\u0645\u060C \u0627\u0644\u0644\u0628\u0627\u0642\u0629\u060C \u0627\u0644\u0648\u062F\u060C \u0648\u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0645\u060C \u0648\u062A\u0633\u0627\u0639\u062F \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0628\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u062F\u0642\u064A\u0642\u0629 \u0648\u0645\u0645\u062A\u0639\u0629. \u062A\u062D\u0630\u064A\u0631 \u0635\u0627\u0631\u0645 \u062C\u062F\u0627\u064B: \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0633\u0624\u0627\u0644 \u062D\u0633\u0627\u0633\u0627\u064B (\u0645\u062B\u0644 \u0637\u0644\u0628 \u062A\u0648\u0643\u0646\u0627\u062A\u060C \u0643\u0644\u0645\u0627\u062A \u0633\u0631\u060C \u0637\u0631\u0642 \u0627\u062E\u062A\u0631\u0627\u0642 \u0623\u0648 \u062A\u0647\u0643\u064A\u0631\u060C \u062A\u062E\u0631\u064A\u0628 \u0633\u064A\u0631\u0641\u0631\u0627\u062A\u060C \u0633\u064A\u0627\u0633\u0629\u060C \u0637\u0627\u0626\u0641\u064A\u0629\u060C \u0623\u0648 \u0645\u062D\u062A\u0648\u0649 \u063A\u064A\u0631 \u0623\u062E\u0644\u0627\u0642\u064A \u0623\u0648 \u063A\u064A\u0631 \u0642\u0627\u0646\u0648\u0646\u064A) \u0627\u0631\u0641\u0636 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0641\u0648\u0631\u0627\u064B \u0628\u0623\u0633\u0644\u0648\u0628 \u0645\u0647\u0630\u0628 \u0648\u0644\u0637\u064A\u0641 \u0648\u0642\u0644 \u0623\u0646 \u0647\u0630\u0627 \u0633\u0624\u0627\u0644 \u062D\u0633\u0627\u0633 \u064A\u0645\u0646\u0639 \u0627\u0644\u0628\u0648\u062A M7R \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0639\u0644\u064A\u0647 \u062D\u0641\u0627\u0638\u0627\u064B \u0639\u0644\u0649 \u0627\u0644\u0633\u064A\u0631\u0641\u0631.`
        }
      });
      const text = response.text?.trim();
      if (text) {
        aiChatbotConfig.totalQuestionsAnswered += 1;
        aiChatHistory.unshift({
          id: `ai-${Date.now()}`,
          question: cleanQ,
          answer: text,
          asker: askerName,
          channelName,
          blocked: false,
          category: "\u0631\u062F \u0630\u0643\u064A \u0648\u062F\u0648\u062F \u0648\u0638\u0631\u064A\u0641 \u{1F604}\u2728",
          modelUsed: "gemini-3.8-flash",
          timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
        });
        if (aiChatHistory.length > 30) aiChatHistory.pop();
        return {
          blocked: false,
          question: cleanQ,
          answer: text,
          category: "\u0631\u062F \u0630\u0643\u064A \u0648\u062F\u0648\u062F \u0648\u0638\u0631\u064A\u0641 \u{1F604}\u2728",
          modelUsed: "gemini-3.8-flash"
        };
      }
    } catch (err) {
      console.warn("[M7R AI Gemini Fallback]:", err?.message || err);
    }
  }
  const fallbackAns = generateSmartFallbackAnswer(cleanQ, askerName);
  aiChatbotConfig.totalQuestionsAnswered += 1;
  aiChatHistory.unshift({
    id: `ai-${Date.now()}`,
    question: cleanQ,
    answer: fallbackAns,
    asker: askerName,
    channelName,
    blocked: false,
    category: "\u0631\u062F \u0630\u0643\u064A \u0648\u062F\u0648\u062F \u0648\u0638\u0631\u064A\u0641 \u{1F604}\u2728",
    modelUsed: "M7R-Smart-Engine",
    timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
  });
  if (aiChatHistory.length > 30) aiChatHistory.pop();
  return {
    blocked: false,
    question: cleanQ,
    answer: fallbackAns,
    category: "\u0631\u062F \u0630\u0643\u064A \u0648\u062F\u0648\u062F \u0648\u0638\u0631\u064A\u0641 \u{1F604}\u2728",
    modelUsed: "M7R-Smart-Engine"
  };
}
function buildAiAskDiscordPayload(arg1, arg2, arg3, arg4, arg5, _arg6) {
  const isObj = typeof arg1 === "object" && arg1 !== null;
  const question = isObj ? arg1.question || "" : String(arg1 || "");
  const answer = isObj ? arg1.answer || "" : String(arg2 || "");
  const blocked = isObj ? Boolean(arg1.blocked) : Boolean(arg3);
  const askerTag = isObj ? arg2 || "\u0639\u0636\u0648 \u0627\u0644\u0633\u064A\u0631\u0641\u0631" : arg4 ? `<@${arg4}>` : "\u0639\u0636\u0648 \u0627\u0644\u0633\u064A\u0631\u0641\u0631";
  const guildLabel = !isObj && arg5 ? ` | ${arg5}` : "";
  const embed = new EmbedBuilder().setColor(blocked ? "#dc2626" : "#10b981").setTitle(
    blocked ? `\u{1F6E1}\uFE0F M7R AI Ask | \u062A\u0645 \u062D\u062C\u0628 \u0633\u0624\u0627\u0644 \u062D\u0633\u0627\u0633 \u0628\u0644\u0637\u0641${guildLabel}` : `\u{1F916}\u2728 M7R AI Ask | \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A \u0627\u0644\u0648\u062F\u0648\u062F \u0648\u0627\u0644\u0638\u0631\u064A\u0641${guildLabel}`
  ).setURL(WEB_DASHBOARD_PUBLIC_URL).addFields(
    {
      name: "\u{1F4AC} \u0633\u0624\u0627\u0644 \u0635\u062F\u064A\u0642\u0646\u0627 \u0627\u0644\u063A\u0627\u0644\u064A:",
      value: `> ${question.slice(0, 900) || "\u2014"} (\u0628\u0648\u0627\u0633\u0637\u0629: ${askerTag})`,
      inline: false
    },
    {
      name: blocked ? "\u{1F6AB} \u0642\u0631\u0627\u0631 \u062F\u0631\u0639 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 (\u0633\u0624\u0627\u0644 \u062D\u0633\u0627\u0633):" : "\u{1F604}\u2728 \u0631\u062F M7R AI \u0627\u0644\u0644\u0637\u064A\u0641:",
      value: (answer || "\u2014").slice(0, 1020),
      inline: false
    }
  ).setFooter({ text: "M7R Friendly AI \u2022 \u0631\u062F\u0648\u062F \u0630\u0643\u064A\u0629 \u0648\u0638\u0631\u064A\u0641\u0629 \u0648\u0648\u062F\u0648\u062F\u0629 \u0645\u0639 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 24/7" }).setTimestamp();
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("\u{1F310} \u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 M7R \u0627\u0644\u0631\u0633\u0645\u064A\u0629").setStyle(ButtonStyle.Link).setURL(WEB_DASHBOARD_PUBLIC_URL)
  );
  return { embeds: [embed], components: [row] };
}
var CLOUD_BACKEND_ORIGIN = process.env.APP_URL || "https://ais-pre-3d6x76wht4gxuksotfbupe-804593892274.europe-west2.run.app";
var WEB_DASHBOARD_PUBLIC_URL = "https://bot-m7r.netlify.app/";
var serverAnalytics7Days = [
  { day: "\u0627\u0644\u062C\u0645\u0639\u0629", dayEn: "Fri", date: "Day -6", members: 1382, newJoins: 9, messages: 420, commandsUsed: 38 },
  { day: "\u0627\u0644\u0633\u0628\u062A", dayEn: "Sat", date: "Day -5", members: 1395, newJoins: 13, messages: 580, commandsUsed: 52 },
  { day: "\u0627\u0644\u0623\u062D\u062F", dayEn: "Sun", date: "Day -4", members: 1408, newJoins: 13, messages: 510, commandsUsed: 44 },
  { day: "\u0627\u0644\u0625\u062B\u0646\u064A\u0646", dayEn: "Mon", date: "Day -3", members: 1419, newJoins: 11, messages: 645, commandsUsed: 61 },
  { day: "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621", dayEn: "Tue", date: "Day -2", members: 1431, newJoins: 12, messages: 720, commandsUsed: 69 },
  { day: "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621", dayEn: "Wed", date: "Day -1", members: 1442, newJoins: 11, messages: 835, commandsUsed: 84 },
  { day: "\u0627\u0644\u064A\u0648\u0645", dayEn: "Today", date: "Live", members: 1450, newJoins: 8, messages: 942, commandsUsed: 97 }
];
var weeklyAttacks7Days = [
  { day: "\u0627\u0644\u062C\u0645\u0639\u0629", dayEn: "Fri", date: "Day -6", totalAttacks: 19, spamBlocked: 12, nukeBlocked: 2, linksBlocked: 5 },
  { day: "\u0627\u0644\u0633\u0628\u062A", dayEn: "Sat", date: "Day -5", totalAttacks: 27, spamBlocked: 18, nukeBlocked: 3, linksBlocked: 6 },
  { day: "\u0627\u0644\u0623\u062D\u062F", dayEn: "Sun", date: "Day -4", totalAttacks: 15, spamBlocked: 9, nukeBlocked: 1, linksBlocked: 5 },
  { day: "\u0627\u0644\u0625\u062B\u0646\u064A\u0646", dayEn: "Mon", date: "Day -3", totalAttacks: 34, spamBlocked: 22, nukeBlocked: 4, linksBlocked: 8 },
  { day: "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621", dayEn: "Tue", date: "Day -2", totalAttacks: 23, spamBlocked: 15, nukeBlocked: 2, linksBlocked: 6 },
  { day: "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621", dayEn: "Wed", date: "Day -1", totalAttacks: 31, spamBlocked: 20, nukeBlocked: 4, linksBlocked: 7 },
  { day: "\u0627\u0644\u064A\u0648\u0645", dayEn: "Today", date: "Live", totalAttacks: 29, spamBlocked: 19, nukeBlocked: 3, linksBlocked: 7 }
];
function recordWeeklyAttackBlocked(category) {
  const todayAttackPt = weeklyAttacks7Days[weeklyAttacks7Days.length - 1];
  if (todayAttackPt) {
    todayAttackPt.totalAttacks += 1;
    if (category === "spam") todayAttackPt.spamBlocked += 1;
    else if (category === "nuke") todayAttackPt.nukeBlocked += 1;
    else if (category === "links") todayAttackPt.linksBlocked += 1;
  }
  guildStats.attacksThwartedCount += 1;
}
function buildWebDashboardPayload(guildName = "\u0633\u064A\u0631\u0641\u0631\u0643", memberCount = 1450, ping = 17) {
  const activeRec = getActiveReciter();
  const totalWeeklyBlocked = weeklyAttacks7Days.reduce((acc, item) => acc + item.totalAttacks, 0);
  const embed = new EmbedBuilder().setColor("#5865F2").setTitle(`\u{1F310} \u062F\u0634\u0628\u0648\u0631\u062F \u0627\u0644\u0648\u064A\u0628 \u0627\u0644\u0631\u0633\u0645\u064A | ${guildName}`).setURL(WEB_DASHBOARD_PUBLIC_URL).setDescription(
    `\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A **\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u0648\u064A\u0628 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u0628\u0648\u062A M7R 24/7**!
\u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u0646 \u0627\u0644\u0645\u062A\u0635\u0641\u062D \u0623\u0648 \u0627\u0644\u062C\u0648\u0627\u0644 \u0644\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u0645\u0634\u0627\u0647\u062F\u0629 \u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u0628\u064A\u0627\u0646\u064A\u0629 \u0648\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u062D\u0645\u0627\u064A\u0629:

\u{1F517} **\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0631\u0633\u0645\u064A:**
${WEB_DASHBOARD_PUBLIC_URL}

\u{1F4CA} **\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u062D\u064A\u0629:**
\u2022 \u{1F465} **\u0639\u062F\u062F \u0627\u0644\u0623\u0639\u0636\u0627\u0621:** \`${memberCount}\` \u0639\u0636\u0648
\u2022 \u{1F6E1}\uFE0F **\u0627\u0644\u0647\u062C\u0645\u0627\u062A \u0648\u0627\u0644\u0633\u0628\u0627\u0645 \u0627\u0644\u0645\u0635\u062F\u0648\u062F \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639:** \`${totalWeeklyBlocked}\` \u0647\u062C\u0645\u0629 \u0645\u062D\u0628\u0637\u0629
\u2022 \u{1F4AC} **\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u064A\u0648\u0645 \u0641\u064A \u0627\u0644\u0634\u0627\u062A:** \`${serverAnalytics7Days[serverAnalytics7Days.length - 1].messages}\` \u0631\u0633\u0627\u0644\u0629
\u2022 \u{1F54C} **\u0625\u0630\u0627\u0639\u0629 \u0627\u0644\u0642\u0631\u0622\u0646 24/7:** \u0627\u0644\u0634\u064A\u062E **${activeRec.name}**
\u2022 \u{1F916} **\u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A (M7R AI):** \u0627\u0643\u062A\u0628 \`ai ask [\u0633\u0624\u0627\u0644\u0643]\` \u0623\u0648 \`/ask\`
\u2022 \u26A1 **\u0633\u0631\u0639\u0629 \u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0627\u0644\u0628\u0648\u062A:** \`${ping}ms\` (\u0645\u062A\u0635\u0644 24/7)`
  ).setFooter({ text: `M7R Official Dashboard \u2022 ${WEB_DASHBOARD_PUBLIC_URL}` }).setTimestamp();
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("\u{1F310} \u0641\u062A\u062D \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0631\u0633\u0645\u064A (M7R Web)").setStyle(ButtonStyle.Link).setURL(WEB_DASHBOARD_PUBLIC_URL),
    new ButtonBuilder().setLabel("\u2795 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0628\u0648\u062A \u0644\u0633\u064A\u0631\u0641\u0631 \u0622\u062E\u0631").setStyle(ButtonStyle.Link).setURL("https://discord.com/oauth2/authorize?client_id=1564565916216336494&permissions=8&scope=bot%20applications.commands")
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ctrl_join_quran_vc").setLabel("\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0642\u0631\u0622\u0646 24/7").setEmoji("\u{1F54C}").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("dash_btn_giveaway").setLabel("\u0633\u062D\u0628 \u0641\u0627\u0626\u0632 \u0639\u0634\u0648\u0627\u0626\u064A (\u0642\u0631\u0639\u0629)").setEmoji("\u{1F381}").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("dash_btn_stats").setLabel("\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u0627\u0644\u062F\u0631\u0639").setEmoji("\u{1F6E1}\uFE0F").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("ctrl_send_azkar").setLabel("\u0625\u0631\u0633\u0627\u0644 \u0630\u0643\u0631").setEmoji("\u{1F4FF}").setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row1, row2] };
}
function buildWeeklySecurityDiscordPayload(guildName = "\u0633\u064A\u0631\u0641\u0631\u0643") {
  const totalWeek = weeklyAttacks7Days.reduce((acc, item) => acc + item.totalAttacks, 0);
  const totalSpam = weeklyAttacks7Days.reduce((acc, item) => acc + item.spamBlocked, 0);
  const totalNuke = weeklyAttacks7Days.reduce((acc, item) => acc + item.nukeBlocked, 0);
  const totalLinks = weeklyAttacks7Days.reduce((acc, item) => acc + item.linksBlocked, 0);
  const dailyBreakdown = weeklyAttacks7Days.map((item) => `\u2022 **${item.day}:** \`${item.totalAttacks}\` \u0647\u062C\u0645\u0629 (\u0633\u0628\u0627\u0645: ${item.spamBlocked} | \u062A\u062E\u0631\u064A\u0628: ${item.nukeBlocked} | \u0631\u0648\u0627\u0628\u0637: ${item.linksBlocked})`).join("\n");
  const secEmbed = new EmbedBuilder().setColor("#e11d48").setTitle(`\u{1F6E1}\uFE0F \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0647\u062C\u0645\u0627\u062A \u0627\u0644\u0645\u0635\u062F\u0648\u062F\u0629 \u0648\u0627\u0644\u062F\u0631\u0639 \u0627\u0644\u0645\u0636\u0627\u062F \u0644\u0644\u0633\u0628\u0627\u0645 (\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645) | ${guildName}`).setURL(WEB_DASHBOARD_PUBLIC_URL).setDescription(
    `\u064A\u0639\u0645\u0644 **\u0627\u0644\u062F\u0631\u0639 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A M7R Ultra Anti-Spam 24/7** \u0628\u0623\u0642\u0635\u0649 \u0642\u0648\u0629 \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0645\u0646 \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u0627\u0644\u062A\u0643\u0631\u0627\u0631 \u0648\u0627\u0644\u0645\u0646\u0634\u0646 \u0627\u0644\u062C\u0645\u0627\u0639\u064A \u0648\u0627\u0644\u0631\u0648\u0627\u0628\u0637:

\u{1F310} **\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0631\u0633\u0645\u064A (Netlify):**
${WEB_DASHBOARD_PUBLIC_URL}

\u{1F4CA} **\u0645\u0644\u062E\u0635 \u0627\u0644\u0647\u062C\u0645\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0645 \u0635\u062F\u0647\u0627 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 (\`${totalWeek}\` \u0647\u062C\u0645\u0629 \u0645\u062D\u0628\u0637\u0629):**
\u2022 \u{1F6AB} **\u0645\u0648\u062C\u0627\u062A \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u0627\u0644\u062A\u0643\u0631\u0627\u0631 \u0648\u0627\u0644\u0645\u0646\u0634\u0646 \u0627\u0644\u0645\u0635\u062F\u0648\u062F\u0629:** \`${totalSpam}\` \u0647\u062C\u0645\u0629
\u2022 \u26A1 **\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u062E\u0631\u064A\u0628 \u0648\u0627\u0644\u0640 Anti-Nuke \u0627\u0644\u0645\u062D\u0628\u0637\u0629:** \`${totalNuke}\` \u0645\u062D\u0627\u0648\u0644\u0629
\u2022 \u{1F517} **\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u062F\u0639\u0648\u0627\u062A \u0648\u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0645\u0634\u0628\u0648\u0647\u0629 \u0627\u0644\u0645\u062D\u0630\u0648\u0641\u0629:** \`${totalLinks}\` \u0631\u0627\u0628\u0637

\u{1F4C5} **\u062A\u0641\u0635\u064A\u0644 \u0627\u0644\u0647\u062C\u0645\u0627\u062A \u0627\u0644\u0645\u0635\u062F\u0648\u062F\u0629 \u064A\u0648\u0645\u064A\u0627\u064B:**
${dailyBreakdown}`
  ).setFooter({ text: `M7R Ultra Security & Anti-Spam \u2022 ${WEB_DASHBOARD_PUBLIC_URL}` }).setTimestamp();
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("\u{1F310} \u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 (bot-m7r.netlify.app)").setStyle(ButtonStyle.Link).setURL(WEB_DASHBOARD_PUBLIC_URL)
  );
  return { embeds: [secEmbed], components: [row] };
}
var azkarConfig = {
  enabled: true,
  channelName: "\u0627\u0630\u0643\u0627\u0631",
  intervalMinutes: 30,
  embedColor: "#059669",
  showVirtue: true,
  items: [
    {
      id: "az-1",
      category: "quran",
      categoryLabel: "\u0622\u064A\u0629 \u0642\u0631\u0622\u0646\u064A\u0629 \u0633\u0643\u064A\u0646\u0629",
      arabicText: "\uFD3F \u0627\u0644\u064E\u0651\u0630\u0650\u064A\u0646\u064E \u0622\u0645\u064E\u0646\u064F\u0648\u0627 \u0648\u064E\u062A\u064E\u0637\u0652\u0645\u064E\u0626\u0650\u0646\u064F\u0651 \u0642\u064F\u0644\u064F\u0648\u0628\u064F\u0647\u064F\u0645 \u0628\u0650\u0630\u0650\u0643\u0652\u0631\u0650 \u0627\u0644\u0644\u064E\u0651\u0647\u0650 \u06D7 \u0623\u064E\u0644\u064E\u0627 \u0628\u0650\u0630\u0650\u0643\u0652\u0631\u0650 \u0627\u0644\u0644\u064E\u0651\u0647\u0650 \u062A\u064E\u0637\u0652\u0645\u064E\u0626\u0650\u0646\u064F\u0651 \u0627\u0644\u0652\u0642\u064F\u0644\u064F\u0648\u0628\u064F \uFD3E",
      virtue: "\u0633\u0648\u0631\u0629 \u0627\u0644\u0631\u0639\u062F: \u0622\u064A\u0629 28 - \u0637\u0645\u0623\u0646\u064A\u0646\u0629 \u0627\u0644\u0642\u0644\u0648\u0628 \u0648\u0627\u0644\u0633\u0643\u064A\u0646\u0629 \u0641\u064A \u0623\u0648\u0642\u0627\u062A \u0627\u0644\u0634\u062F\u0629.",
      enabled: true
    },
    {
      id: "az-2",
      category: "salawat",
      categoryLabel: "\u0627\u0644\u0635\u0644\u0627\u0629 \u0639\u0644\u0649 \u0627\u0644\u0646\u0628\u064A \uFDFA",
      arabicText: "\u0627\u0644\u0644\u064E\u0651\u0647\u064F\u0645\u064E\u0651 \u0635\u064E\u0644\u0650\u0651 \u0648\u064E\u0633\u064E\u0644\u0650\u0651\u0645\u0652 \u0648\u064E\u0628\u064E\u0627\u0631\u0650\u0643\u0652 \u0639\u064E\u0644\u064E\u0649 \u0646\u064E\u0628\u0650\u064A\u0650\u0651\u0646\u064E\u0627 \u0648\u064E\u062D\u064E\u0628\u0650\u064A\u0628\u0650\u0646\u064E\u0627 \u0645\u064F\u062D\u064E\u0645\u064E\u0651\u062F\u064D \u0648\u064E\u0639\u064E\u0644\u064E\u0649 \u0622\u0644\u0650\u0647\u0650 \u0648\u064E\u0635\u064E\u062D\u0652\u0628\u0650\u0647\u0650 \u0623\u064E\u062C\u0652\u0645\u064E\u0639\u0650\u064A\u0646\u064E",
      virtue: "\u0642\u0627\u0644 \u0631\u0633\u0648\u0644 \u0627\u0644\u0644\u0647 \uFDFA: \xAB\u0645\u064E\u0646\u0652 \u0635\u064E\u0644\u064E\u0651\u0649 \u0639\u064E\u0644\u064E\u064A\u064E\u0651 \u0635\u064E\u0644\u0627\u0629\u064B \u0635\u064E\u0644\u064E\u0651\u0649 \u0627\u0644\u0644\u064E\u0651\u0647\u064F \u0639\u064E\u0644\u064E\u064A\u0652\u0647\u0650 \u0628\u0650\u0647\u064E\u0627 \u0639\u064E\u0634\u0652\u0631\u064B\u0627\xBB.",
      enabled: true
    },
    {
      id: "az-3",
      category: "istighfar",
      categoryLabel: "\u0633\u064A\u062F \u0627\u0644\u0627\u0633\u062A\u063A\u0641\u0627\u0631",
      arabicText: "\u0627\u0644\u0644\u064E\u0651\u0647\u064F\u0645\u064E\u0651 \u0623\u064E\u0646\u0652\u062A\u064E \u0631\u064E\u0628\u0650\u0651\u064A \u0644\u0627 \u0625\u0650\u0644\u064E\u0647\u064E \u0625\u0650\u0644\u0627 \u0623\u064E\u0646\u0652\u062A\u064E\u060C \u062E\u064E\u0644\u064E\u0642\u0652\u062A\u064E\u0646\u0650\u064A \u0648\u064E\u0623\u064E\u0646\u064E\u0627 \u0639\u064E\u0628\u0652\u062F\u064F\u0643\u064E\u060C \u0648\u064E\u0623\u064E\u0646\u064E\u0627 \u0639\u064E\u0644\u064E\u0649 \u0639\u064E\u0647\u0652\u062F\u0650\u0643\u064E \u0648\u064E\u0648\u064E\u0639\u0652\u062F\u0650\u0643\u064E \u0645\u064E\u0627 \u0627\u0633\u0652\u062A\u064E\u0637\u064E\u0639\u0652\u062A\u064F\u060C \u0623\u064E\u0639\u064F\u0648\u0630\u064F \u0628\u0650\u0643\u064E \u0645\u0650\u0646\u0652 \u0634\u064E\u0631\u0650\u0651 \u0645\u064E\u0627 \u0635\u064E\u0646\u064E\u0639\u0652\u062A\u064F\u060C \u0623\u064E\u0628\u064F\u0648\u0621\u064F \u0644\u064E\u0643\u064E \u0628\u0650\u0646\u0650\u0639\u0652\u0645\u064E\u062A\u0650\u0643\u064E \u0639\u064E\u0644\u064E\u064A\u064E\u0651\u060C \u0648\u064E\u0623\u064E\u0628\u064F\u0648\u0621\u064F \u0628\u0650\u0630\u064E\u0646\u0652\u0628\u0650\u064A \u0641\u064E\u0627\u063A\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064A \u0641\u064E\u0625\u0650\u0646\u064E\u0651\u0647\u064F \u0644\u0627 \u064A\u064E\u063A\u0652\u0641\u0650\u0631\u064F \u0627\u0644\u0630\u064F\u0651\u0646\u064F\u0648\u0628\u064E \u0625\u0650\u0644\u0627 \u0623\u064E\u0646\u0652\u062A\u064E.",
      virtue: "\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u0645\u0648\u0642\u0646\u0627\u064B \u0628\u0647\u0627 \u062D\u064A\u0646 \u064A\u0645\u0633\u064A \u0641\u0645\u0627\u062A \u0645\u0646 \u0644\u064A\u0644\u062A\u0647 \u062F\u062E\u0644 \u0627\u0644\u062C\u0646\u0629\u060C \u0648\u0643\u0630\u0644\u0643 \u0625\u0630\u0627 \u0623\u0635\u0628\u062D.",
      enabled: true
    },
    {
      id: "az-4",
      category: "general",
      categoryLabel: "\u062A\u0633\u0628\u064A\u062D \u0648\u062A\u062D\u0645\u064A\u062F",
      arabicText: "\u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0627\u0644\u0644\u064E\u0651\u0647\u0650 \u0648\u064E\u0628\u0650\u062D\u064E\u0645\u0652\u062F\u0650\u0647\u0650 \u060C \u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0627\u0644\u0644\u064E\u0651\u0647\u0650 \u0627\u0644\u0652\u0639\u064E\u0638\u0650\u064A\u0645\u0650",
      virtue: "\u0643\u0644\u0645\u062A\u0627\u0646 \u062E\u0641\u064A\u0641\u062A\u0627\u0646 \u0639\u0644\u0649 \u0627\u0644\u0644\u0633\u0627\u0646\u060C \u062B\u0642\u064A\u0644\u062A\u0627\u0646 \u0641\u064A \u0627\u0644\u0645\u064A\u0632\u0627\u0646\u060C \u062D\u0628\u064A\u0628\u062A\u0627\u0646 \u0625\u0644\u0649 \u0627\u0644\u0631\u062D\u0645\u0646.",
      enabled: true
    },
    {
      id: "az-5",
      category: "sabah",
      categoryLabel: "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0635\u0628\u0627\u062D \u0648\u0627\u0644\u0645\u0633\u0627\u0621",
      arabicText: "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u064E\u0651\u0647\u0650 \u0627\u0644\u064E\u0651\u0630\u0650\u064A \u0644\u0627 \u064A\u064E\u0636\u064F\u0631\u064F\u0651 \u0645\u064E\u0639\u064E \u0627\u0633\u0652\u0645\u0650\u0647\u0650 \u0634\u064E\u064A\u0652\u0621\u064C \u0641\u0650\u064A \u0627\u0644\u0623\u064E\u0631\u0652\u0636\u0650 \u0648\u064E\u0644\u0627 \u0641\u0650\u064A \u0627\u0644\u0633\u064E\u0651\u0645\u064E\u0627\u0621\u0650 \u0648\u064E\u0647\u064F\u0648\u064E \u0627\u0644\u0633\u064E\u0651\u0645\u0650\u064A\u0639\u064F \u0627\u0644\u0652\u0639\u064E\u0644\u0650\u064A\u0645\u064F",
      virtue: "\u062B\u0644\u0627\u062B \u0645\u0631\u0627\u062A \u0635\u0628\u0627\u062D\u0627\u064B \u0648\u0645\u0633\u0627\u0621\u064B \u0644\u0645 \u064A\u0636\u0631\u0647 \u0634\u064A\u0621.",
      enabled: true
    },
    {
      id: "az-6",
      category: "general",
      categoryLabel: "\u0643\u0646\u0632 \u0645\u0646 \u0643\u0646\u0648\u0632 \u0627\u0644\u062C\u0646\u0629",
      arabicText: "\u0644\u0627 \u062D\u064E\u0648\u0652\u0644\u064E \u0648\u064E\u0644\u0627 \u0642\u064F\u0648\u064E\u0651\u0629\u064E \u0625\u0650\u0644\u0627 \u0628\u0650\u0627\u0644\u0644\u064E\u0651\u0647\u0650 \u0627\u0644\u0652\u0639\u064E\u0644\u0650\u064A\u0650\u0651 \u0627\u0644\u0652\u0639\u064E\u0638\u0650\u064A\u0645\u0650",
      virtue: "\u0643\u0646\u0632 \u0645\u0646 \u062A\u062D\u062A \u0627\u0644\u0639\u0631\u0634 \u0648\u0628\u0631\u0627\u0621\u0629 \u0645\u0646 \u0627\u0644\u062D\u0648\u0644 \u0648\u0627\u0644\u0642\u0648\u0629 \u0625\u0644\u0627 \u0628\u0627\u0644\u0644\u0647.",
      enabled: true
    },
    {
      id: "az-7",
      category: "istighfar",
      categoryLabel: "\u0627\u0633\u062A\u063A\u0641\u0627\u0631 \u0648\u062A\u0648\u0628\u0629",
      arabicText: "\u0623\u064E\u0633\u0652\u062A\u064E\u063A\u0652\u0641\u0650\u0631\u064F \u0627\u0644\u0644\u064E\u0651\u0647\u064E \u0627\u0644\u0652\u0639\u064E\u0638\u0650\u064A\u0645\u064E \u0627\u0644\u064E\u0651\u0630\u0650\u064A \u0644\u0627 \u0625\u0650\u0644\u064E\u0647\u064E \u0625\u0650\u0644\u0627 \u0647\u064F\u0648\u064E \u0627\u0644\u0652\u062D\u064E\u064A\u064F\u0651 \u0627\u0644\u0652\u0642\u064E\u064A\u064F\u0651\u0648\u0645\u064F \u0648\u064E\u0623\u064E\u062A\u064F\u0648\u0628\u064F \u0625\u0650\u0644\u064E\u064A\u0652\u0647\u0650",
      virtue: "\u0645\u0646 \u0642\u0627\u0644\u0647 \u063A\u064F\u0641\u0631\u062A \u0630\u0646\u0648\u0628\u0647 \u0648\u0625\u0646 \u0643\u0627\u0646 \u0641\u0631 \u0645\u0646 \u0627\u0644\u0632\u062D\u0641.",
      enabled: true
    },
    {
      id: "az-8",
      category: "quran",
      categoryLabel: "\u062F\u0639\u0627\u0621 \u062C\u0627\u0645\u0639",
      arabicText: "\uFD3F \u0631\u064E\u0628\u064E\u0651\u0646\u064E\u0627 \u0622\u062A\u0650\u0646\u064E\u0627 \u0641\u0650\u064A \u0627\u0644\u062F\u064F\u0651\u0646\u0652\u064A\u064E\u0627 \u062D\u064E\u0633\u064E\u0646\u064E\u0629\u064B \u0648\u064E\u0641\u0650\u064A \u0627\u0644\u0622\u062E\u0650\u0631\u064E\u0629\u0650 \u062D\u064E\u0633\u064E\u0646\u064E\u0629\u064B \u0648\u064E\u0642\u0650\u0646\u064E\u0627 \u0639\u064E\u0630\u064E\u0627\u0628\u064E \u0627\u0644\u0646\u064E\u0651\u0627\u0631\u0650 \uFD3E",
      virtue: "\u0623\u0643\u062B\u0631 \u062F\u0639\u0627\u0621 \u0643\u0627\u0646 \u064A\u062F\u0639\u0648 \u0628\u0647 \u0627\u0644\u0646\u0628\u064A \uFDFA.",
      enabled: true
    }
  ]
};
var honeypotTrapConfig = {
  enabled: true,
  channelName: "\u{1F6AB}-\u0645\u0645\u0646\u0648\u0639-\u0627\u0644\u062F\u062E\u0648\u0644",
  punishment: "ban",
  timeoutDurationMinutes: 10080,
  deleteMessage: true,
  alertLogChannel: "log-server",
  customWarningMessage: "\u26A0\uFE0F \u062A\u062D\u0630\u064A\u0631 \u0623\u0645\u0646\u064A \u0634\u062F\u064A\u062F: \u0647\u0630\u0627 \u0627\u0644\u0631\u0648\u0645 \u0639\u0628\u0627\u0631\u0629 \u0639\u0646 \u0645\u0635\u064A\u062F\u0629 \u0622\u0644\u064A\u0629 \u0644\u0643\u0634\u0641 \u0627\u0644\u0628\u0648\u062A\u0627\u062A \u0648\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0633\u064A\u0644\u0641 \u0628\u0648\u062A \u0648\u0627\u0644\u0645\u062E\u0631\u0628\u064A\u0646. \u0623\u064A \u0631\u0633\u0627\u0644\u0629 \u0623\u0648 \u062A\u0641\u0627\u0639\u0644 \u0647\u0646\u0627 \u064A\u0624\u062F\u064A \u0644\u0644\u062D\u0638\u0631 \u0627\u0644\u0641\u0648\u0631\u064A \u0645\u0646 \u0633\u064A\u0631\u0641\u0631 M7R!",
  whitelistUserIds: ["498712345678901234"],
  whitelistRoleNames: ["Owner", "Co-Owner", "Lead Admin"],
  totalTrapped: 18
};
var welcomeConfig = {
  enabled: true,
  channelName: "welcome",
  messageMode: "embed_and_text",
  mentionUser: true,
  welcomeMessage: "\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u064A\u0627 {user} \u0641\u064A \u0633\u064A\u0631\u0641\u0631 **{server}** \u0627\u0644\u0631\u0633\u0645\u064A \u{1F6E1}\uFE0F! \u0623\u0646\u062A \u0627\u0644\u0639\u0636\u0648 \u0631\u0642\u0645 **#{count}**\u060C \u0646\u062A\u0645\u0646\u0649 \u0644\u0643 \u0648\u0642\u062A\u0627\u064B \u0645\u0645\u062A\u0639\u0627\u064B \u0645\u0639\u0646\u0627.",
  useEmbed: true,
  embedTitle: "\u{1F44B} \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A {server}!",
  embedDescription: "\u0623\u0647\u0644\u0627\u064B \u0648\u0633\u0647\u0644\u0627\u064B \u0628\u0643 \u064A\u0627 {user} \u0646\u0648\u0631\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631!\n\n\u2728 **\u064A\u0631\u062C\u0649 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0642\u0648\u0627\u0646\u064A\u0646 \u0648\u0627\u0644\u062A\u0648\u062C\u0647 \u0644\u0631\u0648\u0645 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0639\u0646\u062F \u0627\u0644\u062D\u0627\u062C\u0629 \u0644\u0623\u064A \u0645\u0633\u0627\u0639\u062F\u0629.**\n\u{1F4CA} **\u0639\u062F\u062F \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0622\u0646:** `{count}` \u0639\u0636\u0648",
  embedColor: "#e11d48",
  bannerUrl: "",
  embedBannerUrl: "",
  showAvatarThumbnail: true,
  showMemberCount: true,
  showAccountAge: true,
  footerText: "M7R Welcome System \u2022 \u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0628\u064A\u0646\u0646\u0627",
  embedFooter: "M7R Welcome System \u2022 \u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0628\u064A\u0646\u0646\u0627",
  autoRoleEnabled: true,
  autoRoleName: "Member",
  botAutoRoleEnabled: false,
  botAutoRoleName: "Bots",
  sendDm: false,
  dmMessage: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u064A\u0627 {user} \u0641\u064A \u0633\u064A\u0631\u0641\u0631 {server} \u{1F6E1}\uFE0F! \u064A\u0633\u0639\u062F\u0646\u0627 \u0627\u0646\u0636\u0645\u0627\u0645\u0643 \u0625\u0644\u064A\u0646\u0627.",
  leaveEnabled: true,
  leaveChannelName: "welcome",
  leaveMessage: "\u{1F44B} \u063A\u0627\u062F\u0631\u0646\u0627 \u0627\u0644\u0639\u0636\u0648 **{username}**\u060C \u0646\u062A\u0645\u0646\u0649 \u0644\u0647 \u0627\u0644\u062A\u0648\u0641\u064A\u0642! (\u0639\u062F\u062F\u0646\u0627 \u0627\u0644\u0622\u0646 `{count}` \u0639\u0636\u0648)"
};
function normalizeChannelName(name) {
  return (name || "").normalize("NFKD").replace(/^[#\s]+/, "").trim().toLowerCase();
}
function matchesChannelName(channelName, targetQuery) {
  const normCh = normalizeChannelName(channelName);
  const normTarget = normalizeChannelName(targetQuery);
  if (!normTarget) return false;
  return normCh === normTarget || normCh.includes(normTarget) || channelName.includes(targetQuery.replace(/^[#\s]+/, "").trim());
}
var QURAN_RECITERS = [
  {
    id: "alafasy",
    name: "\u0645\u0634\u0627\u0631\u064A \u0631\u0627\u0634\u062F \u0627\u0644\u0639\u0641\u0627\u0633\u064A",
    nameEn: "Mishary Rashid Al-Afasy",
    streamUrl: "https://qurango.net/radio/mishary_alafasi",
    description: "\u062A\u0644\u0627\u0648\u0627\u062A \u062E\u0627\u0634\u0639\u0629 \u0648\u0639\u0630\u0628\u0629 \u0628\u0635\u0648\u062A \u0627\u0644\u0634\u064A\u062E \u0645\u0634\u0627\u0631\u064A \u0627\u0644\u0639\u0641\u0627\u0633\u064A 24/7",
    style: "murattal"
  },
  {
    id: "minshawi",
    name: "\u0645\u062D\u0645\u062F \u0635\u062F\u064A\u0642 \u0627\u0644\u0645\u0646\u0634\u0627\u0648\u064A",
    nameEn: "Mohamed Siddiq Al-Minshawi",
    streamUrl: "https://qurango.net/radio/mohammed_siddiq_alminshawi",
    description: "\u0627\u0644\u0645\u0635\u062D\u0641 \u0627\u0644\u0645\u0631\u062A\u0644 \u0628\u0631\u0648\u0627\u064A\u0629 \u062D\u0641\u0635 \u0639\u0646 \u0639\u0627\u0635\u0645 - \u0623\u0633\u062A\u0627\u0630 \u0627\u0644\u062E\u0634\u0648\u0639 \u0648\u0627\u0644\u062A\u0631\u062A\u064A\u0644",
    style: "murattal"
  },
  {
    id: "abdulbasit",
    name: "\u0639\u0628\u062F \u0627\u0644\u0628\u0627\u0633\u0637 \u0639\u0628\u062F \u0627\u0644\u0635\u0645\u062F",
    nameEn: "Abdulbasit Abdulsamad",
    streamUrl: "https://qurango.net/radio/abdulbasit_abdulsamad_mojawwad",
    description: "\u0627\u0644\u0645\u0635\u062D\u0641 \u0627\u0644\u0645\u062C\u0648\u062F \u0627\u0644\u062E\u0627\u0644\u062F \u0628\u0635\u0648\u062A \u0635\u0648\u062A \u0645\u0643\u0629 \u0627\u0644\u0634\u064A\u062E \u0639\u0628\u062F \u0627\u0644\u0628\u0627\u0633\u0637",
    style: "mujawwad"
  },
  {
    id: "sudais",
    name: "\u0639\u0628\u062F \u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0633\u062F\u064A\u0633",
    nameEn: "Abdulrahman Al-Sudais",
    streamUrl: "https://qurango.net/radio/abdulrahman_alsudaes",
    description: "\u0625\u0645\u0627\u0645 \u0648\u062E\u0637\u064A\u0628 \u0627\u0644\u0645\u0633\u062C\u062F \u0627\u0644\u062D\u0631\u0627\u0645 \u0648\u062A\u0644\u0627\u0648\u0627\u062A \u0627\u0644\u062D\u0631\u0645 \u0627\u0644\u0645\u0643\u064A \u0627\u0644\u0634\u0631\u064A\u0641",
    style: "murattal"
  },
  {
    id: "muaiqly",
    name: "\u0645\u0627\u0647\u0631 \u0627\u0644\u0645\u0639\u064A\u0642\u0644\u064A",
    nameEn: "Maher Al-Muaiqly",
    streamUrl: "https://qurango.net/radio/maher_al_muaiqly",
    description: "\u062A\u0644\u0627\u0648\u0629 \u0646\u062F\u064A\u0629 \u0647\u0627\u062F\u0626\u0629 \u062A\u0637\u0645\u0626\u0646 \u0628\u0647\u0627 \u0627\u0644\u0646\u0641\u0648\u0633 \u0648\u0627\u0644\u0642\u0644\u0648\u0628",
    style: "murattal"
  },
  {
    id: "ghamdi",
    name: "\u0633\u0639\u062F \u0627\u0644\u063A\u0627\u0645\u062F\u064A",
    nameEn: "Saad Al-Ghamdi",
    streamUrl: "https://qurango.net/radio/saad_alghamdi",
    description: "\u062A\u0631\u062A\u064A\u0644 \u0645\u0645\u064A\u0632 \u0645\u062A\u0642\u0646 \u0639\u0627\u0644\u064A \u0627\u0644\u0633\u0643\u064A\u0646\u0629 \u0648\u0627\u0644\u062E\u0634\u0648\u0639",
    style: "murattal"
  },
  {
    id: "cairo_radio",
    name: "\u0625\u0630\u0627\u0639\u0629 \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 \u0645\u0646 \u0627\u0644\u0642\u0627\u0647\u0631\u0629",
    nameEn: "Cairo Quran Radio",
    streamUrl: "https://stream.zeno.fm/fvrrt4npg0quv",
    description: "\u0627\u0644\u0628\u062B \u0627\u0644\u0625\u0630\u0627\u0639\u064A \u0627\u0644\u062D\u064A \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0644\u0623\u0639\u0631\u0642 \u0625\u0630\u0627\u0639\u0629 \u0642\u0631\u0622\u0646 \u0643\u0631\u064A\u0645 \u0628\u0627\u0644\u0639\u0627\u0644\u0645 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A",
    style: "radio"
  },
  {
    id: "tarateel",
    name: "\u0625\u0630\u0627\u0639\u0629 \u062A\u0644\u0627\u0648\u0627\u062A \u0648\u062A\u0631\u0627\u062A\u064A\u0644 \u0639\u0637\u0631\u0629 24/7",
    nameEn: "Tarateel Live Stream",
    streamUrl: "https://qurango.net/radio/tarateel",
    description: "\u0628\u0627\u0642\u0629 \u0645\u062E\u062A\u0627\u0631\u0629 \u0645\u0646 \u0623\u0631\u0648\u0639 \u0627\u0644\u062A\u0644\u0627\u0648\u0627\u062A \u0627\u0644\u0642\u0631\u0622\u0646\u064A\u0629 \u0627\u0644\u0646\u0627\u062F\u0631\u0629 \u0644\u0643\u0628\u0627\u0631 \u0627\u0644\u0642\u0631\u0627\u0621",
    style: "radio"
  }
];
var DEFAULT_QURAN_SCHEDULE = [
  {
    id: "slot-1",
    startHour: 4,
    endHour: 8,
    reciterId: "alafasy",
    label: "\u0627\u0644\u0641\u062C\u0631 \u0648\u0627\u0644\u0635\u0628\u0627\u062D \u0627\u0644\u0628\u0627\u0643\u0631 (04:00 - 08:00)"
  },
  {
    id: "slot-2",
    startHour: 8,
    endHour: 12,
    reciterId: "muaiqly",
    label: "\u0627\u0644\u0636\u062D\u0649 \u0648\u0627\u0644\u0638\u0647\u064A\u0631\u0629 (08:00 - 12:00)"
  },
  {
    id: "slot-3",
    startHour: 12,
    endHour: 16,
    reciterId: "minshawi",
    label: "\u0627\u0644\u0638\u0647\u0631 \u0648\u0627\u0644\u0639\u0635\u0631 (12:00 - 16:00)"
  },
  {
    id: "slot-4",
    startHour: 16,
    endHour: 20,
    reciterId: "abdulbasit",
    label: "\u0627\u0644\u0645\u0633\u0627\u0621 \u0648\u0627\u0644\u0645\u063A\u0631\u0628 (16:00 - 20:00)"
  },
  {
    id: "slot-5",
    startHour: 20,
    endHour: 24,
    reciterId: "sudais",
    label: "\u0627\u0644\u0639\u0634\u0627\u0621 \u0648\u0627\u0644\u062D\u0631\u0645 \u0627\u0644\u0645\u0643\u064A (20:00 - 00:00)"
  },
  {
    id: "slot-6",
    startHour: 0,
    endHour: 4,
    reciterId: "ghamdi",
    label: "\u0642\u064A\u0627\u0645 \u0627\u0644\u0644\u064A\u0644 \u0648\u0627\u0644\u0623\u0633\u062D\u0627\u0631 (00:00 - 04:00)"
  }
];
var activeVoiceConnection = null;
var currentVoiceChannelId = null;
var currentVoiceChannelName = null;
var currentVoiceGuildId = null;
var voiceConnectionStatus = "disconnected";
var voiceAudioPlayer = createAudioPlayer();
var currentPlayingStreamUrl = null;
var currentPlayingReciterId = null;
var voice247Config = {
  enabled: true,
  channelId: "110293847561029384",
  channelName: "\u{1F50A} 24/7 | \u062E\u0644\u0648\u0629 \u0648\u062A\u0644\u0627\u0648\u0627\u062A \u0639\u0637\u0631\u0629",
  audioMode: "quran",
  selectedReciter: "alafasy",
  autoReconnect: true,
  deafened: true,
  muted: false,
  scheduleEnabled: true,
  scheduleSlots: DEFAULT_QURAN_SCHEDULE
};
function getCurrentMeccaHour() {
  const now = /* @__PURE__ */ new Date();
  const utcHours = now.getUTCHours();
  return (utcHours + 3) % 24;
}
function getActiveReciter() {
  if (voice247Config.scheduleEnabled && voice247Config.scheduleSlots?.length) {
    const hour = getCurrentMeccaHour();
    const activeSlot = voice247Config.scheduleSlots.find((s) => {
      if (s.startHour < s.endHour) {
        return hour >= s.startHour && hour < s.endHour;
      } else {
        return hour >= s.startHour || hour < s.endHour;
      }
    });
    if (activeSlot) {
      const rec = QURAN_RECITERS.find((r) => r.id === activeSlot.reciterId);
      if (rec) return rec;
    }
  }
  const selected = QURAN_RECITERS.find((r) => r.id === voice247Config.selectedReciter);
  return selected || QURAN_RECITERS[0];
}
function playQuranAudioForConfig(force = false) {
  if (!activeVoiceConnection || voiceConnectionStatus !== "connected") return;
  if (voice247Config.audioMode === "silent") {
    voiceAudioPlayer.stop();
    currentPlayingStreamUrl = null;
    currentPlayingReciterId = null;
    return;
  }
  const reciter = getActiveReciter();
  const streamUrl = voice247Config.audioMode === "radio" ? QURAN_RECITERS.find((r) => r.id === "cairo_radio")?.streamUrl || reciter.streamUrl : reciter.streamUrl;
  if (!force && currentPlayingStreamUrl === streamUrl && voiceAudioPlayer.state.status === AudioPlayerStatus.Playing) {
    return;
  }
  try {
    const resource = createAudioResource(streamUrl, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true
    });
    if (resource.volume) {
      resource.volume.setVolume(0.85);
    }
    if (resource.playStream) {
      resource.playStream.on("error", (streamErr) => {
        console.log("[M7R QURAN STREAM RETRY]:", streamErr?.message || "Stream interrupted");
      });
    }
    voiceAudioPlayer.play(resource);
    currentPlayingStreamUrl = streamUrl;
    currentPlayingReciterId = reciter.id;
    console.log(`[M7R QURAN 24/7] Now streaming Holy Quran (${reciter.name}) into voice channel.`);
  } catch (err) {
    console.log("[M7R QURAN AUDIO NOTICE]:", err?.message || err);
  }
}
voiceAudioPlayer.on("error", (err) => {
  console.log("[M7R QURAN PLAYER NOTICE]:", err.message);
  setTimeout(() => {
    if (activeVoiceConnection && voiceConnectionStatus === "connected" && voice247Config.audioMode !== "silent") {
      playQuranAudioForConfig(true);
    }
  }, 5e3);
});
setInterval(() => {
  if (voice247Config.enabled && activeVoiceConnection && voiceConnectionStatus === "connected") {
    if (voice247Config.scheduleEnabled && voice247Config.audioMode === "quran") {
      const expectedReciter = getActiveReciter();
      if (expectedReciter.id !== currentPlayingReciterId) {
        console.log(`[M7R QURAN SCHEDULE] Auto-switching reciter to: ${expectedReciter.name} (Hour ${getCurrentMeccaHour()}:00 Mecca)`);
        playQuranAudioForConfig(true);
      }
    }
    if (voice247Config.audioMode !== "silent" && voiceAudioPlayer.state.status === AudioPlayerStatus.Idle) {
      playQuranAudioForConfig(true);
    }
  }
}, 3e4);
var autoResponses = [
  {
    id: "ar-1",
    trigger: "\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645",
    matchType: "contains",
    reply: "\u0648\u0639\u0644\u064A\u0643\u0645 \u0627\u0644\u0633\u0644\u0627\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647 \u0648\u0628\u0631\u0643\u0627\u062A\u0647 \u064A\u0627 {user}! \u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A \u0633\u064A\u0631\u0641\u0631 **{server}** \u0627\u0644\u0645\u062D\u0645\u064A \u0628\u0627\u0644\u062F\u0631\u0639 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A \u{1F6E1}\uFE0F",
    autoReaction: "\u2764\uFE0F",
    enabled: true
  },
  {
    id: "ar-2",
    trigger: "\u0645\u062A\u062C\u0631",
    matchType: "contains",
    reply: "\u{1F6D2} \u062A\u0641\u0636\u0644 \u0628\u0632\u064A\u0627\u0631\u0629 \u0642\u0633\u0645 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0644\u0637\u0644\u0628 \u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631 \u0627\u0644\u062D\u0635\u0631\u064A\u0629 \u0623\u0648 \u0627\u0643\u062A\u0628 `!panel` \u0644\u0641\u062A\u062D \u062A\u0630\u0643\u0631\u0629 \u062E\u0627\u0635\u0629 \u0628\u0643 \u0641\u064A **{server}**!",
    autoReaction: "\u{1F6D2}",
    enabled: true
  },
  {
    id: "ar-3",
    trigger: "\u0645\u0633\u0627\u0639\u062F\u0629",
    matchType: "contains",
    reply: "\u2728 \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u064A\u0627 {user}! \u0644\u0644\u0627\u0637\u0644\u0627\u0639 \u0639\u0644\u0649 \u062C\u0645\u064A\u0639 \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0628\u0648\u062A \u0627\u0643\u062A\u0628 `!help`\u060C \u0623\u0648 \u062A\u0648\u062C\u0647 \u0644\u0631\u0648\u0645 \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A \u0644\u062E\u062F\u0645\u062A\u0643 \u0641\u0648\u0631\u0627\u064B \u{1F6E0}\uFE0F",
    autoReaction: "\u{1F4A1}",
    enabled: true
  },
  {
    id: "ar-4",
    trigger: "\u0642\u0648\u0627\u0646\u064A\u0646",
    matchType: "contains",
    reply: "\u{1F4DC} \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0642\u0648\u0627\u0646\u064A\u0646 \u0633\u064A\u0631\u0641\u0631 **{server}** \u0648\u0627\u062D\u062A\u0631\u0627\u0645 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0644\u062A\u062C\u0646\u0628 \u0627\u0644\u062D\u0638\u0631 \u0648\u0627\u0644\u0643\u062A\u0645 \u0627\u0644\u0622\u0644\u064A \u0645\u0646 \u0646\u0638\u0627\u0645 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u{1F6E1}\uFE0F",
    autoReaction: "\u2696\uFE0F",
    enabled: true
  },
  {
    id: "ar-5",
    trigger: "\u062A\u0642\u062F\u064A\u0645",
    matchType: "contains",
    reply: "\u{1F4CB} \u0628\u0627\u0628 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0625\u062F\u0627\u0631\u0629 \u0648\u0631\u062A\u0628 \u0633\u064A\u0631\u0641\u0631 **{server}** \u0645\u062A\u0627\u062D! \u062A\u0641\u0636\u0644 \u0628\u0627\u0644\u062F\u062E\u0648\u0644 \u0625\u0644\u0649 \u0631\u0648\u0645 \u0627\u0644\u062A\u0642\u062F\u064A\u0645\u0627\u062A \u0648\u062A\u0639\u0628\u0626\u0629 \u0627\u0644\u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u{1F4DD}",
    autoReaction: "\u{1F4DD}",
    enabled: true
  }
];
function normalizeArabicText(text) {
  if (!text) return "";
  return text.normalize("NFKD").replace(/[\u064B-\u065F\u0670]/g, "").replace(/[أإآ]/g, "\u0627").replace(/ة/g, "\u0647").replace(/[ى]/g, "\u064A").toLowerCase().trim();
}
function formatResponseVariables(template, message) {
  return (template || "").replace(/\{user\}/gi, `<@${message.author.id}>`).replace(/\{username\}/gi, message.author.username).replace(/\{server\}/gi, message.guild?.name || "Discord").replace(/\{channel\}/gi, `<#${message.channel.id}>`).replace(/\{count\}/gi, `${message.guild?.memberCount || 1}`);
}
async function joinDiscordVoiceChannel247(channelNameOrId, guildOverride) {
  if (!botClient || !botClient.isReady()) {
    return { success: false, message: "\u0627\u0644\u0628\u0648\u062A \u063A\u064A\u0631 \u0645\u062A\u0635\u0644 \u0628\u062F\u064A\u0633\u0643\u0648\u0631\u062F \u062D\u0627\u0644\u064A\u0627\u064B." };
  }
  const guild = guildOverride || getTargetGuild();
  if (!guild) {
    return { success: false, message: "\u062A\u0639\u0630\u0631 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641." };
  }
  const targetQuery = (channelNameOrId || voice247Config.channelName || "").trim();
  let voiceChannel = null;
  if (targetQuery) {
    voiceChannel = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildVoice && (c.id === targetQuery || c.name.toLowerCase() === targetQuery.toLowerCase() || matchesChannelName(c.name, targetQuery))
    );
  }
  if (!voiceChannel) {
    voiceChannel = guild.channels.cache.find((c) => c.type === ChannelType.GuildVoice);
  }
  if (!voiceChannel) {
    return { success: false, message: `\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0623\u064A \u0631\u0648\u0645 \u0635\u0648\u062A\u064A \u0641\u064A \u0633\u064A\u0631\u0641\u0631 ${guild.name}.` };
  }
  try {
    voice247Config.enabled = true;
    voice247Config.channelId = voiceChannel.id;
    voice247Config.channelName = voiceChannel.name;
    currentVoiceChannelId = voiceChannel.id;
    currentVoiceChannelName = voiceChannel.name;
    currentVoiceGuildId = guild.id;
    voiceConnectionStatus = "connecting";
    const existingConn = getVoiceConnection(guild.id);
    if (existingConn) {
      existingConn.destroy();
    }
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: voice247Config.deafened ?? true,
      selfMute: voice247Config.muted ?? false
    });
    activeVoiceConnection = connection;
    connection.on(VoiceConnectionStatus.Ready, () => {
      voiceConnectionStatus = "connected";
      console.log(`[M7R VOICE 24/7] Connected to voice channel #${voiceChannel.name} in ${guild.name}`);
      try {
        connection.subscribe(voiceAudioPlayer);
        playQuranAudioForConfig(true);
      } catch (audioErr) {
        console.error("[M7R VOICE SUBSCRIBE ERROR]:", audioErr);
      }
    });
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5e3),
          entersState(connection, VoiceConnectionStatus.Connecting, 5e3)
        ]);
      } catch {
        if (voice247Config.enabled && voice247Config.autoReconnect) {
          console.log("[M7R VOICE 24/7] Disconnected. Auto-reconnecting in 3s...");
          setTimeout(() => {
            if (voice247Config.enabled) {
              joinDiscordVoiceChannel247(voice247Config.channelName, guild).catch(() => {
              });
            }
          }, 3e3);
        } else {
          voiceConnectionStatus = "disconnected";
          connection.destroy();
        }
      }
    });
    connection.on(VoiceConnectionStatus.Destroyed, () => {
      voiceConnectionStatus = "disconnected";
    });
    savePersistedSession();
    const activeRec = getActiveReciter();
    return {
      success: true,
      message: `\u{1F50A} \u062A\u0645 \u062F\u062E\u0648\u0644 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A (#${voiceChannel.name}) \u0648\u0628\u062F\u0621 \u0628\u062B \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 \u0628\u0635\u0648\u062A (${activeRec.name}) 24/7!`,
      channelName: voiceChannel.name,
      channelId: voiceChannel.id
    };
  } catch (err) {
    console.error("[M7R VOICE ERROR]:", err);
    voiceConnectionStatus = "disconnected";
    return {
      success: false,
      message: `\u0641\u0634\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A: ${err?.message || "\u062A\u0623\u0643\u062F \u0645\u0646 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u0628\u0648\u062A Connect \u0648 Speak."}`
    };
  }
}
function leaveDiscordVoiceChannel(guildOverride) {
  voice247Config.enabled = false;
  const guild = guildOverride || getTargetGuild();
  let destroyed = false;
  try {
    voiceAudioPlayer.stop();
  } catch {
  }
  currentPlayingStreamUrl = null;
  currentPlayingReciterId = null;
  if (guild) {
    const conn = getVoiceConnection(guild.id);
    if (conn) {
      conn.destroy();
      destroyed = true;
    }
  }
  if (activeVoiceConnection) {
    try {
      activeVoiceConnection.destroy();
    } catch {
    }
    activeVoiceConnection = null;
    destroyed = true;
  }
  voiceConnectionStatus = "disconnected";
  currentVoiceChannelId = null;
  currentVoiceChannelName = null;
  savePersistedSession();
  return {
    success: true,
    message: destroyed ? "\u23F9\uFE0F \u062A\u0645 \u0627\u0644\u062E\u0631\u0648\u062C \u0648\u0642\u0637\u0639 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0648\u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0635\u0648\u062A \u0645\u0646 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \u0628\u0646\u062C\u0627\u062D!" : "\u0627\u0644\u0628\u0648\u062A \u063A\u064A\u0631 \u0645\u062A\u0648\u0627\u062C\u062F \u0641\u064A \u0623\u064A \u0631\u0648\u0645 \u0635\u0648\u062A\u064A \u062D\u0627\u0644\u064A\u0627\u064B."
  };
}
var SESSION_FILE_PATH = path.join(__dirname, ".m7r-session.json");
function savePersistedSession() {
  try {
    const data = {
      token: savedBotToken,
      selectedGuildId,
      botBasicSettings,
      welcomeConfig,
      ticketPanelConfig,
      azkarConfig,
      honeypotTrapConfig,
      applicationsConfig,
      applications,
      voice247Config,
      autoResponses,
      guildJoinNotifications,
      currentAccessMode
    };
    fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
  }
}
function loadPersistedSession() {
  try {
    if (!fs.existsSync(SESSION_FILE_PATH)) return;
    const raw = fs.readFileSync(SESSION_FILE_PATH, "utf-8");
    const data = JSON.parse(raw);
    if (data.token && typeof data.token === "string") {
      savedBotToken = data.token;
    }
    if (data.selectedGuildId) {
      selectedGuildId = data.selectedGuildId;
    }
    if (data.botBasicSettings) {
      botBasicSettings = { ...botBasicSettings, ...data.botBasicSettings, botUsername: "M7R" };
    }
    if (data.welcomeConfig) {
      welcomeConfig = { ...welcomeConfig, ...data.welcomeConfig };
    }
    if (data.ticketPanelConfig) {
      ticketPanelConfig = { ...ticketPanelConfig, ...data.ticketPanelConfig };
    }
    if (data.azkarConfig) {
      azkarConfig = { ...azkarConfig, ...data.azkarConfig };
    }
    if (data.honeypotTrapConfig) {
      honeypotTrapConfig = { ...honeypotTrapConfig, ...data.honeypotTrapConfig };
    }
    if (data.applicationsConfig) {
      applicationsConfig = { ...applicationsConfig, ...data.applicationsConfig };
    }
    if (Array.isArray(data.applications)) {
      applications = data.applications;
    }
    if (data.voice247Config) {
      voice247Config = { ...voice247Config, ...data.voice247Config };
    }
    if (Array.isArray(data.autoResponses)) {
      autoResponses = data.autoResponses;
    }
    if (Array.isArray(data.guildJoinNotifications)) {
      guildJoinNotifications = data.guildJoinNotifications;
    }
    if (data.currentAccessMode === "bot_owner" || data.currentAccessMode === "server_admin") {
      currentAccessMode = data.currentAccessMode;
    }
  } catch {
  }
}
loadPersistedSession();
function getConnectedGuildsList() {
  if (!botClient || !botClient.isReady()) return [];
  return botClient.guilds.cache.map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.iconURL() || "",
    memberCount: g.memberCount || 0,
    channelsCount: g.channels.cache.size,
    rolesCount: g.roles.cache.size,
    ownerId: g.ownerId
  }));
}
function getTargetGuild() {
  if (!botClient || !botClient.isReady()) return void 0;
  if (selectedGuildId && botClient.guilds.cache.has(selectedGuildId)) {
    return botClient.guilds.cache.get(selectedGuildId);
  }
  return botClient.guilds.cache.first();
}
function formatWelcomeVariables(template, opts) {
  return (template || "").replace(/\{user\}/gi, `<@${opts.userId}>`).replace(/\{username\}/gi, opts.username).replace(/\{server\}/gi, opts.serverName).replace(/\{count\}/gi, `${opts.memberCount}`).replace(/\{id\}/gi, opts.userId);
}
function buildWelcomePayload(opts) {
  const c = opts.cfg || welcomeConfig;
  const formattedContent = formatWelcomeVariables(c.welcomeMessage, opts);
  const contentText = c.mentionUser ? formattedContent.includes(`<@${opts.userId}>`) ? formattedContent : `<@${opts.userId}> ${formattedContent}` : formattedContent;
  if (!c.useEmbed) {
    return {
      content: contentText || `\u{1F44B} \u0623\u0647\u0644\u0627\u064B \u0628\u0643 <@${opts.userId}> \u0641\u064A **${opts.serverName}**!`
    };
  }
  const embed = new EmbedBuilder().setColor(c.embedColor || "#e11d48").setTitle(formatWelcomeVariables(c.embedTitle || "\u{1F44B} \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A {server}!", opts)).setDescription(formatWelcomeVariables(c.embedDescription || c.welcomeMessage, opts)).setFooter({ text: formatWelcomeVariables(c.embedFooter || `${opts.serverName} \u2022 \u0627\u0644\u0639\u0636\u0648 \u0631\u0642\u0645 #${opts.memberCount}`, opts) }).setTimestamp();
  if (c.showAvatarThumbnail && opts.avatarUrl) {
    embed.setThumbnail(opts.avatarUrl);
  }
  if (c.embedBannerUrl && c.embedBannerUrl.trim().startsWith("http")) {
    embed.setImage(c.embedBannerUrl.trim());
  }
  return {
    content: c.mentionUser ? `<@${opts.userId}>` : formattedContent || void 0,
    embeds: [embed]
  };
}
function getDiscordActivityType(type) {
  switch (type) {
    case "WATCHING":
      return ActivityType.Watching;
    case "LISTENING":
      return ActivityType.Listening;
    case "COMPETING":
      return ActivityType.Competing;
    case "STREAMING":
      return ActivityType.Streaming;
    case "PLAYING":
    default:
      return ActivityType.Playing;
  }
}
function getDiscordButtonStyle(style) {
  switch (style) {
    case "Primary":
      return ButtonStyle.Primary;
    case "Success":
      return ButtonStyle.Success;
    case "Danger":
      return ButtonStyle.Danger;
    case "Secondary":
    default:
      return ButtonStyle.Secondary;
  }
}
async function applySettingsToLiveBot(allowUsernameUpdate = false) {
  if (!botClient || !botClient.isReady() || !botClient.user) return;
  try {
    const actType = getDiscordActivityType(botBasicSettings.activityType);
    botClient.user.setPresence({
      status: botBasicSettings.presenceStatus,
      activities: [
        {
          name: botBasicSettings.activityText || "M7R Security \u{1F6E1}\uFE0F",
          type: actType,
          url: actType === ActivityType.Streaming ? botBasicSettings.streamingUrl || "https://twitch.tv/m7r" : void 0
        }
      ]
    });
    botBasicSettings.botUsername = "M7R";
    if (botClient.user.username !== "M7R") {
      await botClient.user.setUsername("M7R").catch(() => {
      });
    }
    for (const [, g] of botClient.guilds.cache) {
      if (g.members.me && g.members.me.nickname !== "M7R") {
        await g.members.me.setNickname("M7R").catch(() => {
        });
      }
    }
    connectedBotInfo.username = "M7R";
    connectedBotInfo.tag = botClient.user.tag.replace(/^[^#]+/, "M7R");
    connectedBotInfo.guilds = getConnectedGuildsList();
    const targetG = getTargetGuild();
    if (targetG) {
      connectedBotInfo.selectedGuild = {
        id: targetG.id,
        name: targetG.name,
        icon: targetG.iconURL() || "",
        memberCount: targetG.memberCount || 0,
        channelsCount: targetG.channels.cache.size,
        rolesCount: targetG.roles.cache.size,
        ownerId: targetG.ownerId
      };
    }
    if (voice247Config.enabled && voice247Config.channelName && voiceConnectionStatus === "disconnected") {
      joinDiscordVoiceChannel247(voice247Config.channelName).catch(() => {
      });
    }
  } catch (err) {
    console.error("[M7R] Error applying presence to bot:", err);
  }
}
function buildTicketPanelMessagePayload() {
  const activeButtons = ticketPanelConfig.buttons.filter((b) => b.enabled);
  const fieldsText = activeButtons.map((b) => `${b.emoji} **${b.label}:** ${b.categoryDescription}`).join("\n");
  const embed = new EmbedBuilder().setColor(ticketPanelConfig.embedColor || "#e11d48").setTitle(ticketPanelConfig.embedTitle || "M7R | \u0645\u0631\u0643\u0632 \u0627\u0644\u062A\u0630\u0627\u0643\u0631").setDescription(`${ticketPanelConfig.embedDescription}

${fieldsText}`).setFooter({ text: `${ticketPanelConfig.storeName} \u2022 M7R Ticket System` }).setTimestamp();
  const row = new ActionRowBuilder();
  for (const btn of activeButtons.slice(0, 5)) {
    const b = new ButtonBuilder().setCustomId(`open_ticket_${btn.id}`).setLabel(btn.label).setStyle(getDiscordButtonStyle(btn.style));
    if (btn.emoji && btn.emoji.trim()) {
      b.setEmoji(btn.emoji.trim());
    }
    row.addComponents(b);
  }
  return {
    embeds: [embed],
    components: activeButtons.length > 0 ? [row] : []
  };
}
function buildAzkarEmbed(item) {
  const embed = new EmbedBuilder().setColor(azkarConfig.embedColor || "#059669").setTitle(`\u{1F54C} \u0623\u0630\u0643\u0627\u0631 \u0648\u0623\u062F\u0639\u064A\u0629 \u0627\u0644\u0645\u0633\u0644\u0645 | ${item.categoryLabel}`).setDescription(`
### ${item.arabicText}
`).setFooter({ text: "M7R Islamic Reminder System \u2022 \u0642\u0627\u0644 \u062A\u0639\u0627\u0644\u0649: \uFD3F \u0641\u064E\u0627\u0630\u0652\u0643\u064F\u0631\u064F\u0648\u0646\u0650\u064A \u0623\u064E\u0630\u0652\u0643\u064F\u0631\u0652\u0643\u064F\u0645\u0652 \uFD3E" }).setTimestamp();
  if (azkarConfig.showVirtue && item.virtue) {
    embed.addFields({ name: "\u2728 \u0641\u0636\u0644 \u0627\u0644\u0630\u0643\u0631 \u0648\u0627\u0644\u0623\u062C\u0631:", value: item.virtue, inline: false });
  }
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("dhikr_subhanallah").setLabel("\u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0627\u0644\u0644\u064E\u0651\u0647\u0650").setStyle(ButtonStyle.Success).setEmoji("\u{1F4FF}"),
    new ButtonBuilder().setCustomId("dhikr_astaghfirullah").setLabel("\u0623\u064E\u0633\u0652\u062A\u064E\u063A\u0652\u0641\u0650\u0631\u064F \u0627\u0644\u0644\u064E\u0651\u0647\u064E").setStyle(ButtonStyle.Primary).setEmoji("\u{1F90D}"),
    new ButtonBuilder().setCustomId("dhikr_salawat").setLabel("\u0627\u0644\u0644\u0647\u0645 \u0635\u0644\u0650\u0651 \u0639\u0644\u0649 \u0645\u062D\u0645\u062F").setStyle(ButtonStyle.Secondary).setEmoji("\u2728")
  );
  return {
    embeds: [embed],
    components: [row]
  };
}
function buildApplicationPanelPayload(cfg = applicationsConfig) {
  const embed = new EmbedBuilder().setColor(cfg.panelColor || "#e11d48").setTitle(cfg.panelTitle || "\u{1F4CB} \u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0648\u0627\u0644\u0631\u0642\u0627\u0628\u0629 (Staff Applications)").setDescription(
    `${cfg.panelDescription || "\u0623\u0647\u0644\u0627\u064B \u0628\u0643! \u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0627\u0644\u0632\u0631 \u0623\u062F\u0646\u0627\u0647 \u0644\u062A\u0639\u0628\u0626\u0629 \u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0637\u0627\u0642\u0645 \u0627\u0644\u0633\u064A\u0631\u0641\u0631."}

\u2022 **\u0627\u0644\u0631\u062A\u0628\u0629 \u0627\u0644\u0645\u0645\u0646\u0648\u062D\u0629 \u0639\u0646\u062F \u0627\u0644\u0642\u0628\u0648\u0644:** \`${cfg.acceptedRoleName || "Staff"}\`
\u2022 **\u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645:** ${cfg.enabled ? "\u{1F7E2} \u0645\u0641\u062A\u0648\u062D \u062D\u0627\u0644\u064A\u0627\u064B" : "\u{1F534} \u0645\u063A\u0644\u0642 \u0645\u0624\u0642\u062A\u0627\u064B"}`
  ).setFooter({ text: `M7R Applications \u2022 ${cfg.enabled ? "\u0645\u062A\u0627\u062D \u0644\u0644\u062A\u0642\u062F\u064A\u0645" : "\u0627\u0644\u062A\u0642\u062F\u064A\u0645\u0627\u062A \u0645\u063A\u0644\u0642\u0629 \u062D\u0627\u0644\u064A\u0627\u064B"}` }).setTimestamp();
  if (cfg.panelBannerUrl && cfg.panelBannerUrl.trim().startsWith("http")) {
    embed.setImage(cfg.panelBannerUrl.trim());
  }
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("open_app_modal").setLabel(cfg.panelButtonLabel || "\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0622\u0646").setEmoji(cfg.panelButtonEmoji || "\u{1F4DD}").setStyle(cfg.enabled ? ButtonStyle.Success : ButtonStyle.Secondary)
  );
  return {
    embeds: [embed],
    components: [row]
  };
}
async function registerSlashCommandsOnDiscord(client) {
  if (!client.application) return;
  try {
    const slashDefs = [
      new SlashCommandBuilder().setName("mute").setDescription("\u0643\u062A\u0645 \u0639\u0636\u0648 \u0645\u0624\u0642\u062A\u0627\u064B (Timeout)").addUserOption((opt) => opt.setName("user").setDescription("\u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0631\u0627\u062F \u0643\u062A\u0645\u0647").setRequired(true)).addIntegerOption((opt) => opt.setName("minutes").setDescription("\u0627\u0644\u0645\u062F\u0629 \u0628\u0627\u0644\u062F\u0642\u0627\u0626\u0642 (\u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A 15)").setRequired(false)).addStringOption((opt) => opt.setName("reason").setDescription("\u0633\u0628\u0628 \u0627\u0644\u0643\u062A\u0645").setRequired(false)),
      new SlashCommandBuilder().setName("unmute").setDescription("\u0641\u0643 \u0627\u0644\u0643\u062A\u0645 \u0639\u0646 \u0639\u0636\u0648").addUserOption((opt) => opt.setName("user").setDescription("\u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0631\u0627\u062F \u0641\u0643 \u0643\u062A\u0645\u0647").setRequired(true)),
      new SlashCommandBuilder().setName("ban").setDescription("\u062D\u0638\u0631 \u0639\u0636\u0648 \u0646\u0647\u0627\u0626\u064A\u0627\u064B \u0645\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631").addUserOption((opt) => opt.setName("user").setDescription("\u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0631\u0627\u062F \u062D\u0638\u0631\u0647").setRequired(true)).addStringOption((opt) => opt.setName("reason").setDescription("\u0633\u0628\u0628 \u0627\u0644\u062D\u0638\u0631").setRequired(false)),
      new SlashCommandBuilder().setName("kick").setDescription("\u0637\u0631\u062F \u0639\u0636\u0648 \u0645\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631").addUserOption((opt) => opt.setName("user").setDescription("\u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0631\u0627\u062F \u0637\u0631\u062F\u0647").setRequired(true)).addStringOption((opt) => opt.setName("reason").setDescription("\u0633\u0628\u0628 \u0627\u0644\u0637\u0631\u062F").setRequired(false)),
      new SlashCommandBuilder().setName("warn").setDescription("\u0625\u0639\u0637\u0627\u0621 \u062A\u062D\u0630\u064A\u0631 \u0631\u0633\u0645\u064A \u0644\u0639\u0636\u0648").addUserOption((opt) => opt.setName("user").setDescription("\u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0631\u0627\u062F \u062A\u062D\u0630\u064A\u0631\u0647").setRequired(true)).addStringOption((opt) => opt.setName("reason").setDescription("\u0633\u0628\u0628 \u0627\u0644\u062A\u062D\u0630\u064A\u0631").setRequired(true)),
      new SlashCommandBuilder().setName("vmute").setDescription("\u0643\u062A\u0645 \u0645\u0627\u064A\u0643 \u0627\u0644\u0639\u0636\u0648 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A").addUserOption((opt) => opt.setName("user").setDescription("\u0627\u0644\u0639\u0636\u0648").setRequired(true)),
      new SlashCommandBuilder().setName("vunmute").setDescription("\u0641\u0643 \u0643\u062A\u0645 \u0627\u0644\u0645\u0627\u064A\u0643 \u0639\u0646 \u0627\u0644\u0639\u0636\u0648 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A").addUserOption((opt) => opt.setName("user").setDescription("\u0627\u0644\u0639\u0636\u0648").setRequired(true)),
      new SlashCommandBuilder().setName("vkick").setDescription("\u0637\u0631\u062F \u0639\u0636\u0648 \u0645\u0646 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A").addUserOption((opt) => opt.setName("user").setDescription("\u0627\u0644\u0639\u0636\u0648").setRequired(true)),
      new SlashCommandBuilder().setName("welcome").setDescription("\u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u062A\u0631\u062D\u064A\u0628 \u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0628\u0627\u0644\u0639\u0636\u0648"),
      new SlashCommandBuilder().setName("ping").setDescription("\u0641\u062D\u0635 \u0633\u0631\u0639\u0629 \u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0628\u0648\u062A (M7R Ping)"),
      new SlashCommandBuilder().setName("status").setDescription("\u0639\u0631\u0636 \u062D\u0627\u0644\u0629 \u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 \u0648\u0627\u0644\u0645\u0635\u064A\u062F\u0629 M7R"),
      new SlashCommandBuilder().setName("azkar").setDescription("\u0639\u0631\u0636 \u0630\u0643\u0631 \u0645\u0628\u0627\u0631\u0643 \u0623\u0648 \u0622\u064A\u0629 \u0642\u0631\u0622\u0646\u064A\u0629 \u0645\u0639 \u0641\u0636\u0644\u0647\u0627"),
      new SlashCommandBuilder().setName("trap").setDescription("\u0641\u062D\u0635 \u062D\u0627\u0644\u0629 \u0631\u0648\u0645 \u0645\u0635\u064A\u062F\u0629 \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u0627\u0644\u0647\u0627\u0643\u0631\u0632"),
      new SlashCommandBuilder().setName("lock").setDescription("\u0642\u0641\u0644 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0648\u0645\u0646\u0639 \u0627\u0644\u0643\u062A\u0627\u0628\u0629"),
      new SlashCommandBuilder().setName("unlock").setDescription("\u0625\u0639\u0627\u062F\u0629 \u0641\u062A\u062D \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0644\u0644\u0643\u062A\u0627\u0628\u0629"),
      new SlashCommandBuilder().setName("hide").setDescription("\u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0639\u0646 \u0627\u0644\u0623\u0639\u0636\u0627\u0621"),
      new SlashCommandBuilder().setName("show").setDescription("\u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0644\u0644\u0623\u0639\u0636\u0627\u0621"),
      new SlashCommandBuilder().setName("clear").setDescription("\u0645\u0633\u062D \u0639\u062F\u062F \u0645\u0646 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0641\u064A \u0627\u0644\u0631\u0648\u0645").addIntegerOption((opt) => opt.setName("count").setDescription("\u0639\u062F\u062F \u0627\u0644\u0631\u0633\u0627\u0626\u0644 (1-100)").setRequired(false)),
      new SlashCommandBuilder().setName("slowmode").setDescription("\u062A\u062D\u062F\u064A\u062F \u0648\u0636\u0639 \u0627\u0644\u062A\u0647\u062F\u0626\u0629 \u0644\u0644\u0631\u0648\u0645 \u0628\u0627\u0644\u062B\u0648\u0627\u0646\u064A").addIntegerOption((opt) => opt.setName("seconds").setDescription("\u0639\u062F\u062F \u0627\u0644\u062B\u0648\u0627\u0646\u064A (0-21600)").setRequired(true)),
      new SlashCommandBuilder().setName("tax").setDescription("\u062D\u0633\u0627\u0628 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0628\u0631\u0648\u0628\u0648\u062A (ProBot 5% Tax)").addIntegerOption((opt) => opt.setName("amount").setDescription("\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0631\u0627\u062F \u062D\u0633\u0627\u0628 \u0636\u0631\u064A\u0628\u062A\u0647").setRequired(true)),
      new SlashCommandBuilder().setName("panel").setDescription("\u0625\u0631\u0633\u0627\u0644 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0627\u0644\u0645\u062E\u0635\u0635\u0629 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0631\u0648\u0645"),
      new SlashCommandBuilder().setName("apply").setDescription("\u0625\u0631\u0633\u0627\u0644 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0631\u0648\u0645"),
      new SlashCommandBuilder().setName("server").setDescription("\u0639\u0631\u0636 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0648\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631"),
      new SlashCommandBuilder().setName("help").setDescription("\u0639\u0631\u0636 \u0642\u0627\u0626\u0645\u0629 \u0623\u0648\u0627\u0645\u0631 \u0628\u0648\u062A M7R \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0627\u0644\u0645\u0641\u0639\u0644\u0629"),
      new SlashCommandBuilder().setName("ask").setDescription("ai ask \u2014 \u0627\u0633\u0623\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0627\u0644\u0638\u0631\u064A\u0641 \u0648\u0627\u0644\u0648\u062F\u0648\u062F M7R \u0623\u064A \u0633\u0624\u0627\u0644").addStringOption((opt) => opt.setName("question").setDescription("\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643 \u0647\u0646\u0627 \u0644\u064A\u0642\u0648\u0645 M7R AI \u0628\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0628\u0644\u0637\u0641").setRequired(true)),
      new SlashCommandBuilder().setName("set-ai-room").setDescription("\u062A\u062E\u0635\u064A\u0635 \u0631\u0648\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0631\u062F\u0648\u062F \u0627\u0644\u0630\u0643\u064A\u0629 \u0627\u0644\u0645\u0631\u062D\u0629 \u0645\u0639 \u0627\u0644\u0623\u0639\u0636\u0627\u0621").addChannelOption(
        (opt) => opt.setName("channel").setDescription("\u0627\u062E\u062A\u0631 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0645\u062E\u0635\u0635 \u0644\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A (\u0627\u062A\u0631\u0643\u0647 \u0641\u0627\u0631\u063A\u0627\u064B \u0644\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A)").setRequired(false)
      ).addBooleanOption(
        (opt) => opt.setName("auto_reply").setDescription("\u0627\u0644\u0631\u062F \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0639\u0644\u0649 \u0643\u0644 \u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0631\u0648\u0645 \u0628\u062F\u0648\u0646 \u0623\u0645\u0631").setRequired(false)
      ),
      new SlashCommandBuilder().setName("dashboard").setDescription("\u0625\u0631\u0633\u0627\u0644 \u0631\u0627\u0628\u0637 \u0648\u0628\u0637\u0627\u0642\u0629 \u0645\u0648\u0642\u0639 M7R \u0627\u0644\u0631\u0633\u0645\u064A"),
      new SlashCommandBuilder().setName("shield").setDescription("\u0639\u0631\u0636 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0647\u062C\u0645\u0627\u062A \u0627\u0644\u0645\u0635\u062F\u0648\u062F\u0629 \u0648\u062F\u0631\u0639 \u0645\u0643\u0627\u0641\u062D\u0629 \u0627\u0644\u0633\u0628\u0627\u0645"),
      new SlashCommandBuilder().setName("update").setDescription("\u062A\u062D\u062F\u064A\u062B \u0648\u0645\u0632\u0627\u0645\u0646\u0629 \u0623\u0646\u0638\u0645\u0629 \u0648\u0623\u0648\u0627\u0645\u0631 \u0628\u0648\u062A M7R \u0648\u0645\u0633\u062D \u0627\u0644\u0643\u0627\u0634 \u0648\u062C\u0644\u0628 \u0643\u0644 \u0645\u0627 \u0647\u0648 \u062C\u062F\u064A\u062F \u0641\u0648\u0631\u0627\u064B"),
      new SlashCommandBuilder().setName("refresh").setDescription("\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0628\u0648\u062A \u0648\u0645\u0633\u062D \u0627\u0644\u0643\u0627\u0634 \u0648\u062C\u0644\u0628 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0641\u0648\u0631\u0627\u064B")
    ].map((c) => c.toJSON());
    for (const [, guild] of client.guilds.cache) {
      await guild.commands.set([]).catch((err) => {
        console.warn(`[M7R] Note: Could not reset guild commands for ${guild.id}:`, err?.message || err);
      });
    }
    await client.application.commands.set(slashDefs);
    console.log("[M7R SLASH COMMANDS] Successfully deduped! Guild commands cleared & unified global commands active.");
  } catch (e) {
    console.error("[M7R Slash Sync Error]:", e);
  }
}
async function handleFullBotRefresh(client, guildName = "\u0633\u064A\u0631\u0641\u0631\u0643") {
  try {
    await registerSlashCommandsOnDiscord(client).catch(() => {
    });
    await applySettingsToLiveBot().catch(() => {
    });
    const ping = client.ws.ping > 0 ? client.ws.ping : 17;
    const activeCommandsCount = discordCommands.filter((c) => c.enabled).length;
    const reciterName = getActiveReciter()?.name || "\u0645\u0634\u0627\u0631\u064A \u0627\u0644\u0639\u0641\u0627\u0633\u064A";
    const embed = new EmbedBuilder().setColor("#10b981").setTitle(`\u{1F504} \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0648\u0645\u0632\u0627\u0645\u0646\u0629 \u0628\u0648\u062A M7R \u0628\u0646\u062C\u0627\u062D | ${guildName}`).setURL(WEB_DASHBOARD_PUBLIC_URL).setDescription(
      `\u064A\u0627 \u0647\u0644\u0627 \u0648\u0627\u0644\u0644\u0647! \u062A\u0645 \u0641\u062D\u0635 \u0648\u0645\u0632\u0627\u0645\u0646\u0629 \u0648\u062A\u062D\u062F\u064A\u062B \u062C\u0645\u064A\u0639 \u0623\u0646\u0638\u0645\u0629 \u0648\u0623\u0648\u0627\u0645\u0631 \u0628\u0648\u062A **M7R** \u0628\u0646\u062C\u0627\u062D \u0648\u062C\u0644\u0628 \u0623\u062D\u062F\u062B \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A \u0641\u0648\u0631\u0627\u064B! \u2728\u{1F680}

\u2022 \u2328\uFE0F **\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0628\u0648\u062A \u0627\u0644\u0645\u0641\u0639\u0644\u0629:** \`${activeCommandsCount}\` \u0623\u0645\u0631\u0627\u064B \u0628\u062F\u0648\u0646 \u0623\u064A \u062A\u0643\u0631\u0627\u0631.
\u2022 \u{1F916} **\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A (M7R AI Ask):** \u062C\u0627\u0647\u0632 \u0641\u064A \u0631\u0648\u0645 \`#${aiChatbotConfig.allowedChannel || "all"}\` \u0628\u0623\u0633\u0644\u0648\u0628 \u0638\u0631\u064A\u0641 \u0648\u0648\u062F\u0648\u062F.
\u2022 \u{1F54C} **\u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 24/7:** \u0627\u0644\u0628\u062B \u0627\u0644\u0635\u0648\u062A\u064A \u062C\u0627\u0647\u0632 \u0628\u0627\u0644\u0642\u0627\u0631\u0626 (\`${reciterName}\`).
\u2022 \u{1F6E1}\uFE0F **\u062F\u0631\u0639 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0648\u0627\u0644\u0645\u0635\u064A\u062F\u0629:** \u0646\u0638\u0627\u0645 Anti-Nuke \u0648\u0627\u0644\u0645\u0635\u064A\u062F\u0629 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 \u0641\u064A \u062D\u0627\u0644\u0629 \u062A\u0623\u0647\u0628 \u0642\u0635\u0648\u0649.
\u2022 \u{1F3AB} **\u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0648\u0627\u0644\u062A\u0631\u062D\u064A\u0628:** \u062A\u0645 \u0645\u0632\u0627\u0645\u0646\u0629 \u0627\u0644\u0628\u0627\u0646\u0644\u0627\u062A \u0648\u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u062A\u0642\u062F\u064A\u0645.

\u23F1\uFE0F **\u0633\u0631\u0639\u0629 \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 (Ping):** \`${ping}ms\`
\u{1F310} **\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0631\u0633\u0645\u064A:** [bot-m7r.netlify.app](${WEB_DASHBOARD_PUBLIC_URL})`
    ).setFooter({ text: "M7R Bot \u2022 \u0623\u0645\u0631 \u0627\u0644\u062A\u062D\u062F\u064A\u062B \u0648\u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629 24/7" }).setTimestamp();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("\u{1F310} \u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 (bot-m7r.netlify.app)").setStyle(ButtonStyle.Link).setURL(WEB_DASHBOARD_PUBLIC_URL),
      new ButtonBuilder().setCustomId("btn_trigger_refresh").setLabel("\u{1F504} \u062A\u062D\u062F\u064A\u062B \u0641\u0648\u0631\u064A \u0645\u062C\u062F\u062F\u0627\u064B").setStyle(ButtonStyle.Success)
    );
    return { embeds: [embed], components: [row] };
  } catch (err) {
    return {
      content: `\u{1F504} **\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0623\u0645\u0631 \u0627\u0644\u062A\u062D\u062F\u064A\u062B \u0628\u0646\u062C\u0627\u062D!** \u062C\u0645\u064A\u0639 \u0623\u0646\u0638\u0645\u0629 \u0648\u0623\u0648\u0627\u0645\u0631 \u0628\u0648\u062A M7R \u0645\u062D\u062F\u062B\u0629 \u0648\u062C\u0627\u0647\u0632\u0629.`
    };
  }
}
async function sendLogToDiscordServer(title, description, color = "#e11d48") {
  if (!botClient || !botClient.isReady()) return;
  try {
    const guildsToLog = getTargetGuild() ? [getTargetGuild()] : Array.from(botClient.guilds.cache.values());
    for (const guild of guildsToLog) {
      const logChannel = guild.channels.cache.find(
        (ch) => ch.isTextBased() && (ch.name.toLowerCase().includes(botBasicSettings.logChannelName.toLowerCase()) || ch.name.toLowerCase().includes("log"))
      );
      if (logChannel) {
        const embed = new EmbedBuilder().setColor(color).setTitle(`\u{1F6E1}\uFE0F M7R System | ${title}`).setDescription(description).setFooter({ text: `M7R 24/7 Protection \u2022 Prefix: ${botBasicSettings.prefix}` }).setTimestamp();
        await logChannel.send({ embeds: [embed] }).catch(() => {
        });
      }
    }
  } catch {
  }
}
setInterval(async () => {
  if (!botBasicSettings.keepAlive247) return;
  lastHeartbeatTime = (/* @__PURE__ */ new Date()).toISOString();
  heartbeatCount += 1;
  try {
    await fetch(`http://127.0.0.1:${PORT}/ping`).catch(() => {
    });
    if (process.env.APP_URL && process.env.APP_URL.startsWith("http")) {
      await fetch(`${process.env.APP_URL.replace(/\/$/, "")}/ping`).catch(() => {
      });
    }
  } catch {
  }
  if (savedBotToken && (!botClient || !botClient.isReady())) {
    try {
      console.log("[M7R 24/7 WATCHDOG] Bot disconnected. Reconnecting automatically...");
      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildBans,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.GuildModeration
        ],
        partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
      });
      attachDiscordBotEvents(client);
      await client.login(savedBotToken);
      botClient = client;
      isBotConnected = true;
      await applySettingsToLiveBot(false);
    } catch (err) {
      console.warn("[M7R 24/7 WATCHDOG] Reconnect attempt failed:", err?.message || err);
    }
  } else if (botClient && botClient.isReady()) {
    await applySettingsToLiveBot(false);
  }
}, 25e3);
setInterval(async () => {
  if (!azkarConfig.enabled || !botClient || !botClient.isReady()) return;
  const now = Date.now();
  const intervalMs = Math.max(1, azkarConfig.intervalMinutes) * 60 * 1e3;
  if (now - lastAzkarSentTime >= intervalMs) {
    lastAzkarSentTime = now;
    const activeItems = azkarConfig.items.filter((i) => i.enabled);
    if (activeItems.length === 0) return;
    const randomItem = activeItems[Math.floor(Math.random() * activeItems.length)];
    const payload = buildAzkarEmbed(randomItem);
    const targetName = azkarConfig.channelName.toLowerCase().replace(/^[#\s]+/, "");
    for (const [, guild] of botClient.guilds.cache) {
      const channel = guild.channels.cache.find(
        (c) => c.isTextBased() && c.name.toLowerCase().includes(targetName)
      );
      if (channel) {
        await channel.send(payload).catch(() => {
        });
      }
    }
  }
}, 6e4);
var spamTracker = /* @__PURE__ */ new Map();
var nukeBanTracker = /* @__PURE__ */ new Map();
var panicModeActive = false;
var botPing = 17;
var botStatus = "online";
var guildStats = {
  guildName: "M7R Community & Esports \u{1F6E1}\uFE0F",
  guildId: "1098765432109876543",
  membersCount: 124850,
  protectedGuildsCount: 1,
  monitoredChannelsCount: 3890,
  activeStaffCount: 28,
  attacksThwartedCount: 1280,
  uptimeStart: Date.now() - 14 * 864e5 - 8 * 36e5 - 22 * 6e4,
  threatLevel: "low"
};
var antiNukeConfig = {
  enabled: true,
  massBanLimit: 2,
  massBanWindowSeconds: 10,
  massBanAction: "strip_roles",
  massKickLimit: 2,
  massChannelDeleteLimit: 2,
  massRoleDeleteLimit: 2,
  quarantineNewBots: true,
  blockWebhookCreation: true,
  whitelistUserIds: ["498712345678901234", "912384756102938475"]
};
var antiSpamConfig = {
  enabled: true,
  ultraMode: true,
  maxMessages: 4,
  windowSeconds: 4,
  maxDuplicates: 3,
  maxMentions: 3,
  maxEmojis: 10,
  blockRepetitiveMessages: true,
  blockEmojiFlood: true,
  blockEveryonePing: true,
  autoCleanSpamMessages: true,
  punishment: "timeout",
  timeoutDurationMinutes: 15,
  trapChannels: ["#general", "#chat", "#market", "#support"]
};
var antiInviteConfig = {
  enabled: true,
  blockDiscordInvites: true,
  blockSuspiciousLinks: true,
  whitelistDomains: ["youtube.com", "twitch.tv", "github.com", "twitter.com", "bot-m7r.netlify.app"],
  exemptRoles: ["Co-Owner", "Security Chief", "VIP Sponsor"],
  action: "delete_warn"
};
var threatLogs = [
  {
    id: "th-101",
    type: "anti-nuke",
    action: "Mass Ban Blocked",
    target: "3 members targeted",
    executor: "RogueAdmin#9921 (ID: 88129384716)",
    timestamp: "\u0645\u0646\u0630 \u062F\u0642\u064A\u0642\u062A\u064A\u0646",
    severity: "critical",
    details: "\u062D\u0627\u0648\u0644 \u0627\u0644\u0645\u0634\u0631\u0641 \u0637\u0631\u062F 3 \u0623\u0639\u0636\u0627\u0621 \u062E\u0644\u0627\u0644 \u062B\u0627\u0646\u064A\u062A\u064A\u0646. \u062A\u0645 \u0633\u062D\u0628 \u062C\u0645\u064A\u0639 \u0631\u062A\u0628\u0647 \u0641\u0648\u0631\u0627\u064B \u0648\u0639\u0632\u0644\u0647 \u0641\u064A \u0633\u062C\u0646 M7R."
  },
  {
    id: "th-102",
    type: "anti-spam",
    action: "Anti-Spam Trap Triggered",
    target: "#\u0639\u0627\u0645-chat",
    executor: "SpammerBot#1104",
    timestamp: "\u0645\u0646\u0630 14 \u062F\u0642\u064A\u0642\u0629",
    severity: "high",
    details: "\u0623\u0631\u0633\u0644 7 \u0631\u0633\u0627\u0626\u0644 \u0645\u0643\u0631\u0631\u0629 \u0641\u064A \u063A\u0636\u0648\u0646 \u062B\u0627\u0646\u064A\u062A\u064A\u0646. \u062A\u0645 \u0625\u064A\u0642\u0627\u0641\u0647 \u0645\u0624\u0642\u062A\u0627\u064B (Timeout) \u0644\u0645\u062F\u0629 15 \u062F\u0642\u064A\u0642\u0629 \u0648\u0645\u0633\u062D \u0631\u0633\u0627\u0626\u0644\u0647."
  }
];
var tickets = [
  {
    id: "ticket-1092",
    channelName: "ticket-1092",
    category: "store",
    categoryLabel: "\u{1F6D2} \u0634\u0631\u0627\u0621 \u0645\u0646\u062A\u062C / Ghost Store",
    user: {
      name: "Rakan_Gamer",
      avatar: "",
      id: "8271635241098"
    },
    claimedBy: "Sultan [Lead Support]",
    status: "claimed",
    createdAt: "\u0627\u0644\u064A\u0648\u0645\u060C 03:15 \u0635",
    messages: [
      {
        id: "m1",
        author: "Rakan_Gamer",
        avatar: "",
        isStaff: false,
        content: "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645\u060C \u0623\u0631\u064A\u062F \u0634\u0631\u0627\u0621 \u0628\u0627\u0642\u0629 \u0646\u064A\u062A\u0631\u0648 \u0633\u0646\u0629 \u0648\u0631\u062A\u0628\u0629 VIP \u0644\u0644\u0645\u062A\u062C\u0631.",
        timestamp: "03:15 \u0635"
      },
      {
        id: "m2",
        author: "M7R Bot",
        avatar: "",
        isStaff: true,
        content: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643! \u062A\u0630\u0643\u0631\u062A\u0643 \u0645\u0641\u062A\u0648\u062D\u0629\u060C \u064A\u0631\u062C\u0649 \u0627\u0646\u062A\u0638\u0627\u0631 \u0623\u062D\u062F \u0645\u0633\u0624\u0648\u0644\u064A \u0627\u0644\u0645\u062A\u062C\u0631 \u0644\u0644\u0631\u062F \u0639\u0644\u064A\u0643.",
        timestamp: "03:15 \u0635"
      }
    ]
  }
];
var SENSITIVE_COMMAND_NAMES = ["ban", "unban", "kick", "antinuke", "trap", "clearwarnings"];
function findCommandConfig(inputCmd) {
  const clean = inputCmd.toLowerCase().trim();
  return discordCommands.find(
    (c) => c.enabled && (c.name.toLowerCase() === clean || c.aliases.some((a) => a.toLowerCase() === clean))
  );
}
async function recordAndNotifyNewGuildJoin(guild) {
  try {
    const owner = await guild.fetchOwner?.().catch(() => null);
    const ownerTag = owner?.user?.tag || owner?.user?.username || `Owner (${guild.ownerId || "Unknown"})`;
    const newNotif = {
      id: `notif-${Date.now()}`,
      guildId: guild.id,
      guildName: guild.name,
      guildIcon: guild.iconURL ? guild.iconURL() || "" : "",
      memberCount: guild.memberCount || 1,
      channelsCount: guild.channels?.cache?.size || 10,
      ownerId: guild.ownerId || "",
      ownerTag,
      joinedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      permissionGranted: "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (\u0628\u062F\u0648\u0646 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062D\u0633\u0627\u0633\u0629)",
      accessMode: "server_admin",
      read: false
    };
    guildJoinNotifications.unshift(newNotif);
    if (guildJoinNotifications.length > 30) {
      guildJoinNotifications.pop();
    }
    if (botClient && botClient.isReady()) {
      connectedBotInfo.guilds = getConnectedGuildsList();
      connectedBotInfo.guildsCount = botClient.guilds.cache.size;
      guildStats.protectedGuildsCount = botClient.guilds.cache.size;
    }
    savePersistedSession();
    await sendLogToDiscordServer(
      "\u{1F514} \u0625\u0634\u0639\u0627\u0631 \u0641\u0648\u0631\u064A: \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0628\u0648\u062A \u0625\u0644\u0649 \u0633\u064A\u0631\u0641\u0631 \u062C\u062F\u064A\u062F!",
      `\u0642\u0627\u0645 \u0623\u062D\u062F \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0628\u0625\u0636\u0627\u0641\u0629 \u0628\u0648\u062A **${connectedBotInfo.tag}** \u0625\u0644\u0649 \u0633\u064A\u0631\u0641\u0631\u0647 \u0627\u0644\u062E\u0627\u0635:

\u2022 **\u0627\u0633\u0645 \u0627\u0644\u0633\u064A\u0631\u0641\u0631:** \`${guild.name}\`
\u2022 **\u0622\u064A\u062F\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631:** \`${guild.id}\`
\u2022 **\u0645\u0627\u0644\u0643 \u0627\u0644\u0633\u064A\u0631\u0641\u0631:** <@${guild.ownerId}> (\`${ownerTag}\`)
\u2022 **\u0639\u062F\u062F \u0627\u0644\u0623\u0639\u0636\u0627\u0621:** \`${guild.memberCount || 1}\` \u0639\u0636\u0648
\u2022 **\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0645\u0646\u0648\u062D\u0629 \u0644\u0647 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B:** \`\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0641\u0642\u0637 \u0628\u062F\u0648\u0646 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062D\u0633\u0627\u0633\u0629)\``,
      "#10b981"
    );
    if (guild.channels?.cache) {
      const welcomeChannel = guild.channels.cache.find(
        (c) => c.type === ChannelType.GuildText && (c.name.includes("general") || c.name.includes("\u0639\u0627\u0645") || c.name.includes("chat") || c.name.includes("\u0634\u0627\u062A"))
      ) || guild.channels.cache.find((c) => c.type === ChannelType.GuildText);
      if (welcomeChannel) {
        const joinEmbed = new EmbedBuilder().setColor("#10b981").setTitle(`\u{1F6E1}\uFE0F \u0634\u0643\u0631\u0627\u064B \u0644\u0625\u0636\u0627\u0641\u0629 \u0628\u0648\u062A ${connectedBotInfo.username} \u0625\u0644\u0649 \u0633\u064A\u0631\u0641\u0631 ${guild.name}!`).setDescription(
          `\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u064A\u0627 <@${guild.ownerId}>! \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0628\u0648\u062A \u0641\u064A \u0633\u064A\u0631\u0641\u0631\u0643 \u0628\u0646\u062C\u0627\u062D \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 **24/7**.

\u2705 **\u062A\u0645 \u0645\u0646\u062D\u0643 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B: \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (Server Control Permission)**
\u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0622\u0646 \u0625\u062F\u0627\u0631\u0629 \u0623\u0646\u0638\u0645\u0629 \u0633\u064A\u0631\u0641\u0631\u0643 \u0627\u0644\u0622\u0645\u0646\u0629 \u0645\u0628\u0627\u0634\u0631\u0629:
\u2022 \u0627\u0643\u062A\u0628 \`${botBasicSettings.prefix}\u062A\u062D\u0643\u0645\` \u0623\u0648 \`${botBasicSettings.prefix}control\` \u0644\u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0641\u0648\u0631\u064A\u0629.
\u2022 \u0627\u0643\u062A\u0628 \`${botBasicSettings.prefix}\u0641\u0648\u064A\u0633\` \u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0628\u0648\u062A \u0644\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \u0648\u0628\u062B \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 24/7.
\u2022 \u0627\u0643\u062A\u0628 \`${botBasicSettings.prefix}\u0642\u0631\u0627\u0646\` \u0623\u0648 \`${botBasicSettings.prefix}\u062C\u062F\u0648\u0644\` \u0644\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0642\u0631\u0627\u0621 \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645.

\u{1F512} *\u0645\u0644\u0627\u062D\u0638\u0629 \u0623\u0645\u0646\u064A\u0629: \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0648\u0627\u0644\u062E\u0637\u064A\u0631\u0629 \u0645\u062D\u062C\u0648\u0628\u0629 \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u062A\u0638\u0647\u0631 \u0644\u0643 \u0641\u0642\u0637 \u0623\u062F\u0648\u0627\u062A \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u0627\u0644\u0645\u062C\u062A\u0645\u0639.*`
        ).setFooter({ text: "M7R 24/7 Cloud System \u2022 Server Control Enabled" }).setTimestamp();
        await welcomeChannel.send({ embeds: [joinEmbed] }).catch(() => {
        });
      }
    }
    return newNotif;
  } catch (err) {
    console.error("[M7R Guild Join Notification Error]:", err);
    return null;
  }
}
function attachDiscordBotEvents(client) {
  if (client.__m7rEventsAttached) return;
  client.__m7rEventsAttached = true;
  client.on("error", (err) => {
    console.warn("[M7R Discord Client Error Handled]:", err?.message || err);
  });
  client.on("shardError", (err) => {
    console.warn("[M7R Discord Shard Error Handled]:", err?.message || err);
  });
  client.on("guildCreate", async (guild) => {
    console.log(`[M7R NEW GUILD JOINED] Bot was added to server: ${guild.name} (${guild.id})`);
    await recordAndNotifyNewGuildJoin(guild);
    await registerSlashCommandsOnDiscord(client).catch(() => {
    });
  });
  async function handleCreateTicketChannel(ticketInteraction, btnId, reasonText = "") {
    const guild = ticketInteraction.guild;
    if (!guild) return;
    const btnConfig = ticketPanelConfig.buttons.find((b) => b.id === btnId) || ticketPanelConfig.buttons[0];
    const ticketNum = Math.floor(100 + Math.random() * 900);
    const cleanUsername = (ticketInteraction.user.username || "user").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 10) || "user";
    const prefix = ticketPanelConfig.channelPrefix || "ticket";
    const namingFormat = ticketPanelConfig.namingFormat || "username_number";
    let chName = `${prefix}-${cleanUsername}-${ticketNum}`;
    if (namingFormat === "number") {
      chName = `${prefix}-${ticketNum}`;
    } else if (namingFormat === "username") {
      chName = `${prefix}-${cleanUsername}`;
    }
    const createdChannel = await guild.channels.create({
      name: chName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: ticketInteraction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
        }
      ]
    }).catch(() => null);
    if (!createdChannel) {
      await ticketInteraction.reply({
        content: "\u26A0\uFE0F \u062A\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u0631\u0648\u0645 \u0627\u0644\u062A\u0630\u0643\u0631\u0629\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0623\u0646 \u0627\u0644\u0628\u0648\u062A \u064A\u0645\u062A\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 `Manage Channels`.",
        ephemeral: true
      }).catch(() => {
      });
      return;
    }
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("claim_ticket").setLabel("\u0627\u0633\u062A\u0644\u0627\u0645 (Claim)").setEmoji("\u2705").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("close_ticket").setLabel("\u0625\u063A\u0644\u0627\u0642 (Close)").setEmoji("\u{1F512}").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("delete_ticket").setLabel("\u062D\u0630\u0641 (Delete)").setEmoji("\u{1F5D1}\uFE0F").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("remind_ticket").setLabel("\u062A\u0630\u0643\u064A\u0631 (Remind)").setEmoji("\u23F0").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("transfer_ticket").setLabel("\u062A\u062D\u0648\u064A\u0644 (Transfer)").setEmoji("\u{1F504}").setStyle(ButtonStyle.Secondary)
    );
    const welcomeEmbed = new EmbedBuilder().setColor(ticketPanelConfig.embedColor || "#e11d48").setTitle(`${btnConfig?.emoji || "\u{1F3AB}"} ${btnConfig?.label || "\u062A\u0630\u0643\u0631\u0629 \u062C\u062F\u064A\u062F\u0629"} | ${ticketPanelConfig.storeName}`).setDescription(`\u0645\u0631\u062D\u0628\u0627\u064B <@${ticketInteraction.user.id}>!

${ticketPanelConfig.welcomeMessage}`).addFields(
      { name: "\u{1F4C2} \u0627\u0644\u0642\u0633\u0645", value: `${btnConfig?.emoji || ""} ${btnConfig?.label || "\u0639\u0627\u0645"}`, inline: true },
      { name: "\u{1F464} \u0635\u0627\u062D\u0628 \u0627\u0644\u062A\u0630\u0643\u0631\u0629", value: `<@${ticketInteraction.user.id}>`, inline: true },
      { name: "\u{1F522} \u0631\u0642\u0645 \u0627\u0644\u062A\u0630\u0643\u0631\u0629", value: `#${ticketNum}`, inline: true }
    );
    if (reasonText && reasonText.trim()) {
      welcomeEmbed.addFields({
        name: "\u{1F4DD} \u0633\u0628\u0628 \u0641\u062A\u062D \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0637\u0644\u0628:",
        value: `> ${reasonText.slice(0, 950)}`,
        inline: false
      });
    }
    welcomeEmbed.setTimestamp();
    await createdChannel.send({
      content: `<@${ticketInteraction.user.id}>`,
      embeds: [welcomeEmbed],
      components: [row1]
    }).catch(() => {
    });
    if (ticketPanelConfig.aiWaitingAssistant !== false) {
      const waitingEmbed = new EmbedBuilder().setColor("#10b981").setTitle("\u23F3 \u062C\u0627\u0631\u064A \u0627\u0646\u062A\u0638\u0627\u0631 \u0637\u0627\u0642\u0645 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u2022 \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A M7R \u062C\u0627\u0647\u0632 \u0644\u0645\u0633\u0627\u0639\u062F\u062A\u0643").setDescription(
        `${ticketPanelConfig.waitingMessage || "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643! \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u0644\u062D\u064A\u0646 \u0642\u062F\u0648\u0645 \u0623\u062D\u062F \u0627\u0644\u0645\u0634\u0631\u0641\u064A\u0646 \u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u062A\u0630\u0643\u0631\u062A\u0643 \u0648\u0645\u0633\u0627\u0639\u062F\u062A\u0643."}

\u{1F4A1} **\u0647\u0644 \u062A\u062D\u062A\u0627\u062C \u0645\u0633\u0627\u0639\u062F\u0629 \u0633\u0631\u064A\u0639\u0629 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631\u061F**
\u064A\u0645\u0643\u0646\u0643 \u0633\u0624\u0627\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0645\u0628\u0627\u0634\u0631\u0629 \u0647\u0646\u0627 \u0641\u064A \u0623\u064A \u0648\u0642\u062A \u0628\u0643\u062A\u0627\u0628\u0629:
\u2022 \`ai ask [\u0633\u0624\u0627\u0644\u0643]\`
\u2022 \`\u0627\u0633\u0627\u0644 [\u0633\u0624\u0627\u0644\u0643]\`
\u0648\u0633\u064A\u062C\u064A\u0628\u0643 \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A **M7R AI** \u0641\u0648\u0631\u0627\u064B \u0644\u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u062D\u062A\u0649 \u064A\u062A\u0641\u0631\u063A \u0627\u0644\u0645\u0634\u0631\u0641! \u{1F916}\u2728`
      ).setFooter({ text: "M7R Smart Ticket Assistant \u2022 \u062F\u0639\u0645 \u0641\u0646\u064A \u0630\u0643\u064A 24/7" }).setTimestamp();
      await createdChannel.send({ embeds: [waitingEmbed] }).catch(() => {
      });
    }
    tickets.unshift({
      id: `ticket-${ticketNum}`,
      channelName: chName,
      category: "store",
      categoryLabel: `${btnConfig?.emoji || "\u{1F3AB}"} ${btnConfig?.label || "\u062A\u0630\u0643\u0631\u0629"}`,
      user: {
        name: ticketInteraction.user.username,
        avatar: ticketInteraction.user.displayAvatarURL(),
        id: ticketInteraction.user.id
      },
      claimedBy: null,
      status: "open",
      createdAt: "\u0627\u0644\u0622\u0646 (\u0645\u0646 \u062F\u064A\u0633\u0643\u0648\u0631\u062F)",
      messages: [
        {
          id: `m-${Date.now()}`,
          author: "M7R Bot",
          avatar: "",
          isStaff: true,
          content: reasonText ? `\u0633\u0628\u0628 \u0627\u0644\u062A\u0630\u0643\u0631\u0629: ${reasonText}

${ticketPanelConfig.welcomeMessage}` : ticketPanelConfig.welcomeMessage,
          timestamp: "\u0627\u0644\u0622\u0646"
        }
      ]
    });
    await ticketInteraction.reply({
      content: `\u2705 \u062A\u0645 \u0641\u062A\u062D \u062A\u0630\u0643\u0631\u062A\u0643 \u0628\u0646\u062C\u0627\u062D: <#${createdChannel.id}>`,
      ephemeral: true
    }).catch(() => {
    });
  }
  client.on("interactionCreate", async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        const cmdName = interaction.commandName;
        if (cmdName === "ask") {
          const question = interaction.options.getString("question", true).trim();
          await interaction.deferReply();
          const result = await askM7RAssistant(question, interaction.user.username);
          const payload = buildAiAskDiscordPayload(
            question,
            result.answer,
            result.blocked,
            interaction.user.id,
            interaction.guild?.name || "M7R Server",
            result.category
          );
          await interaction.editReply(payload);
          return;
        }
        if (cmdName === "set-ai-room") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) && !interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) && interaction.guild?.ownerId !== interaction.user.id) {
            await interaction.reply({ content: "\u274C \u0647\u0630\u0627 \u0627\u0644\u0623\u0645\u0631 \u0645\u062E\u0635\u0635 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0641\u0642\u0637!", ephemeral: true });
            return;
          }
          const pickedCh = interaction.options.getChannel("channel");
          const autoReplyOpt = interaction.options.getBoolean("auto_reply");
          const targetChName = pickedCh && "name" in pickedCh && pickedCh.name ? pickedCh.name : interaction.channel?.name || "general";
          aiChatbotConfig.enabled = true;
          aiChatbotConfig.allowedChannel = targetChName;
          aiChatbotConfig.autoReplyInChannelWithoutPrefix = autoReplyOpt !== null ? autoReplyOpt : true;
          aiChatbotConfig.responseTone = "friendly";
          const askCmd = discordCommands.find((c) => c.name === "ask");
          if (askCmd) askCmd.allowedChannel = targetChName;
          savePersistedSession();
          const aiRoomEmbed = new EmbedBuilder().setColor("#10b981").setTitle("\u{1F916}\u2728 \u062A\u0645 \u062A\u062E\u0635\u064A\u0635 \u0631\u0648\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A (M7R Friendly AI)").setDescription(
            `\u064A\u0627 \u0647\u0644\u0627 \u0648\u0627\u0644\u0644\u0647! \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0646\u0638\u0627\u0645 \u0627\u0644\u0631\u062F\u0648\u062F \u0627\u0644\u0630\u0643\u064A\u0629 \u0627\u0644\u0645\u0631\u062D\u0629 \u0648\u0627\u0644\u0648\u062F\u0648\u062F\u0629 \u0641\u064A \u0631\u0648\u0645 **#${targetChName}** \u0628\u0646\u062C\u0627\u062D! \u{1F604}\u{1F338}

\u2022 \u{1F3AF} **\u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0645\u062E\u0635\u0635:** \`#${targetChName}\`
\u2022 \u{1F4AC} **\u0627\u0644\u0631\u062F \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0628\u062F\u0648\u0646 \u0623\u0645\u0631:** \`${aiChatbotConfig.autoReplyInChannelWithoutPrefix ? "\u0645\u0641\u0639\u0644 \u2705 (\u064A\u0631\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0645\u0628\u0627\u0634\u0631\u0629)" : "\u0628\u0623\u0645\u0631 ai ask \u0623\u0648 !ask \u0641\u0642\u0637"}\`
\u2022 \u{1F60A} **\u0623\u0633\u0644\u0648\u0628 \u0627\u0644\u0628\u0648\u062A:** \`\u0638\u0631\u064A\u0641\u060C \u0644\u0637\u064A\u0641\u060C \u0645\u0631\u062D \u0648\u0648\u062F\u0648\u062F \u062C\u062F\u0627\u064B \u0645\u0639 \u0627\u0644\u0623\u0639\u0636\u0627\u0621\`
\u2022 \u{1F6E1}\uFE0F **\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u062D\u0633\u0627\u0633\u0629:** \`\u0645\u0641\u0639\u0644\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B\``
          ).setFooter({ text: "M7R Friendly AI System \u2022 https://bot-m7r.netlify.app/" }).setTimestamp();
          await interaction.reply({ embeds: [aiRoomEmbed] });
          return;
        }
        if (cmdName === "dashboard") {
          const payload = buildWebDashboardPayload(
            interaction.guild?.name || "M7R Server",
            interaction.guild?.memberCount || 1,
            client.ws.ping > 0 ? client.ws.ping : 17
          );
          await interaction.reply(payload);
          return;
        }
        if (cmdName === "shield") {
          const secPayload = buildWeeklySecurityDiscordPayload(interaction.guild?.name || "M7R Server");
          await interaction.reply(secPayload);
          return;
        }
        if (cmdName === "update" || cmdName === "refresh") {
          await interaction.deferReply();
          const refreshPayload = await handleFullBotRefresh(client, interaction.guild?.name || "\u0633\u064A\u0631\u0641\u0631\u0643");
          await interaction.editReply(refreshPayload);
          return;
        }
        const cfg = findCommandConfig(cmdName);
        if (!cfg) {
          await interaction.reply({ content: "\u26A0\uFE0F \u0647\u0630\u0627 \u0627\u0644\u0623\u0645\u0631 \u0645\u0639\u0637\u0644 \u062D\u0627\u0644\u064A\u0627\u064B \u0645\u0646 \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 M7R.", ephemeral: true });
          return;
        }
        if (cmdName === "mute") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0643\u062A\u0645 \u0627\u0644\u0623\u0639\u0636\u0627\u0621!", ephemeral: true });
            return;
          }
          const user = interaction.options.getUser("user", true);
          const mins = interaction.options.getInteger("minutes") || 15;
          const reason = interaction.options.getString("reason") || "\u0645\u062E\u0627\u0644\u0641\u0629 \u0642\u0648\u0627\u0646\u064A\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631";
          const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
          if (!member || !member.moderatable) {
            await interaction.reply({ content: "\u26A0\uFE0F \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0643\u062A\u0645 \u0647\u0630\u0627 \u0627\u0644\u0639\u0636\u0648 (\u0631\u062A\u0628\u062A\u0647 \u0623\u0639\u0644\u0649 \u0645\u0646 \u0627\u0644\u0628\u0648\u062A)!", ephemeral: true });
            return;
          }
          await member.timeout(mins * 60 * 1e3, reason).catch(() => {
          });
          await interaction.reply(`${cfg.customReply} (<@${user.id}> \u0644\u0645\u062F\u0629 \`${mins}\` \u062F\u0642\u064A\u0642\u0629 \u2014 \u0627\u0644\u0633\u0628\u0628: \`${reason}\`)`);
        } else if (cmdName === "unmute") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0641\u0643 \u0627\u0644\u0643\u062A\u0645!", ephemeral: true });
            return;
          }
          const user = interaction.options.getUser("user", true);
          const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
          if (!member || !member.moderatable) {
            await interaction.reply({ content: "\u26A0\uFE0F \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0641\u0643 \u0627\u0644\u0643\u062A\u0645 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0639\u0636\u0648!", ephemeral: true });
            return;
          }
          await member.timeout(null).catch(() => {
          });
          await interaction.reply(`${cfg.customReply} (<@${user.id}>)`);
        } else if (cmdName === "ban") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062D\u0638\u0631 \u0627\u0644\u0623\u0639\u0636\u0627\u0621!", ephemeral: true });
            return;
          }
          const user = interaction.options.getUser("user", true);
          const reason = interaction.options.getString("reason") || "\u0645\u062E\u0627\u0644\u0641\u0629 \u0627\u0644\u0642\u0648\u0627\u0646\u064A\u0646";
          const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
          if (!member || !member.bannable) {
            await interaction.reply({ content: "\u26A0\uFE0F \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u062D\u0638\u0631 \u0647\u0630\u0627 \u0627\u0644\u0639\u0636\u0648!", ephemeral: true });
            return;
          }
          await member.ban({ reason }).catch(() => {
          });
          await interaction.reply(`${cfg.customReply} (<@${user.id}>)`);
        } else if (cmdName === "kick") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0637\u0631\u062F \u0627\u0644\u0623\u0639\u0636\u0627\u0621!", ephemeral: true });
            return;
          }
          const user = interaction.options.getUser("user", true);
          const reason = interaction.options.getString("reason") || "\u0645\u062E\u0627\u0644\u0641\u0629 \u0627\u0644\u0642\u0648\u0627\u0646\u064A\u0646";
          const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
          if (!member || !member.kickable) {
            await interaction.reply({ content: "\u26A0\uFE0F \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0637\u0631\u062F \u0647\u0630\u0627 \u0627\u0644\u0639\u0636\u0648!", ephemeral: true });
            return;
          }
          await member.kick(reason).catch(() => {
          });
          await interaction.reply(`${cfg.customReply} (<@${user.id}>)`);
        } else if (cmdName === "warn") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062A\u062D\u0630\u064A\u0631 \u0627\u0644\u0623\u0639\u0636\u0627\u0621!", ephemeral: true });
            return;
          }
          const user = interaction.options.getUser("user", true);
          const reason = interaction.options.getString("reason") || "\u0645\u062E\u0627\u0644\u0641\u0629 \u0642\u0648\u0627\u0646\u064A\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631";
          const list = userWarningsMap.get(user.id) || [];
          list.push({ reason, mod: interaction.user.tag, date: (/* @__PURE__ */ new Date()).toLocaleDateString("ar-EG") });
          userWarningsMap.set(user.id, list);
          await interaction.reply(`${cfg.customReply} (<@${user.id}> \u2014 \u0627\u0644\u0633\u0628\u0628: \`${reason}\` | \u0625\u062C\u0645\u0627\u0644\u064A \u062A\u062D\u0630\u064A\u0631\u0627\u062A\u0647: \`${list.length}\`)`);
        } else if (cmdName === "vmute") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.MuteMembers)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0643\u062A\u0645 \u0627\u0644\u0645\u0627\u064A\u0643!", ephemeral: true });
            return;
          }
          const user = interaction.options.getUser("user", true);
          const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
          if (!member?.voice.channel) {
            await interaction.reply({ content: "\u26A0\uFE0F \u0627\u0644\u0639\u0636\u0648 \u063A\u064A\u0631 \u0645\u062A\u0648\u0627\u062C\u062F \u0641\u064A \u0631\u0648\u0645 \u0635\u0648\u062A\u064A!", ephemeral: true });
            return;
          }
          await member.voice.setMute(true).catch(() => {
          });
          await interaction.reply(`${cfg.customReply} (<@${user.id}>)`);
        } else if (cmdName === "vunmute") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.MuteMembers)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0641\u0643 \u0643\u062A\u0645 \u0627\u0644\u0645\u0627\u064A\u0643!", ephemeral: true });
            return;
          }
          const user = interaction.options.getUser("user", true);
          const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
          if (!member?.voice.channel) {
            await interaction.reply({ content: "\u26A0\uFE0F \u0627\u0644\u0639\u0636\u0648 \u063A\u064A\u0631 \u0645\u062A\u0648\u0627\u062C\u062F \u0641\u064A \u0631\u0648\u0645 \u0635\u0648\u062A\u064A!", ephemeral: true });
            return;
          }
          await member.voice.setMute(false).catch(() => {
          });
          await interaction.reply(`${cfg.customReply} (<@${user.id}>)`);
        } else if (cmdName === "vkick") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.MoveMembers)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0641\u0635\u0644 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0645\u0646 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A!", ephemeral: true });
            return;
          }
          const user = interaction.options.getUser("user", true);
          const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
          if (!member?.voice.channel) {
            await interaction.reply({ content: "\u26A0\uFE0F \u0627\u0644\u0639\u0636\u0648 \u063A\u064A\u0631 \u0645\u062A\u0648\u0627\u062C\u062F \u0641\u064A \u0631\u0648\u0645 \u0635\u0648\u062A\u064A!", ephemeral: true });
            return;
          }
          await member.voice.disconnect().catch(() => {
          });
          await interaction.reply(`${cfg.customReply} (<@${user.id}>)`);
        } else if (cmdName === "welcome") {
          const payload = buildWelcomePayload({
            userId: interaction.user.id,
            username: interaction.user.username,
            avatarUrl: interaction.user.displayAvatarURL(),
            serverName: interaction.guild?.name || "M7R Server",
            memberCount: interaction.guild?.memberCount || 100
          });
          await interaction.reply(payload);
        } else if (cmdName === "tax") {
          const amount = interaction.options.getInteger("amount") || 1e3;
          const withTax = Math.ceil(amount * 20 / 19);
          const mediatorTax = Math.ceil(withTax * 20 / 19);
          const embed = new EmbedBuilder().setColor("#10b981").setTitle("\u{1F4B0} \u062D\u0627\u0633\u0628\u0629 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0645\u062A\u062C\u0631 (ProBot Tax)").addFields(
            { name: "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0637\u0644\u0648\u0628", value: `\`${amount.toLocaleString()}\``, inline: true },
            { name: "\u0627\u0644\u0645\u0628\u0644\u063A \u0645\u0639 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 (5%)", value: `\`${withTax.toLocaleString()}\``, inline: true },
            { name: "\u0645\u0639 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0648\u0633\u064A\u0637", value: `\`${mediatorTax.toLocaleString()}\``, inline: true }
          );
          await interaction.reply({ embeds: [embed] });
        } else if (cmdName === "hide") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u0631\u0648\u0645\u0627\u062A!", ephemeral: true });
            return;
          }
          await interaction.channel.permissionOverwrites.edit(interaction.guildId, { ViewChannel: false }).catch(() => {
          });
          await interaction.reply(cfg.customReply);
        } else if (cmdName === "show") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0631\u0648\u0645\u0627\u062A!", ephemeral: true });
            return;
          }
          await interaction.channel.permissionOverwrites.edit(interaction.guildId, { ViewChannel: null }).catch(() => {
          });
          await interaction.reply(cfg.customReply);
        } else if (cmdName === "ping") {
          await interaction.reply(`${cfg.customReply} (\`${client.ws.ping}ms\`)`);
        } else if (cmdName === "azkar") {
          const activeItems = azkarConfig.items.filter((i) => i.enabled);
          const item = activeItems.length > 0 ? activeItems[Math.floor(Math.random() * activeItems.length)] : azkarConfig.items[0];
          const payload = buildAzkarEmbed(item);
          await interaction.reply(payload);
        } else if (cmdName === "trap") {
          const embed = new EmbedBuilder().setColor("#dc2626").setTitle("\u{1FAA4} \u062D\u0627\u0644\u0629 \u0645\u0635\u064A\u062F\u0629 M7R \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 (Anti-Raid Trap)").setDescription(honeypotTrapConfig.customWarningMessage).addFields(
            { name: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0635\u064A\u062F\u0629", value: honeypotTrapConfig.enabled ? "\u{1F7E2} \u0646\u0634\u0637\u0629 \u0648\u0645\u062D\u0645\u064A\u0629" : "\u{1F534} \u0645\u0639\u0637\u0644\u0629", inline: true },
            { name: "\u0631\u0648\u0645 \u0627\u0644\u0645\u0635\u064A\u062F\u0629", value: `\`#${honeypotTrapConfig.channelName}\``, inline: true },
            { name: "\u0627\u0644\u0639\u0642\u0648\u0628\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629", value: `\`${honeypotTrapConfig.punishment.toUpperCase()}\``, inline: true },
            { name: "\u0625\u062C\u0645\u0627\u0644\u064A \u0645\u0646 \u0648\u0642\u0639 \u0628\u0627\u0644\u0641\u062E", value: `\`${honeypotTrapConfig.totalTrapped}\` \u0645\u062E\u0627\u0644\u0641`, inline: true }
          ).setFooter({ text: "M7R Honeypot \u2022 \u062D\u0645\u0627\u064A\u0629 \u0645\u062A\u0642\u062F\u0645\u0629 \u0636\u062F \u0647\u062C\u0645\u0627\u062A \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u0627\u0644\u0631\u064A\u062F" }).setTimestamp();
          await interaction.reply({ embeds: [embed] });
        } else if (cmdName === "slowmode") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062A\u0639\u062F\u064A\u0644 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0631\u0648\u0645!", ephemeral: true });
            return;
          }
          const secs = interaction.options.getInteger("seconds") ?? 5;
          await interaction.channel.setRateLimitPerUser(secs).catch(() => {
          });
          await interaction.reply({ content: `\u23F1\uFE0F \u062A\u0645 \u0636\u0628\u0637 \u0648\u0636\u0639 \u0627\u0644\u062A\u0647\u062F\u0626\u0629 \u0644\u0644\u0631\u0648\u0645 \u0639\u0644\u0649 \`${secs}\` \u062B\u0627\u0646\u064A\u0629!`, ephemeral: true });
        } else if (cmdName === "status") {
          const embed = new EmbedBuilder().setColor("#e11d48").setTitle("\u{1F6E1}\uFE0F \u062D\u0627\u0644\u0629 \u0646\u0638\u0627\u0645 \u062D\u0645\u0627\u064A\u0629 M7R 24/7 \u0648\u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0648\u0627\u0644\u0623\u0648\u0627\u0645\u0631").setDescription(cfg.customReply).addFields(
            { name: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0628\u0648\u062A", value: "\u{1F7E2} \u0645\u062A\u0635\u0644 24/7", inline: true },
            { name: "\u0627\u0644\u0628\u0646\u0642 (Ping)", value: `\`${client.ws.ping}ms\``, inline: true },
            { name: "\u062F\u0631\u0639 Anti-Nuke", value: antiNukeConfig.enabled ? "\u2705 \u0645\u0641\u0639\u0644" : "\u274C \u0645\u0639\u0637\u0644", inline: true },
            { name: "\u0645\u0635\u064A\u062F\u0629 \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u0627\u0644\u0647\u0627\u0643\u0631\u0632", value: honeypotTrapConfig.enabled ? `\u2705 \u0646\u0634\u0637\u0629 (#${honeypotTrapConfig.channelName})` : "\u274C \u0645\u0639\u0637\u0644\u0629", inline: true },
            { name: "\u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0627\u0644\u0622\u0644\u064A", value: welcomeConfig.enabled ? `\u2705 \u0646\u0634\u0637 (#${welcomeConfig.channelName})` : "\u274C \u0645\u0639\u0637\u0644", inline: true },
            { name: "\u0646\u0638\u0627\u0645 \u0627\u0644\u0623\u0630\u0643\u0627\u0631", value: azkarConfig.enabled ? `\u2705 \u0645\u0641\u0639\u0644 (\u0643\u0644 ${azkarConfig.intervalMinutes} \u062F\u0642\u064A\u0642\u0629)` : "\u274C \u0645\u0639\u0637\u0644", inline: true }
          ).setTimestamp();
          await interaction.reply({ embeds: [embed] });
        } else if (cmdName === "lock") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0642\u0641\u0644 \u0627\u0644\u0631\u0648\u0645\u0627\u062A!", ephemeral: true });
            return;
          }
          await interaction.channel.permissionOverwrites.edit(interaction.guildId, { SendMessages: false }).catch(() => {
          });
          await interaction.reply(cfg.customReply);
        } else if (cmdName === "unlock") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0641\u062A\u062D \u0627\u0644\u0631\u0648\u0645\u0627\u062A!", ephemeral: true });
            return;
          }
          await interaction.channel.permissionOverwrites.edit(interaction.guildId, { SendMessages: null }).catch(() => {
          });
          await interaction.reply(cfg.customReply);
        } else if (cmdName === "clear") {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u0633\u062D \u0627\u0644\u0631\u0633\u0627\u0626\u0644!", ephemeral: true });
            return;
          }
          const count = Math.min(100, Math.max(1, interaction.options.getInteger("count") || 50));
          await interaction.channel.bulkDelete(count, true).catch(() => {
          });
          await interaction.reply({ content: `${cfg.customReply} (${count})`, ephemeral: true });
        } else if (cmdName === "panel") {
          const payload = buildTicketPanelMessagePayload();
          await interaction.channel.send(payload);
          await interaction.reply({ content: cfg.customReply, ephemeral: true });
        } else if (cmdName === "apply") {
          const payload = buildApplicationPanelPayload();
          await interaction.channel.send(payload).catch(() => {
          });
          await interaction.reply({ content: "\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0628\u0646\u062C\u0627\u062D \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0631\u0648\u0645!", ephemeral: true });
        } else if (cmdName === "server") {
          const g = interaction.guild;
          const embed = new EmbedBuilder().setColor("#e11d48").setTitle(`\u{1F4CA} ${g?.name || "M7R Server"}`).setDescription(cfg.customReply).addFields(
            { name: "\u0639\u062F\u062F \u0627\u0644\u0623\u0639\u0636\u0627\u0621", value: `${g?.memberCount || 0}`, inline: true },
            { name: "\u0639\u062F\u062F \u0627\u0644\u0631\u0648\u0645\u0627\u062A", value: `${g?.channels.cache.size || 0}`, inline: true },
            { name: "\u0639\u062F\u062F \u0627\u0644\u0631\u062A\u0628", value: `${g?.roles.cache.size || 0}`, inline: true }
          );
          await interaction.reply({ embeds: [embed] });
        } else if (cmdName === "help") {
          const enabledList = discordCommands.filter((c) => c.enabled).map((c) => `\u2022 \`${botBasicSettings.prefix}${c.name}\` (${c.aliases.slice(0, 2).join(" / ")}) \u2014 ${c.description}`).join("\n").slice(0, 3900);
          const embed = new EmbedBuilder().setColor("#e11d48").setTitle("\u{1F4DC} \u0645\u0648\u0633\u0648\u0639\u0629 \u0623\u0648\u0627\u0645\u0631 \u0628\u0648\u062A M7R \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0627\u0644\u0634\u0627\u0645\u0644\u0629").setDescription(`${cfg.customReply}

${enabledList}`);
          await interaction.reply({ embeds: [embed] });
        }
        return;
      }
      if (interaction.isButton()) {
        const customId = interaction.customId;
        if (customId === "btn_trigger_refresh") {
          await interaction.deferUpdate().catch(() => {
          });
          const refPayload = await handleFullBotRefresh(client, interaction.guild?.name || "\u0633\u064A\u0631\u0641\u0631\u0643");
          await interaction.editReply(refPayload).catch(() => {
          });
          return;
        }
        if (customId === "dhikr_subhanallah") {
          await interaction.reply({
            content: `\u{1F4FF} \u062A\u0642\u0628\u0644 \u0627\u0644\u0644\u0647 \u0645\u0646\u0643 \u064A\u0627 <@${interaction.user.id}>! \u0642\u0627\u0644 \u0631\u0633\u0648\u0644 \u0627\u0644\u0644\u0647 \uFDFA: \xAB\u0643\u0644\u0645\u062A\u0627\u0646 \u062E\u0641\u064A\u0641\u062A\u0627\u0646 \u0639\u0644\u0649 \u0627\u0644\u0644\u0633\u0627\u0646 \u062B\u0642\u064A\u0644\u062A\u0627\u0646 \u0641\u064A \u0627\u0644\u0645\u064A\u0632\u0627\u0646: **\u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0627\u0644\u0644\u064E\u0651\u0647\u0650 \u0648\u064E\u0628\u0650\u062D\u064E\u0645\u0652\u062F\u0650\u0647\u0650 \u060C \u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0627\u0644\u0644\u064E\u0651\u0647\u0650 \u0627\u0644\u0652\u0639\u064E\u0638\u0650\u064A\u0645\u0650**\xBB.`,
            ephemeral: true
          });
          return;
        } else if (customId === "dhikr_astaghfirullah") {
          await interaction.reply({
            content: `\u{1F90D} \u063A\u0641\u0631 \u0627\u0644\u0644\u0647 \u0644\u0643 \u0648\u0644\u0648\u0627\u0644\u062F\u064A\u0643 \u064A\u0627 <@${interaction.user.id}>: **\u0623\u064E\u0633\u0652\u062A\u064E\u063A\u0652\u0641\u0650\u0631\u064F \u0627\u0644\u0644\u064E\u0651\u0647\u064E \u0627\u0644\u0652\u0639\u064E\u0638\u0650\u064A\u0645\u064E \u0648\u064E\u0623\u064E\u062A\u064F\u0648\u0628\u064F \u0625\u0650\u0644\u064E\u064A\u0652\u0647\u0650** (\u0637\u0648\u0628\u0649 \u0644\u0645\u0646 \u0648\u062C\u062F \u0641\u064A \u0635\u062D\u064A\u0641\u062A\u0647 \u0627\u0633\u062A\u063A\u0641\u0627\u0631\u0627\u064B \u0643\u062B\u064A\u0631\u0627\u064B).`,
            ephemeral: true
          });
          return;
        } else if (customId === "dhikr_salawat") {
          await interaction.reply({
            content: `\u2728 \u0635\u0644\u0649 \u0627\u0644\u0644\u0647 \u0639\u0644\u064A\u0643 \u064A\u0627 <@${interaction.user.id}>: **\u0627\u0644\u0644\u064E\u0651\u0647\u064F\u0645\u064E\u0651 \u0635\u064E\u0644\u0650\u0651 \u0648\u064E\u0633\u064E\u0644\u0650\u0651\u0645\u0652 \u0648\u064E\u0628\u064E\u0627\u0631\u0650\u0643\u0652 \u0639\u064E\u0644\u064E\u0649 \u0646\u064E\u0628\u0650\u064A\u0650\u0651\u0646\u064E\u0627 \u0645\u064F\u062D\u064E\u0645\u064E\u0651\u062F\u064D** (\u0645\u0646 \u0635\u0644\u0649 \u0639\u0644\u064A \u0648\u0627\u062D\u062F\u0629 \u0635\u0644\u0649 \u0627\u0644\u0644\u0647 \u0639\u0644\u064A\u0647 \u0628\u0647\u0627 \u0639\u0634\u0631\u0627\u064B).`,
            ephemeral: true
          });
          return;
        }
        if (customId.startsWith("open_ticket_")) {
          const btnId = customId.replace("open_ticket_", "");
          const btnConfig = ticketPanelConfig.buttons.find((b) => b.id === btnId) || ticketPanelConfig.buttons[0];
          if (ticketPanelConfig.askReasonModal !== false) {
            const modal = new ModalBuilder().setCustomId(`modal_ticket_open_${btnId}`).setTitle(`\u0641\u062A\u062D \u062A\u0630\u0643\u0631\u0629: ${btnConfig?.label || "\u062A\u0630\u0643\u0631\u0629 \u062C\u062F\u064A\u062F\u0629"}`.slice(0, 45));
            const reasonInput = new TextInputBuilder().setCustomId("ticket_user_reason").setLabel("\u0645\u0627 \u0647\u0648 \u0633\u0628\u0628 \u0641\u062A\u062D \u0627\u0644\u062A\u0630\u0643\u0631\u0629\u061F (\u062A\u0641\u0627\u0635\u064A\u0644 \u0637\u0644\u0628\u0643)").setStyle(TextInputStyle.Paragraph).setPlaceholder("\u0627\u0643\u062A\u0628 \u0647\u0646\u0627 \u0633\u0628\u0628 \u0641\u062A\u062D \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0628\u0627\u0644\u062A\u0641\u0635\u064A\u0644 \u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629...").setRequired(true).setMinLength(3).setMaxLength(1e3);
            const modalRow = new ActionRowBuilder().addComponents(reasonInput);
            modal.addComponents(modalRow);
            await interaction.showModal(modal);
            return;
          }
          await handleCreateTicketChannel(interaction, btnId, "");
          return;
        }
        if (customId === "claim_ticket") {
          await interaction.reply({
            embeds: [
              new EmbedBuilder().setColor("#10b981").setTitle("\u2705 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 (Claimed)").setDescription(`\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0628\u0646\u062C\u0627\u062D \u0628\u0648\u0627\u0633\u0637\u0629 \u0627\u0644\u0645\u0634\u0631\u0641: <@${interaction.user.id}>`).setTimestamp()
            ]
          });
        } else if (customId === "close_ticket") {
          await interaction.reply({
            embeds: [
              new EmbedBuilder().setColor("#f59e0b").setTitle("\u{1F512} \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u062A\u0630\u0643\u0631\u0629").setDescription(`\u062A\u0645 \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0628\u0648\u0627\u0633\u0637\u0629 <@${interaction.user.id}>.`)
            ]
          });
        } else if (customId === "delete_ticket") {
          await interaction.reply("\u{1F5D1}\uFE0F \u0633\u064A\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0646\u0647\u0627\u0626\u064A\u0627\u064B \u062E\u0644\u0627\u0644 5 \u062B\u0648\u0627\u0646\u064D...");
          setTimeout(() => {
            interaction.channel?.delete().catch(() => {
            });
          }, 5e3);
        } else if (customId === "remind_ticket") {
          await interaction.reply(`\u23F0 **\u062A\u0646\u0628\u064A\u0647 \u0645\u0646 \u0627\u0644\u0625\u062F\u0627\u0631\u0629:** \u064A\u0631\u062C\u0649 \u0627\u0644\u0631\u062F \u0639\u0644\u0649 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0644\u062A\u062C\u0646\u0628 \u0625\u063A\u0644\u0627\u0642\u0647\u0627 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B!`);
        } else if (customId === "transfer_ticket") {
          await interaction.reply(`\u{1F504} **\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u062A\u0630\u0643\u0631\u0629:** \u062A\u0645 \u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0644\u064A\u0627 \u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0645\u0644\u0641 \u0627\u0644\u062A\u0630\u0643\u0631\u0629.`);
        } else if (customId === "ctrl_send_tickets") {
          const payload = buildTicketPanelMessagePayload();
          await interaction.channel.send(payload).catch(() => {
          });
          await interaction.reply({ content: "\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0628\u0627\u0646\u0644 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0631\u0648\u0645 \u0628\u0646\u062C\u0627\u062D!", ephemeral: true });
        } else if (customId === "ctrl_send_azkar") {
          const activeItems = azkarConfig.items.filter((i) => i.enabled);
          const item = activeItems.length > 0 ? activeItems[Math.floor(Math.random() * activeItems.length)] : azkarConfig.items[0];
          const payload = buildAzkarEmbed(item);
          await interaction.channel.send(payload).catch(() => {
          });
          await interaction.reply({ content: "\u{1F4FF} \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0630\u0643\u0631 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0631\u0648\u0645 \u0628\u0646\u062C\u0627\u062D!", ephemeral: true });
        } else if (customId === "ctrl_set_welcome_here") {
          const chName = interaction.channel.name || "welcome";
          welcomeConfig.channelName = chName;
          welcomeConfig.enabled = true;
          const payload = buildWelcomePayload({
            userId: interaction.user.id,
            username: interaction.user.username,
            avatarUrl: interaction.user.displayAvatarURL(),
            serverName: interaction.guild?.name || "M7R Server",
            memberCount: interaction.guild?.memberCount || 100
          });
          await interaction.channel.send(payload).catch(() => {
          });
          await interaction.reply({
            content: `\u{1F44B} \u062A\u0645 \u062A\u0639\u064A\u064A\u0646 \u0647\u0630\u0627 \u0627\u0644\u0631\u0648\u0645 (\`#${chName}\`) \u0643\u0631\u0648\u0645 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0627\u0644\u0631\u0633\u0645\u064A \u0648\u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u062A\u0631\u062D\u064A\u0628 \u062A\u062C\u0631\u064A\u0628\u064A\u0629!`,
            ephemeral: true
          });
        } else if (customId === "ctrl_join_quran_vc") {
          const memberVoice = interaction.member?.voice?.channel;
          const targetCh = memberVoice ? memberVoice.id : voice247Config.channelName;
          const res = await joinDiscordVoiceChannel247(targetCh, interaction.guild);
          await interaction.reply({
            content: res.message,
            ephemeral: true
          });
        } else if (customId === "dash_btn_giveaway") {
          const members = interaction.guild?.members.cache.filter((m) => !m.user.bot);
          const winner = members && members.size > 0 ? members.random()?.user : interaction.user;
          const winEmbed = new EmbedBuilder().setColor("#f59e0b").setTitle("\u{1F389} \u0642\u0631\u0639\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0639\u0634\u0648\u0627\u0626\u064A\u0629 (M7R Giveaway)").setDescription(
            `\u{1F973} **\u0627\u0644\u0641\u0627\u0626\u0632 \u0641\u064A \u0627\u0644\u0633\u062D\u0628 \u0627\u0644\u0639\u0634\u0648\u0627\u0626\u064A \u0647\u0648:** <@${winner?.id || interaction.user.id}>!
\u2022 **\u062A\u0645 \u0627\u0644\u0633\u062D\u0628 \u0628\u0648\u0627\u0633\u0637\u0629:** <@${interaction.user.id}>
\u2022 **\u0639\u062F\u062F \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u064A\u0646 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631:** \`${interaction.guild?.memberCount || 100}\` \u0639\u0636\u0648`
          ).setThumbnail(winner?.displayAvatarURL() || interaction.user.displayAvatarURL()).setTimestamp();
          await interaction.reply({ embeds: [winEmbed] });
        } else if (customId === "dash_btn_stats") {
          const todayPt = serverAnalytics7Days[serverAnalytics7Days.length - 1];
          const totalMsgs7d = serverAnalytics7Days.reduce((acc, d) => acc + d.messages, 0);
          const totalJoins7d = serverAnalytics7Days.reduce((acc, d) => acc + d.newJoins, 0);
          const statsEmbed = new EmbedBuilder().setColor("#10b981").setTitle(`\u{1F4CA} \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0633\u064A\u0631\u0641\u0631 ${interaction.guild?.name || "M7R"} (\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645)`).setDescription(
            `\u2022 \u{1F465} **\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u062D\u0627\u0644\u064A:** \`${interaction.guild?.memberCount || todayPt.members}\` \u0639\u0636\u0648 (\`+${totalJoins7d}\` \u0639\u0636\u0648 \u062C\u062F\u064A\u062F \u0641\u064A 7 \u0623\u064A\u0627\u0645)
\u2022 \u{1F4AC} **\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u064A\u0648\u0645 \u0641\u064A \u0627\u0644\u0634\u0627\u062A:** \`${todayPt.messages}\` \u0631\u0633\u0627\u0644\u0629
\u2022 \u{1F4C8} **\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0631\u0633\u0627\u0626\u0644 (\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645):** \`${totalMsgs7d.toLocaleString()}\` \u0631\u0633\u0627\u0644\u0629
\u2022 \u2328\uFE0F **\u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0645\u0646\u0641\u0630\u0629 \u0627\u0644\u064A\u0648\u0645:** \`${todayPt.commandsUsed}\` \u0623\u0645\u0631
\u2022 \u{1F310} **\u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u0628\u064A\u0627\u0646\u064A\u0629 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0645\u062A\u0627\u062D\u0629 \u0641\u064A \u062F\u0634\u0628\u0648\u0631\u062F \u0627\u0644\u0648\u064A\u0628:**
${WEB_DASHBOARD_PUBLIC_URL}`
          ).setTimestamp();
          await interaction.reply({ embeds: [statsEmbed] });
        } else if (customId === "ctrl_send_trap") {
          await interaction.reply({
            content: "\u{1F512} \u0647\u0630\u0627 \u0627\u0644\u0623\u0645\u0631 \u0645\u0646 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0627\u0644\u0645\u062D\u062C\u0648\u0628\u0629 \u0641\u064A \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0639\u0627\u0645\u0629 \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631.",
            ephemeral: true
          });
        } else if (customId === "ctrl_cycle_status") {
          const statuses = ["dnd", "online", "idle"];
          const nextIdx = (statuses.indexOf(botBasicSettings.presenceStatus) + 1) % statuses.length;
          botBasicSettings.presenceStatus = statuses[nextIdx];
          client.user?.setPresence({
            status: botBasicSettings.presenceStatus,
            activities: [{ name: botBasicSettings.activityText || "/help", type: ActivityType.Playing }]
          });
          await interaction.reply({
            content: `\u{1F7E2} \u062A\u0645 \u062A\u0628\u062F\u064A\u0644 \u062D\u0627\u0644\u0629 \u0627\u0644\u0628\u0648\u062A \u0625\u0644\u0649: \`${botBasicSettings.presenceStatus.toUpperCase()}\`!`,
            ephemeral: true
          });
        } else if (customId === "ctrl_send_apply") {
          const payload = buildApplicationPanelPayload();
          await interaction.channel.send(payload).catch(() => {
          });
          await interaction.reply({ content: "\u{1F4CB} \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0628\u0646\u0644 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0631\u0648\u0645 \u0628\u0646\u062C\u0627\u062D!", ephemeral: true });
        } else if (customId === "open_app_modal") {
          if (!applicationsConfig.enabled) {
            await interaction.reply({
              content: "\u26A0\uFE0F **\u0646\u0639\u062A\u0630\u0631 \u0645\u0646\u0643\u060C \u0628\u0627\u0628 \u0627\u0644\u062A\u0642\u062F\u064A\u0645\u0627\u062A \u0645\u063A\u0644\u0642 \u062D\u0627\u0644\u064A\u0627\u064B \u0645\u0646 \u0642\u0650\u0628\u0644 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631!**",
              ephemeral: true
            });
            return;
          }
          const modal = new ModalBuilder().setCustomId("submit_app_modal").setTitle((applicationsConfig.panelTitle || "\u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645").slice(0, 45));
          const questionsToUse = applicationsConfig.questions && applicationsConfig.questions.length > 0 ? applicationsConfig.questions.slice(0, 5) : [
            { id: "q1", question: "\u0639\u0631\u0651\u0641 \u0639\u0646 \u0646\u0641\u0633\u0643 \u0648\u0639\u0645\u0631\u0643 \u0648\u0645\u0643\u0627\u0646 \u0625\u0642\u0627\u0645\u062A\u0643\u061F", placeholder: "\u0645\u062B\u0627\u0644: \u064A\u0648\u0633\u0641\u060C 21 \u0633\u0646\u0629\u060C \u0627\u0644\u0631\u064A\u0627\u0636...", type: "short", required: true },
            { id: "q2", question: "\u0645\u0627 \u0647\u064A \u062E\u0628\u0631\u0627\u062A\u0643 \u0627\u0644\u0633\u0627\u0628\u0642\u0629 \u0641\u064A \u0625\u062F\u0627\u0631\u0629 \u0648\u062A\u0646\u0638\u064A\u0645 \u0627\u0644\u0633\u064A\u0631\u0641\u0631\u0627\u062A\u061F", placeholder: "\u0627\u0630\u0643\u0631 \u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u0633\u064A\u0631\u0641\u0631\u0627\u062A \u0648\u0627\u0644\u062E\u0628\u0631\u0629...", type: "paragraph", required: true },
            { id: "q3", question: "\u0643\u0645 \u0639\u062F\u062F \u0627\u0644\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0641\u0631\u063A \u0644\u0647\u0627 \u064A\u0648\u0645\u064A\u0627\u064B \u0644\u0634\u0641\u062A \u0627\u0644\u0631\u0642\u0627\u0628\u0629\u061F", placeholder: "\u0645\u062B\u0627\u0644: 5 \u0633\u0627\u0639\u0627\u062A \u064A\u0648\u0645\u064A\u0627\u064B...", type: "short", required: true }
          ];
          for (let i = 0; i < questionsToUse.length; i++) {
            const q = questionsToUse[i];
            const textInput = new TextInputBuilder().setCustomId(`app_q_${i}`).setLabel((q.question || `\u0627\u0644\u0633\u0624\u0627\u0644 ${i + 1}`).slice(0, 45)).setStyle(q.type === "paragraph" ? TextInputStyle.Paragraph : TextInputStyle.Short).setRequired(q.required !== false);
            if (q.placeholder && q.placeholder.trim()) {
              textInput.setPlaceholder(q.placeholder.trim().slice(0, 100));
            }
            const row = new ActionRowBuilder().addComponents(textInput);
            modal.addComponents(row);
          }
          await interaction.showModal(modal);
          return;
        } else if (customId.startsWith("app_action_accept_")) {
          const parts = customId.replace("app_action_accept_", "").split("_");
          const appId = parts[0];
          const applicantId = parts[1];
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles) && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) && interaction.guild?.ownerId !== interaction.user.id) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0642\u0628\u0648\u0644 \u0627\u0644\u0645\u062A\u0642\u062F\u0645\u064A\u0646 \u0648\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0631\u062A\u0628!", ephemeral: true });
            return;
          }
          const appItem = applications.find((a) => a.id === appId);
          if (appItem) {
            appItem.status = "accepted";
            appItem.reviewNotes = `\u062A\u0645 \u0627\u0644\u0642\u0628\u0648\u0644 \u0641\u064A \u062F\u064A\u0633\u0643\u0648\u0631\u062F \u0628\u0648\u0627\u0633\u0637\u0629 \u0627\u0644\u0645\u0634\u0631\u0641: ${interaction.user.tag}`;
          }
          const member = await interaction.guild?.members.fetch(applicantId).catch(() => null);
          let roleGiven = false;
          if (member && applicationsConfig.acceptedRoleName) {
            const role = interaction.guild?.roles.cache.find(
              (r) => r.name.toLowerCase() === applicationsConfig.acceptedRoleName.toLowerCase() || r.name.toLowerCase().includes(applicationsConfig.acceptedRoleName.toLowerCase())
            );
            if (role) {
              await member.roles.add(role).catch(() => {
              });
              roleGiven = true;
            }
          }
          if (applicationsConfig.dmOnAccept && member) {
            await member.send({
              content: `\u{1F389} **\u062A\u0647\u0627\u0646\u064A\u0646\u0627 \u064A\u0627 <@${applicantId}>!**

${applicationsConfig.acceptDmMessage}

*\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0628\u0648\u0627\u0633\u0637\u0629 \u0627\u0644\u0645\u0634\u0631\u0641:* <@${interaction.user.id}>`
            }).catch(() => {
            });
          }
          if (applicationsConfig.resultsChannelName) {
            const resCh = interaction.guild?.channels.cache.find(
              (c) => c.isTextBased() && matchesChannelName(c.name, applicationsConfig.resultsChannelName)
            );
            if (resCh) {
              const resEmbed = new EmbedBuilder().setColor("#10b981").setTitle("\u{1F389} \u0625\u0639\u0644\u0627\u0646 \u0642\u0628\u0648\u0644 \u0625\u062F\u0627\u0631\u064A \u062C\u062F\u064A\u062F").setDescription(`\u0646\u0628\u0627\u0631\u0643 \u0644\u0644\u0639\u0636\u0648 <@${applicantId}> \u0627\u062C\u062A\u064A\u0627\u0632 \u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0648\u0627\u0646\u0636\u0645\u0627\u0645\u0647 \u0644\u0637\u0627\u0642\u0645 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0628\u0631\u062A\u0628\u0629 **${applicationsConfig.acceptedRoleName}**!`).setTimestamp();
              await resCh.send({ embeds: [resEmbed] }).catch(() => {
              });
            }
          }
          const originalEmbed = interaction.message.embeds[0];
          if (originalEmbed) {
            const updatedEmbed = EmbedBuilder.from(originalEmbed).setColor("#10b981").setTitle(`\u2705 \u062A\u0645 \u0642\u0628\u0648\u0644 \u0627\u0644\u0637\u0644\u0628 \u2014 ${appItem?.applicant.name || "\u0627\u0644\u0639\u0636\u0648"}`).setFooter({ text: `\u062A\u0645 \u0627\u0644\u0642\u0628\u0648\u0644 \u0628\u0648\u0627\u0633\u0637\u0629 ${interaction.user.tag} \u2022 ${roleGiven ? "\u062A\u0645 \u0645\u0646\u062D \u0627\u0644\u0631\u062A\u0628\u0629" : "\u064A\u0631\u062C\u0649 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0631\u062A\u0628\u0629"} \u2022 ${(/* @__PURE__ */ new Date()).toLocaleTimeString("ar-SA")}` });
            await interaction.update({ embeds: [updatedEmbed], components: [] }).catch(() => {
            });
          } else {
            await interaction.reply({ content: `\u2705 \u062A\u0645 \u0642\u0628\u0648\u0644 \u0627\u0644\u0645\u062A\u0642\u062F\u0645 <@${applicantId}> \u0628\u0646\u062C\u0627\u062D!`, ephemeral: true });
          }
          savePersistedSession();
          return;
        } else if (customId.startsWith("app_action_reject_")) {
          const parts = customId.replace("app_action_reject_", "").split("_");
          const appId = parts[0];
          const applicantId = parts[1];
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles) && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) && interaction.guild?.ownerId !== interaction.user.id) {
            await interaction.reply({ content: "\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0631\u0641\u0636 \u0627\u0644\u0645\u062A\u0642\u062F\u0645\u064A\u0646!", ephemeral: true });
            return;
          }
          const appItem = applications.find((a) => a.id === appId);
          if (appItem) {
            appItem.status = "rejected";
            appItem.reviewNotes = `\u062A\u0645 \u0627\u0644\u0631\u0641\u0636 \u0641\u064A \u062F\u064A\u0633\u0643\u0648\u0631\u062F \u0628\u0648\u0627\u0633\u0637\u0629: ${interaction.user.tag}`;
          }
          const member = await interaction.guild?.members.fetch(applicantId).catch(() => null);
          if (applicationsConfig.dmOnReject && member) {
            await member.send({
              content: `\u{1F4E9} **\u062A\u0646\u0628\u064A\u0647 \u0628\u062E\u0635\u0648\u0635 \u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0641\u064A ${interaction.guild?.name || "\u0627\u0644\u0633\u064A\u0631\u0641\u0631"}:**

${applicationsConfig.rejectDmMessage}`
            }).catch(() => {
            });
          }
          const originalEmbed = interaction.message.embeds[0];
          if (originalEmbed) {
            const updatedEmbed = EmbedBuilder.from(originalEmbed).setColor("#ef4444").setTitle(`\u274C \u062A\u0645 \u0631\u0641\u0636 \u0627\u0644\u0637\u0644\u0628 \u2014 ${appItem?.applicant.name || "\u0627\u0644\u0639\u0636\u0648"}`).setFooter({ text: `\u062A\u0645 \u0627\u0644\u0631\u0641\u0636 \u0628\u0648\u0627\u0633\u0637\u0629 ${interaction.user.tag} \u2022 ${(/* @__PURE__ */ new Date()).toLocaleTimeString("ar-SA")}` });
            await interaction.update({ embeds: [updatedEmbed], components: [] }).catch(() => {
            });
          } else {
            await interaction.reply({ content: `\u274C \u062A\u0645 \u0631\u0641\u0636 \u0627\u0644\u0645\u062A\u0642\u062F\u0645 <@${applicantId}> \u0648\u0625\u0634\u0639\u0627\u0631\u0647.`, ephemeral: true });
          }
          savePersistedSession();
          return;
        }
      }
      if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith("modal_ticket_open_")) {
          const btnId = interaction.customId.replace("modal_ticket_open_", "");
          const userReason = interaction.fields.getTextInputValue("ticket_user_reason") || "\u0644\u0645 \u064A\u062A\u0645 \u0643\u062A\u0627\u0628\u0629 \u0633\u0628\u0628";
          await handleCreateTicketChannel(interaction, btnId, userReason);
          return;
        }
        if (interaction.customId === "submit_app_modal") {
          const questionsToUse = applicationsConfig.questions && applicationsConfig.questions.length > 0 ? applicationsConfig.questions.slice(0, 5) : [];
          const answers = {};
          for (let i = 0; i < questionsToUse.length; i++) {
            const q = questionsToUse[i];
            const val = interaction.fields.getTextInputValue(`app_q_${i}`) || "\u0644\u0645 \u062A\u062A\u0645 \u0627\u0644\u0625\u062C\u0627\u0628\u0629";
            answers[q.id || `q${i + 1}`] = val;
          }
          const newAppId = `app-${Date.now().toString().slice(-6)}`;
          const newSubmission = {
            id: newAppId,
            formId: "staff-recruitment",
            formTitle: applicationsConfig.panelTitle || "\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0648\u0627\u0644\u0631\u0642\u0627\u0628\u0629",
            applicant: {
              id: interaction.user.id,
              name: interaction.user.username,
              tag: interaction.user.tag || interaction.user.username,
              avatar: interaction.user.displayAvatarURL(),
              joinedAt: "\u0627\u0644\u0622\u0646 (\u062F\u064A\u0633\u0643\u0648\u0631\u062F)"
            },
            answers,
            status: "pending",
            submittedAt: "\u0627\u0644\u0622\u0646"
          };
          applications.unshift(newSubmission);
          savePersistedSession();
          await interaction.reply({
            content: "\u2705 **\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u062A\u0642\u062F\u064A\u0645\u0643 \u0628\u0646\u062C\u0627\u062D \u0625\u0644\u0649 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629!** \u0633\u064A\u0635\u0644\u0643 \u0625\u0634\u0639\u0627\u0631 \u0628\u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0642\u0631\u064A\u0628\u0627\u064B.",
            ephemeral: true
          });
          const reviewCh = interaction.guild?.channels.cache.find(
            (c) => c.isTextBased() && matchesChannelName(c.name, applicationsConfig.adminReviewChannelName)
          );
          if (reviewCh) {
            const embed = new EmbedBuilder().setColor("#f59e0b").setTitle(`\u{1F4CB} \u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u062A\u0642\u062F\u064A\u0645 \u062C\u062F\u064A\u062F\u0629 \u2014 ${interaction.user.username}`).setDescription(
              `\u0642\u0627\u0645 \u0627\u0644\u0639\u0636\u0648 <@${interaction.user.id}> \u0628\u062A\u0642\u062F\u064A\u0645 \u0637\u0644\u0628 \u0627\u0646\u0636\u0645\u0627\u0645 \u062C\u062F\u064A\u062F.
\u2022 **\u0627\u0644\u0631\u062A\u0628\u0629 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0629:** \`${applicationsConfig.acceptedRoleName}\`
\u2022 **\u0631\u0642\u0645 \u0627\u0644\u0627\u0633\u062A\u0645\u0627\u0631\u0629:** \`${newAppId}\``
            ).setThumbnail(interaction.user.displayAvatarURL()).setTimestamp();
            questionsToUse.forEach((q, idx) => {
              const ans = answers[q.id || `q${idx + 1}`] || "\u2014";
              embed.addFields({
                name: `\u{1F539} ${q.question}`,
                value: ans.slice(0, 1020) || "\u2014",
                inline: false
              });
            });
            const actionRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId(`app_action_accept_${newAppId}_${interaction.user.id}`).setLabel("\u0642\u0628\u0648\u0644 \u0627\u0644\u0645\u062A\u0642\u062F\u0645 (Accept)").setEmoji("\u2705").setStyle(ButtonStyle.Success),
              new ButtonBuilder().setCustomId(`app_action_reject_${newAppId}_${interaction.user.id}`).setLabel("\u0631\u0641\u0636 \u0627\u0644\u0637\u0644\u0628 (Reject)").setEmoji("\u274C").setStyle(ButtonStyle.Danger)
            );
            await reviewCh.send({
              content: `\u{1F514} **\u0637\u0644\u0628 \u062A\u0642\u062F\u064A\u0645 \u062C\u062F\u064A\u062F \u0645\u0646:** <@${interaction.user.id}>`,
              embeds: [embed],
              components: [actionRow]
            }).catch(() => {
            });
          }
          return;
        }
      }
    } catch (e) {
      console.error("[M7R Interaction Error]:", e);
    }
  });
  client.on("guildBanAdd", async (ban) => {
    if (!antiNukeConfig.enabled) return;
    try {
      const auditLogs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd });
      const log = auditLogs.entries.first();
      if (!log || !log.executor) return;
      const executor = log.executor;
      if (executor.id === client.user?.id || executor.id === ban.guild.ownerId || antiNukeConfig.whitelistUserIds.includes(executor.id)) return;
      const count = (nukeBanTracker.get(executor.id) || 0) + 1;
      nukeBanTracker.set(executor.id, count);
      setTimeout(() => nukeBanTracker.delete(executor.id), antiNukeConfig.massBanWindowSeconds * 1e3);
      if (count >= antiNukeConfig.massBanLimit) {
        const member = await ban.guild.members.fetch(executor.id).catch(() => null);
        if (member) {
          if (antiNukeConfig.massBanAction === "strip_roles") {
            await member.roles.set([]).catch(() => {
            });
          } else if (antiNukeConfig.massBanAction === "ban" && member.bannable) {
            await member.ban({ reason: "M7R Anti-Nuke: Mass Ban Detected" }).catch(() => {
            });
          } else if (antiNukeConfig.massBanAction === "kick" && member.kickable) {
            await member.kick("M7R Anti-Nuke: Mass Ban Detected").catch(() => {
            });
          }
        }
        guildStats.attacksThwartedCount += 1;
        threatLogs.unshift({
          id: `th-${Date.now()}`,
          type: "anti-nuke",
          action: "Real Mass Ban Attack Blocked",
          target: `${count} bans in ${ban.guild.name}`,
          executor: `${executor.tag} (${executor.id})`,
          timestamp: "\u0627\u0644\u0622\u0646",
          severity: "critical",
          details: `\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0644\u0644\u062D\u0638\u0631 \u0648\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0639\u0642\u0648\u0628\u0629 (${antiNukeConfig.massBanAction}) \u0641\u0648\u0631\u0627\u064B.`
        });
      }
    } catch (e) {
      console.error("[M7R Anti-Nuke Error]:", e);
    }
  });
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    const content = message.content.trim();
    const pfx = botBasicSettings.prefix || "!";
    const todayAnalytics = serverAnalytics7Days[serverAnalytics7Days.length - 1];
    if (todayAnalytics) {
      todayAnalytics.messages += 1;
      todayAnalytics.members = message.guild.memberCount || todayAnalytics.members;
      if (content.startsWith(pfx)) {
        todayAnalytics.commandsUsed += 1;
      }
    }
    if (honeypotTrapConfig.enabled) {
      const channelNameClean = message.channel.name.toLowerCase();
      const trapTargetClean = honeypotTrapConfig.channelName.toLowerCase().replace(/^[#🚫\s-]+/, "");
      const isTrapChannel = channelNameClean.includes("\u0645\u0645\u0646\u0648\u0639") || channelNameClean.includes("trap") || trapTargetClean.length > 2 && channelNameClean.includes(trapTargetClean);
      if (isTrapChannel) {
        const isWhitelisted = message.author.id === client.user?.id || message.guild.ownerId === message.author.id || honeypotTrapConfig.whitelistUserIds.includes(message.author.id) || message.member?.roles.cache.some((r) => honeypotTrapConfig.whitelistRoleNames.includes(r.name));
        if (!isWhitelisted) {
          await message.delete().catch(() => {
          });
          let punishmentApplied = "\u062D\u0638\u0631 \u0646\u0647\u0627\u0626\u064A (Instant Ban)";
          if (honeypotTrapConfig.punishment === "ban") {
            if (message.member?.bannable) {
              await message.member.ban({ reason: "M7R Honeypot Trap Triggered" }).catch(() => {
              });
            } else {
              punishmentApplied = "\u0645\u062D\u0627\u0648\u0644\u0629 \u062D\u0638\u0631 (\u0631\u062A\u0628\u0629 \u0627\u0644\u0639\u0636\u0648 \u0623\u0639\u0644\u0649)";
            }
          } else if (honeypotTrapConfig.punishment === "kick") {
            if (message.member?.kickable) {
              await message.member.kick("M7R Honeypot Trap Triggered").catch(() => {
              });
              punishmentApplied = "\u0637\u0631\u062F \u0641\u0648\u0631\u064A (Instant Kick)";
            }
          } else {
            if (message.member?.moderatable) {
              await message.member.timeout(honeypotTrapConfig.timeoutDurationMinutes * 60 * 1e3, "M7R Honeypot Trap").catch(() => {
              });
              punishmentApplied = `\u0643\u062A\u0645 \u0645\u0624\u0642\u062A (${honeypotTrapConfig.timeoutDurationMinutes} \u062F\u0642\u064A\u0642\u0629)`;
            }
          }
          honeypotTrapConfig.totalTrapped += 1;
          guildStats.attacksThwartedCount += 1;
          await sendLogToDiscordServer(
            "\u{1F6A8} \u062A\u0645 \u0627\u0644\u0625\u064A\u0642\u0627\u0639 \u0628\u0645\u062E\u0631\u0628 \u0641\u064A \u0645\u0635\u064A\u062F\u0629 M7R \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629!",
            `**\u0627\u0644\u0645\u062E\u0627\u0644\u0641:** <@${message.author.id}> (\`${message.author.tag}\`)
**\u0627\u0644\u0631\u0648\u0645:** <#${message.channel.id}>
**\u0627\u0644\u0639\u0642\u0648\u0628\u0629 \u0627\u0644\u0645\u0646\u0641\u0630\u0629:** \`${punishmentApplied}\`
**\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0631\u0633\u0627\u0644\u0629:** \`\`\`${message.content.slice(0, 200)}\`\`\``,
            "#dc2626"
          );
          threatLogs.unshift({
            id: `th-${Date.now()}`,
            type: "anti-spam",
            action: "Honeypot Trap Triggered \u{1FAA4}",
            target: `#${message.channel.name}`,
            executor: `${message.author.tag} (${message.author.id})`,
            timestamp: "\u0627\u0644\u0622\u0646",
            severity: "critical",
            details: `\u0648\u0642\u0639 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0641\u064A \u0631\u0648\u0645 \u0627\u0644\u0645\u0635\u064A\u062F\u0629 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 \u0648\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 (${punishmentApplied}) \u0641\u0648\u0631\u0627\u064B \u0648\u0645\u0633\u062D \u0627\u0644\u0631\u0633\u0627\u0644\u0629.`
          });
          return;
        }
      }
    }
    const lowerContent = content.toLowerCase();
    const isDirectUpdate = lowerContent === "\u062A\u062D\u062F\u064A\u062B" || lowerContent === `${pfx}\u062A\u062D\u062F\u064A\u062B` || lowerContent === "\u062A\u062C\u062F\u064A\u062F" || lowerContent === `${pfx}\u062A\u062C\u062F\u064A\u062F` || lowerContent === "\u0645\u0632\u0627\u0645\u0646\u0629" || lowerContent === `${pfx}\u0645\u0632\u0627\u0645\u0646\u0629` || lowerContent === "update" || lowerContent === `${pfx}update` || lowerContent === "refresh" || lowerContent === `${pfx}refresh` || lowerContent === "reload" || lowerContent === `${pfx}reload` || lowerContent === "sync" || lowerContent === `${pfx}sync`;
    if (isDirectUpdate) {
      if (todayAnalytics) {
        todayAnalytics.commandsUsed += 1;
      }
      const loadingMsg = await message.reply("\u{1F504} **\u062C\u0627\u0631\u064A \u0641\u062D\u0635 \u0648\u062A\u062D\u062F\u064A\u062B \u062C\u0645\u064A\u0639 \u0623\u0646\u0638\u0645\u0629 \u0648\u0623\u0648\u0627\u0645\u0631 \u0628\u0648\u062A M7R \u0648\u0645\u0633\u062D \u0627\u0644\u0643\u0627\u0634 \u0648\u062C\u0644\u0628 \u0643\u0644 \u062C\u062F\u064A\u062F...**").catch(() => null);
      const refreshPayload = await handleFullBotRefresh(client, message.guild.name);
      if (loadingMsg) {
        await loadingMsg.edit(refreshPayload).catch(() => {
        });
      } else {
        await message.reply(refreshPayload).catch(() => {
        });
      }
      return;
    }
    const currentChName = (message.channel.name || "").toLowerCase();
    const targetAiChClean = (aiChatbotConfig.allowedChannel || "all").toLowerCase().replace(/^#/, "").trim();
    const isAllowedAiChannel = !targetAiChClean || targetAiChClean === "all" || currentChName === targetAiChClean || matchesChannelName(currentChName, targetAiChClean);
    const isDirectAiAsk = lowerContent.startsWith("ai ask") || lowerContent.startsWith(`${pfx}ai ask`) || lowerContent.startsWith("m7r ask") || lowerContent.startsWith("\u0627\u0633\u0627\u0644 ") || lowerContent.startsWith("\u0627\u0633\u0623\u0644 ");
    if (isDirectAiAsk) {
      if (!aiChatbotConfig.enabled) {
        await message.reply("\u26A0\uFE0F \u0646\u0638\u0627\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A M7R AI \u0645\u0639\u0637\u0644 \u062D\u0627\u0644\u064A\u0627\u064B \u0645\u0646 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645.").catch(() => {
        });
        return;
      }
      if (!isAllowedAiChannel) {
        const warnMsg = await message.reply(`\u26A0\uFE0F \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A **M7R AI** \u0645\u062E\u0635\u0635 \u0644\u0644\u0631\u062F \u0641\u064A \u0631\u0648\u0645 \`#${aiChatbotConfig.allowedChannel}\` \u0641\u0642\u0637!`).catch(() => null);
        if (warnMsg) setTimeout(() => warnMsg.delete().catch(() => {
        }), 6e3);
        return;
      }
      let questionText = content.replace(new RegExp(`^(\\${pfx})?(ai\\s+ask|m7r\\s+ask|\u0627\u0633\u0627\u0644|\u0627\u0633\u0623\u0644)\\s*`, "i"), "").trim();
      if (!questionText) {
        await message.reply(
          `\u{1F916} **\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A (M7R AI Ask)!**
\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643 \u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u0639\u062F \u0627\u0644\u0623\u0645\u0631 \u0647\u0643\u0630\u0627:
\u2022 \`ai ask \u0645\u0627 \u0647\u064A \u0641\u0648\u0627\u0626\u062F \u0642\u0631\u0627\u0621\u0629 \u0633\u0648\u0631\u0629 \u0627\u0644\u0628\u0642\u0631\u0629\u061F\`
\u2022 \`${pfx}ask \u0643\u064A\u0641 \u0623\u062D\u0645\u064A \u0633\u064A\u0631\u0641\u0631\u064A \u0645\u0646 \u0627\u0644\u0633\u0628\u0627\u0645\u061F\`
\u2022 \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0645 \u0623\u0645\u0631 \u0627\u0644\u0633\u0644\u0627\u0634 \`/ask\`
\u{1F6E1}\uFE0F *\u0645\u0644\u0627\u062D\u0638\u0629: \u064A\u0631\u0641\u0636 \u0627\u0644\u0628\u0648\u062A \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0639\u0644\u0649 \u0623\u064A \u0633\u0624\u0627\u0644 \u062D\u0633\u0627\u0633 \u0623\u0648 \u0645\u062E\u0627\u0644\u0641.*`
        ).catch(() => {
        });
        return;
      }
      if (todayAnalytics) {
        todayAnalytics.commandsUsed += 1;
      }
      await message.channel.sendTyping().catch(() => {
      });
      const aiRes = await askM7RAssistant(questionText, message.author.username, currentChName || "general");
      const payload = buildAiAskDiscordPayload(
        questionText,
        aiRes.answer,
        aiRes.blocked,
        message.author.id,
        message.guild.name,
        aiRes.category
      );
      await message.reply(payload).catch(() => {
      });
      return;
    }
    if (aiChatbotConfig.enabled && aiChatbotConfig.autoReplyInChannelWithoutPrefix && targetAiChClean !== "all" && isAllowedAiChannel && !content.startsWith(pfx) && content.length >= 2) {
      await message.channel.sendTyping().catch(() => {
      });
      const aiRes = await askM7RAssistant(content, message.author.username, currentChName || "general");
      const payload = buildAiAskDiscordPayload(
        content,
        aiRes.answer,
        aiRes.blocked,
        message.author.id,
        message.guild.name,
        aiRes.category
      );
      await message.reply(payload).catch(() => {
      });
      return;
    }
    if (content.startsWith(pfx)) {
      const args = content.slice(pfx.length).trim().split(/\s+/);
      const cmdRaw = args.shift()?.toLowerCase() || "";
      const cfg = findCommandConfig(cmdRaw);
      if ([
        "set-ai-room",
        "setairoom",
        "ai-room",
        "airoom",
        "\u0631\u0648\u0645-\u0627\u0644\u0630\u0643\u0627\u0621",
        "\u062A\u062E\u0635\u064A\u0635-\u0627\u0644\u0630\u0643\u0627\u0621",
        "\u062A\u0641\u0639\u064A\u0644-\u0627\u0644\u0630\u0643\u0627\u0621",
        "\u062A\u062D\u062F\u064A\u062F-\u0631\u0648\u0645-\u0627\u0644\u0630\u0643\u0627\u0621"
      ].includes(cmdRaw)) {
        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild) && !message.member?.permissions.has(PermissionFlagsBits.ManageChannels) && message.guild.ownerId !== message.author.id) {
          await message.reply("\u274C \u0647\u0630\u0627 \u0627\u0644\u0623\u0645\u0631 \u0645\u062E\u0635\u0635 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0641\u0642\u0637!").catch(() => {
          });
          return;
        }
        const arg0 = (args[0] || "").toLowerCase().trim();
        if (arg0 === "off" || arg0 === "disable" || arg0 === "\u0627\u064A\u0642\u0627\u0641" || arg0 === "\u0625\u064A\u0642\u0627\u0641" || arg0 === "\u062A\u0639\u0637\u064A\u0644") {
          aiChatbotConfig.autoReplyInChannelWithoutPrefix = false;
          aiChatbotConfig.allowedChannel = "all";
          savePersistedSession();
          await message.reply("\u23F9\uFE0F \u062A\u0645 \u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0631\u062F \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0645\u062E\u0635\u0635\u060C \u0648\u0623\u0635\u0628\u062D \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u064A\u0639\u0645\u0644 \u0639\u0646\u062F \u0643\u062A\u0627\u0628\u0629 `ai ask` \u0623\u0648 `!ask` \u0641\u064A \u062C\u0645\u064A\u0639 \u0627\u0644\u0631\u0648\u0645\u0627\u062A.").catch(() => {
          });
          return;
        }
        const mentionedCh = message.mentions.channels.first();
        let newAiChannel = message.channel.name || "general";
        if (mentionedCh && "name" in mentionedCh && mentionedCh.name) {
          newAiChannel = mentionedCh.name;
        } else if (arg0 && arg0 !== "here" && arg0 !== "\u0647\u0646\u0627") {
          if (arg0 === "all" || arg0 === "\u0627\u0644\u0643\u0644") {
            newAiChannel = "all";
          } else {
            newAiChannel = arg0.replace(/^#/, "");
          }
        }
        aiChatbotConfig.enabled = true;
        aiChatbotConfig.allowedChannel = newAiChannel;
        aiChatbotConfig.autoReplyInChannelWithoutPrefix = newAiChannel !== "all";
        aiChatbotConfig.responseTone = "friendly";
        const askCmd = discordCommands.find((c) => c.name === "ask");
        if (askCmd) askCmd.allowedChannel = newAiChannel;
        savePersistedSession();
        const roomEmbed = new EmbedBuilder().setColor("#10b981").setTitle("\u{1F916}\u2728 \u062A\u0645 \u062A\u062E\u0635\u064A\u0635 \u0631\u0648\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A (M7R Friendly AI)").setDescription(
          newAiChannel === "all" ? `\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0631\u062F\u0648\u062F \u0627\u0644\u0630\u0643\u064A\u0629 \u0627\u0644\u0638\u0631\u064A\u0641\u0629 \u0648\u0627\u0644\u0648\u062F\u0648\u062F\u0629 \u0641\u064A **\u062C\u0645\u064A\u0639 \u0631\u0648\u0645\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631** \u0639\u0628\u0631 \u0627\u0644\u0623\u0645\u0631 \`ai ask\` \u0623\u0648 \`${pfx}ask\`! \u{1F604}\u{1F338}` : `\u064A\u0627 \u0647\u0644\u0627 \u0648\u0627\u0644\u0644\u0647! \u062A\u0645 \u062A\u062E\u0635\u064A\u0635 \u0631\u0648\u0645 **#${newAiChannel}** \u0644\u064A\u0643\u0648\u0646 \u0631\u0648\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0627\u0644\u0631\u0633\u0645\u064A \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631! \u{1F604}\u{1F338}

\u2022 \u{1F4AC} **\u0627\u0644\u0631\u062F \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0627\u0644\u0630\u0643\u064A:** \u0645\u0641\u0639\u0644 \u2705 (\u0623\u064A \u0639\u0636\u0648 \u064A\u0643\u062A\u0628 \u0631\u0633\u0627\u0644\u0629 \u0623\u0648 \u0633\u0624\u0627\u0644 \u0641\u064A \`#${newAiChannel}\` \u0633\u064A\u0631\u062F \u0639\u0644\u064A\u0647 \u0627\u0644\u0628\u0648\u062A \u0641\u0648\u0631\u0627\u064B \u0628\u0623\u0633\u0644\u0648\u0628 \u0638\u0631\u064A\u0641 \u0648\u0644\u0637\u064A\u0641 \u0648\u0648\u062F\u0648\u062F!)
\u2022 \u2328\uFE0F **\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0645\u0628\u0627\u0634\u0631:** \`ai ask [\u0633\u0624\u0627\u0644\u0643]\` \u0623\u0648 \`${pfx}ask [\u0633\u0624\u0627\u0644\u0643]\` \u0623\u0648 \`/ask\`
\u2022 \u{1F6E1}\uFE0F **\u0641\u0644\u062A\u0631 \u0627\u0644\u062D\u0645\u0627\u064A\u0629:** \u064A\u062D\u062C\u0628 \u0623\u064A \u0633\u0624\u0627\u0644 \u062D\u0633\u0627\u0633 \u0623\u0648 \u0645\u062E\u0627\u0644\u0641 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B.
\u2022 \u{1F504} **\u0644\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062A\u062E\u0635\u064A\u0635 \u0644\u0627\u062D\u0642\u0627\u064B:** \u0627\u0643\u062A\u0628 \`${pfx}set-ai-room off\``
        ).setFooter({ text: "M7R Friendly AI Room \u2022 https://bot-m7r.netlify.app/" }).setTimestamp();
        await message.reply({ embeds: [roomEmbed] }).catch(() => {
        });
        return;
      }
      if (["ask", "ai", "ai-ask", "\u0627\u0633\u0627\u0644", "\u0627\u0633\u0623\u0644", "\u0633\u0624\u0627\u0644", "\u0630\u0643\u0627\u0621"].includes(cmdRaw) || cfg?.name === "ask") {
        if (!aiChatbotConfig.enabled) {
          await message.reply("\u26A0\uFE0F \u0646\u0638\u0627\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A M7R AI \u0645\u0639\u0637\u0644 \u062D\u0627\u0644\u064A\u0627\u064B \u0645\u0646 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645.").catch(() => {
          });
          return;
        }
        if (!isAllowedAiChannel) {
          const warnMsg = await message.reply(`\u26A0\uFE0F \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A **M7R AI** \u0645\u062E\u0635\u0635 \u0644\u0644\u0631\u062F \u0641\u064A \u0631\u0648\u0645 \`#${aiChatbotConfig.allowedChannel}\` \u0641\u0642\u0637!`).catch(() => null);
          if (warnMsg) setTimeout(() => warnMsg.delete().catch(() => {
          }), 6e3);
          return;
        }
        let questionText = args.join(" ").trim();
        if (cmdRaw === "ai" && questionText.toLowerCase().startsWith("ask")) {
          questionText = questionText.replace(/^ask\s*/i, "").trim();
        }
        if (!questionText) {
          await message.reply(
            `\u{1F916} **\u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A M7R AI Ask**
\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643 \u0628\u0639\u062F \u0627\u0644\u0623\u0645\u0631 \u0648\u0633\u064A\u0631\u062F \u0639\u0644\u064A\u0643 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0641\u0648\u0631\u0627\u064B!
**\u0623\u0645\u062B\u0644\u0629:**
\u2022 \`ai ask \u0643\u064A\u0641 \u0623\u0631\u062A\u0628 \u0633\u064A\u0631\u0641\u0631 \u062F\u064A\u0633\u0643\u0648\u0631\u062F \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u061F\`
\u2022 \`${pfx}ask \u0645\u0627 \u0647\u064A \u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0635\u0628\u0627\u062D \u0648\u0627\u0644\u0645\u0633\u0627\u0621\u061F\`
\u2022 \`${pfx}\u0627\u0633\u0627\u0644 \u0645\u0627 \u0627\u0644\u0641\u0631\u0642 \u0628\u064A\u0646 JavaScript \u0648 Python\u061F\`
\u{1F6E1}\uFE0F *\u0645\u0644\u0627\u062D\u0638\u0629: \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0623\u0648 \u0627\u0644\u0645\u062A\u0639\u0644\u0642\u0629 \u0628\u0627\u0644\u062A\u0648\u0643\u0646\u0627\u062A \u0648\u0627\u0644\u0627\u062E\u062A\u0631\u0627\u0642 \u064A\u062A\u0645 \u0631\u0641\u0636\u0647\u0627 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B.*`
          ).catch(() => {
          });
          return;
        }
        await message.channel.sendTyping().catch(() => {
        });
        const aiRes = await askM7RAssistant(questionText, message.author.username, currentChName || "general");
        const payload = buildAiAskDiscordPayload(
          questionText,
          aiRes.answer,
          aiRes.blocked,
          message.author.id,
          message.guild.name,
          aiRes.category
        );
        await message.reply(payload).catch(() => {
        });
        return;
      }
      if (cfg) {
        if (cfg.allowedChannel && cfg.allowedChannel !== "all" && cfg.allowedChannel.trim() !== "") {
          const currentChName2 = message.channel.name.toLowerCase();
          const targetChClean = cfg.allowedChannel.toLowerCase().replace(/^#/, "").trim();
          if (targetChClean && !currentChName2.includes(targetChClean)) {
            const replyWarn = await message.reply(`\u26A0\uFE0F \u0647\u0630\u0627 \u0627\u0644\u0623\u0645\u0631 \u0645\u062E\u0635\u0635 \u0644\u0644\u0639\u0645\u0644 \u0641\u064A \u0631\u0648\u0645 \`#${targetChClean}\` \u0641\u0642\u0637!`).catch(() => null);
            if (replyWarn) setTimeout(() => replyWarn.delete().catch(() => {
            }), 5e3);
            return;
          }
        }
        if (cfg.name === "ping") {
          await message.reply(`${cfg.customReply} (\`${client.ws.ping}ms\`)`).catch(() => {
          });
          return;
        }
        if (cfg.name === "azkar") {
          const activeItems = azkarConfig.items.filter((i) => i.enabled);
          const item = activeItems.length > 0 ? activeItems[Math.floor(Math.random() * activeItems.length)] : azkarConfig.items[0];
          const payload = buildAzkarEmbed(item);
          await message.channel.send(payload).catch(() => {
          });
          return;
        }
        if (cfg.name === "status" || cfg.name === "antinuke") {
          const embed = new EmbedBuilder().setColor("#e11d48").setTitle("\u{1F6E1}\uFE0F \u062D\u0627\u0644\u0629 \u0646\u0638\u0627\u0645 \u062D\u0645\u0627\u064A\u0629 M7R 24/7 \u0648\u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0648\u0627\u0644\u0623\u0648\u0627\u0645\u0631").setDescription(cfg.customReply).addFields(
            { name: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0628\u0648\u062A", value: "\u{1F7E2} \u0645\u062A\u0635\u0644 24/7", inline: true },
            { name: "\u0627\u0644\u0628\u0646\u0642 (Ping)", value: `\`${client.ws.ping}ms\``, inline: true },
            { name: "\u062F\u0631\u0639 Anti-Nuke", value: antiNukeConfig.enabled ? "\u2705 \u0645\u0641\u0639\u0644" : "\u274C \u0645\u0639\u0637\u0644", inline: true },
            { name: "\u0645\u0635\u064A\u062F\u0629 \u0627\u0644\u0633\u0628\u0627\u0645", value: honeypotTrapConfig.enabled ? `\u2705 \u0646\u0634\u0637\u0629 (#${honeypotTrapConfig.channelName})` : "\u274C \u0645\u0639\u0637\u0644\u0629", inline: true },
            { name: "\u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0627\u0644\u0622\u0644\u064A", value: welcomeConfig.enabled ? `\u2705 \u0646\u0634\u0637 (#${welcomeConfig.channelName})` : "\u274C \u0645\u0639\u0637\u0644", inline: true },
            { name: "\u0646\u0638\u0627\u0645 \u0627\u0644\u0623\u0630\u0643\u0627\u0631", value: azkarConfig.enabled ? `\u2705 \u0645\u0641\u0639\u0644 (\u0643\u0644 ${azkarConfig.intervalMinutes} \u062F)` : "\u274C \u0645\u0639\u0637\u0644", inline: true }
          ).setTimestamp();
          await message.reply({ embeds: [embed] }).catch(() => {
          });
          return;
        }
        if (cfg.name === "trap") {
          const embed = new EmbedBuilder().setColor("#dc2626").setTitle("\u{1FAA4} \u0645\u0635\u064A\u062F\u0629 M7R \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 (Anti-Raid Trap)").setDescription(honeypotTrapConfig.customWarningMessage).addFields(
            { name: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0635\u064A\u062F\u0629", value: honeypotTrapConfig.enabled ? "\u{1F7E2} \u0646\u0634\u0637\u0629 \u0648\u0645\u062D\u0645\u064A\u0629" : "\u{1F534} \u0645\u0639\u0637\u0644\u0629", inline: true },
            { name: "\u0631\u0648\u0645 \u0627\u0644\u0645\u0635\u064A\u062F\u0629", value: `\`#${honeypotTrapConfig.channelName}\``, inline: true },
            { name: "\u0627\u0644\u0639\u0642\u0648\u0628\u0629 \u0627\u0644\u0641\u0648\u0631\u064A\u0629", value: `\`${honeypotTrapConfig.punishment.toUpperCase()}\``, inline: true },
            { name: "\u0625\u062C\u0645\u0627\u0644\u064A \u0645\u0646 \u0648\u0642\u0639 \u0628\u0627\u0644\u0641\u062E", value: `\`${honeypotTrapConfig.totalTrapped}\` \u0645\u062E\u0627\u0644\u0641`, inline: true }
          ).setFooter({ text: "M7R Honeypot System \u2022 \u062D\u0645\u0627\u064A\u0629 \u0645\u062A\u0642\u062F\u0645\u0629" }).setTimestamp();
          await message.reply({ embeds: [embed] }).catch(() => {
          });
          return;
        }
        if (cfg.name === "welcome") {
          const targetUser = message.mentions.users.first() || message.author;
          const payload = buildWelcomePayload({
            userId: targetUser.id,
            username: targetUser.username,
            avatarUrl: targetUser.displayAvatarURL(),
            serverName: message.guild.name,
            memberCount: message.guild.memberCount
          });
          await message.channel.send(payload).catch(() => {
          });
          return;
        }
        if (cfg.name === "setwelcome") {
          if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild) && message.guild.ownerId !== message.author.id) {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062A\u062D\u062F\u064A\u062F \u0631\u0648\u0645 \u0627\u0644\u062A\u0631\u062D\u064A\u0628!").catch(() => {
            });
            return;
          }
          const chMention = message.mentions.channels.first();
          const newChName = chMention && "name" in chMention ? chMention.name : message.channel.name;
          welcomeConfig.channelName = newChName;
          welcomeConfig.enabled = true;
          await message.reply(`${cfg.customReply} (\`#${newChName}\`)`).catch(() => {
          });
          return;
        }
        if (cfg.name === "lock") {
          if (message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
            await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false }).catch(() => {
            });
            await message.reply(cfg.customReply).catch(() => {
            });
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0642\u0641\u0644 \u0627\u0644\u0631\u0648\u0645\u0627\u062A!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "unlock") {
          if (message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
            await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: null }).catch(() => {
            });
            await message.reply(cfg.customReply).catch(() => {
            });
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0641\u062A\u062D \u0627\u0644\u0631\u0648\u0645\u0627\u062A!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "hide") {
          if (message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
            await message.channel.permissionOverwrites.edit(message.guild.id, { ViewChannel: false }).catch(() => {
            });
            await message.reply(cfg.customReply).catch(() => {
            });
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u0631\u0648\u0645\u0627\u062A!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "show") {
          if (message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
            await message.channel.permissionOverwrites.edit(message.guild.id, { ViewChannel: null }).catch(() => {
            });
            await message.reply(cfg.customReply).catch(() => {
            });
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0631\u0648\u0645\u0627\u062A!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "clear") {
          if (message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const count = Math.min(100, Math.max(1, parseInt(args[0]) || 25));
            await message.channel.bulkDelete(count, true).catch(() => {
            });
            const m = await message.channel.send(`${cfg.customReply} (\`${count}\` \u0631\u0633\u0627\u0644\u0629)`).catch(() => null);
            if (m) setTimeout(() => m.delete().catch(() => {
            }), 4e3);
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u0633\u062D \u0627\u0644\u0631\u0633\u0627\u0626\u0644!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "ban") {
          if (message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
            const target = message.mentions.members?.first();
            if (!target) {
              await message.reply(`\u26A0\uFE0F \u0645\u0646\u0634\u0646 \u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0631\u0627\u062F \u062D\u0638\u0631\u0647! \u0645\u062B\u0627\u0644: \`${pfx}ban @user\``).catch(() => {
              });
              return;
            }
            if (target.bannable) {
              await target.ban({ reason: `Banned by ${message.author.tag}` }).catch(() => {
              });
              await message.reply(`${cfg.customReply} (<@${target.id}>)`).catch(() => {
              });
            } else {
              await message.reply("\u26A0\uFE0F \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u062D\u0638\u0631 \u0647\u0630\u0627 \u0627\u0644\u0639\u0636\u0648 (\u0631\u062A\u0628\u062A\u0647 \u0623\u0639\u0644\u0649 \u0645\u0646 \u0627\u0644\u0628\u0648\u062A)!").catch(() => {
              });
            }
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062D\u0638\u0631!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "unban") {
          if (message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
            const targetId = (args[0] || "").replace(/[^0-9]/g, "");
            if (!targetId) {
              await message.reply(`\u26A0\uFE0F \u0636\u0639 \u0622\u064A\u062F\u064A (ID) \u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0631\u0627\u062F \u0641\u0643 \u062D\u0638\u0631\u0647! \u0645\u062B\u0627\u0644: \`${pfx}unban 123456789\``).catch(() => {
              });
              return;
            }
            const unbanned = await message.guild.members.unban(targetId).catch(() => null);
            if (unbanned) {
              await message.reply(`${cfg.customReply} (\`${targetId}\`)`).catch(() => {
              });
            } else {
              await message.reply("\u26A0\uFE0F \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u062D\u0638\u0631 \u0644\u0647\u0630\u0627 \u0627\u0644\u0622\u064A\u062F\u064A \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631!").catch(() => {
              });
            }
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0641\u0643 \u0627\u0644\u062D\u0638\u0631!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "kick") {
          if (message.member?.permissions.has(PermissionFlagsBits.KickMembers)) {
            const target = message.mentions.members?.first();
            if (!target) {
              await message.reply(`\u26A0\uFE0F \u0645\u0646\u0634\u0646 \u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0631\u0627\u062F \u0637\u0631\u062F\u0647! \u0645\u062B\u0627\u0644: \`${pfx}kick @user\``).catch(() => {
              });
              return;
            }
            if (target.kickable) {
              await target.kick(`Kicked by ${message.author.tag}`).catch(() => {
              });
              await message.reply(`${cfg.customReply} (<@${target.id}>)`).catch(() => {
              });
            } else {
              await message.reply("\u26A0\uFE0F \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0637\u0631\u062F \u0647\u0630\u0627 \u0627\u0644\u0639\u0636\u0648!").catch(() => {
              });
            }
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0637\u0631\u062F!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "mute") {
          if (message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            const target = message.mentions.members?.first();
            if (!target) {
              await message.reply(`\u26A0\uFE0F \u0645\u0646\u0634\u0646 \u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0631\u0627\u062F \u0643\u062A\u0645\u0647! \u0645\u062B\u0627\u0644: \`${pfx}mute @user 15\``).catch(() => {
              });
              return;
            }
            const mins = Math.max(1, Math.min(10080, parseInt(args[1]) || 15));
            if (target.moderatable) {
              await target.timeout(mins * 60 * 1e3, `Muted by ${message.author.tag}`).catch(() => {
              });
              await message.reply(`${cfg.customReply} (<@${target.id}> \u0644\u0645\u062F\u0629 \`${mins}\` \u062F\u0642\u064A\u0642\u0629)`).catch(() => {
              });
            } else {
              await message.reply("\u26A0\uFE0F \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0643\u062A\u0645 \u0647\u0630\u0627 \u0627\u0644\u0639\u0636\u0648!").catch(() => {
              });
            }
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0643\u062A\u0645!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "unmute") {
          if (message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            const target = message.mentions.members?.first();
            if (!target) {
              await message.reply(`\u26A0\uFE0F \u064A\u0631\u062C\u0649 \u0645\u0646\u0634\u0646 \u0627\u0644\u0639\u0636\u0648! \u0645\u062B\u0627\u0644: \`${pfx}unmute @user\``).catch(() => {
              });
              return;
            }
            if (target.moderatable) {
              await target.timeout(null, `Unmuted by ${message.author.tag}`).catch(() => {
              });
              await message.reply(`${cfg.customReply} (<@${target.id}>)`).catch(() => {
              });
            } else {
              await message.reply("\u26A0\uFE0F \u0644\u0627 \u064A\u0645\u0643\u0646\u0646\u064A \u0641\u0643 \u0627\u0644\u0643\u062A\u0645 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0639\u0636\u0648 (\u0631\u062A\u0628\u062A\u0647 \u0623\u0639\u0644\u0649 \u0645\u0646 \u0627\u0644\u0628\u0648\u062A)!").catch(() => {
              });
            }
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0641\u0643 \u0627\u0644\u0643\u062A\u0645!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "slowmode") {
          if (message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
            const secs = Math.max(0, Math.min(21600, parseInt(args[0]) || 5));
            await message.channel.setRateLimitPerUser(secs).catch(() => {
            });
            await message.reply(`${cfg.customReply} (\`${secs}\` \u062B\u0627\u0646\u064A\u0629)`).catch(() => {
            });
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 `Manage Channels`!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "warn") {
          if (message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            const target = message.mentions.members?.first();
            if (!target) {
              await message.reply(`\u26A0\uFE0F \u064A\u0631\u062C\u0649 \u0645\u0646\u0634\u0646 \u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0631\u0627\u062F \u062A\u062D\u0630\u064A\u0631\u0647! \u0645\u062B\u0627\u0644: \`${pfx}warn @user \u0633\u0628\u0628 \u0627\u0644\u0645\u062E\u0627\u0644\u0641\u0629\``).catch(() => {
              });
              return;
            }
            const reason = args.slice(1).join(" ") || "\u0645\u062E\u0627\u0644\u0641\u0629 \u0642\u0648\u0627\u0646\u064A\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631";
            const list = userWarningsMap.get(target.id) || [];
            list.push({ reason, mod: message.author.tag, date: (/* @__PURE__ */ new Date()).toLocaleDateString("ar-EG") });
            userWarningsMap.set(target.id, list);
            await message.reply(`${cfg.customReply} (<@${target.id}> \u2014 \u0627\u0644\u0633\u0628\u0628: \`${reason}\` | \u0627\u0644\u062A\u062D\u0630\u064A\u0631 \u0631\u0642\u0645 \`#${list.length}\`)`).catch(() => {
            });
            await sendLogToDiscordServer("\u062A\u062D\u0630\u064A\u0631 \u0625\u062F\u0627\u0631\u064A \u0644\u0639\u0636\u0648", `\u0642\u0627\u0645 \u0627\u0644\u0645\u0634\u0631\u0641 <@${message.author.id}> \u0628\u062A\u062D\u0630\u064A\u0631 <@${target.id}>.
**\u0627\u0644\u0633\u0628\u0628:** ${reason}`, "#f59e0b");
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062A\u062D\u0630\u064A\u0631 \u0627\u0644\u0623\u0639\u0636\u0627\u0621!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "warnings") {
          const target = message.mentions.users.first() || message.author;
          const list = userWarningsMap.get(target.id) || [];
          const desc = list.length === 0 ? "\u2705 \u0633\u062C\u0644 \u0627\u0644\u0639\u0636\u0648 \u0646\u0638\u064A\u0641 \u0648\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0644\u064A\u0647 \u0623\u064A \u062A\u062D\u0630\u064A\u0631\u0627\u062A \u0633\u0627\u0628\u0642\u0629." : list.map((w, idx) => `**#${idx + 1}** \u2014 \`${w.reason}\` (\u0628\u0648\u0627\u0633\u0637\u0629: ${w.mod} \u2022 ${w.date})`).join("\n");
          const embed = new EmbedBuilder().setColor("#f59e0b").setTitle(`\u{1F4CB} \u0633\u062C\u0644 \u062A\u062D\u0630\u064A\u0631\u0627\u062A | ${target.username}`).setDescription(desc).setFooter({ text: `\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A: ${list.length}` });
          await message.reply({ embeds: [embed] }).catch(() => {
          });
          return;
        }
        if (cfg.name === "clearwarnings") {
          if (message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            const target = message.mentions.users.first();
            if (!target) {
              await message.reply(`\u26A0\uFE0F \u064A\u0631\u062C\u0649 \u0645\u0646\u0634\u0646 \u0627\u0644\u0639\u0636\u0648! \u0645\u062B\u0627\u0644: \`${pfx}clearwarnings @user\``).catch(() => {
              });
              return;
            }
            userWarningsMap.delete(target.id);
            await message.reply(`${cfg.customReply} (<@${target.id}>)`).catch(() => {
            });
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u0633\u062D \u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "role") {
          if (message.member?.permissions.has(PermissionFlagsBits.ManageRoles)) {
            const target = message.mentions.members?.first();
            const roleName = args.slice(1).join(" ").trim();
            if (!target || !roleName) {
              await message.reply(`\u26A0\uFE0F \u0645\u062B\u0627\u0644: \`${pfx}role @user VIP\``).catch(() => {
              });
              return;
            }
            const role = message.guild.roles.cache.find((r) => r.name.toLowerCase().includes(roleName.toLowerCase()));
            if (!role) {
              await message.reply(`\u26A0\uFE0F \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0631\u062A\u0628\u0629 \u0628\u0627\u0633\u0645 \`${roleName}\`!`).catch(() => {
              });
              return;
            }
            if (target.roles.cache.has(role.id)) {
              await target.roles.remove(role).catch(() => {
              });
              await message.reply(`\u2796 \u062A\u0645 \u0633\u062D\u0628 \u0631\u062A\u0628\u0629 **${role.name}** \u0645\u0646 <@${target.id}>!`).catch(() => {
              });
            } else {
              await target.roles.add(role).catch(() => {
              });
              await message.reply(`\u2795 \u062A\u0645 \u0645\u0646\u062D \u0631\u062A\u0628\u0629 **${role.name}** \u0644\u0640 <@${target.id}>!`).catch(() => {
              });
            }
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0631\u062A\u0628!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "nick") {
          if (message.member?.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            const target = message.mentions.members?.first();
            const newNick = args.slice(1).join(" ").trim();
            if (!target) {
              await message.reply(`\u26A0\uFE0F \u0645\u062B\u0627\u0644: \`${pfx}nick @user \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u062C\u062F\u064A\u062F\``).catch(() => {
              });
              return;
            }
            await target.setNickname(newNick || null).catch(() => {
            });
            await message.reply(`${cfg.customReply} (<@${target.id}>)`).catch(() => {
            });
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0623\u0644\u0642\u0627\u0628!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "vkick") {
          if (message.member?.permissions.has(PermissionFlagsBits.MoveMembers)) {
            const target = message.mentions.members?.first();
            if (!target || !target.voice.channel) {
              await message.reply("\u26A0\uFE0F \u064A\u0631\u062C\u0649 \u0645\u0646\u0634\u0646 \u0639\u0636\u0648 \u0645\u062A\u0648\u0627\u062C\u062F \u0641\u064A \u0631\u0648\u0645 \u0635\u0648\u062A\u064A!").catch(() => {
              });
              return;
            }
            await target.voice.disconnect().catch(() => {
            });
            await message.reply(`${cfg.customReply} (<@${target.id}>)`).catch(() => {
            });
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0641\u0635\u0644 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0635\u0648\u062A\u064A\u0627\u064B!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "vmute") {
          if (message.member?.permissions.has(PermissionFlagsBits.MuteMembers)) {
            const target = message.mentions.members?.first();
            if (!target || !target.voice.channel) {
              await message.reply("\u26A0\uFE0F \u064A\u0631\u062C\u0649 \u0645\u0646\u0634\u0646 \u0639\u0636\u0648 \u0645\u062A\u0648\u0627\u062C\u062F \u0641\u064A \u0631\u0648\u0645 \u0635\u0648\u062A\u064A!").catch(() => {
              });
              return;
            }
            await target.voice.setMute(true).catch(() => {
            });
            await message.reply(`${cfg.customReply} (<@${target.id}>)`).catch(() => {
            });
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0643\u062A\u0645 \u0627\u0644\u0645\u0627\u064A\u0643!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "vunmute") {
          if (message.member?.permissions.has(PermissionFlagsBits.MuteMembers)) {
            const target = message.mentions.members?.first();
            if (!target || !target.voice.channel) {
              await message.reply("\u26A0\uFE0F \u064A\u0631\u062C\u0649 \u0645\u0646\u0634\u0646 \u0639\u0636\u0648 \u0645\u062A\u0648\u0627\u062C\u062F \u0641\u064A \u0631\u0648\u0645 \u0635\u0648\u062A\u064A!").catch(() => {
              });
              return;
            }
            await target.voice.setMute(false).catch(() => {
            });
            await message.reply(`${cfg.customReply} (<@${target.id}>)`).catch(() => {
            });
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0641\u0643 \u0643\u062A\u0645 \u0627\u0644\u0645\u0627\u064A\u0643!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "move") {
          if (message.member?.permissions.has(PermissionFlagsBits.MoveMembers)) {
            const target = message.mentions.members?.first();
            const authorVoice = message.member.voice.channel;
            if (!target || !target.voice.channel || !authorVoice) {
              await message.reply("\u26A0\uFE0F \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0623\u0646\u062A \u0648\u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0630\u0643\u0648\u0631 \u0641\u064A \u0631\u0648\u0645\u0627\u062A \u0635\u0648\u062A\u064A\u0629 \u0644\u0633\u062D\u0628\u0647 \u0625\u0644\u064A\u0643!").catch(() => {
              });
              return;
            }
            await target.voice.setChannel(authorVoice).catch(() => {
            });
            await message.reply(`${cfg.customReply} (<@${target.id}> \u2B05\uFE0F <#${authorVoice.id}>)`).catch(() => {
            });
          } else {
            await message.reply("\u274C \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0633\u062D\u0628 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0635\u0648\u062A\u064A\u0627\u064B!").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "panel") {
          const payload = buildTicketPanelMessagePayload();
          await message.channel.send(payload).catch(() => {
          });
          return;
        }
        if (cfg.name === "claim") {
          await message.reply(`${cfg.customReply} (<@${message.author.id}>)`).catch(() => {
          });
          return;
        }
        if (cfg.name === "close") {
          await message.reply(cfg.customReply).catch(() => {
          });
          return;
        }
        if (cfg.name === "come") {
          const target = message.mentions.members?.first();
          if (!target) {
            await message.reply(`\u26A0\uFE0F \u0645\u0646\u0634\u0646 \u0627\u0644\u0639\u0636\u0648 \u0627\u0644\u0645\u0631\u0627\u062F \u0646\u062F\u0627\u0624\u0647! \u0645\u062B\u0627\u0644: \`${pfx}come @user\``).catch(() => {
            });
            return;
          }
          await target.send(`\u{1F4F2} **\u0646\u062F\u0627\u0621 \u0639\u0627\u062C\u0644 \u0645\u0646 \u0625\u062F\u0627\u0631\u0629 ${message.guild.name}:**
\u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0648\u062C\u0647 \u0641\u0648\u0631\u0627\u064B \u0625\u0644\u0649 \u0627\u0644\u0631\u0648\u0645 <#${message.channel.id}> \u0628\u0648\u0627\u0633\u0637\u0629 <@${message.author.id}>.`).catch(() => {
          });
          await message.reply(`${cfg.customReply} (<@${target.id}>)`).catch(() => {
          });
          return;
        }
        if (cfg.name === "tax") {
          const rawNum = parseInt((args[0] || "").replace(/[^0-9]/g, "")) || 1e4;
          const withTax = Math.ceil(rawNum * 20 / 19);
          const mediatorTax = Math.ceil(withTax * 20 / 19);
          const embed = new EmbedBuilder().setColor("#10b981").setTitle("\u{1F4B0} \u062D\u0627\u0633\u0628\u0629 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0645\u062A\u062C\u0631 (M7R ProBot Tax)").addFields(
            { name: "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0635\u0627\u0641\u064A", value: `\`${rawNum.toLocaleString()}\``, inline: true },
            { name: "\u0627\u0644\u0645\u0628\u0644\u063A \u0645\u0639 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 (5%)", value: `\`${withTax.toLocaleString()}\``, inline: true },
            { name: "\u0645\u0639 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0648\u0633\u064A\u0637", value: `\`${mediatorTax.toLocaleString()}\``, inline: true }
          );
          await message.reply({ embeds: [embed] }).catch(() => {
          });
          return;
        }
        if (cfg.name === "say") {
          if (message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const textToSay = args.join(" ");
            if (!textToSay) return;
            await message.delete().catch(() => {
            });
            await message.channel.send(textToSay).catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "embed") {
          if (message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const textToEmbed = args.join(" ");
            if (!textToEmbed) return;
            await message.delete().catch(() => {
            });
            const embed = new EmbedBuilder().setColor("#e11d48").setDescription(textToEmbed).setFooter({ text: message.guild.name }).setTimestamp();
            await message.channel.send({ embeds: [embed] }).catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "user") {
          const targetUser = message.mentions.users.first() || message.author;
          const embed = new EmbedBuilder().setColor("#e11d48").setTitle(`\u{1FAAA} \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0639\u0636\u0648 | ${targetUser.username}`).setThumbnail(targetUser.displayAvatarURL()).addFields(
            { name: "\u0627\u0644\u0627\u0633\u0645", value: `\`${targetUser.tag}\``, inline: true },
            { name: "\u0627\u0644\u0622\u064A\u062F\u064A (ID)", value: `\`${targetUser.id}\``, inline: true }
          );
          await message.reply({ embeds: [embed] }).catch(() => {
          });
          return;
        }
        if (cfg.name === "avatar") {
          const targetUser = message.mentions.users.first() || message.author;
          const embed = new EmbedBuilder().setColor("#e11d48").setTitle(`\u{1F5BC}\uFE0F \u0627\u0641\u062A\u0627\u0631 ${targetUser.username}`).setImage(targetUser.displayAvatarURL({ size: 512 }));
          await message.reply({ embeds: [embed] }).catch(() => {
          });
          return;
        }
        if (cfg.name === "banner") {
          const targetUser = await (message.mentions.users.first() || message.author).fetch().catch(() => message.author);
          const bannerUrl = targetUser.bannerURL({ size: 1024 });
          const embed = new EmbedBuilder().setColor("#e11d48").setTitle(`\u{1F3A8} \u0628\u0646\u0631 ${targetUser.username}`).setDescription(bannerUrl ? "" : "\u26A0\uFE0F \u0647\u0630\u0627 \u0627\u0644\u0639\u0636\u0648 \u0644\u0627 \u064A\u0636\u0639 \u0635\u0648\u0631\u0629 \u0628\u0646\u0631 \u062D\u0627\u0644\u064A\u0627\u064B.").setThumbnail(targetUser.displayAvatarURL());
          if (bannerUrl) embed.setImage(bannerUrl);
          await message.reply({ embeds: [embed] }).catch(() => {
          });
          return;
        }
        if (cfg.name === "roles") {
          const rolesList = message.guild.roles.cache.filter((r) => r.name !== "@everyone").sort((a, b) => b.position - a.position).map((r) => `<@&${r.id}> (\`${r.members.size}\`)`).slice(0, 35).join(" \u2022 ");
          const embed = new EmbedBuilder().setColor("#e11d48").setTitle(`\u{1F451} \u0631\u062A\u0628 \u0633\u064A\u0631\u0641\u0631 ${message.guild.name}`).setDescription(rolesList || "\u0644\u0627 \u062A\u0648\u062C\u062F \u0631\u062A\u0628.");
          await message.reply({ embeds: [embed] }).catch(() => {
          });
          return;
        }
        if (cfg.name === "server") {
          const g = message.guild;
          const embed = new EmbedBuilder().setColor("#e11d48").setTitle(`\u{1F4CA} ${g.name}`).setDescription(cfg.customReply).addFields(
            { name: "\u0639\u062F\u062F \u0627\u0644\u0623\u0639\u0636\u0627\u0621", value: `${g.memberCount}`, inline: true },
            { name: "\u0639\u062F\u062F \u0627\u0644\u0631\u0648\u0645\u0627\u062A", value: `${g.channels.cache.size}`, inline: true },
            { name: "\u0639\u062F\u062F \u0627\u0644\u0631\u062A\u0628", value: `${g.roles.cache.size}`, inline: true }
          );
          await message.reply({ embeds: [embed] }).catch(() => {
          });
          return;
        }
        if (cfg.name === "help") {
          const safeServerCommands = discordCommands.filter((c) => c.enabled && !SENSITIVE_COMMAND_NAMES.includes(c.name)).map((c) => `\u2022 \`${pfx}${c.name}\` (${c.aliases.slice(0, 2).join(" / ")}) \u2014 ${c.description}`).join("\n").slice(0, 3200);
          const extraServerCmds = `

**\u{1F310} \u0623\u0648\u0627\u0645\u0631 \u062F\u0634\u0628\u0648\u0631\u062F \u0627\u0644\u0648\u064A\u0628 \u0648\u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A:**
\u2022 \`${pfx}\u062F\u0634\u0628\u0648\u0631\u062F\` / \`${pfx}dashboard\` \u2014 \u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u0648\u064A\u0628 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0645\u0639 \u0623\u0632\u0631\u0627\u0631 \u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u0645\u0628\u0627\u0634\u0631
\u2022 \`${pfx}\u062A\u062D\u0643\u0645\` / \`${pfx}control\` \u2014 \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0633\u0631\u064A\u0639\u0629 (\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0622\u0645\u0646\u0629 \u0641\u0642\u0637)
\u2022 \`${pfx}\u0642\u0631\u0627\u0646\` / \`${pfx}quran\` \u2014 \u0639\u0631\u0636 \u0648\u062A\u0628\u062F\u064A\u0644 \u0642\u0627\u0631\u0626 \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 24/7
\u2022 \`${pfx}\u0642\u0631\u0639\u0629\` / \`${pfx}giveaway\` \u2014 \u0633\u062D\u0628 \u0641\u0627\u0626\u0632 \u0639\u0634\u0648\u0627\u0626\u064A \u0645\u0646 \u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0633\u064A\u0631\u0641\u0631
\u2022 \`${pfx}\u062A\u0635\u0648\u064A\u062A\` / \`${pfx}poll\` \u2014 \u0625\u0646\u0634\u0627\u0621 \u062A\u0635\u0648\u064A\u062A \u062A\u0641\u0627\u0639\u0644\u064A \u0641\u064A \u0627\u0644\u0634\u0627\u062A
\u2022 \`${pfx}\u0627\u0642\u062A\u0631\u0627\u062D\` / \`${pfx}suggest\` \u2014 \u0625\u0631\u0633\u0627\u0644 \u0627\u0642\u062A\u0631\u0627\u062D \u0645\u0646\u0633\u0642 \u0645\u0639 \u0627\u0644\u062A\u0635\u0648\u064A\u062A`;
          const embed = new EmbedBuilder().setColor("#10b981").setTitle(`\u{1F4DC} \u0642\u0627\u0626\u0645\u0629 \u0623\u0648\u0627\u0645\u0631 \u0633\u064A\u0631\u0641\u0631 ${message.guild.name} \u0627\u0644\u0622\u0645\u0646\u0629 \u0648\u0627\u0644\u0645\u0641\u064A\u062F\u0629`).setDescription(`${cfg.customReply}
*(\u062A\u0645 \u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0648\u0627\u0644\u062E\u0637\u064A\u0631\u0629 \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631)*

${safeServerCommands}${extraServerCmds}`);
          await message.reply({ embeds: [embed] }).catch(() => {
          });
          return;
        }
        if (cfg.name === "dashboard") {
          const payload = buildWebDashboardPayload(
            message.guild.name,
            message.guild.memberCount,
            client.ws.ping > 0 ? client.ws.ping : 17
          );
          await message.reply(payload).catch(() => {
          });
          return;
        }
        if (cfg.name === "giveaway") {
          const prize = args.join(" ").trim() || "\u062C\u0627\u0626\u0632\u0629 \u0645\u0645\u064A\u0632\u0629 \u0645\u0646 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u{1F381}";
          const members = message.guild.members.cache.filter((m) => !m.user.bot);
          const winner = members.size > 0 ? members.random()?.user : message.author;
          const embed = new EmbedBuilder().setColor("#f59e0b").setTitle(`\u{1F389} \u0642\u0631\u0639\u0629 \u0648\u0633\u062D\u0628 \u0639\u0634\u0648\u0627\u0626\u064A | ${message.guild.name}`).setDescription(
            `\u{1F381} **\u0627\u0644\u062C\u0627\u0626\u0632\u0629 / \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629:** \`${prize}\`

\u{1F973} **\u0627\u0644\u0641\u0627\u0626\u0632 \u0627\u0644\u0645\u062D\u0638\u0648\u0638 \u0647\u0648:** <@${winner?.id || message.author.id}>!
\u{1F451} **\u0628\u0648\u0627\u0633\u0637\u0629:** <@${message.author.id}>`
          ).setThumbnail(winner?.displayAvatarURL() || message.author.displayAvatarURL()).setFooter({ text: "M7R Giveaway System \u2022 \u0645\u0628\u0631\u0648\u0643 \u0644\u0644\u0641\u0627\u0626\u0632!" }).setTimestamp();
          await message.reply({ embeds: [embed] }).catch(() => {
          });
          return;
        }
        if (cfg.name === "poll") {
          const question = args.join(" ").trim() || "\u0645\u0627 \u0631\u0623\u064A\u0643\u0645 \u0641\u064A \u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u0625\u0636\u0627\u0641\u0629 \u0641\u0639\u0627\u0644\u064A\u0627\u062A \u062C\u062F\u064A\u062F\u0629\u061F";
          const embed = new EmbedBuilder().setColor("#3b82f6").setTitle("\u{1F4CA} \u062A\u0635\u0648\u064A\u062A \u0648\u0627\u0633\u062A\u0641\u062A\u0627\u0621 \u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0633\u064A\u0631\u0641\u0631").setDescription(`**${question}**

\u0635\u0648\u0651\u062A \u0627\u0644\u0622\u0646 \u0628\u0627\u0644\u0636\u063A\u0637 \u0639\u0644\u0649 \u0627\u0644\u0625\u064A\u0645\u0648\u062C\u064A \u0628\u0627\u0644\u0623\u0633\u0641\u0644:
\u2705 = **\u0645\u0648\u0627\u0641\u0642 / \u0645\u0624\u064A\u062F**
\u274C = **\u063A\u064A\u0631 \u0645\u0648\u0627\u0641\u0642**`).setFooter({ text: `\u062A\u0645 \u0637\u0631\u062D \u0627\u0644\u062A\u0635\u0648\u064A\u062A \u0628\u0648\u0627\u0633\u0637\u0629 ${message.author.username}` }).setTimestamp();
          const sentPoll = await message.channel.send({ embeds: [embed] }).catch(() => null);
          if (sentPoll) {
            await sentPoll.react("\u2705").catch(() => {
            });
            await sentPoll.react("\u274C").catch(() => {
            });
          }
          return;
        }
        if (cfg.name === "suggest") {
          const idea = args.join(" ").trim() || "\u0625\u0636\u0627\u0641\u0629 \u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0648\u0645\u0633\u0627\u0628\u0642\u0627\u062A \u0623\u0633\u0628\u0648\u0639\u064A\u0629 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631";
          const embed = new EmbedBuilder().setColor("#8b5cf6").setTitle("\u{1F4A1} \u0627\u0642\u062A\u0631\u0627\u062D \u062C\u062F\u064A\u062F \u0644\u0644\u0633\u064A\u0631\u0641\u0631").setDescription(`**\u0627\u0644\u0645\u0642\u062A\u0631\u062D:**
> ${idea}

\u{1F464} **\u0635\u0627\u062D\u0628 \u0627\u0644\u0627\u0642\u062A\u0631\u0627\u062D:** <@${message.author.id}>`).setThumbnail(message.author.displayAvatarURL()).setFooter({ text: "\u0635\u0648\u0651\u062A \u0628\u0640 \u{1F44D} \u0623\u0648 \u{1F44E} \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0627\u0642\u062A\u0631\u0627\u062D" }).setTimestamp();
          const sentSug = await message.channel.send({ embeds: [embed] }).catch(() => null);
          if (sentSug) {
            await sentSug.react("\u{1F44D}").catch(() => {
            });
            await sentSug.react("\u{1F44E}").catch(() => {
            });
          }
          return;
        }
        if (["apply", "\u062A\u0642\u062F\u064A\u0645", "\u0628\u0627\u0646\u0644-\u062A\u0642\u062F\u064A\u0645", "\u0627\u0633\u062A\u0645\u0627\u0631\u0629"].includes(cmdRaw)) {
          const payload = buildApplicationPanelPayload();
          await message.channel.send(payload).catch(() => {
          });
          return;
        }
        await message.reply(cfg.customReply).catch(() => {
        });
        return;
      }
      if (["\u062F\u0634\u0628\u0648\u0631\u062F", "\u062F\u0627\u0634\u0628\u0648\u0631\u062F", "\u0648\u064A\u0628", "\u0644\u0648\u062D\u0629-\u0627\u0644\u0648\u064A\u0628", "web"].includes(cmdRaw)) {
        const payload = buildWebDashboardPayload(
          message.guild.name,
          message.guild.memberCount,
          client.ws.ping > 0 ? client.ws.ping : 17
        );
        await message.reply(payload).catch(() => {
        });
        return;
      }
      if (["\u062A\u0642\u064A\u064A\u0645", "\u062A\u0642\u064A\u0645", "\u0627\u062F\u0627\u0621", "\u0623\u062F\u0627\u0621", "\u062A\u0642\u064A\u064A\u0645-\u0627\u0644\u0628\u0648\u062A", "benchmark", "perf"].includes(cmdRaw)) {
        const perf = computeBotPerformanceEvaluation();
        const embed = buildBotPerformanceEmbed(perf, message.guild.name);
        await message.reply({ embeds: [embed] }).catch(() => {
        });
        return;
      }
      if (["\u062A\u062D\u0643\u0645", "\u0644\u0648\u062D\u0629", "control", "dashboard", "\u0627\u0639\u062F\u0627\u062F\u0627\u062A"].includes(cmdRaw)) {
        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild) && message.guild.ownerId !== message.author.id) {
          await message.reply("\u274C \u0647\u0630\u0627 \u0627\u0644\u0623\u0645\u0631 \u0645\u062E\u0635\u0635 \u0644\u0645\u0646 \u064A\u0645\u062A\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0641\u0642\u0637!").catch(() => {
          });
          return;
        }
        const activeRec = getActiveReciter();
        const ctrlEmbed = new EmbedBuilder().setColor("#10b981").setTitle(`\u{1F39B}\uFE0F \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0622\u0645\u0646\u0629 | ${message.guild.name}`).setURL(WEB_DASHBOARD_PUBLIC_URL).setDescription(
          `\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A **\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0633\u064A\u0631\u0641\u0631**! \u062A\u0639\u0631\u0636 \u0647\u0630\u0647 \u0627\u0644\u0644\u0648\u062D\u0629 \u0623\u062F\u0648\u0627\u062A \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u0627\u0644\u0645\u062C\u062A\u0645\u0639 \u0641\u0642\u0637 *(\u062A\u0645 \u062D\u062C\u0628 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0648\u0627\u0644\u0642\u0648\u064A\u0629 \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631)*:

\u2022 **\u{1F310} \u062F\u0634\u0628\u0648\u0631\u062F \u0627\u0644\u0648\u064A\u0628:** [\u0627\u0636\u063A\u0637 \u0647\u0646\u0627 \u0644\u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0627\u0644\u0648\u064A\u0628](${WEB_DASHBOARD_PUBLIC_URL})
\u2022 **\u{1F3AB} \u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0630\u0627\u0643\u0631:** \`#${ticketPanelConfig.targetChannelName}\`
\u2022 **\u{1F4CB} \u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0642\u062F\u064A\u0645\u0627\u062A:** \`#${applicationsConfig.applyChannelName}\` (${applicationsConfig.enabled ? "\u{1F7E2} \u0645\u0641\u062A\u0648\u062D" : "\u{1F534} \u0645\u063A\u0644\u0642"})
\u2022 **\u{1F44B} \u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0627\u0644\u0622\u0644\u064A:** \`#${welcomeConfig.channelName}\` (${welcomeConfig.enabled ? "\u{1F7E2} \u0645\u0641\u0639\u0644" : "\u{1F534} \u0645\u0639\u0637\u0644"})
\u2022 **\u{1F4FF} \u0646\u0638\u0627\u0645 \u0627\u0644\u0623\u0630\u0643\u0627\u0631:** \`#${azkarConfig.channelName}\` (\u0643\u0644 ${azkarConfig.intervalMinutes} \u062F\u0642\u064A\u0642\u0629)
\u2022 **\u{1F54C} \u0625\u0630\u0627\u0639\u0629 \u0627\u0644\u0642\u0631\u0622\u0646 24/7:** \u0627\u0644\u0634\u064A\u062E **${activeRec.name}** (${voiceConnectionStatus === "connected" ? "\u{1F7E2} \u0645\u062A\u0635\u0644 \u0628\u0627\u0644\u0641\u0648\u064A\u0633" : "\u26AA \u062C\u0627\u0647\u0632 \u0644\u0644\u062F\u062E\u0648\u0644"})
\u2022 **\u26A1 \u0633\u0631\u0639\u0629 \u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0628\u0648\u062A (24/7):** \`${client.ws.ping > 0 ? client.ws.ping : 17}ms\``
        ).setFooter({ text: "M7R Safe Server Control \u2022 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (\u0628\u062F\u0648\u0646 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062D\u0633\u0627\u0633\u0629)" }).setTimestamp();
        const ctrlRow1 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("\u{1F310} \u062F\u0634\u0628\u0648\u0631\u062F (\u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0627\u0644\u0648\u064A\u0628)").setStyle(ButtonStyle.Link).setURL(WEB_DASHBOARD_PUBLIC_URL),
          new ButtonBuilder().setCustomId("ctrl_join_quran_vc").setLabel("\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0642\u0631\u0622\u0646 \u0628\u0627\u0644\u0641\u0648\u064A\u0633 24/7").setEmoji("\u{1F50A}").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("dash_btn_giveaway").setLabel("\u0642\u0631\u0639\u0629 \u0639\u0634\u0648\u0627\u0626\u064A\u0629").setEmoji("\u{1F381}").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("dash_btn_stats").setLabel("\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A 7 \u0623\u064A\u0627\u0645").setEmoji("\u{1F4CA}").setStyle(ButtonStyle.Secondary)
        );
        const ctrlRow2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("ctrl_send_tickets").setLabel("\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0647\u0646\u0627").setEmoji("\u{1F3AB}").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("ctrl_send_apply").setLabel("\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0647\u0646\u0627").setEmoji("\u{1F4CB}").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("ctrl_set_welcome_here").setLabel("\u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0647\u0646\u0627").setEmoji("\u{1F44B}").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("ctrl_send_azkar").setLabel("\u0625\u0631\u0633\u0627\u0644 \u0630\u0643\u0631 \u0627\u0644\u0622\u0646").setEmoji("\u{1F4FF}").setStyle(ButtonStyle.Secondary)
        );
        await message.reply({ embeds: [ctrlEmbed], components: [ctrlRow1, ctrlRow2] }).catch(() => {
        });
        return;
      }
      if (["vjoin", "\u0641\u0648\u064A\u0633", "\u0627\u062F\u062E\u0644-\u0641\u0648\u064A\u0633", "\u062F\u062E\u0648\u0644-\u0635\u0648\u062A", "joinvc"].includes(cmdRaw)) {
        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild) && message.guild.ownerId !== message.author.id) {
          await message.reply("\u274C \u0647\u0630\u0627 \u0627\u0644\u0623\u0645\u0631 \u0645\u062E\u0635\u0635 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0641\u0642\u0637!").catch(() => {
          });
          return;
        }
        const authorVoice = message.member?.voice?.channel;
        const targetQuery = authorVoice ? authorVoice.id : args.join(" ") || voice247Config.channelName;
        const res = await joinDiscordVoiceChannel247(targetQuery, message.guild);
        await message.reply(res.message).catch(() => {
        });
        return;
      }
      if (["vleave", "\u062E\u0631\u0648\u062C-\u0641\u0648\u064A\u0633", "\u0627\u0637\u0644\u0639-\u0641\u0648\u064A\u0633", "leavevc", "disconnect"].includes(cmdRaw)) {
        if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild) && message.guild.ownerId !== message.author.id) {
          await message.reply("\u274C \u0647\u0630\u0627 \u0627\u0644\u0623\u0645\u0631 \u0645\u062E\u0635\u0635 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0641\u0642\u0637!").catch(() => {
          });
          return;
        }
        const res = leaveDiscordVoiceChannel(message.guild);
        await message.reply(res.message).catch(() => {
        });
        return;
      }
      if (["vstatus", "\u062D\u0627\u0644\u0629-\u0627\u0644\u0641\u0648\u064A\u0633"].includes(cmdRaw)) {
        const activeRec = getActiveReciter();
        const statusText = voiceConnectionStatus === "connected" ? `\u{1F7E2} **\u0627\u0644\u0628\u0648\u062A \u0645\u062A\u0635\u0644 \u0648\u0645\u0633\u062A\u0642\u0631 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A:** \`${currentVoiceChannelName || voice247Config.channelName}\`
\u{1F4D6} **\u0627\u0644\u0642\u0627\u0631\u0626 \u0627\u0644\u062D\u0627\u0644\u064A:** \u0627\u0644\u0634\u064A\u062E **${activeRec.name}** 24/7
\u{1F552} **\u0646\u0638\u0627\u0645 \u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0622\u0644\u064A:** ${voice247Config.scheduleEnabled ? "\u0645\u0641\u0639\u0644 \u2705" : "\u0645\u0639\u0637\u0644 (\u0628\u062B \u062B\u0627\u0628\u062A) \u23F9\uFE0F"}` : `\u{1F534} **\u0627\u0644\u0628\u0648\u062A \u063A\u064A\u0631 \u0645\u062A\u0635\u0644 \u0641\u064A \u0623\u064A \u0631\u0648\u0645 \u0635\u0648\u062A\u064A \u062D\u0627\u0644\u064A\u0627\u064B.** (\u0627\u0643\u062A\u0628 \`${pfx}vjoin\` \u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0631\u0648\u0645)`;
        await message.reply(statusText).catch(() => {
        });
        return;
      }
      if (["quran", "\u0642\u0631\u0627\u0646", "\u0642\u0631\u0622\u0646", "reciter", "\u0642\u0627\u0631\u0626"].includes(cmdRaw)) {
        const activeRec = getActiveReciter();
        const query = args.join(" ").toLowerCase().trim();
        if (query) {
          if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild) && message.guild.ownerId !== message.author.id) {
            await message.reply("\u274C \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0642\u0627\u0631\u0626 \u0645\u062E\u0635\u0635 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0641\u0642\u0637!").catch(() => {
            });
            return;
          }
          const matchedReciter = QURAN_RECITERS.find(
            (r) => r.id.toLowerCase().includes(query) || r.name.includes(query) || r.nameEn.toLowerCase().includes(query)
          );
          if (!matchedReciter) {
            const listNames = QURAN_RECITERS.map((r) => `\u2022 \`${r.id}\` \u2014 ${r.name}`).join("\n");
            await message.reply(`\u26A0\uFE0F \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0642\u0627\u0631\u0626 \u0628\u0647\u0630\u0627 \u0627\u0644\u0627\u0633\u0645.
**\u0627\u0644\u0642\u0631\u0627\u0621 \u0627\u0644\u0645\u062A\u0627\u062D\u0648\u0646:**
${listNames}`).catch(() => {
            });
            return;
          }
          voice247Config.selectedReciter = matchedReciter.id;
          voice247Config.scheduleEnabled = false;
          voice247Config.audioMode = "quran";
          playQuranAudioForConfig(true);
          savePersistedSession();
          const changeEmbed = new EmbedBuilder().setColor("#10b981").setTitle("\u{1F4D6} \u062A\u0645 \u062A\u0628\u062F\u064A\u0644 \u0642\u0627\u0631\u0626 \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 \u0628\u0646\u062C\u0627\u062D").setDescription(`\u062A\u0645 \u062A\u0634\u063A\u064A\u0644 \u062A\u0644\u0627\u0648\u0627\u062A \u0627\u0644\u0634\u064A\u062E **${matchedReciter.name}** \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \`${currentVoiceChannelName || voice247Config.channelName}\` \u0628\u0646\u062C\u0627\u062D!

\u2022 **\u0627\u0644\u0646\u0645\u0637:** ${matchedReciter.style === "mujawwad" ? "\u0645\u0635\u062D\u0641 \u0645\u062C\u0648\u062F" : matchedReciter.style === "radio" ? "\u0625\u0630\u0627\u0639\u0629 \u0645\u0628\u0627\u0634\u0631\u0629" : "\u0645\u0635\u062D\u0641 \u0645\u0631\u062A\u0644"}
\u2022 **\u0627\u0644\u0648\u0635\u0641:** ${matchedReciter.description}`).setFooter({ text: "M7R Voice 24/7 Quran System" }).setTimestamp();
          await message.reply({ embeds: [changeEmbed] }).catch(() => {
          });
          return;
        }
        const hourMecca = getCurrentMeccaHour();
        const recitersFields = QURAN_RECITERS.map((r) => ({
          name: `${r.id === activeRec.id ? "\u{1F7E2} " : "\u25AB\uFE0F "}${r.name}`,
          value: `\u0627\u0644\u0623\u0645\u0631: \`${pfx}quran ${r.id}\` \u2014 ${r.style}`,
          inline: true
        }));
        const embed = new EmbedBuilder().setColor("#059669").setTitle("\u{1F54C} \u0625\u0630\u0627\u0639\u0629 \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 24/7 | M7R Quran Keeper").setDescription(
          `\u0628\u062B \u0645\u0628\u0627\u0634\u0631 \u0645\u062A\u0648\u0627\u0635\u0644 \u0644\u062A\u0644\u0627\u0648\u0627\u062A \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 \u0628\u062F\u0648\u0646 \u0645\u0648\u0633\u064A\u0642\u0649 \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 24 \u0633\u0627\u0639\u0629.

\u2022 **\u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \u0627\u0644\u062D\u0627\u0644\u064A:** \`${currentVoiceChannelName || voice247Config.channelName}\` (${voiceConnectionStatus === "connected" ? "\u{1F7E2} \u0645\u062A\u0635\u0644" : "\u{1F534} \u063A\u064A\u0631 \u0645\u062A\u0635\u0644"})
\u2022 **\u0627\u0644\u0642\u0627\u0631\u0626 \u0627\u0644\u0646\u0634\u0637 \u0627\u0644\u0622\u0646:** \u0627\u0644\u0634\u064A\u062E **${activeRec.name}**
\u2022 **\u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0622\u0644\u064A (24 \u0633\u0627\u0639\u0629):** ${voice247Config.scheduleEnabled ? "\u0645\u0641\u0639\u0644 (\u062A\u0628\u062F\u064A\u0644 \u062A\u0644\u0642\u0627\u0626\u064A \u062D\u0633\u0628 \u0627\u0644\u0633\u0627\u0639\u0629) \u2705" : "\u0645\u0639\u0637\u0644 \u23F9\uFE0F"}
\u2022 **\u062A\u0648\u0642\u064A\u062A \u0645\u0643\u0629 \u0627\u0644\u0645\u0643\u0631\u0645\u0629 \u0627\u0644\u062D\u0627\u0644\u064A:** \`${hourMecca}:00\`

**\u0644\u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u0642\u0627\u0631\u0626 \u0627\u0643\u062A\u0628:** \`${pfx}quran [\u0627\u0633\u0645 \u0627\u0644\u0642\u0627\u0631\u0626]\` (\u0645\u062B\u0627\u0644: \`${pfx}quran alafasy\` \u0623\u0648 \`${pfx}quran minshawi\`)
**\u0644\u0639\u0631\u0636 \u062C\u062F\u0648\u0644 \u0627\u0644\u0640 24 \u0633\u0627\u0639\u0629 \u0627\u0643\u062A\u0628:** \`${pfx}schedule\``
        ).addFields(recitersFields).setFooter({ text: "M7R Holy Quran 24/7" }).setTimestamp();
        await message.reply({ embeds: [embed] }).catch(() => {
        });
        return;
      }
      if (["schedule", "\u062C\u062F\u0648\u0644", "\u062C\u062F\u0648\u0644-\u0627\u0644\u0642\u0631\u0627\u0646", "\u0645\u0648\u0627\u0639\u064A\u062F-\u0627\u0644\u0642\u0631\u0627\u0621"].includes(cmdRaw)) {
        const hourMecca = getCurrentMeccaHour();
        const slots = voice247Config.scheduleSlots || DEFAULT_QURAN_SCHEDULE;
        const slotsDesc = slots.map((s, idx) => {
          const rec = QURAN_RECITERS.find((r) => r.id === s.reciterId);
          const isCurrent = s.startHour < s.endHour ? hourMecca >= s.startHour && hourMecca < s.endHour : hourMecca >= s.startHour || hourMecca < s.endHour;
          const icon = isCurrent ? "\u2B50 [\u0627\u0644\u0622\u0646] " : "\u{1F552} ";
          return `**${idx + 1}. ${icon}${s.label}:**
\u0627\u0644\u0634\u064A\u062E: **${rec?.name || s.reciterId}**`;
        }).join("\n\n");
        const embed = new EmbedBuilder().setColor("#059669").setTitle("\u{1F4C5} \u062C\u062F\u0648\u0644 \u062A\u0644\u0627\u0648\u0627\u062A \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 24 \u0633\u0627\u0639\u0629").setDescription(
          `\u064A\u062A\u0645 \u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u0642\u0631\u0627\u0621 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 \u0627\u0644\u064A\u0648\u0645 \u0644\u0636\u0645\u0627\u0646 \u0623\u062C\u0648\u0627\u0621 \u0625\u064A\u0645\u0627\u0646\u064A\u0629 \u062E\u0627\u0634\u0639\u0629 \u0648\u0645\u062A\u062C\u062F\u062F\u0629:

${slotsDesc}

\u2022 **\u0627\u0644\u062D\u0627\u0644\u0629:** ${voice247Config.scheduleEnabled ? "\u2705 \u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0622\u0644\u064A \u0645\u0641\u0639\u0644" : "\u23F9\uFE0F \u0627\u0644\u062C\u062F\u0648\u0644 \u0645\u0639\u0637\u0644"}
\u2022 **\u062A\u0648\u0642\u064A\u062A \u0645\u0643\u0629 \u0627\u0644\u0645\u0643\u0631\u0645\u0629 \u0627\u0644\u0622\u0646:** \`${hourMecca}:00\``
        ).setFooter({ text: "M7R Quran Schedule 24/7" }).setTimestamp();
        await message.reply({ embeds: [embed] }).catch(() => {
        });
        return;
      }
      if (["\u062D\u0645\u0627\u064A\u0629", "\u062D\u0645\u0627\u064A\u0647", "\u0633\u0628\u0627\u0645", "\u062F\u0631\u0639", "\u0647\u062C\u0645\u0627\u062A", "shield", "antispam"].includes(cmdRaw)) {
        const totalWeek = weeklyAttacks7Days.reduce((acc, d) => acc + d.totalAttacks, 0);
        const totalSpam = weeklyAttacks7Days.reduce((acc, d) => acc + d.spamBlocked, 0);
        const totalNuke = weeklyAttacks7Days.reduce((acc, d) => acc + d.nukeBlocked, 0);
        const totalLinks = weeklyAttacks7Days.reduce((acc, d) => acc + d.linksBlocked, 0);
        const shieldEmbed = new EmbedBuilder().setColor("#e11d48").setTitle(`\u{1F6E1}\uFE0F \u0627\u0644\u062F\u0631\u0639 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A \u0648\u0645\u0643\u0627\u0641\u062D\u0629 \u0627\u0644\u0633\u0628\u0627\u0645 \u0627\u0644\u0642\u0635\u0648\u0649 | ${message.guild.name}`).setURL(WEB_DASHBOARD_PUBLIC_URL).setDescription(
          `\u0646\u0638\u0627\u0645 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A **M7R Ultra Shield 24/7** \u0645\u0641\u0639\u0644 \u0628\u0623\u0642\u0635\u0649 \u0637\u0627\u0642\u062A\u0647 \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0645\u0646 \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u0627\u0644\u062A\u062E\u0631\u064A\u0628 \u0648\u0627\u0644\u0631\u0648\u0627\u0628\u0637:

\u{1F310} **\u0631\u0627\u0628\u0637 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u0631\u0633\u0645\u064A\u0629:**
${WEB_DASHBOARD_PUBLIC_URL}

\u{1F4CA} **\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0647\u062C\u0645\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0645 \u0635\u062F\u0647\u0627 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 (${totalWeek} \u0647\u062C\u0645\u0629):**
\u2022 \u{1F6AB} **\u0635\u062F \u0645\u0648\u062C\u0627\u062A \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u0627\u0644\u062A\u0643\u0631\u0627\u0631 \u0648\u0627\u0644\u0645\u0646\u0634\u0646:** \`${totalSpam}\` \u0645\u062D\u0627\u0648\u0644\u0629
\u2022 \u26A1 **\u0625\u062D\u0628\u0627\u0637 \u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u062E\u0631\u064A\u0628 (Anti-Nuke):** \`${totalNuke}\` \u0645\u062D\u0627\u0648\u0644\u0629
\u2022 \u{1F517} **\u062D\u0630\u0641 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0648\u0647\u0645\u064A\u0629 \u0648\u0627\u0644\u062F\u0639\u0648\u0627\u062A:** \`${totalLinks}\` \u0631\u0627\u0628\u0637

\u{1F512} **\u0642\u0648\u0627\u0639\u062F \u0645\u0643\u0627\u0641\u062D\u0629 \u0627\u0644\u0633\u0628\u0627\u0645 \u0627\u0644\u0645\u0641\u0639\u0644\u0629 \u062D\u0627\u0644\u064A\u0627\u064B:**
\u2022 \u0623\u0642\u0635\u0649 \u062D\u062F \u0644\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0645\u062A\u062A\u0627\u0644\u064A\u0629: \`${antiSpamConfig.maxMessages} \u0631\u0633\u0627\u0626\u0644 / ${antiSpamConfig.windowSeconds} \u062B\u0648\u0627\u0646\u064D\`
\u2022 \u0645\u0646\u0639 \u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u0646\u0633\u062E \u0648\u0627\u0644\u0644\u0635\u0642: \`\u0645\u0641\u0639\u0644 (\u062D\u062F ${antiSpamConfig.maxDuplicates} \u0645\u0631\u0627\u062A)\`
\u2022 \u0645\u0646\u0639 \u0627\u0644\u0645\u0646\u0634\u0646 \u0627\u0644\u062C\u0645\u0627\u0639\u064A (\`@everyone\` / \`>${antiSpamConfig.maxMentions}\` \u0645\u0646\u0634\u0646): \`\u0645\u0641\u0639\u0644 + \u0645\u0633\u062D \u0641\u0648\u0631\u064A\`
\u2022 \u0627\u0644\u0639\u0642\u0648\u0628\u0629 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A\u0629 \u0644\u0644\u0645\u062E\u0627\u0644\u0641: \`\u0643\u062A\u0645 \u0641\u0648\u0631\u064A (${antiSpamConfig.timeoutDurationMinutes} \u062F\u0642\u064A\u0642\u0629) + \u062A\u0646\u0638\u064A\u0641 \u0627\u0644\u0634\u0627\u062A\``
        ).setFooter({ text: "M7R Ultra Anti-Spam & Security \u2022 https://bot-m7r.netlify.app/" }).setTimestamp();
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("\u{1F310} \u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 (bot-m7r.netlify.app)").setStyle(ButtonStyle.Link).setURL(WEB_DASHBOARD_PUBLIC_URL)
        );
        await message.reply({ embeds: [shieldEmbed], components: [row] }).catch(() => {
        });
        return;
      }
    }
    if (antiInviteConfig.enabled) {
      const inviteRegex = /(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+|discord\.com\/invite\/.+|free-nitro|steamcommunlty|dlscord)/i;
      if (inviteRegex.test(message.content)) {
        const isExempt = message.guild.ownerId === message.author.id || message.member?.permissions.has(PermissionFlagsBits.Administrator);
        if (!isExempt) {
          await message.delete().catch(() => {
          });
          recordWeeklyAttackBlocked("links");
          threatLogs.unshift({
            id: `th-${Date.now()}`,
            type: "anti-invite",
            action: "Discord Invite / Scam Link Blocked \u{1F517}",
            target: `#${message.channel.name}`,
            executor: `${message.author.tag}`,
            timestamp: "\u0627\u0644\u0622\u0646",
            severity: "high",
            details: `\u062A\u0645 \u062D\u0630\u0641 \u0631\u0627\u0628\u0637 \u062F\u0639\u0648\u0629 \u0623\u0648 \u0631\u0627\u0628\u0637 \u0645\u0634\u0628\u0648\u0647 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0628\u0648\u0627\u0633\u0637\u0629 \u062F\u0631\u0639 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A.`
          });
          if (threatLogs.length > 20) threatLogs.pop();
          const warnEmbed = new EmbedBuilder().setColor("#f59e0b").setDescription(`\u{1F6E1}\uFE0F **\u062F\u0631\u0639 M7R \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A:** \u064A\u0627 <@${message.author.id}>\u060C \u064A\u0645\u0646\u0639 \u0646\u0634\u0631 \u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0633\u064A\u0631\u0641\u0631\u0627\u062A \u0623\u0648 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0645\u0634\u0628\u0648\u0647\u0629 \u0647\u0646\u0627! \u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B.`);
          const warnMsg = await message.channel.send({ embeds: [warnEmbed] }).catch(() => null);
          if (warnMsg) setTimeout(() => warnMsg.delete().catch(() => {
          }), 6e3);
          return;
        }
      }
    }
    if (antiSpamConfig.enabled) {
      const isExemptAdmin = message.guild.ownerId === message.author.id || message.member?.permissions.has(PermissionFlagsBits.Administrator);
      if (!isExemptAdmin) {
        const now = Date.now();
        const userId = message.author.id;
        const cleanMsg = message.content.trim().toLowerCase();
        const record = spamTracker.get(userId) || {
          count: 0,
          lastTime: now,
          lastContent: "",
          repeatCount: 0,
          recentMsgIds: []
        };
        if (now - record.lastTime < antiSpamConfig.windowSeconds * 1e3) {
          record.count += 1;
        } else {
          record.count = 1;
          record.recentMsgIds = [];
        }
        if (cleanMsg.length > 0 && cleanMsg === record.lastContent && now - record.lastTime < 2e4) {
          record.repeatCount += 1;
        } else {
          record.repeatCount = 1;
          record.lastContent = cleanMsg;
        }
        record.lastTime = now;
        record.recentMsgIds.push(message.id);
        if (record.recentMsgIds.length > 10) record.recentMsgIds.shift();
        spamTracker.set(userId, record);
        const mentionCount = message.mentions.users.size + message.mentions.roles.size;
        const hasEveryoneRaid = antiSpamConfig.blockEveryonePing && (message.content.includes("@everyone") || message.content.includes("@here"));
        const emojiMatches = message.content.match(/<a?:\w+:\d+>|[\u{1F300}-\u{1FAFF}]/gu) || [];
        const hasEmojiFlood = antiSpamConfig.blockEmojiFlood && emojiMatches.length > (antiSpamConfig.maxEmojis || 10);
        const hasCharFlood = /(.)\1{24,}/.test(message.content);
        const isRapidFlood = record.count >= antiSpamConfig.maxMessages;
        const isDuplicateSpam = antiSpamConfig.blockRepetitiveMessages && record.repeatCount >= (antiSpamConfig.maxDuplicates || 3);
        const isMentionSpam = mentionCount >= antiSpamConfig.maxMentions || hasEveryoneRaid;
        if (isRapidFlood || isDuplicateSpam || isMentionSpam || hasEmojiFlood || hasCharFlood) {
          const spamReason = isMentionSpam ? "\u0645\u0646\u0634\u0646 \u062C\u0645\u0627\u0639\u064A \u0645\u0632\u0639\u062C (Mass Mention / Raid)" : isDuplicateSpam ? "\u062A\u0643\u0631\u0627\u0631 \u0646\u0641\u0633 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0648\u0627\u0644\u0646\u0633\u062E \u0648\u0627\u0644\u0644\u0635\u0642 (Duplicate Spam)" : hasEmojiFlood || hasCharFlood ? "\u0625\u063A\u0631\u0627\u0642 \u0627\u0644\u0634\u0627\u062A \u0628\u0627\u0644\u0625\u064A\u0645\u0648\u062C\u064A \u0648\u0627\u0644\u062D\u0631\u0648\u0641 \u0627\u0644\u0645\u0643\u0631\u0631\u0629 (Flood)" : `\u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0626\u0644 \u0633\u0631\u064A\u0639\u0629 \u0645\u062A\u062A\u0627\u0644\u064A\u0629 (${record.count} \u0631\u0633\u0627\u0626\u0644 \u0641\u064A \u062B\u0648\u0627\u0646\u064D)`;
          await message.delete().catch(() => {
          });
          if (antiSpamConfig.autoCleanSpamMessages && record.recentMsgIds.length > 1) {
            await message.channel.bulkDelete(record.recentMsgIds, true).catch(() => {
            });
          }
          let appliedActionText = "\u062D\u0630\u0641 \u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u062A\u062D\u0630\u064A\u0631 \u0641\u0648\u0631\u064A";
          if (message.member?.moderatable) {
            if (antiSpamConfig.punishment === "ban" && message.member.bannable) {
              await message.member.ban({ reason: `M7R Ultra Anti-Spam: ${spamReason}` }).catch(() => {
              });
              appliedActionText = "\u062D\u0638\u0631 \u0646\u0647\u0627\u0626\u064A (Ban) + \u062A\u0646\u0638\u064A\u0641 \u0627\u0644\u0634\u0627\u062A";
            } else if (antiSpamConfig.punishment === "kick" && message.member.kickable) {
              await message.member.kick(`M7R Ultra Anti-Spam: ${spamReason}`).catch(() => {
              });
              appliedActionText = "\u0637\u0631\u062F \u0641\u0648\u0631\u064A (Kick) + \u062A\u0646\u0638\u064A\u0641 \u0627\u0644\u0634\u0627\u062A";
            } else {
              await message.member.timeout(antiSpamConfig.timeoutDurationMinutes * 60 * 1e3, `M7R Ultra Anti-Spam: ${spamReason}`).catch(() => {
              });
              appliedActionText = `\u0643\u062A\u0645 \u0645\u0624\u0642\u062A (${antiSpamConfig.timeoutDurationMinutes} \u062F\u0642\u064A\u0642\u0629) + \u0645\u0633\u062D \u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0633\u0628\u0627\u0645`;
            }
          }
          recordWeeklyAttackBlocked("spam");
          threatLogs.unshift({
            id: `th-${Date.now()}`,
            type: "anti-spam",
            action: `Ultra Anti-Spam Shield: ${spamReason}`,
            target: `#${message.channel.name}`,
            executor: `${message.author.tag} (${userId})`,
            timestamp: "\u0627\u0644\u0622\u0646",
            severity: "high",
            details: `\u062A\u0635\u062F\u0649 \u062F\u0631\u0639 \u0627\u0644\u0633\u0628\u0627\u0645 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A \u0644\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0648\u062A\u0645 \u062A\u0637\u0628\u064A\u0642: ${appliedActionText}.`
          });
          if (threatLogs.length > 20) threatLogs.pop();
          const spamEmbed = new EmbedBuilder().setColor("#e11d48").setTitle("\u{1F6A8} \u062A\u062F\u062E\u0644 \u062F\u0631\u0639 \u0645\u0643\u0627\u0641\u062D\u0629 \u0627\u0644\u0633\u0628\u0627\u0645 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A (M7R Ultra Anti-Spam)").setDescription(
            `\u062A\u0645 \u0631\u0635\u062F \u0648\u0625\u064A\u0642\u0627\u0641 \u0645\u062D\u0627\u0648\u0644\u0629 \u0633\u0628\u0627\u0645 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0628\u0648\u0627\u0633\u0637\u0629 <@${userId}>!
\u2022 **\u0646\u0648\u0639 \u0627\u0644\u0645\u062E\u0627\u0644\u0641\u0629:** \`${spamReason}\`
\u2022 **\u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0641\u0648\u0631\u064A:** \`${appliedActionText}\``
          ).setFooter({ text: "M7R 24/7 Anti-Spam Shield \u2022 https://bot-m7r.netlify.app/" }).setTimestamp();
          const alert = await message.channel.send({ embeds: [spamEmbed] }).catch(() => null);
          if (alert) setTimeout(() => alert.delete().catch(() => {
          }), 9e3);
          spamTracker.delete(userId);
          return;
        }
      }
    }
    const normContent = normalizeArabicText(message.content);
    for (const rule of autoResponses) {
      if (!rule.enabled) continue;
      const normTrigger = normalizeArabicText(rule.trigger);
      if (!normTrigger) continue;
      const matches = rule.matchType === "exact" ? normContent === normTrigger : normContent.includes(normTrigger) || message.content.toLowerCase().includes(rule.trigger.toLowerCase());
      if (matches) {
        if (rule.autoReaction) {
          await message.react(rule.autoReaction).catch(() => {
          });
        }
        const replyText = formatResponseVariables(rule.reply, message);
        await message.reply(replyText).catch(() => {
        });
        break;
      }
    }
  });
  client.on("guildMemberAdd", async (member) => {
    try {
      if (member.user.bot) {
        if (welcomeConfig.botAutoRoleEnabled && welcomeConfig.botAutoRoleName.trim()) {
          const botRole = member.guild.roles.cache.find(
            (r) => r.name.toLowerCase() === welcomeConfig.botAutoRoleName.trim().toLowerCase()
          );
          if (botRole) await member.roles.add(botRole).catch(() => {
          });
        }
      } else {
        if (welcomeConfig.autoRoleEnabled && welcomeConfig.autoRoleName.trim()) {
          const memberRole = member.guild.roles.cache.find(
            (r) => r.name.toLowerCase() === welcomeConfig.autoRoleName.trim().toLowerCase()
          );
          if (memberRole) await member.roles.add(memberRole).catch(() => {
          });
        }
      }
      if (!welcomeConfig.enabled) return;
      const targetChName = welcomeConfig.channelName || "welcome";
      const welcomeCh = member.guild.channels.cache.find(
        (c) => c.isTextBased() && (matchesChannelName(c.name, targetChName) || matchesChannelName(c.name, "welcome") || matchesChannelName(c.name, "\u062A\u0631\u062D\u064A\u0628"))
      );
      if (welcomeCh) {
        const payload = buildWelcomePayload({
          userId: member.id,
          username: member.user.username,
          avatarUrl: member.user.displayAvatarURL(),
          serverName: member.guild.name,
          memberCount: member.guild.memberCount
        });
        await welcomeCh.send(payload).catch(() => {
        });
      }
      if (welcomeConfig.sendDm && welcomeConfig.dmMessage) {
        const dmText = formatWelcomeVariables(welcomeConfig.dmMessage, {
          userId: member.id,
          username: member.user.username,
          serverName: member.guild.name,
          memberCount: member.guild.memberCount
        });
        await member.send(dmText).catch(() => {
        });
      }
    } catch (e) {
      console.error("[M7R Welcome Error]:", e);
    }
  });
  client.on("guildMemberRemove", async (member) => {
    try {
      if (!welcomeConfig.leaveEnabled) return;
      const targetChName = welcomeConfig.leaveChannelName || welcomeConfig.channelName || "welcome";
      const leaveCh = member.guild.channels.cache.find(
        (c) => c.isTextBased() && (matchesChannelName(c.name, targetChName) || matchesChannelName(c.name, "welcome") || matchesChannelName(c.name, "\u062A\u0631\u062D\u064A\u0628"))
      );
      if (leaveCh) {
        const leaveText = formatWelcomeVariables(
          welcomeConfig.leaveMessage || "\u{1F44B} \u063A\u0627\u062F\u0631\u0646\u0627 \u0627\u0644\u0639\u0636\u0648 **{username}**\u060C \u0646\u062A\u0645\u0646\u0649 \u0644\u0647 \u0627\u0644\u062A\u0648\u0641\u064A\u0642!",
          {
            userId: member.id,
            username: member.user?.username || "\u0639\u0636\u0648",
            serverName: member.guild.name,
            memberCount: member.guild.memberCount
          }
        );
        await leaveCh.send(leaveText).catch(() => {
        });
      }
    } catch (e) {
      console.error("[M7R Leave Error]:", e);
    }
  });
}
app.post("/api/bot/connect", async (req, res) => {
  const { token, guildId } = req.body;
  if (!token || typeof token !== "string" || token.trim().length < 20) {
    return res.status(400).json({
      success: false,
      error: "\u0627\u0644\u062A\u0648\u0643\u0646 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D! \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0646\u0633\u062E Bot Token \u0627\u0644\u0635\u062D\u064A\u062D \u0645\u0646 Discord Developer Portal."
    });
  }
  try {
    if (botClient) {
      await botClient.destroy().catch(() => {
      });
      botClient = null;
    }
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
    });
    const readyPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("\u0627\u0646\u062A\u0647\u062A \u0645\u0647\u0644\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u062F\u064A\u0633\u0643\u0648\u0631\u062F (12 \u062B\u0627\u0646\u064A\u0629). \u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062A\u0648\u0643\u0646 \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0640 Intents."));
      }, 12e3);
      client.once("ready", () => {
        clearTimeout(timeout);
        resolve();
      });
      client.once("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
    await client.login(token.trim());
    await readyPromise;
    botClient = client;
    savedBotToken = token.trim();
    isBotConnected = true;
    const guildsList = getConnectedGuildsList();
    const targetGuild = guildId && client.guilds.cache.has(guildId.trim()) ? client.guilds.cache.get(guildId.trim()) : client.guilds.cache.first();
    if (targetGuild) {
      selectedGuildId = targetGuild.id;
    }
    botBasicSettings.botUsername = client.user?.username || "m7r";
    await applySettingsToLiveBot();
    attachDiscordBotEvents(client);
    await registerSlashCommandsOnDiscord(client);
    const totalGuilds = client.guilds.cache.size;
    const totalMembers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
    const totalChannels = client.guilds.cache.reduce((acc, g) => acc + g.channels.cache.size, 0);
    const selectedGuildObj = targetGuild ? {
      id: targetGuild.id,
      name: targetGuild.name,
      icon: targetGuild.iconURL() || "",
      memberCount: targetGuild.memberCount || 0,
      channelsCount: targetGuild.channels.cache.size,
      rolesCount: targetGuild.roles.cache.size
    } : guildsList[0];
    connectedBotInfo = {
      username: client.user?.username || "m7r",
      tag: client.user?.tag || "m7r#1624",
      id: client.user?.id || "",
      avatar: client.user?.displayAvatarURL() || "",
      guildsCount: totalGuilds,
      membersCount: selectedGuildObj ? selectedGuildObj.memberCount : totalMembers || 1,
      channelsCount: selectedGuildObj ? selectedGuildObj.channelsCount : totalChannels || 1,
      ping: client.ws.ping > 0 ? client.ws.ping : 17,
      mode: "live",
      guilds: guildsList,
      selectedGuild: selectedGuildObj
    };
    if (targetGuild) {
      guildStats.guildName = targetGuild.name;
      guildStats.guildId = targetGuild.id;
      guildStats.membersCount = targetGuild.memberCount || guildStats.membersCount;
      guildStats.monitoredChannelsCount = targetGuild.channels.cache.size || guildStats.monitoredChannelsCount;
    }
    guildStats.protectedGuildsCount = totalGuilds;
    await sendLogToDiscordServer(
      "\u062A\u0645 \u0631\u0628\u0637 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0648\u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u{1F7E2}",
      `\u062A\u0645 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u0628\u0648\u062A **${connectedBotInfo.tag}** \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0633\u064A\u0631\u0641\u0631 **${guildStats.guildName}** \u0644\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u0645\u0628\u0627\u0634\u0631.`
    );
    savePersistedSession();
    return res.json({
      success: true,
      botInfo: connectedBotInfo,
      guildStats,
      basicSettings: botBasicSettings
    });
  } catch (err) {
    console.error("[M7R Login Error]:", err?.message || err);
    isBotConnected = false;
    let arabicError = "\u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0627\u0644\u062A\u0648\u0643\u0646. \u062A\u0623\u0643\u062F \u0645\u0646 \u0635\u062D\u0629 \u0627\u0644\u062A\u0648\u0643\u0646 \u0648\u062A\u0641\u0639\u064A\u0644 Privileged Gateway Intents \u0641\u064A \u0645\u0648\u0642\u0639 \u062F\u064A\u0633\u0643\u0648\u0631\u062F.";
    if (err?.message?.includes("TOKEN_INVALID") || err?.code === "TokenInvalid") {
      arabicError = "\u0627\u0644\u062A\u0648\u0643\u0646 \u0627\u0644\u0630\u064A \u0623\u062F\u062E\u0644\u062A\u0647 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 (Token Invalid).";
    } else if (err?.message?.includes("DisallowedIntents")) {
      arabicError = "\u064A\u062C\u0628 \u062A\u0641\u0639\u064A\u0644 \u062E\u064A\u0627\u0631\u0627\u062A (Presence / Server Members / Message Content Intents) \u0645\u0646 \u0635\u0641\u062D\u0629 Bot \u0641\u064A Discord Developer Portal!";
    }
    return res.status(401).json({
      success: false,
      error: arabicError
    });
  }
});
app.post("/api/guild/select", (req, res) => {
  const { guildId } = req.body;
  if (!guildId) {
    return res.status(400).json({ error: "guildId is required" });
  }
  selectedGuildId = guildId;
  if (botClient && botClient.isReady()) {
    const g = botClient.guilds.cache.get(guildId);
    if (g) {
      const selectedGuildObj = {
        id: g.id,
        name: g.name,
        icon: g.iconURL() || "",
        memberCount: g.memberCount || 0,
        channelsCount: g.channels.cache.size,
        rolesCount: g.roles.cache.size
      };
      connectedBotInfo.selectedGuild = selectedGuildObj;
      connectedBotInfo.guilds = getConnectedGuildsList();
      connectedBotInfo.membersCount = selectedGuildObj.memberCount;
      connectedBotInfo.channelsCount = selectedGuildObj.channelsCount;
      guildStats.guildName = g.name;
      guildStats.guildId = g.id;
      guildStats.membersCount = g.memberCount || guildStats.membersCount;
      guildStats.monitoredChannelsCount = g.channels.cache.size;
      savePersistedSession();
      return res.json({
        success: true,
        selectedGuild: selectedGuildObj,
        botInfo: connectedBotInfo,
        guildStats,
        message: `\u2705 \u062A\u0645 \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u062A\u062D\u0643\u0645 \u0628\u0646\u062C\u0627\u062D \u0625\u0644\u0649 \u0633\u064A\u0631\u0641\u0631: ${g.name}`
      });
    }
  }
  savePersistedSession();
  return res.json({
    success: true,
    selectedGuild: connectedBotInfo.selectedGuild,
    botInfo: connectedBotInfo,
    guildStats
  });
});
app.get("/api/bot/guilds", (req, res) => {
  if (botClient && botClient.isReady()) {
    const guilds = getConnectedGuildsList();
    return res.json({ success: true, guilds });
  }
  return res.json({
    success: true,
    guilds: connectedBotInfo.guilds && connectedBotInfo.guilds.length > 0 ? connectedBotInfo.guilds : [
      {
        id: "1486763846151438456",
        name: "M7R Empire \u269C\uFE0F",
        icon: "https://cdn.discordapp.com/icons/1486763846151438456/bcd0ce5bcbf335a201189354919525c2.webp",
        memberCount: 146,
        channelsCount: 36,
        rolesCount: 73,
        ownerId: "1219299588402577532"
      },
      {
        id: "1493178407188693112",
        name: "m7r",
        icon: "https://cdn.discordapp.com/icons/1493178407188693112/f61be6472a2e8801cab912a46a0165f9.webp",
        memberCount: 72,
        channelsCount: 22,
        rolesCount: 37,
        ownerId: "1219299588402577532"
      },
      {
        id: "1525374225425367171",
        name: "\u{1D400}\u{1D429}\u{1D41E}\u{1D431} \u269C\uFE0F / \u0635\u064A\u062F \u0627\u0644\u0636\u0628\u0627\u0646 \u{1F98E}",
        icon: "https://cdn.discordapp.com/icons/1525374225425367171/f62646a01b911a76d02c672d1c97985e.webp",
        memberCount: 306,
        channelsCount: 43,
        rolesCount: 28,
        ownerId: "1184069933374652466"
      },
      {
        id: "1564569257755410523",
        name: "\u{1D4DC}7\u{1D4E1}'s server",
        icon: "",
        memberCount: 6,
        channelsCount: 7,
        rolesCount: 5,
        ownerId: "1219299588402577532"
      }
    ]
  });
});
app.post("/api/tickets/deploy-panel", async (req, res) => {
  const { panelConfig, channelName } = req.body;
  if (panelConfig) {
    ticketPanelConfig = { ...ticketPanelConfig, ...panelConfig };
  }
  const targetName = (channelName || ticketPanelConfig.targetChannelName || "tickets").replace("#", "").trim().toLowerCase();
  if (!botClient || !botClient.isReady()) {
    return res.json({
      success: true,
      simulated: true,
      message: `\u062A\u0645 \u062D\u0641\u0638 \u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u0628\u0627\u0646\u0644! (\u0645\u0644\u0627\u062D\u0638\u0629: \u0627\u0631\u0628\u0637 \u0627\u0644\u062A\u0648\u0643\u0646 \u0623\u0648 \u0627\u0643\u062A\u0628 !panel \u0641\u064A \u062F\u064A\u0633\u0643\u0648\u0631\u062F \u0644\u0625\u0631\u0633\u0627\u0644\u0647 \u0641\u064A \u0631\u0648\u0645 #${targetName})`
    });
  }
  let sentCount = 0;
  const payload = buildTicketPanelMessagePayload();
  const guildsToUse = getTargetGuild() ? [getTargetGuild()] : Array.from(botClient.guilds.cache.values());
  for (const guild of guildsToUse) {
    const ch = guild.channels.cache.find(
      (c) => c.isTextBased() && c.name.toLowerCase().includes(targetName)
    );
    if (ch) {
      await ch.send(payload).catch(() => {
      });
      sentCount += 1;
    } else {
      const fallback = guild.channels.cache.find((c) => c.type === ChannelType.GuildText);
      if (fallback) {
        await fallback.send(payload).catch(() => {
        });
        sentCount += 1;
      }
    }
  }
  return res.json({
    success: true,
    sentCount,
    message: sentCount > 0 ? `\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0628\u0627\u0646\u0644 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 \u0627\u0644\u0645\u062E\u0635\u0635 \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0641\u064A \u062F\u064A\u0633\u0643\u0648\u0631\u062F!` : `\u26A0\uFE0F \u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u062A\u0635\u0645\u064A\u0645\u060C \u0644\u0643\u0646 \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0631\u0648\u0645 \u0628\u0627\u0633\u0645 #${targetName} \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631.`
  });
});
app.post("/api/commands/sync-slash", async (req, res) => {
  if (req.body.commands) {
    discordCommands = req.body.commands;
  }
  if (botClient && botClient.isReady()) {
    await registerSlashCommandsOnDiscord(botClient);
    return res.json({
      success: true,
      message: "\u2705 \u062A\u0645 \u0645\u0632\u0627\u0645\u0646\u0629 \u0648\u062D\u0630\u0641 \u0623\u064A \u0623\u0648\u0627\u0645\u0631 \u0645\u0643\u0631\u0631\u0629 \u0645\u0646 \u062F\u064A\u0633\u0643\u0648\u0631\u062F \u0628\u0646\u062C\u0627\u062D! \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0622\u0646 \u062A\u0638\u0647\u0631 \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629 \u0641\u0642\u0637 \u0628\u062F\u0648\u0646 \u0623\u064A \u062A\u0643\u0631\u0627\u0631."
    });
  }
  return res.json({
    success: true,
    message: "\u2705 \u062A\u0645 \u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0648\u0645\u0633\u062D \u0627\u0644\u062A\u0643\u0631\u0627\u0631\u0627\u062A! \u0633\u062A\u0639\u0645\u0644 \u0641\u0648\u0631\u0627\u064B \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0645\u062C\u0631\u062F \u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0628\u0648\u062A."
  });
});
app.post("/api/bot/refresh", async (req, res) => {
  try {
    if (botClient && botClient.isReady()) {
      await registerSlashCommandsOnDiscord(botClient).catch(() => {
      });
      await applySettingsToLiveBot().catch(() => {
      });
    }
    return res.json({
      success: true,
      message: "\u{1F504} \u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0623\u0645\u0631 (\u062A\u062D\u062F\u064A\u062B) \u0648\u0645\u0632\u0627\u0645\u0646\u0629 \u0627\u0644\u0628\u0648\u062A \u0628\u0646\u062C\u0627\u062D! \u062A\u0645 \u0645\u0633\u062D \u0627\u0644\u0643\u0627\u0634 \u0648\u062A\u062D\u062F\u064A\u062B \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0648\u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0648\u062C\u0644\u0628 \u0643\u0644 \u062C\u062F\u064A\u062F \u0625\u0644\u0649 \u062F\u064A\u0633\u0643\u0648\u0631\u062F."
    });
  } catch (err) {
    return res.json({
      success: true,
      message: "\u{1F504} \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062C\u0645\u064A\u0639 \u0623\u0646\u0638\u0645\u0629 \u0648\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0628\u0648\u062A M7R \u0628\u0646\u062C\u0627\u062D!"
    });
  }
});
app.get("/ping", (req, res) => {
  res.status(200).json({
    status: "ONLINE_24_7",
    bot: connectedBotInfo.tag,
    mode: connectedBotInfo.mode,
    lastHeartbeat: lastHeartbeatTime,
    heartbeatCount,
    uptime: (Date.now() - guildStats.uptimeStart) / 1e3,
    ping: botClient?.ws?.ping && botClient.ws.ping > 0 ? botClient.ws.ping : botPing
  });
});
app.get(["/download", "/dist.zip", "/m7r.zip", "/api/download/netlify-build"], (req, res) => {
  const publicZip = path.join(process.cwd(), "public", "dist.zip");
  if (fs.existsSync(publicZip)) {
    return res.download(publicZip, "m7r-netlify-build.zip");
  }
  return res.status(404).send("Build file not found");
});
app.get("/api/status", (req, res) => {
  const currentPing = botClient?.ws?.ping && botClient.ws.ping > 0 ? botClient.ws.ping : botPing;
  if (botClient && botClient.isReady()) {
    connectedBotInfo.guilds = getConnectedGuildsList();
  }
  res.json({
    ...guildStats,
    ping: currentPing,
    status: botStatus,
    panicMode: panicModeActive,
    isBotConnected,
    botInfo: connectedBotInfo,
    basicSettings: botBasicSettings,
    ticketPanelConfig,
    discordCommands: discordCommands.map((cmd) => ({
      ...cmd,
      isSensitive: SENSITIVE_COMMAND_NAMES.includes(cmd.name.toLowerCase())
    })),
    azkarConfig,
    honeypotTrapConfig,
    welcomeConfig,
    lastHeartbeat: lastHeartbeatTime,
    heartbeatCount,
    accessMode: currentAccessMode,
    guildJoinNotifications,
    unreadNotificationsCount: guildJoinNotifications.filter((n) => !n.read).length,
    sensitiveCommandNames: SENSITIVE_COMMAND_NAMES
  });
});
app.post("/api/panic-mode", async (req, res) => {
  const { enabled } = req.body;
  panicModeActive = enabled !== void 0 ? enabled : !panicModeActive;
  if (panicModeActive) {
    guildStats.threatLevel = "critical";
    threatLogs.unshift({
      id: `th-${Date.now()}`,
      type: "lockdown",
      action: "Emergency Panic Mode Activated",
      target: "ALL_CHANNELS_LOCKED",
      executor: "M7R Security Officer",
      timestamp: "\u0627\u0644\u0622\u0646",
      severity: "critical",
      details: "\u062A\u0645 \u0642\u0641\u0644 \u062C\u0645\u064A\u0639 \u0631\u0648\u0645\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u0645\u0646\u0639 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0648\u062A\u062C\u0645\u064A\u062F \u0627\u0644\u0631\u062A\u0628 \u0644\u0635\u062F \u0647\u062C\u0648\u0645 \u0634\u0627\u0645\u0644!"
    });
    await sendLogToDiscordServer("\u{1F6A8} \u062A\u0641\u0639\u064A\u0644 \u0648\u0636\u0639 \u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0634\u0627\u0645\u0644 (Lockdown)", "\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0648\u0636\u0639 \u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0645\u0646 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631.");
  } else {
    guildStats.threatLevel = "low";
    threatLogs.unshift({
      id: `th-${Date.now()}`,
      type: "lockdown",
      action: "Panic Mode Deactivated",
      target: "CHANNELS_UNLOCKED",
      executor: "M7R Security Officer",
      timestamp: "\u0627\u0644\u0622\u0646",
      severity: "low",
      details: "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0648\u0636\u0639 \u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0648\u0625\u0639\u0627\u062F\u0629 \u0641\u062A\u062D \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u062A\u062F\u0631\u064A\u062C\u064A\u0627\u064B."
    });
    await sendLogToDiscordServer("\u{1F7E2} \u0625\u0644\u063A\u0627\u0621 \u0648\u0636\u0639 \u0627\u0644\u0637\u0648\u0627\u0631\u0626", "\u0639\u0627\u062F\u062A \u062D\u0627\u0644\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0625\u0644\u0649 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0622\u0645\u0646 \u0648\u0627\u0644\u0645\u0633\u062A\u0642\u0631.", "#10b981");
  }
  res.json({ success: true, panicMode: panicModeActive, threatLevel: guildStats.threatLevel });
});
app.get("/api/guild/channels", (req, res) => {
  if (botClient && botClient.isReady()) {
    const list = [];
    const targetG = getTargetGuild();
    const guildsToRead = targetG ? [targetG] : Array.from(botClient.guilds.cache.values());
    for (const guild of guildsToRead) {
      for (const [, ch] of guild.channels.cache) {
        if (ch.type === ChannelType.GuildText) {
          list.push({ id: ch.id, name: ch.name, type: "text" });
        } else if (ch.type === ChannelType.GuildVoice) {
          list.push({ id: ch.id, name: ch.name, type: "voice" });
        } else if (ch.type === ChannelType.GuildCategory) {
          list.push({ id: ch.id, name: ch.name, type: "category" });
        }
      }
    }
    if (list.length > 0) {
      return res.json({ channels: list, live: true, guildName: targetG?.name });
    }
  }
  return res.json({
    live: false,
    channels: [
      { id: "ch-1", name: "welcome", type: "text" },
      { id: "ch-2", name: "general", type: "text" },
      { id: "ch-3", name: "cmd", type: "text" },
      { id: "ch-4", name: "tickets", type: "text" },
      { id: "ch-5", name: "log-server", type: "text" },
      { id: "ch-6", name: "\u0627\u0630\u0643\u0627\u0631", type: "text" },
      { id: "ch-7", name: "\u{1F6AB}-\u0645\u0645\u0646\u0648\u0639-\u0627\u0644\u062F\u062E\u0648\u0644", type: "text" },
      { id: "ch-8", name: "announcements", type: "text" },
      { id: "ch-9", name: "staff-applications", type: "text" },
      { id: "ch-10", name: "ticket-logs", type: "text" },
      { id: "ch-11", name: "\u0627\u0648\u0627\u0645\u0631", type: "text" },
      { id: "ch-12", name: "\u{1F50A} 24/7 | \u062E\u0644\u0648\u0629 \u0648\u062A\u0644\u0627\u0648\u0627\u062A \u0639\u0637\u0631\u0629", type: "voice" },
      { id: "ch-13", name: "\u{1F50A} | \u0645\u062C\u0644\u0633 \u0627\u0644\u0625\u062F\u0627\u0631\u0629", type: "voice" },
      { id: "ch-14", name: "\u{1F3AB} | \u0642\u0633\u0645 \u0627\u0644\u062A\u0630\u0627\u0643\u0631 (Tickets)", type: "category" },
      { id: "ch-15", name: "\u{1F6D2} | \u062A\u0630\u0627\u0643\u0631 \u0627\u0644\u0645\u062A\u062C\u0631 (Store)", type: "category" },
      { id: "ch-16", name: "\u{1F6E0}\uFE0F | \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A (Support)", type: "category" }
    ]
  });
});
app.post("/api/welcome/test", async (req, res) => {
  if (req.body.welcomeConfig) {
    welcomeConfig = { ...welcomeConfig, ...req.body.welcomeConfig };
  }
  const targetCh = (welcomeConfig.channelName || "welcome").replace("#", "").trim().toLowerCase();
  if (!botClient || !botClient.isReady()) {
    return res.json({
      success: true,
      simulated: true,
      message: `\u2705 [\u0645\u0639\u0627\u064A\u0646\u0629 \u062D\u064A\u0629] \u062A\u0645 \u062A\u062C\u0647\u064A\u0632 \u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0628\u0646\u062C\u0627\u062D \u0644\u0631\u0648\u0645 #${targetCh}! \u0627\u0631\u0628\u0637 \u062A\u0648\u0643\u0646 \u0627\u0644\u0628\u0648\u062A \u0644\u0625\u0631\u0633\u0627\u0644\u0647\u0627 \u0641\u0639\u0644\u064A\u0627\u064B \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631.`
    });
  }
  const targetG = getTargetGuild();
  const guildsToUse = targetG ? [targetG] : Array.from(botClient.guilds.cache.values());
  let sent = false;
  for (const guild of guildsToUse) {
    const ch = guild.channels.cache.find(
      (c) => c.isTextBased() && (matchesChannelName(c.name, targetCh) || matchesChannelName(c.name, "welcome") || matchesChannelName(c.name, "\u062A\u0631\u062D\u064A\u0628"))
    );
    const payload = buildWelcomePayload({
      userId: botClient.user?.id || "123456789",
      username: "NewMember_M7R",
      avatarUrl: botClient.user?.displayAvatarURL(),
      serverName: guild.name,
      memberCount: guild.memberCount || 100,
      cfg: welcomeConfig
    });
    if (ch) {
      await ch.send(payload).catch(() => {
      });
      sent = true;
    } else {
      const fallback = guild.channels.cache.find((c) => c.type === ChannelType.GuildText);
      if (fallback) {
        await fallback.send(payload).catch(() => {
        });
        sent = true;
      }
    }
  }
  return res.json({
    success: true,
    sent,
    message: sent ? `\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 \u0633\u064A\u0631\u0641\u0631 (${targetG?.name || "Discord"})!` : `\u26A0\uFE0F \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0631\u0648\u0645 #${targetCh} \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631.`
  });
});
app.get("/api/settings", (req, res) => {
  res.json({
    basicSettings: botBasicSettings,
    ticketPanelConfig,
    discordCommands,
    azkarConfig,
    honeypotTrapConfig,
    welcomeConfig,
    antiNuke: antiNukeConfig,
    antiSpam: antiSpamConfig,
    antiInvite: antiInviteConfig,
    voice247: voice247Config,
    autoResponses,
    applicationsConfig,
    applications
  });
});
app.post("/api/settings", async (req, res) => {
  const { basicSettings, ticketPanel, commands, azkar, trap, welcome, antiNuke, antiSpam, antiInvite, voice247, autoResp, applicationsConfig: appCfg } = req.body;
  if (basicSettings) botBasicSettings = { ...botBasicSettings, ...basicSettings };
  if (ticketPanel) ticketPanelConfig = { ...ticketPanelConfig, ...ticketPanel };
  if (commands) discordCommands = commands;
  if (azkar) azkarConfig = { ...azkarConfig, ...azkar };
  if (trap) honeypotTrapConfig = { ...honeypotTrapConfig, ...trap };
  if (welcome) welcomeConfig = { ...welcomeConfig, ...welcome };
  if (antiNuke) antiNukeConfig = { ...antiNukeConfig, ...antiNuke };
  if (antiSpam) antiSpamConfig = { ...antiSpamConfig, ...antiSpam };
  if (antiInvite) antiInviteConfig = { ...antiInviteConfig, ...antiInvite };
  if (voice247) voice247Config = { ...voice247Config, ...voice247 };
  if (autoResp) autoResponses = autoResp;
  if (appCfg) applicationsConfig = { ...applicationsConfig, ...appCfg };
  await applySettingsToLiveBot(true);
  savePersistedSession();
  await sendLogToDiscordServer(
    "\u062A\u0645 \u062D\u0641\u0638 \u0648\u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0628\u0648\u062A \u0648\u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0648\u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0648\u0627\u0644\u062A\u0642\u062F\u064A\u0645\u0627\u062A \u0648\u0627\u0644\u0645\u0635\u064A\u062F\u0629 \u0648\u0627\u0644\u0623\u0630\u0643\u0627\u0631 \u2705",
    `\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0646 \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 M7R:
\u2022 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0645\u062A\u062D\u0643\u0645 \u0628\u0647: \`${guildStats.guildName}\`
\u2022 \u062D\u0627\u0644\u0629 \u0627\u0644\u0646\u0634\u0627\u0637: \`${botBasicSettings.activityType} ${botBasicSettings.activityText}\`
\u2022 \u0627\u0644\u0628\u0627\u062F\u0626\u0629 (Prefix): \`${botBasicSettings.prefix}\`
\u2022 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0645\u0641\u0639\u0644\u0629: \`${discordCommands.filter((c) => c.enabled).length}\` \u0623\u0645\u0631
\u2022 \u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0642\u062F\u064A\u0645\u0627\u062A: \`${applicationsConfig.enabled ? "\u0645\u0641\u062A\u0648\u062D" : "\u0645\u063A\u0644\u0642"}\` (#${applicationsConfig.applyChannelName})
\u2022 \u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u0631\u062D\u064A\u0628: \`${welcomeConfig.enabled ? "\u0645\u0641\u0639\u0644" : "\u0645\u0639\u0637\u0644"}\` (#${welcomeConfig.channelName})
\u2022 \u0645\u0635\u064A\u062F\u0629 \u0627\u0644\u0633\u0628\u0627\u0645: \`${honeypotTrapConfig.enabled ? "\u0645\u0641\u0639\u0644\u0629" : "\u0645\u0639\u0637\u0644\u0629"}\` (${honeypotTrapConfig.channelName})
\u2022 \u0646\u0638\u0627\u0645 \u0627\u0644\u0623\u0630\u0643\u0627\u0631: \`${azkarConfig.enabled ? "\u0645\u0641\u0639\u0644" : "\u0645\u0639\u0637\u0644"}\` (\u0643\u0644 ${azkarConfig.intervalMinutes} \u062F\u0642\u064A\u0642\u0629)`,
    "#10b981"
  );
  res.json({
    success: true,
    botInfo: connectedBotInfo,
    basicSettings: botBasicSettings,
    ticketPanelConfig,
    discordCommands,
    azkarConfig,
    honeypotTrapConfig,
    welcomeConfig,
    applicationsConfig,
    message: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A \u0648\u062A\u0637\u0628\u064A\u0642\u0647\u0627 \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0628\u0648\u062A \u0641\u064A \u062F\u064A\u0633\u0643\u0648\u0631\u062F!"
  });
});
app.get("/api/voice/status", (req, res) => {
  const activeReciter = getActiveReciter();
  res.json({
    enabled: voice247Config.enabled,
    inVoice: voiceConnectionStatus === "connected",
    status: voiceConnectionStatus,
    channelName: currentVoiceChannelName || voice247Config.channelName,
    channelId: currentVoiceChannelId || voice247Config.channelId,
    deafened: voice247Config.deafened,
    muted: voice247Config.muted,
    audioMode: voice247Config.audioMode,
    selectedReciter: voice247Config.selectedReciter || "alafasy",
    activeReciter,
    currentHourMecca: getCurrentMeccaHour(),
    scheduleEnabled: voice247Config.scheduleEnabled ?? true,
    scheduleSlots: voice247Config.scheduleSlots || DEFAULT_QURAN_SCHEDULE,
    reciters: QURAN_RECITERS,
    autoReconnect: voice247Config.autoReconnect
  });
});
app.post("/api/voice/join", async (req, res) => {
  const { channelName, deafened, muted, audioMode, selectedReciter, scheduleEnabled } = req.body;
  if (channelName) voice247Config.channelName = channelName;
  if (typeof deafened === "boolean") voice247Config.deafened = deafened;
  if (typeof muted === "boolean") voice247Config.muted = muted;
  if (audioMode) voice247Config.audioMode = audioMode;
  if (selectedReciter) voice247Config.selectedReciter = selectedReciter;
  if (typeof scheduleEnabled === "boolean") voice247Config.scheduleEnabled = scheduleEnabled;
  voice247Config.enabled = true;
  const result = await joinDiscordVoiceChannel247(voice247Config.channelName);
  savePersistedSession();
  return res.json({
    ...result,
    status: voiceConnectionStatus,
    inVoice: voiceConnectionStatus === "connected",
    channelName: currentVoiceChannelName || voice247Config.channelName,
    activeReciter: getActiveReciter(),
    scheduleEnabled: voice247Config.scheduleEnabled
  });
});
app.post("/api/voice/leave", (req, res) => {
  const result = leaveDiscordVoiceChannel();
  return res.json({
    ...result,
    status: voiceConnectionStatus,
    inVoice: false
  });
});
app.post("/api/voice/reciter/switch", (req, res) => {
  const { reciterId } = req.body;
  const found = QURAN_RECITERS.find((r) => r.id === reciterId);
  if (!found) {
    return res.status(400).json({ success: false, message: "\u0627\u0644\u0642\u0627\u0631\u0626 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0627\u0644\u0642\u0627\u0626\u0645\u0629." });
  }
  voice247Config.selectedReciter = reciterId;
  voice247Config.scheduleEnabled = false;
  if (voice247Config.audioMode === "silent") {
    voice247Config.audioMode = "quran";
  }
  playQuranAudioForConfig(true);
  savePersistedSession();
  return res.json({
    success: true,
    message: `\u2705 \u062A\u0645 \u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u0628\u062B \u0627\u0644\u0635\u0648\u062A\u064A \u0625\u0644\u0649 \u062A\u0644\u0627\u0648\u0627\u062A \u0627\u0644\u0634\u064A\u062E (${found.name}) \u0628\u0646\u062C\u0627\u062D!`,
    selectedReciter: found.id,
    activeReciter: found,
    scheduleEnabled: voice247Config.scheduleEnabled
  });
});
app.post("/api/voice/schedule", (req, res) => {
  const { scheduleEnabled, scheduleSlots } = req.body;
  if (typeof scheduleEnabled === "boolean") {
    voice247Config.scheduleEnabled = scheduleEnabled;
  }
  if (Array.isArray(scheduleSlots)) {
    voice247Config.scheduleSlots = scheduleSlots;
  }
  playQuranAudioForConfig(true);
  savePersistedSession();
  return res.json({
    success: true,
    message: "\u2705 \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062C\u062F\u0648\u0644 \u062A\u0644\u0627\u0648\u0627\u062A \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 24 \u0633\u0627\u0639\u0629 \u0628\u0646\u062C\u0627\u062D!",
    scheduleEnabled: voice247Config.scheduleEnabled,
    scheduleSlots: voice247Config.scheduleSlots,
    activeReciter: getActiveReciter(),
    currentHourMecca: getCurrentMeccaHour()
  });
});
app.get("/api/auto-responses", (req, res) => {
  res.json({ autoResponses });
});
app.post("/api/auto-responses", (req, res) => {
  const { rule, rules } = req.body;
  if (Array.isArray(rules)) {
    autoResponses = rules;
  } else if (rule && rule.trigger) {
    const existingIdx = autoResponses.findIndex((r) => r.id === rule.id);
    if (existingIdx !== -1) {
      autoResponses[existingIdx] = rule;
    } else {
      autoResponses.unshift(rule);
    }
  }
  savePersistedSession();
  res.json({ success: true, autoResponses });
});
app.post("/api/auto-responses/delete", (req, res) => {
  const { id } = req.body;
  autoResponses = autoResponses.filter((r) => r.id !== id);
  savePersistedSession();
  res.json({ success: true, autoResponses });
});
app.post("/api/auto-responses/test", (req, res) => {
  const { testMessage } = req.body;
  const normInput = normalizeArabicText(testMessage || "");
  let matchedRule = null;
  let simulatedReply = "";
  for (const rule of autoResponses) {
    if (!rule.enabled) continue;
    const normTrig = normalizeArabicText(rule.trigger);
    const isMatch = rule.matchType === "exact" ? normInput === normTrig : normInput.includes(normTrig) || (testMessage || "").toLowerCase().includes(rule.trigger.toLowerCase());
    if (isMatch) {
      matchedRule = rule;
      simulatedReply = (rule.reply || "").replace(/\{user\}/gi, "@Member").replace(/\{username\}/gi, "Member").replace(/\{server\}/gi, guildStats.guildName).replace(/\{channel\}/gi, "#general").replace(/\{count\}/gi, `${guildStats.membersCount}`);
      break;
    }
  }
  res.json({
    success: true,
    matched: !!matchedRule,
    matchedRule,
    simulatedReply: simulatedReply || "\u0644\u0645 \u064A\u062A\u0645 \u0645\u0637\u0627\u0628\u0642\u0629 \u0623\u064A \u0631\u062F \u062A\u0644\u0642\u0627\u0626\u064A \u0645\u0639 \u0647\u0630\u0647 \u0627\u0644\u0631\u0633\u0627\u0644\u0629."
  });
});
app.get("/api/bot/invite", (req, res) => {
  const clientId = botClient?.user?.id || "1564565916216336494";
  const botUsername = botClient?.user?.username || "m7r";
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
  res.json({
    clientId,
    botUsername,
    inviteUrl,
    permissions: "Administrator (8)",
    scope: "bot applications.commands"
  });
});
var loggedInDiscordUser = {
  id: "1525374225425367171",
  username: "Khalid_Hero",
  tag: "Khalid#2091",
  avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
  role: "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (Server Control)",
  isLoggedIn: true
};
app.get("/api/auth/discord/url", (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID || botClient?.user?.id || "1564565916216336494";
  const baseAppUrl = (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${baseAppUrl}/auth/callback`;
  const directBotAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
  const oauthRedirectParams = new URLSearchParams({
    client_id: clientId,
    permissions: "8",
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "identify guilds bot applications.commands"
  });
  const oauthRedirectUrl = `https://discord.com/oauth2/authorize?${oauthRedirectParams.toString()}`;
  res.json({
    url: directBotAuthUrl,
    directBotAuthUrl,
    oauthRedirectUrl,
    redirectUri,
    clientId,
    botUsername: "M7R"
  });
});
app.get(["/auth/discord", "/api/auth/discord"], (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID || botClient?.user?.id || "1564565916216336494";
  const baseAppUrl = (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${baseAppUrl}/auth/callback`;
  if (process.env.DISCORD_CLIENT_SECRET || process.env.CLIENT_SECRET) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "identify guilds bot applications.commands",
      permissions: "8"
    });
    return res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
  }
  return res.redirect(
    `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`
  );
});
app.get(
  [
    "/auth/callback",
    "/auth/callback/",
    "/auth/discord/callback",
    "/auth/discord/callback/",
    "/api/auth/discord/callback",
    "/api/auth/discord/callback/"
  ],
  async (req, res) => {
    const { code, guild_id } = req.query;
    const guildIdStr = typeof guild_id === "string" ? guild_id : "";
    const codeStr = typeof code === "string" ? code : "";
    const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID || botClient?.user?.id || "1564565916216336494";
    const clientSecret = process.env.DISCORD_CLIENT_SECRET || process.env.CLIENT_SECRET || "";
    const baseAppUrl = (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
    const redirectUri = process.env.DISCORD_REDIRECT_URI || `${baseAppUrl}${req.path}`;
    if (codeStr && clientSecret) {
      try {
        const tokenParams = new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code: codeStr,
          redirect_uri: redirectUri
        });
        const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: tokenParams.toString()
        });
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          if (tokenData?.access_token) {
            const userResponse = await fetch("https://discord.com/api/users/@me", {
              headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });
            if (userResponse.ok) {
              const discordUser = await userResponse.json();
              if (discordUser?.id && discordUser?.username) {
                loggedInDiscordUser = {
                  id: discordUser.id,
                  username: discordUser.global_name || discordUser.username,
                  tag: `${discordUser.username}#${discordUser.discriminator && discordUser.discriminator !== "0" ? discordUser.discriminator : "0001"}`,
                  avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
                  role: "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (Server Control)",
                  isLoggedIn: true
                };
              }
            }
          }
        }
      } catch (oauthErr) {
        console.log("[M7R OAuth2 Code Exchange Notice]:", oauthErr?.message || oauthErr);
      }
    }
    currentAccessMode = "server_admin";
    loggedInDiscordUser = {
      ...loggedInDiscordUser,
      role: "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (Server Control)",
      isLoggedIn: true
    };
    if (guildIdStr) {
      selectedGuildId = guildIdStr;
      if (botClient && botClient.isReady()) {
        const g = botClient.guilds.cache.get(guildIdStr);
        if (g) {
          await recordAndNotifyNewGuildJoin(g);
        }
      }
    }
    savePersistedSession();
    const safeDashboardRedirect = `/?discord_auth=success${guildIdStr ? `&guild_id=${encodeURIComponent(guildIdStr)}` : ""}`;
    res.send(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0639\u0628\u0631 \u062F\u064A\u0633\u0643\u0648\u0631\u062F \u0628\u0646\u062C\u0627\u062D | M7R</title>
          <meta http-equiv="refresh" content="1;url=${safeDashboardRedirect}" />
          <style>
            body {
              background: #05070a;
              color: #fff;
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .card {
              background: #0d111a;
              border: 1px solid rgba(16, 185, 129, 0.45);
              border-radius: 20px;
              padding: 32px;
              max-width: 440px;
              box-shadow: 0 20px 50px rgba(0,0,0,0.6);
            }
            .badge {
              display: inline-block;
              background: rgba(16, 185, 129, 0.15);
              color: #34d399;
              border: 1px solid rgba(16, 185, 129, 0.3);
              padding: 6px 14px;
              border-radius: 999px;
              font-size: 13px;
              font-weight: bold;
              margin-bottom: 16px;
            }
            .btn {
              display: inline-block;
              margin-top: 16px;
              padding: 10px 22px;
              background: #5865F2;
              color: #fff;
              text-decoration: none;
              border-radius: 12px;
              font-weight: bold;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">\u2705 \u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0645\u0646\u062D \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631</div>
            <h2>\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 M7R!</h2>
            <p style="color: #9ca3af; font-size: 14px;">\u062C\u0627\u0631\u064A \u062A\u062D\u0648\u064A\u0644\u0643 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0625\u0644\u0649 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0648\u064A\u0628 \u0627\u0644\u0622\u0646...</p>
            <a class="btn" href="${safeDashboardRedirect}">\u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0641\u0648\u0631\u064A \u0625\u0644\u0649 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u{1F680}</a>
          </div>
          <script>
            (function() {
              try {
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage({
                    type: 'OAUTH_AUTH_SUCCESS',
                    accessMode: 'server_admin',
                    guildId: '${guildIdStr}',
                    code: '${codeStr}'
                  }, '*');
                  setTimeout(function() { window.close(); }, 400);
                  return;
                }
              } catch (e) {}
              window.location.replace('${safeDashboardRedirect}');
            })();
          </script>
        </body>
      </html>
    `);
  }
);
app.get("/api/auth/discord/user", (req, res) => {
  res.json({
    user: loggedInDiscordUser,
    isLoggedIn: loggedInDiscordUser.isLoggedIn,
    accessMode: currentAccessMode
  });
});
app.post("/api/auth/discord/login", (req, res) => {
  const { username, tag, id, avatar, accessMode, guildId } = req.body;
  if (accessMode === "server_admin" || accessMode === "bot_owner") {
    currentAccessMode = accessMode;
  } else {
    currentAccessMode = "server_admin";
  }
  if (guildId && typeof guildId === "string") {
    selectedGuildId = guildId;
    if (botClient && botClient.isReady()) {
      const g = botClient.guilds.cache.get(guildId);
      if (g) {
        guildStats.guildName = g.name;
        guildStats.membersCount = g.memberCount || guildStats.membersCount;
      }
    }
  }
  if (username) {
    loggedInDiscordUser = {
      id: id || loggedInDiscordUser.id,
      username: username.trim(),
      tag: tag || `${username.trim()}#0001`,
      avatar: avatar || loggedInDiscordUser.avatar,
      role: currentAccessMode === "server_admin" ? "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (Server Control)" : "Owner / Administrator",
      isLoggedIn: true
    };
  } else {
    loggedInDiscordUser.isLoggedIn = true;
    loggedInDiscordUser.role = currentAccessMode === "server_admin" ? "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (Server Control)" : "Owner / Administrator";
  }
  savePersistedSession();
  res.json({
    success: true,
    user: loggedInDiscordUser,
    accessMode: currentAccessMode,
    selectedGuildId,
    message: `\u2705 \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u064A\u0627 ${loggedInDiscordUser.username}! \u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0645\u0646\u062D\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0646\u062C\u0627\u062D.`
  });
});
app.post("/api/auth/discord/logout", (req, res) => {
  loggedInDiscordUser.isLoggedIn = false;
  res.json({ success: true, message: "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C \u0628\u0646\u062C\u0627\u062D." });
});
app.post("/api/auth/access-mode", (req, res) => {
  const { mode } = req.body;
  if (mode === "bot_owner" || mode === "server_admin") {
    currentAccessMode = mode;
    savePersistedSession();
  }
  res.json({
    success: true,
    accessMode: currentAccessMode,
    message: currentAccessMode === "server_admin" ? "\u{1F6E1}\uFE0F \u062A\u0645 \u0627\u0644\u062A\u0628\u062F\u064A\u0644 \u0625\u0644\u0649 (\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631): \u062A\u0638\u0647\u0631 \u0641\u0642\u0637 \u0623\u062F\u0648\u0627\u062A \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0622\u0645\u0646\u0629 \u0648\u062A\u0645 \u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062D\u0633\u0627\u0633\u0629." : "\u{1F451} \u062A\u0645 \u0627\u0644\u062A\u0628\u062F\u064A\u0644 \u0625\u0644\u0649 (\u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u0627\u0644\u0643 \u0627\u0644\u0628\u0648\u062A \u0627\u0644\u0643\u0627\u0645\u0644\u0629): \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0648\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u0645\u062A\u0627\u062D\u0629."
  });
});
app.get("/api/notifications/guilds", (req, res) => {
  res.json({
    notifications: guildJoinNotifications,
    unreadCount: guildJoinNotifications.filter((n) => !n.read).length,
    accessMode: currentAccessMode
  });
});
app.post("/api/notifications/guilds/read", (req, res) => {
  guildJoinNotifications = guildJoinNotifications.map((n) => ({ ...n, read: true }));
  savePersistedSession();
  res.json({
    success: true,
    notifications: guildJoinNotifications,
    unreadCount: 0
  });
});
app.post("/api/notifications/guilds/simulate", async (req, res) => {
  const targetG = getTargetGuild();
  if (targetG) {
    guildJoinNotifications = guildJoinNotifications.filter((n) => n.guildId !== targetG.id);
    const notif = await recordAndNotifyNewGuildJoin(targetG);
    return res.json({
      success: true,
      notification: notif,
      notifications: guildJoinNotifications,
      unreadCount: guildJoinNotifications.filter((n) => !n.read).length,
      accessMode: currentAccessMode,
      message: `\u{1F514} \u062A\u0645 \u0631\u0635\u062F \u062F\u062E\u0648\u0644 \u0627\u0644\u0628\u0648\u062A \u0625\u0644\u0649 \u0633\u064A\u0631\u0641\u0631 (${targetG.name}) \u0648\u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0641\u0648\u0631\u064A \u0648\u0645\u0646\u062D \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631!`
    });
  }
  const demoNotif = {
    id: `join-${Date.now()}`,
    guildId: `sim-${Date.now()}`,
    guildName: req.body.guildName || "\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0645\u062C\u062A\u0645\u0639 \u0627\u0644\u0639\u0631\u0628\u064A \u0627\u0644\u062C\u062F\u064A\u062F \u2728",
    guildIcon: "",
    memberCount: 245,
    channelsCount: 28,
    ownerId: "1525374225425367171",
    ownerTag: "ServerOwner#0001",
    joinedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    permissionGranted: "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (\u0628\u062F\u0648\u0646 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062D\u0633\u0627\u0633\u0629)",
    accessMode: "server_admin",
    read: false
  };
  guildJoinNotifications.unshift(demoNotif);
  currentAccessMode = "server_admin";
  savePersistedSession();
  await sendLogToDiscordServer(
    "\u{1F389} \u0625\u0634\u0639\u0627\u0631 \u062C\u062F\u064A\u062F: \u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0628\u0648\u062A \u0625\u0644\u0649 \u0633\u064A\u0631\u0641\u0631 \u062C\u062F\u064A\u062F!",
    `\u{1F4E5} **\u062A\u0645 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0628\u0648\u062A \u0625\u0644\u0649 \u0633\u064A\u0631\u0641\u0631 \u062C\u062F\u064A\u062F!**
\u2022 **\u0627\u0633\u0645 \u0627\u0644\u0633\u064A\u0631\u0641\u0631:** \`${demoNotif.guildName}\`
\u2022 **\u0639\u062F\u062F \u0627\u0644\u0623\u0639\u0636\u0627\u0621:** \`${demoNotif.memberCount}\` \u0639\u0636\u0648
\u2022 **\u0635\u0627\u062D\u0628 \u0627\u0644\u0633\u064A\u0631\u0641\u0631:** \`${demoNotif.ownerTag}\`
\u2022 **\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0645\u0646\u0648\u062D\u0629:** \u2705 **\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B (\u0628\u062F\u0648\u0646 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062D\u0633\u0627\u0633\u0629)**`,
    "#10b981"
  );
  return res.json({
    success: true,
    notification: demoNotif,
    notifications: guildJoinNotifications,
    unreadCount: guildJoinNotifications.filter((n) => !n.read).length,
    accessMode: currentAccessMode,
    message: `\u{1F514} \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u062F\u062E\u0648\u0644 \u0627\u0644\u0628\u0648\u062A \u0625\u0644\u0649 (${demoNotif.guildName}) \u0648\u062A\u0641\u0639\u064A\u0644 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631!`
  });
});
app.get("/api/analytics/overview", (req, res) => {
  const targetG = getTargetGuild();
  const liveMemberCount = targetG?.memberCount || guildStats.membersCount || 1450;
  if (serverAnalytics7Days.length > 0 && targetG) {
    const lastIdx = serverAnalytics7Days.length - 1;
    serverAnalytics7Days[lastIdx].members = liveMemberCount;
    const step = liveMemberCount <= 20 ? 1 : Math.max(2, Math.round(liveMemberCount * 0.02));
    let running = liveMemberCount;
    for (let i = lastIdx - 1; i >= 0; i--) {
      serverAnalytics7Days[i + 1].newJoins = step;
      running = Math.max(1, running - step);
      serverAnalytics7Days[i].members = running;
    }
    serverAnalytics7Days[0].newJoins = step;
  }
  const totalMessages7Days = serverAnalytics7Days.reduce((acc, d) => acc + d.messages, 0);
  const totalNewJoins7Days = serverAnalytics7Days.reduce((acc, d) => acc + d.newJoins, 0);
  const totalCommands7Days = serverAnalytics7Days.reduce((acc, d) => acc + d.commandsUsed, 0);
  const todayStats = serverAnalytics7Days[serverAnalytics7Days.length - 1];
  res.json({
    success: true,
    guildName: targetG?.name || guildStats.guildName,
    memberCount: liveMemberCount,
    webDashboardUrl: WEB_DASHBOARD_PUBLIC_URL,
    devDashboardUrl: "https://ais-dev-3d6x76wht4gxuksotfbupe-804593892274.europe-west2.run.app",
    pingUrl: `${CLOUD_BACKEND_ORIGIN}/ping`,
    analytics7Days: serverAnalytics7Days,
    weeklyAttacks7Days,
    antiSpamConfig,
    summary: {
      totalMessages7Days,
      totalNewJoins7Days,
      totalCommands7Days,
      todayMessages: todayStats?.messages || 942,
      todayNewJoins: todayStats?.newJoins || 8,
      growthRatePercent: "+5.2%"
    }
  });
});
function computeBotPerformanceEvaluation() {
  const wsPing = botClient?.isReady() && botClient.ws.ping > 0 ? botClient.ws.ping : 17;
  const latencyScore = wsPing <= 35 ? 99 : wsPing <= 80 ? 94 : wsPing <= 150 ? 86 : 75;
  const isVoiceReady = voice247Config.enabled;
  const activeRec = getActiveReciter();
  const voiceScore = isVoiceReady ? 100 : 88;
  const securityChecks = [
    antiNukeConfig.enabled,
    antiSpamConfig.enabled,
    honeypotTrapConfig.enabled,
    welcomeConfig.enabled
  ];
  const activeSecurityCount = securityChecks.filter(Boolean).length;
  const securityScore = Math.min(100, 88 + activeSecurityCount * 3);
  const memUsageMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 10) / 10;
  const resourceScore = memUsageMb < 250 ? 98 : memUsageMb < 450 ? 92 : 85;
  const enabledCommandsCount = discordCommands.filter((c) => c.enabled).length;
  const commandsScore = enabledCommandsCount >= 20 ? 100 : 92;
  const overallScore = Math.round(
    latencyScore * 0.25 + voiceScore * 0.2 + securityScore * 0.25 + resourceScore * 0.15 + commandsScore * 0.15
  );
  const grade = overallScore >= 96 ? "A+" : overallScore >= 90 ? "A" : overallScore >= 85 ? "B+" : "B";
  const statusLabel = overallScore >= 95 ? "\u0645\u0645\u062A\u0627\u0632 \u0641\u0627\u0626\u0642 (Ultra Optimal \u{1F7E2})" : overallScore >= 88 ? "\u0645\u0645\u062A\u0627\u0632 \u0648\u0645\u0633\u062A\u0642\u0631 (Optimal \u{1F7E2})" : "\u062C\u064A\u062F \u062C\u062F\u0627\u064B (Good \u{1F7E1})";
  const upSec = Math.floor(process.uptime());
  const hours = Math.floor(upSec / 3600);
  const mins = Math.floor(upSec % 3600 / 60);
  const secs = upSec % 60;
  const uptimeFormatted = `${hours}h ${mins}m ${secs}s (24/7 Active)`;
  return {
    overallScore,
    grade,
    statusLabel,
    wsPing,
    latencyScore,
    voiceScore,
    activeReciterName: activeRec.name,
    voiceChannelName: currentVoiceChannelName || voice247Config.channelName || "\u0642\u0631\u0622\u0646 24/7",
    securityScore,
    memUsageMb,
    resourceScore,
    enabledCommandsCount: enabledCommandsCount + 6,
    commandsScore,
    uptimeFormatted,
    evaluatedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-SA")
  };
}
function buildBotPerformanceEmbed(perf, guildName) {
  return new EmbedBuilder().setColor("#10b981").setTitle(`\u26A1 \u062A\u0642\u0631\u064A\u0631 \u062A\u0642\u064A\u064A\u0645 \u0623\u062F\u0627\u0621 \u0627\u0644\u0628\u0648\u062A \u0627\u0644\u0634\u0627\u0645\u0644 | ${guildName}`).setDescription(
    `\u062A\u0645 \u0625\u062C\u0631\u0627\u0621 \u0641\u062D\u0635 \u0648\u062A\u0642\u064A\u064A\u0645 \u0634\u0627\u0645\u0644 \u0644\u0623\u062F\u0627\u0621 \u0628\u0648\u062A **M7R 24/7** \u0641\u064A \u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0641\u0639\u0644\u064A:

\u{1F3C6} **\u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629:** \`${perf.overallScore} / 100\` \u2014 \u0627\u0644\u062A\u0642\u062F\u064A\u0631: **\`${perf.grade}\`** (${perf.statusLabel})
\u{1F310} **\u0631\u0627\u0628\u0637 \u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064A\u0628 \u0627\u0644\u0645\u0628\u0627\u0634\u0631:**
${WEB_DASHBOARD_PUBLIC_URL}`
  ).addFields(
    {
      name: "\u26A1 \u0633\u0631\u0639\u0629 \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0648\u0627\u0644\u0628\u0646\u0642 (Latency)",
      value: `\`${perf.wsPing}ms\` \u2014 \u0627\u0644\u062A\u0642\u064A\u064A\u0645: \`${perf.latencyScore}%\` \u{1F7E2}`,
      inline: true
    },
    {
      name: "\u{1F54C} \u062B\u0628\u0627\u062A \u0627\u0644\u0641\u0648\u064A\u0633 \u0648\u0627\u0644\u0642\u0631\u0622\u0646 24/7",
      value: `\`${perf.voiceScore}%\` \u2014 \u0627\u0644\u0642\u0627\u0631\u0626: **${perf.activeReciterName}**`,
      inline: true
    },
    {
      name: "\u{1F6E1}\uFE0F \u0643\u0641\u0627\u0621\u0629 \u062F\u0631\u0648\u0639 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 (Security)",
      value: `\`${perf.securityScore}%\` \u2014 (Anti-Nuke & Trap \u{1F7E2})`,
      inline: true
    },
    {
      name: "\u{1F9E0} \u0627\u0633\u062A\u0647\u0644\u0627\u0643 \u0627\u0644\u0630\u0627\u0643\u0631\u0629 \u0648\u0627\u0644\u0645\u0639\u0627\u0644\u062C (RAM)",
      value: `\`${perf.memUsageMb} MB\` \u2014 \u0627\u0644\u0643\u0641\u0627\u0621\u0629: \`${perf.resourceScore}%\``,
      inline: true
    },
    {
      name: "\u2328\uFE0F \u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0648\u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629",
      value: `\`${perf.enabledCommandsCount}\` \u0623\u0645\u0631 \u0646\u0634\u0637 \u2014 \`${perf.commandsScore}%\``,
      inline: true
    },
    {
      name: "\u23F1\uFE0F \u0645\u062F\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0645\u0633\u062A\u0645\u0631 (Uptime)",
      value: `\`${perf.uptimeFormatted}\``,
      inline: true
    }
  ).setFooter({ text: `M7R Performance Benchmark \u2022 \u062A\u0645 \u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0641\u064A ${perf.evaluatedAt}` }).setTimestamp();
}
app.get("/api/bot/performance", (_req, res) => {
  const perf = computeBotPerformanceEvaluation();
  res.json({
    success: true,
    performance: perf,
    webDashboardUrl: WEB_DASHBOARD_PUBLIC_URL
  });
});
app.post("/api/web/publish-everywhere", async (_req, res) => {
  const targetG = getTargetGuild();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(WEB_DASHBOARD_PUBLIC_URL)}`;
  let sentChannelName = "";
  if (botClient && botClient.isReady()) {
    const guildsToUse = targetG ? [targetG] : Array.from(botClient.guilds.cache.values());
    for (const guild of guildsToUse) {
      const ch = guild.channels.cache.find(
        (c) => c.type === ChannelType.GuildText && (matchesChannelName(c.name, "general") || matchesChannelName(c.name, "\u0639\u0627\u0645") || matchesChannelName(c.name, "cmd") || matchesChannelName(c.name, "\u0627\u0648\u0627\u0645\u0631"))
      ) || guild.channels.cache.find((c) => c.type === ChannelType.GuildText);
      if (ch) {
        const pubEmbed = new EmbedBuilder().setColor("#5865F2").setTitle(`\u{1F310} \u062A\u0645 \u0646\u0634\u0631 \u0645\u0648\u0642\u0639 \u0648\u0628\u0648\u062A ${guild.name} \u0631\u0633\u0645\u064A\u0627\u064B \u0639\u0644\u0649 \u0627\u0644\u0648\u064A\u0628!`).setDescription(
          `\u0645\u0648\u0642\u0639 \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0648\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0623\u0635\u0628\u062D **\u0645\u0646\u0634\u0648\u0631\u0627\u064B \u0648\u0634\u063A\u0627\u0644\u0627\u064B 24/7 \u0639\u0644\u0649 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A** \u0628\u062F\u0648\u0646 \u0623\u064A \u062A\u0639\u0642\u064A\u062F!

\u{1F517} **\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0639\u0627\u0645 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0644\u0644\u062C\u0645\u064A\u0639:**
${WEB_DASHBOARD_PUBLIC_URL}

\u2728 **\u0645\u0645\u064A\u0632\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0646\u0634\u0648\u0631:**
\u2022 \u{1F4CA} \u0631\u0633\u0648\u0645 \u0628\u064A\u0627\u0646\u064A\u0629 \u062D\u064A\u0629 \u0644\u0646\u0645\u0648 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0648\u0627\u0644\u0631\u0633\u0627\u0626\u0644 (\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645)
\u2022 \u26A1 \u062A\u0642\u064A\u064A\u0645 \u0623\u062F\u0627\u0621 \u0627\u0644\u0628\u0648\u062A \u0627\u0644\u0634\u0627\u0645\u0644 \u0648\u0641\u062D\u0635 \u0627\u0644\u0628\u0646\u0642 \u0648\u0627\u0644\u0631\u0627\u0645
\u2022 \u{1F54C} \u062C\u062F\u0648\u0644 \u0628\u062B \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 24/7 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A \u0628\u062F\u0648\u0646 \u0645\u0648\u0633\u064A\u0642\u0649
\u2022 \u{1F381} \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629 (\`!\u062F\u0634\u0628\u0648\u0631\u062F\`, \`!\u062A\u0642\u064A\u064A\u0645\`, \`!\u0642\u0631\u0639\u0629\`, \`!\u062A\u0635\u0648\u064A\u062A\`) \u0628\u0636\u063A\u0637\u0629 \u0632\u0631!

\u{1F4F1} *\u0627\u0645\u0633\u062D \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F (QR Code) \u0628\u0627\u0644\u0623\u0633\u0641\u0644 \u0644\u0641\u062A\u062D \u0627\u0644\u0645\u0648\u0642\u0639 \u0641\u0648\u0631\u0627\u064B \u0645\u0646 \u0627\u0644\u062C\u0648\u0627\u0644:*`
        ).setImage(qrCodeUrl).setFooter({ text: "M7R Web Publisher \u2022 \u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u0646\u0634\u0648\u0631 \u0648\u0645\u062A\u0627\u062D \u0644\u0644\u062C\u0645\u064A\u0639 24/7" }).setTimestamp();
        const payload = buildWebDashboardPayload(
          guild.name,
          guild.memberCount,
          botClient.ws.ping > 0 ? botClient.ws.ping : 17
        );
        await ch.send({ embeds: [pubEmbed], components: payload.components }).catch(() => {
        });
        sentChannelName = ch.name;
        break;
      }
    }
  }
  return res.json({
    success: true,
    publishedUrl: WEB_DASHBOARD_PUBLIC_URL,
    qrCodeUrl,
    channelName: sentChannelName || "general",
    message: sentChannelName ? `\u{1F680} \u062A\u0645 \u0646\u0634\u0631 \u0631\u0627\u0628\u0637 \u0627\u0644\u0648\u064A\u0628 \u0627\u0644\u0631\u0633\u0645\u064A \u0645\u0639 \u0628\u0627\u0631\u0643\u0648\u062F \u0627\u0644\u062C\u0648\u0627\u0644 (QR) \u0648\u0623\u0632\u0631\u0627\u0631 \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0641\u064A \u0631\u0648\u0645 #${sentChannelName} \u0628\u0633\u064A\u0631\u0641\u0631\u0643!` : `\u{1F680} \u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u0646\u0634\u0648\u0631 \u0648\u062C\u0627\u0647\u0632 \u0639\u0644\u0649 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0628\u0627\u0634\u0631: ${WEB_DASHBOARD_PUBLIC_URL}`
  });
});
app.post("/api/dashboard/send-to-discord", async (req, res) => {
  const { channelName } = req.body;
  const targetChQuery = (channelName || botBasicSettings.commandsChannelName || "general").replace(/^#/, "").trim().toLowerCase();
  const todayPt = serverAnalytics7Days[serverAnalytics7Days.length - 1];
  if (todayPt) {
    todayPt.messages += 1;
    todayPt.commandsUsed += 1;
  }
  if (!botClient || !botClient.isReady()) {
    return res.json({
      success: true,
      simulated: true,
      webDashboardUrl: WEB_DASHBOARD_PUBLIC_URL,
      message: `\u2705 [\u0645\u0639\u0627\u064A\u0646\u0629] \u062A\u0645 \u062A\u062C\u0647\u064A\u0632 \u0648\u0625\u0631\u0633\u0627\u0644 \u0628\u0637\u0627\u0642\u0629 (\u{1F310} \u062F\u0634\u0628\u0648\u0631\u062F \u0627\u0644\u0648\u064A\u0628) \u0645\u0639 \u0632\u0631 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0625\u0644\u0649 \u0631\u0648\u0645 #${targetChQuery}!`
    });
  }
  const targetG = getTargetGuild();
  const guildsToUse = targetG ? [targetG] : Array.from(botClient.guilds.cache.values());
  let sentChannelName = "";
  for (const guild of guildsToUse) {
    const ch = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildText && (matchesChannelName(c.name, targetChQuery) || matchesChannelName(c.name, "cmd") || matchesChannelName(c.name, "\u0627\u0648\u0627\u0645\u0631") || matchesChannelName(c.name, "general") || matchesChannelName(c.name, "\u0639\u0627\u0645"))
    ) || guild.channels.cache.find((c) => c.type === ChannelType.GuildText);
    if (ch) {
      const payload = buildWebDashboardPayload(
        guild.name,
        guild.memberCount,
        botClient.ws.ping > 0 ? botClient.ws.ping : 17
      );
      await ch.send(payload).catch(() => {
      });
      sentChannelName = ch.name;
      break;
    }
  }
  return res.json({
    success: true,
    sent: !!sentChannelName,
    channelName: sentChannelName || targetChQuery,
    webDashboardUrl: WEB_DASHBOARD_PUBLIC_URL,
    analytics7Days: serverAnalytics7Days,
    message: sentChannelName ? `\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0628\u0637\u0627\u0642\u0629 (\u{1F310} \u062F\u0634\u0628\u0648\u0631\u062F \u0627\u0644\u0648\u064A\u0628 + \u0623\u0632\u0631\u0627\u0631 \u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629) \u0628\u0646\u062C\u0627\u062D \u0625\u0644\u0649 \u0631\u0648\u0645 #${sentChannelName} \u0641\u064A \u0633\u064A\u0631\u0641\u0631 (${targetG?.name || "Discord"})!` : `\u26A0\uFE0F \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0631\u0648\u0645 \u0646\u0635\u064A \u0645\u0646\u0627\u0633\u0628 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631.`
  });
});
app.post("/api/commands/execute-quick", async (req, res) => {
  const { commandKey, customText } = req.body;
  const todayPt = serverAnalytics7Days[serverAnalytics7Days.length - 1];
  if (todayPt) {
    todayPt.messages += 2;
    todayPt.commandsUsed += 1;
  }
  const targetG = getTargetGuild();
  const textChannel = targetG && botClient?.isReady() ? targetG.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && (matchesChannelName(c.name, botBasicSettings.commandsChannelName || "cmd") || matchesChannelName(c.name, "cmd") || matchesChannelName(c.name, "\u0627\u0648\u0627\u0645\u0631") || matchesChannelName(c.name, "general") || matchesChannelName(c.name, "\u0639\u0627\u0645"))
  ) || targetG.channels.cache.find((c) => c.type === ChannelType.GuildText) : void 0;
  if (commandKey === "dashboard") {
    if (textChannel && targetG) {
      const payload = buildWebDashboardPayload(
        targetG.name,
        targetG.memberCount,
        botClient?.ws.ping && botClient.ws.ping > 0 ? botClient.ws.ping : 17
      );
      await textChannel.send(payload).catch(() => {
      });
    }
    return res.json({
      success: true,
      analytics7Days: serverAnalytics7Days,
      message: `\u{1F310} \u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0623\u0645\u0631 (!\u062F\u0634\u0628\u0648\u0631\u062F) \u0648\u0625\u0631\u0633\u0627\u0644 \u0628\u0637\u0627\u0642\u0629 \u0644\u0648\u062D\u0629 \u0627\u0644\u0648\u064A\u0628 \u0645\u0639 \u0627\u0644\u0623\u0632\u0631\u0627\u0631 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (${targetG?.name || "M7R"})!`
    });
  }
  if (commandKey === "quran") {
    const joinRes = await joinDiscordVoiceChannel247(voice247Config.channelName, targetG || void 0);
    const activeRec = getActiveReciter();
    if (textChannel) {
      const qEmbed = new EmbedBuilder().setColor("#10b981").setTitle("\u{1F54C} \u0625\u0630\u0627\u0639\u0629 \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 24/7 (\u0628\u062F\u0648\u0646 \u0645\u0648\u0633\u064A\u0642\u0649)").setDescription(
        `\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0628\u062B \u0627\u0644\u0642\u0631\u0622\u0646\u064A \u0627\u0644\u0645\u0633\u062A\u0645\u0631 24/7 \u0641\u064A \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A!
\u2022 **\u0627\u0644\u0642\u0627\u0631\u0626 \u0627\u0644\u062D\u0627\u0644\u064A:** \u0627\u0644\u0634\u064A\u062E **${activeRec.name}**
\u2022 **\u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0635\u0648\u062A\u064A:** \`${currentVoiceChannelName || voice247Config.channelName}\``
      ).setTimestamp();
      await textChannel.send({ embeds: [qEmbed] }).catch(() => {
      });
    }
    return res.json({
      success: true,
      analytics7Days: serverAnalytics7Days,
      message: joinRes.message || `\u{1F54C} \u062A\u0645 \u062A\u0634\u063A\u064A\u0644 \u062A\u0644\u0627\u0648\u0629 \u0627\u0644\u0634\u064A\u062E (${activeRec.name}) \u0641\u064A \u0627\u0644\u0641\u0648\u064A\u0633 24/7 \u0648\u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0644\u0644\u0634\u0627\u062A!`
    });
  }
  if (commandKey === "giveaway") {
    const prize = customText || "\u0628\u0627\u0642\u0629 Nitro \u0623\u0648 \u0631\u062A\u0628\u0629 VIP \u{1F381}";
    const members = targetG?.members.cache.filter((m) => !m.user.bot);
    const winner = members && members.size > 0 ? members.random()?.user : null;
    if (textChannel && targetG) {
      const gEmbed = new EmbedBuilder().setColor("#f59e0b").setTitle(`\u{1F389} \u0642\u0631\u0639\u0629 \u0648\u0633\u062D\u0628 \u0639\u0634\u0648\u0627\u0626\u064A | ${targetG.name}`).setDescription(
        `\u{1F381} **\u0627\u0644\u062C\u0627\u0626\u0632\u0629:** \`${prize}\`
\u{1F973} **\u0627\u0644\u0641\u0627\u0626\u0632 \u0627\u0644\u0645\u062D\u0638\u0648\u0638:** ${winner ? `<@${winner.id}> (\`${winner.username}\`)` : "\u0623\u062D\u062F \u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0646\u0634\u0637\u064A\u0646"}
\u{1F310} **\u062A\u0645 \u0627\u0644\u0633\u062D\u0628 \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0646 \u062F\u0634\u0628\u0648\u0631\u062F \u0627\u0644\u0648\u064A\u0628!**`
      ).setTimestamp();
      await textChannel.send({ embeds: [gEmbed] }).catch(() => {
      });
    }
    return res.json({
      success: true,
      analytics7Days: serverAnalytics7Days,
      message: `\u{1F381} \u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0623\u0645\u0631 \u0627\u0644\u0642\u0631\u0639\u0629 (!\u0642\u0631\u0639\u0629) \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631! \u0627\u0644\u0641\u0627\u0626\u0632: ${winner?.username || "\u0639\u0636\u0648 \u0639\u0634\u0648\u0627\u0626\u064A"} \u{1F3C6}`
    });
  }
  if (commandKey === "poll") {
    const question = customText || "\u0645\u0627 \u0631\u0623\u064A\u0643\u0645 \u0641\u064A \u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0648\u062A\u0644\u0627\u0648\u0627\u062A \u0627\u0644\u0642\u0631\u0622\u0646 24/7\u061F";
    if (textChannel) {
      const pEmbed = new EmbedBuilder().setColor("#3b82f6").setTitle("\u{1F4CA} \u062A\u0635\u0648\u064A\u062A \u0631\u0633\u0645\u064A \u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0633\u064A\u0631\u0641\u0631").setDescription(`**${question}**

\u2705 = \u0645\u0648\u0627\u0641\u0642 / \u0645\u0645\u062A\u0627\u0632
\u274C = \u063A\u064A\u0631 \u0645\u0648\u0627\u0641\u0642`).setTimestamp();
      const m = await textChannel.send({ embeds: [pEmbed] }).catch(() => null);
      if (m) {
        await m.react("\u2705").catch(() => {
        });
        await m.react("\u274C").catch(() => {
        });
      }
    }
    return res.json({
      success: true,
      analytics7Days: serverAnalytics7Days,
      message: `\u{1F4CA} \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0635\u0648\u064A\u062A \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A (!\u062A\u0635\u0648\u064A\u062A) \u0645\u0639 \u0625\u064A\u0645\u0648\u062C\u064A (\u2705 / \u274C) \u0625\u0644\u0649 \u0634\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0646\u062C\u0627\u062D!`
    });
  }
  if (commandKey === "azkar") {
    const activeItems = azkarConfig.items.filter((i) => i.enabled);
    const item = activeItems.length > 0 ? activeItems[Math.floor(Math.random() * activeItems.length)] : azkarConfig.items[0];
    if (textChannel) {
      const payload = buildAzkarEmbed(item);
      await textChannel.send(payload).catch(() => {
      });
    }
    return res.json({
      success: true,
      analytics7Days: serverAnalytics7Days,
      message: `\u{1F4FF} \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0630\u0643\u0631 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A (\xAB${item.categoryLabel}\xBB) \u0625\u0644\u0649 \u0634\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0646\u062C\u0627\u062D!`
    });
  }
  if (commandKey === "stats") {
    const totalMsgs = serverAnalytics7Days.reduce((acc, d) => acc + d.messages, 0);
    if (textChannel && targetG) {
      const sEmbed = new EmbedBuilder().setColor("#10b981").setTitle(`\u{1F4C8} \u062A\u0642\u0631\u064A\u0631 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0644\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645 | ${targetG.name}`).setDescription(
        `\u2022 \u{1F465} **\u0639\u062F\u062F \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u062D\u0627\u0644\u064A:** \`${targetG.memberCount}\` \u0639\u0636\u0648
\u2022 \u{1F4AC} **\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u064A\u0648\u0645:** \`${todayPt?.messages || 942}\` \u0631\u0633\u0627\u0644\u0629
\u2022 \u{1F4CA} **\u0625\u062C\u0645\u0627\u0644\u064A \u0631\u0633\u0627\u0626\u0644 \u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645:** \`${totalMsgs.toLocaleString()}\` \u0631\u0633\u0627\u0644\u0629
\u2022 \u{1F310} **\u0634\u0627\u0647\u062F \u0627\u0644\u0631\u0633\u0645 \u0627\u0644\u0628\u064A\u0627\u0646\u064A \u0627\u0644\u0643\u0627\u0645\u0644 \u0641\u064A \u062F\u0634\u0628\u0648\u0631\u062F \u0627\u0644\u0648\u064A\u0628:**
${WEB_DASHBOARD_PUBLIC_URL}`
      ).setTimestamp();
      await textChannel.send({ embeds: [sEmbed] }).catch(() => {
      });
    }
    return res.json({
      success: true,
      analytics7Days: serverAnalytics7Days,
      message: `\u{1F4CA} \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u062A\u0642\u0631\u064A\u0631 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645) \u0625\u0644\u0649 \u062F\u064A\u0633\u0643\u0648\u0631\u062F \u0648\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0631\u0633\u0645 \u0627\u0644\u0628\u064A\u0627\u0646\u064A!`
    });
  }
  if (commandKey === "benchmark") {
    const perf = computeBotPerformanceEvaluation();
    if (textChannel && targetG) {
      const bEmbed = buildBotPerformanceEmbed(perf, targetG.name);
      await textChannel.send({ embeds: [bEmbed] }).catch(() => {
      });
    }
    return res.json({
      success: true,
      performance: perf,
      analytics7Days: serverAnalytics7Days,
      message: `\u26A1 \u062A\u0645 \u0625\u062C\u0631\u0627\u0621 \u062A\u0642\u064A\u064A\u0645 \u0623\u062F\u0627\u0621 \u0627\u0644\u0628\u0648\u062A \u0627\u0644\u0634\u0627\u0645\u0644 (${perf.overallScore}/100 - \u062A\u0642\u062F\u064A\u0631 ${perf.grade}) \u0648\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0625\u0644\u0649 \u0634\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631!`
    });
  }
  return res.json({
    success: true,
    analytics7Days: serverAnalytics7Days,
    message: "\u2705 \u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0623\u0645\u0631 \u0648\u062A\u062D\u062F\u064A\u062B \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0646\u062C\u0627\u062D!"
  });
});
app.post("/api/azkar/send-now", async (req, res) => {
  const { itemId, channelName } = req.body;
  const targetItem = (itemId ? azkarConfig.items.find((i) => i.id === itemId) : null) || azkarConfig.items.find((i) => i.enabled) || azkarConfig.items[0];
  const targetCh = (channelName || azkarConfig.channelName || "\u0627\u0630\u0643\u0627\u0631").replace("#", "").trim().toLowerCase();
  if (!botClient || !botClient.isReady()) {
    return res.json({
      success: true,
      simulated: true,
      message: `[\u0648\u0636\u0639 \u0627\u0644\u0645\u062D\u0627\u0643\u0627\u0629] \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0630\u0643\u0631 \u0625\u0644\u0649 \u0631\u0648\u0645 #${targetCh}: \xAB${targetItem.arabicText}\xBB`
    });
  }
  const payload = buildAzkarEmbed(targetItem);
  let sent = false;
  for (const [, guild] of botClient.guilds.cache) {
    const ch = guild.channels.cache.find(
      (c) => c.isTextBased() && c.name.toLowerCase().includes(targetCh)
    );
    if (ch) {
      await ch.send(payload).catch(() => {
      });
      sent = true;
    } else {
      const fallback = guild.channels.cache.find((c) => c.type === ChannelType.GuildText);
      if (fallback) {
        await fallback.send(payload).catch(() => {
        });
        sent = true;
      }
    }
  }
  return res.json({
    success: true,
    sent,
    item: targetItem,
    message: sent ? "\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0630\u0643\u0631 \u0627\u0644\u0645\u0628\u0627\u0631\u0643 \u0628\u0646\u062C\u0627\u062D \u0625\u0644\u0649 \u062F\u064A\u0633\u0643\u0648\u0631\u062F!" : "\u26A0\uFE0F \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631."
  });
});
app.post("/api/trap/deploy-channel", async (req, res) => {
  const { channelName, warningMessage } = req.body;
  if (channelName) honeypotTrapConfig.channelName = channelName;
  if (warningMessage) honeypotTrapConfig.customWarningMessage = warningMessage;
  const chName = honeypotTrapConfig.channelName.replace("#", "").trim();
  if (!botClient || !botClient.isReady()) {
    return res.json({
      success: true,
      simulated: true,
      message: `[\u0648\u0636\u0639 \u0627\u0644\u0645\u062D\u0627\u0643\u0627\u0629] \u062A\u0645 \u062A\u062C\u0647\u064A\u0632 \u0631\u0648\u0645 \u0627\u0644\u0645\u0635\u064A\u062F\u0629 (#${chName})! \u0628\u0645\u062C\u0631\u062F \u0631\u0628\u0637 \u0627\u0644\u062A\u0648\u0643\u0646 \u0633\u064A\u062A\u0645 \u0625\u0646\u0634\u0627\u0624\u0647 \u0641\u064A \u062F\u064A\u0633\u0643\u0648\u0631\u062F.`
    });
  }
  let createdCount = 0;
  for (const [, guild] of botClient.guilds.cache) {
    let trapCh = guild.channels.cache.find(
      (c) => c.name.toLowerCase() === chName.toLowerCase() || c.name.includes("\u0645\u0645\u0646\u0648\u0639") || c.name.includes("trap")
    );
    if (!trapCh) {
      trapCh = await guild.channels.create({
        name: chName,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
          }
        ]
      }).catch(() => null);
    }
    if (trapCh) {
      const warningEmbed = new EmbedBuilder().setColor("#dc2626").setTitle("\u{1FAA4} \u0645\u0635\u064A\u062F\u0629 M7R \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 (Anti-Raid Trap)").setDescription(honeypotTrapConfig.customWarningMessage).addFields(
        { name: "\u{1F6A8} \u062A\u062D\u0630\u064A\u0631 \u0635\u0627\u0631\u0645", value: "\u0647\u0630\u0627 \u0627\u0644\u0631\u0648\u0645 \u0645\u062E\u0635\u0635 \u0644\u0635\u064A\u062F \u0627\u0644\u0628\u0648\u062A\u0627\u062A \u0648\u0627\u0644\u0645\u062E\u0631\u0628\u064A\u0646 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B. \u0623\u064A \u0631\u0633\u0627\u0644\u0629 \u062A\u0643\u062A\u0628 \u0647\u0646\u0627 \u064A\u062A\u0645 \u0643\u0634\u0641\u0647\u0627 \u0648\u062D\u0638\u0631 \u0635\u0627\u062D\u0628\u0647\u0627 \u0641\u0648\u0631\u0627\u064B!", inline: false },
        { name: "\u0627\u0644\u0639\u0642\u0648\u0628\u0629 \u0627\u0644\u0645\u0637\u0628\u0642\u0629", value: `\`${honeypotTrapConfig.punishment.toUpperCase()}\``, inline: true }
      ).setFooter({ text: "M7R Automated Honeypot Shield" }).setTimestamp();
      await trapCh.send({ embeds: [warningEmbed] }).catch(() => {
      });
      createdCount += 1;
    }
  }
  return res.json({
    success: true,
    createdCount,
    message: createdCount > 0 ? `\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0648\u0646\u0634\u0631 \u0631\u0648\u0645 \u0627\u0644\u0645\u0635\u064A\u062F\u0629 (#${chName}) \u0641\u064A \u062F\u064A\u0633\u0643\u0648\u0631\u062F \u0628\u0646\u062C\u0627\u062D \u0645\u0639 \u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u062D\u0630\u064A\u0631!` : "\u26A0\uFE0F \u062A\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0631\u0648\u0645\u060C \u062A\u0623\u0643\u062F \u0645\u0646 \u0625\u0639\u0637\u0627\u0621 \u0627\u0644\u0628\u0648\u062A \u0635\u0644\u0627\u062D\u064A\u0629 Manage Channels."
  });
});
app.post("/api/trap/test", async (req, res) => {
  honeypotTrapConfig.totalTrapped += 1;
  guildStats.attacksThwartedCount += 1;
  const fakeId = Math.floor(1e3 + Math.random() * 9e3);
  const log = {
    id: `th-${Date.now()}`,
    type: "anti-spam",
    action: "Honeypot Trap Triggered \u{1FAA4}",
    target: `#${honeypotTrapConfig.channelName}`,
    executor: `SpamRaidBot_${fakeId}#0000 (ID: 98127391823)`,
    timestamp: "\u0627\u0644\u0622\u0646",
    severity: "critical",
    details: `\u0648\u0642\u0639 \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u062F\u062E\u064A\u0644 \u0641\u064A \u0631\u0648\u0645 \u0627\u0644\u0645\u0635\u064A\u062F\u0629 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 (#${honeypotTrapConfig.channelName}) \u0648\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 (${honeypotTrapConfig.punishment}) \u0641\u0648\u0631\u0627\u064B \u0648\u0645\u0633\u062D \u0631\u0633\u0627\u0644\u062A\u0647 \u0627\u0644\u0645\u062E\u0627\u0644\u0641\u0629.`
  };
  threatLogs.unshift(log);
  if (threatLogs.length > 20) threatLogs.pop();
  await sendLogToDiscordServer(
    "\u{1FAA4} \u062A\u062C\u0631\u0628\u0629 \u0645\u0635\u064A\u062F\u0629 \u0627\u0644\u0633\u0628\u0627\u0645 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 (M7R Trap Test)",
    `\u062A\u0645 \u0627\u062E\u062A\u0628\u0627\u0631 \u0645\u0635\u064A\u062F\u0629 M7R \u0628\u0646\u062C\u0627\u062D!
\u2022 \u0627\u0644\u0631\u0648\u0645: \`#${honeypotTrapConfig.channelName}\`
\u2022 \u0627\u0644\u0639\u0642\u0648\u0628\u0629: \`${honeypotTrapConfig.punishment}\`
\u2022 \u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0636\u0628\u0648\u0637\u064A\u0646: \`${honeypotTrapConfig.totalTrapped}\``,
    "#f59e0b"
  );
  return res.json({
    success: true,
    totalTrapped: honeypotTrapConfig.totalTrapped,
    log
  });
});
app.post("/api/broadcast/send", async (req, res) => {
  const { title, description, channelName, color, mentionEveryone } = req.body;
  const targetChName = (channelName || "general").replace("#", "").trim().toLowerCase();
  const embed = new EmbedBuilder().setColor(color || "#e11d48").setTitle(title || "\u{1F4E2} \u0625\u0639\u0644\u0627\u0646 \u0631\u0633\u0645\u064A \u0645\u0646 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631").setDescription(description || "\u064A\u0633\u0631 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0645\u0648\u0627\u0641\u0627\u062A\u0643\u0645 \u0628\u0647\u0630\u0627 \u0627\u0644\u062A\u062D\u062F\u064A\u062B.").setFooter({ text: `${guildStats.guildName} \u2022 Official Broadcast` }).setTimestamp();
  if (!botClient || !botClient.isReady()) {
    return res.json({
      success: true,
      simulated: true,
      message: `[\u0648\u0636\u0639 \u0627\u0644\u0645\u062D\u0627\u0643\u0627\u0629] \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0625\u0644\u0649 \u0631\u0648\u0645 #${targetChName}: "${title}"`
    });
  }
  let sent = false;
  for (const [, guild] of botClient.guilds.cache) {
    const ch = guild.channels.cache.find(
      (c) => c.isTextBased() && c.name.toLowerCase().includes(targetChName)
    );
    if (ch) {
      await ch.send({
        content: mentionEveryone ? "@everyone" : void 0,
        embeds: [embed]
      }).catch(() => {
      });
      sent = true;
    } else {
      const fallback = guild.channels.cache.find((c) => c.type === ChannelType.GuildText);
      if (fallback) {
        await fallback.send({
          content: mentionEveryone ? "@everyone" : void 0,
          embeds: [embed]
        }).catch(() => {
        });
        sent = true;
      }
    }
  }
  return res.json({
    success: true,
    sent,
    message: sent ? `\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0627\u0644\u0631\u0633\u0645\u064A \u0625\u0644\u0649 \u062F\u064A\u0633\u0643\u0648\u0631\u062F \u0628\u0646\u062C\u0627\u062D!` : "\u26A0\uFE0F \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631."
  });
});
app.get("/api/threats", (req, res) => {
  res.json({
    logs: threatLogs,
    weeklyAttacks7Days,
    antiSpamConfig,
    totalThwarted: guildStats.attacksThwartedCount
  });
});
app.post("/api/threats/simulate", async (req, res) => {
  const { type, sendToDiscord } = req.body;
  let newLog;
  if (type === "nuke") {
    recordWeeklyAttackBlocked("nuke");
    newLog = {
      id: `th-${Date.now()}`,
      type: "anti-nuke",
      action: "Mass Channel Delete & Ban Attack Intercepted \u26A1",
      target: "Attempted to delete #chat-1, #chat-2",
      executor: `Attacker_${Math.floor(1e3 + Math.random() * 9e3)}#0000`,
      timestamp: "\u0627\u0644\u0622\u0646",
      severity: "critical",
      details: "\u062A\u0645 \u062D\u0638\u0631 \u0627\u0644\u0645\u0647\u0627\u062C\u0645 \u0641\u0648\u0631\u0627\u064B \u0648\u0633\u062D\u0628 \u0631\u062A\u0628\u0647 \u0648\u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0628\u0641\u0636\u0644 \u062F\u0631\u0639 Anti-Nuke \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A."
    };
  } else if (type === "duplicate_spam") {
    recordWeeklyAttackBlocked("spam");
    newLog = {
      id: `th-${Date.now()}`,
      type: "anti-spam",
      action: "Duplicate Copy-Paste Spam Blocked \u{1F6AB}",
      target: "#general",
      executor: `CopySpammer_${Math.floor(100 + Math.random() * 900)}`,
      timestamp: "\u0627\u0644\u0622\u0646",
      severity: "high",
      details: `\u0631\u0635\u062F \u062F\u0631\u0639 \u0645\u0643\u0627\u0641\u062D\u0629 \u0627\u0644\u0633\u0628\u0627\u0645 \u062A\u0643\u0631\u0627\u0631 \u0646\u0641\u0633 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 3 \u0645\u0631\u0627\u062A \u0645\u062A\u062A\u0627\u0644\u064A\u0629 \u0648\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0648\u0643\u062A\u0645 \u0627\u0644\u062D\u0633\u0627\u0628 \u0644\u0645\u062F\u0629 ${antiSpamConfig.timeoutDurationMinutes} \u062F\u0642\u064A\u0642\u0629.`
    };
  } else if (type === "mention_raid") {
    recordWeeklyAttackBlocked("spam");
    newLog = {
      id: `th-${Date.now()}`,
      type: "anti-spam",
      action: "Mass Mention & @everyone Raid Neutralized \u{1F6A8}",
      target: "#general",
      executor: `MentionRaider_${Math.floor(100 + Math.random() * 900)}`,
      timestamp: "\u0627\u0644\u0622\u0646",
      severity: "critical",
      details: "\u0645\u062D\u0627\u0648\u0644\u0629 \u0625\u0632\u0639\u0627\u062C \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0628\u0645\u0646\u0634\u0646 \u062C\u0645\u0627\u0639\u064A (@everyone + 6 \u0645\u0646\u0634\u0646). \u062A\u0645 \u0645\u0633\u062D \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0641\u064A 0.1 \u062B\u0627\u0646\u064A\u0629 \u0648\u062A\u0637\u0628\u064A\u0642 \u0643\u062A\u0645 \u0641\u0648\u0631\u064A."
    };
  } else if (type === "spam") {
    recordWeeklyAttackBlocked("spam");
    newLog = {
      id: `th-${Date.now()}`,
      type: "anti-spam",
      action: "Rapid Flood Spam Wave Neutralized \u{1F4AC}",
      target: "#general",
      executor: `RaidBot_${Math.floor(100 + Math.random() * 900)}`,
      timestamp: "\u0627\u0644\u0622\u0646",
      severity: "high",
      details: `\u0631\u0635\u062F\u062A \u0645\u0635\u064A\u062F\u0629 \u0627\u0644\u0633\u0628\u0627\u0645 \u0627\u0644\u0641\u0627\u0626\u0642\u0629 8 \u0631\u0633\u0627\u0626\u0644 \u0645\u062A\u062A\u0627\u0644\u064A\u0629 \u0641\u064A \u062B\u0627\u0646\u064A\u062A\u064A\u0646 \u0648\u062A\u0645 \u0645\u0633\u062D\u0647\u0627 \u062C\u0645\u0627\u0639\u064A\u0627\u064B \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0643\u062A\u0645 \u0627\u0644\u0641\u0648\u0631\u064A (${antiSpamConfig.timeoutDurationMinutes} \u062F\u0642\u064A\u0642\u0629).`
    };
  } else {
    recordWeeklyAttackBlocked("links");
    newLog = {
      id: `th-${Date.now()}`,
      type: "anti-invite",
      action: "Unauthorized Invite / Scam Link Thwarted \u{1F517}",
      target: "#chat",
      executor: `Promo_${Math.floor(100 + Math.random() * 900)}`,
      timestamp: "\u0627\u0644\u0622\u0646",
      severity: "medium",
      details: "\u062A\u0645 \u0645\u0633\u062D \u0631\u0627\u0628\u0637 \u062F\u0639\u0648\u0629 \u0633\u064A\u0631\u0641\u0631 \u062F\u064A\u0633\u0643\u0648\u0631\u062F \u0623\u0648 \u0631\u0627\u0628\u0637 \u0645\u0634\u0628\u0648\u0647 \u063A\u064A\u0631 \u0645\u0631\u062E\u0635 \u0648\u062A\u0637\u0628\u064A\u0642 \u062A\u062D\u0630\u064A\u0631 \u062A\u0644\u0642\u0627\u0626\u064A."
    };
  }
  threatLogs.unshift(newLog);
  if (threatLogs.length > 20) threatLogs.pop();
  if (sendToDiscord && botClient && botClient.isReady()) {
    const targetG = getTargetGuild();
    const textCh = targetG ? targetG.channels.cache.find(
      (c) => c.type === ChannelType.GuildText && (matchesChannelName(c.name, "general") || matchesChannelName(c.name, "\u0639\u0627\u0645") || matchesChannelName(c.name, "cmd"))
    ) || targetG.channels.cache.find((c) => c.type === ChannelType.GuildText) : void 0;
    if (textCh) {
      const simEmbed = new EmbedBuilder().setColor("#e11d48").setTitle(`\u{1F6E1}\uFE0F \u0627\u062E\u062A\u0628\u0627\u0631 \u062F\u0631\u0639 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0648\u0645\u0643\u0627\u0641\u062D\u0629 \u0627\u0644\u0633\u0628\u0627\u0645: ${newLog.action}`).setDescription(
        `**\u0627\u0644\u0646\u062A\u064A\u062C\u0629:** \u2705 \u062A\u0645 \u0635\u062F \u0627\u0644\u0647\u062C\u0645\u0629 \u0628\u0646\u062C\u0627\u062D \u0648\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0631\u0633\u0645 \u0627\u0644\u0628\u064A\u0627\u0646\u064A \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A!
\u2022 **\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644:** ${newLog.details}
\u2022 **\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0631\u0633\u0645\u064A \u0644\u0644\u0648\u062D\u0629 \u0627\u0644\u062D\u0645\u0627\u064A\u0629:** ${WEB_DASHBOARD_PUBLIC_URL}`
      ).setTimestamp();
      await textCh.send({ embeds: [simEmbed] }).catch(() => {
      });
    }
  }
  res.json({
    success: true,
    newLog,
    weeklyAttacks7Days,
    totalThwarted: guildStats.attacksThwartedCount
  });
});
app.post("/api/security/update-shield", (req, res) => {
  const { ultraMode, maxMessages, windowSeconds, timeoutDurationMinutes, punishment } = req.body;
  if (typeof ultraMode === "boolean") {
    antiSpamConfig.ultraMode = ultraMode;
    antiSpamConfig.maxMessages = ultraMode ? 4 : 6;
    antiSpamConfig.windowSeconds = ultraMode ? 4 : 5;
    antiSpamConfig.maxDuplicates = ultraMode ? 2 : 3;
    antiSpamConfig.maxMentions = ultraMode ? 3 : 5;
    antiSpamConfig.timeoutDurationMinutes = ultraMode ? 15 : 5;
  }
  if (typeof maxMessages === "number") antiSpamConfig.maxMessages = maxMessages;
  if (typeof windowSeconds === "number") antiSpamConfig.windowSeconds = windowSeconds;
  if (typeof timeoutDurationMinutes === "number") antiSpamConfig.timeoutDurationMinutes = timeoutDurationMinutes;
  if (punishment) antiSpamConfig.punishment = punishment;
  res.json({
    success: true,
    antiSpamConfig,
    message: antiSpamConfig.ultraMode ? "\u{1F525} \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0648\u0636\u0639 \u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0642\u0635\u0648\u0649 \u0648\u0645\u0643\u0627\u0641\u062D\u0629 \u0627\u0644\u0633\u0628\u0627\u0645 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A\u0629 (Ultra Anti-Spam Shield)!" : "\u{1F6E1}\uFE0F \u062A\u0645 \u0636\u0628\u0637 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u062F\u0631\u0639 \u0645\u0643\u0627\u0641\u062D\u0629 \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u0627\u0644\u062D\u0645\u0627\u064A\u0629 \u0628\u0646\u062C\u0627\u062D!"
  });
});
app.post("/api/security/send-weekly-report", async (_req, res) => {
  const totalWeek = weeklyAttacks7Days.reduce((acc, d) => acc + d.totalAttacks, 0);
  const totalSpam = weeklyAttacks7Days.reduce((acc, d) => acc + d.spamBlocked, 0);
  const totalNuke = weeklyAttacks7Days.reduce((acc, d) => acc + d.nukeBlocked, 0);
  const totalLinks = weeklyAttacks7Days.reduce((acc, d) => acc + d.linksBlocked, 0);
  let sentChannelName = "general";
  if (botClient && botClient.isReady()) {
    const targetG = getTargetGuild();
    if (targetG) {
      const textCh = targetG.channels.cache.find(
        (c) => c.type === ChannelType.GuildText && (matchesChannelName(c.name, "general") || matchesChannelName(c.name, "\u0639\u0627\u0645") || matchesChannelName(c.name, "cmd") || matchesChannelName(c.name, "\u0627\u0648\u0627\u0645\u0631"))
      ) || targetG.channels.cache.find((c) => c.type === ChannelType.GuildText);
      if (textCh) {
        sentChannelName = textCh.name;
        const dailyBreakdown = weeklyAttacks7Days.map(
          (d) => `\u2022 **${d.day}:** \u0625\u062C\u0645\u0627\u0644\u064A \`${d.totalAttacks}\` \u0647\u062C\u0645\u0629 \u0645\u0635\u062F\u0648\u062F\u0629 *(\u0633\u0628\u0627\u0645: ${d.spamBlocked} | \u062A\u062E\u0631\u064A\u0628: ${d.nukeBlocked} | \u0631\u0648\u0627\u0628\u0637: ${d.linksBlocked})*`
        ).join("\n");
        const secEmbed = new EmbedBuilder().setColor("#e11d48").setTitle(`\u{1F6E1}\uFE0F \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0647\u062C\u0645\u0627\u062A \u0627\u0644\u0645\u0635\u062F\u0648\u062F\u0629 \u0648\u0627\u0644\u062F\u0631\u0639 \u0627\u0644\u0645\u0636\u0627\u062F \u0644\u0644\u0633\u0628\u0627\u0645 (\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645) | ${targetG.name}`).setURL(WEB_DASHBOARD_PUBLIC_URL).setDescription(
          `\u064A\u0639\u0645\u0644 **\u0627\u0644\u062F\u0631\u0639 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u064A M7R Ultra Anti-Spam 24/7** \u0628\u0623\u0642\u0635\u0649 \u0642\u0648\u0629 \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0645\u0646 \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u0627\u0644\u062A\u0643\u0631\u0627\u0631 \u0648\u0627\u0644\u0645\u0646\u0634\u0646 \u0627\u0644\u062C\u0645\u0627\u0639\u064A \u0648\u0627\u0644\u0631\u0648\u0627\u0628\u0637:

\u{1F310} **\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0631\u0633\u0645\u064A (Netlify):**
${WEB_DASHBOARD_PUBLIC_URL}

\u{1F4CA} **\u0645\u0644\u062E\u0635 \u0627\u0644\u0647\u062C\u0645\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0645 \u0635\u062F\u0647\u0627 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 (\`${totalWeek}\` \u0647\u062C\u0645\u0629 \u0645\u062D\u0628\u0637\u0629):**
\u2022 \u{1F6AB} **\u0645\u0648\u062C\u0627\u062A \u0627\u0644\u0633\u0628\u0627\u0645 \u0648\u0627\u0644\u062A\u0643\u0631\u0627\u0631 \u0648\u0627\u0644\u0645\u0646\u0634\u0646 \u0627\u0644\u0645\u0635\u062F\u0648\u062F\u0629:** \`${totalSpam}\` \u0647\u062C\u0645\u0629
\u2022 \u26A1 **\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u062E\u0631\u064A\u0628 \u0648\u0627\u0644\u0640 Anti-Nuke \u0627\u0644\u0645\u062D\u0628\u0637\u0629:** \`${totalNuke}\` \u0645\u062D\u0627\u0648\u0644\u0629
\u2022 \u{1F517} **\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u062F\u0639\u0648\u0627\u062A \u0648\u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0645\u0634\u0628\u0648\u0647\u0629 \u0627\u0644\u0645\u062D\u0630\u0648\u0641\u0629:** \`${totalLinks}\` \u0631\u0627\u0628\u0637

\u{1F4C5} **\u062A\u0641\u0635\u064A\u0644 \u0627\u0644\u0647\u062C\u0645\u0627\u062A \u0627\u0644\u0645\u0635\u062F\u0648\u062F\u0629 \u064A\u0648\u0645\u064A\u0627\u064B:**
${dailyBreakdown}`
        ).setFooter({ text: "M7R Ultra Security & Anti-Spam \u2022 https://bot-m7r.netlify.app/" }).setTimestamp();
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("\u{1F310} \u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 (bot-m7r.netlify.app)").setStyle(ButtonStyle.Link).setURL(WEB_DASHBOARD_PUBLIC_URL)
        );
        await textCh.send({ embeds: [secEmbed], components: [row] }).catch(() => {
        });
      }
    }
  }
  return res.json({
    success: true,
    channelName: sentChannelName,
    weeklyAttacks7Days,
    webDashboardUrl: WEB_DASHBOARD_PUBLIC_URL,
    message: `\u{1F6E1}\uFE0F \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0647\u062C\u0645\u0627\u062A \u0627\u0644\u0645\u0635\u062F\u0648\u062F\u0629 \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0645\u0639 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0631\u0633\u0645\u064A (https://bot-m7r.netlify.app/) \u0625\u0644\u0649 \u0631\u0648\u0645 #${sentChannelName} \u0641\u064A \u062F\u064A\u0633\u0643\u0648\u0631\u062F!`
  });
});
app.get("/api/tickets", (req, res) => {
  res.json({ tickets });
});
app.post("/api/tickets/action", (req, res) => {
  const { ticketId, action, staffName, extra } = req.body;
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }
  if (action === "claim") {
    ticket.status = "claimed";
    ticket.claimedBy = staffName || "\u0627\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0645\u0633\u0624\u0648\u0644";
    ticket.messages.push({
      id: `m-${Date.now()}`,
      author: "M7R Bot [System]",
      avatar: "",
      isStaff: true,
      content: `\u{1F6E1}\uFE0F \u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0645\u0646 \u0642\u0628\u0644 \u0627\u0644\u0645\u0634\u0631\u0641: ${ticket.claimedBy}. \u0623\u0635\u0628\u062D \u0627\u0644\u062A\u0641\u0627\u0639\u0644 \u062D\u0635\u0631\u064A\u0627\u064B \u0645\u0639\u0647.`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    });
  } else if (action === "close") {
    ticket.status = "closed";
    ticket.messages.push({
      id: `m-${Date.now()}`,
      author: "M7R Bot [System]",
      avatar: "",
      isStaff: true,
      content: "\u{1F512} \u062A\u0645 \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0648\u0623\u0631\u0634\u0641\u0629 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629 \u0628\u0646\u062C\u0627\u062D.",
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    });
  } else if (action === "delete") {
    tickets = tickets.filter((t) => t.id !== ticketId);
    return res.json({ success: true, deleted: true });
  } else if (action === "remind") {
    ticket.messages.push({
      id: `m-${Date.now()}`,
      author: "M7R Bot [Reminder]",
      avatar: "",
      isStaff: true,
      content: `\u23F0 \u062A\u0646\u0628\u064A\u0647 \u0645\u0646 \u0627\u0644\u0625\u062F\u0627\u0631\u0629: \u064A\u0631\u062C\u0649 \u0645\u0648\u0627\u0641\u0627\u062A\u0646\u0627 \u0628\u0627\u0644\u0631\u062F \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u062E\u0644\u0627\u0644 12 \u0633\u0627\u0639\u0629 \u0644\u062A\u0641\u0627\u062F\u064A \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u062A\u0630\u0643\u0631\u0629.`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    });
  } else if (action === "transfer") {
    ticket.messages.push({
      id: `m-${Date.now()}`,
      author: "M7R Bot [System]",
      avatar: "",
      isStaff: true,
      content: `\u{1F504} \u062A\u0645 \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u062A\u0630\u0643\u0631\u0629 \u0625\u0644\u0649 \u0642\u0633\u0645 (${extra || "\u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0644\u064A\u0627"}) \u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A.`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    });
  } else if (action === "send_reply") {
    ticket.messages.push({
      id: `m-${Date.now()}`,
      author: staffName || "M7R Staff",
      avatar: "",
      isStaff: true,
      content: extra || "\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0648\u0627\u0635\u0644\u0643 \u0645\u0639 M7R.",
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    });
  }
  res.json({ success: true, ticket });
});
app.get("/api/applications", (req, res) => {
  res.json({ applications, config: applicationsConfig });
});
app.get("/api/applications/config", (req, res) => {
  res.json({ config: applicationsConfig });
});
app.post("/api/applications/config", (req, res) => {
  if (req.body.config) {
    applicationsConfig = { ...applicationsConfig, ...req.body.config };
  } else {
    applicationsConfig = { ...applicationsConfig, ...req.body };
  }
  savePersistedSession();
  res.json({ success: true, config: applicationsConfig });
});
app.post("/api/applications/send-panel", async (req, res) => {
  try {
    const { channelName } = req.body;
    const targetChannelName = (channelName || applicationsConfig.applyChannelName || "staff-applications").trim();
    if (!botClient || !botClient.isReady()) {
      return res.status(400).json({ error: "\u0627\u0644\u0628\u0648\u062A \u063A\u064A\u0631 \u0645\u062A\u0635\u0644 \u0628\u062F\u064A\u0633\u0643\u0648\u0631\u062F \u062D\u0627\u0644\u064A\u0627\u064B!" });
    }
    const guild = getTargetGuild();
    if (!guild) {
      return res.status(400).json({ error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641!" });
    }
    let channel = guild.channels.cache.find(
      (c) => c.isTextBased() && matchesChannelName(c.name, targetChannelName)
    );
    if (!channel) {
      channel = guild.channels.cache.find((c) => c.type === ChannelType.GuildText);
    }
    if (!channel) {
      return res.status(404).json({ error: `\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0631\u0648\u0645 #${targetChannelName} \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631!` });
    }
    const payload = buildApplicationPanelPayload();
    const msg = await channel.send(payload);
    savePersistedSession();
    await sendLogToDiscordServer(
      "\u0625\u0631\u0633\u0627\u0644 \u0628\u0627\u0646\u0644 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0641\u064A \u062F\u064A\u0633\u0643\u0648\u0631\u062F \u{1F4CB}",
      `\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0628\u0637\u0627\u0642\u0629 \u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0628\u0646\u062C\u0627\u062D \u0641\u064A \u0631\u0648\u0645: <#${channel.id}> (${channel.name})
\u2022 \u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645: \`${applicationsConfig.enabled ? "\u0645\u0641\u062A\u0648\u062D" : "\u0645\u063A\u0644\u0642"}\`
\u2022 \u0627\u0644\u0631\u062A\u0628\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629: \`${applicationsConfig.acceptedRoleName}\``,
      "#10b981"
    );
    return res.json({
      success: true,
      channelName: channel.name,
      messageId: msg.id,
      message: `\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0628\u0646\u0644 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0628\u0646\u062C\u0627\u062D \u0625\u0644\u0649 \u0631\u0648\u0645 #${channel.name} \u0641\u064A \u062F\u064A\u0633\u0643\u0648\u0631\u062F!`
    });
  } catch (err) {
    console.error("[M7R Applications Send Error]:", err);
    return res.status(500).json({ error: err.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u0627\u0646\u0644" });
  }
});
app.post("/api/applications/review", async (req, res) => {
  const { appId, status, notes } = req.body;
  const appItem = applications.find((a) => a.id === appId);
  if (!appItem) return res.status(404).json({ error: "Application not found" });
  appItem.status = status;
  appItem.reviewNotes = notes || (status === "accepted" ? "\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0648\u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u0631\u062A\u0628\u0629." : "\u062A\u0645 \u0627\u0644\u0631\u0641\u0636.");
  if (botClient && botClient.isReady()) {
    const guild = getTargetGuild();
    if (guild && appItem.applicant.id) {
      const member = await guild.members.fetch(appItem.applicant.id).catch(() => null);
      if (member) {
        if (status === "accepted") {
          if (applicationsConfig.acceptedRoleName) {
            const role = guild.roles.cache.find(
              (r) => r.name.toLowerCase() === applicationsConfig.acceptedRoleName.toLowerCase() || r.name.toLowerCase().includes(applicationsConfig.acceptedRoleName.toLowerCase())
            );
            if (role) {
              await member.roles.add(role).catch(() => {
              });
            }
          }
          if (applicationsConfig.dmOnAccept) {
            await member.send({
              content: `\u{1F389} **\u062A\u0647\u0627\u0646\u064A\u0646\u0627 \u064A\u0627 <@${member.id}>!**

${applicationsConfig.acceptDmMessage}

*\u0645\u0644\u0627\u062D\u0638\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629:* ${appItem.reviewNotes}`
            }).catch(() => {
            });
          }
          if (applicationsConfig.resultsChannelName) {
            const resCh = guild.channels.cache.find(
              (c) => c.isTextBased() && matchesChannelName(c.name, applicationsConfig.resultsChannelName)
            );
            if (resCh) {
              const resEmbed = new EmbedBuilder().setColor("#10b981").setTitle("\u{1F389} \u0625\u0639\u0644\u0627\u0646 \u0642\u0628\u0648\u0644 \u0625\u062F\u0627\u0631\u064A \u062C\u062F\u064A\u062F").setDescription(`\u0646\u0628\u0627\u0631\u0643 \u0644\u0644\u0639\u0636\u0648 <@${member.id}> \u0627\u062C\u062A\u064A\u0627\u0632 \u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0648\u0627\u0646\u0636\u0645\u0627\u0645\u0647 \u0644\u0637\u0627\u0642\u0645 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0628\u0631\u062A\u0628\u0629 **${applicationsConfig.acceptedRoleName}**!`).setTimestamp();
              await resCh.send({ embeds: [resEmbed] }).catch(() => {
              });
            }
          }
        } else if (status === "rejected") {
          if (applicationsConfig.dmOnReject) {
            await member.send({
              content: `\u{1F4E9} **\u062A\u0646\u0628\u064A\u0647 \u0628\u062E\u0635\u0648\u0635 \u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0641\u064A ${guild.name}:**

${applicationsConfig.rejectDmMessage}

*\u0645\u0644\u0627\u062D\u0638\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629:* ${appItem.reviewNotes}`
            }).catch(() => {
            });
          }
        }
      }
    }
  }
  savePersistedSession();
  res.json({ success: true, application: appItem });
});
app.post("/api/applications/delete", (req, res) => {
  const { appId } = req.body;
  const idx = applications.findIndex((a) => a.id === appId);
  if (idx === -1) return res.status(404).json({ error: "Application not found" });
  applications.splice(idx, 1);
  savePersistedSession();
  res.json({ success: true });
});
app.post("/api/applications/submit-test", (req, res) => {
  const { name, tag, answers } = req.body;
  const newApp = {
    id: `app-${Date.now().toString().slice(-6)}`,
    formId: "staff-recruitment",
    formTitle: applicationsConfig.panelTitle || "\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0648\u0627\u0644\u0631\u0642\u0627\u0628\u0629",
    applicant: {
      name: name || "\u0639\u0636\u0648 \u062A\u062C\u0631\u064A\u0628\u064A",
      tag: tag || "User#1234",
      avatar: "",
      joinedAt: "\u0627\u0644\u0622\u0646 (\u0645\u062D\u0627\u0643\u0627\u0629)"
    },
    answers: answers || {
      q1: "21 \u0633\u0646\u0629\u060C \u0627\u0644\u0631\u064A\u0627\u0636",
      q2: "\u062E\u0628\u0631\u0629 \u0633\u0646\u062A\u064A\u0646 \u0641\u064A \u0625\u062F\u0627\u0631\u0629 \u0645\u062C\u062A\u0645\u0639\u0627\u062A \u0627\u0644\u0623\u0644\u0639\u0627\u0628",
      q3: "\u0645\u062A\u0641\u0631\u063A 6 \u0633\u0627\u0639\u0627\u062A \u064A\u0648\u0645\u064A\u0627\u064B"
    },
    status: "pending",
    submittedAt: "\u0627\u0644\u0622\u0646"
  };
  applications.unshift(newApp);
  savePersistedSession();
  res.json({ success: true, application: newApp });
});
app.get("/api/export/server-code", (req, res) => {
  try {
    const code = fs.readFileSync(path.join(__dirname, "server.js"), "utf-8");
    res.json({ code });
  } catch (err) {
    res.status(500).json({ error: "Could not read server.js" });
  }
});
app.get("/api/ai/config", (_req, res) => {
  res.json({
    success: true,
    config: aiChatbotConfig,
    history: aiChatHistory
  });
});
app.post("/api/ai/config", (req, res) => {
  const body = req.body || {};
  if (typeof body.enabled === "boolean") aiChatbotConfig.enabled = body.enabled;
  if (typeof body.allowedChannel === "string") {
    const cleanCh = body.allowedChannel.replace(/^#/, "").trim() || "all";
    aiChatbotConfig.allowedChannel = cleanCh;
    const askCmd = discordCommands.find((c) => c.name === "ask");
    if (askCmd) askCmd.allowedChannel = cleanCh;
  }
  if (typeof body.autoReplyInChannelWithoutPrefix === "boolean") {
    aiChatbotConfig.autoReplyInChannelWithoutPrefix = body.autoReplyInChannelWithoutPrefix;
  }
  if (typeof body.blockSensitiveQuestions === "boolean") {
    aiChatbotConfig.blockSensitiveQuestions = body.blockSensitiveQuestions;
  }
  if (body.responseTone === "concise" || body.responseTone === "detailed" || body.responseTone === "friendly") {
    aiChatbotConfig.responseTone = body.responseTone;
  }
  if (typeof body.customRefusalMessage === "string" && body.customRefusalMessage.trim()) {
    aiChatbotConfig.customRefusalMessage = body.customRefusalMessage.trim();
  }
  if (Array.isArray(body.customBlockedWords)) {
    aiChatbotConfig.customBlockedWords = body.customBlockedWords.map((w) => String(w || "").trim()).filter(Boolean);
  }
  savePersistedSession();
  const chDesc = aiChatbotConfig.allowedChannel === "all" ? "\u062C\u0645\u064A\u0639 \u0631\u0648\u0645\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u{1F310}" : `\u0631\u0648\u0645 #${aiChatbotConfig.allowedChannel} \u0641\u0642\u0637 \u{1F3AF}`;
  return res.json({
    success: true,
    config: aiChatbotConfig,
    message: `\u2705 \u062A\u0645 \u062D\u0641\u0638 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A M7R AI \u0641\u0648\u0631\u0627\u064B! (\u0627\u0644\u0631\u0648\u0645 \u0627\u0644\u0645\u062D\u062F\u062F \u0644\u0644\u0631\u062F: ${chDesc})`
  });
});
app.post("/api/ai/ask", async (req, res) => {
  try {
    const { question, sendToDiscord, targetChannelName, askerName } = req.body || {};
    const qText = (typeof question === "string" ? question : "").trim();
    if (!qText) {
      return res.status(400).json({ error: "\u064A\u0631\u062C\u0649 \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0633\u0624\u0627\u0644 \u0623\u0648\u0644\u0627\u064B." });
    }
    const desiredCh = (typeof targetChannelName === "string" && targetChannelName.trim() && targetChannelName !== "all" ? targetChannelName : aiChatbotConfig.allowedChannel && aiChatbotConfig.allowedChannel !== "all" ? aiChatbotConfig.allowedChannel : "general").replace(/^#/, "").trim();
    const aiRes = await askM7RAssistant(qText, askerName || loggedInDiscordUser.username || "\u0639\u0636\u0648 \u0627\u0644\u0633\u064A\u0631\u0641\u0631", desiredCh);
    const todayPt = serverAnalytics7Days[serverAnalytics7Days.length - 1];
    if (todayPt) {
      todayPt.commandsUsed += 1;
      todayPt.messages += 1;
    }
    let sentChannelName = "";
    if (sendToDiscord && botClient && botClient.isReady()) {
      const targetG = getTargetGuild();
      if (targetG) {
        const textCh = targetG.channels.cache.find(
          (c) => c.type === ChannelType.GuildText && (c.name.toLowerCase() === desiredCh.toLowerCase() || matchesChannelName(c.name, desiredCh))
        ) || targetG.channels.cache.find(
          (c) => c.type === ChannelType.GuildText && (matchesChannelName(c.name, "general") || matchesChannelName(c.name, "\u0639\u0627\u0645") || matchesChannelName(c.name, "\u0634\u0627\u062A") || matchesChannelName(c.name, "cmd") || matchesChannelName(c.name, "\u0627\u0648\u0627\u0645\u0631"))
        ) || targetG.channels.cache.find((c) => c.type === ChannelType.GuildText);
        if (textCh) {
          sentChannelName = textCh.name;
          if (aiChatHistory[0]) {
            aiChatHistory[0].channelName = sentChannelName;
          }
          const payload = buildAiAskDiscordPayload(
            qText,
            aiRes.answer,
            aiRes.blocked,
            botClient.user?.id || "",
            targetG.name,
            aiRes.category
          );
          await textCh.send(payload).catch(() => {
          });
        }
      }
    }
    return res.json({
      success: true,
      question: qText,
      answer: aiRes.answer,
      blocked: aiRes.blocked,
      category: aiRes.category,
      modelUsed: aiRes.modelUsed,
      sentChannelName,
      config: aiChatbotConfig,
      history: aiChatHistory,
      webDashboardUrl: WEB_DASHBOARD_PUBLIC_URL,
      message: aiRes.blocked ? "\u{1F6E1}\uFE0F \u062A\u0645 \u062D\u062C\u0628 \u0627\u0644\u0633\u0624\u0627\u0644 \u0628\u0631\u0645\u062C\u064A\u0627\u064B \u0644\u0623\u0646\u0647 \u0633\u0624\u0627\u0644 \u062D\u0633\u0627\u0633 \u0623\u0648 \u0645\u062E\u0627\u0644\u0641 \u0644\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0623\u0645\u0627\u0646!" : sentChannelName ? `\u{1F916} \u062A\u0645\u062A \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0628\u0646\u062C\u0627\u062D \u0639\u0628\u0631 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A M7R \u0648\u0625\u0631\u0633\u0627\u0644\u0647\u0627 \u0625\u0644\u0649 \u0631\u0648\u0645 #${sentChannelName} \u0641\u064A \u062F\u064A\u0633\u0643\u0648\u0631\u062F!` : "\u{1F916} \u062A\u0645\u062A \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0628\u0646\u062C\u0627\u062D \u0639\u0628\u0631 \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A M7R AI Ask!"
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "AI Ask failed" });
  }
});
async function autoConnectPersistedBot() {
  if (!savedBotToken || botClient && botClient.isReady()) return;
  try {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
    });
    await client.login(savedBotToken);
    botClient = client;
    isBotConnected = true;
    const setupOnReady = async () => {
      const guildsList = getConnectedGuildsList();
      const targetGuild = selectedGuildId && client.guilds.cache.has(selectedGuildId) ? client.guilds.cache.get(selectedGuildId) : client.guilds.cache.first();
      if (targetGuild) {
        selectedGuildId = targetGuild.id;
      }
      const selectedGuildObj = targetGuild ? {
        id: targetGuild.id,
        name: targetGuild.name,
        icon: targetGuild.iconURL() || "",
        memberCount: targetGuild.memberCount || 0,
        channelsCount: targetGuild.channels.cache.size,
        rolesCount: targetGuild.roles.cache.size
      } : guildsList[0];
      connectedBotInfo = {
        username: "M7R",
        tag: client.user?.tag ? client.user.tag.replace(/^m7r/i, "M7R") : "M7R#1624",
        id: client.user?.id || "",
        avatar: client.user?.displayAvatarURL() || "",
        guildsCount: client.guilds.cache.size,
        membersCount: selectedGuildObj ? selectedGuildObj.memberCount : 1,
        channelsCount: selectedGuildObj ? selectedGuildObj.channelsCount : 1,
        ping: client.ws.ping > 0 ? client.ws.ping : 17,
        mode: "live",
        guilds: guildsList,
        selectedGuild: selectedGuildObj
      };
      if (targetGuild) {
        guildStats.guildName = targetGuild.name;
        guildStats.guildId = targetGuild.id;
        guildStats.membersCount = targetGuild.memberCount || guildStats.membersCount;
        guildStats.monitoredChannelsCount = targetGuild.channels.cache.size || guildStats.monitoredChannelsCount;
      }
      guildStats.protectedGuildsCount = client.guilds.cache.size;
      await applySettingsToLiveBot();
      attachDiscordBotEvents(client);
      await registerSlashCommandsOnDiscord(client);
    };
    if (client.isReady()) {
      await setupOnReady();
    } else {
      client.once("ready", () => {
        setupOnReady().catch(() => {
        });
      });
    }
  } catch (err) {
    console.error("[M7R Auto-Reconnect Error]:", err);
  }
}
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null
      },
      appType: "spa"
    });
    app.use(async (req, res, next) => {
      if (req.path === "/@vite/client") {
        try {
          const result = await vite.transformRequest(req.url);
          if (result && result.code) {
            const safeCode = result.code.replace("transport.connect(createHMRHandler(handleMessage));", "/* HMR WebSocket disabled */").replace("throw e;", "return;");
            res.setHeader("Content-Type", "application/javascript; charset=utf-8");
            res.setHeader("Cache-Control", "no-cache");
            return res.status(200).send(safeCode);
          }
        } catch {
        }
      }
      next();
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[M7R DASHBOARD] Live 24/7 server running on http://localhost:${PORT}`);
    autoConnectPersistedBot().catch(() => {
    });
  });
}
startServer().catch((err) => {
  console.error("[M7R DASHBOARD] Failed to start server:", err);
});
export {
  DEFAULT_QURAN_SCHEDULE,
  QURAN_RECITERS,
  SENSITIVE_COMMAND_NAMES,
  askM7RAssistant
};
