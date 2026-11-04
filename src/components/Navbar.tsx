import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  Volume2,
  VolumeX,
  Globe,
  KeyRound,
  Server,
  ChevronDown,
  Check,
  Users,
  Bell,
  Sparkles,
  LayoutDashboard,
  Bot,
  Terminal,
  Radio,
  Ticket as TicketIcon,
  FileText,
  Moon,
  Zap,
  Settings,
  LogOut,
  Menu,
  X,
  RotateCw,
  Package,
  Palette
} from 'lucide-react';
import { sound } from '../utils/sound';
import { ConnectedBotData } from './TokenAuthGate';
import { ConnectedGuildItem, AccessRoleMode, GuildJoinNotification, ThemeMode } from '../types';
import { M7RLogo } from './M7RLogo';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  panicMode: boolean;
  onTogglePanicMode: () => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  botInfo: ConnectedBotData | null;
  onOpenTokenGate: () => void;
  onSelectGuild?: (guild: ConnectedGuildItem) => void;
  accessMode: AccessRoleMode;
  onToggleAccessMode: (mode: AccessRoleMode) => void;
  notifications: GuildJoinNotification[];
  unreadCount: number;
  onMarkNotificationsRead: () => void;
  onSimulateServerJoin: () => void;
  onLogout?: () => void;
  onTriggerRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  panicMode,
  onTogglePanicMode,
  lang,
  setLang,
  soundEnabled,
  setSoundEnabled,
  botInfo,
  onOpenTokenGate,
  onSelectGuild,
  accessMode,
  notifications,
  unreadCount,
  onMarkNotificationsRead,
  onSimulateServerJoin,
  onLogout,
  onTriggerRefresh
}) => {
  const isAr = lang === 'ar';
  const { theme, setTheme } = useTheme();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [guildDropdownOpen, setGuildDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleQuickRefresh = async () => {
    setIsRefreshing(true);
    sound.playShieldActivate();
    if (onTriggerRefresh) {
      onTriggerRefresh();
    } else {
      try {
        await fetch('/api/bot/refresh', { method: 'POST' });
      } catch {}
    }
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const isServerAdminMode = accessMode === 'server_admin';

  // NEW ORGANIZED & EXCELLENT NAVIGATION ITEMS WITH CRISP ICONS & BADGES
  const allNavItems = [
    {
      id: 'overview',
      icon: LayoutDashboard,
      label: isAr ? 'لوحة التحكم' : 'Dashboard',
      safeForServerAdmin: true,
      badge: isAr ? 'رئيسي' : 'Home'
    },
    {
      id: 'aichat',
      icon: Bot,
      label: isAr ? 'المساعد الذكي' : 'AI Assistant',
      safeForServerAdmin: true,
      badge: 'AI'
    },
    {
      id: 'commands',
      icon: Terminal,
      label: isAr ? 'أوامر البوت' : 'Commands',
      safeForServerAdmin: true,
      badge: 'Slash'
    },
    {
      id: 'extras',
      icon: Radio,
      label: isAr ? 'القرآن 24/7' : 'Quran 24/7',
      safeForServerAdmin: true,
      badge: 'Live'
    },
    {
      id: 'welcome',
      icon: Sparkles,
      label: isAr ? 'الترحيب' : 'Welcome',
      safeForServerAdmin: true
    },
    {
      id: 'tickets',
      icon: TicketIcon,
      label: isAr ? 'التذاكر' : 'Tickets',
      safeForServerAdmin: true
    },
    {
      id: 'applications',
      icon: FileText,
      label: isAr ? 'التقديمات' : 'Applications',
      safeForServerAdmin: true
    },
    {
      id: 'azkar',
      icon: Moon,
      label: isAr ? 'الأذكار' : 'Azkar',
      safeForServerAdmin: true
    },
    // Owner / sensitive tabs
    {
      id: 'antinuke',
      icon: Shield,
      label: isAr ? 'الحماية والمصيدة' : 'Protection',
      safeForServerAdmin: false,
      badge: 'Shield'
    },
    {
      id: 'basics',
      icon: Settings,
      label: isAr ? 'الإعدادات' : 'Settings',
      safeForServerAdmin: false
    },
    {
      id: 'replit',
      icon: Zap,
      label: isAr ? 'استضافة 24/7' : 'Hosting 24/7',
      safeForServerAdmin: false
    }
  ];

  const navItems = isServerAdminMode
    ? allNavItems.filter((item) => item.safeForServerAdmin)
    : allNavItems;

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
    <header className="sticky top-0 z-50 bg-[#080a10]/95 backdrop-blur-md border-b border-slate-800/80 px-3 lg:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Zone 1: New Brand Logo Emblem + Connected Server Selector */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            onClick={() => {
              setActiveTab('overview');
              sound.playClick();
            }}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            {/* BRAND NEW MODERN M7R LOGO EMBLEM */}
            <M7RLogo size="sm" showBadge={false} pulse={false} />

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-wider text-white font-mono leading-none">
                  M7R
                </span>
                <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-300 border border-rose-500/30 leading-none">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>24/7 شغال</span>
              </span>
            </div>
          </div>

          {/* Connected Server Dropdown Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setGuildDropdownOpen(!guildDropdownOpen);
                setNotifDropdownOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-500/40 flex items-center gap-2 text-xs text-white cursor-pointer transition-all"
              title={isAr ? 'السيرفر المتواجد فيه البوت للتحكم' : 'Connected Server under control'}
            >
              {activeGuild.icon ? (
                <img src={activeGuild.icon} alt={activeGuild.name} className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <Server className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              )}
              <span className="font-bold max-w-[110px] sm:max-w-[140px] truncate">{activeGuild.name}</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-mono text-[10px]">
                {activeGuild.memberCount} {isAr ? 'عضو' : 'mbrs'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {guildDropdownOpen && (
              <div className="absolute start-0 mt-2 w-80 rounded-2xl bg-[#0e111a] border border-slate-700 shadow-2xl p-2.5 z-50 space-y-1.5">
                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>{isAr ? 'السيرفرات المفعلة بصلاحية التحكم:' : 'Authorized Servers:'}</span>
                  <button
                    type="button"
                    onClick={() => setGuildDropdownOpen(false)}
                    className="text-rose-400 hover:underline cursor-pointer text-[10px]"
                  >
                    {isAr ? 'إغلاق ✕' : 'Close ✕'}
                  </button>
                </div>

                {(botInfo?.guilds && botInfo.guilds.length > 0 ? botInfo.guilds : [activeGuild]).map((g) => {
                  const isCurrent = g.id === activeGuild.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        if (onSelectGuild) onSelectGuild(g);
                        setGuildDropdownOpen(false);
                      }}
                      className={`w-full text-start p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-rose-500/20 border border-rose-500/40 text-white'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {g.icon ? (
                          <img src={g.icon} alt={g.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center font-bold text-rose-300 text-xs shrink-0">
                            {g.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{g.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                            <span className="flex items-center gap-0.5">
                              <Users className="w-2.5 h-2.5 text-emerald-400" /> {g.memberCount}
                            </span>
                            <span className="text-emerald-400">• 🛡️ صلاحية السيرفر</span>
                          </span>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}

                <div className="pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setGuildDropdownOpen(false);
                      onOpenTokenGate();
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[#5865F2] text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تسجيل دخول ديسكورد / تبديل الحساب' : 'Discord OAuth / Switch Account'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: NEW EXCELLENT CATEGORIZED NAVIGATION LIST (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none max-w-3xl">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  sound.playClick();
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-indigo-500/20 text-white border border-rose-500/50 shadow-md shadow-rose-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Controls, Alerts, Language, Panic, and Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Master Update Button (أمر تحديث ومزامنة فورية) */}
          <button
            type="button"
            onClick={handleQuickRefresh}
            disabled={isRefreshing}
            title={isAr ? 'أمر تحديث فوري للبوت ومسح الكاش وجلب كل جديد' : 'Instant Bot Update & Sync'}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 via-teal-600/30 to-emerald-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer transition-all disabled:opacity-60"
          >
            <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'تحديث 🔄' : 'Update 🔄'}</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                const nextOpen = !notifDropdownOpen;
                setNotifDropdownOpen(nextOpen);
                setGuildDropdownOpen(false);
                if (nextOpen && unreadCount > 0) {
                  onMarkNotificationsRead();
                }
              }}
              className={`relative px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                unreadCount > 0
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isAr ? 'إشعارات دخول البوت للسيرفرات' : 'Server Join Notifications'}
            >
              <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-emerald-400 animate-bounce' : 'text-amber-400'}`} />
              <span className="hidden md:inline">{isAr ? 'الإشعارات' : 'Alerts'}</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute end-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0c0f17] border border-slate-700 shadow-2xl p-3.5 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-emerald-400" />
                      {isAr ? 'إشعارات دخول البوت للسيرفرات 📥' : 'Bot Server Join Notifications'}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isAr
                        ? 'عند إضافة البوت لأي سيرفر يصلك إشعار فوري وتُمنح صلاحية التحكم في السيرفر تلقائياً'
                        : 'Instant alert & automatic Server Control permission when added to a server'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifDropdownOpen(false)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.playShieldActivate();
                    onSimulateServerJoin();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? 'اختبار إشعار دخول البوت لسيرفر جديد 🔔' : 'Simulate New Server Join 🔔'}</span>
                </button>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 space-y-2 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {n.guildIcon ? (
                              <img src={n.guildIcon} alt={n.guildName} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0">
                                {n.guildName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-white truncate">{n.guildName}</h5>
                              <span className="text-[10px] text-slate-400">
                                {n.memberCount} {isAr ? 'عضو' : 'members'} • {n.joinedAt}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 font-bold">
                            {isAr ? 'صلاحية السيرفر' : 'Server Control'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500">
                      {isAr ? 'لا توجد إشعارات جديدة حالياً' : 'No new notifications'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) sound.playClick();
            }}
            title={isAr ? 'كتم/تشغيل المؤثرات الصوتية' : 'Toggle sound effects'}
            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Theme Customizer Dropdown (Dark / Midnight / Cyber) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setThemeDropdownOpen(!themeDropdownOpen);
                setGuildDropdownOpen(false);
                setNotifDropdownOpen(false);
              }}
              title={isAr ? 'تغيير نمط تباين ألوان لوحة التحكم' : 'Theme Customizer (Dark/Midnight/Cyber)'}
              className="px-2 sm:px-2.5 py-1 text-xs font-bold rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Palette className={`w-3.5 h-3.5 ${theme === 'cyber' ? 'text-cyan-400' : theme === 'midnight' ? 'text-indigo-400' : 'text-rose-400'}`} />
              <span className="hidden sm:inline font-mono text-[11px] capitalize">{theme}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {themeDropdownOpen && (
              <div className="absolute end-0 mt-2 w-56 rounded-2xl bg-[#0c0f17] border border-slate-700 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in">
                <div className="px-2.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  {isAr ? 'تباين ألوان لوحة التحكم:' : 'Theme Customizer:'}
                </div>
                {[
                  {
                    id: 'dark',
                    label: isAr ? 'داكن كلاسيكي 🌙' : 'Dark Classic 🌙',
                    desc: isAr ? 'رمادي داكن ناعم ومتوازن' : 'Subtle sleek dark slate',
                    color: 'text-rose-400'
                  },
                  {
                    id: 'midnight',
                    label: isAr ? 'منتصف الليل 🌌' : 'Midnight Space 🌌',
                    desc: isAr ? 'أزرق نيلي وتوهج فضائي' : 'Deep obsidian indigo',
                    color: 'text-indigo-400'
                  },
                  {
                    id: 'cyber',
                    label: isAr ? 'سايبر نيون ⚡' : 'Cyber Neon ⚡',
                    desc: isAr ? 'أسود فائق وتباين نيون' : 'Pitch black neon contrast',
                    color: 'text-cyan-400'
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTheme(item.id as ThemeMode);
                      sound.playClick();
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full text-start p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                      theme === item.id
                        ? 'bg-rose-500/20 border border-rose-500/40 text-white font-bold'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className={`font-bold ${theme === item.id ? item.color : ''}`}>{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </div>
                    {theme === item.id && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => {
              setLang(isAr ? 'en' : 'ar');
              sound.playClick();
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono">{isAr ? 'EN' : 'عربي'}</span>
          </button>

          {/* Panic Mode / Lockdown */}
          {!isServerAdminMode && (
            <button
              onClick={() => {
                onTogglePanicMode();
                if (!panicMode) sound.playAlarm();
                else sound.playClick();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-lg ${
                panicMode
                  ? 'bg-red-600 text-white border border-red-400 shadow-red-600/50 animate-pulse'
                  : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/50 shadow-rose-950/20'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">
                {panicMode ? (isAr ? 'طوارئ نشط 🚨' : 'LOCKDOWN 🚨') : (isAr ? 'وضع الطوارئ' : 'Panic')}
              </span>
            </button>
          )}

          {/* Logout / Switch Account Button */}
          <button
            type="button"
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                onOpenTokenGate();
              }
            }}
            title={isAr ? 'تسجيل الخروج / تبديل الحساب' : 'Logout / Switch Account'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* NEW EXCELLENT MOBILE NAVIGATION DRAWER & HORIZONTAL QUICK-BAR */}
      <div className="flex xl:hidden overflow-x-auto gap-1.5 pt-2 pb-1 border-t border-slate-800/60 mt-2 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                sound.playClick();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[8px] font-mono px-1 py-0.2 rounded-full ${isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded Mobile Grid Drawer when Hamburger is clicked */}
      {mobileMenuOpen && (
        <div className="xl:hidden mt-2 p-3 rounded-2xl bg-[#0c0f17] border border-slate-700 shadow-2xl grid grid-cols-2 sm:grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                  sound.playClick();
                }}
                className={`p-2.5 rounded-xl text-start flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-rose-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
