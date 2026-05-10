DROP POLICY IF EXISTS "reports public via token" ON public.clinical_reports;
DROP POLICY IF EXISTS "share_read_adr_adhd" ON public.adhd_diagnostic_reports;
DROP POLICY IF EXISTS "share_read_ap_adhd" ON public.adhd_programs;
DROP POLICY IF EXISTS "public_read_adr2_adhd" ON public.adhd_day_reports;
DROP POLICY IF EXISTS "public_read_apd_adhd" ON public.adhd_program_days;
DROP POLICY IF EXISTS "public_read_apg_adhd" ON public.adhd_program_games;
DROP POLICY IF EXISTS "public by share" ON public.autism_programs;
DROP POLICY IF EXISTS "public read reports" ON public.autism_day_reports;
DROP POLICY IF EXISTS "public read days" ON public.autism_program_days;
DROP POLICY IF EXISTS "public read games" ON public.autism_program_games;

DROP POLICY IF EXISTS "يمكن للمستخدمين رؤية المحادثات ال" ON public.private_chats;
DROP POLICY IF EXISTS "Chat participants can view their private chats" ON public.private_chats;
CREATE POLICY "Chat participants can view their private chats"
ON public.private_chats
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.private_chat_participants p
    WHERE p.chat_id = private_chats.id
      AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can read all profiles" ON public.users_profiles;
DROP POLICY IF EXISTS "Authenticated users can read user directory profiles" ON public.users_profiles;
CREATE POLICY "Authenticated users can read user directory profiles"
ON public.users_profiles
FOR SELECT
TO authenticated
USING (true);

UPDATE public.users_profiles
SET username = 'user_' || substring(id::text, 1, 8)
WHERE username ILIKE '%@%';

CREATE OR REPLACE FUNCTION public.get_public_clinical_report(p_token text)
RETURNS TABLE (
  id uuid,
  score numeric,
  diagnosis_ar text,
  summary_ar text,
  strengths_ar text[],
  weaknesses_ar text[],
  recommendations_ar text[],
  references_ar text[],
  rubric jsonb,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.score, r.diagnosis_ar, r.summary_ar, r.strengths_ar, r.weaknesses_ar,
         r.recommendations_ar, r.references_ar, r.rubric, r.created_at
  FROM public.clinical_reports r
  WHERE p_token ~ '^[a-f0-9]{24}$'
    AND r.share_token = p_token
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_public_adhd_diagnostic_report(p_token text)
RETURNS TABLE (
  id uuid,
  metrics jsonb,
  ai_report text,
  recommendations jsonb,
  dsm_category text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.metrics, r.ai_report, r.recommendations, r.dsm_category, r.created_at
  FROM public.adhd_diagnostic_reports r
  WHERE p_token ~ '^[a-f0-9]{24}$'
    AND r.share_token = p_token
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_public_autism_program(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_program public.autism_programs%ROWTYPE;
  v_days jsonb;
  v_reports jsonb;
BEGIN
  IF p_token IS NULL OR p_token !~ '^[a-f0-9]{24}$' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_program FROM public.autism_programs WHERE share_token = p_token LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', d.id, 'day_index', d.day_index, 'theme_ar', d.theme_ar,
    'focus_skill_ar', d.focus_skill_ar, 'rationale_ar', d.rationale_ar,
    'created_at', d.created_at
  ) ORDER BY d.day_index), '[]'::jsonb)
  INTO v_days
  FROM public.autism_program_days d
  WHERE d.program_id = v_program.id;

  SELECT COALESCE(jsonb_object_agg(r.day_id::text, jsonb_build_object(
    'id', r.id, 'day_id', r.day_id, 'score', r.score,
    'summary_ar', r.summary_ar, 'strengths_ar', r.strengths_ar,
    'weaknesses_ar', r.weaknesses_ar, 'recommendations_ar', r.recommendations_ar,
    'generated_at', r.generated_at
  )), '{}'::jsonb)
  INTO v_reports
  FROM public.autism_day_reports r
  WHERE r.day_id IN (SELECT d.id FROM public.autism_program_days d WHERE d.program_id = v_program.id);

  RETURN jsonb_build_object(
    'program', jsonb_build_object(
      'id', v_program.id, 'title_ar', v_program.title_ar, 'summary_ar', v_program.summary_ar,
      'total_days', v_program.total_days, 'start_date', v_program.start_date,
      'status', v_program.status, 'created_at', v_program.created_at, 'updated_at', v_program.updated_at
    ),
    'days', v_days,
    'reports', v_reports
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_adhd_program(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_program public.adhd_programs%ROWTYPE;
  v_days jsonb;
  v_games jsonb;
BEGIN
  IF p_token IS NULL OR p_token !~ '^[a-f0-9]{24}$' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_program FROM public.adhd_programs WHERE share_token = p_token LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', d.id, 'day_index', d.day_index, 'scheduled_for', d.scheduled_for,
    'status', d.status, 'summary', d.summary, 'created_at', d.created_at
  ) ORDER BY d.day_index), '[]'::jsonb)
  INTO v_days
  FROM public.adhd_program_days d
  WHERE d.program_id = v_program.id;

  SELECT COALESCE(jsonb_object_agg(x.day_id::text, x.games), '{}'::jsonb)
  INTO v_games
  FROM (
    SELECT g.day_id,
           jsonb_agg(jsonb_build_object(
             'id', g.id, 'game_key', g.game_key, 'title', g.title,
             'description', g.description, 'target_metric', g.target_metric,
             'order_index', g.order_index, 'completed', g.completed, 'best_score', g.best_score
           ) ORDER BY g.order_index) AS games
    FROM public.adhd_program_games g
    JOIN public.adhd_program_days d ON d.id = g.day_id
    WHERE d.program_id = v_program.id
    GROUP BY g.day_id
  ) x;

  RETURN jsonb_build_object(
    'program', jsonb_build_object(
      'id', v_program.id, 'child_name', v_program.child_name, 'child_age', v_program.child_age,
      'weeks', v_program.weeks, 'focus_areas', v_program.focus_areas,
      'daily_minutes', v_program.daily_minutes, 'status', v_program.status,
      'ai_plan', v_program.ai_plan, 'created_at', v_program.created_at, 'updated_at', v_program.updated_at
    ),
    'days', v_days,
    'gamesByDay', v_games
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_clinical_report(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_autism_program(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_adhd_program(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_adhd_diagnostic_report(text) TO anon, authenticated;