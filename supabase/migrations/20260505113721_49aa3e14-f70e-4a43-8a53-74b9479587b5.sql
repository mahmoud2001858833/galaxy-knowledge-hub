
CREATE TABLE public.autism_child_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  child_name TEXT NOT NULL,
  age_years INTEGER,
  age_track TEXT,
  support_level INTEGER,
  functional_profile TEXT,
  cognitive_profile TEXT,
  last_report JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.autism_child_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select" ON public.autism_child_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.autism_child_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.autism_child_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.autism_child_profiles FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.autism_therapy_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  child_profile_id UUID REFERENCES public.autism_child_profiles(id) ON DELETE CASCADE,
  plan JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.autism_therapy_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select" ON public.autism_therapy_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.autism_therapy_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.autism_therapy_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.autism_therapy_plans FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.autism_game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  child_profile_id UUID REFERENCES public.autism_child_profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.autism_therapy_plans(id) ON DELETE SET NULL,
  template_id TEXT NOT NULL,
  stage INTEGER,
  difficulty TEXT,
  accuracy NUMERIC,
  duration_sec INTEGER,
  abandoned BOOLEAN DEFAULT false,
  notes TEXT,
  raw_metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.autism_game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select" ON public.autism_game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.autism_game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.autism_game_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_delete" ON public.autism_game_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_acp_user ON public.autism_child_profiles(user_id);
CREATE INDEX idx_atp_child ON public.autism_therapy_plans(child_profile_id);
CREATE INDEX idx_ags_child ON public.autism_game_sessions(child_profile_id);

CREATE TRIGGER trg_acp_updated BEFORE UPDATE ON public.autism_child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_jordanian_users_updated_at();
