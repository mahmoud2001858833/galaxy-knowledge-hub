# خطة إكمال نظام التوحد

## ما تم سابقاً
- إضافة `parent_name` و `intake_answers` لـ `autism_child_profiles`
- تحديث `AutismOnboardingModal` لجمع معلومات ولي الأمر وحفظها في localStorage
- 4 ألعاب جديدة: CategoryMatch, ImpulseControl, SpeechBubbles, FeelingsColors
- `useTTS` و `GameIntroScreen`
- تحميل تلقائي للبيانات في `AutismDiagnosis`

## المتبقي (هذا الطلب)

### 1) صفحة اختيار طريقة التشخيص
**جديد:** `src/pages/damij/autism/AutismDiagnosisChoice.tsx`
- يعرض اسم الطفل المحفوظ
- زرّان كبيران:
  - **A**: استبيان ولي الأمر (8-12 سؤال) → ألعاب مخصصة بالـ AI
  - **B**: ابدأ مباشرة بـ 10 ألعاب تشخيصية → تحليل تلقائي
- مسار: `/damij/autism/diagnosis` يصبح هذه الصفحة (نقل الحالي إلى `/diagnosis/games`)

### 2) استبيان ولي الأمر
**جديد:** `src/pages/damij/autism/ParentIntakeQuestionnaire.tsx`
- 10 أسئلة (تواصل بصري، لغة، روتين، حسي، اجتماعي، اهتمامات، حركة، انفعالات، نوم، طعام)
- خيارات Likert (نادراً/أحياناً/غالباً/دائماً)
- يُخزّن في `intake_answers` ويستدعي `autism-generate-diagnostic-games` ثم يحوّل إلى لعب الألعاب

### 3) تقرير التشخيص + بريد إلكتروني
**جديد:** `src/pages/damij/autism/AutismDiagnosisReport.tsx`
- يعرض النتائج، نقاط القوة/الضعف، الفئة المقترحة، التوصيات
- زر "إرسال للبريد" يستدعي edge function جديدة

**جديد:** `supabase/functions/autism-send-report/index.ts`
- يولّد HTML للتقرير ويرسله عبر Resend إلى `parent_email`
- يخزّن مرجع التقرير في جدول جديد `autism_diagnostic_reports`

### 4) قاعدة البيانات
**migration جديد:**
```sql
CREATE TABLE public.autism_diagnostic_reports (
  id uuid PK default gen_random_uuid(),
  user_id uuid not null,
  child_profile_id uuid references autism_child_profiles(id) on delete cascade,
  mode text not null check (mode in ('intake','games_only')),
  intake_answers jsonb,
  game_results jsonb not null,
  ai_analysis jsonb not null,
  category text,
  sent_to_email text,
  share_token text unique,
  created_at timestamptz default now()
);
-- GRANT + RLS (auth.uid()=user_id)
```

### 5) توسيع edge function توليد الألعاب
**تعديل:** `supabase/functions/autism-generate-diagnostic-games/index.ts`
- يقبل `intake_answers` و `child_age` و `child_name`
- يولّد 10 ألعاب من القوالب الـ 10 المتوفرة (وليس 6)
- يخصّص المحتوى حسب إجابات الاستبيان والعمر

### 6) edge function تحليل النتائج
**جديد:** `supabase/functions/autism-analyze-results/index.ts`
- يستقبل نتائج الـ 10 ألعاب + (اختياري) intake
- يطلب من Gemini تحليلاً منظماً JSON: score, category, strengths[], weaknesses[], recommendations[], dsm_indicators[]
- يحفظ في `autism_diagnostic_reports`

### 7) تكامل GameIntroScreen
**تعديل:** `AutismGamePlayer.tsx`
- قبل كل لعبة: عرض `GameIntroScreen` مع نطق التعليمات وذكر اسم الطفل
- زر "ابدأ" يخفي الـ intro ويُشغّل اللعبة

### 8) Routing
**تعديل:** `App.tsx` أو ملف الـ damij router
- `/damij/autism/diagnosis` → `AutismDiagnosisChoice`
- `/damij/autism/diagnosis/intake` → `ParentIntakeQuestionnaire`
- `/damij/autism/diagnosis/games` → `AutismGamePlayer` (وضع تشخيصي)
- `/damij/autism/diagnosis/report/:id` → `AutismDiagnosisReport`

## التقنيات
- TTS: Web Speech API (افتراضي)، بدون ElevenLabs لتوفير التكلفة
- البريد: Resend (المفتاح موجود)
- AI: `AUTISM_GEMINI_API_KEY_V2` (متوفر)
- RLS: `auth.uid() = user_id` على الجدول الجديد

## ملاحظات
- لا نلمس واجهات الـ AutismLayout القائمة إلا لإضافة الـ routes
- الاحتفاظ بـ localStorage للملف النشط لتجنّب إعادة السؤال

هل أبدأ التنفيذ؟
