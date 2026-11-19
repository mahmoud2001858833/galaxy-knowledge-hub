import { geminiRequest } from '@/services/geminiTransport';
import {
  ROLE_LABELS,
  formatDate,
  isOverdue,
  isScheduled,
  type DayOffRecord,
  type PageManagerFileItem,
  type SupervisorTask,
  type TaskColumn,
  type TaskStatus,
  type TeamMember,
  type TeamSubmission,
  type TeamTask,
  type WorkerRole,
} from './teamApi';

export type TrackableRole = WorkerRole | 'supervisor';

export const TRACKABLE_ROLES: TrackableRole[] = [
  'auditor',
  'speaker',
  'page_manager',
  'ai_manager',
  'file_manager',
  'supervisor',
];

export interface UnifiedTaskRecord {
  id: string;
  source: 'team_task' | 'supervisor_task';
  title: string;
  details: string | null;
  role: TrackableRole;
  assigneeUserId: string | null;
  completedBy: string | null;
  status: TaskStatus;
  column: TaskColumn;
  isOverdue: boolean;
  isScheduled: boolean;
  createdAt: string;
  dueAt: string | null;
  publishAt: string | null;
  completedAt: string | null;
  extraRequirements: string[];
  priority?: 'normal' | 'high' | 'urgent';
  submissions: TeamSubmission[];
  completionNote?: string | null;
  completedOnTime: boolean | null; // null if not done or no due_at
  turnaroundHours: number | null;
}

export type GradeTone = 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';

export interface PersonPerformanceStats {
  total: number;
  done: number;
  remaining: number;
  inProgress: number;
  todo: number;
  overdue: number;
  scheduled: number;
  completionRate: number;
  onTimeRate: number | null;
  avgCompletionHours: number | null;
  totalProofImages: number;
  submissionsCount: number;
  score: number | null; // null when person has 0 tasks
  grade: string;
  gradeTone: GradeTone;
}

export interface PersonDossier {
  userId: string;
  name: string;
  email: string;
  role: TrackableRole;
  allRoles: string[];
  hasDayOffToday: boolean;
  dayOffNote: string | null;
  tasks: UnifiedTaskRecord[];
  completedTasks: UnifiedTaskRecord[];
  remainingTasks: UnifiedTaskRecord[];
  overdueTasks: UnifiedTaskRecord[];
  inProgressTasks: UnifiedTaskRecord[];
  todoTasks: UnifiedTaskRecord[];
  scheduledTasks: UnifiedTaskRecord[];
  stats: PersonPerformanceStats;
}

export interface RoleDossier {
  role: TrackableRole;
  label: string;
  people: PersonDossier[];
  unclaimedTasks: UnifiedTaskRecord[];
  allTasks: UnifiedTaskRecord[];
  stats: {
    total: number;
    done: number;
    remaining: number;
    inProgress: number;
    todo: number;
    overdue: number;
    scheduled: number;
    completionRate: number;
    avgScore: number | null;
  };
}

export interface CollectiveSummaryLite {
  id: string;
  title: string;
  status: string;
  duration_days: number;
  subtasks: {
    title: string;
    assignee_email: string | null;
    status: string;
    day_from: number;
    day_to: number;
  }[];
}

const hoursBetween = (fromIso: string | null, toIso: string | null): number | null => {
  if (!fromIso || !toIso) return null;
  const diffMs = new Date(toIso).getTime() - new Date(fromIso).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return null;
  return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
};

