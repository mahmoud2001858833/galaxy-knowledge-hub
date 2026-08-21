import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  SimAIDescriptor,
  SimCoachMessage,
  SimCoachReport,
  SimEventKind,
  SimTrackedEvent,
} from './types';

interface SimAIContextValue {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  thinking: boolean;
  messages: SimCoachMessage[];
  latest: SimCoachMessage | null;
  dismissLatest: () => void;
  track: (kind: SimEventKind, label: string, payload?: Record<string, unknown>) => void;
  stats: { events: number; mistakes: number; hints: number; seconds: number };
  report: SimCoachReport | null;
  reportLoading: boolean;
  requestReport: () => Promise<void>;
  askCoach: (question: string) => Promise<void>;
}

const SimAIContext = createContext<SimAIContextValue | null>(null);

export const useSimAI = () => {
  const ctx = useContext(SimAIContext);
  if (!ctx) throw new Error('useSimAI must be used inside <SimAIProvider>');
  return ctx;
};

/** Safe version for components that may render outside a provider. */
export const useSimAIOptional = () => useContext(SimAIContext);

const MIN_GAP_MS = 14000; // never call the model more often than this
const DEBOUNCE_MS = 1400; // settle time after the student stops fiddling
const IDLE_MS = 45000; // nudge after this much inactivity

interface Props {
  sim: SimAIDescriptor;
  /** live snapshot of parameters + readings handed to the model */
  state: Record<string, unknown>;
  children: ReactNode;
  defaultEnabled?: boolean;
  /** imperative handle so the page above the provider can call track() */
  apiRef?: { current: SimAIContextValue | null };
}

