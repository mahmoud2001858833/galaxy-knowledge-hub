
CREATE TABLE public.scheduled_puzzle_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  puzzles_per_day INTEGER NOT NULL DEFAULT 3,
  topic_description TEXT NOT NULL,
  schedule_days TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.scheduled_puzzle_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scheduled jobs"
  ON public.scheduled_puzzle_jobs FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create scheduled jobs"
  ON public.scheduled_puzzle_jobs FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own scheduled jobs"
  ON public.scheduled_puzzle_jobs FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own scheduled jobs"
  ON public.scheduled_puzzle_jobs FOR DELETE
  USING (auth.uid() = created_by);
