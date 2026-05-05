import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GameTemplateProps } from './types';

const ACTIONS = [
  { face: '🙋', verb: 'ارفع يدك' },
  { face: '👏', verb: 'صفّق' },
  { face: '😀', verb: 'ابتسم' },
  { face: '👈', verb: 'أشِر' },
  { face: '🙆', verb: 'ارفع يديك للأعلى' },
];

const MagicMirror: React.FC<GameTemplateProps> = ({ difficulty = 'easy', onComplete, onSkip, instructions }) => {
  const total = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(0);
  const [start] = useState(Date.now());

  const action = useMemo(() => ACTIONS[Math.floor(Math.random() * ACTIONS.length)], [round]);

  useEffect(() => {
    if (round >= total) {
      onComplete({ accuracy: done / total, raw: { done, total } }, Date.now() - start);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  if (round >= total) return null;

  return (
    <div className="p-6 text-center" dir="rtl">
      <p className="text-sm text-slate-600 mb-2">{round + 1} / {total}</p>
      {instructions && <p className="text-xs text-slate-500 mb-2">{instructions}</p>}
      <motion.div key={round} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-9xl mb-4">
        {action.face}
      </motion.div>
      <p className="text-xl font-semibold text-slate-800 mb-6">{action.verb} مثل المرآة</p>
      <div className="flex justify-center gap-3">
        <button onClick={() => { setDone(d => d + 1); setRound(r => r + 1); }}
          className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold">قلّدت ✓</button>
        <button onClick={() => setRound(r => r + 1)}
          className="px-6 py-3 rounded-xl bg-slate-200 font-semibold">لم أستطع</button>
      </div>
      <button onClick={onSkip} className="mt-4 text-sm text-slate-500 block mx-auto">تخطّي</button>
    </div>
  );
};
export default MagicMirror;
