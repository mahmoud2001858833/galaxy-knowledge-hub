import React, { useMemo, useState, useEffect } from 'react';
import { GameTemplateProps } from './types';
import { useTTS } from '@/features/autism/ui/useTTS';
import { Volume2 } from 'lucide-react';

interface Item { emoji: string; name: string; cat: string }
const POOL: Item[] = [
  { emoji: '🐶', name: 'كلب', cat: 'حيوانات' },
  { emoji: '🐱', name: 'قطة', cat: 'حيوانات' },
  { emoji: '🐰', name: 'أرنب', cat: 'حيوانات' },
  { emoji: '🦁', name: 'أسد', cat: 'حيوانات' },
  { emoji: '🍎', name: 'تفاح', cat: 'طعام' },
  { emoji: '🍌', name: 'موز', cat: 'طعام' },
  { emoji: '🍞', name: 'خبز', cat: 'طعام' },
  { emoji: '🧀', name: 'جبن', cat: 'طعام' },
  { emoji: '🔺', name: 'مثلث', cat: 'أشكال' },
  { emoji: '⭐', name: 'نجمة', cat: 'أشكال' },
  { emoji: '🔵', name: 'دائرة', cat: 'أشكال' },
  { emoji: '⬛', name: 'مربّع', cat: 'أشكال' },
];

const CategoryMatch: React.FC<GameTemplateProps> = ({ childName, durationSec = 90, onComplete, onSkip, difficulty = 'medium' }) => {
  const tts = useTTS();
  const rounds = difficulty === 'easy' ? 4 : difficulty === 'hard' ? 8 : 6;
  const items = useMemo(() => [...POOL].sort(() => Math.random() - 0.5).slice(0, rounds), [rounds]);
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [start] = useState(Date.now());
  const item = items[i];
  const cats = useMemo(() => Array.from(new Set(POOL.map((p) => p.cat))).sort(() => Math.random() - 0.5), [i]);

  useEffect(() => {
    if (item) tts.speak(`${childName ? childName + '، ' : ''}إلى أيّ مجموعة ينتمي: ${item.name}؟`);
  }, [i]); // eslint-disable-line

  const pick = (c: string) => {
    const ok = c === item.cat;
    if (ok) {
      setCorrect((x) => x + 1);
      tts.speak('أحسنت!');
    } else {
      tts.speak('حاول مرة أخرى لاحقاً');
    }
    if (i + 1 >= rounds) {
      onComplete({ accuracy: (correct + (ok ? 1 : 0)) / rounds, raw: { rounds, correct: correct + (ok ? 1 : 0) } }, Date.now() - start);
    } else setI((x) => x + 1);
  };

  if (!item) return null;
  return (
    <div className="p-6 text-center" dir="rtl">
      <div className="text-xs text-slate-500 mb-2">السؤال {i + 1} من {rounds}</div>
      <div className="text-8xl mb-3">{item.emoji}</div>
      <div className="text-2xl font-bold mb-1 flex items-center justify-center gap-2">
        {item.name}
        <button onClick={() => tts.speak(item.name, { force: true })} className="p-1 rounded-full bg-violet-100 text-violet-700"><Volume2 className="w-4 h-4" /></button>
      </div>
      <p className="text-sm text-slate-600 mb-5">إلى أيّ مجموعة ينتمي؟</p>
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        {cats.map((c) => (
          <button key={c} onClick={() => pick(c)}
            className="px-4 py-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-[hsl(var(--autism-accent))] font-bold text-[hsl(var(--autism-primary))]">
            {c}
          </button>
        ))}
      </div>
      {onSkip && <button onClick={onSkip} className="mt-5 text-xs text-slate-500 underline">تخطّي</button>}
    </div>
  );
};

export default CategoryMatch;
