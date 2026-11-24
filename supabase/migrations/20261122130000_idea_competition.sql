-- «مسابقة الأفكار» على مستوى المديرية: أي زائر يسجّل فكرته (الاسم، الرقم، المدرسة، المجال، الفكرة).
-- الزوار لا يقرؤون الجدول أبداً؛ التسجيل عبر دالة تتحقق من المدخلات وتحدّ من التكرار، والقراءة للأدمن فقط.
CREATE TABLE IF NOT EXISTS public.idea_competition_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_no serial,
  full_name text NOT NULL CHECK (length(btrim(full_name)) BETWEEN 3 AND 80),
  phone text NOT NULL CHECK (phone ~ '^07[789][0-9]{7}$'),
  school text NOT NULL CHECK (length(btrim(school)) BETWEEN 3 AND 120),
  category text NOT NULL CHECK (category IN
    ('environment', 'technology', 'science', 'literature', 'culture', 'arts', 'business', 'other')),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 3 AND 120),
  idea text NOT NULL CHECK (length(btrim(idea)) BETWEEN 20 AND 3000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'shortlisted', 'winner', 'rejected')),
  admin_note text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idea_competition_entries_phone_idx ON public.idea_competition_entries (phone, created_at);
CREATE INDEX IF NOT EXISTS idea_competition_entries_created_idx ON public.idea_competition_entries (created_at DESC);

ALTER TABLE public.idea_competition_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.idea_competition_entries FROM anon;
DROP POLICY IF EXISTS idea_competition_admin ON public.idea_competition_entries;
CREATE POLICY idea_competition_admin ON public.idea_competition_entries FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- Registration: validates, normalises the phone, caps 3 ideas per phone and 300 per hour overall.
CREATE OR REPLACE FUNCTION public.idea_competition_submit(
  p_name text, p_phone text, p_school text, p_category text, p_title text, p_idea text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_phone text := regexp_replace(translate(coalesce(p_phone, ''), '٠١٢٣٤٥٦٧٨٩', '0123456789'), '[^0-9]', '', 'g');
  v_ref int;
BEGIN
  IF v_phone LIKE '9627%' THEN v_phone := '0' || substr(v_phone, 4); END IF;
  IF v_phone ~ '^7[789][0-9]{7}$' THEN v_phone := '0' || v_phone; END IF;
  IF v_phone !~ '^07[789][0-9]{7}$' THEN RETURN jsonb_build_object('ok', false, 'error', 'phone'); END IF;
  IF length(btrim(coalesce(p_name, ''))) < 3 THEN RETURN jsonb_build_object('ok', false, 'error', 'name'); END IF;
  IF length(btrim(coalesce(p_school, ''))) < 3 THEN RETURN jsonb_build_object('ok', false, 'error', 'school'); END IF;
  IF length(btrim(coalesce(p_title, ''))) < 3 THEN RETURN jsonb_build_object('ok', false, 'error', 'title'); END IF;
  IF length(btrim(coalesce(p_idea, ''))) < 20 THEN RETURN jsonb_build_object('ok', false, 'error', 'idea'); END IF;
  IF p_category NOT IN ('environment', 'technology', 'science', 'literature', 'culture', 'arts', 'business', 'other') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'category');
  END IF;
  IF (SELECT count(*) FROM idea_competition_entries WHERE phone = v_phone) >= 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'limit');
  END IF;
  IF (SELECT count(*) FROM idea_competition_entries WHERE created_at > now() - interval '1 hour') >= 300 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'busy');
  END IF;

  INSERT INTO idea_competition_entries (full_name, phone, school, category, title, idea, user_id)
  VALUES (left(btrim(p_name), 80), v_phone, left(btrim(p_school), 120), p_category,
          left(btrim(p_title), 120), left(btrim(p_idea), 3000), auth.uid())
  RETURNING ref_no INTO v_ref;
  RETURN jsonb_build_object('ok', true, 'ref', v_ref);
END $$;

REVOKE ALL ON FUNCTION public.idea_competition_submit(text, text, text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.idea_competition_submit(text, text, text, text, text, text) TO anon, authenticated;
