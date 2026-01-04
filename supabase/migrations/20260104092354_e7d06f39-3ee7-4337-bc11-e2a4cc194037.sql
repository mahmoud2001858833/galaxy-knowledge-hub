-- جدول إعدادات الوصول للمستخدمين
CREATE TABLE public.user_accessibility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  accessibility_mode TEXT DEFAULT 'standard',
  font_size TEXT DEFAULT 'medium',
  high_contrast BOOLEAN DEFAULT false,
  reduce_motion BOOLEAN DEFAULT false,
  screen_reader BOOLEAN DEFAULT false,
  voice_input BOOLEAN DEFAULT true,
  sign_language BOOLEAN DEFAULT false,
  text_to_speech BOOLEAN DEFAULT true,
  reading_speed DECIMAL DEFAULT 1.0,
  preferred_voice TEXT DEFAULT 'female-ar',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- تفعيل RLS
ALTER TABLE public.user_accessibility_settings ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can view their own settings"
ON public.user_accessibility_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.user_accessibility_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_accessibility_settings FOR UPDATE
USING (auth.uid() = user_id);

-- جدول قاموس لغة الإشارة
CREATE TABLE public.sign_language_dictionary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_arabic TEXT NOT NULL,
  word_english TEXT,
  sign_video_url TEXT,
  sign_gif_url TEXT,
  sign_image_url TEXT,
  category TEXT DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE public.sign_language_dictionary ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنه رؤية القاموس
CREATE POLICY "Anyone can view sign language dictionary"
ON public.sign_language_dictionary FOR SELECT
USING (true);

-- فقط المسؤولين يمكنهم الإضافة
CREATE POLICY "Admins can insert signs"
ON public.sign_language_dictionary FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_accessibility_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accessibility_settings_timestamp
BEFORE UPDATE ON public.user_accessibility_settings
FOR EACH ROW
EXECUTE FUNCTION update_accessibility_settings_updated_at();