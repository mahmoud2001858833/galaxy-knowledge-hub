import React, { useMemo, useState } from 'react';
import { GameTemplateProps } from './types';

const NEEDS = [
  { item: '🍎', want: 'تفاحة', request: 'أريد تفاحة' },
  { item: '💧', want: 'ماء', request: 'أريد ماء' },
  { item: '🧸', want: 'دبدوب', request: 'أريد دبدوبي' },
  { item: '📚', want: 'كتاب', request: 'أريد الكتاب' },
];

const RequestToGet: React.FC<GameTemplateProps> = ({ difficulty = 'easy', onComplete, onSkip, instructions }) => {
  const total = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [start] = useState(Date.now());

  const need = useMemo(() => NEEDS[round % NEEDS.length], [round]);
  const options = useMemo(() => {
    const wrong = NEEDS.filter(n => n.want !== need.want).slice(0, 2).map(n => n.request);
    return [...wrong, need.request].sort(() => Math.random() - 0.5);
  }, [need]);

  if (round >= total) {
    onComplete({ accuracy: correct / total, raw: { correct, total } }, Date.now() - start);
    return null;
  }

  return (
    <div className="p-6 text-center" dir="rtl">
      <p className="text-sm text-slate-600 mb-2">{round + 1} / {total}</p>
      {instructions && <p className="text-xs text-slate-500 mb-2">{instructions}</p>}
      <div className="text-8xl mb-3">{need.item}</div>
      <p className="font-semibold mb-4 text-slate-800">كيف تطلب {need.want} بأدب؟</p>
      <div className="space-y-2 max-w-md mx-auto">
        {options.map((o, i) => (
          <button key={i} onClick={() => {
            if (o === need.request) setCorrect(c => c + 1);
            setRound(r => r + 1);
          }}
            className="w-full py-3 px-4 rounded-xl bg-white border-2 border-slate-200 hover:border-emerald-400 font-semibold">
            {o}
          </button>
        ))}
      </div>
      <button onClick={onSkip} className="mt-4 text-sm text-slate-500">تخطّي</button>
    </div>
  );
};
export default RequestToGet;
