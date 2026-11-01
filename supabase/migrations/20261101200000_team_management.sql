-- Team & task management for the competition team (لوحة تحكم الموظفين).
--
-- Roles are bound to an existing account (user_id), not only to an email string:
-- email sign-ups are auto-confirmed on this project, so trusting the email alone would
-- let anyone who registers an assigned-but-unregistered email take over that role.
--
-- principal (fixed: jowmahmoud6@gmail.com) and supervisor are "leads": they manage
-- members and tasks and can read every message, including private ones (members are
-- told this in the chat UI). Other roles only see their own work.
-- Task completion goes through team_complete_task(), which enforces each role's
-- required proof and fans results out (speaker -> page managers, auditor -> AI managers).

-- ---------------------------------------------------------------- members
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('principal', 'supervisor', 'speaker', 'page_manager', 'auditor', 'ai_manager', 'file_manager')),
  display_name text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role),
  CHECK (role <> 'principal' OR email = 'jowmahmoud6@gmail.com')
);

-- Resolve email -> account on insert; reject emails with no account.
CREATE OR REPLACE FUNCTION public.team_members_resolve_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_user uuid;
  v_name text;
BEGIN
  NEW.email := lower(btrim(NEW.email));
  SELECT u.id INTO v_user FROM auth.users u WHERE lower(u.email) = NEW.email;
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'لا يوجد حساب مسجل بهذا الإيميل: %', NEW.email USING ERRCODE = 'P0002';
  END IF;
  NEW.user_id := v_user;
  IF coalesce(btrim(NEW.display_name), '') = '' THEN
    SELECT p.username INTO v_name FROM public.profiles p WHERE p.id = v_user;
    NEW.display_name := coalesce(v_name, split_part(NEW.email, '@', 1));
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER team_members_resolve_user
BEFORE INSERT ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.team_members_resolve_user();

-- The principal row can never be changed or removed through the API.
CREATE OR REPLACE FUNCTION public.team_members_protect_principal()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.role = 'principal' THEN
    RAISE EXCEPTION 'لا يمكن حذف الرئيس';
  END IF;
  IF TG_OP = 'UPDATE' AND (OLD.role = 'principal' OR NEW.role = 'principal')
     AND (NEW.role IS DISTINCT FROM OLD.role OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.email IS DISTINCT FROM OLD.email) THEN
    RAISE EXCEPTION 'لا يمكن تعديل الرئيس';
  END IF;
  IF TG_OP = 'UPDATE' AND (NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.email IS DISTINCT FROM OLD.email) THEN
    RAISE EXCEPTION 'لتغيير الإيميل احذف العضو وأضفه من جديد';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$;

CREATE TRIGGER team_members_protect_principal
BEFORE UPDATE OR DELETE ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.team_members_protect_principal();

-- ---------------------------------------------------------------- helpers
CREATE OR REPLACE FUNCTION public.team_my_roles()
RETURNS text[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(array_agg(role ORDER BY role), '{}') FROM public.team_members WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.team_my_email()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  SELECT lower(email) FROM auth.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.team_is_member()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.team_is_lead()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid() AND role IN ('principal', 'supervisor'))
$$;

CREATE OR REPLACE FUNCTION public.team_has_role(p_role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid() AND role = p_role)
$$;

-- ---------------------------------------------------------------- tasks
CREATE TABLE public.team_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 200),
  details text,
  assignee_role text NOT NULL CHECK (assignee_role IN ('speaker', 'page_manager', 'auditor', 'ai_manager', 'file_manager')),
  -- NULL = any member holding assignee_role may take it
  assignee_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  due_at timestamptz,
  extra_requirements text[] NOT NULL DEFAULT '{}',
  source_task_id uuid REFERENCES public.team_tasks(id) ON DELETE SET NULL,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  completed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX team_tasks_assignee_idx ON public.team_tasks (assignee_role, assignee_user_id);
CREATE INDEX team_tasks_status_idx ON public.team_tasks (status);

CREATE OR REPLACE FUNCTION public.team_tasks_touch()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER team_tasks_touch BEFORE UPDATE ON public.team_tasks
FOR EACH ROW EXECUTE FUNCTION public.team_tasks_touch();

