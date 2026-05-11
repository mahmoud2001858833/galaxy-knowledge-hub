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

  const computeMetrics = useCallback(() => {
    const moves = movesRef.current;
    if (!moves.length) return { totalMoves: 0, wrong: 0, ttfaMs: firstActionRef.current, avgRtMs: 0, rtVariance: 0, longestPauseMs: 0, accuracy: 0 };
    const responses = moves.filter(m => m.event_type === 'response' || m.event_type === 'answer' || m.is_correct !== undefined);
    const correct = responses.filter(m => m.is_correct === true).length;
    const wrong = responses.filter(m => m.is_correct === false).length;
    // RT = inter-stimulus delta when payload.stimulus_t_ms is provided, else delta from previous move.
    const rts: number[] = [];
    let prevT = 0;
    for (const m of moves) {
      const stim = (m.payload as any)?.stimulus_t_ms;
      if (typeof stim === 'number') rts.push(Math.max(0, m.t_ms - stim));
      else if (m.event_type === 'response' || m.event_type === 'answer') rts.push(Math.max(0, m.t_ms - prevT));
      prevT = m.t_ms;
    }
    const avgRtMs = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
    const rtVariance = rts.length
      ? rts.reduce((a, b) => a + (b - avgRtMs) ** 2, 0) / rts.length
      : 0;
    let longestPauseMs = 0;
    for (let i = 1; i < moves.length; i++) {
      longestPauseMs = Math.max(longestPauseMs, moves[i].t_ms - moves[i - 1].t_ms);
    }
    const accuracy = responses.length ? correct / responses.length : 0;
    return {
      totalMoves: moves.length,
      wrong,
      ttfaMs: firstActionRef.current,
      avgRtMs: Math.round(avgRtMs),
      rtVariance: Math.round(rtVariance),
      longestPauseMs,
      accuracy,
    };
  }, []);

  const flush = useCallback(async (sessionId: string, programGameId?: string | null) => {
    const moves = movesRef.current;
    const stats = computeMetrics();
    if (!moves.length) return stats;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return stats;
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
    return stats;
  }, [computeMetrics]);

  return { log, flush, reset, computeMetrics };
}
