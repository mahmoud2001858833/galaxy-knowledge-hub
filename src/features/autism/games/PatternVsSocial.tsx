import React, { useEffect, useRef, useState } from 'react';

interface Props {
  onComplete: (metrics: Record<string, number>, durationMs: number) => void;
  onSkip: () => void;
}

// Tracks dwell-time on geometric pattern vs social face for 30s.
const DURATION_MS = 30000;

const PatternVsSocial: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [hovered, setHovered] = useState<'pattern' | 'social' | null>(null);
  const dwell = useRef({ pattern: 0, social: 0 });
  const lastTick = useRef(performance.now());
  const start = useRef(performance.now());
  const [remaining, setRemaining] = useState(DURATION_MS);

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = now - lastTick.current;
      lastTick.current = now;
      if (hovered) dwell.current[hovered] += dt;
      const left = DURATION_MS - (now - start.current);
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        clearInterval(id);
        const total = dwell.current.pattern + dwell.current.social;
        const ratio = total > 0 ? dwell.current.pattern / total : 0.5;
        onComplete(
          {
            patternDwellRatio: ratio,
            patternMs: dwell.current.pattern,
            socialMs: dwell.current.social,
          },
          now - start.current,
        );
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered]);

  return (
    <div className="flex flex-col items-center gap-6 py-8 w-full">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">إلى ماذا تنظر؟</h3>
        <p className="text-[hsl(var(--damij-text))]/70">انظر بحرية إلى الجهة التي تجذبك أكثر. مرّر مؤشرك أو إصبعك فوقها.</p>
        <p className="text-sm text-[hsl(var(--damij-text))]/50 mt-1">{Math.ceil(remaining / 1000)} ث متبقية</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-3xl h-72">
        <div
          onMouseEnter={() => setHovered('pattern')}
          onMouseLeave={() => setHovered(null)}
          onTouchStart={() => setHovered('pattern')}
          onTouchEnd={() => setHovered(null)}
          className="rounded-2xl bg-black flex items-center justify-center overflow-hidden"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full animate-spin" style={{ animationDuration: '6s' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x="48" y="10" width="4" height="40" fill={`hsl(${i * 30}, 80%, 60%)`} transform={`rotate(${i * 30} 50 50)`} />
            ))}
          </svg>
        </div>
        <div
          onMouseEnter={() => setHovered('social')}
          onMouseLeave={() => setHovered(null)}
          onTouchStart={() => setHovered('social')}
          onTouchEnd={() => setHovered(null)}
          className="rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center"
        >
          <svg viewBox="0 0 100 100" className="w-2/3 h-2/3">
            <circle cx="50" cy="50" r="40" fill="#FFD7AE" />
            <circle cx="38" cy="44" r="4" fill="#222">
              <animate attributeName="cy" values="44;46;44" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="62" cy="44" r="4" fill="#222">
              <animate attributeName="cy" values="44;46;44" dur="2s" repeatCount="indefinite" />
            </circle>
            <path d="M 35 65 Q 50 78 65 65" stroke="#C2185B" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <button onClick={onSkip} className="text-sm text-[hsl(var(--damij-text))]/60 underline">تخطي</button>
    </div>
  );
};

export default PatternVsSocial;
