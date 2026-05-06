
CREATE TABLE public.autism_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  child_profile_id UUID NOT NULL REFERENCES public.autism_child_profiles(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(9), 'base64'),
  total_days INTEGER NOT NULL DEFAULT 28,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  title_ar TEXT,
  summary_ar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.autism_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner all" ON public.autism_programs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "public by share" ON public.autism_programs FOR SELECT USING (share_token IS NOT NULL);

CREATE TABLE public.autism_program_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.autism_programs(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,
  theme_ar TEXT,
  focus_skill_ar TEXT,
  rationale_ar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (program_id, day_index)
);
ALTER TABLE public.autism_program_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner all days" ON public.autism_program_days FOR ALL
  USING (EXISTS (SELECT 1 FROM public.autism_programs p WHERE p.id = program_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.autism_programs p WHERE p.id = program_id AND p.user_id = auth.uid()));
CREATE POLICY "public read days" ON public.autism_program_days FOR SELECT USING (true);

CREATE TABLE public.autism_program_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES public.autism_program_days(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  template_id TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  instructions_ar TEXT,
  target_skill_ar TEXT,
  difficulty TEXT DEFAULT 'easy',
  duration_sec INTEGER DEFAULT 60,
  success_criteria_ar TEXT,
  adaptations_ar JSONB DEFAULT '[]'::jsonb,
  ai_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.autism_program_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner all games" ON public.autism_program_games FOR ALL
  USING (EXISTS (SELECT 1 FROM public.autism_program_days d JOIN public.autism_programs p ON p.id = d.program_id WHERE d.id = day_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.autism_program_days d JOIN public.autism_programs p ON p.id = d.program_id WHERE d.id = day_id AND p.user_id = auth.uid()));
CREATE POLICY "public read games" ON public.autism_program_games FOR SELECT USING (true);

CREATE TABLE public.autism_game_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  program_game_id UUID REFERENCES public.autism_program_games(id) ON DELETE CASCADE,
  t_ms INTEGER NOT NULL DEFAULT 0,
  event_type TEXT NOT NULL,
  is_correct BOOLEAN,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_moves_session ON public.autism_game_moves (session_id);
CREATE INDEX idx_moves_game ON public.autism_game_moves (program_game_id);
ALTER TABLE public.autism_game_moves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner moves" ON public.autism_game_moves FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.autism_day_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_id UUID NOT NULL REFERENCES public.autism_program_days(id) ON DELETE CASCADE,
  score NUMERIC,
  summary_ar TEXT,
  strengths_ar JSONB DEFAULT '[]'::jsonb,
  weaknesses_ar JSONB DEFAULT '[]'::jsonb,
  recommendations_ar JSONB DEFAULT '[]'::jsonb,
  raw JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (day_id)
);
ALTER TABLE public.autism_day_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reports" ON public.autism_day_reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "public read reports" ON public.autism_day_reports FOR SELECT USING (true);

ALTER TABLE public.autism_game_sessions
  ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.autism_programs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS day_id UUID REFERENCES public.autism_program_days(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS program_game_id UUID REFERENCES public.autism_program_games(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS move_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wrong_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS time_to_first_action_ms INTEGER;

CREATE INDEX IF NOT EXISTS idx_sessions_day ON public.autism_game_sessions (day_id);
CREATE INDEX IF NOT EXISTS idx_sessions_program ON public.autism_game_sessions (program_id);
