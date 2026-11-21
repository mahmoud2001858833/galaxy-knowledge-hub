import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot, CalendarDays, CheckCircle2, Clock, Hourglass, Link2, ListChecks, Loader2, Lock, Pencil, RefreshCw, Send, Sparkles, X,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  WEEKDAYS, listTasks, loadTask, scheduleAi, teamEmails, timingOf, updateMemberWindow, updateSubtask,
  type ChatTurn, type CollectiveMember, type CollectiveTask, type Subtask,
} from '@/components/admin/collective/collectiveApi';
import { formatLeft, useNow } from '@/components/team/TaskCountdown';

/**
 * «جدول المبرمجين»: the timed collective work as a timetable. Who works when (today's track with a live
 * "now" line), what each person gets each day and in which order, live countdowns, inline edits, and an AI
 * that reads the live schedule, reassures the admin, and edits windows and tasks on request.
 */

const DAY_MS = 86_400_000;
const hm = (t: string) => t.slice(0, 5);
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const ammanParts = (d: Date) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Amman', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' })
      .formatToParts(d).map((x) => [x.type, x.value]),
  );
  return { minutes: Number(p.hour) * 60 + Number(p.minute), dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday) };
};
const dayLabel = (d: Date) => d.toLocaleDateString('ar-JO', { timeZone: 'Asia/Amman', weekday: 'long', day: 'numeric', month: 'numeric' });
const clock = (iso: string) => new Date(iso).toLocaleTimeString('ar-JO', { timeZone: 'Asia/Amman', hour: '2-digit', minute: '2-digit' });

const TONE: Record<ReturnType<typeof timingOf>['tone'], string> = {
  ok: 'border-success/40 bg-success/10 text-success',
  late: 'border-destructive/40 bg-destructive/10 text-destructive',
  wait: 'border-border bg-muted text-muted-foreground',
  work: 'border-primary/40 bg-primary/10 text-primary',
  idle: 'border-border bg-card text-muted-foreground',
};

