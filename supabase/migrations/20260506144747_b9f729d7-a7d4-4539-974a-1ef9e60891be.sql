-- Clinical lab tables
CREATE TABLE public.clinical_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- asd | adhd | hearing | visual | learning_other
  name_ar TEXT NOT NULL,
  age_years INTEGER NOT NULL,
  gender TEXT,
  severity TEXT NOT NULL, -- mild | moderate | severe
  summary_ar TEXT NOT NULL,
  history_ar TEXT,
  sensory_profile JSONB DEFAULT '{}'::jsonb,
  presenting_signs_ar TEXT[],
  patient_persona_ar TEXT NOT NULL, -- system prompt for AI patient
  reference_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX idx_clinical_cases_category ON public.clinical_cases(category);

CREATE TABLE public.clinical_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  short_ar TEXT NOT NULL,
  goal_ar TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{title_ar,instruction_ar,duration_sec,success_ar}]
  scoring JSONB DEFAULT '{}'::jsonb,
  reference_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX idx_clinical_protocols_category ON public.clinical_protocols(category);

CREATE TABLE public.clinical_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  case_id UUID NOT NULL REFERENCES public.clinical_cases(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES public.clinical_protocols(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress | completed | aborted
  current_step INTEGER NOT NULL DEFAULT 0,
  attention NUMERIC NOT NULL DEFAULT 60,
  anxiety NUMERIC NOT NULL DEFAULT 40,
  progress NUMERIC NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ended_at TIMESTAMPTZ
);
CREATE INDEX idx_clinical_sessions_user ON public.clinical_sessions(user_id);

CREATE TABLE public.clinical_session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.clinical_sessions(id) ON DELETE CASCADE,
  t_ms INTEGER NOT NULL,
  actor TEXT NOT NULL, -- student | patient | system
  event_type TEXT NOT NULL, -- say | action | step_advance | metric | clinical_note
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  attention NUMERIC,
  anxiety NUMERIC,
  progress NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX idx_clinical_events_session ON public.clinical_session_events(session_id, t_ms);

CREATE TABLE public.clinical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID NOT NULL UNIQUE REFERENCES public.clinical_sessions(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  diagnosis_ar TEXT,
  summary_ar TEXT NOT NULL,
  strengths_ar TEXT[] DEFAULT '{}',
  weaknesses_ar TEXT[] DEFAULT '{}',
  recommendations_ar TEXT[] DEFAULT '{}',
  references_ar TEXT[] DEFAULT '{}',
  rubric JSONB DEFAULT '{}'::jsonb, -- {communication,attention,affect,compliance,sensory}
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX idx_clinical_reports_user ON public.clinical_reports(user_id);

-- RLS
ALTER TABLE public.clinical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cases public read" ON public.clinical_cases FOR SELECT USING (true);
CREATE POLICY "protocols public read" ON public.clinical_protocols FOR SELECT USING (true);

CREATE POLICY "sessions own" ON public.clinical_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events own session" ON public.clinical_session_events
  FOR ALL USING (EXISTS (SELECT 1 FROM public.clinical_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clinical_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));

CREATE POLICY "reports own" ON public.clinical_reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports public via token" ON public.clinical_reports FOR SELECT USING (share_token IS NOT NULL);