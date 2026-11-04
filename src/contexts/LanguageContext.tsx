import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ar' | 'en';

export interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  isAr: boolean;
  dir: 'rtl' | 'ltr';
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.aichat': 'المساعد الذكي',
    'nav.commands': 'أوامر البوت',
    'nav.quran': 'القرآن 24/7',
    'nav.welcome': 'الترحيب',
    'nav.tickets': 'التذاكر',
    'nav.applications': 'التقديمات',
    'nav.azkar': 'الأذكار',
    'nav.protection': 'الحماية والمصيدة',
    'nav.settings': 'الإعدادات',
    'nav.hosting': 'استضافة 24/7',
    'nav.homeBadge': 'رئيسي',
    'nav.liveBadge': 'Live',
    'nav.shieldBadge': 'Shield',
    'nav.update': 'تحديث 🔄',
    'nav.downloadNetlify': 'تصدير لـ Netlify 📦',
    'nav.notifications': 'الإشعارات',
    'nav.logout': 'تسجيل الخروج',
    'nav.statusOnline': '24/7 شغال',

    // Common Actions
    'action.save': 'حفظ التغييرات',
    'action.saving': 'جاري الحفظ...',
    'action.saved': 'تم الحفظ بنجاح!',
    'action.cancel': 'إلغاء',
    'action.refresh': 'تحديث',
    'action.delete': 'حذف',
    'action.copy': 'نسخ',
    'action.copied': 'تم النسخ!',
    'action.enableAll': 'تفعيل الكل',
    'action.disableAll': 'تعطيل الكل',
    'action.close': 'إغلاق',
    'action.back': 'رجوع',

    // Login & Auth
    'auth.title': 'لوحة التحكم الرسمية',
    'auth.subtitle': 'لوحة التحكم الرسمية لبوت M7R (القرآن 24/7، الذكاء الاصطناعي، الحماية، والتذاكر)',
    'auth.directLogin': 'الدخول المباشر الفوري للوحة التحكم ⚡',
    'auth.discordLogin': 'ربط سيرفر جديد عبر ديسكورد الرسمي 🌐',
    'auth.botToken': 'توكن مالك البوت (Owner)',
    'auth.simulation': 'الدخول في وضع المحاكاة والتجربة (بدون توكن)',
    'auth.granted': 'الصلاحية الممنوحة تلقائياً:',
    'auth.serverControl': '🛡️ التحكم في السيرفر (آمن)',
    'auth.connectedServers': 'سيرفرات مضافة حالياً:',
    'auth.connectToken': 'ربط التوكن وعرض سيرفرات البوت للتحكم',

    // Overview Tab
    'overview.botStatus': 'حالة البوت',
    'overview.serverStats': 'إحصائيات السيرفر',
    'overview.weeklyAttacks': 'تقرير الهجمات المصدودة (آخر 7 أيام)',
    'overview.holyQuran': 'القرآن الكريم 24/7',
    'overview.ping': 'سرعة الاستجابة',
    'overview.members': 'إجمالي الأعضاء',
    'overview.servers': 'السيرفرات المحمية',
    'overview.channels': 'الرومات المراقبة',
    'overview.antiSpam': 'الدرع المضاد للسبام',
    'overview.aiAsk': 'اسأل الذكاء الاصطناعي M7R',

    // Commands Tab
    'cmd.title': 'مدير الأوامر الشامل',
    'cmd.subtitle': 'تحكم في تفعيل وتعطيل ورومات جميع أوامر ديسكورد',
    'cmd.syncBtn': 'أمر تحديث وجلب كل جديد 🔄',
    'cmd.dedupeBtn': 'مزامنة وحذف تكرار الأوامر (/ban) 🧹',
    'cmd.moderation': 'العقوبات والإشراف',
    'cmd.voice': 'التحكم الصوتي',
    'cmd.channels': 'إدارة الرومات',
    'cmd.utility': 'الأدوات والخدمات',

    // AI Tab
    'ai.title': 'المساعد الذكي M7R AI Ask',
    'ai.subtitle': 'ذكاء اصطناعي ودود وظريف يجيب على استفسارات الأعضاء بلطف مع حماية الأسئلة الحساسة',
    'ai.targetRoom': 'الروم المخصص للإجابة',
    'ai.askPlaceholder': 'اكتب سؤالك هنا ليجيب عليك M7R AI بلطف...',
    'ai.askBtn': 'إرسال السؤال 🤖',
    'ai.allRooms': 'جميع الرومات (all)',
    'ai.autoReply': 'الرد التلقائي بدون كتابة أمر',

    // Netlify & Deploy
    'netlify.modalTitle': 'تحديث موقعك على Netlify (https://bot-m7r.netlify.app/)',
    'netlify.modalDesc': 'نتفلاي هو موقع استضافة ثابت خارجي، لكي تظهر آخر التعديلات والتحديثات هناك، حمّل الحزمة الجاهزة واسحبها إلى صفحة Deploys في Netlify:',
    'netlify.downloadBtn': 'تحميل حزمة التحديث (dist.zip) 📥',
    'netlify.step1': '1. اضغط زر التحميل لتحميل ملف dist.zip الأحدث.',
    'netlify.step2': '2. افتح لوحة تحكم موقعك على Netlify:',
    'netlify.step3': '3. اذهب لتاب Deploys واسحب الملف (Drag & Drop) هناك وسيتم التحديث في ثوانٍ!'
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.aichat': 'AI Assistant',
    'nav.commands': 'Commands',
    'nav.quran': 'Quran 24/7',
    'nav.welcome': 'Welcome',
    'nav.tickets': 'Tickets',
    'nav.applications': 'Applications',
    'nav.azkar': 'Azkar',
    'nav.protection': 'Protection',
    'nav.settings': 'Settings',
    'nav.hosting': 'Hosting 24/7',
    'nav.homeBadge': 'Home',
    'nav.liveBadge': 'Live',
    'nav.shieldBadge': 'Shield',
    'nav.update': 'Update 🔄',
    'nav.downloadNetlify': 'Export for Netlify 📦',
    'nav.notifications': 'Notifications',
    'nav.logout': 'Logout',
    'nav.statusOnline': '24/7 Online',

    // Common Actions
    'action.save': 'Save Changes',
    'action.saving': 'Saving...',
    'action.saved': 'Saved Successfully!',
    'action.cancel': 'Cancel',
    'action.refresh': 'Refresh',
    'action.delete': 'Delete',
    'action.copy': 'Copy',
    'action.copied': 'Copied!',
    'action.enableAll': 'Enable All',
    'action.disableAll': 'Disable All',
    'action.close': 'Close',
    'action.back': 'Back',

    // Login & Auth
    'auth.title': 'Official Dashboard',
    'auth.subtitle': 'M7R Bot Official Control Center (Quran 24/7, AI Ask, Protection & Tickets)',
    'auth.directLogin': 'Instant Direct Dashboard Access ⚡',
    'auth.discordLogin': 'Authorize New Server via Official Discord 🌐',
    'auth.botToken': 'Bot Owner Token (Owner)',
    'auth.simulation': 'Enter Interactive Simulation Mode (No Token)',
    'auth.granted': 'Granted Permission:',
    'auth.serverControl': '🛡️ Server Control (Safe)',
    'auth.connectedServers': 'Authorized Servers:',
    'auth.connectToken': 'Connect Token & Load Bot Servers',

    // Overview Tab
    'overview.botStatus': 'Bot Status',
    'overview.serverStats': 'Server Statistics',
    'overview.weeklyAttacks': 'Thwarted Attacks (Last 7 Days)',
    'overview.holyQuran': 'Holy Quran 24/7',
    'overview.ping': 'Response Latency',
    'overview.members': 'Total Members',
    'overview.servers': 'Protected Servers',
    'overview.channels': 'Monitored Channels',
    'overview.antiSpam': 'Ultra Anti-Spam Shield',
    'overview.aiAsk': 'Ask M7R Friendly AI',

    // Commands Tab
    'cmd.title': 'Commands Manager',
    'cmd.subtitle': 'Manage, enable, disable and restrict Discord slash and prefix commands',
    'cmd.syncBtn': 'Run Update Command 🔄',
    'cmd.dedupeBtn': 'Deduplicate & Sync Commands (/ban) 🧹',
    'cmd.moderation': 'Moderation & Punishments',
    'cmd.voice': 'Voice Controls',
    'cmd.channels': 'Channel Management',
    'cmd.utility': 'Utilities & Services',

    // AI Tab
    'ai.title': 'M7R AI Ask Assistant',
    'ai.subtitle': 'Friendly, witty AI assistant that answers members kindly while blocking sensitive topics',
    'ai.targetRoom': 'Target Channel for AI Replies',
    'ai.askPlaceholder': 'Type your question here to ask M7R AI...',
    'ai.askBtn': 'Ask Question 🤖',
    'ai.allRooms': 'All Channels (all)',
    'ai.autoReply': 'Auto-reply without prefix command',

    // Netlify & Deploy
    'netlify.modalTitle': 'Update your Netlify Site (https://bot-m7r.netlify.app/)',
    'netlify.modalDesc': 'Netlify is an external static host. To reflect the latest updates there, download the build zip and drop it into your Netlify Deploys tab:',
    'netlify.downloadBtn': 'Download Update Package (dist.zip) 📥',
    'netlify.step1': '1. Click to download the latest dist.zip bundle.',
    'netlify.step2': '2. Open your Netlify project dashboard:',
    'netlify.step3': '3. Go to the Deploys tab and drag & drop the zip file there. It will update in seconds!'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('m7r_lang');
    return saved === 'en' ? 'en' : 'ar';
  });

  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('m7r_lang', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = (key: string, fallback?: string): string => {
    const localized = translations[lang]?.[key];
    if (localized) return localized;
    if (translations['en']?.[key]) return translations['en'][key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, isAr, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
