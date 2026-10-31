-- Emergency rollback for 20261101170000_rls_lockdown_admin_managed.sql (restores the previous, insecure state)
CREATE POLICY "Public access for admin_audit_logs" ON public.admin_audit_logs AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can insert audit logs" ON public.admin_audit_logs AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can read audit logs" ON public.admin_audit_logs AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Public access for school_broadcasts" ON public.school_broadcasts AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete broadcasts" ON public.school_broadcasts AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY "Anyone can insert broadcasts" ON public.school_broadcasts AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update broadcasts" ON public.school_broadcasts AS PERMISSIVE FOR UPDATE TO public USING (true);
CREATE POLICY "Public access for institutional_partnerships" ON public.institutional_partnerships AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "anyone can delete doctor surveys" ON public.damij_doctor_surveys AS PERMISSIVE FOR DELETE TO public USING (true);
CREATE POLICY "anyone can read doctor surveys" ON public.damij_doctor_surveys AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public access for subject_puzzles" ON public.subject_puzzles AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for subject_puzzles" ON public.subject_puzzles AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Only admins can delete subject puzzles" ON public.subject_puzzles AS PERMISSIVE FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can insert subject puzzles" ON public.subject_puzzles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public access for community_forum_messages" ON public.community_forum_messages AS PERMISSIVE FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete community messages" ON public.community_forum_messages AS PERMISSIVE FOR DELETE TO public USING (true);
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Admins can write audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Admins can manage broadcasts" ON public.school_broadcasts;
DROP POLICY IF EXISTS "Anyone can submit a partnership application" ON public.institutional_partnerships;
DROP POLICY IF EXISTS "Admins can manage partnership applications" ON public.institutional_partnerships;
DROP POLICY IF EXISTS "Admins can read doctor surveys" ON public.damij_doctor_surveys;
DROP POLICY IF EXISTS "Admins can delete doctor surveys" ON public.damij_doctor_surveys;
DROP POLICY IF EXISTS "Admins can manage subject puzzles" ON public.subject_puzzles;
DROP POLICY IF EXISTS "Admins can delete community messages" ON public.community_forum_messages;
DROP TRIGGER IF EXISTS guard_community_forum_message ON public.community_forum_messages;
DROP FUNCTION IF EXISTS public.guard_community_forum_message();
-- is_platform_admin() before this migration (admin_teacher_access only)
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_teacher_access WHERE user_id = _user_id AND access_level IN ('admin', 'super_admin'));
$$;
