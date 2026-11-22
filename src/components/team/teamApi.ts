import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

/**
 * Data layer for the team & task management system (migration 20261101200000_team_management).
 * Access rules live in the database (RLS + team_* functions); this file only reads and calls them.
 */

export type TeamRole = 'principal' | 'supervisor' | 'speaker' | 'page_manager' | 'auditor' | 'ai_manager' | 'file_manager';
export type WorkerRole = Exclude<TeamRole, 'principal' | 'supervisor'>;
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TeamMember = Tables<'team_members'>;
export type TeamTask = Tables<'team_tasks'>;
export type TeamSubmission = Tables<'team_task_submissions'>;
export type TeamNotification = Tables<'team_notifications'>;
export type TeamMessage = Tables<'team_messages'>;
export type TeamPoll = Tables<'team_polls'>;
export type TeamPollVote = Tables<'team_poll_votes'>;

export const PRINCIPAL = { name: 'محمود محمد عبد الله جوارنة', email: 'jowmahmoud6@gmail.com' } as const;

export const ROLE_LABELS: Record<TeamRole, string> = {
  principal: 'الرئيس',
  supervisor: 'المشرف',
  speaker: 'المتكلم',
  page_manager: 'مسؤول الصفحة',
  auditor: 'المدقق',
  ai_manager: 'مسؤول الذكاء الاصطناعي',
  file_manager: 'مسؤول رفع الملفات',
};

export const WORKER_ROLES: WorkerRole[] = ['speaker', 'page_manager', 'auditor', 'ai_manager', 'file_manager'];

/** What each role must attach to close a task (enforced again in team_complete_task). */
export const ROLE_PROOF: Record<WorkerRole, string> = {
  speaker: 'صور زيارة المدرسة، اسم المدرسة، وأسماء المعلمات',
  page_manager: 'وصف تفصيلي لما قمت به + صورة (Screenshot) للموقع أو الصفحة',
  auditor: 'تفاصيل المشكلة ومكانها بالتفصيل + صورة للمشكلة',
  ai_manager: 'وصف لما قمت به لحل المهمة (الصورة اختيارية)',
  file_manager: 'وصف تفصيلي للعمل + صورة إثبات',
};

export type TaskColumn = TaskStatus | 'overdue' | 'scheduled';

export const STATUS_LABELS: Record<TaskColumn, string> = {
  scheduled: 'مهام مجدولة',
  todo: 'مهام مطلوبة',
  in_progress: 'مهام قيد الإعداد',
  overdue: 'مهام متأخرة',
  done: 'مهام منجزة',
};

/** Sentinel markers used to store special lead/team records inside team_tasks without extra migrations. */
export const DAY_OFF_TAG = '__TEAM_DAY_OFF__' as const;
export const DAY_OFF_TITLE_PREFIX = '__DAY_OFF__:' as const;
export const SUPERVISOR_TASK_TAG = '__SUPERVISOR_TASK__' as const;
export const PAGE_MANAGER_FILE_TAG = '__PAGE_MANAGER_FILE__' as const;

export interface DayOffRecord {
  taskId: string;
  userId: string;
  date: string;
  note: string | null;
  createdAt: string;
}

export type SupervisorTaskPriority = 'normal' | 'high' | 'urgent';

export interface SupervisorTask {
  id: string;
  title: string;
  details: string;
  priority: SupervisorTaskPriority;
  status: TaskStatus;
  dueAt: string | null;
  supervisorUserId: string | null;
  completionNote: string | null;
  createdBy: string | null;
  createdAt: string;
  completedAt: string | null;
}

export type PageManagerMediaType = 'video' | 'file' | 'folder' | 'design';

export interface PageManagerFileItem {
  id: string;
  title: string;
  description: string;
  driveUrl: string;
  mediaType: PageManagerMediaType;
  targetUserId: string | null;
  senderName: string;
  senderRole: 'principal' | 'supervisor';
  /** The page-manager task (day) this file belongs to, when sent from the day-by-day view. */
  taskId: string | null;
  /** YYYY-MM-DD (Amman) of that day. */
  forDay: string | null;
  createdBy: string | null;
  createdAt: string;
}

