-- Create grammar_foundation_files table for storing uploaded grammar files
CREATE TABLE IF NOT EXISTS public.grammar_foundation_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  folder_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grammar_foundation_files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view grammar files"
ON public.grammar_foundation_files FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can upload grammar files"
ON public.grammar_foundation_files FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grammar files"
ON public.grammar_foundation_files FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grammar files"
ON public.grammar_foundation_files FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create storage bucket for grammar files
INSERT INTO storage.buckets (id, name, public)
VALUES ('grammar-files', 'grammar-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for grammar files
CREATE POLICY "Anyone can view grammar files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'grammar-files');

CREATE POLICY "Authenticated users can upload grammar files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'grammar-files');

CREATE POLICY "Users can update their own grammar files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'grammar-files');

CREATE POLICY "Users can delete their own grammar files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'grammar-files');