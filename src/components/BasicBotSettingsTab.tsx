import React, { useState } from 'react';
import {
  Bot,
  Radio,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Globe,
  Sparkles,
  Server,
  Users,
  Hash
} from 'lucide-react';
import { BotBasicSettings, ConnectedGuildItem } from '../types';
import { ConnectedBotData } from './TokenAuthGate';
import { ChannelSelector } from './ChannelSelector';
import { sound } from '../utils/sound';

interface BasicBotSettingsTabProps {
  lang: 'ar' | 'en';
  settings: BotBasicSettings;
  onChangeSettings: (updated: BotBasicSettings) => void;
  botInfo: ConnectedBotData | null;
  onSelectGuild?: (guild: ConnectedGuildItem) => void;
}

export const BasicBotSettingsTab: React.FC<BasicBotSettingsTabProps> = ({
  lang,
  settings,
  onChangeSettings,
  botInfo,
  onSelectGuild
}) => {
  const isAr = lang === 'ar';
  const [testingHeartbeat, setTestingHeartbeat] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<string>('الآن');

  const updateField = <K extends keyof BotBasicSettings>(key: K, value: BotBasicSettings[K]) => {
    onChangeSettings({
      ...settings,
      [key]: value
    });
  };

  const handleManualHeartbeat = async () => {
    setTestingHeartbeat(true);
    sound.playShieldActivate();
    try {
      await fetch('/ping');
      setLastPingTime(new Date().toLocaleTimeString('ar-EG'));
    } catch {
      // ignore
    } finally {
      setTimeout(() => setTestingHeartbeat(false), 600);
    }
  };

  const getStatusBadgeColor = (st: BotBasicSettings['presenceStatus']) => {
    switch (st) {
      case 'online':
        return 'bg-emerald-500';
      case 'dnd':
        return 'bg-rose-500';
      case 'idle':
        return 'bg-amber-400';
      case 'invisible':
        return 'bg-slate-500';
    }
  };

  const getActivityPrefixLabel = (type: BotBasicSettings['activityType']) => {
    switch (type) {
      case 'PLAYING':
        return 'Playing';
      case 'WATCHING':
        return 'Watching';
      case 'LISTENING':
        return 'Listening to';
      case 'COMPETING':
        return 'Competing in';
      case 'STREAMING':
        return 'Streaming';
    }
  };

  const activeGuild =
    botInfo?.selectedGuild ||
    (botInfo?.guilds && botInfo.guilds.length > 0
      ? botInfo.guilds[0]
      : {
          id: 'default-m7r',
          name: isAr ? 'سيرفر M7R الرسمي' : 'M7R Official Server',
          icon: '',
          memberCount: botInfo?.membersCount || 1284,
          channelsCount: botInfo?.channelsCount || 34,
          rolesCount: 18
        });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-rose-500" />
            {isAr ? 'الإعدادات الأساسية لبوت M7R + السيرفر المتصل ونظام 24/7' : 'M7R Core Bot Settings & 24/7 Engine'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'تحكم في السيرفر المتواجد فيه البوت، حالة البوت، البايو، تحديد الرومات الأساسية، ومحرك التشغيل 24/7'
              : 'Control your connected server, bot profile, Playing status, channels, and 24/7 keep-alive heartbeat'}
          </p>
        </div>
      </div>

      {/* CONNECTED SERVER CONTROL CARD */}
      <div className="rounded-xl border border-rose-500/30 bg-gradient-to-r from-[#140d12] via-[#0d1017] to-[#0f131d] p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {activeGuild.icon ? (
              <img
                src={activeGuild.icon}
                alt={activeGuild.name}
                className="w-14 h-14 rounded-2xl border-2 border-rose-500/40 object-cover shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-red-950 border border-rose-500/40 flex items-center justify-center font-black text-white text-lg shadow-lg">
                <Server className="w-7 h-7 text-rose-100" />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-rose-400">
                  {isAr ? '🛡️ السيرفر المتواجد فيه البوت للتحكم المباشر:' : '🛡️ Active Controlled Discord Server:'}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  {botInfo?.mode === 'live' ? (isAr ? 'متصل بالتوكن 🟢' : 'Live Token 🟢') : (isAr ? 'جاهز للتحكم 🟢' : 'Ready 🟢')}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">{activeGuild.name}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-1 font-mono">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <b>{activeGuild.memberCount}</b> {isAr ? 'عضو' : 'Members'}
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-rose-400" />
                  <b>{activeGuild.channelsCount}</b> {isAr ? 'روم' : 'Channels'}
                </span>
                <span className="text-slate-400 text-[11px]">ID: {activeGuild.id}</span>
              </div>
            </div>
          </div>

          {botInfo?.guilds && botInfo.guilds.length > 1 && (
            <div className="flex flex-col gap-1.5 min-w-[220px]">
              <label className="text-[11px] font-bold text-slate-300">
                {isAr ? 'تبديل السيرفر المراد التحكم به:' : 'Switch Controlled Server:'}
              </label>
              <select
                value={activeGuild.id}
                onChange={(e) => {
                  const found = botInfo.guilds?.find((g) => g.id === e.target.value);
                  if (found && onSelectGuild) {
                    sound.playClick();
                    onSelectGuild(found);
                  }
                }}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-rose-500"
              >
                {botInfo.guilds.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.memberCount} عضو)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Right Form Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Identity & Presence Card */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              {isAr ? 'هوية البوت وحالة الظهور في ديسكورد (Presence)' : 'Bot Identity & Discord Presence'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  {isAr ? 'اسم البوت (Bot Username)' : 'Bot Username'}
                </label>
                <input
                  type="text"
                  value={settings.botUsername}
                  onChange={(e) => updateField('botUsername', e.target.value)}
                  placeholder="m7r"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  {isAr ? 'حالة الاتصال (Status Dot)' : 'Status Indicator'}
                </label>
                <select
                  value={settings.presenceStatus}
                  onChange={(e) => {
                    updateField('presenceStatus', e.target.value as BotBasicSettings['presenceStatus']);
                    sound.playClick();
                  }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="dnd">⛔ عدم الإزعاج (Do Not Disturb - فخم)</option>
                  <option value="online">🟢 متصل (Online)</option>
                  <option value="idle">🌙 خامل (Idle)</option>
                  <option value="invisible">⚫ مخفي (Invisible)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  {isAr ? 'نوع النشاط (Activity Type)' : 'Activity Type'}
                </label>
                <select
                  value={settings.activityType}
                  onChange={(e) => {
                    updateField('activityType', e.target.value as BotBasicSettings['activityType']);
                    sound.playClick();
                  }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="PLAYING">🎮 يلعب (Playing)</option>
                  <option value="STREAMING">🟣 يبث مباشر (Streaming)</option>
                  <option value="WATCHING">👁️ يشاهد (Watching)</option>
                  <option value="LISTENING">🎧 يستمع إلى (Listening)</option>
                  <option value="COMPETING">🏆 ينافس في (Competing)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-300 font-semibold block mb-1.5">
                  {isAr ? 'النص الظاهر في حالة البوت (مثال: M7R Security 🛡️ أو /help)' : 'Activity Status Text'}
                </label>
                <input
                  type="text"
                  value={settings.activityText}
                  onChange={(e) => updateField('activityText', e.target.value)}
                  placeholder="M7R Security 🛡️"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Prefix & Server Channels Selector Card */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-500" />
              {isAr ? 'البادئة (Prefix) وتحديد رومات الأوامر والسجلات' : 'Command Prefix & Server Rooms Selection'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  {isAr ? 'بادئة الأوامر (Prefix)' : 'Bot Prefix'}
                </label>
                <input
                  type="text"
                  value={settings.prefix}
                  onChange={(e) => updateField('prefix', e.target.value)}
                  placeholder="!"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {isAr
                    ? `تعمل مع ${settings.prefix}help ، ${settings.prefix}mute ، ${settings.prefix}ban`
                    : `Works with ${settings.prefix}help, ${settings.prefix}mute`}
                </span>
              </div>

              <div>
                <ChannelSelector
                  lang={lang}
                  label={isAr ? 'تحديد روم اللوق (Log Room)' : 'Server Log Room'}
                  value={settings.logChannelName}
                  onChange={(ch) => updateField('logChannelName', ch)}
                  placeholder="log-server"
                  helperText={isAr ? 'روم إشعارات الحماية والحفظ' : 'Security & save logs room'}
                />
              </div>

              <div>
                <ChannelSelector
                  lang={lang}
                  label={isAr ? 'تحديد روم الأوامر (#cmd)' : 'Commands Room (#cmd)'}
                  value={settings.commandsChannelName || 'cmd'}
                  onChange={(ch) => updateField('commandsChannelName', ch)}
                  placeholder="cmd"
                  helperText={isAr ? 'الروم الأساسي لأوامر الأعضاء' : 'Primary commands room'}
                />
              </div>
            </div>
          </div>

          {/* 3. Bot Bio Customizer */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <Globe className="w-4 h-4 text-rose-400" />
              {isAr ? 'تخصيص نبذة البوت (Bot Bio)' : 'Bot Bio Description'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {isAr ? 'نبذة البوت (Bio Description)' : 'Bot Bio Description'}
                </label>
                <textarea
                  rows={2}
                  value={
                    settings.bioDescription ??
                    'M7R Security — نظام حماية وإدارة سيرفرات الديسكورد المتكامل مع أوامر الرقابة، الترحيب، التذاكر، والأذكار 24/7.'
                  }
                  onChange={(e) => updateField('bioDescription', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Built-in 24/7 Keep-Alive Engine */}
          <div className="rounded-xl border border-emerald-500/30 bg-[#0d1017] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'محرك التشغيل المستمر 24 ساعة (M7R 24/7 Auto-Keeper)' : '24/7 Built-in Keep-Alive Engine'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? 'نظام نبض داخلي يمنع خمول البوت ويعيد اتصاله تلقائياً على مدار 24 ساعة'
                      : 'Internal self-ping & WebSocket watchdog keeps the bot online 24/7'}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.keepAlive247}
                onChange={(e) => updateField('keepAlive247', e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'حالة المحرك 24/7' : 'Engine Status'}</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {settings.keepAlive247 ? (isAr ? 'نشط ومستمر 24/7' : 'Active 24/7') : (isAr ? 'متوقف' : 'Paused')}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'دورة تنشيط الاتصال' : 'Heartbeat Cycle'}</span>
                <span className="font-mono font-bold text-white mt-0.5 block">Every 25s</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'آخر نبضة ناجحة' : 'Last Pulse'}</span>
                  <span className="font-mono font-bold text-slate-200 mt-0.5 block">{lastPingTime}</span>
                </div>
                <button
                  onClick={handleManualHeartbeat}
                  className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-400 cursor-pointer transition-colors"
                  title={isAr ? 'تنشيط النبض الآن' : 'Trigger Pulse Now'}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingHeartbeat ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right/Left Column: Live Discord Profile Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4 sticky top-20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                {isAr ? 'معاينة بروفايل البوت في ديسكورد (Live Preview)' : 'Discord Bot Profile Preview'}
              </span>
              <span className="text-[10px] font-mono text-rose-400">#{settings.commandsChannelName || 'cmd'}</span>
            </div>

            <div className="rounded-2xl overflow-hidden bg-[#111214] border border-slate-800 shadow-2xl">
              <div className="h-28 bg-gradient-to-r from-rose-950 via-[#1a0f16] to-slate-950 relative flex items-center justify-center border-b border-rose-500/20">
                <span className="text-2xl font-black tracking-wider text-rose-400/90 select-none font-mono">
                  {settings.botUsername || 'M7R'} SECURITY 🛡️
                </span>
              </div>

              <div className="px-5 pb-5 relative">
                <div className="relative -mt-11 mb-3 inline-block">
                  {botInfo?.avatar ? (
                    <img
                      src={botInfo.avatar}
                      alt={settings.botUsername}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-full border-[5px] border-[#111214] object-cover bg-[#18191c]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-[5px] border-[#111214] bg-[#18191c] flex items-center justify-center text-rose-500 font-black text-xl shadow-inner font-mono">
                      M7R
                    </div>
                  )}
                  <div
                    className={`w-5 h-5 rounded-full border-[3.5px] border-[#111214] absolute bottom-0.5 right-0.5 ${getStatusBadgeColor(
                      settings.presenceStatus
                    )}`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-white">{settings.botUsername || 'm7r'}</span>
                  <span className="bg-[#5865F2] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wider">
                    ✓ APP
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#1e1f22] text-emerald-400 font-mono text-[10px] font-bold border border-slate-800">
                    {'{/}'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {botInfo?.tag || `${settings.botUsername || 'm7r'}#1624`}
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-[#1e1f22] border border-slate-800/70 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    {getActivityPrefixLabel(settings.activityType)}
                  </span>
                  <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                    <span>{settings.activityText || 'M7R Security 🛡️'}</span>
                  </div>
                </div>

                <div className="mt-3 p-3.5 rounded-xl bg-[#1e1f22] border border-slate-800/70 space-y-2 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 block">Bio</span>
                  <p className="text-slate-200 leading-relaxed">
                    {settings.bioDescription ||
                      'M7R Security — نظام حماية وإدارة سيرفرات الديسكورد المتكامل مع أوامر الرقابة، الترحيب، التذاكر، والأذكار 24/7.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
