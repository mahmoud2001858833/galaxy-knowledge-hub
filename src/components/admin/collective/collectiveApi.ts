import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Data layer for collective tasks (migration 20261114100000_collective_tasks).
 * Access rules live in the database (RLS: admin manages, members read once sent);
 * planning and emailing run in the collective-task-ai Edge Function.
 */

// The generated Database types do not know these tables yet; use an untyped view of the same client.
const db = supabase as unknown as SupabaseClient;

export type CollectiveStatus =
  | 'draft' | 'planned' | 'scheduled' | 'active' | 'review' | 'approved' | 'published' | 'cancelled';
export type ApprovalRule = 'members_then_admin' | 'all_members' | 'majority';

export interface PlanDay { day: number; focus: string; milestones: string[] }
export interface Plan {
  summary: string;
  days: PlanDay[];
  risks: { risk: string; mitigation: string }[];
  final_check: string[];
  model?: string;
}
export interface CollectiveTask {
  id: string;
  title: string;
  goals: string;
  final_vision: string;
  duration_days: number;
  send_at: string | null;
  status: CollectiveStatus;
  approval_rule: ApprovalRule;
  plan: Plan | null;
  plan_generated_at: string | null;
  emailed_at: string | null;
  email_report: Record<string, { ok: boolean; reason?: string }> | null;
  created_at: string;
}
export interface CollectiveMember { id: string; task_id: string; email: string; focus: string | null; emailed_at: string | null }
export interface Subtask {
  id: string;
  task_id: string;
  position: number;
  title: string;
  detail: string | null;
  acceptance: string[];
  assignee_email: string | null;
  day_from: number;
  day_to: number;
  depends_on: number[];
  status: 'todo' | 'in_progress' | 'done';
}

export const STATUS_LABEL: Record<CollectiveStatus, string> = {
  draft: 'مسودة',
  planned: 'الخطة جاهزة',
  scheduled: 'مجدولة للإرسال',
  active: 'قيد التنفيذ',
  review: 'بانتظار الموافقة',
  approved: 'موافق عليها',
  published: 'منشورة',
  cancelled: 'ملغاة',
};

export const APPROVAL_LABEL: Record<ApprovalRule, string> = {
  members_then_admin: 'الأعضاء يصوّتون والأدمن صاحب القرار الأخير',
  all_members: 'موافقة جميع الأعضاء',
  majority: 'موافقة أغلبية الأعضاء',
};

/** Tasks the admin can still change (before anything is sent). */
export const isEditable = (s: CollectiveStatus) => s === 'draft' || s === 'planned';

export const parseEmails = (text: string) =>
  [...new Set(text.split(/[\s,;،]+/).map((e) => e.trim().toLowerCase()).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)))];

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export async function listTasks(): Promise<CollectiveTask[]> {
  const { data, error } = await db.from('collective_tasks').select('*').order('created_at', { ascending: false });
  fail(error);
  return (data ?? []) as CollectiveTask[];
}

export async function loadTask(id: string) {
  const [t, m, s] = await Promise.all([
    db.from('collective_tasks').select('*').eq('id', id).maybeSingle(),
    db.from('collective_task_members').select('*').eq('task_id', id).order('created_at'),
    db.from('collective_subtasks').select('*').eq('task_id', id).order('position'),
  ]);
  fail(t.error); fail(m.error); fail(s.error);
  return {
    task: t.data as CollectiveTask | null,
    members: (m.data ?? []) as CollectiveMember[],
    subtasks: (s.data ?? []) as Subtask[],
  };
}

export interface TaskDraft {
  title: string;
  goals: string;
  final_vision: string;
  duration_days: number;
  approval_rule: ApprovalRule;
}

export async function saveTask(id: string | null, draft: TaskDraft): Promise<string> {
  if (id) {
    const { error } = await db.from('collective_tasks').update(draft).eq('id', id);
    fail(error);
    return id;
  }
  const { data, error } = await db.from('collective_tasks').insert(draft).select('id').single();
  fail(error);
  return (data as { id: string }).id;
}

/** Replaces the member list with these emails (keeps the focus note of emails that stay). */
export async function setMembers(taskId: string, people: { email: string; focus: string | null }[]) {
  const { error: delErr } = await db.from('collective_task_members').delete().eq('task_id', taskId);
  fail(delErr);
  if (!people.length) return;
  const { error } = await db.from('collective_task_members').insert(people.map((p) => ({ task_id: taskId, ...p })));
  fail(error);
}

export async function updateSubtask(id: string, patch: Partial<Omit<Subtask, 'id' | 'task_id'>>) {
  const { error } = await db.from('collective_subtasks').update(patch).eq('id', id);
  fail(error);
}

export async function addSubtask(taskId: string, position: number, assignee: string | null) {
  const { error } = await db.from('collective_subtasks').insert({
    task_id: taskId, position, title: 'مهمة فرعية جديدة', assignee_email: assignee, day_from: 1, day_to: 1,
  });
  fail(error);
}

export async function deleteSubtask(id: string) {
  const { error } = await db.from('collective_subtasks').delete().eq('id', id);
  fail(error);
}

export async function schedule(taskId: string, sendAt: Date) {
  const { error } = await db.from('collective_tasks')
    .update({ send_at: sendAt.toISOString(), status: 'scheduled' })
    .eq('id', taskId).in('status', ['planned', 'scheduled']);
  fail(error);
}

export async function unschedule(taskId: string) {
  const { error } = await db.from('collective_tasks').update({ status: 'planned' }).eq('id', taskId).eq('status', 'scheduled');
  fail(error);
}

export async function cancelTask(taskId: string) {
  const { error } = await db.from('collective_tasks').update({ status: 'cancelled' }).eq('id', taskId);
  fail(error);
}

export async function deleteTask(taskId: string) {
  const { error } = await db.from('collective_tasks').delete().eq('id', taskId);
  fail(error);
}

export async function teamEmails(): Promise<{ email: string; role: string; name: string | null }[]> {
  const { data } = await supabase.from('team_members').select('email, role, display_name').order('created_at');
  return (data ?? []).map((m) => ({ email: m.email.toLowerCase(), role: m.role, name: m.display_name }));
}

async function callAi(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('collective-task-ai', { body });
  if (error) {
    // Edge function errors carry the JSON body in error.context
    let msg = error.message;
    try { msg = (await (error as { context?: Response }).context?.json())?.error ?? msg; } catch { /* keep */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export const generatePlan = (taskId: string) =>
  callAi({ action: 'plan', task_id: taskId }) as Promise<{ ok: boolean; model: string; subtasks: number }>;
export const sendNow = (taskId: string) =>
  callAi({ action: 'send_now', task_id: taskId }) as Promise<{ ok: boolean; report: Record<string, { ok: boolean; reason?: string }> }>;
