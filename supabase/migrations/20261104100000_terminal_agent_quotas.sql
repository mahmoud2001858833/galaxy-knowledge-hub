-- Web terminal: a separate allowance per AI agent (Claude Code / Antigravity), token accounting,
-- and a written explanation on every approval request.
--
-- * usage_quotas: allow_claude now means Claude Code only; allow_antigravity is new (a user may have
--   both). Each agent has a daily message limit and a daily token limit (NULL = no token limit),
--   counted in Asia/Amman days (agent_usage_day, separate from the command counter's usage_day).
--   `agent` stays as the default agent for `ai <prompt>`.
-- * terminal_agent_begin(): called by web-terminal-exec (service_role) before a job goes to the
--   bridge. Checks the agent permission and both limits, then counts one message.
-- * bridge_finish(): now takes the tokens the agent reported and adds them to the user's usage.
--   The limit is checked before each message, so the last message of the day can go over it.
-- * terminal_deploy_requests.summary/details: the agent's own one-line summary and per-file
--   explanation, written by the bridge (falls back to a summary built from the file list).

-- ---------------------------------------------------------------- per-agent allowance
ALTER TABLE public.usage_quotas
  ADD COLUMN allow_antigravity boolean NOT NULL DEFAULT false,
  ADD COLUMN claude_daily_messages integer NOT NULL DEFAULT 20 CHECK (claude_daily_messages BETWEEN 0 AND 100000),
  ADD COLUMN claude_daily_tokens bigint DEFAULT 500000 CHECK (claude_daily_tokens IS NULL OR claude_daily_tokens >= 0),
  ADD COLUMN antigravity_daily_messages integer NOT NULL DEFAULT 20 CHECK (antigravity_daily_messages BETWEEN 0 AND 100000),
  ADD COLUMN antigravity_daily_tokens bigint DEFAULT 500000 CHECK (antigravity_daily_tokens IS NULL OR antigravity_daily_tokens >= 0),
  ADD COLUMN claude_used_messages integer NOT NULL DEFAULT 0,
  ADD COLUMN claude_used_tokens bigint NOT NULL DEFAULT 0,
  ADD COLUMN antigravity_used_messages integer NOT NULL DEFAULT 0,
  ADD COLUMN antigravity_used_tokens bigint NOT NULL DEFAULT 0,
  ADD COLUMN claude_tokens_total bigint NOT NULL DEFAULT 0,
  ADD COLUMN antigravity_tokens_total bigint NOT NULL DEFAULT 0,
  ADD COLUMN agent_usage_day date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Amman')::date;

COMMENT ON COLUMN public.usage_quotas.allow_claude IS 'May use Claude Code on the principal''s computer';
COMMENT ON COLUMN public.usage_quotas.allow_antigravity IS 'May use the Antigravity agent on the principal''s computer';
COMMENT ON COLUMN public.usage_quotas.agent IS 'Default agent for `ai <prompt>`';

-- the old single "AI agent" choice becomes the matching per-agent permission
UPDATE public.usage_quotas
SET allow_antigravity = allow_claude AND agent = 'antigravity',
    allow_claude = allow_claude AND agent = 'claude';

ALTER TABLE public.bridge_jobs
  ADD COLUMN tokens_in bigint,
  ADD COLUMN tokens_out bigint,
  ADD COLUMN tokens_estimated boolean NOT NULL DEFAULT false;

-- ---------------------------------------------------------------- begin command: also report allow_antigravity
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
    'allow_antigravity', s.is_principal OR coalesce(q.allow_antigravity, false),
    -- default agent for `ai <prompt>` (the principal may use both)
    'agent', CASE WHEN s.is_principal THEN 'any' ELSE coalesce(q.agent, 'claude') END,
    'allow_shell', s.is_principal OR coalesce(q.allow_shell, false),
    'session', jsonb_build_object('started_at', s.started_at, 'expires_at', s.expires_at, 'commands', s.commands_count + 1),
    'quota', CASE WHEN s.is_principal THEN NULL ELSE jsonb_build_object(
      'used_today', q.used_today, 'daily_limit', q.daily_limit, 'used_total', q.used_total,
      'total_limit', q.total_limit, 'per_minute_limit', q.per_minute_limit, 'session_minutes', q.session_minutes) END
  );
END $$;

