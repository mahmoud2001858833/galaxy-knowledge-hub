-- Create jordanian_textbooks table
CREATE TABLE IF NOT EXISTS public.jordanian_textbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  semester TEXT NOT NULL,
  file_url TEXT NOT NULL,
  gemini_file_uri TEXT,
  gemini_file_name TEXT,
  page_count INTEGER,
  file_size_mb NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_textbooks_subject_grade ON public.jordanian_textbooks(subject, grade);

-- Create student_assistant_usage table
CREATE TABLE IF NOT EXISTS public.student_assistant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  student_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  question TEXT NOT NULL,
  subject_detected TEXT,
  answer TEXT,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.jordanian_textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assistant_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jordanian_textbooks
CREATE POLICY "Super admins can upload textbooks"
ON public.jordanian_textbooks FOR INSERT
WITH CHECK (get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level);

CREATE POLICY "Anyone can view active textbooks"
ON public.jordanian_textbooks FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can update textbooks"
ON public.jordanian_textbooks FOR UPDATE
USING (get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level);

CREATE POLICY "Super admins can delete textbooks"
ON public.jordanian_textbooks FOR DELETE
USING (get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level);

-- RLS Policies for student_assistant_usage
CREATE POLICY "Users can insert their own usage"
ON public.student_assistant_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage"
ON public.student_assistant_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all usage"
ON public.student_assistant_usage FOR SELECT
USING (get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level);

-- Create storage bucket for textbooks
INSERT INTO storage.buckets (id, name, public) 
VALUES ('jordanian-textbooks', 'jordanian-textbooks', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Super admins can upload textbook files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'jordanian-textbooks' AND
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

CREATE POLICY "Anyone can view textbook files"
ON storage.objects FOR SELECT
USING (bucket_id = 'jordanian-textbooks');

CREATE POLICY "Super admins can delete textbook files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'jordanian-textbooks' AND
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);