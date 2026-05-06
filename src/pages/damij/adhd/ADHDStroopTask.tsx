import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Stroop Test — Cognitive inhibition (Stroop 1935 / Golden)
const COLORS = [
  { name: 'أحمر', hex: '#dc2626' },
  { name: 'أخضر', hex: '#16a34a' },
  { name: 'أزرق', hex: '#2563eb' },
  { name: 'أصفر', hex: '#ca8a04' },
];
const PHASES = [
  { key: 'word', label: 'القراءة', desc: 'اقرأ الكلمة (لون أسود)' },
  { key: 'color', label: 'تسمية اللون', desc: 'اختر لون الـ XXXX' },
  { key: 'interference', label: 'التداخل', desc: 'اختر لون الكلمة (تجاهل معناها)' },
] as const;
const PER_PHASE = 20;

type Trial = { phase: string; correct: string; shownAt: number; rt?: number; responded?: string; isCorrect?: boolean };

const ADHDStroopTask: React.FC = () => {
  const navigate = useNavigate();
  const [phaseIdx, setPhaseIdx] = useState(-1);
  const [trialIdx, setTrialIdx] = useState(0);
  const [stim, setStim] = useState<{ text: string; color: string; correct: string } | null>(null);
  const [done, setDone] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const trialsRef = useRef<Trial[]>([]);
  const startedRef = useRef(0);

  const buildTrial = (phase: typeof PHASES[number]['key']) => {
    const wIdx = Math.floor(Math.random() * COLORS.length);
    const word = COLORS[wIdx].name;
    if (phase === 'word') {
      return { text: word, color: '#1f2937', correct: word };
    }
    if (phase === 'color') {
      const cIdx = Math.floor(Math.random() * COLORS.length);
      return { text: 'XXXX', color: COLORS[cIdx].hex, correct: COLORS[cIdx].name };
    }
    // interference: word ≠ color
    let cIdx = Math.floor(Math.random() * COLORS.length);
    while (cIdx === wIdx) cIdx = Math.floor(Math.random() * COLORS.length);
    return { text: word, color: COLORS[cIdx].hex, correct: COLORS[cIdx].name };
  };

  const start = () => {
    trialsRef.current = [];
    setPhaseIdx(0);
    setTrialIdx(0);
    setDone(false);
    setMetrics(null);
    nextStim(0, 0);
  };

  const nextStim = (pIdx: number, tIdx: number) => {
    if (pIdx >= PHASES.length) return finish();
    const t = buildTrial(PHASES[pIdx].key);
    setStim(t);
    startedRef.current = performance.now();
    setPhaseIdx(pIdx);
    setTrialIdx(tIdx);
  };

  const choose = (colorName: string) => {
    if (!stim) return;
    const rt = performance.now() - startedRef.current;
    const correct = colorName === stim.correct;
    trialsRef.current.push({
      phase: PHASES[phaseIdx].key, correct: stim.correct, rt, responded: colorName, isCorrect: correct, shownAt: startedRef.current,
    });
    const nextT = trialIdx + 1;
    if (nextT >= PER_PHASE) {
      nextStim(phaseIdx + 1, 0);
    } else {
      nextStim(phaseIdx, nextT);
    }
  };

  const finish = async () => {
    setStim(null);
    setDone(true);
    const summary: Record<string, any> = {};
    for (const p of PHASES) {
      const ts = trialsRef.current.filter(t => t.phase === p.key);
      const acc = ts.length ? ts.filter(t => t.isCorrect).length / ts.length : 0;
      const rts = ts.filter(t => t.isCorrect).map(t => t.rt!);
      const mean = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
      summary[p.key] = { accuracy: +(acc * 100).toFixed(1), meanRT: Math.round(mean), trials: ts.length };
    }
    const stroopEffect = Math.round((summary.interference?.meanRT ?? 0) - (summary.color?.meanRT ?? 0));
    const m = { ...summary, stroopEffect };
    setMetrics(m);
    const { data: u } = await supabase.auth.getUser();
    if (u?.user) {
      await supabase.from('adhd_neuro_tests').insert({
        user_id: u.user.id, test_type: 'stroop',
        duration_seconds: Math.round(trialsRef.current.reduce((a, t) => a + (t.rt ?? 0), 0) / 1000),
        metrics: m,
      });
      toast.success('تم حفظ نتيجة الاختبار');
    }
  };

  const phase = phaseIdx >= 0 && phaseIdx < PHASES.length ? PHASES[phaseIdx] : null;

  return (
    <div className="px-6 pt-12 pb-12 max-w-3xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/adhd/assessment')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">اختبار Stroop</h1>
            <p className="text-xs text-[hsl(var(--damij-text))]/60">الكفّ المعرفي · Stroop 1935 / Golden</p>
          </div>
        </div>
        <p className="text-sm text-[hsl(var(--damij-text))]/70">
          ثلاث مراحل × {PER_PHASE} محفّز. كل مرحلة لها قاعدة مختلفة. القياس الأهم: <strong>أثر Stroop</strong>.
        </p>
      </header>

      {phase && (
        <div className="mb-3 flex items-center justify-between text-xs text-[hsl(var(--damij-text))]/70">
          <span>المرحلة {phaseIdx + 1}/3 — <strong>{phase.label}</strong> · {phase.desc}</span>
          <span>{trialIdx + 1}/{PER_PHASE}</span>
        </div>
      )}

      <div className="relative h-72 rounded-3xl bg-white border-2 border-[hsl(var(--damij-primary))]/10 flex items-center justify-center mb-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {stim ? (
            <motion.span key={trialIdx + ':' + phaseIdx}
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="text-7xl font-extrabold tracking-wider" style={{ color: stim.color }}>
              {stim.text}
            </motion.span>
          ) : (
            <span className="text-[hsl(var(--damij-text))]/40 text-sm">{done ? 'انتهى الاختبار' : 'جاهز للبدء'}</span>
          )}
        </AnimatePresence>
      </div>

      {stim ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {COLORS.map(c => (
            <button key={c.name} onClick={() => choose(c.name)}
              className="py-3 rounded-2xl text-white font-bold shadow"
              style={{ backgroundColor: c.hex }}>
              {c.name}
            </button>
          ))}
        </div>
      ) : (
        <button onClick={start} className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 mb-6">
          <Play className="w-5 h-5" /> {done ? 'إعادة الاختبار' : 'بدء الاختبار'}
        </button>
      )}

      {metrics && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700">أثر Stroop (تداخل − لون)</p>
            <p className="text-3xl font-extrabold text-amber-800">{metrics.stroopEffect} ms</p>
            <p className="text-[11px] text-amber-700/80 mt-1">القيم المرتفعة (&gt;200ms) قد تشير لضعف الكفّ المعرفي.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PHASES.map(p => (
              <div key={p.key} className="p-3 rounded-xl bg-white border border-[hsl(var(--damij-primary))]/10">
                <p className="text-[11px] text-[hsl(var(--damij-text))]/60">{p.label}</p>
                <p className="text-sm font-bold text-[hsl(var(--damij-primary))]">{metrics[p.key]?.accuracy}% دقة</p>
                <p className="text-[11px] text-[hsl(var(--damij-text))]/60">{metrics[p.key]?.meanRT} ms</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ADHDStroopTask;
