-- Web terminal (/terminal) — runs entirely in the browser + the web-terminal-exec Edge Function.
-- Replaces the local-bridge terminal from 20261101210000 (its tables were empty apart from one
-- never-connected device and are dropped here).
--
-- Model
-- * usage_quotas: who may use the terminal and how much. One row per account (bound to user_id
--   at insert, like team_members, because email sign-ups are auto-confirmed on this project).
--   The principal (team_members role 'principal') needs no row and has no limits.
-- * user_terminal_sessions: one row per opened terminal; the principal can terminate it.
-- * terminal_command_logs: every command, including denied ones.
-- * All counting and checking happens in terminal_begin_command(), callable only by the
--   service role (i.e. the Edge Function after it has verified the user's JWT). The browser
--   can read its own rows but cannot write any of these tables.

-- ---------------------------------------------------------------- drop the local-bridge terminal
ALTER PUBLICATION supabase_realtime DROP TABLE public.remote_jobs, public.remote_job_chunks;
DROP TABLE public.remote_job_chunks, public.remote_jobs, public.remote_devices;
DROP FUNCTION public.remote_cancel_job(uuid), public.remote_bridge_poll(uuid, text, jsonb, boolean),
  public.remote_bridge_output(uuid, text, uuid, jsonb),
  public.remote_bridge_finish(uuid, text, uuid, text, text, text, text, numeric),
  public.remote_device_check(uuid, text);

-- ---------------------------------------------------------------- helpers
CREATE OR REPLACE FUNCTION public.terminal_is_principal(p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = p_user_id AND role = 'principal')
$$;

-- ---------------------------------------------------------------- tables
CREATE TABLE public.usage_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT true,
  banned boolean NOT NULL DEFAULT false,
  ban_reason text,
  daily_limit integer NOT NULL DEFAULT 100 CHECK (daily_limit >= 0),
  total_limit integer CHECK (total_limit IS NULL OR total_limit >= 0),
  per_minute_limit integer NOT NULL DEFAULT 20 CHECK (per_minute_limit BETWEEN 1 AND 600),
  session_minutes integer NOT NULL DEFAULT 60 CHECK (session_minutes BETWEEN 1 AND 1440),
  used_today integer NOT NULL DEFAULT 0,
  used_total integer NOT NULL DEFAULT 0,
  usage_day date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Amman')::date,
  note text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.usage_quotas_before_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_user uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.email := lower(btrim(NEW.email));
    SELECT u.id INTO v_user FROM auth.users u WHERE lower(u.email) = NEW.email;
    IF v_user IS NULL THEN
      RAISE EXCEPTION 'لا يوجد حساب مسجل بهذا الإيميل: %', NEW.email USING ERRCODE = 'P0002';
    END IF;
    NEW.user_id := v_user;
  ELSIF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'لتغيير الإيميل احذف الصلاحية وأضفها من جديد';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

CREATE TRIGGER usage_quotas_before_write
BEFORE INSERT OR UPDATE ON public.usage_quotas
FOR EACH ROW EXECUTE FUNCTION public.usage_quotas_before_write();

CREATE TABLE public.user_terminal_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  is_principal boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'terminated', 'expired', 'closed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz, -- NULL = no time limit (principal)
  ended_at timestamptz,
  ended_reason text,
  terminated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  commands_count integer NOT NULL DEFAULT 0,
  user_agent text
);
CREATE INDEX user_terminal_sessions_user_idx ON public.user_terminal_sessions (user_id, started_at DESC);
CREATE INDEX user_terminal_sessions_active_idx ON public.user_terminal_sessions (status) WHERE status = 'active';

CREATE TABLE public.terminal_command_logs (
  id bigserial PRIMARY KEY,
  session_id uuid REFERENCES public.user_terminal_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  command text NOT NULL CHECK (length(command) <= 1000),
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'ok', 'error', 'denied')),
  output_preview text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX terminal_command_logs_user_idx ON public.terminal_command_logs (user_id, created_at DESC);
CREATE INDEX terminal_command_logs_session_idx ON public.terminal_command_logs (session_id, id);

