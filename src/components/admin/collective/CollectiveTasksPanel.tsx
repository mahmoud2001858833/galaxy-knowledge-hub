import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, BrainCircuit, CalendarClock, CheckCircle2, Loader2, Mail, Plus, Save, Send, ShieldAlert, Trash2, Users, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  APPROVAL_LABEL, STATUS_LABEL, addSubtask, cancelTask, deleteSubtask, deleteTask, generatePlan, isEditable, listTasks,
  loadTask, resendToday, parseEmails, saveTask, schedule, sendNow, setMembers, setPostponePolicy, teamEmails, timingOf, unschedule,
  updateMemberWindow, updateSubtask, WEEKDAYS,
  type ApprovalRule, type CollectiveMember, type CollectiveTask, type PostponePolicy, type Subtask, type TaskDraft, type TickReport,
} from './collectiveApi';
import { AssistBox } from './AssistBox';

/**
 * المهام الجماعية: the admin gives one big task to a group. Phase 1: write it, let the AI plan it
 * day by day with one owner per subtask, review/edit the plan, then schedule the emails or send now.
 * Separate from the everyday team tasks. Later phases add the Local View, group approval and publish-all.
 */

const errText = (e: unknown) => (e instanceof Error ? e.message : String(e));
const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('ar-JO', { timeZone: 'Asia/Amman', dateStyle: 'medium', timeStyle: 'short' }) : '—';
/** value for <input type="datetime-local"> in the browser's own time zone */
const toLocalInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'outline', planned: 'secondary', scheduled: 'secondary', active: 'default',
  review: 'secondary', approved: 'default', published: 'default', cancelled: 'destructive',
};

const EMPTY: TaskDraft = { title: '', goals: '', final_vision: '', duration_days: 7, approval_rule: 'members_then_admin', planner_notes: '' };

