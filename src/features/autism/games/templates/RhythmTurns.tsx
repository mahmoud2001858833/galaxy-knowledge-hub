import React, { useEffect, useRef, useState } from 'react';
import { GameTemplateProps } from './types';

// Simon-style turn taking
const COLORS = ['#EF4444', '#22C55E', '#3B82F6', '#EAB308'];

const RhythmTurns: React.FC<GameTemplateProps> = ({ difficulty = 'easy', onComplete, onSkip, instructions }) => {
  const len = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
  const [seq] = useState<number[]>(() => Array.from({ length: len }, () => Math.floor(Math.random() * 4)));
  const [showing, setShowing] = useState(true);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [picks, setPicks] = useState<number[]>([]);
  const [correct, setCorrect] = useState(0);
  const [start] = useState(Date.now());

  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i >= seq.length) { setShowing(false); setHighlight(null); return; }
      setHighlight(seq[i]);
      setTimeout(() => { setHighlight(null); i++; setTimeout(tick, 250); }, 600);
    };
    setTimeout(tick, 600);
  }, [seq]);

  const submit = (idx: number) => {
    const next = [...picks, idx];
    setPicks(next);
    if (seq[next.length - 1] !== idx) {
      onComplete({ accuracy: correct / seq.length, raw: { correct, len: seq.length } }, Date.now() - start);
      return;
    }
    if (next.length === seq.length) {
      onComplete({ accuracy: 1, raw: { correct: seq.length, len: seq.length } }, Date.now() - start);
    } else {
      setCorrect(c => c + 1);
    }
  };

  return (
    <div className="p-6 text-center" dir="rtl">
      <p className="font-semibold mb-2 text-slate-800">{showing ? 'انتبه للتسلسل...' : 'دورك! كرّر التسلسل'}</p>
      {instructions && <p className="text-xs text-slate-500 mb-3">{instructions}</p>}
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {COLORS.map((c, i) => (
          <button key={i} disabled={showing} onClick={() => submit(i)}
            className="aspect-square rounded-2xl transition-all"
            style={{ background: c, opacity: highlight === i ? 1 : (showing ? 0.4 : 0.85), transform: highlight === i ? 'scale(1.05)' : 'scale(1)' }} />
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-600">التقدم: {picks.length} / {seq.length}</p>
      <button onClick={onSkip} className="mt-3 text-sm text-slate-500">تخطّي</button>
    </div>
  );
};
export default RhythmTurns;
