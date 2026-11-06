-- Multi-project bridge: the principal's computer works on more than one project.
--
-- 'main' is ذروة العلم itself (the bridge's workdir) and is not a row. Every other project is a row in
-- bridge_projects, created by the principal in /admin?tab=terminal → «المشاريع»:
--   source 'new'    → the bridge creates ~/zarwa-projects/<slug> with git (optionally with a GitHub remote)
--   source 'github' → the bridge clones repo_url into ~/zarwa-projects/<slug>
-- The bridge decides the folder itself (never from the database) and refuses any slug it did not set
-- up. A Supabase database can be linked: only its URL and publishable key are stored here; the bridge
-- writes them to the project's .env.local. Secret keys never pass through this database.
--
-- bridge_project_grants says who may send jobs to a project; web-terminal-exec checks it before it
-- signs a job, and the project is part of the signed payload. Approval requests carry the project,
-- so the bridge commits and pushes in that project's folder.

CREATE TABLE public.bridge_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,39}$' AND slug <> 'main'),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 80),
  description text CHECK (length(description) <= 500),
  source text NOT NULL CHECK (source IN ('new', 'github')),
  repo_url text CHECK (repo_url IS NULL OR repo_url ~ '^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'),
  db_url text CHECK (db_url IS NULL OR db_url ~ '^https://[a-z0-9]{20}\.supabase\.co$'),
  db_public_key text CHECK (db_public_key IS NULL OR (length(db_public_key) <= 400 AND db_public_key !~ '^sb_secret_')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'setting_up', 'ready', 'error')),
  status_detail text CHECK (length(status_detail) <= 4000),
  local_path text,
  device_id uuid REFERENCES public.bridge_devices(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (source = 'new' OR repo_url IS NOT NULL),
  CHECK ((db_url IS NULL) = (db_public_key IS NULL))
);

CREATE TABLE public.bridge_project_grants (
  project_id uuid NOT NULL REFERENCES public.bridge_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);
CREATE INDEX bridge_project_grants_user_idx ON public.bridge_project_grants (user_id);

ALTER TABLE public.bridge_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bridge_project_grants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bridge_projects, public.bridge_project_grants FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bridge_projects, public.bridge_project_grants TO authenticated;

CREATE POLICY "principal manages projects" ON public.bridge_projects
  FOR ALL TO authenticated USING (public.team_has_role('principal')) WITH CHECK (public.team_has_role('principal'));
CREATE POLICY "granted users see their ready projects" ON public.bridge_projects
  FOR SELECT TO authenticated USING (
    status = 'ready' AND EXISTS (SELECT 1 FROM public.bridge_project_grants g WHERE g.project_id = bridge_projects.id AND g.user_id = auth.uid())
  );
CREATE POLICY "principal manages project grants" ON public.bridge_project_grants
  FOR ALL TO authenticated USING (public.team_has_role('principal')) WITH CHECK (public.team_has_role('principal'));
CREATE POLICY "users see their own project grants" ON public.bridge_project_grants
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- the principal edits name/description/links; the setup state belongs to the bridge
CREATE OR REPLACE FUNCTION public.bridge_projects_before_write()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF TG_OP = 'UPDATE' THEN
    NEW.slug := OLD.slug;
    NEW.source := OLD.source;
    NEW.created_by := OLD.created_by;
    NEW.created_at := OLD.created_at;
    IF current_user = 'authenticated' THEN
      NEW.local_path := OLD.local_path;
      NEW.device_id := OLD.device_id;
      -- changing the links (or asking again) sends the project back to the bridge
      IF NEW.status = 'pending' OR NEW.repo_url IS DISTINCT FROM OLD.repo_url
         OR NEW.db_url IS DISTINCT FROM OLD.db_url OR NEW.db_public_key IS DISTINCT FROM OLD.db_public_key THEN
        NEW.status := 'pending';
        NEW.status_detail := NULL;
      ELSE
        NEW.status := OLD.status;
        NEW.status_detail := OLD.status_detail;
      END IF;
    END IF;
  ELSIF current_user = 'authenticated' THEN
    NEW.status := 'pending';
    NEW.status_detail := NULL;
    NEW.local_path := NULL;
    NEW.device_id := NULL;
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER bridge_projects_before_write BEFORE INSERT OR UPDATE ON public.bridge_projects
FOR EACH ROW EXECUTE FUNCTION public.bridge_projects_before_write();

