-- Drop function with CASCADE to remove all dependencies
DROP FUNCTION IF EXISTS public.get_admin_teacher_access_level(uuid) CASCADE;

-- Recreate the function with correct signature
CREATE OR REPLACE FUNCTION public.get_admin_teacher_access_level(user_uuid uuid)
RETURNS admin_teacher_access_level
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT access_level
  FROM public.admin_teacher_access
  WHERE user_id = user_uuid
  LIMIT 1
$$;

-- Recreate all RLS policies for admin_teacher_access
DROP POLICY IF EXISTS "Users can view their own access" ON public.admin_teacher_access;
CREATE POLICY "Users can view their own access"
ON public.admin_teacher_access
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  get_admin_teacher_access_level(auth.uid()) IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "Only super admins can insert access" ON public.admin_teacher_access;
CREATE POLICY "Only super admins can insert access"
ON public.admin_teacher_access
FOR INSERT
TO authenticated
WITH CHECK (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'
);

DROP POLICY IF EXISTS "Only super admins can update access" ON public.admin_teacher_access;
CREATE POLICY "Only super admins can update access"
ON public.admin_teacher_access
FOR UPDATE
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'
);

DROP POLICY IF EXISTS "Only super admins can delete access" ON public.admin_teacher_access;
CREATE POLICY "Only super admins can delete access"
ON public.admin_teacher_access
FOR DELETE
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'
);

-- Recreate policies for teacher_projects
DROP POLICY IF EXISTS "Super admins can view all projects" ON public.teacher_projects;
CREATE POLICY "Super admins can view all projects"
ON public.teacher_projects
FOR SELECT
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'
);

DROP POLICY IF EXISTS "Members can view their own projects" ON public.teacher_projects;
CREATE POLICY "Members can view their own projects"
ON public.teacher_projects
FOR SELECT
TO authenticated
USING (
  member_id = auth.uid() OR 
  get_admin_teacher_access_level(auth.uid()) IN ('admin', 'super_admin')
);

-- Recreate policies for teacher_project_messages
DROP POLICY IF EXISTS "Members can view messages for their projects" ON public.teacher_project_messages;
CREATE POLICY "Members can view messages for their projects"
ON public.teacher_project_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM teacher_projects
    WHERE teacher_projects.id = teacher_project_messages.project_id
    AND teacher_projects.member_id = auth.uid()
  ) OR 
  get_admin_teacher_access_level(auth.uid()) IN ('admin', 'super_admin')
);

DROP POLICY IF EXISTS "Only admins can insert messages" ON public.teacher_project_messages;
CREATE POLICY "Only admins can insert messages"
ON public.teacher_project_messages
FOR INSERT
TO authenticated
WITH CHECK (
  admin_id = auth.uid() AND
  get_admin_teacher_access_level(auth.uid()) IN ('admin', 'super_admin')
);

-- Ensure both emails are super_admins with proper user_id mapping
DO $$
DECLARE
  user1_id uuid;
  user2_id uuid;
BEGIN
  -- Try to get user IDs from auth.users
  SELECT id INTO user1_id FROM auth.users WHERE email = 'jowmahmoud6@gmail.com' LIMIT 1;
  SELECT id INTO user2_id FROM auth.users WHERE email = 'jali53207@gmail.com' LIMIT 1;
  
  -- Upsert with user_id if found, otherwise NULL
  INSERT INTO public.admin_teacher_access (email, access_level, user_id)
  VALUES 
    ('jowmahmoud6@gmail.com', 'super_admin', user1_id),
    ('jali53207@gmail.com', 'super_admin', user2_id)
  ON CONFLICT (email) 
  DO UPDATE SET 
    access_level = 'super_admin',
    user_id = COALESCE(EXCLUDED.user_id, admin_teacher_access.user_id);
END $$;