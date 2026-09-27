import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  RefreshCw, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  X, 
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Atom,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  getPlatformLiveSnapshot, 
  syncPlatformLiveDocumentation, 
  downloadComprehensivePlatformDossierPDF, 
  openPrintablePlatformDossierWindow,
  PlatformLiveSnapshot 
} from '@/services/platformDocsExportService';

export const DocsExportSyncToolbar: React.FC = () => {
  const [snapshot, setSnapshot] = useState<PlatformLiveSnapshot>(() => getPlatformLiveSnapshot());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(() => {
    try {
      return new URLSearchParams(window.location.search).get('export') === 'pdf';
    } catch {
      return false;
    }
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStatus, setGenerationStatus] = useState<string>('');

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<PlatformLiveSnapshot>;
      if (customEvent.detail) {
        setSnapshot(customEvent.detail);
      } else {
        setSnapshot(getPlatformLiveSnapshot());
      }
    };

    window.addEventListener('galaxy_docs_synced', handleSync);
    window.addEventListener('storage', () => setSnapshot(getPlatformLiveSnapshot()));

    return () => {
      window.removeEventListener('galaxy_docs_synced', handleSync);
    };
  }, []);

  // Handle Live Platform Data Refresh
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const res = syncPlatformLiveDocumentation();
      setSnapshot(res.snapshot);
      setIsSyncing(false);
      toast.success(
        `تمت مزامنة بيانات التوثيق بنجاح! تم شمل ${res.snapshot.totalSources} مصدر، ${res.snapshot.totalSimulations} محاكاة، و${res.snapshot.totalAITools} أداة ذكاء اصطناعي وأحدث إعدادات المنصة تلقائياً في ملف الـ PDF.`
      );
    }, 600);
  };

  // Handle PDF Generation
  const handleStartPdfDownload = async (mode: 'full' | 'executive' | 'sources_only') => {
    setIsGeneratingPdf(true);
    setGenerationProgress(5);
    setGenerationStatus('بدء تجميع البيانات والمصادر...');

    try {
      await downloadComprehensivePlatformDossierPDF(mode, (prog, text) => {
        setGenerationProgress(prog);
        setGenerationStatus(text);
      });

      toast.success('تم تحميل ملف PDF الموسوعي بنجاح إلى جهازك!');
      setTimeout(() => {
        setIsGeneratingPdf(false);
        setIsExportModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء توليد ملف الـ PDF. يمكنك استخدام خيار "طباعة / حفظ كـ PDF" المباشر.');
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      {/* Corner Action Hub (Header / Hero Bar) */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Live Sync Status Indicator Pill */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>متزامن لحظياً ({snapshot.totalSources} مصدر • {snapshot.totalSimulations} محاكاة)</span>
        </div>

        {/* Sync / Refresh Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="text-xs rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold gap-1.5 shadow-sm"
          title="تحديث ومزامنة التوثيق مع أحدث محتويات المنصة وإعداداتها"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'جاري المزامنة...' : 'تحديث البيانات 🔄'}</span>
        </Button>

        {/* Download Comprehensive PDF Button */}
        <Button
          size="sm"
          onClick={() => setIsExportModalOpen(true)}
          className="text-xs rounded-xl font-bold gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 px-4 h-9"
        >
          <Download className="w-4 h-4 ml-0.5 animate-bounce" />
          <span>تنزيل جميع المعلومات (PDF) 📄</span>
        </Button>
      </div>

      {/* Comprehensive PDF Export Studio Modal */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 15 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden relative"
            >
              {/* Close Button */}
              <button
                onClick={() => !isGeneratingPdf && setIsExportModalOpen(false)}
                disabled={isGeneratingPdf}
                className="absolute top-5 left-5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1.5 text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-cyan-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>مركز تصدير الملف التوثيقي الموسوعي الشامل</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  تنزيل وثيقة المنصة والمصادر والمراجع كاملة (PDF)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  تتضمن هذه الوثيقة التفصيلية كافة المعلومات الهندسية، قائمة الـ {snapshot.totalSources}+ مصدر ومراجع معتمدة، قوانين المحاكيات الـ {snapshot.totalSimulations}، ونماذج الذكاء الاصطناعي الـ {snapshot.totalAITools} محدثة لحظياً مع قاعدة البيانات.
                </p>
              </div>

              {/* Progress Bar when Generating */}
              {isGeneratingPdf ? (
                <div className="p-6 rounded-2xl bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 space-y-3 text-center">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-800 dark:text-cyan-300">
                    <span>{generationStatus}</span>
                    <span className="font-mono">{generationProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-blue-200 dark:bg-slate-700 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${generationProgress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.3 }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">يرجى الانتظار بضع ثوانٍ بينما يتم تنظيم وفهرسة وتنسيق الصفحات بدقة عالية...</p>
                </div>
              ) : (
                /* Export Mode Options */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Option 1: Full Dossier */}
                  <div 
                    onClick={() => handleStartPdfDownload('full')}
                    className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 hover:border-blue-600 cursor-pointer transition-all space-y-2.5 text-right group shadow-xs"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        الوثيقة الموسوعية الكاملة
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        تشمل المعمارية، الـ {snapshot.totalSources}+ مصدر ومراجع، المحاكيات، وBTEC بالتفصيل.
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-cyan-300 font-bold block w-fit">
                      الموصى به ★
                    </span>
                  </div>

                  {/* Option 2: Executive Summary */}
                  <div 
                    onClick={() => handleStartPdfDownload('executive')}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-400 cursor-pointer transition-all space-y-2.5 text-right group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        الملخص التنفيذي للإدارة
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        ملف موجز رسمي للمشرفين، أصحاب القرار، واللجان الوزارية.
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold block w-fit">
                      موجز رسمي
                    </span>
                  </div>

                  {/* Option 3: Print / Vector PDF Window */}
                  <div 
                    onClick={() => {
                      openPrintablePlatformDossierWindow();
                      setIsExportModalOpen(false);
                      toast.info('تم فتح وثيقة الطباعة الفائقة في نافذة جديدة. يمكنك اختيار "حفظ كـ PDF" من أمر الطباعة.');
                    }}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-400 cursor-pointer transition-all space-y-2.5 text-right group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        طباعة المتصفح وحفظ Vector PDF
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        تفتح نافذة الطباعة المباشرة مع نصوص حادة الدقة وجميع الجداول.
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold block w-fit">
                      دقة طباعة 300 DPI
                    </span>
                  </div>
                </div>
              )}

              {/* Data Inclusions Summary Checklist */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>محتويات ملف الـ PDF عند التنزيل:</span>
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-500">✓</span>
                    <span>قاعدة الـ {snapshot.totalSources}+ مصدر ومراجع معتمدة مع مجالات التطبيق</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-500">✓</span>
                    <span>المختبرات والمحاكيات الـ {snapshot.totalSimulations} مع القوانين والمعادلات الرياضية</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-500">✓</span>
                    <span>محركات الذكاء الاصطناعي الـ {snapshot.totalAITools} ومستويات بلوم المعرفية</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-500">✓</span>
                    <span>بيانات المدرسة المشرفة، الإدارة، وأحدث التعديلات المزامنة لحظياً</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">
                  آخر مزامنة لقاعدة البيانات: {snapshot.timestamp}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExportModalOpen(false)}
                    disabled={isGeneratingPdf}
                    className="rounded-xl text-xs"
                  >
                    إغلاق
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStartPdfDownload('full')}
                    disabled={isGeneratingPdf}
                    className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                  >
                    تنزيل الوثيقة الكاملة الآن 🚀
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DocsExportSyncToolbar;
