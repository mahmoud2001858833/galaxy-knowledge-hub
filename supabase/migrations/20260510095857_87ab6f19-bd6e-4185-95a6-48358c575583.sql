
-- Sanitize existing email-like usernames
UPDATE public.profiles
SET username = 'user_' || substring(id::text, 1, 8)
WHERE username LIKE '%@%';

-- Restrict public profile read to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Update handle_new_user to never persist email-like usernames
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  generated_username text;
BEGIN
  generated_username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'user_' || substring(new.id::text, 1, 8)
  );

  IF generated_username LIKE '%@%' OR generated_username IS NULL OR length(generated_username) = 0 THEN
    generated_username := 'user_' || substring(new.id::text, 1, 8);
  END IF;

  INSERT INTO public.profiles (id, username, score, solved_puzzles, usage_time, avatar_url)
  VALUES (
    new.id,
    generated_username,
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
