-- Create or replace the trigger function to automatically grant access when these emails sign up
CREATE OR REPLACE FUNCTION public.grant_admin_access_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new user's email should have admin access
  IF NEW.email IN ('jowmahdmoud6@gmail.com', 'jowmahmoud6@gmail.com', 'jali53207@gmail.com', 'jo789wmahmoud6@gmail.com') THEN
    INSERT INTO public.admin_teacher_access (user_id, email, access_level)
    VALUES (
      NEW.id,
      NEW.email,
      'super_admin'::admin_teacher_access_level
    )
    ON CONFLICT (email) DO UPDATE 
    SET 
      user_id = EXCLUDED.user_id,
      access_level = 'super_admin'::admin_teacher_access_level;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_admin_access_on_signup();