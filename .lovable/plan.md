

# إضافة توليد وجدولة الألغاز بالذكاء الاصطناعي

## ملخص
إضافة خيارين جديدين في لوحة إدارة الألغاز التعليمية:
1. **توليد ألغاز بالذكاء الاصطناعي** - الأدمن يحدد العدد، الصعوبة، المادة، والمواضيع → AI ينتج الألغاز مع صور (بدون كلام عربي) ويرفعها مباشرة
2. **جدولة ألغاز بالذكاء الاصطناعي** - الأدمن يحدد الأيام، عدد الألغاز يومياً، المستوى، النوع، والمحتوى → النظام ينزل ألغاز تلقائياً بالأيام المحددة

## التغييرات المطلوبة

### 1. جدول جديد: `scheduled_puzzle_jobs`
```sql
CREATE TABLE scheduled_puzzle_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  puzzles_per_day INTEGER NOT NULL DEFAULT 3,
  topic_description TEXT NOT NULL,
  schedule_days TEXT[] NOT NULL, -- ['sunday','monday',...]
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. Edge Function: `generate-ai-puzzles`
- يستقبل: المادة، الصعوبة، العدد، وصف المواضيع
- يستخدم مفتاح AI: `AIzaSyA2ZnwA-yCDBdkFmqtg2dZTq4DuQSSS7zM` (Google Gemini)
- يولّد الألغاز (عنوان، سؤال، 4 خيارات، إجابة صحيحة، نقاط)
- لكل لغز يولّد صورة تعليمية بدون أي نص عربي باستخدام `gemini-2.0-flash-exp-image-generation`
- يرفع الصور على Supabase Storage (`educational_images`)
- يدخل الألغاز في جدول `subject_puzzles`

### 3. Edge Function: `run-scheduled-puzzles`
- يفحص جدول `scheduled_puzzle_jobs` للوظائف النشطة
- يتحقق من اليوم الحالي مقابل `schedule_days`
- يستدعي `generate-ai-puzzles` لتوليد العدد المطلوب
- يُحدّث `last_run_at`
- يتم تشغيله عبر cron job يومي

### 4. مكونات واجهة جديدة

**`AIPuzzleGenerator.tsx`** - تاب جديد في الإدارة:
- حقل اختيار المادة (فيزياء/كيمياء/أحياء/رياضيات)
- حقل اختيار الصعوبة (سهل/متوسط/صعب)
- حقل عدد الألغاز (1-20)
- حقل نصي لوصف المواضيع المطلوبة
- زر "توليد ونشر" → يستدعي الـ edge function ويعرض progress

**`AIPuzzleScheduler.tsx`** - تاب جدولة:
- اختيار الأيام (checkboxes: أحد، اثنين، ثلاثاء...)
- عدد الألغاز يومياً
- المادة والصعوبة
- وصف المحتوى المطلوب
- عرض الجداول النشطة مع خيار إيقاف/حذف

### 5. تعديل `AdminPuzzlePanel.tsx`
- إضافة تابين جديدين: "توليد بالذكاء" و "الجدولة"
- التابات تصبح: إدارة الألغاز | إضافة لغز | توليد بالذكاء | الجدولة

## الملفات

| ملف | عملية |
|-----|-------|
| `supabase/migrations/...scheduled_puzzle_jobs.sql` | إنشاء جدول الجدولة |
| `supabase/functions/generate-ai-puzzles/index.ts` | edge function توليد الألغاز |
| `supabase/functions/run-scheduled-puzzles/index.ts` | edge function تشغيل الجدولة |
| `src/components/puzzles/AIPuzzleGenerator.tsx` | واجهة التوليد |
| `src/components/puzzles/AIPuzzleScheduler.tsx` | واجهة الجدولة |
| `src/components/puzzles/AdminPuzzlePanel.tsx` | إضافة التابات الجديدة |

## ملاحظة عن مفتاح AI
المفتاح `AIzaSyA2ZnwA-yCDBdkFmqtg2dZTq4DuQSSS7zM` سيُخزن مباشرة في كود الـ edge function (public API key) لتوليد النصوص والصور.