/** Today's YYYY-MM-DD in Jordan time (Asia/Amman), so a day-off notice expires automatically tomorrow. */
export const todayAmman = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Amman' });

export const isDayOffTaskRow = (t: Pick<TeamTask, 'title' | 'extra_requirements'>) =>
  Boolean(t.extra_requirements?.includes(DAY_OFF_TAG) || t.title.startsWith(DAY_OFF_TITLE_PREFIX));

export const isSupervisorTaskRow = (t: Pick<TeamTask, 'extra_requirements'>) =>
  Boolean(t.extra_requirements?.includes(SUPERVISOR_TASK_TAG));

export const isPageManagerFileRow = (t: Pick<TeamTask, 'extra_requirements'>) =>
  Boolean(t.extra_requirements?.includes(PAGE_MANAGER_FILE_TAG));

export const isSpecialTeamTaskRow = (t: Pick<TeamTask, 'title' | 'extra_requirements'>) =>
  isDayOffTaskRow(t) || isSupervisorTaskRow(t) || isPageManagerFileRow(t);

export const isLeadRole = (roles: TeamRole[]) => roles.includes('principal') || roles.includes('supervisor');

export const isOverdue = (t: Pick<TeamTask, 'status' | 'due_at'>) =>
  t.status !== 'done' && !!t.due_at && new Date(t.due_at).getTime() < Date.now();

/** A scheduled task that members cannot see yet (only the leads do, until publish_at). */
export const isScheduled = (t: Pick<TeamTask, 'publish_at'>) => !!t.publish_at && new Date(t.publish_at).getTime() > Date.now();

export const taskColumn = (t: TeamTask): TaskColumn =>
  isScheduled(t) ? 'scheduled' : isOverdue(t) ? 'overdue' : (t.status as TaskStatus);

/** Next 8:00 in the browser's local time (today if it is still before 8, otherwise tomorrow). */
export const nextAtHour = (hour: number) => {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d;
};

/** Date -> value for <input type="datetime-local"> in local time. */
export const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const errorMessage = (e: unknown) => {
  const msg = (e as { message?: string })?.message ?? String(e);
  return msg.replace(/^.*?ERROR:\s*/, '').replace(/^TASK_TAKEN:\s*/, '');
};

// ---------------------------------------------------------------- first one to take a task wins
/** team_start_task() refused because another member took the task first. */
export const isTaskTaken = (e: unknown) => /TASK_TAKEN/.test((e as { message?: string })?.message ?? String(e));
export const TASK_TAKEN_TEXT = 'سبقك زميلك وأخذ هذه المهمة. حظاً أوفر، انتظر المهمة القادمة';

// After a claim the task disappears from the others' lists through RLS, which Realtime does not
// announce to them, so the claimer also rings this broadcast (payload: task id and who took it).
type Claim = { taskId: string; by: string };
// one shared channel per tab: Supabase returns the same channel object for the same topic
const claimListeners = new Set<(c: Claim) => void>();
let claimsChannel: ReturnType<typeof supabase.channel> | null = null;
let claimsReady: Promise<void> | null = null;
const claims = () => {
  if (!claimsChannel) {
    claimsChannel = supabase
      .channel('team-task-claims', { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'claimed' }, ({ payload }) => claimListeners.forEach((l) => l(payload as Claim)));
    const ch = claimsChannel;
    claimsReady = new Promise((resolve) => ch.subscribe((status) => status === 'SUBSCRIBED' && resolve()));
  }
  return { channel: claimsChannel, ready: claimsReady! };
};

export function useTaskClaims(onClaim: (c: Claim) => void) {
  const ref = useRef(onClaim);
  ref.current = onClaim;
  useEffect(() => {
    claims();
    const l = (c: Claim) => ref.current(c);
    claimListeners.add(l);
    return () => {
      claimListeners.delete(l);
    };
  }, []);
}

const announceClaim = async (taskId: string) => {
  const { data } = await supabase.auth.getUser();
  const { channel, ready } = claims();
  await Promise.race([ready, new Promise((r) => setTimeout(r, 3000))]);
  await channel.send({ type: 'broadcast', event: 'claimed', payload: { taskId, by: data.user?.id ?? '' } });
};

