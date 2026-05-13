ALTER TABLE public.clinical_sessions
ADD COLUMN IF NOT EXISTS vitals_state JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.clinical_sessions s
SET vitals_state = COALESCE(c.vitals_initial, '{}'::jsonb)
FROM public.clinical_cases c
WHERE s.case_id = c.id AND (s.vitals_state IS NULL OR s.vitals_state = '{}'::jsonb);