export default function CollectiveTasksPanel() {
  const [tasks, setTasks] = useState<CollectiveTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null | 'new'>(null);

  const refresh = useCallback(async () => {
    try { setTasks(await listTasks()); } catch (e) { toast.error(errText(e)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  if (openId) {
    return (
      <TaskEditor
        taskId={openId === 'new' ? null : openId}
        onBack={() => { setOpenId(null); refresh(); }}
        onCreated={(id) => setOpenId(id)}
      />
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card p-5">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Users className="h-5 w-5 text-primary" /> المهام الجماعية
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            مهمة كبيرة لفريق كامل: تكتب الأهداف والتصور النهائي والمدة والأشخاص، والذكاء الاصطناعي يبني خطة يومية دقيقة
            بمسؤول واحد لكل مهمة فرعية، ثم تُرسل للجميع في الوقت الذي تحدده. منفصلة عن مهام الفريق اليومية.
          </p>
        </div>
        <Button onClick={() => setOpenId('new')}><Plus className="ml-1 h-4 w-4" /> مهمة جماعية جديدة</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          لا توجد مهام جماعية بعد. ابدأ بأول مهمة.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => setOpenId(t.id)}
              className="rounded-2xl border border-border bg-card p-4 text-right transition hover:border-primary"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-foreground">{t.title}</div>
                <Badge variant={STATUS_VARIANT[t.status]}>{STATUS_LABEL[t.status]}</Badge>
              </div>
              <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">{t.goals}</div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>{t.duration_days} يوم</span>
                <span>الإرسال: {fmt(t.send_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ editor
function TaskEditor({ taskId, onBack, onCreated }: { taskId: string | null; onBack: () => void; onCreated: (id: string) => void }) {
  const [task, setTask] = useState<CollectiveTask | null>(null);
  const [members, setMembersState] = useState<CollectiveMember[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [draft, setDraft] = useState<TaskDraft>(EMPTY);
  const [emailsText, setEmailsText] = useState('');
  const [focus, setFocus] = useState<Record<string, string>>({});
  const [team, setTeam] = useState<{ email: string; role: string; name: string | null }[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [sendAt, setSendAt] = useState(() => toLocalInput(new Date(Date.now() + 60 * 60_000)));

  const reload = useCallback(async () => {
    if (!taskId) return;
    const r = await loadTask(taskId);
    if (!r.task) return;
    setTask(r.task);
    setMembersState(r.members);
    setSubtasks(r.subtasks);
    setDraft({
      title: r.task.title, goals: r.task.goals, final_vision: r.task.final_vision,
      duration_days: r.task.duration_days, approval_rule: r.task.approval_rule, planner_notes: r.task.planner_notes ?? '',
    });
    setEmailsText(r.members.map((m) => m.email).join('\n'));
    setFocus(Object.fromEntries(r.members.map((m) => [m.email, m.focus ?? ''])));
    if (r.task.send_at) setSendAt(toLocalInput(new Date(r.task.send_at)));
  }, [taskId]);

  useEffect(() => { reload().catch((e) => toast.error(errText(e))); }, [reload]);
  useEffect(() => { teamEmails().then(setTeam).catch(() => undefined); }, []);

  const editable = !task || isEditable(task.status);
  const emails = useMemo(() => parseEmails(emailsText), [emailsText]);
  const teamSet = useMemo(() => new Set(team.map((t) => t.email)), [team]);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    try { await fn(); } catch (e) { toast.error(errText(e)); } finally { setBusy(null); }
  };

  const valid = draft.title.trim().length >= 3 && draft.goals.trim().length >= 3 && draft.final_vision.trim().length >= 3
    && draft.duration_days >= 1 && draft.duration_days <= 90;

  const persist = async () => {
    if (!valid) throw new Error('اكتب العنوان والأهداف والتصور النهائي، والمدة بين 1 و90 يوماً');
    if (!emails.length) throw new Error('أضف بريداً إلكترونياً واحداً على الأقل');
    const id = await saveTask(task?.id ?? null, { ...draft, planner_notes: draft.planner_notes.trim() });
    await setMembers(id, emails.map((e) => ({ email: e, focus: focus[e]?.trim() || null })));
    return id;
  };

  const save = () => run('save', async () => {
    const id = await persist();
    toast.success('تم الحفظ');
    if (!task) onCreated(id); else await reload();
  });

  /** One click from the chat: save the form, build the plan, show it. */
  const saveAndPlan = () => run('plan', async () => {
    const id = await persist();
    const r = await generatePlan(id);
    toast.success(`الخطة جاهزة: ${r.subtasks} مهمة فرعية — انزل لقسم «الخطة»`);
    if (!task) onCreated(id); else await reload();
    setTimeout(() => document.getElementById('collective-plan')?.scrollIntoView({ behavior: 'smooth' }), 400);
  });

  const plan = () => run('plan', async () => {
    if (!task) throw new Error('احفظ المهمة أولاً');
    const r = await generatePlan(task.id);
    toast.success(`الخطة جاهزة: ${r.subtasks} مهمة فرعية (${r.model})`);
    await reload();
  });

  const doSchedule = () => run('schedule', async () => {
    if (!task) return;
    const when = new Date(sendAt);
    if (Number.isNaN(when.getTime())) throw new Error('اختر تاريخ ووقت الإرسال');
    await schedule(task.id, when);
    toast.success(`ستُرسل المهمة ${fmt(when.toISOString())}`);
    await reload();
  });

  const doSendNow = () => run('send', async () => {
    if (!task) return;
    const r = await sendNow(task.id);
    toast.success(`بدأت المهمة: ${tickSummary(r.report)}. الباقي يصل تلقائياً لكل شخص في وقته وحسب الترتيب.`);
    await reload();
  });

  const doResend = () => run('resend', async () => {
    if (!task) return;
    const r = await resendToday(task.id);
    const reminders = Object.entries(r.report).filter(([k]) => k.startsWith('#'));
    toast.success(`${tickSummary(r.report.tick)} · تذكير بالبريد لـ ${reminders.length} مهمة مفتوحة`);
    await reload();
  });

  const byPerson = useMemo(() => {
    const m = new Map<string, Subtask[]>();
    for (const s of subtasks) {
      const k = s.assignee_email ?? '—';
      m.set(k, [...(m.get(k) ?? []), s]);
    }
    return [...m.entries()];
  }, [subtasks]);

  const loadPct = (n: number) => (subtasks.length ? Math.round((n / subtasks.length) * 100) : 0);

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}><ArrowRight className="ml-1 h-4 w-4" /> كل المهام الجماعية</Button>
        {task && <Badge variant={STATUS_VARIANT[task.status]}>{STATUS_LABEL[task.status]}</Badge>}
      </div>

      {editable && (
        <AssistBox
          current={{
            ...draft,
            people: emails.map((e) => ({ email: e, focus: focus[e] ?? '' })),
            send_at_local: sendAt,
          }}
          onApply={(d) => {
            setDraft({
              title: d.title || draft.title,
              goals: d.goals || draft.goals,
              final_vision: d.final_vision || draft.final_vision,
              duration_days: d.duration_days || draft.duration_days,
              approval_rule: d.approval_rule,
              planner_notes: d.planner_notes || draft.planner_notes,
            });
            if (d.people.length) {
              setEmailsText(d.people.map((p) => p.email).join('\n'));
              setFocus((f) => ({ ...f, ...Object.fromEntries(d.people.filter((p) => p.focus).map((p) => [p.email, p.focus])) }));
            }
            if (d.send_at) setSendAt(toLocalInput(new Date(d.send_at)));
          }}
          onSaveAndPlan={saveAndPlan}
          saving={busy === 'plan'}
        />
      )}

      {/* 1. the task */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h3 className="font-bold text-foreground">١. المهمة</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label>عنوان المهمة</Label>
            <Input disabled={!editable} value={draft.title} maxLength={200}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="مثال: إعادة بناء قسم الامتحانات" />
          </div>
          <div className="space-y-1.5">
            <Label>الأهداف</Label>
            <Textarea disabled={!editable} rows={6} value={draft.goals} maxLength={8000}
              onChange={(e) => setDraft({ ...draft, goals: e.target.value })} placeholder="ما الذي يجب أن يتحقق؟ هدف في كل سطر." />
          </div>
          <div className="space-y-1.5">
            <Label>التصور النهائي</Label>
            <Textarea disabled={!editable} rows={6} value={draft.final_vision} maxLength={8000}
              onChange={(e) => setDraft({ ...draft, final_vision: e.target.value })} placeholder="كيف يبدو الناتج في النهاية بالضبط؟" />
          </div>
          <div className="space-y-1.5">
            <Label>المدة (أيام)</Label>
            <Input disabled={!editable} type="number" min={1} max={90} value={draft.duration_days}
              onChange={(e) => setDraft({ ...draft, duration_days: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label>الموافقة النهائية</Label>
            <select
              disabled={!editable}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={draft.approval_rule}
              onChange={(e) => setDraft({ ...draft, approval_rule: e.target.value as ApprovalRule })}
            >
              {Object.entries(APPROVAL_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>تعليمات للمخطِّط (اختياري)</Label>
            <Textarea disabled={!editable} rows={2} value={draft.planner_notes} maxLength={4000}
              onChange={(e) => setDraft({ ...draft, planner_notes: e.target.value })}
              placeholder="مثال: وزّع بالتساوي لكن أصعب المهام لمحمد، وأحمد متاح آخر الأسبوع فقط" />
          </div>
        </div>
      </section>

      {/* 2. people */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 font-bold text-foreground"><Mail className="h-4 w-4" /> ٢. المشاركون</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>البريد الإلكتروني (واحد في كل سطر أو مفصولة بفواصل)</Label>
            <Textarea disabled={!editable} rows={6} dir="ltr" value={emailsText} onChange={(e) => setEmailsText(e.target.value)} />
            {editable && team.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {team.filter((t) => !emails.includes(t.email)).map((t) => (
                  <button key={t.email} type="button"
                    onClick={() => setEmailsText((x) => `${x.trim()}\n${t.email}`.trim())}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground">
                    + {t.name ?? t.email}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>تركيز كل شخص (اختياري، يساعد الذكاء الاصطناعي في التوزيع)</Label>
            {emails.length === 0 && <div className="text-sm text-muted-foreground">أضف بريداً أولاً.</div>}
            {emails.map((e) => (
              <div key={e} className="flex items-center gap-2">
                <span className="w-48 shrink-0 truncate text-xs" dir="ltr" title={e}>{e}</span>
                {!teamSet.has(e) && <Badge variant="outline" className="shrink-0 text-[10px]">خارج الفريق</Badge>}
                <Input disabled={!editable} className="h-8" value={focus[e] ?? ''} maxLength={300}
                  onChange={(ev) => setFocus({ ...focus, [e]: ev.target.value })} placeholder="مثال: واجهات، محتوى، اختبار" />
              </div>
            ))}
            {emails.some((e) => !teamSet.has(e)) && (
              <p className="text-xs text-muted-foreground">
                "خارج الفريق" يستلم المهمة بالبريد، لكنه لن يستطيع العمل من الطرفية إلا إذا أضفته للفريق.
              </p>
            )}
          </div>
        </div>
        {task && members.length > 0 && (
          <WorkWindows task={task} members={members} team={team} onChanged={reload} />
        )}
        {editable && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={!!busy}>
              {busy === 'save' ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Save className="ml-1 h-4 w-4" />} حفظ
            </Button>
            {task && (
              <Button variant="secondary" onClick={plan} disabled={!!busy || !members.length}>
                {busy === 'plan' ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <BrainCircuit className="ml-1 h-4 w-4" />}
                {task.plan ? 'أعد بناء الخطة بالذكاء الاصطناعي' : 'ابنِ الخطة بالذكاء الاصطناعي'}
              </Button>
            )}
          </div>
        )}
        {busy === 'plan' && <p className="text-sm text-muted-foreground">يفكّر في الخطة… قد يستغرق دقيقة.</p>}
      </section>

      {/* 3. the plan */}
      {task?.plan && (
        <section id="collective-plan" className="space-y-5 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-bold text-foreground"><BrainCircuit className="h-4 w-4" /> ٣. الخطة</h3>
            <span className="text-xs text-muted-foreground">بُنيت {fmt(task.plan_generated_at)}{task.plan.model ? ` · ${task.plan.model}` : ''}</span>
          </div>
          {task.plan.summary && <p className="leading-8 text-foreground">{task.plan.summary}</p>}

          {(task.plan.requirements?.length ?? 0) > 0 && (
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-foreground">المتطلبات من المواصفات ({task.plan.requirements!.length})</h4>
                {(task.plan.uncovered?.length ?? 0) === 0
                  ? <Badge>كل البنود مغطّاة بمهام</Badge>
                  : <Badge variant="destructive">بنود بلا مهام: {task.plan.uncovered!.join('، ')}</Badge>}
              </div>
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-border p-3 text-sm">
                {task.plan.requirements!.map((r) => {
                  const by = subtasks.filter((s) => s.covers?.includes(r.id)).map((s) => `#${s.position}`);
                  return (
                    <div key={r.id} className="flex items-start gap-2">
                      <Badge variant={by.length ? 'secondary' : 'destructive'} className="shrink-0">{r.id}</Badge>
                      <span className="flex-1 text-foreground">{r.text}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{by.join(' ') || 'غير مغطّى'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-sm font-bold text-foreground">الجدول اليومي</h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {task.plan.days.map((d) => (
                <div key={d.day} className="rounded-xl border border-border p-3">
                  <div className="text-xs font-bold text-primary">اليوم {d.day}</div>
                  <div className="text-sm text-foreground">{d.focus || '—'}</div>
                  {d.milestones.length > 0 && (
                    <ul className="mt-1 list-disc pr-4 text-xs text-muted-foreground">
                      {d.milestones.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-bold text-foreground">ماذا يصل كل شخص كل يوم</h4>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[560px] text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="p-2 text-right font-medium">اليوم</th>
                    {members.map((m) => <th key={m.email} className="p-2 text-right font-medium" dir="ltr">{m.email.split('@')[0]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: task.duration_days }, (_, k) => k + 1).map((d) => (
                    <tr key={d} className="border-b border-border align-top last:border-0">
                      <td className="p-2 font-bold text-primary">{d}</td>
                      {members.map((m) => {
                        const items = subtasks.filter((s) => s.assignee_email?.toLowerCase() === m.email.toLowerCase() && s.day_from <= d && d <= s.day_to);
                        const hours = items.reduce((h, s) => h + (Number(s.effort_hours) || 0) / (s.day_to - s.day_from + 1), 0);
                        return (
                          <td key={m.email} className="p-2 text-foreground">
                            {items.length ? (
                              <>
                                {items.map((s) => <div key={s.id} className="truncate" title={s.title}>#{s.position} {s.title}</div>)}
                                {hours > 0 && <div className={hours > 6.5 ? 'text-destructive' : 'text-muted-foreground'}>≈ {hours.toFixed(1)} س</div>}
                              </>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-bold text-foreground">المهام الفرعية حسب الشخص</h4>
            <div className="space-y-4">
              {byPerson.map(([person, list]) => (
                <div key={person} className="rounded-xl border border-border">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
                    <span className="text-sm font-bold" dir="ltr">{person}</span>
                    <span className="text-xs text-muted-foreground">{list.length} مهمة · {loadPct(list.length)}% من العمل</span>
                  </div>
                  <div className="divide-y divide-border">
                    {list.map((s) => (
                      <SubtaskRow key={s.id} s={s} editable={editable} people={members.map((m) => m.email)}
                        days={task.duration_days} onChanged={reload} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {editable && (
              <Button variant="outline" size="sm" className="mt-3"
                onClick={() => run('add', async () => {
                  await addSubtask(task.id, subtasks.length, members[0]?.email ?? null); await reload();
                })}>
                <Plus className="ml-1 h-4 w-4" /> مهمة فرعية
              </Button>
            )}
          </div>

          {task.plan.risks.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1 text-sm font-bold text-foreground"><ShieldAlert className="h-4 w-4" /> المخاطر</h4>
              <ul className="space-y-1 text-sm">
                {task.plan.risks.map((r, i) => (
                  <li key={i}><span className="font-medium text-foreground">{r.risk}</span> <span className="text-muted-foreground">— {r.mitigation}</span></li>
                ))}
              </ul>
            </div>
          )}
          {task.plan.final_check.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1 text-sm font-bold text-foreground"><CheckCircle2 className="h-4 w-4" /> فحص التصور النهائي</h4>
              <ul className="list-disc space-y-1 pr-5 text-sm text-muted-foreground">
                {task.plan.final_check.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 4. sending */}
      {task && task.status !== 'draft' && (
        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-bold text-foreground"><CalendarClock className="h-4 w-4" /> ٤. الإرسال</h3>
          {task.status === 'planned' || task.status === 'scheduled' ? (
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <Label>موعد البدء</Label>
                <Input type="datetime-local" value={sendAt} onChange={(e) => setSendAt(e.target.value)} className="w-60" />
              </div>
              <Button onClick={doSchedule} disabled={!!busy}>
                {busy === 'schedule' ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <CalendarClock className="ml-1 h-4 w-4" />}
                {task.status === 'scheduled' ? 'غيّر موعد البدء' : 'اعتمد الخطة وحدّد موعد البدء'}
              </Button>
              <Button variant="secondary" onClick={doSendNow} disabled={!!busy}>
                {busy === 'send' ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Send className="ml-1 h-4 w-4" />} ابدأ الآن
              </Button>
              {task.status === 'scheduled' && (
                <Button variant="ghost" onClick={() => run('unschedule', async () => { await unschedule(task.id); await reload(); })} disabled={!!busy}>
                  ألغِ الجدولة (للتعديل)
                </Button>
              )}
              <p className="w-full text-sm text-muted-foreground">
                {task.status === 'scheduled' ? `مجدولة: تبدأ ${fmt(task.send_at)}. ` : ''}
                من موعد البدء، تصل كل مهمة لصاحبها وحده داخل وقت عمله، وبالترتيب: لا تصل مهمة قبل أن تكتمل المهام التي تعتمد عليها،
                وإن تأخّر زميل يصل لصاحبها «مؤجّلة» مع السبب، وتصله تلقائياً فور الإنجاز. موعد تسليم كل مهمة نهاية وقت عمل صاحبها.
                {task.status === 'scheduled' ? ' لتعديل الخطة ألغِ الجدولة أولاً.' : ''}
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div>بدأت {fmt(task.send_at)} · {task.status === 'active' ? 'المجدول يعمل كل دقيقة: يسلّم كل مهمة في وقت صاحبها وبالترتيب' : STATUS_LABEL[task.status]}</div>
              <TimingBoard subtasks={subtasks} />
              {task.status === 'active' && (
                <Button size="sm" variant="secondary" onClick={doResend} disabled={!!busy}>
                  {busy === 'resend' ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Send className="ml-1 h-4 w-4" />}
                  شغّل المجدول الآن + ذكّر بالمهام المفتوحة
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                تصل المهام لكل عضو وحده داخل «لوحة الموظفين ← المهام»، وبالبريد أيضاً. عندما يُنهيها هناك تُحسب منجزة هنا (بالموعد أو متأخرة)، وتنطلق المهام التي تنتظرها.
              </p>
              <div className="text-xs text-muted-foreground">آخر إرسال:</div>
              {task.email_report && (
                <ul className="space-y-1">
                  {Object.entries(task.email_report).map(([e, r]) => (
                    <li key={e} className="flex items-center gap-2" dir="ltr">
                      {r.ok ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <span>{e}</span>
                      {!r.ok && <span className="text-muted-foreground">(البريد: {r.reason})</span>}
                      {typeof r.portal === 'number' && <Badge variant="secondary" className="text-[10px]">+{r.portal} في لوحة الموظفين</Badge>}
                    </li>
                  ))}
                </ul>
              )}
              {task.email_report && Object.values(task.email_report).some((r) => r.reason === 'domain_unverified') && (
                <p className="text-muted-foreground" dir="rtl">
                  Resend لا يرسل إلا لبريد صاحب الحساب حتى يُوثَّق نطاق الإرسال (TEAM_EMAIL_FROM).
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {task && (
        <div className="flex flex-wrap gap-2">
          {task.status !== 'cancelled' && task.status !== 'published' && (
            <Button variant="outline" disabled={!!busy}
              onClick={() => { if (confirm('إلغاء هذه المهمة الجماعية؟')) run('cancel', async () => { await cancelTask(task.id); await reload(); }); }}>
              إلغاء المهمة
            </Button>
          )}
          {(task.status === 'draft' || task.status === 'planned' || task.status === 'cancelled') && (
            <Button variant="destructive" disabled={!!busy}
              onClick={() => { if (confirm('حذف المهمة نهائياً مع خطتها؟ لا يمكن التراجع.')) run('delete', async () => { await deleteTask(task.id); onBack(); }); }}>
              <Trash2 className="ml-1 h-4 w-4" /> حذف
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ one subtask
function SubtaskRow({ s, editable, people, days, onChanged }: {
  s: Subtask; editable: boolean; people: string[]; days: number; onChanged: () => Promise<void>;
}) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState({ title: s.title, detail: s.detail ?? '', acceptance: s.acceptance.join('\n'), assignee_email: s.assignee_email ?? '', day_from: s.day_from, day_to: s.day_to });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const from = Math.min(Math.max(1, v.day_from), days);
      await updateSubtask(s.id, {
        title: v.title.trim() || s.title,
        detail: v.detail.trim() || null,
        acceptance: v.acceptance.split('\n').map((x) => x.trim()).filter(Boolean),
        assignee_email: v.assignee_email || null,
        day_from: from,
        day_to: Math.min(Math.max(from, v.day_to), days),
      });
      setEdit(false);
      await onChanged();
    } catch (e) { toast.error(errText(e)); } finally { setSaving(false); }
  };

  if (!edit) {
    return (
      <div className="space-y-1 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="font-medium text-foreground">
            <span className="ml-2 text-xs text-muted-foreground">#{s.position}</span>{s.title}
          </div>
          <div className="flex items-center gap-2">
            {s.effort_hours ? <span className="text-xs text-muted-foreground">≈ {s.effort_hours} س</span> : null}
            {s.covers?.map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
            <Badge variant="outline">اليوم {s.day_from}{s.day_to > s.day_from ? `–${s.day_to}` : ''}</Badge>
            {!editable && <TimingBadge s={s} />}
            {editable && <Button size="sm" variant="ghost" onClick={() => setEdit(true)}>تعديل</Button>}
          </div>
        </div>
        {s.detail && <p className="text-sm leading-7 text-muted-foreground">{s.detail}</p>}
        {s.acceptance.length > 0 && (
          <ul className="list-disc pr-5 text-xs text-muted-foreground">
            {s.acceptance.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        )}
        {s.depends_on.length > 0 && <div className="text-xs text-muted-foreground">بعد: {s.depends_on.map((d) => `#${d}`).join('، ')}</div>}
        {!editable && (s.due_at || s.postponed_reason) && (
          <div className="text-xs text-muted-foreground">
            {s.due_at && <>التسليم {fmt(s.due_at)}</>}
            {s.completed_at && <> · أُنجزت {fmt(s.completed_at)}</>}
            {!s.delivered_at && s.postponed_reason && <> · {s.postponed_reason}</>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 bg-muted/40 p-3">
      <Input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} maxLength={300} />
      <Textarea rows={3} value={v.detail} onChange={(e) => setV({ ...v, detail: e.target.value })} placeholder="التفاصيل" />
      <Textarea rows={3} value={v.acceptance} onChange={(e) => setV({ ...v, acceptance: e.target.value })} placeholder="معايير الإنجاز، واحد في كل سطر" />
      <div className="flex flex-wrap items-center gap-2">
        <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" dir="ltr"
          value={v.assignee_email} onChange={(e) => setV({ ...v, assignee_email: e.target.value })}>
          {people.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <Label className="text-xs">من يوم</Label>
        <Input type="number" className="h-9 w-20" min={1} max={days} value={v.day_from} onChange={(e) => setV({ ...v, day_from: Number(e.target.value) })} />
        <Label className="text-xs">إلى</Label>
        <Input type="number" className="h-9 w-20" min={1} max={days} value={v.day_to} onChange={(e) => setV({ ...v, day_to: Number(e.target.value) })} />
        <Button size="sm" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}</Button>
        <Button size="sm" variant="ghost" onClick={() => setEdit(false)}>إلغاء</Button>
        <Button size="sm" variant="ghost" className="text-destructive"
          onClick={async () => { if (confirm('حذف هذه المهمة الفرعية؟')) { await deleteSubtask(s.id).catch((e) => toast.error(errText(e))); await onChanged(); } }}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ timing
const TONE: Record<ReturnType<typeof timingOf>['tone'], string> = {
  ok: 'bg-primary/10 text-primary',
  late: 'bg-destructive/10 text-destructive',
  wait: 'bg-secondary text-secondary-foreground',
  work: 'bg-accent text-accent-foreground',
  idle: 'bg-muted text-muted-foreground',
};
function TimingBadge({ s }: { s: Subtask }) {
  const t = timingOf(s);
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${TONE[t.tone]}`}>{t.label}</span>;
}

function tickSummary(r: TickReport) {
  if (!Array.isArray(r)) return 'لا شيء مستحق الآن';
  const delivered = r.filter((x) => 'delivered' in x).length;
  const postponed = r.filter((x) => 'postponed' in x).length;
  if (!delivered && !postponed) return 'لا شيء مستحق الآن (خارج أوقات العمل أو بانتظار مهام سابقة)';
  return `سُلّمت ${delivered} مهمة${postponed ? ` وأُجّلت ${postponed}` : ''}`;
}

/** Live progress of the timed delivery: counts by state. */
function TimingBoard({ subtasks }: { subtasks: Subtask[] }) {
  const counts = new Map<string, { n: number; tone: ReturnType<typeof timingOf>['tone'] }>();
  for (const s of subtasks) {
    const t = timingOf(s);
    counts.set(t.label, { n: (counts.get(t.label)?.n ?? 0) + 1, tone: t.tone });
  }
  const done = subtasks.filter((s) => s.status === 'done');
  const onTime = done.filter((s) => s.on_time !== false).length;
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {[...counts.entries()].map(([label, { n, tone }]) => (
          <span key={label} className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${TONE[tone]}`}>{label}: {n}</span>
        ))}
      </div>
      {done.length > 0 && (
        <div className="text-xs text-muted-foreground">
          الإنجاز {done.length}/{subtasks.length} · بالموعد {Math.round((onTime / done.length) * 100)}٪
        </div>
      )}
    </div>
  );
}

/** Each person's work window (Amman time) and the policy for late dependencies; editable at any time. */
function WorkWindows({ task, members, team, onChanged }: {
  task: CollectiveTask; members: CollectiveMember[]; team: { email: string; name: string | null }[]; onChanged: () => Promise<void>;
}) {
  const names = useMemo(() => new Map(team.map((t) => [t.email, t.name])), [team]);
  const [policy, setPolicy] = useState<PostponePolicy>(task.postpone_policy ?? 'next_window');
  useEffect(() => setPolicy(task.postpone_policy ?? 'next_window'), [task.postpone_policy]);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 font-bold text-foreground"><CalendarClock className="h-4 w-4" /> أوقات العمل (بتوقيت عمّان)</div>
          <p className="text-xs text-muted-foreground">لا تصل لأي شخص مهمة خارج وقته، وموعد تسليمها نهاية وقته. تقدر تغيّرها في أي وقت، حتى أثناء التنفيذ.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">إذا تأخّر زميل:</Label>
          <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={policy}
            onChange={async (e) => {
              const p = e.target.value as PostponePolicy;
              setPolicy(p);
              try { await setPostponePolicy(task.id, p); toast.success('تم'); await onChanged(); } catch (err) { toast.error(errText(err)); }
            }}>
            <option value="next_window">انتظر وقت صاحب المهمة التالي</option>
            <option value="immediate">سلّمها فور إنجاز الزميل</option>
          </select>
        </div>
      </div>
      <div className="divide-y divide-border">
        {members.map((m) => <WindowRow key={m.id} m={m} name={names.get(m.email.toLowerCase()) ?? null} onChanged={onChanged} />)}
      </div>
    </div>
  );
}

function WindowRow({ m, name, onChanged }: { m: CollectiveMember; name: string | null; onChanged: () => Promise<void> }) {
  const [from, setFrom] = useState((m.work_start ?? '08:00').slice(0, 5));
  const [to, setTo] = useState((m.work_end ?? '16:00').slice(0, 5));
  const [days, setDays] = useState<number[]>(m.work_days ?? [0, 1, 2, 3, 4, 5, 6]);
  const [saving, setSaving] = useState(false);
  const dirty = from !== (m.work_start ?? '').slice(0, 5) || to !== (m.work_end ?? '').slice(0, 5)
    || [...days].sort().join() !== [...(m.work_days ?? [])].sort().join();

  const save = async () => {
    setSaving(true);
    try {
      await updateMemberWindow(m.id, { work_start: from, work_end: to, work_days: [...days].sort() });
      toast.success(`حُفظ وقت ${name ?? m.email}`);
      await onChanged();
    } catch (e) { toast.error(errText(e)); } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="w-44 shrink-0 truncate text-sm font-medium text-foreground" title={m.email}>{name ?? m.email.split('@')[0]}</span>
      <Label className="text-xs">من</Label>
      <Input type="time" className="h-8 w-28" value={from} onChange={(e) => setFrom(e.target.value)} />
      <Label className="text-xs">إلى</Label>
      <Input type="time" className="h-8 w-28" value={to} onChange={(e) => setTo(e.target.value)} />
      <div className="flex flex-wrap gap-1">
        {WEEKDAYS.map((d, i) => {
          const on = days.includes(i);
          return (
            <button key={d} type="button"
              onClick={() => setDays(on ? days.filter((x) => x !== i) : [...days, i])}
              className={`rounded-full border px-2 py-0.5 text-[11px] ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}>
              {d}
            </button>
          );
        })}
      </div>
      {dirty && (
        <Button size="sm" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ الوقت'}</Button>
      )}
    </div>
  );
}
