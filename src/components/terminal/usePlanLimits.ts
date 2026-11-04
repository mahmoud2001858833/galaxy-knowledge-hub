import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AgentKey } from './agentUsage';

/**
 * The principal's AI subscriptions as the bridge sees them (principal only):
 * - now: latest readings in bridge_devices.info.limits. Claude Code reports its 5-hour and weekly
 *   windows on every run; Antigravity reports the remaining quota of each model.
 * - perMillion: measured from real jobs by terminal_agent_limit_stats(), percent of a window that
 *   1M tokens used (Anthropic and Google publish no token numbers for these limits).
 * - policy: locks only the computer can open (antigravity.allowOthers / shell.allowOthers).
 */

export type Window = { used: number; resets: string };
export interface PlanLimits {
  claude: { at: number; windows: Record<string, Window> } | null;
  antigravity: { at: number; models: Record<string, Window & { label: string }> } | null;
  perMillion: { agent: AgentKey; win: string; samples: number; per_million: number | null }[];
  policy: { antigravityOthers: boolean; shellOthers: boolean } | null;
}

export const WINDOW_LABEL: Record<string, string> = {
  five_hour: 'نافذة الخمس ساعات',
  seven_day: 'الحد الأسبوعي',
  seven_day_opus: 'الأسبوعي (Opus)',
  seven_day_sonnet: 'الأسبوعي (Sonnet)',
  quota: 'حصة النموذج',
};

/** Reset time: Claude sends epoch seconds, Antigravity an ISO date. */
export const resetText = (resets: string) => {
  if (!resets) return '';
  const d = /^\d+$/.test(resets) ? new Date(Number(resets) * 1000) : new Date(resets);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('ar-JO', { timeZone: 'Asia/Amman', weekday: 'short', hour: 'numeric', minute: '2-digit' });
};

export function usePlanLimits(enabled = true) {
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const load = useCallback(async () => {
    const [{ data: dev }, { data: stats }] = await Promise.all([
      supabase.from('bridge_devices').select('info').eq('revoked', false).order('last_seen_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle(),
      (supabase.rpc as unknown as (fn: string) => Promise<{ data: PlanLimits['perMillion'] | null }>)('terminal_agent_limit_stats'),
    ]);
    const info = (dev?.info ?? {}) as { limits?: Partial<PlanLimits>; policy?: PlanLimits['policy'] };
    setLimits({
      claude: info.limits?.claude ?? null,
      antigravity: info.limits?.antigravity ?? null,
      perMillion: (stats ?? []).map((s) => ({ ...s, samples: Number(s.samples), per_million: s.per_million == null ? null : Number(s.per_million) })),
      policy: info.policy ?? null,
    });
  }, []);
  useEffect(() => {
    if (!enabled) return;
    load();
    const id = window.setInterval(load, 60000);
    return () => window.clearInterval(id);
  }, [enabled, load]);
  return { limits, reload: load };
}

/** Measured percent of a window per 1M tokens, if there is enough data. */
export const perMillion = (limits: PlanLimits | null, agent: AgentKey, win: string) => {
  const s = limits?.perMillion.find((p) => p.agent === agent && p.win === win);
  return s && s.per_million != null && s.samples >= 1 ? s : null;
};
