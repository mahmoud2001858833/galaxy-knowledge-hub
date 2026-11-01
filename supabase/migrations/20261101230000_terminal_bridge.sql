-- Local Mac bridge for the web terminal: commands typed in /terminal can run on the principal's
-- computer (shell) or be handed to Claude Code there, with output streamed back live.
--
-- Flow: browser → web-terminal-exec (JWT + terminal_begin_command(): access, quota, ban, session)
--   → inserts a bridge_jobs row signed with HMAC(BRIDGE_MASTER_KEY, device_id) — a key that lives
--   only in the Edge Function secrets and on the bridge → a trigger rings the device's realtime
--   "doorbell" → scripts/local-bridge.mjs (outbound only) claims the job with its device key,
--   verifies the signature, runs it and streams chunks back → the browser follows the job and its
--   chunks through realtime.
-- Kill switch: ending a session (or banning / revoking) cancels its jobs; the doorbell tells the
-- bridge, which kills the process group.

-- ---------------------------------------------------------------- per-user bridge permissions
ALTER TABLE public.usage_quotas
  ADD COLUMN allow_claude boolean NOT NULL DEFAULT false,
  ADD COLUMN allow_shell boolean NOT NULL DEFAULT false;

-- terminal_begin_command(): same checks as before, now also returns the bridge permissions
CREATE OR REPLACE FUNCTION public.terminal_begin_command(p_user_id uuid, p_session_id uuid, p_command text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s public.user_terminal_sessions;
  q public.usage_quotas;
  v_today date := (now() AT TIME ZONE 'Asia/Amman')::date;
  v_recent integer;
  v_reason text;
  v_log bigint;
BEGIN
  SELECT * INTO s FROM public.user_terminal_sessions WHERE id = p_session_id AND user_id = p_user_id FOR UPDATE;
  IF s.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_session', 'session_ended', true);
  END IF;
  IF s.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'session_' || s.status, 'session_ended', true, 'detail', s.ended_reason);
  END IF;
  IF s.expires_at IS NOT NULL AND s.expires_at < now() THEN
    UPDATE public.user_terminal_sessions SET status = 'expired', ended_at = now(), ended_reason = 'انتهى وقت الجلسة' WHERE id = s.id;
    RETURN jsonb_build_object('ok', false, 'reason', 'session_expired', 'session_ended', true);
  END IF;

  IF NOT s.is_principal THEN
    SELECT * INTO q FROM public.usage_quotas WHERE user_id = p_user_id FOR UPDATE;
    IF q.id IS NULL OR NOT q.enabled THEN
      v_reason := 'no_access';
    ELSIF q.banned THEN
      v_reason := 'banned';
    ELSE
      IF q.usage_day <> v_today THEN
        q.used_today := 0;
        q.usage_day := v_today;
      END IF;
      SELECT count(*) INTO v_recent FROM public.terminal_command_logs
      WHERE user_id = p_user_id AND created_at > now() - interval '1 minute' AND status <> 'denied';
      IF q.used_today >= q.daily_limit THEN
        v_reason := 'daily_limit';
      ELSIF q.total_limit IS NOT NULL AND q.used_total >= q.total_limit THEN
        v_reason := 'total_limit';
      ELSIF v_recent >= q.per_minute_limit THEN
        v_reason := 'rate_limit';
      END IF;
    END IF;

    IF v_reason IS NOT NULL THEN
      INSERT INTO public.terminal_command_logs (session_id, user_id, command, status, output_preview)
      VALUES (s.id, p_user_id, left(p_command, 1000), 'denied', v_reason);
      IF v_reason IN ('no_access', 'banned') THEN
        UPDATE public.user_terminal_sessions
        SET status = 'terminated', ended_at = now(), ended_reason = CASE WHEN v_reason = 'banned' THEN 'الحساب محظور' ELSE 'سُحبت الصلاحية' END
        WHERE id = s.id;
      END IF;
      RETURN jsonb_build_object('ok', false, 'reason', v_reason, 'session_ended', v_reason IN ('no_access', 'banned'),
        'quota', jsonb_build_object('used_today', q.used_today, 'daily_limit', q.daily_limit, 'used_total', q.used_total,
                                    'total_limit', q.total_limit, 'per_minute_limit', q.per_minute_limit));
    END IF;

    UPDATE public.usage_quotas
    SET used_today = q.used_today + 1, used_total = q.used_total + 1, usage_day = q.usage_day
    WHERE id = q.id
    RETURNING * INTO q;
  END IF;

  UPDATE public.user_terminal_sessions SET commands_count = commands_count + 1, last_activity_at = now() WHERE id = s.id;
  INSERT INTO public.terminal_command_logs (session_id, user_id, command) VALUES (s.id, p_user_id, left(p_command, 1000))
  RETURNING id INTO v_log;

  RETURN jsonb_build_object(
    'ok', true, 'log_id', v_log, 'is_principal', s.is_principal, 'email', s.email,
    'allow_claude', s.is_principal OR coalesce(q.allow_claude, false),
    'allow_shell', s.is_principal OR coalesce(q.allow_shell, false),
    'session', jsonb_build_object('started_at', s.started_at, 'expires_at', s.expires_at, 'commands', s.commands_count + 1),
    'quota', CASE WHEN s.is_principal THEN NULL ELSE jsonb_build_object(
      'used_today', q.used_today, 'daily_limit', q.daily_limit, 'used_total', q.used_total,
      'total_limit', q.total_limit, 'per_minute_limit', q.per_minute_limit, 'session_minutes', q.session_minutes) END
  );