-- doorbell: a project waiting for setup wakes the online bridges (the bell carries no authority)
CREATE OR REPLACE FUNCTION public.bridge_projects_doorbell()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  d record;
BEGIN
  IF NEW.status = 'pending' THEN
    FOR d IN SELECT id FROM public.bridge_devices WHERE NOT revoked LOOP
      PERFORM realtime.send(jsonb_build_object('project', NEW.id), 'project', 'bridge-' || d.id::text, false);
    END LOOP;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER bridge_projects_doorbell AFTER INSERT OR UPDATE OF status ON public.bridge_projects
FOR EACH ROW EXECUTE FUNCTION public.bridge_projects_doorbell();

-- ---------------------------------------------------------------- bridge RPCs (anon + device key)
CREATE OR REPLACE FUNCTION public.bridge_project_claim(p_device_id uuid, p_auth_key text)
RETURNS SETOF public.bridge_projects LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r public.bridge_projects;
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  -- a setup interrupted by a bridge restart is tried again
  UPDATE public.bridge_projects SET status = 'pending', updated_at = now()
  WHERE status = 'setting_up' AND updated_at < now() - interval '15 minutes';

  SELECT * INTO r FROM public.bridge_projects
  WHERE status = 'pending' AND (device_id IS NULL OR device_id = p_device_id)
  ORDER BY updated_at LIMIT 1 FOR UPDATE SKIP LOCKED;
  IF r.id IS NULL THEN
    RETURN;
  END IF;
  UPDATE public.bridge_projects SET status = 'setting_up', device_id = p_device_id, status_detail = NULL
  WHERE id = r.id RETURNING * INTO r;
  RETURN NEXT r;
END $$;

