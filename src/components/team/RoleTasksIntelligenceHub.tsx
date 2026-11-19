import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Bot,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Coffee,
  Copy,
  Cpu,
  FileCheck2,
  FolderUp,
  Image as ImageIcon,
  Layers,
  Loader2,
  MapPin,
  Megaphone,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TeamImage } from './TeamImages';
import {
  ROLE_LABELS,
  formatDate,
  useAllTeamSubmissions,
  usePageManagerFiles,
  useSupervisorTasks,
  useTeamDayOff,
  useTeamMembers,
  useTeamRoles,
  useTeamTasks,
} from './teamApi';
import {
  TRACKABLE_ROLES,
  askTasksIntelligenceAI,
  buildOmniscientAIContext,
  buildRoleDossiers,
  formatDurationArabic,
  formatOverdueDelta,
  type AIChatTurn,
  type CollectiveSummaryLite,
  type GradeTone,
  type PersonDossier,
  type RoleDossier,
  type TrackableRole,
  type UnifiedTaskRecord,
} from './roleTasksAnalytics';

const ROLE_VISUALS: Record<TrackableRole, { icon: React.ElementType; gradient: string; softBg: string; border: string }> = {
  auditor: {
    icon: ClipboardCheck,
    gradient: 'from-rose-600 to-pink-600',
    softBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-800',
  },
  speaker: {
    icon: Megaphone,
    gradient: 'from-blue-600 to-indigo-600',
    softBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-800',
  },
  page_manager: {
    icon: Layers,
    gradient: 'from-violet-600 to-purple-600',
    softBg: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    border: 'border-violet-300 dark:border-violet-800',
  },
  ai_manager: {
    icon: Cpu,
    gradient: 'from-cyan-600 to-teal-600',
    softBg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-800',
  },
  file_manager: {
    icon: FolderUp,
    gradient: 'from-amber-500 to-orange-600',
    softBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
  },
  supervisor: {
    icon: ShieldCheck,
    gradient: 'from-emerald-600 to-teal-600',
    softBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
  },
};

const GRADE_STYLE: Record<GradeTone, string> = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  blue: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  amber: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  rose: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
  slate: 'bg-muted text-muted-foreground border-border',
};

/** Clean lightweight Arabic markdown renderer for AI responses (bold, headings, bullets). */
const FormattedAIText: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={idx} className="font-black text-foreground">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={idx}>{part}</React.Fragment>
      ),
    );
  };

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;
        if (trimmed.startsWith('### ')) {
          return (
            <h5 key={i} className="pt-2 text-sm font-black text-primary">
              {renderInline(trimmed.slice(4))}
            </h5>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h4 key={i} className="pt-2 text-base font-black text-foreground">
              {renderInline(trimmed.slice(3))}
            </h4>
          );
        }
        if (/^[-•*]\s+/.test(trimmed)) {
          return (
            <div key={i} className="flex items-start gap-2 pr-1">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              <span className="flex-1">{renderInline(trimmed.replace(/^[-•*]\s+/, ''))}</span>
            </div>
          );
        }
        if (/^\d+[.)]\s+/.test(trimmed)) {
          const match = trimmed.match(/^(\d+[.)])\s+(.*)$/);
          return (
            <div key={i} className="flex items-start gap-2 pr-1">
              <span className="shrink-0 font-black text-indigo-600 dark:text-indigo-400">{match?.[1]}</span>
              <span className="flex-1">{renderInline(match?.[2] ?? trimmed)}</span>
            </div>
          );
        }
        return <p key={i}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
};

