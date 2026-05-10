import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, RotateCw, X, Volume2, Repeat } from 'lucide-react';
import HandSignCard from './HandSignCard';
import type { Movement } from './handshapes';
import { useSignTranslations, type SignLangCode } from './dictionary/translations';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

export interface SequenceWord {
  word: string;
  description?: string;
  handshape_id?: string;
  movement?: string;
  two_handed?: boolean;
}

interface Props {
  open: boolean;
  words: SequenceWord[];
  langCode: string;
  langLabel: string;
  signSystemLabel: string;
  onClose: () => void;
  speak: (text: string, lang: string) => void;
  mirror?: boolean;
}

const SPEEDS = { slow: 1900, normal: 1200, fast: 700 } as const;
type Speed = keyof typeof SPEEDS;

const SignSequencePlayer: React.FC<Props> = ({
  open, words, langCode, langLabel, signSystemLabel, onClose, speak, mirror,
}) => {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('normal');
  const [loop, setLoop] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const timerRef = useRef<number | null>(null);

  // Auto-start when opened
  useEffect(() => {
    if (open) {
      setIdx(0);
      setDirection(1);
      setPlaying(true);
    } else {
      setPlaying(false);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    }
  }, [open]);

  // Speak current word
  useEffect(() => {
    if (!open) return;
    const w = words[idx];
    if (w?.word) speak(w.word, langCode);
  }, [idx, open, words, langCode, speak]);

  // Playback loop
  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (!open || !playing) return;
    timerRef.current = window.setTimeout(() => {
      setIdx((i) => {
        const next = i + 1;
        if (next >= words.length) {
          if (loop) { setDirection(1); return 0; }
          setPlaying(false);
          return i;
        }
        setDirection(1);
        return next;
      });
    }, SPEEDS[speed]);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [idx, playing, speed, loop, words.length, open]);

  const goto = (next: number, dir: 1 | -1) => {
    if (next < 0 || next >= words.length) return;
    setDirection(dir);
    setIdx(next);
  };

  if (!open) return null;
  const current = words[idx];
  if (!current) return null;
  const progress = ((idx + 1) / words.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="relative w-full max-w-3xl rounded-3xl bg-gradient-to-br from-white via-white to-emerald-50 shadow-2xl overflow-hidden border border-white/40"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/70">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] text-xs font-bold">
                {signSystemLabel}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                {langLabel}
              </span>
              <span className="text-xs text-slate-500 font-bold">
                {idx + 1} / {words.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="h-1.5 bg-slate-100">
            <motion.div
              className="h-full bg-gradient-to-r from-[hsl(var(--damij-primary))] to-emerald-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Stage */}
          <div className="relative h-[420px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={idx}
                initial={{ x: direction * 80, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: direction * -80, opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="flex flex-col items-center gap-5 px-6 text-center"
              >
                <div className={mirror ? 'scale-x-[-1]' : ''}>
                  <HandSignCard
                    word={current.word}
                    handshapeId={current.handshape_id}
                    movement={(current.movement as Movement) || 'none'}
                    twoHanded={current.two_handed}
                    active
                    size={240}
                  />
                </div>
                <div dir="auto">
                  <div className="text-4xl font-black text-[hsl(var(--damij-primary))] tracking-tight">
                    {current.word}
                  </div>
                  {current.description && (
                    <div className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-snug">
                      {current.description}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* speak again */}
            <button
              onClick={() => speak(current.word, langCode)}
              className="absolute bottom-3 right-3 p-2.5 rounded-full bg-white/80 hover:bg-white shadow text-[hsl(var(--damij-primary))]"
              title="إعادة النطق"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Controls */}
          <div className="px-6 py-4 bg-white/80 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => goto(idx - 1, -1)}
                disabled={idx === 0}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
                aria-label="السابق"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              {playing ? (
                <button
                  onClick={() => setPlaying(false)}
                  className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold flex items-center gap-2 shadow-lg"
                >
                  <Pause className="w-5 h-5" /> إيقاف
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (idx >= words.length - 1) setIdx(0);
                    setPlaying(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2 shadow-lg"
                >
                  <Play className="w-5 h-5" /> تشغيل
                </button>
              )}
              <button
                onClick={() => { setIdx(0); setDirection(-1); }}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200"
                aria-label="إعادة من البداية"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => goto(idx + 1, 1)}
                disabled={idx === words.length - 1}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
                aria-label="التالي"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
              <span className="text-slate-500 font-bold">السرعة:</span>
              {(['slow', 'normal', 'fast'] as Speed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    speed === s
                      ? 'bg-[hsl(var(--damij-primary))] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s === 'slow' ? 'بطيء' : s === 'fast' ? 'سريع' : 'عادي'}
                </button>
              ))}
              <button
                onClick={() => setLoop((v) => !v)}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                  loop ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" /> تكرار
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignSequencePlayer;
