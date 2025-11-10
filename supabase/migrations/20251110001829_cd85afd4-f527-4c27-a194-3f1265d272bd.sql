-- Allow super_admin to delete from all tables

-- btec_student_projects
DROP POLICY IF EXISTS "Super admins can delete projects" ON public.btec_student_projects;
CREATE POLICY "Super admins can delete projects"
ON public.btec_student_projects
FOR DELETE
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

-- btec_custom_platforms
DROP POLICY IF EXISTS "Super admins can delete platforms" ON public.btec_custom_platforms;
CREATE POLICY "Super admins can delete platforms"
ON public.btec_custom_platforms
FOR DELETE
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

-- art_projects
DROP POLICY IF EXISTS "Super admins can delete art projects" ON public.art_projects;
CREATE POLICY "Super admins can delete art projects"
ON public.art_projects
FOR DELETE
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

-- student_projects (environmental)
DROP POLICY IF EXISTS "Super admins can delete student projects" ON public.student_projects;
CREATE POLICY "Super admins can delete student projects"
ON public.student_projects
FOR DELETE
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

-- scientific_journals
DROP POLICY IF EXISTS "Super admins can delete journals" ON public.scientific_journals;
CREATE POLICY "Super admins can delete journals"
ON public.scientific_journals
FOR DELETE
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

-- educational_images
DROP POLICY IF EXISTS "Super admins can delete images" ON public.educational_images;
CREATE POLICY "Super admins can delete images"
ON public.educational_images
FOR DELETE
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

-- teachers
DROP POLICY IF EXISTS "Super admins can delete teachers" ON public.teachers;
CREATE POLICY "Super admins can delete teachers"
ON public.teachers
FOR DELETE
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

-- parents
DROP POLICY IF EXISTS "Super admins can delete parents" ON public.parents;
CREATE POLICY "Super admins can delete parents"
ON public.parents
FOR DELETE
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

-- class_assignments
DROP POLICY IF EXISTS "Super admins can delete assignments" ON public.class_assignments;
CREATE POLICY "Super admins can delete assignments"
ON public.class_assignments
FOR DELETE
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

-- class_notes
DROP POLICY IF EXISTS "Super admins can delete notes" ON public.class_notes;
CREATE POLICY "Super admins can delete notes"
ON public.class_notes
FOR DELETE
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

-- Allow super_admin to view all data
DROP POLICY IF EXISTS "Super admins can view all teachers" ON public.teachers;
CREATE POLICY "Super admins can view all teachers"
ON public.teachers
FOR SELECT
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

DROP POLICY IF EXISTS "Super admins can view all parents" ON public.parents;
CREATE POLICY "Super admins can view all parents"
ON public.parents
FOR SELECT
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

DROP POLICY IF EXISTS "Super admins can view all assignments" ON public.class_assignments;
CREATE POLICY "Super admins can view all assignments"
ON public.class_assignments
FOR SELECT
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

DROP POLICY IF EXISTS "Super admins can view all notes" ON public.class_notes;
CREATE POLICY "Super admins can view all notes"
ON public.class_notes
FOR SELECT
TO authenticated
USING (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

-- Allow super_admin to insert assignments and notes
DROP POLICY IF EXISTS "Super admins can insert assignments" ON public.class_assignments;
CREATE POLICY "Super admins can insert assignments"
ON public.class_assignments
FOR INSERT
TO authenticated
WITH CHECK (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);

DROP POLICY IF EXISTS "Super admins can insert notes" ON public.class_notes;
CREATE POLICY "Super admins can insert notes"
ON public.class_notes
FOR INSERT
TO authenticated
WITH CHECK (
  get_admin_teacher_access_level(auth.uid()) = 'super_admin'::admin_teacher_access_level
);