-- Per-user choice of AI agent on the principal's computer: Claude Code or Antigravity.
-- usage_quotas.allow_claude now means "may use the AI agent"; usage_quotas.agent says which one.
-- The principal may use both. Antigravity jobs open the request in the Antigravity agent on the
-- computer (its CLI has no headless mode, so the reply stays in the app).

ALTER TABLE public.usage_quotas
  ADD COLUMN agent text NOT NULL DEFAULT 'claude' CHECK (agent IN ('claude', 'antigravity'));
COMMENT ON COLUMN public.usage_quotas.allow_claude IS 'May use the AI agent chosen in agent (Claude Code or Antigravity)';

ALTER TABLE public.bridge_jobs DROP CONSTRAINT bridge_jobs_kind_check;
ALTER TABLE public.bridge_jobs ADD CONSTRAINT bridge_jobs_kind_check CHECK (kind IN ('shell', 'claude', 'antigravity'));

-- terminal_begin_command(): unchanged checks; also returns the user's agent
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
    -- which AI agent this user's prompts go to (the principal may use both)
    'agent', CASE WHEN s.is_principal THEN 'any' ELSE coalesce(q.agent, 'claude') END,
    'allow_shell', s.is_principal OR coalesce(q.allow_shell, false),
    'session', jsonb_build_object('started_at', s.started_at, 'expires_at', s.expires_at, 'commands', s.commands_count + 1),
    'quota', CASE WHEN s.is_principal THEN NULL ELSE jsonb_build_object(
      'used_today', q.used_today, 'daily_limit', q.daily_limit, 'used_total', q.used_total,
      'total_limit', q.total_limit, 'per_minute_limit', q.per_minute_limit, 'session_minutes', q.session_minutes) END
  );
END $$;
