import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Wifi,
  WifiOff,
  DownloadCloud,
  CheckCircle2,
  ShieldCheck,
  Database,
  Sparkles,
  Loader2,
  Atom,
  Stethoscope,
  Brain,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { offlineCacheService, type OfflineVaultStatus } from '@/services/offlineCacheService';
import { toast } from 'sonner';

/**
 * Centralized Sovereign Design System Tokens (Light-First & Dark-Adaptive)
 * Ensures 100% visual consistency across all platform pages and components.
 */
export const SOVEREIGN_TOKENS = {
  pageWrapper:
    'min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#060818] text-slate-900 dark:text-white font-sans transition-colors duration-300 relative overflow-x-hidden',
  card:
    'rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm dark:shadow-xl backdrop-blur-xl transition-all duration-300',
  cardInteractive:
    'rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-cyan-500/40 dark:hover:border-cyan-400/40 transition-all duration-300',
  subCard:
    'rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 transition-all',
  headerBar:
    'border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl',
  headingText: 'text-slate-900 dark:text-white font-black tracking-tight',
  bodyText: 'text-slate-600 dark:text-slate-300 leading-relaxed',
  mutedText: 'text-slate-500 dark:text-slate-400',
  input:
    'bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-cyan-500/40 rounded-xl',
  primaryButton:
    'rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-md shadow-cyan-500/20 transition-all',
  secondaryButton:
    'rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-all',
} as const;

export interface SovereignStatItem {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  accent?: string;
}

export interface SovereignPageLayoutProps {
  title: string;
  subtitle?: string;
  pageTitle?: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'indigo';
  backTo?: string;
  backLabel?: string;
  headerActions?: React.ReactNode;
  stats?: SovereignStatItem[];
  hideHeroHeader?: boolean;
  maxWidth?: 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl' | 'max-w-[1440px]';
  children: React.ReactNode;
}

const ACCENT_STYLES = {
  cyan: {
    badge:
      'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
    glow: 'from-cyan-500/10 via-blue-500/5 to-transparent',
    iconBg: 'from-cyan-600 to-blue-600 shadow-cyan-500/25',
  },
  emerald: {
    badge:
      'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    glow: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    iconBg: 'from-emerald-600 to-teal-600 shadow-emerald-500/25',
  },
  amber: {
    badge:
      'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    glow: 'from-amber-500/10 via-orange-500/5 to-transparent',
    iconBg: 'from-amber-500 to-orange-600 shadow-amber-500/25',
  },
  rose: {
    badge:
      'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
    glow: 'from-rose-500/10 via-red-500/5 to-transparent',
    iconBg: 'from-rose-600 to-red-600 shadow-rose-500/25',
  },
  purple: {
    badge:
      'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
    glow: 'from-purple-500/10 via-indigo-500/5 to-transparent',
    iconBg: 'from-purple-600 to-indigo-600 shadow-purple-500/25',
  },
  indigo: {
    badge:
      'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
    glow: 'from-indigo-500/10 via-blue-500/5 to-transparent',
    iconBg: 'from-indigo-600 to-blue-600 shadow-indigo-500/25',
  },
};