/** Fired after the team roster changes in this tab, so role-dependent UI refreshes at once. */
export const TEAM_MEMBERS_CHANGED = 'team-members-changed';
export const notifyTeamMembersChanged = () => window.dispatchEvent(new Event(TEAM_MEMBERS_CHANGED));

/** Current user's team roles; empty for non-members. */
export function useTeamRoles() {
  const [state, setState] = useState<{ loading: boolean; userId: string | null; roles: TeamRole[] }>({
    loading: true,
    userId: null,
    roles: [],
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;
      if (!userId) {
        if (active) setState({ loading: false, userId: null, roles: [] });
        return;
      }
      const { data, error } = await supabase.rpc('team_my_roles');
      if (!active) return;
      // A failed re-check (network blip, token refresh) must not drop the member out of their dashboard:
      // keep what we had and try again on the next check.
      if (error) {
        setState((prev) => (prev.loading ? { loading: false, userId, roles: [] } : prev));
        return;
      }
      const roles = ((data as string[] | null) ?? []) as TeamRole[];
      // same user and roles: keep the same state object so nothing below re-renders or remounts
      setState((prev) =>
        !prev.loading && prev.userId === userId && prev.roles.length === roles.length && prev.roles.every((r, i) => r === roles[i])
          ? prev
          : { loading: false, userId, roles },
      );
    };
    load();
    // Deferred: awaiting Supabase calls inside this callback can deadlock the auth client
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'INITIAL_SESSION') setTimeout(load, 0);
    });
    // A member added by the principal sees the team panel without signing in again:
    // re-check when the tab regains focus, every 30s while visible, and on local changes.
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    const poll = window.setInterval(onVisible, 30_000);
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener(TEAM_MEMBERS_CHANGED, load);
    return () => {
      active = false;
      sub.subscription.unsubscribe();
      window.clearInterval(poll);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener(TEAM_MEMBERS_CHANGED, load);
    };
  }, []);

  return state;
}

/** Team roster; one row per (member, role). */
export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase.from('team_members').select('*').order('created_at');
    setMembers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { members, loading, reload };
}

/** Unique people (a person may hold several roles). */
export const uniquePeople = (members: TeamMember[]) => {
  const map = new Map<string, { user_id: string; name: string; title: string; email: string; roles: TeamRole[]; hasName: boolean }>();
  for (const m of members) {
    const p = map.get(m.user_id) ?? { user_id: m.user_id, name: '', title: '', email: m.email, roles: [], hasName: false };
    p.roles.push(m.role as TeamRole);
    if (m.display_name) {
      p.name = m.display_name;
      p.hasName = true;
    }
    map.set(m.user_id, p);
  }
  // people are shown by their job title, never by their email
  for (const p of map.values()) {
    p.title = p.roles.map((r) => ROLE_LABELS[r]).join('، ');
    if (!p.hasName) p.name = p.title;
  }
  return [...map.values()];
};

/**
 * Tasks visible to the caller (RLS decides which), kept live through realtime. Also re-read every
 * minute: a scheduled task becomes visible to members when its time comes, and the leads' board
 * moves it out of «مجدولة».
 */
