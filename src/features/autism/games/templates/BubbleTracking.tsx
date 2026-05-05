import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTemplateProps } from './types';

const COUNTS = { easy: 4, medium: 7, hard: 10 };

const BubbleTracking: React.FC<GameTemplateProps> = ({ difficulty = 'easy', durationSec = 60, instructions, onComplete, onSkip }) => {
  const target = COUNTS[difficulty];
  const [popped, setPopped] = useState(0);
  const [misses, setMisses] = useState(0);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number; color: string }[]>([]);
  const startRef = useRef(Date.now());
  const idRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      idRef.current++;
      setBubbles((b) => [...b, {
        id: idRef.current,
        x: Math.random() * 80 + 5,
        y: Math.random() * 70 + 10,
        size: 60 + Math.random() * 50,
        color: ['#7DD3FC', '#FCA5A5', '#A7F3D0', '#FCD34D', '#C4B5FD'][Math.floor(Math.random() * 5)],
      }].slice(-6));
    }, 1400);
    const timeout = setTimeout(finish, durationSec * 1000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (popped >= target) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popped]);

  const finish = () => {
    const dur = Date.now() - startRef.current;
    const accuracy = popped / Math.max(1, popped + misses);
    onComplete({ accuracy, raw: { popped, misses } }, dur);
  };

  return (
    <div className="relative w-full h-[420px] rounded-2xl bg-gradient-to-b from-sky-100 to-blue-50 overflow-hidden">
      <div className="absolute top-3 left-3 right-3 flex justify-between text-sm font-semibold text-sky-900 z-10">
        <span>🫧 {popped} / {target}</span>
        <button onClick={onSkip} className="px-3 py-1 rounded-lg bg-white/70">تخطّي</button>
      </div>
      {instructions && <p className="absolute top-12 left-0 right-0 text-center text-xs text-sky-800/80 z-10">{instructions}</p>}
      <AnimatePresence>
        {bubbles.map((b) => (
          <motion.button
            key={b.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -8, 0] }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => { setPopped((p) => p + 1); setBubbles((bs) => bs.filter(x => x.id !== b.id)); }}
            className="absolute rounded-full shadow-lg border-2 border-white/60"
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.size, height: b.size, background: `radial-gradient(circle at 30% 30%, white, ${b.color})` }}
          />
        ))}
      </AnimatePresence>
      <div onClick={() => setMisses((m) => m + 1)} className="absolute inset-0" style={{ zIndex: 0 }} />
    </div>
  );
};
export default BubbleTracking;
