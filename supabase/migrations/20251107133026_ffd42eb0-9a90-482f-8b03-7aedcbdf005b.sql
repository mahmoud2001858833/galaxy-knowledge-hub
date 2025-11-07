-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only admins can manage roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Grant initial admin access to the specified email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN ('jowmahdmoud6@gmail.com', 'jowmahmoud6@gmail.com', 'jali53207@gmail.com', 'jo789wmahmoud6@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Fix contact_messages RLS - only admins can read
DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON public.contact_messages;

CREATE POLICY "Only admins can read contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on arabic_poets
ALTER TABLE public.arabic_poets ENABLE ROW LEVEL SECURITY;

-- Create policies for arabic_poets
CREATE POLICY "Anyone can view arabic poets"
ON public.arabic_poets
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert poets"
ON public.arabic_poets
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update poets"
ON public.arabic_poets
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete poets"
ON public.arabic_poets
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Remove admin_password columns from tables
ALTER TABLE public.puzzles DROP COLUMN IF EXISTS admin_password;
ALTER TABLE public.chemistry_puzzles DROP COLUMN IF EXISTS admin_password;
ALTER TABLE public.subject_puzzles DROP COLUMN IF EXISTS admin_password;

-- Update puzzle policies to use role-based access
DROP POLICY IF EXISTS "Only admins can insert puzzles" ON public.puzzles;
DROP POLICY IF EXISTS "Only admins can update puzzles" ON public.puzzles;
DROP POLICY IF EXISTS "Only admins can delete puzzles" ON public.puzzles;

CREATE POLICY "Only admins can insert puzzles"
ON public.puzzles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update puzzles"
ON public.puzzles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete puzzles"
ON public.puzzles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update chemistry_puzzles policies
DROP POLICY IF EXISTS "Allow delete from chemistry puzzles with admin password" ON public.chemistry_puzzles;
DROP POLICY IF EXISTS "Allow insert to chemistry puzzles with admin password" ON public.chemistry_puzzles;

CREATE POLICY "Only admins can insert chemistry puzzles"
ON public.chemistry_puzzles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete chemistry puzzles"
ON public.chemistry_puzzles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update subject_puzzles policies
DROP POLICY IF EXISTS "Allow delete from subject puzzles with admin password" ON public.subject_puzzles;
DROP POLICY IF EXISTS "Allow insert to subject puzzles with admin password" ON public.subject_puzzles;

CREATE POLICY "Only admins can insert subject puzzles"
ON public.subject_puzzles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete subject puzzles"
ON public.subject_puzzles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));