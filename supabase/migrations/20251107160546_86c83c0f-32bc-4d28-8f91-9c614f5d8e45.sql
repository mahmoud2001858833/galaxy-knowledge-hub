-- Make player2_id nullable in drawing_challenges table
ALTER TABLE public.drawing_challenges
ALTER COLUMN player2_id DROP NOT NULL;