-- A task is assigned to the caller if the role matches and it is theirs or unclaimed.
CREATE OR REPLACE FUNCTION public.team_is_my_task(p_role text, p_assignee uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.team_has_role(p_role) AND (p_assignee IS NULL OR p_assignee = auth.uid())
$$;

CREATE TABLE public.team_task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.team_tasks(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text,
  school_name text,
  teacher_names text,
  problem_location text,
  images text[] NOT NULL DEFAULT '{}',
  extra_answers jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX team_task_submissions_task_idx ON public.team_task_submissions (task_id);

-- ---------------------------------------------------------------- notifications
CREATE TABLE public.team_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 'lead' = principal + supervisors; otherwise a team role
  recipient_role text NOT NULL,
  task_id uuid REFERENCES public.team_tasks(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX team_notifications_role_idx ON public.team_notifications (recipient_role, created_at DESC);

-- ---------------------------------------------------------------- chat
CREATE TABLE public.team_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL CHECK (length(btrim(question)) BETWEEN 1 AND 300),
  options text[] NOT NULL CHECK (cardinality(options) BETWEEN 2 AND 10),
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.team_poll_votes (
  poll_id uuid NOT NULL REFERENCES public.team_polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index int NOT NULL CHECK (option_index >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (poll_id, user_id)
);

CREATE TABLE public.team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  -- NULL = university group chat; otherwise a private message to this user
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  body text CHECK (body IS NULL OR length(body) <= 4000),
  image_path text,
  poll_id uuid REFERENCES public.team_polls(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (coalesce(btrim(body), '') <> '' OR image_path IS NOT NULL OR poll_id IS NOT NULL),
  CHECK (poll_id IS NULL OR recipient_id IS NULL)
);
CREATE INDEX team_messages_group_idx ON public.team_messages (created_at) WHERE recipient_id IS NULL;
CREATE INDEX team_messages_dm_idx ON public.team_messages (sender_id, recipient_id, created_at);

-- ---------------------------------------------------------------- RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.team_members, public.team_tasks, public.team_task_submissions, public.team_notifications,
  public.team_polls, public.team_poll_votes, public.team_messages FROM anon;

CREATE POLICY "team members read roster" ON public.team_members
  FOR SELECT TO authenticated USING (public.team_is_member());
CREATE POLICY "leads add members" ON public.team_members
  FOR INSERT TO authenticated WITH CHECK (public.team_is_lead() AND role <> 'principal');
CREATE POLICY "leads edit members" ON public.team_members
  FOR UPDATE TO authenticated USING (public.team_is_lead()) WITH CHECK (public.team_is_lead());
CREATE POLICY "leads remove members" ON public.team_members
  FOR DELETE TO authenticated USING (public.team_is_lead());

CREATE POLICY "see own, handed-over and all-if-lead tasks" ON public.team_tasks
  FOR SELECT TO authenticated USING (
    public.team_is_lead()
    OR public.team_is_my_task(assignee_role, assignee_user_id)
    OR assignee_user_id = auth.uid()
    OR (assignee_role = 'speaker' AND status = 'done' AND public.team_has_role('page_manager'))
    OR (assignee_role = 'auditor' AND status = 'done' AND public.team_has_role('ai_manager'))
  );
CREATE POLICY "leads create tasks" ON public.team_tasks
  FOR INSERT TO authenticated WITH CHECK (public.team_is_lead() AND created_by = auth.uid());
CREATE POLICY "leads edit tasks" ON public.team_tasks
  FOR UPDATE TO authenticated USING (public.team_is_lead()) WITH CHECK (public.team_is_lead());
CREATE POLICY "leads delete tasks" ON public.team_tasks
  FOR DELETE TO authenticated USING (public.team_is_lead());

-- Submissions follow the task's visibility; they are written only by team_complete_task().
CREATE POLICY "read submissions of visible tasks" ON public.team_task_submissions
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.team_tasks t WHERE t.id = task_id));
CREATE POLICY "leads delete submissions" ON public.team_task_submissions
  FOR DELETE TO authenticated USING (public.team_is_lead());

CREATE POLICY "read own notifications" ON public.team_notifications
  FOR SELECT TO authenticated USING (
    public.team_is_lead() OR (recipient_role <> 'lead' AND public.team_has_role(recipient_role))
  );

CREATE POLICY "members read polls" ON public.team_polls
  FOR SELECT TO authenticated USING (public.team_is_member());
CREATE POLICY "members create polls" ON public.team_polls
  FOR INSERT TO authenticated WITH CHECK (public.team_is_member() AND created_by = auth.uid() AND NOT closed);
CREATE POLICY "creator or lead closes poll" ON public.team_polls
  FOR UPDATE TO authenticated USING (created_by = auth.uid() OR public.team_is_lead())
  WITH CHECK (created_by = auth.uid() OR public.team_is_lead());
CREATE POLICY "creator or lead deletes poll" ON public.team_polls
  FOR DELETE TO authenticated USING (created_by = auth.uid() OR public.team_is_lead());

CREATE POLICY "members read votes" ON public.team_poll_votes
  FOR SELECT TO authenticated USING (public.team_is_member());
CREATE POLICY "members vote once on open polls" ON public.team_poll_votes
  FOR INSERT TO authenticated WITH CHECK (
    public.team_is_member() AND user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.team_polls p WHERE p.id = poll_id AND NOT p.closed AND option_index < cardinality(p.options))
  );
CREATE POLICY "members change own vote" ON public.team_poll_votes
  FOR UPDATE TO authenticated USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.team_polls p WHERE p.id = poll_id AND NOT p.closed AND option_index < cardinality(p.options))
  );
