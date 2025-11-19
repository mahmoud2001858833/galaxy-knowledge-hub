-- حذف جميع البيانات القديمة من المساعد الأردني
DELETE FROM student_assistant_usage;
DELETE FROM jordanian_textbooks;

-- إنشاء جدول جديد لتخزين تحليلات الصور
CREATE TABLE IF NOT EXISTS jordanian_image_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  image_url TEXT NOT NULL,
  question TEXT,
  analysis_result TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل Row Level Security
ALTER TABLE jordanian_image_analysis ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدمين بمشاهدة تحليلاتهم الخاصة
CREATE POLICY "Users can view own image analysis"
  ON jordanian_image_analysis FOR SELECT
  USING (auth.uid() = user_id);

-- السماح للمستخدمين بإضافة تحليلات جديدة
CREATE POLICY "Users can insert own image analysis"
  ON jordanian_image_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- إنشاء bucket للصور إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public)
VALUES ('jordanian-images', 'jordanian-images', true)
ON CONFLICT (id) DO NOTHING;