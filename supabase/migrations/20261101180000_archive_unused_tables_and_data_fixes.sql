-- Database cleanup after the platform consolidation (see docs/PLATFORM_IDENTITY.md)
-- 1) Tables no longer used by the app but holding data move to an `archive` schema.
--    archive is not exposed through the API; restore with ALTER TABLE archive.X SET SCHEMA public.
-- 2) Empty, unused tables are dropped (guarded: aborts if any of them has rows).
-- 3) Data fixes: backfill missing profiles, unify the physics subject name.
-- Damij tables (adhd_*, autism_*, clinical_*, sign_*) are parked, not cleaned.
-- users_profiles and puzzles are handled in a later migration, once the live site runs
-- the code that no longer reads them.

CREATE SCHEMA IF NOT EXISTS archive;
REVOKE ALL ON SCHEMA archive FROM PUBLIC, anon, authenticated;

ALTER TABLE public.arabic_poets SET SCHEMA archive;
ALTER TABLE public.poems SET SCHEMA archive;
ALTER TABLE public.arabic_scholars SET SCHEMA archive;
ALTER TABLE public.grammar_rules SET SCHEMA archive;
ALTER TABLE public.chemistry_puzzles SET SCHEMA archive;
ALTER TABLE public.drawing_challenge_messages SET SCHEMA archive;
ALTER TABLE public.group_messages SET SCHEMA archive;
ALTER TABLE public.recorded_lessons SET SCHEMA archive;
ALTER TABLE public.sim_ai_sessions SET SCHEMA archive;
ALTER TABLE public.sim_ai_events SET SCHEMA archive;

DO $$
DECLARE
  t text;
  n bigint;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'word_contributions', 'arabic_words', 'developer_api_keys', 'developer_api_logs',
    'generated_codes', 'grammar_foundation_files', 'platform_chat_messages',
    'private_chat_participants', 'private_messages', 'private_chats', 'scheduled_puzzle_jobs'
  ] LOOP
    EXECUTE format('SELECT count(*) FROM public.%I', t) INTO n;
    IF n > 0 THEN
      RAISE EXCEPTION 'Refusing to drop public.%: it has % rows', t, n;
    END IF;
  END LOOP;
END $$;

DROP TABLE public.word_contributions;
DROP TABLE public.arabic_words;
DROP TABLE public.developer_api_keys;
DROP TABLE public.developer_api_logs;
DROP TABLE public.generated_codes;
DROP TABLE public.grammar_foundation_files;
DROP TABLE public.platform_chat_messages;
-- dropped together: their RLS policies reference each other
DROP TABLE public.private_messages, public.private_chats, public.private_chat_participants;
DROP TABLE public.scheduled_puzzle_jobs;

-- Backfill profiles for auth users created before/without the handle_new_user trigger.
-- Prefer the name they had in users_profiles; keep usernames unique and email-free.
INSERT INTO public.profiles (id, username, avatar_url, score, solved_puzzles, usage_time)
SELECT
  u.id,
  CASE
    WHEN EXISTS (SELECT 1 FROM public.profiles p WHERE p.username = c.name) THEN c.name || '_' || substring(u.id::text, 1, 4)
    ELSE c.name
  END,
  up.avatar_url,
  0, 0, 0
FROM auth.users u
LEFT JOIN public.users_profiles up ON up.id = u.id
CROSS JOIN LATERAL (
  SELECT CASE
    WHEN coalesce(nullif(up.username, ''), '') <> '' AND up.username NOT LIKE '%@%' THEN up.username
    WHEN coalesce(split_part(u.email, '@', 1), '') <> '' THEN split_part(u.email, '@', 1)
    ELSE 'user_' || substring(u.id::text, 1, 8)
  END AS name
) c
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- 4 puzzles were saved under 'physics' instead of 'الفيزياء' and showed as a separate subject
UPDATE public.subject_puzzles SET subject = 'الفيزياء' WHERE subject = 'physics';
UPDATE public.user_solved_puzzles SET subject = 'الفيزياء' WHERE subject = 'physics';
