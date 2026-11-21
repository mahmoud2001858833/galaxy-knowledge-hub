-- «المهام الكبرى»: marks on the team's master schedule that are not tasks — rest days, events, notes.
-- Leads (principal and supervisors) read and edit them; members never see this table.
CREATE TABLE IF NOT EXISTS public.team_plan_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL,
  role text,                -- a whole role (e.g. auditor) …
  member_email text,        -- … or one person
  label text NOT NULL CHECK (length(btrim(label)) BETWEEN 1 AND 200),
  kind text NOT NULL DEFAULT 'note' CHECK (kind IN ('rest', 'note', 'event')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS team_plan_marks_day_idx ON public.team_plan_marks (day);
ALTER TABLE public.team_plan_marks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.team_plan_marks FROM anon;
DROP POLICY IF EXISTS team_plan_marks_leads ON public.team_plan_marks;
CREATE POLICY team_plan_marks_leads ON public.team_plan_marks FOR ALL TO authenticated
  USING (public.team_is_lead()) WITH CHECK (public.team_is_lead());
