import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ExternalLink, Loader2, Phone, RefreshCw, Search, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { IDEA_CATEGORIES, IDEA_COMPETITION, ideaCategoryLabel } from '@/config/ideaCompetition';

type Status = 'new' | 'shortlisted' | 'winner' | 'rejected';
interface Entry {
  id: string;
  ref_no: number;
  full_name: string;
  phone: string;
  school: string;
  category: string;
  title: string;
  idea: string;
  status: Status;
  admin_note: string | null;
  created_at: string;
}

const STATUS: Record<Status, { label: string; cls: string }> = {
  new: { label: 'جديدة', cls: 'bg-muted text-muted-foreground' },
  shortlisted: { label: 'متأهلة', cls: 'bg-primary/10 text-primary' },
  winner: { label: 'فائزة', cls: 'bg-success/15 text-success' },
  rejected: { label: 'مستبعدة', cls: 'bg-destructive/10 text-destructive' },
};

// The table is newer than the generated types.
const db = supabase as unknown as SupabaseClient;

const IdeaCompetitionAdmin: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<string>('all');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Entry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await db
      .from('idea_competition_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (error) toast.error('تعذّر تحميل الأفكار');
    setEntries((data ?? []) as Entry[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setEntryStatus = async (e: Entry, next: Status) => {
    const { error } = await db.from('idea_competition_entries').update({ status: next }).eq('id', e.id);
    if (error) return toast.error('ما زبط التعديل');
    setEntries((list) => list.map((x) => (x.id === e.id ? { ...x, status: next } : x)));
    setOpen((o) => (o?.id === e.id ? { ...o, status: next } : o));
  };

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of entries) m.set(e.category, (m.get(e.category) ?? 0) + 1);
    return m;
  }, [entries]);
  const schools = useMemo(() => new Set(entries.map((e) => e.school.trim())).size, [entries]);

  const shown = useMemo(() => {
    const t = q.trim();
    return entries.filter(
      (e) =>
        (cat === 'all' || e.category === cat) &&
        (status === 'all' || e.status === status) &&
        (!t || [e.full_name, e.school, e.title, e.idea, e.phone, String(e.ref_no)].some((v) => v.includes(t))),
    );
  }, [entries, cat, status, q]);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-gradient-to-l from-brand-from to-brand-to p-5 text-primary-foreground">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7" />
          <div>
            <h2 className="text-xl font-black">{IDEA_COMPETITION.title}</h2>
            <p className="text-xs opacity-90">
              {entries.length} فكرة · {schools} مدرسة · {entries.filter((e) => e.status === 'shortlisted').length} متأهلة
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={IDEA_COMPETITION.path}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary-foreground/15 px-3 text-xs font-bold"
          >
            <ExternalLink className="h-3.5 w-3.5" /> صفحة المسابقة
          </a>
          <Button size="sm" variant="secondary" onClick={load} className="h-9 gap-1.5 rounded-xl">
            <RefreshCw className="h-3.5 w-3.5" /> تحديث
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[{ id: 'all', label: 'كل المجالات' }, ...IDEA_CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={cn(
              'h-9 rounded-xl border px-3 text-xs font-bold transition',
              cat === c.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {c.label} <span className="opacity-70">({c.id === 'all' ? entries.length : counts.get(c.id) ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم، المدرسة، الفكرة، الرقم…" className="h-10 rounded-xl pr-9" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'new', 'shortlisted', 'winner', 'rejected'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                'h-10 rounded-xl border px-3 text-xs font-bold',
                status === s ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground',
              )}
            >
              {s === 'all' ? 'الكل' : STATUS[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {entries.length === 0 ? 'لسا ما وصلت ولا فكرة.' : 'ما في أفكار بهاد الفلتر.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setOpen(e)}
              className="rounded-2xl border border-border bg-card p-4 text-right shadow-sm transition hover:border-primary/50"
            >
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">
                  #{e.ref_no} · {ideaCategoryLabel(e.category)}
                </span>
                <span className={cn('rounded-full px-2.5 py-0.5', STATUS[e.status].cls)}>{STATUS[e.status].label}</span>
              </div>
              <h3 className="mt-2 line-clamp-1 text-base font-black text-foreground">{e.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{e.idea}</p>
              <p className="mt-2 text-xs font-bold text-foreground">
                {e.full_name} <span className="font-normal text-muted-foreground">— {e.school}</span>
              </p>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="w-[95vw] max-w-lg rounded-3xl text-right" dir="rtl">
          {open && (
            <>
              <DialogHeader className="text-right">
                <DialogTitle className="text-lg font-black">{open.title}</DialogTitle>
                <DialogDescription className="text-xs">
                  #{open.ref_no} · {ideaCategoryLabel(open.category)} ·{' '}
                  {new Date(open.created_at).toLocaleString('ar-JO', { timeZone: 'Asia/Amman', dateStyle: 'medium', timeStyle: 'short' })}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
                {open.idea}
              </div>
              <div className="space-y-1 rounded-2xl border border-border p-3 text-sm">
                <div><span className="text-muted-foreground">الاسم: </span><b>{open.full_name}</b></div>
                <div><span className="text-muted-foreground">المدرسة: </span><b>{open.school}</b></div>
                <a href={`tel:${open.phone}`} className="inline-flex items-center gap-1.5 font-bold text-primary" dir="ltr">
                  <Phone className="h-3.5 w-3.5" /> {open.phone}
                </a>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(STATUS) as Status[]).map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={open.status === s ? 'default' : 'outline'}
                    onClick={() => setEntryStatus(open, s)}
                    className="h-10 rounded-xl text-xs font-bold"
                  >
                    {STATUS[s].label}
                  </Button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IdeaCompetitionAdmin;
