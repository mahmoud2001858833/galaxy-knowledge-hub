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
  loadTask, parseEmails, saveTask, schedule, sendNow, setMembers, teamEmails, unschedule, updateSubtask,
  type ApprovalRule, type CollectiveMember, type CollectiveTask, type Subtask, type TaskDraft,
} from './collectiveApi';

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

const EMPTY: TaskDraft = { title: '', goals: '', final_vision: '', duration_days: 7, approval_rule: 'members_then_admin' };

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
      duration_days: r.task.duration_days, approval_rule: r.task.approval_rule,
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

  const save = () => run('save', async () => {
    if (!valid) throw new Error('اكتب العنوان والأهداف والتصور النهائي، والمدة بين 1 و90 يوماً');
    if (!emails.length) throw new Error('أضف بريداً إلكترونياً واحداً على الأقل');
    const id = await saveTask(task?.id ?? null, draft);
    await setMembers(id, emails.map((e) => ({ email: e, focus: focus[e]?.trim() || null })));
    toast.success('تم الحفظ');
    if (!task) onCreated(id); else await reload();
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
    const failed = Object.entries(r.report).filter(([, v]) => !v.ok);
    if (failed.length) toast.warning(`أُرسلت، لكن فشل ${failed.length}: ${failed.map(([e, v]) => `${e} (${v.reason})`).join('، ')}`);
    else toast.success('أُرسلت المهمة للجميع');
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
        <section className="space-y-5 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-bold text-foreground"><BrainCircuit className="h-4 w-4" /> ٣. الخطة</h3>
            <span className="text-xs text-muted-foreground">بُنيت {fmt(task.plan_generated_at)}{task.plan.model ? ` · ${task.plan.model}` : ''}</span>
          </div>
          {task.plan.summary && <p className="leading-8 text-foreground">{task.plan.summary}</p>}

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
                <Label>تاريخ ووقت الإرسال</Label>
                <Input type="datetime-local" value={sendAt} onChange={(e) => setSendAt(e.target.value)} className="w-60" />
              </div>
              <Button onClick={doSchedule} disabled={!!busy}>
                {busy === 'schedule' ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <CalendarClock className="ml-1 h-4 w-4" />}
                {task.status === 'scheduled' ? 'غيّر الموعد' : 'اعتمد الخطة وجدول الإرسال'}
              </Button>
              <Button variant="secondary" onClick={doSendNow} disabled={!!busy}>
                {busy === 'send' ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <Send className="ml-1 h-4 w-4" />} أرسل الآن
              </Button>
              {task.status === 'scheduled' && (
                <Button variant="ghost" onClick={() => run('unschedule', async () => { await unschedule(task.id); await reload(); })} disabled={!!busy}>
                  ألغِ الجدولة (للتعديل)
                </Button>
              )}
              {task.status === 'scheduled' && (
                <p className="w-full text-sm text-muted-foreground">مجدولة: تُرسل تلقائياً {fmt(task.send_at)}. لتعديل الخطة ألغِ الجدولة أولاً.</p>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div>أُرسلت {fmt(task.emailed_at)}</div>
              {task.email_report && (
                <ul className="space-y-1">
                  {Object.entries(task.email_report).map(([e, r]) => (
                    <li key={e} className="flex items-center gap-2" dir="ltr">
                      {r.ok ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <span>{e}</span>
                      {!r.ok && <span className="text-muted-foreground">({r.reason})</span>}
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
            <Badge variant="outline">اليوم {s.day_from}{s.day_to > s.day_from ? `–${s.day_to}` : ''}</Badge>
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
