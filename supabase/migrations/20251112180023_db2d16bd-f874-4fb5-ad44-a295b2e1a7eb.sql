-- إضافة عمود المدرسة لجدول الواجبات
ALTER TABLE public.class_assignments 
ADD COLUMN IF NOT EXISTS school_name TEXT NOT NULL DEFAULT '';

-- إضافة عمود المدرسة لجدول الملاحظات  
ALTER TABLE public.class_notes 
ADD COLUMN IF NOT EXISTS school_name TEXT NOT NULL DEFAULT '';

-- تحديث RLS policies للواجبات لتشمل المدرسة
DROP POLICY IF EXISTS "Parents can view assignments for their class" ON public.class_assignments;

CREATE POLICY "Parents can view assignments for their class" 
ON public.class_assignments 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM parents
    WHERE parents.user_id = auth.uid() 
    AND parents.grade = class_assignments.grade 
    AND parents.section = class_assignments.section
    AND parents.school_name = class_assignments.school_name
  )
);

-- تحديث RLS policies للملاحظات لتشمل المدرسة
DROP POLICY IF EXISTS "Parents can view notes for their class" ON public.class_notes;

CREATE POLICY "Parents can view notes for their student" 
ON public.class_notes 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM parents
    WHERE parents.user_id = auth.uid() 
    AND parents.student_name = class_notes.student_name
    AND parents.school_name = class_notes.school_name
  )
);