/** Detailed Card for a single task (completed with full proof OR remaining with urgency). */
const TaskDetailCard: React.FC<{
  task: UnifiedTaskRecord;
  personName: string;
  onAskAI: (prompt: string) => void;
  onPreviewImage: (path: string) => void;
}> = ({ task, personName, onAskAI, onPreviewImage }) => {
  const isDone = task.status === 'done';
  const statusBadge = task.isScheduled
    ? { label: 'مجدولة', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' }
    : task.isOverdue
      ? { label: formatOverdueDelta(task.dueAt) || 'متأخرة', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300' }
      : isDone
        ? {
            label: task.completedOnTime === false ? 'منجزة (بعد الموعد)' : 'منجزة بالكامل',
            cls:
              task.completedOnTime === false
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
          }
        : task.status === 'in_progress'
          ? { label: 'قيد الإعداد الآن', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300' }
          : { label: 'مطلوبة (لم تبدأ)', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300' };

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        task.isOverdue
          ? 'border-rose-300/80 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/15'
          : isDone
            ? 'border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/10'
            : 'border-border bg-card'
      }`}
    >
      {/* Task Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusBadge.cls}`}>
              {isDone ? <CheckCircle2 className="h-3 w-3" /> : task.isOverdue ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {statusBadge.label}
            </span>
            {task.priority && task.priority !== 'normal' && (
              <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                {task.priority === 'urgent' ? 'عاجل جداً' : 'مهم'}
              </span>
            )}
            {task.turnaroundHours !== null && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                مدة الإنجاز: {formatDurationArabic(task.turnaroundHours)}
              </span>
            )}
          </div>
          <h5 className="mt-2 text-sm sm:text-base font-black text-foreground leading-snug">{task.title}</h5>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            onAskAI(
              `حلّل لي بالتفصيل مهمة "${task.title}" المسندة إلى ${personName} (${ROLE_LABELS[task.role]}): ماذا عمل فيها، هل التزم بالمتطلبات والوقت، وما تقييمك لجودة التنفيذ أو خطورة التأخير؟`,
            )
          }
          className="h-8 shrink-0 gap-1 rounded-xl bg-indigo-500/10 px-2.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-500/20 dark:text-indigo-300"
        >
          <Sparkles className="h-3.5 w-3.5" />
          اسأل الـ AI
        </Button>
      </div>

      {/* Original Instructions */}
      {task.details && (
        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{task.details}</p>
      )}

      {/* Dates Row */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span>أُسندت: {formatDate(task.createdAt)}</span>
        {task.dueAt && (
          <span className={task.isOverdue ? 'font-bold text-rose-600 dark:text-rose-400' : ''}>
            موعد التسليم: {formatDate(task.dueAt)}
          </span>
        )}
        {task.completedAt && (
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            أُنجزت: {formatDate(task.completedAt)}
          </span>
        )}
      </div>

      {/* Extra Requirements if still pending */}
      {!isDone && task.extraRequirements.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-muted-foreground">متطلبات الإغلاق:</span>
          {task.extraRequirements.map((req, idx) => (
            <span key={idx} className="rounded-lg bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
              {req}
            </span>
          ))}
        </div>
      )}

      {/* Completed Work Proof / What the person actually did */}
      {task.submissions.length > 0 && (
        <div className="mt-3 space-y-2.5 rounded-2xl border border-emerald-300/60 bg-background/90 p-3.5 dark:border-emerald-900/60">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300">
              <FileCheck2 className="h-4 w-4" />
              تفاصيل ما قام به {personName}:
            </span>
            <span className="text-[10px] text-muted-foreground">{formatDate(task.submissions[0].created_at)}</span>
          </div>

          {task.submissions.map((sub) => {
            const extraEntries =
              sub.extra_answers && typeof sub.extra_answers === 'object'
                ? Object.entries(sub.extra_answers as Record<string, unknown>).filter(([, v]) => String(v ?? '').trim())
                : [];
            return (
              <div key={sub.id} className="space-y-2 text-xs">
                {(sub.school_name || sub.teacher_names || sub.problem_location) && (
                  <div className="flex flex-wrap gap-2">
                    {sub.school_name && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-blue-500/10 px-2.5 py-1 font-bold text-blue-800 dark:text-blue-300">
                        <Building2 className="h-3.5 w-3.5" /> المدرسة: {sub.school_name}
                      </span>
                    )}
                    {sub.teacher_names && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-violet-500/10 px-2.5 py-1 font-bold text-violet-800 dark:text-violet-300">
                        <Users className="h-3.5 w-3.5" /> المعلمات: {sub.teacher_names}
                      </span>
                    )}
                    {sub.problem_location && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 px-2.5 py-1 font-bold text-rose-800 dark:text-rose-300">
                        <MapPin className="h-3.5 w-3.5" /> مكان المشكلة: {sub.problem_location}
                      </span>
                    )}
                  </div>
                )}

                {sub.description && (
                  <div className="rounded-xl bg-muted/50 p-3 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {sub.description}
                  </div>
                )}

                {extraEntries.length > 0 && (
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {extraEntries.map(([k, v]) => (
                      <div key={k} className="rounded-xl border border-border bg-muted/30 px-2.5 py-1.5">
                        <span className="font-bold text-muted-foreground">{k}: </span>
                        <span className="font-semibold text-foreground">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {sub.images && sub.images.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                      <ImageIcon className="h-3.5 w-3.5" /> صور الإثبات المرفقة ({sub.images.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sub.images.map((imgPath, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onPreviewImage(imgPath)}
                          className="overflow-hidden rounded-xl border border-border transition hover:scale-[1.03] hover:border-primary"
                          title="اضغط لتكبير الصورة"
                        >
                          <TeamImage path={imgPath} className="h-20 w-24 object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Supervisor completion note */}
      {task.completionNote && (
        <div className="mt-3 rounded-2xl border border-emerald-300/60 bg-background/90 p-3 text-xs dark:border-emerald-900/60">
          <span className="font-black text-emerald-700 dark:text-emerald-300">ملاحظة إنجاز المشرف: </span>
          <span className="text-foreground">{task.completionNote}</span>
        </div>
      )}
    </div>
  );
};

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const nowTime = () => new Date().toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' });

/**
 * مركز المهام حسب المسمى الوظيفي والأشخاص + الذكاء الاصطناعي الشامل
 */
export const RoleTasksIntelligenceHub: React.FC = () => {
  const { loading: rolesLoading, userId, roles } = useTeamRoles();
  const { members, loading: membersLoading, reload: reloadMembers } = useTeamMembers();
  const { tasks, loading: tasksLoading, reload: reloadTasks } = useTeamTasks();
  const { tasks: supervisorTasks, loading: supLoading, reload: reloadSup } = useSupervisorTasks();
  const { submissions, loading: subsLoading, reload: reloadSubs } = useAllTeamSubmissions();
  const { files: pageFiles, reload: reloadFiles } = usePageManagerFiles();
  const { dayOffMap, reload: reloadDayOff } = useTeamDayOff();

  const [collectiveTasks, setCollectiveTasks] = useState<CollectiveSummaryLite[]>([]);

  // Safely load collective tasks so the AI knows about them too
  const loadCollective = useCallback(async () => {
    try {
      const db = supabase as unknown as { from: (t: string) => any };
      const [{ data: ct }, { data: st }] = await Promise.all([
        db.from('collective_tasks').select('id, title, status, duration_days').order('created_at', { ascending: false }).limit(15),
        db.from('collective_subtasks').select('task_id, title, assignee_email, status, day_from, day_to').order('position'),
      ]);
      const subByTask = new Map<string, CollectiveSummaryLite['subtasks']>();
      for (const row of st ?? []) {
        const arr = subByTask.get(row.task_id) ?? [];
        arr.push(row);
        subByTask.set(row.task_id, arr);
      }
      setCollectiveTasks(
        (ct ?? []).map((c: any) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          duration_days: c.duration_days,
          subtasks: subByTask.get(c.id) ?? [],
        })),
      );
    } catch {
      // Optional table
    }
  }, []);

  useEffect(() => {
    loadCollective();
  }, [loadCollective]);

  const isLead = roles.includes('principal') || roles.includes('supervisor');
  const isPrincipal = roles.includes('principal');

  // Navigation & Filter State
  const [activeRole, setActiveRole] = useState<'all' | TrackableRole>('auditor');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [personTaskFilter, setPersonTaskFilter] = useState<'all' | 'remaining' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // Build live dossiers
  const dossiers = useMemo(
    () =>
      buildRoleDossiers({
        members,
        tasks,
        supervisorTasks,
        submissions,
        dayOffMap,
      }),
    [members, tasks, supervisorTasks, submissions, dayOffMap],
  );

  // Global KPIs
  const globalStats = useMemo(() => {
    const total = dossiers.reduce((a, d) => a + d.stats.total, 0);
    const done = dossiers.reduce((a, d) => a + d.stats.done, 0);
    const overdue = dossiers.reduce((a, d) => a + d.stats.overdue, 0);
    const inProgress = dossiers.reduce((a, d) => a + d.stats.inProgress, 0);
    const todo = dossiers.reduce((a, d) => a + d.stats.todo, 0);
    const uniquePeopleIds = new Set(dossiers.flatMap((d) => d.people.map((p) => p.userId)));
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      total,
      done,
      remaining: total - done,
      overdue,
      inProgress,
      todo,
      completionRate,
      peopleCount: uniquePeopleIds.size,
      submissionsCount: submissions.length,
    };
  }, [dossiers, submissions.length]);

  const currentDossier: RoleDossier | null = useMemo(
    () => (activeRole === 'all' ? null : dossiers.find((d) => d.role === activeRole) ?? null),
    [dossiers, activeRole],
  );

  // People displayed for current selection
  const displayedPeople: PersonDossier[] = useMemo(() => {
    const base = activeRole === 'all' ? dossiers.flatMap((d) => d.people) : currentDossier?.people ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.tasks.some(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.details ?? '').toLowerCase().includes(q) ||
            t.submissions.some(
              (s) =>
                (s.description ?? '').toLowerCase().includes(q) ||
                (s.school_name ?? '').toLowerCase().includes(q) ||
                (s.problem_location ?? '').toLowerCase().includes(q),
            ),
        ),
    );
  }, [activeRole, dossiers, currentDossier, searchQuery]);

  // Keep selectedPersonId synced when switching roles
  useEffect(() => {
    if (selectedPersonId && !displayedPeople.some((p) => p.userId === selectedPersonId)) {
      setSelectedPersonId(displayedPeople[0]?.userId ?? null);
    } else if (!selectedPersonId && displayedPeople.length > 0 && activeRole !== 'all') {
      setSelectedPersonId(displayedPeople[0].userId);
    }
  }, [displayedPeople, selectedPersonId, activeRole]);

  const selectedPerson: PersonDossier | null = useMemo(
    () => displayedPeople.find((p) => p.userId === selectedPersonId) ?? null,
    [displayedPeople, selectedPersonId],
  );

  const selectedPersonTasks = useMemo(() => {
    if (!selectedPerson) return [];
    let list =
      personTaskFilter === 'done'
        ? selectedPerson.completedTasks
        : personTaskFilter === 'remaining'
          ? selectedPerson.remainingTasks
          : [...selectedPerson.remainingTasks, ...selectedPerson.completedTasks];

    const q = searchQuery.trim().toLowerCase();
    if (q && !selectedPerson.name.toLowerCase().includes(q) && !selectedPerson.email.toLowerCase().includes(q)) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.details ?? '').toLowerCase().includes(q) ||
          t.submissions.some(
            (s) =>
              (s.description ?? '').toLowerCase().includes(q) ||
              (s.school_name ?? '').toLowerCase().includes(q) ||
              (s.problem_location ?? '').toLowerCase().includes(q),
          ),
      );
    }
    return list;
  }, [selectedPerson, personTaskFilter, searchQuery]);

  // ---------------------------------------------------------------- Omniscient AI Chat State
  const initialGreeting = useMemo<ChatMsg>(
    () => ({
      role: 'assistant',
      time: nowTime(),
      content:
        'أهلاً بك يا رئيس! أنا **الذكاء الاصطناعي الشامل لتحليل المهام وتقييم الفريق**.\n\n' +
        'أنا متصل الآن لحظياً بكل كبيرة وصغيرة في المنصة: **جميع المسميات الوظيفية، جميع الأعضاء، كل مهمة منجزة وماذا عملوا فيها بالتفصيل (المدارس، المعلمات، المشاكل المكتشفة، الصور)، المهام المتبقية والمتأخرة، ودرجات التقييم**.\n\n' +
        'اسألني عن أي شخص أو قسم أو اضغط على أي زر تحليل سريع بالأسفل!',
    }),
    [],
  );

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([initialGreeting]);
  const [aiInput, setAiInput] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);
  const chatListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll ONLY inside the AI chat box so outer page never jumps
    const el = chatListRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [chatMessages.length, aiBusy]);

  const sendToAI = useCallback(
    async (customPrompt?: string) => {
      const prompt = (customPrompt ?? aiInput).trim();
      if (!prompt || aiBusy) return;
      if (!customPrompt) setAiInput('');

      const nextMessages: ChatMsg[] = [...chatMessages, { role: 'user', content: prompt, time: nowTime() }];
      setChatMessages(nextMessages);
      setAiBusy(true);

      try {
        const liveContext = buildOmniscientAIContext({
          dossiers,
          pageFiles,
          collectiveTasks,
          activeRole,
          selectedPersonId,
        });
        const turns: AIChatTurn[] = nextMessages
          .slice(1) // skip greeting
          .slice(-12) // keep recent 12 turns clean
          .map((m) => ({ role: m.role, content: m.content }));

        const reply = await askTasksIntelligenceAI(turns, liveContext);
        setChatMessages((prev) => [...prev, { role: 'assistant', content: reply, time: nowTime() }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error('تعذّر الوصول للذكاء الاصطناعي');
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `حدث خطأ أثناء الاتصال بالذكاء الاصطناعي:\n${msg}`, time: nowTime() },
        ]);
      } finally {
        setAiBusy(false);
      }
    },
    [aiInput, aiBusy, chatMessages, dossiers, pageFiles, collectiveTasks, activeRole, selectedPersonId],
  );

  const quickPrompts = useMemo(() => {
    const list: { label: string; prompt: string }[] = [
      {
        label: 'تقييم شامل وترتيب الفريق',
        prompt: 'اعمل لي تقييماً شاملاً ومفصلاً لجميع أعضاء الفريق ورتبهم من الأفضل للأضعف بالأرقام والدرجات، مع ذكر أبرز إنجازات وتقصير كل واحد.',
      },
      {
        label: 'كشف المتأخرين والمهام العالقة',
        prompt: 'مين متأخر حالياً بمهامه؟ أعطني قائمة دقيقة بكل مهمة متأخرة أو عالقة، ولمين هي، وكم صار لها متأخرة، وماذا تنصحني أعمل معهم؟',
      },
    ];
    if (selectedPerson) {
      list.push({
        label: `قيّم ${selectedPerson.name} بالتفصيل`,
        prompt: `قيّم لي أداء ${selectedPerson.name} (${ROLE_LABELS[selectedPerson.role]}) بالتفصيل الكامل: شو أنجز بالضبط، شو ظل عليه، كيف جودة توثيقه والتزامه بالوقت، ونقاط القوة والضعف؟`,
      });
    } else if (activeRole !== 'all') {
      list.push({
        label: `تحليل قسم ${ROLE_LABELS[activeRole]}`,
        prompt: `اعمل لي تحليلاً كاملاً لقسم ${ROLE_LABELS[activeRole]}: مقارنة بين الأشخاص المعينين فيه، ماذا أنجز كل واحد بالتفصيل، والمهام المتبقية والمفتوحة.`,
      });
    }
    list.push(
      {
        label: 'ملخص كل ما أُنجز بالتفصيل',
        prompt: 'لخّص لي كل المهام المنجزة عبر الفريق بالتفصيل: أسماء المدارس التي تمت زيارتها، المشاكل التي رصدها المدققون، وأعمال مسؤول الصفحة وباقي الفريق.',
      },
      {
        label: 'توصيات إعادة توزيع المهام',
        prompt: 'بناءً على ضغط العمل الحالي والدرجات والمهام المتبقية، من لديه ضغط عالٍ ومن لديه فراغ؟ اقترح خطة ذكية لإعادة توزيع المهام.',
      },
    );
    return list;
  }, [selectedPerson, activeRole]);

  const refreshAll = () => {
    reloadMembers();
    reloadTasks();
    reloadSup();
    reloadSubs();
    reloadFiles();
    reloadDayOff();
    loadCollective();
    toast.success('تم تحديث كافة بيانات المهام والتسليمات');
  };

  if (rolesLoading || membersLoading || tasksLoading || supLoading || subsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userId || !isLead) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground" dir="rtl">
        هذه الصفحة متاحة للإدارة فقط.
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* 1. Executive Header + Global Live KPIs */}
      <div className="rounded-3xl border border-border bg-gradient-to-l from-indigo-600/10 via-blue-600/5 to-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-md">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-foreground">
                  لوحة المهام التفصيلية حسب المسمى الوظيفي + AI
                </h2>
                <Badge className="gap-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                  <Sparkles className="h-3 w-3" /> تحليل وتقييم لحظي
                </Badge>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                تصفّح كل مسمى وظيفي وكل شخص معيّن فيه: ماذا أنجز بالتفصيل، ما تبقى عليه، تقييمه التلقائي، واستشر الـ AI العارف بكل التفاصيل.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بشخص، مهمة، مدرسة..."
                className="h-10 rounded-xl bg-background pr-9 text-xs sm:text-sm"
              />
            </div>
            <Button type="button" variant="outline" size="icon" onClick={refreshAll} className="h-10 w-10 rounded-xl" title="تحديث البيانات">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Global KPI Strip */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-border bg-background/80 px-3.5 py-2.5">
            <div className="text-[11px] font-semibold text-muted-foreground">إجمالي المهام</div>
            <div className="mt-0.5 text-xl font-black text-foreground">{globalStats.total}</div>
          </div>
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 px-3.5 py-2.5">
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">المنجزة ({globalStats.completionRate}%)</div>
            <div className="mt-0.5 text-xl font-black text-emerald-700 dark:text-emerald-300">{globalStats.done}</div>
          </div>
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 px-3.5 py-2.5">
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">قيد الإعداد</div>
            <div className="mt-0.5 text-xl font-black text-amber-700 dark:text-amber-300">{globalStats.inProgress}</div>
          </div>
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 px-3.5 py-2.5">
            <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">مطلوبة متبقية</div>
            <div className="mt-0.5 text-xl font-black text-blue-700 dark:text-blue-300">{globalStats.todo}</div>
          </div>
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 px-3.5 py-2.5">
            <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">متأخرة الآن</div>
            <div className="mt-0.5 text-xl font-black text-rose-700 dark:text-rose-300">{globalStats.overdue}</div>
          </div>
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 px-3.5 py-2.5">
            <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">توثيقات وتسليمات</div>
            <div className="mt-0.5 text-xl font-black text-indigo-700 dark:text-indigo-300">{globalStats.submissionsCount}</div>
          </div>
        </div>
      </div>

      {/* 2. Role Selector Strip (المسميات الوظيفية) */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-7">
        {/* All Roles Card */}
        <button
          type="button"
          onClick={() => {
            setActiveRole('all');
            setSelectedPersonId(null);
          }}
          className={`flex flex-col justify-between rounded-2xl border p-3.5 text-right transition ${
            activeRole === 'all'
              ? 'border-primary bg-primary text-primary-foreground shadow-md'
              : 'border-border bg-card hover:border-primary/40 hover:bg-accent/40'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <Users className="h-5 w-5" />
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${activeRole === 'all' ? 'bg-white/20' : 'bg-muted text-muted-foreground'}`}>
              {globalStats.peopleCount} شخص
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-sm font-black">جميع المسميات</div>
            <div className={`text-[11px] ${activeRole === 'all' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {globalStats.done}/{globalStats.total} منجزة
            </div>
          </div>
        </button>

        {/* Individual Role Cards */}
        {TRACKABLE_ROLES.map((r) => {
          const d = dossiers.find((x) => x.role === r)!;
          const visual = ROLE_VISUALS[r];
          const Icon = visual.icon;
          const isActive = activeRole === r;
          return (
            <button
              key={r}
              type="button"
              onClick={() => {
                setActiveRole(r);
                setSelectedPersonId(d.people[0]?.userId ?? null);
                setPersonTaskFilter('all');
              }}
              className={`relative flex flex-col justify-between rounded-2xl border p-3.5 text-right transition ${
                isActive
                  ? `border-transparent bg-gradient-to-br ${visual.gradient} text-white shadow-md`
                  : 'border-border bg-card hover:border-primary/40 hover:bg-accent/40'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <Icon className="h-5 w-5 shrink-0" />
                <div className="flex items-center gap-1">
                  {d.stats.overdue > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${isActive ? 'bg-white text-rose-700' : 'bg-rose-500 text-white'}`}>
                      {d.stats.overdue}!
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {d.people.length}
                  </span>
                </div>
              </div>
              <div className="mt-2.5">
                <div className="truncate text-sm font-black">{d.label}</div>
                <div className={`mt-0.5 flex items-center justify-between text-[11px] ${isActive ? 'text-white/85' : 'text-muted-foreground'}`}>
                  <span>{d.stats.done}/{d.stats.total} منجزة</span>
                  <span>{d.stats.completionRate}%</span>
                </div>
                <div className={`mt-1.5 h-1.5 w-full overflow-hidden rounded-full ${isActive ? 'bg-white/25' : 'bg-muted'}`}>
                  <div
                    className={`h-full rounded-full transition-all ${isActive ? 'bg-white' : 'bg-primary'}`}
                    style={{ width: `${d.stats.completionRate}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Main Split Workspace: Right = Roles & People Dossiers, Left = Omniscient AI Chatbox */}
      <div className={`grid grid-cols-1 gap-4 ${isPrincipal ? 'xl:grid-cols-12' : ''}`}>
        {/* RIGHT SIDE: People & Tasks Breakdown */}
        <div className={`${isPrincipal ? 'xl:col-span-7' : ''} space-y-4`}>
          {/* Unclaimed Tasks Alert for Current Role */}
          {currentDossier && currentDossier.unclaimedTasks.length > 0 && (
            <div className="rounded-3xl border border-amber-300/70 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-black text-amber-900 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  مهام عامة لقسم «{currentDossier.label}» لم يستلمها شخص محدد بعد ({currentDossier.unclaimedTasks.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {currentDossier.unclaimedTasks.map((ut) => (
                  <div key={ut.id} className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-background/90 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-black text-foreground">{ut.title}</span>
                      <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        {ut.isScheduled ? 'مجدولة' : ut.isOverdue ? 'متأخرة' : 'مفتوحة للدور'}
                      </span>
                    </div>
                    {ut.dueAt && <p className="mt-1 text-[10px] text-muted-foreground">التسليم: {formatDate(ut.dueAt)}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People Grid (الأشخاص المعينون في هذا المسمى الوظيفي) */}
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  {activeRole === 'all'
                    ? `جميع الأشخاص المعينين في الفريق (${displayedPeople.length})`
                    : `الأشخاص المعينون في مسمى «${ROLE_LABELS[activeRole]}» (${displayedPeople.length})`}
                </h3>
                <p className="text-xs text-muted-foreground">
                  اضغط على أي شخص لعرض كل مهامه المنجزة بالتفصيل وما تبقى عليه
                </p>
              </div>
              {isPrincipal && activeRole !== 'all' && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    sendToAI(
                      `اعمل لي تقييماً ومقارنة شاملة لجميع الأشخاص في قسم "${ROLE_LABELS[activeRole]}": من الأفضل، ماذا أنجز كل واحد بالتفصيل، ومن لديه تأخير أو مهام متبقية؟`,
                    )
                  }
                  className="gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-xs font-bold text-white hover:from-indigo-700 hover:to-blue-700"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  قيّم قسم {ROLE_LABELS[activeRole]} بالـ AI
                </Button>
              )}
            </div>

            {displayedPeople.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                لا يوجد أشخاص معيّنون في هذا المسمى الوظيفي (أو لا توجد نتائج مطابقة للبحث).
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {displayedPeople.map((p) => {
                  const isSelected = selectedPerson?.userId === p.userId && selectedPerson?.role === p.role;
                  return (
                    <div
                      key={`${p.role}-${p.userId}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedPersonId(p.userId);
                        if (activeRole === 'all') setActiveRole(p.role);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedPersonId(p.userId);
                          if (activeRole === 'all') setActiveRole(p.role);
                        }
                      }}
                      className={`cursor-pointer rounded-2xl border p-4 text-right transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                          : 'border-border bg-background hover:border-primary/40 hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${ROLE_VISUALS[p.role].gradient} text-sm font-black text-white`}>
                            {p.name.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-sm font-black text-foreground">{p.name}</span>
                              {p.hasDayOffToday && (
                                <span title="راحة اليوم" className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                  <Coffee className="h-3 w-3" /> راحة
                                </span>
                              )}
                            </div>
                            <div className="truncate text-[11px] text-muted-foreground" dir="ltr">
                              {p.email}
                            </div>
                          </div>
                        </div>

                        <div className={`shrink-0 rounded-xl border px-2.5 py-1 text-center ${GRADE_STYLE[p.stats.gradeTone]}`}>
                          <div className="text-xs font-black">
                            {p.stats.score !== null ? `${p.stats.score}/100` : '—'}
                          </div>
                          <div className="text-[9px] font-bold">{p.stats.grade}</div>
                        </div>
                      </div>

                      {/* 4 Mini Stats */}
                      <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
                        <div className="rounded-xl bg-emerald-500/10 py-1.5">
                          <div className="text-xs font-black text-emerald-700 dark:text-emerald-300">{p.stats.done}</div>
                          <div className="text-[10px] text-muted-foreground">منجزة</div>
                        </div>
                        <div className="rounded-xl bg-amber-500/10 py-1.5">
                          <div className="text-xs font-black text-amber-700 dark:text-amber-300">{p.stats.inProgress}</div>
                          <div className="text-[10px] text-muted-foreground">قيد الإعداد</div>
                        </div>
                        <div className="rounded-xl bg-blue-500/10 py-1.5">
                          <div className="text-xs font-black text-blue-700 dark:text-blue-300">{p.stats.todo}</div>
                          <div className="text-[10px] text-muted-foreground">مطلوبة</div>
                        </div>
                        <div className="rounded-xl bg-rose-500/10 py-1.5">
                          <div className="text-xs font-black text-rose-700 dark:text-rose-300">{p.stats.overdue}</div>
                          <div className="text-[10px] text-muted-foreground">متأخرة</div>
                        </div>
                      </div>

                      {/* Footer row */}
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
                        <div className="text-[11px] text-muted-foreground">
                          الإنجاز: <strong className="text-foreground">{p.stats.completionRate}%</strong>
                          {p.stats.totalProofImages > 0 && ` · ${p.stats.totalProofImages} صورة إثبات`}
                        </div>
                        {isPrincipal && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPersonId(p.userId);
                              if (activeRole === 'all') setActiveRole(p.role);
                              sendToAI(
                                `أعطني تقييماً تفصيلياً كاملاً للشخص "${p.name}" (${ROLE_LABELS[p.role]}): كل مهمة أنجزها وماذا عمل فيها بالضبط، كل مهمة متبقية أو متأخرة عليه، درجته ونقاط القوة والضعف وتوصيتك له.`,
                              );
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-500/20 dark:text-indigo-300"
                          >
                            <Sparkles className="h-3 w-3" /> قيّمه بالـ AI
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Person FULL Detailed Dossier */}
          {selectedPerson && (
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${ROLE_VISUALS[selectedPerson.role].gradient} text-lg font-black text-white shadow-sm`}>
                    {selectedPerson.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-foreground">{selectedPerson.name}</h3>
                      <Badge variant="outline" className="text-xs font-bold">
                        {ROLE_LABELS[selectedPerson.role]}
                      </Badge>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-black ${GRADE_STYLE[selectedPerson.stats.gradeTone]}`}>
                        <Award className="h-3.5 w-3.5" />
                        {selectedPerson.stats.score !== null ? `${selectedPerson.stats.score}/100 · ${selectedPerson.stats.grade}` : selectedPerson.stats.grade}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span dir="ltr">{selectedPerson.email}</span>
                      {selectedPerson.stats.onTimeRate !== null && (
                        <span>الالتزام بالوقت: <strong className="text-foreground">{selectedPerson.stats.onTimeRate}%</strong></span>
                      )}
                      {selectedPerson.stats.avgCompletionHours !== null && (
                        <span>متوسط الإنجاز: <strong className="text-foreground">{formatDurationArabic(selectedPerson.stats.avgCompletionHours)}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Task status filter pills for this person */}
                <div className="flex flex-wrap gap-1.5">
                  {([
                    ['all', `الكل (${selectedPerson.stats.total})`],
                    ['remaining', `المتبقي عليه (${selectedPerson.stats.remaining})`],
                    ['done', `أنجزها بالتفصيل (${selectedPerson.stats.done})`],
                  ] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPersonTaskFilter(key)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        personTaskFilter === key
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasks list for selected person */}
              {selectedPersonTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  <ClipboardList className="mb-2 h-8 w-8 opacity-35" />
                  <p className="font-bold text-foreground">لا توجد مهام في هذا التبويب لـ {selectedPerson.name}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPersonTasks.map((task) => (
                    <TaskDetailCard
                      key={task.id}
                      task={task}
                      personName={selectedPerson.name}
                      onAskAI={(p) => sendToAI(p)}
                      onPreviewImage={(path) => setPreviewImg(path)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* LEFT SIDE: Omniscient Tasks & Evaluations AI Chatbox (Admin / Principal ONLY) */}
        {isPrincipal && (
          <div className="xl:col-span-5">
            <div className="xl:sticky xl:top-3 flex h-[calc(100vh-11rem)] min-h-[650px] flex-col overflow-hidden rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-card shadow-md">
              {/* AI Header */}
              <div className="border-b border-border bg-gradient-to-l from-indigo-600/15 via-violet-600/10 to-transparent px-4 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm sm:text-base font-black text-foreground">
                        الـ AI العبقري لتحليل المهام والتقييمات
                      </h3>
                      <p className="truncate text-[11px] font-medium text-muted-foreground">
                        عارف كل كبيرة وصغيرة عن كل عضو ومهمة وتفصيل
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setChatMessages([initialGreeting])}
                    disabled={aiBusy || chatMessages.length <= 1}
                    className="h-8 gap-1 rounded-xl text-xs"
                    title="محادثة جديدة"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> جديدة
                  </Button>
                </div>

                {/* Live Connected Memory Pill */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 rounded-xl bg-background/80 border border-indigo-200/60 dark:border-indigo-900/50 px-3 py-1.5 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">متصل حياً:</span>
                  <span className="text-muted-foreground">
                    {globalStats.peopleCount} عضو · {globalStats.total} مهمة · {globalStats.submissionsCount} تسليم
                  </span>
                  {selectedPerson && (
                    <span className="mr-auto rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                      ينظر إلى: {selectedPerson.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Genius Prompt Chips */}
              <div className="flex gap-1.5 overflow-x-auto border-b border-border bg-muted/20 px-3.5 py-2.5">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={aiBusy}
                    onClick={() => sendToAI(qp.prompt)}
                    className="shrink-0 rounded-full border border-indigo-200 dark:border-indigo-800 bg-background px-3 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-600 hover:text-white disabled:opacity-50"
                  >
                    ✦ {qp.label}
                  </button>
                ))}
              </div>

              {/* Messages Container (Internal Scroll ONLY) */}
              <div ref={chatListRef} className="flex-1 space-y-3.5 overflow-y-auto bg-muted/15 p-4">
                {chatMessages.map((m, idx) => {
                  const isUser = m.role === 'user';
                  return (
                    <div key={idx} className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
                      <div
                        className={`relative max-w-[92%] rounded-2xl px-4 py-3 shadow-sm ${
                          isUser
                            ? 'rounded-tr-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm'
                            : 'rounded-tl-sm border border-border bg-card text-foreground'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        ) : (
                          <FormattedAIText content={m.content} />
                        )}
                        <div
                          className={`mt-2 flex items-center justify-between gap-3 text-[10px] ${
                            isUser ? 'text-blue-100/80' : 'text-muted-foreground'
                          }`}
                        >
                          <span>{m.time}</span>
                          {!isUser && idx > 0 && (
                            <button
                              type="button"
                              onClick={async () => {
                                await navigator.clipboard.writeText(m.content);
                                setCopiedMsgIdx(idx);
                                toast.success('تم نسخ تحليل الـ AI');
                                setTimeout(() => setCopiedMsgIdx(null), 1800);
                              }}
                              className="inline-flex items-center gap-1 hover:text-foreground"
                            >
                              {copiedMsgIdx === idx ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                              نسخ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {aiBusy && (
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex items-center gap-2 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-card px-4 py-3 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      يحلّل كل بيانات الفريق والمهام والتسليمات...
                    </div>
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-border bg-card p-3.5">
                <div className="flex items-end gap-2">
                  <Textarea
                    rows={1}
                    disabled={aiBusy}
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendToAI();
                      }
                    }}
                    placeholder="اسأل الـ AI أي سؤال... (مثلاً: قيّم فلان، شو ظل على المدققين، مين الأفضل؟)"
                    className="min-h-[44px] max-h-32 resize-none rounded-xl text-sm py-2.5"
                  />
                  <Button
                    type="button"
                    size="icon"
                    disabled={aiBusy || !aiInput.trim()}
                    onClick={() => sendToAI()}
                    className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"
                    title="إرسال للـ AI"
                  >
                    {aiBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proof Image Lightbox Dialog */}
      <Dialog open={!!previewImg} onOpenChange={(o) => !o && setPreviewImg(null)}>
        <DialogContent className="max-w-3xl rounded-3xl p-4" dir="rtl">
          <DialogHeader className="flex flex-row items-center justify-between text-right">
            <DialogTitle className="text-base font-black">معاينة صورة الإثبات</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setPreviewImg(null)} className="rounded-xl">
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          {previewImg && (
            <div className="flex justify-center overflow-hidden rounded-2xl bg-black/5 p-2">
              <TeamImage path={previewImg} className="max-h-[75vh] w-auto rounded-xl object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleTasksIntelligenceHub;
