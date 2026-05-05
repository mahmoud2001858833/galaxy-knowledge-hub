import React, { useState, useMemo } from 'react';
import { GameTemplateProps } from './types';

const EMOTIONS = [
  { face: '😀', name: 'سعيد' },
  { face: '😢', name: 'حزين' },
  { face: '😡', name: 'غاضب' },
  { face: '😨', name: 'خائف' },
  { face: '😲', name: 'متفاجئ' },
  { face: '😴', name: 'نعسان' },
];

const EmotionCards: React.FC<GameTemplateProps> = ({ difficulty = 'easy', onComplete, onSkip, instructions }) => {
  const total = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 10;
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [start] = useState(Date.now());

  const current = useMemo(() => EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)], [round]);
  const options = useMemo(() => {
    const others = EMOTIONS.filter(e => e.name !== current.name).sort(() => Math.random() - 0.5).slice(0, 3);
    return [...others, current].sort(() => Math.random() - 0.5);
  }, [current]);

  if (round >= total) {
    onComplete({ accuracy: correct / total, raw: { correct, total } }, Date.now() - start);
    return null;
  }

  return (
    <div className="p-6 text-center" dir="rtl">
      <p className="text-sm text-slate-600 mb-2">{round + 1} / {total}</p>
      {instructions && <p className="text-xs text-slate-500 mb-2">{instructions}</p>}
      <div className="text-9xl mb-6">{current.face}</div>
      <p className="font-semibold mb-4 text-slate-800">ما هذا الشعور؟</p>
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {options.map(o => (
          <button
            key={o.name}
            onClick={() => {
              if (o.name === current.name) setCorrect(c => c + 1);
              setRound(r => r + 1);
            }}
            className="py-4 rounded-xl bg-white border-2 border-slate-200 hover:border-pink-400 font-semibold"
          >
            {o.name}
          </button>
        ))}
      </div>
      <button onClick={onSkip} className="mt-4 text-sm text-slate-500">تخطّي</button>
    </div>
  );
};
export default EmotionCards;
