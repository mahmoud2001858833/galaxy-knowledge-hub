CREATE TABLE public.platform_complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit complaints"
ON public.platform_complaints FOR INSERT WITH CHECK (true);

CREATE POLICY "No public read"
ON public.platform_complaints FOR SELECT USING (false);

CREATE POLICY "No public update"
ON public.platform_complaints FOR UPDATE USING (false);

CREATE POLICY "No public delete"
ON public.platform_complaints FOR DELETE USING (false);

CREATE OR REPLACE FUNCTION public.update_platform_complaints_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_platform_complaints_updated_at
BEFORE UPDATE ON public.platform_complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_platform_complaints_updated_at();