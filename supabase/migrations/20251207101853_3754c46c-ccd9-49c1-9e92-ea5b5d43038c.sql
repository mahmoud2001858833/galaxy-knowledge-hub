-- Add is_correct column to track wrong answers too
ALTER TABLE public.user_solved_puzzles 
ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT true;

-- Add index for better leaderboard performance
CREATE INDEX IF NOT EXISTS idx_profiles_score_desc ON public.profiles(score DESC NULLS LAST);

-- Add index for user solved puzzles lookup
CREATE INDEX IF NOT EXISTS idx_user_solved_puzzles_user_puzzle ON public.user_solved_puzzles(user_id, puzzle_id);