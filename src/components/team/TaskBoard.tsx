import React, { useEffect, useMemo, useState } from 'react';
import { AlarmClock, CheckCircle2, CircleDashed, ClipboardList, Loader2, Play, Plus, RotateCcw, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImagePicker, TeamImage } from './TeamImages';
import {
  ROLE_LABELS,
  ROLE_PROOF,
  STATUS_LABELS,
  completeTask,
  errorMessage,
  fetchSubmissions,
  formatDate,
  isOverdue,
  isTaskTaken,
  startTask,
  TASK_TAKEN_TEXT,
  useTaskClaims,
  taskColumn,
  type TaskStatus,
  type TeamMember,
  type TeamSubmission,
  type TeamTask,
  type WorkerRole,
} from './teamApi';

const COLUMNS: { id: TaskStatus | 'overdue'; icon: React.ElementType; tone: string }[] = [
  { id: 'todo', icon: ClipboardList, tone: 'text-primary' },
  { id: 'in_progress', icon: CircleDashed, tone: 'text-warning' },
  { id: 'overdue', icon: AlarmClock, tone: 'text-destructive' },
  { id: 'done', icon: CheckCircle2, tone: 'text-success' },
];

const nameOf = (members: TeamMember[], userId: string | null) =>
  userId ? members.find((m) => m.user_id === userId)?.display_name ?? 'عضو' : null;

/** Read-only view of what was submitted to close a task. */
export const SubmissionView: React.FC<{ submission: TeamSubmission; members: TeamMember[] }> = ({ submission, members }) => {
  const answers = Object.entries((submission.extra_answers as Record<string, string>) ?? {});
  return (
    <div className="space-y-2 rounded-2xl border border-border bg-background p-4 text-sm">
      <div className="text-xs text-muted-foreground">
        {nameOf(members, submission.submitted_by)} · {formatDate(submission.created_at)}
      </div>
      {submission.school_name && (
        <p>
          <span className="font-bold">المدرسة: </span>
          {submission.school_name}
        </p>
      )}
      {submission.teacher_names && (
        <p>
          <span className="font-bold">المعلمات: </span>
          {submission.teacher_names}
        </p>
      )}
      {submission.problem_location && (
        <p>
          <span className="font-bold">مكان المشكلة: </span>
          {submission.problem_location}
        </p>
      )}
      {submission.description && <p className="whitespace-pre-wrap leading-relaxed">{submission.description}</p>}
      {answers.map(([k, v]) => (
        <p key={k}>
          <span className="font-bold">{k}: </span>
          {v}
        </p>
      ))}
      {submission.images.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {submission.images.map((p) => (
            <TeamImage key={p} path={p} className="h-24 w-24 rounded-xl border border-border" />
          ))}
        </div>
      )}
    </div>
  );
};

/** Completion form; the fields shown match what team_complete_task requires for the task's role. */
const CompletionForm: React.FC<{ task: TeamTask; onDone: () => void }> = ({ task, onDone }) => {
  const role = task.assignee_role as WorkerRole;
  const [description, setDescription] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [teacherNames, setTeacherNames] = useState('');
  const [problemLocation, setProblemLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await completeTask(task.id, { description, schoolName, teacherNames, problemLocation, images, extraAnswers: extra });
      toast.success('تم تسليم المهمة');
      onDone();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">
        المطلوب لإغلاق المهمة: <span className="font-semibold text-foreground">{ROLE_PROOF[role]}</span>
      </p>

      {role === 'speaker' && (
        <>
          <div className="space-y-1.5">
            <Label>اسم المدرسة</Label>
            <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>أسماء المعلمات</Label>
            <Textarea rows={2} value={teacherNames} onChange={(e) => setTeacherNames(e.target.value)} placeholder="اكتب الأسماء مفصولة بفواصل" />
          </div>
        </>
      )}

      {role === 'auditor' && (
        <div className="space-y-1.5">
          <Label>أين توجد المشكلة؟</Label>
          <Input value={problemLocation} onChange={(e) => setProblemLocation(e.target.value)} placeholder="الصفحة أو الرابط والقسم بالتحديد" />
        </div>
      )}

      {role !== 'speaker' && (
        <div className="space-y-1.5">
          <Label>{role === 'auditor' ? 'تفاصيل المشكلة' : 'وصف تفصيلي لما قمت به'}</Label>
          <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      )}

      {task.extra_requirements.map((req) => (
        <div key={req} className="space-y-1.5">
          <Label>{req}</Label>
          <Input value={extra[req] ?? ''} onChange={(e) => setExtra({ ...extra, [req]: e.target.value })} />
        </div>
      ))}

      <div className="space-y-1.5">
        <Label>
          {role === 'speaker' ? 'صور زيارة المدرسة' : role === 'auditor' ? 'صورة المشكلة' : role === 'ai_manager' ? 'صورة (اختياري)' : 'صورة إثبات العمل'}
        </Label>
        <ImagePicker value={images} onChange={setImages} />
      </div>

      <Button onClick={submit} disabled={saving} className="w-full gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        تسليم وإغلاق المهمة
      </Button>
    </div>
  );
};

