import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTemplateProps } from './types';

const COUNTS = { easy: 6, medium: 10, hard: 15 };

type Bubble = { id: number; x: number; y: number; size: number; color: string };

const playPop = () => {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
    setTimeout(() => ctx.close(), 200);
  } catch {}
};

const BubbleTracking: React.FC<GameTemplateProps> = ({ difficulty = 'easy', durationSec = 60, instructions, onComplete, onSkip }) => {
  const target = COUNTS[difficulty];
  const [popped, setPopped] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const startRef = useRef(Date.now());
  const idRef = useRef(0);
  const lastPopRef = useRef<number>(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      idRef.current++;
      setBubbles((b) => [...b, {
        id: idRef.current,
        x: Math.random() * 78 + 6,
        y: Math.random() * 65 + 12,
        size: 70 + Math.random() * 50,
        color: ['#7DD3FC', '#FCA5A5', '#A7F3D0', '#FCD34D', '#C4B5FD', '#FDBA74'][Math.floor(Math.random() * 6)],
      }].slice(-8));
    }, 850);
    const timeout = setTimeout(finish, durationSec * 1000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (popped >= target) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popped]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const dur = Date.now() - startRef.current;
    const total = popped + misses;
    const accuracy = total ? popped / total : 0;
    onComplete({ accuracy, raw: { popped, misses, bestCombo } }, dur);
  };

  const pop = (b: Bubble) => {
    setBubbles((bs) => bs.filter(x => x.id !== b.id));
    setPopped((p) => p + 1);
    setBursts((bb) => [...bb, { id: b.id, x: b.x, y: b.y }].slice(-12));
    setTimeout(() => setBursts((bb) => bb.filter(x => x.id !== b.id)), 600);
    const now = Date.now();
    if (now - lastPopRef.current < 1100) {
      setCombo((c) => {
        const next = c + 1;
        setBestCombo((bc) => Math.max(bc, next));
        return next;
      });
    } else {
      setCombo(1);
      setBestCombo((bc) => Math.max(bc, 1));
    }
    lastPopRef.current = now;
    playPop();
  };

  return (
    <div className="relative w-full h-[440px] rounded-2xl bg-gradient-to-b from-sky-100 to-blue-50 overflow-hidden select-none" style={{ touchAction: 'manipulation' }}>
      {/* Background miss-catcher — must NOT cover bubbles */}
      <div
        onPointerDown={() => setMisses((m) => m + 1)}
        className="absolute inset-0"
        style={{ zIndex: 1 }}
      />

      <div className="absolute top-3 left-3 right-3 flex justify-between items-center text-sm font-semibold text-sky-900 z-30 pointer-events-none">
        <span className="bg-white/80 rounded-full px-3 py-1">🫧 {popped} / {target}</span>
        {combo >= 2 && (
          <motion.span
            key={combo}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-amber-300 text-amber-900 rounded-full px-3 py-1"
          >
            🔥 كومبو ×{combo}
          </motion.span>
        )}
        <button
          onPointerDown={(e) => { e.stopPropagation(); onSkip?.(); }}
          className="px-3 py-1 rounded-lg bg-white/80 pointer-events-auto"
        >
          تخطّي
        </button>
      </div>

      {instructions && (
        <p className="absolute top-12 left-0 right-0 text-center text-xs text-sky-800/80 z-30 pointer-events-none">
          {instructions}
        </p>
      )}

      {/* Bubbles — always above background */}
      <AnimatePresence>
        {bubbles.map((b) => (
          <motion.button
            key={b.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onPointerDown={(e) => { e.stopPropagation(); pop(b); }}
            className="absolute rounded-full shadow-lg border-2 border-white/70 cursor-pointer"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle at 30% 30%, white, ${b.color})`,
              zIndex: 10,
              touchAction: 'manipulation',
            }}
          >
            <motion.span
              className="block w-full h-full rounded-full"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ pointerEvents: 'none' }}
            />
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Burst particles */}
      <AnimatePresence>
        {bursts.map((br) => (
          <motion.div
            key={`burst-${br.id}`}
            initial={{ scale: 0.4, opacity: 1 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute text-2xl pointer-events-none"
            style={{ left: `${br.x}%`, top: `${br.y}%`, zIndex: 20 }}
          >
            ✨
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
export default BubbleTracking;
