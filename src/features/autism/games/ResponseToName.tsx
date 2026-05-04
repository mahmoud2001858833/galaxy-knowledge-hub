import React, { useEffect, useRef, useState } from 'react';

interface Props {
  onComplete: (metrics: Record<string, number>, durationMs: number) => void;
  onSkip: () => void;
}

const TRIALS = 6;

const ResponseToName: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [trial, setTrial] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [responses, setResponses] = useState<{ rt: number | null }[]>([]);
  const cueTimeRef = useRef<number>(0);
  const startRef = useRef<number>(performance.now());
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (trial >= TRIALS) {
      const valid = responses.filter((r) => r.rt !== null) as { rt: number }[];
      const missRate = (responses.length - valid.length) / responses.length;
      const avg = valid.length ? valid.reduce((s, r) => s + r.rt, 0) / valid.length : 0;
      onComplete(
        { missRate, avgResponseMs: avg, trials: TRIALS },
        performance.now() - startRef.current,
      );
      return;
    }
    const delay = 1500 + Math.random() * 2500;
    const t = window.setTimeout(() => {
      cueTimeRef.current = performance.now();
      setWaiting(true);
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 660;
        g.gain.value = 0.15;
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.3);
      } catch { /* ignore */ }
      timeoutRef.current = window.setTimeout(() => {
        setWaiting(false);
        setResponses((p) => [...p, { rt: null }]);
        setTrial((t) => t + 1);
      }, 2500);
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]);

  const onTap = () => {
    if (!waiting) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const rt = performance.now() - cueTimeRef.current;
    setResponses((p) => [...p, { rt }]);
    setWaiting(false);
    setTrial((t) => t + 1);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">الاستجابة للاسم</h3>
        <p className="text-[hsl(var(--damij-text))]/70">عند سماع الصوت، اضغط بسرعة على الزر الكبير.</p>
        <p className="text-sm text-[hsl(var(--damij-text))]/50 mt-1">المحاولة {Math.min(trial + 1, TRIALS)} من {TRIALS}</p>
      </div>
      <button
        onClick={onTap}
        className={`w-56 h-56 rounded-full text-white text-3xl font-bold transition-all shadow-lg ${
          waiting ? 'bg-[hsl(var(--damij-accent-2))] scale-110 ring-8 ring-[hsl(var(--damij-accent-2))]/30' : 'bg-[hsl(var(--damij-primary))]/40'
        }`}
      >
        {waiting ? 'الآن!' : 'انتظر...'}
      </button>
      <button onClick={onSkip} className="text-sm text-[hsl(var(--damij-text))]/60 underline">تخطي اللعبة</button>
    </div>
  );
};

export default ResponseToName;
