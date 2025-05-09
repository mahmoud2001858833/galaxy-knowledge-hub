
-- Add hint column to puzzles table if it doesn't exist
ALTER TABLE public.puzzles 
ADD COLUMN IF NOT EXISTS hint TEXT;

-- Add subject column to puzzles table if it doesn't exist
ALTER TABLE public.puzzles 
ADD COLUMN IF NOT EXISTS subject TEXT;

-- Create subject_puzzles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subject_puzzles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  points INTEGER NOT NULL,
  image TEXT,
  subject TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  admin_password TEXT NOT NULL DEFAULT 'mahmoud'
);

-- Enable Realtime for subject_puzzles if needed
ALTER TABLE public.subject_puzzles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subject_puzzles;
