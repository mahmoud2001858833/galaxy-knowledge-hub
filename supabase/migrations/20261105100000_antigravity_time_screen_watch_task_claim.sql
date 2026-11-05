-- Three controls for the principal (2026-11-05):
--
-- 1. Antigravity time: per user, a daily window of N minutes that opens with the first Antigravity
--    message of the (Asia/Amman) day, and/or allowed hours (Amman time, end exclusive; start > end
--    wraps past midnight). Both NULL = no extra limit. Checked in terminal_agent_begin(), so the
--    Edge Function refuses the message before a job reaches the bridge. The principal can reopen
--    today's window by setting antigravity_window_started_at back to NULL.
-- 2. Screen watch: team members and terminal users (not the principal) record what they do on the
--    platform pages with rrweb; chunks land in screen_watch_chunks and only the principal can read
--    them (live via Realtime or later). Members see a notice that their activity is recorded.
-- 3. Task claim: team_start_task() tells a late member that someone already took the task, so the
--    UI can show "سبقك أحد" instead of "هذه المهمة ليست لك".

-- ---------------------------------------------------------------- 1. Antigravity time
ALTER TABLE public.usage_quotas
  ADD COLUMN antigravity_minutes integer CHECK (antigravity_minutes IS NULL OR antigravity_minutes BETWEEN 1 AND 1440),
  ADD COLUMN antigravity_hours_start smallint CHECK (antigravity_hours_start IS NULL OR antigravity_hours_start BETWEEN 0 AND 23),
  ADD COLUMN antigravity_hours_end smallint CHECK (antigravity_hours_end IS NULL OR antigravity_hours_end BETWEEN 0 AND 24),
  ADD COLUMN antigravity_window_started_at timestamptz,
  ADD CONSTRAINT usage_quotas_antigravity_hours_pair CHECK (
    (antigravity_hours_start IS NULL) = (antigravity_hours_end IS NULL)
    AND (antigravity_hours_start IS NULL OR antigravity_hours_start <> antigravity_hours_end)
  );

COMMENT ON COLUMN public.usage_quotas.antigravity_minutes IS 'Antigravity minutes per Amman day, from the first message (NULL = no limit)';
COMMENT ON COLUMN public.usage_quotas.antigravity_hours_start IS 'Antigravity allowed from this Amman hour (NULL = any time)';
COMMENT ON COLUMN public.usage_quotas.antigravity_hours_end IS 'Antigravity allowed until this Amman hour, exclusive';
COMMENT ON COLUMN public.usage_quotas.antigravity_window_started_at IS 'First Antigravity message of the current window; NULL reopens it';

CREATE OR REPLACE FUNCTION public.terminal_agent_begin(p_user_id uuid, p_agent text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  q public.usage_quotas;
  v_today date := (now() AT TIME ZONE 'Asia/Amman')::date;
  v_hour integer := extract(hour FROM now() AT TIME ZONE 'Asia/Amman')::integer;
  v_agent text := p_agent;
  v_allowed boolean;
  v_msgs integer;
  v_msg_limit integer;
  v_tokens bigint;
  v_token_limit bigint;
  v_window timestamptz;
  v_ends timestamptz;
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

  IF v_agent = 'antigravity' THEN
    IF q.antigravity_hours_start IS NOT NULL AND NOT CASE
         WHEN q.antigravity_hours_start < q.antigravity_hours_end THEN v_hour >= q.antigravity_hours_start AND v_hour < q.antigravity_hours_end
         ELSE v_hour >= q.antigravity_hours_start OR v_hour < q.antigravity_hours_end END THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'agent_hours', 'agent', v_agent,
        'hours_start', q.antigravity_hours_start, 'hours_end', q.antigravity_hours_end);
    END IF;
    IF q.antigravity_minutes IS NOT NULL THEN
      -- the window belongs to the Amman day it opened on
      v_window := CASE WHEN (q.antigravity_window_started_at AT TIME ZONE 'Asia/Amman')::date = v_today
                       THEN q.antigravity_window_started_at END;
      IF v_window IS NOT NULL AND now() >= v_window + make_interval(mins => q.antigravity_minutes) THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'agent_time', 'agent', v_agent,
          'minutes', q.antigravity_minutes, 'ended_at', v_window + make_interval(mins => q.antigravity_minutes));
      END IF;
      v_window := coalesce(v_window, now());
      v_ends := v_window + make_interval(mins => q.antigravity_minutes);
    END IF;
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
    UPDATE public.usage_quotas
    SET antigravity_used_messages = antigravity_used_messages + 1,
        antigravity_window_started_at = coalesce(v_window, antigravity_window_started_at)
    WHERE id = q.id;
  END IF;
  RETURN jsonb_build_object('ok', true, 'agent', v_agent,
    'messages', v_msgs + 1, 'messages_limit', v_msg_limit, 'tokens', v_tokens, 'tokens_limit', v_token_limit,
    'ends_at', v_ends);
