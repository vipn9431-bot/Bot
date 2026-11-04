import React, { useState } from 'react';
import {
  ShieldCheck,
  DatabaseBackup,
  Gift,
  TerminalSquare,
  Plus,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Trash2,
  Send,
  Trophy,
  Download,
  Lock
} from 'lucide-react';
import { BackupSnapshot, GiveawayItem, VerificationConfig } from '../types';
import { ChannelSelector } from './ChannelSelector';
import { sound } from '../utils/sound';

interface AdvancedSuiteTabProps {
  lang: 'ar' | 'en';
}

export const AdvancedSuiteTab: React.FC<AdvancedSuiteTabProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [subTab, setSubTab] = useState<'verification' | 'backups' | 'giveaways' | 'terminal'>('verification');

  // 1. Verification & Anti-Alt State
  const [verification, setVerification] = useState<VerificationConfig>({
    enabled: true,
    channelName: '#verify-here',
    verifiedRoleName: '@Verified Member',
    minAccountAgeDays: 7,
    blockDefaultAvatar: true,
    captchaMode: 'code_image'
  });
  const [captchaTestInput, setCaptchaTestInput] = useState('');
  const [captchaSuccess, setCaptchaSuccess] = useState<boolean | null>(null);

  // 2. Backups State
  const [backups, setBackups] = useState<BackupSnapshot[]>([
    {
      id: 'bk-1',
      code: 'M7R-BK-9920X',
      createdAt: 'اليوم، 02:30 ص',
      rolesCount: 44,
      channelsCount: 68,
      sizeKB: 184,
      note: 'نسخة احتياطية كاملة قبل تحديث رتب المتجر'
    },
    {
      id: 'bk-2',
      code: 'M7R-BK-4418A',
      createdAt: 'قبل 3 أيام',
      rolesCount: 41,
      channelsCount: 62,
      sizeKB: 172,
      note: 'نسخة تلقائية أسبوعية لدرع Anti-Nuke'
    }
  ]);
  const [backupNote, setBackupNote] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // 3. Giveaways State
  const [giveaways, setGiveaways] = useState<GiveawayItem[]>([
    {
      id: 'gw-1',
      prize: 'Nitro Boost 1 Year 💎',
      winnersCount: 2,
      channel: '#giveaways',
      endsAt: 'بعد 4 ساعات',
      entriesCount: 342,
      status: 'active'
    },
    {
      id: 'gw-2',
      prize: 'رتبة VIP + رصيد متجر 100 ريال 🛒',
      winnersCount: 1,
      channel: '#ghost-drops',
      endsAt: 'انتهى',
      entriesCount: 518,
      status: 'ended',
      winnerNames: ['Sultan_Pro#1102']
    }
  ]);
  const [newPrize, setNewPrize] = useState('');
  const [newWinnersCount, setNewWinnersCount] = useState(1);
  const [newGwChannel, setNewGwChannel] = useState('#giveaways');

  // 4. Live Command Terminal State
  const [cmdHistory, setCmdHistory] = useState<{ id: string; cmd: string; output: string; time: string }[]>([
    {
      id: 'c-1',
      cmd: '/status',
      output: '[M7R ENGINE] All 42 shards online. Anti-Nuke Shield: ACTIVE. Memory: 48MB.',
      time: '04:10:12'
    },
    {
      id: 'c-2',
      cmd: '/antinuke check',
      output: '[SECURITY] 0 unauthorized webhooks. 2 users in Trusted Whitelist. Lockdown: OFF.',
      time: '04:15:00'
    }
  ]);
  const [cmdInput, setCmdInput] = useState('');

  // Handlers
  const handleTestCaptcha = () => {
    sound.playClick();
    if (captchaTestInput.trim().toUpperCase() === 'M7R99') {
      sound.playShieldActivate();
      setCaptchaSuccess(true);
    } else {
      sound.playAlarm();
      setCaptchaSuccess(false);
    }
  };

  const handleCreateBackup = () => {
    sound.playShieldActivate();
    const randomCode = `M7R-BK-${Math.floor(1000 + Math.random() * 9000)}S`;
    const newBk: BackupSnapshot = {
      id: `bk-${Date.now()}`,
      code: randomCode,
      createdAt: 'الآن',
      rolesCount: 45,
      channelsCount: 70,
      sizeKB: 192,
      note: backupNote.trim() || (isAr ? 'نسخة احتياطية يدوية فورية' : 'Manual instant snapshot')
    };
    setBackups(prev => [newBk, ...prev]);
    setBackupNote('');
  };

  const handleRestoreBackup = (id: string) => {
    sound.playShieldActivate();
    setRestoringId(id);
    setTimeout(() => {
      setRestoringId(null);
    }, 1800);
  };

  const handleStartGiveaway = () => {
    if (!newPrize.trim()) return;
    sound.playShieldActivate();
    const gw: GiveawayItem = {
      id: `gw-${Date.now()}`,
      prize: newPrize.trim(),
      winnersCount: newWinnersCount,
      channel: newGwChannel,
      endsAt: isAr ? 'بعد 24 ساعة' : 'In 24 hours',
      entriesCount: 1,
      status: 'active'
    };
    setGiveaways(prev => [gw, ...prev]);
    setNewPrize('');
  };

  const handleRerollGiveaway = (id: string) => {
    sound.playShieldActivate();
    const sampleWinners = ['Faisal_X#9011', 'Rakan_VIP#0001', 'Khalid_M7R#7721', 'Nasser_Gamer#3310'];
    const randomWinner = sampleWinners[Math.floor(Math.random() * sampleWinners.length)];
    setGiveaways(prev =>
      prev.map(g =>
        g.id === id
          ? { ...g, status: 'ended', endsAt: isAr ? 'تم السحب الآن' : 'Ended', winnerNames: [randomWinner] }
          : g
      )
    );
  };

  const handleRunCommand = (customCmd?: string) => {
    const raw = (customCmd || cmdInput).trim();
    if (!raw) return;
    sound.playClick();

    let responseText = `[M7R BOT] تم تنفيذ الأمر (${raw}) بنجاح على السيرفر.`;
    const lower = raw.toLowerCase();

    if (lower.startsWith('/lock')) {
      responseText = '🔒 [CHANNEL LOCKED] تم قفل الروم الحالي ومنع الأعضاء من الكتابة بنجاح.';
    } else if (lower.startsWith('/unlock')) {
      responseText = '🔓 [CHANNEL UNLOCKED] تم إعادة فتح الروم للسماح بالكتابة.';
    } else if (lower.startsWith('/clear')) {
      responseText = '🧹 [PURGE] تم مسح 100 رسالة من الشات بنجاح في 0.4 ثانية.';
    } else if (lower.startsWith('/verify-all')) {
      responseText = '✅ [VERIFY] تم منح رتبة التوثيق لجميع الأعضاء المتواجدين في السيرفر.';
    } else if (lower.startsWith('/backup')) {
      responseText = '💾 [SNAPSHOT] تم حفظ هيكل الرومات والرتب بكود M7R-BK-LIVE.';
    }

    setCmdHistory(prev => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        cmd: raw,
        output: responseText,
        time: new Date().toLocaleTimeString('en-GB', { hour12: false })
      }
    ]);
    if (!customCmd) setCmdInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-rose-500" />
            {isAr ? 'الترسانة المتقدمة والميزات الحصرية (M7R Pro Suite)' : 'M7R Pro Security & Utility Suite'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'التحقق الذكي ضد الوهميات (Captcha)، النسخ الاحتياطي للسيرفر، السحوبات (Giveaways)، وتيرمنال الأوامر المباشر'
              : 'Anti-Alt Captcha Gate, Full Guild Backups, Giveaways Engine, and Live Command Terminal'}
          </p>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0d1017] border border-slate-800 rounded-lg max-w-3xl">
        <button
          onClick={() => { setSubTab('verification'); sound.playClick(); }}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'verification'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1.5" />
          {isAr ? 'التحقق وكاشف الوهميات (Captcha)' : 'Captcha & Anti-Alt'}
        </button>

        <button
          onClick={() => { setSubTab('backups'); sound.playClick(); }}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'backups'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DatabaseBackup className="w-3.5 h-3.5 inline-block mr-1.5" />
          {isAr ? 'النسخ الاحتياطي (Server Backup)' : 'Server Backups'}
        </button>

        <button
          onClick={() => { setSubTab('giveaways'); sound.playClick(); }}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'giveaways'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gift className="w-3.5 h-3.5 inline-block mr-1.5" />
          {isAr ? 'نظام السحوبات (Giveaways)' : 'Giveaways'}
        </button>

        <button
          onClick={() => { setSubTab('terminal'); sound.playClick(); }}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'terminal'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TerminalSquare className="w-3.5 h-3.5 inline-block mr-1.5" />
          {isAr ? 'تيرمنال الأوامر الحي' : 'Live Console'}
        </button>
      </div>

      {/* 1. VERIFICATION & ANTI-ALT CAPTCHA */}
      {subTab === 'verification' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{isAr ? 'بوابة التحقق وكاشف الحسابات الوهمية' : 'Anti-Alt & Verification Gate'}</h3>
                <p className="text-[11px] text-slate-400">
                  {isAr ? 'فحص الحسابات الجديدة قبل منحها رتبة دخول السيرفر' : 'Screen new members before granting access roles'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={verification.enabled}
                onChange={(e) => setVerification({ ...verification, enabled: e.target.checked })}
                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <ChannelSelector
                  lang={lang}
                  compact={true}
                  label={isAr ? 'تحديد روم التوثيق' : 'Verification Channel'}
                  value={verification.channelName}
                  onChange={(ch) => setVerification({ ...verification, channelName: ch })}
                  placeholder="verify-here"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">{isAr ? 'الرتبة بعد التحقق' : 'Verified Role'}</label>
                <input
                  type="text"
                  value={verification.verifiedRoleName}
                  onChange={(e) => setVerification({ ...verification, verifiedRoleName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300">{isAr ? 'أقل عمر مسموح للحساب بالديسكورد (أيام)' : 'Minimum Account Age (Days)'}</span>
                <span className="font-mono font-bold text-rose-400 tabular-nums">{verification.minAccountAgeDays} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={verification.minAccountAgeDays}
                onChange={(e) => setVerification({ ...verification, minAccountAgeDays: parseInt(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer text-xs">
              <div>
                <span className="font-semibold text-slate-200 block">{isAr ? 'منع الحسابات بدون صورة رمزية (No Avatar Kick)' : 'Block Default Discord Avatars'}</span>
                <span className="text-[11px] text-slate-400">{isAr ? 'رفض دخول التوكنات الوهمية التي لا تملك أفاتار' : 'Auto-reject raid bot accounts lacking profile avatars'}</span>
              </div>
              <input
                type="checkbox"
                checked={verification.blockDefaultAvatar}
                onChange={(e) => setVerification({ ...verification, blockDefaultAvatar: e.target.checked })}
                className="w-4 h-4 accent-rose-600 rounded"
              />
            </label>
          </div>

          {/* Interactive Captcha Simulator */}
          <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">{isAr ? 'معاينة وتجربة كابتشا M7R التفاعلية:' : 'Interactive M7R Captcha Simulator:'}</h3>

            <div className="rounded-lg bg-[#2b2d31] p-4 border-l-4 border-emerald-500 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">🛡️ M7R Verification Shield</span>
                <span className="text-[10px] font-mono text-emerald-400">Anti-Bot v2.4</span>
              </div>
              <p className="text-xs text-slate-200">
                {isAr
                  ? 'مرحباً بك في السيرفر! لإثبات أنك لست روبوت تخريب، يرجى كتابة الكود الظاهر في اللوحة الأمنية أدناه:'
                  : 'Welcome! Please enter the security code shown below to unlock server channels:'}
              </p>

              {/* Simulated Captcha Graphic */}
              <div className="py-4 px-6 rounded-lg bg-[#111318] border border-slate-700 flex items-center justify-center select-none relative overflow-hidden">
                <div className="text-2xl font-black tracking-[0.45em] font-mono text-rose-400 italic line-through decoration-emerald-500/60">
                  M7R99
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder={isAr ? 'اكتب الكود هنا (M7R99)...' : 'Enter code (M7R99)...'}
                  value={captchaTestInput}
                  onChange={(e) => setCaptchaTestInput(e.target.value)}
                  className="flex-1 bg-[#1e1f22] border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleTestCaptcha}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded cursor-pointer transition-colors"
                >
                  {isAr ? 'تحقق الآن' : 'Verify'}
                </button>
              </div>

              {captchaSuccess === true && (
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'تم التحقق بنجاح! تم منحك رتبة @Verified Member' : 'Verified! Role @Verified Member granted.'}</span>
                </div>
              )}
              {captchaSuccess === false && (
                <div className="text-xs text-rose-400 font-semibold">
                  {isAr ? '❌ الكود غير مطابق! حاول كتابة M7R99' : 'Invalid code! Try typing M7R99'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SERVER BACKUPS & SNAPSHOTS */}
      {subTab === 'backups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DatabaseBackup className="w-4 h-4 text-rose-400" />
              {isAr ? 'إنشاء نسخة احتياطية فورية للسيرفر' : 'Create Guild Snapshot'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr
                ? 'يقوم البوت بحفظ جميع الرومات، التصنيفات، الرتب، والصلاحيات في كود مشفر لاسترجاع السيرفر في ثوانٍ عند الطوارئ.'
                : 'Save all channels, categories, roles, and permissions into an encrypted backup code.'}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">{isAr ? 'ملاحظة أو اسم النسخة' : 'Snapshot Label'}</label>
                <input
                  type="text"
                  placeholder={isAr ? 'مثال: نسخة قبل التعديلات الإدارية...' : 'e.g., Pre-update snapshot...'}
                  value={backupNote}
                  onChange={(e) => setBackupNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <button
                onClick={handleCreateBackup}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'حفظ نسخة احتياطية الآن' : 'Create Backup Now'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'الأرشيف المحفوظ (Saved Snapshots)' : 'Stored Server Backups'} ({backups.length})
            </h3>

            <div className="space-y-2.5">
              {backups.map((bk) => (
                <div
                  key={bk.id}
                  className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded">
                        {bk.code}
                      </span>
                      <span className="text-xs font-bold text-white">{bk.note}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 font-mono">
                      <span>{bk.rolesCount} Roles</span>
                      <span>·</span>
                      <span>{bk.channelsCount} Channels</span>
                      <span>·</span>
                      <span>{bk.sizeKB} KB</span>
                      <span>·</span>
                      <span>{bk.createdAt}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreBackup(bk.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${restoringId === bk.id ? 'animate-spin' : ''}`} />
                    <span>
                      {restoringId === bk.id
                        ? (isAr ? 'جاري الاسترجاع...' : 'Restoring...')
                        : (isAr ? 'استرجاع النسخة' : 'Restore')}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. GIVEAWAYS ENGINE */}
      {subTab === 'giveaways' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-rose-400" />
              {isAr ? 'إطلاق سحب جديد (Start Giveaway)' : 'Launch New Giveaway'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">{isAr ? 'الجائزة (Prize)' : 'Prize Title'}</label>
                <input
                  type="text"
                  placeholder={isAr ? 'مثال: نيترو قيمنق شهرين أو حساب نادر' : 'e.g. Discord Nitro 1 Year'}
                  value={newPrize}
                  onChange={(e) => setNewPrize(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">{isAr ? 'عدد الفائزين' : 'Winners Count'}</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newWinnersCount}
                    onChange={(e) => setNewWinnersCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <ChannelSelector
                    lang={lang}
                    compact={true}
                    label={isAr ? 'تحديد روم السحب' : 'Giveaway Channel'}
                    value={newGwChannel}
                    onChange={(ch) => setNewGwChannel(ch)}
                    placeholder="giveaways"
                  />
                </div>
              </div>

              <button
                onClick={handleStartGiveaway}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Gift className="w-4 h-4" />
                <span>{isAr ? 'نشر السحب في الديسكورد 🎉' : 'Publish Giveaway 🎉'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">
              {isAr ? 'السحوبات الجارية والمنتهية' : 'Active & Past Giveaways'}
            </h3>

            <div className="space-y-3">
              {giveaways.map((g) => (
                <div
                  key={g.id}
                  className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{g.prize}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        g.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {g.status === 'active' ? (isAr ? 'جاري الآن 🎉' : 'ACTIVE') : (isAr ? 'منتهي' : 'ENDED')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>{g.channel}</span>
                      <span>·</span>
                      <span>{g.entriesCount} {isAr ? 'مشارك' : 'Entries'}</span>
                      <span>·</span>
                      <span>{g.winnersCount} {isAr ? 'فائز' : 'Winner(s)'}</span>
                      <span>·</span>
                      <span>{g.endsAt}</span>
                    </div>

                    {g.winnerNames && g.winnerNames.length > 0 && (
                      <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 pt-1">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{isAr ? 'الفائز:' : 'Winner:'} {g.winnerNames.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleRerollGiveaway(g.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 text-xs font-bold cursor-pointer shrink-0"
                  >
                    🎲 {isAr ? 'سحب فائز / Reroll' : 'Draw / Reroll'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. LIVE COMMAND TERMINAL */}
      {subTab === 'terminal' && (
        <div className="rounded-xl border border-slate-800 bg-[#0a0d13] overflow-hidden shadow-2xl">
          <div className="px-4 py-3 bg-[#0e121a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TerminalSquare className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-mono font-bold text-white">M7R Live Remote Command Console</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {['/lock', '/unlock', '/clear 100', '/verify-all', '/backup create'].map((quick) => (
                <button
                  key={quick}
                  onClick={() => handleRunCommand(quick)}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-rose-950/50 border border-slate-800 text-[10px] font-mono text-slate-300 hover:text-rose-300 cursor-pointer transition-colors"
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-2.5 max-h-[340px] overflow-y-auto font-mono text-xs bg-[#07090e]">
            {cmdHistory.map((item) => (
              <div key={item.id} className="space-y-1 border-b border-slate-900 pb-2">
                <div className="flex items-center gap-2 text-rose-400">
                  <span className="text-slate-600">[{item.time}]</span>
                  <span>root@m7r-bot:~#</span>
                  <span className="text-white font-bold">{item.cmd}</span>
                </div>
                <div className="text-emerald-400 pl-6">{item.output}</div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0e121a] border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              dir="ltr"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunCommand()}
              placeholder="Type a bot slash command (e.g. /lock, /clear 50, /ban @user)..."
              className="flex-1 bg-[#07090e] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
            />
            <button
              onClick={() => handleRunCommand()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAr ? 'تنفيذ' : 'Execute'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
