import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { Bot, Loader2, Sparkles, X, ClipboardList, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSimAI } from './SimAIProvider';
import type { SimCoachTone } from './types';

const TONE: Record<SimCoachTone, { ring: string; bg: string; text: string; label: string }> = {
  praise: { ring: 'ring-emerald-400/60', bg: 'bg-emerald-500', text: 'text-emerald-50', label: 'أحسنت' },
  hint: { ring: 'ring-primary/60', bg: 'bg-primary', text: 'text-primary-foreground', label: 'تلميح' },
  warning: { ring: 'ring-amber-400/60', bg: 'bg-amber-500', text: 'text-amber-50', label: 'انتبه' },
  error: { ring: 'ring-rose-400/60', bg: 'bg-rose-500', text: 'text-rose-50', label: 'خطأ' },
};

/**
 * AI companion that physically follows the mouse cursor inside the experiment
 * and pops short corrective guidance next to it.
 */
export const SimAICursor = () => {
  const { enabled, setEnabled, thinking, latest, dismissLatest, stats, report, reportLoading, requestReport } =
    useSimAI();

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });

  const [visible, setVisible] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setFlipped(e.clientX < 340);
      setVisible(true);
    };
    const leave = () => setVisible(false);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerleave', leave);
    };
  }, [x, y]);

  // auto-hide a message after a while
  useEffect(() => {
    if (!latest) return;
    const t = setTimeout(() => dismissLatest(), 14000);
    return () => clearTimeout(t);
  }, [latest, dismissLatest]);

  if (!enabled) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="fixed bottom-5 left-5 z-[60] gap-2 shadow-lg"
        onClick={() => setEnabled(true)}
      >
        <Bot className="h-4 w-4" /> تفعيل المرشد الذكي
      </Button>
    );
  }

  const tone = TONE[latest?.tone ?? 'hint'];

  return (
    <>
      <motion.div
        dir="rtl"
        aria-live="polite"
        className="pointer-events-none fixed left-0 top-0 z-[70]"
        style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          {/* companion orb */}
          <motion.div
            animate={{ scale: thinking ? [1, 1.12, 1] : 1 }}
            transition={{ repeat: thinking ? Infinity : 0, duration: 1.1 }}
            className={`pointer-events-auto flex h-9 w-9 translate-x-6 translate-y-6 cursor-pointer items-center justify-center rounded-full ${tone.bg} ${tone.text} shadow-lg ring-4 ${tone.ring}`}
            onClick={() => setOpen((v) => !v)}
            title="المرشد الذكي"
          >
            {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
          </motion.div>

          {/* bubble */}
          <AnimatePresence>
            {latest && (
              <motion.div
                key={latest.id}
                initial={{ opacity: 0, y: 8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                className={`pointer-events-auto absolute top-10 w-[19rem] max-w-[80vw] rounded-2xl border border-border bg-popover/95 p-3 text-right shadow-2xl backdrop-blur ${
                  flipped ? 'right-6' : 'left-6'
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <Badge className={`${tone.bg} ${tone.text} gap-1 border-0 text-[10px]`}>
                    <Sparkles className="h-3 w-3" /> {tone.label}
                  </Badge>
                  <button
                    onClick={dismissLatest}
                    className="text-muted-foreground transition hover:text-foreground"
                    aria-label="إغلاق"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-foreground">{latest.message}</p>
                {latest.action && (
                  <p className="mt-2 rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">
                    الخطوة التالية: {latest.action}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* mini panel toggled from the orb */}
      <AnimatePresence>
        {open && (
          <motion.div
            dir="rtl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-5 left-5 z-[75] w-80 max-w-[88vw] rounded-2xl border border-border bg-popover/95 p-4 text-right shadow-2xl backdrop-blur"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-bold">
                <Bot className="h-4 w-4 text-primary" /> المرشد الذكي
              </h4>
              <button onClick={() => setOpen(false)} aria-label="إغلاق">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="mb-3 grid grid-cols-4 gap-2 text-center text-[11px]">
              {[
                ['التفاعلات', stats.events],
                ['الأخطاء', stats.mistakes],
                ['التلميحات', stats.hints],
                ['الدقائق', Math.round(stats.seconds / 60)],
              ].map(([k, v]) => (
                <div key={k as string} className="rounded-lg bg-muted/60 p-2">
                  <div className="font-mono text-sm font-bold text-primary">{v as number}</div>
                  <div className="text-muted-foreground">{k as string}</div>
                </div>
              ))}
            </div>

            {report && (
              <div className="mb-3 max-h-52 space-y-2 overflow-y-auto rounded-lg border border-border p-2 text-xs">
                {report.score !== null && (
                  <div className="font-bold text-primary">التقييم: {report.score}/100</div>
                )}
                <p className="leading-relaxed text-muted-foreground">{report.summary}</p>
                {report.gaps?.length > 0 && (
                  <ul className="list-inside list-disc text-muted-foreground">
                    {report.gaps.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                )}
                {report.nextSteps?.length > 0 && (
                  <ul className="list-inside list-disc text-emerald-600 dark:text-emerald-400">
                    {report.nextSteps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" className="flex-1 gap-2" onClick={requestReport} disabled={reportLoading}>
                {reportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
                تقرير أدائي
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEnabled(false);
                  setOpen(false);
                }}
                title="إيقاف المرشد"
              >
                <Power className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
