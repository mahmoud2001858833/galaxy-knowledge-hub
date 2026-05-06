# خطة: توسعة المختبر السريري إلى منظومة طبية شاملة مع أجهزة تفاعلية

## الأهداف
- إضافة **15+ تخصصاً طبياً** بجانب فئات التربية الخاصة، في **نفس الكتالوج** الموحّد.
- إضافة **أجهزة تفاعلية حقيقية** (ECG/AED/Stethoscope) ولوحات مبسّطة لباقي الأجهزة، كلها داخل تبويب جديد «🩺 الأجهزة والإجراءات» في صفحة الجلسة.
- AI يحلّل قراءات الأجهزة ويعيد تفسيراً سريرياً + يحدّث مؤشرات المريض.

## التخصصات الجديدة (تُضاف لجدول الفئات)
cardiology • orthopedics • internal • neurology • pulmonology • nephrology • endocrinology • gastro • emergency • pediatrics • obgyn • dermatology • ophthalmology • ent • psychiatry
(تنضمّ إلى: asd / adhd / hearing / visual / learning_other)

## التغييرات

### 1) قاعدة البيانات (migration)
- توسعة `clinical_cases.category` و `clinical_protocols.category` (نص حر — لا حاجة لـ enum).
- جدول جديد `clinical_devices`:
  - `key` (ecg, aed, stethoscope, pulse_ox, glucometer, bp, xray, otoscope, ophthalmoscope, defib, cpr, splint, iv, nebulizer, oxygen, suction, neuro_exam, rom, pain_map…)
  - `name_ar`, `name_en`, `category` (diagnostic | therapeutic | exam)
  - `applicable_specialties` (text[])
  - `ui_kind` (interactive_ecg | interactive_aed | interactive_stetho | card)
  - `default_params` (jsonb)، `description_ar`، `safety_ar[]`
- جدول `clinical_device_uses`: سجل كل استخدام جهاز ضمن جلسة (session_id, user_id, device_key, params, ai_reading jsonb, applied bool).
- RLS: المستخدم يكتب/يقرأ سجلاته فقط؛ `clinical_devices` مقروء للجميع المصادَقين.

### 2) Edge Functions
- **`clinical-device-use`** (جديدة): تستلم `{ sessionId, deviceKey, params, apply }`، تحمّل الحالة، ترسل لـ Gemini schema يُرجع:
  ```
  { reading_ar, vitals{hr,bp_sys,bp_dia,spo2,resp,temp,glucose}, 
    waveform_hint?, interpretation_ar, abnormal_findings_ar[], 
    recommended_next_steps_ar[], success_score, metric_deltas{attention,anxiety,progress} }
  ```
  وتخزّن في `clinical_device_uses`، وعند `apply=true` تكتب حدثاً في timeline المحادثة وتحدّث المؤشرات.
- **`clinical-seed-medical`** (جديدة، قابلة للاستئناف): تولّد ~20 حالة و~10 بروتوكولات لكل تخصص جديد عبر دفعات.
- **`clinical-seed-devices`** (جديدة): تزرع كتالوج الأجهزة (~25 جهازاً) دفعة واحدة.

### 3) واجهة الأجهزة التفاعلية
ملف جديد `src/features/clinical/devices/`:
- `DeviceLauncher.tsx` — قائمة أجهزة مفلترة حسب تخصص الحالة + بحث.
- `InteractiveECG.tsx` — Canvas يرسم موجات P-QRS-T حية بناءً على HR/rhythm من نتيجة AI (sinus, AF, VT, asystole…). يدعم تشغيل/إيقاف ورسم 12-lead مبسّط.
- `InteractiveAED.tsx` — لوحة AED بزرّ Analyze + Shock + عدّاد CPR، مع رسالة صوتية «Stand clear».
- `InteractiveStethoscope.tsx` — يشغّل ملفات صوت قلب/رئة (normal, murmur, wheeze, crackle) من Web Audio.
- `DeviceCard.tsx` — بطاقة عامة لباقي الأجهزة: عرض المعاملات، زر «استخدم»، عرض القراءة + التفسير + الحيويات + توصيات.

### 4) دمج بصفحة الجلسة
في `ClinicalLabSession.tsx` يُضاف تبويب ثالث «🩺 الأجهزة» بجانب «المحادثة» و«جرّب تدخّلاً»، يستخدم نفس `Tabs`. زر «اعتمد كحدث» يضيف القراءة لسجل الجلسة.

### 5) دمج الكتالوج الموحّد
في `InterventionTryPanel.tsx`:
- حذف فلترة `condition_keys` الصارمة → السماح بفلترة حسب الفئة + بحث.
- إضافة شريط تبديل «🧩 تربية خاصة | 🩺 طبي» يضبط مجموعة الفئات الظاهرة.

### 6) البذر
بعد deploy:
- `clinical-seed-devices` مرة واحدة (~25 جهازاً).
- `clinical-seed-medical` يُستدعى تكرارياً حتى تكتمل الحالات/البروتوكولات لكل تخصص (مثل seed-content السابق).
- `clinical-seed-interventions` (موجودة) تُستدعى مع condition_keys الموسّعة لتغذية أدوية التخصصات الجديدة.

## مخرجات قابلة للتحقق
- صفحة الجلسة تعرض 3 تبويبات: محادثة، جرّب تدخّلاً، الأجهزة.
- اختيار حالة قلب → ECG حيّ يرسم موجات حقيقية + AI يفسّر «Sinus tachycardia 130 bpm».
- AED يعرض رسالة Shock advised ويحدّث المؤشرات بعد الصدمة.
- Stethoscope يشغّل صوت murmur حقيقي.
- باقي الأجهزة (Glucometer, BP, X-ray viewer, Otoscope…) كبطاقات + قراءة AI فورية.
- جدول `clinical_devices` يحوي 25+ جهازاً، و `clinical_cases` يحوي حالات لكل تخصص جديد.

## الاستهلاك
- استخدام جهاز = ~3 Credits. توليد 12-lead ECG = 1 استدعاء Gemini. البذر الكامل (15 تخصصاً × 30 عنصراً) = ~120 Credits على دفعات.
