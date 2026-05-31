-- Emergency contacts table
CREATE TABLE public.blind_eye_emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blind_eye_emergency_contacts TO authenticated;
GRANT ALL ON public.blind_eye_emergency_contacts TO service_role;

ALTER TABLE public.blind_eye_emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own emergency contacts"
  ON public.blind_eye_emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own emergency contacts"
  ON public.blind_eye_emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own emergency contacts"
  ON public.blind_eye_emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own emergency contacts"
  ON public.blind_eye_emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_bec_updated_at
  BEFORE UPDATE ON public.blind_eye_emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_bec_user ON public.blind_eye_emergency_contacts(user_id);

-- User preferences table
CREATE TABLE public.blind_eye_user_prefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  walking_speed TEXT NOT NULL DEFAULT 'normal',
  preferred_ear TEXT NOT NULL DEFAULT 'both',
  detail_level TEXT NOT NULL DEFAULT 'balanced',
  haptics_enabled BOOLEAN NOT NULL DEFAULT true,
  disclaimer_accepted BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blind_eye_user_prefs TO authenticated;
GRANT ALL ON public.blind_eye_user_prefs TO service_role;

ALTER TABLE public.blind_eye_user_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own prefs"
  ON public.blind_eye_user_prefs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own prefs"
  ON public.blind_eye_user_prefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prefs"
  ON public.blind_eye_user_prefs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_beup_updated_at
  BEFORE UPDATE ON public.blind_eye_user_prefs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();