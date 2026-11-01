-- Remote terminal (الطرفية): the principal sends prompts from the platform to Claude Code or
-- Antigravity running on their own computer.
--
-- Security model
-- * Only the principal (team_members role 'principal') can register devices and queue jobs.
-- * The computer runs tools/zarwa-bridge, which POLLS these RPCs (no inbound connection to
--   the computer). It authenticates with a device key whose SHA-256 is stored here; the
--   key itself is never stored.
-- * Every job carries an HMAC signature made in the browser with the device secret, which
--   only the principal's browser and the computer know. The bridge refuses unsigned, wrongly
--   signed or stale jobs, so a stolen platform session or database access cannot run
--   anything on the computer.

CREATE TABLE public.remote_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 60),
  auth_hash text NOT NULL CHECK (auth_hash ~ '^[0-9a-f]{64}$'),
  revoked boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz,
  bridge_info jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.remote_jobs (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES public.remote_devices(id) ON DELETE CASCADE,
  target text NOT NULL CHECK (target IN ('claude', 'antigravity')),
  prompt text NOT NULL CHECK (length(prompt) BETWEEN 1 AND 20000),
  resume_session text CHECK (resume_session IS NULL OR resume_session ~ '^[A-Za-z0-9-]{8,80}$'),
  issued_at bigint NOT NULL,
  signature text NOT NULL CHECK (signature ~ '^[0-9a-f]{64}$'),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'done', 'error', 'cancelled', 'rejected')),
  session_id text,
  result text,
  error text,
  cost_usd numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);
CREATE INDEX remote_jobs_device_queue_idx ON public.remote_jobs (device_id, created_at) WHERE status = 'queued';
CREATE INDEX remote_jobs_owner_idx ON public.remote_jobs (owner_id, created_at DESC);

CREATE TABLE public.remote_job_chunks (
  id bigserial PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.remote_jobs(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('text', 'tool', 'system')),
  content text NOT NULL CHECK (length(content) <= 20000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX remote_job_chunks_job_idx ON public.remote_job_chunks (job_id, id);

ALTER TABLE public.remote_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remote_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remote_job_chunks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.remote_devices, public.remote_jobs, public.remote_job_chunks FROM anon;
REVOKE ALL ON SEQUENCE public.remote_job_chunks_id_seq FROM anon, authenticated;

-- Devices: the principal manages their own. auth_hash is never readable back.
CREATE POLICY "principal reads own devices" ON public.remote_devices
  FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "principal registers devices" ON public.remote_devices
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.team_has_role('principal') AND NOT revoked);
CREATE POLICY "principal renames or revokes own devices" ON public.remote_devices
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "principal deletes own devices" ON public.remote_devices
  FOR DELETE TO authenticated USING (owner_id = auth.uid());
-- Column grants: auth_hash can be written once at registration but never read back or changed.
REVOKE SELECT, UPDATE ON public.remote_devices FROM authenticated;
GRANT SELECT (id, owner_id, name, revoked, last_seen_at, bridge_info, created_at) ON public.remote_devices TO authenticated;
GRANT UPDATE (name, revoked) ON public.remote_devices TO authenticated;

-- Jobs: queued by the principal for their own active device; state changes come from the bridge RPCs.
CREATE POLICY "principal reads own jobs" ON public.remote_jobs
  FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "principal queues jobs" ON public.remote_jobs
  FOR INSERT TO authenticated WITH CHECK (
    owner_id = auth.uid()
    AND public.team_has_role('principal')
    AND status = 'queued'
    AND session_id IS NULL AND result IS NULL AND error IS NULL AND started_at IS NULL AND finished_at IS NULL
    AND EXISTS (SELECT 1 FROM public.remote_devices d WHERE d.id = device_id AND d.owner_id = auth.uid() AND NOT d.revoked)
  );
CREATE POLICY "principal deletes own jobs" ON public.remote_jobs
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "principal reads own job output" ON public.remote_job_chunks
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.remote_jobs j WHERE j.id = job_id AND j.owner_id = auth.uid()));

