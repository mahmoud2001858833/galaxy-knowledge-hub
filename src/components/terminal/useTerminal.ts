import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type RemoteDevice = Pick<Tables<'remote_devices'>, 'id' | 'owner_id' | 'name' | 'revoked' | 'last_seen_at' | 'bridge_info' | 'created_at'>;
export type RemoteJob = Tables<'remote_jobs'>;
export type RemoteChunk = Tables<'remote_job_chunks'>;

// auth_hash is not readable, so columns are listed explicitly
const DEVICE_COLUMNS = 'id, owner_id, name, revoked, last_seen_at, bridge_info, created_at';

/** The bridge polls every 2 s; a device is online if it was seen in the last 20 s. */
export const isOnline = (d: RemoteDevice | undefined, now = Date.now()) =>
  !!d?.last_seen_at && !d.revoked && now - new Date(d.last_seen_at).getTime() < 20_000;

export function useDevices() {
  const [devices, setDevices] = useState<RemoteDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase.from('remote_devices').select(DEVICE_COLUMNS).order('created_at');
    setDevices((data as RemoteDevice[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const id = window.setInterval(reload, 8000);
    return () => window.clearInterval(id);
  }, [reload]);

  return { devices, loading, reload };
}

/** Recent jobs of one device with their streamed output, kept live through realtime. */
export function useDeviceJobs(deviceId: string | null) {
  const [jobs, setJobs] = useState<RemoteJob[]>([]);
  const [chunks, setChunks] = useState<Record<string, RemoteChunk[]>>({});
  const jobIds = useRef<Set<string>>(new Set());

  const reload = useCallback(async () => {
    if (!deviceId) {
      setJobs([]);
      setChunks({});
      return;
    }
    const { data } = await supabase
      .from('remote_jobs')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(15);
    const list = (data ?? []).reverse();
    setJobs(list);
    jobIds.current = new Set(list.map((j) => j.id));
    if (list.length) {
      const { data: c } = await supabase
        .from('remote_job_chunks')
        .select('*')
        .in('job_id', list.map((j) => j.id))
        .order('id');
      const grouped: Record<string, RemoteChunk[]> = {};
      for (const row of c ?? []) (grouped[row.job_id] ??= []).push(row);
      setChunks(grouped);
    } else setChunks({});
  }, [deviceId]);

  useEffect(() => {
    reload();
    if (!deviceId) return;
    const channel = supabase
      .channel(`terminal-${deviceId}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'remote_jobs', filter: `device_id=eq.${deviceId}` }, (payload) => {
        const row = payload.new as RemoteJob;
        if (!row?.id) return;
        setJobs((prev) => {
          const i = prev.findIndex((j) => j.id === row.id);
          if (i === -1) return [...prev, row];
          const next = prev.slice();
          next[i] = row;
          return next;
        });
        jobIds.current.add(row.id);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'remote_job_chunks' }, (payload) => {
        const row = payload.new as RemoteChunk;
        if (!jobIds.current.has(row.job_id)) return;
        setChunks((prev) => {
          const list = prev[row.job_id] ?? [];
          if (list.some((c) => c.id === row.id)) return prev;
          return { ...prev, [row.job_id]: [...list, row] };
        });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId, reload]);

  return { jobs, chunks, reload };
}

export const supabaseEndpoint = () => {
  const client = supabase as unknown as { supabaseUrl: string | URL; supabaseKey: string };
  return { url: String(client.supabaseUrl).replace(/\/$/, ''), key: client.supabaseKey };
};
