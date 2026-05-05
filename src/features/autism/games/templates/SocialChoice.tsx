import React, { useMemo, useState } from 'react';
import { GameTemplateProps } from './types';

const SCENARIOS = [
  {
    situation: 'صديقك سقط وتأذّى. ماذا تفعل؟',
    options: ['أتركه وأمشي', 'أسأله: هل أنت بخير؟', 'أضحك عليه'],
    correct: 1,
  },
  {
    situation: 'تريد اللعب بلعبة يحملها زميلك. ماذا تقول؟',
    options: ['أعطني هذا حالاً!', 'هل يمكنني اللعب معك؟', 'لا أتكلم وأخذها'],
    correct: 1,
  },
  {
    situation: 'صديقك يبكي. ماذا تفعل؟',
    options: ['أصرخ عليه', 'أعزّيه وأسأل ما الذي حدث', 'أبتعد بسرعة'],
    correct: 1,
  },
  {
    situation: 'المعلّم يشرح. ماذا تفعل؟',
    options: ['أنظر للمعلّم وأنصت', 'أتحدث مع زميلي', 'أنام على الطاولة'],
    correct: 0,
  },
];

const SocialChoice: React.FC<GameTemplateProps> = ({ difficulty = 'easy', onComplete, onSkip, instructions }) => {
  const total = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : SCENARIOS.length;
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [start] = useState(Date.now());

  const sc = useMemo(() => SCENARIOS[round % SCENARIOS.length], [round]);

  if (round >= total) {
    onComplete({ accuracy: correct / total, raw: { correct, total } }, Date.now() - start);
    return null;
  }

  return (
    <div className="p-6 text-center max-w-xl mx-auto" dir="rtl">
      <p className="text-sm text-slate-600 mb-2">{round + 1} / {total}</p>
      {instructions && <p className="text-xs text-slate-500 mb-3">{instructions}</p>}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 mb-5">
        <p className="text-lg font-semibold text-violet-900">{sc.situation}</p>
      </div>
      <div className="space-y-2">
        {sc.options.map((o, i) => (
          <button key={i} onClick={() => {
            if (i === sc.correct) setCorrect(c => c + 1);
            setRound(r => r + 1);
          }}
            className="w-full py-3 px-4 rounded-xl bg-white border-2 border-slate-200 hover:border-violet-400 font-semibold text-right">
            {o}
          </button>
        ))}
      </div>
      <button onClick={onSkip} className="mt-4 text-sm text-slate-500">تخطّي</button>
    </div>
  );
};
export default SocialChoice;
