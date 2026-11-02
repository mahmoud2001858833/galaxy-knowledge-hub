-- Rollback for 20261102110000_terminal_agent_models_media.sql
DROP POLICY IF EXISTS "terminal media: job owner or principal" ON storage.objects;
-- empty the bucket from the dashboard (or storage API) before deleting it
DELETE FROM storage.buckets WHERE id = 'terminal-media';
DROP FUNCTION IF EXISTS public.bridge_agent_settings(uuid, text);
DROP TABLE IF EXISTS public.terminal_agent_settings;
DROP FUNCTION IF EXISTS public.terminal_agent_settings_stamp();
REVOKE EXECUTE ON FUNCTION public.bridge_device_check(uuid, text) FROM service_role;
