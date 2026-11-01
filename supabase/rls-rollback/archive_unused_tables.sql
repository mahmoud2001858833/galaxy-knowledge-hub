-- Restore archived tables for 20261101180000_archive_unused_tables_and_data_fixes.sql
-- (dropped tables were empty; recreate them from their original migrations if ever needed)
ALTER TABLE archive.arabic_poets SET SCHEMA public;
ALTER TABLE archive.poems SET SCHEMA public;
ALTER TABLE archive.arabic_scholars SET SCHEMA public;
ALTER TABLE archive.grammar_rules SET SCHEMA public;
ALTER TABLE archive.chemistry_puzzles SET SCHEMA public;
ALTER TABLE archive.drawing_challenge_messages SET SCHEMA public;
ALTER TABLE archive.group_messages SET SCHEMA public;
ALTER TABLE archive.recorded_lessons SET SCHEMA public;
ALTER TABLE archive.sim_ai_sessions SET SCHEMA public;
ALTER TABLE archive.sim_ai_events SET SCHEMA public;
