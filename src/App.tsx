import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { BasicBotSettingsTab } from './components/BasicBotSettingsTab';
import { CommandsManagerTab } from './components/CommandsManagerTab';
import { WelcomeTab } from './components/WelcomeTab';
import { AntiNukeTab } from './components/AntiNukeTab';
import { TicketsTab } from './components/TicketsTab';
import { ApplicationsTab } from './components/ApplicationsTab';
import { ExtraSystemsTab } from './components/ExtraSystemsTab';
import { AdvancedSuiteTab } from './components/AdvancedSuiteTab';
import { ReplitHubTab } from './components/ReplitHubTab';
import { AzkarTab } from './components/AzkarTab';
import { AiChatbotTab } from './components/AiChatbotTab';
import { TokenAuthGate, ConnectedBotData } from './components/TokenAuthGate';
import { invalidateChannelsCache } from './components/ChannelSelector';
import { Save, RotateCcw, CheckCircle2, AlertCircle, ShieldCheck, Bell, Crown, Package, Download, ExternalLink, X } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import {
  AntiNukeConfig,
  AntiSpamConfig,
  AntiInviteConfig,
  Ticket,
  ApplicationSubmission,
  ApplicationsConfig,
  AutoResponse,
  Voice247Config,
  ThreatLog,
  BotBasicSettings,
  TicketPanelConfig,
  DiscordCommandConfig,
  AzkarConfig,
  HoneypotTrapConfig,
  WelcomeConfig,
  ConnectedGuildItem,
  AccessRoleMode,
  GuildJoinNotification
} from './types';

import { sound } from './utils/sound';

const SENSITIVE_COMMANDS_SET = new Set(['ban', 'unban', 'kick', 'antinuke', 'trap', 'clearwarnings']);

