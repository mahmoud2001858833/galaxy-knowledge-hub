import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameTemplateProps } from './types';

const ITEMS = ['🍎', '🚗', '🌟', '🎈', '🐶', '⚽'];

const LookWithMe: React.FC<GameTemplateProps> = ({ difficulty = 'easy', onComplete, onSkip, instructions }) => {
  const rounds = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [target, setTarget] = useState(0);
  const [start] = useState(Date.now());

  const gridRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [faceX, setFaceX] = useState(0);
  const [angle, setAngle] = useState(0);

  useEffect(() => { setTarget(Math.floor(Math.random() * 4)); }, [round]);

  // Recompute face X so it lands EXACTLY above the target button.
  useLayoutEffect(() => {
    const compute = () => {
      const grid = gridRef.current;
      const btn = btnRefs.current[target];
      if (!grid || !btn) return;
      const gridBox = grid.getBoundingClientRect();
      const btnBox = btn.getBoundingClientRect();
      // X offset relative to grid center
      const btnCenter = btnBox.left + btnBox.width / 2;
      const gridCenter = gridBox.left + gridBox.width / 2;
      const dx = btnCenter - gridCenter;
      setFaceX(dx);
      // small tilt toward target (max ±15deg)
      const maxDx = gridBox.width / 2;
      setAngle(Math.max(-15, Math.min(15, (dx / maxDx) * 15)));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [target, round]);

  if (round >= rounds) {
    onComplete({ accuracy: correct / rounds, raw: { correct, rounds } }, Date.now() - start);
    return null;
  }

  const choices = ITEMS.slice(0, 4);

  return (
    <div className="p-6 text-center" dir="rtl">
      <p className="text-sm text-slate-600 mb-2">جولة {round + 1} / {rounds}</p>
      {instructions && <p className="text-xs text-slate-500 mb-4">{instructions}</p>}

      {/* Face row — width matches grid so X mapping is exact */}
      <div className="relative w-full max-w-md mx-auto h-24 mb-2">
        <motion.div
          key={round}
          animate={{ x: faceX, rotate: angle }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute left-1/2 -ml-10 top-2 text-7xl select-none"
          style={{ transformOrigin: 'center bottom' }}
        >
          <div className="relative">
            <span>🙂</span>
            {/* tiny arrow pointing down to the target */}
            <motion.span
              className="absolute left-1/2 -translate-x-1/2 -bottom-2 text-2xl text-sky-500"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              ▾
            </motion.span>
          </div>
        </motion.div>
      </div>

      <p className="text-sm text-slate-700 mb-4">انظر إلى ما ينظر إليه الوجه واختر الصورة الصحيحة</p>

      <div ref={gridRef} className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {choices.map((item, i) => (
          <button
            key={i}
            ref={(el) => (btnRefs.current[i] = el)}
            onClick={() => {
              if (i === target) setCorrect(c => c + 1);
              setRound(r => r + 1);
            }}
            className="aspect-square text-5xl rounded-2xl bg-white border-2 border-slate-200 hover:border-sky-400 transition"
          >
            {item}
          </button>
        ))}
      </div>
      <button onClick={onSkip} className="mt-4 text-sm text-slate-500">تخطّي</button>
    </div>
  );
};
export default LookWithMe;
