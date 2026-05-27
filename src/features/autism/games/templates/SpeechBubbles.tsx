import React, { useEffect, useMemo, useState } from 'react';
import { GameTemplateProps } from './types';
import { useTTS } from '@/features/autism/ui/useTTS';
import { Volume2 } from 'lucide-react';

interface Scene { ctx: string; emoji: string; options: { text: string; ok: boolean }[] }
const SCENES: Scene[] = [
  { ctx: 'صديقك سقط من على الدرّاجة وبدأ يبكي.', emoji: '🚲', options: [
    { text: 'هل أنت بخير؟ تعال أساعدك', ok: true },
    { text: 'هذا مضحك!', ok: false },
    { text: 'لا يهمني', ok: false },
  ]},
  { ctx: 'دخلت الصف صباحاً ورأيت معلّمتك.', emoji: '🏫', options: [
    { text: 'صباح الخير يا أستاذة', ok: true },
    { text: 'لا تتكلّمي معي', ok: false },
    { text: '...', ok: false },
  ]},
  { ctx: 'طفل صغير يريد أن يلعب معك بلعبتك المفضّلة.', emoji: '🧸', options: [
    { text: 'تعال نلعب معاً', ok: true },
    { text: 'اذهب من هنا', ok: false },
    { text: 'لا، لي وحدي', ok: false },
  ]},
  { ctx: 'أمك أحضرت لك وجبة جديدة.', emoji: '🍽️', options: [
    { text: 'شكراً يا أمي', ok: true },
    { text: 'لا أريد، أبدًا', ok: false },
    { text: 'إيش هذا؟!', ok: false },
  ]},
  { ctx: 'صديقك يحاول إخبارك قصة جديدة.', emoji: '🗣️', options: [
    { text: 'أنا أستمع، أكمل', ok: true },
    { text: 'اسكت!', ok: false },
    { text: 'مللت منك', ok: false },
  ]},
];

const SpeechBubbles: React.FC<GameTemplateProps> = ({ childName, difficulty = 'medium', onComplete, onSkip }) => {
  const tts = useTTS();
  const rounds = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 5 : 4;
  const scenes = useMemo(() => [...SCENES].sort(() => Math.random() - 0.5).slice(0, rounds), [rounds]);
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [start] = useState(Date.now());
  const s = scenes[i];

  useEffect(() => {
    if (s) tts.speak(`${childName ? childName + '، ' : ''}${s.ctx}. ماذا تقول؟`);
  }, [i]); // eslint-disable-line

  const pick = (ok: boolean) => {
    if (ok) { setCorrect((c) => c + 1); tts.speak('ردّ ممتاز!'); }
    else tts.speak('فكّر برد ألطف');
    if (i + 1 >= rounds) onComplete({ accuracy: (correct + (ok ? 1 : 0)) / rounds, raw: { rounds } }, Date.now() - start);
    else setI((x) => x + 1);
  };

  if (!s) return null;
  return (
    <div className="p-6 text-center" dir="rtl">
      <div className="text-xs text-slate-500 mb-2">المشهد {i + 1} من {rounds}</div>
      <div className="text-6xl mb-3">{s.emoji}</div>
      <p className="text-lg font-semibold mb-1 flex items-center justify-center gap-2">
        {s.ctx}
        <button onClick={() => tts.speak(s.ctx, { force: true })} className="p-1 rounded-full bg-violet-100 text-violet-700"><Volume2 className="w-4 h-4" /></button>
      </p>
      <p className="text-sm text-slate-600 mb-4">💭 اختر الرد المناسب:</p>
      <div className="space-y-2 max-w-md mx-auto">
        {s.options.map((o, k) => (
          <button key={k} onClick={() => pick(o.ok)}
            className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 hover:border-[hsl(var(--autism-accent))] text-right">
            {o.text}
          </button>
        ))}
      </div>
      {onSkip && <button onClick={onSkip} className="mt-4 text-xs text-slate-500 underline">تخطّي</button>}
    </div>
  );
};

export default SpeechBubbles;
