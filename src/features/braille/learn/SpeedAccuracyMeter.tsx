import React from 'react';
import { Gauge, Target, Timer } from 'lucide-react';

interface Props {
  cpm: number; // characters per minute
  accuracy: number; // 0..100
  errors: number;
  timeLeft?: number; // seconds remaining (optional)
}

export const SpeedAccuracyMeter: React.FC<Props> = ({ cpm, accuracy, errors, timeLeft }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Stat icon={<Gauge className="w-4 h-4" />} label="السرعة" value={`${Math.round(cpm)}`} unit="حرف/دقيقة" />
      <Stat icon={<Target className="w-4 h-4" />} label="الدقة" value={`${Math.round(accuracy)}%`} />
      <Stat icon={<Target className="w-4 h-4" />} label="الأخطاء" value={`${errors}`} />
      {typeof timeLeft === 'number' && (
        <Stat icon={<Timer className="w-4 h-4" />} label="الوقت" value={`${timeLeft}s`} highlight={timeLeft <= 5} />
      )}
    </div>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string; unit?: string; highlight?: boolean }> = ({ icon, label, value, unit, highlight }) => (
  <div
    className={`p-3 rounded-xl border ${
      highlight
        ? 'bg-red-500/10 border-red-500/40 text-red-600 animate-pulse'
        : 'bg-[hsl(var(--damij-surface))] border-[hsl(var(--damij-primary))]/15'
    }`}
  >
    <div className="flex items-center gap-1 text-xs text-[hsl(var(--damij-text))]/70 mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-xl font-bold text-[hsl(var(--damij-primary))]">
      {value} {unit && <span className="text-xs font-normal text-[hsl(var(--damij-text))]/60">{unit}</span>}
    </div>
  </div>
);
