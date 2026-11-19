import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Pencil, RefreshCw, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { errorMessage, formatDate } from '@/components/team/teamApi';
import {
  KIND_LABELS,
  deleteLedgerEntry,
  editLedgerEntry,
  fetchLedger,
  formatPoints,
  type LedgerEntry,
  type LedgerKind,
} from './pointsApi';

type Person = { user_id: string; name: string };

const pointsTone = (p: number) => (p > 0 ? 'text-success' : p < 0 ? 'text-destructive' : 'text-muted-foreground');

const EditRow: React.FC<{ entry: LedgerEntry; onDone: () => void; onCancel: () => void }> = ({ entry, onDone, onCancel }) => {
  const [points, setPoints] = useState(String(entry.points));
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await editLedgerEntry(entry.id, Math.round(Number(points) || 0), reason);
      toast.success('عُدّلت الحركة');
      onDone();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} className="w-24 text-center" aria-label="النقاط الجديدة" />
      <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="سبب التعديل" className="min-w-[180px] flex-1" />
      <Button size="icon" onClick={save} disabled={busy || reason.trim().length < 3} aria-label="حفظ">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
      <Button size="icon" variant="ghost" onClick={onCancel} aria-label="إلغاء">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

/** Every points movement, filterable by member and kind; the principal can edit or delete any entry. */
export const PointsLedger: React.FC<{ people: Person[]; canEdit: boolean; refreshKey?: number; onChanged?: () => void }> = ({
  people,
  canEdit,
  refreshKey = 0,
  onChanged,
}) => {
  const [userId, setUserId] = useState('all');
  const [kind, setKind] = useState<'all' | LedgerKind>('all');
  const [rows, setRows] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);

  const names = useMemo(() => new Map(people.map((p) => [p.user_id, p.name])), [people]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchLedger({ userId: userId === 'all' ? undefined : userId, kind: kind === 'all' ? undefined : kind }));
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [userId, kind]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const sum = rows.reduce((a, r) => a + r.points, 0);

  const remove = async (entry: LedgerEntry) => {
    if (!window.confirm(`حذف الحركة (${formatPoints(entry.points)}) نهائياً؟`)) return;
    try {
      await deleteLedgerEntry(entry.id);
      toast.success('حُذفت الحركة');
      load();
      onChanged?.();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأعضاء</SelectItem>
            {people.map((p) => (
              <SelectItem key={p.user_id} value={p.user_id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={kind} onValueChange={(v) => setKind(v as 'all' | LedgerKind)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            {(Object.keys(KIND_LABELS) as LedgerKind[]).map((k) => (
              <SelectItem key={k} value={k}>
                {KIND_LABELS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={load} aria-label="تحديث">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <span className="ms-auto rounded-full bg-muted px-3 py-1 text-xs font-semibold">
          {rows.length.toLocaleString('ar')} حركة · المجموع <span className={pointsTone(sum)}>{formatPoints(sum)}</span>
        </span>
      </div>

      {loading ? (
        <Loader2 className="mx-auto my-10 h-6 w-6 animate-spin text-muted-foreground" />
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">لا توجد حركات</p>
      ) : (
        <ul className="divide-y divide-border rounded-3xl border border-border bg-card">
          {rows.map((r) => (
            <li key={r.id} className="p-3">
              <div className="flex items-start gap-3">
                <span className={`w-14 shrink-0 text-center text-lg font-bold ${pointsTone(r.points)}`}>{formatPoints(r.points)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold">{names.get(r.user_id) ?? 'عضو'}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">{KIND_LABELS[r.kind]}</span>
                    {r.edited_at && <span className="text-[11px] text-warning">معدّلة</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{r.reason}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDate(r.created_at)}
                    {r.created_by ? ` · بواسطة ${names.get(r.created_by) ?? 'الإدارة'}` : ' · تلقائي'}
                  </p>
                  {editing === r.id && (
                    <EditRow
                      entry={r}
                      onCancel={() => setEditing(null)}
                      onDone={() => {
                        setEditing(null);
                        load();
                        onChanged?.();
                      }}
                    />
                  )}
                </div>
                {canEdit && editing !== r.id && (
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(r.id)} aria-label="تعديل">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(r)} aria-label="حذف">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PointsLedger;
