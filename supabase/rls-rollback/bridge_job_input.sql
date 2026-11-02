-- Rollback for 20261102120000_bridge_job_input.sql
DROP FUNCTION IF EXISTS public.bridge_job_reply(uuid, text), public.bridge_job_input(uuid, text, uuid, text);
ALTER TABLE public.bridge_jobs DROP COLUMN IF EXISTS awaiting_input, DROP COLUMN IF EXISTS pending_input;
