-- Collective tasks reach people inside the platform, not only by email:
-- every day each subtask that starts that day becomes a team_tasks row for its owner (shown in
-- لوحة الموظفين / /team, with notifications), linked back here. When the member finishes it there,
-- the collective subtask follows (in_progress / done), so the admin sees real progress.
ALTER TABLE public.collective_subtasks
  ADD COLUMN IF NOT EXISTS team_task_id uuid REFERENCES public.team_tasks (id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS collective_subtasks_team_task ON public.collective_subtasks (team_task_id);

CREATE OR REPLACE FUNCTION public.collective_follow_team_task()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    UPDATE public.collective_subtasks SET status = NEW.status WHERE team_task_id = NEW.id;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.collective_follow_team_task() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS collective_follow_team_task ON public.team_tasks;
CREATE TRIGGER collective_follow_team_task AFTER UPDATE OF status ON public.team_tasks
  FOR EACH ROW EXECUTE FUNCTION public.collective_follow_team_task();
