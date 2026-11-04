-- Web terminal: how much of the principal's AI subscriptions each message used.
--
-- Claude Code reports its plan windows on every run (rate_limit_event: five_hour / seven_day
-- utilization); Antigravity reports a per-model quota (quotaInfo.remainingFraction). The bridge
-- records the reading before and after each job in bridge_jobs.limits:
--   { "before": { "at": <ms>, "windows": { "five_hour": { "used": 0.42, "resets": "<id>" }, ... } },
--     "after":  { ... same shape ... }, "model": "<antigravity model id>" }
-- terminal_agent_limit_stats() turns those into "1M tokens ≈ X% of this window", measured from real
-- use (only pairs in the same window, i.e. same reset time, and only non-negative changes).

ALTER TABLE public.bridge_jobs ADD COLUMN limits jsonb CHECK (limits IS NULL OR jsonb_typeof(limits) = 'object');

DROP FUNCTION public.bridge_finish(uuid, text, uuid, text, integer, text, text, numeric, text, bigint, bigint, boolean);
CREATE FUNCTION public.bridge_finish(
  p_device_id uuid, p_auth_key text, p_job_id uuid, p_status text, p_exit_code integer DEFAULT NULL,
  p_claude_session text DEFAULT NULL, p_error text DEFAULT NULL, p_cost numeric DEFAULT NULL, p_preview text DEFAULT NULL,
  p_tokens_in bigint DEFAULT NULL, p_tokens_out bigint DEFAULT NULL, p_tokens_estimated boolean DEFAULT false,
  p_limits jsonb DEFAULT NULL
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
      limits = coalesce(limits, CASE WHEN jsonb_typeof(p_limits) = 'object' AND length(p_limits::text) <= 4000 THEN p_limits END),
      finished_at = coalesce(finished_at, now())
  WHERE id = p_job_id AND device_id = p_device_id AND status IN ('running', 'cancelled')
  RETURNING * INTO j;

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
REVOKE EXECUTE ON FUNCTION public.bridge_finish(uuid, text, uuid, text, integer, text, text, numeric, text, bigint, bigint, boolean, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_finish(uuid, text, uuid, text, integer, text, text, numeric, text, bigint, bigint, boolean, jsonb) TO anon, authenticated, service_role;

-- ---------------------------------------------------------------- measured cost of 1M tokens per window
CREATE OR REPLACE FUNCTION public.terminal_agent_limit_stats()
RETURNS TABLE (agent text, win text, samples bigint, tokens numeric, used numeric, per_million numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH j AS (
    SELECT b.kind, coalesce(b.tokens_in, 0) + coalesce(b.tokens_out, 0) AS t, b.limits
    FROM public.bridge_jobs b
    WHERE public.team_has_role('principal')
      AND b.kind IN ('claude', 'antigravity') AND b.status = 'done' AND NOT b.tokens_estimated
      AND b.limits ? 'before' AND b.limits ? 'after' AND b.created_at > now() - interval '30 days'
  ), w AS (
    SELECT j.kind, j.t, k.key AS win,
      (j.limits -> 'after' -> 'windows' -> k.key ->> 'used')::numeric - (j.limits -> 'before' -> 'windows' -> k.key ->> 'used')::numeric AS d
    FROM j CROSS JOIN LATERAL jsonb_object_keys(j.limits -> 'after' -> 'windows') AS k(key)
    WHERE j.limits -> 'before' -> 'windows' -> k.key ->> 'resets' = j.limits -> 'after' -> 'windows' -> k.key ->> 'resets'
  )
  SELECT kind, win, count(*), sum(t)::numeric, sum(d), CASE WHEN sum(t) > 0 THEN round(sum(d) / sum(t) * 1000000 * 100, 2) END
  FROM w WHERE d >= 0 AND t > 0
  GROUP BY kind, win
$$;
REVOKE EXECUTE ON FUNCTION public.terminal_agent_limit_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.terminal_agent_limit_stats() TO authenticated;