export const SovereignPageLayout: React.FC<SovereignPageLayoutProps> = ({
  title,
  subtitle,
  pageTitle,
  badge = 'منظومة ذروة العلم 2.0 • مدرسة عنبه الثانوية الشاملة للبنين',
  badgeIcon,
  accentColor = 'cyan',
  backTo = '/',
  backLabel = 'العودة للرئيسية',
  headerActions,
  stats,
  hideHeroHeader = false,
  maxWidth = 'max-w-7xl',
  children,
}) => {
  const navigate = useNavigate();
  const accent = ACCENT_STYLES[accentColor] || ACCENT_STYLES.cyan;

  const [vaultStatus, setVaultStatus] = useState<OfflineVaultStatus | null>(null);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isDownloadingPack, setIsDownloadingPack] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadLabel, setDownloadLabel] = useState('');

  useEffect(() => {
    let mounted = true;
    offlineCacheService.initializeOfflineVault().then((st) => {
      if (mounted) setVaultStatus(st);
    });

    const handleOnlineChange = () => {
      offlineCacheService.getVaultStatus().then((st) => {
        if (mounted) setVaultStatus(st);
      });
    };

    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);
    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
    };
  }, []);

  const handleDownloadFieldPack = async () => {
    setIsDownloadingPack(true);
    setDownloadProgress(5);
    try {
      const updated = await offlineCacheService.downloadFullFieldPack((pct, label) => {
        setDownloadProgress(pct);
        setDownloadLabel(label);
      });
      setVaultStatus(updated);
      toast.success('تم تجهيز الحقيبة الميدانية للعمل دون اتصال بالإنترنت بنجاح! 📦⚡');
    } catch {
      toast.error('تعذر استكمال بعض الملفات، تم حفظ القواعد الأساسية محلياً.');
    } finally {
      setIsDownloadingPack(false);
    }
  };

  return (
    <div dir="rtl" className={SOVEREIGN_TOKENS.pageWrapper}>
      <Helmet>
        <title>{pageTitle || `${title} | منصة ذروة العلم`}</title>
      </Helmet>

      {/* Subtle Institutional Grid & Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.025)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div
          className={`absolute -top-24 right-1/4 w-[520px] h-[520px] bg-gradient-to-br ${accent.glow} rounded-full blur-3xl`}
        />
      </div>

      <Navbar />

      <main className={`flex-1 w-full ${maxWidth} mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10 space-y-6`}>
        {/* Institutional Sovereign Header */}
        {!hideHeroHeader && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${SOVEREIGN_TOKENS.card} p-5 sm:p-7 relative overflow-hidden`}
          >
            <div
              className={`absolute top-0 left-0 w-72 h-72 bg-gradient-to-tr ${accent.glow} rounded-full blur-2xl pointer-events-none`}
            />

            {/* Top Utility Row: Back Button + Offline Vault Status Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(backTo)}
                  className="h-9 px-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{backLabel}</span>
                </Button>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${accent.badge}`}
                >
                  {badgeIcon || <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{badge}</span>
                </span>
              </div>

              {/* Offline-First PWA Status Badge */}
              <button
                onClick={() => setIsOfflineModalOpen(true)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  vaultStatus?.isOnline === false
                    ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                    : vaultStatus?.isFieldPackReady
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                }`}
                title="إدارة خزينة العمل دون اتصال (Offline-First PWA Vault)"
              >
                {vaultStatus?.isOnline === false ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>وضع عدم الاتصال نشط (الخزينة المحلية جاهزة)</span>
                  </>
                ) : vaultStatus?.isFieldPackReady ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>الحقيبة الميدانية جاهزة بلا إنترنت (49 محاكاة)</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>تفعيل العمل دون اتصال (Offline PWA)</span>
                  </>
                )}
              </button>
            </div>

            {/* Title, Subtitle & Custom Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed font-medium">
                    {subtitle}
                  </p>
                )}
              </div>

              {headerActions && (
                <div className="flex flex-wrap items-center gap-2 shrink-0">{headerActions}</div>
              )}
            </div>

            {/* Optional Quick Stats Row */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
                {stats.map((st, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                        {st.label}
                      </span>
                      <span
                        className={`text-lg sm:text-xl font-black ${
                          st.accent || 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {st.value}
                      </span>
                      {st.sublabel && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">{st.sublabel}</span>
                      )}
                    </div>
                    {st.icon && (
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
                        {st.icon}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* Page Body */}
        {children}
      </main>

      {/* Offline-First PWA & IndexedDB Field Pack Modal */}
      <Dialog open={isOfflineModalOpen} onOpenChange={setIsOfflineModalOpen}>
        <DialogContent
          className="max-w-lg rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right font-sans"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>خزينة العمل الميداني دون اتصال (Offline-First PWA Vault)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              تتيح هذه المنظومة تشغيل المختبرات الافتراضية، وبروتوكولات الإسعاف المدرسي، وبطاقات التكرار المتباعد في الرحلات الميدانية أو داخل الغرف الصفية حتى عند انقطاع الإنترنت تماماً.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            {/* Connection Status Banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                vaultStatus?.isOnline
                  ? 'bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {vaultStatus?.isOnline ? (
                  <Wifi className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                )}
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {vaultStatus?.isOnline
                      ? 'متصل بالشبكة حالياً • المزامنة التلقائية نشطة'
                      : 'أنت تعمل الآن في وضع عدم الاتصال (Offline Mode)'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    آخر مزامنة للخزينة المحلية: {vaultStatus?.lastSyncedAt || 'الآن'}
                  </span>
                </div>
              </div>
              <Badge className="bg-cyan-600 text-white text-[10px]">IndexedDB + SW</Badge>
            </div>

            {/* 3 Vault Stores Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <Atom className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mx-auto mb-1" />
                <span className="text-lg font-black text-slate-900 dark:text-white block">
                  {vaultStatus?.simulationsCount ?? 49}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  مختبر ومحاكاة 3D
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <Stethoscope className="w-5 h-5 text-rose-600 dark:text-rose-400 mx-auto mb-1" />
                <span className="text-lg font-black text-slate-900 dark:text-white block">
                  {vaultStatus?.medicalProtocolsCount ?? 30}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  بروتوكول إسعاف طارئ
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                <span className="text-lg font-black text-slate-900 dark:text-white block">
                  {vaultStatus?.flashcardsCount ?? 15}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  بطاقة تكرار متباعد
                </span>
              </div>
            </div>

            {/* Progress Bar when downloading */}
            {isDownloadingPack && (
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-800 dark:text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {downloadLabel}
                  </span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-cyan-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <Button
                onClick={handleDownloadFieldPack}
                disabled={isDownloadingPack}
                className={`flex-1 h-11 ${SOVEREIGN_TOKENS.primaryButton} text-xs gap-2`}
              >
                {isDownloadingPack ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحميل المحلي...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4" />
                    <span>
                      {vaultStatus?.isFieldPackReady
                        ? 'تحديث الحقيبة الميدانية الكاملة (مخزنة 100%)'
                        : 'تحميل الحقيبة الميدانية الكاملة للعمل بلا إنترنت'}
                    </span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsOfflineModalOpen(false)}
                className="h-11 px-4 rounded-2xl text-xs font-bold border-slate-300 dark:border-slate-700"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SovereignPageLayout;
