import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Square, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Continuous Performance Task (CPT) — X-style
// User must press SPACE for every letter EXCEPT 'X'.
// Metrics: omissions (missed targets), commissions (false alarms on X),
// mean reaction time, and RT variability (SD).

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T'];
const ISI_MS = 1500; // inter-stimulus interval
const STIM_MS = 250;
const TOTAL_TRIALS = 60; // ~1.5 minute mini version
const TARGET_RATE = 0.2; // 20% non-targets (X)

type Trial = { letter: string; isX: boolean; shownAt: number; rt?: number; responded?: boolean };

const ADHDCPTTask: React.FC = () => {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const trialsRef = useRef<Trial[]>([]);
  const indexRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const cleanup = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => () => cleanup(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!running) return;
      if (e.code === 'Space') {
        e.preventDefault();
        registerResponse();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running]);

  const registerResponse = () => {
    const idx = indexRef.current - 1;
    if (idx < 0) return;
    const t = trialsRef.current[idx];
    if (!t || t.responded) return;
    t.responded = true;
    t.rt = performance.now() - t.shownAt;
  };

  const start = () => {
    cleanup();
    trialsRef.current = [];
    indexRef.current = 0;
    setProgress(0);
    setDone(false);
    setMetrics(null);
    setRunning(true);
    scheduleNext();
  };

  const scheduleNext = () => {
    if (indexRef.current >= TOTAL_TRIALS) {
      finish();
      return;
    }
    const isX = Math.random() < TARGET_RATE;
    const letter = isX ? 'X' : LETTERS[Math.floor(Math.random() * LETTERS.length)];
    const trial: Trial = { letter, isX, shownAt: 0 };
    trialsRef.current.push(trial);
    indexRef.current += 1;

    setCurrent(letter);
    trial.shownAt = performance.now();

    const t1 = window.setTimeout(() => setCurrent(null), STIM_MS);
    const t2 = window.setTimeout(() => {
      setProgress(Math.round((indexRef.current / TOTAL_TRIALS) * 100));
      scheduleNext();
    }, ISI_MS);
    timersRef.current.push(t1, t2);
  };

  const finish = async () => {
    cleanup();
    setRunning(false);
    setCurrent(null);
    setDone(true);

    const trials = trialsRef.current;
    const targets = trials.filter((t) => !t.isX);
    const nonTargets = trials.filter((t) => t.isX);

    const omissions = targets.filter((t) => !t.responded).length;
    const commissions = nonTargets.filter((t) => t.responded).length;
    const rts = targets.filter((t) => t.responded && t.rt).map((t) => t.rt!);
    const meanRT = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
    const sdRT =
      rts.length > 1
        ? Math.sqrt(rts.map((r) => (r - meanRT) ** 2).reduce((a, b) => a + b, 0) / (rts.length - 1))
        : 0;

    const m = {
      total: trials.length,
      targets: targets.length,
      nonTargets: nonTargets.length,
      omissions,
      commissions,
      meanRT: Math.round(meanRT),
      rtVariability: Math.round(sdRT),
      omissionRate: targets.length ? +(omissions / targets.length * 100).toFixed(1) : 0,
      commissionRate: nonTargets.length ? +(commissions / nonTargets.length * 100).toFixed(1) : 0,
    };
    setMetrics(m);

    const { data: u } = await supabase.auth.getUser();
    if (u?.user) {
      await supabase.from('adhd_neuro_tests').insert({
        user_id: u.user.id,
        test_type: 'cpt',
        duration_seconds: Math.round((TOTAL_TRIALS * ISI_MS) / 1000),
        metrics: m,
      });
      toast.success('تم حفظ نتيجة الاختبار');
    }
  };

  const stop = () => {
    cleanup();
    setRunning(false);
    setCurrent(null);
  };

  return (
    <div className="px-6 pt-12 pb-12 max-w-3xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/adhd/assessment')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">اختبار الأداء المستمر (CPT)</h1>
            <p className="text-xs text-[hsl(var(--damij-text))]/60">على غرار Conners CPT-3 / TOVA</p>
          </div>
        </div>
        <p className="text-sm text-[hsl(var(--damij-text))]/70 leading-relaxed">
          تظهر أمامك حروف بسرعة. اضغط <kbd className="px-2 py-0.5 rounded bg-[hsl(var(--damij-surface))]">Space</kbd> لكل حرف
          <strong> ما عدا حرف X</strong>. القياسات: نسبة الإغفال، الاندفاع، زمن الاستجابة، وتذبذبه.
        </p>
      </header>

      <div className="relative h-72 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center mb-4 overflow-hidden">
        {current ? (
          <motion.span
            key={current + indexRef.current}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-9xl font-bold text-white drop-shadow-2xl"
          >
            {current}
          </motion.span>
        ) : (
          <span className="text-white/40 text-sm">{running ? '…' : 'جاهز للبدء'}</span>
        )}
        {running && (
          <div className="absolute bottom-3 left-3 right-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-violet-400" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        {!running ? (
          <button onClick={start} className="flex-1 py-3 rounded-2xl bg-violet-600 text-white font-bold flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> {done ? 'إعادة الاختبار' : 'بدء الاختبار'}
          </button>
        ) : (
          <button onClick={stop} className="flex-1 py-3 rounded-2xl bg-rose-600 text-white font-bold flex items-center justify-center gap-2">
            <Square className="w-5 h-5" /> إيقاف
          </button>
        )}
      </div>

      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="نسبة الإغفال" value={`${metrics.omissionRate}%`} hint="إغفال أهداف (انتباه ضعيف)" tone={metrics.omissionRate > 10 ? 'bad' : 'good'} />
          <Stat label="نسبة الاندفاع" value={`${metrics.commissionRate}%`} hint="ضغط على X (تحكم ضعيف)" tone={metrics.commissionRate > 20 ? 'bad' : 'good'} />
          <Stat label="زمن الاستجابة" value={`${metrics.meanRT} ms`} hint="متوسط" tone={metrics.meanRT > 600 ? 'bad' : 'good'} />
          <Stat label="تذبذب RT" value={`${metrics.rtVariability} ms`} hint="انحراف معياري" tone={metrics.rtVariability > 200 ? 'bad' : 'good'} />
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

export default ADHDCPTTask;
