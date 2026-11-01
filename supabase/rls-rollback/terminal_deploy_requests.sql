-- Rollback for 20261102100000_terminal_deploy_requests.sql
ALTER PUBLICATION supabase_realtime DROP TABLE public.terminal_deploy_requests;
DROP TABLE IF EXISTS public.terminal_deploy_requests CASCADE;
DROP FUNCTION IF EXISTS public.terminal_deploy_decide(uuid, boolean, text, text, text), public.terminal_deploy_doorbell(),
  public.bridge_deploy_pending(uuid, text), public.bridge_deploy_submit(uuid, text, uuid, text, text, jsonb, text, text, text),
  public.bridge_deploy_claim(uuid, text), public.bridge_deploy_finish(uuid, text, uuid, text, text, text);
DELETE FROM public.bridge_jobs WHERE kind = 'submit';
ALTER TABLE public.bridge_jobs DROP CONSTRAINT bridge_jobs_kind_check;
ALTER TABLE public.bridge_jobs ADD CONSTRAINT bridge_jobs_kind_check CHECK (kind IN ('shell', 'claude', 'antigravity'));