export function useTeamTasks() {
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data, error } = await supabase.from('team_tasks').select('*').order('created_at', { ascending: false });
    // a failed refresh keeps the tasks on screen instead of emptying the dashboard
    if (!error) setTasks((data ?? []).filter((t) => !isSpecialTeamTaskRow(t)));
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const channel = supabase
      .channel(`team-tasks-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_tasks' }, () => reload())
      .subscribe();
    const tick = window.setInterval(reload, 60_000);
    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(tick);
    };
  }, [reload]);
  useTaskClaims(() => reload());

  return { tasks, loading, reload };
}

/** Today's active "no tasks today" notices keyed by member user_id (live via realtime). */
export function useTeamDayOff() {
  const [dayOffMap, setDayOffMap] = useState<Map<string, DayOffRecord>>(() => new Map());
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const today = todayAmman();
    const { data } = await supabase
      .from('team_tasks')
      .select('id, title, details, assignee_user_id, extra_requirements, created_at')
      .contains('extra_requirements', [DAY_OFF_TAG])
      .order('created_at', { ascending: false });

    const next = new Map<string, DayOffRecord>();
    for (const row of data ?? []) {
      if (!row.assignee_user_id) continue;
      const rowDate = row.title.startsWith(DAY_OFF_TITLE_PREFIX)
        ? row.title.slice(DAY_OFF_TITLE_PREFIX.length).trim()
        : '';
      if (rowDate !== today) continue;
      if (!next.has(row.assignee_user_id)) {
        next.set(row.assignee_user_id, {
          taskId: row.id,
          userId: row.assignee_user_id,
          date: rowDate,
          note: row.details,
          createdAt: row.created_at,
        });
      }
    }
    setDayOffMap(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const channel = supabase
      .channel(`team-dayoff-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_tasks' }, () => reload())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  return { dayOffMap, loading, reload };
}

/** Lead action: mark a team member as having no tasks for today. */
export const grantDayOff = async (userId: string, customNote?: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('سجّل الدخول أولاً');

  // Remove any previous day-off rows for this member so the table stays clean
  await supabase
    .from('team_tasks')
    .delete()
    .eq('assignee_user_id', userId)
    .contains('extra_requirements', [DAY_OFF_TAG]);

  const { error } = await supabase.from('team_tasks').insert({
    title: `${DAY_OFF_TITLE_PREFIX}${todayAmman()}`,
    details: customNote?.trim() || null,
    assignee_role: 'file_manager',
    assignee_user_id: userId,
    status: 'done',
    extra_requirements: [DAY_OFF_TAG],
    created_by: session.user.id,
  });
  if (error) throw error;
};

/** Lead action: cancel today's day-off notice for a team member. */
export const revokeDayOff = async (userId: string) => {
  const { error } = await supabase
    .from('team_tasks')
    .delete()
    .eq('assignee_user_id', userId)
    .contains('extra_requirements', [DAY_OFF_TAG]);
  if (error) throw error;
};

export function useTeamNotifications() {
  const [items, setItems] = useState<TeamNotification[]>([]);

  const reload = useCallback(async () => {
    const { data } = await supabase.from('team_notifications').select('*').order('created_at', { ascending: false }).limit(30);
    setItems(data ?? []);
  }, []);

  useEffect(() => {
    reload();
    const channel = supabase
      .channel(`team-notifications-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'team_notifications' }, () => reload())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  return items;
}

export const fetchSubmissions = async (taskId: string) => {
  const { data, error } = await supabase
    .from('team_task_submissions')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

/** All submissions across all visible tasks (leads see everything), live via realtime. */
export function useAllTeamSubmissions() {
  const [submissions, setSubmissions] = useState<TeamSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('team_task_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    setSubmissions(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const channel = supabase
      .channel(`team-all-submissions-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_task_submissions' }, () => reload())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  return { submissions, loading, reload };
}

const BUCKET = 'team-files';

/** Uploads an image into the caller's own folder and returns its storage path. */
export const uploadTeamImage = async (file: File) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('سجّل الدخول أولاً');
  if (!file.type.startsWith('image/')) throw new Error('الملف يجب أن يكون صورة');
  if (file.size > 10 * 1024 * 1024) throw new Error('حجم الصورة أكبر من 10 ميغابايت');
  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
};

const signedUrlCache = new Map<string, { url: string; expires: number }>();

export const signedImageUrl = async (path: string) => {
  const cached = signedUrlCache.get(path);
  if (cached && cached.expires > Date.now()) return cached.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error || !data) return null;
  signedUrlCache.set(path, { url: data.signedUrl, expires: Date.now() + 50 * 60 * 1000 });
  return data.signedUrl;
};

export interface CompletionInput {
  description?: string;
  schoolName?: string;
  teacherNames?: string;
  problemLocation?: string;
  images: string[];
  extraAnswers: Record<string, string>;
}

export const startTask = async (taskId: string) => {
  const { error } = await supabase.rpc('team_start_task', { p_task_id: taskId });
  if (error) throw error;
  announceClaim(taskId).catch(() => {});
};

export const completeTask = async (taskId: string, input: CompletionInput) => {
  const { error } = await supabase.rpc('team_complete_task', {
    p_task_id: taskId,
    p_description: input.description || undefined,
    p_school_name: input.schoolName || undefined,
    p_teacher_names: input.teacherNames || undefined,
    p_problem_location: input.problemLocation || undefined,
    p_images: input.images,
    p_extra_answers: input.extraAnswers,
  });
  if (error) throw error;
};

export const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('ar-JO', { dateStyle: 'medium', timeStyle: 'short' }) : '';

// ---------------------------------------------------------------- Supervisor Tasks (Principal -> Supervisor)
interface SupervisorTaskPayload {
  details?: string;
  priority?: SupervisorTaskPriority;
  completionNote?: string | null;
}

const parseSupervisorPayload = (raw: string | null): SupervisorTaskPayload => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && ('details' in parsed || 'priority' in parsed || 'completionNote' in parsed)) {
      return parsed as SupervisorTaskPayload;
    }
  } catch {
    // Plain text fallback
  }
  return { details: raw };
};

