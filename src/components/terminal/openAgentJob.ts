import { supabase } from '@/integrations/supabase/client';
import type { AttachJob } from '@/components/terminal/WebTerminal';

/** The user's latest unfinished agent job from any session (queued rows older than 2 minutes are dropped by the bridge). */
export const findOpenAgentJob = async (userId: string): Promise<AttachJob | null> => {
  const { data } = await supabase
    .from('bridge_jobs')
    .select('id, kind, created_at')
    .eq('user_id', userId)
    .in('kind', ['claude', 'antigravity'])
    .or(`status.eq.running,and(status.eq.queued,created_at.gt.${new Date(Date.now() - 120_000).toISOString()})`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as AttachJob | null) ?? null;
};
