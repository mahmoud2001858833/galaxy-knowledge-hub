-- RLS lockdown: developer_api_keys / developer_api_logs
-- Both tables were fully open to anon (read/insert/update API key hashes and request logs).
-- Neither is referenced by the app or any edge function, and both are empty, so all
-- client access is removed. RLS stays enabled; only the service role can use them.

DROP POLICY IF EXISTS "Anyone can insert api keys" ON public.developer_api_keys;
DROP POLICY IF EXISTS "Anyone can read api keys" ON public.developer_api_keys;
DROP POLICY IF EXISTS "Anyone can update api keys" ON public.developer_api_keys;
DROP POLICY IF EXISTS "Public access for developer_api_keys" ON public.developer_api_keys;
DROP POLICY IF EXISTS "Anyone can insert logs" ON public.developer_api_logs;
DROP POLICY IF EXISTS "Anyone can read logs" ON public.developer_api_logs;
DROP POLICY IF EXISTS "Public access for developer_api_logs" ON public.developer_api_logs;
