import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GameTemplateProps } from './types';

const ITEMS = ['🍎', '🚗', '🌟', '🎈', '🐶', '⚽'];

const LookWithMe: React.FC<GameTemplateProps> = ({ difficulty = 'easy', onComplete, onSkip, instructions }) => {
  const rounds = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [target, setTarget] = useState(0);
  const [start] = useState(Date.now());

  useEffect(() => { setTarget(Math.floor(Math.random() * 4)); }, [round]);

  if (round >= rounds) {
    onComplete({ accuracy: correct / rounds, raw: { correct, rounds } }, Date.now() - start);
    return null;
  }

  const choices = ITEMS.slice(0, 4);

  return (
    <div className="p-6 text-center" dir="rtl">
      <p className="text-sm text-slate-600 mb-2">جولة {round + 1} / {rounds}</p>
      {instructions && <p className="text-xs text-slate-500 mb-4">{instructions}</p>}
      <motion.div
        key={round}
        animate={{ x: target === 0 ? -80 : target === 1 ? -25 : target === 2 ? 25 : 80 }}
        transition={{ duration: 0.6 }}
        className="text-7xl mb-2"
      >
        🙂
      </motion.div>
      <p className="text-sm text-slate-700 mb-4">انظر إلى ما ينظر إليه الوجه واختر الصورة الصحيحة</p>
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {choices.map((item, i) => (
          <button
            key={i}
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