export function useSupervisorTasks() {
  const [tasks, setTasks] = useState<SupervisorTask[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('team_tasks')
      .select('*')
      .contains('extra_requirements', [SUPERVISOR_TASK_TAG])
      .order('created_at', { ascending: false });

    const mapped: SupervisorTask[] = (data ?? []).map((row) => {
      const payload = parseSupervisorPayload(row.details);
      return {
        id: row.id,
        title: row.title,
        details: payload.details ?? '',
        priority: payload.priority ?? 'normal',
        status: (row.status as TaskStatus) || 'todo',
        dueAt: row.due_at,
        supervisorUserId: row.assignee_user_id,
        completionNote: payload.completionNote ?? null,
        createdBy: row.created_by,
        createdAt: row.created_at,
        completedAt: row.completed_at,
      };
    });
    setTasks(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const channel = supabase
      .channel(`supervisor-tasks-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_tasks' }, () => reload())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  return { tasks, loading, reload };
}

export const createSupervisorTask = async (input: {
  title: string;
  details?: string;
  supervisorUserId: string | null;
  priority?: SupervisorTaskPriority;
  dueAt?: string | null;
}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('سجّل الدخول أولاً');

  const payload: SupervisorTaskPayload = {
    details: input.details?.trim() || '',
    priority: input.priority ?? 'normal',
    completionNote: null,
  };

  const { error } = await supabase.from('team_tasks').insert({
    title: input.title.trim(),
    details: JSON.stringify(payload),
    assignee_role: 'file_manager',
    assignee_user_id: input.supervisorUserId,
    status: 'todo',
    due_at: input.dueAt ? new Date(input.dueAt).toISOString() : null,
    extra_requirements: [SUPERVISOR_TASK_TAG],
    created_by: session.user.id,
  });
  if (error) throw error;
};

export const updateSupervisorTaskStatus = async (
  task: SupervisorTask,
  nextStatus: TaskStatus,
  completionNote?: string,
) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('سجّل الدخول أولاً');

  const payload: SupervisorTaskPayload = {
    details: task.details,
    priority: task.priority,
    completionNote: completionNote !== undefined ? completionNote.trim() || null : task.completionNote,
  };

  const { error } = await supabase
    .from('team_tasks')
    .update({
      status: nextStatus,
      details: JSON.stringify(payload),
      completed_at: nextStatus === 'done' ? new Date().toISOString() : null,
      completed_by: nextStatus === 'done' ? session.user.id : null,
    })
    .eq('id', task.id);
  if (error) throw error;
};

export const deleteSupervisorTask = async (taskId: string) => {
  const { error } = await supabase.from('team_tasks').delete().eq('id', taskId);
  if (error) throw error;
};

// ---------------------------------------------------------------- Page Manager Files & Videos (Google Drive Hub)
interface PageManagerFilePayload {
  description: string;
  driveUrl: string;
  mediaType: PageManagerMediaType;
  senderName: string;
  senderRole: 'principal' | 'supervisor';
  taskId?: string | null;
  forDay?: string | null;
}

const parsePageFilePayload = (raw: string | null): PageManagerFilePayload => {
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'driveUrl' in parsed) {
        return {
          description: String(parsed.description ?? ''),
          driveUrl: String(parsed.driveUrl ?? ''),
          mediaType: (parsed.mediaType as PageManagerMediaType) || 'file',
          senderName: String(parsed.senderName ?? 'الإدارة'),
          senderRole: parsed.senderRole === 'supervisor' ? 'supervisor' : 'principal',
          taskId: typeof parsed.taskId === 'string' ? parsed.taskId : null,
          forDay: typeof parsed.forDay === 'string' ? parsed.forDay : null,
        };
      }
    } catch {
      // ignore
    }
  }
  return {
    description: raw ?? '',
    driveUrl: '',
    mediaType: 'file',
    senderName: 'الإدارة',
    senderRole: 'principal',
  };
};

export function usePageManagerFiles() {
  const [files, setFiles] = useState<PageManagerFileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('team_tasks')
      .select('*')
      .contains('extra_requirements', [PAGE_MANAGER_FILE_TAG])
      .order('created_at', { ascending: false });

    const mapped: PageManagerFileItem[] = (data ?? []).map((row) => {
      const payload = parsePageFilePayload(row.details);
      return {
        id: row.id,
        title: row.title,
        description: payload.description,
        driveUrl: payload.driveUrl,
        mediaType: payload.mediaType,
        targetUserId: row.assignee_user_id,
        senderName: payload.senderName,
        senderRole: payload.senderRole,
        taskId: payload.taskId ?? null,
        forDay: payload.forDay ?? null,
        createdBy: row.created_by,
        createdAt: row.created_at,
      };
    });
    setFiles(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const channel = supabase
      .channel(`page-manager-files-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_tasks' }, () => reload())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  return { files, loading, reload };
}

export const createPageManagerFile = async (input: {
  title: string;
  description: string;
  driveUrl: string;
  mediaType: PageManagerMediaType;
  targetUserId: string | null;
  senderName: string;
  senderRole: 'principal' | 'supervisor';
  taskId?: string | null;
  forDay?: string | null;
}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('سجّل الدخول أولاً');

  const payload: PageManagerFilePayload = {
    description: input.description.trim(),
    driveUrl: input.driveUrl.trim(),
    mediaType: input.mediaType,
    senderName: input.senderName,
    senderRole: input.senderRole,
    taskId: input.taskId ?? null,
    forDay: input.forDay ?? null,
  };

  const { error } = await supabase.from('team_tasks').insert({
    title: input.title.trim(),
    details: JSON.stringify(payload),
    assignee_role: 'page_manager',
    assignee_user_id: input.targetUserId,
    status: 'done',
    extra_requirements: [PAGE_MANAGER_FILE_TAG],
    created_by: session.user.id,
  });
  if (error) throw error;
};

export const updatePageManagerFile = async (
  id: string,
  input: {
    title: string;
    description: string;
    driveUrl: string;
    mediaType: PageManagerMediaType;
    targetUserId: string | null;
    senderName: string;
    senderRole: 'principal' | 'supervisor';
    taskId?: string | null;
    forDay?: string | null;
  },
) => {
  const payload: PageManagerFilePayload = {
    description: input.description.trim(),
    driveUrl: input.driveUrl.trim(),
    mediaType: input.mediaType,
    senderName: input.senderName,
    senderRole: input.senderRole,
    taskId: input.taskId ?? null,
    forDay: input.forDay ?? null,
  };

  const { error } = await supabase
    .from('team_tasks')
    .update({
      title: input.title.trim(),
      details: JSON.stringify(payload),
      assignee_user_id: input.targetUserId,
    })
    .eq('id', id);
  if (error) throw error;
};

export const deletePageManagerFile = async (id: string) => {
  const { error } = await supabase.from('team_tasks').delete().eq('id', id);
  if (error) throw error;
};
