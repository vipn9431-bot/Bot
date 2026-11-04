import React, { useState } from 'react';
import {
  Ticket as TicketIcon,
  UserCheck,
  Lock,
  Trash2,
  UserPlus,
  ArrowRightLeft,
  BellRing,
  Send,
  Download,
  Plus,
  X,
  Palette,
  SendHorizonal,
  CheckCircle2,
  Settings2,
  Bot,
  Clock,
  HelpCircle,
  Hash
} from 'lucide-react';
import { Ticket, TicketPanelConfig, TicketPanelButton } from '../types';
import { ChannelSelector } from './ChannelSelector';
import { sound } from '../utils/sound';

interface TicketsTabProps {
  lang: 'ar' | 'en';
  tickets: Ticket[];
  onTicketAction: (ticketId: string, action: string, staffName?: string, extra?: string) => void;
  onCreateSimulatedTicket: (category: 'store' | 'support' | 'complaints' | 'partnerships', categoryLabel: string) => void;
  panelConfig: TicketPanelConfig;
  onChangePanelConfig: (updated: TicketPanelConfig) => void;
}

export const TicketsTab: React.FC<TicketsTabProps> = ({
  lang,
  tickets,
  onTicketAction,
  onCreateSimulatedTicket,
  panelConfig,
  onChangePanelConfig,
}) => {
  const isAr = lang === 'ar';
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyInput, setReplyInput] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('إدارة المبيعات');
  const [activeView, setActiveView] = useState<'builder' | 'desk'>('builder');
  const [deployFeedback, setDeployFeedback] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const updatePanelField = <K extends keyof TicketPanelConfig>(key: K, value: TicketPanelConfig[K]) => {
    onChangePanelConfig({
      ...panelConfig,
      [key]: value
    });
  };

  const updateButtonItem = (btnId: string, field: keyof TicketPanelButton, value: any) => {
    const nextButtons = panelConfig.buttons.map((b) =>
      b.id === btnId ? { ...b, [field]: value } : b
    );
    updatePanelField('buttons', nextButtons);
  };

  const handleAddButton = () => {
    if (panelConfig.buttons.length >= 5) return;
    sound.playClick();
    const newBtn: TicketPanelButton = {
      id: `btn_${Date.now()}`,
      label: isAr ? 'قسم جديد' : 'New Category',
      emoji: '🎫',
      style: 'Primary',
      categoryDescription: isAr ? 'وصف القسم الجديد في لوحة التذاكر' : 'Description for this ticket button',
      enabled: true
    };
    updatePanelField('buttons', [...panelConfig.buttons, newBtn]);
  };

  const handleRemoveButton = (btnId: string) => {
    sound.playClick();
    updatePanelField(
      'buttons',
      panelConfig.buttons.filter((b) => b.id !== btnId)
    );
  };

  const handleDeployPanelToDiscord = async () => {
    setIsDeploying(true);
    sound.playShieldActivate();
    try {
      const res = await fetch('/api/tickets/deploy-panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          panelConfig,
          channelName: panelConfig.targetChannelName
        })
      });
      const data = await res.json();
      setDeployFeedback(data.message || 'تم إرسال البانل بنجاح!');
      setTimeout(() => setDeployFeedback(null), 5000);
    } catch {
      setDeployFeedback('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setIsDeploying(false);
    }
  };

  const getDiscordBtnColorClass = (style: TicketPanelButton['style']) => {
    switch (style) {
      case 'Primary':
        return 'bg-[#5865F2] hover:bg-[#4752c4] text-white';
      case 'Success':
        return 'bg-[#248046] hover:bg-[#1a6334] text-white';
      case 'Danger':
        return 'bg-[#da373c] hover:bg-[#a12828] text-white';
      case 'Secondary':
      default:
        return 'bg-[#4e5058] hover:bg-[#6d6f78] text-white';
    }
  };

  const handleSendReply = () => {
    if (!replyInput.trim() || !selectedTicket) return;
    onTicketAction(selectedTicket.id, 'send_reply', 'M7R Support Agent', replyInput.trim());
    setReplyInput('');
    sound.playClick();
  };

  const handleClaim = () => {
    if (!selectedTicket) return;
    sound.playShieldActivate();
    onTicketAction(selectedTicket.id, 'claim', 'Sultan [M7R Chief]');
  };

  const handleClose = () => {
    if (!selectedTicket) return;
    sound.playClick();
    onTicketAction(selectedTicket.id, 'close');
  };

  const handleDelete = () => {
    if (!selectedTicket) return;
    sound.playAlarm();
    onTicketAction(selectedTicket.id, 'delete');
    if (tickets.length > 1) {
      const remaining = tickets.filter((t) => t.id !== selectedTicket.id);
      setSelectedTicketId(remaining[0]?.id || '');
    }
  };

  const handleRemind = () => {
    if (!selectedTicket) return;
    sound.playClick();
    onTicketAction(selectedTicket.id, 'remind');
  };

  const handleAddUserSubmit = () => {
    if (!targetUsername.trim() || !selectedTicket) return;
    sound.playClick();
    onTicketAction(
      selectedTicket.id,
      'send_reply',
      'M7R Bot [Permission]',
      `➕ تم إضافة العضو @${targetUsername} بنجاح إلى التذكرة.`
    );
    setShowAddUserModal(false);
    setTargetUsername('');
  };

  const handleTransferSubmit = () => {
    if (!selectedTicket) return;
    sound.playShieldActivate();
    onTicketAction(selectedTicket.id, 'transfer', undefined, targetDepartment);
    setShowTransferModal(false);
  };

  const handleDownloadTranscript = () => {
    if (!selectedTicket) return;
    sound.playClick();
    const content =
      `===================================================
M7R SECURITY - TICKET TRANSCRIPT
Ticket ID: ${selectedTicket.id}
Channel: #${selectedTicket.channelName}
Category: ${selectedTicket.categoryLabel}
User: ${selectedTicket.user.name} (${selectedTicket.user.id})
Claimed By: ${selectedTicket.claimedBy || 'Unclaimed'}
Created: ${selectedTicket.createdAt}
Exported: ${new Date().toLocaleString()}
===================================================

` + selectedTicket.messages.map((m) => `[${m.timestamp}] ${m.author}: ${m.content}`).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${selectedTicket.channelName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <TicketIcon className="w-6 h-6 text-rose-500" />
            {isAr ? 'استوديو تعديل التذاكر والبانل المتقدم (M7R Ticket Studio)' : 'M7R Custom Ticket Studio & Desk'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'عدّل على عنوان التكت، الوصف، الأزرار، الإيموجي، الألوان، ورسالة الترحيب وأرسل البانل مباشرة لسيرفرك في ديسكورد!'
              : 'Customize every detail of your ticket embed, buttons, colors, and deploy directly to your Discord server!'}
          </p>
        </div>

        {/* Segmented view switch */}
        <div className="flex items-center gap-1 p-1 bg-[#0d1017] border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => {
              setActiveView('builder');
              sound.playClick();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'builder'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{isAr ? 'تخصيص وتعديل التكت 🎨' : 'Customize Ticket Panel 🎨'}</span>
          </button>
          <button
            onClick={() => {
              setActiveView('desk');
              sound.playClick();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'desk'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{isAr ? `إدارة التذاكر المفتوحة (${tickets.length})` : `Active Tickets (${tickets.length})`}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FULL INTERACTIVE TICKET CUSTOMIZER & LIVE DISCORD PREVIEW */}
      {activeView === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left/Right Editor Form */}
          <div className="lg:col-span-7 space-y-5">
            {/* General Panel Settings */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-rose-500" />
                {isAr ? 'تعديل نصوص وألوان بانل التذاكر الأساسي' : 'Ticket Embed Content & Styling'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {isAr ? 'اسم المتجر / السيرفر' : 'Store / Server Name'}
                  </label>
                  <input
                    type="text"
                    value={panelConfig.storeName}
                    onChange={(e) => updatePanelField('storeName', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {isAr ? 'رتبة الدعم الفني المسؤولة (Support Role)' : 'Support Staff Role'}
                  </label>
                  <input
                    type="text"
                    value={panelConfig.supportRoleName}
                    onChange={(e) => updatePanelField('supportRoleName', e.target.value)}
                    placeholder="Support"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Comprehensive Room Selectors for Tickets */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/20 space-y-3">
                <span className="text-xs font-bold text-rose-400 block">
                  {isAr ? '📍 تحديد الرومات والكاتيجوري الخاصة بنظام التذاكر:' : '📍 Ticket System Channels & Category Selection:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ChannelSelector
                    lang={lang}
                    label={isAr ? 'تحديد روم إرسال البانل' : 'Panel Channel'}
                    value={panelConfig.targetChannelName}
                    onChange={(ch) => updatePanelField('targetChannelName', ch)}
                    placeholder="tickets"
                    helperText={isAr ? 'الروم الذي يظهر فيه بانل فتح التكت' : 'Channel where ticket panel is posted'}
                  />

                  <ChannelSelector
                    lang={lang}
                    label={isAr ? 'تحديد روم لوق التذاكر' : 'Ticket Logs Channel'}
                    value={panelConfig.ticketLogChannelName || 'ticket-logs'}
                    onChange={(ch) => updatePanelField('ticketLogChannelName', ch)}
                    placeholder="ticket-logs"
                    helperText={isAr ? 'روم حفظ نسخ التذاكر المغلقة' : 'Channel for closed ticket transcripts'}
                  />

                  <ChannelSelector
                    lang={lang}
                    type="all"
                    label={isAr ? 'تحديد كاتيجوري فتح التكت' : 'Tickets Category'}
                    value={panelConfig.ticketCategoryName || '🎫 | قسم التذاكر (Tickets)'}
                    onChange={(ch) => updatePanelField('ticketCategoryName', ch)}
                    placeholder="tickets-category"
                    helperText={isAr ? 'القسم الذي تنشأ بداخله رومات التذاكر' : 'Category where new tickets open'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="sm:col-span-3">
                  <label className="text-slate-300 font-semibold block mb-1">
                    {isAr ? 'عنوان بانل التذاكر (Embed Title)' : 'Embed Title'}
                  </label>
                  <input
                    type="text"
                    value={panelConfig.embedTitle}
                    onChange={(e) => updatePanelField('embedTitle', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {isAr ? 'لون الـ Embed' : 'Embed Color'}
                  </label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5">
                    <input
                      type="color"
                      value={panelConfig.embedColor}
                      onChange={(e) => updatePanelField('embedColor', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-[11px] text-slate-300">{panelConfig.embedColor}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs">
                <label className="text-slate-300 font-semibold block mb-1">
                  {isAr ? 'وصف البانل الرئيسي (Embed Description)' : 'Embed Description'}
                </label>
                <textarea
                  rows={2}
                  value={panelConfig.embedDescription}
                  onChange={(e) => updatePanelField('embedDescription', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div className="text-xs">
                <label className="text-slate-300 font-semibold block mb-1">
                  {isAr ? 'رسالة الترحيب التلقائية داخل التذكرة عند فتحها' : 'Welcome Message Inside Ticket'}
                </label>
                <textarea
                  rows={2}
                  value={panelConfig.welcomeMessage}
                  onChange={(e) => updatePanelField('welcomeMessage', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* NEW: Ticket Naming Format, Reason Modal & AI Waiting Assistant */}
            <div className="rounded-xl border border-indigo-500/30 bg-[#0d1017] p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'تسمية روم التذكرة، سبب الفتح والمساعد الذكي 🤖' : 'Ticket Channel Naming, Reason & AI Waiting Assistant'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'تحكم في اسم الروم المنشأ (رقم التذكرة أو اسم الشخص أو كلاهما)، وطلب سبب الفتح، وتفعيل إجابات الذكاء الاصطناعي أثناء انتظار الإدارة.'
                  : 'Control channel naming (number, username or both), prompt for reason upon opening, and enable AI waiting replies.'}
              </p>

              {/* 1. Ticket Naming Format */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <label className="text-xs font-bold text-slate-200 block">
                  {isAr ? '🏷️ نمط تسمية روم التذكرة عند فتحها:' : '🏷️ Ticket Channel Naming Pattern:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: 'username_number',
                      label: isAr ? 'اسم الشخص + رقم' : 'Username + Number',
                      example: `${panelConfig.channelPrefix || 'ticket'}-ahmed-042`
                    },
                    {
                      id: 'number',
                      label: isAr ? 'رقم التذكرة فقط' : 'Number Only',
                      example: `${panelConfig.channelPrefix || 'ticket'}-042`
                    },
                    {
                      id: 'username',
                      label: isAr ? 'اسم الشخص فقط' : 'Username Only',
                      example: `${panelConfig.channelPrefix || 'ticket'}-ahmed`
                    }
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => updatePanelField('namingFormat', pat.id as any)}
                      className={`p-2.5 rounded-xl border text-start cursor-pointer transition-all ${
                        (panelConfig.namingFormat || 'username_number') === pat.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-950/40'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{pat.label}</span>
                      <span className="text-[10px] font-mono text-indigo-300 mt-1 block">
                        مثال: {pat.example}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Channel Prefix Input */}
                <div className="pt-2 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">
                      {isAr ? 'بادئة اسم الروم (Prefix):' : 'Channel Name Prefix:'}
                    </label>
                    <input
                      type="text"
                      value={panelConfig.channelPrefix || 'ticket'}
                      onChange={(e) => updatePanelField('channelPrefix', e.target.value.trim().toLowerCase())}
                      placeholder="ticket"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 pt-5">
                    {isAr ? 'مثال: ticket- أو تذكرة-' : 'e.g. ticket- or help-'}
                  </div>
                </div>
              </div>

              {/* 2. Ask Reason Modal Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    {isAr ? 'طلب سبب فتح التذكرة في نافذة منبثقة (Modal) 📝' : 'Prompt for Ticket Reason via Modal 📝'}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isAr
                      ? 'عند الضغط على فتح تذكرة، تظهر للمستخدم نافذة ليكتب سبب التذكرة وتفاصيل طلبه، وتظهر للإدارة فوراً في رسالة الترحيب.'
                      : 'Show a Discord popup asking the member to state their reason, displayed to staff in the welcome embed.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={panelConfig.askReasonModal ?? true}
                  onChange={(e) => updatePanelField('askReasonModal', e.target.checked)}
                  className="w-4 h-4 mt-1 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* 3. AI Waiting Assistant Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                      {isAr ? 'المساعد الذكي أثناء انتظار الإدارة (M7R AI Waiting Assistant) 🤖' : 'AI Waiting Assistant While Waiting for Staff 🤖'}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr
                        ? 'أول ما يفتح العضو التذكرة تظهر له رسالة تفيد بانتظار الإدارة مع إمكانية سؤال الذكاء الاصطناعي (ai ask) ليجيبه فوراً حتى يتفرغ الدعم الفني!'
                        : 'Sends an automated wait message offering M7R AI replies inside the ticket room until staff arrives.'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={panelConfig.aiWaitingAssistant ?? true}
                    onChange={(e) => updatePanelField('aiWaitingAssistant', e.target.checked)}
                    className="w-4 h-4 mt-1 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {(panelConfig.aiWaitingAssistant ?? true) && (
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">
                      {isAr ? 'نص رسالة الانتظار والذكاء الاصطناعي التلقائية:' : 'Automated Waiting & AI Assistant Message:'}
                    </label>
                    <textarea
                      rows={3}
                      value={
                        panelConfig.waitingMessage ||
                        (isAr
                          ? '⏳ مرحباً بك! يرجى الانتظار لحين قدوم طاقم الإدارة لمساعدتك.\n💡 أثناء الانتظار، يمكنك كتابة "ai ask [سؤالك]" وسيجيبك المساعد الذكي M7R فوراً لمساعدتك حتى يتفرغ الدعم الفني!'
                          : '⏳ Welcome! Please wait for staff to assist you.\n💡 In the meantime, you can ask M7R AI by typing "ai ask [question]" for instant help!')
                      }
                      onChange={(e) => updatePanelField('waitingMessage', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Buttons Customizer */}
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'تخصيص أزرار فتح التذاكر + تحديد الروم/القسم لكل زر' : 'Customize Ticket Category Buttons & Target Rooms'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'عدّل اسم كل زر، الإيموجي، اللون، الوصف، وحدد الروم/الكاتيجوري الخاص به (حتى 5 أزرار)' : 'Edit button labels, emojis, styles, descriptions, and target room'}
                  </p>
                </div>

                {panelConfig.buttons.length < 5 && (
                  <button
                    onClick={handleAddButton}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة زر جديد' : 'Add Button'}</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {panelConfig.buttons.map((btn, idx) => (
                  <div
                    key={btn.id}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-400">
                        #{idx + 1} — {btn.emoji} {btn.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={btn.enabled}
                            onChange={(e) => updateButtonItem(btn.id, 'enabled', e.target.checked)}
                            className="accent-rose-600 rounded"
                          />
                          <span>{isAr ? 'مفعل' : 'Enabled'}</span>
                        </label>
                        {panelConfig.buttons.length > 1 && (
                          <button
                            onClick={() => handleRemoveButton(btn.id)}
                            className="text-slate-500 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'الإيموجي' : 'Emoji'}</label>
                        <input
                          type="text"
                          value={btn.emoji}
                          onChange={(e) => updateButtonItem(btn.id, 'emoji', e.target.value)}
                          className="w-full bg-[#07090e] border border-slate-800 rounded-lg p-2 text-center text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'اسم الزر' : 'Button Label'}</label>
                        <input
                          type="text"
                          value={btn.label}
                          onChange={(e) => updateButtonItem(btn.id, 'label', e.target.value)}
                          className="w-full bg-[#07090e] border border-slate-800 rounded-lg p-2 text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'لون الزر' : 'Button Color'}</label>
                        <select
                          value={btn.style}
                          onChange={(e) => updateButtonItem(btn.id, 'style', e.target.value)}
                          className="w-full bg-[#07090e] border border-slate-800 rounded-lg p-2 text-white"
                        >
                          <option value="Primary">🔵 أزرق (Primary)</option>
                          <option value="Secondary">⚫ رمادي (Secondary)</option>
                          <option value="Success">🟢 أخضر (Success)</option>
                          <option value="Danger">🔴 أحمر (Danger)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">{isAr ? 'وصف هذا القسم في البانل' : 'Category Description'}</label>
                        <input
                          type="text"
                          value={btn.categoryDescription}
                          onChange={(e) => updateButtonItem(btn.id, 'categoryDescription', e.target.value)}
                          className="w-full bg-[#07090e] border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>

                      <ChannelSelector
                        lang={lang}
                        compact={true}
                        type="all"
                        label={isAr ? 'تحديد روم/كاتيجوري هذا الزر' : 'Target Room / Category'}
                        value={btn.targetCategoryName || panelConfig.ticketCategoryName || 'tickets'}
                        onChange={(ch) => updateButtonItem(btn.id, 'targetCategoryName', ch)}
                        placeholder="tickets"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right/Left Column: Live Discord Embed Preview & One-Click Send */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'معاينة البانل الحية في ديسكورد' : 'Live Discord Panel Preview'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? `سيتم إرساله في روم #${panelConfig.targetChannelName}` : `Target: #${panelConfig.targetChannelName}`}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Live Sync</span>
              </div>

              {/* Authentic Discord Embed Box */}
              <div
                className="rounded-lg bg-[#2b2d31] p-4 text-slate-100 border-l-4 space-y-3 shadow-inner"
                style={{ borderLeftColor: panelConfig.embedColor }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-xs text-white"
                    style={{ backgroundColor: panelConfig.embedColor }}
                  >
                    M7R
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">{panelConfig.embedTitle}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{panelConfig.storeName}</span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-200">{panelConfig.embedDescription}</p>

                <div className="text-xs space-y-1.5 bg-[#1e1f22] p-3 rounded text-slate-300">
                  {panelConfig.buttons
                    .filter((b) => b.enabled)
                    .map((b) => (
                      <p key={b.id}>
                        {b.emoji} <b>{b.label}:</b> {b.categoryDescription}
                      </p>
                    ))}
                </div>

                {/* Live Discord Buttons Preview */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {panelConfig.buttons
                    .filter((b) => b.enabled)
                    .map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          onCreateSimulatedTicket('store', `${b.emoji} ${b.label}`);
                          setActiveView('desk');
                        }}
                        className={`py-2 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${getDiscordBtnColorClass(
                          b.style
                        )}`}
                      >
                        <span>{b.emoji}</span>
                        <span>{b.label}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Deploy directly to Discord Server Button */}
              <button
                onClick={handleDeployPanelToDiscord}
                disabled={isDeploying}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 cursor-pointer transition-all"
              >
                <SendHorizonal className="w-4 h-4" />
                <span>
                  {isDeploying
                    ? (isAr ? 'جاري إرسال البانل إلى ديسكورد...' : 'Sending Panel to Discord...')
                    : (isAr ? `إرسال ونشر بانل التذاكر في ديسكورد الآن 🚀` : 'Send Ticket Panel to Discord Now 🚀')}
                </span>
              </button>

              {deployFeedback && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{deployFeedback}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 text-center">
                {isAr
                  ? '💡 يمكنك أيضاً كتابة الأمر !panel أو /panel داخل أي روم في ديسكورد ليقوم البوت بإرسال هذا البانل فوراً!'
                  : 'You can also type !panel or /panel inside any Discord channel to post this panel!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE TICKET DESK */}
      {activeView === 'desk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-[#0d1017] p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {isAr ? 'التذاكر الحالية' : 'Open Tickets'} ({tickets.length})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto">
                {tickets.map((t) => {
                  const isSelected = t.id === selectedTicket?.id;
                  const isClaimed = t.status === 'claimed';
                  const isClosed = t.status === 'closed';

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTicketId(t.id);
                        sound.playClick();
                      }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-950/20 border-rose-500/50 shadow-md'
                          : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 font-mono">#{t.channelName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isClosed
                              ? 'bg-slate-800 text-slate-400'
                              : isClaimed
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isClosed ? (isAr ? 'مغلقة' : 'Closed') : isClaimed ? (isAr ? 'مستلمة' : 'Claimed') : (isAr ? 'مفتوحة' : 'Open')}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 truncate">{t.categoryLabel}</div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                        <span>{t.user.name}</span>
                        <span className="font-mono">{t.createdAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ticket Detail & Room */}
          <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-[#0d1017] p-5 flex flex-col justify-between space-y-4">
            {selectedTicket ? (
              <>
                <div className="pb-4 border-b border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white font-mono">#{selectedTicket.channelName}</span>
                        <span className="text-xs text-rose-400 font-medium">({selectedTicket.categoryLabel})</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>
                          {isAr ? 'صاحب التذكرة:' : 'Creator:'} <b className="text-slate-200">{selectedTicket.user.name}</b>
                        </span>
                        <span>•</span>
                        <span>
                          {isAr ? 'المستلم:' : 'Staff Claim:'}{' '}
                          <b className={selectedTicket.claimedBy ? 'text-emerald-400' : 'text-amber-400'}>
                            {selectedTicket.claimedBy || (isAr ? 'بانتظار مستلم' : 'Unclaimed')}
                          </b>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadTranscript}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-rose-400" />
                      <span>{isAr ? 'تحميل Transcript' : 'Export Transcript'}</span>
                    </button>
                  </div>

                  {/* THE 6 OPERATIONAL TICKET BUTTONS */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 mt-4">
                    <button
                      onClick={handleClaim}
                      className="p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="text-[11px]">{isAr ? 'استلام (Claim)' : 'Claim'}</span>
                    </button>

                    <button
                      onClick={handleClose}
                      className="p-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span className="text-[11px]">{isAr ? 'إغلاق (Close)' : 'Close'}</span>
                    </button>

                    <button
                      onClick={handleDelete}
                      className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-200 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-[11px]">{isAr ? 'حذف (Delete)' : 'Delete'}</span>
                    </button>

                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="p-2 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/40 text-sky-200 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="text-[11px]">{isAr ? 'إضافة عضو (Add)' : 'Add User'}</span>
                    </button>

                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="p-2 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span className="text-[11px]">{isAr ? 'تحويل (Transfer)' : 'Transfer'}</span>
                    </button>

                    <button
                      onClick={handleRemind}
                      className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <BellRing className="w-4 h-4" />
                      <span className="text-[11px]">{isAr ? 'تذكير (Remind)' : 'Remind'}</span>
                    </button>
                  </div>
                </div>

                {/* Messages Live Feed */}
                <div className="space-y-3 min-h-[260px] max-h-[340px] overflow-y-auto p-3 rounded-lg bg-[#07090e] border border-slate-900">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg border text-xs ${
                        msg.isStaff
                          ? 'bg-rose-950/15 border-rose-900/30 text-rose-100 ml-4'
                          : 'bg-slate-900/70 border-slate-800 text-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          {msg.author}
                          {msg.isStaff && (
                            <span className="text-[9px] bg-rose-600/30 text-rose-300 border border-rose-500/40 px-1 rounded font-mono">
                              STAFF
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>

                {/* Staff Reply Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder={isAr ? 'اكتب رد المشرف هنا وإرساله في تذكرة الديسكورد...' : 'Type staff reply here...'}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={handleSendReply}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إرسال' : 'Send'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                {isAr ? 'لا توجد تذاكر حالياً.' : 'No active tickets.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121a] border border-slate-800 rounded-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-400" />
                {isAr ? 'إضافة عضو إلى التذكرة' : 'Add User to Ticket'}
              </h4>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="@Username or ID..."
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleAddUserSubmit}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white cursor-pointer"
              >
                {isAr ? 'تأكيد الإضافة' : 'Confirm Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER TICKET */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121a] border border-slate-800 rounded-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                {isAr ? 'تحويل التذكرة إلى قسم آخر' : 'Transfer Ticket Department'}
              </h4>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <select
              value={targetDepartment}
              onChange={(e) => setTargetDepartment(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="إدارة المبيعات">إدارة المبيعات</option>
              <option value="فريق الأمن والحماية الفولاذية M7R">فريق الأمن والحماية الفولاذية M7R</option>
              <option value="الإدارة العليا (Co-Owners)">الإدارة العليا (Co-Owners)</option>
              <option value="فريق الشراكات والإعلانات">فريق الشراكات والإعلانات</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleTransferSubmit}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
              >
                {isAr ? 'تحويل التذكرة' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
