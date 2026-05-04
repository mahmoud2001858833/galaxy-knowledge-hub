import React, { useEffect, useState } from 'react';

interface Props {
  onComplete: (metrics: Record<string, number>, durationMs: number) => void;
  onSkip: () => void;
}

const TRIALS = 8;

const JointAttention: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [trial, setTrial] = useState(0);
  const [target, setTarget] = useState<'tl' | 'tr' | 'bl' | 'br'>('tl');
  const [hits, setHits] = useState(0);
  const [start] = useState(() => performance.now());

  useEffect(() => {
    if (trial >= TRIALS) {
      onComplete({ accuracy: hits / TRIALS, trials: TRIALS }, performance.now() - start);
      return;
    }
    const opts: typeof target[] = ['tl', 'tr', 'bl', 'br'];
    setTarget(opts[Math.floor(Math.random() * 4)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]);

  const eyeOffset = {
    tl: { x: -6, y: -6 },
    tr: { x: 6, y: -6 },
    bl: { x: -6, y: 6 },
    br: { x: 6, y: 6 },
  }[target];

  const choose = (c: 'tl' | 'tr' | 'bl' | 'br') => {
    if (c === target) setHits((h) => h + 1);
    setTrial((t) => t + 1);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">الانتباه المشترك</h3>
        <p className="text-[hsl(var(--damij-text))]/70">إلى أين ينظر الوجه؟ اضغط على الزاوية الصحيحة.</p>
        <p className="text-sm text-[hsl(var(--damij-text))]/50 mt-1">{trial + 1} / {TRIALS}</p>
      </div>
      <div className="relative w-80 h-80">
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <button
            key={c}
            onClick={() => choose(c)}
            className={`absolute w-20 h-20 rounded-2xl bg-[hsl(var(--damij-accent-2))]/20 hover:bg-[hsl(var(--damij-accent-2))]/40 border-2 border-[hsl(var(--damij-accent-2))]/40 ${
              c === 'tl' ? 'top-0 left-0' : c === 'tr' ? 'top-0 right-0' : c === 'bl' ? 'bottom-0 left-0' : 'bottom-0 right-0'
            }`}
            aria-label={c}
          />
        ))}
        <svg viewBox="0 0 100 100" className="absolute inset-0 m-auto w-40 h-40">
          <circle cx="50" cy="50" r="40" fill="hsl(var(--damij-primary))" opacity="0.15" />
          <circle cx="50" cy="50" r="38" fill="#FFE0B2" />
          <g>
            <circle cx="36" cy="45" r="8" fill="white" />
            <circle cx="64" cy="45" r="8" fill="white" />
            <circle cx={36 + eyeOffset.x} cy={45 + eyeOffset.y} r="3.5" fill="#222" />
            <circle cx={64 + eyeOffset.x} cy={45 + eyeOffset.y} r="3.5" fill="#222" />
          </g>
          <path d="M 40 65 Q 50 70 60 65" stroke="#222" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <button onClick={onSkip} className="text-sm text-[hsl(var(--damij-text))]/60 underline">تخطي</button>
    </div>
  );
};

export default JointAttention;