export const formatDurationArabic = (hours: number | null): string => {
  if (hours === null) return 'غير محدد';
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} دقيقة`;
  if (hours < 24) return `${Math.round(hours * 10) / 10} ساعة`;
  const days = Math.round((hours / 24) * 10) / 10;
  return `${days} يوم`;
};

export const formatOverdueDelta = (dueAt: string | null): string => {
  if (!dueAt) return '';
  const diffMs = Date.now() - new Date(dueAt).getTime();
  if (diffMs <= 0) {
    const leftHours = Math.abs(diffMs) / (1000 * 60 * 60);
    return `متبقي ${formatDurationArabic(leftHours)}`;
  }
  const lateHours = diffMs / (1000 * 60 * 60);
  return `متأخرة منذ ${formatDurationArabic(lateHours)}`;
};

const computeScore = (tasks: UnifiedTaskRecord[]): Pick<PersonPerformanceStats, 'score' | 'grade' | 'gradeTone'> => {
  const activeTasks = tasks.filter((t) => !t.isScheduled);
  if (activeTasks.length === 0) {
    return { score: null, grade: 'بدون مهام بعد', gradeTone: 'slate' };
  }

  const done = activeTasks.filter((t) => t.status === 'done');
  const inProgress = activeTasks.filter((t) => t.status === 'in_progress' && !t.isOverdue);
  const overdue = activeTasks.filter((t) => t.isOverdue);

  // Weighted completion: done = 100%, in_progress (not overdue) = 45%
  const completionComponent = ((done.length + inProgress.length * 0.45) / activeTasks.length) * 65;

  // On-time reliability (out of 20)
  const datedDone = done.filter((t) => t.completedOnTime !== null);
  const onTimeRatio = datedDone.length > 0
    ? datedDone.filter((t) => t.completedOnTime === true).length / datedDone.length
    : done.length > 0
      ? 1
      : 0.5;
  const onTimeComponent = onTimeRatio * 20;

  // Documentation / proof quality (out of 15)
  const documentedDone = done.filter(
    (t) =>
      t.submissions.some((s) => (s.description?.trim().length ?? 0) >= 15 || (s.images?.length ?? 0) > 0 || Boolean(s.school_name)) ||
      Boolean(t.completionNote?.trim()),
  );
  const proofRatio = done.length > 0 ? documentedDone.length / done.length : 0.6;
  const proofComponent = proofRatio * 15;

  // Overdue penalty (-8 per overdue task, capped at -32)
  const overduePenalty = Math.min(32, overdue.length * 8);

  const rawScore = Math.round(Math.max(0, Math.min(100, completionComponent + onTimeComponent + proofComponent - overduePenalty)));

  if (rawScore >= 90) return { score: rawScore, grade: 'ممتاز A+', gradeTone: 'emerald' };
  if (rawScore >= 78) return { score: rawScore, grade: 'جيد جداً A', gradeTone: 'blue' };
  if (rawScore >= 62) return { score: rawScore, grade: 'جيد B', gradeTone: 'amber' };
  if (rawScore >= 45) return { score: rawScore, grade: 'يحتاج متابعة C', gradeTone: 'amber' };
  return { score: rawScore, grade: 'متأخر D', gradeTone: 'rose' };
};

/**
 * Builds complete, live per-role and per-person dossiers from Supabase team tables.
 */
export function buildRoleDossiers(params: {
  members: TeamMember[];
  tasks: TeamTask[];
  supervisorTasks: SupervisorTask[];
  submissions: TeamSubmission[];
  dayOffMap: Map<string, DayOffRecord>;
}): RoleDossier[] {
  const { members, tasks, supervisorTasks, submissions, dayOffMap } = params;

  const subsByTask = new Map<string, TeamSubmission[]>();
  for (const s of submissions) {
    const arr = subsByTask.get(s.task_id) ?? [];
    arr.push(s);
    subsByTask.set(s.task_id, arr);
  }

  // Map userId -> all their role labels
  const rolesByUser = new Map<string, string[]>();
  for (const m of members) {
    const arr = rolesByUser.get(m.user_id) ?? [];
    const label = ROLE_LABELS[m.role as keyof typeof ROLE_LABELS] ?? m.role;
    if (!arr.includes(label)) arr.push(label);
    rolesByUser.set(m.user_id, arr);
  }

  // Normalize team_tasks
  const unifiedWorkerTasks: UnifiedTaskRecord[] = tasks.map((t) => {
    const scheduled = isScheduled(t);
    const overdue = !scheduled && isOverdue(t);
    const col: TaskColumn = scheduled ? 'scheduled' : overdue ? 'overdue' : (t.status as TaskStatus);
    const taskSubs = subsByTask.get(t.id) ?? [];
    const startRef = t.publish_at && new Date(t.publish_at).getTime() > new Date(t.created_at).getTime() ? t.publish_at : t.created_at;
    const completedOnTime =
      t.status === 'done' && t.due_at && t.completed_at
        ? new Date(t.completed_at).getTime() <= new Date(t.due_at).getTime()
        : null;

    return {
      id: t.id,
      source: 'team_task',
      title: t.title,
      details: t.details,
      role: t.assignee_role as WorkerRole,
      assigneeUserId: t.assignee_user_id,
      completedBy: t.completed_by,
      status: t.status as TaskStatus,
      column: col,
      isOverdue: overdue,
      isScheduled: scheduled,
      createdAt: t.created_at,
      dueAt: t.due_at,
      publishAt: t.publish_at,
      completedAt: t.completed_at,
      extraRequirements: t.extra_requirements ?? [],
      submissions: taskSubs,
      completedOnTime,
      turnaroundHours: t.status === 'done' ? hoursBetween(startRef, t.completed_at) : null,
    };
  });

  // Normalize supervisor_tasks
  const unifiedSupervisorTasks: UnifiedTaskRecord[] = supervisorTasks.map((st) => {
    const overdue = st.status !== 'done' && !!st.dueAt && new Date(st.dueAt).getTime() < Date.now();
    const col: TaskColumn = overdue ? 'overdue' : st.status;
    const completedOnTime =
      st.status === 'done' && st.dueAt && st.completedAt
        ? new Date(st.completedAt).getTime() <= new Date(st.dueAt).getTime()
        : null;

    return {
      id: st.id,
      source: 'supervisor_task',
      title: st.title,
      details: st.details || null,
      role: 'supervisor',
      assigneeUserId: st.supervisorUserId,
      completedBy: st.status === 'done' ? st.supervisorUserId : null,
      status: st.status,
      column: col,
      isOverdue: overdue,
      isScheduled: false,
      createdAt: st.createdAt,
      dueAt: st.dueAt,
      publishAt: null,
      completedAt: st.completedAt,
      extraRequirements: [],
      priority: st.priority,
      submissions: [],
      completionNote: st.completionNote,
      completedOnTime,
      turnaroundHours: st.status === 'done' ? hoursBetween(st.createdAt, st.completedAt) : null,
    };
  });

  const allUnified = [...unifiedWorkerTasks, ...unifiedSupervisorTasks];

  return TRACKABLE_ROLES.map((role) => {
    const roleMembers = members.filter((m) => m.role === role);
    const roleTasks = allUnified.filter((t) => t.role === role);

    // Deduplicate people within this role (in case of duplicates)
    const seenUsers = new Set<string>();
    const people: PersonDossier[] = [];

    for (const m of roleMembers) {
      if (seenUsers.has(m.user_id)) continue;
      seenUsers.add(m.user_id);

      const personTasks = roleTasks.filter(
        (t) => t.assigneeUserId === m.user_id || (t.status === 'done' && t.completedBy === m.user_id),
      );

      const completedTasks = personTasks.filter((t) => t.status === 'done');
      const overdueTasks = personTasks.filter((t) => t.isOverdue);
      const scheduledTasks = personTasks.filter((t) => t.isScheduled);
      const inProgressTasks = personTasks.filter((t) => t.status === 'in_progress' && !t.isOverdue && !t.isScheduled);
      const todoTasks = personTasks.filter((t) => t.status === 'todo' && !t.isOverdue && !t.isScheduled);
      const remainingTasks = [...overdueTasks, ...inProgressTasks, ...todoTasks, ...scheduledTasks];

      const datedDone = completedTasks.filter((t) => t.completedOnTime !== null);
      const onTimeRate =
        datedDone.length > 0
          ? Math.round((datedDone.filter((t) => t.completedOnTime === true).length / datedDone.length) * 100)
          : null;

      const durations = completedTasks.map((t) => t.turnaroundHours).filter((h): h is number => h !== null);
      const avgCompletionHours =
        durations.length > 0 ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10 : null;

      const totalProofImages = personTasks.reduce(
        (acc, t) => acc + t.submissions.reduce((sAcc, s) => sAcc + (s.images?.length ?? 0), 0),
        0,
      );
      const submissionsCount = personTasks.reduce((acc, t) => acc + t.submissions.length, 0);

      const activeTotal = personTasks.filter((t) => !t.isScheduled).length;
      const completionRate = activeTotal > 0 ? Math.round((completedTasks.length / activeTotal) * 100) : 0;
      const { score, grade, gradeTone } = computeScore(personTasks);
      const dayOff = dayOffMap.get(m.user_id);

      people.push({
        userId: m.user_id,
        name: m.display_name || (m.email ?? '').split('@')[0] || 'عضو',
        email: m.email ?? '',
        role,
        allRoles: rolesByUser.get(m.user_id) ?? [ROLE_LABELS[role]],
        hasDayOffToday: Boolean(dayOff),
        dayOffNote: dayOff?.note ?? null,
        tasks: personTasks,
        completedTasks,
        remainingTasks,
        overdueTasks,
        inProgressTasks,
        todoTasks,
        scheduledTasks,
        stats: {
          total: personTasks.length,
          done: completedTasks.length,
          remaining: remainingTasks.length,
          inProgress: inProgressTasks.length,
          todo: todoTasks.length,
          overdue: overdueTasks.length,
          scheduled: scheduledTasks.length,
          completionRate,
          onTimeRate,
          avgCompletionHours,
          totalProofImages,
          submissionsCount,
          score,
          grade,
          gradeTone,
        },
      });
    }

    // Sort people: highest score first, then most completed tasks
    people.sort((a, b) => (b.stats.score ?? -1) - (a.stats.score ?? -1) || b.stats.done - a.stats.done);

    // Tasks assigned to this role with NO specific user yet
    const unclaimedTasks = roleTasks.filter((t) => t.assigneeUserId === null && t.completedBy === null);

    const doneCount = roleTasks.filter((t) => t.status === 'done').length;
    const overdueCount = roleTasks.filter((t) => t.isOverdue).length;
    const scheduledCount = roleTasks.filter((t) => t.isScheduled).length;
    const inProgressCount = roleTasks.filter((t) => t.status === 'in_progress' && !t.isOverdue && !t.isScheduled).length;
    const todoCount = roleTasks.filter((t) => t.status === 'todo' && !t.isOverdue && !t.isScheduled).length;
    const activeRoleTotal = roleTasks.length - scheduledCount;
    const scoredPeople = people.filter((p) => p.stats.score !== null);
    const avgScore =
      scoredPeople.length > 0
        ? Math.round(scoredPeople.reduce((acc, p) => acc + (p.stats.score ?? 0), 0) / scoredPeople.length)
        : null;

    return {
      role,
      label: ROLE_LABELS[role],
      people,
      unclaimedTasks,
      allTasks: roleTasks,
      stats: {
        total: roleTasks.length,
        done: doneCount,
        remaining: roleTasks.length - doneCount,
        inProgress: inProgressCount,
        todo: todoCount,
        overdue: overdueCount,
        scheduled: scheduledCount,
        completionRate: activeRoleTotal > 0 ? Math.round((doneCount / activeRoleTotal) * 100) : 0,
        avgScore,
      },
    };
  });
}

/**
 * Compiles the ENTIRE live workspace (all roles, every person, every completed & remaining task,
 * every submission proof/description/school/bug location, supervisor tasks, Drive files, collective tasks,
 * and active UI focus) into a crisp factual knowledge context for Gemini.
 */
export function buildOmniscientAIContext(params: {
  dossiers: RoleDossier[];
  pageFiles: PageManagerFileItem[];
  collectiveTasks: CollectiveSummaryLite[];
  activeRole: 'all' | TrackableRole;
  selectedPersonId: string | null;
}): string {
  const { dossiers, pageFiles, collectiveTasks, activeRole, selectedPersonId } = params;
  const nowStr = new Date().toLocaleString('ar-JO', { timeZone: 'Asia/Amman', dateStyle: 'full', timeStyle: 'short' });

  const totalTasks = dossiers.reduce((a, d) => a + d.stats.total, 0);
  const totalDone = dossiers.reduce((a, d) => a + d.stats.done, 0);
  const totalOverdue = dossiers.reduce((a, d) => a + d.stats.overdue, 0);
  const totalInProgress = dossiers.reduce((a, d) => a + d.stats.inProgress, 0);
  const totalTodo = dossiers.reduce((a, d) => a + d.stats.todo, 0);

  let selectedPersonLabel = 'غير محدد (عرض عام)';
  if (selectedPersonId) {
    for (const d of dossiers) {
      const p = d.people.find((x) => x.userId === selectedPersonId);
      if (p) {
        selectedPersonLabel = `${p.name} (${d.label})`;
        break;
      }
    }
  }

  const lines: string[] = [];
  lines.push(`=== لقطة البيانات الحية الشاملة لفريق منصة ذروة العلم ===`);
  lines.push(`التاريخ والوقت (توقيت الأردن): ${nowStr}`);
  lines.push(`[السياق المفتوح حالياً عند الأدمن]: المسمى الوظيفي المفتوح = ${activeRole === 'all' ? 'جميع المسميات الوظيفية' : ROLE_LABELS[activeRole]} | الشخص المحدد حالياً = ${selectedPersonLabel}`);
  lines.push(
    `الملخص الإجمالي: إجمالي المهام=${totalTasks} | المنجزة=${totalDone} | المتأخرة=${totalOverdue} | قيد الإعداد=${totalInProgress} | المطلوبة=${totalTodo}`,
  );
  lines.push('');

  for (const d of dossiers) {
    lines.push(`## المسمى الوظيفي: ${d.label} (${d.role})`);
    lines.push(
      `إحصائيات القسم: عدد الأشخاص=${d.people.length} | إجمالي المهام=${d.stats.total} | منجزة=${d.stats.done} | متبقية=${d.stats.remaining} | متأخرة=${d.stats.overdue} | نسبة الإنجاز=${d.stats.completionRate}% | متوسط التقييم=${d.stats.avgScore ?? 'لا يوجد'}`,
    );

    if (d.unclaimedTasks.length > 0) {
      lines.push(`  * مهام عامة مفتوحة للدور لم يستلمها شخص محدد بعد (${d.unclaimedTasks.length}):`);
      for (const ut of d.unclaimedTasks.slice(0, 25)) {
        const statusAr = ut.isScheduled ? 'مجدولة' : ut.isOverdue ? 'متأخرة' : ut.status === 'in_progress' ? 'قيد الإعداد' : 'مطلوبة';
        lines.push(
          `    - [${statusAr}] "${ut.title}"${ut.dueAt ? ` | تسليم: ${formatDate(ut.dueAt)}` : ''}${ut.details ? ` | تفاصيل: ${ut.details.slice(0, 180)}` : ''}`,
        );
      }
    }

    if (d.people.length === 0) {
      lines.push(`  (لا يوجد أشخاص معيّنون في هذا المسمى الوظيفي حالياً)`);
    }

    for (const p of d.people) {
      lines.push(
        `  ### الشخص: ${p.name} | البريد: ${p.email} | أدواره: ${p.allRoles.join('، ')}${p.hasDayOffToday ? ` | [لديه راحة اليوم: ${p.dayOffNote || 'بدون مهام اليوم'}]` : ''}`,
      );
      lines.push(
        `    التقييم المحسوب: ${p.stats.score !== null ? `${p.stats.score}/100 (${p.stats.grade})` : 'بدون مهام بعد'} | منجزة=${p.stats.done} | متبقية=${p.stats.remaining} (متأخرة=${p.stats.overdue}، قيد الإعداد=${p.stats.inProgress}، مطلوبة=${p.stats.todo}، مجدولة=${p.stats.scheduled}) | الالتزام بالوقت=${p.stats.onTimeRate !== null ? `${p.stats.onTimeRate}%` : 'غير محدد'} | متوسط زمن الإنجاز=${formatDurationArabic(p.stats.avgCompletionHours)} | صور إثبات=${p.stats.totalProofImages}`,
      );

      if (p.remainingTasks.length > 0) {
        lines.push(`    - المهام المتبقية عليه (${p.remainingTasks.length}):`);
        for (const rt of p.remainingTasks.slice(0, 25)) {
          const stLabel = rt.isScheduled
            ? 'مجدولة'
            : rt.isOverdue
              ? `متأخرة (${formatOverdueDelta(rt.dueAt)})`
              : rt.status === 'in_progress'
                ? 'قيد الإعداد'
                : 'مطلوبة';
          lines.push(
            `      • [${stLabel}] "${rt.title}"${rt.priority ? ` (أولوية: ${rt.priority})` : ''}${rt.dueAt ? ` | موعد التسليم: ${formatDate(rt.dueAt)}` : ''}${rt.details ? ` | التفاصيل: ${rt.details.slice(0, 200)}` : ''}${rt.extraRequirements.length ? ` | متطلبات إضافية: ${rt.extraRequirements.join('، ')}` : ''}`,
          );
        }
      }

      if (p.completedTasks.length > 0) {
        lines.push(`    - المهام التي أنجزها وتفاصيل عمله (${p.completedTasks.length}):`);
        for (const ct of p.completedTasks.slice(0, 30)) {
          const timing = ct.completedOnTime === true ? 'في الوقت' : ct.completedOnTime === false ? 'بعد الموعد' : 'منجزة';
          const dur = ct.turnaroundHours !== null ? `خلال ${formatDurationArabic(ct.turnaroundHours)}` : '';
          let proofText = '';
          if (ct.submissions.length > 0) {
            const s = ct.submissions[0];
            const parts: string[] = [];
            if (s.school_name) parts.push(`المدرسة: ${s.school_name}`);
            if (s.teacher_names) parts.push(`المعلمات: ${s.teacher_names}`);
            if (s.problem_location) parts.push(`مكان المشكلة: ${s.problem_location}`);
            if (s.description) parts.push(`ماذا عمل: ${s.description.slice(0, 280)}`);
            if (s.images?.length) parts.push(`أرفق ${s.images.length} صورة إثبات`);
            if (s.extra_answers && typeof s.extra_answers === 'object' && Object.keys(s.extra_answers as Record<string, unknown>).length > 0) {
              const ans = Object.entries(s.extra_answers as Record<string, unknown>)
                .map(([k, v]) => `${k}: ${String(v)}`)
                .join(' | ');
              parts.push(`إجابات إضافية: ${ans.slice(0, 180)}`);
            }
            proofText = parts.length ? ` => [${parts.join(' ؛ ')}]` : '';
          } else if (ct.completionNote) {
            proofText = ` => [ملاحظة الإنجاز: ${ct.completionNote.slice(0, 250)}]`;
          }
          lines.push(
            `      ✓ "${ct.title}" (${timing}${dur ? ` · ${dur}` : ''}${ct.completedAt ? ` · أُنجزت ${formatDate(ct.completedAt)}` : ''})${proofText}`,
          );
        }
      }
    }
    lines.push('');
  }

  if (pageFiles.length > 0) {
    lines.push(`## ملفات وفيديوهات مكان الملفات لمسؤول الصفحة (${pageFiles.length}):`);
    for (const f of pageFiles.slice(0, 20)) {
      lines.push(
        `  - [${f.mediaType}] "${f.title}" | أرسلها: ${f.senderName} (${f.senderRole === 'principal' ? 'الرئيس' : 'المشرف'}) | ${formatDate(f.createdAt)}${f.description ? ` | الوصف: ${f.description.slice(0, 160)}` : ''}`,
      );
    }
    lines.push('');
  }

  if (collectiveTasks.length > 0) {
    lines.push(`## المهام الجماعية (${collectiveTasks.length}):`);
    for (const ct of collectiveTasks.slice(0, 10)) {
      const doneSub = ct.subtasks.filter((s) => s.status === 'done').length;
      lines.push(`  - "${ct.title}" | الحالة: ${ct.status} | المدة: ${ct.duration_days} يوم | المهام الفرعية: ${doneSub}/${ct.subtasks.length}`);
      for (const st of ct.subtasks.slice(0, 15)) {
        lines.push(`      · [${st.status}] ${st.title} (${st.assignee_email || 'غير معيّن'} · يوم ${st.day_from}-${st.day_to})`);
      }
    }
  }

  return lines.join('\n');
}

