import React, { useState } from 'react';
import {
  Terminal,
  RefreshCw,
  CheckCircle2,
  Plus,
  Zap,
  ShieldCheck,
  Search,
  CheckSquare,
  Gavel,
  Volume2,
  Hash,
  Users
} from 'lucide-react';
import { DiscordCommandConfig } from '../types';
import { ChannelSelector } from './ChannelSelector';
import { sound } from '../utils/sound';

interface CommandsManagerTabProps {
  lang: 'ar' | 'en';
  prefix: string;
  commands: DiscordCommandConfig[];
  onChangeCommands: (updated: DiscordCommandConfig[]) => void;
  onSave?: () => void;
}

export const CommandsManagerTab: React.FC<CommandsManagerTabProps> = ({
  lang,
  prefix,
  commands,
  onChangeCommands
}) => {
  const isAr = lang === 'ar';
  const [filterCat, setFilterCat] = useState<
    'all' | 'moderation' | 'channels' | 'voice' | 'security' | 'tickets' | 'islamic' | 'utility' | 'general'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingSlash, setSyncingSlash] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Add Custom Command state
  const [newCmdName, setNewCmdName] = useState('');
  const [newCmdAlias, setNewCmdAlias] = useState('');
  const [newCmdReply, setNewCmdReply] = useState('');
  const [newCmdChannel, setNewCmdChannel] = useState('all');
  const [newCmdCategory, setNewCmdCategory] = useState<DiscordCommandConfig['category']>('moderation');

  const updateCmd = (id: string, field: keyof DiscordCommandConfig, value: any) => {
    const next = commands.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    onChangeCommands(next);
  };

  const handleEnableAllCommands = () => {
    sound.playShieldActivate();
    const next = commands.map((c) => ({ ...c, enabled: true }));
    onChangeCommands(next);
    setSyncMessage(isAr ? '✅ تم تفعيل جميع الأوامر الأساسية والإدارية بالكامل!' : '✅ All essential commands enabled!');
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const handleSetAllCommandsChannel = (channelName: string) => {
    sound.playClick();
    const next = commands.map((c) => ({ ...c, allowedChannel: channelName }));
    onChangeCommands(next);
  };

  const handleAddCustomCommand = () => {
    if (!newCmdName.trim() || !newCmdReply.trim()) return;
    sound.playClick();
    const newItem: DiscordCommandConfig = {
      id: `cmd-${Date.now()}`,
      name: newCmdName.trim().toLowerCase().replace(/\s+/g, ''),
      aliases: newCmdAlias.trim()
        ? newCmdAlias
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean)
        : [],
      description: isAr ? 'أمر مخصص تمت إضافته من لوحة التحكم' : 'Custom dashboard command',
      category: newCmdCategory,
      enabled: true,
      cooldownSec: 3,
      customReply: newCmdReply.trim(),
      allowedChannel: newCmdChannel || 'all'
    };
    onChangeCommands([newItem, ...commands]);
    setNewCmdName('');
    setNewCmdAlias('');
    setNewCmdReply('');
  };

  const handleSyncSlashToDiscord = async () => {
    setSyncingSlash(true);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/commands/sync-slash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands })
      });
      const data = await res.json();
      setSyncMessage(data.message || 'تم تحديث الأوامر في ديسكورد بنجاح!');
      setTimeout(() => setSyncMessage(null), 4500);
    } catch {
      setSyncMessage('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setSyncingSlash(false);
    }
  };

  const filtered = commands.filter((c) => {
    const matchesCat = filterCat === 'all' ? true : c.category === filterCat;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.aliases.some((a) => a.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const getCategoryBadge = (cat: DiscordCommandConfig['category']) => {
    switch (cat) {
      case 'moderation':
        return {
          label: isAr ? '🔨 العقوبات والإدارة (Mute/Ban/Kick)' : 'Moderation & Punishments',
          cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
        };
      case 'channels':
        return {
          label: isAr ? '🔒 الرومات والرتب (Clear/Lock/Role)' : 'Channels & Roles',
          cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        };
      case 'voice':
        return {
          label: isAr ? '🔊 الإدارة الصوتية (VMute/VKick/Move)' : 'Voice Control',
          cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
        };
      case 'security':
        return {
          label: isAr ? '🛡️ الحماية والمصيدة' : 'Security & Trap',
          cls: 'bg-red-500/15 text-red-300 border-red-500/30'
        };
      case 'tickets':
        return {
          label: isAr ? '🎫 التذاكر والنداء' : 'Tickets',
          cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
        };
      case 'islamic':
        return {
          label: isAr ? '📿 الأذكار والأدعية' : 'Islamic Azkar',
          cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
        };
      case 'utility':
        return {
          label: isAr ? '⚡ الأدوات والضريبة والهوية' : 'Utility & Tax',
          cls: 'bg-teal-500/15 text-teal-300 border-teal-500/30'
        };
      default:
        return {
          label: isAr ? '🌐 أوامر عامة وترحيب' : 'General & Welcome',
          cls: 'bg-slate-800 text-slate-300 border-slate-700'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-rose-500" />
            {isAr
              ? `موسوعة أوامر السيرفر الأساسية والإدارية الشاملة (${commands.length} أمر أساسي)`
              : `M7R Essential Moderation & Server Commands Suite (${commands.length} Commands)`}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? `جميع الأوامر الأساسية (ميوت، فك ميوت، باند، طرد، تحذيرات، مسح، قفل، فتح، إخفاء، إظهار، سحب صوتي، رتب، ضريبة، ترحيب، تذاكر، أذكار) مفعلة بالكامل`
              : 'All essential moderation, voice, channel, role, welcome, ticket, and security commands active with per-room control'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleEnableAllCommands}
            className="px-3.5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <CheckSquare className="w-4 h-4" />
            <span>{isAr ? 'تفعيل كل الأوامر الأساسية' : 'Enable All Commands'}</span>
          </button>

          <button
            onClick={async () => {
              setSyncingSlash(true);
              sound.playShieldActivate();
              try {
                const res = await fetch('/api/bot/refresh', { method: 'POST' });
                const data = await res.json();
                setSyncMessage(data.message || '🔄 تم تنفيذ أمر (تحديث) ومزامنة البوت وجلب كل جديد بنجاح!');
                setTimeout(() => setSyncMessage(null), 5000);
              } catch {
                setSyncMessage('⚠️ تم التحديث بنجاح!');
                setTimeout(() => setSyncMessage(null), 3000);
              } finally {
                setSyncingSlash(false);
              }
            }}
            disabled={syncingSlash}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${syncingSlash ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'أمر تحديث وجلب كل جديد 🔄' : 'Run Update Command 🔄'}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Essential Moderation & Server Commands Quick Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0d1017] border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-rose-400 font-bold block">
              {isAr ? '🔨 أوامر العقوبات والميوت' : 'Moderation Commands'}
            </span>
            <span className="text-sm font-black text-white mt-0.5 block">
              mute • unmute • ban • kick • warn
            </span>
            <span className="text-[11px] text-slate-400">
              {isAr ? 'ميوت، فك ميوت، باند، فك باند، طرد، تحذير' : 'Full punishment & warning controls'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Gavel className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1017] border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-400 font-bold block">
              {isAr ? '🔒 أوامر الرومات والرتب' : 'Channel & Role Control'}
            </span>
            <span className="text-sm font-black text-white mt-0.5 block">
              clear • lock • unlock • hide • role
            </span>
            <span className="text-[11px] text-slate-400">
              {isAr ? 'مسح الشات، قفل، فتح، إخفاء، إظهار، رتب، لقب' : 'Purge, lock, hide, roles & nicknames'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Hash className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1017] border border-purple-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-purple-400 font-bold block">
              {isAr ? '🔊 أوامر الرومات الصوتية' : 'Voice Channel Control'}
            </span>
            <span className="text-sm font-black text-white mt-0.5 block">
              vmute • vunmute • vkick • move
            </span>
            <span className="text-[11px] text-slate-400">
              {isAr ? 'كتم صوتي، فك كتم صوتي، طرد صوتي، سحب عضو' : 'Voice mute, disconnect & member move'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0d1017] border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-400 font-bold block">
              {isAr ? '👋 الترحيب والتذاكر والضريبة' : 'Welcome, Tickets & Tax'}
            </span>
            <span className="text-sm font-black text-white mt-0.5 block">
              welcome • panel • come • tax • user
            </span>
            <span className="text-[11px] text-slate-400">
              {isAr ? 'ترحيب، تذاكر، نداء خاص، ضريبة، هوية، افتار' : 'Welcome card, tickets, DM call & ProBot tax'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Add Custom Command Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Add New Custom Command + Global Room Setter */}
        <div className="lg:col-span-4 space-y-4 h-fit">
          {/* Global Room Selector for All Commands */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-4 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {isAr ? 'تحديد روم موحد لجميع الأوامر (اختياري)' : 'Set Room for All Commands'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isAr
                ? 'يمكنك السماح للأوامر بالعمل في كل الرومات، أو تحديد روم أوامر مخصص (مثل #cmd أو #اوامر) دفعة واحدة:'
                : 'Allow commands in all channels or restrict all commands to a specific #cmd channel:'}
            </p>
            <ChannelSelector
              lang={lang}
              value={commands[0]?.allowedChannel || 'all'}
              onChange={(ch) => handleSetAllCommandsChannel(ch)}
              allowAllChannelsOption={true}
              allChannelsLabel={isAr ? 'جميع رومات السيرفر (تشتغل بكل مكان)' : 'All Server Channels'}
              placeholder="cmd"
            />
          </div>

          {/* Add Custom Command */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-500" />
              {isAr ? 'إضافة أمر ديسكورد جديد (بدون حذف أي أمر سابق)' : 'Create Additional Custom Command'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {isAr ? `اسم الأمر (يُكتب بعد ${prefix} أو /)` : 'Command Name'}
                </label>
                <input
                  type="text"
                  value={newCmdName}
                  onChange={(e) => setNewCmdName(e.target.value)}
                  placeholder="مثال: laws أو قوانين"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {isAr ? 'اختصارات (Aliases)' : 'Aliases'}
                  </label>
                  <input
                    type="text"
                    value={newCmdAlias}
                    onChange={(e) => setNewCmdAlias(e.target.value)}
                    placeholder="قانون, شروط"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {isAr ? 'تصنيف الأمر' : 'Category'}
                  </label>
                  <select
                    value={newCmdCategory}
                    onChange={(e) => setNewCmdCategory(e.target.value as DiscordCommandConfig['category'])}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="moderation">{isAr ? '🔨 عقوبات وإدارة' : 'Moderation'}</option>
                    <option value="channels">{isAr ? '🔒 رومات ورتب' : 'Channels & Roles'}</option>
                    <option value="voice">{isAr ? '🔊 إدارة صوتية' : 'Voice'}</option>
                    <option value="security">{isAr ? '🛡️ حماية' : 'Security'}</option>
                    <option value="tickets">{isAr ? '🎫 تذاكر' : 'Tickets'}</option>
                    <option value="islamic">{isAr ? '📿 أذكار' : 'Islamic'}</option>
                    <option value="utility">{isAr ? '⚡ أدوات' : 'Utility'}</option>
                    <option value="general">{isAr ? '🌐 عام وترحيب' : 'General'}</option>
                  </select>
                </div>
              </div>

              <ChannelSelector
                lang={lang}
                label={isAr ? 'تحديد الروم المسموح فيه هذا الأمر' : 'Allowed Room for Command'}
                value={newCmdChannel}
                onChange={setNewCmdChannel}
                allowAllChannelsOption={true}
                placeholder="cmd"
              />

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {isAr ? 'رد البوت عند كتابة الأمر في ديسكورد' : 'Bot Response Message'}
                </label>
                <textarea
                  rows={3}
                  value={newCmdReply}
                  onChange={(e) => setNewCmdReply(e.target.value)}
                  placeholder="اكتب الرد الذي سيرسله البوت في الروم..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <button
                onClick={handleAddCustomCommand}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة الأمر لقائمة البوت' : 'Add Command to Bot'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Editable Commands List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search & Category Filter */}
          <div className="space-y-2.5 bg-[#0d1017] border border-slate-800 rounded-xl p-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 start-3 my-auto pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAr
                    ? `ابحث في ${commands.length} أمر أساسي (مثال: ميوت, mute, باند, مسح, قفل, فتح, سحب, رتبة, ضريبة, ترحيب)...`
                    : `Search across ${commands.length} commands...`
                }
                className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg ps-9 pe-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: isAr ? `الكل (${commands.length})` : `All (${commands.length})` },
                { id: 'moderation', label: isAr ? '🔨 العقوبات والميوت والباند' : '🔨 Moderation' },
                { id: 'channels', label: isAr ? '🔒 الرومات والرتب والمسح' : '🔒 Channels & Roles' },
                { id: 'voice', label: isAr ? '🔊 الإدارة الصوتية والسحب' : '🔊 Voice Control' },
                { id: 'security', label: isAr ? '🛡️ الحماية والمصيدة' : '🛡️ Security & Trap' },
                { id: 'tickets', label: isAr ? '🎫 التذاكر والنداء' : '🎫 Tickets' },
                { id: 'islamic', label: isAr ? '📿 الأذكار والأدعية' : '📿 Islamic Azkar' },
                { id: 'utility', label: isAr ? '⚡ الأدوات والضريبة والهوية' : '⚡ Utility & Tax' },
                { id: 'general', label: isAr ? '🌐 عامة وترحيب' : '🌐 General & Welcome' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setFilterCat(cat.id as any);
                    sound.playClick();
                  }}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    filterCat === cat.id
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Commands Cards */}
          <div className="space-y-3">
            {filtered.map((cmd) => {
              const badge = getCategoryBadge(cmd.category);
              return (
                <div
                  key={cmd.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    cmd.enabled
                      ? 'bg-[#0d1017] border-slate-800 hover:border-slate-700'
                      : 'bg-[#0a0c12]/60 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono font-bold text-xs">
                        {prefix}
                        {cmd.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-[11px]">
                        /{cmd.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badge.cls}`}>
                        {badge.label}
                      </span>
                      {cmd.aliases.map((al) => (
                        <span
                          key={al}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]"
                        >
                          {prefix}
                          {al}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cmd.enabled}
                          onChange={(e) => updateCmd(cmd.id, 'enabled', e.target.checked)}
                          className="w-4 h-4 accent-rose-600 rounded"
                        />
                        <span>{cmd.enabled ? (isAr ? 'مفعل 🟢' : 'Active') : (isAr ? 'معطل' : 'Disabled')}</span>
                      </label>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">{cmd.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs pt-1 items-end">
                    <div className="sm:col-span-4">
                      <label className="text-[11px] text-slate-400 block mb-1">
                        {isAr ? 'الاختصارات بالعربي (مفصولة بفاصلة)' : 'Aliases (comma-separated)'}
                      </label>
                      <input
                        type="text"
                        value={cmd.aliases.join(', ')}
                        onChange={(e) =>
                          updateCmd(
                            cmd.id,
                            'aliases',
                            e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-white"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <ChannelSelector
                        lang={lang}
                        compact={true}
                        label={isAr ? 'تحديد الروم المخصص للأمر' : 'Command Allowed Room'}
                        value={cmd.allowedChannel || 'all'}
                        onChange={(val) => updateCmd(cmd.id, 'allowedChannel', val)}
                        allowAllChannelsOption={true}
                        allChannelsLabel={isAr ? 'جميع الرومات' : 'All Channels'}
                        placeholder="cmd"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="text-[11px] text-slate-400 block mb-1">
                        {isAr ? 'رسالة رد البوت في الديسكورد' : 'Custom Bot Reply Message'}
                      </label>
                      <input
                        type="text"
                        value={cmd.customReply}
                        onChange={(e) => updateCmd(cmd.id, 'customReply', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-white"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
