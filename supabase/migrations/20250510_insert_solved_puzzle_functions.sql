
-- Function to safely insert a solved puzzle record
CREATE OR REPLACE FUNCTION public.insert_solved_puzzle(
  p_user_id UUID,
  p_puzzle_id UUID,
  p_subject TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the solved puzzle record if it doesn't exist
  INSERT INTO public.user_solved_puzzles (user_id, puzzle_id, subject)
  VALUES (p_user_id, p_puzzle_id, p_subject)
  ON CONFLICT (user_id, puzzle_id) DO NOTHING;
END;
$$;

-- Function for direct insertion from client with proper auth check
CREATE OR REPLACE FUNCTION public.insert_solved_puzzle_direct(
  p_user_id UUID,
  p_puzzle_id UUID,
  p_subject TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the user is authenticated and only inserting their own records
  IF auth.uid() = p_user_id THEN
    INSERT INTO public.user_solved_puzzles (user_id, puzzle_id, subject)
    VALUES (p_user_id, p_puzzle_id, p_subject)
    ON CONFLICT (user_id, puzzle_id) DO NOTHING;
  ELSE
    RAISE EXCEPTION 'Not authorized to insert records for other users';
  END IF;
END;
$$;
