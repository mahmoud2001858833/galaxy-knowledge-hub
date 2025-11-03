-- Enable RLS on tables that are missing it
ALTER TABLE subject_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subject_puzzles
CREATE POLICY "Anyone can view subject puzzles"
ON subject_puzzles FOR SELECT
USING (true);

CREATE POLICY "Allow insert to subject puzzles with admin password"
ON subject_puzzles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow delete from subject puzzles with admin password"
ON subject_puzzles FOR DELETE
USING (true);

-- Create RLS policies for poems
CREATE POLICY "Anyone can view poems"
ON poems FOR SELECT
USING (true);

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, score, solved_puzzles, usage_time, avatar_url)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1), 'user_' || substring(new.id::text, 1, 8)),
    0,
    0,
    0,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.adjust_user_score(user_id uuid, points_adjustment integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.profiles
  SET score = GREATEST(0, score + points_adjustment)
  WHERE id = user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_user_level(usage_minutes integer)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  -- Level 1: 30+ minutes, Level 2: 60+ minutes, Level 3: 120+ minutes, etc.
  IF usage_minutes < 30 THEN
    RETURN 0; -- No level until 30 minutes
  ELSIF usage_minutes < 60 THEN
    RETURN 1;
  ELSIF usage_minutes < 120 THEN
    RETURN 2;
  ELSIF usage_minutes < 240 THEN
    RETURN 3;
  ELSIF usage_minutes < 480 THEN
    RETURN 4;
  ELSE
    RETURN 5; -- Max level
  END IF;
END;
$function$;