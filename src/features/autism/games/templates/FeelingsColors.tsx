import React, { useEffect, useState } from 'react';
import { GameTemplateProps } from './types';
import { useTTS } from '@/features/autism/ui/useTTS';

const FEELINGS = [
  { color: '#FCD34D', name: 'سعيد', emoji: '😊' },
  { color: '#60A5FA', name: 'هادئ', emoji: '😌' },
  { color: '#F87171', name: 'منزعج', emoji: '😣' },
  { color: '#A78BFA', name: 'متعب', emoji: '😴' },
  { color: '#34D399', name: 'متحمّس', emoji: '🤩' },
  { color: '#9CA3AF', name: 'حزين', emoji: '😢' },
];

const FeelingsColors: React.FC<GameTemplateProps> = ({ childName, onComplete, onSkip }) => {
  const tts = useTTS();
  const [picks, setPicks] = useState<string[]>([]);
  const [round, setRound] = useState(0);
  const [start] = useState(Date.now());
  const total = 3;

  useEffect(() => {
    tts.speak(`${childName ? childName + '، ' : ''}اختر اللون الذي يعبّر عن شعورك الآن.`);
  }, [round]); // eslint-disable-line

  const pick = (name: string) => {
    const next = [...picks, name];
    setPicks(next);
    tts.speak(`اخترت: ${name}`);
    if (round + 1 >= total) {
      // Consistency: % of picks that are positive feelings
      const positive = ['سعيد', 'هادئ', 'متحمّس'];
      const posCount = next.filter((p) => positive.includes(p)).length;
      onComplete({
        accuracy: 1, // expressive task — completion = success
        raw: { picks_count: next.length, positive: posCount, distinct: new Set(next).size },
      }, Date.now() - start);
    } else setRound((r) => r + 1);
  };

  return (
    <div className="p-6 text-center" dir="rtl">
      <div className="text-xs text-slate-500 mb-2">جولة {round + 1} من {total}</div>
      <p className="text-lg font-bold mb-1">{childName ? `${childName}، ` : ''}كيف تشعر؟</p>
      <p className="text-sm text-slate-600 mb-5">اختر اللون / الإيموجي الأقرب لشعورك</p>
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        {FEELINGS.map((f) => (
          <button key={f.name} onClick={() => pick(f.name)}
            className="aspect-square rounded-3xl shadow-lg flex flex-col items-center justify-center gap-1 text-white font-bold active:scale-95 transition"
            style={{ backgroundColor: f.color }}>
            <span className="text-4xl">{f.emoji}</span>
            <span className="text-sm">{f.name}</span>
          </button>
        ))}
      </div>
      {picks.length > 0 && (
        <p className="mt-4 text-xs text-slate-500">اختياراتك: {picks.join(' • ')}</p>
      )}
      {onSkip && <button onClick={onSkip} className="mt-4 text-xs text-slate-500 underline">تخطّي</button>}
    </div>
  );
};

export default FeelingsColors;
