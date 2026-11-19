import React from 'react';
import { Loader2, Medal, Trophy } from 'lucide-react';
import { ROLE_LABELS } from '@/components/team/teamApi';
import { formatIndex, type LeaderboardRow } from './pointsApi';

const medalTone = (rank: number) =>
  rank === 1 ? 'bg-primary text-primary-foreground' : rank <= 3 ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground';

/** Ranked by the performance index (earned ÷ available × 100), not by raw totals. */
export const PointsLeaderboard: React.FC<{ rows: LeaderboardRow[]; loading: boolean; error?: string | null; me?: string | null }> = ({
  rows,
  loading,
  error,
  me,
}) => {
  if (loading) return <Loader2 className="mx-auto my-10 h-6 w-6 animate-spin text-muted-foreground" />;
  if (error) return <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>;
  if (rows.length === 0) return <p className="py-10 text-center text-sm text-muted-foreground">لا يوجد أعضاء في الفريق بعد.</p>;

  return (
    <div className="space-y-3">
      <p className="rounded-2xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
        <Trophy className="ml-1 inline h-4 w-4 text-primary" aria-hidden />
        الترتيب حسب <b className="text-foreground">مؤشر الأداء</b> = النقاط المكتسبة ÷ النقاط المتاحة × 100. المتاح هو قيمة كل مهمة منجزة أو فات موعدها
        + نقاط الموعد، فمن أُسندت له مهام أقل لا يُظلم. فوق 100٪ يعني مكافآت إضافية (صور، جودة، تميّز، إنقاذ). التعديلات اليدوية تدخل في الرصيد لا في المؤشر.
      </p>
      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="p-3 text-right font-semibold">#</th>
              <th className="p-3 text-right font-semibold">العضو</th>
              <th className="p-3 text-center font-semibold">مؤشر الأداء</th>
              <th className="p-3 text-center font-semibold">الرصيد</th>
              <th className="p-3 text-center font-semibold">المكتسب / المتاح</th>
              <th className="p-3 text-center font-semibold">مهام محسوبة</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pct = r.perf_index === null ? 0 : Math.min(100, r.perf_index);
              return (
                <tr key={r.user_id} className={`border-b border-border/60 last:border-0 ${r.user_id === me ? 'bg-accent/50' : ''}`}>
                  <td className="p-3">
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${medalTone(r.rank)}`}>
                      {r.rank <= 3 ? <Medal className="h-4 w-4" aria-label={`المركز ${r.rank}`} /> : r.rank}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold">{r.display_name ?? 'عضو'}</div>
                    <div className="text-[11px] text-muted-foreground">{r.roles.map((x) => ROLE_LABELS[x] ?? x).join('، ')}</div>
                  </td>
                  <td className="p-3">
                    <div className="mx-auto w-28 space-y-1 text-center">
                      <div className="font-bold text-primary">{formatIndex(r.perf_index)}</div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                        <div className="h-full rounded-full bg-gradient-to-l from-brand-from to-brand-to" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold">{r.total.toLocaleString('ar')}</td>
                  <td className="p-3 text-center text-muted-foreground">
                    {r.earned.toLocaleString('ar')} / {r.available.toLocaleString('ar')}
                  </td>
                  <td className="p-3 text-center text-muted-foreground">{r.tasks_counted.toLocaleString('ar')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PointsLeaderboard;
