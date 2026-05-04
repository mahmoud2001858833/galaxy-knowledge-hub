import React, { useState } from 'react';

interface Props {
  onComplete: (metrics: Record<string, number>, durationMs: number) => void;
  onSkip: () => void;
}

// Phase 1: Reward color = blue (5 trials). Phase 2: Switch to red (5 trials).
// Persistence = post-switch trials still picking blue / 5.
const COLORS = ['blue', 'red', 'green', 'yellow'] as const;
type Color = typeof COLORS[number];

const RepetitiveMatch: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [trial, setTrial] = useState(0);
  const [start] = useState(() => performance.now());
  const [persistedAfterSwitch, setPersisted] = useState(0);
  const [lastFeedback, setFeedback] = useState<string>('');
  const phase = trial < 5 ? 1 : 2;
  const correct: Color = phase === 1 ? 'blue' : 'red';

  const choose = (c: Color) => {
    if (c === correct) setFeedback('✓ ممتاز');
    else setFeedback('✗ حاول مرة أخرى');
    if (phase === 2 && c === 'blue') setPersisted((p) => p + 1);
    const next = trial + 1;
    if (next >= 10) {
      onComplete(
        { repetitionPersistence: persistedAfterSwitch / 5, totalTrials: 10 },
        performance.now() - start,
      );
    } else {
      setTrial(next);
    }
  };

  if (trial === 5) {
    // Brief notice
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">لعبة المطابقة</h3>
        <p className="text-[hsl(var(--damij-text))]/70">
          {phase === 1 ? 'اختر اللون الذي تظن أنه الصحيح.' : 'تنبّه: القاعدة تغيّرت! ابحث عن اللون الصحيح الجديد.'}
        </p>
        <p className="text-sm text-[hsl(var(--damij-text))]/50 mt-1">{trial + 1} / 10</p>
        {lastFeedback && <p className="mt-2 font-semibold">{lastFeedback}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => choose(c)}
            className="w-32 h-32 rounded-2xl shadow-md transition hover:scale-105"
            style={{
              background: c === 'blue' ? '#3B82F6' : c === 'red' ? '#EF4444' : c === 'green' ? '#10B981' : '#F59E0B',
            }}
            aria-label={c}
          />
        ))}
      </div>
      <button onClick={onSkip} className="text-sm text-[hsl(var(--damij-text))]/60 underline">تخطي</button>
    </div>
  );
};

export default RepetitiveMatch;
