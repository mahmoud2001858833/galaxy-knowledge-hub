-- Terminal session control (phase A)
-- * terminal_extend_session(): the principal adds minutes to a live member session.
-- * terminal_admin_end_session(): the principal ends one session (the member's screen locks through realtime).
-- * An agent job must not be lost when the member leaves the page: leaving closes the session
--   (pagehide → terminal_end_session) and the old trigger cancelled every job of that session.
--   Now a session that is closed by its user or runs out of time keeps its agent / submit jobs running
--   on the bridge (the member re-attaches to them when /terminal opens again). Shell jobs still stop,
--   and a session ended by the principal (kill switch, ban, revoke) still cancels everything.

CREATE OR REPLACE FUNCTION public.terminal_session_cancel_jobs()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status <> 'active' AND OLD.status = 'active' THEN
    UPDATE public.bridge_jobs SET status = 'cancelled', finished_at = now(), error = coalesce(NEW.ended_reason, 'انتهت الجلسة')
    WHERE session_id = NEW.id AND status IN ('queued', 'running')
      AND (NEW.status = 'terminated' OR kind = 'shell');
  END IF;
  RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.terminal_extend_session(p_session_id uuid, p_minutes integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s public.user_terminal_sessions;
BEGIN
  IF NOT public.terminal_is_principal(auth.uid()) THEN
    RAISE EXCEPTION 'للرئيس فقط' USING ERRCODE = '42501';
  END IF;
  IF p_minutes IS NULL OR p_minutes < 1 OR p_minutes > 1440 THEN
    RAISE EXCEPTION 'عدد الدقائق بين 1 و1440';
  END IF;

  SELECT * INTO s FROM public.user_terminal_sessions WHERE id = p_session_id FOR UPDATE;
  IF s.id IS NULL THEN
    RAISE EXCEPTION 'الجلسة غير موجودة' USING ERRCODE = 'P0002';
  END IF;
  IF s.status <> 'active' THEN
    RAISE EXCEPTION 'الجلسة منتهية';
  END IF;

  -- no time limit (principal): nothing to extend
  IF s.expires_at IS NOT NULL THEN
    UPDATE public.user_terminal_sessions
    SET expires_at = greatest(expires_at, now()) + make_interval(mins => p_minutes)
    WHERE id = s.id
    RETURNING * INTO s;
  END IF;

  RETURN jsonb_build_object('ok', true, 'session_id', s.id, 'expires_at', s.expires_at);
END $$;

CREATE OR REPLACE FUNCTION public.terminal_admin_end_session(p_session_id uuid, p_reason text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count integer;
BEGIN
  IF NOT public.terminal_is_principal(auth.uid()) THEN
    RAISE EXCEPTION 'للرئيس فقط' USING ERRCODE = '42501';
  END IF;
  UPDATE public.user_terminal_sessions
  SET status = 'terminated', ended_at = now(), terminated_by = auth.uid(),
      ended_reason = coalesce(nullif(btrim(left(p_reason, 300)), ''), 'أنهاها الرئيس')
  WHERE id = p_session_id AND status = 'active';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END $$;

REVOKE EXECUTE ON FUNCTION public.terminal_extend_session(uuid, integer), public.terminal_admin_end_session(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.terminal_extend_session(uuid, integer), public.terminal_admin_end_session(uuid, text) TO authenticated;

-- the member's latest unfinished agent job, from any session (re-attach on /terminal)
CREATE INDEX IF NOT EXISTS bridge_jobs_user_open_idx ON public.bridge_jobs (user_id, created_at DESC) WHERE status IN ('queued', 'running');
