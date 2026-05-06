
CREATE TABLE IF NOT EXISTS public.adhd_game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  child_profile_id UUID,
  game_key TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'screening',
  program_game_id UUID,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC,
  difficulty INT DEFAULT 1,
  duration_ms INT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adhd_game_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_all_ags_adhd" ON public.adhd_game_sessions;
CREATE POLICY "own_all_ags_adhd" ON public.adhd_game_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ags_adhd_user ON public.adhd_game_sessions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.adhd_diagnostic_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  child_profile_id UUID,
  battery_session_ids UUID[] NOT NULL DEFAULT '{}',
  screening_id UUID,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_report TEXT,
  recommendations JSONB DEFAULT '[]'::jsonb,
  dsm_category TEXT,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(12),'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adhd_diagnostic_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_all_adr_adhd" ON public.adhd_diagnostic_reports;
CREATE POLICY "own_all_adr_adhd" ON public.adhd_diagnostic_reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "share_read_adr_adhd" ON public.adhd_diagnostic_reports;
CREATE POLICY "share_read_adr_adhd" ON public.adhd_diagnostic_reports FOR SELECT USING (share_token IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.adhd_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  child_profile_id UUID,
  child_name TEXT,
  child_age INT,
  weeks INT NOT NULL DEFAULT 4,
  focus_areas TEXT[] DEFAULT '{}',
  daily_minutes INT DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'active',
  ai_plan JSONB DEFAULT '{}'::jsonb,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(12),'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adhd_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_all_ap_adhd" ON public.adhd_programs;
CREATE POLICY "own_all_ap_adhd" ON public.adhd_programs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "share_read_ap_adhd" ON public.adhd_programs;
CREATE POLICY "share_read_ap_adhd" ON public.adhd_programs FOR SELECT USING (share_token IS NOT NULL);
DROP TRIGGER IF EXISTS trg_adhd_programs_updated ON public.adhd_programs;
CREATE TRIGGER trg_adhd_programs_updated BEFORE UPDATE ON public.adhd_programs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.adhd_program_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.adhd_programs(id) ON DELETE CASCADE,
  day_index INT NOT NULL,
  scheduled_for DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  summary JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adhd_program_days ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_apd_adhd" ON public.adhd_program_days;
CREATE POLICY "owner_apd_adhd" ON public.adhd_program_days FOR ALL
  USING (EXISTS (SELECT 1 FROM public.adhd_programs p WHERE p.id = program_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.adhd_programs p WHERE p.id = program_id AND p.user_id = auth.uid()));
DROP POLICY IF EXISTS "public_read_apd_adhd" ON public.adhd_program_days;
CREATE POLICY "public_read_apd_adhd" ON public.adhd_program_days FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.adhd_program_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES public.adhd_program_days(id) ON DELETE CASCADE,
  game_key TEXT NOT NULL,
  title TEXT,
  description TEXT,
  params JSONB DEFAULT '{}'::jsonb,
  target_metric TEXT,
  order_index INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  best_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adhd_program_games ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_apg_adhd" ON public.adhd_program_games;
CREATE POLICY "owner_apg_adhd" ON public.adhd_program_games FOR ALL
  USING (EXISTS (SELECT 1 FROM public.adhd_program_days d JOIN public.adhd_programs p ON p.id = d.program_id WHERE d.id = day_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.adhd_program_days d JOIN public.adhd_programs p ON p.id = d.program_id WHERE d.id = day_id AND p.user_id = auth.uid()));
DROP POLICY IF EXISTS "public_read_apg_adhd" ON public.adhd_program_games;
CREATE POLICY "public_read_apg_adhd" ON public.adhd_program_games FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.adhd_day_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.adhd_programs(id) ON DELETE CASCADE,
  day_id UUID NOT NULL REFERENCES public.adhd_program_days(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ai_report TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  recommendations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adhd_day_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_adr2_adhd" ON public.adhd_day_reports;
CREATE POLICY "own_adr2_adhd" ON public.adhd_day_reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "public_read_adr2_adhd" ON public.adhd_day_reports;
CREATE POLICY "public_read_adr2_adhd" ON public.adhd_day_reports FOR SELECT USING (true);
