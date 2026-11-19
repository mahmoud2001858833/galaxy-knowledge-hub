import React, { useEffect, useState } from 'react';
import { Loader2, Star, TrendingUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  KIND_LABELS,
  fetchLedger,
  formatIndex,
  formatPoints,
  useMyPoints,
  type LedgerEntry,
} from '@/components/admin/points/pointsApi';
import { formatDate } from './teamApi';

/** «نقاطي»: the member's balance, performance index and rank; opens their latest movements. */
export const MyPointsBadge: React.FC<{ me: string }> = ({ me }) => {
  const { mine, total, loading } = useMyPoints(me);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<LedgerEntry[] | null>(null);

  useEffect(() => {
    if (!open) return;
    setRows(null);
    fetchLedger({ userId: me, limit: 30 })
      .then(setRows)
      .catch(() => setRows([]));
  }, [open, me, mine?.total]);

  if (loading || !mine) return null; // leads and non-members are not on the board

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ms-auto inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-1.5 text-sm shadow-sm transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`نقاطي ${mine.total}، مؤشر الأداء ${formatIndex(mine.perf_index)}`}
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-l from-brand-from to-brand-to text-primary-foreground">
            <Star className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-right leading-tight">
            <span className="block font-bold">{mine.total.toLocaleString('ar')} نقطة</span>
            <span className="block text-[11px] text-muted-foreground">
              الأداء {formatIndex(mine.perf_index)} · المركز {mine.rank.toLocaleString('ar')}/{total.toLocaleString('ar')}
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-2xl p-0" dir="rtl">
        <div className="space-y-1 border-b border-border p-4">
          <div className="flex items-center gap-2 font-bold">
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden /> نقاطي
          </div>
          <p className="text-xs text-muted-foreground">
            مؤشر الأداء = ما كسبته ({mine.earned.toLocaleString('ar')}) ÷ المتاح من مهامك ({mine.available.toLocaleString('ar')}) × 100
          </p>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {rows === null ? (
            <Loader2 className="mx-auto my-6 h-5 w-5 animate-spin text-muted-foreground" />
          ) : rows.length === 0 ? (
            <p className="p-4 text-center text-xs text-muted-foreground">لا حركات بعد. أنجز مهمتك في الموعد لتكسب أول نقاطك.</p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((r) => (
                <li key={r.id} className="flex items-start gap-3 p-3 text-sm">
                  <span className={`w-10 shrink-0 text-center font-bold ${r.points > 0 ? 'text-success' : r.points < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formatPoints(r.points)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold">{KIND_LABELS[r.kind]}</span>
                    <span className="block truncate text-xs text-muted-foreground" title={r.reason}>
                      {r.reason}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">{formatDate(r.created_at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MyPointsBadge;
