import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BridgeStatus {
  online: boolean;
  paired?: boolean;
  last_seen_at?: string | null;
  name?: string;
  host?: string | null;
  workdir?: string | null;
  claude?: string | boolean | null;
  running?: number;
}

/** Status of the bridge to the principal's computer (bridge_status() RPC; null if no terminal access). */
export function useBridgeStatus(enabled = true, everyMs = 8000) {
  const [status, setStatus] = useState<BridgeStatus | null>(null);
  const reload = useCallback(async () => {
    const { data } = await supabase.rpc('bridge_status');
    setStatus((data as unknown as BridgeStatus | null) ?? null);
  }, []);
  useEffect(() => {
    if (!enabled) return;
    reload();
    const id = window.setInterval(reload, everyMs);
    return () => window.clearInterval(id);
  }, [enabled, everyMs, reload]);
  return { status, reload };
}
