-- Collective tasks, part 2: daily sending + full specs.
--
-- * The final vision can be a full project spec (sections, components, texts), so goals / vision get
--   room for 20 000 characters.
-- * The planner splits the spec into numbered requirements and says which ones each subtask covers
--   (collective_subtasks.covers) and roughly how many hours it takes (effort_hours).
-- * Instead of one email on day 1, every person gets THEIR tasks for THAT day, every day of the task,
--   at the same clock time as the first send. collective_daily_sends records each (task, day) once,
--   which is also the claim that stops a day from being sent twice.
-- * When the last day is over the task moves to "review" (group approval comes in a later phase).

ALTER TABLE public.collective_tasks DROP CONSTRAINT IF EXISTS collective_tasks_goals_check;
ALTER TABLE public.collective_tasks DROP CONSTRAINT IF EXISTS collective_tasks_final_vision_check;
ALTER TABLE public.collective_tasks
  ADD CONSTRAINT collective_tasks_goals_check CHECK (length(btrim(goals)) BETWEEN 3 AND 20000),
  ADD CONSTRAINT collective_tasks_final_vision_check CHECK (length(btrim(final_vision)) BETWEEN 3 AND 20000);

ALTER TABLE public.collective_subtasks
  ADD COLUMN IF NOT EXISTS covers text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS effort_hours numeric(5,1) CHECK (effort_hours IS NULL OR effort_hours BETWEEN 0 AND 200);

CREATE TABLE IF NOT EXISTS public.collective_daily_sends (
  task_id uuid NOT NULL REFERENCES public.collective_tasks (id) ON DELETE CASCADE,
  day integer NOT NULL CHECK (day BETWEEN 1 AND 90),
  sent_at timestamptz NOT NULL DEFAULT now(),
  report jsonb,
  PRIMARY KEY (task_id, day)
);
ALTER TABLE public.collective_daily_sends ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.collective_daily_sends FROM anon;
CREATE POLICY "collective daily sends: admin read" ON public.collective_daily_sends FOR SELECT TO authenticated
  USING (public.collective_is_admin(auth.uid()));

-- Which day of the task "now" is (1 = the day of the first send). Same clock time every day.
CREATE OR REPLACE FUNCTION public.collective_current_day(p_send_at timestamptz)
RETURNS integer LANGUAGE sql STABLE AS $$
  SELECT floor(extract(epoch FROM (now() - p_send_at)) / 86400)::integer + 1;
$$;

-- Every minute: wake the Edge Function only if something is due:
--   a scheduled task whose send time came, an active task whose today's emails were not sent,
--   or an active task whose days are over (-> review).
CREATE OR REPLACE FUNCTION public.collective_dispatch_due()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.collective_tasks
    WHERE status = 'scheduled' AND send_at IS NOT NULL AND send_at <= now() AND emailed_at IS NULL
  ) OR EXISTS (
    SELECT 1 FROM public.collective_tasks t
    WHERE t.status = 'active' AND t.send_at IS NOT NULL AND t.send_at <= now()
      AND (
        public.collective_current_day(t.send_at) > t.duration_days
        OR NOT EXISTS (
          SELECT 1 FROM public.collective_daily_sends d
          WHERE d.task_id = t.id AND d.day = public.collective_current_day(t.send_at)
        )
      )
  ) THEN
    PERFORM net.http_post(
      url := 'https://esifpjjehdnpkhyilctv.supabase.co/functions/v1/collective-task-ai',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        -- public anon key (the same one shipped in the web app)
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzaWZwamplaGRucGtoeWlsY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzQ5NDYsImV4cCI6MjA2MDc1MDk0Nn0.xfaLcyAgvZx2yKsNAdf94cuNZQfXPGQcAYb1xiSYI7k'
      ),
      body := '{"action": "dispatch"}'::jsonb
    );
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.collective_dispatch_due() FROM PUBLIC, anon, authenticated;
