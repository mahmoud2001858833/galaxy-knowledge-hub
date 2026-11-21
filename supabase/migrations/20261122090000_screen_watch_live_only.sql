-- Screen watch becomes live-only: nothing is stored. The recordings table grew to 854 MB of a 931 MB
-- database (an rrweb chunk every 2 s per member, kept forever) and the database stopped answering.
-- Now the recorder streams over a private Realtime broadcast channel, and only while the principal
-- is actually watching; when the viewer leaves, nothing remains.
--
-- Topics:
--   screen-watch-lobby          presence: which recordable people are on the platform now
--                               (session id, user id, email, start time; no page contents)
--   screen-watch:<user id>      that person's live stream (broadcast) + who is watching (presence)

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.screen_watch_chunks;
EXCEPTION WHEN undefined_object OR undefined_table THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.screen_watch_sessions;
EXCEPTION WHEN undefined_object OR undefined_table THEN NULL; END $$;

DROP TABLE IF EXISTS public.screen_watch_chunks;
DROP TABLE IF EXISTS public.screen_watch_sessions;
DROP FUNCTION IF EXISTS public.screen_watch_chunk_before_insert();

-- who may use a screen-watch topic (realtime.topic() is the channel being joined / sent to)
CREATE OR REPLACE FUNCTION public.screen_watch_topic_allowed(p_topic text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN p_topic = 'screen-watch-lobby' THEN public.team_has_role('principal') OR public.screen_watch_applies()
    WHEN p_topic LIKE 'screen-watch:%' THEN
      public.team_has_role('principal')
      OR (p_topic = 'screen-watch:' || auth.uid()::text AND public.screen_watch_applies())
    ELSE false
  END
$$;
REVOKE EXECUTE ON FUNCTION public.screen_watch_topic_allowed(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.screen_watch_topic_allowed(text) TO authenticated;

DROP POLICY IF EXISTS "screen watch live: join" ON realtime.messages;
CREATE POLICY "screen watch live: join" ON realtime.messages FOR SELECT TO authenticated
  USING (realtime.topic() LIKE 'screen-watch%' AND public.screen_watch_topic_allowed(realtime.topic()));

DROP POLICY IF EXISTS "screen watch live: send" ON realtime.messages;
CREATE POLICY "screen watch live: send" ON realtime.messages FOR INSERT TO authenticated
  WITH CHECK (realtime.topic() LIKE 'screen-watch%' AND public.screen_watch_topic_allowed(realtime.topic()));