END $$;

REVOKE EXECUTE ON FUNCTION public.terminal_agent_begin(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.terminal_agent_begin(uuid, text) TO service_role;

-- ---------------------------------------------------------------- 2. screen watch
-- Recorded: every team member and terminal user except the principal.
CREATE OR REPLACE FUNCTION public.screen_watch_applies()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL
    AND NOT public.team_has_role('principal')
    AND (EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid())
         OR EXISTS (SELECT 1 FROM public.usage_quotas WHERE user_id = auth.uid() AND enabled))
$$;
REVOKE EXECUTE ON FUNCTION public.screen_watch_applies() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.screen_watch_applies() TO authenticated;

-- one row per browser tab recording
CREATE TABLE public.screen_watch_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  user_agent text CHECK (length(user_agent) <= 400),
  width integer,
  height integer,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_event_at timestamptz NOT NULL DEFAULT now(),
  last_path text CHECK (length(last_path) <= 500),
  chunks integer NOT NULL DEFAULT 0
);
CREATE INDEX screen_watch_sessions_recent_idx ON public.screen_watch_sessions (last_event_at DESC);
CREATE INDEX screen_watch_sessions_user_idx ON public.screen_watch_sessions (user_id, started_at DESC);

CREATE TABLE public.screen_watch_chunks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.screen_watch_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  seq integer NOT NULL CHECK (seq >= 0),
  has_full_snapshot boolean NOT NULL DEFAULT false,
  path text CHECK (length(path) <= 500),
  events jsonb NOT NULL CHECK (jsonb_typeof(events) = 'array'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, seq)
);
CREATE INDEX screen_watch_chunks_full_idx ON public.screen_watch_chunks (session_id, seq) WHERE has_full_snapshot;

-- keep the session row current, and bound the size of one chunk (~2 MB)
CREATE OR REPLACE FUNCTION public.screen_watch_chunk_before_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF pg_column_size(NEW.events) > 2 * 1024 * 1024 THEN
    RAISE EXCEPTION 'chunk too large';
  END IF;
  UPDATE public.screen_watch_sessions
  SET last_event_at = now(), chunks = chunks + 1, last_path = coalesce(NEW.path, last_path)
  WHERE id = NEW.session_id AND user_id = NEW.user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'unknown session';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER screen_watch_chunk_before_insert BEFORE INSERT ON public.screen_watch_chunks
FOR EACH ROW EXECUTE FUNCTION public.screen_watch_chunk_before_insert();

ALTER TABLE public.screen_watch_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_watch_chunks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.screen_watch_sessions, public.screen_watch_chunks FROM anon;
REVOKE UPDATE ON public.screen_watch_sessions, public.screen_watch_chunks FROM authenticated;

-- the recorded person writes; only the principal reads or deletes
CREATE POLICY "recorded user starts own session" ON public.screen_watch_sessions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.screen_watch_applies());
CREATE POLICY "principal watches sessions" ON public.screen_watch_sessions
  FOR SELECT TO authenticated USING (public.team_has_role('principal'));
CREATE POLICY "principal deletes sessions" ON public.screen_watch_sessions
  FOR DELETE TO authenticated USING (public.team_has_role('principal'));

CREATE POLICY "recorded user adds own chunks" ON public.screen_watch_chunks
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.screen_watch_applies());
CREATE POLICY "principal watches chunks" ON public.screen_watch_chunks
  FOR SELECT TO authenticated USING (public.team_has_role('principal'));
CREATE POLICY "principal deletes chunks" ON public.screen_watch_chunks
  FOR DELETE TO authenticated USING (public.team_has_role('principal'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.screen_watch_sessions, public.screen_watch_chunks;

-- ---------------------------------------------------------------- 3. task claim: first one wins
CREATE OR REPLACE FUNCTION public.team_start_task(p_task_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t public.team_tasks;
BEGIN
  -- FOR UPDATE: two members pressing at the same moment are served one after the other
  SELECT * INTO t FROM public.team_tasks WHERE id = p_task_id FOR UPDATE;
  IF t.id IS NOT NULL AND public.team_has_role(t.assignee_role)
     AND t.assignee_user_id IS NOT NULL AND t.assignee_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'TASK_TAKEN: سبقك زميلك وأخذ هذه المهمة. حظاً أوفر، انتظر المهمة القادمة' USING ERRCODE = 'P0001';
  END IF;
  IF t.id IS NULL OR NOT public.team_is_my_task(t.assignee_role, t.assignee_user_id) THEN
    RAISE EXCEPTION 'هذه المهمة ليست لك';
  END IF;
  IF t.status <> 'todo' THEN
    RAISE EXCEPTION 'المهمة ليست في حالة "مطلوبة"';
  END IF;
  UPDATE public.team_tasks
  SET status = 'in_progress', assignee_user_id = auth.uid()
  WHERE id = p_task_id;
END $$;
