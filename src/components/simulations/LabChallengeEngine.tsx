import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Timer, CheckCircle, Play, RotateCcw, Award, Flame, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { labSound } from '@/utils/labAudio';

export interface ChallengeDef {
  // NOTE: 'Challenge' alias exported below for legacy pages
  [key: string]: unknown;
  id: string;
  title: string;
  description: string;
  targetDescription?: string;
  durationSeconds?: number;
  checkSuccess?: () => boolean; // return true if currently meeting criteria
  requiredHoldSeconds?: number; // how many consecutive seconds criteria must be met
  points?: number;
  targetMetric?: string;
}

export type Challenge = ChallengeDef;

interface LabChallengeEngineProps {
  challenges: ChallengeDef[];
  onCompleteChallenge?: (challengeId: string, score: number) => void;
  onChallengeComplete?: (challenge: ChallengeDef) => void;
  currentParams?: Record<string, unknown>;
  currentMetrics?: Record<string, string | number | boolean>;
  className?: string;
}

export const LabChallengeEngine: React.FC<LabChallengeEngineProps> = ({
  challenges,
  onCompleteChallenge,
  className = ""
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(challenges[0]?.durationSeconds || 60);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [isSuccess, setIsSuccess] = useState(false);
  const [score, setScore] = useState(0);

  const activeChallenge = challenges[selectedIdx] || challenges[0];
  const requiredHold = activeChallenge.requiredHoldSeconds || 3;
  const holdCounterRef = useRef(0);

  // Timer loop
  useEffect(() => {
    if (!isRunning || isSuccess) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isSuccess]);

  // Success check loop (runs every 100ms)
  useEffect(() => {
    if (!isRunning || isSuccess) return;

    const checkInterval = setInterval(() => {
      const meetsCriteria = activeChallenge.checkSuccess();
      if (meetsCriteria) {
        holdCounterRef.current += 0.1;
        const progress = Math.min(100, (holdCounterRef.current / requiredHold) * 100);
        setHoldProgress(progress);

        if (holdCounterRef.current >= requiredHold) {
          setIsSuccess(true);
          setIsRunning(false);
          const finalScore = Math.round(timeLeft * 10 + 500);
          setScore(finalScore);
          labSound.playBeepSuccess();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
          onCompleteChallenge?.(activeChallenge.id, finalScore);
        }
      } else {
        holdCounterRef.current = Math.max(0, holdCounterRef.current - 0.2);
        setHoldProgress((holdCounterRef.current / requiredHold) * 100);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [isRunning, isSuccess, activeChallenge, requiredHold, timeLeft, onCompleteChallenge]);

  const handleStart = () => {
    setIsRunning(true);
    setIsSuccess(false);
    setTimeLeft(activeChallenge.durationSeconds);
    holdCounterRef.current = 0;
    setHoldProgress(0);
    setScore(0);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsSuccess(false);
    setTimeLeft(activeChallenge.durationSeconds);
    holdCounterRef.current = 0;
    setHoldProgress(0);
  };

  return (
    <div className={`p-4 rounded-2xl bg-white/95 dark:bg-slate-950/80 border border-amber-300/60 dark:border-amber-500/30 backdrop-blur-xl shadow-xl dark:shadow-2xl text-slate-800 dark:text-slate-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">وضع التحديات المعملية ضد الوقت</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400/90 font-medium">Lab Challenge Mode</span>
          </div>
        </div>

        {isRunning && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/15 dark:border-red-500/30 dark:text-red-300 text-xs font-mono font-black animate-pulse">
            <Timer className="w-3.5 h-3.5" />
            <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
          </div>
        )}
      </div>

      {/* Challenge Selector */}
      {challenges.length > 1 && !isRunning && (
        <div className="flex gap-1.5 my-3 overflow-x-auto pb-1">
          {challenges.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedIdx(idx);
                handleReset();
              }}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-colors shrink-0 ${
                selectedIdx === idx
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* Mission details */}
      <div className="my-3 p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] space-y-2">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          {activeChallenge.title}
        </h4>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          {activeChallenge.description}
        </p>
        <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200/90 text-[11px] text-amber-950 dark:bg-amber-950/30 dark:border-amber-500/20 dark:text-amber-200 shadow-xs">
          <span className="font-bold text-amber-800 dark:text-amber-300 ml-1">الهدف المطلوب:</span>
          <span>{activeChallenge.targetDescription}</span>
        </div>
      </div>

      {/* Live Hold Progress Bar when running */}
      {isRunning && (
        <div className="my-3 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
            <span>تثبيت النتيجة المطلوبة:</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">{Math.round(holdProgress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-900 overflow-hidden border border-slate-300/80 dark:border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
              style={{ width: `${holdProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      )}

      {/* Victory Announcement */}
      {isSuccess && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="my-3 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-500/40 text-center space-y-1.5 shadow-sm"
        >
          <div className="inline-flex p-2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-400/40 mb-1">
            <Award className="w-6 h-6 animate-bounce" />
          </div>
          <h4 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">أحسنت! تم إنجاز التحدي بنجاح مبهر!</h4>
          <p className="text-xs text-slate-700 dark:text-slate-200">
            النقاط المكتسبة: <span className="font-black text-amber-600 dark:text-amber-400 text-sm font-mono">{score}</span> نقطة
          </p>
        </motion.div>
      )}

      {/* Out of Time Message */}
      {!isRunning && !isSuccess && timeLeft === 0 && (
        <div className="my-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-500/30 dark:text-rose-300 text-xs text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>انتهى الوقت! حاول مجدداً لتحقيق المعيار المطلوب.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        {!isRunning && !isSuccess && (
          <Button
            size="sm"
            onClick={handleStart}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 border border-amber-400/40"
          >
            <Play className="w-3.5 h-3.5 ml-1.5" />
            <span>ابدأ التحدي الآن ({activeChallenge.durationSeconds} ثانية)</span>
          </Button>
        )}

        {(isRunning || isSuccess || timeLeft === 0) && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="flex-1 border-white/20 text-slate-200 hover:bg-white/10 text-xs rounded-xl"
          >
            <RotateCcw className="w-3.5 h-3.5 ml-1.5" />
            <span>إعادة ضبط التحدي</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default LabChallengeEngine;
