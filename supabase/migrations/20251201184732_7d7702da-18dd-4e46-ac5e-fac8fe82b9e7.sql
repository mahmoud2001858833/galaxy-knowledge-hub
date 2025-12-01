-- جدول المشاريع: ai_builder_projects
CREATE TABLE IF NOT EXISTS public.ai_builder_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  publish_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول ملفات المشروع: ai_builder_files
CREATE TABLE IF NOT EXISTS public.ai_builder_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.ai_builder_projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول محادثات البناء: ai_builder_conversations
CREATE TABLE IF NOT EXISTS public.ai_builder_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.ai_builder_projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  code_changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.ai_builder_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_builder_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_builder_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for ai_builder_projects
CREATE POLICY "Users can view their own projects"
  ON public.ai_builder_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.ai_builder_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.ai_builder_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.ai_builder_projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published projects"
  ON public.ai_builder_projects FOR SELECT
  USING (is_published = true);

-- Policies for ai_builder_files
CREATE POLICY "Users can view their project files"
  ON public.ai_builder_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ai_builder_projects
    WHERE ai_builder_projects.id = ai_builder_files.project_id
    AND ai_builder_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create files in their projects"
  ON public.ai_builder_files FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_builder_projects
    WHERE ai_builder_projects.id = ai_builder_files.project_id
    AND ai_builder_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their project files"
  ON public.ai_builder_files FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.ai_builder_projects
    WHERE ai_builder_projects.id = ai_builder_files.project_id
    AND ai_builder_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their project files"
  ON public.ai_builder_files FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.ai_builder_projects
    WHERE ai_builder_projects.id = ai_builder_files.project_id
    AND ai_builder_projects.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view published project files"
  ON public.ai_builder_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ai_builder_projects
    WHERE ai_builder_projects.id = ai_builder_files.project_id
    AND ai_builder_projects.is_published = true
  ));

-- Policies for ai_builder_conversations
CREATE POLICY "Users can view their project conversations"
  ON public.ai_builder_conversations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ai_builder_projects
    WHERE ai_builder_projects.id = ai_builder_conversations.project_id
    AND ai_builder_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create conversations in their projects"
  ON public.ai_builder_conversations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_builder_projects
    WHERE ai_builder_projects.id = ai_builder_conversations.project_id
    AND ai_builder_projects.user_id = auth.uid()
  ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_ai_builder_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_ai_builder_projects_updated_at
  BEFORE UPDATE ON public.ai_builder_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_builder_updated_at();

CREATE TRIGGER update_ai_builder_files_updated_at
  BEFORE UPDATE ON public.ai_builder_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_builder_updated_at();