-- Team hub settings (one row), edited by the principal in /admin?tab=team → «الإعدادات».
-- * role_limits: the most people a role may have ({"auditor": 3, ...}); a missing role = no limit.
-- * default work window for people added to a collective task (each person can still be changed there).

CREATE TABLE IF NOT EXISTS public.team_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  role_limits jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(role_limits) = 'object'),
  default_work_start time NOT NULL DEFAULT '16:00',
  default_work_end time NOT NULL DEFAULT '20:00',
  default_work_days smallint[] NOT NULL DEFAULT '{0,1,2,3,4,6}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL DEFAULT auth.uid(),
  CHECK (default_work_end > default_work_start),
  CHECK (cardinality(default_work_days) BETWEEN 1 AND 7)
);
INSERT INTO public.team_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.team_settings FROM anon;
GRANT SELECT, UPDATE ON public.team_settings TO authenticated;
DROP POLICY IF EXISTS "leads read team settings" ON public.team_settings;
CREATE POLICY "leads read team settings" ON public.team_settings FOR SELECT TO authenticated USING (public.team_is_lead());
DROP POLICY IF EXISTS "principal edits team settings" ON public.team_settings;
CREATE POLICY "principal edits team settings" ON public.team_settings FOR UPDATE TO authenticated
  USING (public.team_has_role('principal')) WITH CHECK (public.team_has_role('principal'));

CREATE OR REPLACE FUNCTION public.team_settings_touch()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS team_settings_touch ON public.team_settings;
CREATE TRIGGER team_settings_touch BEFORE UPDATE ON public.team_settings FOR EACH ROW EXECUTE FUNCTION public.team_settings_touch();

-- ---------------------------------------------------------------- role limits
CREATE OR REPLACE FUNCTION public.team_members_role_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_limit int;
  v_count int;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role = OLD.role THEN
    RETURN NEW;
  END IF;
  SELECT (role_limits ->> NEW.role)::int INTO v_limit FROM public.team_settings WHERE id;
  IF v_limit IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO v_count FROM public.team_members WHERE role = NEW.role AND id IS DISTINCT FROM NEW.id;
  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'TEAM_ROLE_FULL: % (%/%)', NEW.role, v_count, v_limit USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS team_members_role_limit ON public.team_members;
CREATE TRIGGER team_members_role_limit BEFORE INSERT OR UPDATE OF role ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.team_members_role_limit();

-- ---------------------------------------------------------------- default work window for collective tasks
CREATE OR REPLACE FUNCTION public.team_default_work_start() RETURNS time LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT coalesce((SELECT default_work_start FROM public.team_settings WHERE id), '16:00'::time) $$;
CREATE OR REPLACE FUNCTION public.team_default_work_end() RETURNS time LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT coalesce((SELECT default_work_end FROM public.team_settings WHERE id), '20:00'::time) $$;
CREATE OR REPLACE FUNCTION public.team_default_work_days() RETURNS smallint[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT coalesce((SELECT default_work_days FROM public.team_settings WHERE id), '{0,1,2,3,4,6}'::smallint[]) $$;

ALTER TABLE public.collective_task_members
  ALTER COLUMN work_start SET DEFAULT public.team_default_work_start(),
  ALTER COLUMN work_end SET DEFAULT public.team_default_work_end(),
  ALTER COLUMN work_days SET DEFAULT public.team_default_work_days();
