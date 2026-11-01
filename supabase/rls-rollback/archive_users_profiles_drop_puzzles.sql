-- Rollback for 20261101190000: bring users_profiles back. puzzles was empty; it is not
-- used by the app any more, so it is not recreated.
ALTER TABLE archive.users_profiles SET SCHEMA public;
