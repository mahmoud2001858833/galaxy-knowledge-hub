-- Admin push & deploy approval gate for the web terminal.
--
-- Nobody commits or pushes from /terminal: the bridge blocks git commit/push/branch changes for
-- Claude Code and shell jobs. When a job leaves changed files in the project, the bridge files a
-- terminal_deploy_requests row (or `submit` in /terminal does). Only the principal decides
-- (terminal_deploy_decide). The decision rings the device's doorbell; the bridge then commits and
-- pushes exactly the reviewed files (approve) or restores them (reject) and reports the result.
--
-- diff_hash fingerprints the reviewed files' contents: the bridge refuses to push or revert if the
-- files changed after the request, and the principal's approval must name the hash it reviewed.

CREATE TABLE public.terminal_deploy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES public.bridge_devices(id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.bridge_jobs(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  prompt text CHECK (length(prompt) <= 20000),
  commit_message text NOT NULL CHECK (length(btrim(commit_message)) BETWEEN 1 AND 300),
  changed_files jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(changed_files) = 'array'),
  diff_preview text CHECK (length(diff_preview) <= 600000),
  diff_hash text NOT NULL CHECK (diff_hash ~ '^[0-9a-f]{64}$'),
  branch text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'pushing', 'deployed', 'rejected', 'failed')),
  result_log text CHECK (length(result_log) <= 20000),
  commit_sha text,
  decided_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  claimed_at timestamptz,
  completed_at timestamptz
);
CREATE INDEX terminal_deploy_requests_status_idx ON public.terminal_deploy_requests (status, created_at DESC);
CREATE INDEX terminal_deploy_requests_device_idx ON public.terminal_deploy_requests (device_id)
  WHERE status IN ('pending', 'approved', 'rejected') AND completed_at IS NULL;

ALTER TABLE public.terminal_deploy_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.terminal_deploy_requests FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.terminal_deploy_requests FROM authenticated;
GRANT SELECT ON public.terminal_deploy_requests TO authenticated;
-- Read: the requester sees their own requests, the principal sees all. Writes only through the RPCs below.
CREATE POLICY "own deploy requests or principal" ON public.terminal_deploy_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.team_has_role('principal'));

-- ---------------------------------------------------------------- the principal decides
CREATE OR REPLACE FUNCTION public.terminal_deploy_decide(
  p_id uuid, p_approve boolean, p_diff_hash text, p_commit_message text DEFAULT NULL, p_reason text DEFAULT NULL
)
RETURNS public.terminal_deploy_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r public.terminal_deploy_requests;
BEGIN
  IF NOT public.terminal_is_principal(auth.uid()) THEN
    RAISE EXCEPTION 'الموافقة والرفض للرئيس فقط' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO r FROM public.terminal_deploy_requests WHERE id = p_id FOR UPDATE;
  IF r.id IS NULL THEN
    RAISE EXCEPTION 'الطلب غير موجود';
  END IF;
  IF r.status <> 'pending' THEN
    RAISE EXCEPTION 'الطلب لم يعد معلقاً (%)', r.status;
  END IF;
  IF p_diff_hash IS DISTINCT FROM r.diff_hash THEN
    RAISE EXCEPTION 'تغيّرت التعديلات منذ فتحتها؛ راجعها من جديد' USING ERRCODE = '40001';
  END IF;
  UPDATE public.terminal_deploy_requests
  SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
      commit_message = CASE WHEN p_approve AND length(btrim(coalesce(p_commit_message, ''))) BETWEEN 1 AND 300
                            THEN btrim(p_commit_message) ELSE commit_message END,
      result_log = CASE WHEN p_approve THEN NULL ELSE nullif(btrim(coalesce(p_reason, '')), '') END,
      decided_by = auth.uid(), decided_at = now(), updated_at = now()
  WHERE id = p_id
  RETURNING * INTO r;
  RETURN r;
END $$;

-- ---------------------------------------------------------------- doorbell: a decision wakes the bridge
CREATE OR REPLACE FUNCTION public.terminal_deploy_doorbell()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.device_id IS NOT NULL AND NEW.status IN ('approved', 'rejected') AND OLD.status = 'pending' THEN
    PERFORM realtime.send(jsonb_build_object('deploy', NEW.id, 'status', NEW.status), 'deploy', 'bridge-' || NEW.device_id::text, false);
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER terminal_deploy_doorbell AFTER UPDATE OF status ON public.terminal_deploy_requests
FOR EACH ROW EXECUTE FUNCTION public.terminal_deploy_doorbell();

