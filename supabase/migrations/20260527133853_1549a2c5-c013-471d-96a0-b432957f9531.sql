ALTER TABLE public.autism_child_profiles 
  ADD COLUMN IF NOT EXISTS parent_name TEXT,
  ADD COLUMN IF NOT EXISTS intake_answers JSONB DEFAULT '{}'::jsonb;