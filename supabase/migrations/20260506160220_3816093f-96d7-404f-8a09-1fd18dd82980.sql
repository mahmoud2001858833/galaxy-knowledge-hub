
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.adhd_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  instrument TEXT NOT NULL,
  completed_by TEXT NOT NULL DEFAULT 'self',
  subject_age INTEGER,
  raw_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  subtype TEXT,
  severity TEXT,
  ai_report TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adhd_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.adhd_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.adhd_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.adhd_assessments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.adhd_assessments FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.adhd_neuro_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  test_type TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adhd_neuro_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.adhd_neuro_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.adhd_neuro_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.adhd_neuro_tests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.adhd_neuro_tests FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.adhd_training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exercise TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  score NUMERIC,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adhd_training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.adhd_training_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.adhd_training_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.adhd_training_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.adhd_training_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.adhd_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  started_at DATE NOT NULL DEFAULT CURRENT_DATE,
  ended_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adhd_interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.adhd_interventions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.adhd_interventions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.adhd_interventions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.adhd_interventions FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.adhd_daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  targets JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_rating INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adhd_daily_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.adhd_daily_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.adhd_daily_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.adhd_daily_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.adhd_daily_reports FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_adhd_assessments_upd BEFORE UPDATE ON public.adhd_assessments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_adhd_interventions_upd BEFORE UPDATE ON public.adhd_interventions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_adhd_assessments_user ON public.adhd_assessments(user_id, created_at DESC);
CREATE INDEX idx_adhd_neuro_user ON public.adhd_neuro_tests(user_id, created_at DESC);
CREATE INDEX idx_adhd_train_user ON public.adhd_training_sessions(user_id, created_at DESC);
CREATE INDEX idx_adhd_inter_user ON public.adhd_interventions(user_id, active);
CREATE INDEX idx_adhd_daily_user ON public.adhd_daily_reports(user_id, report_date DESC);
