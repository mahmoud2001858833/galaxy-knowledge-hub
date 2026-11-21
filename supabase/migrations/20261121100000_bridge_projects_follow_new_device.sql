-- A project belongs to the computer that set it up (bridge_projects.device_id). Re-pairing creates a new
-- device and revokes the old one, which left the project tied to the revoked device: the new bridge
-- no longer saw it (no live preview, no setup). Projects now follow the newest active device whenever
-- a device is added or revoked.
CREATE OR REPLACE FUNCTION public.bridge_projects_follow_active_device()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_active uuid;
BEGIN
  SELECT id INTO v_active FROM public.bridge_devices
   WHERE NOT revoked ORDER BY created_at DESC LIMIT 1;
  IF v_active IS NULL THEN RETURN NULL; END IF;
  UPDATE public.bridge_projects p SET device_id = v_active
   WHERE p.device_id IS DISTINCT FROM v_active
     AND p.device_id IN (SELECT id FROM public.bridge_devices WHERE revoked);
  RETURN NULL;
END $$;

REVOKE EXECUTE ON FUNCTION public.bridge_projects_follow_active_device() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS bridge_devices_projects_follow ON public.bridge_devices;
CREATE TRIGGER bridge_devices_projects_follow
AFTER INSERT OR UPDATE OF revoked ON public.bridge_devices
FOR EACH STATEMENT EXECUTE FUNCTION public.bridge_projects_follow_active_device();
