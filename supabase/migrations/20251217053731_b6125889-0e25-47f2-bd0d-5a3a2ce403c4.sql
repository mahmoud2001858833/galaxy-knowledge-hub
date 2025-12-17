-- 1. جدول المستخدمين للمشاريع المنشأة
CREATE TABLE public.builder_app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_project_id UUID NOT NULL REFERENCES ai_builder_projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  metadata JSONB DEFAULT '{}',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(builder_project_id, email)
);

-- 2. جدول المحتوى للمشاريع المنشأة
CREATE TABLE public.builder_app_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_project_id UUID NOT NULL REFERENCES ai_builder_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_type TEXT DEFAULT 'post',
  image_url TEXT,
  category TEXT,
  author_id UUID REFERENCES builder_app_users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول التعليقات
CREATE TABLE public.builder_app_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_project_id UUID NOT NULL REFERENCES ai_builder_projects(id) ON DELETE CASCADE,
  content_id UUID REFERENCES builder_app_content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES builder_app_users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول الإعجابات
CREATE TABLE public.builder_app_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_project_id UUID NOT NULL REFERENCES ai_builder_projects(id) ON DELETE CASCADE,
  content_id UUID REFERENCES builder_app_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES builder_app_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(builder_project_id, content_id, user_id)
);

-- 5. جدول الملفات/الصور
CREATE TABLE public.builder_app_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_project_id UUID NOT NULL REFERENCES ai_builder_projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES builder_app_users(id) ON DELETE SET NULL,
  folder TEXT DEFAULT 'uploads',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول الإعدادات المخصصة لكل مشروع
CREATE TABLE public.builder_app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_project_id UUID NOT NULL UNIQUE REFERENCES ai_builder_projects(id) ON DELETE CASCADE,
  site_name TEXT,
  site_logo TEXT,
  site_description TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  secondary_color TEXT DEFAULT '#8b5cf6',
  custom_css TEXT,
  custom_js TEXT,
  features JSONB DEFAULT '{"auth": true, "comments": true, "likes": true, "files": true}',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول الجلسات للمستخدمين
CREATE TABLE public.builder_app_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_project_id UUID NOT NULL REFERENCES ai_builder_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES builder_app_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.builder_app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_app_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_app_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_app_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_app_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_app_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for builder_app_users
CREATE POLICY "Anyone can read users of published projects"
ON public.builder_app_users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects 
    WHERE id = builder_project_id AND is_published = true
  )
);

CREATE POLICY "Project owners can manage users"
ON public.builder_app_users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects 
    WHERE id = builder_project_id AND user_id = auth.uid()
  )
);

-- RLS Policies for builder_app_content
CREATE POLICY "Anyone can read published content"
ON public.builder_app_content FOR SELECT
USING (
  is_published = true AND EXISTS (
    SELECT 1 FROM ai_builder_projects 
    WHERE id = builder_project_id AND is_published = true
  )
);

CREATE POLICY "Project owners can manage all content"
ON public.builder_app_content FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects 
    WHERE id = builder_project_id AND user_id = auth.uid()
  )
);

-- RLS Policies for builder_app_comments
CREATE POLICY "Anyone can read comments"
ON public.builder_app_comments FOR SELECT
USING (true);

CREATE POLICY "Project owners can manage comments"
ON public.builder_app_comments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects 
    WHERE id = builder_project_id AND user_id = auth.uid()
  )
);

-- RLS Policies for builder_app_likes
CREATE POLICY "Anyone can read likes"
ON public.builder_app_likes FOR SELECT
USING (true);

CREATE POLICY "Project owners can manage likes"
ON public.builder_app_likes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects 
    WHERE id = builder_project_id AND user_id = auth.uid()
  )
);

-- RLS Policies for builder_app_files
CREATE POLICY "Anyone can read files of published projects"
ON public.builder_app_files FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects 
    WHERE id = builder_project_id AND is_published = true
  )
);

CREATE POLICY "Project owners can manage files"
ON public.builder_app_files FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects 
    WHERE id = builder_project_id AND user_id = auth.uid()
  )
);

-- RLS Policies for builder_app_settings
CREATE POLICY "Anyone can read settings of published projects"
ON public.builder_app_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects 
    WHERE id = builder_project_id AND is_published = true
  )
);

CREATE POLICY "Project owners can manage settings"
ON public.builder_app_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects 
    WHERE id = builder_project_id AND user_id = auth.uid()
  )
);

-- RLS Policies for builder_app_sessions
CREATE POLICY "Project owners can manage sessions"
ON public.builder_app_sessions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_builder_projects 
    WHERE id = builder_project_id AND user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_builder_app_users_project ON builder_app_users(builder_project_id);
CREATE INDEX idx_builder_app_content_project ON builder_app_content(builder_project_id);
CREATE INDEX idx_builder_app_comments_content ON builder_app_comments(content_id);
CREATE INDEX idx_builder_app_likes_content ON builder_app_likes(content_id);
CREATE INDEX idx_builder_app_files_project ON builder_app_files(builder_project_id);
CREATE INDEX idx_builder_app_sessions_token ON builder_app_sessions(token);
CREATE INDEX idx_builder_app_sessions_user ON builder_app_sessions(user_id);

-- Function to auto-create settings when project is created
CREATE OR REPLACE FUNCTION public.auto_create_builder_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.builder_app_settings (builder_project_id, site_name)
  VALUES (NEW.id, NEW.title)
  ON CONFLICT (builder_project_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create settings
CREATE TRIGGER trigger_auto_create_builder_settings
AFTER INSERT ON public.ai_builder_projects
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_builder_settings();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_builder_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_builder_app_users_updated_at
BEFORE UPDATE ON public.builder_app_users
FOR EACH ROW EXECUTE FUNCTION public.update_builder_updated_at();

CREATE TRIGGER update_builder_app_content_updated_at
BEFORE UPDATE ON public.builder_app_content
FOR EACH ROW EXECUTE FUNCTION public.update_builder_updated_at();

CREATE TRIGGER update_builder_app_settings_updated_at
BEFORE UPDATE ON public.builder_app_settings
FOR EACH ROW EXECUTE FUNCTION public.update_builder_updated_at();