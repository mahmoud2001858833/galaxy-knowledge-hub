import React, { useEffect, useState } from 'react';
import { Star, Timer } from 'lucide-react';
import { DEFAULT_POINTS_SETTINGS, fetchPointsSettings } from '@/components/admin/points/pointsApi';
import type { TeamTask } from './teamApi';

const pad = (n: number) => String(n).padStart(2, '0');

/** "1:05:09" / "05:09" from milliseconds. */
export const formatLeft = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
};

// one request for every card on the page
let onTimeBonus: Promise<number> | null = null;
function useOnTimeBonus() {
  const [v, setV] = useState(DEFAULT_POINTS_SETTINGS.on_time);
  useEffect(() => {
    onTimeBonus ??= fetchPointsSettings().then((s) => s.on_time).catch(() => DEFAULT_POINTS_SETTINGS.on_time);
    let alive = true;
    onTimeBonus.then((n) => alive && setV(n));
    return () => { alive = false; };
  }, []);
  return v;
}

export function useNow(intervalMs = 1000, active = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, active]);
  return now;
}

/**
 * Live countdown to a task's deadline, with what it is worth: its points and the on-time bonus.
 * Shown to the person doing the task (and to the leads) while it is open.
 */
export const TaskCountdown: React.FC<{ task: Pick<TeamTask, 'due_at' | 'status' | 'points'>; compact?: boolean }> = ({ task, compact }) => {
  const open = task.status !== 'done' && !!task.due_at;
  const now = useNow(1000, open);
  const bonus = useOnTimeBonus();
  if (!task.due_at && task.points === null) return null;

  const left = task.due_at ? new Date(task.due_at).getTime() - now : null;
  const late = left !== null && left <= 0;
  const urgent = left !== null && left > 0 && left < 15 * 60_000;
  const tone = late || urgent ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-primary/30 bg-primary/10 text-primary';

  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${compact ? 'text-[11px]' : 'text-xs'}`}>
      {open && left !== null && (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-bold tabular-nums ${tone}`}
          role="timer"
          aria-label={late ? 'انتهى وقت التسليم' : `متبقٍ ${formatLeft(left)}`}
        >
          <Timer className="h-3.5 w-3.5" aria-hidden />
          {late ? 'انتهى الوقت' : `متبقٍ ${formatLeft(left)}`}
        </span>
      )}
      {task.points !== null && (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 font-semibold text-muted-foreground">
          <Star className="h-3.5 w-3.5 text-primary" aria-hidden />
          {task.points} نقطة
          {task.due_at && bonus > 0 && (
            <span className={late ? 'line-through' : 'text-primary'}>+{bonus} بالموعد</span>
          )}
        </span>
      )}
    </span>
  );
};
