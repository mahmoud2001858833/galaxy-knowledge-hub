-- Collective tasks: the admin's instructions for the planner (how to split the work), e.g.
-- "وزّع بالتساوي لكن أصعب المهام لمحمد" or "أحمد متاح بس آخر الأسبوع". Read by the AI planner.
ALTER TABLE public.collective_tasks
  ADD COLUMN IF NOT EXISTS planner_notes text CHECK (planner_notes IS NULL OR length(planner_notes) <= 4000);
