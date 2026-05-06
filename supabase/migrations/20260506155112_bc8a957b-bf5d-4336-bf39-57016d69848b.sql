
CREATE TABLE public.clinical_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL,
  ui_kind TEXT NOT NULL DEFAULT 'card',
  applicable_specialties TEXT[] NOT NULL DEFAULT '{}',
  default_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  description_ar TEXT,
  safety_ar TEXT[] NOT NULL DEFAULT '{}',
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clinical_devices_specs ON public.clinical_devices USING GIN(applicable_specialties);

ALTER TABLE public.clinical_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Devices readable by authenticated"
ON public.clinical_devices FOR SELECT TO authenticated USING (true);

CREATE TABLE public.clinical_device_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  device_key TEXT NOT NULL,
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_reading JSONB NOT NULL DEFAULT '{}'::jsonb,
  applied_to_session BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clinical_device_uses_session ON public.clinical_device_uses(session_id);
CREATE INDEX idx_clinical_device_uses_user ON public.clinical_device_uses(user_id);

ALTER TABLE public.clinical_device_uses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own device uses"
ON public.clinical_device_uses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own device uses"
ON public.clinical_device_uses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own device uses"
ON public.clinical_device_uses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
