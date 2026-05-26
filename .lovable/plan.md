## خطة الإكمال والربط لنظام التوحد

### 1. ربط تدفق التشخيص الذكي (Diagnostic Flow)
- **`AutismDiagnosis.tsx`**: عرض الألعاب الخمس الثابتة بالترتيب، تتبع التقدم، وعند الانتهاء استدعاء `autism-personalize-diagnostic` لتوليد بطارية الألعاب المخصصة (4–6 ألعاب).
- حفظ نتائج كل لعبة في `autism_game_sessions` مع `is_baseline=true` للخمسة الأولى.
- بعد التخصيص: عرض شاشة "ألعابك المخصصة" مع تشغيل تلقائي للأولى، واستخدام اسم الطفل في الترحيب.
- إرسال تقرير "نتائج التشخيص" لولي الأمر تلقائياً عبر `autism-email-report` (kind=`session` ملخّص).

### 2. ربط `AutismGamePlayer` مع المخصصات
- قراءة `difficulty` و`adaptations_ar` و`duration_sec` من سجل اللعبة المخصصة.
- تمرير هذه القيم لقوالب الألعاب الـ12 (props موحّدة: `childName`, `difficulty`, `adaptations`, `duration`).
- التكيّف التلقائي: زيادة الصعوبة بعد 3 نجاحات متتالية، تخفيضها بعد فشلين (يحفظ في `autism_game_sessions.metadata`).

### 3. تحديث قوالب الألعاب الـ12
- إضافة المؤثرات الموحّدة (`gameFX`: TTS باسم الطفل، confetti، أصوات نجاح).
- إضافة `Mascot` ثابت يعطي تعليمات قبل/أثناء/بعد اللعب.
- ضمان أن كل لعبة تُرجع `{accuracy, duration, reactions, errors}` بشكل موحّد للتقارير.

### 4. تحديث `autism-generate-program` (البرنامج العلاجي اليومي)
- يقرأ آخر تقرير تشخيصي + نتائج آخر 3 أيام من `autism_day_reports`.
- يولّد 5–10 ألعاب لكل يوم (الأضعف يُكرّر، الأقوى يتقدّم بصعوبة).
- يحفظ في `autism_program_days` مع `focus_skill_ar` و`rationale_ar`.

### 5. تحديث `autism-analyze-day` + `improvement_by_game`
- يحسب نسبة التحسن لكل لعبة مقارنة بأول جلسة لها (baseline).
- يخزن JSON في `autism_day_reports.improvement_by_game`: `{game_key: {baseline, today, improvement_pct}}`.
- بعد التحليل: استدعاء `autism-email-report` (kind=`daily`) تلقائياً لإرسال تقرير اليوم لولي الأمر.

### 6. ترقية `AutismProgressDashboard` (Recharts)
- **Radar Chart**: 5 مهارات أساسية (انتباه، تواصل، مشاعر، حركة، لغة) — متوسط آخر 7 أيام.
- **Bar Chart**: نسبة التحسن لكل لعبة.
- **Line Chart**: الاتجاه الأسبوعي للنقاط الإجمالية.
- بطاقات: أعلى 3 مهارات، أدنى 3 مهارات، أفضل يوم.
- زر "إرسال تقرير أسبوعي" يستدعي `autism-email-report` (kind=`weekly`).

### 7. تحسينات `ReportView` (داخل التطبيق)
- نفس المخططات (Radar + Bar) بصيغة مبسّطة.
- تظهر مباشرة بعد إنهاء اليوم مع زر "إرسال لولي الأمر".

### الملفات المتأثرة

**تحديث:**
- `src/pages/damij/autism/AutismDiagnosis.tsx`
- `src/pages/damij/autism/AutismGamePlayer.tsx`
- `src/pages/damij/autism/AutismProgressDashboard.tsx`
- `src/features/autism/games/*` (12 قالب)
- `supabase/functions/autism-generate-program/index.ts`
- `supabase/functions/autism-analyze-day/index.ts`

**إنشاء:**
- `src/features/autism/ui/ReportView.tsx`
- `src/features/autism/games/shared/GameShell.tsx` (غلاف موحّد للألعاب)

### خارج النطاق (كما اتفقنا سابقاً)
- تطبيق ولي الأمر المنفصل، WhatsApp، الإشعارات Push، الترجمة لغير العربية.

### ملاحظة
- `RESEND_API_KEY` متوفر ✅، الإيميل سيُرسل من `onboarding@resend.dev` ما لم تربط دومين مخصص.
