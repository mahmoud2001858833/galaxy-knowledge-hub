-- Collective tasks (المهام الجماعية): one big piece of work given by the admin to a group of people.
-- The admin writes the goals, the final vision, how many days it takes, who it is for (emails),
-- and when it is sent. The collective-task-ai Edge Function turns that into a day-by-day plan of
-- subtasks (one owner each, with acceptance criteria) and emails everyone at the chosen time.
--
-- Kept separate from team_tasks (the everyday tasks given by the principal / supervisor).
-- Later phases add: a git branch + online preview per task ("Local View"), group approval, and
-- "publish all" (columns branch / preview_url / approval_rule are here already).

-- ---------------------------------------------------------------- who manages collective tasks
CREATE OR REPLACE FUNCTION public.collective_is_admin(p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p_user_id IS NOT NULL AND (public.terminal_is_principal(p_user_id) OR public.is_platform_admin(p_user_id));
$$;
REVOKE EXECUTE ON FUNCTION public.collective_is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.collective_is_admin(uuid) TO authenticated;

-- ---------------------------------------------------------------- tables
CREATE TABLE public.collective_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 3 AND 200),
  goals text NOT NULL CHECK (length(btrim(goals)) BETWEEN 3 AND 8000),
  final_vision text NOT NULL CHECK (length(btrim(final_vision)) BETWEEN 3 AND 8000),
  duration_days integer NOT NULL CHECK (duration_days BETWEEN 1 AND 90),
  send_at timestamptz,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'planned', 'scheduled', 'active', 'review', 'approved', 'published', 'cancelled')),
  approval_rule text NOT NULL DEFAULT 'members_then_admin'
    CHECK (approval_rule IN ('members_then_admin', 'all_members', 'majority')),
  plan jsonb,
  plan_generated_at timestamptz,
  branch text,
  preview_url text,
  emailed_at timestamptz,
  email_report jsonb,
  created_by uuid DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.collective_task_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.collective_tasks (id) ON DELETE CASCADE,
  email text NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254),
  focus text CHECK (focus IS NULL OR length(focus) <= 300),
  approved_at timestamptz,
  emailed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX collective_task_members_task_email ON public.collective_task_members (task_id, lower(email));

CREATE TABLE public.collective_subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.collective_tasks (id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 0),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 300),
  detail text CHECK (detail IS NULL OR length(detail) <= 4000),
  acceptance text[] NOT NULL DEFAULT '{}',
  assignee_email text CHECK (assignee_email IS NULL OR length(assignee_email) <= 254),
  day_from integer NOT NULL DEFAULT 1 CHECK (day_from BETWEEN 1 AND 90),
  day_to integer NOT NULL DEFAULT 1 CHECK (day_to BETWEEN 1 AND 90),
  depends_on integer[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (day_to >= day_from)
);
CREATE INDEX collective_subtasks_task ON public.collective_subtasks (task_id, position);

CREATE OR REPLACE FUNCTION public.collective_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
CREATE TRIGGER collective_tasks_touch BEFORE UPDATE ON public.collective_tasks
  FOR EACH ROW EXECUTE FUNCTION public.collective_touch_updated_at();
CREATE TRIGGER collective_subtasks_touch BEFORE UPDATE ON public.collective_subtasks
  FOR EACH ROW EXECUTE FUNCTION public.collective_touch_updated_at();

-- ---------------------------------------------------------------- access
-- Admin: everything. A member (by account email): reads the tasks they are in once they were sent,
-- and the subtasks of those tasks. Nobody anonymous sees anything.
ALTER TABLE public.collective_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_task_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_subtasks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.collective_tasks, public.collective_task_members, public.collective_subtasks FROM anon;

CREATE OR REPLACE FUNCTION public.collective_is_member(p_task_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.collective_task_members m
    JOIN public.collective_tasks t ON t.id = m.task_id
    WHERE m.task_id = p_task_id
      AND lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      AND t.status NOT IN ('draft', 'planned', 'scheduled', 'cancelled')
  );
$$;
REVOKE EXECUTE ON FUNCTION public.collective_is_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.collective_is_member(uuid) TO authenticated;

CREATE POLICY "collective tasks: admin all" ON public.collective_tasks FOR ALL TO authenticated
  USING (public.collective_is_admin(auth.uid())) WITH CHECK (public.collective_is_admin(auth.uid()));
CREATE POLICY "collective tasks: members read" ON public.collective_tasks FOR SELECT TO authenticated
  USING (public.collective_is_member(id));

CREATE POLICY "collective members: admin all" ON public.collective_task_members FOR ALL TO authenticated
  USING (public.collective_is_admin(auth.uid())) WITH CHECK (public.collective_is_admin(auth.uid()));
CREATE POLICY "collective members: members read" ON public.collective_task_members FOR SELECT TO authenticated
  USING (public.collective_is_member(task_id));

CREATE POLICY "collective subtasks: admin all" ON public.collective_subtasks FOR ALL TO authenticated
  USING (public.collective_is_admin(auth.uid())) WITH CHECK (public.collective_is_admin(auth.uid()));
CREATE POLICY "collective subtasks: members read" ON public.collective_subtasks FOR SELECT TO authenticated
  USING (public.collective_is_member(task_id));

-- ---------------------------------------------------------------- scheduler
-- Every minute: if a scheduled collective task is due and not sent yet, wake the Edge Function,
-- which claims the due rows (UPDATE ... emailed_at) so each task is sent exactly once.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.collective_dispatch_due()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.collective_tasks
    WHERE status = 'scheduled' AND send_at IS NOT NULL AND send_at <= now() AND emailed_at IS NULL
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

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'collective-tasks-dispatch';
SELECT cron.schedule('collective-tasks-dispatch', '* * * * *', 'SELECT public.collective_dispatch_due()');