-- ---------------------------------------------------------------- one message to an agent
-- p_agent: 'claude' | 'antigravity' | 'auto' (= `ai`: the default agent if allowed, else the other one)
CREATE OR REPLACE FUNCTION public.terminal_agent_begin(p_user_id uuid, p_agent text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  q public.usage_quotas;
  v_today date := (now() AT TIME ZONE 'Asia/Amman')::date;
  v_agent text := p_agent;
  v_allowed boolean;
  v_msgs integer;
  v_msg_limit integer;
  v_tokens bigint;
  v_token_limit bigint;
BEGIN
  IF p_agent NOT IN ('claude', 'antigravity', 'auto') THEN
    RAISE EXCEPTION 'bad agent';
  END IF;
  IF public.terminal_is_principal(p_user_id) THEN
    RETURN jsonb_build_object('ok', true, 'agent', CASE WHEN p_agent = 'auto' THEN 'claude' ELSE p_agent END, 'unlimited', true);
  END IF;

  SELECT * INTO q FROM public.usage_quotas WHERE user_id = p_user_id FOR UPDATE;
  IF q.id IS NULL OR NOT q.enabled OR q.banned THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_access');
  END IF;
  IF v_agent = 'auto' THEN
    v_agent := CASE
      WHEN q.agent = 'antigravity' AND q.allow_antigravity THEN 'antigravity'
      WHEN q.allow_claude THEN 'claude'
      WHEN q.allow_antigravity THEN 'antigravity'
      ELSE coalesce(q.agent, 'claude') END;
  END IF;

  IF q.agent_usage_day <> v_today THEN
    UPDATE public.usage_quotas
    SET claude_used_messages = 0, claude_used_tokens = 0, antigravity_used_messages = 0, antigravity_used_tokens = 0,
        agent_usage_day = v_today
    WHERE id = q.id
    RETURNING * INTO q;
  END IF;

  IF v_agent = 'claude' THEN
    v_allowed := q.allow_claude; v_msgs := q.claude_used_messages; v_msg_limit := q.claude_daily_messages;
    v_tokens := q.claude_used_tokens; v_token_limit := q.claude_daily_tokens;
  ELSE
    v_allowed := q.allow_antigravity; v_msgs := q.antigravity_used_messages; v_msg_limit := q.antigravity_daily_messages;
    v_tokens := q.antigravity_used_tokens; v_token_limit := q.antigravity_daily_tokens;
  END IF;

  IF NOT v_allowed THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'agent_not_allowed', 'agent', v_agent);
  END IF;
  IF v_msgs >= v_msg_limit THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'agent_messages', 'agent', v_agent, 'used', v_msgs, 'limit', v_msg_limit);
  END IF;
  IF v_token_limit IS NOT NULL AND v_tokens >= v_token_limit THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'agent_tokens', 'agent', v_agent, 'used', v_tokens, 'limit', v_token_limit);
  END IF;

  IF v_agent = 'claude' THEN
    UPDATE public.usage_quotas SET claude_used_messages = claude_used_messages + 1 WHERE id = q.id;
  ELSE
    UPDATE public.usage_quotas SET antigravity_used_messages = antigravity_used_messages + 1 WHERE id = q.id;
  END IF;
  RETURN jsonb_build_object('ok', true, 'agent', v_agent,
    'messages', v_msgs + 1, 'messages_limit', v_msg_limit, 'tokens', v_tokens, 'tokens_limit', v_token_limit);
END $$;

