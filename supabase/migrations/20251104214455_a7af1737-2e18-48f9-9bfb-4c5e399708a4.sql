-- Create access level enum for admin-teacher platform
CREATE TYPE public.admin_teacher_access_level AS ENUM ('member', 'admin', 'super_admin');

-- Create access control table
CREATE TABLE public.admin_teacher_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  access_level admin_teacher_access_level NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create teacher projects table
CREATE TABLE public.teacher_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  teacher_name TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project messages/replies table
CREATE TABLE public.teacher_project_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES teacher_projects(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_teacher_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_project_messages ENABLE ROW LEVEL SECURITY;

-- Create helper function to check access level
CREATE OR REPLACE FUNCTION public.get_admin_teacher_access_level(_user_id UUID)
RETURNS admin_teacher_access_level
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT access_level FROM public.admin_teacher_access WHERE user_id = _user_id;
$$;

-- Create helper function to check if user has access
CREATE OR REPLACE FUNCTION public.has_admin_teacher_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_teacher_access WHERE user_id = _user_id);
$$;

-- RLS Policies for admin_teacher_access
CREATE POLICY "Users can view their own access"
ON public.admin_teacher_access FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.get_admin_teacher_access_level(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Only super admins can insert access"
ON public.admin_teacher_access FOR INSERT
TO authenticated
WITH CHECK (public.get_admin_teacher_access_level(auth.uid()) = 'super_admin');

CREATE POLICY "Only super admins can update access"
ON public.admin_teacher_access FOR UPDATE
TO authenticated
USING (public.get_admin_teacher_access_level(auth.uid()) = 'super_admin');

CREATE POLICY "Only super admins can delete access"
ON public.admin_teacher_access FOR DELETE
TO authenticated
USING (public.get_admin_teacher_access_level(auth.uid()) = 'super_admin');

-- RLS Policies for teacher_projects
CREATE POLICY "Members can view their own projects"
ON public.teacher_projects FOR SELECT
TO authenticated
USING (member_id = auth.uid() OR public.get_admin_teacher_access_level(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Members can insert their own projects"
ON public.teacher_projects FOR INSERT
TO authenticated
WITH CHECK (member_id = auth.uid() AND public.has_admin_teacher_access(auth.uid()));

CREATE POLICY "Members can update their own projects"
ON public.teacher_projects FOR UPDATE
TO authenticated
USING (member_id = auth.uid());

-- RLS Policies for teacher_project_messages
CREATE POLICY "Members can view messages for their projects"
ON public.teacher_project_messages FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM teacher_projects WHERE id = project_id AND member_id = auth.uid())
  OR public.get_admin_teacher_access_level(auth.uid()) IN ('admin', 'super_admin')
);

CREATE POLICY "Only admins can insert messages"
ON public.teacher_project_messages FOR INSERT
TO authenticated
WITH CHECK (
  admin_id = auth.uid() AND 
  public.get_admin_teacher_access_level(auth.uid()) IN ('admin', 'super_admin')
);

-- Insert initial super admin and admin
INSERT INTO public.admin_teacher_access (user_id, email, access_level, created_by)
SELECT 
  id,
  email,
  CASE 
    WHEN email = 'jowmahdmoud6@gmail.com' THEN 'super_admin'::admin_teacher_access_level
    WHEN email = 'jali53207@gmail.com' THEN 'admin'::admin_teacher_access_level
  END,
  id
FROM auth.users
WHERE email IN ('jowmahdmoud6@gmail.com', 'jali53207@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_teacher_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teacher_projects_updated_at
BEFORE UPDATE ON public.teacher_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_teacher_projects_updated_at();