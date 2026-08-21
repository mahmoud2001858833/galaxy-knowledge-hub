CREATE TABLE public.sim_ai_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sim_id text NOT NULL,
  sim_title text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer NOT NULL DEFAULT 0,
  events_count integer NOT NULL DEFAULT 0,
  mistakes_count integer NOT NULL DEFAULT 0,
  hints_count integer NOT NULL DEFAULT 0,
  score numeric,
  ai_summary text,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sim_ai_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sim_ai_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  label text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  at_seconds numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sim_ai_sessions_user ON public.sim_ai_sessions(user_id, sim_id, started_at DESC);
CREATE INDEX idx_sim_ai_events_session ON public.sim_ai_events(session_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sim_ai_sessions TO authenticated;
GRANT ALL ON public.sim_ai_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sim_ai_events TO authenticated;
GRANT ALL ON public.sim_ai_events TO service_role;

ALTER TABLE public.sim_ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_ai_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sim sessions" ON public.sim_ai_sessions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all sim sessions" ON public.sim_ai_sessions
  FOR SELECT TO authenticated USING (public.has_admin_teacher_access(auth.uid()));

CREATE POLICY "Users manage own sim events" ON public.sim_ai_events
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all sim events" ON public.sim_ai_events
  FOR SELECT TO authenticated USING (public.has_admin_teacher_access(auth.uid()));