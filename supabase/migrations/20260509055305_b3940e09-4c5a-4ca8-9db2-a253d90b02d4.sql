
-- Manual overrides for sign-language gesture vocabulary, per spoken language.
-- A super admin can edit translations and these win over AI-translated cache.
CREATE TABLE IF NOT EXISTS public.sign_vocab_overrides (
  lang_code TEXT PRIMARY KEY,
  vocab JSONB NOT NULL,
  notes TEXT,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sign_vocab_overrides ENABLE ROW LEVEL SECURITY;

-- Public read so the translator hook can use overrides for any visitor
CREATE POLICY "Anyone can read sign vocab overrides"
  ON public.sign_vocab_overrides
  FOR SELECT
  USING (true);

-- Only admin/super-admin teachers can write
CREATE POLICY "Admins can insert sign vocab overrides"
  ON public.sign_vocab_overrides
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_admin_teacher_access(auth.uid()));

CREATE POLICY "Admins can update sign vocab overrides"
  ON public.sign_vocab_overrides
  FOR UPDATE
  TO authenticated
  USING (public.has_admin_teacher_access(auth.uid()));

CREATE POLICY "Admins can delete sign vocab overrides"
  ON public.sign_vocab_overrides
  FOR DELETE
  TO authenticated
  USING (public.has_admin_teacher_access(auth.uid()));

CREATE TRIGGER trg_sign_vocab_overrides_updated_at
  BEFORE UPDATE ON public.sign_vocab_overrides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Lightweight bus to broadcast a global vocab cache version, so deploying
-- a new dictionary or admin edit invalidates every client's cache instantly.
CREATE TABLE IF NOT EXISTS public.sign_vocab_version (
  id INT PRIMARY KEY DEFAULT 1,
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton_row CHECK (id = 1)
);

INSERT INTO public.sign_vocab_version (id, version)
VALUES (1, 1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.sign_vocab_version ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sign vocab version"
  ON public.sign_vocab_version FOR SELECT USING (true);

CREATE POLICY "Admins can bump sign vocab version"
  ON public.sign_vocab_version FOR UPDATE
  TO authenticated
  USING (public.has_admin_teacher_access(auth.uid()));