CREATE POLICY "members remove own vote" ON public.team_poll_votes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "group for members, private for both sides, everything for leads" ON public.team_messages
  FOR SELECT TO authenticated USING (
    public.team_is_lead()
    OR (recipient_id IS NULL AND public.team_is_member())
    OR sender_id = auth.uid()
    OR recipient_id = auth.uid()
  );
CREATE POLICY "members send as themselves" ON public.team_messages
  FOR INSERT TO authenticated WITH CHECK (
    public.team_is_member()
    AND sender_id = auth.uid()
    AND (recipient_id IS NULL OR (recipient_id <> auth.uid() AND EXISTS (SELECT 1 FROM public.team_members m WHERE m.user_id = recipient_id)))
    AND (image_path IS NULL OR image_path LIKE auth.uid()::text || '/%')
    AND (poll_id IS NULL OR EXISTS (SELECT 1 FROM public.team_polls p WHERE p.id = poll_id AND p.created_by = auth.uid()))
  );
CREATE POLICY "sender or lead deletes message" ON public.team_messages
  FOR DELETE TO authenticated USING (sender_id = auth.uid() OR public.team_is_lead());

-- ---------------------------------------------------------------- workflow RPCs
CREATE OR REPLACE FUNCTION public.team_start_task(p_task_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.team_tasks;
BEGIN
  SELECT * INTO t FROM public.team_tasks WHERE id = p_task_id FOR UPDATE;
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
  IF t.id IS NULL OR NOT public.team_is_my_task(t.assignee_role, t.assignee_user_id) THEN
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

  INSERT INTO public.team_notifications (recipient_role, task_id, message)
  VALUES ('lead', t.id, format('%s أنجز المهمة: %s', v_who, t.title));

  IF t.assignee_role = 'speaker' THEN
    INSERT INTO public.team_notifications (recipient_role, task_id, message)
    VALUES ('page_manager', t.id, format('أنجز المتكلم %s زيارة %s: %s', v_who, btrim(p_school_name), t.title));
  ELSIF t.assignee_role = 'auditor' THEN
    -- Every problem found by an auditor becomes a task for the AI managers.
    INSERT INTO public.team_tasks (title, details, assignee_role, source_task_id, created_by)
    VALUES (
      left('إصلاح: ' || t.title, 200),
      format(E'المشكلة: %s\nمكانها: %s', btrim(p_description), btrim(p_problem_location)),
      'ai_manager', t.id, auth.uid()
    );
    INSERT INTO public.team_notifications (recipient_role, task_id, message)
    VALUES ('ai_manager', t.id, format('أبلغ المدقق %s عن مشكلة: %s', v_who, t.title));
  END IF;

  RETURN v_sub;
END $$;

REVOKE EXECUTE ON FUNCTION public.team_start_task(uuid), public.team_complete_task(uuid, text, text, text, text, text[], jsonb),
  public.team_my_roles(), public.team_my_email(), public.team_is_member(), public.team_is_lead(), public.team_has_role(text),
  public.team_is_my_task(text, uuid), public.team_members_resolve_user(), public.team_members_protect_principal()
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.team_start_task(uuid), public.team_complete_task(uuid, text, text, text, text, text[], jsonb),
  public.team_my_roles(), public.team_my_email(), public.team_is_member(), public.team_is_lead(), public.team_has_role(text),
  public.team_is_my_task(text, uuid)
  TO authenticated;

-- ---------------------------------------------------------------- storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('team-files', 'team-files', false, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "team members read team files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'team-files' AND public.team_is_member());
CREATE POLICY "team members upload to own folder" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'team-files' AND public.team_is_member() AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "owner or lead deletes team files" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'team-files' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.team_is_lead())
  );

-- ---------------------------------------------------------------- realtime + seed
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_messages, public.team_poll_votes, public.team_tasks, public.team_notifications;

INSERT INTO public.team_members (user_id, email, role, display_name)
SELECT id, 'jowmahmoud6@gmail.com', 'principal', 'محمود محمد عبد الله جوارنة'
FROM auth.users WHERE lower(email) = 'jowmahmoud6@gmail.com';
