-- Make user_id nullable in admin_teacher_access to allow adding users before they sign up
ALTER TABLE public.admin_teacher_access ALTER COLUMN user_id DROP NOT NULL;

-- Add jowmahmoud6@gmail.com as admin supervisor
INSERT INTO public.admin_teacher_access (email, access_level)
VALUES ('jowmahmoud6@gmail.com', 'admin')
ON CONFLICT (email) 
DO UPDATE SET access_level = 'admin';