END $$;

-- ---------------------------------------------------------------- devices
CREATE TABLE public.bridge_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 60),
  auth_hash text NOT NULL CHECK (auth_hash ~ '^[0-9a-f]{64}$'),
  revoked boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz,
  info jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------- jobs
CREATE TABLE public.bridge_jobs (
  id uuid PRIMARY KEY,
  device_id uuid NOT NULL REFERENCES public.bridge_devices(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.user_terminal_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_id bigint REFERENCES public.terminal_command_logs(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('shell', 'claude')),
  input text NOT NULL CHECK (length(input) BETWEEN 1 AND 20000),
  resume_session text CHECK (resume_session IS NULL OR resume_session ~ '^[A-Za-z0-9-]{8,80}$'),
  is_principal boolean NOT NULL,
  issued_at bigint NOT NULL,
  signature text NOT NULL CHECK (signature ~ '^[0-9a-f]{64}$'),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'done', 'error', 'cancelled', 'rejected')),
  exit_code integer,
  claude_session text,
  error text,
  cost_usd numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);
CREATE INDEX bridge_jobs_queue_idx ON public.bridge_jobs (device_id, created_at) WHERE status = 'queued';
CREATE INDEX bridge_jobs_session_idx ON public.bridge_jobs (session_id) WHERE status IN ('queued', 'running');

CREATE TABLE public.bridge_job_chunks (
  id bigserial PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.bridge_jobs(id) ON DELETE CASCADE,
  stream text NOT NULL CHECK (stream IN ('out', 'err', 'sys')),
  data text NOT NULL CHECK (length(data) <= 20000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bridge_job_chunks_job_idx ON public.bridge_job_chunks (job_id, id);

ALTER TABLE public.bridge_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bridge_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bridge_job_chunks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bridge_devices, public.bridge_jobs, public.bridge_job_chunks FROM anon;
REVOKE ALL ON public.bridge_devices FROM authenticated;
GRANT SELECT (id, name, revoked, last_seen_at, info, created_at), UPDATE (name, revoked), DELETE ON public.bridge_devices TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.bridge_jobs, public.bridge_job_chunks FROM authenticated;
REVOKE ALL ON SEQUENCE public.bridge_job_chunks_id_seq FROM anon, authenticated;

CREATE POLICY "principal manages devices" ON public.bridge_devices
  FOR ALL TO authenticated USING (public.team_has_role('principal')) WITH CHECK (public.team_has_role('principal'));
CREATE POLICY "own jobs or principal" ON public.bridge_jobs
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.team_has_role('principal'));
CREATE POLICY "output of own jobs or principal" ON public.bridge_job_chunks
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.bridge_jobs j WHERE j.id = job_id));