-- ---------------------------------------------------------------- RLS: users read their own rows, the principal reads and manages all
ALTER TABLE public.usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_terminal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminal_command_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.usage_quotas, public.user_terminal_sessions, public.terminal_command_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_terminal_sessions, public.terminal_command_logs FROM authenticated;
REVOKE ALL ON SEQUENCE public.terminal_command_logs_id_seq FROM anon, authenticated;

CREATE POLICY "own quota or principal" ON public.usage_quotas
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.team_has_role('principal'));
CREATE POLICY "principal grants access" ON public.usage_quotas
  FOR INSERT TO authenticated WITH CHECK (public.team_has_role('principal'));
CREATE POLICY "principal edits quotas" ON public.usage_quotas
  FOR UPDATE TO authenticated USING (public.team_has_role('principal')) WITH CHECK (public.team_has_role('principal'));
CREATE POLICY "principal revokes access" ON public.usage_quotas
  FOR DELETE TO authenticated USING (public.team_has_role('principal'));

CREATE POLICY "own sessions or principal" ON public.user_terminal_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.team_has_role('principal'));

CREATE POLICY "own commands or principal" ON public.terminal_command_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.team_has_role('principal'));

-- ---------------------------------------------------------------- service-role functions (used by the Edge Function)
CREATE OR REPLACE FUNCTION public.terminal_start_session(p_user_id uuid, p_user_agent text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_email text;
  v_principal boolean := public.terminal_is_principal(p_user_id);
  q public.usage_quotas;
  s public.user_terminal_sessions;
BEGIN
  SELECT lower(email) INTO v_email FROM auth.users WHERE id = p_user_id;
  IF v_email IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unknown_user');
  END IF;
  IF NOT v_principal THEN
    SELECT * INTO q FROM public.usage_quotas WHERE user_id = p_user_id;
    IF q.id IS NULL OR NOT q.enabled THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'no_access');
    END IF;
    IF q.banned THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'banned', 'detail', q.ban_reason);
    END IF;
  END IF;

  INSERT INTO public.user_terminal_sessions (user_id, email, is_principal, expires_at, user_agent)
  VALUES (p_user_id, v_email, v_principal,
          CASE WHEN v_principal THEN NULL ELSE now() + make_interval(mins => q.session_minutes) END,
          left(p_user_agent, 300))
  RETURNING * INTO s;

  RETURN jsonb_build_object('ok', true, 'session_id', s.id, 'email', v_email, 'is_principal', v_principal,
                            'expires_at', s.expires_at, 'started_at', s.started_at);
END $$;

-- Atomically: validate session + quota + rate, count the command, log it. Denials are logged too.
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
    'session', jsonb_build_object('started_at', s.started_at, 'expires_at', s.expires_at, 'commands', s.commands_count + 1),
    'quota', CASE WHEN s.is_principal THEN NULL ELSE jsonb_build_object(
      'used_today', q.used_today, 'daily_limit', q.daily_limit, 'used_total', q.used_total,
      'total_limit', q.total_limit, 'per_minute_limit', q.per_minute_limit, 'session_minutes', q.session_minutes) END
  );
END $$;

CREATE OR REPLACE FUNCTION public.terminal_finish_command(p_log_id bigint, p_status text, p_preview text, p_duration_ms integer)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.terminal_command_logs
  SET status = CASE WHEN p_status IN ('ok', 'error') THEN p_status ELSE 'error' END,
      output_preview = left(p_preview, 2000), duration_ms = p_duration_ms
  WHERE id = p_log_id;
$$;

