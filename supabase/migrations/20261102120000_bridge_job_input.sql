-- Web terminal: answering an agent's question while its job runs (Antigravity ask_question).
-- The bridge marks the job as awaiting input and prints the question; the job's owner answers from
-- /terminal (bridge_job_reply), which rings the device's doorbell; the bridge takes the answer
-- (bridge_job_input 'take') and hands it to the agent.

ALTER TABLE public.bridge_jobs
  ADD COLUMN awaiting_input boolean NOT NULL DEFAULT false,
  ADD COLUMN pending_input text CHECK (length(pending_input) <= 4000);

-- The job's owner answers (only while the bridge is waiting for it)
CREATE OR REPLACE FUNCTION public.bridge_job_reply(p_job_id uuid, p_text text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  j public.bridge_jobs;
BEGIN
  IF length(btrim(coalesce(p_text, ''))) = 0 OR length(p_text) > 4000 THEN
    RAISE EXCEPTION 'empty or too long answer';
  END IF;
  UPDATE public.bridge_jobs SET pending_input = p_text
  WHERE id = p_job_id AND user_id = auth.uid() AND status = 'running' AND awaiting_input
  RETURNING * INTO j;
  IF j.id IS NULL THEN
    RAISE EXCEPTION 'this job is not waiting for an answer';
  END IF;
  PERFORM realtime.send(jsonb_build_object('job', j.id, 'input', true), 'job-input', 'bridge-' || j.device_id::text, false);
END $$;

-- The bridge: 'await' starts waiting, 'take' returns (and clears) the answer, 'done' stops waiting
CREATE OR REPLACE FUNCTION public.bridge_job_input(p_device_id uuid, p_auth_key text, p_job_id uuid, p_mode text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v text;
BEGIN
  IF NOT public.bridge_device_check(p_device_id, p_auth_key) THEN
    RAISE EXCEPTION 'device not authorized' USING ERRCODE = '28000';
  END IF;
  IF p_mode = 'await' THEN
    UPDATE public.bridge_jobs SET awaiting_input = true, pending_input = NULL
    WHERE id = p_job_id AND device_id = p_device_id AND status = 'running';
  ELSIF p_mode = 'take' THEN
    SELECT pending_input INTO v FROM public.bridge_jobs WHERE id = p_job_id AND device_id = p_device_id FOR UPDATE;
    IF v IS NOT NULL THEN
      UPDATE public.bridge_jobs SET pending_input = NULL WHERE id = p_job_id;
    END IF;
  ELSIF p_mode = 'done' THEN
    UPDATE public.bridge_jobs SET awaiting_input = false, pending_input = NULL
    WHERE id = p_job_id AND device_id = p_device_id;
  ELSE
    RAISE EXCEPTION 'bad mode';
  END IF;
  RETURN v;
END $$;

REVOKE EXECUTE ON FUNCTION public.bridge_job_reply(uuid, text), public.bridge_job_input(uuid, text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bridge_job_reply(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bridge_job_input(uuid, text, uuid, text) TO anon, authenticated;
