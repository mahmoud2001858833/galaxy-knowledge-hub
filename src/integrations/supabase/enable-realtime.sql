
-- هذا الملف لإظهار الكود SQL المطلوب لتشغيل الوقت الحقيقي
-- يجب تنفيذ هذا الاستعلام في لوحة تحكم Supabase SQL:

-- تمكين الوقت الحقيقي للجدول group_messages
ALTER publication supabase_realtime ADD TABLE group_messages;

-- تمكين الوقت الحقيقي للجدول private_messages
ALTER publication supabase_realtime ADD TABLE private_messages;

-- إضافة وظيفة لتمكين الوقت الحقيقي لأي جدول
CREATE OR REPLACE FUNCTION enable_realtime(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER publication supabase_realtime ADD TABLE %I', table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
