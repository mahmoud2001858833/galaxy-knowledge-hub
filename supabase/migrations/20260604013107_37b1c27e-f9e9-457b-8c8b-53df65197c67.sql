DROP POLICY IF EXISTS "super admin reads surveys" ON public.damij_doctor_surveys;
CREATE POLICY "anyone can read doctor surveys"
  ON public.damij_doctor_surveys
  FOR SELECT
  TO anon, authenticated
  USING (true);
GRANT SELECT ON public.damij_doctor_surveys TO anon;