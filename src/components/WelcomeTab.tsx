import React, { useState } from 'react';
import {
  UserPlus,
  Sparkles,
  Palette,
  Image as ImageIcon,
  ShieldCheck,
  Mail,
  UserMinus,
  SendHorizonal,
  CheckCircle2,
  Save,
  Eye
} from 'lucide-react';
import { WelcomeConfig } from '../types';
import { ChannelSelector } from './ChannelSelector';
import { sound } from '../utils/sound';

interface WelcomeTabProps {
  lang: 'ar' | 'en';
  welcomeConfig: WelcomeConfig;
  onChangeWelcomeConfig: (updated: WelcomeConfig) => void;
  onSave: () => void;
  serverName?: string;
}

const BANNER_PRESETS = [
  {
    label: 'درع M7R الأحمر الملكي',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'فضاء سايبر أسود وفخم',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'نيون قيمنق احترافي',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'بدون صورة بنر',
    url: ''
  }
];

export const WelcomeTab: React.FC<WelcomeTabProps> = ({
  lang,
  welcomeConfig,
  onChangeWelcomeConfig,
  onSave,
  serverName = 'M7R Server'
}) => {
  const isAr = lang === 'ar';
  const [testingWelcome, setTestingWelcome] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const updateField = <K extends keyof WelcomeConfig>(key: K, value: WelcomeConfig[K]) => {
    onChangeWelcomeConfig({
      ...welcomeConfig,
      [key]: value
    });
  };

  const insertVariable = (
    field: 'welcomeMessage' | 'embedDescription' | 'dmMessage' | 'leaveMessage',
    variable: string
  ) => {
    sound.playClick();
    updateField(field, `${welcomeConfig[field] || ''} ${variable}`.trim());
  };

  const handleTestWelcomeInDiscord = async () => {
    setTestingWelcome(true);
    setTestFeedback(null);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/welcome/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ welcomeConfig })
      });
      const data = await res.json();
      setTestFeedback(
        data.message || (isAr ? '✅ تم إرسال رسالة الترحيب التجريبية إلى ديسكورد بنجاح!' : '✅ Test welcome sent to Discord!')
      );
      setTimeout(() => setTestFeedback(null), 5000);
    } catch {
      setTestFeedback(isAr ? 'حدث خطأ أثناء إرسال تجربة الترحيب.' : 'Failed to send test welcome.');
    } finally {
      setTestingWelcome(false);
    }
  };

  // Format preview text with sample values
  const formatPreview = (raw: string) => {
    return (raw || '')
      .replace(/\{user\}/g, '@M7R_Member')
      .replace(/\{username\}/g, 'M7R_Member')
      .replace(/\{server\}/g, serverName)
      .replace(/\{count\}/g, '1,285')
      .replace(/\{id\}/g, '109876543210987654');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-rose-500" />
            {isAr
              ? 'لوحة تحكم الترحيب والمغادرة والرتب التلقائية الشاملة (M7R Welcome Studio 👋)'
              : 'M7R Welcome, Auto-Role & Goodbye Studio 👋'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'تحكم كامل في روم الترحيب، بطاقة الـ Embed، البنر، الرسائل الخاصة (DM)، الرتبة التلقائية عند الدخول، ورسالة المغادرة'
              : 'Customize welcome channels, rich embeds, banners, auto-roles on join, DM greetings, and leave messages'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleTestWelcomeInDiscord}
            disabled={testingWelcome}
            className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-black rounded-xl flex items-center gap-2 cursor-pointer transition-all"
          >
            <SendHorizonal className="w-4 h-4" />
            <span>
              {testingWelcome
                ? isAr
                  ? 'جاري الإرسال للديسكورد...'
                  : 'Sending...'
                : isAr
                ? 'تجربة إرسال الترحيب في ديسكورد الآن 🚀'
                : 'Test Welcome in Discord 🚀'}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playShieldActivate();
              onSave();
            }}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isAr ? 'حفظ إعدادات الترحيب ✅' : 'Save Welcome Settings ✅'}</span>
          </button>
        </div>
      </div>

      {testFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{testFeedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: All Welcome Settings */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Primary Welcome Toggle & Channel Selection */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'تفعيل نظام الترحيب وتحديد روم الاستقبال' : 'Enable Welcome System & Select Channel'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? 'إرسال ترحيب تلقائي فوري عند دخول أي عضو جديد إلى السيرفر'
                      : 'Automatically greet every new member who joins the server'}
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={welcomeConfig.enabled}
                  onChange={(e) => updateField('enabled', e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded"
                />
                <span>{welcomeConfig.enabled ? (isAr ? 'مفعل 🟢' : 'Active 🟢') : (isAr ? 'معطل' : 'Disabled')}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <ChannelSelector
                lang={lang}
                label={isAr ? 'تحديد روم الترحيب (#welcome)' : 'Welcome Channel (#welcome)'}
                value={welcomeConfig.channelName}
                onChange={(ch) => updateField('channelName', ch)}
                placeholder="welcome"
                helperText={
                  isAr ? 'اختر الروم الذي سيرسل فيه البوت بطاقة الترحيب' : 'Channel where welcome messages are posted'
                }
              />

              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  {isAr ? 'نمط عرض رسالة الترحيب' : 'Welcome Display Mode'}
                </label>
                <select
                  value={welcomeConfig.messageMode || 'embed_and_text'}
                  onChange={(e) => updateField('messageMode', e.target.value as WelcomeConfig['messageMode'])}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="embed_and_text">
                    {isAr ? '✨ رسالة نصية مع بطاقة Embed فخمة (مستحسن)' : 'Text + Rich Embed Card'}
                  </option>
                  <option value="embed_only">{isAr ? '🖼️ بطاقة Embed فقط مع منشن العضو' : 'Rich Embed Card Only'}</option>
                  <option value="text_only">{isAr ? '💬 رسالة نصية عادية فقط بدون Embed' : 'Plain Text Message Only'}</option>
                </select>
              </div>
            </div>

            {/* Smart Variables Bar */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2 text-xs">
              <span className="font-bold text-rose-400 block">
                {isAr
                  ? '💡 المتغيرات الذكية (اضغط لإضافتها في نص الترحيب):'
                  : '💡 Smart Variables (Click to insert):'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { code: '{user}', desc: isAr ? 'منشن العضو' : 'Mention User' },
                  { code: '{username}', desc: isAr ? 'اسم العضو' : 'Username' },
                  { code: '{server}', desc: isAr ? 'اسم السيرفر' : 'Server Name' },
                  { code: '{count}', desc: isAr ? 'رقم العضو (عدد الأعضاء)' : 'Member Count' },
                  { code: '{id}', desc: isAr ? 'آيدي العضو' : 'User ID' }
                ].map((v) => (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => insertVariable('embedDescription', v.code)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 text-slate-200 text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span className="text-rose-400 font-bold">{v.code}</span>
                    <span className="text-slate-400 font-sans">({v.desc})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs">
              <label className="text-slate-300 font-semibold block mb-1">
                {isAr ? 'الرسالة النصية أعلى بطاقة الترحيب (Text Message)' : 'Top Text Greeting Message'}
              </label>
              <input
                type="text"
                value={welcomeConfig.welcomeMessage}
                onChange={(e) => updateField('welcomeMessage', e.target.value)}
                placeholder="أهلاً بك يا {user} في سيرفر {server} الرسمي 🛡️!"
                className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Welcome Embed & Banner Customizer */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-rose-500" />
              {isAr ? 'تخصيص بطاقة الترحيب (Welcome Embed & Banner)' : 'Welcome Embed & Banner Styling'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-3">
                <label className="text-slate-300 font-semibold block mb-1">
                  {isAr ? 'عنوان بطاقة الترحيب (Embed Title)' : 'Embed Title'}
                </label>
                <input
                  type="text"
                  value={welcomeConfig.embedTitle}
                  onChange={(e) => updateField('embedTitle', e.target.value)}
                  placeholder="👋 مرحباً بك في سيرفر {server}!"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {isAr ? 'لون البطاقة' : 'Embed Color'}
                </label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5">
                  <input
                    type="color"
                    value={welcomeConfig.embedColor || '#e11d48'}
                    onChange={(e) => updateField('embedColor', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-[11px] text-slate-300">{welcomeConfig.embedColor || '#e11d48'}</span>
                </div>
              </div>
            </div>

            <div className="text-xs">
              <label className="text-slate-300 font-semibold block mb-1">
                {isAr ? 'وصف الترحيب داخل البطاقة (Embed Description)' : 'Embed Description'}
              </label>
              <textarea
                rows={3}
                value={welcomeConfig.embedDescription}
                onChange={(e) => updateField('embedDescription', e.target.value)}
                placeholder="نورت السيرفر يا {user}! أنت العضو رقم #{count} معنا، نتمنى لك أوقاتاً ممتعة."
                className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2.5 text-white focus:outline-none"
              />
            </div>

            {/* Banner Image URL + Quick Presets */}
            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>{isAr ? 'رابط صورة / بنر الترحيب الكبير (Welcome Banner URL)' : 'Welcome Banner Image URL'}</span>
              </label>
              <input
                type="text"
                value={welcomeConfig.bannerUrl}
                onChange={(e) => updateField('bannerUrl', e.target.value)}
                placeholder="https://... (رابط صورة أو GIF يظهر أسفل بطاقة الترحيب)"
                dir="ltr"
                className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white font-mono focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400">{isAr ? 'بنرات جاهزة:' : 'Presets:'}</span>
                {BANNER_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      updateField('bannerUrl', preset.url);
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 cursor-pointer transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes for Avatar, Member Count, Account Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={welcomeConfig.showAvatarThumbnail}
                  onChange={(e) => updateField('showAvatarThumbnail', e.target.checked)}
                  className="accent-rose-600 rounded"
                />
                <span className="text-slate-200">{isAr ? 'إظهار افتار العضو' : 'Show User Avatar'}</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={welcomeConfig.showMemberCount}
                  onChange={(e) => updateField('showMemberCount', e.target.checked)}
                  className="accent-rose-600 rounded"
                />
                <span className="text-slate-200">{isAr ? 'إظهار ترتيب العضو' : 'Show Member #'}</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={welcomeConfig.showAccountAge}
                  onChange={(e) => updateField('showAccountAge', e.target.checked)}
                  className="accent-rose-600 rounded"
                />
                <span className="text-slate-200">{isAr ? 'إظهار تاريخ الحساب' : 'Show Account Age'}</span>
              </label>
            </div>

            <div className="text-xs">
              <label className="text-slate-300 font-semibold block mb-1">
                {isAr ? 'نص الفوتر السفلي (Footer Text)' : 'Embed Footer Text'}
              </label>
              <input
                type="text"
                value={welcomeConfig.footerText}
                onChange={(e) => updateField('footerText', e.target.value)}
                placeholder="M7R Security • أهلاً بك في عائلتنا"
                className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Auto-Role on Join */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'الرتبة التلقائية عند دخول العضو (Auto-Role)' : 'Auto-Role on Member Join'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? 'منح رتبة تلقائياً لكل عضو جديد يدخل السيرفر فور انضمامه'
                      : 'Automatically assign a role to new members when they join'}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={welcomeConfig.autoRoleEnabled}
                onChange={(e) => updateField('autoRoleEnabled', e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {isAr ? 'اسم رتبة الأعضاء الجدد (Member Auto-Role)' : 'Member Auto-Role Name'}
                </label>
                <input
                  type="text"
                  value={welcomeConfig.autoRoleName}
                  onChange={(e) => updateField('autoRoleName', e.target.value)}
                  placeholder="Member"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {isAr ? 'اسم رتبة البوتات عند إضافتها (Bot Auto-Role)' : 'Bot Auto-Role Name'}
                </label>
                <input
                  type="text"
                  value={welcomeConfig.botAutoRoleName}
                  onChange={(e) => updateField('botAutoRoleName', e.target.value)}
                  placeholder="Bots"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-white font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. DM Welcome & Leave/Goodbye System */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* DM Welcome */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-rose-400" />
                  {isAr ? 'ترحيب في خاص العضو (DM)' : 'DM Welcome Message'}
                </span>
                <input
                  type="checkbox"
                  checked={welcomeConfig.sendDm}
                  onChange={(e) => updateField('sendDm', e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
              </div>
              <textarea
                rows={3}
                value={welcomeConfig.dmMessage}
                onChange={(e) => updateField('dmMessage', e.target.value)}
                placeholder="مرحباً بك يا {user} في سيرفر {server}! نتمنى لك قضاء أجمل الأوقات معنا."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
              />
            </div>

            {/* Leave / Goodbye System */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <UserMinus className="w-4 h-4 text-amber-400" />
                  {isAr ? 'رسالة المغادرة (Goodbye)' : 'Leave / Goodbye Message'}
                </span>
                <input
                  type="checkbox"
                  checked={welcomeConfig.leaveEnabled}
                  onChange={(e) => updateField('leaveEnabled', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
              <ChannelSelector
                lang={lang}
                compact={true}
                value={welcomeConfig.leaveChannelName || welcomeConfig.channelName}
                onChange={(ch) => updateField('leaveChannelName', ch)}
                placeholder="welcome"
              />
              <input
                type="text"
                value={welcomeConfig.leaveMessage}
                onChange={(e) => updateField('leaveMessage', e.target.value)}
                placeholder="غادرنا العضو {username}، نتمنى له التوفيق 👋"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Discord Welcome Preview */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-rose-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'معاينة الترحيب المباشرة في ديسكورد' : 'Live Discord Welcome Preview'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? `الروم المحدد: #${welcomeConfig.channelName || 'welcome'}` : `Channel: #${welcomeConfig.channelName}`}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                Live Preview
              </span>
            </div>

            {/* Simulated Discord Message Container */}
            <div className="rounded-xl bg-[#313338] p-4 space-y-3 border border-slate-800 shadow-inner">
              {/* Bot Header */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center font-black text-white text-xs font-mono shrink-0">
                  M7R
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">M7R</span>
                    <span className="bg-[#5865F2] text-white text-[9px] font-bold px-1.5 py-0.2 rounded">APP</span>
                    <span className="text-[10px] text-slate-400">{isAr ? 'اليوم عند 04:20 م' : 'Today at 4:20 PM'}</span>
                  </div>
                  {(welcomeConfig.messageMode === 'embed_and_text' || welcomeConfig.messageMode === 'text_only') && (
                    <p className="text-xs text-slate-100 mt-1">{formatPreview(welcomeConfig.welcomeMessage)}</p>
                  )}
                </div>
              </div>

              {/* Embed Card */}
              {(welcomeConfig.messageMode === 'embed_and_text' || welcomeConfig.messageMode === 'embed_only') && (
                <div
                  className="rounded-lg bg-[#2b2d31] p-4 border-s-4 space-y-3"
                  style={{ borderInlineStartColor: welcomeConfig.embedColor || '#e11d48' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-sm font-bold text-white">{formatPreview(welcomeConfig.embedTitle)}</h4>
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                        {formatPreview(welcomeConfig.embedDescription)}
                      </p>
                    </div>

                    {welcomeConfig.showAvatarThumbnail && (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-indigo-600 border-2 border-slate-700 flex items-center justify-center text-white font-black text-xs shrink-0">
                        USER
                      </div>
                    )}
                  </div>

                  {(welcomeConfig.showMemberCount || welcomeConfig.showAccountAge || welcomeConfig.autoRoleEnabled) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      {welcomeConfig.showMemberCount && (
                        <div className="bg-[#1e1f22] p-2 rounded">
                          <span className="text-slate-400 block text-[10px]">{isAr ? 'ترتيب العضو' : 'Member #'}</span>
                          <span className="text-white font-mono font-bold">#1,285</span>
                        </div>
                      )}
                      {welcomeConfig.showAccountAge && (
                        <div className="bg-[#1e1f22] p-2 rounded">
                          <span className="text-slate-400 block text-[10px]">{isAr ? 'حالة الحساب' : 'Account'}</span>
                          <span className="text-emerald-400 font-bold">{isAr ? 'موثوق ✅' : 'Verified ✅'}</span>
                        </div>
                      )}
                      {welcomeConfig.autoRoleEnabled && welcomeConfig.autoRoleName && (
                        <div className="bg-[#1e1f22] p-2 rounded">
                          <span className="text-slate-400 block text-[10px]">{isAr ? 'الرتبة الممنوحة' : 'Auto-Role'}</span>
                          <span className="text-rose-400 font-mono font-bold">@{welcomeConfig.autoRoleName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {welcomeConfig.bannerUrl && (
                    <div className="rounded-lg overflow-hidden border border-slate-800 max-h-40">
                      <img
                        src={welcomeConfig.bannerUrl}
                        alt="Welcome Banner"
                        referrerPolicy="no-referrer"
                        className="w-full h-36 object-cover"
                      />
                    </div>
                  )}

                  {welcomeConfig.footerText && (
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/70">
                      {formatPreview(welcomeConfig.footerText)}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleTestWelcomeInDiscord}
              disabled={testingWelcome}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 cursor-pointer transition-all"
            >
              <SendHorizonal className="w-4 h-4" />
              <span>
                {testingWelcome
                  ? isAr
                    ? 'جاري إرسال الترحيب إلى ديسكورد...'
                    : 'Sending Welcome to Discord...'
                  : isAr
                  ? `إرسال تجربة الترحيب في روم #${welcomeConfig.channelName || 'welcome'} الآن 🚀`
                  : `Send Test Welcome to #${welcomeConfig.channelName || 'welcome'} Now 🚀`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
