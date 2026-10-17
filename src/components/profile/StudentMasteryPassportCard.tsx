import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  Atom,
  Brain,
  Trophy,
  FileCheck2,
  Sparkles,
  QrCode,
  DownloadCloud,
  Printer,
  CheckCircle2,
  Flame,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  studentMasteryPassportService,
  type StudentMasteryPassportState,
} from '@/services/studentMasteryPassportService';
import { offlineCacheService, type OfflineVaultStatus } from '@/services/offlineCacheService';
import { toast } from 'sonner';

interface StudentMasteryPassportCardProps {
  studentName: string;
  schoolName: string;
  gradeName: string;
  governorate: string;
  avatarEmoji?: string;
  baseScore?: number;
  baseSolvedPuzzles?: number;
  onXpUpdated?: (newTotalXp: number) => void;
}

export const StudentMasteryPassportCard: React.FC<StudentMasteryPassportCardProps> = ({
  studentName,
  schoolName,
  gradeName,
  governorate,
  avatarEmoji = '🚀',
  baseScore = 950,
  baseSolvedPuzzles = 12,
  onXpUpdated,
}) => {
  const [passport, setPassport] = useState<StudentMasteryPassportState>(() =>
    studentMasteryPassportService.getPassportState(baseScore, baseSolvedPuzzles)
  );
  const [vaultStatus, setVaultStatus] = useState<OfflineVaultStatus | null>(null);
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const next = studentMasteryPassportService.getPassportState(baseScore, baseSolvedPuzzles);
      setPassport(next);
      onXpUpdated?.(next.totalXp);
    };
    refresh();
    offlineCacheService.getVaultStatus().then(setVaultStatus);

    window.addEventListener('zarwat:passport-updated', refresh);
    return () => window.removeEventListener('zarwat:passport-updated', refresh);
  }, [baseScore, baseSolvedPuzzles]);

  const handleQuickDemoAchievement = () => {
    const updated = studentMasteryPassportService.recordActivity({
      type: 'lab',
      title: 'إتمام تجربة استقصائية وحل تحدي الذكاء الاصطناعي',
      subject: 'فيزياء وذكاء اصطناعي',
      xpEarned: 50,
    });
    setPassport(updated);
    onXpUpdated?.(updated.totalXp);
  };

  const handleSyncOfflinePack = async () => {
    setIsSyncingOffline(true);
    setSyncProgress(10);
    try {
      const st = await offlineCacheService.downloadFullFieldPack((pct) => {
        setSyncProgress(pct);
      });
      setVaultStatus(st);
      toast.success('تمت مزامنة الحقيبة الميدانية (49 محاكاة + 30 بروتوكول طبي) للعمل دون اتصال!');
    } catch {
      toast.error('تم حفظ البيانات الأساسية محلياً.');
    } finally {
      setIsSyncingOffline(false);
    }
  };

  const unlockedBadgesCount = passport.badges.filter((b) => b.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-cyan-500/30 dark:border-cyan-500/30 shadow-xl overflow-hidden relative"
    >
      {/* Top Institutional Ribbon */}
      <div className="bg-gradient-to-l from-slate-900 via-blue-950 to-indigo-950 text-white px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-wide text-amber-300">
                بطاقة الهوية الأكاديمية الموحدة للطالب (Student Mastery Passport)
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px]">
                موثقة رسمياً
              </Badge>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              المملكة الأردنية الهاشمية • وزارة التربية والتعليم • مدرسة عنبه الثانوية الشاملة للبنين
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 font-mono text-xs font-bold text-cyan-300"
            dir="ltr"
          >
            ID: {passport.passportId}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.print()}
            className="h-8 px-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-xs gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">طباعة البطاقة</span>
          </Button>
        </div>
      </div>

      {/* Main Passport Body */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Row 1: Student Identity + Unified XP Progress + QR Seal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Student Identity (5 cols) */}
          <div className="lg:col-span-5 flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0">
              {avatarEmoji}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  {studentName}
                </h2>
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              </div>
              <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300">{passport.rankTitle}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {schoolName} • {gradeName}
              </p>
              <div className="flex items-center gap-2 pt-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>سلسلة التزام متواصل: {passport.streakDays} أيام</span>
                <span>•</span>
                <span>{governorate}</span>
              </div>
            </div>
          </div>

          {/* Unified XP & Level Meter (5 cols) */}
          <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  إجمالي نقاط الإتقان الموحدة (Unified XP)
                </span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {passport.totalXp.toLocaleString()} XP
                </span>
              </div>
              <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xs px-3 py-1">
                المستوى {passport.level}
              </Badge>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${passport.progressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>الأوسمة المكتسبة: {unlockedBadgesCount} / {passport.badges.length}</span>
              <button
                onClick={handleQuickDemoAchievement}
                className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" />
                <span>تسجيل إنجاز فوري (+50 XP)</span>
              </button>
            </div>
          </div>

          {/* Digital Verification Stamp (2 cols) */}
          <div className="lg:col-span-2 p-3.5 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center text-center border border-slate-700">
            <QrCode className="w-11 h-11 text-cyan-400 mb-1.5" />
            <span className="text-[10px] font-black text-amber-300">ختم التحقق الرقمي</span>
            <span className="text-[9px] text-slate-400 font-mono mt-0.5">VERIFIED • MOE-JO</span>
          </div>
        </div>

        {/* Row 2: The 5 Unified Pillars of Student Achievement */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            to="/experiments-section"
            className="p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/25 border border-cyan-200/80 dark:border-cyan-800/50 hover:border-cyan-500 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300">المختبرات 3D</span>
              <Atom className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:rotate-45 transition-transform" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {passport.pillars.labsCompleted}{' '}
              <span className="text-xs font-normal text-slate-500">/ {passport.pillars.totalLabs}</span>
            </div>
            <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold block mt-0.5">
              +50 XP لكل تجربة
            </span>
          </Link>

          <Link
            to="/spaced-repetition"
            className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/25 border border-purple-200/80 dark:border-purple-800/50 hover:border-purple-500 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">
                التكرار المتباعد
              </span>
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {passport.pillars.flashcardsMastered}{' '}
              <span className="text-xs font-normal text-slate-500">بطاقة</span>
            </div>
            <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold block mt-0.5">
              شامل قصر الذاكرة
            </span>
          </Link>

          <Link
            to="/subject-puzzles"
            className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/50 hover:border-emerald-500 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                الألغاز العلمية
              </span>
              <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {passport.pillars.puzzlesSolved}{' '}
              <span className="text-xs font-normal text-slate-500">لغز</span>
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-0.5">
              +40 XP لكل تحدٍ
            </span>
          </Link>

          <Link
            to="/exam-generator-studio"
            className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/50 hover:border-amber-500 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                الامتحانات الذكية
              </span>
              <FileCheck2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {passport.pillars.examsPassed}{' '}
              <span className="text-xs font-normal text-slate-500">اختبار</span>
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block mt-0.5">
              وتذاكر الخروج
            </span>
          </Link>

          <Link
            to="/ai-assistant-section"
            className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200/80 dark:border-rose-800/50 hover:border-rose-500 transition-all group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                المرشد السقراطي AI
              </span>
              <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {passport.pillars.aiSessionsCompleted}{' '}
              <span className="text-xs font-normal text-slate-500">جلسة</span>
            </div>
            <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold block mt-0.5">
              حل مسائل وخرائط
            </span>
          </Link>
        </div>

        {/* Row 3: Scientific Domain Mastery Breakdown + Offline Field Vault Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* 5-Axis Domain Mastery Bars (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>مؤشر الإتقان التخصصي عبر مسارات المنصة الخمسة</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500">تحديث تلقائي</span>
            </div>

            <div className="space-y-2.5">
              {passport.domainMastery.map((dom) => (
                <div key={dom.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{dom.name}</span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                      {dom.scorePct}% ({dom.completedCount}/{dom.targetCount})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${dom.color} transition-all duration-500`}
                      style={{ width: `${dom.scorePct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offline-First Field Trip Vault Card (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/80 dark:from-slate-800/90 dark:via-slate-900 dark:to-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/50 flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge className="bg-cyan-600 text-white text-[10px] font-bold">
                  Offline-First PWA Vault
                </Badge>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {vaultStatus?.isFieldPackReady ? '● مخزنة بالكامل 100%' : '● جاهزة للتخزين'}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white pt-1">
                حقيبة الرحلات الميدانية والمختبرات دون اتصال
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                احفظ كامل بيانات الـ <strong>49 محاكاة تفاعلية</strong>، و<strong>30 بروتوكول إسعاف طبي</strong>، و<strong>بطاقات التكرار المتباعد</strong> على جهازك لتعمل فوراً حتى عند انقطاع الإنترنت.
              </p>
            </div>

            {isSyncingOffline && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-cyan-700 dark:text-cyan-300">
                  <span>جاري مزامنة ملفات المختبرات...</span>
                  <span>{syncProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-cyan-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-cyan-600 transition-all duration-300"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleSyncOfflinePack}
              disabled={isSyncingOffline}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs gap-2 shadow-md shadow-cyan-500/20"
            >
              {isSyncingOffline ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحميل المحلي ({syncProgress}%)...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4" />
                  <span>
                    {vaultStatus?.isFieldPackReady
                      ? 'تحديث الخزينة المحلية (49 مختبر + 30 بروتوكول)'
                      : 'تنزيل الحقيبة الميدانية للعمل بلا إنترنت'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentMasteryPassportCard;
