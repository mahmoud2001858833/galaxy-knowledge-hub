CREATE INDEX IF NOT EXISTS idx_autism_programs_active ON public.autism_programs(child_profile_id, status);
CREATE INDEX IF NOT EXISTS idx_adhd_programs_active ON public.adhd_programs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_autism_program_games_day ON public.autism_program_games(day_id);
CREATE INDEX IF NOT EXISTS idx_adhd_program_games_day ON public.adhd_program_games(day_id);
CREATE INDEX IF NOT EXISTS idx_autism_game_sessions_pg ON public.autism_game_sessions(program_game_id);