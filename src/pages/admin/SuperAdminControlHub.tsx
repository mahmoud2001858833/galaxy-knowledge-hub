import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Atom, 
  HelpCircle, 
  Users, 
  ShieldAlert, 
  MessageSquare, 
  Sliders, 
  BrainCircuit, 
  Code2, 
  Search, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Plus, 
  Trash2, 
  Eye, 
  ExternalLink, 
  RefreshCw, 
  Menu, 
  X, 
  Save, 
  Send, 
  FileText, 
  Layers, 
  Activity, 
  Zap, 
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  BookOpen,
  GraduationCap,
  Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTheme, ThemeToggle } from '@/contexts/ThemeContext';
import { auditLogger, type AuditLogEntry, type AuditActionType, type AuditSeverity } from '@/services/auditLogger';
import { platformSettings, type PlatformSettings, type FooterLink } from '@/services/platformSettingsService';
import { liveSupportService, type SupportSession } from '@/services/liveSupportService';
import { QuantumQuestionGenerator } from '@/components/admin/QuantumQuestionGenerator';
import { PlatformCopilotWindow } from '@/components/admin/PlatformCopilotWindow';
import { ExecutiveOverviewTab } from '@/components/admin/lcm/ExecutiveOverviewTab';
import { LCMContentManager } from '@/components/admin/lcm/LCMContentManager';
import { FacultyStaffManager } from '@/components/admin/lcm/FacultyStaffManager';
import { SchoolBroadcastsManager } from '@/components/admin/lcm/SchoolBroadcastsManager';

type AdminTab = 
  | 'overview'
  | 'lcm'
  | 'faculty'
  | 'broadcasts'
  | 'dashboard'
  | 'simulations'
  | 'puzzles'
  | 'users'
  | 'audit'
  | 'support'
  | 'footer'
  | 'questions'
  | 'copilot';

interface PuzzleItem {
  id: string;
  title: string;
  subject: string;
  question: string;
  answer: string;
  hint?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const INITIAL_PUZZLES: PuzzleItem[] = [
  {
    id: 'puz-1',
    title: 'تراكب الحالات الكمية',
    subject: 'فيزياء',
    question: 'ما هي الخاصية الكمية التي تسمح لجسيم بالتواجد في أكثر من حالة طاقية في آن واحد قبل إجراء القياس؟',
    answer: 'التراكب الكمي (Quantum Superposition)',
    hint: 'مرتبط بتجربة قطة شرودنغر',
    points: 15,
    difficulty: 'medium'
  },
  {
    id: 'puz-2',
    title: 'توازن لوشاتيليه الديناميكي',
    subject: 'كيمياء',
    question: 'في تفاعل طارد للحرارة في حالة اتزان، إلى أي اتجاه ينزاح موضع الاتزان عند رفع درجة الحرارة؟',
    answer: 'نحو الاتجاه العكسي (المتفاعلات)',
    hint: 'وفق قاعدة لوشاتيليه لتقليل الأثر الخارجي',
    points: 10,
    difficulty: 'easy'
  },
  {
    id: 'puz-3',
    title: 'تعديل الجينات بكريسبر',
    subject: 'أحياء',
    question: 'ما هو البروتين الأنزيمي الذي يعمل كمقص جزيئي لقطع الحمض النووي بدقة موجهة بـ gRNA؟',
    answer: 'Cas9 (أو Cas12)',
    hint: 'Cas هو اختصار لـ CRISPR-associated protein',
    points: 20,
    difficulty: 'hard'
  }
];

export const SuperAdminControlHub: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Authentication & Passkey State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('galaxy_admin_authenticated') === 'true';
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState(false);

  // Active Tab & Sidebar State
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');

