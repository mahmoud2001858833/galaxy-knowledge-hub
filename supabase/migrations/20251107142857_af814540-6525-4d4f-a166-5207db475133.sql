-- Add the two emails as super_admins
INSERT INTO public.admin_teacher_access (email, access_level, user_id)
VALUES 
  ('jowmahmoud6@gmail.com', 'super_admin', NULL),
  ('jali53207@gmail.com', 'super_admin', NULL)
ON CONFLICT (email) 
DO UPDATE SET 
  access_level = 'super_admin';