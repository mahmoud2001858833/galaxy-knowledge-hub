-- Ensure main admins are present with correct roles
-- Upsert super admins by email
INSERT INTO public.admin_teacher_access (user_id, email, access_level)
VALUES
  ('9f709182-a98b-4816-91f1-fccea1666de6', 'jowmahmoud6@gmail.com', 'super_admin'::admin_teacher_access_level),
  ('34126210-8231-4369-a9ff-da9a93be7379', 'jali53207@gmail.com', 'super_admin'::admin_teacher_access_level),
  ('0c9ee9f3-7e6f-4ccf-a938-4bfc33c8ff14', 'jo789wmahmoud6@gmail.com', 'super_admin'::admin_teacher_access_level)
ON CONFLICT (email)
DO UPDATE SET user_id = EXCLUDED.user_id, access_level = 'super_admin'::admin_teacher_access_level;

-- Add admin_id to teacher projects to assign a supervisor
ALTER TABLE public.teacher_projects
ADD COLUMN IF NOT EXISTS admin_id uuid;

-- Backfill existing projects to main super admin so they are visible
UPDATE public.teacher_projects
SET admin_id = '9f709182-a98b-4816-91f1-fccea1666de6'
WHERE admin_id IS NULL;