export default function ProgrammersSchedule() {
  const [tasks, setTasks] = useState<CollectiveTask[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [data, setData] = useState<{ task: CollectiveTask; members: CollectiveMember[]; subtasks: Subtask[] } | null>(null);
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const now = useNow(1000);

  useEffect(() => {
    listTasks()
      .then((all) => {
        const live = all.filter((t) => ['active', 'scheduled', 'planned'].includes(t.status));
        setTasks(live);
        setTaskId((cur) => cur ?? (live.find((t) => t.status === 'active') ?? live[0])?.id ?? null);
        if (!live.length) setLoading(false);
      })
      .catch((e) => { toast.error(e.message); setLoading(false); });
    teamEmails().then((ps) => setNames(new Map(ps.map((p) => [p.email.toLowerCase(), p.name ?? p.email.split('@')[0]])))).catch(() => {});
  }, []);

  const reload = useCallback(async () => {
    if (!taskId) return;
    try {
      const r = await loadTask(taskId);
      if (r.task) setData({ task: r.task, members: r.members, subtasks: r.subtasks });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [taskId]);
  useEffect(() => {
    reload();
    const id = window.setInterval(reload, 30_000);
    return () => window.clearInterval(id);
  }, [reload]);

  const nameOf = useCallback((email: string | null) => (email ? names.get(email.toLowerCase()) ?? email.split('@')[0] : '—'), [names]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!data) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
        لا توجد مهمة جماعية مُوقّتة حالياً. أنشئ واحدة من «المهام الجماعية».
      </div>
    );
  }

  const { task, members, subtasks } = data;
  const people = [...members].sort((a, b) => a.work_start.localeCompare(b.work_start));
  const start = task.send_at ? new Date(task.send_at).getTime() : null;
  const today = start ? Math.floor((now - start) / DAY_MS) + 1 : 0;
  const days = Array.from({ length: task.duration_days }, (_, i) => i + 1);

  return (
    <div className="space-y-5" dir="rtl">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-l from-brand-from to-brand-to text-primary-foreground">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold">جدول المبرمجين</h2>
          <p className="text-xs text-muted-foreground">
            {task.status === 'active' && today >= 1 ? `اليوم ${Math.min(today, task.duration_days).toLocaleString('ar')} من ${task.duration_days.toLocaleString('ar')}` : 'لم تبدأ بعد'}
            {' · '}الساعة الآن {new Date(now).toLocaleTimeString('ar-JO', { timeZone: 'Asia/Amman', hour: '2-digit', minute: '2-digit' })} (عمّان)
          </p>
        </div>
        {tasks.length > 1 && (
          <select
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            value={taskId ?? ''}
            onChange={(e) => { setLoading(true); setTaskId(e.target.value); }}
            aria-label="اختر المهمة الجماعية"
          >
            {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        )}
        {tasks.length <= 1 && <span className="max-w-xs truncate text-sm font-semibold">{task.title}</span>}
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={reload}>
          <RefreshCw className="h-4 w-4" aria-hidden /> تحديث
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-5">
          <TodayTrack people={people} subtasks={subtasks} today={today} now={now} nameOf={nameOf} />
          <DaysGrid
            task={task} people={people} subtasks={subtasks} days={days} today={today} now={now} nameOf={nameOf} onChanged={reload}
          />
          <AllTasks subtasks={subtasks} start={start} nameOf={nameOf} />
          <HoursEditor people={people} nameOf={nameOf} onChanged={reload} />
        </div>
        <ScheduleAssistant taskId={task.id} onChanged={reload} />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ today's track
function TodayTrack({ people, subtasks, today, now, nameOf }: {
  people: CollectiveMember[]; subtasks: Subtask[]; today: number; now: number; nameOf: (e: string | null) => string;
}) {
  if (!people.length) return null;
  const from = Math.min(...people.map((p) => toMin(p.work_start)));
  const to = Math.max(...people.map((p) => toMin(p.work_end)));
  const span = Math.max(60, to - from);
  const { minutes, dow } = ammanParts(new Date(now));
  const nowPct = ((minutes - from) / span) * 100;
  const hours = Array.from({ length: Math.floor(span / 60) + 1 }, (_, i) => from + i * 60);

  return (
    <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 font-bold"><Clock className="h-4 w-4 text-primary" aria-hidden /> مسار اليوم</h3>
      <div className="space-y-2">
        <div className="relative me-0 ms-[7.5rem] h-5 text-[10px] text-muted-foreground" dir="ltr">
          {hours.map((h) => (
            <span key={h} className="absolute -translate-x-1/2" style={{ left: `${((h - from) / span) * 100}%` }}>
              {String(Math.floor(h / 60) % 24).padStart(2, '0')}:00
            </span>
          ))}
        </div>
        {people.map((p) => {
          const works = p.work_days.includes(dow);
          const left = ((toMin(p.work_start) - from) / span) * 100;
          const width = ((toMin(p.work_end) - toMin(p.work_start)) / span) * 100;
          const mine = subtasks.filter((s) => s.assignee_email?.toLowerCase() === p.email.toLowerCase() && s.day_from === today);
          const inside = works && minutes >= toMin(p.work_start) && minutes < toMin(p.work_end);
          return (
            <div key={p.id} className="flex items-center gap-2">
              <div className="w-28 shrink-0 text-right">
                <div className="truncate text-sm font-semibold">{nameOf(p.email)}</div>
                <div className="text-[10px] text-muted-foreground" dir="ltr">{hm(p.work_start)}–{hm(p.work_end)}</div>
              </div>
              <div className="relative h-12 flex-1 rounded-xl bg-muted" dir="ltr">
                {works && (
                  <div
                    className={`absolute inset-y-1 flex items-center overflow-hidden rounded-lg border px-2 text-[11px] ${inside ? 'border-primary bg-primary/15 ring-2 ring-primary/30' : 'border-border bg-card'}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    dir="rtl"
                  >
                    {mine.length ? (
                      <span className="truncate">
                        <b>#{mine[0].position}</b> {mine[0].title} · <span className="text-muted-foreground">{timingOf(mine[0]).label}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">لا مهمة اليوم</span>
                    )}
                  </div>
                )}
                {!works && <div className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground">إجازة اليوم</div>}
                {nowPct >= 0 && nowPct <= 100 && (
                  <div className="absolute inset-y-0 w-0.5 bg-destructive" style={{ left: `${nowPct}%` }} aria-hidden />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">الخط الأحمر = الآن. المهمة تصل لصاحبها داخل وقته فقط، وبعد أن يُنهي من قبله ما تعتمد عليه.</p>
    </section>
  );
}

// ------------------------------------------------------------------ the day-by-day grid
function DaysGrid({ task, people, subtasks, days, today, now, nameOf, onChanged }: {
  task: CollectiveTask; people: CollectiveMember[]; subtasks: Subtask[]; days: number[]; today: number; now: number;
  nameOf: (e: string | null) => string; onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Subtask | null>(null);
  const [viewing, setViewing] = useState<Subtask | null>(null);
  const start = task.send_at ? new Date(task.send_at).getTime() : null;
  const byPos = useMemo(() => new Map(subtasks.map((s) => [s.position, s])), [subtasks]);
  const done = subtasks.filter((s) => s.status === 'done').length;

  return (
    <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-2 font-bold"><CalendarDays className="h-4 w-4 text-primary" aria-hidden /> الجدول يوماً بيوم</h3>
        <span className="text-xs text-muted-foreground">أُنجز {done.toLocaleString('ar')} من {subtasks.length.toLocaleString('ar')}</span>
        <div className="ms-auto h-2 w-40 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-gradient-to-l from-brand-from to-brand-to" style={{ width: `${subtasks.length ? (done / subtasks.length) * 100 : 0}%` }} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-1.5 text-right">
          <thead>
            <tr>
              <th className="w-28 text-xs font-semibold text-muted-foreground">المبرمج</th>
              {days.map((d) => (
                <th key={d} className={`rounded-xl px-2 py-1.5 text-xs font-semibold ${d === today ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  اليوم {d.toLocaleString('ar')}
                  {start && <span className="block text-[10px] font-normal opacity-80">{dayLabel(new Date(start + (d - 1) * DAY_MS))}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id}>
                <td className="align-top">
                  <div className="text-sm font-semibold">{nameOf(p.email)}</div>
                  <div className="text-[10px] text-muted-foreground" dir="ltr">{hm(p.work_start)}–{hm(p.work_end)}</div>
                </td>
                {days.map((d) => {
                  const cell = subtasks.filter((s) => s.assignee_email?.toLowerCase() === p.email.toLowerCase() && s.day_from === d);
                  return (
                    <td key={d} className={`align-top ${d === today ? 'rounded-xl bg-primary/5' : ''}`}>
                      {cell.length === 0 && <div className="py-3 text-center text-[11px] text-muted-foreground">—</div>}
                      {cell.map((s) => (
                        <SubCard key={s.id} s={s} byPos={byPos} now={now} nameOf={nameOf} onEdit={() => setEditing(s)} onOpen={() => setViewing(s)} />
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SubtaskView s={viewing} start={start} nameOf={nameOf} onClose={() => setViewing(null)} />
      {editing && (
        <SubtaskEditor
          s={editing} people={people} days={days} nameOf={nameOf}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }}
        />
      )}
    </section>
  );
}

function SubCard({ s, byPos, now, nameOf, onEdit, onOpen }: {
  s: Subtask; byPos: Map<number, Subtask>; now: number; nameOf: (e: string | null) => string; onEdit: () => void; onOpen: () => void;
}) {
  const t = timingOf(s);
  const open = s.delivered_at && s.status !== 'done' && s.due_at;
  const left = open ? new Date(s.due_at!).getTime() - now : null;
  const blockers = s.depends_on.map((p) => byPos.get(p)).filter((b): b is Subtask => !!b && b.status !== 'done');
  return (
    <div className={`mb-1.5 rounded-xl border p-2 text-[11px] leading-relaxed ${TONE[t.tone]}`}>
      <div className="flex items-start gap-1">
        <span className="font-bold text-foreground">#{s.position}</span>
        <button type="button" onClick={onOpen} className="flex-1 text-start font-semibold text-foreground underline-offset-2 hover:underline">
          {s.title}
        </button>
        {!s.delivered_at && (
          <button type="button" onClick={onEdit} className="rounded p-0.5 text-muted-foreground hover:bg-accent" aria-label={`تعديل #${s.position}`}>
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        {s.status === 'done' ? <CheckCircle2 className="h-3 w-3" aria-hidden /> : s.delivered_at ? <Hourglass className="h-3 w-3" aria-hidden /> : <Lock className="h-3 w-3" aria-hidden />}
        <span>{t.label}</span>
        {left !== null && (
          <span className="rounded-full bg-card px-1.5 font-bold tabular-nums">{left > 0 ? `متبقٍ ${formatLeft(left)}` : 'انتهى الوقت'}</span>
        )}
        {s.status === 'done' && s.completed_at && <span className="text-muted-foreground">{clock(s.completed_at)}</span>}
      </div>
      {s.depends_on.length > 0 && (
        <div className="mt-0.5 flex items-center gap-1 text-muted-foreground">
          <Link2 className="h-3 w-3" aria-hidden />
          بعد {s.depends_on.map((p) => `#${p}`).join(' ')}
          {blockers.length > 0 && !s.delivered_at && <span>· ينتظر {blockers.map((b) => nameOf(b.assignee_email)).join('، ')}</span>}
        </div>
      )}
    </div>
  );
}

/** Everything a programmer received for one task: the full text, checks, timing — also for past days. */
function SubtaskView({ s, start, nameOf, onClose }: {
  s: Subtask | null; start: number | null; nameOf: (e: string | null) => string; onClose: () => void;
}) {
  if (!s) return null;
  const t = timingOf(s);
  const date = start ? dayLabel(new Date(start + (s.day_from - 1) * DAY_MS)) : '';
  const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString('ar-JO', { timeZone: 'Asia/Amman', dateStyle: 'medium', timeStyle: 'short' }) : '—');
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto rounded-3xl text-right" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>#{s.position} {s.title}</DialogTitle>
          <DialogDescription className="text-right">
            {nameOf(s.assignee_email)} · اليوم {s.day_from.toLocaleString('ar')}{date ? ` (${date})` : ''}
            {s.effort_hours ? ` · نحو ${s.effort_hours.toLocaleString('ar')} ساعة` : ''}
            {s.depends_on.length ? ` · بعد ${s.depends_on.map((p) => `#${p}`).join(' ')}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${TONE[t.tone]}`}>{t.label}</div>
        <dl className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl bg-muted p-2"><dt className="text-muted-foreground">وصلت</dt><dd className="font-semibold">{when(s.delivered_at)}</dd></div>
          <div className="rounded-xl bg-muted p-2"><dt className="text-muted-foreground">الموعد</dt><dd className="font-semibold">{when(s.due_at)}</dd></div>
          <div className="rounded-xl bg-muted p-2"><dt className="text-muted-foreground">أُنجزت</dt><dd className="font-semibold">{when(s.completed_at)}</dd></div>
        </dl>
        {s.postponed_reason && s.status !== 'done' && (
          <p className="rounded-xl border border-border bg-card p-2 text-xs text-muted-foreground">مؤجّلة: {s.postponed_reason}</p>
        )}
        {s.detail && <div className="whitespace-pre-wrap rounded-2xl bg-muted/60 p-4 text-sm leading-relaxed">{s.detail}</div>}
        {s.acceptance.length > 0 && (
          <div>
            <h4 className="mb-1.5 text-sm font-bold">تُعتبر منجزة عندما</h4>
            <ul className="space-y-1 text-sm">
              {s.acceptance.map((a) => (
                <li key={a} className="flex gap-2"><CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${s.status === 'done' ? 'text-success' : 'text-muted-foreground'}`} aria-hidden />{a}</li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Every task of the collective work in one list, day by day: what was sent, to whom, and how it went. */
function AllTasks({ subtasks, start, nameOf }: { subtasks: Subtask[]; start: number | null; nameOf: (e: string | null) => string }) {
  const [filter, setFilter] = useState<'all' | 'sent' | 'coming'>('all');
  const [viewing, setViewing] = useState<Subtask | null>(null);
  const rows = [...subtasks]
    .sort((a, b) => a.day_from - b.day_from || a.position - b.position)
    .filter((s) => (filter === 'all' ? true : filter === 'sent' ? !!s.delivered_at : !s.delivered_at));
  const sent = subtasks.filter((s) => s.delivered_at).length;
  const short = (iso: string | null) => (iso ? new Date(iso).toLocaleString('ar-JO', { timeZone: 'Asia/Amman', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
  return (
    <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-2 font-bold"><ListChecks className="h-4 w-4 text-primary" aria-hidden /> كل المهام</h3>
        <span className="text-xs text-muted-foreground">وصل منها {sent.toLocaleString('ar')} من {subtasks.length.toLocaleString('ar')} · اكبس أي مهمة لتشوف نصها كامل</span>
        <div className="ms-auto flex gap-1 rounded-xl bg-muted p-1 text-xs">
          {([['all', 'الكل'], ['sent', 'المرسلة'], ['coming', 'القادمة']] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setFilter(k)} aria-pressed={filter === k}
              className={`rounded-lg px-3 py-1 font-semibold ${filter === k ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-right text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-2 font-semibold">#</th>
              <th className="p-2 font-semibold">اليوم</th>
              <th className="p-2 font-semibold">المبرمج</th>
              <th className="p-2 font-semibold">المهمة</th>
              <th className="p-2 font-semibold">الحالة</th>
              <th className="p-2 font-semibold">وصلت</th>
              <th className="p-2 font-semibold">أُنجزت</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const t = timingOf(s);
              return (
                <tr key={s.id} onClick={() => setViewing(s)} className="cursor-pointer border-b border-border/60 hover:bg-accent/50">
                  <td className="p-2 tabular-nums text-muted-foreground">{s.position}</td>
                  <td className="whitespace-nowrap p-2 text-xs">
                    اليوم {s.day_from.toLocaleString('ar')}
                    {start && <span className="block text-[10px] text-muted-foreground">{dayLabel(new Date(start + (s.day_from - 1) * DAY_MS))}</span>}
                  </td>
                  <td className="whitespace-nowrap p-2">{nameOf(s.assignee_email)}</td>
                  <td className="p-2">
                    <button type="button" className="text-start font-semibold underline-offset-2 hover:underline" onClick={(e) => { e.stopPropagation(); setViewing(s); }}>{s.title}</button>
                  </td>
                  <td className="p-2"><span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TONE[t.tone]}`}>{t.label}</span></td>
                  <td className="whitespace-nowrap p-2 text-xs tabular-nums text-muted-foreground">{short(s.delivered_at)}</td>
                  <td className="whitespace-nowrap p-2 text-xs tabular-nums text-muted-foreground">{short(s.completed_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <SubtaskView s={viewing} start={start} nameOf={nameOf} onClose={() => setViewing(null)} />
    </section>
  );
}

function SubtaskEditor({ s, people, days, nameOf, onClose, onSaved }: {
  s: Subtask; people: CollectiveMember[]; days: number[]; nameOf: (e: string | null) => string; onClose: () => void; onSaved: () => void;
}) {
  const [title, setTitle] = useState(s.title);
  const [detail, setDetail] = useState(s.detail ?? '');
  const [day, setDay] = useState(s.day_from);
  const [owner, setOwner] = useState(s.assignee_email ?? '');
  const [deps, setDeps] = useState(s.depends_on.join(' '));
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await updateSubtask(s.id, {
        title: title.trim() || s.title,
        detail,
        day_from: day,
        day_to: day,
        assignee_email: owner || null,
        depends_on: deps.split(/[\s,،#]+/).map(Number).filter((n) => Number.isInteger(n) && n > 0 && n !== s.position),
      });
      toast.success(`حُفظت #${s.position}`);
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-3 space-y-2 rounded-2xl border border-primary/30 bg-background p-3">
      <div className="flex items-center gap-2">
        <b className="text-sm">تعديل #{s.position}</b>
        <span className="text-[11px] text-muted-foreground">يمكن التعديل قبل أن تصل لصاحبها</span>
        <button type="button" onClick={onClose} className="ms-auto rounded p-1 hover:bg-accent" aria-label="إغلاق"><X className="h-4 w-4" /></button>
      </div>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="العنوان" />
      <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} aria-label="التفاصيل" />
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="text-xs">اليوم
          <select className="mt-1 w-full rounded-xl border border-border bg-background px-2 py-1.5 text-sm" value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {days.map((d) => <option key={d} value={d}>اليوم {d}</option>)}
          </select>
        </label>
        <label className="text-xs">صاحبها
          <select className="mt-1 w-full rounded-xl border border-border bg-background px-2 py-1.5 text-sm" value={owner} onChange={(e) => setOwner(e.target.value)}>
            {people.map((p) => <option key={p.id} value={p.email}>{nameOf(p.email)}</option>)}
          </select>
        </label>
        <label className="text-xs">تعتمد على (أرقام)
          <Input className="mt-1" value={deps} onChange={(e) => setDeps(e.target.value)} placeholder="مثلاً 3 4" dir="ltr" />
        </label>
      </div>
      <Button size="sm" className="rounded-xl" onClick={save} disabled={busy}>
        {busy && <Loader2 className="me-1 h-4 w-4 animate-spin" />} احفظ
      </Button>
    </div>
  );
}

// ------------------------------------------------------------------ work hours
function HoursEditor({ people, nameOf, onChanged }: { people: CollectiveMember[]; nameOf: (e: string | null) => string; onChanged: () => void }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 font-bold"><Clock className="h-4 w-4 text-primary" aria-hidden /> أوقات العمل</h3>
      <div className="space-y-2">
        {people.map((p) => <HoursRow key={p.id} m={p} name={nameOf(p.email)} onChanged={onChanged} />)}
      </div>
    </section>
  );
}

function HoursRow({ m, name, onChanged }: { m: CollectiveMember; name: string; onChanged: () => void }) {
  const [from, setFrom] = useState(hm(m.work_start));
  const [to, setTo] = useState(hm(m.work_end));
  const [days, setDays] = useState<number[]>(m.work_days);
  const [busy, setBusy] = useState(false);
  const dirty = from !== hm(m.work_start) || to !== hm(m.work_end) || days.join() !== m.work_days.join();
  const save = async () => {
    setBusy(true);
    try {
      await updateMemberWindow(m.id, { work_start: from, work_end: to, work_days: [...days].sort() });
      toast.success(`حُفظ وقت ${name}`);
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border p-2">
      <span className="w-24 truncate text-sm font-semibold">{name}</span>
      <Input type="time" value={from} onChange={(e) => setFrom(e.target.value)} className="w-28" aria-label={`بداية وقت ${name}`} />
      <span className="text-xs text-muted-foreground">إلى</span>
      <Input type="time" value={to} onChange={(e) => setTo(e.target.value)} className="w-28" aria-label={`نهاية وقت ${name}`} />
      <div className="flex flex-wrap gap-1">
        {WEEKDAYS.map((w, i) => (
          <button
            key={w}
            type="button"
            onClick={() => setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))}
            className={`rounded-lg px-2 py-1 text-[11px] ${days.includes(i) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            aria-pressed={days.includes(i)}
          >
            {w}
          </button>
        ))}
      </div>
      {dirty && (
        <Button size="sm" className="ms-auto rounded-xl" onClick={save} disabled={busy}>
          {busy && <Loader2 className="me-1 h-4 w-4 animate-spin" />} احفظ
        </Button>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ the AI
const QUICK = ['طمّني على الشغل', 'مين متأخر أو مؤجّل؟', 'شو الجاي اليوم ومتى؟', 'ذكّر اللي عليه مهمة هلأ'];

function ScheduleAssistant({ taskId, onChanged }: { taskId: string; onChanged: () => void }) {
  const [msgs, setMsgs] = useState<ChatTurn[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { setMsgs([]); }, [taskId]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [msgs, busy]);

  const ask = async (q: string) => {
    const content = q.trim();
    if (!content || busy) return;
    const next: ChatTurn[] = [...msgs, { role: 'user', content }];
    setMsgs(next);
    setText('');
    setBusy(true);
    try {
      const r = await scheduleAi(taskId, next);
      setMsgs([...next, { role: 'assistant', content: r.reply || '—' }]);
      if (r.changed) onChanged();
    } catch (e) {
      setMsgs([...next, { role: 'assistant', content: `تعذّر الرد: ${(e as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="flex h-[640px] flex-col rounded-3xl border border-border bg-card shadow-sm xl:sticky xl:top-4">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-l from-brand-from to-brand-to text-primary-foreground">
          <Bot className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <div className="font-bold">مساعد الجدول</div>
          <div className="text-[11px] text-muted-foreground">يعرف الجدول لحظة بلحظة، يطمّنك، ويعدّل الأوقات والمهام إذا طلبت</div>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {msgs.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">اسألني أي إشي عن سير الشغل، أو اطلب تعديل مثل: «خلّي وقت يمان من 5 لـ 7» أو «انقل #9 لليوم الخامس».</p>
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => ask(q)} className="flex w-full items-center gap-2 rounded-2xl border border-border p-2.5 text-right text-sm hover:border-primary/40 hover:bg-accent">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden /> {q}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'ms-8 bg-primary text-primary-foreground' : 'me-8 bg-muted'}`}
          >
            {m.content}
          </div>
        ))}
        {busy && <div className="me-8 inline-flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> يفحص الجدول…</div>}
        <div ref={end} />
      </div>
      <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); ask(text); }}>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب سؤالك أو التعديل…" aria-label="رسالة لمساعد الجدول" />
        <Button type="submit" size="icon" className="shrink-0 rounded-xl" disabled={busy || !text.trim()} aria-label="إرسال">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </aside>
  );
}
