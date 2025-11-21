-- Create table for jordanian textbook content with text-based structure
CREATE TABLE IF NOT EXISTS public.jordanian_textbook_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester TEXT NOT NULL,
  unit_number INTEGER NOT NULL,
  unit_name TEXT NOT NULL,
  lesson_number INTEGER NOT NULL,
  lesson_name TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  page_content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jordanian_textbook_content ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "Super admins can view all content"
ON public.jordanian_textbook_content
FOR SELECT
USING (get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level);

CREATE POLICY "Super admins can insert content"
ON public.jordanian_textbook_content
FOR INSERT
WITH CHECK (get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level);

CREATE POLICY "Super admins can update content"
ON public.jordanian_textbook_content
FOR UPDATE
USING (get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level);

CREATE POLICY "Super admins can delete content"
ON public.jordanian_textbook_content
FOR DELETE
USING (get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level);

-- Anyone can view active content (for students using the assistant)
CREATE POLICY "Anyone can view content for learning"
ON public.jordanian_textbook_content
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_jordanian_content_grade_subject ON public.jordanian_textbook_content(grade, subject, semester);
CREATE INDEX idx_jordanian_content_unit ON public.jordanian_textbook_content(unit_number, lesson_number);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_jordanian_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jordanian_content_updated_at
BEFORE UPDATE ON public.jordanian_textbook_content
FOR EACH ROW
EXECUTE FUNCTION public.update_jordanian_content_updated_at();