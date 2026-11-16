-- Bridge projects, part 2: one agent per project + a live preview ("Local View").
--
-- * agent_only: a project can be locked to one agent (e.g. 'antigravity'), so everything done on it
--   goes through that agent and we know what each person works on. web-terminal-exec enforces it
--   (no other agent, no raw shell); 'submit' for approval stays allowed.
-- * preview_*: when preview_enabled, the bridge runs the project's dev server on the principal's computer
--   and opens a Cloudflare quick tunnel to it; it reports the public https://*.trycloudflare.com link here
--   (bridge_project_preview, device-signed). /terminal shows it in a small live window to whoever may
--   see the project. Only the bridge can set the link.

ALTER TABLE public.bridge_projects
  ADD COLUMN IF NOT EXISTS agent_only text CHECK (agent_only IS NULL OR agent_only IN ('antigravity', 'claude')),
  ADD COLUMN IF NOT EXISTS preview_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS preview_url text CHECK (preview_url IS NULL OR preview_url ~ '^https://[a-z0-9-]+\.trycloudflare\.com$'),
  ADD COLUMN IF NOT EXISTS preview_status text CHECK (preview_status IS NULL OR length(preview_status) <= 500),
  ADD COLUMN IF NOT EXISTS preview_updated_at timestamptz;

-- people (not the bridge) cannot write the preview link/status
CREATE OR REPLACE FUNCTION public.bridge_projects_keep_preview()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user = 'authenticated' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.preview_url := NULL; NEW.preview_status := NULL; NEW.preview_updated_at := NULL;
    ELSE
      NEW.preview_url := OLD.preview_url; NEW.preview_status := OLD.preview_status; NEW.preview_updated_at := OLD.preview_updated_at;
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS bridge_projects_keep_preview ON public.bridge_projects;
CREATE TRIGGER bridge_projects_keep_preview BEFORE INSERT OR UPDATE ON public.bridge_projects
  FOR EACH ROW EXECUTE FUNCTION public.bridge_projects_keep_preview();

-- The bridge reports the preview of a project it set up (signed with the device key).
CREATE OR REPLACE FUNCTION public.bridge_project_preview(
  p_device_id uuid, p_auth_key text, p_slug text, p_url text, p_status text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  IF p_url IS NOT NULL AND p_url !~ '^https://[a-z0-9-]+\.trycloudflare\.com$' THEN
    RAISE EXCEPTION 'bad preview url';
  END IF;
  UPDATE public.bridge_projects
  SET preview_url = p_url, preview_status = left(p_status, 500), preview_updated_at = now()
  WHERE slug = p_slug AND preview_enabled AND (device_id IS NULL OR device_id = p_device_id);
END $$;
REVOKE EXECUTE ON FUNCTION public.bridge_project_preview(uuid, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_project_preview(uuid, text, text, text, text) TO anon, authenticated;

-- the bridge needs to know which of its projects want a preview
CREATE OR REPLACE FUNCTION public.bridge_preview_projects(p_device_id uuid, p_auth_key text)
RETURNS TABLE (slug text, name text) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  RETURN QUERY SELECT p.slug, p.name FROM public.bridge_projects p
    WHERE p.preview_enabled AND p.status = 'ready' AND (p.device_id IS NULL OR p.device_id = p_device_id);
END $$;
REVOKE EXECUTE ON FUNCTION public.bridge_preview_projects(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_preview_projects(uuid, text) TO anon, authenticated;
