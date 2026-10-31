-- Emergency rollback for 20261101120000_rls_lockdown_admin_teacher_access.sql
-- WARNING: restores the insecure state (anon can grant itself super_admin). Use only to unbreak prod briefly.
CREATE POLICY "Public access for admin_teacher_access" ON public.admin_teacher_access AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow select all for admin_teacher_access" ON public.admin_teacher_access AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE TRIGGER on_auth_user_created_grant_access AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.grant_admin_access_on_signup();
