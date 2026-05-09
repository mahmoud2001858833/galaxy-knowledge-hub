
CREATE TABLE IF NOT EXISTS public.sign_dictionary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  word_normalized TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ArSL','ASL')),
  video_url TEXT,
  image_url TEXT,
  description TEXT,
  handshape TEXT,
  movement TEXT,
  hands_count SMALLINT DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (language, word_normalized)
);

CREATE INDEX IF NOT EXISTS idx_sign_dictionary_lang_word ON public.sign_dictionary (language, word_normalized);

ALTER TABLE public.sign_dictionary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sign_dictionary public read"
  ON public.sign_dictionary FOR SELECT
  USING (true);

CREATE POLICY "sign_dictionary admin insert"
  ON public.sign_dictionary FOR INSERT
  WITH CHECK (public.has_admin_teacher_access(auth.uid()));

CREATE POLICY "sign_dictionary admin update"
  ON public.sign_dictionary FOR UPDATE
  USING (public.has_admin_teacher_access(auth.uid()));

CREATE POLICY "sign_dictionary admin delete"
  ON public.sign_dictionary FOR DELETE
  USING (public.has_admin_teacher_access(auth.uid()));

CREATE TRIGGER trg_sign_dictionary_updated_at
  BEFORE UPDATE ON public.sign_dictionary
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO storage.buckets (id, name, public)
VALUES ('sign-language-media', 'sign-language-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "sign media public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sign-language-media');

CREATE POLICY "sign media admin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sign-language-media' AND public.has_admin_teacher_access(auth.uid()));

CREATE POLICY "sign media admin update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'sign-language-media' AND public.has_admin_teacher_access(auth.uid()));

CREATE POLICY "sign media admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'sign-language-media' AND public.has_admin_teacher_access(auth.uid()));
