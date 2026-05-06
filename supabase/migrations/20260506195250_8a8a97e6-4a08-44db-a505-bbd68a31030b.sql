ALTER TABLE public.clinical_sessions ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'guided';
ALTER TABLE public.clinical_sessions ALTER COLUMN protocol_id DROP NOT NULL;
ALTER TABLE public.clinical_sessions ADD COLUMN IF NOT EXISTS free_intent JSONB;