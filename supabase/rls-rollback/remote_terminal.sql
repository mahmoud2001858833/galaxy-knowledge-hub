-- Rollback for 20261101210000_remote_terminal.sql. Deletes all terminal devices, jobs and output.
ALTER PUBLICATION supabase_realtime DROP TABLE public.remote_jobs, public.remote_job_chunks;
DROP TABLE IF EXISTS public.remote_job_chunks, public.remote_jobs, public.remote_devices CASCADE;
DROP FUNCTION IF EXISTS public.remote_cancel_job(uuid), public.remote_device_check(uuid, text),
  public.remote_bridge_poll(uuid, text, jsonb, boolean), public.remote_bridge_output(uuid, text, uuid, jsonb),
  public.remote_bridge_finish(uuid, text, uuid, text, text, text, text, numeric);
