import React, { useEffect, useState } from 'react';

interface Props {
  onComplete: (metrics: Record<string, number>, durationMs: number) => void;
  onSkip: () => void;
}

type Emotion = 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral' | 'fear';
const LABELS: Record<Emotion, string> = {
  happy: 'سعيد',
  sad: 'حزين',
  angry: 'غاضب',
  surprised: 'متفاجئ',
  neutral: 'محايد',
  fear: 'خائف',
};

const TRIALS: Emotion[] = ['happy', 'sad', 'angry', 'surprised', 'fear', 'neutral', 'happy', 'sad'];

const FaceSvg: React.FC<{ emotion: Emotion }> = ({ emotion }) => {
  const mouth: Record<Emotion, string> = {
    happy: 'M 30 65 Q 50 80 70 65',
    sad: 'M 30 72 Q 50 58 70 72',
    angry: 'M 30 70 L 70 70',
    surprised: 'M 50 70 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0',
    neutral: 'M 32 70 L 68 70',
    fear: 'M 38 72 Q 50 60 62 72',
  };
  const brow: Record<Emotion, JSX.Element> = {
    happy: <><path d="M 28 38 Q 36 32 44 38" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M 56 38 Q 64 32 72 38" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" /></>,
    sad: <><path d="M 28 38 L 44 42" stroke="#222" strokeWidth="3" strokeLinecap="round" /><path d="M 72 38 L 56 42" stroke="#222" strokeWidth="3" strokeLinecap="round" /></>,
    angry: <><path d="M 28 42 L 44 36" stroke="#222" strokeWidth="3" strokeLinecap="round" /><path d="M 72 42 L 56 36" stroke="#222" strokeWidth="3" strokeLinecap="round" /></>,
    surprised: <><path d="M 28 36 Q 36 30 44 36" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M 56 36 Q 64 30 72 36" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" /></>,
    neutral: <><path d="M 28 38 L 44 38" stroke="#222" strokeWidth="3" strokeLinecap="round" /><path d="M 56 38 L 72 38" stroke="#222" strokeWidth="3" strokeLinecap="round" /></>,
    fear: <><path d="M 28 36 Q 36 30 44 38" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M 56 38 Q 64 30 72 36" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" /></>,
  };
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="42" fill="#FFD7AE" />
      <circle cx="38" cy="50" r="5" fill="#222" />
      <circle cx="62" cy="50" r="5" fill="#222" />
      {brow[emotion]}
      <path d={mouth[emotion]} stroke="#C2185B" strokeWidth="3" fill={emotion === 'surprised' ? '#7B1F2D' : 'none'} strokeLinecap="round" />
    </svg>
  );
};

const EmotionRecognition: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [trial, setTrial] = useState(0);
  const [hits, setHits] = useState(0);
  const [start] = useState(() => performance.now());
  const [rts, setRts] = useState<number[]>([]);
  const [trialStart, setTrialStart] = useState(performance.now());

  useEffect(() => {
    setTrialStart(performance.now());
  }, [trial]);

  if (trial >= TRIALS.length) {
    const acc = hits / TRIALS.length;
    const avgRt = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
    onComplete({ accuracy: acc, avgResponseMs: avgRt }, performance.now() - start);
    return null;
  }

  const target = TRIALS[trial];
  const distractors = (Object.keys(LABELS) as Emotion[]).filter((e) => e !== target).slice(0, 3);
  const options = [...distractors, target].sort(() => Math.random() - 0.5);

  const choose = (e: Emotion) => {
    setRts((r) => [...r, performance.now() - trialStart]);
    if (e === target) setHits((h) => h + 1);
    setTrial((t) => t + 1);
  };

  return (
    <div className="flex flex-col items-center gap-5 py-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">ما هذا الشعور؟</h3>
        <p className="text-sm text-[hsl(var(--damij-text))]/50">{trial + 1} / {TRIALS.length}</p>
      </div>
      <div className="w-48 h-48"><FaceSvg emotion={target} /></div>
      <div className="grid grid-cols-2 gap-3 max-w-md w-full">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => choose(o)}
            className="px-6 py-3 rounded-xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/20 hover:bg-[hsl(var(--damij-primary))]/10 font-semibold"
          >
            {LABELS[o]}
          </button>
        ))}
      </div>
      <button onClick={onSkip} className="text-sm text-[hsl(var(--damij-text))]/60 underline">تخطي</button>
    </div>
  );
};

export default EmotionRecognition;
