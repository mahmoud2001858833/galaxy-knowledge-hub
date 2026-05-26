import React from 'react';
import { motion } from 'framer-motion';

interface MascotProps {
  message?: string;
  childName?: string;
  size?: 'sm' | 'md' | 'lg';
  mood?: 'happy' | 'cheer' | 'idle';
}

const SIZE = { sm: 56, md: 84, lg: 120 } as const;

const Mascot: React.FC<MascotProps> = ({ message, childName, size = 'md', mood = 'happy' }) => {
  const px = SIZE[size];
  const greet = childName ? `${childName}!` : 'مرحباً!';
  return (
    <div className="flex items-end gap-2" dir="rtl">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: mood === 'cheer' ? [0, -10, 0] : [0, -4, 0] }}
        transition={{ y: { duration: mood === 'cheer' ? 0.6 : 2, repeat: Infinity }, default: { duration: 0.4 } }}
        style={{ width: px, height: px }}
        className="relative rounded-full bg-gradient-to-br from-amber-200 via-pink-200 to-violet-200 shadow-lg flex items-center justify-center text-4xl border-4 border-white"
        aria-hidden
      >
        <span style={{ fontSize: px * 0.55 }}>{mood === 'cheer' ? '🥳' : '🐻'}</span>
      </motion.div>
      {(message || childName) && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative bg-white rounded-2xl rounded-br-sm px-3 py-2 shadow-md border border-amber-200 max-w-[220px]"
        >
          <div className="font-bold text-sm text-amber-900">{greet}</div>
          {message && <div className="text-xs text-slate-700 mt-0.5 leading-relaxed">{message}</div>}
        </motion.div>
      )}
    </div>
  );
};

export default Mascot;
