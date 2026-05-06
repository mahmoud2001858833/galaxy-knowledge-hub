
-- Catalog of interventions (medications, behavioral therapies, sensory tools, etc.)
CREATE TABLE public.clinical_interventions_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  condition_keys TEXT[] NOT NULL DEFAULT '{}',
  name_ar TEXT NOT NULL,
  name_en TEXT,
  short_ar TEXT,
  default_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  mechanism_ar TEXT,
  expected_effects JSONB NOT NULL DEFAULT '{}'::jsonb,
  contraindications_ar TEXT[] NOT NULL DEFAULT '{}',
  references_ar TEXT[] NOT NULL DEFAULT '{}',
  evidence_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clinical_interv_cat ON public.clinical_interventions_catalog(category);
CREATE INDEX idx_clinical_interv_cond ON public.clinical_interventions_catalog USING GIN(condition_keys);

ALTER TABLE public.clinical_interventions_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalog readable by authenticated"
ON public.clinical_interventions_catalog FOR SELECT
TO authenticated USING (true);

-- Trials performed by students
CREATE TABLE public.clinical_intervention_trials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  intervention_id UUID REFERENCES public.clinical_interventions_catalog(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  custom_label TEXT,
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  applied_to_session BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clinical_trials_session ON public.clinical_intervention_trials(session_id);
CREATE INDEX idx_clinical_trials_user ON public.clinical_intervention_trials(user_id);

ALTER TABLE public.clinical_intervention_trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own trials"
ON public.clinical_intervention_trials FOR SELECT
TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own trials"
ON public.clinical_intervention_trials FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own trials"
ON public.clinical_intervention_trials FOR UPDATE
TO authenticated USING (auth.uid() = user_id);
