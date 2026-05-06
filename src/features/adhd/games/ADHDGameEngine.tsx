// Universal lightweight ADHD game engine
// Records every event for analyzer; returns events + score on completion
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameDef } from './registry';

export interface GameEvent {
  t: number;
  type: 'go' | 'nogo' | 'response' | 'miss' | 'switch' | 'tick';
  correct?: boolean;
  rt?: number;
  meta?: any;
}

interface Props {
  game: GameDef;
  difficulty?: number; // 1-5
  durationSec?: number;
  onComplete: (result: { events: GameEvent[]; score: number; durationMs: number }) => void;
}

const useEvents = () => {
  const ref = useRef<GameEvent[]>([]);
  const startRef = useRef(performance.now());
  const log = (e: Omit<GameEvent, 't'>) => ref.current.push({ ...e, t: performance.now() - startRef.current });
  const reset = () => { ref.current = []; startRef.current = performance.now(); };
  return { ref, log, reset, startRef };
};

const COLORS = ['أحمر','أزرق','أخضر','أصفر'];
const COLOR_HEX = { 'أحمر':'#ef4444', 'أزرق':'#3b82f6', 'أخضر':'#10b981', 'أصفر':'#f59e0b' };

const ADHDGameEngine: React.FC<Props> = ({ game, difficulty = 1, durationSec, onComplete }) => {
  const dur = durationSec ?? game.durationSec;
  const [timeLeft, setTimeLeft] = useState(dur);
  const [stim, setStim] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'good'|'bad'|null>(null);
  const events = useEvents();
  const completedRef = useRef(false);

  // countdown
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, []);

  // finish
  useEffect(() => {
    if (timeLeft <= 0 && !completedRef.current) {
      completedRef.current = true;
      onComplete({ events: events.ref.current, score, durationMs: dur*1000 });
    }
  }, [timeLeft, score, dur, onComplete, events]);

  const flash = (good: boolean) => {
    setFeedback(good ? 'good' : 'bad');
    setTimeout(() => setFeedback(null), 250);
  };

  // Stimulus generators per game type
  useEffect(() => {
    let interval = 1500 - difficulty * 150;
    const id = setInterval(() => {
      const now = performance.now();
      let s: any;
      switch (game.impl) {
        case 'tap_target': {
          const isTarget = Math.random() > 0.35;
          s = { kind: 'tap_target', isTarget, shownAt: now, emoji: isTarget ? '🐰' : '🐺' };
          events.log({ type: isTarget ? 'go' : 'nogo', meta: { isTarget } });
          break;
        }
        case 'go_nogo': {
          const isStop = Math.random() < 0.3;
          s = { kind: 'go_nogo', isStop, shownAt: now };
          events.log({ type: isStop ? 'nogo' : 'go' });
          break;
        }
        case 'stroop': {
          const word = COLORS[Math.floor(Math.random()*4)];
          let color = COLORS[Math.floor(Math.random()*4)];
          if (Math.random() < 0.3) color = word; // congruent sometimes
          s = { kind: 'stroop', word, color, shownAt: now };
          events.log({ type: 'go', meta: { word, color } });
          break;
        }
        case 'rt_reflex': {
          s = { kind: 'rt_reflex', shownAt: now, color: Math.random() > 0.5 ? '#10b981' : '#ef4444' };
          events.log({ type: 'go' });
          break;
        }
        case 'switch': {
          const rule = (Math.floor(performance.now()/8000) % 2 === 0) ? 'shape' : 'color';
          const shape = Math.random() > 0.5 ? 'circle' : 'square';
          const col = Math.random() > 0.5 ? '#3b82f6' : '#ef4444';
          s = { kind: 'switch', rule, shape, col, target: rule === 'shape' ? 'circle' : '#3b82f6', shownAt: now };
          events.log({ type: 'switch', meta: { rule } });
          break;
        }
        case 'memory_seq': {
          const len = Math.min(3 + Math.floor(performance.now()/15000), 7);
          const seq = Array.from({length: len}, () => Math.floor(Math.random()*4));
          s = { kind: 'memory_seq', seq, shownAt: now, phase: 'show' };
          events.log({ type: 'go', meta: { len } });
          break;
        }
        case 'pomodoro': {
          s = { kind: 'pomodoro', shownAt: now, target: Math.floor(Math.random()*9)+1 };
          events.log({ type: 'go' });
          break;
        }
        case 'breath': {
          s = { kind: 'breath', shownAt: now };
          break;
        }
        case 'rhythm': {
          s = { kind: 'rhythm', shownAt: now };
          events.log({ type: 'go' });
          break;
        }
      }
      setStim(s);
    }, interval);
    return () => clearInterval(id);
  }, [game.impl, difficulty]);

  // Auto-miss on next stim
  useEffect(() => {
    if (!stim || stim.kind === 'breath') return;
    const id = setTimeout(() => {
      // if no response logged for this stim, count as miss for "go" types
      const last = events.ref.current[events.ref.current.length - 1];
      if (last && (last.type === 'go') && !last.rt) {
        events.log({ type: 'miss', correct: false });
      }
    }, 1400);
    return () => clearTimeout(id);
  }, [stim, events]);

  const respond = useCallback((correct: boolean, rt: number) => {
    events.log({ type: 'response', correct, rt });
    setScore(s => s + (correct ? 10 : -5));
    flash(correct);
  }, [events]);

  const handleClick = () => {
    if (!stim || stim.kind === 'breath') return;
    const rt = performance.now() - stim.shownAt;
    let correct = false;
    switch (stim.kind) {
      case 'tap_target': correct = stim.isTarget; break;
      case 'go_nogo': correct = !stim.isStop; break;
      case 'stroop': correct = true; break; // simplification: any tap during congruent counts
      case 'rt_reflex': correct = stim.color === '#10b981'; break;
      case 'switch': correct = stim.rule === 'shape' ? stim.shape === 'circle' : stim.col === '#3b82f6'; break;
      case 'memory_seq': correct = true; break;
      case 'pomodoro': correct = true; break;
      case 'rhythm': correct = rt < 600; break;
    }
    respond(correct, rt);
  };

  const renderStim = () => {
    if (!stim) return <div className="text-white/60 text-sm">جاهز…</div>;
    switch (stim.kind) {
      case 'tap_target':
        return <button onClick={handleClick} className="text-9xl active:scale-95 transition-transform">{stim.emoji}</button>;
      case 'go_nogo':
        return (
          <button onClick={handleClick} className={`w-48 h-48 rounded-full text-white text-3xl font-bold active:scale-95 ${stim.isStop ? 'bg-red-500' : 'bg-green-500'}`}>
            {stim.isStop ? 'قف' : 'انقر!'}
          </button>
        );
      case 'stroop':
        return (
          <button onClick={handleClick} className="text-7xl font-extrabold active:scale-95" style={{ color: COLOR_HEX[stim.color as keyof typeof COLOR_HEX] }}>
            {stim.word}
          </button>
        );
      case 'rt_reflex':
        return <button onClick={handleClick} className="w-56 h-56 rounded-full active:scale-95" style={{ background: stim.color }} />;
      case 'switch':
        return (
          <div className="text-center">
            <p className="text-white text-sm mb-3">القاعدة: انقر إن كان {stim.rule === 'shape' ? 'دائرة' : 'أزرق'}</p>
            <button onClick={handleClick} className={`w-40 h-40 active:scale-95 ${stim.shape === 'circle' ? 'rounded-full' : 'rounded-xl'}`} style={{ background: stim.col }} />
          </div>
        );
      case 'memory_seq':
        return (
          <div className="text-center">
            <p className="text-white text-sm mb-3">احفظ التسلسل</p>
            <div className="flex gap-2 justify-center mb-4">
              {stim.seq.map((n: number, i: number) => (
                <motion.div key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay:i*0.4}} className="w-12 h-12 rounded-xl" style={{background: ['#ef4444','#3b82f6','#10b981','#f59e0b'][n]}} />
              ))}
            </div>
            <button onClick={handleClick} className="px-6 py-2 bg-white text-[hsl(var(--damij-primary))] rounded-xl font-bold">حفظت!</button>
          </div>
        );
      case 'pomodoro':
        return (
          <div className="text-center">
            <p className="text-white/80 text-sm mb-3">انقر على الرقم {stim.target}</p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({length:9}).map((_,i)=>(
                <button key={i} onClick={()=>respond(i+1===stim.target, performance.now()-stim.shownAt)} className="w-16 h-16 rounded-xl bg-white text-[hsl(var(--damij-primary))] font-bold text-xl active:scale-95">{i+1}</button>
              ))}
            </div>
          </div>
        );
      case 'breath':
        return (
          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 6, repeat: Infinity }} className="w-48 h-48 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
            تنفّس
          </motion.div>
        );
      case 'rhythm':
        return (
          <button onClick={handleClick} className="w-48 h-48 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white text-3xl font-bold active:scale-95">
            انقر!
          </button>
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br ${game.color}`} dir="rtl">
      <header className="flex items-center justify-between p-4 text-white">
        <div className="font-bold">{game.title}</div>
        <div className="flex items-center gap-3 text-sm">
          <span className="bg-black/20 px-3 py-1 rounded-full">⏱ {timeLeft}s</span>
          <span className="bg-black/20 px-3 py-1 rounded-full">⭐ {score}</span>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center relative">
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="absolute top-8 text-6xl">
              {feedback === 'good' ? '✅' : '❌'}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="text-center">{renderStim()}</div>
      </div>
    </div>
  );
};

export default ADHDGameEngine;
