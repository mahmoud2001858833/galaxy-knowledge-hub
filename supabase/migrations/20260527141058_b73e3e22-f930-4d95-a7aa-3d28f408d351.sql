
CREATE TABLE public.damij_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'caregiver',
  preferred_lang text NOT NULL DEFAULT 'ar',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT damij_users_role_check CHECK (role IN ('caregiver','therapist','teacher','self','other'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.damij_users TO authenticated;
GRANT ALL ON public.damij_users TO service_role;
ALTER TABLE public.damij_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "damij_users_select_own" ON public.damij_users FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "damij_users_insert_own" ON public.damij_users FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "damij_users_update_own" ON public.damij_users FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "damij_users_delete_own" ON public.damij_users FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER damij_users_set_updated_at BEFORE UPDATE ON public.damij_users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.damij_translation_cache (
  source_text text NOT NULL,
  lang text NOT NULL,
  translated text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source_text, lang)
);
GRANT SELECT ON public.damij_translation_cache TO anon, authenticated;
GRANT ALL ON public.damij_translation_cache TO service_role;
ALTER TABLE public.damij_translation_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "damij_translation_cache_public_read" ON public.damij_translation_cache FOR SELECT TO anon, authenticated USING (true);
