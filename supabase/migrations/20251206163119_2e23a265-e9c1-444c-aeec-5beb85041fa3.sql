-- Add RLS policies for jordanian_textbooks table to allow authenticated users to insert
ALTER TABLE public.jordanian_textbooks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own textbooks
CREATE POLICY "Authenticated users can insert textbooks"
ON public.jordanian_textbooks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to view all textbooks
CREATE POLICY "Anyone can view textbooks"
ON public.jordanian_textbooks
FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own textbooks
CREATE POLICY "Users can update their own textbooks"
ON public.jordanian_textbooks
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Allow users to delete their own textbooks
CREATE POLICY "Users can delete their own textbooks"
ON public.jordanian_textbooks
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);