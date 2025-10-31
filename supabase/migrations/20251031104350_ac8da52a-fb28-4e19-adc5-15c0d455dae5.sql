-- Create student_projects table
CREATE TABLE public.student_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  project_description TEXT NOT NULL,
  school_name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view student projects" 
ON public.student_projects 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own projects" 
ON public.student_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.student_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.student_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create recorded_lessons table
CREATE TABLE public.recorded_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT,
  description TEXT,
  video_url TEXT NOT NULL,
  video_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recorded_lessons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view recorded lessons" 
ON public.recorded_lessons 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can upload lessons" 
ON public.recorded_lessons 
FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own lessons" 
ON public.recorded_lessons 
FOR UPDATE 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own lessons" 
ON public.recorded_lessons 
FOR DELETE 
USING (auth.uid() = teacher_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('project-images', 'project-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('lesson-videos', 'lesson-videos', true, 107374182400, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project images
CREATE POLICY "Anyone can view project images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload project images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own project images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'project-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own project images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-images' AND auth.uid() IS NOT NULL);

-- Storage policies for lesson videos
CREATE POLICY "Anyone can view lesson videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'lesson-videos');

CREATE POLICY "Authenticated users can upload lesson videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'lesson-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can update their own lesson videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'lesson-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can delete their own lesson videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'lesson-videos' AND auth.uid() IS NOT NULL);