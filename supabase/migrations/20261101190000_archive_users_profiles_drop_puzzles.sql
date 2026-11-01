-- Finish the cleanup from 20261101180000 now that production runs code that no longer
-- reads these tables. profiles is the single user profile table.
-- users_profiles (legacy duplicate of profiles) is archived; restore with
--   ALTER TABLE archive.users_profiles SET SCHEMA public;
-- puzzles (superseded by subject_puzzles) is empty and dropped (guarded).

ALTER TABLE public.users_profiles SET SCHEMA archive;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.puzzles) THEN
    RAISE EXCEPTION 'Refusing to drop public.puzzles: it has rows';
  END IF;
END $$;

DROP TABLE public.puzzles;
