import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Square, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// N-Back — Working Memory (Kirchner 1958, Jaeggi et al. 2008)
const STIMULI = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د'];
const TOTAL = 30;
const STIM_MS = 500;
const ISI_MS = 2500;
const TARGET_RATE = 0.33;

type Trial = { stim: string; isTarget: boolean; shownAt: number; rt?: number; responded?: boolean };

const ADHDNBackTask: React.FC = () => {
  const navigate = useNavigate();
  const [n, setN] = useState<1 | 2>(2);
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const trialsRef = useRef<Trial[]>([]);
  const idxRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const cleanup = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  useEffect(() => () => cleanup(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!running) return;
      if (e.code === 'Space') { e.preventDefault(); respond(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running]);

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
    const i = idxRef.current;
    let stim: string;
    let isTarget = false;
    if (i >= n && Math.random() < TARGET_RATE) {
      stim = trialsRef.current[i - n].stim;
      isTarget = true;
    } else {
      do { stim = STIMULI[Math.floor(Math.random() * STIMULI.length)]; }
      while (i >= n && stim === trialsRef.current[i - n].stim);
    }
    const trial: Trial = { stim, isTarget, shownAt: 0 };
    trialsRef.current.push(trial);
    idxRef.current += 1;
    setCurrent(stim);
    trial.shownAt = performance.now();
    timersRef.current.push(window.setTimeout(() => setCurrent(null), STIM_MS));
    timersRef.current.push(window.setTimeout(() => {
      setProgress(Math.round((idxRef.current / TOTAL) * 100));
      next();
    }, ISI_MS));
  };

  const finish = async () => {
    cleanup();
    setRunning(false);
    setCurrent(null);
    setDone(true);
    const trials = trialsRef.current;
    const targets = trials.filter(t => t.isTarget);
    const nonTargets = trials.filter(t => !t.isTarget);
    const hits = targets.filter(t => t.responded).length;
    const misses = targets.length - hits;
    const falseAlarms = nonTargets.filter(t => t.responded).length;
    const correctRejections = nonTargets.length - falseAlarms;
    const rts = trials.filter(t => t.responded && t.rt).map(t => t.rt!);
    const meanRT = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
    const sdRT = rts.length > 1 ? Math.sqrt(rts.map(r => (r - meanRT) ** 2).reduce((a, b) => a + b, 0) / (rts.length - 1)) : 0;
    const hitRate = targets.length ? hits / targets.length : 0;
    const faRate = nonTargets.length ? falseAlarms / nonTargets.length : 0;
    const z = (p: number) => {
      const x = Math.max(0.01, Math.min(0.99, p));
      // Beasley-Springer-Moro approximation
      const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
      const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
      const q = x - 0.5;
      const r = q * q;
      return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
             (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    };
    const dPrime = +(z(hitRate) - z(faRate)).toFixed(2);
    const accuracy = +(((hits + correctRejections) / trials.length) * 100).toFixed(1);
    const m = {
      n, total: trials.length, hits, misses, falseAlarms, correctRejections,
      accuracy, dPrime, meanRT: Math.round(meanRT), rtVariability: Math.round(sdRT),
    };
    setMetrics(m);
    const { data: u } = await supabase.auth.getUser();
    if (u?.user) {
      await supabase.from('adhd_neuro_tests').insert({
        user_id: u.user.id, test_type: 'nback',
        duration_seconds: Math.round((TOTAL * ISI_MS) / 1000), metrics: m,
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
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">اختبار N-Back</h1>
            <p className="text-xs text-[hsl(var(--damij-text))]/60">الذاكرة العاملة · Kirchner 1958</p>
          </div>
        </div>
        <p className="text-sm text-[hsl(var(--damij-text))]/70 leading-relaxed">
          تظهر حروف متتالية. اضغط <kbd className="px-2 py-0.5 rounded bg-[hsl(var(--damij-surface))]">Space</kbd> إذا كان الحرف
          الحالي مطابقاً للحرف الذي ظهر قبل <strong>{n}</strong> خطوة/خطوات.
        </p>
      </header>

      {!running && !done && (
        <div className="flex gap-2 mb-4">
          {[1, 2].map(v => (
            <button key={v} onClick={() => setN(v as 1 | 2)}
              className={`flex-1 py-2 rounded-xl border font-bold ${n === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-200 text-blue-700'}`}>
              {v}-Back
            </button>
          ))}
        </div>
      )}

      <div className="relative h-72 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center mb-4 overflow-hidden">
        {current ? (
          <motion.span key={current + idxRef.current}
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-9xl font-bold text-white drop-shadow-2xl">
            {current}
          </motion.span>
        ) : (
          <span className="text-white/40 text-sm">{running ? '…' : 'جاهز للبدء'}</span>
        )}
        {running && (
          <div className="absolute bottom-3 left-3 right-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        {!running ? (
          <button onClick={start} className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> {done ? 'إعادة الاختبار' : 'بدء الاختبار'}
          </button>
        ) : (
          <button onClick={() => { cleanup(); setRunning(false); setCurrent(null); }} className="flex-1 py-3 rounded-2xl bg-rose-600 text-white font-bold flex items-center justify-center gap-2">
            <Square className="w-5 h-5" /> إيقاف
          </button>
        )}
        {running && (
          <button onClick={respond} className="px-6 py-3 rounded-2xl bg-blue-500 text-white font-bold">تطابق</button>
        )}
      </div>

      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="الدقة" value={`${metrics.accuracy}%`} hint={`${metrics.n}-Back`} tone={metrics.accuracy > 70 ? 'good' : 'bad'} />
          <Stat label="d′ (حساسية)" value={`${metrics.dPrime}`} hint="إشارة-ضوضاء" tone={metrics.dPrime > 1.5 ? 'good' : 'bad'} />
          <Stat label="إصابات صحيحة" value={`${metrics.hits}/${metrics.hits + metrics.misses}`} hint="تطابقات مكتشفة" tone={metrics.hits / (metrics.hits + metrics.misses || 1) > 0.7 ? 'good' : 'bad'} />
          <Stat label="إنذارات كاذبة" value={`${metrics.falseAlarms}`} hint="ضغط بلا تطابق" tone={metrics.falseAlarms < 4 ? 'good' : 'bad'} />
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

export default ADHDNBackTask;
