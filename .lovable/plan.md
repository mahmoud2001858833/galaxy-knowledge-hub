## تحسين نظام التوحّد — خطة شاملة

### 1) الواجهة الرئيسية (`AutismHome.tsx`)
- إعادة تصميم البطاقات بأنيميشن أكثر حيوية (تأثير "نبض" خفيف على بطاقة "ابدأ الآن")، أيقونات أكبر، تدرّجات أنعم، خلفية متحرّكة هادئة (فقاعات/نجوم).
- **اشتراط اسم الطفل قبل أي شيء**: لو ما في `autism_active_profile` ⇒ مودال إجباري يطلب اسم الطفل + عمره + بريد ولي الأمر، يُحفظ في `localStorage` و(إن كان مسجّل دخول) في `autism_child_profiles`.
- إضافة شريط ترحيب شخصي: «أهلاً يا {الاسم} 👋» مع رسم متحرّك يحمل اسم الطفل (للجذب).
- اختصارات سريعة: «العب الآن»، «تقريري اليومي»، «أرسل لولي الأمر».

### 2) الألعاب — جذب الانتباه + استخدام الاسم
لكل لعبة من القوالب الـ12 في `src/features/autism/games/templates/`:
- إضافة **TTS ترحيبي** ينطق اسم الطفل في البداية والنهاية («أحسنت يا أحمد!»).
- مؤثّرات صوتية مرحة (نقر/نجاح/فشل) + اهتزاز Haptics على النجاح.
- جسيمات نجوم/قلوب عند الإنجاز (canvas-confetti).
- شريط تقدّم ملوّن متحرّك أعلى الشاشة.
- شخصية مرشد (Mascot) ثابتة (دب/نجم) تظهر التعليمات بفقاعة حوار وتذكر اسم الطفل.
- ميزة Difficulty تتدرّج تلقائياً داخل الجلسة (Adaptive): تزيد بعد 3 نجاحات متتالية، تنقص بعد فشلين.

### 3) تنويع ألعاب التشخيص والعلاج
- **5 ألعاب تشخيصية ثابتة للجميع** (نقطة الانطلاق الموحّدة):
  1. `name_response` — استجابة للاسم (تستخدم اسم الطفل فعلياً).
  2. `bubble_tracking` — انتباه بصري.
  3. `emotion_cards` — تمييز انفعالات.
  4. `look_with_me` — انتباه مشترك.
  5. `magic_mirror` — تقليد.
- بعد انتهاء الخمسة، تُرسل النتائج (دقّة + زمن استجابة + raw metrics) إلى edge function جديدة `autism-personalize-diagnostic` تُرجع **بطارية مخصّصة** من 4–6 ألعاب إضافية مختارة من قوالب الـ12 مع `difficulty` و`duration_sec` و`adaptations_ar` مصمّمة على ضعف/قوة كل طفل.
- نفس المنطق يُستخدم لاحقاً لتوليد ألعاب البرنامج العلاجي اليومي عبر `autism-generate-program` المحدّث (يقرأ آخر نتائج الطفل من `autism_game_sessions` قبل توليد اليوم التالي).

### 4) تقرير فوري + رسم بياني + بريد لولي الأمر
عند انتهاء أي جلسة ألعاب (تشخيص أو علاج):
- يُعرض **ReportView محسّن** فوراً يحتوي:
  - بطاقات مؤشّرات (دقّة، زمن، مستوى انتباه، تنظيم حسّي).
  - رسم Radar (Recharts) للنطاقات الخمسة (تواصل/تكرار/حسّي/لغة/لعب).
  - رسم Bar لنسبة التحسّن لكل لعبة مقارنة بآخر 3 جلسات.
  - زرّ «📧 أرسل لولي الأمر».
- Edge function جديدة `autism-email-report`:
  - يستقبل `child_profile_id` + `session_ids` + `parent_email`.
  - يولّد HTML بتنسيق رسوم SVG مدمجة (chart-as-svg) + ملخّص AI عربي.
  - يرسل عبر **Resend** (يحتاج `RESEND_API_KEY` — سأطلبه من المستخدم قبل التنفيذ).
- إرسال تلقائي اختياري عند نهاية كل **يوم علاجي كامل**: ملخّص اليوم + نسبة التحسّن لكل لعبة + المجموع اليومي + توصيات الغد.

### 5) البرنامج العلاجي — تحسينات
- جدول يومي ديناميكي: عدد الألعاب يتكيّف مع تركيز الطفل (5–10).
- بعد كل يوم: `autism-analyze-day` يحسب `improvement_pct` لكل لعبة (مقارنة باليوم السابق) ويخزّنها في `autism_day_reports.metrics.improvement_by_game`.
- لوحة تقدّم (`AutismProgressDashboard`) تعرض:
  - منحنى تطوّر أسبوعي.
  - أعلى 3 مهارات تحسّنت / أقل 3 مهارات.
  - زر تنزيل/إرسال تقرير أسبوعي PDF لولي الأمر.

### 6) قاعدة البيانات
ترحيل واحد يضيف:
- `autism_child_profiles.parent_email TEXT`، `parent_phone TEXT`.
- جدول جديد `autism_email_log` (message_id, recipient_email, kind: session|daily|weekly, status, child_profile_id, created_at) + GRANT + RLS (المالك فقط، service_role كامل).
- عمود `autism_day_reports.improvement_by_game JSONB`.

### 7) الملفّات المتأثّرة
- **جديد**: `supabase/functions/autism-personalize-diagnostic/index.ts`, `supabase/functions/autism-email-report/index.ts`, `src/features/autism/ui/Mascot.tsx`, `src/features/autism/ui/GameFX.tsx` (confetti + sound + tts helper), `src/features/autism/ReportView.tsx` (تحديث جوهري بـ Recharts), `src/components/damij/AutismOnboardingModal.tsx`.
- **تحديث**: `AutismHome.tsx`, `AutismDiagnosis.tsx` (تثبيت 5 ألعاب موحّدة ثم استدعاء التخصيص), `AutismGamePlayer.tsx` (دمج Mascot/FX/الإرسال الفوري), `AutismDayView.tsx` (إرسال نهاية اليوم), `AutismProgressDashboard.tsx`, جميع `templates/*.tsx` (إضافة اسم الطفل + FX), `autism-generate-program/index.ts`, `autism-analyze-day/index.ts`.

### 8) سرّ مطلوب
- **`RESEND_API_KEY`** للبريد. سأطلبه عبر أداة الأسرار فور الانتقال لوضع التنفيذ — بدونه لن تعمل ميزة إرسال التقرير، وكلّ شيء آخر سيعمل.

### خارج النطاق
- تطبيق ولي الأمر منفصل / إشعارات Push.
- تكامل WhatsApp.
- ترجمة الواجهة لغير العربية.

هل أبدأ التنفيذ بهذا الترتيب؟