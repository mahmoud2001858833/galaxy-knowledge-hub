-- Create BTEC student projects table
CREATE TABLE IF NOT EXISTS public.btec_student_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_idea TEXT NOT NULL,
  programming_languages TEXT[] NOT NULL DEFAULT '{}',
  project_description TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.btec_student_projects ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view BTEC projects"
  ON public.btec_student_projects
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON public.btec_student_projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.btec_student_projects
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.btec_student_projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create BTEC project likes table
CREATE TABLE IF NOT EXISTS public.btec_project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.btec_student_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE public.btec_project_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view project likes"
  ON public.btec_project_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like projects"
  ON public.btec_project_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike projects"
  ON public.btec_project_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create custom platforms table
CREATE TABLE IF NOT EXISTS public.btec_custom_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  language TEXT NOT NULL,
  custom_code TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.btec_custom_platforms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view custom platforms"
  ON public.btec_custom_platforms
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create platforms"
  ON public.btec_custom_platforms
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platforms"
  ON public.btec_custom_platforms
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platforms"
  ON public.btec_custom_platforms
  FOR DELETE
  USING (auth.uid() = user_id);