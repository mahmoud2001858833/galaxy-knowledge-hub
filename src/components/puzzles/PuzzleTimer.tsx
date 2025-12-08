import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface PuzzleTimerProps {
  isActive: boolean;
  onTimeUp: () => void;
  onBonusChange: (bonus: number) => void;
  difficulty: string;
  hasAnswered: boolean;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const PuzzleTimer: React.FC<PuzzleTimerProps> = ({
  isActive,
  onTimeUp,
  onBonusChange,
  difficulty,
  hasAnswered,
  isEnabled,
  onToggle
}) => {
  // Time limits based on difficulty (in seconds)
  const getTimeLimit = () => {
    switch (difficulty) {
      case 'سهل': return 60;
      case 'متوسط': return 45;
      case 'صعب': return 30;
      default: return 60;
    }
  };

  const timeLimit = getTimeLimit();
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [started, setStarted] = useState(false);
  const { playTickSound, playWarningSound } = useSoundEffects();

  // Calculate bonus points based on remaining time
  const calculateBonus = useCallback((remainingTime: number) => {
    const percentage = remainingTime / timeLimit;
    if (percentage >= 0.75) return 10; // 75%+ time left = +10 bonus
    if (percentage >= 0.5) return 7;   // 50%+ time left = +7 bonus
    if (percentage >= 0.25) return 4;  // 25%+ time left = +4 bonus
    return 0;
  }, [timeLimit]);

  useEffect(() => {
    if (!isEnabled || hasAnswered || !isActive) return;

    if (!started) {
      setStarted(true);
      setTimeLeft(timeLimit);
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        
        // Play warning sound in last 10 seconds
        if (prev <= 10 && prev > 0) {
          playWarningSound();
        } else if (prev % 10 === 0) {
          playTickSound();
        }
        
        const newTime = prev - 1;
        onBonusChange(calculateBonus(newTime));
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isEnabled, hasAnswered, isActive, started, timeLimit, onTimeUp, onBonusChange, calculateBonus, playTickSound, playWarningSound]);

  // Reset timer when puzzle changes
  useEffect(() => {
    setTimeLeft(timeLimit);
    setStarted(false);
  }, [timeLimit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = timeLeft / timeLimit;
    if (percentage > 0.5) return 'text-emerald-400';
    if (percentage > 0.25) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getProgressColor = () => {
    const percentage = timeLeft / timeLimit;
    if (percentage > 0.5) return 'bg-emerald-500';
    if (percentage > 0.25) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const currentBonus = calculateBonus(timeLeft);

  return (
    <div className="space-y-4">
      {/* Timer Toggle */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="timer-toggle" className="text-sm text-muted-foreground">
            تفعيل المؤقت (نقاط إضافية للسرعة)
          </Label>
        </div>
        <Switch
          id="timer-toggle"
          checked={isEnabled}
          onCheckedChange={onToggle}
          disabled={hasAnswered || started}
        />
      </div>

      {/* Timer Display */}
      <AnimatePresence>
        {isEnabled && isActive && !hasAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-card/50 border border-border/50 rounded-xl space-y-3">
              {/* Timer Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className={`h-5 w-5 ${getTimerColor()}`} />
                  <motion.span 
                    className={`text-2xl font-bold font-mono ${getTimerColor()}`}
                    animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                </div>
                
                {/* Bonus Display */}
                <AnimatePresence mode="wait">
                  {currentBonus > 0 && (
                    <motion.div
                      key={currentBonus}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 rounded-full"
                    >
                      <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="text-amber-400 font-bold">+{currentBonus}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${getProgressColor()} transition-colors duration-300`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / timeLimit) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Bonus Info */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {difficulty === 'سهل' && '60 ثانية'}
                  {difficulty === 'متوسط' && '45 ثانية'}
                  {difficulty === 'صعب' && '30 ثانية'}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  نقاط إضافية للسرعة
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PuzzleTimer;
