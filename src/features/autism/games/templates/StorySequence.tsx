import React, { useMemo, useState } from 'react';
import { GameTemplateProps } from './types';

const STORIES = [
  ['🌱', '🌿', '🌳', '🍎'],
  ['🥚', '🐣', '🐥', '🐔'],
  ['🌅', '☀️', '🌇', '🌙'],
  ['👶', '🧒', '🧑', '👴'],
];

function shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }

const StorySequence: React.FC<GameTemplateProps> = ({ difficulty = 'easy', onComplete, onSkip, instructions }) => {
  const total = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 5;
  const [round, setRound] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [start] = useState(Date.now());

  const story = useMemo(() => STORIES[round % STORIES.length], [round]);
  const [order, setOrder] = useState<string[]>(shuffle(story));
  const [picks, setPicks] = useState<string[]>([]);

  React.useEffect(() => { setOrder(shuffle(story)); setPicks([]); }, [round]);

  if (round >= total) {
    onComplete({ accuracy: correctRounds / total, raw: { correctRounds, total } }, Date.now() - start);
    return null;
  }

  const submit = () => {
    const ok = picks.every((p, i) => p === story[i]) && picks.length === story.length;
    if (ok) setCorrectRounds(c => c + 1);
    setRound(r => r + 1);
  };

  return (
    <div className="p-6 text-center" dir="rtl">
      <p className="text-sm text-slate-600 mb-2">{round + 1} / {total}</p>
      {instructions && <p className="text-xs text-slate-500 mb-2">{instructions}</p>}
      <p className="font-semibold mb-4 text-slate-800">رتّب القصة من البداية للنهاية</p>
      <div className="flex justify-center gap-3 mb-4 min-h-[80px]">
        {picks.map((p, i) => (
          <div key={i} className="w-16 h-16 rounded-xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-3xl">{p}</div>
        ))}
        {Array.from({ length: story.length - picks.length }).map((_, i) => (
          <div key={'e' + i} className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300" />
        ))}
      </div>
      <div className="flex justify-center gap-3 mb-4 flex-wrap">
        {order.filter(o => !picks.includes(o)).map((o, i) => (
          <button key={i} onClick={() => setPicks(p => [...p, o])}
            className="w-16 h-16 rounded-xl bg-white border-2 border-slate-300 text-3xl">{o}</button>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        <button onClick={() => setPicks([])} className="px-4 py-2 rounded-lg bg-slate-200 font-semibold text-sm">مسح</button>
        <button onClick={submit} disabled={picks.length !== story.length}
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-40">تحقّق</button>
      </div>
      <button onClick={onSkip} className="mt-4 text-sm text-slate-500 block mx-auto">تخطّي</button>
    </div>
  );
};
export default StorySequence;