REVOKE EXECUTE ON FUNCTION public.terminal_agent_begin(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.terminal_agent_begin(uuid, text) TO service_role;

-- ---------------------------------------------------------------- bridge_finish: record tokens
DROP FUNCTION public.bridge_finish(uuid, text, uuid, text, integer, text, text, numeric, text);
CREATE FUNCTION public.bridge_finish(
  p_device_id uuid, p_auth_key text, p_job_id uuid, p_status text, p_exit_code integer DEFAULT NULL,
  p_claude_session text DEFAULT NULL, p_error text DEFAULT NULL, p_cost numeric DEFAULT NULL, p_preview text DEFAULT NULL,
  p_tokens_in bigint DEFAULT NULL, p_tokens_out bigint DEFAULT NULL, p_tokens_estimated boolean DEFAULT false
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  j public.bridge_jobs;
  v_counted boolean;
  v_tokens bigint := greatest(coalesce(p_tokens_in, 0), 0) + greatest(coalesce(p_tokens_out, 0), 0);
  v_today date := (now() AT TIME ZONE 'Asia/Amman')::date;
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  IF p_status NOT IN ('done', 'error', 'rejected') THEN
    RAISE EXCEPTION 'bad status';
  END IF;
  SELECT (tokens_in IS NOT NULL OR tokens_out IS NOT NULL) INTO v_counted
  FROM public.bridge_jobs WHERE id = p_job_id AND device_id = p_device_id FOR UPDATE;

  UPDATE public.bridge_jobs
  SET status = CASE WHEN status = 'cancelled' THEN 'cancelled' ELSE p_status END,
      exit_code = p_exit_code,
      claude_session = CASE WHEN p_claude_session ~ '^[A-Za-z0-9-]{8,80}$' THEN p_claude_session END,
      error = coalesce(error, left(p_error, 5000)),
      cost_usd = p_cost,
      tokens_in = coalesce(tokens_in, greatest(p_tokens_in, 0)),
      tokens_out = coalesce(tokens_out, greatest(p_tokens_out, 0)),
      tokens_estimated = CASE WHEN tokens_in IS NULL AND tokens_out IS NULL THEN coalesce(p_tokens_estimated, false) ELSE tokens_estimated END,
      finished_at = coalesce(finished_at, now())
  WHERE id = p_job_id AND device_id = p_device_id AND status IN ('running', 'cancelled')
  RETURNING * INTO j;

  -- tokens count against the user's daily agent allowance (once per job)
  IF j.id IS NOT NULL AND NOT coalesce(v_counted, false) AND v_tokens > 0 AND NOT j.is_principal AND j.kind IN ('claude', 'antigravity') THEN
    UPDATE public.usage_quotas
    SET claude_used_tokens = CASE WHEN j.kind <> 'claude' THEN claude_used_tokens
                                  WHEN agent_usage_day = v_today THEN claude_used_tokens + v_tokens ELSE v_tokens END,
        antigravity_used_tokens = CASE WHEN j.kind <> 'antigravity' THEN antigravity_used_tokens
                                       WHEN agent_usage_day = v_today THEN antigravity_used_tokens + v_tokens ELSE v_tokens END,
        claude_used_messages = CASE WHEN agent_usage_day = v_today THEN claude_used_messages ELSE 0 END,
        antigravity_used_messages = CASE WHEN agent_usage_day = v_today THEN antigravity_used_messages ELSE 0 END,
        claude_tokens_total = claude_tokens_total + CASE WHEN j.kind = 'claude' THEN v_tokens ELSE 0 END,
        antigravity_tokens_total = antigravity_tokens_total + CASE WHEN j.kind = 'antigravity' THEN v_tokens ELSE 0 END,
        agent_usage_day = v_today
    WHERE user_id = j.user_id;
  END IF;

  IF j.log_id IS NOT NULL THEN
    PERFORM public.terminal_finish_command(j.log_id,
      CASE WHEN j.status = 'done' AND coalesce(j.exit_code, 0) = 0 THEN 'ok' ELSE 'error' END,
      coalesce(p_preview, j.error, ''), (extract(epoch FROM (j.finished_at - j.created_at)) * 1000)::integer);
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.bridge_finish(uuid, text, uuid, text, integer, text, text, numeric, text, bigint, bigint, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_finish(uuid, text, uuid, text, integer, text, text, numeric, text, bigint, bigint, boolean) TO anon, authenticated, service_role;

-- ---------------------------------------------------------------- approval requests: summary + details
ALTER TABLE public.terminal_deploy_requests
  ADD COLUMN summary text CHECK (length(summary) <= 600),
  ADD COLUMN details text CHECK (length(details) <= 30000),
  ADD COLUMN agent text CHECK (agent IN ('claude', 'antigravity', 'shell', 'manual'));

DROP FUNCTION public.bridge_deploy_submit(uuid, text, uuid, text, text, jsonb, text, text, text);
CREATE FUNCTION public.bridge_deploy_submit(
  p_device_id uuid, p_auth_key text, p_job_id uuid, p_prompt text, p_commit_message text, p_changed_files jsonb,
  p_diff_preview text, p_diff_hash text, p_branch text,
  p_summary text DEFAULT NULL, p_details text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  j public.bridge_jobs;
  v_user uuid;
  v_email text;
  v_agent text;
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
  WHERE device_id = p_device_id AND status = 'pending' ORDER BY created_at DESC LIMIT 1 FOR UPDATE;

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
    (device_id, job_id, user_id, user_email, prompt, commit_message, changed_files, diff_preview, diff_hash, branch, summary, details, agent)
  VALUES (p_device_id, j.id, v_user, v_email, left(p_prompt, 20000), left(btrim(p_commit_message), 300),
    p_changed_files, left(p_diff_preview, 600000), p_diff_hash, p_branch, v_summary, v_details, v_agent)
  RETURNING * INTO r;
  RETURN jsonb_build_object('id', r.id, 'merged', false);
END $$;
REVOKE EXECUTE ON FUNCTION public.bridge_deploy_submit(uuid, text, uuid, text, text, jsonb, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_deploy_submit(uuid, text, uuid, text, text, jsonb, text, text, text, text, text) TO anon, authenticated, service_role;
