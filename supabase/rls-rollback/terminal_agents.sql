-- Rollback for 20261101240000_terminal_agents.sql
DELETE FROM public.bridge_jobs WHERE kind = 'antigravity';
ALTER TABLE public.bridge_jobs DROP CONSTRAINT bridge_jobs_kind_check;
ALTER TABLE public.bridge_jobs ADD CONSTRAINT bridge_jobs_kind_check CHECK (kind IN ('shell', 'claude'));
ALTER TABLE public.usage_quotas DROP COLUMN agent;
-- terminal_begin_command(): re-run its definition from 20261101230000_terminal_bridge.sql
