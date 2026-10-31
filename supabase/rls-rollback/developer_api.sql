-- Emergency rollback for 20261101150000_rls_lockdown_developer_api.sql (restores the insecure state)
CREATE POLICY "Anyone can insert api keys" ON public.developer_api_keys FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read api keys" ON public.developer_api_keys FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update api keys" ON public.developer_api_keys FOR UPDATE TO public USING (true);
CREATE POLICY "Public access for developer_api_keys" ON public.developer_api_keys FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can insert logs" ON public.developer_api_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read logs" ON public.developer_api_logs FOR SELECT TO public USING (true);
CREATE POLICY "Public access for developer_api_logs" ON public.developer_api_logs FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
