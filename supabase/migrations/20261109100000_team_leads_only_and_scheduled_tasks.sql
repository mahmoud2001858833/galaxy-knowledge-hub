-- 1. Finished work goes to the leads only (principal + supervisor).
--    Before: a finished speaker task was shown to the page managers, and every auditor report became
--    an automatic task for the AI managers. Now nothing is handed over between roles; the leads read
--    the result and assign any follow-up task themselves.
-- 2. Scheduled tasks: team_tasks.publish_at. Until that moment the task is hidden from members (RLS)
--    and cannot be started or closed. A pg_cron job checks every minute and calls the
--    team-task-email Edge Function, which marks the due tasks as sent (emailed_at) and emails them.

-- ---------------------------------------------------------------- columns
ALTER TABLE public.team_tasks
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS emailed_at timestamptz;

CREATE INDEX IF NOT EXISTS team_tasks_due_publish_idx
  ON public.team_tasks (publish_at) WHERE publish_at IS NOT NULL AND emailed_at IS NULL;

CREATE OR REPLACE FUNCTION public.team_task_published(p_publish_at timestamptz)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT p_publish_at IS NULL OR p_publish_at <= now()
$$;

-- ---------------------------------------------------------------- visibility
DROP POLICY IF EXISTS "see own, handed-over and all-if-lead tasks" ON public.team_tasks;
DROP POLICY IF EXISTS "see own and all-if-lead tasks" ON public.team_tasks;
CREATE POLICY "see own and all-if-lead tasks" ON public.team_tasks
  FOR SELECT TO authenticated USING (
    public.team_is_lead()
    OR (
      public.team_task_published(publish_at)
      AND (public.team_is_my_task(assignee_role, assignee_user_id) OR assignee_user_id = auth.uid())
    )
  );

-- Old hand-over notices (speaker -> page managers, auditor -> AI managers); the leads keep their copy.
DELETE FROM public.team_notifications WHERE recipient_role IN ('page_manager', 'ai_manager');

