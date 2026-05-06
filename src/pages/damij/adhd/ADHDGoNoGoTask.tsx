import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Square, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Go / No-Go — Impulse control (Donders / Newman 1985)
const TOTAL = 60;
const GO_RATE = 0.75;
const STIM_MS = 1000;
const ISI_MS = 1500;

type Trial = { isGo: boolean; shownAt: number; rt?: number; responded?: boolean };

const ADHDGoNoGoTask: React.FC = () => {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [stim, setStim] = useState<'go' | 'nogo' | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const trialsRef = useRef<Trial[]>([]);
  const idxRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const cleanup = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  useEffect(() => () => cleanup(), []);

  const respond = () => {
    const i = idxRef.current - 1;
    if (i < 0) return;
    const t = trialsRef.current[i];
    if (!t || t.responded) return;
    t.responded = true;
    t.rt = performance.now() - t.shownAt;
  };

  const start = () => {
    cleanup();
    trialsRef.current = [];
    idxRef.current = 0;
    setProgress(0);
    setDone(false);
    setMetrics(null);
    setRunning(true);
    next();
  };

  const next = () => {
    if (idxRef.current >= TOTAL) return finish();
    const isGo = Math.random() < GO_RATE;
    const trial: Trial = { isGo, shownAt: 0 };
    trialsRef.current.push(trial);
    idxRef.current += 1;
    setStim(isGo ? 'go' : 'nogo');
    trial.shownAt = performance.now();
    timersRef.current.push(window.setTimeout(() => setStim(null), STIM_MS));
    timersRef.current.push(window.setTimeout(() => {
      setProgress(Math.round((idxRef.current / TOTAL) * 100));
      next();
    }, STIM_MS + ISI_MS));
  };

  const finish = async () => {
    cleanup();
    setRunning(false);
    setStim(null);
    setDone(true);
    const trials = trialsRef.current;
    const goTrials = trials.filter(t => t.isGo);
    const noGoTrials = trials.filter(t => !t.isGo);
    const goHits = goTrials.filter(t => t.responded).length;
    const omissionErrors = goTrials.length - goHits;
    const commissionErrors = noGoTrials.filter(t => t.responded).length;
    const noGoCorrect = noGoTrials.length - commissionErrors;
    const rts = goTrials.filter(t => t.responded && t.rt).map(t => t.rt!);
    const meanRT = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
    const sdRT = rts.length > 1 ? Math.sqrt(rts.map(r => (r - meanRT) ** 2).reduce((a, b) => a + b, 0) / (rts.length - 1)) : 0;
    const m = {
      total: trials.length,
      goAccuracy: +(goHits / (goTrials.length || 1) * 100).toFixed(1),
      noGoAccuracy: +(noGoCorrect / (noGoTrials.length || 1) * 100).toFixed(1),
      commissionErrors,
      omissionErrors,
      meanRT_Go: Math.round(meanRT),
      rtVariability: Math.round(sdRT),
    };
    setMetrics(m);
    const { data: u } = await supabase.auth.getUser();
    if (u?.user) {
      await supabase.from('adhd_neuro_tests').insert({
        user_id: u.user.id, test_type: 'gonogo',
        duration_seconds: Math.round((TOTAL * (STIM_MS + ISI_MS)) / 1000), metrics: m,
      });
      toast.success('تم حفظ نتيجة الاختبار');
    }
  };

  return (
    <div className="px-6 pt-12 pb-12 max-w-3xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/adhd/assessment')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">اختبار Go / No-Go</h1>
            <p className="text-xs text-[hsl(var(--damij-text))]/60">التحكم بالاندفاع · Newman 1985</p>
          </div>
        </div>
        <p className="text-sm text-[hsl(var(--damij-text))]/70">
          عند ظهور <strong className="text-emerald-600">دائرة خضراء</strong> اضغط الزر بسرعة. عند ظهور
          <strong className="text-rose-600"> مربع أحمر</strong> لا تضغط.
        </p>
      </header>

      <div
        onClick={() => running && stim === 'go' && respond()}
        className="relative h-80 rounded-3xl bg-slate-50 border-2 border-[hsl(var(--damij-primary))]/10 flex items-center justify-center mb-4 overflow-hidden cursor-pointer select-none"
      >
        <AnimatePresence mode="wait">
          {stim === 'go' && (
            <motion.div key={'go' + idxRef.current}
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="w-40 h-40 rounded-full bg-emerald-500 shadow-2xl shadow-emerald-300" />
          )}
          {stim === 'nogo' && (
            <motion.div key={'nogo' + idxRef.current}
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="w-40 h-40 rounded-2xl bg-rose-500 shadow-2xl shadow-rose-300" />
          )}
        </AnimatePresence>
        {!stim && <span className="text-[hsl(var(--damij-text))]/40 text-sm">{running ? '…' : (done ? 'انتهى' : 'جاهز للبدء')}</span>}
        {running && (
          <div className="absolute bottom-3 left-3 right-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-rose-400" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        {!running ? (
          <button onClick={start} className="flex-1 py-3 rounded-2xl bg-rose-600 text-white font-bold flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> {done ? 'إعادة الاختبار' : 'بدء الاختبار'}
          </button>
        ) : (
          <>
            <button onClick={respond} className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg">
              اضغط (Go)
            </button>
            <button onClick={() => { cleanup(); setRunning(false); setStim(null); }} className="px-5 rounded-2xl bg-slate-600 text-white font-bold">
              <Square className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="دقة Go" value={`${metrics.goAccuracy}%`} hint="الاستجابة للدوائر" tone={metrics.goAccuracy > 85 ? 'good' : 'bad'} />
          <Stat label="دقة No-Go" value={`${metrics.noGoAccuracy}%`} hint="كفّ المربعات" tone={metrics.noGoAccuracy > 75 ? 'good' : 'bad'} />
          <Stat label="أخطاء اندفاع" value={`${metrics.commissionErrors}`} hint="ضغط على No-Go" tone={metrics.commissionErrors < 4 ? 'good' : 'bad'} />
          <Stat label="زمن الاستجابة" value={`${metrics.meanRT_Go} ms`} hint={`SD ${metrics.rtVariability}`} tone={metrics.meanRT_Go < 500 ? 'good' : 'bad'} />
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; hint: string; tone: 'good' | 'bad' }> = ({ label, value, hint, tone }) => (
  <div className={`p-3 rounded-2xl border ${tone === 'good' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
    <p className="text-[11px] text-[hsl(var(--damij-text))]/60">{label}</p>
    <p className={`text-xl font-bold ${tone === 'good' ? 'text-emerald-700' : 'text-rose-700'}`}>{value}</p>
    <p className="text-[10px] text-[hsl(var(--damij-text))]/50 mt-0.5">{hint}</p>
  </div>
);

export default ADHDGoNoGoTask;
