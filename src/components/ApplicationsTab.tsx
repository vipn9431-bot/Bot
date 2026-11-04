import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Send, 
  User, 
  Calendar, 
  Sparkles,
  X,
  Settings,
  Trash2,
  Check,
  AlertTriangle,
  HelpCircle,
  Eye,
  Sliders,
  Shield,
  MessageSquare,
  Search,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { ApplicationSubmission, ApplicationsConfig, ApplicationQuestion } from '../types';
import { ChannelSelector } from './ChannelSelector';
import { sound } from '../utils/sound';

interface ApplicationsTabProps {
  lang: 'ar' | 'en';
  applications: ApplicationSubmission[];
  config: ApplicationsConfig;
  onChangeConfig: (cfg: ApplicationsConfig) => void;
  onReviewApplication: (appId: string, status: 'accepted' | 'rejected', notes?: string) => Promise<void> | void;
  onDeleteApplication?: (appId: string) => Promise<void> | void;
  onSendPanel: (channelName: string) => Promise<{ success: boolean; message: string }>;
  onSubmitSimulatedApp: (name: string, tag: string, answers: { [k: string]: string }) => void;
  onSave?: () => Promise<void> | void;
  isSaving?: boolean;
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  lang,
  applications,
  config,
  onChangeConfig,
  onReviewApplication,
  onDeleteApplication,
  onSendPanel,
  onSubmitSimulatedApp,
  onSave,
  isSaving = false,
}) => {
  const isAr = lang === 'ar';
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'queue'>('settings');
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [reviewNoteInput, setReviewNoteInput] = useState('');
  
  // Test Application Form state
  const [testApplicantName, setTestApplicantName] = useState('');
  const [testApplicantTag, setTestApplicantTag] = useState('');
  const [testAnswers, setTestAnswers] = useState<{ [qId: string]: string }>({});

  // Filter & Search
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Send Panel status state
  const [isSendingPanel, setIsSendingPanel] = useState(false);
  const [sendResultStatus, setSendResultStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  const filteredApps = applications.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.applicant.name.toLowerCase().includes(q);
      const matchTag = a.applicant.tag.toLowerCase().includes(q);
      const matchId = (a.applicant.id || '').toLowerCase().includes(q);
      return matchName || matchTag || matchId;
    }
    return true;
  });

  const selectedApp = applications.find(a => a.id === selectedAppId) || filteredApps[0] || applications[0];

  const handleUpdateConfig = <K extends keyof ApplicationsConfig>(key: K, value: ApplicationsConfig[K]) => {
    onChangeConfig({
      ...config,
      [key]: value
    });
  };

  const handleQuestionChange = (index: number, patch: Partial<ApplicationQuestion>) => {
    const nextQuestions = [...config.questions];
    nextQuestions[index] = { ...nextQuestions[index], ...patch };
    handleUpdateConfig('questions', nextQuestions);
  };

  const handleAddQuestion = () => {
    if (config.questions.length >= 5) return;
    sound.playClick();
    const newIdx = config.questions.length + 1;
    const newQ: ApplicationQuestion = {
      id: `q${Date.now().toString().slice(-4)}`,
      question: isAr ? `سؤال إداري جديد #${newIdx}` : `New Question #${newIdx}`,
      placeholder: isAr ? 'اكتب إجابتك هنا...' : 'Enter your answer here...',
      type: 'short',
      required: true
    };
    handleUpdateConfig('questions', [...config.questions, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (config.questions.length <= 1) return;
    sound.playClick();
    const nextQuestions = config.questions.filter((_, i) => i !== index);
    handleUpdateConfig('questions', nextQuestions);
  };

  const handleSendPanelClick = async () => {
    setIsSendingPanel(true);
    setSendResultStatus({ type: 'idle', message: '' });
    sound.playShieldActivate();
    try {
      const res = await onSendPanel(config.applyChannelName);
      if (res.success) {
        setSendResultStatus({ type: 'success', message: res.message });
      } else {
        setSendResultStatus({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setSendResultStatus({ type: 'error', message: err?.message || 'تعذر إرسال البنل' });
    } finally {
      setIsSendingPanel(false);
      setTimeout(() => {
        setSendResultStatus({ type: 'idle', message: '' });
      }, 7000);
    }
  };

  const handleAccept = (id: string) => {
    sound.playShieldActivate();
    const note = reviewNoteInput.trim() || (isAr ? 'تم القبول بنجاح ومنح رتبة الإدارة وإشعار العضو بالخاص.' : 'Accepted and role granted.');
    onReviewApplication(id, 'accepted', note);
    setReviewNoteInput('');
  };

  const handleReject = (id: string) => {
    sound.playClick();
    const note = reviewNoteInput.trim() || (isAr ? 'نعتذر، لم يتم اجتياز متطلبات الشفت والخبرة الإدارية.' : 'Rejected based on requirements.');
    onReviewApplication(id, 'rejected', note);
    setReviewNoteInput('');
  };

  const handleDelete = (id: string) => {
    sound.playClick();
    if (onDeleteApplication) {
      onDeleteApplication(id);
    }
  };

  const handleOpenTestModal = () => {
    setTestApplicantName('سلطان الشمري');
    setTestApplicantTag('Sultan#7701');
    const initialAnswers: { [qId: string]: string } = {};
    config.questions.forEach((q, idx) => {
      if (idx === 0) initialAnswers[q.id] = '21 سنة، المملكة العربية السعودية - الرياض.';
      else if (idx === 1) initialAnswers[q.id] = 'سنتين خبرة في إدارة سيرفرات مجتمعات الألعاب والمسابقات.';
      else if (idx === 2) initialAnswers[q.id] = 'متفرغ 6 ساعات يومياً في الفترة المسائية.';
      else initialAnswers[q.id] = 'جاهز للالتزام بجميع القوانين والمهام الموكلة.';
    });
    setTestAnswers(initialAnswers);
    setShowSubmitModal(true);
  };

  const handleSubmitTestForm = () => {
    if (!testApplicantName.trim() || !testApplicantTag.trim()) return;
    sound.playShieldActivate();
    onSubmitSimulatedApp(testApplicantName, testApplicantTag, testAnswers);
    setShowSubmitModal(false);
    setActiveSubTab('queue');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-rose-500" />
            <span>{isAr ? 'نظام التقديمات والاستمارات (Staff Applications)' : 'Application Management System'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'تخصيص استمارة التقديم على الإدارة، نشر البنل التفاعلي في الديسكورد، واستقبال وقبول الطلبات تلقائياً مع الرتب والخاص'
              : 'Customize application forms, publish interactive Discord panels, review candidates, auto-assign roles & send DMs'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 bg-[#0d1017] border border-slate-800 rounded-lg">
            <button
              onClick={() => { setActiveSubTab('settings'); sound.playClick(); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'settings'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعدادات الاستمارة والبنل' : 'Form & Panel Settings'}</span>
            </button>

            <button
              onClick={() => { setActiveSubTab('queue'); sound.playClick(); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'queue'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isAr ? 'الطلبات والمراجعة' : 'Submissions Queue'}</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-black rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {onSave && (
            <button
              onClick={() => onSave()}
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الإعدادات' : 'Save')}</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: SETTINGS & DISCORD PANEL */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          {/* Status & 1-Click Send Banner */}
          <div className="rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-[#0d1017] to-slate-900/40 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                config.enabled
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/40 text-red-400'
              }`}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'حالة نظام التقديمات في السيرفر' : 'Discord Application System Status'}
                  </h3>
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                    config.enabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {config.enabled ? (isAr ? 'التقديمات مفتوحة 🟢' : 'OPEN') : (isAr ? 'التقديمات مغلقة 🔴' : 'CLOSED')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {config.enabled
                    ? (isAr ? 'يمكن للأعضاء في ديسكورد الضغط على زر التقديم وتعبئة الاستمارة عبر المودال التفاعلي.' : 'Members can click Apply in Discord to fill the application form modal.')
                    : (isAr ? 'عند ضغط العضو على الزر سيتم إشعاره بأن التقديمات مغلقة مؤقتاً من قبل الإدارة.' : 'When members click Apply, they will be notified that applications are currently closed.')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  handleUpdateConfig('enabled', !config.enabled);
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  config.enabled
                    ? 'bg-red-950/40 border-red-500/40 text-red-200 hover:bg-red-900/60'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/60'
                }`}
              >
                {config.enabled ? (isAr ? 'إغلاق التقديمات 🔒' : 'Close Applications') : (isAr ? 'فتح التقديمات 🔓' : 'Open Applications')}
              </button>

              <button
                onClick={handleSendPanelClick}
                disabled={isSendingPanel}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black rounded-lg flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingPanel ? (isAr ? 'جاري الإرسال للديسكورد...' : 'Sending to Discord...') : (isAr ? 'نشر بنل التقديم في الديسكورد 🚀' : 'Send Panel to Discord')}</span>
              </button>
            </div>
          </div>

          {/* Alert Message for Send Action */}
          {sendResultStatus.type !== 'idle' && (
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              sendResultStatus.type === 'success'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/30 border-red-500/40 text-red-200'
            }`}>
              {sendResultStatus.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
              <span>{sendResultStatus.message}</span>
            </div>
          )}

          {/* Section 1: Channel Selectors & Auto-Role */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-500" />
              <span>{isAr ? '1. ربط الرومات وتعيين الرتبة التلقائية' : '1. Channels & Auto-Role Configuration'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ChannelSelector
                lang={lang}
                label={isAr ? 'روم نشر بنل التقديم للأعضاء' : 'Apply Panel Channel'}
                value={config.applyChannelName}
                onChange={(val) => handleUpdateConfig('applyChannelName', val)}
                placeholder="staff-applications"
                helperText={isAr ? 'الروم الذي تظهر فيه رسالة وبطاقة التقديم للأعضاء' : 'Channel where the Apply panel embed is posted'}
              />

              <ChannelSelector
                lang={lang}
                label={isAr ? 'روم مراجعة الإدارة واستلام الطلبات' : 'Admin Review Channel'}
                value={config.adminReviewChannelName}
                onChange={(val) => handleUpdateConfig('adminReviewChannelName', val)}
                placeholder="log-server"
                helperText={isAr ? 'الروم الخاص بالإدارة الذي تصل إليه الاستمارات مع أزرار القبول والرفض' : 'Staff-only channel receiving submissions with Accept/Reject buttons'}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  {isAr ? 'الرتبة الممنوحة تلقائياً عند القبول' : 'Role Granted on Approval'}
                </label>
                <input
                  type="text"
                  value={config.acceptedRoleName}
                  onChange={(e) => handleUpdateConfig('acceptedRoleName', e.target.value)}
                  placeholder="Staff Trial"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg py-2 px-3 text-xs text-white"
                />
                <p className="text-[10px] text-slate-400">
                  {isAr ? 'اسم الرتبة في ديسكورد التي تمنح فوراً للمقبولين' : 'Exact role name given immediately in Discord upon approval'}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <ChannelSelector
                lang={lang}
                label={isAr ? 'روم إعلان نتائج المقبولين (اختياري)' : 'Results Announcement Channel (Optional)'}
                value={config.resultsChannelName || ''}
                onChange={(val) => handleUpdateConfig('resultsChannelName', val)}
                placeholder="announcements"
                helperText={isAr ? 'روم عام لإعلان أسماء الأعضاء الذين تم قبولهم في طاقم الإدارة' : 'Public channel announcing accepted applicants'}
              />
            </div>
          </div>

          {/* Section 2: Custom Questions Builder */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-rose-500" />
                  <span>{isAr ? '2. منشئ وتخصيص أسئلة الاستمارة (Questions Builder)' : '2. Application Questions Builder'}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isAr
                    ? 'يمكنك تخصيص حتى 5 أسئلة تظهر في نافذة (Modal) التقديم التفاعلية في ديسكورد.'
                    : 'Customize up to 5 questions that pop up in the Discord interactive modal.'}
                </p>
              </div>

              <button
                onClick={handleAddQuestion}
                disabled={config.questions.length >= 5}
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة سؤال جديد' : 'Add Question'}</span>
                <span className="text-[10px] text-rose-400 font-mono">({config.questions.length}/5)</span>
              </button>
            </div>

            <div className="space-y-3">
              {config.questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/60 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-[10px] text-rose-300 font-bold">
                        {idx + 1}
                      </span>
                      <span>{isAr ? `السؤال رقم #${idx + 1}` : `Question #${idx + 1}`}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => handleQuestionChange(idx, { required: e.target.checked })}
                          className="rounded border-slate-700 text-rose-600 focus:ring-0"
                        />
                        <span>{isAr ? 'إجباري' : 'Required'}</span>
                      </label>

                      <button
                        onClick={() => handleRemoveQuestion(idx)}
                        disabled={config.questions.length <= 1}
                        className="text-slate-500 hover:text-red-400 disabled:opacity-20 cursor-pointer p-1"
                        title={isAr ? 'حذف السؤال' : 'Delete Question'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-slate-400 text-[11px]">{isAr ? 'نص السؤال' : 'Question Label'}</label>
                      <input
                        type="text"
                        value={q.question}
                        maxLength={45}
                        onChange={(e) => handleQuestionChange(idx, { question: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white"
                        placeholder="مثال: كم عمرك ومكان إقامتك؟"
                      />
                    </div>

                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-slate-400 text-[11px]">{isAr ? 'نص التلميح (Placeholder)' : 'Placeholder'}</label>
                      <input
                        type="text"
                        value={q.placeholder || ''}
                        maxLength={100}
                        onChange={(e) => handleQuestionChange(idx, { placeholder: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white"
                        placeholder="مثال: يوسف، 21 سنة، الرياض..."
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-slate-400 text-[11px]">{isAr ? 'نوع الإجابة' : 'Input Style'}</label>
                      <select
                        value={q.type}
                        onChange={(e) => handleQuestionChange(idx, { type: e.target.value as 'short' | 'paragraph' })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white cursor-pointer"
                      >
                        <option value="short">{isAr ? 'سطر قصير (Short)' : 'Short'}</option>
                        <option value="paragraph">{isAr ? 'فقرة مطولة (Paragraph)' : 'Paragraph'}</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Discord Embed Customizer & Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Embed Editor */}
            <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-500" />
                <span>{isAr ? '3. مظهر بطاقة وبنل التقديم (Embed Design)' : '3. Discord Embed Design'}</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {isAr ? 'عنوان البنل الرئيسي' : 'Panel Title'}
                  </label>
                  <input
                    type="text"
                    value={config.panelTitle}
                    onChange={(e) => handleUpdateConfig('panelTitle', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {isAr ? 'وصف وتعليمات البنل' : 'Panel Description'}
                  </label>
                  <textarea
                    rows={3}
                    value={config.panelDescription}
                    onChange={(e) => handleUpdateConfig('panelDescription', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2.5 text-white font-sans text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      {isAr ? 'لون البطاقة (Embed Color)' : 'Embed Color'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.panelColor || '#e11d48'}
                        onChange={(e) => handleUpdateConfig('panelColor', e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.panelColor || '#e11d48'}
                        onChange={(e) => handleUpdateConfig('panelColor', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      {isAr ? 'نص زر التقديم' : 'Button Label'}
                    </label>
                    <input
                      type="text"
                      value={config.panelButtonLabel}
                      onChange={(e) => handleUpdateConfig('panelButtonLabel', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      {isAr ? 'إيموجي الزر' : 'Button Emoji'}
                    </label>
                    <input
                      type="text"
                      value={config.panelButtonEmoji}
                      onChange={(e) => handleUpdateConfig('panelButtonEmoji', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    {isAr ? 'رابط بنر البطاقة (Banner URL - اختياري)' : 'Banner URL (Optional)'}
                  </label>
                  <input
                    type="url"
                    value={config.panelBannerUrl || ''}
                    placeholder="https://..."
                    onChange={(e) => handleUpdateConfig('panelBannerUrl', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Live Discord Embed Preview */}
            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'المعاينة المباشرة في ديسكورد (Discord Preview)' : 'Discord Live Preview'}</span>
              </span>

              <div className="p-4 rounded-xl bg-[#2b2d31] border border-slate-700/60 shadow-xl space-y-3 font-sans">
                {/* Embed container */}
                <div
                  className="rounded-lg bg-[#1e1f22] p-4 border-r-4 space-y-2.5"
                  style={{ borderRightColor: config.panelColor || '#e11d48' }}
                >
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {config.panelTitle || '📋 تقديم على الإدارة والرقابة'}
                  </h4>

                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {config.panelDescription || 'أهلاً بك! اضغط على الزر أدناه لتعبئة الاستمارة.'}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {isAr ? 'الرتبة الممنوحة:' : 'Role:'}{' '}
                      <span className="text-rose-300 font-bold">{config.acceptedRoleName || 'Staff Trial'}</span>
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {config.enabled ? 'التقديمات مفتوحة 🟢' : 'التقديمات مغلقة 🔴'}
                    </span>
                  </div>

                  {config.panelBannerUrl && (
                    <div className="pt-2">
                      <img
                        src={config.panelBannerUrl}
                        alt="Panel Banner"
                        className="w-full h-28 object-cover rounded-md border border-slate-700"
                      />
                    </div>
                  )}

                  <div className="pt-1 text-[9px] text-slate-500 font-mono">
                    M7R Applications • {new Date().toLocaleTimeString('ar-SA')}
                  </div>
                </div>

                {/* Interactive button preview */}
                <div className="pt-1">
                  <div
                    className={`w-full py-2 px-4 rounded-md text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all select-none ${
                      config.enabled
                        ? 'bg-[#248046] text-white hover:bg-[#1a6334] cursor-pointer'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>{config.panelButtonEmoji || '📝'}</span>
                    <span>{config.panelButtonLabel || 'تقديم الآن'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Direct Messages Automation */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-500" />
              <span>{isAr ? '4. رسائل الخاص التلقائية عند القبول والرفض (DM Automation)' : '4. Automated Direct Messages'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Accept DM */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-bold text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.dmOnAccept}
                      onChange={(e) => handleUpdateConfig('dmOnAccept', e.target.checked)}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <span>{isAr ? 'إرسال رسالة خاص تلقائية عند القبول' : 'Send DM upon Acceptance'}</span>
                  </label>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <textarea
                  rows={3}
                  value={config.acceptDmMessage}
                  onChange={(e) => handleUpdateConfig('acceptDmMessage', e.target.value)}
                  disabled={!config.dmOnAccept}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-white font-sans text-xs disabled:opacity-40"
                  placeholder="تهانينا! تمت الموافقة على طلبك..."
                />
              </div>

              {/* Reject DM */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-bold text-red-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.dmOnReject}
                      onChange={(e) => handleUpdateConfig('dmOnReject', e.target.checked)}
                      className="rounded border-slate-700 text-red-500 focus:ring-0"
                    />
                    <span>{isAr ? 'إرسال رسالة خاص تلقائية عند الرفض' : 'Send DM upon Rejection'}</span>
                  </label>
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <textarea
                  rows={3}
                  value={config.rejectDmMessage}
                  onChange={(e) => handleUpdateConfig('rejectDmMessage', e.target.value)}
                  disabled={!config.dmOnReject}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg p-2 text-white font-sans text-xs disabled:opacity-40"
                  placeholder="نعتذر منك، لم يتم اجتياز متطلبات الشفت..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SUBMISSIONS QUEUE & DECISIONS */}
      {activeSubTab === 'queue' && (
        <div className="space-y-6">
          {/* Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0d1017]">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'إجمالي الطلبات' : 'Total Applications'}</span>
              <span className="text-xl font-black text-white">{applications.length}</span>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/10">
              <span className="text-[11px] text-amber-300 block">{isAr ? 'قيد المراجعة' : 'Pending Review'}</span>
              <span className="text-xl font-black text-amber-400">{pendingCount}</span>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/10">
              <span className="text-[11px] text-emerald-300 block">{isAr ? 'تم قبولهم' : 'Accepted'}</span>
              <span className="text-xl font-black text-emerald-400">{acceptedCount}</span>
            </div>

            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/10">
              <span className="text-[11px] text-red-300 block">{isAr ? 'المرفوضة' : 'Rejected'}</span>
              <span className="text-xl font-black text-red-400">{rejectedCount}</span>
            </div>
          </div>

          {/* Search, Filters & Test Submit Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 p-1 bg-[#0d1017] border border-slate-800 rounded-lg">
                {(['all', 'pending', 'accepted', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => { setFilterStatus(st); sound.playClick(); }}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      filterStatus === st
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'all'
                      ? (isAr ? 'الكل' : 'All')
                      : st === 'pending'
                      ? (isAr ? 'قيد المراجعة' : 'Pending')
                      : st === 'accepted'
                      ? (isAr ? 'المقبولة' : 'Accepted')
                      : (isAr ? 'المرفوضة' : 'Rejected')}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute top-2.5 right-2.5" />
                <input
                  type="text"
                  placeholder={isAr ? 'بحث بالاسم أو التاق...' : 'Search by name or tag...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0d1017] border border-slate-800 rounded-lg py-1.5 pr-8 pl-3 text-xs text-white placeholder-slate-500 w-48 focus:border-rose-500"
                />
              </div>
            </div>

            <button
              onClick={handleOpenTestModal}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'محاكاة تقديم تجريبي' : 'Simulate Submission'}</span>
            </button>
          </div>

          {/* Main Inspection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Applicants Queue List */}
            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0d1017] p-4 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                {isAr ? 'قائمة الاستمارات' : 'Submissions List'} ({filteredApps.length})
              </span>

              {filteredApps.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  {isAr ? 'لا توجد طلبات تطابق الفلترة الحالية.' : 'No applications found.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[550px] overflow-y-auto">
                  {filteredApps.map((item) => {
                    const isSelected = item.id === selectedApp?.id;
                    const isPending = item.status === 'pending';
                    const isAccepted = item.status === 'accepted';

                    return (
                      <div
                        key={item.id}
                        onClick={() => { setSelectedAppId(item.id); sound.playClick(); }}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-950/20 border-rose-500/50 shadow-md'
                            : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                              {item.applicant.name.charAt(0)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">{item.applicant.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{item.applicant.tag}</span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isPending
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : isAccepted
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}>
                            {isPending ? (isAr ? 'قيد المراجعة' : 'Pending') : isAccepted ? (isAr ? 'مقبول ✅' : 'Accepted') : (isAr ? 'مرفوض ❌' : 'Rejected')}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-2 truncate font-medium">{item.formTitle}</p>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                          <span>{item.applicant.joinedAt}</span>
                          <span>{item.submittedAt}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Applicant Inspection & Decision */}
            <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0d1017] p-5 flex flex-col justify-between space-y-4">
              {selectedApp ? (
                <>
                  <div className="space-y-4">
                    {/* Header Profile */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-900 to-slate-900 border border-rose-500/40 flex items-center justify-center text-lg font-black text-rose-200">
                          {selectedApp.applicant.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            {selectedApp.applicant.name}
                            <span className="text-xs text-slate-400 font-mono font-normal">({selectedApp.applicant.tag})</span>
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <User className="w-3.5 h-3.5 text-rose-400" />
                            <span>{selectedApp.formTitle}</span>
                            <span>•</span>
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{selectedApp.submittedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                          selectedApp.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : selectedApp.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}>
                          {selectedApp.status === 'pending'
                            ? (isAr ? 'بانتظار قرار الإدارة' : 'Pending Review')
                            : selectedApp.status === 'accepted'
                            ? (isAr ? 'تم القبول رسميًا' : 'Approved')
                            : (isAr ? 'تم رفض الاستمارة' : 'Rejected')}
                        </span>

                        <button
                          onClick={() => handleDelete(selectedApp.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                          title={isAr ? 'حذف الاستمارة' : 'Delete Application'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question Answers Display */}
                    <div className="space-y-3 max-h-[380px] overflow-y-auto">
                      {config.questions.map((q, idx) => {
                        const answerText = selectedApp.answers[q.id] || selectedApp.answers[`q${idx + 1}`] || (isAr ? '— لم تتم الإجابة —' : 'No answer');
                        return (
                          <div key={q.id || idx} className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
                            <span className="text-xs font-bold text-rose-400 block mb-1">
                              {`س${idx + 1}: ${q.question}`}
                            </span>
                            <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                              {answerText}
                            </p>
                          </div>
                        );
                      })}

                      {selectedApp.reviewNotes && (
                        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300">
                          <b>{isAr ? 'ملاحظة الإدارة المسجلة:' : 'Staff Note:'}</b> {selectedApp.reviewNotes}
                        </div>
                      )}
                    </div>

                    {/* Optional Note Input */}
                    <div className="pt-2">
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        {isAr ? 'ملاحظة أو سبب القرار (اختياري، يرسل للعضو في الخاص):' : 'Decision Note (Optional):'}
                      </label>
                      <input
                        type="text"
                        value={reviewNoteInput}
                        onChange={(e) => setReviewNoteInput(e.target.value)}
                        placeholder={isAr ? 'اكتب ملاحظة أو سبب للقبول/الرفض...' : 'Add a note or reason...'}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleReject(selectedApp.id)}
                      disabled={selectedApp.status === 'rejected'}
                      className="px-4 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{isAr ? 'رفض الطلب (Reject)' : 'Reject'}</span>
                    </button>

                    <button
                      onClick={() => handleAccept(selectedApp.id)}
                      disabled={selectedApp.status === 'accepted'}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{isAr ? 'قبول ومنح الرتبة (Accept & Grant Role)' : 'Accept & Grant Role'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-24 text-center text-slate-400 text-xs">
                  {isAr ? 'يرجى اختيار استمارة من القائمة لمراجعتها.' : 'Select an application from queue.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT SIMULATED TEST APPLICATION */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121a] border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>{isAr ? 'محاكاة تقديم استمارة تجريبية' : 'Submit Sample Application'}</span>
              </h4>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">{isAr ? 'اسم المتقدم' : 'Applicant Name'}</label>
                  <input
                    type="text"
                    value={testApplicantName}
                    onChange={(e) => setTestApplicantName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">{isAr ? 'يوزر الديسكورد' : 'Discord Tag'}</label>
                  <input
                    type="text"
                    value={testApplicantTag}
                    onChange={(e) => setTestApplicantTag(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              {config.questions.map((q, idx) => (
                <div key={q.id || idx}>
                  <label className="text-slate-300 block mb-1 font-semibold">
                    {`س${idx + 1}: ${q.question}`}
                  </label>
                  {q.type === 'paragraph' ? (
                    <textarea
                      rows={2}
                      value={testAnswers[q.id] || ''}
                      onChange={(e) => setTestAnswers({ ...testAnswers, [q.id]: e.target.value })}
                      placeholder={q.placeholder || ''}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  ) : (
                    <input
                      type="text"
                      value={testAnswers[q.id] || ''}
                      onChange={(e) => setTestAnswers({ ...testAnswers, [q.id]: e.target.value })}
                      placeholder={q.placeholder || ''}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSubmitTestForm}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAr ? 'إرسال الاستمارة' : 'Submit Application'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