-- Cancel from the platform
CREATE OR REPLACE FUNCTION public.remote_cancel_job(p_job_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.remote_jobs
  SET status = 'cancelled', finished_at = now()
  WHERE id = p_job_id AND owner_id = auth.uid() AND status IN ('queued', 'running');
END $$;

-- ---------------------------------------------------------------- bridge RPCs (anon + device key)
CREATE OR REPLACE FUNCTION public.remote_device_check(p_device_id uuid, p_auth_key text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  ok boolean;
BEGIN
  IF p_auth_key IS NULL OR length(p_auth_key) <> 64 THEN
    RETURN false;
  END IF;
  UPDATE public.remote_devices
  SET last_seen_at = now()
  WHERE id = p_device_id AND NOT revoked AND auth_hash = encode(extensions.digest(p_auth_key, 'sha256'), 'hex')
  RETURNING true INTO ok;
  RETURN coalesce(ok, false);
END $$;

-- Heartbeat + claim the oldest queued job for this device (or nothing).
-- p_reset: sent on bridge start-up; jobs this device left running are marked as failed.
CREATE OR REPLACE FUNCTION public.remote_bridge_poll(p_device_id uuid, p_auth_key text, p_info jsonb DEFAULT NULL, p_reset boolean DEFAULT false)
RETURNS TABLE (id uuid, target text, prompt text, resume_session text, issued_at bigint, signature text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  j public.remote_jobs;
BEGIN
  IF NOT public.remote_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  IF p_info IS NOT NULL THEN
    UPDATE public.remote_devices SET bridge_info = p_info WHERE remote_devices.id = p_device_id;
  END IF;
  IF p_reset THEN
    UPDATE public.remote_jobs
    SET status = 'error', error = 'أُعيد تشغيل الجسر أثناء التنفيذ', finished_at = now()
    WHERE remote_jobs.device_id = p_device_id AND remote_jobs.status = 'running';
  END IF;

  SELECT * INTO j FROM public.remote_jobs rj
  WHERE rj.device_id = p_device_id AND rj.status = 'queued'
  ORDER BY rj.created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF j.id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.remote_jobs SET status = 'running', started_at = now() WHERE remote_jobs.id = j.id;
  RETURN QUERY SELECT j.id, j.target, j.prompt, j.resume_session, j.issued_at, j.signature;
END $$;

-- Append output; returns the job's current status so the bridge can stop on cancel.
CREATE OR REPLACE FUNCTION public.remote_bridge_output(p_device_id uuid, p_auth_key text, p_job_id uuid, p_chunks jsonb)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status text;
BEGIN
  IF NOT public.remote_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  SELECT status INTO v_status FROM public.remote_jobs WHERE id = p_job_id AND device_id = p_device_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'unknown job';
  END IF;
  IF v_status = 'running' AND jsonb_typeof(p_chunks) = 'array' THEN
    INSERT INTO public.remote_job_chunks (job_id, kind, content)
    SELECT p_job_id, c ->> 'kind', left(c ->> 'content', 20000)
    FROM jsonb_array_elements(p_chunks) AS c
    WHERE c ->> 'kind' IN ('text', 'tool', 'system') AND coalesce(c ->> 'content', '') <> ''
    LIMIT 200;
  END IF;
  RETURN v_status;
END $$;

CREATE OR REPLACE FUNCTION public.remote_bridge_finish(
  p_device_id uuid, p_auth_key text, p_job_id uuid, p_status text,
  p_session_id text DEFAULT NULL, p_result text DEFAULT NULL, p_error text DEFAULT NULL, p_cost numeric DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.remote_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  IF p_status NOT IN ('done', 'error', 'rejected') THEN
    RAISE EXCEPTION 'bad status';
  END IF;
  UPDATE public.remote_jobs
  SET status = CASE WHEN status = 'cancelled' THEN 'cancelled' ELSE p_status END,
      session_id = CASE WHEN p_session_id ~ '^[A-Za-z0-9-]{8,80}$' THEN p_session_id END,
      result = left(p_result, 100000),
      error = left(p_error, 5000),
      cost_usd = p_cost,
      finished_at = now()
  WHERE id = p_job_id AND device_id = p_device_id AND status IN ('running', 'cancelled');
END $$;

REVOKE EXECUTE ON FUNCTION public.remote_device_check(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.remote_cancel_job(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remote_cancel_job(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.remote_bridge_poll(uuid, text, jsonb, boolean), public.remote_bridge_output(uuid, text, uuid, jsonb),
  public.remote_bridge_finish(uuid, text, uuid, text, text, text, text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remote_bridge_poll(uuid, text, jsonb, boolean), public.remote_bridge_output(uuid, text, uuid, jsonb),
  public.remote_bridge_finish(uuid, text, uuid, text, text, text, text, numeric) TO anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.remote_jobs, public.remote_job_chunks;
