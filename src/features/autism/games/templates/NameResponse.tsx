import React, { useEffect, useRef, useState } from 'react';
import { GameTemplateProps } from './types';

const NameResponse: React.FC<GameTemplateProps> = ({ difficulty = 'easy', onComplete, onSkip, instructions }) => {
  const total = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const [round, setRound] = useState(0);
  const [responded, setResponded] = useState(0);
  const [latencies, setLatencies] = useState<number[]>([]);
  const [calling, setCalling] = useState(false);
  const callStart = useRef(0);
  const [start] = useState(Date.now());

  useEffect(() => {
    if (round >= total) {
      const avg = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
      onComplete({ accuracy: responded / total, raw: { responded, total, avgLatency: Math.round(avg) } }, Date.now() - start);
      return;
    }
    const t = setTimeout(() => {
      setCalling(true);
      callStart.current = Date.now();
      try {
        const u = new SpeechSynthesisUtterance('انظر إليّ');
        u.lang = 'ar-SA';
        speechSynthesis.speak(u);
      } catch {}
    }, 1500 + Math.random() * 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  if (round >= total) return null;

  const respond = () => {
    if (!calling) return;
    setResponded(r => r + 1);
    setLatencies(l => [...l, Date.now() - callStart.current]);
    setCalling(false);
    setRound(r => r + 1);
  };
  const miss = () => { setCalling(false); setRound(r => r + 1); };

  return (
    <div className="p-6 text-center" dir="rtl">
      <p className="text-sm text-slate-600 mb-2">{round + 1} / {total}</p>
      {instructions && <p className="text-xs text-slate-500 mb-3">{instructions}</p>}
      <div className={`text-9xl mb-4 transition-all ${calling ? 'scale-110' : 'opacity-50'}`}>📣</div>
      <p className="text-lg font-semibold text-slate-800 mb-4">{calling ? 'انتبه! تم النداء' : 'انتظر النداء...'}</p>
      <div className="flex justify-center gap-3">
        <button onClick={respond} disabled={!calling}
          className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold disabled:opacity-30">استجاب ✓</button>
        <button onClick={miss} disabled={!calling}
          className="px-6 py-3 rounded-xl bg-slate-300 font-semibold disabled:opacity-30">لم يستجب</button>
      </div>
      <button onClick={onSkip} className="mt-4 text-sm text-slate-500 block mx-auto">تخطّي</button>
    </div>
  );
};
export default NameResponse;
