import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot, CalendarRange, CheckCircle2, Clock, Coffee, Loader2, Maximize2, Minimize2, Printer, RefreshCw, Send, Sparkles, Trophy, Users, X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/**
 * «المهام الكبرى»: the whole team's master schedule on one page — every scheduled task of every role, the
 * programmers' timed collective work, and rest days — as a large day-by-day table, the same schedule told
 * as text underneath, and an AI that answers questions about it and edits tasks that were not sent yet.
 */

const db = supabase as unknown as SupabaseClient; // plan tables are not in the generated types
type TaskRow = {
  id: string; title: string; details: string | null; assignee_role: string; assignee_user_id: string | null; status: string;
  publish_at: string; due_at: string | null; points: number | null; extra_requirements: string[] | null; completed_at: string | null;
};
type SubRow = {
  id: string; position: number; title: string; detail: string | null; assignee_email: string | null; day_from: number; status: string;
  delivered_at: string | null; due_at: string | null; completed_at: string | null;
};
const PLAN_START = new Date('2026-11-22T00:00:00+03:00');
const PLAN_DAYS = 13; // 22/11 → 4/12
const DAY_MS = 86_400_000;
const SUP_TAG = '__SUPERVISOR_TASK__';
const ALIAS: Record<string, string> = {
  aliramadan140832: 'علي', omarrabbaa515: 'عمر', yaman: 'يمان', abodlit2012: 'عبود', moh2012th: 'محمد',
};
const GROUPS: { key: string; title: string; hint: string }[] = [
  { key: 'page_manager', title: 'مسؤول الصفحة', hint: 'صفحات فيسبوك والنشر' },
  { key: 'file_manager', title: 'رفع الملفات', hint: 'كتب المنهاج الأردني' },
  { key: 'speaker', title: 'المتكلمون', hint: 'زيارات المدارس' },
  { key: 'supervisor', title: 'المشرف', hint: 'توزيع مهام المدققين' },
  { key: 'auditor', title: 'المدققون', hint: 'فحص منصة خطى التطوع' },
  { key: 'programmers', title: 'المبرمجون', hint: 'بناء خطى التطوع مع الذكاء الاصطناعي' },
];

type Member = { user_id: string | null; email: string; display_name: string | null; role: string };
type Item = {
  id: string; kind: 'task' | 'sub'; group: string; lane: string; laneName: string; day: number; title: string; details: string;
  points: number | null; state: 'done' | 'late' | 'live' | 'scheduled'; publish: string | null; due: string | null; done: string | null;
};
type Mark = { id: string; day: string; role: string | null; member_email: string | null; label: string; kind: string };
type Lane = { key: string; name: string; group: string };

