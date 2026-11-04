import React, { useState, useEffect } from 'react';
import {
  Bot,
  Hash,
  Send,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Zap,
  MessageSquare,
  Plus,
  Trash2,
  Save,
  RotateCw
} from 'lucide-react';
import { ChannelSelector } from './ChannelSelector';
import { GuildChannelItem } from '../types';
import { sound } from '../utils/sound';

export interface AiChatbotConfigState {
  enabled: boolean;
  allowedChannel: string;
  autoReplyInChannelWithoutPrefix: boolean;
  blockSensitiveQuestions: boolean;
  responseTone: 'concise' | 'detailed' | 'friendly';
  customRefusalMessage: string;
  customBlockedWords: string[];
  totalQuestionsAnswered: number;
  totalSensitiveBlocked: number;
}

export interface AiChatHistoryRecord {
  id: string;
  question: string;
  answer: string;
  asker: string;
  channelName: string;
  blocked: boolean;
  category: string;
  modelUsed: string;
  timestamp: string;
}

interface AiChatbotTabProps {
  lang: 'ar' | 'en';
}

const DEFAULT_CONFIG: AiChatbotConfigState = {
  enabled: true,
  allowedChannel: 'all',
  autoReplyInChannelWithoutPrefix: true,
  blockSensitiveQuestions: true,
  responseTone: 'friendly',
  customRefusalMessage:
    '🛡️ يا غالي، هذا السؤال مصنف ضمن الأسئلة الحساسة أو المحظورة أمنياً، ولذلك يمتنع بوت M7R اللطيف عن الإجابة عليه حفاظاً على أمان السيرفر 🤍✨',
  customBlockedWords: ['توكن', 'باسورد', 'تهكير', 'اختراق', 'نوك', 'تفجير سيرفر', 'سحب ايبي', 'طائفية'],
  totalQuestionsAnswered: 24,
  totalSensitiveBlocked: 7
};

const FALLBACK_TEXT_CHANNELS: GuildChannelItem[] = [
  { id: 'ch-1', name: 'general', type: 'text' },
  { id: 'ch-2', name: 'cmd', type: 'text' },
  { id: 'ch-3', name: 'اوامر', type: 'text' },
  { id: 'ch-4', name: 'welcome', type: 'text' },
  { id: 'ch-5', name: 'tickets', type: 'text' },
  { id: 'ch-6', name: 'اذكار', type: 'text' }
];

// Client-side pre-check so the UI also highlights sensitive questions immediately
const CLIENT_SENSITIVE_PATTERNS: RegExp[] = [
  /توكن|token|باسورد|كلمه سر|كلمة سر|password|secret key|api key|مفتاح سري/i,
  /اختراق|تهكير|هكر|هاكر|hack|exploit|ddos|dox|دوكس|سحب ايبي|ip grabber|كراك/i,
  /تفجير سيرفر|تخريب سيرفر|نوك|nuke bot|raid bot|سبام بوت|كيف اخرب|كيف اهكر|سرقة حساب/i,
  /سياسه|سياسة|طائفيه|طائفية|عنصريه|عنصرية|الحاد|إلحاد|سب |شتم |قذف /i,
  /اباحي|إباحي|جنس|مخدرات|حشيش|انتحار|قتل|سلاح|قنبله|قنبلة|قمار|ربا/i
];

