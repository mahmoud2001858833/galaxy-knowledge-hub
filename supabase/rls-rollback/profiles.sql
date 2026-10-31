-- Emergency rollback for 20261101130000_rls_lockdown_profiles.sql (restores the insecure state)
CREATE POLICY "Public access for profiles" ON public.profiles AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Only admins can update profiles" ON public.profiles AS PERMISSIVE FOR UPDATE TO public USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = users.id AND (users.raw_user_meta_data ->> 'is_admin') = 'true'));
