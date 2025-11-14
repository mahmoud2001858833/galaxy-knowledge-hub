-- Create tawjihi_files table
CREATE TABLE IF NOT EXISTS public.tawjihi_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  grade TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tawjihi_files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view tawjihi files"
ON public.tawjihi_files
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can upload tawjihi files"
ON public.tawjihi_files
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tawjihi files"
ON public.tawjihi_files
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tawjihi files"
ON public.tawjihi_files
FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for tawjihi files
INSERT INTO storage.buckets (id, name, public)
VALUES ('tawjihi-files', 'tawjihi-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can view tawjihi files in storage"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tawjihi-files');

CREATE POLICY "Authenticated users can upload tawjihi files to storage"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'tawjihi-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own tawjihi files in storage"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'tawjihi-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own tawjihi files in storage"
ON storage.objects
FOR DELETE
USING (bucket_id = 'tawjihi-files' AND auth.uid() IS NOT NULL);