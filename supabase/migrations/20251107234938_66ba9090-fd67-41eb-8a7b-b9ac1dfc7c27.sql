-- Create enum for user types in communication bridge
CREATE TYPE public.communication_user_type AS ENUM ('teacher', 'parent');

-- Create teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  homeroom_class TEXT NOT NULL,
  subject_taught TEXT NOT NULL,
  grades_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parents table
CREATE TABLE public.parents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name TEXT NOT NULL,
  student_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  section TEXT NOT NULL,
  school_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignments table
CREATE TABLE public.class_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  assignment_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  section TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notes table
CREATE TABLE public.class_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  class_section TEXT NOT NULL,
  student_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create class chat messages table
CREATE TABLE public.class_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  user_type TEXT NOT NULL,
  grade TEXT NOT NULL,
  section TEXT NOT NULL,
  school_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_chat_messages ENABLE ROW LEVEL SECURITY;

-- Teachers policies
CREATE POLICY "Teachers can insert their own profile"
ON public.teachers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can view their own profile"
ON public.teachers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update their own profile"
ON public.teachers FOR UPDATE
USING (auth.uid() = user_id);

-- Parents policies
CREATE POLICY "Parents can insert their own profile"
ON public.parents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can view their own profile"
ON public.parents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Parents can update their own profile"
ON public.parents FOR UPDATE
USING (auth.uid() = user_id);

-- Assignments policies
CREATE POLICY "Teachers can insert assignments"
ON public.class_assignments FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.teachers 
  WHERE teachers.id = class_assignments.teacher_id 
  AND teachers.user_id = auth.uid()
));

CREATE POLICY "Teachers can view their assignments"
ON public.class_assignments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.teachers 
  WHERE teachers.id = class_assignments.teacher_id 
  AND teachers.user_id = auth.uid()
));

CREATE POLICY "Parents can view assignments for their class"
ON public.class_assignments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.parents 
  WHERE parents.user_id = auth.uid() 
  AND parents.grade = class_assignments.grade 
  AND parents.section = class_assignments.section
));

CREATE POLICY "Teachers can update their assignments"
ON public.class_assignments FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.teachers 
  WHERE teachers.id = class_assignments.teacher_id 
  AND teachers.user_id = auth.uid()
));

CREATE POLICY "Teachers can delete their assignments"
ON public.class_assignments FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.teachers 
  WHERE teachers.id = class_assignments.teacher_id 
  AND teachers.user_id = auth.uid()
));

-- Notes policies
CREATE POLICY "Teachers can insert notes"
ON public.class_notes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.teachers 
  WHERE teachers.id = class_notes.teacher_id 
  AND teachers.user_id = auth.uid()
));

CREATE POLICY "Teachers can view their notes"
ON public.class_notes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.teachers 
  WHERE teachers.id = class_notes.teacher_id 
  AND teachers.user_id = auth.uid()
));

CREATE POLICY "Parents can view notes for their class"
ON public.class_notes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.parents 
  WHERE parents.user_id = auth.uid() 
  AND parents.student_name = class_notes.student_name
));

-- Chat messages policies
CREATE POLICY "Users can insert chat messages"
ON public.class_chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can view chat for their classes"
ON public.class_chat_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.teachers 
  WHERE teachers.user_id = auth.uid() 
  AND teachers.school_name = class_chat_messages.school_name
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(teachers.grades_sections) AS gs
    WHERE gs = (class_chat_messages.grade || class_chat_messages.section)
  )
));

CREATE POLICY "Parents can view chat for their class"
ON public.class_chat_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.parents 
  WHERE parents.user_id = auth.uid() 
  AND parents.grade = class_chat_messages.grade 
  AND parents.section = class_chat_messages.section
  AND parents.school_name = class_chat_messages.school_name
));

-- Enable realtime
ALTER TABLE public.teachers REPLICA IDENTITY FULL;
ALTER TABLE public.parents REPLICA IDENTITY FULL;
ALTER TABLE public.class_assignments REPLICA IDENTITY FULL;
ALTER TABLE public.class_notes REPLICA IDENTITY FULL;
ALTER TABLE public.class_chat_messages REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.teachers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_chat_messages;