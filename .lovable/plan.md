# خطة: وضع التجربة الحرّة داخل مختبر المحاكاة السريرية

## الهدف
تمكين الطالب من اختيار/إدخال **دواء، علاج سلوكي، وسيلة مساعدة، إجراء تربوي، أو تدخّل حسّي** بشكل حر داخل الجلسة، ثم محاكاة استجابة المريض الافتراضي فوراً (تأثير قصير المدى وطويل المدى) مع تفسير سريري وتحذيرات أمان.

## تجربة المستخدم (UX)
في صفحة `ClinicalLabSession.tsx` يُضاف **تبويب جديد بجانب المحادثة** اسمه «جرّب تدخّلاً 🧪» يحتوي:

1. **شريط فئات سريع**: دواء 💊 • علاج سلوكي 🧠 • وسيلة تواصل 🗣️ • تدخّل حسّي 🎧 • وسيلة بصرية/سمعية 👁️👂 • إجراء تربوي 📋 • مخصّص ✍️
2. **قائمة مقترحات ذكية** مفلترة حسب فئة الحالة (ASD/ADHD/...). كل عنصر يحوي: الاسم، الجرعة/المدة الافتراضية، حقول قابلة للتعديل (جرعة، تكرار، مدة، شدة).
3. **حقل حر** لكتابة أي تدخّل غير مدرج + اختيار "محاكاة فورية".
4. **زر "جرّب الآن"** يستدعي edge function ويعرض:
   - ردّ المريض اللفظي/السلوكي
   - تغيّر المؤشرات (انتباه/قلق/تقدّم) + مؤشرات جديدة: **اليقظة، الأعراض الجانبية، الاستجابة العلاجية**
   - **خط زمني متوقّع** (15 دقيقة / ساعة / يوم / أسبوع) مع رسم بياني صغير
   - **تفسير سريري** + المراجع
   - **تحذيرات أمان** (موانع، تفاعلات، جرعة زائدة) بلون أحمر
   - زر «اعتمد كحدث في الجلسة» لتثبيته في سجل الأحداث.

## التغييرات التقنية

### 1) قاعدة البيانات (migration واحدة)
- جدول `clinical_interventions_catalog`: كتالوج جاهز للتدخّلات
  - الحقول الخاصة: `category` (medication/behavioral/sensory/aac/visual_aid/educational/custom)، `condition_keys` (مصفوفة من ASD/ADHD/...)، `name_ar`, `name_en`, `default_params` (jsonb: dose/freq/duration)، `mechanism_ar`, `expected_effects` (jsonb)، `contraindications_ar`، `references_ar`، `evidence_level`.
- جدول `clinical_intervention_trials`: كل محاولة يجريها الطالب
  - الحقول الخاصة: `session_id`, `user_id`, `intervention_id` (nullable للمخصّص)، `custom_label`، `params` (jsonb)، `ai_response` (jsonb كامل)، `applied_to_session` (bool)، `created_at`.
- بذر الكتالوج لاحقاً عبر edge function (≈300 تدخّل لكل فئة → +1500 إجمالاً).
- RLS: المستخدم يقرأ/يكتب محاولاته فقط؛ الكتالوج مقروء للجميع المصادَقين.

### 2) Edge Functions
- **`clinical-intervention-trial`** (جديدة): تستقبل `{ sessionId, interventionId?, customLabel?, params }`، تحمّل الحالة + البروتوكول + سجل الجلسة، ترسل لـ Gemini مع schema صارم يُرجع:
  ```
  { patient_say_ar, behavior_change_ar, immediate_metrics{...},
    timeline:[{t:"15min"|"1h"|"1d"|"1w", attention,anxiety,progress,symptoms_ar}],
    side_effects_ar[], safety_warnings_ar[], clinical_explanation_ar,
    references_ar[], success_score(0-100) }
  ```
  وتخزّن النتيجة في `clinical_intervention_trials`. عند `apply=true` تكتب أيضاً حدثاً في `clinical_session_events` وتحدّث مؤشرات الجلسة.
- **`clinical-seed-interventions`** (جديدة، قابلة للاستئناف على غرار `clinical-seed-content`): تولّد كتالوج التدخّلات بالـ AI لكل فئة سريرية على دفعات.

### 3) الواجهة (frontend فقط)
- ملف جديد `src/features/clinical/interventions.ts`: أنواع TypeScript + ثوابت الفئات والأيقونات.
- مكوّن جديد `src/features/clinical/InterventionTryPanel.tsx`: اللوحة الكاملة (شريط فئات + قائمة مقترحات + نموذج معاملات + بطاقة نتيجة + Recharts صغير للخط الزمني + زر «اعتمد»).
- تعديل `ClinicalLabSession.tsx`: إضافة Tabs (محادثة | تجربة تدخّل) في القسم الرئيسي، وعرض اللوحة الجديدة دون التأثير على منطق المحادثة الحالي.
- التحديثات الحيّة للمؤشرات تُعاد قراءتها بنفس `load()` الموجود.

### 4) الأمان والاعتماد
- التدخّلات الدوائية تُعرض دائماً مع شارة «محاكاة تعليمية — ليست وصفة طبية».
- موانع الاستعمال تُحسب من `contraindications_ar` ومن `sensory_profile`/`age_years` للحالة.

## الاحتساب (Credits)
- كل محاولة تستهلك ~3 Credits (استدعاء Gemini واحد). البذر يستهلك دفعة واحدة (~50 Credits).

## مخرجات قابلة للتحقّق بعد التنفيذ
- تبويب «جرّب تدخّلاً» يظهر داخل `/damij/clinical/lab/:sessionId`.
- إدخال «ميثيلفينيديت 10mg مرة يومياً» على حالة ADHD يُرجع تأثيراً + خط زمني + تحذيرات.
- زر «اعتمد» يضيف حدثاً في سجل المحادثة ويحدّث المؤشرات.
- جدول `clinical_intervention_trials` يمتلئ بسجلات المستخدم فقط.
