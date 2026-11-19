-- Collective tasks, part 4: one approval request for a whole day of team work.
--
-- * A bridge project can be in "batched" approval mode: after each /terminal job the changes stay on the
--   computer (visible in the live preview) instead of opening an approval request per job.
-- * A collective task can be linked to its project. When the last person finishes the day's subtasks, the
--   scheduler asks for ONE combined approval request (batch_requested_at + a note naming tasks and people);
--   the bridge claims it, sends everything changed in the project, and marks it done.

ALTER TABLE public.bridge_projects
  ADD COLUMN IF NOT EXISTS approval_mode text NOT NULL DEFAULT 'per_job' CHECK (approval_mode IN ('per_job', 'batched')),
  ADD COLUMN IF NOT EXISTS batch_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS batch_claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS batch_note text CHECK (batch_note IS NULL OR length(batch_note) <= 4000);

ALTER TABLE public.collective_tasks
  ADD COLUMN IF NOT EXISTS project_slug text REFERENCES public.bridge_projects (slug) ON UPDATE CASCADE ON DELETE SET NULL,
  -- completed subtasks up to this moment are already in a batch request
  ADD COLUMN IF NOT EXISTS batch_through timestamptz;

-- ---------------------------------------------------------------- bridge side
-- Is this project batched? (the bridge asks after each job)
CREATE OR REPLACE FUNCTION public.bridge_project_mode(p_device_id uuid, p_auth_key text, p_project text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  RETURN coalesce((SELECT approval_mode FROM public.bridge_projects WHERE slug = p_project), 'per_job');
END $$;
REVOKE EXECUTE ON FUNCTION public.bridge_project_mode(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_project_mode(uuid, text, text) TO anon, authenticated;

-- Batch requests waiting for this computer. A claim not finished within 10 minutes can be claimed again.
CREATE OR REPLACE FUNCTION public.bridge_batch_claim(p_device_id uuid, p_auth_key text)
RETURNS TABLE (slug text, note text) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  RETURN QUERY
  UPDATE public.bridge_projects p SET batch_claimed_at = now()
  WHERE p.batch_requested_at IS NOT NULL
    AND (p.device_id IS NULL OR p.device_id = p_device_id)
    AND (p.batch_claimed_at IS NULL OR p.batch_claimed_at < now() - interval '10 minutes')
  RETURNING p.slug, p.batch_note;
END $$;
REVOKE EXECUTE ON FUNCTION public.bridge_batch_claim(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_batch_claim(uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.bridge_batch_done(p_device_id uuid, p_auth_key text, p_project text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  UPDATE public.bridge_projects SET batch_requested_at = NULL, batch_claimed_at = NULL, batch_note = NULL
  WHERE slug = p_project AND batch_claimed_at IS NOT NULL;
END $$;
REVOKE EXECUTE ON FUNCTION public.bridge_batch_done(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_batch_done(uuid, text, text) TO anon, authenticated;