export const SimAIProvider = ({ sim, state, children, defaultEnabled = true, apiRef }: Props) => {
  const storageKey = `sim-ai-enabled:${sim.id}`;
  const [enabled, setEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultEnabled;
    const v = window.localStorage.getItem(storageKey);
    return v === null ? defaultEnabled : v === '1';
  });
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<SimCoachMessage[]>([]);
  const [latest, setLatest] = useState<SimCoachMessage | null>(null);
  const [report, setReport] = useState<SimCoachReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [stats, setStats] = useState({ events: 0, mistakes: 0, hints: 0, seconds: 0 });

  const stateRef = useRef(state);
  stateRef.current = state;

  const eventsRef = useRef<SimTrackedEvent[]>([]);
  const startedAtRef = useRef<number>(Date.now());
  const lastCallRef = useRef<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const msgIdRef = useRef(0);

  const setEnabled = useCallback(
    (v: boolean) => {
      setEnabledState(v);
      try {
        window.localStorage.setItem(storageKey, v ? '1' : '0');
      } catch {
        /* ignore */
      }
    },
    [storageKey]
  );

  // ---- session bootstrap -------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id ?? null;
      if (cancelled) return;
      userIdRef.current = uid;
      if (!uid) return;
      const { data: row } = await supabase
        .from('sim_ai_sessions')
        .insert({ user_id: uid, sim_id: sim.id, sim_title: sim.title })
        .select('id')
        .maybeSingle();
      if (!cancelled && row) sessionIdRef.current = row.id;
    })();
    return () => {
      cancelled = true;
    };
  }, [sim.id, sim.title]);

  // elapsed clock
  useEffect(() => {
    const t = setInterval(() => {
      setStats((s) => ({ ...s, seconds: Math.round((Date.now() - startedAtRef.current) / 1000) }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pushMessage = useCallback((m: Omit<SimCoachMessage, 'id' | 'at'>) => {
    const msg: SimCoachMessage = { ...m, id: ++msgIdRef.current, at: Date.now() };
    setMessages((prev) => [...prev.slice(-24), msg]);
    setLatest(msg);
  }, []);

  const persistEvent = useCallback((ev: SimTrackedEvent) => {
    const sid = sessionIdRef.current;
    const uid = userIdRef.current;
    if (!sid || !uid) return;
    void supabase.from('sim_ai_events').insert({
      session_id: sid,
      user_id: uid,
      kind: ev.kind,
      label: ev.label,
      payload: (ev.payload ?? {}) as never,
      at_seconds: ev.atSeconds,
    });
  }, []);

  // ---- model call --------------------------------------------------------
  const callCoach = useCallback(
    async (trigger: Record<string, unknown>, force = false) => {
      if (!enabled) return;
      const now = Date.now();
      if (!force && now - lastCallRef.current < MIN_GAP_MS) return;
      lastCallRef.current = now;
      setThinking(true);
      try {
        const { data, error } = await supabase.functions.invoke('sim-ai-coach', {
          body: {
            mode: 'coach',
            sim,
            state: stateRef.current,
            events: eventsRef.current.slice(-25),
            trigger,
          },
        });
        if (error) throw error;
        if (data?.message) {
          pushMessage({
            message: String(data.message),
            tone: (data.tone as SimCoachMessage['tone']) || 'hint',
            focus: data.focus ?? null,
            action: data.action ?? null,
          });
          setStats((s) => ({ ...s, hints: s.hints + 1 }));
        }
      } catch (e) {
        console.error('sim-ai-coach failed', e);
      } finally {
        setThinking(false);
      }
    },
    [enabled, pushMessage, sim]
  );

  const scheduleIdle = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => {
      void callCoach({ reason: 'idle', idleSeconds: IDLE_MS / 1000 }, true);
    }, IDLE_MS);
  }, [callCoach]);

  const track = useCallback(
    (kind: SimEventKind, label: string, payload?: Record<string, unknown>) => {
      const ev: SimTrackedEvent = {
        kind,
        label,
        payload,
        atSeconds: Math.round((Date.now() - startedAtRef.current) / 1000),
      };
      eventsRef.current = [...eventsRef.current.slice(-120), ev];
      setStats((s) => ({
        ...s,
        events: s.events + 1,
        mistakes: kind === 'mistake' ? s.mistakes + 1 : s.mistakes,
      }));
      persistEvent(ev);
      if (!enabled) return;

      scheduleIdle();
      if (kind === 'mistake') {
        void callCoach({ reason: 'mistake', event: ev }, true);
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void callCoach({ reason: kind, event: ev });
      }, DEBOUNCE_MS);
    },
    [callCoach, enabled, persistEvent, scheduleIdle]
  );

  const askCoach = useCallback(
    async (question: string) => {
      await callCoach({ reason: 'student_question', question }, true);
    },
    [callCoach]
  );

  // greet + idle watch
  useEffect(() => {
    if (!enabled) return;
    scheduleIdle();
    return () => {
      if (idleRef.current) clearTimeout(idleRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [enabled, scheduleIdle]);

  const requestReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const durationSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
      const { data, error } = await supabase.functions.invoke('sim-ai-coach', {
        body: {
          mode: 'report',
          sim,
          state: stateRef.current,
          events: eventsRef.current.slice(-40),
          durationSeconds,
          eventsCount: statsRef.current.events,
          mistakes: statsRef.current.mistakes,
          hints: statsRef.current.hints,
        },
      });
      if (error) throw error;
      const rep: SimCoachReport = {
        summary: data?.summary ?? '',
        strengths: data?.strengths ?? [],
        gaps: data?.gaps ?? [],
        nextSteps: data?.nextSteps ?? [],
        score: typeof data?.score === 'number' ? data.score : null,
      };
      setReport(rep);
      const sid = sessionIdRef.current;
      if (sid) {
        void supabase
          .from('sim_ai_sessions')
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: durationSeconds,
            events_count: statsRef.current.events,
            mistakes_count: statsRef.current.mistakes,
            hints_count: statsRef.current.hints,
            score: rep.score,
            ai_summary: rep.summary,
            metrics: { strengths: rep.strengths, gaps: rep.gaps, nextSteps: rep.nextSteps } as never,
          })
          .eq('id', sid);
      }
    } catch (e) {
      console.error('sim-ai report failed', e);
    } finally {
      setReportLoading(false);
    }
  }, [sim]);

  // flush duration on unmount
  useEffect(() => {
    return () => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      void supabase
        .from('sim_ai_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: Math.round((Date.now() - startedAtRef.current) / 1000),
          events_count: statsRef.current.events,
          mistakes_count: statsRef.current.mistakes,
          hints_count: statsRef.current.hints,
        })
        .eq('id', sid);
    };
  }, []);

  const value = useMemo<SimAIContextValue>(
    () => ({
      enabled,
      setEnabled,
      thinking,
      messages,
      latest,
      dismissLatest: () => setLatest(null),
      track,
      stats,
      report,
      reportLoading,
      requestReport,
      askCoach,
    }),
    [
      enabled,
      setEnabled,
      thinking,
      messages,
      latest,
      track,
      stats,
      report,
      reportLoading,
      requestReport,
      askCoach,
    ]
  );

  if (apiRef) apiRef.current = value;

  return <SimAIContext.Provider value={value}>{children}</SimAIContext.Provider>;
};
