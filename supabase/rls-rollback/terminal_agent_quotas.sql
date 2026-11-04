-- Rollback for 20261104100000_terminal_agent_quotas.sql. Restores the single "AI agent" choice.
-- Re-create the previous bridge_finish / bridge_deploy_submit / terminal_begin_command from
-- 20261101230000_terminal_bridge.sql, 20261102100000_terminal_deploy_requests.sql and
-- 20261101240000_terminal_agents.sql after running this.
BEGIN;
UPDATE public.usage_quotas
SET agent = CASE WHEN allow_antigravity AND NOT allow_claude THEN 'antigravity' ELSE agent END,
    allow_claude = allow_claude OR allow_antigravity;
DROP FUNCTION IF EXISTS public.terminal_agent_begin(uuid, text);
DROP FUNCTION IF EXISTS public.bridge_finish(uuid, text, uuid, text, integer, text, text, numeric, text, bigint, bigint, boolean);
DROP FUNCTION IF EXISTS public.bridge_deploy_submit(uuid, text, uuid, text, text, jsonb, text, text, text, text, text);
ALTER TABLE public.terminal_deploy_requests DROP COLUMN summary, DROP COLUMN details, DROP COLUMN agent;
ALTER TABLE public.bridge_jobs DROP COLUMN tokens_in, DROP COLUMN tokens_out, DROP COLUMN tokens_estimated;
ALTER TABLE public.usage_quotas
  DROP COLUMN allow_antigravity, DROP COLUMN claude_daily_messages, DROP COLUMN claude_daily_tokens,
  DROP COLUMN antigravity_daily_messages, DROP COLUMN antigravity_daily_tokens,
  DROP COLUMN claude_used_messages, DROP COLUMN claude_used_tokens,
  DROP COLUMN antigravity_used_messages, DROP COLUMN antigravity_used_tokens,
  DROP COLUMN claude_tokens_total, DROP COLUMN antigravity_tokens_total, DROP COLUMN agent_usage_day;
COMMIT;
