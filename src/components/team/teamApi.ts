import { useCallback, useEffect, useState } from 'react';
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

export const isLeadRole = (roles: TeamRole[]) => roles.includes('principal') || roles.includes('supervisor');

export const isOverdue = (t: Pick<TeamTask, 'status' | 'due_at'>) =>
  t.status !== 'done' && !!t.due_at && new Date(t.due_at).getTime() < Date.now();

export const taskColumn = (t: TeamTask): TaskStatus | 'overdue' => (isOverdue(t) ? 'overdue' : (t.status as TaskStatus));

export const errorMessage = (e: unknown) => {
  const msg = (e as { message?: string })?.message ?? String(e);
  return msg.replace(/^.*?ERROR:\s*/, '');
};

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
    return () => {
      active = false;
      sub.subscription.unsubscribe();
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
  const map = new Map<string, { user_id: string; name: string; email: string; roles: TeamRole[] }>();
  for (const m of members) {
    const p = map.get(m.user_id) ?? { user_id: m.user_id, name: m.display_name || m.email, email: m.email, roles: [] };
    p.roles.push(m.role as TeamRole);
    map.set(m.user_id, p);
  }
  return [...map.values()];
};

/** Tasks visible to the caller (RLS decides which), kept live through realtime. */
export function useTeamTasks() {
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase.from('team_tasks').select('*').order('created_at', { ascending: false });
    setTasks(data ?? []);
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

  return { tasks, loading, reload };
}

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
