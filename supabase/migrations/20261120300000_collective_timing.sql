-- Collective tasks, part 3: timed delivery by priority and dependency.
--
-- * Every person on a collective task has a work window the admin sets (from–to, which weekdays).
-- * A subtask is delivered (staff dashboard + email) only when everything it depends on is done AND we
--   are inside its owner's window (or right away, if the admin chose the "immediate" policy). Its due
--   time is the end of that window. If its dependency is late, the owner gets ONE "postponed because
--   <who> has not finished #n" notice for that window, and it is delivered automatically later.
-- * Finishing the team task records completed_at and whether it was on time.
-- * Notifications can now be for one person (recipient_user_id): only that person and the leads see it.

ALTER TABLE public.collective_task_members
  ADD COLUMN IF NOT EXISTS work_start time NOT NULL DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS work_end time NOT NULL DEFAULT '16:00',
  -- 0 = Sunday … 6 = Saturday (Amman calendar)
  ADD COLUMN IF NOT EXISTS work_days smallint[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}';
ALTER TABLE public.collective_task_members DROP CONSTRAINT IF EXISTS collective_task_members_window_check;
ALTER TABLE public.collective_task_members
  ADD CONSTRAINT collective_task_members_window_check CHECK (work_end > work_start);

ALTER TABLE public.collective_subtasks
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS due_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS on_time boolean,
  ADD COLUMN IF NOT EXISTS postponed_at timestamptz,
  ADD COLUMN IF NOT EXISTS postponed_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS postponed_reason text CHECK (postponed_reason IS NULL OR length(postponed_reason) <= 500);

ALTER TABLE public.collective_tasks
  ADD COLUMN IF NOT EXISTS postpone_policy text NOT NULL DEFAULT 'next_window'
    CHECK (postpone_policy IN ('next_window', 'immediate'));

-- ---------------------------------------------------------------- per-person notifications
ALTER TABLE public.team_notifications
  ADD COLUMN IF NOT EXISTS recipient_user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS team_notifications_user_idx ON public.team_notifications (recipient_user_id, created_at DESC);

DROP POLICY IF EXISTS "read own notifications" ON public.team_notifications;
CREATE POLICY "read own notifications" ON public.team_notifications
  FOR SELECT TO authenticated USING (
    public.team_is_lead()
    OR recipient_user_id = auth.uid()
    OR (recipient_user_id IS NULL AND recipient_role <> 'lead' AND public.team_has_role(recipient_role))
  );

-- ---------------------------------------------------------------- finishing a delivered subtask
CREATE OR REPLACE FUNCTION public.collective_follow_team_task()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    UPDATE public.collective_subtasks
    SET status = NEW.status,
        completed_at = CASE WHEN NEW.status = 'done' THEN coalesce(completed_at, now()) ELSE NULL END,
        on_time = CASE WHEN NEW.status = 'done' THEN (due_at IS NULL OR now() <= due_at) ELSE NULL END
    WHERE team_task_id = NEW.id;
  END IF;
  RETURN NEW;
END $$;

-- ---------------------------------------------------------------- the scheduler wakes for timed work too
-- Active tasks with work still to deliver (or to close) need the function every minute; it is cheap and
-- decides itself what is due (inside a window, dependencies done, postponement notices once per window).
CREATE OR REPLACE FUNCTION public.collective_dispatch_due()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.collective_tasks
    WHERE status = 'scheduled' AND send_at IS NOT NULL AND send_at <= now() AND emailed_at IS NULL
  ) OR EXISTS (
    SELECT 1 FROM public.collective_tasks t
    WHERE t.status = 'active' AND t.send_at IS NOT NULL AND t.send_at <= now()
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