export default function App() {
  const [showTokenGate, setShowTokenGate] = useState<boolean>(() => {
    return localStorage.getItem('m7r_logged_in') !== 'true';
  });
  const [connectedBot, setConnectedBot] = useState<ConnectedBotData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { lang, setLang, toggleLang, isAr, dir, t } = useLanguage();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [panicMode, setPanicMode] = useState(false);
  const [attacksThwarted, setAttacksThwarted] = useState(1280);

  // Access Mode ('server_admin' = Safe Server Control without sensitive commands | 'bot_owner' = Full Owner Control)
  const [accessMode, setAccessMode] = useState<AccessRoleMode>('server_admin');
  const [guildNotifications, setGuildNotifications] = useState<GuildJoinNotification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  // Unsaved Changes & Save Toast State
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveBannerMessage, setSaveBannerMessage] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('m7r_logged_in');
    setShowTokenGate(true);
    sound.playClick();
  };

  const handleMasterRefresh = async () => {
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/bot/refresh', { method: 'POST' });
      const data = await res.json();
      setSaveBannerMessage(data?.message || '🎉 تم تنفيذ أمر (تحديث)! تم تحديث ومزامنة جميع أنظمة وأوامر بوت M7R وجلب كل جديد.');
      setTimeout(() => setSaveBannerMessage(null), 6000);
      fetch('/api/status')
        .then((r) => r.json())
        .then((statusData) => {
          if (statusData?.botInfo) setConnectedBot(statusData.botInfo);
          if (statusData?.discordCommands) setDiscordCommandsState(statusData.discordCommands);
        })
        .catch(() => {});
    } catch {
      setSaveBannerMessage('🔄 تم التحديث بنجاح!');
      setTimeout(() => setSaveBannerMessage(null), 4000);
    }
  };

  // Handle Discord OAuth2 Redirect (?discord_auth=success or ?code=...) & Popup postMessage -> Auto-enter Web Dashboard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isOAuthReturn =
      params.get('discord_auth') === 'success' ||
      params.has('code') ||
      params.has('guild_id');

    if (isOAuthReturn) {
      const guildIdParam = params.get('guild_id') || undefined;
      window.history.replaceState({}, document.title, window.location.pathname || '/');
      setShowTokenGate(false);
      setActiveTab('overview');
      setAccessMode('server_admin');
      sound.playShieldActivate();
      setSaveBannerMessage(
        '🎉 تم تسجيل الدخول عبر ديسكورد بنجاح وتحويلك تلقائياً إلى لوحة التحكم الرئيسية!'
      );
      setTimeout(() => setSaveBannerMessage(null), 6000);

      fetch('/api/auth/discord/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessMode: 'server_admin',
          guildId: guildIdParam
        })
      }).catch(() => {});
    }

    const handleOAuthPopupMsg = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setShowTokenGate(false);
        setActiveTab('overview');
        setAccessMode('server_admin');
        sound.playShieldActivate();
        setSaveBannerMessage(
          '🎉 تم تسجيل الدخول عبر ديسكورد بنجاح وتحويلك تلقائياً إلى لوحة التحكم الرئيسية!'
        );
        setTimeout(() => setSaveBannerMessage(null), 6000);
      }
    };

    window.addEventListener('message', handleOAuthPopupMsg);
    return () => window.removeEventListener('message', handleOAuthPopupMsg);
  }, []);

  // Check if bot is already connected on server start + Poll every 8s for new server joins & 24/7 heartbeat
  useEffect(() => {
    let prevNotifTopId: string | null = null;

    const syncStatus = (isInitial = false) => {
      fetch('/api/status')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.isBotConnected && data.botInfo) {
            setConnectedBot(data.botInfo);
            if (isInitial) {
              setShowTokenGate(false);
            }
          }
          if (isInitial && data?.welcomeConfig) {
            setWelcomeConfigState(data.welcomeConfig);
          }
          if (isInitial && data?.discordCommands) {
            setDiscordCommandsState(data.discordCommands);
          }
          if (isInitial && data?.accessMode) {
            setAccessMode(data.accessMode);
          }
          if (Array.isArray(data?.guildJoinNotifications)) {
            const topId = data.guildJoinNotifications[0]?.id || null;
            if (!isInitial && topId && prevNotifTopId && topId !== prevNotifTopId) {
              const latest = data.guildJoinNotifications[0];
              sound.playShieldActivate();
              setSaveBannerMessage(
                `🎉 إشعار جديد: دخل البوت إلى سيرفر (${latest.guildName}) وتم تفعيل صلاحية التحكم في السيرفر تلقائياً!`
              );
              setTimeout(() => setSaveBannerMessage(null), 6000);
            }
            prevNotifTopId = topId;
            setGuildNotifications(data.guildJoinNotifications);
            setUnreadNotificationsCount(
              typeof data.unreadNotificationsCount === 'number'
                ? data.unreadNotificationsCount
                : data.guildJoinNotifications.filter((n: GuildJoinNotification) => !n.read).length
            );
          }
        })
        .catch(() => {});
    };

    syncStatus(true);
    const interval = setInterval(() => syncStatus(false), 8000);
    return () => clearInterval(interval);
  }, []);

  // Basic Bot Settings
  const [basicSettings, setBasicSettingsState] = useState<BotBasicSettings>({
    botUsername: 'M7R',
    presenceStatus: 'dnd',
    activityType: 'PLAYING',
    activityText: 'M7R Security 🛡️',
    streamingUrl: 'https://twitch.tv/m7r',
    prefix: '!',
    logChannelName: 'log-server',
    commandsChannelName: 'cmd',
    keepAlive247: true,
    heartbeatIntervalSec: 25
  });

  // Welcome System Config (Full Welcome Studio)
  const [welcomeConfig, setWelcomeConfigState] = useState<WelcomeConfig>({
    enabled: true,
    channelName: 'welcome',
    messageMode: 'embed_and_text',
    welcomeMessage: 'أهلاً بك يا {user} في سيرفر {server} الرسمي 🛡️! أنت العضو رقم #{count}',
    embedTitle: '👋 مرحباً بك في سيرفر {server}!',
    embedDescription:
      'نورت السيرفر يا {user}!\nيرجى الاطلاع على القوانين واختيار رتبك، ونتمنى لك أوقاتاً ممتعة معنا في عائلة M7R 🛡️',
    embedColor: '#e11d48',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    showAvatarThumbnail: true,
    showMemberCount: true,
    showAccountAge: true,
    footerText: 'M7R Security • نظام الترحيب والحماية المتكامل',
    autoRoleEnabled: true,
    autoRoleName: 'Member',
    botAutoRoleName: 'Bots',
    sendDm: true,
    dmMessage: 'مرحباً بك يا {username} في سيرفر {server}! في حال احتجت أي مساعدة يمكنك فتح تذكرة دعم فني في أي وقت.',
    leaveEnabled: true,
    leaveChannelName: 'welcome',
    leaveMessage: 'غادرنا العضو {username}، نتمنى له التوفيق 👋'
  });

  // Ticket Panel Config
  const [ticketPanel, setTicketPanelState] = useState<TicketPanelConfig>({
    storeName: 'M7R Official Store',
    embedTitle: 'M7R | مركز التذاكر والدعم الفني والمبيعات 🛒',
    embedDescription:
      'أهلاً بكم في مركز التذاكر الرسمي. يرجى الضغط على الزر المناسب لطلبك أدناه ليتم فتح تذكرة خاصة بك مع فريق الإدارة المختص:',
    embedColor: '#e11d48',
    welcomeMessage:
      'مرحباً بك في تذكرتك الخاصة! يرجى كتابة تفاصيل طلبك والانتظار حتى يقوم أحد المشرفين باستلام التذكرة.',
    targetChannelName: 'tickets',
    supportRoleName: 'Support',
    buttons: [
      {
        id: 'btn_store',
        label: 'شراء منتج',
        emoji: '🛒',
        style: 'Primary',
        categoryDescription: 'لشراء حسابات، نيترو، كروت شحن، أو رتب خاصة.',
        enabled: true
      },
      {
        id: 'btn_support',
        label: 'الدعم الفني',
        emoji: '🛠️',
        style: 'Secondary',
        categoryDescription: 'لحل المشكلات التقنية واستفسارات السيرفر.',
        enabled: true
      },
      {
        id: 'btn_complaints',
        label: 'الشكاوى والمقترحات',
        emoji: '💼',
        style: 'Secondary',
        categoryDescription: 'للتواصل مع الإدارة العليا وتقديم البلاغات.',
        enabled: true
      },
      {
        id: 'btn_partnerships',
        label: 'الشراكات والإعلانات',
        emoji: '🤝',
        style: 'Success',
        categoryDescription: 'لعقد صفقات التبادل الإعلاني والتعاون المشترك.',
        enabled: true
      }
    ]
  });

  // Full Essential Moderation, Voice, Channel, Role, Welcome, Ticket, Islamic & Security Commands
  const [discordCommands, setDiscordCommandsState] = useState<DiscordCommandConfig[]>([
    // 1. MODERATION & PUNISHMENTS
    {
      id: 'cmd-mute',
      name: 'mute',
      aliases: ['ميوت', 'كتم', 'اسكات', 'تايم', 'timeout'],
      description: 'كتم عضو مؤقتاً (Timeout) ومنعه من الكتابة والتحدث (مثال: !mute @user 15 سبب)',
      category: 'moderation',
      enabled: true,
      cooldownSec: 3,
      customReply: '🔇 **تم إعطاء ميوت (كتم مؤقت) للعضو بنجاح بواسطة إدارة M7R!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-unmute',
      name: 'unmute',
      aliases: ['فك-الميوت', 'فك-ميوت', 'فك-كتم', 'تكلم', 'فك', 'untimeout'],
      description: 'فك الميوت (الكتم المؤقت) عن عضو في السيرفر فوراً (مثال: !unmute @user)',
      category: 'moderation',
      enabled: true,
      cooldownSec: 3,
      customReply: '🔊 **تم فك الميوت عن العضو بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-ban',
      name: 'ban',
      aliases: ['باند', 'حظر', 'طير'],
      description: 'حظر عضو مخالف من السيرفر نهائياً مع توثيق السبب (مثال: !ban @user سبب)',
      category: 'moderation',
      enabled: true,
      cooldownSec: 5,
      customReply: '🔨 **تم حظر العضو المخالف (Ban) من السيرفر بواسطة M7R!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-unban',
      name: 'unban',
      aliases: ['فك-الباند', 'فك-حظر', 'عفو'],
      description: 'فك الحظر (Unban) عن عضو باستخدام الآيدي (مثال: !unban 10987654321)',
      category: 'moderation',
      enabled: true,
      cooldownSec: 5,
      customReply: '✅ **تم فك الحظر (Unban) عن العضو بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-kick',
      name: 'kick',
      aliases: ['طرد', 'كيك'],
      description: 'طرد عضو من السيرفر مع إمكانية كتابة السبب (مثال: !kick @user سبب)',
      category: 'moderation',
      enabled: true,
      cooldownSec: 5,
      customReply: '👢 **تم طرد العضو من السيرفر بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-warn',
      name: 'warn',
      aliases: ['تحذير', 'انذار'],
      description: 'توجيه تحذير إداري رسمي لعضو وحفظه في سجل التحذيرات (مثال: !warn @user السبب)',
      category: 'moderation',
      enabled: true,
      cooldownSec: 3,
      customReply: '⚠️ **تم توجيه تحذير رسمي للعضو وتوثيقه في سجل الرقابة!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-warnings',
      name: 'warnings',
      aliases: ['تحذيرات', 'انذارات', 'سجل-التحذيرات'],
      description: 'عرض قائمة وعدد التحذيرات المسجلة على عضو (مثال: !warnings @user)',
      category: 'moderation',
      enabled: true,
      cooldownSec: 3,
      customReply: '📋 **سجل التحذيرات الإدارية للعضو:**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-clearwarnings',
      name: 'clearwarnings',
      aliases: ['مسح-التحذيرات', 'ازالة-التحذيرات', 'تصفير-التحذيرات'],
      description: 'مسح وتصفير جميع التحذيرات المسجلة على عضو (مثال: !clearwarnings @user)',
      category: 'moderation',
      enabled: true,
      cooldownSec: 5,
      customReply: '🧹 **تم مسح جميع التحذيرات المسجلة على العضو بنجاح!**',
      allowedChannel: 'all'
    },

    // 2. CHANNELS & ROLES MANAGEMENT
    {
      id: 'cmd-clear',
      name: 'clear',
      aliases: ['مسح', 'تنظيف', 'purge'],
      description: 'مسح عدد محدد من الرسائل في الروم الحالي (مثال: !clear 50)',
      category: 'channels',
      enabled: true,
      cooldownSec: 3,
      customReply: '🧹 **تم تنظيف الشات ومسح الرسائل بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-lock',
      name: 'lock',
      aliases: ['قفل', 'تقفيل'],
      description: 'قفل الروم الحالي ومنع الأعضاء من إرسال الرسائل',
      category: 'channels',
      enabled: true,
      cooldownSec: 3,
      customReply: '🔒 **تم قفل الروم بنجاح بواسطة حماية M7R!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-unlock',
      name: 'unlock',
      aliases: ['فتح', 'فتح-الروم'],
      description: 'إعادة فتح الروم الحالي والسماح للأعضاء بالكتابة',
      category: 'channels',
      enabled: true,
      cooldownSec: 3,
      customReply: '🔓 **تم فتح الروم بنجاح بواسطة M7R!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-hide',
      name: 'hide',
      aliases: ['اخفاء', 'خفي'],
      description: 'إخفاء الروم الحالي عن جميع الأعضاء فوراً',
      category: 'channels',
      enabled: true,
      cooldownSec: 3,
      customReply: '👁️‍🗨️ **تم إخفاء الروم عن الأعضاء بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-show',
      name: 'show',
      aliases: ['اظهار', 'ظهر'],
      description: 'إظهار الروم الحالي للأعضاء من جديد',
      category: 'channels',
      enabled: true,
      cooldownSec: 3,
      customReply: '👁️ **تم إظهار الروم للجميع بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-slowmode',
      name: 'slowmode',
      aliases: ['بطء', 'تهدئة', 'سلو'],
      description: 'تحديد مهلة إرسال الرسائل في الروم بالثواني (مثال: !slowmode 5)',
      category: 'channels',
      enabled: true,
      cooldownSec: 3,
      customReply: '⏱️ **تم تحديث وضع التهدئة (Slowmode) للروم بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-role',
      name: 'role',
      aliases: ['رتبة', 'رول', 'اعطاء-رتبة'],
      description: 'إعطاء أو سحب رتبة من عضو (مثال: !role @user VIP)',
      category: 'channels',
      enabled: true,
      cooldownSec: 3,
      customReply: '🎖️ **تم تحديث رتب العضو بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-nick',
      name: 'nick',
      aliases: ['لقب', 'تغيير-لقب', 'اسم'],
      description: 'تغيير لقب عضو داخل السيرفر أو إعادته للاسم الأصلي (مثال: !nick @user البطل)',
      category: 'channels',
      enabled: true,
      cooldownSec: 3,
      customReply: '✏️ **تم تغيير لقب العضو في السيرفر بنجاح!**',
      allowedChannel: 'all'
    },

    // 3. VOICE MODERATION
    {
      id: 'cmd-vkick',
      name: 'vkick',
      aliases: ['طرد-صوتي', 'فصل', 'فصل-صوتي'],
      description: 'فصل عضو من الروم الصوتي فوراً (مثال: !vkick @user)',
      category: 'voice',
      enabled: true,
      cooldownSec: 3,
      customReply: '🔌 **تم فصل العضو من الروم الصوتي بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-vmute',
      name: 'vmute',
      aliases: ['ميوت-صوتي', 'كتم-صوتي'],
      description: 'كتم المايكروفون عن عضو متواجد في الروم الصوتي (مثال: !vmute @user)',
      category: 'voice',
      enabled: true,
      cooldownSec: 3,
      customReply: '🎙️ **تم كتم العضو صوتياً في الروم الصوتي!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-vunmute',
      name: 'vunmute',
      aliases: ['فك-ميوت-صوتي', 'فك-كتم-صوتي'],
      description: 'فك الكتم الصوتي عن عضو في الروم الصوتي (مثال: !vunmute @user)',
      category: 'voice',
      enabled: true,
      cooldownSec: 3,
      customReply: '🔊 **تم فك الكتم الصوتي عن العضو بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-move',
      name: 'move',
      aliases: ['سحب', 'نقل'],
      description: 'سحب عضو من روم صوتي آخر إلى الروم الصوتي الذي تتواجد فيه (مثال: !move @user)',
      category: 'voice',
      enabled: true,
      cooldownSec: 3,
      customReply: '🧲 **تم سحب العضو إلى رومك الصوتي بنجاح!**',
      allowedChannel: 'all'
    },

    // 4. WELCOME & GENERAL COMMANDS
    {
      id: 'cmd-welcome',
      name: 'welcome',
      aliases: ['ترحيب', 'تست-ترحيب'],
      description: 'إرسال بطاقة الترحيب المخصصة في الروم لتجربتها أو الترحيب بعضو (مثال: !welcome @user)',
      category: 'general',
      enabled: true,
      cooldownSec: 3,
      customReply: '👋 **تم إرسال بطاقة الترحيب الرسمية بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-setwelcome',
      name: 'setwelcome',
      aliases: ['تعيين-الترحيب', 'روم-الترحيب'],
      description: 'تعيين الروم الحالي كروم رسمي لاستقبال الأعضاء الجدد والترحيب بهم تلقائياً',
      category: 'general',
      enabled: true,
      cooldownSec: 5,
      customReply: '✅ **تم تعيين هذا الروم كروم رسمي للترحيب بالأعضاء الجدد!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-ping',
      name: 'ping',
      aliases: ['بنق', 'اتصال', 'بينج'],
      description: 'فحص سرعة اتصال البوت بالديسكورد (Latency)',
      category: 'general',
      enabled: true,
      cooldownSec: 3,
      customReply: '🏓 **M7R Security Pong!** سرعة الاستجابة ممتازة والنظام يعمل 24/7.',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-server',
      name: 'server',
      aliases: ['سيرفر', 'معلومات-السيرفر', 'احصائيات'],
      description: 'عرض إحصائيات ومعلومات السيرفر الحالية بالتفصيل',
      category: 'general',
      enabled: true,
      cooldownSec: 5,
      customReply: '📊 معلومات السيرفر الرسمية المحمية بواسطة M7R:',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-roles',
      name: 'roles',
      aliases: ['رتب', 'الرتب', 'قائمة-الرتب'],
      description: 'عرض قائمة جميع رتب السيرفر وعدد الأعضاء في كل رتبة',
      category: 'general',
      enabled: true,
      cooldownSec: 5,
      customReply: '🎖️ **قائمة رتب السيرفر الرسمية:**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-help',
      name: 'help',
      aliases: ['مساعدة', 'اوامر', 'commands'],
      description: 'عرض موسوعة جميع أوامر بوت M7R الأساسية والإدارية المفعلة',
      category: 'general',
      enabled: true,
      cooldownSec: 5,
      customReply: '📜 قائمة الأوامر الأساسية والإدارية المتاحة في بوت M7R:',
      allowedChannel: 'all'
    },

    // 5. TICKETS COMMANDS
    {
      id: 'cmd-panel',
      name: 'panel',
      aliases: ['تكت', 'بانل', 'تذاكر'],
      description: 'إرسال لوحة التذاكر المخصصة في الروم الحالي فوراً',
      category: 'tickets',
      enabled: true,
      cooldownSec: 5,
      customReply: '🎫 **تم إرسال لوحة التذاكر بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-claim',
      name: 'claim',
      aliases: ['استلام', 'تولي'],
      description: 'استلام التذكرة المفتوحة حالياً باسم المشرف',
      category: 'tickets',
      enabled: true,
      cooldownSec: 3,
      customReply: '✅ **تم استلام التذكرة بواسطة المشرف بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-close',
      name: 'close',
      aliases: ['اغلاق', 'قفل-تكت'],
      description: 'إغلاق التذكرة الحالية وأرشفتها في روم اللوق',
      category: 'tickets',
      enabled: true,
      cooldownSec: 5,
      customReply: '🔒 **تم إغلاق التذكرة وأرشفتها بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-come',
      name: 'come',
      aliases: ['نداء', 'تعال', 'استدعاء'],
      description: 'إرسال نداء تنبيهي لعضو في الخاص للحضور إلى التذكرة أو الروم (مثال: !come @user)',
      category: 'tickets',
      enabled: true,
      cooldownSec: 5,
      customReply: '📲 **تم إرسال نداء عاجل للعضو في الخاص للحضور إلى الروم!**',
      allowedChannel: 'all'
    },

    // 6. UTILITY & PROFILE COMMANDS
    {
      id: 'cmd-tax',
      name: 'tax',
      aliases: ['ضريبة', 'ضريبه', 'حساب-ضريبة'],
      description: 'حساب ضريبة البروبوت (ProBot Tax 5%) بدقة للمتاجر والوسطاء (مثال: !tax 100000)',
      category: 'utility',
      enabled: true,
      cooldownSec: 3,
      customReply: '💰 **حاسبة ضريبة المتجر (M7R Tax Calculator):**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-say',
      name: 'say',
      aliases: ['قول', 'تحدث', 'ارسل'],
      description: 'جعل البوت يرسل رسالة في الروم (مثال: !say مرحباً بكم)',
      category: 'utility',
      enabled: true,
      cooldownSec: 3,
      customReply: '📢 **رسالة من إدارة M7R:**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-embed',
      name: 'embed',
      aliases: ['ايمبد', 'اعلان', 'رسالة-رسمية'],
      description: 'جعل البوت يرسل إعلاناً رسمياً منسقاً داخل بطاقة Embed باسم السيرفر (مثال: !embed إعلان هام)',
      category: 'utility',
      enabled: true,
      cooldownSec: 5,
      customReply: '📢 **تم إرسال الإعلان الرسمي بنجاح!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-user',
      name: 'user',
      aliases: ['هوية', 'معلوماتي', 'بروفايل', 'يوزر', 'id'],
      description: 'عرض بطاقة معلومات العضو وتاريخ دخوله للسيرفر والديسكورد',
      category: 'utility',
      enabled: true,
      cooldownSec: 3,
      customReply: '🪪 **بطاقة الهوية الرقمية للعضو (M7R Profile):**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-avatar',
      name: 'avatar',
      aliases: ['افتار', 'صورة', 'افاتار'],
      description: 'عرض الصورة الرمزية للعضو بجودة عالية مع رابط التحميل',
      category: 'utility',
      enabled: true,
      cooldownSec: 3,
      customReply: '🖼️ **الصورة الرمزية للعضو:**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-banner',
      name: 'banner',
      aliases: ['بنر', 'بانر', 'خلفية'],
      description: 'عرض صورة البنر الشخصي للعضو أو السيرفر بجودة عالية',
      category: 'utility',
      enabled: true,
      cooldownSec: 3,
      customReply: '🎨 **بنر العضو الرسمي:**',
      allowedChannel: 'all'
    },

    // 7. ISLAMIC AZKAR & SECURITY COMMANDS
    {
      id: 'cmd-azkar',
      name: 'azkar',
      aliases: ['اذكار', 'ذكر', 'دعاء', 'قران'],
      description: 'عرض ذكر مبارك أو آية قرآنية مع فضلها وأزرار التسبيح التفاعلية',
      category: 'islamic',
      enabled: true,
      cooldownSec: 5,
      customReply: '🕌 **أذكار المسلم اليومية من M7R:**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-status',
      name: 'status',
      aliases: ['حالة', 'حمايه', 'درع'],
      description: 'عرض تقرير حالة أنظمة الحماية الفولاذية والمصيدة والترحيب في السيرفر',
      category: 'security',
      enabled: true,
      cooldownSec: 5,
      customReply: '🛡️ جميع دروع الحماية الفولاذية ومصيدة M7R تعمل بكفاءة 100%.',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-trap',
      name: 'trap',
      aliases: ['مصيدة', 'فخ', 'honeypot'],
      description: 'فحص حالة روم مصيدة السبام والهاكرز الفولاذية في السيرفر',
      category: 'security',
      enabled: true,
      cooldownSec: 5,
      customReply: '🪤 **مصيدة M7R الفولاذية نشطة وترصد أي تحركات مشبوهة!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-antinuke',
      name: 'antinuke',
      aliases: ['انتي-نوك', 'حماية-شاملة', 'shield'],
      description: 'فحص إعدادات درع Anti-Nuke ضد التصفير وحذف الرومات والرتب',
      category: 'security',
      enabled: true,
      cooldownSec: 5,
      customReply: '🛡️ **درع M7R Anti-Nuke الفولاذي في حالة تأهب قصوى!**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-dashboard',
      name: 'dashboard',
      aliases: ['دشبورد', 'داشبورد', 'ويب', 'لوحة-الويب', 'موقع'],
      description: 'إرسال رابط وبطاقة دشبورد الويب الرسمية للتحكم المباشر في السيرفر والأوامر والإحصائيات',
      category: 'general',
      enabled: true,
      cooldownSec: 3,
      customReply: '🌐 **دشبورد الويب الرسمي لبوت M7R Security 24/7:**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-giveaway',
      name: 'giveaway',
      aliases: ['قرعة', 'قرعه', 'سحب', 'فائز', 'روليت'],
      description: 'سحب فائز عشوائي من أعضاء السيرفر بشكل تفاعلي للفعاليات والهدايا (مثال: !قرعة نيترو)',
      category: 'utility',
      enabled: true,
      cooldownSec: 3,
      customReply: '🎁 **نتيجة السحب العشوائي (قرعة السيرفر):**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-poll',
      name: 'poll',
      aliases: ['تصويت', 'استفتاء', 'رايكم'],
      description: 'إنشاء تصويت احترافي في الشات مع إيموجي الموافقة والرفض تلقائياً (مثال: !تصويت هل نفتح فعالية اليوم؟)',
      category: 'utility',
      enabled: true,
      cooldownSec: 3,
      customReply: '📊 **تصويت رسمي لأعضاء السيرفر:**',
      allowedChannel: 'all'
    },
    {
      id: 'cmd-suggest',
      name: 'suggest',
      aliases: ['اقتراح', 'فكرة', 'مقترح'],
      description: 'إرسال اقتراح منسق لإدارة وأعضاء السيرفر مع التصويت عليه (مثال: !اقتراح إضافة روم ألعاب)',
      category: 'utility',
      enabled: true,
      cooldownSec: 3,
      customReply: '💡 **اقتراح جديد من أحد أعضاء السيرفر:**',
      allowedChannel: 'all'
    }
  ]);

  // Azkar System State
  const [azkarConfig, setAzkarConfigState] = useState<AzkarConfig>({
    enabled: true,
    channelName: 'اذكار',
    intervalMinutes: 30,
    embedColor: '#059669',
    showVirtue: true,
    items: [
      {
        id: 'az-1',
        category: 'quran',
        categoryLabel: 'آية قرآنية سكينة',
        arabicText: '﴿ الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾',
        virtue: 'سورة الرعد: آية 28 - طمأنينة القلوب وسكينة الأرواح.',
        enabled: true
      },
      {
        id: 'az-2',
        category: 'salawat',
        categoryLabel: 'الصلاة على النبي ﷺ',
        arabicText: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا وَحَبِيبِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ',
        virtue: 'قال رسول الله ﷺ: «مَنْ صَلَّى عَلَيَّ صَلاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا».',
        enabled: true
      },
      {
        id: 'az-3',
        category: 'istighfar',
        categoryLabel: 'سيد الاستغفار',
        arabicText:
          'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ.',
        virtue: 'من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة، وكذلك إذا أصبح.',
        enabled: true
      },
      {
        id: 'az-4',
        category: 'general',
        categoryLabel: 'تسبيح وتحميد',
        arabicText: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
        virtue: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن.',
        enabled: true
      },
      {
        id: 'az-5',
        category: 'sabah',
        categoryLabel: 'أذكار الصباح والمساء',
        arabicText: 'بِسْمِ اللَّهِ الَّذِي لا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        virtue: 'ثلاث مرات صباحاً ومساءً لم يضره شيء.',
        enabled: true
      },
      {
        id: 'az-6',
        category: 'general',
        categoryLabel: 'كنز من كنوز الجنة',
        arabicText: 'لا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
        virtue: 'كنز من تحت العرش وبراءة من الحول والقوة إلا بالله.',
        enabled: true
      },
      {
        id: 'az-7',
        category: 'istighfar',
        categoryLabel: 'استغفار وتوبة',
        arabicText: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لا إِلَهَ إِلا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
        virtue: 'من قاله غُفرت ذنوبه وإن كان فر من الزحف.',
        enabled: true
      },
      {
        id: 'az-8',
        category: 'quran',
        categoryLabel: 'دعاء جامع',
        arabicText: '﴿ رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ ﴾',
        virtue: 'أكثر دعاء كان يدعو به النبي ﷺ.',
        enabled: true
      }
    ]
  });

  // Dedicated Honeypot Trap State
  const [honeypotTrap, setHoneypotTrapState] = useState<HoneypotTrapConfig>({
    enabled: true,
    channelName: '🚫-ممنوع-الدخول',
    punishment: 'ban',
    timeoutDurationMinutes: 10080,
    deleteMessage: true,
    alertLogChannel: 'log-server',
    customWarningMessage:
      '⚠️ تحذير أمني شديد: هذا الروم عبارة عن مصيدة آلية لكشف البوتات وحسابات السيلف بوت والمخربين. أي رسالة أو تفاعل هنا يؤدي للحظر الفوري من سيرفر M7R!',
    whitelistUserIds: ['498712345678901234'],
    whitelistRoleNames: ['Owner', 'Co-Owner', 'Lead Admin'],
    totalTrapped: 18
  });

  // Anti-Nuke Config
  const [antiNuke, setAntiNukeState] = useState<AntiNukeConfig>({
    enabled: true,
    massBanLimit: 3,
    massBanWindowSeconds: 10,
    massBanAction: 'strip_roles',
    massKickLimit: 3,
    massChannelDeleteLimit: 2,
    massRoleDeleteLimit: 2,
    quarantineNewBots: true,
    blockWebhookCreation: true,
    whitelistUserIds: ['498712345678901234', '912384756102938475']
  });

  // Anti-Spam Config
  const [antiSpam, setAntiSpamState] = useState<AntiSpamConfig>({
    enabled: true,
    maxMessages: 5,
    windowSeconds: 3,
    maxMentions: 3,
    blockRepetitiveMessages: true,
    blockEmojiFlood: true,
    punishment: 'timeout',
    timeoutDurationMinutes: 5,
    trapChannels: ['#general', '#chat', '#market', '#support']
  });

  // Anti-Invite Config
  const [antiInvite, setAntiInviteState] = useState<AntiInviteConfig>({
    enabled: true,
    blockDiscordInvites: true,
    blockSuspiciousLinks: true,
    whitelistDomains: ['youtube.com', 'twitch.tv', 'github.com', 'twitter.com'],
    exemptRoles: ['Co-Owner', 'Security Chief', 'VIP Sponsor'],
    action: 'delete_warn'
  });

  const [autoResponses, setAutoResponsesState] = useState<AutoResponse[]>([
    {
      id: 'ar-1',
      trigger: 'سلام عليكم',
      matchType: 'contains',
      reply: 'وعليكم السلام ورحمة الله وبركاته! أهلاً بك في سيرفر M7R المحمي بالدرع الفولاذي 🛡️',
      autoReaction: '❤️',
      enabled: true
    },
    {
      id: 'ar-2',
      trigger: 'متجر',
      matchType: 'contains',
      reply: '🛒 تفضل بزيارة روم التذاكر لطلب منتجات المتجر الحصرية: <#tickets>',
      autoReaction: '🛒',
      enabled: true
    }
  ]);

  const [voice247, setVoice247State] = useState<Voice247Config>({
    enabled: true,
    channelId: '110293847561029384',
    channelName: '🔊 24/7 | خلوة وتلاوات عطرة',
    audioMode: 'quran',
    selectedReciter: 'alafasy',
    autoReconnect: true,
    deafened: true,
    muted: false,
    scheduleEnabled: true
  });

  // Wrappers that trigger the Unsaved Changes bar automatically!
  const setBasicSettings = (val: BotBasicSettings) => {
    setBasicSettingsState(val);
    setHasUnsavedChanges(true);
  };

  const setWelcomeConfig = (val: WelcomeConfig) => {
    setWelcomeConfigState(val);
    setHasUnsavedChanges(true);
  };

  const setTicketPanel = (val: TicketPanelConfig) => {
    setTicketPanelState(val);
    setHasUnsavedChanges(true);
  };

  const setDiscordCommands = (val: DiscordCommandConfig[]) => {
    setDiscordCommandsState(val);
    setHasUnsavedChanges(true);
  };

  const setAntiNuke: React.Dispatch<React.SetStateAction<AntiNukeConfig>> = (val) => {
    setAntiNukeState(val);
    setHasUnsavedChanges(true);
  };

  const setAntiSpam: React.Dispatch<React.SetStateAction<AntiSpamConfig>> = (val) => {
    setAntiSpamState(val);
    setHasUnsavedChanges(true);
  };

  const setAntiInvite: React.Dispatch<React.SetStateAction<AntiInviteConfig>> = (val) => {
    setAntiInviteState(val);
    setHasUnsavedChanges(true);
  };

  const setAutoResponses: React.Dispatch<React.SetStateAction<AutoResponse[]>> = (val) => {
    setAutoResponsesState(val);
    setHasUnsavedChanges(true);
  };

  const setVoice247: React.Dispatch<React.SetStateAction<Voice247Config>> = (val) => {
    setVoice247State(val);
    setHasUnsavedChanges(true);
  };

  const setAzkarConfig = (val: AzkarConfig) => {
    setAzkarConfigState(val);
    setHasUnsavedChanges(true);
  };

  const setHoneypotTrap: React.Dispatch<React.SetStateAction<HoneypotTrapConfig>> = (val) => {
    setHoneypotTrapState(val);
    setHasUnsavedChanges(true);
  };

  // Switch active controlled server
  const handleSelectGuild = async (guild: ConnectedGuildItem) => {
    try {
      const res = await fetch('/api/guild/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: guild.id })
      });
      const data = await res.json();
      invalidateChannelsCache();
      if (data && data.botInfo) {
        setConnectedBot(data.botInfo);
      } else if (connectedBot) {
        setConnectedBot({
          ...connectedBot,
          selectedGuild: guild,
          membersCount: guild.memberCount,
          channelsCount: guild.channelsCount
        });
      }
      setSaveBannerMessage(
        lang === 'ar'
          ? `✅ تم التبديل للتحكم المباشر في سيرفر: ${guild.name} (${guild.memberCount} عضو)`
          : `✅ Switched active server control to: ${guild.name}`
      );
      setTimeout(() => setSaveBannerMessage(null), 4000);
    } catch {
      // ignore
    }
  };

  // Threat Logs
  const [threatLogs, setThreatLogs] = useState<ThreatLog[]>([
    {
      id: 'th-101',
      type: 'anti-nuke',
      action: 'Mass Ban Blocked',
      target: '3 members targeted',
      executor: 'RogueAdmin#9921',
      timestamp: 'منذ دقيقتين',
      severity: 'critical',
      details: 'حاول المشرف طرد 3 أعضاء خلال ثانيتين. تم سحب جميع رتبه فوراً وعزله في سجن M7R.'
    },
    {
      id: 'th-102',
      type: 'anti-spam',
      action: 'Anti-Spam Trap Triggered',
      target: '#عام-chat',
      executor: 'SpammerBot#1104',
      timestamp: 'منذ 14 دقيقة',
      severity: 'high',
      details: 'أرسل 7 رسائل مكررة في غضون ثانيتين. تم إيقافه مؤقتاً (Timeout) لمدة 15 دقيقة ومسح رسائله.'
    }
  ]);

  // Tickets
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'ticket-1092',
      channelName: 'ticket-1092',
      category: 'store',
      categoryLabel: '🛒 شراء منتج / M7R Store',
      user: {
        name: 'Rakan_Gamer',
        avatar: '',
        id: '8271635241098'
      },
      claimedBy: 'Sultan [Lead Support]',
      status: 'claimed',
      createdAt: 'اليوم، 03:15 ص',
      messages: [
        {
          id: 'm1',
          author: 'Rakan_Gamer',
          avatar: '',
          isStaff: false,
          content: 'السلام عليكم، أريد شراء باقة نيترو سنة ورتبة VIP للمتجر.',
          timestamp: '03:15 ص'
        },
        {
          id: 'm2',
          author: 'M7R Bot',
          avatar: '',
          isStaff: true,
          content: 'مرحباً بك! تذكرتك مفتوحة، يرجى انتظار أحد مسؤولي المتجر للرد عليك.',
          timestamp: '03:15 ص'
        }
      ]
    }
  ]);

  // Applications
  const [applications, setApplications] = useState<ApplicationSubmission[]>([
    {
      id: 'app-501',
      formId: 'staff-recruitment',
      formTitle: 'تقديم على الإدارة والرقابة (Staff Application)',
      applicant: {
        name: 'Khalid_Hero',
        tag: 'Khalid#2091',
        avatar: '',
        joinedAt: 'منذ 8 أشهر'
      },
      answers: {
        q1: 'خالد العنزي، عمري 21 سنة، مقيم بالرياض.',
        q2: 'خبرة سنتين في إدارة سيرفرات مجتمعات ألعاب كبيرة تفوق 40 ألف عضو.',
        q3: 'متفرغ يومياً من 6 إلى 8 ساعات مسائية.'
      },
      status: 'pending',
      submittedAt: 'أمس، 11:30 م'
    }
  ]);

  const [applicationsConfig, setApplicationsConfig] = useState<ApplicationsConfig>({
    enabled: true,
    applyChannelName: 'staff-applications',
    adminReviewChannelName: 'log-server',
    resultsChannelName: '',
    acceptedRoleName: 'Staff Trial',
    panelTitle: '📋 تقديم على الإدارة والرقابة (Staff Applications)',
    panelDescription: 'مرحباً بك في نظام التقديمات الرسمي لسيرفر M7R!\n\nاضغط على الزر أدناه لتعبئة استمارة التقديم على طاقم الإدارة والرقابة. يرجى الإجابة بدقة ومصداقية.',
    panelColor: '#e11d48',
    panelBannerUrl: '',
    panelButtonLabel: 'تقديم على الإدارة الآن',
    panelButtonEmoji: '📝',
    dmOnAccept: true,
    acceptDmMessage: '🎉 تهانينا! تمت الموافقة على طلب انضمامك لطاقم إدارة السيرفر، وتم منحك رتبة الإدارة بنجاح. نرجو منك مراجعة قوانين الإدارة في السيرفر.',
    dmOnReject: true,
    rejectDmMessage: 'نعتذر منك، لم يتم اجتياز متطلبات الشفت والخبرة الإدارية الحالية في السيرفر. يمكنك إعادة التقديم في المرة القادمة.',
    questions: [
      {
        id: 'q1',
        question: 'عرّف عن نفسك وعمرك ومكان إقامتك؟',
        placeholder: 'مثال: يوسف، 21 سنة، الرياض...',
        type: 'short',
        required: true
      },
      {
        id: 'q2',
        question: 'ما هي خبراتك السابقة في إدارة وتنظيم السيرفرات؟',
        placeholder: 'اذكر أسماء السيرفرات أو طبيعة المهام الإدارية السابقة...',
        type: 'paragraph',
        required: true
      },
      {
        id: 'q3',
        question: 'كم عدد الساعات المتفرغ لها يومياً لشفت الرقابة؟',
        placeholder: 'مثال: 5 ساعات يومياً في الفترة المسائية...',
        type: 'short',
        required: true
      }
    ]
  });

  const setApplicationsConfigState = (cfg: ApplicationsConfig) => {
    setApplicationsConfig(cfg);
    setHasUnsavedChanges(true);
  };

  const handleTogglePanicMode = () => {
    const next = !panicMode;
    setPanicMode(next);
    fetch('/api/panic-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: next })
    }).catch(() => {});

    const newLog: ThreatLog = {
      id: `th-${Date.now()}`,
      type: 'lockdown',
      action: next ? 'Emergency Panic Mode Activated' : 'Panic Mode Deactivated',
      target: next ? 'ALL_CHANNELS_LOCKED' : 'CHANNELS_RESTORED',
      executor: 'M7R Security Officer',
      timestamp: 'الآن',
      severity: next ? 'critical' : 'low',
      details: next
        ? 'تم قفل جميع رومات السيرفر ومنع إرسال الرسائل وتجميد الرتب لصد هجوم شامل!'
        : 'تم إلغاء وضع الطوارئ وإعادة فتح السيرفر تدريجياً.'
    };
    setThreatLogs((prev) => [newLog, ...prev]);
  };

  const handleSimulateAttack = (type: 'nuke' | 'spam' | 'invite') => {
    setAttacksThwarted((prev) => prev + 1);
    let newLog: ThreatLog;
    if (type === 'nuke') {
      newLog = {
        id: `th-${Date.now()}`,
        type: 'anti-nuke',
        action: 'Mass Channel Delete Attack Intercepted',
        target: 'Attempted to delete #chat-1, #chat-2',
        executor: `Attacker_${Math.floor(1000 + Math.random() * 9000)}#0000`,
        timestamp: 'الآن',
        severity: 'critical',
        details: 'تم حظر المهاجم فوراً واسترجاع الصلاحيات بفضل درع Anti-Nuke الفولاذي.'
      };
    } else if (type === 'spam') {
      newLog = {
        id: `th-${Date.now()}`,
        type: 'anti-spam',
        action: 'Spam Wave Neutralized',
        target: '#general',
        executor: `RaidBot_${Math.floor(100 + Math.random() * 900)}`,
        timestamp: 'الآن',
        severity: 'high',
        details: 'رصدت مصيدة السبام 12 رسالة في ثانية واحدة وتم تفعيل الكتم الفوري (Timeout).'
      };
    } else {
      newLog = {
        id: `th-${Date.now()}`,
        type: 'anti-invite',
        action: 'Invite Link Thwarted',
        target: '#chat',
        executor: `Promo_${Math.floor(100 + Math.random() * 900)}`,
        timestamp: 'الآن',
        severity: 'medium',
        details: 'تم مسح رابط دعوة سيرفر ديسكورد غير مرخص وتطبيق تحذير تلقائي.'
      };
    }
    setThreatLogs((prev) => [newLog, ...prev]);
  };

  const handleTicketAction = (ticketId: string, action: string, staffName?: string, extra?: string) => {
    setTickets((prev) => {
      return prev
        .map((t) => {
          if (t.id !== ticketId) return t;
          const updated = { ...t };
          const timeNow = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

          if (action === 'claim') {
            updated.status = 'claimed';
            updated.claimedBy = staffName || 'المشرف المسؤول';
            updated.messages = [
              ...updated.messages,
              {
                id: `m-${Date.now()}`,
                author: 'M7R Bot [System]',
                avatar: '',
                isStaff: true,
                content: `🛡️ تم استلام التذكرة من قبل المشرف: ${updated.claimedBy}. أصبح التفاعل حصرياً معه.`,
                timestamp: timeNow
              }
            ];
          } else if (action === 'close') {
            updated.status = 'closed';
            updated.messages = [
              ...updated.messages,
              {
                id: `m-${Date.now()}`,
                author: 'M7R Bot [System]',
                avatar: '',
                isStaff: true,
                content: '🔒 تم إغلاق التذكرة وأرشفة تفاصيل المعاملة بنجاح.',
                timestamp: timeNow
              }
            ];
          } else if (action === 'remind') {
            updated.messages = [
              ...updated.messages,
              {
                id: `m-${Date.now()}`,
                author: 'M7R Bot [Reminder]',
                avatar: '',
                isStaff: true,
                content: `⏰ تنبيه من الإدارة: يرجى موافاتنا بالرد المطلوب لتفادي إغلاق التذكرة تلقائياً.`,
                timestamp: timeNow
              }
            ];
          } else if (action === 'transfer') {
            updated.messages = [
              ...updated.messages,
              {
                id: `m-${Date.now()}`,
                author: 'M7R Bot [System]',
                avatar: '',
                isStaff: true,
                content: `🔄 تم تحويل التذكرة إلى قسم (${extra || 'الإدارة العليا'}) لمتابعة الإجراءات.`,
                timestamp: timeNow
              }
            ];
          } else if (action === 'send_reply') {
            updated.messages = [
              ...updated.messages,
              {
                id: `m-${Date.now()}`,
                author: staffName || 'M7R Staff',
                avatar: '',
                isStaff: true,
                content: extra || 'شكراً لتواصلك مع M7R.',
                timestamp: timeNow
              }
            ];
          }
          return updated;
        })
        .filter((t) => action !== 'delete' || t.id !== ticketId);
    });
  };

  const handleCreateSimulatedTicket = (
    category: 'store' | 'support' | 'complaints' | 'partnerships',
    categoryLabel: string
  ) => {
    sound.playShieldActivate();
    const newNumber = Math.floor(1000 + Math.random() * 9000);
    const newTicket: Ticket = {
      id: `ticket-${newNumber}`,
      channelName: `ticket-${newNumber}`,
      category,
      categoryLabel,
      user: {
        name: `Member_${Math.floor(100 + Math.random() * 900)}`,
        avatar: '',
        id: `${Date.now()}`
      },
      claimedBy: null,
      status: 'open',
      createdAt: 'الآن',
      messages: [
        {
          id: `m-${Date.now()}`,
          author: 'M7R Bot',
          avatar: '',
          isStaff: true,
          content: ticketPanel.welcomeMessage,
          timestamp: 'الآن'
        }
      ]
    };
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleReviewApplication = async (appId: string, status: 'accepted' | 'rejected', notes?: string) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== appId) return a;
        return {
          ...a,
          status,
          reviewNotes: notes || (status === 'accepted' ? 'تم القبول وتعيين الرتبة.' : 'تم الرفض.')
        };
      })
    );
    try {
      await fetch('/api/applications/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, status, notes })
      });
    } catch (err) {
      console.error('Error reviewing application:', err);
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== appId));
    try {
      await fetch('/api/applications/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId })
      });
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  const handleSendApplicationsPanel = async (channelName: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/applications/send-panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || 'تعذر إرسال البنل إلى الروم' };
      }
      return { success: true, message: data.message || `تم إرسال بنل التقديم بنجاح إلى #${data.channelName}` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'خطأ في الاتصال بالخادم' };
    }
  };

  const handleSubmitSimulatedApp = async (name: string, tag: string, answers: { [k: string]: string }) => {
    const newApp: ApplicationSubmission = {
      id: `app-${Date.now().toString().slice(-6)}`,
      formId: 'staff-recruitment',
      formTitle: applicationsConfig.panelTitle || 'تقديم على الإدارة والرقابة (Staff Application)',
      applicant: {
        name,
        tag,
        avatar: '',
        joinedAt: 'عضو جديد'
      },
      answers,
      status: 'pending',
      submittedAt: 'الآن'
    };
    setApplications((prev) => [newApp, ...prev]);
    try {
      await fetch('/api/applications/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tag, answers })
      });
    } catch (err) {
      console.error('Error submitting test app:', err);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basicSettings,
          welcome: welcomeConfig,
          ticketPanel,
          commands: discordCommands,
          antiNuke,
          antiSpam,
          antiInvite,
          voice247,
          autoResp: autoResponses,
          azkar: azkarConfig,
          trap: honeypotTrap,
          applicationsConfig
        })
      });
      const data = await res.json();
      if (data.botInfo) {
        setConnectedBot(data.botInfo);
      }
      setHasUnsavedChanges(false);
      setSaveBannerMessage(
        lang === 'ar'
          ? '✅ تم حفظ جميع التعديلات (الأوامر الأساسية، الترحيب، التقديمات، التذاكر، الحماية، وحالة البوت) وتطبيقها مباشرة في ديسكورد!'
          : '✅ All changes saved and synced directly to your Discord Bot!'
      );
      setTimeout(() => setSaveBannerMessage(null), 4000);
    } catch {
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAccessMode = async (mode: AccessRoleMode) => {
    setAccessMode(mode);
    try {
      const res = await fetch('/api/auth/access-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      const data = await res.json();
      if (data?.message) {
        setSaveBannerMessage(data.message);
        setTimeout(() => setSaveBannerMessage(null), 4500);
      }
    } catch {
      // ignore
    }
  };

  const handleMarkNotificationsRead = async () => {
    setUnreadNotificationsCount(0);
    setGuildNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications/guilds/read', { method: 'POST' });
    } catch {
      // ignore
    }
  };

  const handleSimulateServerJoin = async () => {
    try {
      const res = await fetch('/api/notifications/guilds/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (Array.isArray(data?.notifications)) {
        setGuildNotifications(data.notifications);
        setUnreadNotificationsCount(data.unreadCount ?? 1);
      }
      if (data?.accessMode) {
        setAccessMode(data.accessMode);
      }
      if (data?.message) {
        setSaveBannerMessage(data.message);
        setTimeout(() => setSaveBannerMessage(null), 5000);
      }
    } catch {
      // ignore
    }
  };

  // Safe vs Full Commands list depending on accessMode
  const visibleCommands =
    accessMode === 'server_admin'
      ? discordCommands.filter((c) => !SENSITIVE_COMMANDS_SET.has(c.name.toLowerCase()) && !c.isSensitive)
      : discordCommands;

  const handleUpdateVisibleCommands = (updatedSubset: DiscordCommandConfig[]) => {
    if (accessMode === 'bot_owner') {
      setDiscordCommands(updatedSubset);
      return;
    }
    const updatedMap = new Map(updatedSubset.map((c) => [c.id, c]));
    const merged = discordCommands.map((c) => updatedMap.get(c.id) || c);
    setDiscordCommands(merged);
  };

  if (showTokenGate) {
    return (
      <TokenAuthGate
        lang={lang}
        onConnected={(info) => {
          setConnectedBot(info);
          if (info.accessMode) {
            setAccessMode(info.accessMode);
            if (info.accessMode === 'server_admin' && ['basics', 'antinuke', 'prosuite', 'replit'].includes(activeTab)) {
              setActiveTab('overview');
            }
          }
          setBasicSettingsState((prev) => ({
            ...prev,
            botUsername: info.username || 'm7r'
          }));
          setShowTokenGate(false);
        }}
        onEnterDemoMode={() => {
          setShowTokenGate(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] cyber-grid text-slate-100 flex flex-col selection:bg-rose-600/30 selection:text-rose-200 pb-20">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        panicMode={panicMode}
        onTogglePanicMode={handleTogglePanicMode}
        lang={lang}
        setLang={setLang}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        botInfo={connectedBot}
        onOpenTokenGate={() => setShowTokenGate(true)}
        onSelectGuild={handleSelectGuild}
        accessMode={accessMode}
        onToggleAccessMode={handleToggleAccessMode}
        notifications={guildNotifications}
        unreadCount={unreadNotificationsCount}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onSimulateServerJoin={handleSimulateServerJoin}
        onLogout={handleLogout}
        onTriggerRefresh={handleMasterRefresh}
      />

      {/* Active Permission Banner (Safe Server Control vs Bot Owner) */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
            accessMode === 'server_admin'
              ? 'bg-[#5865F2]/10 border-[#5865F2]/30 text-indigo-200'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {accessMode === 'server_admin' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>
              {accessMode === 'server_admin'
                ? lang === 'ar'
                  ? `🛡️ صلاحية التحكم في السيرفر (${connectedBot?.selectedGuild?.name || 'السيرفر الحالي'}) مفعلة — تظهر لك فقط إعدادات السيرفر الآمنة (الترحيب، التذاكر، التقديمات، القرآن 24/7، الأذكار) وتم إخفاء الأوامر الحساسة والخطيرة.`
                  : `🛡️ Safe Server Control Mode Active — Showing safe server settings only; sensitive/destructive commands are hidden.`
                : lang === 'ar'
                ? `👑 وضع مالك البوت الكامل (Owner) — جميع الأوامر القوية والحساسة وإعدادات التوكن والحماية متاحة لك.`
                : `👑 Full Bot Owner Mode — All sensitive commands and bot token settings are unlocked.`}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSimulateServerJoin}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Bell className="w-3 h-3" />
              <span>{lang === 'ar' ? 'تجربة إشعار دخول سيرفر' : 'Test Join Alert'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleAccessMode(accessMode === 'server_admin' ? 'bot_owner' : 'server_admin')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer"
            >
              {accessMode === 'server_admin'
                ? lang === 'ar'
                  ? 'التبديل لوضع المالك 👑'
                  : 'Switch to Owner 👑'
                : lang === 'ar'
                ? 'معاينة لوحة السيرفر الآمنة 🛡️'
                : 'Preview Safe Server Mode 🛡️'}
            </button>
          </div>
        </div>
      </div>

      {/* Top Success Toast Banner after Saving */}
      {saveBannerMessage && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveBannerMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'overview' && (
          <OverviewTab
            lang={lang}
            panicMode={panicMode}
            onSimulateAttack={handleSimulateAttack}
            threatLogs={threatLogs}
            attacksThwarted={attacksThwarted}
            botInfo={connectedBot}
          />
        )}

        {activeTab === 'aichat' && <AiChatbotTab lang={lang} />}

        {activeTab === 'basics' && accessMode === 'bot_owner' && (
          <BasicBotSettingsTab
            lang={lang}
            settings={basicSettings}
            onChangeSettings={setBasicSettings}
            botInfo={connectedBot}
            onSelectGuild={handleSelectGuild}
          />
        )}

        {activeTab === 'commands' && (
          <CommandsManagerTab
            lang={lang}
            prefix={basicSettings.prefix}
            commands={visibleCommands}
            onChangeCommands={handleUpdateVisibleCommands}
            onSave={handleSaveSettings}
          />
        )}

        {activeTab === 'welcome' && (
          <WelcomeTab
            lang={lang}
            welcomeConfig={welcomeConfig}
            onChangeWelcomeConfig={setWelcomeConfig}
            onSave={handleSaveSettings}
            serverName={connectedBot?.selectedGuild?.name || 'M7R Server'}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketsTab
            lang={lang}
            tickets={tickets}
            onTicketAction={handleTicketAction}
            onCreateSimulatedTicket={handleCreateSimulatedTicket}
            panelConfig={ticketPanel}
            onChangePanelConfig={setTicketPanel}
          />
        )}

        {activeTab === 'antinuke' && accessMode === 'bot_owner' && (
          <AntiNukeTab
            lang={lang}
            antiNuke={antiNuke}
            setAntiNuke={setAntiNuke}
            antiSpam={antiSpam}
            setAntiSpam={setAntiSpam}
            antiInvite={antiInvite}
            setAntiInvite={setAntiInvite}
            honeypotTrap={honeypotTrap}
            setHoneypotTrap={setHoneypotTrap}
            onSaveSettings={handleSaveSettings}
          />
        )}

        {activeTab === 'azkar' && (
          <AzkarTab
            lang={lang}
            azkarConfig={azkarConfig}
            onChangeAzkarConfig={setAzkarConfig}
            onSave={handleSaveSettings}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationsTab
            lang={lang}
            applications={applications}
            config={applicationsConfig}
            onChangeConfig={setApplicationsConfigState}
            onReviewApplication={handleReviewApplication}
            onDeleteApplication={handleDeleteApplication}
            onSendPanel={handleSendApplicationsPanel}
            onSubmitSimulatedApp={handleSubmitSimulatedApp}
            onSave={handleSaveSettings}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'extras' && (
          <ExtraSystemsTab
            lang={lang}
            autoResponses={autoResponses}
            setAutoResponses={setAutoResponses}
            voice247={voice247}
            setVoice247={setVoice247}
            onSave={handleSaveSettings}
          />
        )}

        {activeTab === 'prosuite' && <AdvancedSuiteTab lang={lang} />}

        {activeTab === 'replit' && <ReplitHubTab lang={lang} />}
      </main>

      {/* FLOATING DISCORD-STYLE UNSAVED CHANGES BAR */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-3xl rounded-xl bg-[#111214]/95 backdrop-blur-md border border-rose-500/50 p-3.5 shadow-2xl shadow-black flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-bold text-white">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>
              {lang === 'ar'
                ? 'تنبيه — لديك تعديلات غير محفوظة! اضغط (حفظ التغييرات) لتطبيقها فوراً على البوت في ديسكورد.'
                : 'Careful — you have unsaved changes! Click Save Changes to sync with your Discord bot.'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                sound.playClick();
                setHasUnsavedChanges(false);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إلغاء' : 'Reset'}</span>
            </button>

            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving
                  ? lang === 'ar'
                    ? 'جاري التطبيق على البوت...'
                    : 'Syncing to Bot...'
                  : lang === 'ar'
                  ? 'حفظ التغييرات وتطبيقها ✅'
                  : 'Save Changes ✅'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080a10] py-6 px-4 sm:px-8 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono">M7R SECURITY</span>
            <span>·</span>
            <span>{lang === 'ar' ? 'نظام الحماية الفولاذية وإدارة السيرفرات' : 'M7R Security & Moderation'}</span>
            <span>·</span>
            <span className="text-emerald-400 font-mono">24/7 Auto-Keeper Active</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => {
                setActiveTab('replit');
                sound.playClick();
              }}
              className="hover:text-rose-400 transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'تشغيل على Replit' : 'Deploy to Replit'}
            </button>
            <span>·</span>
            <span className="font-mono text-slate-400">Ping: 17ms</span>
            <span>·</span>
            <span className="text-slate-400">M7R v2.7 Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
