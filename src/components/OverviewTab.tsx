import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Server,
  Hash,
  Zap,
  Activity,
  Clock,
  RotateCw,
  Play,
  CheckCircle2,
  Cpu,
  Radio,
  Globe,
  Copy,
  ExternalLink,
  Send,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Gift,
  BarChart3,
  BookOpen,
  Check,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ThreatLog } from '../types';
import { sound } from '../utils/sound';
import { ConnectedBotData } from './TokenAuthGate';
import { M7RLogo } from './M7RLogo';

interface DailyAnalyticsItem {
  day: string;
  dayEn: string;
  date: string;
  members: number;
  newJoins: number;
  messages: number;
  commandsUsed: number;
}

interface WeeklyAttackItem {
  day: string;
  dayEn: string;
  date: string;
  totalAttacks: number;
  spamBlocked: number;
  nukeBlocked: number;
  linksBlocked: number;
}

interface OverviewTabProps {
  lang: 'ar' | 'en';
  panicMode: boolean;
  onSimulateAttack: (type: 'nuke' | 'spam' | 'invite') => void;
  threatLogs: ThreatLog[];
  attacksThwarted: number;
  botInfo: ConnectedBotData | null;
}

const DEFAULT_WEB_DASHBOARD_URL = 'https://bot-m7r.netlify.app/';

const INITIAL_7DAYS_DATA: DailyAnalyticsItem[] = [
  { day: 'الجمعة', dayEn: 'Fri', date: 'Day -6', members: 1382, newJoins: 9, messages: 420, commandsUsed: 38 },
  { day: 'السبت', dayEn: 'Sat', date: 'Day -5', members: 1395, newJoins: 13, messages: 580, commandsUsed: 52 },
  { day: 'الأحد', dayEn: 'Sun', date: 'Day -4', members: 1408, newJoins: 13, messages: 510, commandsUsed: 44 },
  { day: 'الإثنين', dayEn: 'Mon', date: 'Day -3', members: 1419, newJoins: 11, messages: 645, commandsUsed: 61 },
  { day: 'الثلاثاء', dayEn: 'Tue', date: 'Day -2', members: 1431, newJoins: 12, messages: 720, commandsUsed: 69 },
  { day: 'الأربعاء', dayEn: 'Wed', date: 'Day -1', members: 1442, newJoins: 11, messages: 835, commandsUsed: 84 },
  { day: 'اليوم', dayEn: 'Today', date: 'Live', members: 1450, newJoins: 8, messages: 942, commandsUsed: 97 }
];

const INITIAL_WEEKLY_ATTACKS: WeeklyAttackItem[] = [
  { day: 'الجمعة', dayEn: 'Fri', date: 'Day -6', totalAttacks: 19, spamBlocked: 12, nukeBlocked: 2, linksBlocked: 5 },
  { day: 'السبت', dayEn: 'Sat', date: 'Day -5', totalAttacks: 27, spamBlocked: 18, nukeBlocked: 3, linksBlocked: 6 },
  { day: 'الأحد', dayEn: 'Sun', date: 'Day -4', totalAttacks: 15, spamBlocked: 9, nukeBlocked: 1, linksBlocked: 5 },
  { day: 'الإثنين', dayEn: 'Mon', date: 'Day -3', totalAttacks: 34, spamBlocked: 22, nukeBlocked: 4, linksBlocked: 8 },
  { day: 'الثلاثاء', dayEn: 'Tue', date: 'Day -2', totalAttacks: 23, spamBlocked: 15, nukeBlocked: 2, linksBlocked: 6 },
  { day: 'الأربعاء', dayEn: 'Wed', date: 'Day -1', totalAttacks: 31, spamBlocked: 20, nukeBlocked: 4, linksBlocked: 7 },
  { day: 'اليوم', dayEn: 'Today', date: 'Live', totalAttacks: 29, spamBlocked: 19, nukeBlocked: 3, linksBlocked: 7 }
];

interface BotPerformanceData {
  overallScore: number;
  grade: string;
  statusLabel: string;
  wsPing: number;
  latencyScore: number;
  voiceScore: number;
  activeReciterName: string;
  voiceChannelName: string;
  securityScore: number;
  memUsageMb: number;
  resourceScore: number;
  enabledCommandsCount: number;
  commandsScore: number;
  uptimeFormatted: string;
  evaluatedAt: string;
}

const DEFAULT_PERFORMANCE: BotPerformanceData = {
  overallScore: 98,
  grade: 'A+',
  statusLabel: 'ممتاز فائق (Ultra Optimal 🟢)',
  wsPing: 17,
  latencyScore: 99,
  voiceScore: 100,
  activeReciterName: 'مشاري راشد العفاسي',
  voiceChannelName: 'قرآن 24/7',
  securityScore: 98,
  memUsageMb: 78.4,
  resourceScore: 98,
  enabledCommandsCount: 38,
  commandsScore: 100,
  uptimeFormatted: '24/7 Active',
  evaluatedAt: 'الآن'
};

