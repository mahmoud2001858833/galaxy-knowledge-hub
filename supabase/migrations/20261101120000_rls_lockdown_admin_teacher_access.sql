-- RLS lockdown: admin_teacher_access
-- Previously "Public access for admin_teacher_access" (ALL, true/true for anon) let anyone
-- holding the public anon key insert themselves as super_admin, and "Allow select all"
-- exposed every staff email. The remaining policies already cover legitimate use:
--   SELECT: own row, or admin/super_admin see all
--   INSERT/UPDATE/DELETE: super_admin only
-- Edge functions (admin-manage-access, ensure-admin-access, auto-create-user) use the
-- service role and are unaffected.

DROP POLICY IF EXISTS "Public access for admin_teacher_access" ON public.admin_teacher_access;
DROP POLICY IF EXISTS "Allow select all for admin_teacher_access" ON public.admin_teacher_access;

-- Members submitting a teacher project need the primary supervisor's id without being
-- able to read the access list itself (src/components/adminTeachers/MemberSection.tsx).
CREATE OR REPLACE FUNCTION public.get_primary_supervisor_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT user_id
  FROM public.admin_teacher_access
  WHERE access_level = 'super_admin' AND user_id IS NOT NULL
  ORDER BY created_at ASC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_primary_supervisor_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_primary_supervisor_id() TO authenticated;

-- The signup trigger was attached twice (on_auth_user_created_grant_access and
-- on_auth_user_created_grant_admin), both calling grant_admin_access_on_signup().
DROP TRIGGER IF EXISTS on_auth_user_created_grant_access ON auth.users;
