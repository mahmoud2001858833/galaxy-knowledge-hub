import React, { useMemo, useState } from 'react';
import { GameTemplateProps } from './types';

// Two grids of emojis; one cell different
const SETS = [
  { base: '🌸', diff: '🌺' },
  { base: '🐱', diff: '🐶' },
  { base: '⭐', diff: '🌟' },
  { base: '🍎', diff: '🍏' },
];

const SpotDifference: React.FC<GameTemplateProps> = ({ difficulty = 'easy', onComplete, onSkip, instructions }) => {
  const total = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [start] = useState(Date.now());

  const set = useMemo(() => SETS[round % SETS.length], [round]);
  const size = difficulty === 'easy' ? 9 : difficulty === 'medium' ? 16 : 25;
  const diffIdx = useMemo(() => Math.floor(Math.random() * size), [round, size]);

  if (round >= total) {
    onComplete({ accuracy: correct / total, raw: { correct, total } }, Date.now() - start);
    return null;
  }

  const cols = Math.sqrt(size);

  return (
    <div className="p-6 text-center" dir="rtl">
      <p className="text-sm text-slate-600 mb-2">{round + 1} / {total}</p>
      {instructions && <p className="text-xs text-slate-500 mb-3">{instructions}</p>}
      <p className="font-semibold mb-4 text-slate-800">اعثر على المختلف</p>
      <div className="grid mx-auto gap-2 max-w-sm" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: size }).map((_, i) => (
          <button key={i} onClick={() => {
            if (i === diffIdx) setCorrect(c => c + 1);
            setRound(r => r + 1);
          }}
            className="aspect-square text-3xl rounded-lg bg-white border border-slate-200 hover:bg-amber-50">
            {i === diffIdx ? set.diff : set.base}
          </button>
        ))}
      </div>
      <button onClick={onSkip} className="mt-4 text-sm text-slate-500">تخطّي</button>
    </div>
  );
};
export default SpotDifference;
