-- RLS lockdown: tables managed from the admin control hub / Damij results page
-- These pages used to unlock with passwords hardcoded in the JS bundle and then wrote with
-- the anon key, so the tables were left writable by anyone. The pages now require a real
-- login as platform admin, and the tables are locked to match.

-- Admins live in two systems: admin_teacher_access (admin/super_admin) and user_roles
-- (app_role 'admin'). Accept either so no current admin loses access.
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_teacher_access
    WHERE user_id = _user_id AND access_level IN ('admin', 'super_admin')
  ) OR public.has_role(_user_id, 'admin'::app_role);
$$;

-- admin_audit_logs: written and read only by the moderation tools
DROP POLICY IF EXISTS "Public access for admin_audit_logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Public can read audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can read audit logs" ON public.admin_audit_logs
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins can write audit logs" ON public.admin_audit_logs
  FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin(auth.uid()));

-- school_broadcasts: readable by everyone, managed by admins
DROP POLICY IF EXISTS "Public access for school_broadcasts" ON public.school_broadcasts;
DROP POLICY IF EXISTS "Anyone can delete broadcasts" ON public.school_broadcasts;
DROP POLICY IF EXISTS "Anyone can insert broadcasts" ON public.school_broadcasts;
DROP POLICY IF EXISTS "Anyone can update broadcasts" ON public.school_broadcasts;
CREATE POLICY "Admins can manage broadcasts" ON public.school_broadcasts
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- institutional_partnerships: public application form; admins review
DROP POLICY IF EXISTS "Public access for institutional_partnerships" ON public.institutional_partnerships;
CREATE POLICY "Anyone can submit a partnership application" ON public.institutional_partnerships
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage partnership applications" ON public.institutional_partnerships
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- damij_doctor_surveys: public survey submission; results for admins only
DROP POLICY IF EXISTS "anyone can delete doctor surveys" ON public.damij_doctor_surveys;
DROP POLICY IF EXISTS "anyone can read doctor surveys" ON public.damij_doctor_surveys;
CREATE POLICY "Admins can read doctor surveys" ON public.damij_doctor_surveys
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins can delete doctor surveys" ON public.damij_doctor_surveys
  FOR DELETE TO authenticated USING (public.is_platform_admin(auth.uid()));

-- subject_puzzles: readable by everyone (guest mode), managed by admins.
-- Replaces the has_role-only admin policies with the unified check.
DROP POLICY IF EXISTS "Public access for subject_puzzles" ON public.subject_puzzles;
DROP POLICY IF EXISTS "Allow all for subject_puzzles" ON public.subject_puzzles;
DROP POLICY IF EXISTS "Only admins can delete subject puzzles" ON public.subject_puzzles;
DROP POLICY IF EXISTS "Only admins can insert subject puzzles" ON public.subject_puzzles;
CREATE POLICY "Admins can manage subject puzzles" ON public.subject_puzzles
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- community_forum_messages: the forum is anonymous (authors are free-text names) and
-- reactions/reports re-upsert the whole row, so INSERT/UPDATE stay open but a trigger
-- limits what non-admins can change: reaction counts, and flagging a message for review.
-- Content edits, pinning, un-flagging and DELETE are admin-only.
DROP POLICY IF EXISTS "Public access for community_forum_messages" ON public.community_forum_messages;
DROP POLICY IF EXISTS "Anyone can delete community messages" ON public.community_forum_messages;
CREATE POLICY "Admins can delete community messages" ON public.community_forum_messages
  FOR DELETE TO authenticated USING (public.is_platform_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.guard_community_forum_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_platform_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_pinned := false;
    RETURN NEW;
  END IF;

  -- UPDATE by a non-admin: keep the stored row, apply only reactions and flagging
  IF NEW.status = 'flagged' AND coalesce(OLD.status, '') <> 'flagged' THEN
    OLD.status := 'flagged';
    OLD.moderation_status := 'flagged';
    OLD.is_flagged := true;
    OLD.flag_reason := NEW.flag_reason;
  END IF;
  OLD.reactions := NEW.reactions;
  OLD.likes_count := NEW.likes_count;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS guard_community_forum_message ON public.community_forum_messages;
CREATE TRIGGER guard_community_forum_message
  BEFORE INSERT OR UPDATE ON public.community_forum_messages
  FOR EACH ROW EXECUTE FUNCTION public.guard_community_forum_message();
