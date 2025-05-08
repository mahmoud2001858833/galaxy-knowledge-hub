
-- هذا الملف لإظهار الكود SQL المطلوب لتشغيل الوقت الحقيقي
-- يجب تنفيذ هذا الاستعلام في لوحة تحكم Supabase SQL:

-- إعداد REPLICA IDENTITY FULL لضمان الحصول على البيانات الكاملة للصفوف المتغيرة
ALTER TABLE public.group_messages REPLICA IDENTITY FULL;
ALTER TABLE public.private_messages REPLICA IDENTITY FULL;
ALTER TABLE public.group_chats REPLICA IDENTITY FULL;
ALTER TABLE public.contacts REPLICA IDENTITY FULL;
ALTER TABLE public.users_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- تمكين الوقت الحقيقي للجداول المطلوبة
ALTER publication supabase_realtime ADD TABLE group_messages;
ALTER publication supabase_realtime ADD TABLE private_messages;
ALTER publication supabase_realtime ADD TABLE group_chats;
ALTER publication supabase_realtime ADD TABLE contacts;
ALTER publication supabase_realtime ADD TABLE users_profiles;
ALTER publication supabase_realtime ADD TABLE messages;

-- ملاحظة: للاستفادة من هذه التغييرات، يجب تنفيذ هذه الأوامر SQL في لوحة تحكم Supabase
-- بعدها سيكون بإمكان التطبيق الاستماع للتغييرات في الوقت الحقيقي
