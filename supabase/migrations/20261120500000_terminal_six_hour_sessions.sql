-- Terminal sessions last 6 hours by default (programmers work long windows); raise everyone below that.
ALTER TABLE public.usage_quotas ALTER COLUMN session_minutes SET DEFAULT 360;
UPDATE public.usage_quotas SET session_minutes = 360 WHERE session_minutes < 360;
