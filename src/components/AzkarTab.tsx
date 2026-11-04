import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Clock,
  Hash,
  Palette,
  CheckCircle2,
  BookOpen,
  Heart,
  Edit2,
  Save,
  Check
} from 'lucide-react';
import { AzkarConfig, AzkarItem } from '../types';
import { ChannelSelector } from './ChannelSelector';
import { sound } from '../utils/sound';

interface AzkarTabProps {
  lang: 'ar' | 'en';
  azkarConfig: AzkarConfig;
  onChangeAzkarConfig: (newConfig: AzkarConfig) => void;
  onSave: () => void;
}

export const AzkarTab: React.FC<AzkarTabProps> = ({
  lang,
  azkarConfig,
  onChangeAzkarConfig,
  onSave,
}) => {
  const isAr = lang === 'ar';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editVirtue, setEditVirtue] = useState('');

  // New Dhikr form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState<AzkarItem['category']>('general');
  const [newCategoryLabel, setNewCategoryLabel] = useState('تسبيح وتحميد');
  const [newArabicText, setNewArabicText] = useState('');
  const [newVirtue, setNewVirtue] = useState('');

  // Instant test send state
  const [sendingNow, setSendingNow] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: isAr ? 'جميع الأذكار' : 'All Adhkar' },
    { id: 'quran', label: isAr ? 'آيات قرآنية' : 'Quranic Verses' },
    { id: 'salawat', label: isAr ? 'الصلاة على النبي ﷺ' : 'Salawat' },
    { id: 'istighfar', label: isAr ? 'استغفار وتوبة' : 'Istighfar' },
    { id: 'sabah', label: isAr ? 'أذكار الصباح والمساء' : 'Morning & Evening' },
    { id: 'general', label: isAr ? 'تسبيح وأدعية جامعة' : 'Tasbeeh & General' },
  ];

  const filteredItems = azkarConfig.items.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const toggleItem = (id: string) => {
    sound.playClick();
    const updated = azkarConfig.items.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    onChangeAzkarConfig({ ...azkarConfig, items: updated });
  };

  const deleteItem = (id: string) => {
    sound.playClick();
    const updated = azkarConfig.items.filter((item) => item.id !== id);
    onChangeAzkarConfig({ ...azkarConfig, items: updated });
  };

  const startEdit = (item: AzkarItem) => {
    sound.playClick();
    setEditingItemId(item.id);
    setEditText(item.arabicText);
    setEditVirtue(item.virtue);
  };

  const saveEdit = (id: string) => {
    sound.playClick();
    const updated = azkarConfig.items.map((item) =>
      item.id === id ? { ...item, arabicText: editText, virtue: editVirtue } : item
    );
    onChangeAzkarConfig({ ...azkarConfig, items: updated });
    setEditingItemId(null);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArabicText.trim()) return;

    sound.playShieldActivate();
    const newItem: AzkarItem = {
      id: `az-${Date.now()}`,
      category: newCategory,
      categoryLabel: newCategoryLabel || 'ذكر إسلامي',
      arabicText: newArabicText.trim(),
      virtue: newVirtue.trim() || 'أجر عظيم وثواب من الله تعالى.',
      enabled: true
    };

    onChangeAzkarConfig({
      ...azkarConfig,
      items: [newItem, ...azkarConfig.items]
    });

    setNewArabicText('');
    setNewVirtue('');
    setShowAddModal(false);
  };

  const handleSendNow = async (itemId?: string) => {
    setSendingNow(true);
    setSendResult(null);
    sound.playShieldActivate();

    try {
      const res = await fetch('/api/azkar/send-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          channelName: azkarConfig.channelName
        })
      });
      const data = await res.json();
      setSendResult(data.message || (isAr ? 'تم إرسال الذكر بنجاح!' : 'Dhikr sent successfully!'));
      setTimeout(() => setSendResult(null), 5000);
    } catch {
      setSendResult(isAr ? 'تعذر الإرسال. تأكد من تشغيل السيرفر.' : 'Failed to send.');
      setTimeout(() => setSendResult(null), 5000);
    } finally {
      setSendingNow(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span className="text-emerald-400">📿</span>
            <span>{isAr ? 'نظام الأذكار والأدعية الإسلامية (Islamic Azkar System)' : 'Islamic Reminders & Azkar'}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              {azkarConfig.enabled ? (isAr ? 'مفعل 🟢' : 'ACTIVE') : (isAr ? 'معطل 🔴' : 'OFF')}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'إرسال أذكار الصباح والمساء والآيات القرآنية والاستغفار تلقائياً في سيرفرك مع أزرار تفاعلية وأجر دائم.'
              : 'Automated Islamic reminders, morning & evening Adhkar, and Quranic verses posted to your Discord.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleSendNow()}
            disabled={sendingNow}
            className="px-4 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {sendingNow
                ? (isAr ? 'جارِ الإرسال...' : 'Sending...')
                : (isAr ? 'إرسال ذكر تجريبي الآن 🕌' : 'Send Dhikr Now')}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playShieldActivate();
              onSave();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isAr ? 'حفظ الإعدادات' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {sendResult && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{sendResult}</span>
        </div>
      )}

      {/* Grid: Global Settings & Discord Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Schedule & Channel Settings (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'إعدادات التوقيت والروم المستهدف' : 'Schedule & Target Channel'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Enable / Disable Master Switch */}
              <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    {isAr ? 'تشغيل نظام الأذكار التلقائي' : 'Enable Auto-Reminders'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isAr ? 'نشر ذكر مبارك دورياً في الروم' : 'Post Dhikr periodically'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={azkarConfig.enabled}
                  onChange={(e) => {
                    sound.playClick();
                    onChangeAzkarConfig({ ...azkarConfig, enabled: e.target.checked });
                  }}
                  className="w-5 h-5 accent-emerald-500 rounded"
                />
              </label>

              {/* Target Channel */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <ChannelSelector
                  lang={lang}
                  label={isAr ? 'تحديد روم الأذكار في ديسكورد' : 'Azkar Discord Channel'}
                  value={azkarConfig.channelName}
                  onChange={(ch) => onChangeAzkarConfig({ ...azkarConfig, channelName: ch })}
                  placeholder="اذكار"
                />
              </div>

              {/* Interval Frequency */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isAr ? 'معدل التكرار (كل كم دقيقة يُرسل ذكر)' : 'Send Interval'}
                </label>
                <select
                  value={azkarConfig.intervalMinutes}
                  onChange={(e) =>
                    onChangeAzkarConfig({ ...azkarConfig, intervalMinutes: parseInt(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={15}>{isAr ? 'كل 15 دقيقة (سريع)' : 'Every 15 minutes'}</option>
                  <option value={30}>{isAr ? 'كل 30 دقيقة (متوازن وموصى به)' : 'Every 30 minutes'}</option>
                  <option value={60}>{isAr ? 'كل ساعة (60 دقيقة)' : 'Every 1 hour'}</option>
                  <option value={180}>{isAr ? 'كل 3 ساعات' : 'Every 3 hours'}</option>
                  <option value={360}>{isAr ? 'كل 6 ساعات' : 'Every 6 hours'}</option>
                </select>
              </div>

              {/* Embed Color */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAr ? 'لون بطاقة الإيمبد' : 'Embed Color'}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={azkarConfig.embedColor}
                    onChange={(e) => onChangeAzkarConfig({ ...azkarConfig, embedColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={azkarConfig.embedColor}
                    onChange={(e) => onChangeAzkarConfig({ ...azkarConfig, embedColor: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dhikr Library Header & Categories Filter */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'مكتبة الأذكار والأدعية والآيات' : 'Adhkar & Quran Library'}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({azkarConfig.items.filter((i) => i.enabled).length} / {azkarConfig.items.length}{' '}
                    {isAr ? 'مفعل' : 'enabled'})
                  </span>
                </h3>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setShowAddModal(true);
                }}
                className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة ذكر جديد ➕' : 'Add New Dhikr'}</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveCategory(cat.id);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Dhikr Cards List */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredItems.map((item) => {
                const isEditing = editingItemId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 transition-all ${
                      item.enabled
                        ? 'border-emerald-500/30 bg-slate-900/70 hover:border-emerald-500/60'
                        : 'border-slate-800/80 bg-slate-950/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          {item.categoryLabel}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">#{item.id}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Send this item now button */}
                        <button
                          onClick={() => handleSendNow(item.id)}
                          title={isAr ? 'إرسال هذا الذكر إلى ديسكورد الآن' : 'Send this item now'}
                          className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3 text-emerald-400" />
                          <span className="hidden sm:inline">{isAr ? 'إرسال' : 'Send'}</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => (isEditing ? saveEdit(item.id) : startEdit(item))}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                          title={isAr ? 'تعديل' : 'Edit'}
                        >
                          {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 rounded bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-400 cursor-pointer"
                          title={isAr ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Enable toggle */}
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => toggleItem(item.id)}
                          className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                          title={isAr ? 'تفعيل / إيقاف هذا الذكر' : 'Toggle this Dhikr'}
                        />
                      </div>
                    </div>

                    {/* Content Editor or Render */}
                    {isEditing ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                        />
                        <input
                          type="text"
                          value={editVirtue}
                          onChange={(e) => setEditVirtue(e.target.value)}
                          placeholder={isAr ? 'فضل الذكر...' : 'Virtue of Dhikr...'}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded cursor-pointer"
                        >
                          {isAr ? 'حفظ التعديل' : 'Save'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-100 leading-relaxed font-sans mb-1.5 select-all">
                          {item.arabicText}
                        </p>
                        {item.virtue && (
                          <p className="text-[11px] text-emerald-400/90 flex items-center gap-1 font-medium">
                            <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{item.virtue}</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Discord Card Preview */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 sticky top-20">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-emerald-400">👀</span>
              <span>{isAr ? 'معاينة البطاقة في ديسكورد' : 'Discord Card Preview'}</span>
            </h3>

            {/* Mock Discord Message */}
            <div className="rounded-lg bg-[#2b2d31] p-3 text-left font-sans text-white text-xs shadow-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center font-bold text-[10px] text-white">
                  M7R
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-white text-xs">m7r</span>
                  <span className="px-1 py-0.2 rounded bg-indigo-600 text-[9px] font-bold text-white">BOT</span>
                  <span className="text-[10px] text-slate-400">اليوم الساعة 04:30 ص</span>
                </div>
              </div>

              {/* Embed Card */}
              <div
                className="rounded border-l-4 bg-[#1e1f22] p-3.5 space-y-2 shadow-inner"
                style={{ borderColor: azkarConfig.embedColor || '#059669' }}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <span>🕌</span>
                  <span>أذكار وأدعية المسلم | {azkarConfig.items[0]?.categoryLabel || 'ذكر مبارك'}</span>
                </div>

                <div className="text-sm font-bold text-white text-right leading-relaxed font-sans py-1">
                  {azkarConfig.items[0]?.arabicText}
                </div>

                {azkarConfig.showVirtue && azkarConfig.items[0]?.virtue && (
                  <div className="pt-1 border-t border-slate-700/60 text-right">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">✨ فضل الذكر والأجر:</span>
                    <span className="text-[11px] text-emerald-300/90 font-medium">{azkarConfig.items[0]?.virtue}</span>
                  </div>
                )}

                <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>M7R Islamic System</span>
                  <span>﴿ فَاذْكُرُونِي أَذْكُرْكُمْ ﴾</span>
                </div>
              </div>

              {/* Discord Buttons Row */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <div className="px-2.5 py-1 rounded bg-[#248046] text-white text-[10px] font-bold flex items-center gap-1 select-none">
                  <span>📿</span>
                  <span>سُبْحَانَ اللَّهِ</span>
                </div>
                <div className="px-2.5 py-1 rounded bg-[#5865f2] text-white text-[10px] font-bold flex items-center gap-1 select-none">
                  <span>🤍</span>
                  <span>أَسْتَغْفِرُ اللَّهَ</span>
                </div>
                <div className="px-2.5 py-1 rounded bg-[#4e5058] text-white text-[10px] font-bold flex items-center gap-1 select-none">
                  <span>✨</span>
                  <span>اللهم صلِّ على محمد</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300">
              <span className="font-bold block mb-1">💡 معلومة ذكية:</span>
              <span>
                عندما يضغط أي عضو في سيرفرك على أزرار الذكر في ديسكورد، يرد عليه البوت برسالة شخصية (Ephemeral)
                لتشجيعه على المداومة وتذكيره بفضل الذكر دون إزعاج الشات العام!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Dhikr Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121a] border border-emerald-500/50 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>{isAr ? 'إضافة ذكر أو دعاء أو آية جديدة' : 'Add Custom Dhikr / Dua'}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNew} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? 'التصنيف' : 'Category'}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => {
                    const val = e.target.value as AzkarItem['category'];
                    setNewCategory(val);
                    const map: { [k: string]: string } = {
                      quran: 'آية قرآنية سكينة',
                      salawat: 'الصلاة على النبي ﷺ',
                      istighfar: 'استغفار وتوبة',
                      sabah: 'أذكار الصباح والمساء',
                      general: 'تسبيح وأدعية جامعة'
                    };
                    setNewCategoryLabel(map[val] || 'ذكر إسلامي');
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="general">{isAr ? 'تسبيح وأدعية جامعة' : 'General & Tasbeeh'}</option>
                  <option value="quran">{isAr ? 'آيات قرآنية سكينة' : 'Quranic Verse'}</option>
                  <option value="salawat">{isAr ? 'الصلاة على النبي ﷺ' : 'Salawat'}</option>
                  <option value="istighfar">{isAr ? 'استغفار وتوبة' : 'Istighfar'}</option>
                  <option value="sabah">{isAr ? 'أذكار الصباح والمساء' : 'Morning / Evening'}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? 'نص الذكر أو الآية بالرسم العربي *' : 'Arabic Text *'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={newArabicText}
                  onChange={(e) => setNewArabicText(e.target.value)}
                  placeholder="مثال: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? 'فضل الذكر أو السند/السورة (اختياري)' : 'Virtue / Hadith (Optional)'}
                </label>
                <input
                  type="text"
                  value={newVirtue}
                  onChange={(e) => setNewVirtue(e.target.value)}
                  placeholder="مثال: قال رسول الله ﷺ: «كلمتان خفيفتان على اللسان ثقيلتان في الميزان»"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إضافة الذكر للحفظ' : 'Add Dhikr'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
