import React, { useEffect, useState } from 'react';
import { GameTemplateProps } from './types';

// Sort by color, then rule changes to sort by shape
type Card = { color: 'red' | 'blue'; shape: '●' | '■' };
const CARDS: Card[] = [
  { color: 'red', shape: '●' }, { color: 'red', shape: '■' },
  { color: 'blue', shape: '●' }, { color: 'blue', shape: '■' },
];

const ChangeTheRule: React.FC<GameTemplateProps> = ({ difficulty = 'easy', onComplete, onSkip, instructions }) => {
  const total = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 10 : 14;
  const switchAt = Math.floor(total / 2);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [perseverativeErrors, setPersErr] = useState(0);
  const [start] = useState(Date.now());

  const rule = round < switchAt ? 'color' : 'shape'; // first sort by color, then by shape
  const card = CARDS[round % CARDS.length];

  useEffect(() => {
    if (round >= total) {
      onComplete({ accuracy: correct / total, raw: { correct, perseverative: perseverativeErrors } }, Date.now() - start);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  if (round >= total) return null;

  const groups = rule === 'color'
    ? [{ key: 'red', label: 'مجموعة الأحمر', color: '#DC2626' }, { key: 'blue', label: 'مجموعة الأزرق', color: '#2563EB' }]
    : [{ key: '●', label: 'مجموعة الدائرة', color: '#475569' }, { key: '■', label: 'مجموعة المربع', color: '#475569' }];

  const correctKey = rule === 'color' ? card.color : card.shape;

  return (
    <div className="p-6 text-center" dir="rtl">
      <p className="text-sm text-slate-600 mb-2">{round + 1} / {total}</p>
      {instructions && <p className="text-xs text-slate-500 mb-2">{instructions}</p>}
      {round === switchAt && <div className="bg-amber-100 border border-amber-300 rounded-lg p-2 text-sm text-amber-900 mb-3">⚡ تغيّرت القاعدة! رتّب الآن حسب الشكل</div>}
      <p className="font-semibold mb-4 text-slate-800">رتّب البطاقة حسب: {rule === 'color' ? 'اللون' : 'الشكل'}</p>
      <div className="text-8xl mb-6" style={{ color: card.color === 'red' ? '#DC2626' : '#2563EB' }}>{card.shape}</div>
      <div className="flex justify-center gap-3">
        {groups.map(g => (
          <button key={g.key} onClick={() => {
            if (g.key === correctKey) setCorrect(c => c + 1);
            else if (round >= switchAt && round < switchAt + 3 && (g.key === card.color)) setPersErr(p => p + 1);
            setRound(r => r + 1);
          }}
            className="px-5 py-3 rounded-xl bg-white border-2 border-slate-300 font-semibold" style={{ color: g.color }}>
            {g.label}
          </button>
        ))}
      </div>
      <button onClick={onSkip} className="mt-4 text-sm text-slate-500 block mx-auto">تخطّي</button>
    </div>
  );
};
export default ChangeTheRule;
