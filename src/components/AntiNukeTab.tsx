import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  Link2, 
  Lock, 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  Radio, 
  AlertTriangle,
  Send,
  Skull,
  UserCheck,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { AntiNukeConfig, AntiSpamConfig, AntiInviteConfig, HoneypotTrapConfig } from '../types';
import { ChannelSelector } from './ChannelSelector';
import { sound } from '../utils/sound';

interface AntiNukeTabProps {
  lang: 'ar' | 'en';
  antiNuke: AntiNukeConfig;
  setAntiNuke: React.Dispatch<React.SetStateAction<AntiNukeConfig>>;
  antiSpam: AntiSpamConfig;
  setAntiSpam: React.Dispatch<React.SetStateAction<AntiSpamConfig>>;
  antiInvite: AntiInviteConfig;
  setAntiInvite: React.Dispatch<React.SetStateAction<AntiInviteConfig>>;
  honeypotTrap: HoneypotTrapConfig;
  setHoneypotTrap: React.Dispatch<React.SetStateAction<HoneypotTrapConfig>>;
  onSaveSettings: () => void;
}

export const AntiNukeTab: React.FC<AntiNukeTabProps> = ({
  lang,
  antiNuke,
  setAntiNuke,
  antiSpam,
  setAntiSpam,
  antiInvite,
  setAntiInvite,
  honeypotTrap,
  setHoneypotTrap,
  onSaveSettings,
}) => {
  const isAr = lang === 'ar';
  const [activeSubTab, setActiveSubTab] = useState<'antinuke' | 'trap' | 'antispam' | 'antiinvite'>('trap');
  const [newWhitelistId, setNewWhitelistId] = useState('');
  const [newTrapWhitelistUser, setNewTrapWhitelistUser] = useState('');
  const [newTrapWhitelistRole, setNewTrapWhitelistRole] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newExemptRole, setNewExemptRole] = useState('');
  const [newTrapChannel, setNewTrapChannel] = useState('');

  // Deploy & Test Trap state
  const [deployingTrap, setDeployingTrap] = useState(false);
  const [deployTrapResult, setDeployTrapResult] = useState<string | null>(null);
  const [testingTrap, setTestingTrap] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    sound.playShieldActivate();
    onSaveSettings();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const addWhitelistUser = () => {
    if (!newWhitelistId.trim()) return;
    if (!antiNuke.whitelistUserIds.includes(newWhitelistId.trim())) {
      setAntiNuke(prev => ({
        ...prev,
        whitelistUserIds: [...prev.whitelistUserIds, newWhitelistId.trim()]
      }));
    }
    setNewWhitelistId('');
    sound.playClick();
  };

  const removeWhitelistUser = (id: string) => {
    setAntiNuke(prev => ({
      ...prev,
      whitelistUserIds: prev.whitelistUserIds.filter(item => item !== id)
    }));
    sound.playClick();
  };

  // Honeypot Trap Deploy to Discord
  const handleDeployTrapChannel = async () => {
    setDeployingTrap(true);
    setDeployTrapResult(null);
    sound.playShieldActivate();

    try {
      const res = await fetch('/api/trap/deploy-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName: honeypotTrap.channelName,
          warningMessage: honeypotTrap.customWarningMessage
        })
      });
      const data = await res.json();
      setDeployTrapResult(data.message || (isAr ? 'تم إنشاء ونشر روم المصيدة في ديسكورد!' : 'Trap deployed to Discord!'));
      setTimeout(() => setDeployTrapResult(null), 6000);
    } catch {
      setDeployTrapResult(isAr ? 'تعذر النشر، تأكد من اتصال البوت.' : 'Deploy failed.');
      setTimeout(() => setDeployTrapResult(null), 5000);
    } finally {
      setDeployingTrap(false);
    }
  };

  // Test Trap Trigger
  const handleTestTrap = async () => {
    setTestingTrap(true);
    sound.playAlarm();

    try {
      const res = await fetch('/api/trap/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.totalTrapped !== undefined) {
        setHoneypotTrap(prev => ({ ...prev, totalTrapped: data.totalTrapped }));
      }
      setDeployTrapResult(isAr ? '🚨 تم اختبار المصيدة وإرسال إنذار فوري إلى #log-server!' : '🚨 Trap test executed and logged!');
      setTimeout(() => setDeployTrapResult(null), 5000);
    } catch {
      // ignore
    } finally {
      setTestingTrap(false);
    }
  };

  const addTrapUser = () => {
    if (!newTrapWhitelistUser.trim()) return;
    if (!honeypotTrap.whitelistUserIds.includes(newTrapWhitelistUser.trim())) {
      setHoneypotTrap(prev => ({
        ...prev,
        whitelistUserIds: [...prev.whitelistUserIds, newTrapWhitelistUser.trim()]
      }));
    }
    setNewTrapWhitelistUser('');
    sound.playClick();
  };

  const removeTrapUser = (id: string) => {
    setHoneypotTrap(prev => ({
      ...prev,
      whitelistUserIds: prev.whitelistUserIds.filter(u => u !== id)
    }));
    sound.playClick();
  };

  const addTrapRole = () => {
    if (!newTrapWhitelistRole.trim()) return;
    if (!honeypotTrap.whitelistRoleNames.includes(newTrapWhitelistRole.trim())) {
      setHoneypotTrap(prev => ({
        ...prev,
        whitelistRoleNames: [...prev.whitelistRoleNames, newTrapWhitelistRole.trim()]
      }));
    }
    setNewTrapWhitelistRole('');
    sound.playClick();
  };

  const removeTrapRole = (role: string) => {
    setHoneypotTrap(prev => ({
      ...prev,
      whitelistRoleNames: prev.whitelistRoleNames.filter(r => r !== role)
    }));
    sound.playClick();
  };

  const addDomain = () => {
    if (!newDomain.trim()) return;
    if (!antiInvite.whitelistDomains.includes(newDomain.trim())) {
      setAntiInvite(prev => ({
        ...prev,
        whitelistDomains: [...prev.whitelistDomains, newDomain.trim()]
      }));
    }
    setNewDomain('');
    sound.playClick();
  };

  const removeDomain = (domain: string) => {
    setAntiInvite(prev => ({
      ...prev,
      whitelistDomains: prev.whitelistDomains.filter(d => d !== domain)
    }));
    sound.playClick();
  };

  const addExemptRole = () => {
    if (!newExemptRole.trim()) return;
    if (!antiInvite.exemptRoles.includes(newExemptRole.trim())) {
      setAntiInvite(prev => ({
        ...prev,
        exemptRoles: [...prev.exemptRoles, newExemptRole.trim()]
      }));
    }
    setNewExemptRole('');
    sound.playClick();
  };

  const removeExemptRole = (role: string) => {
    setAntiInvite(prev => ({
      ...prev,
      exemptRoles: prev.exemptRoles.filter(r => r !== role)
    }));
    sound.playClick();
  };

  const addTrapChannel = () => {
    if (!newTrapChannel.trim()) return;
    const formatted = newTrapChannel.startsWith('#') ? newTrapChannel.trim() : `#${newTrapChannel.trim()}`;
    if (!antiSpam.trapChannels.includes(formatted)) {
      setAntiSpam(prev => ({
        ...prev,
        trapChannels: [...prev.trapChannels, formatted]
      }));
    }
    setNewTrapChannel('');
    sound.playClick();
  };

  const removeTrapChannel = (ch: string) => {
    setAntiSpam(prev => ({
      ...prev,
      trapChannels: prev.trapChannels.filter(c => c !== ch)
    }));
    sound.playClick();
  };

  return (
    <div className="space-y-6">
      {/* Subnav & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span>{isAr ? 'نظام الحماية الفولاذي والمصيدة (Anti-Nuke & Honeypot Trap)' : 'Steel Anti-Nuke & Honeypot Trap'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'درع M7R الفولاذي: صد هجمات التخريب، حماية الشات، ومصيدة الهاكرز الآلية لصيد البوتات والمخربين.'
              : 'M7R Cyber Defense: Anti-Nuke raid mitigation, velocity spam filters, and Honeypot traps.'}
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-rose-950/40 cursor-pointer shrink-0"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? (isAr ? 'تم الحفظ بنجاح!' : 'Saved!') : (isAr ? 'حفظ إعدادات الحماية' : 'Save Rules')}</span>
        </button>
      </div>

      {/* Segmented Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-[#0d1017] border border-slate-800 rounded-lg max-w-2xl">
        <button
          onClick={() => { setActiveSubTab('trap'); sound.playClick(); }}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeSubTab === 'trap'
              ? 'bg-red-600/30 text-rose-300 border border-rose-500/50 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🪤</span>
          <span>{isAr ? 'المصيدة الفولاذية (Honeypot Trap)' : 'Honeypot Trap'}</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('antinuke'); sound.playClick(); }}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeSubTab === 'antinuke'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🛡️</span>
          <span>{isAr ? 'حماية التخريب (Anti-Nuke)' : 'Anti-Nuke'}</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('antispam'); sound.playClick(); }}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeSubTab === 'antispam'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>⚡</span>
          <span>{isAr ? 'سرعة الرسائل (Anti-Spam)' : 'Anti-Spam'}</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('antiinvite'); sound.playClick(); }}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeSubTab === 'antiinvite'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🔗</span>
          <span>{isAr ? 'منع الإعلانات (Anti-Invite)' : 'Anti-Invite'}</span>
        </button>
      </div>

      {/* Trap Alert Banner if any */}
      {deployTrapResult && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/50 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{deployTrapResult}</span>
        </div>
      )}

      {/* TAB: HONEYPOT TRAP (المصيدة الفولاذية) */}
      {activeSubTab === 'trap' && (
        <div className="space-y-6">
          {/* Honeypot Overview & Actions Card */}
          <div className="rounded-xl border border-red-500/40 bg-gradient-to-r from-red-950/40 via-[#0d1017] to-red-950/20 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪤</span>
                  <h3 className="text-base font-black text-white">
                    {isAr ? 'روم المصيدة الفولاذية (M7R Honeypot Trap):' : 'M7R Automated Honeypot Trap:'}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-900/60 text-red-300 border border-red-500/40">
                    {honeypotTrap.enabled ? (isAr ? 'نشطة 🟢' : 'ARMED') : (isAr ? 'معطلة 🔴' : 'DISARMED')}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {isAr
                    ? 'روم وهمي مخصص لصيد حسابات السيلف بوت والمخربين تلقائياً. أي رسالة تكتب فيه يُحظر صاحبها فوراً ويُرسل إشعار تحذيري إلى #log-server!'
                    : 'A honeypot decoy channel where raiders and selfbots get trapped, deleted, and banned on first message.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDeployTrapChannel}
                  disabled={deployingTrap}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-red-950/60 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {deployingTrap
                      ? (isAr ? 'جارِ النشر...' : 'Deploying...')
                      : (isAr ? 'إنشاء ونشر روم المصيدة في ديسكورد الآن 🚀' : 'Deploy Trap to Discord')}
                  </span>
                </button>

                <button
                  onClick={handleTestTrap}
                  disabled={testingTrap}
                  className="px-3 py-2 bg-slate-800 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Skull className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'اختبار المصيدة 🧪' : 'Test Trap Trigger'}</span>
                </button>
              </div>
            </div>

            {/* Live Trap Counter */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">{isAr ? 'إجمالي من وقع بالفخ' : 'Total Trapped'}</span>
                <span className="text-xl font-mono font-black text-rose-400">{honeypotTrap.totalTrapped}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">{isAr ? 'روم المصيدة' : 'Trap Channel'}</span>
                <span className="text-xs font-mono font-bold text-white truncate block">#{honeypotTrap.channelName}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">{isAr ? 'العقوبة الفورية' : 'Punishment'}</span>
                <span className="text-xs font-mono font-bold text-amber-400">{honeypotTrap.punishment.toUpperCase()}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">{isAr ? 'روم السجلات' : 'Alert Log Channel'}</span>
                <span className="text-xs font-mono font-bold text-emerald-400">#{honeypotTrap.alertLogChannel}</span>
              </div>
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Trap Channel & Punishment Settings */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>{isAr ? 'إعدادات روم المصيدة والعقوبة' : 'Decoy Channel & Sanctions'}</span>
              </h3>

              {/* Master toggle */}
              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{isAr ? 'تفعيل المصيدة الفولاذية' : 'Arm Honeypot Trap'}</span>
                  <span className="text-[11px] text-slate-400">{isAr ? 'الترصد لأي رسالة في روم الفخ وتطبيق العقوبة' : 'Trap raiders speaking in decoy channel'}</span>
                </div>
                <input
                  type="checkbox"
                  checked={honeypotTrap.enabled}
                  onChange={(e) => {
                    sound.playClick();
                    setHoneypotTrap({ ...honeypotTrap, enabled: e.target.checked });
                  }}
                  className="w-5 h-5 accent-rose-600 rounded"
                />
              </label>

              {/* Channel name & Alert Log Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ChannelSelector
                  lang={lang}
                  label={isAr ? 'تحديد روم المصيدة في ديسكورد' : 'Trap Channel Name'}
                  value={honeypotTrap.channelName}
                  onChange={(ch) => setHoneypotTrap({ ...honeypotTrap, channelName: ch })}
                  placeholder="🚫-ممنوع-الدخول"
                />

                <ChannelSelector
                  lang={lang}
                  label={isAr ? 'تحديد روم إشعارات المصيدة (Log)' : 'Trap Alert Log Channel'}
                  value={honeypotTrap.alertLogChannel}
                  onChange={(ch) => setHoneypotTrap({ ...honeypotTrap, alertLogChannel: ch })}
                  placeholder="log-server"
                />
              </div>

              {/* Punishment */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? 'العقوبة الفورية على من يكتب في روم المصيدة' : 'Instant Trap Punishment'}
                </label>
                <select
                  value={honeypotTrap.punishment}
                  onChange={(e) =>
                    setHoneypotTrap({
                      ...honeypotTrap,
                      punishment: e.target.value as HoneypotTrapConfig['punishment']
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="ban">{isAr ? '🔨 حظر نهائي فوري (Instant Permanent Ban)' : 'Instant Ban'}</option>
                  <option value="kick">{isAr ? '👢 طرد فوري من السيرفر (Instant Kick)' : 'Instant Kick'}</option>
                  <option value="timeout">{isAr ? '⏱️ كتم أسبوع كامل (7 Days Timeout)' : 'Timeout 7 Days'}</option>
                </select>
              </div>

              {/* Warning Message Inside Discord Trap Channel */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isAr ? 'نص رسالة التحذير المثبتة في روم المصيدة' : 'Trap Warning Embed Message'}
                </label>
                <textarea
                  rows={2}
                  value={honeypotTrap.customWarningMessage}
                  onChange={(e) => setHoneypotTrap({ ...honeypotTrap, customWarningMessage: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-sans"
                />
              </div>
            </div>

            {/* Trap Whitelist Manager */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'المعفيون من المصيدة (Whitelist)' : 'Trap Whitelist (Exempted)'}</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'الأعضاء والرتب المحددة هنا لن يتعرضوا للعقوبة في حال كتبوا في روم المصيدة بالخطأ.'
                  : 'Users and roles listed here will not be punished if speaking in the trap channel.'}
              </p>

              {/* Add Whitelist User */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">{isAr ? 'معرفات الأعضاء المعفيين (User IDs):' : 'Exempted User IDs:'}</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTrapWhitelistUser}
                    onChange={(e) => setNewTrapWhitelistUser(e.target.value)}
                    placeholder="Discord User ID..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={addTrapUser}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة' : 'Add'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {honeypotTrap.whitelistUserIds.map((id) => (
                    <span key={id} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono flex items-center gap-1">
                      <span>{id}</span>
                      <button onClick={() => removeTrapUser(id)} className="text-slate-500 hover:text-red-400 cursor-pointer">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Add Whitelist Role */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block">{isAr ? 'الرتب المعفية (Role Names):' : 'Exempted Roles:'}</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTrapWhitelistRole}
                    onChange={(e) => setNewTrapWhitelistRole(e.target.value)}
                    placeholder="مثال: Owner, Lead Admin..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={addTrapRole}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة' : 'Add'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {honeypotTrap.whitelistRoleNames.map((role) => (
                    <span key={role} className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-1">
                      <span>@{role}</span>
                      <button onClick={() => removeTrapRole(role)} className="text-emerald-500 hover:text-red-400 cursor-pointer">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: ANTI-NUKE */}
      {activeSubTab === 'antinuke' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Mass Ban & Kick Rate Limits */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                {isAr ? 'حدود الحظر والطرد الجماعي (Mass Ban/Kick)' : 'Mass Ban / Kick Thresholds'}
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300">{isAr ? 'أقصى حظر مسموح به (Mass Bans)' : 'Max Bans'}</span>
                    <span className="font-mono text-rose-400 tabular-nums">{antiNuke.massBanLimit} / {antiNuke.massBanWindowSeconds}s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={antiNuke.massBanLimit}
                    onChange={(e) => setAntiNuke({ ...antiNuke, massBanLimit: parseInt(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300">{isAr ? 'أقصى طرد مسموح به (Mass Kicks)' : 'Max Kicks'}</span>
                    <span className="font-mono text-rose-400 tabular-nums">{antiNuke.massKickLimit} / {antiNuke.massBanWindowSeconds}s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={antiNuke.massKickLimit}
                    onChange={(e) => setAntiNuke({ ...antiNuke, massKickLimit: parseInt(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">{isAr ? 'العقوبة عند تجاوز الحد' : 'Mitigation Action'}</label>
                  <select
                    value={antiNuke.massBanAction}
                    onChange={(e) => setAntiNuke({ ...antiNuke, massBanAction: e.target.value as 'ban' | 'kick' | 'strip_roles' })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="strip_roles">{isAr ? 'سحب جميع الرتب فوراً (Strip All Roles - آمن)' : 'Strip All Roles'}</option>
                    <option value="kick">{isAr ? 'طرد المشرف من السيرفر (Kick Admin)' : 'Kick Admin'}</option>
                    <option value="ban">{isAr ? 'حظر المشرف نهائياً (Instant Ban)' : 'Instant Ban'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Channels & Roles Deletion Protections */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                {isAr ? 'حماية حذف الرومات والرتب' : 'Channel & Role Deletion Guard'}
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300">{isAr ? 'أقصى حذف للرومات (Channel Deletes)' : 'Max Channel Deletions'}</span>
                    <span className="font-mono text-rose-400 tabular-nums">{antiNuke.massChannelDeleteLimit} / 10s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={antiNuke.massChannelDeleteLimit}
                    onChange={(e) => setAntiNuke({ ...antiNuke, massChannelDeleteLimit: parseInt(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300">{isAr ? 'أقصى حذف للرتب (Role Deletes)' : 'Max Role Deletions'}</span>
                    <span className="font-mono text-rose-400 tabular-nums">{antiNuke.massRoleDeleteLimit} / 10s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={antiNuke.massRoleDeleteLimit}
                    onChange={(e) => setAntiNuke({ ...antiNuke, massRoleDeleteLimit: parseInt(e.target.value) })}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Rogue Bot & Webhook Security */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                {isAr ? 'حجر البوتات والويب هوك (Bots & Webhooks)' : 'Bot Quarantine & Webhooks'}
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{isAr ? 'حجر البوتات الدخيلة فوراً (Quarantine Rogue Bots)' : 'Quarantine Rogue Bots'}</span>
                    <span className="text-[11px] text-slate-400">{isAr ? 'طرد أي بوت جديد يتم إضافته بدون إذن الأونر المباشر' : 'Kick any unauthorized bot added without owner permission'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={antiNuke.quarantineNewBots}
                    onChange={(e) => setAntiNuke({ ...antiNuke, quarantineNewBots: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{isAr ? 'منع إنشاء الويب هوك (Block Webhooks)' : 'Block Webhook Creation'}</span>
                    <span className="text-[11px] text-slate-400">{isAr ? 'إحباط هجمات السبام الناتجة عن إنشاء روابط Webhook عشوائية' : 'Prevents spam attack via unauthorized webhook creation'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={antiNuke.blockWebhookCreation}
                    onChange={(e) => setAntiNuke({ ...antiNuke, blockWebhookCreation: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Whitelist Manager */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                {isAr ? 'القائمة البيضاء الموثوقة (Anti-Nuke Whitelist)' : 'Trusted Whitelist'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'المستخدمون هنا معفيون من قيود الحماية ولديهم صلاحيات الإدارة الكاملة.' : 'Exempted User IDs with full bypass permissions.'}
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={isAr ? 'أدخل Discord User ID هنا...' : 'Enter Discord User ID...'}
                  value={newWhitelistId}
                  onChange={(e) => setNewWhitelistId(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={addWhitelistUser}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إضافة' : 'Add'}</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {antiNuke.whitelistUserIds.map((id) => (
                  <div key={id} className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800/80 text-xs">
                    <span className="font-mono text-slate-300">{id}</span>
                    <button
                      onClick={() => removeWhitelistUser(id)}
                      className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANTI-SPAM VELOCITY */}
      {activeSubTab === 'antispam' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Speed & velocity */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">{isAr ? 'معايير سرعة الإرسال (Velocity)' : 'Message Velocity Limits'}</h3>
              
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300">{isAr ? 'أقصى عدد رسائل في النافذة الزمنية' : 'Max Messages'}</span>
                  <span className="font-mono font-bold text-rose-400 tabular-nums">{antiSpam.maxMessages} msgs / {antiSpam.windowSeconds}s</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={antiSpam.maxMessages}
                  onChange={(e) => setAntiSpam({ ...antiSpam, maxMessages: parseInt(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300">{isAr ? 'أقصى عدد منشن بالرسالة الواحدة' : 'Max Mentions per Message'}</span>
                  <span className="font-mono font-bold text-amber-400 tabular-nums">{antiSpam.maxMentions} mentions</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={antiSpam.maxMentions}
                  onChange={(e) => setAntiSpam({ ...antiSpam, maxMentions: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5">{isAr ? 'العقوبة عند تجاوز السرعة' : 'Spam Punishment'}</label>
                <select
                  value={antiSpam.punishment}
                  onChange={(e) => setAntiSpam({ ...antiSpam, punishment: e.target.value as 'timeout' | 'kick' | 'ban' })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="timeout">{isAr ? 'كتم مؤقت (Timeout 5-15 دقيقة)' : 'Timeout (5-15 minutes)'}</option>
                  <option value="kick">{isAr ? 'طرد من السيرفر (Kick)' : 'Kick from Guild'}</option>
                  <option value="ban">{isAr ? 'حظر نهائي (Instant Ban)' : 'Permanent Ban'}</option>
                </select>
              </div>
            </div>

            {/* Pattern filters & Protected channels */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">{isAr ? 'فلاتر النصوص والإيموجي والرومات' : 'Patterns & Protected Channels'}</h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{isAr ? 'منع الرسائل المكررة (Repetitive Spam)' : 'Block Duplicate Text'}</span>
                    <span className="text-[11px] text-slate-400">{isAr ? 'حذف الرسائل المنسوخة والمكررة لنفس المستخدم' : 'Detect and purge identical consecutive messages'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={antiSpam.blockRepetitiveMessages}
                    onChange={(e) => setAntiSpam({ ...antiSpam, blockRepetitiveMessages: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{isAr ? 'منع طوفان الإيموجي (Emoji Flood)' : 'Block Emoji Flood'}</span>
                    <span className="text-[11px] text-slate-400">{isAr ? 'منع إرسال أكثر من 6 إيموجي في الرسالة الواحدة' : 'Limit emoji spam per single message to 6'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={antiSpam.blockEmojiFlood}
                    onChange={(e) => setAntiSpam({ ...antiSpam, blockEmojiFlood: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </label>
              </div>

              {/* Dynamic Protected Channels */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-300 block mb-1.5">{isAr ? 'الرومات المشمولة بمراقبة السبام:' : 'Protected Channels:'}</span>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTrapChannel}
                    onChange={(e) => setNewTrapChannel(e.target.value)}
                    placeholder="#channel..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                  />
                  <button onClick={addTrapChannel} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold rounded cursor-pointer">
                    {isAr ? 'إضافة' : 'Add'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {antiSpam.trapChannels.map((ch) => (
                    <span key={ch} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono flex items-center gap-1">
                      <span>{ch}</span>
                      <button onClick={() => removeTrapChannel(ch)} className="text-slate-500 hover:text-red-400 cursor-pointer">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANTI-INVITE & AD PROTECTION */}
      {activeSubTab === 'antiinvite' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-sky-400" />
                {isAr ? 'حماية إعلانات وروابط ديسكورد' : 'Discord Invites Blocker'}
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{isAr ? 'حظر روابط السيرفرات (discord.gg)' : 'Block Server Invites'}</span>
                    <span className="text-[11px] text-slate-400">{isAr ? 'كشف وحذف روابط discord.gg و discord.com/invite' : 'Detect and delete Discord invitation links'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={antiInvite.blockDiscordInvites}
                    onChange={(e) => setAntiInvite({ ...antiInvite, blockDiscordInvites: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{isAr ? 'حظر الروابط المشبوهة والاختراق' : 'Anti-Phishing Filter'}</span>
                    <span className="text-[11px] text-slate-400">{isAr ? 'فحص النطاقات المعروفة باصطياد حسابات نيترو أو توكنات' : 'Block known phishing and fake Nitro domains'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={antiInvite.blockSuspiciousLinks}
                    onChange={(e) => setAntiInvite({ ...antiInvite, blockSuspiciousLinks: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Whitelisted Domains & Roles */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">{isAr ? 'النطاقات المسموحة والرتب المعفية' : 'Allowed Domains & Exempt Roles'}</h3>
              
              <div>
                <span className="text-xs text-slate-300 block mb-1">{isAr ? 'النطاقات المسموح بنشرها:' : 'Allowed Domains:'}</span>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="youtube.com, twitch.tv..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                  <button onClick={addDomain} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold rounded cursor-pointer">
                    {isAr ? 'إضافة' : 'Add'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {antiInvite.whitelistDomains.map((domain) => (
                    <span key={domain} className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono flex items-center gap-1">
                      <span>{domain}</span>
                      <button onClick={() => removeDomain(domain)} className="text-emerald-500 hover:text-red-400 cursor-pointer">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-300 block mb-1">{isAr ? 'الرتب المعفية من فلتر الإعلانات:' : 'Exempted Roles:'}</span>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newExemptRole}
                    onChange={(e) => setNewExemptRole(e.target.value)}
                    placeholder="VIP, Sponsor..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                  />
                  <button onClick={addExemptRole} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold rounded cursor-pointer">
                    {isAr ? 'إضافة' : 'Add'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {antiInvite.exemptRoles.map((role) => (
                    <span key={role} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1">
                      <span>@{role}</span>
                      <button onClick={() => removeExemptRole(role)} className="text-slate-500 hover:text-red-400 cursor-pointer">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
