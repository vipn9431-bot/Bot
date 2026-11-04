import React, { useState, useEffect } from 'react';
import { Hash, Volume2, FolderKanban, ChevronDown, Check } from 'lucide-react';
import { GuildChannelItem } from '../types';
import { sound } from '../utils/sound';

interface ChannelSelectorProps {
  value: string;
  onChange: (channelName: string) => void;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'voice' | 'category' | 'all';
  allowAllChannelsOption?: boolean;
  allChannelsLabel?: string;
  lang?: 'ar' | 'en';
  helperText?: string;
  compact?: boolean;
}

const DEFAULT_SERVER_CHANNELS: GuildChannelItem[] = [
  { id: 'ch-1', name: 'general', type: 'text' },
  { id: 'ch-2', name: 'welcome', type: 'text' },
  { id: 'ch-3', name: 'cmd', type: 'text' },
  { id: 'ch-4', name: 'tickets', type: 'text' },
  { id: 'ch-5', name: 'log-server', type: 'text' },
  { id: 'ch-6', name: 'اذكار', type: 'text' },
  { id: 'ch-7', name: '🚫-ممنوع-الدخول', type: 'text' },
  { id: 'ch-8', name: 'announcements', type: 'text' },
  { id: 'ch-9', name: 'staff-applications', type: 'text' },
  { id: 'ch-10', name: 'ticket-logs', type: 'text' },
  { id: 'ch-11', name: 'اوامر', type: 'text' },
  { id: 'ch-12', name: 'ترحيب', type: 'text' },
  { id: 'ch-13', name: '🔊 24/7 | خلوة وتلاوات عطرة', type: 'voice' },
  { id: 'ch-14', name: '🔊 | مجلس الإدارة', type: 'voice' },
  { id: 'ch-15', name: '🎫 | قسم التذاكر (Tickets)', type: 'category' },
  { id: 'ch-16', name: '🛒 | تذاكر المتجر (Store)', type: 'category' },
  { id: 'ch-17', name: '🛠️ | الدعم الفني (Support)', type: 'category' }
];

let cachedChannels: GuildChannelItem[] | null = null;

export function invalidateChannelsCache() {
  cachedChannels = null;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  value,
  onChange,
  label,
  placeholder = 'tickets',
  type = 'text',
  allowAllChannelsOption = false,
  allChannelsLabel,
  lang = 'ar',
  helperText,
  compact = false
}) => {
  const isAr = lang === 'ar';
  const [channels, setChannels] = useState<GuildChannelItem[]>(cachedChannels || DEFAULT_SERVER_CHANNELS);
  const [openDropdown, setOpenDropdown] = useState(false);

  const loadChannels = () => {
    fetch('/api/guild/channels')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.channels) && data.channels.length > 0) {
          cachedChannels = data.channels;
          setChannels(data.channels);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadChannels();
  }, []);

  const filteredChannels = channels.filter((c) => {
    if (type === 'all') return true;
    return c.type === type;
  });

  const cleanVal = (value || '').replace(/^#/, '');

  const getIcon = () => {
    if (type === 'voice') return <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    if (type === 'category') return <FolderKanban className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    return <Hash className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
  };

  return (
    <div className="relative space-y-1.5 text-xs">
      {label && (
        <label className="text-slate-300 font-semibold flex items-center justify-between gap-1">
          <span className="flex items-center gap-1.5">
            {getIcon()}
            <span>{label}</span>
          </span>
          <span className="text-[10px] text-rose-400 font-mono">
            {cleanVal === 'all' || (allowAllChannelsOption && !cleanVal)
              ? isAr
                ? '🌐 جميع الرومات'
                : '🌐 All Channels'
              : `#${cleanVal || placeholder}`}
          </span>
        </label>
      )}

      <div className="flex items-center gap-1.5">
        {/* Direct Input Box */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none text-slate-400">
            {getIcon()}
          </span>
          <input
            type="text"
            value={cleanVal === 'all' ? '' : cleanVal}
            onChange={(e) => onChange(e.target.value.replace(/^#/, ''))}
            placeholder={
              allowAllChannelsOption
                ? allChannelsLabel || (isAr ? 'جميع الرومات (أو اكتب اسم روم مخصص)' : 'All channels (or type channel name)')
                : placeholder
            }
            className={`w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg ps-8 pe-3 ${
              compact ? 'py-1.5' : 'py-2'
            } text-white font-mono text-xs focus:outline-none transition-colors`}
          />
        </div>

        {/* Quick Server Channels Picker Dropdown Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            if (!openDropdown) loadChannels();
            setOpenDropdown(!openDropdown);
          }}
          className={`px-2.5 ${
            compact ? 'py-1.5' : 'py-2'
          } bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 rounded-lg text-slate-200 flex items-center gap-1 shrink-0 cursor-pointer transition-colors`}
          title={isAr ? 'اختر من رومات السيرفر' : 'Select from server channels'}
        >
          <span className="text-[11px] font-bold">{isAr ? 'تحديد الروم' : 'Select Room'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu of Server Channels */}
      {openDropdown && (
        <div className="z-40 mt-1 w-full rounded-xl bg-[#11141d] border border-slate-700 shadow-2xl p-2 space-y-1 max-h-52 overflow-y-auto">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1">
            <span>{isAr ? 'اختر روماً من السيرفر المتصل أو اكتب اسمه بالأعلى:' : 'Pick a server channel or type above:'}</span>
            <button
              type="button"
              onClick={() => setOpenDropdown(false)}
              className="text-rose-400 hover:underline cursor-pointer"
            >
              {isAr ? 'إغلاق ✕' : 'Close ✕'}
            </button>
          </div>

          {allowAllChannelsOption && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onChange('all');
                setOpenDropdown(false);
              }}
              className={`w-full text-start px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                cleanVal === 'all' || !cleanVal
                  ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>🌐 {allChannelsLabel || (isAr ? 'جميع رومات السيرفر (بدون تقييد)' : 'All Server Channels')}</span>
              {(cleanVal === 'all' || !cleanVal) && <Check className="w-3.5 h-3.5 text-rose-400" />}
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {filteredChannels.map((ch) => {
              const isSelected = cleanVal.toLowerCase() === ch.name.toLowerCase();
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onChange(ch.name);
                    setOpenDropdown(false);
                  }}
                  className={`text-start px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="truncate flex items-center gap-1">
                    <span className="text-slate-500">#</span>
                    <span className="truncate">{ch.name}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {helperText && <p className="text-[10px] text-slate-400">{helperText}</p>}
    </div>
  );
};
