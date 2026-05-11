
-- 1) generated_codes: replace USING(true) with explicit is_shared flag
ALTER TABLE public.generated_codes
  ADD COLUMN IF NOT EXISTS is_shared boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Anyone can view shared codes" ON public.generated_codes;

CREATE POLICY "Anyone can view explicitly shared codes"
  ON public.generated_codes
  FOR SELECT
  USING (is_shared = true);

-- 2) builder_app_users: prevent password_hash from being read via API
REVOKE SELECT (password_hash) ON public.builder_app_users FROM anon, authenticated;
