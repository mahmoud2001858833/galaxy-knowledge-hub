import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MoveEvent {
  t_ms: number;
  event_type: string;
  is_correct?: boolean;
  payload?: Record<string, any>;
}

export function useGameMoveLogger() {
  const movesRef = useRef<MoveEvent[]>([]);
  const startRef = useRef<number>(Date.now());
  const firstActionRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    movesRef.current = [];
    startRef.current = Date.now();
    firstActionRef.current = null;
  }, []);

  const log = useCallback((event: Omit<MoveEvent, 't_ms'>) => {
    const t = Date.now() - startRef.current;
    if (firstActionRef.current === null) firstActionRef.current = t;
    movesRef.current.push({ t_ms: t, ...event });
  }, []);

  const flush = useCallback(async (sessionId: string, programGameId?: string | null) => {
    const moves = movesRef.current;
    if (!moves.length) return { count: 0, wrong: 0, ttfa: firstActionRef.current };
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { count: moves.length, wrong: 0, ttfa: firstActionRef.current };
    const rows = moves.map((m) => ({
      user_id: user.id,
      session_id: sessionId,
      program_game_id: programGameId ?? null,
      t_ms: m.t_ms,
      event_type: m.event_type,
      is_correct: m.is_correct ?? null,
      payload: m.payload ?? {},
    }));
    await supabase.from('autism_game_moves').insert(rows);
    return {
      count: moves.length,
      wrong: moves.filter(m => m.is_correct === false).length,
      ttfa: firstActionRef.current,
    };
  }, []);

  return { log, flush, reset };
}