const dayIndex = (iso: string) => Math.floor((new Date(iso).getTime() - PLAN_START.getTime()) / DAY_MS);
const dayDate = (i: number) => new Date(PLAN_START.getTime() + i * DAY_MS);
const weekday = (d: Date) => d.toLocaleDateString('ar-JO', { timeZone: 'Asia/Amman', weekday: 'long' });
const dm = (d: Date) => d.toLocaleDateString('ar-JO', { timeZone: 'Asia/Amman', day: 'numeric', month: 'numeric' });
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString('ar-JO', { timeZone: 'Asia/Amman', weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const clean = (t: string) => t.replace(/^\[[^\]]*\]\s*/, '').replace(/^\[جماعية\]\s*/, '');
const short = (email: string) => email.split('@')[0];
const nameFor = (m?: Member | null, email?: string) => {
  const key = m?.email ? short(m.email) : email ? short(email) : '';
  return ALIAS[key] ?? m?.display_name ?? key ?? '—';
};

const STATE: Record<Item['state'], { label: string; cls: string }> = {
  done: { label: 'منجزة', cls: 'border-success/40 bg-success/10 text-foreground' },
  late: { label: 'متأخرة', cls: 'border-destructive/50 bg-destructive/10 text-foreground' },
  live: { label: 'وصلت', cls: 'border-primary/50 bg-primary/10 text-foreground' },
  scheduled: { label: 'مجدولة', cls: 'border-dashed border-border bg-card text-foreground' },
};

function useGrandPlan() {
  const [items, setItems] = useState<Item[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const from = PLAN_START.toISOString();
    const to = new Date(PLAN_START.getTime() + (PLAN_DAYS + 1) * DAY_MS).toISOString();
    const [t, m, k, c] = await Promise.all([
      db.from('team_tasks').select('id,title,details,assignee_role,assignee_user_id,status,publish_at,due_at,points,extra_requirements,completed_at')
        .gte('publish_at', from).lt('publish_at', to).order('publish_at'),
      db.from('team_members').select('user_id,email,display_name,role'),
      db.from('team_plan_marks').select('*').order('day'),
      db.from('collective_tasks').select('id,send_at,status').eq('status', 'active').order('send_at', { ascending: false }).limit(1),
    ]);
    if (t.error) toast.error(t.error.message);
    const mem = (m.data ?? []) as Member[];
    const byUser = new Map(mem.filter((x) => x.user_id).map((x) => [x.user_id!, x]));
    const now = Date.now();
    const out: Item[] = [];
    for (const r of (t.data ?? []) as TaskRow[]) {
      const extra: string[] = r.extra_requirements ?? [];
      if (extra.includes('__TEAM_DAY_OFF__') || extra.includes('__PAGE_MANAGER_FILE__')) continue;
      const sup = extra.includes(SUP_TAG);
      const member = r.assignee_user_id ? byUser.get(r.assignee_user_id) : undefined;
      let details = r.details ?? '';
      if (sup) { try { details = JSON.parse(details).details ?? ''; } catch { /* plain text */ } }
      const pub = r.publish_at as string;
      const state: Item['state'] = r.status === 'done' ? 'done' : Date.parse(pub) > now ? 'scheduled'
        : r.due_at && Date.parse(r.due_at) < now ? 'late' : 'live';
      const group = sup ? 'supervisor' : r.assignee_role;
      out.push({
        id: r.id, kind: 'task', group, day: dayIndex(pub), title: clean(r.title), details, points: r.points, state,
        lane: member?.email ?? `role:${r.assignee_role}`, laneName: member ? nameFor(member) : `أي ${GROUPS.find((g) => g.key === group)?.title ?? ''}`,
        publish: pub, due: r.due_at, done: r.completed_at,
      });
    }
    const active = (c.data ?? [])[0] as { id: string; send_at: string } | undefined;
    if (active?.send_at) {
      const { data: subs } = await db.from('collective_subtasks')
        .select('id,position,title,detail,assignee_email,day_from,status,delivered_at,due_at,completed_at').eq('task_id', active.id);
      const start = new Date(active.send_at).getTime();
      for (const s of (subs ?? []) as SubRow[]) {
        const d = dayIndex(new Date(start + (s.day_from - 1) * DAY_MS).toISOString());
        if (d < 0 || d >= PLAN_DAYS || !s.assignee_email) continue;
        const member = mem.find((x) => x.email.toLowerCase() === String(s.assignee_email).toLowerCase());
        const state: Item['state'] = s.status === 'done' ? 'done' : !s.delivered_at ? 'scheduled'
          : s.due_at && Date.parse(s.due_at) < now ? 'late' : 'live';
        out.push({
          id: s.id, kind: 'sub', group: 'programmers', day: d, title: `#${s.position} ${s.title}`, details: s.detail ?? '', points: null, state,
          lane: s.assignee_email, laneName: nameFor(member, s.assignee_email), publish: s.delivered_at, due: s.due_at, done: s.completed_at,
        });
      }
    }
    setItems(out);
    setMarks((k.data ?? []) as Mark[]);
    setMembers(mem);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => document.visibilityState === 'visible' && void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);
  return { items, marks, members, loading, reload: load };
}

export default function GrandPlan() {
  const { items, marks, members, loading, reload } = useGrandPlan();
  const [open, setOpen] = useState<Item | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [full, setFull] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const today = Math.floor((Date.now() - PLAN_START.getTime()) / DAY_MS);

  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === root.current);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  const toggleFull = () => (document.fullscreenElement ? document.exitFullscreen() : root.current?.requestFullscreen());

  const lanes = useMemo(() => {
    const out: Lane[] = [];
    for (const g of GROUPS) {
      const seen = new Map<string, string>();
      items.filter((i) => i.group === g.key).forEach((i) => seen.set(i.lane, i.laneName));
      marks.filter((k) => k.role === g.key && !k.member_email).forEach(() => {
        if (!seen.size) members.filter((m) => m.role === g.key).forEach((m) => seen.set(m.email, nameFor(m)));
      });
      [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1], 'ar')).forEach(([key, name]) => out.push({ key, name, group: g.key }));
    }
    return out;
  }, [items, marks, members]);

  const cell = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const i of items) {
      const k = `${i.lane}|${i.day}`;
      m.set(k, [...(m.get(k) ?? []), i]);
    }
    return m;
  }, [items]);
  const restFor = (lane: Lane, d: number) => {
    const iso = dayDate(d).toLocaleDateString('en-CA', { timeZone: 'Asia/Amman' });
    return marks.find((k) => k.day === iso && ((k.member_email && k.member_email === lane.key) || (!k.member_email && k.role === lane.group)));
  };

  const stats = useMemo(() => ({
    tasks: items.length,
    points: items.reduce((s, i) => s + (i.points ?? 0), 0),
    people: new Set(items.map((i) => i.lane)).size,
    done: items.filter((i) => i.state === 'done').length,
  }), [items]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>;

  return (
    <div ref={root} dir="rtl" className={`space-y-6 ${full ? 'overflow-y-auto bg-background p-6' : ''}`}>
      {/* masthead */}
      <header className="overflow-hidden rounded-3xl bg-gradient-to-l from-brand-from to-brand-to p-6 text-primary-foreground shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold opacity-90">منصة ذروة العلم · فريق العمل</p>
            <h1 className="mt-1 text-3xl font-black sm:text-4xl">المهام الكبرى</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-90">
              خطة الفريق كاملة من {weekday(dayDate(0))} {dm(dayDate(0))} إلى {weekday(dayDate(PLAN_DAYS - 1))} {dm(dayDate(PLAN_DAYS - 1))}:
              كل مهمة، لمين، وإمتى. المهام بتوصل لأصحابها الساعة ٨:٠٠ مساءً، وكل واحد بيشوف مهمته بس.
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button size="sm" variant="secondary" className="gap-1.5 rounded-xl" onClick={() => setAiOpen(true)}><Bot className="h-4 w-4" /> مساعد الجدول</Button>
            <Button size="icon" variant="secondary" className="rounded-xl" onClick={() => void reload()} aria-label="تحديث"><RefreshCw className="h-4 w-4" /></Button>
            <Button size="icon" variant="secondary" className="rounded-xl" onClick={() => window.print()} aria-label="طباعة"><Printer className="h-4 w-4" /></Button>
            <Button size="icon" variant="secondary" className="rounded-xl" onClick={toggleFull} aria-label={full ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}>
              {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: CalendarRange, label: 'مهمة مجدولة', value: stats.tasks },
            { icon: Users, label: 'عضو بالفريق', value: stats.people },
            { icon: Trophy, label: 'نقطة متاحة', value: stats.points },
            { icon: CheckCircle2, label: 'منجزة حتى الآن', value: stats.done },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl bg-primary-foreground/10 p-3 backdrop-blur-sm">
              <dt className="flex items-center gap-1.5 text-xs opacity-90"><Icon className="h-3.5 w-3.5" aria-hidden />{label}</dt>
              <dd className="mt-1 text-2xl font-black tabular-nums">{value.toLocaleString('ar')}</dd>
            </div>
          ))}
        </dl>
      </header>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {(Object.keys(STATE) as Item['state'][]).map((s) => (
          <span key={s} className={`rounded-full border px-2.5 py-1 font-semibold ${STATE[s].cls}`}>{STATE[s].label}</span>
        ))}
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 font-semibold text-muted-foreground"><Coffee className="h-3 w-3" /> استراحة</span>
        <span className="ms-auto inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> اكبس أي مهمة لتشوف نصها كامل</span>
      </div>

      {/* the table */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] border-collapse text-right">
            <thead>
              <tr>
                <th className="sticky right-0 z-20 w-44 border-b border-l border-border bg-card p-3 text-xs font-bold text-muted-foreground">الفريق</th>
                {Array.from({ length: PLAN_DAYS }, (_, d) => (
                  <th key={d} className={`border-b border-l border-border p-2 text-center text-xs ${d === today ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
                    <div className="font-bold">{weekday(dayDate(d))}</div>
                    <div className="tabular-nums opacity-80">{dm(dayDate(d))}</div>
                  </th>
                ))}
              </tr>
            </thead>
            {GROUPS.map((g) => {
                const rows = lanes.filter((l) => l.group === g.key);
                if (!rows.length) return null;
                return (
                  <tbody key={g.key}>
                    <tr>
                      <td colSpan={PLAN_DAYS + 1} className="sticky right-0 border-b border-border bg-muted/70 px-3 py-2">
                        <span className="text-sm font-black">{g.title}</span>
                        <span className="ms-2 text-xs text-muted-foreground">{g.hint} · {items.filter((i) => i.group === g.key).length.toLocaleString('ar')} مهمة</span>
                      </td>
                    </tr>
                    {rows.map((lane) => (
                      <tr key={lane.key} className="align-top">
                        <th scope="row" className="sticky right-0 z-10 border-b border-l border-border bg-card p-3 text-sm font-bold">{lane.name}</th>
                        {Array.from({ length: PLAN_DAYS }, (_, d) => {
                          const list = cell.get(`${lane.key}|${d}`) ?? [];
                          const rest = !list.length ? restFor(lane, d) : undefined;
                          return (
                            <td key={d} className={`h-16 w-28 border-b border-l border-border p-1.5 ${d === today ? 'bg-primary/5' : ''}`}>
                              {rest && (
                                <div className="flex h-full min-h-12 items-center justify-center gap-1 rounded-xl border border-border bg-[repeating-linear-gradient(135deg,hsl(var(--muted))_0_6px,transparent_6px_12px)] text-[11px] font-semibold text-muted-foreground">
                                  <Coffee className="h-3 w-3" /> {rest.kind === 'rest' ? 'استراحة' : rest.label}
                                </div>
                              )}
                              {list.map((i) => (
                                <button
                                  key={i.id}
                                  type="button"
                                  onClick={() => setOpen(i)}
                                  className={`mb-1 block w-full rounded-xl border px-2 py-1.5 text-right text-[11px] leading-snug transition hover:-translate-y-px hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${STATE[i.state].cls}`}
                                >
                                  <span className="line-clamp-2 font-semibold">{i.title}</span>
                                  {i.points ? <span className="mt-0.5 block text-[10px] text-muted-foreground">{i.points.toLocaleString('ar')} نقطة</span> : null}
                                </button>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                );
              })}
            <tfoot>
              <tr>
                <th className="sticky right-0 z-10 border-t-2 border-border bg-muted p-3 text-xs font-black">مهام اليوم</th>
                {Array.from({ length: PLAN_DAYS }, (_, d) => {
                  const n = items.filter((i) => i.day === d).length;
                  return (
                    <td key={d} className={`border-l border-t-2 border-border p-2 text-center text-sm font-black tabular-nums ${d === today ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {n ? n.toLocaleString('ar') : '—'}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <PlanText items={items} marks={marks} />

      <ItemView item={open} onClose={() => setOpen(null)} />
      {aiOpen && <PlanAssistant onClose={() => setAiOpen(false)} onChanged={() => void reload()} />}
    </div>
  );
}

/** The same schedule told as text: one paragraph per team, then each person's days. */
function PlanText({ items, marks }: { items: Item[]; marks: Mark[] }) {
  const range = (list: Item[]) => {
    const days = list.map((i) => i.day).sort((a, b) => a - b);
    return days.length ? `من ${weekday(dayDate(days[0]))} ${dm(dayDate(days[0]))} إلى ${weekday(dayDate(days[days.length - 1]))} ${dm(dayDate(days[days.length - 1]))}` : '';
  };
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-black">معلومات الجدول</h2>
      <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">
        هاي نفس الخطة مكتوبة: شو دور كل فريق، ومين عليه شو كل يوم. كل المهام بتوصل الساعة ٨:٠٠ مساءً، والمتكلمين بيوصلهم موعد زيارة اليوم الأول الصبح.
      </p>
      <div className="mt-6 space-y-8">
        {GROUPS.map((g) => {
          const list = items.filter((i) => i.group === g.key);
          if (!list.length) return null;
          const pts = list.reduce((s, i) => s + (i.points ?? 0), 0);
          const people = [...new Set(list.map((i) => i.laneName))];
          const rest = marks.filter((k) => k.role === g.key);
          return (
            <article key={g.key}>
              <h3 className="text-lg font-black">{g.title} <span className="text-sm font-semibold text-muted-foreground">· {g.hint}</span></h3>
              <p className="mt-1 leading-relaxed text-foreground/90">
                {list.length.toLocaleString('ar')} مهمة {range(list)}{pts ? `، مجموعها ${pts.toLocaleString('ar')} نقطة` : ''}، لـ {people.join('، ')}.
                {rest.length > 0 && ` استراحة: ${rest.map((k) => `${weekday(new Date(`${k.day}T12:00:00+03:00`))} ${dm(new Date(`${k.day}T12:00:00+03:00`))}`).join('، ')}.`}
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {people.map((p) => (
                  <div key={p} className="rounded-2xl bg-muted/50 p-4">
                    <div className="mb-1.5 font-bold">{p}</div>
                    <ul className="space-y-1 text-sm leading-relaxed">
                      {list.filter((i) => i.laneName === p).sort((a, b) => a.day - b.day).map((i) => (
                        <li key={i.id} className="flex gap-2">
                          <span className="w-24 shrink-0 text-muted-foreground">{weekday(dayDate(i.day))} {dm(dayDate(i.day))}</span>
                          <span>{i.title}{i.points ? ` (${i.points.toLocaleString('ar')} نقاط)` : ''}{i.state === 'done' ? ' ✓' : ''}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ItemView({ item, onClose }: { item: Item | null; onClose: () => void }) {
  if (!item) return null;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto rounded-3xl text-right" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription className="text-right">
            {item.laneName} · {weekday(dayDate(item.day))} {dm(dayDate(item.day))}{item.points ? ` · ${item.points.toLocaleString('ar')} نقطة` : ''}
          </DialogDescription>
        </DialogHeader>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${STATE[item.state].cls}`}>{STATE[item.state].label}</span>
        <dl className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl bg-muted p-2"><dt className="text-muted-foreground">{item.kind === 'sub' ? 'وصلت' : 'تُرسل'}</dt><dd className="font-semibold">{when(item.publish)}</dd></div>
          <div className="rounded-xl bg-muted p-2"><dt className="text-muted-foreground">الموعد</dt><dd className="font-semibold">{when(item.due)}</dd></div>
          <div className="rounded-xl bg-muted p-2"><dt className="text-muted-foreground">أُنجزت</dt><dd className="font-semibold">{when(item.done)}</dd></div>
        </dl>
        {item.details && <div className="whitespace-pre-wrap rounded-2xl bg-muted/60 p-4 text-sm leading-relaxed">{item.details}</div>}
      </DialogContent>
    </Dialog>
  );
}

type Turn = { role: 'user' | 'assistant'; content: string };
const QUICK = ['شو مهام بكرة؟', 'مين عنده أكثر نقاط بالجدول؟', 'لخّصلي الخطة لمدير المدرسة بفقرة', 'ضيف استراحة للمدققين يوم الجمعة 4/12'];

function PlanAssistant({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const [msgs, setMsgs] = useState<Turn[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [msgs, busy]);

  const ask = async (q: string) => {
    const content = q.trim();
    if (!content || busy) return;
    const next: Turn[] = [...msgs, { role: 'user', content }];
    setMsgs(next);
    setText('');
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('grand-plan-ai', { body: { messages: next } });
      if (error) throw error;
      setMsgs([...next, { role: 'assistant', content: data?.reply ?? data?.error ?? '—' }]);
      if (data?.changed) onChanged();
    } catch (e) {
      setMsgs([...next, { role: 'assistant', content: `تعذّر الرد: ${(e as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col border-r border-border bg-card shadow-2xl print:hidden" dir="rtl" aria-label="مساعد المهام الكبرى">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-l from-brand-from to-brand-to text-primary-foreground"><Bot className="h-5 w-5" /></span>
        <div className="flex-1">
          <div className="font-bold">مساعد المهام الكبرى</div>
          <div className="text-[11px] text-muted-foreground">بيعرف الجدول كامل، وبيعدّل المهام اللي لسا ما وصلت</div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent" aria-label="إغلاق"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {msgs.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">اسأل عن أي إشي بالجدول، أو اطلب تعديل مثل: «انقل مهمة علي تاعت الجمعة للسبت» أو «خلّي نقاط زيارة أبو عبيدة 30».</p>
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => void ask(q)} className="flex w-full items-center gap-2 rounded-2xl border border-border p-2.5 text-right text-sm hover:border-primary/40 hover:bg-accent">
                <Sparkles className="h-4 w-4 text-primary" /> {q}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'ms-8 bg-primary text-primary-foreground' : 'me-8 bg-muted'}`}>{m.content}</div>
        ))}
        {busy && <div className="me-8 inline-flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> بيفحص الجدول…</div>}
        <div ref={end} />
      </div>
      <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); void ask(text); }}>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب سؤالك أو التعديل…" aria-label="رسالة لمساعد المهام الكبرى" />
        <Button type="submit" size="icon" className="shrink-0 rounded-xl" disabled={busy || !text.trim()} aria-label="إرسال"><Send className="h-4 w-4" /></Button>
      </form>
    </aside>
  );
}
