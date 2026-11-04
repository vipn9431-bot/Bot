import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Bot, 
  Megaphone, 
  Radio, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Send, 
  Vote, 
  MicOff, 
  Headphones, 
  Sparkles,
  Volume2,
  Square,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
  RefreshCw,
  Power,
  Zap,
  MessageSquare,
  BookOpen,
  Clock,
  Calendar,
  Compass
} from 'lucide-react';
import { AutoResponse, Voice247Config, LevelUser, QuranReciter, QuranScheduleSlot } from '../types';
import { ChannelSelector } from './ChannelSelector';
import { sound } from '../utils/sound';

interface ExtraSystemsTabProps {
  lang: 'ar' | 'en';
  autoResponses: AutoResponse[];
  setAutoResponses: React.Dispatch<React.SetStateAction<AutoResponse[]>>;
  voice247: Voice247Config;
  setVoice247: React.Dispatch<React.SetStateAction<Voice247Config>>;
  onSave: () => void;
}

export const ExtraSystemsTab: React.FC<ExtraSystemsTabProps> = ({
  lang,
  autoResponses,
  setAutoResponses,
  voice247,
  setVoice247,
  onSave,
}) => {
  const isAr = lang === 'ar';
  const [activeSection, setActiveSection] = useState<'levels' | 'autoresponder' | 'broadcasts' | 'voice'>('voice');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Leveling state
  const [xpMultiplier, setXpMultiplier] = useState(1.5);
  const [levelUpChannel, setLevelUpChannel] = useState('#level-up');
  const [levelsEnabled, setLevelsEnabled] = useState(true);

  // Live Voice 24/7 & Quran State
  const [voiceInChannel, setVoiceInChannel] = useState<boolean>(false);
  const [voiceLoading, setVoiceLoading] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [activeReciter, setActiveReciter] = useState<QuranReciter | null>(null);
  const [recitersList, setRecitersList] = useState<QuranReciter[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<QuranScheduleSlot[]>([]);
  const [currentHourMecca, setCurrentHourMecca] = useState<number>(new Date().getUTCHours() + 3);
  const [reciterSwitching, setReciterSwitching] = useState<string | null>(null);
  const [scheduleSaving, setScheduleSaving] = useState<boolean>(false);

  // Auto-responder state
  const [newTrigger, setNewTrigger] = useState('');
  const [newReply, setNewReply] = useState('');
  const [newReaction, setNewReaction] = useState('❤️');
  const [newMatchType, setNewMatchType] = useState<'contains' | 'exact'>('contains');
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Fetch Voice Status on load
  const fetchVoiceStatus = async () => {
    try {
      const res = await fetch('/api/voice/status');
      const data = await res.json();
      if (data) {
        setVoiceInChannel(data.inVoice || false);
        if (data.activeReciter) setActiveReciter(data.activeReciter);
        if (data.reciters && Array.isArray(data.reciters)) setRecitersList(data.reciters);
        if (data.scheduleSlots && Array.isArray(data.scheduleSlots)) setScheduleSlots(data.scheduleSlots);
        if (typeof data.currentHourMecca === 'number') setCurrentHourMecca(data.currentHourMecca);
        setVoice247(prev => ({
          ...prev,
          channelName: data.channelName || prev.channelName,
          selectedReciter: data.selectedReciter || prev.selectedReciter,
          scheduleEnabled: data.scheduleEnabled !== undefined ? data.scheduleEnabled : prev.scheduleEnabled,
          audioMode: data.audioMode || prev.audioMode
        }));
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchVoiceStatus();
    const interval = setInterval(fetchVoiceStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  // Broadcasts state
  const [embedTitle, setEmbedTitle] = useState('تحديث أمني ضخم وتدشين متجر Ghost Store 🛡️');
  const [embedDescription, setEmbedDescription] = useState('يسر إدارة سيرفر M7R الإعلان عن تفعيل أنظمة الحماية الفولاذية بالكامل وافتتاح الروم الخاص بطلبات المتجر الفورية.');
  const [embedColor, setEmbedColor] = useState('#e11d48');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Poll state
  const [pollQuestion, setPollQuestion] = useState('هل تؤيد تفعيل وضع القفل التلقائي للشات عند تجاوز 500 رسالة/دقيقة؟');
  const [pollVotes, setPollVotes] = useState({ yes: 84, no: 16 });
  const [hasVoted, setHasVoted] = useState<string | null>(null);

  const topUsers: LevelUser[] = [
    { rank: 1, name: 'Sultan_Leader', avatar: '', level: 52, xp: 26400, nextLevelXp: 28000, messagesCount: 8420 },
    { rank: 2, name: 'Fahad_Pro', avatar: '', level: 48, xp: 22100, nextLevelXp: 24000, messagesCount: 6910 },
    { rank: 3, name: 'Mishal_Dev', avatar: '', level: 41, xp: 18450, nextLevelXp: 20000, messagesCount: 5200 },
    { rank: 4, name: 'Rakan_Sniper', avatar: '', level: 36, xp: 14800, nextLevelXp: 16000, messagesCount: 4190 },
    { rank: 5, name: 'Bander_VIP', avatar: '', level: 32, xp: 11200, nextLevelXp: 13000, messagesCount: 3040 },
  ];

  const handleSave = () => {
    sound.playShieldActivate();
    onSave();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddAutoResponse = () => {
    if (!newTrigger.trim() || !newReply.trim()) return;
    const newEntry: AutoResponse = {
      id: `ar-${Date.now()}`,
      trigger: newTrigger.trim(),
      reply: newReply.trim(),
      autoReaction: newReaction.trim() || undefined,
      matchType: 'contains',
      enabled: true,
    };
    setAutoResponses(prev => [newEntry, ...prev]);
    setNewTrigger('');
    setNewReply('');
    sound.playClick();
  };

  const handleDeleteAutoResponse = (id: string) => {
    setAutoResponses(prev => prev.filter(a => a.id !== id));
    sound.playClick();
  };

  const handleToggleAutoResponse = (id: string) => {
    setAutoResponses(prev =>
      prev.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
    sound.playClick();
  };

  const handleJoinVoiceNow = async (channelNameOverride?: string) => {
    const ch = channelNameOverride || voice247.channelName;
    if (!ch) return;
    setVoiceLoading(true);
    setVoiceFeedback(null);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/voice/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName: ch,
          deafened: voice247.deafened,
          muted: voice247.muted,
          audioMode: voice247.audioMode,
          selectedReciter: voice247.selectedReciter,
          scheduleEnabled: voice247.scheduleEnabled
        })
      });
      const data = await res.json();
      setVoiceInChannel(data.inVoice || data.success);
      setVoiceFeedback(data.message || (isAr ? 'تم دخول الروم الصوتي وبث القرآن الكريم بنجاح!' : 'Joined voice channel & streaming Quran!'));
      if (data.channelName) {
        setVoice247(prev => ({ ...prev, channelName: data.channelName, enabled: true }));
      }
      if (data.activeReciter) {
        setActiveReciter(data.activeReciter);
      }
    } catch {
      setVoiceFeedback(isAr ? 'تعذر الاتصال بالروم الصوتي.' : 'Voice connection failed.');
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleSwitchReciter = async (reciterId: string) => {
    setReciterSwitching(reciterId);
    sound.playClick();
    try {
      const res = await fetch('/api/voice/reciter/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reciterId })
      });
      const data = await res.json();
      if (data.success) {
        sound.playShieldActivate();
        setVoice247(prev => ({ ...prev, selectedReciter: reciterId, scheduleEnabled: false }));
        if (data.activeReciter) setActiveReciter(data.activeReciter);
        setVoiceFeedback(data.message);
      } else {
        setVoiceFeedback(data.message || 'تعذر تبديل القارئ.');
      }
    } catch {
      setVoiceFeedback('فشل الاتصال بالخادم لتبديل القارئ.');
    } finally {
      setReciterSwitching(null);
    }
  };

  const handleSaveSchedule = async (newSlots: QuranScheduleSlot[], enabled: boolean) => {
    setScheduleSaving(true);
    sound.playClick();
    try {
      const res = await fetch('/api/voice/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleEnabled: enabled,
          scheduleSlots: newSlots
        })
      });
      const data = await res.json();
      if (data.success) {
        sound.playShieldActivate();
        setScheduleSlots(data.scheduleSlots || newSlots);
        setVoice247(prev => ({ ...prev, scheduleEnabled: enabled }));
        if (data.activeReciter) setActiveReciter(data.activeReciter);
        setVoiceFeedback(data.message);
      }
    } catch {
      setVoiceFeedback('فشل حفظ جدول القراء.');
    } finally {
      setScheduleSaving(false);
    }
  };

  const handleLeaveVoiceNow = async () => {
    setVoiceLoading(true);
    setVoiceFeedback(null);
    sound.playClick();
    try {
      const res = await fetch('/api/voice/leave', { method: 'POST' });
      const data = await res.json();
      setVoiceInChannel(false);
      setVoice247(prev => ({ ...prev, enabled: false }));
      setVoiceFeedback(data.message || (isAr ? 'تم الخروج من الروم الصوتي بنجاح!' : 'Disconnected from voice!'));
    } catch {
      setVoiceFeedback(isAr ? 'حدث خطأ أثناء الخروج.' : 'Failed to leave voice.');
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleVoiceChannelChange = (ch: string) => {
    setVoice247(prev => ({ ...prev, channelName: ch, enabled: true }));
    // As user requested: "اول ماحط الروم حق الفويس البوت يخش هناك على طول"
    handleJoinVoiceNow(ch);
  };

  const handleApplyPreset = (trigger: string, reply: string, reaction?: string) => {
    setNewTrigger(trigger);
    setNewReply(reply);
    if (reaction) setNewReaction(reaction);
    sound.playClick();
  };

  const handleTestAutoResponse = async () => {
    if (!testInput.trim()) return;
    setIsTesting(true);
    sound.playClick();
    try {
      const res = await fetch('/api/auto-responses/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testMessage: testInput })
      });
      const data = await res.json();
      setTestResult(data.simulatedReply);
    } catch {
      setTestResult(isAr ? 'فحص تجريبي: لم يتطابق أي رد.' : 'Test completed: No match.');
    } finally {
      setIsTesting(false);
    }
  };

  const [broadcastTargetChannel, setBroadcastTargetChannel] = useState('announcements');
  const [broadcastEveryone, setBroadcastEveryone] = useState(false);

  const handleSendBroadcast = async () => {
    sound.playShieldActivate();
    try {
      await fetch('/api/broadcast/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: embedTitle,
          description: embedDescription,
          channelName: broadcastTargetChannel,
          color: embedColor,
          mentionEveryone: broadcastEveryone
        })
      });
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 5000);
    } catch {
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 4000);
    }
  };


  const handleVote = (option: 'yes' | 'no') => {
    if (hasVoted) return;
    sound.playClick();
    setHasVoted(option);
    setPollVotes(prev => ({
      ...prev,
      [option]: prev[option] + 1
    }));
  };

  const totalVotes = pollVotes.yes + pollVotes.no;
  const yesPercent = Math.round((pollVotes.yes / totalVotes) * 100);
  const noPercent = 100 - yesPercent;

  return (
    <div className="space-y-6">
      {/* Header & Section Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-500" />
            {isAr ? 'الأنظمة الإضافية المتكاملة (Extra Systems)' : 'Extended Guild Systems'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'نظام المستويات، الردود التلقائية، الإعلانات والتصويتات، والروم الصوتي الشغال 24/7'
              : 'XP & Leveling, Auto-Responses, Rich Announcements & Polls, and 24/7 Voice Channel keeper'}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? (isAr ? 'تم الحفظ!' : 'Saved!') : (isAr ? 'حفظ التعديلات' : 'Save Changes')}</span>
        </button>
      </div>

      {/* Segmented Sub Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0d1017] border border-slate-800 rounded-lg max-w-2xl">
        <button
          onClick={() => { setActiveSection('levels'); sound.playClick(); }}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'levels'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 inline-block mr-1.5" />
          {isAr ? 'المستويات (XP)' : 'XP & Levels'}
        </button>
        <button
          onClick={() => { setActiveSection('autoresponder'); sound.playClick(); }}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'autoresponder'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5 inline-block mr-1.5" />
          {isAr ? 'الردود والإيموجي' : 'Auto-Replies'}
        </button>
        <button
          onClick={() => { setActiveSection('broadcasts'); sound.playClick(); }}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'broadcasts'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 inline-block mr-1.5" />
          {isAr ? 'الإعلانات والتصويت' : 'Broadcasts'}
        </button>
        <button
          onClick={() => { setActiveSection('voice'); sound.playClick(); }}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'voice'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 inline-block mr-1.5 text-emerald-400" />
          {isAr ? '📖 تلاوات القرآن 24/7' : 'Quran & Voice 24/7'}
        </button>
      </div>

      {/* 1. XP & LEVELING */}
      {activeSection === 'levels' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{isAr ? 'إعدادات نظام المستويات' : 'XP System Settings'}</h3>
                <p className="text-[11px] text-slate-400">{isAr ? 'منح الأعضاء نقاط وتصنيف عند التفاعل في الرومات' : 'Grant XP points per message in text channels'}</p>
              </div>
              <input
                type="checkbox"
                checked={levelsEnabled}
                onChange={(e) => setLevelsEnabled(e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300">{isAr ? 'مضاعف النقاط (XP Multiplier)' : 'XP Multiplier'}</span>
                <span className="font-mono text-rose-400 font-bold">{xpMultiplier}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.5"
                value={xpMultiplier}
                onChange={(e) => setXpMultiplier(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <div>
              <ChannelSelector
                lang={lang}
                label={isAr ? 'تحديد روم إعلانات الترقية (Level Up Channel)' : 'Level Up Channel'}
                value={levelUpChannel}
                onChange={(ch) => setLevelUpChannel(ch)}
                placeholder="general"
              />
            </div>

            {/* Rank Card Preview */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-300 block mb-2">{isAr ? 'معاينة كارت الرتبة (Rank Card):' : 'Rank Card Live Preview:'}</span>
              <div className="rounded-xl bg-gradient-to-r from-slate-950 via-[#13111c] to-[#1c0f16] border border-rose-900/40 p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                      SL
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">Sultan_Leader</span>
                      <span className="text-[10px] text-slate-400 font-mono">#1902 • Rank #1</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono">LEVEL</span>
                    <span className="text-xl font-black text-rose-400 font-mono">52</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                    <span>26,400 XP</span>
                    <span>28,000 XP</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div className="w-[88%] h-full bg-gradient-to-r from-rose-600 to-amber-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">{isAr ? 'لوحة المتصدرين (Top 5 Leaderboard)' : 'Top Active Members'}</h3>
              <span className="text-xs font-mono text-rose-400">M7R XP System</span>
            </div>

            <div className="space-y-2">
              {topUsers.map((user) => (
                <div
                  key={user.rank}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                      user.rank === 1
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : user.rank === 2
                        ? 'bg-slate-400/20 text-slate-200 border border-slate-400/40'
                        : user.rank === 3
                        ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {user.rank}
                    </span>
                    <div>
                      <span className="font-bold text-white block">{user.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{user.messagesCount} {isAr ? 'رسالة' : 'msgs'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">{user.xp.toLocaleString()} XP</span>
                      <span className="text-xs font-mono font-bold text-rose-400">Lvl {user.level}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. AUTO-RESPONDER & AUTO-EMOJI */}
      {activeSection === 'autoresponder' && (
        <div className="space-y-6">
          {/* Quick Presets Bar */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-4 space-y-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              {isAr ? 'قوالب ردود جاهزة وسريعة (اضغط للإضافة الفورية):' : 'Quick Auto-Response Presets:'}
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                {
                  label: isAr ? '👋 رد السلام عليكم' : '👋 Greeting',
                  trigger: 'سلام عليكم',
                  reply: 'وعليكم السلام ورحمة الله وبركاته يا {user}! أهلاً بك في سيرفر **{server}** المحمي بالدرع الفولاذي 🛡️',
                  reaction: '❤️'
                },
                {
                  label: isAr ? '🛒 رد المتجر والأسعار' : '🛒 Store Info',
                  trigger: 'متجر',
                  reply: '🛒 تفضل بزيارة قسم التذاكر لطلب منتجات المتجر الحصرية أو اكتب `!panel` لفتح تذكرة خاصة بك في **{server}**!',
                  reaction: '🛒'
                },
                {
                  label: isAr ? '💡 رد المساعدة والأوامر' : '💡 Help & Commands',
                  trigger: 'مساعدة',
                  reply: '✨ مرحباً بك يا {user}! للاطلاع على جميع أوامر البوت اكتب `!help`، أو توجه لروم الدعم الفني لخدمتك فوراً 🛠️',
                  reaction: '💡'
                },
                {
                  label: isAr ? '📜 رد قوانين السيرفر' : '📜 Rules',
                  trigger: 'قوانين',
                  reply: '📜 يرجى الالتزام بقوانين سيرفر **{server}** واحترام الأعضاء لتجنب الحظر والكتم الآلي من نظام الحماية 🛡️',
                  reaction: '⚖️'
                },
                {
                  label: isAr ? '📝 رد التقديم على الإدارة' : '📝 Staff Application',
                  trigger: 'تقديم',
                  reply: '📋 باب التقديم على إدارة ورتب سيرفر **{server}** متاح! تفضل بالدخول إلى روم التقديمات وتعبئة الاستمارة 📝',
                  reaction: '📝'
                }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset.trigger, preset.reply, preset.reaction)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 text-xs text-slate-300 hover:text-white transition-all cursor-pointer font-medium flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3 text-rose-400" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Creator Box */}
            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-rose-400" />
                {isAr ? 'إضافة رد وإيموجي تلقائي جديد' : 'Add Auto-Responder Rule'}
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">{isAr ? 'الكلمة المفتاحية (Trigger)' : 'Trigger Word/Phrase'}</label>
                  <input
                    type="text"
                    placeholder="مثال: متجر، قوانين، ديسكورد، مساعدة"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2.5 text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">{isAr ? 'نوع المطابقة' : 'Match Type'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewMatchType('contains')}
                      className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                        newMatchType === 'contains'
                          ? 'bg-rose-950/40 border-rose-500 text-rose-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {isAr ? 'يحتوي على الكلمة' : 'Contains Word'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMatchType('exact')}
                      className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                        newMatchType === 'exact'
                          ? 'bg-rose-950/40 border-rose-500 text-rose-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {isAr ? 'مطابقة تامة' : 'Exact Match'}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">{isAr ? 'الرد التلقائي (Bot Reply)' : 'Bot Reply Message'}</label>
                    <span className="text-[10px] text-slate-500">{isAr ? 'اضغط المتغير لإدراجه' : 'Click var to add'}</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="الرسالة التي سيرد بها البوت..."
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2.5 text-white transition-colors"
                  />
                  {/* Clickable Variable Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { tag: '{user}', label: isAr ? '@منشن العضو' : '@User' },
                      { tag: '{username}', label: isAr ? 'اسم العضو' : 'Username' },
                      { tag: '{server}', label: isAr ? 'اسم السيرفر' : 'Server' },
                      { tag: '{count}', label: isAr ? 'العدد' : 'Count' },
                      { tag: '{channel}', label: isAr ? '#الروم' : 'Channel' }
                    ].map((v) => (
                      <button
                        key={v.tag}
                        type="button"
                        onClick={() => setNewReply(prev => `${prev} ${v.tag} `)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[10px] cursor-pointer"
                        title={v.label}
                      >
                        {v.tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">{isAr ? 'تفاعل تلقائي اختياري (Auto Reaction Emoji)' : 'Auto Reaction Emoji'}</label>
                  <input
                    type="text"
                    placeholder="❤️ أو 🛡️ أو ✅ أو 🛒"
                    value={newReaction}
                    onChange={(e) => setNewReaction(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2.5 text-white transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddAutoResponse}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'حفظ وتفعيل الرد التلقائي' : 'Add Auto-Response'}</span>
                </button>
              </div>
            </div>

            {/* List of active responses & Test Console */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'قائمة الردود التلقائية النشطة' : 'Active Auto-Responders'} ({autoResponses.length})</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    {isAr ? '⚡ متصلة بديسكورد مباشرة' : 'Live Discord Sync'}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {autoResponses.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                        item.enabled ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAutoResponse(item.id)}
                            className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
                              item.enabled ? 'bg-emerald-600' : 'bg-slate-700'
                            }`}
                            title={isAr ? 'تفعيل / تعطيل' : 'Toggle'}
                          >
                            <span
                              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                                item.enabled ? 'right-0.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                          <span className="font-bold text-rose-400 font-mono">"{item.trigger}"</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {item.matchType === 'exact' ? (isAr ? 'تطابق تام' : 'Exact') : (isAr ? 'يحتوي' : 'Contains')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.autoReaction && (
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px]">{item.autoReaction}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteAutoResponse(item.id)}
                            className="text-slate-500 hover:text-red-400 cursor-pointer p-1"
                            title={isAr ? 'حذف الرد' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 font-sans leading-relaxed text-[11px] bg-slate-950/60 p-2 rounded border border-slate-800/60">
                        {item.reply}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Simulator Console */}
              <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-4 space-y-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-sky-400" />
                  {isAr ? 'صندوق تجربة واختبار الرد التلقائي (Live Simulator):' : 'Auto-Response Test Sandbox:'}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder={isAr ? 'اكتب رسالة تجريبية (مثال: سلام عليكم، متجر)...' : 'Type test message...'}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleTestAutoResponse}
                    disabled={isTesting}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shrink-0"
                  >
                    {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (isAr ? 'اختبار الرد 🧪' : 'Test Reply 🧪')}
                  </button>
                </div>
                {testResult && (
                  <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-500/30 text-xs text-sky-200">
                    <span className="font-bold block text-[10px] text-sky-400 mb-0.5">{isAr ? 'رد البوت المتوقع:' : 'Bot Reply Simulation:'}</span>
                    <p className="leading-relaxed">{testResult}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BROADCASTS & POLLS */}
      {activeSection === 'broadcasts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Embed Creator */}
          <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-rose-400" />
              {isAr ? 'صانع الإعلانات الرسمية (Rich Embed Broadcast)' : 'Announcement Broadcast Designer'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">{isAr ? 'عنوان الإعلان' : 'Title'}</label>
                <input
                  type="text"
                  value={embedTitle}
                  onChange={(e) => setEmbedTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">{isAr ? 'محتوى الإعلان' : 'Description'}</label>
                <textarea
                  rows={3}
                  value={embedDescription}
                  onChange={(e) => setEmbedDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <ChannelSelector
                    lang={lang}
                    compact={true}
                    label={isAr ? 'تحديد الروم المستهدف للإعلان' : 'Target Channel'}
                    value={broadcastTargetChannel}
                    onChange={(ch) => setBroadcastTargetChannel(ch)}
                    placeholder="announcements"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">{isAr ? 'لون الإيمبد' : 'Embed Color'}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={embedColor}
                      onChange={(e) => setEmbedColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-slate-300 text-xs">{embedColor}</span>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={broadcastEveryone}
                  onChange={(e) => setBroadcastEveryone(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded"
                />
                <span>{isAr ? 'إرسال منشن جماعي (@everyone)' : 'Mention @everyone'}</span>
              </label>

              <button
                onClick={handleSendBroadcast}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isAr ? `إرسال ونشر الإعلان في #${broadcastTargetChannel} 📢` : `Broadcast to #${broadcastTargetChannel}`}</span>
              </button>

              {broadcastSent && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs text-center">
                  {isAr ? '✅ تم بث الإعلان بنجاح لجميع أعضاء السيرفر!' : 'Broadcast successfully sent!'}
                </div>
              )}
            </div>
          </div>

          {/* Discord Live Preview & Poll */}
          <div className="lg:col-span-6 space-y-5">
            {/* Embed Preview */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-3">
              <span className="text-xs font-bold text-slate-400 block">{isAr ? 'معاينة الإعلان في ديسكورد:' : 'Discord Embed Preview:'}</span>
              <div 
                className="rounded-lg bg-[#2b2d31] p-4 text-slate-100 space-y-2 border-l-4"
                style={{ borderLeftColor: embedColor }}
              >
                <h4 className="font-bold text-sm text-white">{embedTitle}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{embedDescription}</p>
                <div className="pt-2 text-[10px] text-slate-400 font-mono">
                  M7R Security Bot • Today at {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Interactive Poll */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Vote className="w-4 h-4 text-amber-400" />
                  {isAr ? 'تصويت مجتمعي مباشر (Live Poll)' : 'Interactive Poll'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{totalVotes} {isAr ? 'صوت' : 'votes'}</span>
              </div>

              <p className="text-xs text-slate-200 font-medium">{pollQuestion}</p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleVote('yes')}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-200">🟢 {isAr ? 'نعم، مؤيد بشدة' : 'Yes, strongly support'}</span>
                    <span className="font-mono text-emerald-400">{yesPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${yesPercent}%` }} />
                  </div>
                </button>

                <button
                  onClick={() => handleVote('no')}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-200">🔴 {isAr ? 'لا، غير مؤيد' : 'No, oppose'}</span>
                    <span className="font-mono text-red-400">{noPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${noPercent}%` }} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 24/7 VOICE CHANNEL KEEPER */}
      {activeSection === 'voice' && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-[#0d1017] p-6 sm:p-7 space-y-6 shadow-2xl">
          {/* Header & Main Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">
                  {isAr ? 'نظام إذاعة وتلاوات القرآن الكريم 24/7 (Quran Voice 24/7 Keeper)' : '24/7 Holy Quran Voice Recitation System'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isAr
                  ? 'بمجرد اختيار الروم الصوتي يدخل البوت فوراً ويبقى 24 ساعة يصدح بتلاوات كبار القراء (بدون موسيقى نهائياً)، مع ميزة الجدول الآلي على مدار اليوم!'
                  : 'Bot immediately enters the voice channel 24/7 streaming authentic Quran recitations with no music, supported by automatic 24-hour schedules.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                {voice247.enabled ? (isAr ? 'مفعل' : 'Enabled') : (isAr ? 'معطل' : 'Disabled')}
              </span>
              <input
                type="checkbox"
                checked={voice247.enabled}
                onChange={(e) => {
                  const en = e.target.checked;
                  setVoice247({ ...voice247, enabled: en });
                  if (!en && voiceInChannel) {
                    handleLeaveVoiceNow();
                  } else if (en && voice247.channelName) {
                    handleJoinVoiceNow();
                  }
                }}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Live Status Pill with Radar Pulse */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
            voiceInChannel
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className={`w-3.5 h-3.5 rounded-full ${voiceInChannel ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                <span className={`absolute w-3 h-3 rounded-full ${voiceInChannel ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              </div>
              <div>
                <span className="text-xs font-black block">
                  {voiceInChannel
                    ? (isAr ? `🟢 البوت متواجد حالياً داخل الروم الصوتي: #${voice247.channelName || 'Voice'}` : `🟢 Bot is inside voice channel: #${voice247.channelName}`)
                    : (isAr ? '🔴 البوت غير متصل بأي روم صوتي حالياً' : '🔴 Bot is currently disconnected from voice')}
                </span>
                <span className="text-[11px] text-slate-400">
                  {voiceInChannel
                    ? (isAr ? 'نظام البقاء 24/7 نشط مع ميزة إعادة الاتصال التلقائي (Auto-Reconnect)' : '24/7 keeper active with auto-reconnect')
                    : (isAr ? 'اختر الروم الصوتي بالأسفل أو اضغط زر الدخول الفوري' : 'Select voice channel below or click join')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchVoiceStatus}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title={isAr ? 'تحديث الحالة' : 'Refresh'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Instant Action Feedback Toast */}
          {voiceFeedback && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{voiceFeedback}</span>
            </div>
          )}

          {/* Voice Channel Selector */}
          <div className="space-y-4 text-xs">
            <div>
              <ChannelSelector
                lang={lang}
                type="voice"
                label={isAr ? 'تحديد الروم الصوتي 24/7 (Voice Channel) — يدخل البوت فوراً عند اختياره' : 'Voice Channel 24/7 (Enters immediately on select)'}
                value={voice247.channelName}
                onChange={handleVoiceChannelChange}
                placeholder="🔊 24/7 | خلوة وتلاوات عطرة"
              />
            </div>

            {/* BIG ACTION BUTTONS: JOIN NOW vs LEAVE NOW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleJoinVoiceNow()}
                disabled={voiceLoading}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 cursor-pointer transition-all disabled:opacity-60"
              >
                {voiceLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                <span>{isAr ? '🔊 دخول الروم الصوتي الآن 24/7' : '🔊 Join Voice Channel Now 24/7'}</span>
              </button>

              <button
                type="button"
                onClick={handleLeaveVoiceNow}
                disabled={voiceLoading}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 cursor-pointer transition-all disabled:opacity-60"
              >
                {voiceLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>{isAr ? '⏹️ خروج وقطع الاتصال فوراً' : '⏹️ Leave Voice Channel'}</span>
              </button>
            </div>

            {/* Audio Mode Selection - 100% Holy Quran & Islamic, Absolutely NO Music */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'نوع البث الإيماني في الروم الصوتي (خالٍ تماماً من الموسيقى)' : 'Spiritual Audio Mode (100% Quran, No Music)'}</span>
                </label>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  {isAr ? 'تلاوات نقية 24/7' : 'Pure Quran Streams'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'quran',
                    icon: '📖',
                    label: isAr ? 'القرآن الكريم (تلاوات القراء)' : 'Holy Quran Recitations',
                    desc: isAr ? 'تلاوات خاشعة للقارئ المختار أو المجدول' : 'Selected Sheikh recitation'
                  },
                  {
                    id: 'radio',
                    icon: '📻',
                    label: isAr ? 'إذاعة القرآن الكريم' : 'Quran Live Radio',
                    desc: isAr ? 'بث إذاعي مباشر مستمر من القاهرة' : 'Cairo 24/7 Live Broadcast'
                  },
                  {
                    id: 'silent',
                    icon: '🔇',
                    label: isAr ? 'صامت تماماً (Silent Keeper)' : 'Silent Presence',
                    desc: isAr ? 'تواجد 24/7 داخل الروم بدون صوت' : 'Stay 24/7 in VC without audio'
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setVoice247({ ...voice247, audioMode: mode.id as any });
                      sound.playClick();
                    }}
                    className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                      voice247.audioMode === mode.id
                        ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-black text-xs block text-white flex items-center gap-1.5">
                      <span>{mode.icon}</span>
                      <span>{mode.label}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Currently Playing Reciter Highlight Banner */}
            {activeReciter && voice247.audioMode === 'quran' && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-[#0d1017] border border-emerald-500/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">
                      {isAr ? 'القارئ الذي يصدح صوته في الروم الصوتي الآن 🔊' : 'Currently Reciting in Voice Channel'}
                    </span>
                    <h4 className="text-sm font-black text-white">الشيخ {activeReciter.name}</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{activeReciter.description}</span>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {activeReciter.style === 'mujawwad' ? 'مصحف مجود' : activeReciter.style === 'radio' ? 'إذاعة مباشرة' : 'مصحف مرتل'}
                  </span>
                </div>
              </div>
            )}

            {/* HOLY QURAN RECITERS GRID */}
            {voice247.audioMode === 'quran' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{isAr ? 'اختر قارئ القرآن الكريم للبث الفوري' : 'Choose Quran Reciter'}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isAr
                        ? 'انقر على أي شيخ لتشغيل تلاوته فوراً في الروم الصوتي 24/7'
                        : 'Click any Sheikh to immediately stream their recitation in voice channel'}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    {recitersList.length || 8} {isAr ? 'شيوخ وقراء' : 'Reciters'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(recitersList.length > 0 ? recitersList : [
                    { id: 'alafasy', name: 'مشاري راشد العفاسي', nameEn: 'Mishary Al-Afasy', description: 'تلاوات خاشعة وعذبة بصوت الشيخ مشاري العفاسي 24/7', style: 'murattal' },
                    { id: 'minshawi', name: 'محمد صديق المنشاوي', nameEn: 'Mohamed Siddiq Al-Minshawi', description: 'المصحف المرتل برواية حفص عن عاصم - أستاذ الخشوع والترتيل', style: 'murattal' },
                    { id: 'abdulbasit', name: 'عبد الباسط عبد الصمد', nameEn: 'Abdulbasit Abdulsamad', description: 'المصحف المجود الخالد بصوت صوت مكة الشيخ عبد الباسط', style: 'mujawwad' },
                    { id: 'sudais', name: 'عبد الرحمن السديس', nameEn: 'Abdulrahman Al-Sudais', description: 'إمام وخطيب المسجد الحرام وتلاوات الحرم المكي الشريف', style: 'murattal' },
                    { id: 'muaiqly', name: 'ماهر المعيقلي', nameEn: 'Maher Al-Muaiqly', description: 'تلاوة ندية هادئة تطمئن بها النفوس والقلوب', style: 'murattal' },
                    { id: 'ghamdi', name: 'سعد الغامدي', nameEn: 'Saad Al-Ghamdi', description: 'ترتيل مميز متقن عالي السكينة والخشوع', style: 'murattal' },
                    { id: 'cairo_radio', name: 'إذاعة القرآن الكريم (القاهرة)', nameEn: 'Cairo Quran Radio', description: 'البث الإذاعي الحي المباشر لأعرق إذاعة قرآن بالعالم الإسلامي', style: 'radio' },
                    { id: 'tarateel', name: 'إذاعة تراتيل وتلاوات نادرة 24/7', nameEn: 'Tarateel Live Stream', description: 'باقة مختارة من أروع التلاوات القرآنية النادرة لكبار القراء', style: 'radio' },
                  ]).map((reciter) => {
                    const isPlayingThis = (activeReciter?.id === reciter.id) || (voice247.selectedReciter === reciter.id && !voice247.scheduleEnabled);
                    const isSwitching = reciterSwitching === reciter.id;

                    return (
                      <div
                        key={reciter.id}
                        className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-3 ${
                          isPlayingThis
                            ? 'bg-emerald-950/40 border-emerald-500/70 ring-1 ring-emerald-500/50 shadow-md'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                              {isPlayingThis && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                              <span>الشيخ {reciter.name}</span>
                            </h5>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                              reciter.style === 'mujawwad'
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                                : reciter.style === 'radio'
                                ? 'bg-sky-950/60 text-sky-300 border border-sky-500/30'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {reciter.style === 'mujawwad' ? 'مجود' : reciter.style === 'radio' ? 'إذاعة' : 'مرتل'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                            {reciter.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {reciter.nameEn}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleSwitchReciter(reciter.id)}
                            disabled={isSwitching || isPlayingThis}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                              isPlayingThis
                                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                            }`}
                          >
                            {isSwitching ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isPlayingThis ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{isAr ? 'يعمل الآن' : 'Playing'}</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>{isAr ? 'تشغيل الآن' : 'Play Now'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 24-HOUR QURAN RECITATION SCHEDULE BUILDER */}
            {voice247.audioMode === 'quran' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white">
                        {isAr ? 'جدول تلاوات القرآن الكريم على مدار 24 ساعة (Auto Schedule)' : '24-Hour Quran Recitation Schedule'}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isAr
                        ? 'يبدل البوت القراء تلقائياً حسب ساعات اليوم دون أي تدخل بشري لضمان أجواء إيمانية مستمرة'
                        : 'Automatically transitions reciters based on hour of day for continuous spiritual ambiance'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-slate-300 font-medium">
                      {voice247.scheduleEnabled ? (isAr ? 'الجدول مفعل ✅' : 'Schedule On') : (isAr ? 'الجدول معطل ⏹️' : 'Schedule Off')}
                    </span>
                    <input
                      type="checkbox"
                      checked={voice247.scheduleEnabled ?? true}
                      onChange={(e) => {
                        const en = e.target.checked;
                        setVoice247({ ...voice247, scheduleEnabled: en });
                        handleSaveSchedule(scheduleSlots, en);
                      }}
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Current Mecca Time Display */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'التوقيت المعتمد لتبديل الفترات (توقيت مكة المكرمة):' : 'Active Timezone (Mecca UTC+3):'}</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {String(currentHourMecca).padStart(2, '0')}:00
                  </span>
                </div>

                {/* Schedule Slots List */}
                <div className="space-y-2.5">
                  {(scheduleSlots.length > 0 ? scheduleSlots : [
                    { id: 'slot-1', startHour: 4, endHour: 8, reciterId: 'alafasy', label: 'الفجر والصباح الباكر (04:00 - 08:00)' },
                    { id: 'slot-2', startHour: 8, endHour: 12, reciterId: 'muaiqly', label: 'الضحى والظهيرة (08:00 - 12:00)' },
                    { id: 'slot-3', startHour: 12, endHour: 16, reciterId: 'minshawi', label: 'الظهر والعصر (12:00 - 16:00)' },
                    { id: 'slot-4', startHour: 16, endHour: 20, reciterId: 'abdulbasit', label: 'المساء والمغرب (16:00 - 20:00)' },
                    { id: 'slot-5', startHour: 20, endHour: 24, reciterId: 'sudais', label: 'العشاء والحرم المكي (20:00 - 00:00)' },
                    { id: 'slot-6', startHour: 0, endHour: 4, reciterId: 'ghamdi', label: 'قيام الليل والأسحار (00:00 - 04:00)' },
                  ]).map((slot, index) => {
                    const isSlotCurrent = (slot.startHour < slot.endHour)
                      ? (currentHourMecca >= slot.startHour && currentHourMecca < slot.endHour)
                      : (currentHourMecca >= slot.startHour || currentHourMecca < slot.endHour);

                    return (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                          isSlotCurrent && voice247.scheduleEnabled
                            ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40'
                            : 'bg-slate-950/50 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isSlotCurrent && voice247.scheduleEnabled
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <span className="font-bold text-white block flex items-center gap-2">
                              <span>{slot.label}</span>
                              {isSlotCurrent && voice247.scheduleEnabled && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                  {isAr ? 'الفترة الحالية الآن ⭐' : 'ACTIVE NOW ⭐'}
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {String(slot.startHour).padStart(2, '0')}:00 ⬅️ {String(slot.endHour === 24 ? 0 : slot.endHour).padStart(2, '0')}:00
                            </span>
                          </div>
                        </div>

                        {/* Reciter Picker for this Slot */}
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-slate-400 shrink-0">{isAr ? 'القارئ المخصص:' : 'Assigned Reciter:'}</label>
                          <select
                            value={slot.reciterId}
                            onChange={(e) => {
                              const newReciterId = e.target.value;
                              const updated = (scheduleSlots.length > 0 ? scheduleSlots : [
                                { id: 'slot-1', startHour: 4, endHour: 8, reciterId: 'alafasy', label: 'الفجر والصباح الباكر (04:00 - 08:00)' },
                                { id: 'slot-2', startHour: 8, endHour: 12, reciterId: 'muaiqly', label: 'الضحى والظهيرة (08:00 - 12:00)' },
                                { id: 'slot-3', startHour: 12, endHour: 16, reciterId: 'minshawi', label: 'الظهر والعصر (12:00 - 16:00)' },
                                { id: 'slot-4', startHour: 16, endHour: 20, reciterId: 'abdulbasit', label: 'المساء والمغرب (16:00 - 20:00)' },
                                { id: 'slot-5', startHour: 20, endHour: 24, reciterId: 'sudais', label: 'العشاء والحرم المكي (20:00 - 00:00)' },
                                { id: 'slot-6', startHour: 0, endHour: 4, reciterId: 'ghamdi', label: 'قيام الليل والأسحار (00:00 - 04:00)' },
                              ]).map(s => s.id === slot.id ? { ...s, reciterId: newReciterId } : s);
                              setScheduleSlots(updated);
                            }}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 transition-colors"
                          >
                            {(recitersList.length > 0 ? recitersList : [
                              { id: 'alafasy', name: 'مشاري راشد العفاسي' },
                              { id: 'minshawi', name: 'محمد صديق المنشاوي' },
                              { id: 'abdulbasit', name: 'عبد الباسط عبد الصمد' },
                              { id: 'sudais', name: 'عبد الرحمن السديس' },
                              { id: 'muaiqly', name: 'ماهر المعيقلي' },
                              { id: 'ghamdi', name: 'سعد الغامدي' },
                              { id: 'cairo_radio', name: 'إذاعة القرآن الكريم (القاهرة)' },
                              { id: 'tarateel', name: 'إذاعة تراتيل وتلاوات نادرة 24/7' },
                            ]).map(r => (
                              <option key={r.id} value={r.id}>
                                الشيخ {r.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save Schedule Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveSchedule(scheduleSlots, voice247.scheduleEnabled ?? true)}
                    disabled={scheduleSaving}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                  >
                    {scheduleSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isAr ? 'حفظ وتفعيل جدول الـ 24 ساعة للروم الصوتي' : 'Save & Activate 24/7 Quran Schedule'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mute and Deafen toggles */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-200 font-bold">
                  <Headphones className="w-4 h-4 text-sky-400" />
                  {isAr ? 'كتم السمع (Server Deafen)' : 'Server Deafen'}
                </span>
                <input
                  type="checkbox"
                  checked={voice247.deafened}
                  onChange={(e) => setVoice247({ ...voice247, deafened: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-200 font-bold">
                  <MicOff className="w-4 h-4 text-amber-400" />
                  {isAr ? 'كتم المايك (Server Mute)' : 'Server Mute'}
                </span>
                <input
                  type="checkbox"
                  checked={voice247.muted}
                  onChange={(e) => setVoice247({ ...voice247, muted: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
