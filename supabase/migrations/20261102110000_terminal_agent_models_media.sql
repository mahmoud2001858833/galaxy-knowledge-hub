-- Web terminal: the principal picks the model each AI agent uses, and images an agent produces on
-- the principal's computer are uploaded so the terminal page can show them.

-- ---------------------------------------------------------------- models per agent
-- model = an id the bridge reported in bridge_devices.info.models (null = the agent's own default)
CREATE TABLE public.terminal_agent_settings (
  agent text PRIMARY KEY CHECK (agent IN ('claude', 'antigravity')),
  model text CHECK (model IS NULL OR model ~ '^[A-Za-z0-9._:-]{1,80}$'),
  model_label text CHECK (length(model_label) <= 120),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.terminal_agent_settings (agent) VALUES ('claude'), ('antigravity');

ALTER TABLE public.terminal_agent_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.terminal_agent_settings FROM anon;
REVOKE INSERT, DELETE, TRUNCATE ON public.terminal_agent_settings FROM authenticated;
GRANT SELECT, UPDATE (model, model_label) ON public.terminal_agent_settings TO authenticated;
CREATE POLICY "principal reads agent settings" ON public.terminal_agent_settings
  FOR SELECT TO authenticated USING (public.team_has_role('principal'));
CREATE POLICY "principal sets agent models" ON public.terminal_agent_settings
  FOR UPDATE TO authenticated USING (public.team_has_role('principal')) WITH CHECK (public.team_has_role('principal'));

CREATE OR REPLACE FUNCTION public.terminal_agent_settings_stamp()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_by := auth.uid();
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER terminal_agent_settings_stamp BEFORE UPDATE ON public.terminal_agent_settings
FOR EACH ROW EXECUTE FUNCTION public.terminal_agent_settings_stamp();

-- The bridge reads the choice before each job
CREATE OR REPLACE FUNCTION public.bridge_agent_settings(p_device_id uuid, p_auth_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  RETURN (SELECT coalesce(jsonb_object_agg(agent, model), '{}'::jsonb) FROM public.terminal_agent_settings WHERE model IS NOT NULL);
END $$;
REVOKE EXECUTE ON FUNCTION public.bridge_agent_settings(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_agent_settings(uuid, text) TO anon, authenticated;

-- ---------------------------------------------------------------- images from agents
-- Objects live at <bridge job id>/<file>; web-terminal-exec hands the bridge a signed upload URL for
-- a running job of that device. Readable by the job's owner and the principal.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('terminal-media', 'terminal-media', false, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "terminal media: job owner or principal" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'terminal-media'
    AND EXISTS (
      SELECT 1 FROM public.bridge_jobs j
      WHERE j.id::text = (storage.foldername(name))[1]
        AND (j.user_id = auth.uid() OR public.team_has_role('principal'))
    )
  );

GRANT EXECUTE ON FUNCTION public.bridge_device_check(uuid, text) TO service_role;