  // Service States
  const [settings, setSettings] = useState<PlatformSettings>(() => platformSettings.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => auditLogger.getAll());
  const [supportSessions, setSupportSessions] = useState<SupportSession[]>(() => liveSupportService.getSessions());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Audit Filters
  const [auditQuery, setAuditQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>('all');

  // Puzzles State
  const [puzzles, setPuzzles] = useState<PuzzleItem[]>(() => {
    try {
      const stored = localStorage.getItem('galaxy_admin_puzzles_v2');
      return stored ? JSON.parse(stored) : INITIAL_PUZZLES;
    } catch {
      return INITIAL_PUZZLES;
    }
  });

  const [newPuzzle, setNewPuzzle] = useState({
    title: '',
    subject: 'فيزياء',
    question: '',
    answer: '',
    hint: '',
    points: 10,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });

  // Footer Link Form
  const [newFooterLink, setNewFooterLink] = useState({
    title: '',
    url: '',
    category: 'quick' as 'quick' | 'academic' | 'special_ed' | 'legal',
    badge: ''
  });

  // Event Listeners for Live Updates
  useEffect(() => {
    const handleLogs = () => setAuditLogs(auditLogger.getAll());
    const handleSupport = () => setSupportSessions(liveSupportService.getSessions());
    const handleSettings = (e: CustomEvent<PlatformSettings>) => setSettings(e.detail || platformSettings.getSettings());

    window.addEventListener('galaxy_audit_log_added' as any, handleLogs);
    window.addEventListener('galaxy_live_support_updated' as any, handleSupport);
    window.addEventListener('galaxy_platform_settings_updated' as any, handleSettings);

    return () => {
      window.removeEventListener('galaxy_audit_log_added' as any, handleLogs);
      window.removeEventListener('galaxy_live_support_updated' as any, handleSupport);
      window.removeEventListener('galaxy_platform_settings_updated' as any, handleSettings);
    };
  }, []);

  // Passkey Verification Handler
  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkeyInput === 'mahmoud200' || passkeyInput === 'admin2026' || passkeyInput === 'galaxy') {
      setIsAuthenticated(true);
      sessionStorage.setItem('galaxy_admin_authenticated', 'true');
      toast.success('مرحباً بك في لوحة الإدارة الفائقة لذروة العلم 🚀');
      auditLogger.record({
        action: 'LOGIN',
        module: 'Admin Authentication',
        description: 'تسجيل دخول ناجح إلى لوحة التحكم الإدارية الفائقة',
        user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
        severity: 'info'
      });
    } else {
      setPasskeyError(true);
      toast.error('رمز المرور غير صحيح');
    }
  };

  // Add Puzzle Handler
  const handleAddPuzzle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPuzzle.title || !newPuzzle.question || !newPuzzle.answer) {
      toast.error('يرجى ملء الحقول الأساسية للغز');
      return;
    }

    const created: PuzzleItem = {
      ...newPuzzle,
      id: 'puz-' + Date.now()
    };

    const updated = [created, ...puzzles];
    setPuzzles(updated);
    localStorage.setItem('galaxy_admin_puzzles_v2', JSON.stringify(updated));

    auditLogger.record({
      action: 'PUZZLE_CREATE',
      module: 'إدارة الألغاز والتحديات',
      description: `إضافة لغز جديد (${created.subject}): ${created.title}`,
      user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
      severity: 'info'
    });

    setNewPuzzle({
      title: '',
      subject: 'فيزياء',
      question: '',
      answer: '',
      hint: '',
      points: 10,
      difficulty: 'medium'
    });

    toast.success('تمت إضافة اللغز بنجاح إلى المنصة!');
  };

  const handleDeletePuzzle = (id: string) => {
    const updated = puzzles.filter((p) => p.id !== id);
    setPuzzles(updated);
    localStorage.setItem('galaxy_admin_puzzles_v2', JSON.stringify(updated));
    toast.success('تم حذف اللغز');
  };

  // Footer Save Handler
  const handleSaveFooterSettings = () => {
    platformSettings.updateSettings(settings);
    toast.success('تم حفظ وتحديث إعدادات الفوتر والمنصة فورياً!');
    auditLogger.record({
      action: 'FOOTER_EDIT',
      module: 'إدارة الفوتر والمعلومات',
      description: 'تحديث بيانات ونصوص الفوتر وروابط المنصة',
      user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
      severity: 'info'
    });
  };

  const handleAddFooterLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFooterLink.title || !newFooterLink.url) return;
    platformSettings.addFooterLink(newFooterLink);
    setSettings(platformSettings.getSettings());
    setNewFooterLink({ title: '', url: '', category: 'quick', badge: '' });
    toast.success('تمت إضافة الرابط السريع للفوتر');
  };

  // Support Reply Handler
  const handleAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !adminReplyText.trim()) return;

    liveSupportService.sendMessage(selectedSessionId, adminReplyText, 'admin', 'إدارة ذروة العلم');
    setAdminReplyText('');
    toast.success('تم إرسال الرد للمستخدم مباشرة');
  };

  // Navigation Items
  const navTabs: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'overview', label: 'الرؤية العامة والملخص الشامل', icon: Sparkles, badge: '360°' },
    { id: 'lcm', label: 'إدارة المحتوى والمناهج LCM', icon: BookOpen, badge: '32 مقرر' },
    { id: 'faculty', label: 'الكوادر والصلاحيات الأكاديمية', icon: GraduationCap, badge: '24' },
    { id: 'broadcasts', label: 'التعاميم والإعلانات المدرسية', icon: Megaphone, badge: 'بث' },
    { id: 'dashboard', label: 'المؤشرات الحية والقياس', icon: LayoutDashboard },
    { id: 'simulations', label: 'المحاكيات والتجارب (49)', icon: Atom, badge: '49' },
    { id: 'puzzles', label: 'إدارة الألغاز والتحديات', icon: HelpCircle, badge: `${puzzles.length}` },
    { id: 'users', label: 'المستخدمين والصلاحيات', icon: Users },
    { id: 'audit', label: 'سجل النشاط ("اعرف الإبرة")', icon: ShieldAlert, badge: `${auditLogs.length}` },
    { id: 'support', label: 'جلسات التواصل والدعم', icon: MessageSquare, badge: `${supportSessions.filter(s => s.unreadForAdmin).length || ''}` },
    { id: 'footer', label: 'محرر الفوتر ونهاية الصفحات', icon: Sliders },
    { id: 'questions', label: 'مولد الأسئلة الذكي 2.0', icon: BrainCircuit, badge: 'بلوم' },
    { id: 'copilot', label: 'مساعد تعديل المنصة الذكي', icon: Code2, badge: 'AI' },
  ];

  // Auth Guard Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              لوحة التحكم الإدارية الفائقة
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              يرجى إدخال رمز المرور الإداري (Master Passkey) أو تسجيل الدخول كمشرف عام
            </p>
          </div>

          <form onSubmit={handlePasskeySubmit} className="space-y-4">
            <div className="space-y-1 text-right">
              <Input
                type="password"
                value={passkeyInput}
                onChange={(e) => {
                  setPasskeyInput(e.target.value);
                  setPasskeyError(false);
                }}
                placeholder="أدخل رمز المرور الإداري..."
                className={`h-11 rounded-2xl text-center text-sm bg-slate-50 dark:bg-slate-800 ${
                  passkeyError ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-300 dark:border-slate-700'
                }`}
                autoFocus
              />
              {passkeyError && (
                <span className="text-[11px] text-rose-500 font-bold block text-center mt-1">
                  رمز المرور غير صحيح. (رمز المالك: mahmoud200)
                </span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/25"
            >
              الدخول إلى مركز التحكم الكامل 🚀
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <Link to="/" className="text-slate-500 hover:text-cyan-500 flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للرئيسية</span>
            </Link>
            <span className="text-[11px] text-slate-400 font-mono">ذروة العلم 2.0</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Filtered Audit Logs
  const filteredAudit = auditLogger.filter({
    query: auditQuery,
    action: auditActionFilter as any,
    severity: auditSeverityFilter as any
  });

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-[#060919] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300" dir="rtl">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/25">
              <Atom className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                لوحة الإدارة والتحكم الشاملة
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-400/20 mr-2 hidden sm:inline">
                Super Admin 2.0
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3" />
          <Input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="بحث فوري في كل أدوات التحكم..."
            className="h-9 pr-9 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-transparent focus:border-cyan-400"
          />
        </div>

        {/* Actions & Theme Toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link to="/">
            <Button variant="ghost" size="sm" className="rounded-xl text-xs gap-1 text-slate-600 dark:text-slate-300">
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">معاينة المنصة</span>
            </Button>
          </Link>

          <Button
            onClick={() => {
              sessionStorage.removeItem('galaxy_admin_authenticated');
              setIsAuthenticated(false);
              toast.info('تم قفل لوحة التحكم');
            }}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200 dark:border-rose-900/40"
          >
            قفل
          </Button>
        </div>
      </header>

      {/* Main Layout: Sidebar + Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Master Sidebar (RTL: right side) */}
        <aside
          className={`${
            sidebarOpen ? 'w-64 sm:w-72' : 'w-0 hidden lg:flex lg:w-20'
          } bg-white dark:bg-slate-900/95 border-l border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 overflow-y-auto`}
        >
          <div className="p-3 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {sidebarOpen ? 'أقسام الإدارة والتحكم' : '•••'}
            </div>

            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCurrentTab(tab.id);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-right ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-cyan-500'}`} />
                    {sidebarOpen && <span>{tab.label}</span>}
                  </div>

                  {sidebarOpen && tab.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Info */}
          {sidebarOpen && (
            <div className="p-4 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>حالة النظام: مثالي (100%)</span>
              </div>
              <p className="text-[10px] text-slate-500">
                الإصدار 2.0 • مدرسة عنبه الثانية
              </p>
            </div>
          )}
        </aside>

        {/* Main Workspace Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* 0. Executive 360° Overview & Platform Digest */}
            {currentTab === 'overview' && (
              <ExecutiveOverviewTab onNavigateTab={(tab) => setCurrentTab(tab as AdminTab)} />
            )}

            {/* 0.1 Advanced Learning Content Management (LCM) */}
            {currentTab === 'lcm' && (
              <LCMContentManager />
            )}

            {/* 0.2 Faculty & Academic Staff Management */}
            {currentTab === 'faculty' && (
              <FacultyStaffManager />
            )}

            {/* 0.3 School Broadcasts & Announcements */}
            {currentTab === 'broadcasts' && (
              <SchoolBroadcastsManager />
            )}

            {/* 1. Dashboard & Live Metrics Tab */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">لوحة القياس والمؤشرات الحية</h2>
                    <p className="text-xs text-slate-500">مراقبة أداء المنصة، معدل التفاعل، وحالة الخوادم بالثانية</p>
                  </div>
                  <Button
                    onClick={() => {
                      toast.success('تم تحديث القياسات الحية!');
                    }}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    تحديث
                  </Button>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>إجمالي المحاكيات 3D</span>
                      <Atom className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">49</div>
                    <span className="text-[11px] text-emerald-600 font-bold">100% تعمل بأعلى دقة</span>
                  </div>

                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>المستخدمين والطلاب</span>
                      <Users className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">1,420+</div>
                    <span className="text-[11px] text-purple-600 font-bold">+18% نمو أسبوعي</span>
                  </div>

                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>استعلامات الذكاء الاصطناعي</span>
                      <BrainCircuit className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">8,950</div>
                    <span className="text-[11px] text-amber-600 font-bold">متوسط الرد: 340ms</span>
                  </div>

                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>جاهزية الخوادم (Uptime)</span>
                      <Activity className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">99.98%</div>
                    <span className="text-[11px] text-emerald-600 font-bold">زمن الاستجابة: 24ms</span>
                  </div>
                </div>

                {/* Quick Controls Card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>إجراءات وتحكم سريع بالمنصة</span>
                  </h3>

                  <div className="flex flex-wrap gap-2.5">
                    <Button
                      onClick={() => {
                        toast.success('تم تنظيف الكاش وإعادة بناء الفهارس بنجاح');
                        auditLogger.record({
                          action: 'CONFIG_CHANGE',
                          module: 'Performance Cache',
                          description: 'تنظيف وإعادة بناء كاش المنصة من المشرف',
                          user: { id: 'admin-master', name: 'المشرف', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
                          severity: 'info'
                        });
                      }}
                      variant="outline"
                      className="rounded-2xl text-xs gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
                      تفريغ الكاش وإعادة الفهرسة
                    </Button>

                    <Button
                      onClick={() => {
                        const blob = new Blob([auditLogger.exportJSON()], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `zarwat-backup-${Date.now()}.json`;
                        a.click();
                        toast.success('تم تصدير نسخة احتياطية من سجلات وبيانات المنصة!');
                      }}
                      variant="outline"
                      className="rounded-2xl text-xs gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-500" />
                      تصدير نسخة احتياطية فورية (JSON)
                    </Button>

                    <Button
                      onClick={() => setCurrentTab('questions')}
                      className="rounded-2xl text-xs gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      توليد امتحان ذكي بمستوى بلوم
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Simulations Management Tab */}
            {currentTab === 'simulations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">إدارة 49 محاكاة وتجربة علمية 3D</h2>
                    <p className="text-xs text-slate-500">فهرس المحاكيات، تفعيل/تعطيل، ومتابعة التشغيل الحي</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'ميكانيكا الكم والدالة الموجية', link: '/quantum-mechanics', domain: 'فيزياء ذرية', status: 'نشط' },
                    { title: 'مسرع الهادرونات الكبير (LHC)', link: '/lhc-simulation', domain: 'فيزياء نووية', status: 'نشط' },
                    { title: 'تعديل الجينات كريسبر (CRISPR)', link: '/crispr-gene-editing', domain: 'أحياء وتقانة', status: 'نشط' },
                    { title: 'محاكاة الثقوب السوداء وأفق الحدث', link: '/black-hole', domain: 'فلك وفضاء', status: 'نشط' },
                    { title: 'الكيمياء الحركية وسرعة التفاعل', link: '/chemical-kinetics', domain: 'كيمياء', status: 'نشط' },
                    { title: 'بناء الذرة والجسيمات دون الذرية', link: '/build-atom', domain: 'كيمياء وفيزياء', status: 'نشط' },
                    { title: 'مختبر الدوائر الكهربائية الرقمية', link: '/circuit-builder', domain: 'كهرباء وإلكترونيات', status: 'نشط' },
                    { title: 'مترجم برايل ولغة الإشارة الذكي', link: '/damij', domain: 'تربية خاصة', status: 'نشط' },
                    { title: 'نفق الرياح والديناميكا الهوائية', link: '/aerodynamics-wind-tunnel', domain: 'ميكانيكا وهندسة', status: 'نشط' },
                  ].map((sim, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold">
                            {sim.domain}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                            {sim.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{sim.title}</h4>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <Link to={sim.link} target="_blank">
                          <Button size="sm" variant="ghost" className="text-xs text-cyan-600 dark:text-cyan-400 gap-1 p-0 h-auto">
                            <Play className="w-3 h-3 fill-current" />
                            تشغيل واختبار
                          </Button>
                        </Link>
                        <span className="text-[10px] text-slate-400">جاهزية 100%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Puzzles Management Tab */}
            {currentTab === 'puzzles' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">إدارة الألغاز والتحديات بالكامل</h2>
                    <p className="text-xs text-slate-500">إضافة ألغاز جديدة، تعديل النقاط، ومراجعة بنك التحديات</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Form to Add New Puzzle */}
                  <form onSubmit={handleAddPuzzle} className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-cyan-500" />
                      <span>إضافة لغز علمي جديد</span>
                    </h3>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">عنوان اللغز:</label>
                      <Input
                        value={newPuzzle.title}
                        onChange={(e) => setNewPuzzle({ ...newPuzzle, title: e.target.value })}
                        placeholder="مثال: لغز قانون الحث الكهرومغناطيسي"
                        className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">المادة:</label>
                        <select
                          value={newPuzzle.subject}
                          onChange={(e) => setNewPuzzle({ ...newPuzzle, subject: e.target.value })}
                          className="w-full text-xs h-9 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                        >
                          <option value="فيزياء">فيزياء</option>
                          <option value="كيمياء">كيمياء</option>
                          <option value="أحياء">أحياء</option>
                          <option value="رياضيات">رياضيات</option>
                          <option value="ذكاء ومنطق">ذكاء ومنطق</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الصعوبة:</label>
                        <select
                          value={newPuzzle.difficulty}
                          onChange={(e) => setNewPuzzle({ ...newPuzzle, difficulty: e.target.value as any })}
                          className="w-full text-xs h-9 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                        >
                          <option value="easy">سهل</option>
                          <option value="medium">متوسط</option>
                          <option value="hard">صعب</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">النقاط:</label>
                        <Input
                          type="number"
                          value={newPuzzle.points}
                          onChange={(e) => setNewPuzzle({ ...newPuzzle, points: parseInt(e.target.value) || 5 })}
                          className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">نص اللغز أو السؤال:</label>
                      <Textarea
                        value={newPuzzle.question}
                        onChange={(e) => setNewPuzzle({ ...newPuzzle, question: e.target.value })}
                        placeholder="اكتب السؤال بالتفصيل..."
                        className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 min-h-[70px]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الإجابة النموذجية:</label>
                      <Input
                        value={newPuzzle.answer}
                        onChange={(e) => setNewPuzzle({ ...newPuzzle, answer: e.target.value })}
                        placeholder="الإجابة الصحيحة المقبولة"
                        className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">تلميح (اختياري):</label>
                      <Input
                        value={newPuzzle.hint}
                        onChange={(e) => setNewPuzzle({ ...newPuzzle, hint: e.target.value })}
                        placeholder="تلميح لمساعدة الطالب"
                        className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-10 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5 ml-1" />
                      إضافة اللغز لبنك التحديات
                    </Button>
                  </form>

                  {/* List of Puzzles */}
                  <div className="lg:col-span-7 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">الألغاز النشطة ({puzzles.length})</h3>
                    {puzzles.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 font-bold">
                              {p.subject}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">
                              {p.points} نقاط
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{p.title}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{p.question}</p>
                          <div className="text-[11px] text-emerald-600 font-bold">الإجابة: {p.answer}</div>
                        </div>

                        <Button
                          onClick={() => handleDeletePuzzle(p.id)}
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-rose-500 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Users & Roles Management Tab */}
            {currentTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">إدارة المستخدمين والصلاحيات</h2>
                    <p className="text-xs text-slate-500">التحكم في أدوار المشرفين والمعلمين وحصص الذكاء الاصطناعي</p>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <th className="pb-3 pr-2">المستخدم</th>
                        <th className="pb-3">البريد الإلكتروني</th>
                        <th className="pb-3">الدور الحالي</th>
                        <th className="pb-3">حصة الذكاء الاصطناعي اليومية</th>
                        <th className="pb-3">الصلاحيات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        { name: 'محمود (المشرف العام)', email: 'jowmahmoud6@gmail.com', role: 'Super Admin', quota: 'غير محدود (Full)', perms: 'كافة الصلاحيات المطلقة' },
                        { name: 'أ. عمر الشناوي', email: 'omar.chem@school.jo', role: 'Teacher', quota: '50 استعلام/يوم', perms: 'إعداد وتصدير الامتحانات' },
                        { name: 'أحمد التميمي', email: 'ahmad.t@school.jo', role: 'Student', quota: '25 استعلام/يوم', perms: 'حل الألغاز والمحاكاة' },
                        { name: 'المعلمة رانية حداد', email: 'rania.haddad@edu.jo', role: 'Teacher', quota: '50 استعلام/يوم', perms: 'إدارة الصفوف الافتراضية' },
                      ].map((u, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3.5 pr-2 font-bold text-slate-900 dark:text-white">{u.name}</td>
                          <td className="py-3.5 font-mono text-slate-500" dir="ltr">{u.email}</td>
                          <td className="py-3.5">
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-400/20">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 font-bold text-emerald-600">{u.quota}</td>
                          <td className="py-3.5 text-slate-500">{u.perms}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. Ultra-Granular Audit Trail Tab ("اعرف الإبرة من رماها") */}
            {currentTab === 'audit' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">سجل النشاط الفائق الدقة والأمان</h2>
                    <p className="text-xs text-slate-500">"اعرف الإبرة من رماها" — رصد كل حركة وتعديل بالثانية مع تفاصيل الفروقات (Diffs)</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        const csv = auditLogger.exportCSV();
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `audit-trail-${Date.now()}.csv`;
                        a.click();
                        toast.success('تم تصدير سجل النشاط (CSV)');
                      }}
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-500" />
                      تصدير CSV
                    </Button>
                  </div>
                </div>

                {/* Filters Bar */}
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={auditQuery}
                      onChange={(e) => setAuditQuery(e.target.value)}
                      placeholder="ابحث بالمستخدم، الإجراء، الـ IP، أو القسم..."
                      className="h-9 pr-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <select
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  >
                    <option value="all">كافة العمليات</option>
                    <option value="CONFIG_CHANGE">تغيير إعدادات</option>
                    <option value="AI_QUERY">استعلام ذكاء اصطناعي</option>
                    <option value="SIMULATION_RUN">تشغيل محاكاة</option>
                    <option value="PUZZLE_CREATE">إنشاء لغز</option>
                    <option value="PERMISSION_CHANGE">تعديل صلاحيات</option>
                  </select>

                  <select
                    value={auditSeverityFilter}
                    onChange={(e) => setAuditSeverityFilter(e.target.value)}
                    className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  >
                    <option value="all">كافة مستويات الخطورة</option>
                    <option value="info">معلومات (Info)</option>
                    <option value="warning">تحذير (Warning)</option>
                    <option value="critical">حرج (Critical)</option>
                  </select>
                </div>

                {/* Audit Table Feed */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto space-y-3">
                  {filteredAudit.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            log.severity === 'critical'
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-400/20'
                              : log.severity === 'warning'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-400/20'
                              : 'bg-cyan-500/10 text-cyan-600 border border-cyan-400/20'
                          }`}>
                            {log.action}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{log.module}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{log.user.name} ({log.user.role})</span>
                          <span className="font-mono text-[10px] text-slate-400">IP: {log.client.ipApprox}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">{log.description}</p>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  ))}

                  {filteredAudit.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      لا توجد سجلات نشاط مطابقة للبحث.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. Support & Live Communication Sessions Tab */}
            {currentTab === 'support' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">جلسات التواصل ورسائل المستخدمين الحية</h2>
                    <p className="text-xs text-slate-500">استقبال استفسارات الطلاب والتواصل الفوري معهم</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Sessions List */}
                  <div className="lg:col-span-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">الجلسات الواردة ({supportSessions.length})</h3>
                    {supportSessions.map((sess) => {
                      const isSelected = selectedSessionId === sess.id;
                      return (
                        <div
                          key={sess.id}
                          onClick={() => {
                            setSelectedSessionId(sess.id);
                            liveSupportService.markAsRead(sess.id, 'admin');
                          }}
                          className={`p-4 rounded-3xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-400 shadow-md'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{sess.userName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              sess.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {sess.status === 'resolved' ? 'مكتملة' : 'قيد الانتظار'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{sess.topic}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                            <span>{sess.userEmail}</span>
                            <span>{new Date(sess.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Session Chat Room */}
                  <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col min-h-[460px]">
                    {selectedSessionId ? (
                      (() => {
                        const active = supportSessions.find((s) => s.id === selectedSessionId);
                        if (!active) return null;

                        return (
                          <div className="flex-1 flex flex-col justify-between">
                            {/* Session Header */}
                            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{active.userName}</h4>
                                <p className="text-xs text-slate-500">{active.topic}</p>
                              </div>
                              <Button
                                onClick={() => {
                                  liveSupportService.updateStatus(active.id, active.status === 'resolved' ? 'open' : 'resolved');
                                  toast.success('تم تحديث حالة الجلسة');
                                }}
                                variant="outline"
                                size="sm"
                                className="text-xs rounded-xl"
                              >
                                {active.status === 'resolved' ? 'إعادة الفتح' : 'تحديد كمكتمل ✓'}
                              </Button>
                            </div>

                            {/* Messages Feed */}
                            <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[300px]">
                              {active.messages.map((m) => {
                                const isAdmin = m.sender === 'admin';
                                return (
                                  <div key={m.id} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                                    <div className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                                      isAdmin ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 rounded-tl-none'
                                    }`}>
                                      <div className="text-[10px] font-bold opacity-75 mb-0.5">{m.senderName}</div>
                                      <p>{m.text}</p>
                                    </div>
                                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Reply Input */}
                            <form onSubmit={handleAdminReply} className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                              <Input
                                value={adminReplyText}
                                onChange={(e) => setAdminReplyText(e.target.value)}
                                placeholder="اكتب ردك المباشر للمستخدم..."
                                className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                              />
                              <Button type="submit" className="h-10 px-4 rounded-xl bg-teal-600 text-white">
                                <Send className="w-4 h-4 ml-1" />
                                إرسال
                              </Button>
                            </form>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                        <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                        <p className="text-xs">اختر جلسة من القائمة للتواصل المباشر مع المستخدم</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 7. Footer & Platform Settings Editor Tab */}
            {currentTab === 'footer' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">محرر الفوتر ونهاية الصفحات ومعلومات المنصة</h2>
                    <p className="text-xs text-slate-500">تعديل نصوص التذييل، المدرسة المنشئة، الروابط السريعة، وبيانات التواصل فورياً</p>
                  </div>
                  <Button onClick={handleSaveFooterSettings} className="rounded-xl text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                    <Save className="w-3.5 h-3.5" />
                    حفظ التغييرات ونشرها
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* General Metadata */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">النصوص الرئيسية للمنصة والتذييل</h3>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم المنصة:</label>
                      <Input
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الوصف العام (Tagline):</label>
                      <Input
                        value={settings.tagline}
                        onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                        className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">المؤسسة / المدرسة المنشئة للمنصة:</label>
                      <Input
                        value={settings.schoolAttribution}
                        onChange={(e) => setSettings({ ...settings, schoolAttribution: e.target.value })}
                        className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">فريق التطوير والبرمجة:</label>
                      <Input
                        value={settings.developedBy}
                        onChange={(e) => setSettings({ ...settings, developedBy: e.target.value })}
                        className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">البريد الإلكتروني:</label>
                        <Input
                          value={settings.contactEmail}
                          onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                          className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الهاتف:</label>
                        <Input
                          value={settings.contactPhone}
                          onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                          className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">العنوان الجغرافي:</label>
                      <Input
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  {/* Footer Links Manager */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">إدارة الروابط السريعة</h3>

                    {/* Add Link Subform */}
                    <form onSubmit={handleAddFooterLink} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={newFooterLink.title}
                          onChange={(e) => setNewFooterLink({ ...newFooterLink, title: e.target.value })}
                          placeholder="عنوان الرابط..."
                          className="text-xs h-8 rounded-xl bg-white dark:bg-slate-900"
                          required
                        />
                        <Input
                          value={newFooterLink.url}
                          onChange={(e) => setNewFooterLink({ ...newFooterLink, url: e.target.value })}
                          placeholder="/مسار_الرابط"
                          className="text-xs h-8 rounded-xl bg-white dark:bg-slate-900"
                          required
                        />
                      </div>
                      <Button type="submit" size="sm" className="w-full h-8 text-xs bg-cyan-600 text-white font-bold rounded-xl">
                        إضافة الرابط للفوتر
                      </Button>
                    </form>

                    {/* Existing Links List */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {settings.footerLinks.map((l) => (
                        <div key={l.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{l.title}</span>
                            <span className="text-[10px] text-slate-400 mr-2 font-mono" dir="ltr">{l.url}</span>
                          </div>
                          <button
                            onClick={() => {
                              platformSettings.removeFooterLink(l.id);
                              setSettings(platformSettings.getSettings());
                              toast.info('تم حذف الرابط');
                            }}
                            className="text-rose-500 hover:text-rose-600 p-1"
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

            {/* 8. Quantum Question Generator 2.0 Tab */}
            {currentTab === 'questions' && (
              <QuantumQuestionGenerator />
            )}

            {/* 9. AI Platform Copilot Tab */}
            {currentTab === 'copilot' && (
              <PlatformCopilotWindow />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminControlHub;
