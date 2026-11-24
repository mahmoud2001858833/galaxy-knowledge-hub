-- بيانات تصنيف كتب مكتبة المراجع: الصف والمادة والفصل (تُحدَّد عند الرفع لمنع الخلط بين الكتب).
ALTER TABLE public.reference_books
  ADD COLUMN IF NOT EXISTS grade text CHECK (grade IS NULL OR length(grade) <= 60),
  ADD COLUMN IF NOT EXISTS subject text CHECK (subject IS NULL OR length(subject) <= 60),
  ADD COLUMN IF NOT EXISTS semester text CHECK (semester IS NULL OR semester IN ('الفصل الأول', 'الفصل الثاني'));
