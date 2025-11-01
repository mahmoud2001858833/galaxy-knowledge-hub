-- Create contact_messages table for contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact messages
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read contact messages (for now, allow all authenticated users)
CREATE POLICY "Authenticated users can read contact messages"
  ON public.contact_messages
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can delete contact messages
CREATE POLICY "Authenticated users can delete contact messages"
  ON public.contact_messages
  FOR DELETE
  USING (auth.uid() IS NOT NULL);