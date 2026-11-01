-- Rollback for 20261101220000_web_terminal.sql (deletes quotas, sessions and command logs).
-- To bring back the local-bridge terminal afterwards, re-run 20261101210000_remote_terminal.sql.
ALTER PUBLICATION supabase_realtime DROP TABLE public.usage_quotas, public.user_terminal_sessions, public.terminal_command_logs;
DROP TABLE IF EXISTS public.terminal_command_logs, public.user_terminal_sessions, public.usage_quotas CASCADE;
DROP FUNCTION IF EXISTS public.terminal_is_principal(uuid), public.terminal_start_session(uuid, text),
  public.terminal_begin_command(uuid, uuid, text), public.terminal_finish_command(bigint, text, text, integer),
  public.terminal_end_session(uuid, uuid), public.terminal_db_tables(), public.terminal_db_health(),
  public.terminal_kill(uuid, uuid, boolean, text), public.usage_quotas_before_write(), public.usage_quotas_after_change();
