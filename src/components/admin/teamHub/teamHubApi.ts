import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { isOverdue, isScheduled, isSpecialTeamTaskRow, todayAmman, type TeamRole } from '@/components/team/teamApi';

// Tables newer than the generated types (team_settings, collective_*, terminal_deploy_requests columns).
const db = supabase as unknown as SupabaseClient;

export interface TeamSettings {
  role_limits: Partial<Record<TeamRole, number>>;
  default_work_start: string;
  default_work_end: string;
  default_work_days: number[];
}

export async function fetchTeamSettings(): Promise<TeamSettings | null> {
  const { data, error } = await db.from('team_settings').select('role_limits,default_work_start,default_work_end,default_work_days').maybeSingle();
  if (error) return null;
  return data as TeamSettings | null;
}

export async function saveTeamSettings(s: TeamSettings) {
  if (s.default_work_end <= s.default_work_start) throw new Error('نهاية وقت العمل يجب أن تكون بعد بدايته');
  if (!s.default_work_days.length) throw new Error('اختر يوم عمل واحداً على الأقل');
  const { error } = await db.from('team_settings').update(s).eq('id', true);
  if (error) throw new Error(error.message);
}

/** Domains that are almost always a typo: the person never gets the email. */
const TYPO_DOMAINS = /@(gmil|gmial|gamil|gmai|gnail|gmaill|hotmial|hotmil|yaho|yahooo|outlok)\.(com|co)$/i;
export const emailLooksWrong = (email: string) => TYPO_DOMAINS.test(email.trim()) || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email.trim());

export interface TeamSnapshot {
  members: { id: string; email: string; role: TeamRole; display_name: string | null }[];
  tasks: { open: number; overdue: number; doneToday: number; scheduled: number };
  overdueList: { id: string; title: string; assignee_role: string; due_at: string | null }[];
  collective: { active: number; scheduled: number; postponed: number; late: number; doneOnTime: number; done: number };
  postponedList: { title: string; position: number; assignee_email: string | null; postponed_reason: string | null }[];
  approvalsPending: number;
  liveSessions: number;
  loadedAt: string;
}

const safe = async <T,>(p: PromiseLike<{ data: T | null; error: unknown }>, fallback: T): Promise<T> => {
  try {
    const { data, error } = await p;
    return error || data == null ? fallback : data;
  } catch {
    return fallback;
  }
};

/** One read of everything the overview shows; each part fails on its own without breaking the rest. */
export async function fetchTeamSnapshot(): Promise<TeamSnapshot> {
  type TaskRow = { id: string; title: string; status: 'todo' | 'in_progress' | 'done'; due_at: string | null; publish_at: string | null; assignee_role: string; extra_requirements: string | null; completed_at?: string | null; updated_at?: string | null };
  type SubRow = { title: string; position: number; assignee_email: string | null; status: string; delivered_at: string | null; due_at: string | null; on_time: boolean | null; postponed_count: number; postponed_reason: string | null; task_id: string };
  const [members, tasks, cTasks, approvals, sessions] = await Promise.all([
    safe(db.from('team_members').select('id,email,role,display_name').order('created_at'), [] as TeamSnapshot['members']),
    safe(db.from('team_tasks').select('*').order('created_at', { ascending: false }).limit(500), [] as TaskRow[]),
    safe(db.from('collective_tasks').select('id,status').in('status', ['active', 'scheduled']), [] as { id: string; status: string }[]),
    safe(db.from('terminal_deploy_requests').select('id').eq('status', 'pending'), [] as { id: string }[]),
    safe(db.from('user_terminal_sessions').select('id,expires_at').eq('status', 'active'), [] as { id: string; expires_at: string | null }[]),
  ]);
  const activeIds = cTasks.filter((t) => t.status === 'active').map((t) => t.id);
  const subs = activeIds.length
    ? await safe(db.from('collective_subtasks').select('title,position,assignee_email,status,delivered_at,due_at,on_time,postponed_count,postponed_reason,task_id').in('task_id', activeIds), [] as SubRow[])
    : [];

  const today = todayAmman();
  const real = tasks.filter((t) => !isSpecialTeamTaskRow(t));
  const doneDay = (t: TaskRow) => {
    const at = t.completed_at ?? t.updated_at;
    return !!at && new Date(at).toLocaleDateString('en-CA', { timeZone: 'Asia/Amman' }) === today;
  };
  const overdue = real.filter((t) => isOverdue(t));
  const now = Date.now();
  const postponed = subs.filter((s) => !s.delivered_at && s.status !== 'done' && s.postponed_count > 0);
  const done = subs.filter((s) => s.status === 'done');

  return {
    members,
    tasks: {
      open: real.filter((t) => t.status !== 'done' && !isScheduled(t)).length,
      overdue: overdue.length,
      doneToday: real.filter((t) => t.status === 'done' && doneDay(t)).length,
      scheduled: real.filter((t) => t.status !== 'done' && isScheduled(t)).length,
    },
    overdueList: overdue.slice(0, 6).map(({ id, title, assignee_role, due_at }) => ({ id, title, assignee_role, due_at })),
    collective: {
      active: activeIds.length,
      scheduled: cTasks.length - activeIds.length,
      postponed: postponed.length,
      late: subs.filter((s) => s.delivered_at && s.status !== 'done' && s.due_at && new Date(s.due_at).getTime() < now).length,
      done: done.length,
      doneOnTime: done.filter((s) => s.on_time !== false).length,
    },
    postponedList: postponed.slice(0, 6),
    approvalsPending: approvals.length,
    liveSessions: sessions.filter((s) => !s.expires_at || new Date(s.expires_at).getTime() > now).length,
    loadedAt: new Date().toISOString(),
  };
}
