-- Rollback for 20261101230000_terminal_bridge.sql. Stop the bridge first (pkill -f local-bridge.mjs).
ALTER PUBLICATION supabase_realtime DROP TABLE public.bridge_jobs, public.bridge_job_chunks;
DROP TRIGGER IF EXISTS terminal_session_cancel_jobs ON public.user_terminal_sessions;
DROP TABLE IF EXISTS public.bridge_job_chunks, public.bridge_jobs, public.bridge_devices CASCADE;
DROP FUNCTION IF EXISTS public.bridge_status(), public.bridge_cancel_job(uuid), public.bridge_jobs_doorbell(),
  public.terminal_session_cancel_jobs(), public.bridge_device_check(uuid, text),
  public.bridge_poll(uuid, text, jsonb, boolean), public.bridge_output(uuid, text, uuid, jsonb),
  public.bridge_finish(uuid, text, uuid, text, integer, text, text, numeric, text);
ALTER TABLE public.usage_quotas DROP COLUMN IF EXISTS allow_claude, DROP COLUMN IF EXISTS allow_shell;
-- terminal_begin_command(): re-run its definition from 20261101220000_web_terminal.sql