CREATE OR REPLACE FUNCTION public.terminal_end_session(p_user_id uuid, p_session_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.user_terminal_sessions SET status = 'closed', ended_at = now(), ended_reason = 'أغلقها المستخدم'
  WHERE id = p_session_id AND user_id = p_user_id AND status = 'active';
$$;

-- Read-only platform inspection for the principal's commands
CREATE OR REPLACE FUNCTION public.terminal_db_tables()
RETURNS TABLE (table_name text, est_rows bigint, total_bytes bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog AS $$
  SELECT c.relname::text, greatest(c.reltuples, 0)::bigint, pg_total_relation_size(c.oid)
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  ORDER BY pg_total_relation_size(c.oid) DESC
$$;

CREATE OR REPLACE FUNCTION public.terminal_db_health()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog AS $$
  SELECT jsonb_build_object(
    'version', split_part(version(), ' on ', 1),
    'database_bytes', pg_database_size(current_database()),
    'connections', (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()),
    'public_tables', (SELECT count(*) FROM pg_tables WHERE schemaname = 'public'),
    'archived_tables', (SELECT count(*) FROM pg_tables WHERE schemaname = 'archive'),
    'users', (SELECT count(*) FROM auth.users),
    'latest_migrations', (SELECT jsonb_agg(m ORDER BY m DESC) FROM (
       SELECT version || ' ' || coalesce(name, '') AS m FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5) x)
  )
$$;

-- ---------------------------------------------------------------- principal: kill switch
CREATE OR REPLACE FUNCTION public.terminal_kill(p_session_id uuid DEFAULT NULL, p_user_id uuid DEFAULT NULL, p_ban boolean DEFAULT false, p_reason text DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := p_user_id;
  v_count integer;
BEGIN
  IF NOT public.team_has_role('principal') THEN
    RAISE EXCEPTION 'للرئيس فقط';
  END IF;
  IF p_session_id IS NOT NULL THEN
    SELECT user_id INTO v_user FROM public.user_terminal_sessions WHERE id = p_session_id;
  END IF;
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'حدّد الجلسة أو المستخدم';
  END IF;

  UPDATE public.user_terminal_sessions
  SET status = 'terminated', ended_at = now(), terminated_by = auth.uid(),
      ended_reason = coalesce(nullif(btrim(p_reason), ''), 'أنهاها الرئيس')
  WHERE status = 'active' AND (CASE WHEN p_session_id IS NOT NULL THEN id = p_session_id ELSE user_id = v_user END);
  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF p_ban THEN
    IF public.terminal_is_principal(v_user) THEN
      RAISE EXCEPTION 'لا يمكن حظر الرئيس';
    END IF;
    UPDATE public.usage_quotas SET banned = true, ban_reason = coalesce(nullif(btrim(p_reason), ''), 'حظره الرئيس') WHERE user_id = v_user;
  END IF;
  RETURN v_count;
END $$;

-- Ending sessions when access is revoked or a user is banned from the admin table
CREATE OR REPLACE FUNCTION public.usage_quotas_after_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' OR NOT NEW.enabled OR NEW.banned THEN
    UPDATE public.user_terminal_sessions
    SET status = 'terminated', ended_at = now(), terminated_by = auth.uid(),
        ended_reason = CASE WHEN TG_OP <> 'DELETE' AND NEW.banned THEN coalesce(NEW.ban_reason, 'الحساب محظور') ELSE 'سُحبت الصلاحية' END
    WHERE user_id = coalesce(NEW.user_id, OLD.user_id) AND status = 'active';
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER usage_quotas_after_change
AFTER UPDATE OR DELETE ON public.usage_quotas
FOR EACH ROW EXECUTE FUNCTION public.usage_quotas_after_change();

-- ---------------------------------------------------------------- grants
REVOKE EXECUTE ON FUNCTION public.terminal_is_principal(uuid), public.terminal_start_session(uuid, text),
  public.terminal_begin_command(uuid, uuid, text), public.terminal_finish_command(bigint, text, text, integer),
  public.terminal_end_session(uuid, uuid), public.terminal_db_tables(), public.terminal_db_health(),
  public.usage_quotas_before_write(), public.usage_quotas_after_change()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.terminal_start_session(uuid, text), public.terminal_begin_command(uuid, uuid, text),
  public.terminal_finish_command(bigint, text, text, integer), public.terminal_end_session(uuid, uuid),
  public.terminal_db_tables(), public.terminal_db_health()
  TO service_role;
REVOKE EXECUTE ON FUNCTION public.terminal_kill(uuid, uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.terminal_kill(uuid, uuid, boolean, text) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.usage_quotas, public.user_terminal_sessions, public.terminal_command_logs;
