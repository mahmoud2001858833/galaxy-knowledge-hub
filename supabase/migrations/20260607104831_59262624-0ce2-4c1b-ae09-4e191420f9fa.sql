CREATE POLICY "anyone can delete doctor surveys" ON public.damij_doctor_surveys FOR DELETE USING (true);
GRANT DELETE ON public.damij_doctor_surveys TO anon, authenticated;