export const AiChatbotTab: React.FC<AiChatbotTabProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [config, setConfig] = useState<AiChatbotConfigState>(DEFAULT_CONFIG);
  const [history, setHistory] = useState<AiChatHistoryRecord[]>([]);
  const [serverChannels, setServerChannels] = useState<GuildChannelItem[]>(FALLBACK_TEXT_CHANNELS);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [sendToDiscord, setSendToDiscord] = useState(true);
  const [newBlockedWord, setNewBlockedWord] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
  };

  const loadAiData = async () => {
    try {
      const [resCfg, resCh] = await Promise.all([
        fetch('/api/ai/config'),
        fetch('/api/guild/channels')
      ]);
      const cfgData = await resCfg.json();
      if (cfgData?.config) {
        setConfig(cfgData.config);
      }
      if (Array.isArray(cfgData?.history)) {
        setHistory(cfgData.history);
      }
      const chData = await resCh.json();
      if (Array.isArray(chData?.channels) && chData.channels.length > 0) {
        const textOnly = chData.channels.filter((c: GuildChannelItem) => c.type === 'text');
        if (textOnly.length > 0) {
          setServerChannels(textOnly);
        }
      }
    } catch {
      // keep defaults
    }
  };

  useEffect(() => {
    loadAiData();
  }, []);

  const saveConfigToServer = async (nextConfig: AiChatbotConfigState, customToast?: string) => {
    setConfig(nextConfig);
    setSavingConfig(true);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig)
      });
      const data = await res.json();
      if (data?.config) {
        setConfig(data.config);
      }
      showToast(customToast || data?.message || (isAr ? '✅ تم حفظ إعدادات الذكاء الاصطناعي فوراً!' : '✅ AI settings saved!'));
    } catch {
      showToast(isAr ? '⚠️ تعذر حفظ الإعدادات.' : '⚠️ Failed to save settings.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleQuickSelectChannel = (channelName: string) => {
    const clean = (channelName || 'all').replace(/^#/, '').trim() || 'all';
    const next = { ...config, allowedChannel: clean };
    const msg =
      clean === 'all'
        ? isAr
          ? '🌐 تم تفعيل رد الذكاء الاصطناعي M7R AI في جميع رومات السيرفر!'
          : '🌐 M7R AI enabled in all server channels!'
        : isAr
        ? `🎯 تم تحديد روم #${clean} ليكون روم الذكاء الاصطناعي M7R AI فوراً!`
        : `🎯 Channel #${clean} selected for M7R AI!`;
    saveConfigToServer(next, msg);
  };

  const isInputSensitiveLive = (() => {
    const q = question.trim();
    if (!q) return false;
    if (CLIENT_SENSITIVE_PATTERNS.some((p) => p.test(q))) return true;
    return config.customBlockedWords.some((w) => w && q.toLowerCase().includes(w.toLowerCase()));
  })();

  const handleAskQuestion = async (presetQuestion?: string) => {
    const qText = (presetQuestion ?? question).trim();
    if (!qText) return;
    if (presetQuestion) setQuestion(presetQuestion);

    setAsking(true);
    sound.playShieldActivate();
    try {
      const targetCh = config.allowedChannel && config.allowedChannel !== 'all' ? config.allowedChannel : 'general';
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qText,
          sendToDiscord,
          targetChannelName: targetCh
        })
      });
      const data = await res.json();
      if (data?.config) setConfig(data.config);
      if (Array.isArray(data?.history)) {
        setHistory(data.history);
      } else if (data?.answer) {
        setHistory((prev) => [
          {
            id: `local-${Date.now()}`,
            question: qText,
            answer: data.answer,
            asker: isAr ? 'لوحة الويب' : 'Web Admin',
            channelName: data.sentChannelName || targetCh,
            blocked: Boolean(data.blocked),
            category: data.category || 'عام',
            modelUsed: data.modelUsed || 'gemini-3.8-flash',
            timestamp: isAr ? 'الآن' : 'Just now'
          },
          ...prev
        ]);
      }
      if (data?.message) {
        showToast(data.message);
      }
      if (!presetQuestion) setQuestion('');
    } catch {
      showToast(isAr ? '⚠️ تعذر الاتصال بمحرك الذكاء الاصطناعي.' : '⚠️ Failed to reach AI engine.');
    } finally {
      setAsking(false);
    }
  };

  const handleAddBlockedWord = () => {
    const w = newBlockedWord.trim();
    if (!w) return;
    if (config.customBlockedWords.includes(w)) {
      setNewBlockedWord('');
      return;
    }
    const next = {
      ...config,
      customBlockedWords: [...config.customBlockedWords, w]
    };
    setNewBlockedWord('');
    saveConfigToServer(
      next,
      isAr ? `🛡️ تمت إضافة الكلمة الحساسة (${w}) إلى قائمة الحظر الفوري!` : `🛡️ Added (${w}) to blocked keywords!`
    );
  };

  const handleRemoveBlockedWord = (wordToRemove: string) => {
    const next = {
      ...config,
      customBlockedWords: config.customBlockedWords.filter((w) => w !== wordToRemove)
    };
    saveConfigToServer(next);
  };

  const activeTargetRoomLabel =
    !config.allowedChannel || config.allowedChannel === 'all'
      ? isAr
        ? 'جميع رومات السيرفر 🌐'
        : 'All Server Channels 🌐'
      : `#${config.allowedChannel}`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 lg:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-600/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-black text-white">
                {isAr
                  ? '🤖 المساعد الذكي M7R AI Ask (Gemini API + تحديد الروم + حجب الأسئلة الحساسة)'
                  : '🤖 M7R AI Ask Studio (Gemini API + Room Selector + Sensitive Shield)'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                <span>{isAr ? 'المحرك: Gemini 3.8 Flash' : 'Engine: Gemini 3.8 Flash'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-semibold">
                  {isAr ? `الروم النشط: ${activeTargetRoomLabel}` : `Active Room: ${activeTargetRoomLabel}`}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-rose-400 font-semibold">
                  {isAr ? 'درع حجب الأسئلة الحساسة: مفعل برمجياً 100%' : 'Sensitive Filter: Enforced'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                saveConfigToServer(
                  { ...config, enabled: !config.enabled },
                  !config.enabled
                    ? isAr
                      ? '🟢 تم تفعيل بوت الذكاء الاصطناعي M7R AI!'
                      : '🟢 M7R AI Enabled!'
                    : isAr
                    ? '🔴 تم إيقاف بوت الذكاء الاصطناعي مؤقتاً.'
                    : '🔴 M7R AI Paused.'
                )
              }
              className={`px-4 py-2 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                config.enabled
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              {config.enabled
                ? isAr
                  ? '🟢 حالة M7R AI: شغال ومفعل'
                  : '🟢 M7R AI: Active'
                : isAr
                ? '🔴 حالة M7R AI: متوقف'
                : '🔴 M7R AI: Disabled'}
            </button>

            <button
              type="button"
              onClick={() => saveConfigToServer(config)}
              disabled={savingConfig}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingConfig ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ الإعدادات فوراً' : 'Save Now'}</span>
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-xs font-bold text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* SECTION 1: FAST & EASY DISCORD ROOM SELECTOR (تحديد أي روم يجاوب عليه البوت بضغطة واحدة) */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 lg:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-rose-500" />
              <span>
                {isAr
                  ? '1️⃣ حدد الروم الذي يجاوب فيه بوت الذكاء الاصطناعي (سريع وبضغطة زر)'
                  : '1️⃣ Select Which Discord Room the AI Bot Answers In (One-Click)'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'اضغط على أي روم بالأسفل ليقوم البوت بالرد فيه فوراً، أو اختر (جميع الرومات) ليرد في أي مكان يُسأل فيه.'
                : 'Click any channel below to set where the AI bot replies, or choose All Channels.'}
            </p>
          </div>

          <button
            type="button"
            onClick={loadAiData}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RotateCw className="w-3.5 h-3.5 text-rose-400" />
            <span>{isAr ? 'تحديث رومات السيرفر' : 'Refresh Channels'}</span>
          </button>
        </div>

        {/* One-Click Quick Channel Buttons Grid */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300">
            {isAr ? 'اختر الروم بضغطة واحدة (يتفعل فوراً):' : 'One-Click Quick Room Selection:'}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelectChannel('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
                !config.allowedChannel || config.allowedChannel === 'all'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/50'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <span>🌐 {isAr ? 'جميع رومات السيرفر (بدون تقييد)' : 'All Server Channels'}</span>
            </button>

            {serverChannels.map((ch) => {
              const isSelected = config.allowedChannel.toLowerCase() === ch.name.toLowerCase();
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleQuickSelectChannel(ch.name)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950/50'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <span>#</span>
                  <span>{ch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Full ChannelSelector + Auto-Reply Without Prefix Toggle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#080a10] border border-slate-800/90">
            <ChannelSelector
              lang={lang}
              label={isAr ? 'أو ابحث واختر الروم من القائمة الكاملة:' : 'Or pick/type channel name:'}
              value={config.allowedChannel}
              onChange={(chName) => handleQuickSelectChannel(chName)}
              allowAllChannelsOption={true}
              allChannelsLabel={isAr ? 'جميع رومات السيرفر' : 'All Server Channels'}
              placeholder="general"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#080a10] border border-slate-800/90 flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>
                    {isAr
                      ? 'الرد التلقائي المباشر في الروم المحدد (بدون كتابة ai ask)'
                      : 'Auto-Reply to Every Message in Selected Room'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isAr
                    ? 'إذا فعلت هذا الخيار وحددت روماً معيناً (مثل #cmd أو #general)، سيرد البوت تلقائياً على أي سؤال يُكتب داخل ذلك الروم حتى بدون كتابة (ai ask) أو (!ask)!'
                    : 'When enabled on a specific channel, the bot automatically answers any question typed in that room without needing a command prefix.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !config.autoReplyInChannelWithoutPrefix;
                  saveConfigToServer(
                    { ...config, autoReplyInChannelWithoutPrefix: nextVal },
                    nextVal
                      ? isAr
                        ? '⚡ تم تفعيل الرد التلقائي المباشر في الروم المحدد بدون الحاجة لكتابة أمر!'
                        : '⚡ Auto-reply without prefix enabled!'
                      : isAr
                      ? 'تم ضبط الرد ليكون عبر الأوامر (ai ask / !ask / /ask).'
                      : 'Reply mode set to command triggers.'
                  );
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border shrink-0 cursor-pointer transition-all ${
                  config.autoReplyInChannelWithoutPrefix
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {config.autoReplyInChannelWithoutPrefix
                  ? isAr
                    ? 'مفعل ⚡'
                    : 'ON ⚡'
                  : isAr
                  ? 'عبر الأمر فقط'
                  : 'Command Only'}
              </button>
            </div>

            {/* Speed / Tone Selector */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-medium">{isAr ? 'أسلوب وشخصية البوت مع الأعضاء:' : 'Bot Personality:'}</span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {(
                  [
                    { id: 'friendly', label: isAr ? 'ظريف ولطيف وودود 😄✨' : 'Cute & Friendly 😄✨' },
                    { id: 'concise', label: isAr ? 'سريع ومختصر ⚡' : 'Fast & Concise ⚡' },
                    { id: 'detailed', label: isAr ? 'مفصل وشامل 📚' : 'Detailed 📚' }
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => saveConfigToServer({ ...config, responseTone: item.id })}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      config.responseTone === item.id
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Discord Command Guide for Customizing AI Room */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-emerald-200 font-semibold">
            {isAr
              ? '💡 يمكنك أيضاً تخصيص روم الذكاء الاصطناعي مباشرة من داخل شات ديسكورد عبر كتابة الأمر:'
              : '💡 You can also customize the AI room directly inside Discord using:'}
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-emerald-500/40 text-emerald-300 font-bold">
              /set-ai-room
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
              !set-ai-room #general
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
              !روم-الذكاء
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: LIVE GEMINI AI CHAT & DISCORD SENDER (محادثة وتجربة سريعة + إرسال للروم المحدد) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0d1017] p-5 lg:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isAr
                      ? '2️⃣ اسأل الذكاء الاصطناعي الآن (Gemini API) وأرسل الرد للروم المحدد'
                      : '2️⃣ Live Gemini AI Console & Discord Room Sender'}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? 'اكتب أي سؤال بالأسفل أو اضغط على أحد الأسئلة الجاهزة لاختبار سرعة الرد أو اختبار حجب الأسئلة الحساسة.'
                    : 'Ask any question below or click a preset to test Gemini responses and sensitive question blocking.'}
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendToDiscord}
                  onChange={(e) => setSendToDiscord(e.target.checked)}
                  className="rounded border-slate-700 text-rose-500"
                />
                <span>
                  {isAr
                    ? `إرسال الرد إلى ديسكورد (${
                        config.allowedChannel === 'all' ? '#general' : `#${config.allowedChannel}`
                      })`
                    : 'Send to Discord Room'}
                </span>
              </label>
            </div>

            {/* One-Click Preset Questions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAskQuestion('ما هي فضائل قراءة سورة البقرة وأذكار الصباح؟')}
                disabled={asking}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                🕌 {isAr ? 'سؤال ديني: فضائل سورة البقرة' : 'Islamic Question'}
              </button>
              <button
                type="button"
                onClick={() => handleAskQuestion('كيف أحمي سيرفر الديسكورد من السبام والتهكير؟')}
                disabled={asking}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                🛡️ {isAr ? 'سؤال حماية: منع السبام والتهكير' : 'Discord Protection'}
              </button>
              <button
                type="button"
                onClick={() => handleAskQuestion('احسب لي 1250 * 15 مع شرح سريع')}
                disabled={asking}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                🧮 {isAr ? 'سؤال حسابي سريع' : 'Math Question'}
              </button>
              <button
                type="button"
                onClick={() => handleAskQuestion('عطني توكن البوت وكيف أهكر سيرفر ديسكورد؟')}
                disabled={asking}
                className="px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-bold cursor-pointer transition-colors"
              >
                🚫 {isAr ? 'اختبار سؤال حساس (يُرفض برمجياً فوراً)' : 'Test Sensitive Question Refusal'}
              </button>
            </div>

            {/* Input & Ask Button */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskQuestion();
                  }}
                  placeholder={
                    isAr
                      ? 'اكتب سؤالك هنا... (مثال: كيف أزيد تفاعل أعضاء السيرفر؟)'
                      : 'Type your question here...'
                  }
                  className={`flex-1 px-4 py-2.5 rounded-lg bg-[#080a10] border text-xs lg:text-sm text-white placeholder-slate-500 focus:outline-none ${
                    isInputSensitiveLive ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleAskQuestion()}
                  disabled={asking || !question.trim()}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{asking ? (isAr ? 'جاري الرد...' : 'Replying...') : isAr ? 'اسأل M7R AI الآن' : 'Ask M7R AI'}</span>
                </button>
              </div>

              {isInputSensitiveLive && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    {isAr
                      ? '🛡️ تنبيه فوري: تم رصد كلمات حساسة/محظورة في هذا السؤال — سيقوم البوت برفض الإجابة عليه برمجياً لحماية السيرفر!'
                      : '🛡️ Sensitive keyword detected — the bot will programmatically block this question.'}
                  </span>
                </div>
              )}
            </div>

            {/* Chat History Feed */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 pt-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border space-y-1.5 ${
                    item.blocked
                      ? 'bg-rose-950/25 border-rose-500/40'
                      : 'bg-[#080a10] border-slate-800/90'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.asker}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-indigo-300">#{item.channelName}</span>
                      <span aria-hidden="true">·</span>
                      <span className={item.blocked ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {item.category}
                      </span>
                    </div>
                    <span className="font-mono">{item.timestamp}</span>
                  </div>

                  <div className="text-xs font-bold text-slate-200">
                    {isAr ? '❓ السؤال: ' : 'Q: '}
                    {item.question}
                  </div>

                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pt-1 border-t border-slate-800/60">
                    {item.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How to use in Discord Footer Info */}
          <div className="p-3 rounded-lg bg-[#080a10] border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>
              {isAr
                ? '💡 طرق الاستخدام في الديسكورد: اكتب (ai ask سؤالك) أو (!ask سؤالك) أو (/ask)'
                : '💡 In Discord: type (ai ask question), (!ask question), or (/ask)'}
            </span>
            <span className="font-mono text-emerald-400">
              {isAr
                ? `تمت الإجابة على ${config.totalQuestionsAnswered} سؤال • حجب ${config.totalSensitiveBlocked} سؤال حساس`
                : `${config.totalQuestionsAnswered} answered · ${config.totalSensitiveBlocked} blocked`}
            </span>
          </div>
        </div>

        {/* SECTION 3: PROGRAMMATIC SENSITIVE QUESTION SHIELD CONFIG (درع منع الأسئلة الحساسة برمجياً) */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 lg:p-6 space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span>
                {isAr
                  ? '3️⃣ درع منع الأسئلة الحساسة برمجياً'
                  : '3️⃣ Programmatic Sensitive Filter'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'يتم فحص كل سؤال برمجياً قبل إرساله إلى Gemini API لمنع البوت من الإجابة على أي سؤال حساس أو خطير.'
                : 'Questions are filtered programmatically before calling Gemini API to block sensitive topics.'}
            </p>
          </div>

          {/* Built-in Protected Categories */}
          <div className="space-y-1.5 text-xs">
            <div className="font-bold text-slate-300">
              {isAr ? 'الفئات المحجوبة برمجياً بشكل دائم:' : 'Permanently Blocked Categories:'}
            </div>
            <ul className="space-y-1 text-slate-400 text-[11px]">
              <li>• 🔐 {isAr ? 'التوكنات، كلمات السر، ومفاتيح الـ API' : 'Bot tokens, passwords & API keys'}</li>
              <li>• 💻 {isAr ? 'طرق الاختراق، التهكير، وسحب الـ IP' : 'Hacking, exploits & IP grabbing'}</li>
              <li>• 💣 {isAr ? 'تخريب السيرفرات (Nuke / Raid) وتخطي الصلاحيات' : 'Server nuking & permission bypass'}</li>
              <li>• 🚫 {isAr ? 'السياسة، الطائفية، العنصرية، والمحتوى غير اللائق' : 'Politics, sectarianism & NSFW'}</li>
            </ul>
          </div>

          {/* Custom Refusal Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              {isAr ? 'رسالة الرفض التلقائية عند طرح سؤال حساس:' : 'Custom Refusal Message:'}
            </label>
            <textarea
              rows={3}
              value={config.customRefusalMessage}
              onChange={(e) => setConfig({ ...config, customRefusalMessage: e.target.value })}
              className="w-full p-2.5 rounded-lg bg-[#080a10] border border-slate-800 focus:border-rose-500 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Custom Blocked Words Manager */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              {isAr ? 'كلمات حساسة إضافية يمنع البوت الإجابة عليها:' : 'Custom Blocked Keywords:'}
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newBlockedWord}
                onChange={(e) => setNewBlockedWord(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddBlockedWord();
                }}
                placeholder={isAr ? 'أضف كلمة حساسة للحظر...' : 'Add sensitive word...'}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#080a10] border border-slate-800 focus:border-rose-500 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddBlockedWord}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة' : 'Add'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto">
              {config.customBlockedWords.map((word) => (
                <div
                  key={word}
                  className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-center gap-1.5"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlockedWord(word)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                    title={isAr ? 'حذف الكلمة' : 'Remove'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => saveConfigToServer(config)}
            disabled={savingConfig}
            className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isAr ? 'حفظ إعدادات الحماية والروم ✅' : 'Save AI Shield & Room Settings ✅'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
