-- RLS lockdown: per-user content tables + unused legacy tables
-- All of these had a "Public access for X" (ALL, true/true for anon) policy and some an
-- extra "Allow all for X". The scoped policies that already exist cover the app's usage;
-- the few gaps are filled below.

-- Shared helper: platform staff with admin rights (used by later lockdown migrations too)
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_teacher_access
    WHERE user_id = _user_id AND access_level IN ('admin', 'super_admin')
  );
$$;
REVOKE ALL ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated;

-- class_chat_messages: teacher/parent class-scoped SELECT and own-row INSERT already exist
DROP POLICY IF EXISTS "Public access for class_chat_messages" ON public.class_chat_messages;
DROP POLICY IF EXISTS "Allow all for class_chat_messages" ON public.class_chat_messages;

-- user_solved_puzzles: own-row SELECT/INSERT exist. Subject leaderboards count all users'
-- solves, and deleting a puzzle (admin) removes its solve records.
DROP POLICY IF EXISTS "Public access for user_solved_puzzles" ON public.user_solved_puzzles;
CREATE POLICY "Authenticated can read solved puzzles for leaderboards" ON public.user_solved_puzzles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can delete solved puzzle records" ON public.user_solved_puzzles
  FOR DELETE TO authenticated USING (public.is_platform_admin(auth.uid()));

-- users_profiles: authenticated directory SELECT and own-row UPDATE exist
DROP POLICY IF EXISTS "Public access for users_profiles" ON public.users_profiles;

-- watched_videos: own-row SELECT/INSERT/UPDATE/DELETE exist
DROP POLICY IF EXISTS "Public access for watched_videos" ON public.watched_videos;

-- ai_exam_packages / ai_exam_submissions: shared exam links work without login, so
-- public INSERT + SELECT stay. Nothing in the app updates or deletes them.
DROP POLICY IF EXISTS "Public access for ai_exam_packages" ON public.ai_exam_packages;
DROP POLICY IF EXISTS "Anyone can update exam packages" ON public.ai_exam_packages;
DROP POLICY IF EXISTS "Public access for ai_exam_submissions" ON public.ai_exam_submissions;

-- items / posts / users / platform_chat_messages: empty and not queried by the app
-- (items/posts/users only appear inside code-snippet strings in SupabaseIntegrationPanel).
DROP POLICY IF EXISTS "Public access for items" ON public.items;
DROP POLICY IF EXISTS "Anyone can insert items" ON public.items;
DROP POLICY IF EXISTS "Public can read items" ON public.items;
DROP POLICY IF EXISTS "Public access for posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Public can read posts" ON public.posts;
DROP POLICY IF EXISTS "Public access for users" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert users" ON public.users;
DROP POLICY IF EXISTS "Public can read users" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert platform chat" ON public.platform_chat_messages;
DROP POLICY IF EXISTS "Public can read platform chat" ON public.platform_chat_messages;
