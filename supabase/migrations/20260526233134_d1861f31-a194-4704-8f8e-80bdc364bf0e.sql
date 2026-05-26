
-- Parent contact + improvement tracking
ALTER TABLE public.autism_child_profiles
  ADD COLUMN IF NOT EXISTS parent_email TEXT,
  ADD COLUMN IF NOT EXISTS parent_phone TEXT;

ALTER TABLE public.autism_day_reports
  ADD COLUMN IF NOT EXISTS improvement_by_game JSONB DEFAULT '{}'::jsonb;

-- Email log for autism reports
CREATE TABLE IF NOT EXISTS public.autism_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID,
  user_id UUID,
  recipient_email TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('session','daily','weekly')),
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_message_id TEXT,
  error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.autism_email_log TO authenticated;
GRANT ALL ON public.autism_email_log TO service_role;

ALTER TABLE public.autism_email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own email log"
  ON public.autism_email_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users insert own email log"
  ON public.autism_email_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