-- ---------------------------------------------------------------- bridge RPCs (anon + device key)
-- The pending request of this device (its files are merged with a new job's files).
CREATE OR REPLACE FUNCTION public.bridge_deploy_pending(p_device_id uuid, p_auth_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  RETURN (SELECT jsonb_build_object('id', r.id, 'changed_files', r.changed_files, 'user_email', r.user_email)
          FROM public.terminal_deploy_requests r
          WHERE r.device_id = p_device_id AND r.status = 'pending'
          ORDER BY r.created_at DESC LIMIT 1);
END $$;

-- Files a request. The requester comes from the signed job (or is the principal for a request made
-- on the computer itself). A pending request of the same device is updated instead of duplicated.
CREATE OR REPLACE FUNCTION public.bridge_deploy_submit(
  p_device_id uuid, p_auth_key text, p_job_id uuid, p_prompt text, p_commit_message text,
  p_changed_files jsonb, p_diff_preview text, p_diff_hash text, p_branch text
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  j public.bridge_jobs;
  v_user uuid;
  v_email text;
  r public.terminal_deploy_requests;
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  IF p_job_id IS NOT NULL THEN
    SELECT * INTO j FROM public.bridge_jobs WHERE id = p_job_id AND device_id = p_device_id;
    IF j.id IS NULL THEN
      RAISE EXCEPTION 'unknown job';
    END IF;
    v_user := j.user_id;
    SELECT s.email INTO v_email FROM public.user_terminal_sessions s WHERE s.id = j.session_id;
  ELSE
    SELECT m.user_id, lower(u.email) INTO v_user, v_email
    FROM public.team_members m JOIN auth.users u ON u.id = m.user_id
    WHERE m.role = 'principal' LIMIT 1;
  END IF;

  SELECT * INTO r FROM public.terminal_deploy_requests
  WHERE device_id = p_device_id AND status = 'pending' ORDER BY created_at DESC LIMIT 1 FOR UPDATE;

  IF r.id IS NOT NULL THEN
    UPDATE public.terminal_deploy_requests
    SET changed_files = p_changed_files,
        diff_preview = left(p_diff_preview, 600000),
        diff_hash = p_diff_hash,
        branch = p_branch,
        prompt = left(coalesce(prompt, '') || E'\n\n— ' || coalesce(v_email, '?') || ': ' || coalesce(p_prompt, ''), 20000),
        updated_at = now()
    WHERE id = r.id
    RETURNING * INTO r;
    RETURN jsonb_build_object('id', r.id, 'merged', true);
  END IF;

  INSERT INTO public.terminal_deploy_requests
    (device_id, job_id, user_id, user_email, prompt, commit_message, changed_files, diff_preview, diff_hash, branch)
  VALUES (p_device_id, j.id, v_user, v_email, left(p_prompt, 20000), left(btrim(p_commit_message), 300),
    p_changed_files, left(p_diff_preview, 600000), p_diff_hash, p_branch)
  RETURNING * INTO r;
  RETURN jsonb_build_object('id', r.id, 'merged', false);
END $$;

-- Next decision to carry out: approved → pushing, or a rejection not yet reverted.
CREATE OR REPLACE FUNCTION public.bridge_deploy_claim(p_device_id uuid, p_auth_key text)
RETURNS SETOF public.terminal_deploy_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r public.terminal_deploy_requests;
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  -- a push interrupted by a bridge restart is reported, never retried blindly
  UPDATE public.terminal_deploy_requests
  SET status = 'failed', completed_at = now(), updated_at = now(),
      result_log = 'انقطع الجسر أثناء الرفع؛ تحقق من git log على الجهاز ثم أعد الإرسال'
  WHERE device_id = p_device_id AND status = 'pushing' AND claimed_at < now() - interval '10 minutes';

  SELECT * INTO r FROM public.terminal_deploy_requests t
  WHERE t.device_id = p_device_id AND t.completed_at IS NULL AND t.claimed_at IS NULL AND t.status IN ('approved', 'rejected')
  ORDER BY t.decided_at LIMIT 1 FOR UPDATE SKIP LOCKED;
  IF r.id IS NULL THEN
    RETURN;
  END IF;
  UPDATE public.terminal_deploy_requests
  SET status = CASE WHEN r.status = 'approved' THEN 'pushing' ELSE r.status END, claimed_at = now(), updated_at = now()
  WHERE id = r.id
  RETURNING * INTO r;
  RETURN NEXT r;
END $$;

CREATE OR REPLACE FUNCTION public.bridge_deploy_finish(
  p_device_id uuid, p_auth_key text, p_id uuid, p_status text, p_log text DEFAULT NULL, p_commit_sha text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  IF p_status NOT IN ('deployed', 'failed', 'rejected') THEN
    RAISE EXCEPTION 'bad status';
  END IF;
  UPDATE public.terminal_deploy_requests
  SET status = p_status,
      result_log = left(concat_ws(E'\n', CASE WHEN status = 'rejected' THEN result_log END, p_log), 20000),
      commit_sha = CASE WHEN p_commit_sha ~ '^[0-9a-f]{7,40}$' THEN p_commit_sha END,
      completed_at = now(), updated_at = now()
  WHERE id = p_id AND device_id = p_device_id AND completed_at IS NULL
    AND ((status = 'pushing' AND p_status IN ('deployed', 'failed')) OR (status = 'rejected' AND p_status = 'rejected'));
END $$;

REVOKE EXECUTE ON FUNCTION public.terminal_deploy_doorbell() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.terminal_deploy_decide(uuid, boolean, text, text, text),
  public.bridge_deploy_pending(uuid, text),
  public.bridge_deploy_submit(uuid, text, uuid, text, text, jsonb, text, text, text),
  public.bridge_deploy_claim(uuid, text),
  public.bridge_deploy_finish(uuid, text, uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.terminal_deploy_decide(uuid, boolean, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bridge_deploy_pending(uuid, text),
  public.bridge_deploy_submit(uuid, text, uuid, text, text, jsonb, text, text, text),
  public.bridge_deploy_claim(uuid, text),
  public.bridge_deploy_finish(uuid, text, uuid, text, text, text) TO anon, authenticated;

-- `submit` / `request-push` in /terminal is a signed bridge job too
ALTER TABLE public.bridge_jobs DROP CONSTRAINT bridge_jobs_kind_check;
ALTER TABLE public.bridge_jobs ADD CONSTRAINT bridge_jobs_kind_check CHECK (kind IN ('shell', 'claude', 'antigravity', 'submit'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.terminal_deploy_requests;
