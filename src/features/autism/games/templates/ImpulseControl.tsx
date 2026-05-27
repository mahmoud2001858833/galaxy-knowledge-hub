import React, { useEffect, useRef, useState } from 'react';
import { GameTemplateProps } from './types';
import { useTTS } from '@/features/autism/ui/useTTS';

const ImpulseControl: React.FC<GameTemplateProps> = ({ childName, durationSec = 60, difficulty = 'medium', onComplete, onSkip }) => {
  const tts = useTTS();
  const total = difficulty === 'easy' ? 10 : difficulty === 'hard' ? 20 : 14;
  const [trial, setTrial] = useState(0);
  const [stim, setStim] = useState<{ go: boolean; shape: string } | null>(null);
  const [hits, setHits] = useState(0);          // correctly tapped go
  const [falseAlarms, setFalseAlarms] = useState(0); // tapped on no-go
  const [misses, setMisses] = useState(0);      // didn't tap on go
  const [start] = useState(Date.now());
  const startedRef = useRef(false);
  const stimStartRef = useRef(0);
  const respondedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    tts.speak(`${childName ? childName + '، ' : ''}اضغط فقط عندما ترى دائرة خضراء، ولا تضغط على غيرها.`);
    next(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = (idx: number) => {
    if (idx >= total) {
      const acc = hits / Math.max(1, total - (total - (hits + falseAlarms + misses)));
      onComplete({
        accuracy: hits / total,
        raw: { hits, false_alarms: falseAlarms, misses, total },
      }, Date.now() - start);
      return;
    }
    setStim(null);
    setTimeout(() => {
      respondedRef.current = false;
      const isGo = Math.random() < 0.6;
      const shape = isGo ? '🟢' : (Math.random() < 0.5 ? '🔴' : '🟦');
      setStim({ go: isGo, shape });
      stimStartRef.current = Date.now();
      // 1.5s window
      setTimeout(() => {
        if (!respondedRef.current) {
          if (isGo) setMisses((m) => m + 1);
        }
        setTrial((t) => t + 1);
      }, 1400);
    }, 600 + Math.random() * 400);
  };

  useEffect(() => { if (trial > 0) next(trial); /* eslint-disable-next-line */ }, [trial]);

  const tap = () => {
    if (!stim || respondedRef.current) return;
    respondedRef.current = true;
    if (stim.go) setHits((h) => h + 1);
    else setFalseAlarms((f) => f + 1);
  };

  return (
    <div className="p-6 text-center select-none" dir="rtl">
      <div className="text-xs text-slate-500 mb-1">المحاولة {Math.min(trial + 1, total)} / {total}</div>
      <p className="text-sm text-slate-600 mb-4">اضغط فقط على 🟢</p>
      <button onClick={tap}
        className="mx-auto w-56 h-56 rounded-full bg-white border-4 border-[hsl(var(--autism-primary)/0.2)] flex items-center justify-center text-[7rem] active:scale-95 transition">
        {stim?.shape ?? '⚪'}
      </button>
      <div className="mt-4 text-xs text-slate-500">إصابات: {hits} • أخطاء اندفاع: {falseAlarms} • فُرص ضائعة: {misses}</div>
      {onSkip && <button onClick={onSkip} className="mt-3 text-xs text-slate-500 underline">تخطّي</button>}
    </div>
  );
};

export default ImpulseControl;