export interface AIChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `أنت "المستشار الذكي الأعلى لمهام وأداء فريق منصة ذروة العلم" (AI مخصص حصرياً للأدمن/الرئيس محمود).
لديك اطلاع كامل ولحظي على كل كبيرة وصغيرة في بيانات الفريق: جميع المسميات الوظيفية، جميع الأشخاص المعينين، كل مهمة منجزة وماذا عمل الشخص فيها بالتفصيل (الوصف، أسماء المدارس، أسماء المعلمات، أماكن المشاكل التي رصدها المدققون، عدد الصور والإثباتات، الإجابات الإضافية)، كل مهمة متبقية أو متأخرة أو قيد الإعداد أو مجدولة، درجات التقييم التلقائية، ملفات مكان الملفات، والمهام الجماعية.

قواعدك الصارمة:
1. اعتمد حصرياً على البيانات الحية المرفقة في السياق. لا تخترع أبداً أسماء أشخاص أو مهام أو أرقاماً غير موجودة في البيانات.
2. إذا استخدم الأدمن ضمائر مثل "قيّمه"، "شو ظل عليه؟"، "كيف أداء هذا القسم؟" فارجع فوراً إلى [السياق المفتوح حالياً عند الأدمن] في بداية البيانات.
3. كن دقيقاً وتفصيلياً وذكياً: اذكر أسماء المهام الحقيقية، والتواريخ، والمدارس أو أماكن المشاكل التي رصدها العضو، ودرجة تقييمه الحقيقية، ووضّح بالأدلة لماذا يستحق هذا التقييم.
4. عند طلب التقييم أو المقارنة: قدّم تقييماً منظماً يشمل: (الترتيب/الدرجة من 100، أبرز ما أنجزه بالتفصيل، ما تبقى عليه والمتأخر، نقاط القوة، نقاط تحتاج متابعة، وتوصية تنفيذية واضحة للأدمن).
5. اكتب بلغة عربية واضحة وأنيقة ومنظمة (عناوين مختصرة، نقاط، وخط عريض **للأرقام والأسماء المهمة**) دون حشو غير مفيد.
6. إذا لم توجد بيانات أو مهام لشخص معين، صرّح بذلك بوضوح واقترح كيف يمكن تفعيله.`;

export async function askTasksIntelligenceAI(turns: AIChatTurn[], liveContext: string): Promise<string> {
  const { url, headers } = await geminiRequest('gemini-3.1-flash-lite', { stream: false });

  const contents = turns.map((t, idx) => {
    const isLastUser = idx === turns.length - 1 && t.role === 'user';
    const text = isLastUser
      ? `[البيانات الحية المحدثة الآن]\n${liveContext}\n\n[سؤال الأدمن]\n${t.content}`
      : t.content;
    return {
      role: t.role === 'assistant' ? 'model' : 'user',
      parts: [{ text }],
    };
  });

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`فشل الاتصال بالذكاء الاصطناعي (${res.status}): ${errText.slice(0, 180)}`);
  }

  const data = await res.json();
  const reply: string | undefined = data?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? '')
    .join('')
    .trim();

  if (!reply) {
    throw new Error('لم يُرجع الذكاء الاصطناعي رداً. حاول مرة أخرى.');
  }
  return reply;
}
