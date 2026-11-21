-- «أخوة التطوع» on the خطى التطوع site: anyone can propose a volunteering initiative; the request goes
-- only to the platform principal by email (approve / reject links). Approved, upcoming initiatives are
-- listed publicly and people can join them. All access goes through the volunteer-initiatives Edge
-- Function (service role); phones and emails never leave it. Platform admins may read the tables.

CREATE TABLE IF NOT EXISTS public.volunteer_initiatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 3 AND 120),
  summary text NOT NULL CHECK (length(btrim(summary)) BETWEEN 20 AND 1500),
  category text NOT NULL CHECK (category IN ('education', 'environment', 'health', 'community', 'tech', 'relief', 'other')),
  governorate text NOT NULL CHECK (governorate IN ('amman', 'irbid', 'zarqa', 'balqa', 'mafraq', 'jerash', 'ajloun', 'madaba', 'karak', 'tafilah', 'maan', 'aqaba')),
  location text NOT NULL CHECK (length(btrim(location)) BETWEEN 3 AND 200),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  capacity integer NOT NULL CHECK (capacity BETWEEN 1 AND 500),
  organizer_name text NOT NULL CHECK (length(btrim(organizer_name)) BETWEEN 2 AND 80),
  organizer_phone text NOT NULL CHECK (organizer_phone ~ '^07[789][0-9]{7}$'),
  organizer_email text CHECK (organizer_email IS NULL OR organizer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  decision_note text CHECK (decision_note IS NULL OR length(decision_note) <= 500),
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS volunteer_initiatives_public_idx ON public.volunteer_initiatives (status, starts_at);
CREATE INDEX IF NOT EXISTS volunteer_initiatives_phone_idx ON public.volunteer_initiatives (organizer_phone, status);

CREATE TABLE IF NOT EXISTS public.volunteer_initiative_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid NOT NULL REFERENCES public.volunteer_initiatives(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 2 AND 80),
  phone text NOT NULL CHECK (phone ~ '^07[789][0-9]{7}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (initiative_id, phone)
);

ALTER TABLE public.volunteer_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_initiative_participants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.volunteer_initiatives, public.volunteer_initiative_participants FROM anon;

DROP POLICY IF EXISTS volunteer_initiatives_admin_read ON public.volunteer_initiatives;
CREATE POLICY volunteer_initiatives_admin_read ON public.volunteer_initiatives FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
DROP POLICY IF EXISTS volunteer_participants_admin_read ON public.volunteer_initiative_participants;
CREATE POLICY volunteer_participants_admin_read ON public.volunteer_initiative_participants FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- join atomically: no overbooking when two people take the last seat at once
CREATE OR REPLACE FUNCTION public.volunteer_initiative_join(p_id uuid, p_name text, p_phone text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v public.volunteer_initiatives;
  v_count integer;
BEGIN
  SELECT * INTO v FROM public.volunteer_initiatives WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR v.status <> 'approved' THEN RETURN 'not_found'; END IF;
  IF coalesce(v.ends_at, v.starts_at) < now() THEN RETURN 'ended'; END IF;
  IF EXISTS (SELECT 1 FROM public.volunteer_initiative_participants WHERE initiative_id = p_id AND phone = p_phone) THEN
    RETURN 'already';
  END IF;
  SELECT count(*) INTO v_count FROM public.volunteer_initiative_participants WHERE initiative_id = p_id;
  IF v_count >= v.capacity THEN RETURN 'full'; END IF;
  INSERT INTO public.volunteer_initiative_participants (initiative_id, name, phone) VALUES (p_id, btrim(p_name), p_phone);
  RETURN 'joined';
END $$;
REVOKE EXECUTE ON FUNCTION public.volunteer_initiative_join(uuid, text, text) FROM PUBLIC, anon, authenticated;
