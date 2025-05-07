

-- هذا الملف لإظهار الكود SQL المطلوب لتشغيل الوقت الحقيقي
-- يجب تنفيذ هذا الاستعلام في لوحة تحكم Supabase SQL:

-- إعداد REPLICA IDENTITY FULL لضمان الحصول على البيانات الكاملة للصفوف المتغيرة
ALTER TABLE public.group_messages REPLICA IDENTITY FULL;
ALTER TABLE public.private_messages REPLICA IDENTITY FULL;

-- تمكين الوقت الحقيقي للجدول group_messages
ALTER publication supabase_realtime ADD TABLE group_messages;

-- تمكين الوقت الحقيقي للجدول private_messages
ALTER publication supabase_realtime ADD TABLE private_messages;

-- ملاحظة: تم إلغاء استخدام وظيفة enable_realtime لأنه لا يمكن استخدامها من خلال واجهة JavaScript
-- بدلاً من ذلك، يجب تنفيذ الأوامر SQL أعلاه مباشرة في لوحة تحكم Supabase

