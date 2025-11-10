-- Ensure super admin access is granted automatically for specific emails
-- 1) Create trigger on auth.users to call grant_admin_access_on_signup on signup
DROP TRIGGER IF EXISTS on_auth_user_created_grant_access ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_access
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.grant_admin_access_on_signup();

-- 2) Backfill: grant super_admin to existing accounts with approved emails
DO $$
BEGIN
  -- Remove existing rows for these emails to avoid duplicates
  DELETE FROM public.admin_teacher_access
  WHERE email IN (
    'jowmahmoud6@gmail.com',
    'jowmahmoud6@gmail.com',
    'jali53207@gmail.com',
    'jo789wmahmoud6@gmail.com'
  );

  -- Insert fresh rows using current auth.users ids
  INSERT INTO public.admin_teacher_access (user_id, email, access_level)
  SELECT u.id, u.email, 'super_admin'::admin_teacher_access_level
  FROM auth.users u
  WHERE u.email IN (
    'jowmahmoud6@gmail.com',
    'jowmahmoud6@gmail.com',
    'jali53207@gmail.com',
    'jo789wmahmoud6@gmail.com'
  );
END$$;