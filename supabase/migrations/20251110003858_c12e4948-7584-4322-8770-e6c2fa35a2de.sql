-- Ensure super_admin can manage critical tables if they exist (fixed EXECUTE quoting)
DO $$
BEGIN
  -- scientific_journals
  IF to_regclass('public.scientific_journals') IS NOT NULL THEN
    -- Enable RLS if not already
    EXECUTE 'ALTER TABLE public.scientific_journals ENABLE ROW LEVEL SECURITY';

    -- Drop policies if exist
    EXECUTE 'DROP POLICY IF EXISTS "Super admins can delete journals" ON public.scientific_journals';
    EXECUTE 'DROP POLICY IF EXISTS "Super admins can view all journals" ON public.scientific_journals';

    -- Allow super admins to view all
    EXECUTE 'CREATE POLICY "Super admins can view all journals" ON public.scientific_journals FOR SELECT USING (get_admin_teacher_access_level(auth.uid()) = ''super_admin''::admin_teacher_access_level)';

    -- Allow super admins to delete
    EXECUTE 'CREATE POLICY "Super admins can delete journals" ON public.scientific_journals FOR DELETE USING (get_admin_teacher_access_level(auth.uid()) = ''super_admin''::admin_teacher_access_level)';
  END IF;

  -- student_projects (environmental projects)
  IF to_regclass('public.student_projects') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Super admins can delete student projects" ON public.student_projects';
    EXECUTE 'DROP POLICY IF EXISTS "Super admins can view all student projects" ON public.student_projects';

    EXECUTE 'CREATE POLICY "Super admins can view all student projects" ON public.student_projects FOR SELECT USING (get_admin_teacher_access_level(auth.uid()) = ''super_admin''::admin_teacher_access_level)';

    EXECUTE 'CREATE POLICY "Super admins can delete student projects" ON public.student_projects FOR DELETE USING (get_admin_teacher_access_level(auth.uid()) = ''super_admin''::admin_teacher_access_level)';
  END IF;
END$$;