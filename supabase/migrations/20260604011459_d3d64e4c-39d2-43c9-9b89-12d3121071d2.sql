
CREATE TABLE public.damij_doctor_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_name TEXT,
  specialty TEXT,
  workplace TEXT,
  email TEXT,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.damij_doctor_surveys TO anon;
GRANT SELECT, INSERT ON public.damij_doctor_surveys TO authenticated;
GRANT ALL ON public.damij_doctor_surveys TO service_role;
ALTER TABLE public.damij_doctor_surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit doctor survey" ON public.damij_doctor_surveys FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "super admin reads surveys" ON public.damij_doctor_surveys FOR SELECT TO authenticated USING (public.has_admin_teacher_access(auth.uid()));
