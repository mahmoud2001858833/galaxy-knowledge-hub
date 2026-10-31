-- RLS lockdown: profiles
-- "Public access for profiles" (ALL, true/true for anon) let anyone holding the anon key
-- read, rewrite or delete every profile. "Only admins can update profiles" trusted
-- raw_user_meta_data->>'is_admin', which any user can set on themselves via
-- supabase.auth.updateUser(), so it was an escalation path to edit any profile.
-- No page updates other users' profiles, so it is dropped rather than replaced.
-- Remaining policies:
--   SELECT: authenticated (leaderboards, comment authors, chat)
--   INSERT/UPDATE: own row only (auth.uid() = id)
-- Score changes go through adjust_user_score() (SECURITY DEFINER) and are unaffected.

DROP POLICY IF EXISTS "Public access for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can update profiles" ON public.profiles;