-- ---------------------------------------------------------------- workflow RPCs
CREATE OR REPLACE FUNCTION public.team_start_task(p_task_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.team_tasks;
BEGIN
  -- FOR UPDATE: two members pressing at the same moment are served one after the other
  SELECT * INTO t FROM public.team_tasks WHERE id = p_task_id FOR UPDATE;
  IF t.id IS NOT NULL AND NOT public.team_task_published(t.publish_at) THEN
    RAISE EXCEPTION 'هذه المهمة ليست لك';
  END IF;
  IF t.id IS NOT NULL AND public.team_has_role(t.assignee_role)
     AND t.assignee_user_id IS NOT NULL AND t.assignee_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'TASK_TAKEN: سبقك زميلك وأخذ هذه المهمة. حظاً أوفر، انتظر المهمة القادمة' USING ERRCODE = 'P0001';
  END IF;
  IF t.id IS NULL OR NOT public.team_is_my_task(t.assignee_role, t.assignee_user_id) THEN
    RAISE EXCEPTION 'هذه المهمة ليست لك';
  END IF;
  IF t.status <> 'todo' THEN
    RAISE EXCEPTION 'المهمة ليست في حالة "مطلوبة"';
  END IF;
  UPDATE public.team_tasks
  SET status = 'in_progress', assignee_user_id = auth.uid()
  WHERE id = p_task_id;
END $$;

CREATE OR REPLACE FUNCTION public.team_complete_task(
  p_task_id uuid,
  p_description text DEFAULT NULL,
  p_school_name text DEFAULT NULL,
  p_teacher_names text DEFAULT NULL,
  p_problem_location text DEFAULT NULL,
  p_images text[] DEFAULT '{}',
  p_extra_answers jsonb DEFAULT '{}'
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.team_tasks;
  v_images text[] := coalesce(p_images, '{}');
  v_answers jsonb := coalesce(p_extra_answers, '{}');
  v_req text;
  v_img text;
  v_sub uuid;
  v_who text;
BEGIN
  SELECT * INTO t FROM public.team_tasks WHERE id = p_task_id FOR UPDATE;
  IF t.id IS NULL OR NOT public.team_task_published(t.publish_at)
     OR NOT public.team_is_my_task(t.assignee_role, t.assignee_user_id) THEN
    RAISE EXCEPTION 'هذه المهمة ليست لك';
  END IF;
  IF t.status = 'done' THEN
    RAISE EXCEPTION 'المهمة منجزة مسبقاً';
  END IF;

  FOREACH v_img IN ARRAY v_images LOOP
    IF v_img NOT LIKE auth.uid()::text || '/%' THEN
      RAISE EXCEPTION 'صورة غير صالحة';
    END IF;
  END LOOP;

  -- Required proof per role
  IF t.assignee_role = 'speaker' THEN
    IF cardinality(v_images) = 0 THEN RAISE EXCEPTION 'أرفق صور زيارة المدرسة'; END IF;
    IF coalesce(btrim(p_school_name), '') = '' THEN RAISE EXCEPTION 'اكتب اسم المدرسة'; END IF;
    IF coalesce(btrim(p_teacher_names), '') = '' THEN RAISE EXCEPTION 'اكتب أسماء المعلمات'; END IF;
  ELSIF t.assignee_role IN ('page_manager', 'file_manager') THEN
    IF length(btrim(coalesce(p_description, ''))) < 20 THEN RAISE EXCEPTION 'اكتب وصفاً تفصيلياً لما قمت به (20 حرفاً على الأقل)'; END IF;
    IF cardinality(v_images) = 0 THEN RAISE EXCEPTION 'أرفق صورة إثبات للعمل'; END IF;
  ELSIF t.assignee_role = 'auditor' THEN
    IF length(btrim(coalesce(p_description, ''))) < 20 THEN RAISE EXCEPTION 'اكتب تفاصيل المشكلة (20 حرفاً على الأقل)'; END IF;
    IF coalesce(btrim(p_problem_location), '') = '' THEN RAISE EXCEPTION 'حدّد أين توجد المشكلة'; END IF;
    IF cardinality(v_images) = 0 THEN RAISE EXCEPTION 'أرفق صورة للمشكلة'; END IF;
  ELSIF t.assignee_role = 'ai_manager' THEN
    IF length(btrim(coalesce(p_description, ''))) < 10 THEN RAISE EXCEPTION 'اكتب ما قمت به لحل المهمة'; END IF;
  END IF;

  FOREACH v_req IN ARRAY t.extra_requirements LOOP
    IF coalesce(btrim(v_answers ->> v_req), '') = '' THEN
      RAISE EXCEPTION 'أكمل المتطلب: %', v_req;
    END IF;
  END LOOP;

  INSERT INTO public.team_task_submissions
    (task_id, submitted_by, description, school_name, teacher_names, problem_location, images, extra_answers)
  VALUES
    (t.id, auth.uid(), nullif(btrim(p_description), ''), nullif(btrim(p_school_name), ''), nullif(btrim(p_teacher_names), ''),
     nullif(btrim(p_problem_location), ''), v_images, v_answers)
  RETURNING id INTO v_sub;

  UPDATE public.team_tasks
  SET status = 'done', completed_at = now(), completed_by = auth.uid(), assignee_user_id = auth.uid()
  WHERE id = t.id;

  SELECT coalesce(m.display_name, split_part(m.email, '@', 1)) INTO v_who
  FROM public.team_members m WHERE m.user_id = auth.uid() LIMIT 1;

  -- The result goes to the leads only; they assign any follow-up task themselves.
  INSERT INTO public.team_notifications (recipient_role, task_id, message)
  VALUES ('lead', t.id, CASE t.assignee_role
    WHEN 'speaker' THEN format('أنجز المتكلم %s زيارة %s: %s', v_who, btrim(p_school_name), t.title)
    WHEN 'auditor' THEN format('أبلغ المدقق %s عن مشكلة: %s', v_who, t.title)
    ELSE format('%s أنجز المهمة: %s', v_who, t.title)
  END);

  RETURN v_sub;
END $$;

REVOKE EXECUTE ON FUNCTION public.team_task_published(timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.team_task_published(timestamptz) TO authenticated;

-- ---------------------------------------------------------------- scheduler
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Runs every minute; only calls the Edge Function when a scheduled task is due and not yet sent.
-- The function itself claims the due rows (UPDATE ... emailed_at), so a task is sent once.
CREATE OR REPLACE FUNCTION public.team_dispatch_scheduled_tasks()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.team_tasks
    WHERE publish_at IS NOT NULL AND publish_at <= now() AND emailed_at IS NULL
  ) THEN
    PERFORM net.http_post(
      url := 'https://esifpjjehdnpkhyilctv.supabase.co/functions/v1/team-task-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        -- public anon key (the same one shipped in the web app)
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzaWZwamplaGRucGtoeWlsY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzQ5NDYsImV4cCI6MjA2MDc1MDk0Nn0.xfaLcyAgvZx2yKsNAdf94cuNZQfXPGQcAYb1xiSYI7k'
      ),
      body := '{"scheduled": true}'::jsonb
    );
  END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.team_dispatch_scheduled_tasks() FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'team-scheduled-tasks';
SELECT cron.schedule('team-scheduled-tasks', '* * * * *', 'SELECT public.team_dispatch_scheduled_tasks()');