CREATE OR REPLACE FUNCTION public.bridge_project_finish(
  p_device_id uuid, p_auth_key text, p_id uuid, p_status text, p_detail text DEFAULT NULL, p_path text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  IF p_status NOT IN ('ready', 'error') THEN
    RAISE EXCEPTION 'bad status';
  END IF;
  UPDATE public.bridge_projects
  SET status = p_status, status_detail = left(p_detail, 4000), local_path = coalesce(left(p_path, 500), local_path)
  WHERE id = p_id AND device_id = p_device_id AND status = 'setting_up';
END $$;

REVOKE EXECUTE ON FUNCTION public.bridge_projects_doorbell() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bridge_project_claim(uuid, text), public.bridge_project_finish(uuid, text, uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_project_claim(uuid, text), public.bridge_project_finish(uuid, text, uuid, text, text, text) TO anon, authenticated;

-- ---------------------------------------------------------------- jobs and approvals carry the project
ALTER TABLE public.bridge_jobs ADD COLUMN project text NOT NULL DEFAULT 'main'
  CHECK (project = 'main' OR project ~ '^[a-z0-9][a-z0-9-]{1,39}$');
ALTER TABLE public.terminal_deploy_requests ADD COLUMN project text NOT NULL DEFAULT 'main'
  CHECK (project = 'main' OR project ~ '^[a-z0-9][a-z0-9-]{1,39}$');

DROP FUNCTION public.bridge_poll(uuid, text, jsonb, boolean);
CREATE FUNCTION public.bridge_poll(p_device_id uuid, p_auth_key text, p_info jsonb DEFAULT NULL, p_reset boolean DEFAULT false)
RETURNS TABLE (id uuid, kind text, input text, resume_session text, is_principal boolean, issued_at bigint, signature text, user_email text, project text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  j public.bridge_jobs;
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  IF p_info IS NOT NULL THEN
    UPDATE public.bridge_devices SET info = p_info WHERE bridge_devices.id = p_device_id;
  END IF;
  IF p_reset THEN
    UPDATE public.bridge_jobs SET status = 'error', error = 'أُعيد تشغيل الجسر أثناء التنفيذ', finished_at = now()
    WHERE bridge_jobs.device_id = p_device_id AND bridge_jobs.status = 'running';
  END IF;
  -- jobs nobody picked up within 2 minutes are dropped
  UPDATE public.bridge_jobs SET status = 'error', error = 'لم يستلمه الجسر', finished_at = now()
  WHERE bridge_jobs.device_id = p_device_id AND bridge_jobs.status = 'queued' AND bridge_jobs.created_at < now() - interval '2 minutes';

  SELECT * INTO j FROM public.bridge_jobs bj
  WHERE bj.device_id = p_device_id AND bj.status = 'queued'
  ORDER BY bj.created_at LIMIT 1 FOR UPDATE SKIP LOCKED;
  IF j.id IS NULL THEN
    RETURN;
  END IF;
  UPDATE public.bridge_jobs SET status = 'running', started_at = now() WHERE bridge_jobs.id = j.id;
  RETURN QUERY SELECT j.id, j.kind, j.input, j.resume_session, j.is_principal, j.issued_at, j.signature,
    (SELECT s.email FROM public.user_terminal_sessions s WHERE s.id = j.session_id), j.project;
END $$;
REVOKE EXECUTE ON FUNCTION public.bridge_poll(uuid, text, jsonb, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_poll(uuid, text, jsonb, boolean) TO anon, authenticated;

DROP FUNCTION public.bridge_deploy_pending(uuid, text);
CREATE FUNCTION public.bridge_deploy_pending(p_device_id uuid, p_auth_key text, p_project text DEFAULT 'main')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  RETURN (SELECT jsonb_build_object('id', r.id, 'changed_files', r.changed_files, 'user_email', r.user_email)
          FROM public.terminal_deploy_requests r
          WHERE r.device_id = p_device_id AND r.status = 'pending' AND r.project = coalesce(p_project, 'main')
          ORDER BY r.created_at DESC LIMIT 1);
END $$;
REVOKE EXECUTE ON FUNCTION public.bridge_deploy_pending(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_deploy_pending(uuid, text, text) TO anon, authenticated;

DROP FUNCTION public.bridge_deploy_submit(uuid, text, uuid, text, text, jsonb, text, text, text, text, text);
CREATE FUNCTION public.bridge_deploy_submit(
  p_device_id uuid, p_auth_key text, p_job_id uuid, p_prompt text, p_commit_message text, p_changed_files jsonb,
  p_diff_preview text, p_diff_hash text, p_branch text,
  p_summary text DEFAULT NULL, p_details text DEFAULT NULL, p_project text DEFAULT 'main'
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  j public.bridge_jobs;
  v_user uuid;
  v_email text;
  v_agent text;
  v_project text := coalesce(p_project, 'main');
  r public.terminal_deploy_requests;
  v_summary text := nullif(btrim(left(p_summary, 600)), '');
  v_details text := nullif(btrim(left(p_details, 30000)), '');
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  IF p_job_id IS NOT NULL THEN
    SELECT * INTO j FROM public.bridge_jobs WHERE id = p_job_id AND device_id = p_device_id;
    IF j.id IS NULL THEN
      RAISE EXCEPTION 'unknown job';
    END IF;
    -- the job's (signed) project wins over what the caller says
    v_project := j.project;
    v_user := j.user_id;
    v_agent := CASE WHEN j.kind IN ('claude', 'antigravity', 'shell') THEN j.kind ELSE 'manual' END;
    SELECT s.email INTO v_email FROM public.user_terminal_sessions s WHERE s.id = j.session_id;
  ELSE
    v_agent := 'manual';
    SELECT m.user_id, lower(u.email) INTO v_user, v_email
    FROM public.team_members m JOIN auth.users u ON u.id = m.user_id
    WHERE m.role = 'principal' LIMIT 1;
  END IF;

  SELECT * INTO r FROM public.terminal_deploy_requests
  WHERE device_id = p_device_id AND status = 'pending' AND project = v_project ORDER BY created_at DESC LIMIT 1 FOR UPDATE;

  IF r.id IS NOT NULL THEN
    UPDATE public.terminal_deploy_requests
    SET changed_files = p_changed_files,
        diff_preview = left(p_diff_preview, 600000),
        diff_hash = p_diff_hash,
        branch = p_branch,
        prompt = left(coalesce(prompt, '') || E'\n\n— ' || coalesce(v_email, '?') || ': ' || coalesce(p_prompt, ''), 20000),
        summary = coalesce(v_summary, summary),
        details = CASE WHEN v_details IS NULL THEN details
                       WHEN details IS NULL THEN v_details
                       ELSE left(details || E'\n\n---\n\n' || v_details, 30000) END,
        agent = CASE WHEN agent IS DISTINCT FROM v_agent THEN coalesce(agent, v_agent) ELSE agent END,
        updated_at = now()
    WHERE id = r.id
    RETURNING * INTO r;
    RETURN jsonb_build_object('id', r.id, 'merged', true);
  END IF;

  INSERT INTO public.terminal_deploy_requests
    (device_id, job_id, user_id, user_email, prompt, commit_message, changed_files, diff_preview, diff_hash, branch, summary, details, agent, project)
  VALUES (p_device_id, j.id, v_user, v_email, left(p_prompt, 20000), left(btrim(p_commit_message), 300),
    p_changed_files, left(p_diff_preview, 600000), p_diff_hash, p_branch, v_summary, v_details, v_agent, v_project)
  RETURNING * INTO r;
  RETURN jsonb_build_object('id', r.id, 'merged', false);
END $$;
REVOKE EXECUTE ON FUNCTION public.bridge_deploy_submit(uuid, text, uuid, text, text, jsonb, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_deploy_submit(uuid, text, uuid, text, text, jsonb, text, text, text, text, text, text) TO anon, authenticated, service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.bridge_projects;
