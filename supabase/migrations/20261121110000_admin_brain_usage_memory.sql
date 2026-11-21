-- Central brain upgrade:
--  * ai_usage_log: every AI call the platform pays for (tokens, characters, estimated USD), so the
--    admin can see what the AI costs per day / month and per provider.
--  * admin_brain_memory: facts and preferences the admin asks the central brain to remember.
-- Both are written by Edge Functions with the service role; only platform admins can read them.

CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id bigserial PRIMARY KEY,
  fn text NOT NULL,                 -- edge function, e.g. admin-brain
  kind text NOT NULL DEFAULT 'chat',-- chat | tts
  provider text,
  model text,
  tokens_in integer NOT NULL DEFAULT 0,
  tokens_out integer NOT NULL DEFAULT 0,
  chars integer NOT NULL DEFAULT 0,
  cost_usd numeric(12, 6) NOT NULL DEFAULT 0, -- estimate from list prices
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_usage_log_created_idx ON public.ai_usage_log (created_at DESC);
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_usage_log_admin_read ON public.ai_usage_log;
CREATE POLICY ai_usage_log_admin_read ON public.ai_usage_log FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.admin_brain_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fact text NOT NULL CHECK (length(fact) BETWEEN 2 AND 500),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_brain_memory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_brain_memory_admin ON public.admin_brain_memory;
CREATE POLICY admin_brain_memory_admin ON public.admin_brain_memory FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