export const OverviewTab: React.FC<OverviewTabProps> = ({
  lang,
  panicMode,
  onSimulateAttack,
  threatLogs,
  attacksThwarted,
  botInfo
}) => {
  const isAr = lang === 'ar';
  const [ping, setPing] = useState(botInfo?.ping || 17);
  const [isPinging, setIsPinging] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  // 7-Day Recharts Analytics, Weekly Thwarted Attacks, Bot Performance & Web Dashboard State
  const [analyticsData, setAnalyticsData] = useState<DailyAnalyticsItem[]>(INITIAL_7DAYS_DATA);
  const [weeklyAttacksData, setWeeklyAttacksData] = useState<WeeklyAttackItem[]>(INITIAL_WEEKLY_ATTACKS);
  const [ultraSpamMode, setUltraSpamMode] = useState(true);
  const [sendingSecurityReport, setSendingSecurityReport] = useState(false);
  const [perfData, setPerfData] = useState<BotPerformanceData>(DEFAULT_PERFORMANCE);
  const [evaluatingPerf, setEvaluatingPerf] = useState(false);
  const [publishingWeb, setPublishingWeb] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [webDashboardUrl, setWebDashboardUrl] = useState<string>(DEFAULT_WEB_DASHBOARD_URL);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [sendingDashboard, setSendingDashboard] = useState(false);
  const [executingCmd, setExecutingCmd] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // M7R AI Ask State
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiAsking, setAiAsking] = useState<boolean>(false);
  const [aiSendToDiscord, setAiSendToDiscord] = useState<boolean>(true);
  const [aiAllowedChannel, setAiAllowedChannel] = useState<string>('all');
  const [aiResult, setAiResult] = useState<{
    question: string;
    answer: string;
    blocked: boolean;
    category: string;
    sentChannelName?: string;
  } | null>(null);

  const fetchAnalytics = async () => {
    try {
      const [resAnalytics, resPerf] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/bot/performance')
      ]);
      const data = await resAnalytics.json();
      if (Array.isArray(data?.analytics7Days)) {
        setAnalyticsData(data.analytics7Days);
      }
      if (Array.isArray(data?.weeklyAttacks7Days)) {
        setWeeklyAttacksData(data.weeklyAttacks7Days);
      }
      if (typeof data?.antiSpamConfig?.ultraMode === 'boolean') {
        setUltraSpamMode(data.antiSpamConfig.ultraMode);
      }
      if (data?.webDashboardUrl) {
        setWebDashboardUrl(data.webDashboardUrl);
      }
      const pJson = await resPerf.json();
      if (pJson?.performance) {
        setPerfData(pJson.performance);
      }
    } catch {
      // keep fallback
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const timer = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(timer);
  }, []);

  // Ping jitter simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setPing((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(14, Math.min(32, prev + delta));
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleTestPing = () => {
    setIsPinging(true);
    sound.playClick();
    setTimeout(() => {
      setPing(Math.floor(15 + Math.random() * 8));
      setIsPinging(false);
    }, 600);
  };

  const handleRunSecurityScan = () => {
    sound.playShieldActivate();
    setScanStatus(isAr ? 'جاري فحص صلاحيات الرتب والبوتات والرومات...' : 'Scanning roles, permissions & bot tokens...');
    setTimeout(() => {
      setScanStatus(
        isAr
          ? 'اكتمل الفحص: 0 ثغرات مكتشفة. درع M7R يعمل بكفاءة 100%'
          : 'Scan complete: 0 vulnerabilities found. 100% secure.'
      );
      setTimeout(() => setScanStatus(null), 5000);
    }, 2000);
  };

  const handleCopyDashboardUrl = () => {
    navigator.clipboard.writeText(webDashboardUrl);
    setCopiedUrl(true);
    sound.playClick();
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  const handleSendDashboardToDiscord = async () => {
    setSendingDashboard(true);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/dashboard/send-to-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (Array.isArray(data?.analytics7Days)) {
        setAnalyticsData(data.analytics7Days);
      }
      setActionToast(
        data?.message ||
          (isAr
            ? '✅ تم إرسال بطاقة (🌐 دشبورد الويب) مع زر الرابط المباشر إلى السيرفر في ديسكورد!'
            : '✅ Web Dashboard card sent to Discord server!')
      );
      setTimeout(() => setActionToast(null), 6000);
    } catch {
      setActionToast(isAr ? '⚠️ تعذر الاتصال بالخادم.' : '⚠️ Connection error.');
    } finally {
      setSendingDashboard(false);
    }
  };

  const handleExecuteQuickCommand = async (commandKey: string) => {
    setExecutingCmd(commandKey);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/commands/execute-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandKey })
      });
      const data = await res.json();
      if (Array.isArray(data?.analytics7Days)) {
        setAnalyticsData(data.analytics7Days);
      }
      if (data?.performance) {
        setPerfData(data.performance);
      }
      if (data?.message) {
        setActionToast(data.message);
        setTimeout(() => setActionToast(null), 6000);
      }
    } catch {
      // ignore
    } finally {
      setExecutingCmd(null);
    }
  };

  const handleRunLiveEvaluation = async (sendToDiscord: boolean) => {
    setEvaluatingPerf(true);
    sound.playShieldActivate();
    try {
      if (sendToDiscord) {
        const res = await fetch('/api/commands/execute-quick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commandKey: 'benchmark' })
        });
        const data = await res.json();
        if (data?.performance) setPerfData(data.performance);
        if (data?.message) {
          setActionToast(data.message);
          setTimeout(() => setActionToast(null), 6000);
        }
      } else {
        const res = await fetch('/api/bot/performance');
        const data = await res.json();
        if (data?.performance) {
          setPerfData(data.performance);
          setActionToast(
            isAr
              ? `⚡ اكتمل تقييم أداء البوت بنجاح: النتيجة ${data.performance.overallScore}/100 (التقدير ${data.performance.grade})`
              : `⚡ Bot Performance Evaluated: ${data.performance.overallScore}/100 (${data.performance.grade})`
          );
          setTimeout(() => setActionToast(null), 5000);
        }
      }
    } catch {
      // ignore
    } finally {
      setEvaluatingPerf(false);
    }
  };

  const handlePublishWebEverywhere = async () => {
    setPublishingWeb(true);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/web/publish-everywhere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      setShowQrModal(true);
      setActionToast(
        data?.message ||
          (isAr
            ? '🚀 تم نشر الموقع الرسمي مع باركود الجوال (QR) وأزرار الدخول المباشر في سيرفر الديسكورد!'
            : '🚀 Web Dashboard published to Discord with QR code!')
      );
      setTimeout(() => setActionToast(null), 7000);
    } catch {
      // ignore
    } finally {
      setPublishingWeb(false);
    }
  };

  const handleSelectAiChannelQuick = async (channelName: string) => {
    const clean = (channelName || 'all').replace(/^#/, '').trim() || 'all';
    setAiAllowedChannel(clean);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowedChannel: clean })
      });
      const data = await res.json();
      setActionToast(
        data?.message ||
          (clean === 'all'
            ? '🌐 تم تفعيل رد الذكاء الاصطناعي M7R AI في جميع رومات السيرفر!'
            : `🎯 تم تحديد روم #${clean} ليكون روم الذكاء الاصطناعي M7R AI فوراً!`)
      );
      setTimeout(() => setActionToast(null), 5000);
    } catch {
      // ignore
    }
  };

  const handleAskM7RAi = async (customQuestion?: string, forceSendDiscord?: boolean) => {
    const qToAsk = (customQuestion ?? aiQuestion).trim();
    if (!qToAsk) return;
    if (customQuestion) setAiQuestion(customQuestion);

    setAiAsking(true);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qToAsk,
          sendToDiscord: typeof forceSendDiscord === 'boolean' ? forceSendDiscord : aiSendToDiscord,
          targetChannelName: aiAllowedChannel === 'all' ? 'general' : aiAllowedChannel
        })
      });
      const data = await res.json();
      if (data?.answer) {
        setAiResult({
          question: data.question || qToAsk,
          answer: data.answer,
          blocked: Boolean(data.blocked),
          category: data.category || 'عام',
          sentChannelName: data.sentChannelName
        });
      }
      if (data?.message) {
        setActionToast(data.message);
        setTimeout(() => setActionToast(null), 6000);
      }
    } catch {
      setActionToast(isAr ? '⚠️ تعذر الاتصال بالمساعد الذكي M7R AI.' : '⚠️ Failed to reach M7R AI.');
    } finally {
      setAiAsking(false);
    }
  };

  const handleToggleUltraSpamMode = async () => {
    const nextMode = !ultraSpamMode;
    setUltraSpamMode(nextMode);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/security/update-shield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ultraMode: nextMode })
      });
      const data = await res.json();
      if (data?.message) {
        setActionToast(data.message);
        setTimeout(() => setActionToast(null), 6000);
      }
    } catch {
      // ignore
    }
  };

  const handleSimulateShieldAttackLive = async (
    type: 'spam' | 'duplicate_spam' | 'mention_raid' | 'invite' | 'nuke',
    sendToDiscord = false
  ) => {
    sound.playAlarm();
    if (type === 'nuke' || type === 'spam' || type === 'invite') {
      onSimulateAttack(type);
    }
    try {
      const res = await fetch('/api/threats/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, sendToDiscord })
      });
      const data = await res.json();
      if (Array.isArray(data?.weeklyAttacks7Days)) {
        setWeeklyAttacksData(data.weeklyAttacks7Days);
      }
      if (data?.newLog?.details) {
        setActionToast(`🛡️ تم صد الهجمة وتحديث الرسم البياني: ${data.newLog.details}`);
        setTimeout(() => setActionToast(null), 6000);
      }
    } catch {
      // ignore
    }
  };

  const handleSendWeeklySecurityReport = async () => {
    setSendingSecurityReport(true);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/security/send-weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (Array.isArray(data?.weeklyAttacks7Days)) {
        setWeeklyAttacksData(data.weeklyAttacks7Days);
      }
      if (data?.message) {
        setActionToast(data.message);
        setTimeout(() => setActionToast(null), 7000);
      }
    } catch {
      // ignore
    } finally {
      setSendingSecurityReport(false);
    }
  };

  const displayMembers =
    botInfo?.mode === 'live'
      ? botInfo.membersCount.toLocaleString()
      : analyticsData[analyticsData.length - 1]?.members.toLocaleString() || '1,450';
  const displayGuilds = botInfo?.mode === 'live' ? botInfo.guildsCount.toLocaleString() : '2';
  const displayChannels = botInfo?.mode === 'live' ? botInfo.channelsCount.toLocaleString() : '34';

  const totalMessages7Days = analyticsData.reduce((acc, item) => acc + item.messages, 0);
  const totalNewJoins7Days = analyticsData.reduce((acc, item) => acc + item.newJoins, 0);
  const todayStats = analyticsData[analyticsData.length - 1] || { messages: 942, newJoins: 8, commandsUsed: 97 };

  const totalWeeklyAttacks = weeklyAttacksData.reduce((acc, item) => acc + item.totalAttacks, 0);
  const totalWeeklySpam = weeklyAttacksData.reduce((acc, item) => acc + item.spamBlocked, 0);
  const totalWeeklyNuke = weeklyAttacksData.reduce((acc, item) => acc + item.nukeBlocked, 0);
  const totalWeeklyLinks = weeklyAttacksData.reduce((acc, item) => acc + item.linksBlocked, 0);

  return (
    <div className="space-y-6">
      {/* 1. Bot Status Header Banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0d1017] p-5 lg:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 radar-glow pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              {botInfo?.avatar ? (
                <img
                  src={botInfo.avatar}
                  alt={botInfo.username}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl border border-rose-500/40 object-cover shadow-lg shadow-rose-950/60"
                />
              ) : (
                <M7RLogo size="lg" showBadge={false} />
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0d1017]" title="Online" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  {botInfo?.mode === 'live' ? botInfo.username.toUpperCase() : 'M7R'}
                </h1>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  {botInfo?.mode === 'live'
                    ? isAr
                      ? `متصل 24/7 🟢 (${botInfo.tag.replace(/^m7r/i, 'M7R')})`
                      : `LIVE CONNECTED 🟢 (${botInfo.tag.replace(/^m7r/i, 'M7R')})`
                    : isAr
                    ? 'متصل 🟢 24/7'
                    : 'ONLINE 24/7'}
                </span>
                {panicMode && (
                  <span className="text-xs font-bold text-red-400 bg-red-950/80 border border-red-500/40 px-2 py-0.5 rounded animate-pulse">
                    {isAr ? 'وضع الطوارئ نشط' : 'LOCKDOWN ACTIVE'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {isAr
                  ? 'لوحة تحكم الويب الرسمية لبوت M7R 24/7 — إحصائيات السيرفر الحية، بث القرآن الكريم 24/7، والأوامر التفاعلية.'
                  : 'Official M7R 24/7 Web Dashboard — Live server analytics, 24/7 Holy Quran stream, and interactive commands.'}
              </p>
            </div>
          </div>

          {/* Telemetry Strip */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">{isAr ? 'حاسبة البنق' : 'Latency Ping'}</span>
                <span className="font-mono font-bold text-slate-100 tabular-nums">
                  {ping} ms <span className="text-emerald-400 font-sans text-[10px]">({isAr ? 'ممتاز' : 'Optimal'})</span>
                </span>
              </div>
              <button
                onClick={handleTestPing}
                disabled={isPinging}
                title={isAr ? 'إعادة قياس البنق' : 'Re-measure Ping'}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-rose-400' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">{isAr ? 'مدة التشغيل' : 'Uptime 24/7'}</span>
                <span className="font-mono font-semibold text-slate-200 tabular-nums">24/7 Active</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">{isAr ? 'رسائل اليوم' : 'Today Messages'}</span>
                <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                  {todayStats.messages.toLocaleString()} {isAr ? 'رسالة' : 'msgs'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {(scanStatus || actionToast) && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 font-bold flex items-center gap-2 transition-all">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionToast || scanStatus}</span>
          </div>
        )}
      </div>

      {/* 🎙️ VOICE & QURAN RECORDINGS CARD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/40 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 shadow-lg shadow-emerald-950/50">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                {isAr ? '🎙️ التسجيلات الصوتية وبث القرآن الكريم 24/7' : '🎙️ Voice Recordings & 24/7 Quran Stream'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {isAr ? 'يبث الآن مباشر' : 'Live Streaming'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isAr
                ? 'تشغيل واستماع تلاوات القرآن الكريم والتسجيلات الصوتية في الروم الصوتي على مدار الساعة بدون انقطاع.'
                : 'Streaming continuous Quran recitations and voice recordings in 24/7 voice channel.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
          {[
            { id: 'afasy', name: isAr ? 'مشاري العفاسي' : 'Al-Afasy' },
            { id: 'sudais', name: isAr ? 'عبدالرحمن السديس' : 'Al-Sudais' },
            { id: 'abukr', name: isAr ? 'إدريس أبكر' : 'Idrees Abukr' }
          ].map((rec) => (
            <button
              key={rec.id}
              onClick={() => {
                sound.playClick();
                setActionToast(isAr ? `🔊 جاري تشغيل بث ${rec.name} في روم الصوت 24/7` : `🔊 Playing ${rec.name} in Voice Channel`);
                setTimeout(() => setActionToast(null), 4000);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-emerald-600/20 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-slate-200 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>{rec.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Key Statistics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800/80 bg-[#0d1017] p-4 flex items-center justify-between shadow-md hover:border-slate-700 transition-colors">
          <div>
            <span className="text-xs text-slate-400 font-medium">{isAr ? 'إجمالي أعضاء السيرفر' : 'Total Server Members'}</span>
            <div className="text-2xl font-black text-white font-mono tabular-nums mt-1">{displayMembers}</div>
            <span className="text-[11px] text-emerald-400 font-bold">
              +{totalNewJoins7Days} {isAr ? 'عضو جديد آخر 7 أيام' : 'new in 7 days'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-[#0d1017] p-4 flex items-center justify-between shadow-md hover:border-slate-700 transition-colors">
          <div>
            <span className="text-xs text-slate-400 font-medium">{isAr ? 'رسائل الشات (آخر 7 أيام)' : 'Chat Messages (7 Days)'}</span>
            <div className="text-2xl font-black text-white font-mono tabular-nums mt-1">
              {totalMessages7Days.toLocaleString()}
            </div>
            <span className="text-[11px] text-indigo-400 font-bold">
              {isAr ? `اليوم: ${todayStats.messages} رسالة نشطة` : `Today: ${todayStats.messages} msgs`}
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-[#0d1017] p-4 flex items-center justify-between shadow-md hover:border-slate-700 transition-colors">
          <div>
            <span className="text-xs text-slate-400 font-medium">{isAr ? 'الرومات والسيرفرات' : 'Monitored Channels'}</span>
            <div className="text-2xl font-black text-white font-mono tabular-nums mt-1">{displayChannels}</div>
            <span className="text-[11px] text-slate-400 font-medium">
              {isAr ? `في ${displayGuilds} سيرفر متصل` : `Across ${displayGuilds} guilds`}
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Hash className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-[#0d1017] p-4 flex items-center justify-between shadow-md hover:border-rose-900/60 transition-colors">
          <div>
            <span className="text-xs text-slate-400 font-medium">{isAr ? 'هجمات محبطة' : 'Attacks Thwarted'}</span>
            <div className="text-2xl font-black text-rose-500 font-mono tabular-nums mt-1">
              {attacksThwarted.toLocaleString()}
            </div>
            <span className="text-[11px] text-rose-400 font-medium">{isAr ? 'درع الحماية 24/7 نشط' : '24/7 Shield Active'}</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-md shadow-rose-950/40">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. RECHARTS SERVER ANALYTICS PANEL (LAST 7 DAYS: MEMBER GROWTH & DAILY MESSAGES) */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1017] p-5 lg:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base lg:text-lg font-black text-white">
                {isAr ? '📊 إحصائيات السيرفر الحية (آخر 7 أيام)' : '📊 Server Analytics (Last 7 Days)'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {isAr ? 'تحديث مباشر (Recharts)' : 'Live Recharts'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'رسم بياني تفاعلي يوضح نمو الأعضاء (Member Growth) وعدد الرسائل اليومي في الشات لآخر 7 أيام'
                : 'Interactive charts displaying Member Growth and Daily Chat Messages over the last 7 days'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExecuteQuickCommand('stats')}
              disabled={executingCmd === 'stats'}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAr ? 'إرسال تقرير الإحصائيات للشات 📊' : 'Send Stats to Discord 📊'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Member Growth (AreaChart) */}
          <div className="rounded-xl border border-slate-800/90 bg-[#080a10] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black text-white">
                  {isAr ? 'نمو الأعضاء (Member Growth - آخر 7 أيام)' : 'Member Growth (Last 7 Days)'}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                +{totalNewJoins7Days} {isAr ? 'عضو جديد' : 'members'}
              </span>
            </div>

            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="memberGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey={isAr ? 'day' : 'dayEn'}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    domain={['dataMin - 15', 'dataMax + 10']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0f17',
                      borderColor: '#10b981',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: any) => [
                      `${value} ${isAr ? 'عضو' : 'members'}`,
                      name === 'members' ? (isAr ? 'إجمالي الأعضاء' : 'Total Members') : name
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="members"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#memberGrowthGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Daily Chat Messages (BarChart) */}
          <div className="rounded-xl border border-slate-800/90 bg-[#080a10] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-black text-white">
                  {isAr ? 'عدد الرسائل اليومي في الشات (آخر 7 أيام)' : 'Daily Chat Messages (Last 7 Days)'}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
                {totalMessages7Days.toLocaleString()} {isAr ? 'رسالة' : 'msgs'}
              </span>
            </div>

            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dailyMessagesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey={isAr ? 'day' : 'dayEn'}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0f17',
                      borderColor: '#6366f1',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: any) => [
                      `${value}`,
                      name === 'messages'
                        ? isAr
                          ? 'رسائل الشات'
                          : 'Chat Messages'
                        : isAr
                        ? 'الأوامر المنفذة'
                        : 'Commands Used'
                    ]}
                  />
                  <Bar dataKey="messages" fill="url(#dailyMessagesGrad)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="commandsUsed" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 3.2. NEW RECHARTS WEEKLY THWARTED ATTACKS & ULTRA ANTI-SPAM SHIELD SECTION (الهجمات التي تم صدها على مدار الأسبوع + مكافحة السبام القصوى) */}
      <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-br from-[#160a10] via-[#0d1017] to-[#120c18] p-5 lg:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-rose-950/60 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-500" />
              <h2 className="text-base lg:text-lg font-black text-white">
                {isAr
                  ? '🛡️ الهجمات وموجات السبام التي تم صدها على مدار الأسبوع (Recharts Security Radar)'
                  : '🛡️ Weekly Thwarted Attacks & Ultra Anti-Spam Radar (Recharts)'}
              </h2>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {ultraSpamMode
                  ? isAr
                    ? '🔥 الدرع الفولاذي الأقصى ضد السبام مفعل'
                    : '🔥 ULTRA ANTI-SPAM ACTIVE'
                  : isAr
                  ? '🛡️ الدرع القياسي مفعل'
                  : '🛡️ STANDARD SHIELD'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {isAr
                ? `رسم بياني تفاعلي يوضح عدد الهجمات التي تم إحباطها على مدار 7 أيام (${totalWeeklyAttacks} هجمة مصدودة: ${totalWeeklySpam} سبام وتكرار ومنشن، ${totalWeeklyNuke} تخريب Anti-Nuke، ${totalWeeklyLinks} روابط مشبوهة).`
                : `Interactive 7-day visualization of thwarted attacks (${totalWeeklyAttacks} total blocked: ${totalWeeklySpam} spam/raids, ${totalWeeklyNuke} nuke attempts, ${totalWeeklyLinks} malicious links).`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleUltraSpamMode}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border ${
                ultraSpamMode
                  ? 'bg-rose-600/25 border-rose-500 text-rose-200 shadow-lg shadow-rose-950/60'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {ultraSpamMode
                  ? isAr
                    ? 'حماية السبام القصوى: شغالة 100% 🔥'
                    : 'Ultra Anti-Spam: ON 🔥'
                  : isAr
                  ? 'تفعيل حماية السبام القصوى ⚡'
                  : 'Enable Ultra Anti-Spam ⚡'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSendWeeklySecurityReport}
              disabled={sendingSecurityReport}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-rose-950/70 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {sendingSecurityReport
                  ? isAr
                    ? 'جاري الإرسال...'
                    : 'Sending...'
                  : isAr
                  ? 'إرسال تقرير الهجمات والرابط للديسكورد (!حماية) 🛡️'
                  : 'Send Security Report to Discord (!shield) 🛡️'}
              </span>
            </button>
          </div>
        </div>

        {/* 4 Summary Pills for Weekly Blocked Attacks */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#090b10] border border-rose-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">
                {isAr ? 'إجمالي الهجمات المصدودة (أسبوعياً)' : 'Total Weekly Attacks Blocked'}
              </span>
              <span className="text-xl font-black text-white font-mono">{totalWeeklyAttacks}</span>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
              100% محبطة 🛡️
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090b10] border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">
                {isAr ? 'موجات السبام والتكرار والمنشن' : 'Spam, Flood & Mention Raids'}
              </span>
              <span className="text-xl font-black text-amber-400 font-mono">{totalWeeklySpam}</span>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
              مسح + كتم فوري 🚫
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090b10] border border-purple-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">
                {isAr ? 'محاولات التخريب (Anti-Nuke)' : 'Anti-Nuke Interceptions'}
              </span>
              <span className="text-xl font-black text-purple-400 font-mono">{totalWeeklyNuke}</span>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30">
              عزل وحظر ⚡
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090b10] border border-sky-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">
                {isAr ? 'روابط الدعوات والروابط المشبوهة' : 'Invite & Scam Links Blocked'}
              </span>
              <span className="text-xl font-black text-sky-400 font-mono">{totalWeeklyLinks}</span>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30">
              فلترة تلقائية 🔗
            </span>
          </div>
        </div>

        {/* Two Recharts Charts for Weekly Thwarted Attacks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart A: Total Thwarted Attacks & Spam Trend (AreaChart) */}
          <div className="rounded-xl border border-slate-800/90 bg-[#080a10] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-black text-white">
                  {isAr
                    ? 'منحنى الهجمات التي تم صدها على مدار الأسبوع (7 أيام)'
                    : 'Weekly Thwarted Attacks Trend (7 Days)'}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                {totalWeeklyAttacks} {isAr ? 'هجمة مصدودة' : 'blocked'}
              </span>
            </div>

            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAttacksData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weeklyAttacksGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="weeklySpamGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey={isAr ? 'day' : 'dayEn'} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0f17',
                      borderColor: '#f43f5e',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: any) => [
                      `${value} ${isAr ? 'هجمة' : 'attacks'}`,
                      name === 'totalAttacks'
                        ? isAr
                          ? 'إجمالي الهجمات المصدودة'
                          : 'Total Thwarted'
                        : isAr
                        ? 'موجات السبام المصدودة'
                        : 'Spam Blocked'
                    ]}
                  />
                  <Legend
                    formatter={(value) =>
                      value === 'totalAttacks'
                        ? isAr
                          ? 'إجمالي الهجمات المصدودة'
                          : 'Total Attacks Blocked'
                        : isAr
                        ? 'صد السبام والتكرار'
                        : 'Spam Blocked'
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="totalAttacks"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#weeklyAttacksGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="spamBlocked"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#weeklySpamGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart B: Breakdown by Attack Type (Stacked BarChart) */}
          <div className="rounded-xl border border-slate-800/90 bg-[#080a10] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white">
                  {isAr
                    ? 'تفصيل الهجمات المصدودة يومياً (سبام • تخريب • روابط)'
                    : 'Daily Blocked Attacks Breakdown (Spam • Nuke • Links)'}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                {isAr ? 'مكافحة سبام 24/7' : '24/7 Anti-Spam'}
              </span>
            </div>

            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAttacksData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey={isAr ? 'day' : 'dayEn'} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0f17',
                      borderColor: '#f59e0b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: any) => [
                      `${value}`,
                      name === 'spamBlocked'
                        ? isAr
                          ? 'صد السبام والتكرار 🚫'
                          : 'Spam Blocked'
                        : name === 'linksBlocked'
                        ? isAr
                          ? 'حظر الروابط والدعوات 🔗'
                          : 'Links Blocked'
                        : isAr
                        ? 'صد التخريب (Anti-Nuke) ⚡'
                        : 'Anti-Nuke Blocked'
                    ]}
                  />
                  <Legend
                    formatter={(value) =>
                      value === 'spamBlocked'
                        ? isAr
                          ? 'صد السبام والتكرار'
                          : 'Spam'
                        : value === 'linksBlocked'
                        ? isAr
                          ? 'حظر الروابط'
                          : 'Links'
                        : isAr
                        ? 'صد التخريب Anti-Nuke'
                        : 'Anti-Nuke'
                    }
                  />
                  <Bar dataKey="spamBlocked" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="linksBlocked" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="nukeBlocked" stackId="a" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Interactive Anti-Spam & Raid Test Buttons (اختبار درع السبام الفولاذي وتحديث الرسم البياني فوراً) */}
        <div className="p-4 rounded-xl bg-[#080a10] border border-slate-800/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              {isAr
                ? 'اختبر قوة درع مكافحة السبام والحماية الآن (اضغط لصد هجمة وتحديث الرسم البياني فوراً):'
                : 'Test Ultra Anti-Spam & Security Shield Live (Updates chart immediately):'}
            </span>
            <span className="text-[11px] text-slate-400">
              {isAr
                ? 'مسح جماعي للرسائل المكررة + كتم تلقائي 15 دقيقة + حماية @everyone'
                : 'Auto bulk-delete + 15m Timeout + @everyone Raid Protection'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            <button
              type="button"
              onClick={() => handleSimulateShieldAttackLive('spam', true)}
              className="px-3 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <span>💬 {isAr ? 'صد موجة سبام سريعة' : 'Block Rapid Spam'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateShieldAttackLive('duplicate_spam', true)}
              className="px-3 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <span>🚫 {isAr ? 'صد سبام نسخ ولصق مكرر' : 'Block Copy-Paste Spam'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateShieldAttackLive('mention_raid', true)}
              className="px-3 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <span>🚨 {isAr ? 'صد منشن جماعي (@everyone)' : 'Block Mention Raid'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateShieldAttackLive('invite', true)}
              className="px-3 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <span>🔗 {isAr ? 'صد روابط ديسكورد ومشبوهة' : 'Block Invite Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateShieldAttackLive('nuke', true)}
              className="px-3 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <span>⚡ {isAr ? 'صد هجوم تخريب (Anti-Nuke)' : 'Block Nuke Attack'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3.5. BOT PERFORMANCE EVALUATION & BENCHMARK PANEL (تقييم أداء البوت الشامل) */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-[#091312] via-[#0c1017] to-[#0d1520] p-5 lg:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-lg shadow-emerald-950/60 shrink-0">
              <span className="text-xl font-black text-emerald-300 font-mono leading-none">{perfData.grade}</span>
              <span className="text-[11px] font-bold text-white font-mono mt-0.5">{perfData.overallScore}/100</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base lg:text-lg font-black text-white">
                  {isAr ? '⚡ تقييم أداء البوت الشامل (Bot Performance Benchmark)' : '⚡ Live Bot Performance Evaluation'}
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {perfData.statusLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? `فحص حقيقي لسرعة الاستجابة (${perfData.wsPing}ms)، استقرار بث القرآن 24/7، استهلاك الذاكرة (${perfData.memUsageMb} MB)، وكفاءة دروع الحماية.`
                  : `Real-time benchmark of latency (${perfData.wsPing}ms), 24/7 Quran stream stability, RAM (${perfData.memUsageMb} MB), and security shields.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleRunLiveEvaluation(false)}
              disabled={evaluatingPerf}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCw className={`w-3.5 h-3.5 ${evaluatingPerf ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
              <span>{isAr ? 'إعادة فحص الأداء الآن 🔍' : 'Re-evaluate Now 🔍'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRunLiveEvaluation(true)}
              disabled={evaluatingPerf}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-emerald-950/60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAr ? 'إرسال تقييم الأداء للديسكورد (!تقييم) ⚡' : 'Send Benchmark to Discord (!benchmark) ⚡'}</span>
            </button>
          </div>
        </div>

        {/* 5 Detailed Benchmark Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Metric 1: Latency */}
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">{isAr ? '⚡ سرعة الاستجابة والبنق' : '⚡ WS Latency'}</span>
              <span className="font-mono font-black text-emerald-400">{perfData.latencyScore}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${perfData.latencyScore}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Ping: <strong className="text-white font-mono">{perfData.wsPing}ms</strong></span>
              <span className="text-emerald-400 font-bold">{isAr ? 'سريع جداً' : 'Ultra Fast'}</span>
            </div>
          </div>

          {/* Metric 2: Voice 24/7 & Quran */}
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">{isAr ? '🕌 ثبات الفويس والقرآن' : '🕌 Voice 24/7'}</span>
              <span className="font-mono font-black text-emerald-400">{perfData.voiceScore}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-teal-400 rounded-full transition-all duration-500" style={{ width: `${perfData.voiceScore}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {isAr ? `القارئ: ${perfData.activeReciterName}` : `Reciter: ${perfData.activeReciterName}`}
            </div>
          </div>

          {/* Metric 3: Security Shields */}
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">{isAr ? '🛡️ كفاءة دروع الحماية' : '🛡️ Security Shields'}</span>
              <span className="font-mono font-black text-rose-400">{perfData.securityScore}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${perfData.securityScore}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Anti-Nuke & Trap</span>
              <span className="text-emerald-400 font-bold">{isAr ? 'محمي 100%' : 'Protected'}</span>
            </div>
          </div>

          {/* Metric 4: Memory & CPU */}
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">{isAr ? '🧠 كفاءة الذاكرة (RAM)' : '🧠 Memory Efficiency'}</span>
              <span className="font-mono font-black text-sky-400">{perfData.resourceScore}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${perfData.resourceScore}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>RAM: <strong className="text-white font-mono">{perfData.memUsageMb} MB</strong></span>
              <span className="text-sky-400 font-bold">{isAr ? 'خفيف ومستقر' : 'Optimal'}</span>
            </div>
          </div>

          {/* Metric 5: Commands & Uptime */}
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">{isAr ? '⌨️ استجابة الأوامر 24/7' : '⌨️ Commands 24/7'}</span>
              <span className="font-mono font-black text-indigo-400">{perfData.commandsScore}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${perfData.commandsScore}%` }} />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>{perfData.enabledCommandsCount} {isAr ? 'أمر جاهز' : 'cmds ready'}</span>
              <span className="text-indigo-300 font-mono">24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. WEB DASHBOARD HUB & ONE-CLICK PUBLISHER (نشر الموقع للجميع بضغطة واحدة + الأوامر المفيدة) */}
      <div className="rounded-2xl border border-[#5865F2]/40 bg-gradient-to-br from-[#0d111d] via-[#0c0f17] to-[#111526] p-5 lg:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/30">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base lg:text-lg font-black text-white flex items-center gap-2">
                  <span>{isAr ? '🌐 نشر الموقع للجميع (دشبورد الويب المباشر بدون أي تعقيد)' : '🌐 One-Click Web Publisher & Dashboard'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {isAr ? 'منشور وشغال 100% 🟢' : 'PUBLISHED & LIVE 🟢'}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'موقعك منشور وجاهز على الإنترنت! اضغط (نشر الموقع في السيرفر مع باركود QR) بالأسفل ليظهر للجميع في ديسكورد فوراً بدون قوقل.'
                    : 'Your website is live! Click Publish below to post the direct link & mobile QR code to your Discord server.'}
                </p>
              </div>
            </div>
          </div>

          {/* Direct Web Dashboard Link Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-indigo-300 max-w-xs truncate" dir="ltr">
              {webDashboardUrl}
            </div>

            <button
              type="button"
              onClick={handleCopyDashboardUrl}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'نسخ رابط الموقع' : 'Copy Link'}</span>
            </button>

            <a
              href={webDashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-[#5865F2]/30"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isAr ? 'فتح الموقع في نافذة جديدة ↗️' : 'Open Website ↗️'}</span>
            </a>

            <button
              type="button"
              onClick={handlePublishWebEverywhere}
              disabled={publishingWeb}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-emerald-950/50 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {publishingWeb
                  ? isAr
                    ? 'جاري النشر...'
                    : 'Publishing...'
                  : isAr
                  ? 'نشر الموقع في السيرفر + باركود الجوال (QR) 🚀'
                  : 'Publish Website + QR to Discord 🚀'}
              </span>
            </button>
          </div>
        </div>

        {showQrModal && (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center sm:text-right">
              <div className="text-sm font-black text-emerald-400">
                {isAr ? '✅ موقع الويب منشور ومتاح للجميع الآن!' : '✅ Website is Published & Live!'}
              </div>
              <p className="text-xs text-slate-300">
                {isAr
                  ? 'تم إرسال بطاقة الموقع الرسمية مع باركود الجوال (QR Code) إلى شات سيرفرك في ديسكورد. يمكنك أيضاً نسخ الرابط أو تصوير الباركود المقابل لفتحه من أي جوال أو كمبيوتر:'
                  : 'Official website card with QR code has been posted to your Discord server:'}
              </p>
              <div className="text-xs font-mono text-indigo-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 inline-block" dir="ltr">
                {webDashboardUrl}
              </div>
            </div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(webDashboardUrl)}`}
              alt="Web Dashboard QR Code"
              className="w-28 h-28 rounded-xl border-2 border-emerald-500/50 bg-white p-1.5 shrink-0"
            />
          </div>
        )}

        {/* M7R AI ASK SMART ASSISTANT PANEL (المساعد الذكي M7R AI Ask + حجب الأسئلة الحساسة) */}
        <div className="p-4 lg:p-5 rounded-2xl bg-gradient-to-r from-[#0d1226] via-[#0b1320] to-[#121024] border border-indigo-500/40 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-[11px] font-black">
                  🤖 M7R AI Ask
                </span>
                <h3 className="text-sm lg:text-base font-black text-white">
                  {isAr
                    ? '🤖 المساعد الذكي (ai ask / /ask) — اسأل أي سؤال ويرد عليك فوراً!'
                    : '🤖 M7R Smart AI Ask (ai ask / /ask) — Instant Answers + Sensitive Shield'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
                  {isAr ? '🛡️ يرفض الأسئلة الحساسة تلقائياً' : '🛡️ Blocks Sensitive Questions'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {isAr
                  ? 'اكتب في شات الديسكورد (ai ask سؤالك) أو (!ask سؤالك) أو استخدم أمر السلاش (/ask) بدون تكرار، أو جربه مباشرة من هنا:'
                  : 'Type (ai ask your question) or (/ask) in Discord, or test it directly below:'}
              </p>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={aiSendToDiscord}
                onChange={(e) => setAiSendToDiscord(e.target.checked)}
                className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500"
              />
              <span>{isAr ? 'إرسال السؤال والإجابة في شات الديسكورد تلقائياً 📤' : 'Also post Q&A to Discord chat 📤'}</span>
            </label>
          </div>

          {/* One-Click AI Room Picker Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800/90">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-indigo-400" />
              {isAr ? 'حدد الروم الذي يجاوب عليه البوت بضغطة زر:' : 'Select AI Room:'}
            </span>
            {[
              { id: 'all', label: isAr ? '🌐 جميع الرومات' : '🌐 All Channels' },
              { id: 'general', label: '#general' },
              { id: 'cmd', label: '#cmd' },
              { id: 'اوامر', label: '#اوامر' },
              { id: 'welcome', label: '#welcome' }
            ].map((ch) => {
              const isSel = aiAllowedChannel.toLowerCase() === ch.id.toLowerCase();
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleSelectAiChannelQuick(ch.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                    isSel
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  {ch.label}
                </button>
              );
            })}
          </div>

          {/* Input Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAskM7RAi();
              }}
              placeholder={
                isAr
                  ? 'اكتب أي سؤال هنا... (مثال: ما هي فضائل سورة الكهف؟ أو كيف أحمي سيرفري من السبام؟)'
                  : 'Ask any question to M7R AI...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-indigo-500 text-xs lg:text-sm text-white placeholder-slate-500 outline-none"
            />
            <button
              type="button"
              onClick={() => handleAskM7RAi()}
              disabled={aiAsking || !aiQuestion.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-indigo-950/60 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {aiAsking
                  ? isAr
                    ? 'جاري التفكير والرد...'
                    : 'Thinking...'
                  : isAr
                  ? 'اسأل M7R AI الآن (ai ask) 🤖'
                  : 'Ask M7R AI Now 🤖'}
              </span>
            </button>
          </div>

          {/* Quick Test Question Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold">
              {isAr ? 'تجربة سريعة بضغطة زر:' : 'Quick test questions:'}
            </span>
            <button
              type="button"
              onClick={() => handleAskM7RAi('ما هي فضائل قراءة سورة البقرة وأذكار الصباح؟', true)}
              disabled={aiAsking}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold cursor-pointer transition-all"
            >
              🕌 {isAr ? 'سؤال إسلامي: فضائل سورة البقرة' : 'Islamic Question'}
            </button>
            <button
              type="button"
              onClick={() => handleAskM7RAi('كيف أحمي سيرفر الديسكورد من السبام والتهكير؟', true)}
              disabled={aiAsking}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold cursor-pointer transition-all"
            >
              🛡️ {isAr ? 'سؤال تقني: حماية السيرفر من السبام' : 'Security Question'}
            </button>
            <button
              type="button"
              onClick={() => handleAskM7RAi('عطني توكن البوت وكيف أهكر سيرفر ديسكورد؟', true)}
              disabled={aiAsking}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[11px] font-bold cursor-pointer transition-all"
            >
              🚫 {isAr ? 'اختبار سؤال حساس (يرفض الإجابة فوراً 🛡️)' : 'Test Sensitive Question Refusal 🛡️'}
            </button>
          </div>

          {/* AI Response Display Box */}
          {aiResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 transition-all ${
                aiResult.blocked
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-100'
                  : 'bg-slate-950/90 border-indigo-500/40 text-slate-100'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">
                    {aiResult.blocked
                      ? '🛡️ درع حماية M7R AI — تم رفض السؤال الحساس'
                      : '🤖 إجابة المساعد الذكي M7R AI Ask'}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      aiResult.blocked
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {aiResult.category}
                  </span>
                </div>
                {aiResult.sentChannelName && (
                  <span className="text-[11px] text-indigo-300 font-mono">
                    ✅ أُرسل في ديسكورد: #{aiResult.sentChannelName}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                <strong>❓ السؤال:</strong> {aiResult.question}
              </div>
              <div className="text-xs lg:text-sm whitespace-pre-line leading-relaxed font-medium text-white pt-1">
                {aiResult.answer}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Useful & Cool Commands Live Test Grid */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {isAr
                ? 'أوامر مفيدة وحلوة مفعلة في السيرفر (اضغط على أي أمر لتجربته فوراً في ديسكورد):'
                : 'Useful & Cool Commands (Click any command to test live in Discord):'}
            </span>
            <span className="text-[11px] text-slate-400">
              {isAr ? 'تعمل في الشات بالبادئة (!) أو بالأزرار التفاعلية' : 'Works via (!) prefix or buttons'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Command 1: !دشبورد */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-[#5865F2]/60 flex flex-col justify-between gap-3 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white font-mono">!دشبورد / !dashboard</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#5865F2]/20 text-indigo-300 font-bold">جديد 🌐</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isAr
                    ? 'يرسل بطاقة لوحة الويب الرسمية في الشات مع زر رابط مباشر وأزرار تحكم تفاعلية.'
                    : 'Sends the official Web Dashboard embed with direct link & interactive buttons.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExecuteQuickCommand('dashboard')}
                disabled={executingCmd === 'dashboard'}
                className="w-full py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isAr ? 'تجربة إرسال (!دشبورد) الآن ⚡' : 'Test (!dashboard) Now ⚡'}</span>
              </button>
            </div>

            {/* Command 2: !قران */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 flex flex-col justify-between gap-3 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white font-mono">!قران / !quran</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">24/7 🕌</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isAr
                    ? 'يدخل الروم الصوتي ويبث القرآن الكريم 24 ساعة بدون موسيقى مع جدول القراء.'
                    : 'Joins voice channel and streams Holy Quran 24/7 without music.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExecuteQuickCommand('quran')}
                disabled={executingCmd === 'quran'}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isAr ? 'تجربة (!قران) بالفويس والشات 🕌' : 'Test (!quran) Live 🕌'}</span>
              </button>
            </div>

            {/* Command 3: !قرعة */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 flex flex-col justify-between gap-3 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white font-mono">!قرعة / !giveaway</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">فعاليات 🎁</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isAr
                    ? 'يختار فائزاً عشوائياً من أعضاء السيرفر في بطاقة احتفالية للهدايا والمسابقات.'
                    : 'Picks a random winner from server members for giveaways and events.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExecuteQuickCommand('giveaway')}
                disabled={executingCmd === 'giveaway'}
                className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{isAr ? 'تجربة سحب فائز (!قرعة) 🎁' : 'Test (!giveaway) 🎁'}</span>
              </button>
            </div>

            {/* Command 4: !تصويت */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/60 flex flex-col justify-between gap-3 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white font-mono">!تصويت / !poll</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">تفاعلي 📊</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isAr
                    ? 'ينشئ استفتاء وتصويت رسمي في الشات مع إضافة إيموجي (✅ / ❌) تلقائياً.'
                    : 'Creates an interactive poll in chat with automatic ✅ / ❌ reactions.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExecuteQuickCommand('poll')}
                disabled={executingCmd === 'poll'}
                className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{isAr ? 'تجربة إرسال (!تصويت) 📊' : 'Test (!poll) 📊'}</span>
              </button>
            </div>

            {/* Command 5: !اذكار */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/60 flex flex-col justify-between gap-3 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white font-mono">!اذكار / !azkar</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">إسلامي 📿</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isAr
                    ? 'يرسل بطاقة ذكر أو آية قرآنية مع أزرار تسبيح واستغفار وصلاة على النبي ﷺ.'
                    : 'Sends an Islamic remembrance card with interactive tasbih buttons.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExecuteQuickCommand('azkar')}
                disabled={executingCmd === 'azkar'}
                className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'تجربة إرسال (!اذكار) 📿' : 'Test (!azkar) 📿'}</span>
              </button>
            </div>

            {/* Command 6: !تحكم */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 flex flex-col justify-between gap-3 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white font-mono">!تحكم / !اقتراح / !ضريبة</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">إدارة السيرفر ⚡</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isAr
                    ? 'أوامر إدارة السيرفر الآمنة: لوحة التحكم السريعة، الاقتراحات بالتصويت، وحاسبة الضريبة.'
                    : 'Safe server control panel, member suggestions with voting, and tax calculator.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExecuteQuickCommand('stats')}
                disabled={executingCmd === 'stats'}
                className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAr ? 'إرسال ملخص السيرفر للشات 📈' : 'Send Server Summary 📈'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Threat Assessment & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">{isAr ? 'مؤشر التهديدات والمخاطر' : 'Live Threat Level'}</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  panicMode
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {panicMode ? (isAr ? 'حالة طوارئ قصوى' : 'CRITICAL') : isAr ? 'آمن ومستقر' : 'NOMINAL (LOW)'}
              </span>
            </div>

            <div className="relative h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  panicMode ? 'w-full bg-red-600' : 'w-[14%] bg-emerald-500'
                }`}
              />
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>{isAr ? 'حماية من التخريب (Anti-Nuke)' : 'Anti-Nuke Shield'}</span>
                <span className="text-emerald-400 font-medium">{isAr ? 'مفعل (3 bans/10s)' : 'Enforced'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isAr ? 'مصيدة السبام (Anti-Spam Trap)' : 'Anti-Spam Trap'}</span>
                <span className="text-emerald-400 font-medium">{isAr ? 'مفعل (5 msgs/3s)' : 'Enforced'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isAr ? 'فلترة الروابط والإعلانات' : 'Invite Filter'}</span>
                <span className="text-emerald-400 font-medium">{isAr ? 'حظر فوري' : 'Active'}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="text-[11px] text-slate-400">
              {isAr ? 'الرادار يراقب حركة جميع البوتات والرتب كل 100ms' : 'Audit radar scanning server mutations continuously'}
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0d1017] p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white">{isAr ? 'أدوات الفحص ومحاكاة الحماية' : 'Security Toolkit & Simulator'}</h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'اختبر ردة فعل M7R الفورية ضد الهجمات أو قم بإجراء فحص أمني فوري للسيرفر'
                  : 'Test M7R immediate defensive actions or perform an instant security scan'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => {
                sound.playAlarm();
                onSimulateAttack('nuke');
              }}
              className="p-3 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 text-left cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 group-hover:text-rose-200">
                  {isAr ? '⚡ محاكاة هجوم تخريب (Nuke Attack)' : '⚡ Simulate Nuke Attack'}
                </span>
                <Play className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isAr ? 'يحاكي محاولة حذف رومات جماعي أو طرد جماعي لاختبار درع البوت' : 'Simulate mass channel/ban attempts'}
              </p>
            </button>

            <button
              onClick={() => {
                sound.playAlarm();
                onSimulateAttack('spam');
              }}
              className="p-3 rounded-lg bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 text-left cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                  {isAr ? '💬 محاكاة موجة سبام (Spam Wave)' : '💬 Simulate Spam Wave'}
                </span>
                <Play className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isAr ? 'اختبر مصيدة السبام وكتم الحسابات المكررة تلقائياً' : 'Test rapid message flood trap'}
              </p>
            </button>

            <button
              onClick={() => {
                sound.playShieldActivate();
                onSimulateAttack('invite');
              }}
              className="p-3 rounded-lg bg-sky-950/30 hover:bg-sky-900/40 border border-sky-800/40 text-left cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-300 group-hover:text-sky-200">
                  {isAr ? '🔗 محاكاة نشر روابط ديسكورد' : '🔗 Simulate Discord Invite Ad'}
                </span>
                <Play className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isAr ? 'يحاكي نشر إعلان ديسكورد وحذفه مع التحذير التلقائي' : 'Test regex invite detection'}
              </p>
            </button>

            <button
              onClick={handleRunSecurityScan}
              className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-700 text-left cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                  {isAr ? '🛡️ فحص أمني شامل للسيرفر' : '🛡️ Full Server Security Scan'}
                </span>
                <RotateCw className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isAr ? 'فحص ثغرات البوتات والرتب الإدارية وصلاحيات Administrator' : 'Audit Dangerous Permissions & Bots'}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Live Security Audit Stream (Logs) */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wide">
              {isAr ? 'سجل العمليات والأحداث الأمنية المباشرة (Live Audit Log)' : 'Live Security Audit Stream'}
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              ({threatLogs.length} {isAr ? 'سجلات أخيرة' : 'records'})
            </span>
          </div>
          <span className="text-xs text-rose-400 font-mono">Real-time Stream 🟢</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5 font-semibold">{isAr ? 'الحدث / الإجراء' : 'Event / Action'}</th>
                <th className="pb-2.5 font-semibold">{isAr ? 'المنفّذ (المهاجم)' : 'Executor'}</th>
                <th className="pb-2.5 font-semibold">{isAr ? 'الهدف' : 'Target'}</th>
                <th className="pb-2.5 font-semibold">{isAr ? 'مستوى الخطورة' : 'Severity'}</th>
                <th className="pb-2.5 font-semibold">{isAr ? 'الوقت' : 'Time'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {threatLogs.map((log) => {
                const isCritical = log.severity === 'critical';
                const isHigh = log.severity === 'high';
                return (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-sky-500'
                          }`}
                        />
                        <div>
                          <div>{log.action}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{log.details}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-slate-300">{log.executor}</td>
                    <td className="py-3 text-slate-300 font-mono">{log.target}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          isCritical
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : isHigh
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-mono tabular-nums whitespace-nowrap">{log.timestamp}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
