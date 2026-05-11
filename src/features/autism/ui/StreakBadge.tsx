import React from 'react';
import { Flame, Star, Trophy } from 'lucide-react';

interface Props { streak: number; bestScore?: number; completed?: number; total?: number; }

const StreakBadge: React.FC<Props> = ({ streak, bestScore, completed, total }) => {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <div className="rounded-2xl p-3 bg-gradient-to-br from-orange-50 to-amber-50 border border-amber-200 text-center">
        <div className="flex items-center justify-center gap-1 text-amber-700 font-bold text-xs">
          <Flame className="w-4 h-4" /> سلسلة الأيام
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1">{streak}</div>
        <div className="text-[10px] text-slate-500">يوم متتالي</div>
      </div>
      <div className="rounded-2xl p-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-center">
        <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-xs">
          <Trophy className="w-4 h-4" /> أفضل أداء
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">{bestScore ?? '—'}</div>
        <div className="text-[10px] text-slate-500">من 100</div>
      </div>
      <div className="rounded-2xl p-3 bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 text-center">
        <div className="flex items-center justify-center gap-1 text-sky-700 font-bold text-xs">
          <Star className="w-4 h-4" /> الإنجاز
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 mt-1">{completed ?? 0}/{total ?? 0}</div>
        <div className="text-[10px] text-slate-500">يوم</div>
      </div>
    </div>
  );
};

export default StreakBadge;

export function computeStreak(reportedDayIndices: number[], todayIndex: number): number {
  const set = new Set(reportedDayIndices);
  let s = 0;
  for (let d = todayIndex; d >= 1; d--) {
    if (set.has(d)) s++;
    else break;
  }
  return s;
}
