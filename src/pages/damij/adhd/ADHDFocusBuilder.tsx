import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Coffee, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Adaptive Pomodoro-style focus builder for ADHD (graduated exposure).
// Levels: 5/10/15/20/25 minute focus blocks with 1-3 min breaks.

const LEVELS = [
  { focus: 5, brk: 1, label: 'مبتدئ' },
  { focus: 10, brk: 2, label: 'مرحلة 2' },
  { focus: 15, brk: 3, label: 'مرحلة 3' },
  { focus: 20, brk: 3, label: 'متقدم' },
  { focus: 25, brk: 5, label: 'بومودورو كامل' },
];

const ADHDFocusBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'focus' | 'break' | 'done'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(LEVELS[0].focus * 60);
  const [running, setRunning] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const distractionsRef = useRef(0);
  const [distractions, setDistractions] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          handlePhaseEnd();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase, level]);

  const startFocus = () => {
    setPhase('focus');
    setSecondsLeft(LEVELS[level].focus * 60);
    setRunning(true);
    startedAtRef.current = Date.now();
    distractionsRef.current = 0;
    setDistractions(0);
  };

  const handlePhaseEnd = async () => {
    if (phase === 'focus') {
      // log session
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        await supabase.from('adhd_training_sessions').insert({
          user_id: u.user.id,
          exercise: 'focus_builder',
          level: level + 1,
          duration_seconds: LEVELS[level].focus * 60,
          score: Math.max(0, 100 - distractionsRef.current * 10),
          details: { distractions: distractionsRef.current, level_label: LEVELS[level].label },
        });
        toast.success('انتهت جلسة التركيز — أحسنت!');
      }
      setPhase('break');
      setSecondsLeft(LEVELS[level].brk * 60);
      setRunning(true);
    } else if (phase === 'break') {
      setPhase('done');
      setRunning(false);
      toast.success('استراحة منتهية — جاهز للجلسة القادمة');
    }
  };

  const reset = () => {
    setRunning(false);
    setPhase('idle');
    setSecondsLeft(LEVELS[level].focus * 60);
    distractionsRef.current = 0;
    setDistractions(0);
  };

  const tagDistraction = () => {
    distractionsRef.current += 1;
    setDistractions(distractionsRef.current);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const totalSeconds = (phase === 'focus' ? LEVELS[level].focus : LEVELS[level].brk) * 60;
  const pct = totalSeconds ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="px-6 pt-12 pb-12 max-w-2xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/adhd/training')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-1">باني التركيز التكيّفي</h1>
        <p className="text-sm text-[hsl(var(--damij-text))]/70">
          نموذج Pomodoro متدرّج (Graduated Exposure) — يبدأ من 5 دقائق ويرتفع تدريجياً.
        </p>
      </header>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {LEVELS.map((L, i) => (
          <button
            key={i}
            onClick={() => { setLevel(i); reset(); }}
            disabled={running}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              level === i ? 'bg-emerald-600 text-white' : 'bg-[hsl(var(--damij-surface))] hover:bg-emerald-100'
            }`}
          >
            {L.focus}د / {L.brk}د — {L.label}
          </button>
        ))}
      </div>

      <div className="relative aspect-square max-w-sm mx-auto mb-6">
        <svg viewBox="0 0 100 100" className="w-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--damij-primary) / 0.08)" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r="45" fill="none"
            stroke={phase === 'break' ? '#f59e0b' : '#10b981'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 283} 283`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {phase === 'break' ? (
            <Coffee className="w-8 h-8 text-amber-500 mb-2" />
          ) : (
            <Target className="w-8 h-8 text-emerald-500 mb-2" />
          )}
          <p className="text-5xl font-bold tabular-nums">{mm}:{ss}</p>
          <p className="text-xs text-[hsl(var(--damij-text))]/60 mt-1">
            {phase === 'focus' ? 'وقت التركيز' : phase === 'break' ? 'استراحة' : phase === 'done' ? 'انتهت الجلسة' : 'جاهز للبدء'}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        {phase === 'idle' || phase === 'done' ? (
          <button onClick={startFocus} className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> ابدأ
          </button>
        ) : (
          <>
            <button onClick={() => setRunning((r) => !r)} className="flex-1 py-3 rounded-2xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2">
              {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {running ? 'إيقاف مؤقت' : 'استئناف'}
            </button>
            <button onClick={reset} className="px-4 py-3 rounded-2xl bg-[hsl(var(--damij-surface))]">
              <RotateCcw className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {phase === 'focus' && (
        <button
          onClick={tagDistraction}
          className="w-full py-3 rounded-2xl bg-amber-100 text-amber-800 font-semibold border border-amber-200"
        >
          تسجيل تشتّت ({distractions})
        </button>
      )}
    </div>
  );
};

export default ADHDFocusBuilder;
