-- نظام النقاط لفريق المسابقة (Phase E).
--
-- 1. points_settings: one editable row with every rule (on time, late per day, photos, quality,
--    rescue, exclusion after N days late, per-role base points and per-role excellence bonus).
-- 2. points_ledger: every movement (who, how many, why, which task, who made it).
-- 3. team_tasks.points: the value of each task, chosen by the lead when assigning; filled from the
--    role's base points when left empty.
-- 4. Automatic scoring: a trigger on team_tasks scores a task the moment it becomes done
--    (team_complete_task() writes the submission first, then sets status = 'done').
--    Idempotent: one row per (task, member, kind); reopening a task removes its automatic rows so a
--    second completion is scored once again, never twice.
-- 5. Quality ("no remarks") and rescue (helping on a late task) are awarded by the leads (quality also
--    by an auditor) through RPCs; manual +/- adjustments and edits are principal-only, with a reason.
-- 6. Fairness: points_leaderboard() ranks by the performance index = earned / available x 100, where
--    "available" is the value + on-time bonus of the member's tasks that are done or already overdue,
--    so people who were given fewer tasks are not disadvantaged.
--
-- Special rows kept inside team_tasks (day off, supervisor tasks, page-manager files) never score.

-- ---------------------------------------------------------------- settings
CREATE TABLE IF NOT EXISTS public.points_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  on_time int NOT NULL DEFAULT 10 CHECK (on_time BETWEEN 0 AND 1000),
  late_per_day int NOT NULL DEFAULT 5 CHECK (late_per_day BETWEEN 0 AND 1000),
  per_photo int NOT NULL DEFAULT 5 CHECK (per_photo BETWEEN 0 AND 1000),
  max_photos int NOT NULL DEFAULT 5 CHECK (max_photos BETWEEN 0 AND 50),
  quality int NOT NULL DEFAULT 10 CHECK (quality BETWEEN 0 AND 1000),
  rescue int NOT NULL DEFAULT 20 CHECK (rescue BETWEEN 0 AND 1000),
  -- later than this many days: no completion points (quality can still be awarded)
  exclude_after_days int NOT NULL DEFAULT 3 CHECK (exclude_after_days BETWEEN 0 AND 365),
  max_sources int NOT NULL DEFAULT 5 CHECK (max_sources BETWEEN 0 AND 50),
  role_base jsonb NOT NULL DEFAULT
    '{"auditor": 15, "ai_manager": 20, "page_manager": 20, "file_manager": 20, "speaker": 20, "supervisor": 0, "principal": 0}',
  -- auditor: per proof photo · ai_manager: per collective task · page_manager: with a quality "no remarks"
  -- file_manager: per official source (link) in the submission · speaker: per completed task
  role_excellence jsonb NOT NULL DEFAULT
    '{"auditor": 10, "ai_manager": 15, "page_manager": 10, "file_manager": 10, "speaker": 0}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CHECK (jsonb_typeof(role_base) = 'object' AND jsonb_typeof(role_excellence) = 'object')
);
INSERT INTO public.points_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------- ledger
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- the task's automatic rows go with it, so earned and available stay consistent
  team_task_id uuid REFERENCES public.team_tasks(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('completion', 'on_time', 'late', 'excluded', 'photos', 'excellence', 'quality', 'rescue', 'manual')),
  points int NOT NULL CHECK (points BETWEEN -10000 AND 10000),
  reason text NOT NULL CHECK (length(btrim(reason)) BETWEEN 1 AND 500),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  edited_at timestamptz,
  CHECK (kind = 'manual' OR team_task_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS points_ledger_user_idx ON public.points_ledger (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS points_ledger_task_idx ON public.points_ledger (team_task_id);
-- never award the same thing twice
CREATE UNIQUE INDEX IF NOT EXISTS points_ledger_once ON public.points_ledger (team_task_id, user_id, kind)
  WHERE kind <> 'manual';

-- ---------------------------------------------------------------- task columns
ALTER TABLE public.team_tasks
  ADD COLUMN IF NOT EXISTS points int CHECK (points IS NULL OR points BETWEEN 0 AND 1000),
  ADD COLUMN IF NOT EXISTS quality_status text CHECK (quality_status IS NULL OR quality_status IN ('no_remarks', 'remarks')),
  ADD COLUMN IF NOT EXISTS quality_note text,
  ADD COLUMN IF NOT EXISTS quality_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS quality_at timestamptz;

CREATE OR REPLACE FUNCTION public.team_task_is_special(p_title text, p_reqs text[])
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(p_reqs && ARRAY['__TEAM_DAY_OFF__', '__SUPERVISOR_TASK__', '__PAGE_MANAGER_FILE__'], false)
      OR coalesce(p_title LIKE '\_\_DAY\_OFF\_\_:%', false)
$$;

CREATE OR REPLACE FUNCTION public.points_role_base(p_role text)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce((s.role_base ->> p_role)::int, 0) FROM public.points_settings s WHERE s.id
$$;

-- A task with no value gets its role's base points (special rows stay NULL).
CREATE OR REPLACE FUNCTION public.team_tasks_default_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.points IS NULL AND NOT public.team_task_is_special(NEW.title, NEW.extra_requirements) THEN
    NEW.points := public.points_role_base(NEW.assignee_role);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS team_tasks_default_points ON public.team_tasks;
CREATE TRIGGER team_tasks_default_points BEFORE INSERT ON public.team_tasks
FOR EACH ROW EXECUTE FUNCTION public.team_tasks_default_points();

-- Open tasks join the system now; tasks finished before it stay out (points NULL = not counted).
UPDATE public.team_tasks t
SET points = public.points_role_base(t.assignee_role)
WHERE t.points IS NULL AND t.status <> 'done' AND NOT public.team_task_is_special(t.title, t.extra_requirements);

-- ---------------------------------------------------------------- scoring
-- Pure calculation, kept separate so it can be checked on its own:
-- days late are counted in started days (1 minute late = 1 day).
CREATE OR REPLACE FUNCTION public.points_days_late(p_due timestamptz, p_done timestamptz)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_due IS NULL OR p_done IS NULL OR p_done <= p_due THEN 0
    ELSE ceil(extract(epoch FROM (p_done - p_due)) / 86400.0)::int
  END
$$;

CREATE OR REPLACE FUNCTION public.points_award(
  p_user uuid, p_task uuid, p_kind text, p_points int, p_reason text, p_by uuid DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.points_ledger (user_id, team_task_id, kind, points, reason, created_by)
  VALUES (p_user, p_task, p_kind, p_points, left(p_reason, 500), p_by)
  ON CONFLICT (team_task_id, user_id, kind) WHERE kind <> 'manual' DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.points_score_task(p_task_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.team_tasks;
  s public.points_settings;
  v_user uuid;
  v_value int;
  v_late int;
  v_photos int;
  v_sources int;
  v_exc int;
  v_label text;
BEGIN
  SELECT * INTO t FROM public.team_tasks WHERE id = p_task_id;
  IF t.id IS NULL OR t.status <> 'done' OR t.points IS NULL
     OR public.team_task_is_special(t.title, t.extra_requirements) THEN
    RETURN;
  END IF;
  v_user := coalesce(t.completed_by, t.assignee_user_id);
  IF v_user IS NULL THEN RETURN; END IF;
  SELECT * INTO s FROM public.points_settings WHERE id;

  v_value := t.points;
  v_late := public.points_days_late(t.due_at, coalesce(t.completed_at, now()));
  v_label := left(t.title, 80);

  IF v_late > s.exclude_after_days THEN
    PERFORM public.points_award(v_user, t.id, 'excluded', 0,
      format('تأخير %s أيام (أكثر من %s): لا نقاط إنجاز — %s', v_late, s.exclude_after_days, v_label));
    RETURN;
  END IF;

  PERFORM public.points_award(v_user, t.id, 'completion', v_value, format('إنجاز مهمة: %s', v_label));
  IF v_late = 0 THEN
    PERFORM public.points_award(v_user, t.id, 'on_time', s.on_time, format('في الموعد: %s', v_label));
  ELSE
    PERFORM public.points_award(v_user, t.id, 'late', -(s.late_per_day * v_late),
      format('تأخير %s يوم: %s', v_late, v_label));
  END IF;

  SELECT least(coalesce(sum(cardinality(sub.images)), 0), s.max_photos)::int INTO v_photos
  FROM public.team_task_submissions sub WHERE sub.task_id = t.id AND sub.submitted_by = v_user;
  IF v_photos > 0 AND s.per_photo > 0 THEN
    PERFORM public.points_award(v_user, t.id, 'photos', v_photos * s.per_photo,
      format('%s صورة إثبات: %s', v_photos, v_label));
  END IF;

  -- per-role excellence (page_manager's comes with the quality review)
  v_exc := coalesce((s.role_excellence ->> t.assignee_role)::int, 0);
  IF v_exc > 0 THEN
    IF t.assignee_role = 'auditor' AND v_photos > 0 THEN
      PERFORM public.points_award(v_user, t.id, 'excellence', v_exc * v_photos,
        format('تميّز المدقق: %s صورة إثبات', v_photos));
    ELSIF t.assignee_role = 'ai_manager'
      AND EXISTS (SELECT 1 FROM public.collective_subtasks c WHERE c.team_task_id = t.id) THEN
      PERFORM public.points_award(v_user, t.id, 'excellence', v_exc, 'تميّز الذكاء الاصطناعي: مهمة جماعية');
    ELSIF t.assignee_role = 'file_manager' THEN
      SELECT least(count(DISTINCT m.arr[1]), s.max_sources)::int INTO v_sources
      FROM public.team_task_submissions sub,
           regexp_matches(coalesce(sub.description, '') || ' ' || sub.extra_answers::text, '(https?://[^\s"<>]+)', 'g') AS m(arr)
      WHERE sub.task_id = t.id AND sub.submitted_by = v_user;
      IF v_sources > 0 THEN
        PERFORM public.points_award(v_user, t.id, 'excellence', v_exc * v_sources,
          format('تميّز رفع الملفات: %s مصدر رسمي', v_sources));
      END IF;
    ELSIF t.assignee_role = 'speaker' THEN
      PERFORM public.points_award(v_user, t.id, 'excellence', v_exc, 'تميّز المتكلم');
    END IF;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.team_tasks_points_follow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'done' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'done') THEN
    PERFORM public.points_score_task(NEW.id);
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'done' AND NEW.status <> 'done' THEN
    -- reopened: drop what this completion earned so the next one is scored once, from scratch
    DELETE FROM public.points_ledger
    WHERE team_task_id = NEW.id AND kind IN ('completion', 'on_time', 'late', 'excluded', 'photos', 'excellence', 'quality');
    UPDATE public.team_tasks SET quality_status = NULL, quality_note = NULL, quality_by = NULL, quality_at = NULL
    WHERE id = NEW.id AND quality_status IS NOT NULL;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS team_tasks_points_follow ON public.team_tasks;
CREATE TRIGGER team_tasks_points_follow AFTER INSERT OR UPDATE OF status ON public.team_tasks
FOR EACH ROW EXECUTE FUNCTION public.team_tasks_points_follow();

-- ---------------------------------------------------------------- reviews (leads / auditors)
-- Quality: "no remarks" earns the quality bonus (+ page_manager's excellence). Allowed even when the
-- task was excluded for lateness. The reviewer cannot review their own task.
CREATE OR REPLACE FUNCTION public.points_review_quality(p_task_id uuid, p_no_remarks boolean, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.team_tasks;
  s public.points_settings;
  v_user uuid;
  v_exc int;
BEGIN
  IF NOT (public.team_is_lead() OR public.team_has_role('auditor')) THEN
    RAISE EXCEPTION 'مراجعة الجودة للرئيس والمشرف والمدقق فقط';
  END IF;
  SELECT * INTO t FROM public.team_tasks WHERE id = p_task_id FOR UPDATE;
  IF t.id IS NULL OR t.status <> 'done' THEN RAISE EXCEPTION 'راجع مهمة منجزة فقط'; END IF;
  IF t.points IS NULL OR public.team_task_is_special(t.title, t.extra_requirements) THEN
    RAISE EXCEPTION 'هذه المهمة خارج نظام النقاط';
  END IF;
  v_user := coalesce(t.completed_by, t.assignee_user_id);
  IF v_user = auth.uid() THEN RAISE EXCEPTION 'لا يمكنك مراجعة مهمتك'; END IF;
  IF t.quality_status IS NOT NULL THEN RAISE EXCEPTION 'رُوجعت هذه المهمة مسبقاً'; END IF;

  UPDATE public.team_tasks
  SET quality_status = CASE WHEN p_no_remarks THEN 'no_remarks' ELSE 'remarks' END,
      quality_note = nullif(btrim(p_note), ''), quality_by = auth.uid(), quality_at = now()
  WHERE id = t.id;

  IF p_no_remarks THEN
    SELECT * INTO s FROM public.points_settings WHERE id;
    PERFORM public.points_award(v_user, t.id, 'quality', s.quality, format('جودة بلا ملاحظات: %s', left(t.title, 80)), auth.uid());
    v_exc := coalesce((s.role_excellence ->> 'page_manager')::int, 0);
    IF t.assignee_role = 'page_manager' AND v_exc > 0
       AND NOT EXISTS (SELECT 1 FROM public.points_ledger WHERE team_task_id = t.id AND kind = 'excluded') THEN
      PERFORM public.points_award(v_user, t.id, 'excellence', v_exc, 'تميّز مسؤول الصفحة: عمل بلا ملاحظات', auth.uid());
    END IF;
  END IF;
END $$;

-- Rescue: a member who helped finish a late task (overdue now, or completed after its due time).
CREATE OR REPLACE FUNCTION public.points_award_rescue(p_task_id uuid, p_helper uuid, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.team_tasks;
  s public.points_settings;
BEGIN
  IF NOT public.team_is_lead() THEN RAISE EXCEPTION 'منح نقاط الإنقاذ للرئيس والمشرف فقط'; END IF;
  SELECT * INTO t FROM public.team_tasks WHERE id = p_task_id;
  IF t.id IS NULL OR t.points IS NULL OR public.team_task_is_special(t.title, t.extra_requirements) THEN
    RAISE EXCEPTION 'هذه المهمة خارج نظام النقاط';
  END IF;
  IF t.due_at IS NULL OR coalesce(t.completed_at, now()) <= t.due_at THEN
    RAISE EXCEPTION 'الإنقاذ لمهمة متأخرة فقط';
  END IF;
  IF p_helper IS NULL OR p_helper = coalesce(t.completed_by, t.assignee_user_id) THEN
    RAISE EXCEPTION 'اختر زميلاً غير صاحب المهمة';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.team_members m WHERE m.user_id = p_helper AND m.role NOT IN ('principal', 'supervisor')) THEN
    RAISE EXCEPTION 'المساعد ليس عضواً في الفريق';
  END IF;
  IF EXISTS (SELECT 1 FROM public.points_ledger WHERE team_task_id = t.id AND user_id = p_helper AND kind = 'rescue') THEN
    RAISE EXCEPTION 'مُنحت نقاط الإنقاذ لهذا الزميل مسبقاً';
  END IF;
  SELECT * INTO s FROM public.points_settings WHERE id;
  PERFORM public.points_award(p_helper, t.id, 'rescue', s.rescue,
    format('إنقاذ مهمة متأخرة: %s%s', left(t.title, 80), coalesce(' — ' || nullif(btrim(p_note), ''), '')), auth.uid());
END $$;

-- ---------------------------------------------------------------- principal: adjust / edit
CREATE OR REPLACE FUNCTION public.points_adjust(p_user uuid, p_points int, p_reason text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.team_has_role('principal') THEN RAISE EXCEPTION 'التعديل اليدوي للرئيس فقط'; END IF;
  IF coalesce(p_points, 0) = 0 THEN RAISE EXCEPTION 'اكتب عدد نقاط غير صفر'; END IF;
  IF length(btrim(coalesce(p_reason, ''))) < 3 THEN RAISE EXCEPTION 'اكتب سبب التعديل'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.team_members m WHERE m.user_id = p_user) THEN
    RAISE EXCEPTION 'العضو غير موجود في الفريق';
  END IF;
  INSERT INTO public.points_ledger (user_id, kind, points, reason, created_by)
  VALUES (p_user, 'manual', p_points, btrim(p_reason), auth.uid())
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;

-- Change the points of any entry (automatic ones included); the reason is appended to the entry.
CREATE OR REPLACE FUNCTION public.points_edit_entry(p_id uuid, p_points int, p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.team_has_role('principal') THEN RAISE EXCEPTION 'تعديل النقاط للرئيس فقط'; END IF;
  IF length(btrim(coalesce(p_reason, ''))) < 3 THEN RAISE EXCEPTION 'اكتب سبب التعديل'; END IF;
  UPDATE public.points_ledger
  SET points = p_points,
      reason = left(reason || ' · تعديل: ' || btrim(p_reason), 500),
      edited_by = auth.uid(), edited_at = now()
  WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الحركة غير موجودة'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.points_delete_entry(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.team_has_role('principal') THEN RAISE EXCEPTION 'حذف الحركات للرئيس فقط'; END IF;
  DELETE FROM public.points_ledger WHERE id = p_id;
END $$;

-- ---------------------------------------------------------------- fairness: leaderboard
CREATE OR REPLACE FUNCTION public.points_leaderboard()
RETURNS TABLE (
  user_id uuid, display_name text, roles text[], total int, earned int, available int,
  tasks_counted int, perf_index numeric, rank int
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH s AS (SELECT * FROM public.points_settings WHERE id),
  people AS (
    SELECT m.user_id, (array_agg(m.display_name ORDER BY m.created_at))[1] AS display_name,
           array_agg(DISTINCT m.role) AS roles
    FROM public.team_members m
    WHERE m.role NOT IN ('principal', 'supervisor')
    GROUP BY m.user_id
  ),
  avail AS (
    -- done tasks, and overdue ones still open (their points were missed), each worth value + on time
    SELECT coalesce(t.completed_by, t.assignee_user_id) AS user_id,
           sum(t.points + (SELECT on_time FROM s))::int AS available, count(*)::int AS tasks_counted
    FROM public.team_tasks t
    WHERE t.points IS NOT NULL AND NOT public.team_task_is_special(t.title, t.extra_requirements)
      AND (t.status = 'done' OR (t.due_at IS NOT NULL AND t.due_at < now()))
      AND coalesce(t.completed_by, t.assignee_user_id) IS NOT NULL
    GROUP BY 1
  ),
  led AS (
    SELECT l.user_id, sum(l.points)::int AS total,
           coalesce(sum(l.points) FILTER (WHERE l.kind <> 'manual'), 0)::int AS earned
    FROM public.points_ledger l GROUP BY 1
  ),
  board AS (
    SELECT p.user_id, p.display_name, p.roles,
           coalesce(led.total, 0) AS total, coalesce(led.earned, 0) AS earned,
           coalesce(a.available, 0) AS available, coalesce(a.tasks_counted, 0) AS tasks_counted,
           CASE WHEN coalesce(a.available, 0) > 0
                THEN round(greatest(0, coalesce(led.earned, 0)) * 100.0 / a.available, 1) END AS perf_index
    FROM people p
    LEFT JOIN avail a ON a.user_id = p.user_id
    LEFT JOIN led ON led.user_id = p.user_id
  )
  SELECT b.*, (rank() OVER (ORDER BY b.perf_index DESC NULLS LAST, b.total DESC))::int
  FROM board b
  WHERE public.team_is_member()
  ORDER BY 9, b.display_name
$$;

-- ---------------------------------------------------------------- RLS
ALTER TABLE public.points_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.points_settings, public.points_ledger FROM anon;

DROP POLICY IF EXISTS "members read points rules" ON public.points_settings;
CREATE POLICY "members read points rules" ON public.points_settings
  FOR SELECT TO authenticated USING (public.team_is_member());
DROP POLICY IF EXISTS "principal edits points rules" ON public.points_settings;
CREATE POLICY "principal edits points rules" ON public.points_settings
  FOR UPDATE TO authenticated USING (public.team_has_role('principal')) WITH CHECK (public.team_has_role('principal'));

-- Writes go through the scoring trigger and the RPCs above only.
DROP POLICY IF EXISTS "own ledger, everything for leads" ON public.points_ledger;
CREATE POLICY "own ledger, everything for leads" ON public.points_ledger
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.team_is_lead());

CREATE OR REPLACE FUNCTION public.points_settings_touch()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS points_settings_touch ON public.points_settings;
CREATE TRIGGER points_settings_touch BEFORE UPDATE ON public.points_settings
FOR EACH ROW EXECUTE FUNCTION public.points_settings_touch();

-- ---------------------------------------------------------------- grants
REVOKE EXECUTE ON FUNCTION
  public.team_task_is_special(text, text[]), public.points_role_base(text), public.team_tasks_default_points(),
  public.points_days_late(timestamptz, timestamptz), public.points_award(uuid, uuid, text, int, text, uuid),
  public.points_score_task(uuid), public.team_tasks_points_follow(), public.points_settings_touch(),
  public.points_review_quality(uuid, boolean, text), public.points_award_rescue(uuid, uuid, text),
  public.points_adjust(uuid, int, text), public.points_edit_entry(uuid, int, text), public.points_delete_entry(uuid),
  public.points_leaderboard()
  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.points_award(uuid, uuid, text, int, text, uuid), public.points_score_task(uuid)
  FROM authenticated;
GRANT EXECUTE ON FUNCTION
  public.team_task_is_special(text, text[]), public.points_role_base(text), public.points_days_late(timestamptz, timestamptz),
  public.points_review_quality(uuid, boolean, text), public.points_award_rescue(uuid, uuid, text),
  public.points_adjust(uuid, int, text), public.points_edit_entry(uuid, int, text), public.points_delete_entry(uuid),
  public.points_leaderboard()
  TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.points_ledger;
