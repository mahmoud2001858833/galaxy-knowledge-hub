import { useCallback, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { TeamRole, WorkerRole } from '@/components/team/teamApi';

/**
 * Data layer for the team points system (migration 20261120200000_points_system).
 * Scoring happens in the database (trigger on team_tasks + RPCs); this file only reads and calls it.
 */

// points_settings / points_ledger / points_* RPCs are not in the generated types yet
const db = supabase as unknown as SupabaseClient;

export interface PointsSettings {
  on_time: number;
  late_per_day: number;
  per_photo: number;
  max_photos: number;
  quality: number;
  rescue: number;
  exclude_after_days: number;
  max_sources: number;
  role_base: Partial<Record<TeamRole, number>>;
  role_excellence: Partial<Record<WorkerRole, number>>;
  updated_at?: string;
}

export type LedgerKind = 'completion' | 'on_time' | 'late' | 'excluded' | 'photos' | 'excellence' | 'quality' | 'rescue' | 'manual';

export interface LedgerEntry {
  id: string;
  user_id: string;
  team_task_id: string | null;
  kind: LedgerKind;
  points: number;
  reason: string;
  created_by: string | null;
  created_at: string;
  edited_by: string | null;
  edited_at: string | null;
}

export interface LeaderboardRow {
  user_id: string;
  display_name: string | null;
  roles: TeamRole[];
  total: number;
  earned: number;
  available: number;
  tasks_counted: number;
  perf_index: number | null;
  rank: number;
}

/** Same defaults as the migration, used until the settings row loads. */
export const DEFAULT_POINTS_SETTINGS: PointsSettings = {
  on_time: 10,
  late_per_day: 5,
  per_photo: 5,
  max_photos: 5,
  quality: 10,
  rescue: 20,
  exclude_after_days: 3,
  max_sources: 5,
  role_base: { auditor: 15, ai_manager: 20, page_manager: 20, file_manager: 20, speaker: 20, supervisor: 0, principal: 0 },
  role_excellence: { auditor: 10, ai_manager: 15, page_manager: 10, file_manager: 10, speaker: 0 },
};

export const KIND_LABELS: Record<LedgerKind, string> = {
  completion: 'إنجاز',
  on_time: 'في الموعد',
  late: 'تأخير',
  excluded: 'مستبعدة (تأخير)',
  photos: 'صور إثبات',
  excellence: 'تميّز',
  quality: 'جودة',
  rescue: 'إنقاذ',
  manual: 'تعديل يدوي',
};

/** How each role's excellence bonus is earned (enforced in points_score_task / points_review_quality). */
export const EXCELLENCE_RULE: Record<WorkerRole, string> = {
  auditor: 'لكل صورة إثبات',
  ai_manager: 'لكل مهمة جماعية',
  page_manager: 'عند مراجعة «بلا ملاحظات»',
  file_manager: 'لكل مصدر رسمي (رابط) في التسليم',
  speaker: 'لكل مهمة منجزة',
};

export const roleBasePoints = (s: PointsSettings, role: TeamRole) => s.role_base[role] ?? 0;

const num = (v: unknown) => (typeof v === 'number' ? v : Number(v ?? 0));

export const fetchPointsSettings = async (): Promise<PointsSettings> => {
  const { data, error } = await db.from('points_settings').select('*').maybeSingle();
  if (error) throw error;
  return data ? ({ ...DEFAULT_POINTS_SETTINGS, ...(data as PointsSettings) }) : DEFAULT_POINTS_SETTINGS;
};

export const savePointsSettings = async (s: PointsSettings) => {
  const { error } = await db
    .from('points_settings')
    .update({
      on_time: s.on_time,
      late_per_day: s.late_per_day,
      per_photo: s.per_photo,
      max_photos: s.max_photos,
      quality: s.quality,
      rescue: s.rescue,
      exclude_after_days: s.exclude_after_days,
      max_sources: s.max_sources,
      role_base: s.role_base,
      role_excellence: s.role_excellence,
    })
    .eq('id', true);
  if (error) throw error;
};

export const fetchLeaderboard = async (): Promise<LeaderboardRow[]> => {
  const { data, error } = await db.rpc('points_leaderboard');
  if (error) throw error;
  return ((data ?? []) as LeaderboardRow[]).map((r) => ({
    ...r,
    total: num(r.total),
    earned: num(r.earned),
    available: num(r.available),
    tasks_counted: num(r.tasks_counted),
    perf_index: r.perf_index === null ? null : num(r.perf_index),
    rank: num(r.rank),
  }));
};

export const fetchLedger = async (filters: { userId?: string; kind?: LedgerKind; limit?: number } = {}) => {
  let query = db.from('points_ledger').select('*').order('created_at', { ascending: false }).limit(filters.limit ?? 300);
  if (filters.userId) query = query.eq('user_id', filters.userId);
  if (filters.kind) query = query.eq('kind', filters.kind);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as LedgerEntry[];
};

const call = async (fn: string, args: Record<string, unknown>) => {
  const { error } = await db.rpc(fn, args);
  if (error) throw error;
};

export const adjustPoints = (userId: string, points: number, reason: string) =>
  call('points_adjust', { p_user: userId, p_points: points, p_reason: reason });
export const editLedgerEntry = (id: string, points: number, reason: string) =>
  call('points_edit_entry', { p_id: id, p_points: points, p_reason: reason });
export const deleteLedgerEntry = (id: string) => call('points_delete_entry', { p_id: id });
export const reviewQuality = (taskId: string, noRemarks: boolean, note?: string) =>
  call('points_review_quality', { p_task_id: taskId, p_no_remarks: noRemarks, p_note: note ?? null });
export const awardRescue = (taskId: string, helperId: string, note?: string) =>
  call('points_award_rescue', { p_task_id: taskId, p_helper: helperId, p_note: note ?? null });

/** Re-runs `load` whenever the ledger changes (realtime; RLS limits members to their own rows). */
function useLedgerLive(load: () => void) {
  useEffect(() => {
    load();
    const channel = db
      .channel(`points-ledger-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'points_ledger' }, () => load())
      .subscribe();
    const tick = window.setInterval(load, 120_000);
    return () => {
      db.removeChannel(channel);
      window.clearInterval(tick);
    };
  }, [load]);
}

export function usePointsSettings() {
  const [settings, setSettings] = useState<PointsSettings>(DEFAULT_POINTS_SETTINGS);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    try {
      setSettings(await fetchPointsSettings());
    } catch {
      setSettings(DEFAULT_POINTS_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { settings, loading, reload };
}

export function useLeaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try {
      setRows(await fetchLeaderboard());
      setError(null);
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'تعذّر تحميل الترتيب');
    } finally {
      setLoading(false);
    }
  }, []);
  useLedgerLive(reload);
  return { rows, loading, error, reload };
}

/** The signed-in member's own row of the leaderboard (balance, index, rank). */
export function useMyPoints(me: string | null) {
  const { rows, loading } = useLeaderboard();
  return { mine: me ? rows.find((r) => r.user_id === me) ?? null : null, total: rows.length, loading };
}

export const formatIndex = (v: number | null) => (v === null ? '—' : `${v.toLocaleString('ar', { maximumFractionDigits: 1 })}٪`);
export const formatPoints = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('ar')}`;