/** Principal/supervisor controls: add a closing requirement, reopen, delete. */
const LeadActions: React.FC<{ task: TeamTask; onChanged: () => void; onClose: () => void }> = ({ task, onChanged, onClose }) => {
  const [req, setReq] = useState('');
  const run = async (fn: () => PromiseLike<{ error: unknown }>, ok: string, close = false) => {
    const { error } = await fn();
    if (error) toast.error(errorMessage(error));
    else {
      toast.success(ok);
      onChanged();
      if (close) onClose();
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-border p-4">
      <h4 className="text-sm font-bold">تحكم المشرف</h4>
      {task.status !== 'done' && (
        <div className="flex gap-2">
          <Input value={req} onChange={(e) => setReq(e.target.value)} placeholder="متطلب إضافي لإغلاق المهمة" />
          <Button
            variant="outline"
            className="gap-1"
            disabled={!req.trim()}
            onClick={() =>
              run(
                () => supabase.from('team_tasks').update({ extra_requirements: [...task.extra_requirements, req.trim()] }).eq('id', task.id),
                'أضيف المتطلب',
                true,
              )
            }
          >
            <Plus className="h-4 w-4" /> إضافة
          </Button>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {task.status === 'done' && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => run(() => supabase.from('team_tasks').update({ status: 'todo', completed_at: null, completed_by: null }).eq('id', task.id), 'أعيد فتح المهمة', true)}
          >
            <RotateCcw className="h-4 w-4" /> إعادة فتح المهمة
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          className="gap-1"
          onClick={() => {
            if (window.confirm('حذف المهمة وكل ما سُلّم عليها؟')) run(() => supabase.from('team_tasks').delete().eq('id', task.id), 'حُذفت المهمة', true);
          }}
        >
          <Trash2 className="h-4 w-4" /> حذف المهمة
        </Button>
      </div>
    </div>
  );
};

export const TaskDialog: React.FC<{
  task: TeamTask | null;
  members: TeamMember[];
  canWork: boolean;
  isLead?: boolean;
  onClose: () => void;
  onChanged: () => void;
}> = ({ task, members, canWork, isLead = false, onClose, onChanged }) => {
  const [subs, setSubs] = useState<TeamSubmission[]>([]);
  const [sourceSubs, setSourceSubs] = useState<TeamSubmission[]>([]);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    setSubs([]);
    setSourceSubs([]);
    if (!task) return;
    fetchSubmissions(task.id).then(setSubs).catch(() => setSubs([]));
    if (task.source_task_id) fetchSubmissions(task.source_task_id).then(setSourceSubs).catch(() => setSourceSubs([]));
  }, [task]);

  // someone else took the task while this member had it open
  useTaskClaims(({ taskId }) => {
    if (!task || taskId !== task.id || task.status !== 'todo' || isLead) return;
    toast.warning(TASK_TAKEN_TEXT, { duration: 8000 });
    onChanged();
    onClose();
  });

  if (!task) return null;

  const start = async () => {
    setStarting(true);
    try {
      await startTask(task.id);
      toast.success('المهمة لك! بدأت العمل عليها');
      onChanged();
      onClose();
    } catch (e) {
      if (isTaskTaken(e)) {
        toast.warning(TASK_TAKEN_TEXT, { duration: 8000 });
        onChanged();
        onClose();
      } else toast.error(errorMessage(e));
    } finally {
      setStarting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl text-right" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription className="text-right">
            {ROLE_LABELS[task.assignee_role as WorkerRole]}
            {task.assignee_user_id ? ` · ${nameOf(members, task.assignee_user_id)}` : ' · لأي عضو بهذا الدور'}
            {task.due_at && ` · التسليم: ${formatDate(task.due_at)}`}
            {isOverdue(task) && ' · متأخرة'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {task.details && <p className="whitespace-pre-wrap rounded-2xl bg-muted p-4 text-sm leading-relaxed">{task.details}</p>}
          {task.extra_requirements.length > 0 && (
            <div className="text-sm">
              <span className="font-bold">متطلبات إضافية: </span>
              {task.extra_requirements.join('، ')}
            </div>
          )}

          {sourceSubs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold">تقرير المدقق الأصلي</h4>
              {sourceSubs.map((s) => (
                <SubmissionView key={s.id} submission={s} members={members} />
              ))}
            </div>
          )}

          {subs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold">ما تم تسليمه</h4>
              {subs.map((s) => (
                <SubmissionView key={s.id} submission={s} members={members} />
              ))}
            </div>
          )}

          {canWork && task.status === 'todo' && (
            <Button onClick={start} disabled={starting} variant="outline" className="w-full gap-2">
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              ابدأ العمل (نقل إلى قيد الإعداد)
            </Button>
          )}
          {canWork && task.status !== 'done' && (
            <CompletionForm
              task={task}
              onDone={() => {
                onChanged();
                onClose();
              }}
            />
          )}
          {isLead && <LeadActions task={task} onChanged={onChanged} onClose={onClose} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TaskCard: React.FC<{ task: TeamTask; members: TeamMember[]; onOpen: () => void }> = ({ task, members, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    className="w-full rounded-2xl border border-border bg-card p-3 text-right shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <div className="font-semibold text-card-foreground">{task.title}</div>
    <div className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
      <span>{ROLE_LABELS[task.assignee_role as WorkerRole]}</span>
      {task.assignee_user_id && <span>· {nameOf(members, task.assignee_user_id)}</span>}
      {task.due_at && <span>· {formatDate(task.due_at)}</span>}
      {task.source_task_id && <span className="text-primary">· من المدقق</span>}
    </div>
  </button>
);

/** Four-column task execution board: required / in progress / overdue / done. */
export const TaskBoard: React.FC<{
  tasks: TeamTask[];
  members: TeamMember[];
  canWork: (t: TeamTask) => boolean;
  onChanged: () => void;
  emptyText?: string;
  isLead?: boolean;
}> = ({ tasks, members, canWork, onChanged, emptyText = 'لا توجد مهام', isLead = false }) => {
  const [open, setOpen] = useState<TeamTask | null>(null);
  const grouped = useMemo(() => {
    const g: Record<string, TeamTask[]> = { todo: [], in_progress: [], overdue: [], done: [] };
    for (const t of tasks) g[taskColumn(t)].push(t);
    return g;
  }, [tasks]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map(({ id, icon: Icon, tone }) => (
          <div key={id} className="flex flex-col gap-2 rounded-3xl border border-border bg-muted/40 p-3">
            <div className="flex items-center justify-between px-1">
              <span className={`flex items-center gap-1.5 text-sm font-bold ${tone}`}>
                <Icon className="h-4 w-4" aria-hidden />
                {STATUS_LABELS[id]}
              </span>
              <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">{grouped[id].length}</span>
            </div>
            {grouped[id].length === 0 ? (
              <p className="px-1 py-4 text-center text-xs text-muted-foreground">{emptyText}</p>
            ) : (
              grouped[id].map((t) => <TaskCard key={t.id} task={t} members={members} onOpen={() => setOpen(t)} />)
            )}
          </div>
        ))}
      </div>
      <TaskDialog task={open} members={members} canWork={!!open && canWork(open)} isLead={isLead} onClose={() => setOpen(null)} onChanged={onChanged} />
    </>
  );
};
