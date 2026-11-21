-- خطى التطوع becomes an independent platform: organisations (companies, NGOs, schools, government
-- bodies) publish volunteering opportunities through the same reviewed flow as individuals' initiatives,
-- and an AI guide helps volunteers choose. Rate limiting for the public guide lives here too.

ALTER TABLE public.volunteer_initiatives
  ADD COLUMN IF NOT EXISTS organizer_type text NOT NULL DEFAULT 'individual'
    CHECK (organizer_type IN ('individual', 'company', 'ngo', 'school', 'government')),
  ADD COLUMN IF NOT EXISTS organization_name text
    CHECK (organization_name IS NULL OR length(btrim(organization_name)) BETWEEN 2 AND 120),
  ADD COLUMN IF NOT EXISTS remote boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}'
    CHECK (cardinality(skills) <= 8);

DO $$ BEGIN
  ALTER TABLE public.volunteer_initiatives ADD CONSTRAINT volunteer_initiatives_org_name_required
    CHECK (organizer_type = 'individual' OR organization_name IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- public AI guide: hashed caller + time, kept one day
CREATE TABLE IF NOT EXISTS public.khuta_guide_hits (
  id bigserial PRIMARY KEY,
  caller text NOT NULL,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS khuta_guide_hits_idx ON public.khuta_guide_hits (caller, at DESC);
CREATE INDEX IF NOT EXISTS khuta_guide_hits_at_idx ON public.khuta_guide_hits (at);
ALTER TABLE public.khuta_guide_hits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.khuta_guide_hits FROM anon, authenticated;
