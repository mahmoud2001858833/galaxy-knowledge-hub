-- Rollback for 20261101200000_team_management.sql. Deletes all team data.
ALTER PUBLICATION supabase_realtime DROP TABLE public.team_messages, public.team_poll_votes, public.team_tasks, public.team_notifications;
DROP POLICY IF EXISTS "team members read team files" ON storage.objects;
DROP POLICY IF EXISTS "team members upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "owner or lead deletes team files" ON storage.objects;
-- empty the bucket from the dashboard first, then:
-- DELETE FROM storage.buckets WHERE id = 'team-files';
DROP TABLE IF EXISTS public.team_messages, public.team_poll_votes, public.team_polls, public.team_notifications,
  public.team_task_submissions, public.team_tasks, public.team_members CASCADE;
DROP FUNCTION IF EXISTS public.team_start_task(uuid), public.team_complete_task(uuid, text, text, text, text, text[], jsonb),
  public.team_my_roles(), public.team_my_email(), public.team_is_member(), public.team_is_lead(), public.team_has_role(text),
  public.team_is_my_task(text, uuid), public.team_members_resolve_user(), public.team_members_protect_principal(),
  public.team_tasks_touch();