-- Bridge status for anyone allowed to use the terminal (no secrets)
CREATE OR REPLACE FUNCTION public.bridge_status()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN public.team_has_role('principal')
      OR EXISTS (SELECT 1 FROM public.usage_quotas q WHERE q.user_id = auth.uid() AND q.enabled AND NOT q.banned)
    THEN coalesce((
      SELECT jsonb_build_object(
        'online', coalesce(d.last_seen_at > now() - interval '20 seconds', false),
        'last_seen_at', d.last_seen_at,
        'name', d.name,
        'host', d.info ->> 'host',
        'workdir', CASE WHEN public.team_has_role('principal') THEN d.info ->> 'workdir' END,
        'claude', d.info ->> 'claude',
        'running', (SELECT count(*) FROM public.bridge_jobs j WHERE j.device_id = d.id AND j.status = 'running'))
      FROM public.bridge_devices d WHERE NOT d.revoked ORDER BY d.last_seen_at DESC NULLS LAST LIMIT 1),
      jsonb_build_object('online', false, 'paired', false))
    ELSE NULL END
$$;

-- Owner or principal stops a job (Ctrl+C)
CREATE OR REPLACE FUNCTION public.bridge_cancel_job(p_job_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.bridge_jobs SET status = 'cancelled', finished_at = now(), error = coalesce(error, 'أُلغي')
  WHERE id = p_job_id AND status IN ('queued', 'running')
    AND (user_id = auth.uid() OR public.team_has_role('principal'));
$$;

-- ---------------------------------------------------------------- doorbell + kill switch
-- The doorbell carries no authority: it only tells the bridge to poll (new job) or re-check (cancel).
CREATE OR REPLACE FUNCTION public.bridge_jobs_doorbell()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled') THEN
    PERFORM realtime.send(jsonb_build_object('job', NEW.id, 'status', NEW.status), 'job', 'bridge-' || NEW.device_id::text, false);
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER bridge_jobs_doorbell AFTER INSERT OR UPDATE OF status ON public.bridge_jobs
FOR EACH ROW EXECUTE FUNCTION public.bridge_jobs_doorbell();

-- A session that ends (kill switch, ban, revoke, expiry, exit) cancels its bridge jobs.
CREATE OR REPLACE FUNCTION public.terminal_session_cancel_jobs()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status <> 'active' AND OLD.status = 'active' THEN
    UPDATE public.bridge_jobs SET status = 'cancelled', finished_at = now(), error = coalesce(NEW.ended_reason, 'انتهت الجلسة')
    WHERE session_id = NEW.id AND status IN ('queued', 'running');
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER terminal_session_cancel_jobs AFTER UPDATE OF status ON public.user_terminal_sessions
FOR EACH ROW EXECUTE FUNCTION public.terminal_session_cancel_jobs();

-- ---------------------------------------------------------------- bridge RPCs (anon + device key)
CREATE OR REPLACE FUNCTION public.bridge_device_check(p_device_id uuid, p_auth_key text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  ok boolean;
BEGIN
  IF p_auth_key IS NULL OR length(p_auth_key) <> 64 THEN
    RETURN false;
  END IF;
  UPDATE public.bridge_devices SET last_seen_at = now()
  WHERE id = p_device_id AND NOT revoked AND auth_hash = encode(extensions.digest(p_auth_key, 'sha256'), 'hex')
  RETURNING true INTO ok;
  RETURN coalesce(ok, false);
END $$;

-- Heartbeat; claims the oldest queued job. p_reset (bridge start-up) fails jobs it left running.
CREATE OR REPLACE FUNCTION public.bridge_poll(p_device_id uuid, p_auth_key text, p_info jsonb DEFAULT NULL, p_reset boolean DEFAULT false)
RETURNS TABLE (id uuid, kind text, input text, resume_session text, is_principal boolean, issued_at bigint, signature text, user_email text)
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
    (SELECT s.email FROM public.user_terminal_sessions s WHERE s.id = j.session_id);
END $$;

-- Appends output; returns the job status so the bridge stops on cancel.
CREATE OR REPLACE FUNCTION public.bridge_output(p_device_id uuid, p_auth_key text, p_job_id uuid, p_chunks jsonb)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status text;
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  SELECT status INTO v_status FROM public.bridge_jobs WHERE id = p_job_id AND device_id = p_device_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'unknown job';
  END IF;
  IF v_status = 'running' AND jsonb_typeof(p_chunks) = 'array' THEN
    INSERT INTO public.bridge_job_chunks (job_id, stream, data)
    SELECT p_job_id, c ->> 'stream', left(c ->> 'data', 20000)
    FROM jsonb_array_elements(p_chunks) AS c
    WHERE c ->> 'stream' IN ('out', 'err', 'sys') AND coalesce(c ->> 'data', '') <> ''
    LIMIT 200;
  END IF;
  RETURN v_status;
END $$;

CREATE OR REPLACE FUNCTION public.bridge_finish(
  p_device_id uuid, p_auth_key text, p_job_id uuid, p_status text,
  p_exit_code integer DEFAULT NULL, p_claude_session text DEFAULT NULL, p_error text DEFAULT NULL,
  p_cost numeric DEFAULT NULL, p_preview text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  j public.bridge_jobs;
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  IF p_status NOT IN ('done', 'error', 'rejected') THEN
    RAISE EXCEPTION 'bad status';
  END IF;
  UPDATE public.bridge_jobs
  SET status = CASE WHEN status = 'cancelled' THEN 'cancelled' ELSE p_status END,
      exit_code = p_exit_code,
      claude_session = CASE WHEN p_claude_session ~ '^[A-Za-z0-9-]{8,80}$' THEN p_claude_session END,
      error = coalesce(error, left(p_error, 5000)),
      cost_usd = p_cost,
      finished_at = coalesce(finished_at, now())
  WHERE id = p_job_id AND device_id = p_device_id AND status IN ('running', 'cancelled')
  RETURNING * INTO j;

  IF j.log_id IS NOT NULL THEN
    PERFORM public.terminal_finish_command(j.log_id,
      CASE WHEN j.status = 'done' AND coalesce(j.exit_code, 0) = 0 THEN 'ok' ELSE 'error' END,
      coalesce(p_preview, j.error, ''), (extract(epoch FROM (j.finished_at - j.created_at)) * 1000)::integer);
  END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.bridge_device_check(uuid, text), public.bridge_jobs_doorbell(), public.terminal_session_cancel_jobs()
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bridge_poll(uuid, text, jsonb, boolean), public.bridge_output(uuid, text, uuid, jsonb),
  public.bridge_finish(uuid, text, uuid, text, integer, text, text, numeric, text), public.bridge_status(), public.bridge_cancel_job(uuid)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_poll(uuid, text, jsonb, boolean), public.bridge_output(uuid, text, uuid, jsonb),
  public.bridge_finish(uuid, text, uuid, text, integer, text, text, numeric, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bridge_status(), public.bridge_cancel_job(uuid) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.bridge_jobs, public.bridge_job_chunks;

-- used by web-terminal-exec (cancel / pair)
GRANT EXECUTE ON FUNCTION public.terminal_is_principal(uuid) TO service_role;
