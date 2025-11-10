-- Grant super_admin access to specific email if missing
-- and ensure consistent mapping to auth.users id

-- 1) Backfill admin_teacher_access for the required email
DO $$
DECLARE
  usr RECORD;
BEGIN
  SELECT id, email INTO usr FROM auth.users WHERE email = 'jowmahmoud6@gmail.com' LIMIT 1;

  IF usr.id IS NOT NULL THEN
    -- Remove duplicates for safety
    DELETE FROM public.admin_teacher_access
    WHERE email = usr.email;

    -- Insert fresh super_admin access row
    INSERT INTO public.admin_teacher_access (id, user_id, email, access_level, created_at)
    VALUES (gen_random_uuid(), usr.id, usr.email, 'super_admin'::admin_teacher_access_level, now());
  END IF;
END$$;

-- 2) Verify minimal select permission for super_admin is already provided by policies.
--    No schema changes beyond the backfill to avoid breaking existing RLS.
