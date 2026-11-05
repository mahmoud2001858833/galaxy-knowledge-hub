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

export const STATUS_LABELS: Record<TaskStatus | 'overdue', string> = {
  todo: 'مهام مطلوبة',
  in_progress: 'مهام قيد الإعداد',
  overdue: 'مهام متأخرة',
  done: 'مهام منجزة',
};

/** Sentinel markers used to store a member's daily "no tasks today" notice inside team_tasks. */
export const DAY_OFF_TAG = '__TEAM_DAY_OFF__' as const;
export const DAY_OFF_TITLE_PREFIX = '__DAY_OFF__:' as const;

export interface DayOffRecord {
  taskId: string;
  userId: string;
  date: string;
  note: string | null;
  createdAt: string;
}

/** Today's YYYY-MM-DD in Jordan time (Asia/Amman), so a day-off notice expires automatically tomorrow. */
export const todayAmman = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Amman' });

export const isDayOffTaskRow = (t: Pick<TeamTask, 'title' | 'extra_requirements'>) =>
  Boolean(t.extra_requirements?.includes(DAY_OFF_TAG) || t.title.startsWith(DAY_OFF_TITLE_PREFIX));

export const isLeadRole = (roles: TeamRole[]) => roles.includes('principal') || roles.includes('supervisor');

export const isOverdue = (t: Pick<TeamTask, 'status' | 'due_at'>) =>
  t.status !== 'done' && !!t.due_at && new Date(t.due_at).getTime() < Date.now();

export const taskColumn = (t: TeamTask): TaskStatus | 'overdue' => (isOverdue(t) ? 'overdue' : (t.status as TaskStatus));

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
      const { data } = await supabase.rpc('team_my_roles');
      if (active) setState({ loading: false, userId, roles: ((data as string[] | null) ?? []) as TeamRole[] });
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

/** Tasks visible to the caller (RLS decides which), kept live through realtime. */
export function useTeamTasks() {
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase.from('team_tasks').select('*').order('created_at', { ascending: false });
    setTasks((data ?? []).filter((t) => !isDayOffTaskRow(t)));
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const channel = supabase
      .channel(`team-tasks-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_tasks' }, () => reload())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
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
