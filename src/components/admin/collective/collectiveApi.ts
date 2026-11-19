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
  requirements?: { id: string; text: string }[];
  uncovered?: string[];
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
  /** when a dependency is late: wait for the owner's next window, or deliver as soon as it is done */
  postpone_policy: PostponePolicy;
  /** the bridge project this team work builds (batched approval goes there) */
  project_slug: string | null;
  planner_notes: string | null;
  plan: Plan | null;
  plan_generated_at: string | null;
  emailed_at: string | null;
  email_report: Record<string, { ok: boolean; reason?: string; portal?: number; skipped?: string }> | null;
  created_at: string;
}
export type PostponePolicy = 'next_window' | 'immediate';
export interface CollectiveMember {
  id: string; task_id: string; email: string; focus: string | null; emailed_at: string | null;
  /** the person's work window, Amman time ("08:00:00") and weekdays (0 = Sunday … 6 = Saturday) */
  work_start: string; work_end: string; work_days: number[];
}
export const WEEKDAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
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
  covers: string[];
  effort_hours: number | null;
  status: 'todo' | 'in_progress' | 'done';
  delivered_at: string | null;
  due_at: string | null;
  completed_at: string | null;
  on_time: boolean | null;
  postponed_at: string | null;
  postponed_count: number;
  postponed_reason: string | null;
}

/** Where a subtask stands in the timed delivery. */
export function timingOf(s: Subtask): { label: string; tone: 'ok' | 'late' | 'wait' | 'work' | 'idle' } {
  if (s.status === 'done') return s.on_time === false ? { label: 'أُنجزت متأخرة', tone: 'late' } : { label: 'أُنجزت بالموعد', tone: 'ok' };
  if (s.delivered_at) {
    if (s.due_at && new Date(s.due_at) < new Date()) return { label: 'متأخرة', tone: 'late' };
    return { label: 'وصلت لصاحبها', tone: 'work' };
  }
  if (s.postponed_count > 0) return { label: `مؤجّلة (${s.postponed_count})`, tone: 'wait' };
  return { label: 'لم تصل بعد', tone: 'idle' };
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
  planner_notes: string;
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

/** Sets the member list to these emails: removes the others, keeps each remaining person's work window. */
export async function setMembers(taskId: string, people: { email: string; focus: string | null }[]) {
  const { data, error: readErr } = await db.from('collective_task_members').select('id,email').eq('task_id', taskId);
  fail(readErr);
  const existing = new Map(((data ?? []) as { id: string; email: string }[]).map((m) => [m.email.toLowerCase(), m.id]));
  const keep = new Set(people.map((p) => p.email.toLowerCase()));
  const gone = [...existing.entries()].filter(([e]) => !keep.has(e)).map(([, id]) => id);
  if (gone.length) fail((await db.from('collective_task_members').delete().in('id', gone)).error);
  for (const p of people) {
    const id = existing.get(p.email.toLowerCase());
    if (id) fail((await db.from('collective_task_members').update({ focus: p.focus }).eq('id', id)).error);
  }
  const fresh = people.filter((p) => !existing.has(p.email.toLowerCase()));
  if (fresh.length) fail((await db.from('collective_task_members').insert(fresh.map((p) => ({ task_id: taskId, ...p })))).error);
}

/** The admin can change anyone's work window at any time, also while the task runs. */
export async function updateMemberWindow(id: string, w: { work_start: string; work_end: string; work_days: number[] }) {
  if (w.work_end <= w.work_start) throw new Error('نهاية وقت العمل يجب أن تكون بعد بدايته');
  if (!w.work_days.length) throw new Error('اختر يوم عمل واحداً على الأقل');
  fail((await db.from('collective_task_members').update(w).eq('id', id)).error);
}

export async function setTaskProject(taskId: string, slug: string | null) {
  fail((await db.from('collective_tasks').update({ project_slug: slug }).eq('id', taskId)).error);
}
export async function listProjects(): Promise<{ slug: string; name: string; approval_mode: string }[]> {
  const { data } = await db.from('bridge_projects').select('slug,name,approval_mode').order('created_at');
  return (data ?? []) as { slug: string; name: string; approval_mode: string }[];
}

export async function setPostponePolicy(taskId: string, policy: PostponePolicy) {
  fail((await db.from('collective_tasks').update({ postpone_policy: policy }).eq('id', taskId)).error);
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
/** What one scheduler run did: delivered or postponed subtasks. */
export type TickReport = ({ delivered: number; email: string } | { postponed: number; reason: string })[] | Record<string, unknown>;
/** Runs the scheduler for this task now and emails a reminder for every delivered task not done yet. */
export const resendToday = (taskId: string) =>
  callAi({ action: 'resend_day', task_id: taskId }) as Promise<{ ok: boolean; report: Record<string, unknown> & { tick: TickReport } }>;
/** Starts the task now: everything whose owner is inside their window and has no open dependency is delivered. */
export const sendNow = (taskId: string) =>
  callAi({ action: 'send_now', task_id: taskId }) as Promise<{ ok: boolean; report: TickReport }>;

// ------------------------------------------------------------------ AI: describe / command / confirm
export interface ChatTurn { role: 'user' | 'assistant'; content: string }

export interface AssistResult {
  reply: string;
  draft: {
    title: string;
    goals: string;
    final_vision: string;
    duration_days: number;
    people: { email: string; focus: string }[];
    send_at: string | null;
    approval_rule: ApprovalRule;
    planner_notes: string;
  };
  missing: string[];
  ready: boolean;
}
/** The admin describes the task in their own words; the AI fills the fields and asks for what is missing. */
export const assistDraft = (messages: ChatTurn[], draft: Record<string, unknown>) =>
  callAi({ action: 'assist', messages, draft }) as Promise<AssistResult>;

export interface PendingAction { type: 'send_now' | 'schedule'; task_id: string; send_at?: string; label: string }
export interface CommandResult { reply: string; pending: PendingAction[]; task_ids: string[] }
/** The Central Task AI: a real agent over collective tasks and team tasks. Never sends without confirm. */
export const commandAi = (messages: ChatTurn[]) =>
  callAi({ action: 'command', messages }) as Promise<CommandResult>;
export const confirmPending = (pending: PendingAction) =>
  callAi({ action: 'confirm', pending }) as Promise<{ ok: boolean; reply: string }>;

/** The programmers' timetable assistant: knows the live schedule, answers, and edits windows/subtasks. */
export const scheduleAi = (taskId: string, messages: ChatTurn[]) =>
  callAi({ action: 'schedule_ai', task_id: taskId, messages }) as Promise<{ reply: string; changed: boolean }>;
