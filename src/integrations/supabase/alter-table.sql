
-- Add hint column to puzzles table if it doesn't exist
ALTER TABLE public.puzzles 
ADD COLUMN IF NOT EXISTS hint TEXT;

-- Add subject column to puzzles table if it doesn't exist
ALTER TABLE public.puzzles 
ADD COLUMN IF NOT EXISTS subject TEXT;

