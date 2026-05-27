## الهدف
ملء جميع الأقسام الطبية الفارغة في مكتبة الحالات بمحتوى كامل ومتقن (حالات + بروتوكولات + أجهزة + أدوية مرتبطة).

## الأقسام الفارغة المستهدفة
حسب فحص قاعدة البيانات:
- **بدون حالات ولا بروتوكولات**: emergency, pulmonology, nephrology, endocrinology, gastro, pediatrics, obgyn, dermatology, ophthalmology, ent, psychiatry
- **ناقصة**: neurology (6 حالات، 0 بروتوكولات)

## الخطوات

### 1. توسيع دالة البذر `clinical-seed-medical`
- رفع `TARGET_CASES` من 12 إلى **15** و `TARGET_PROTOCOLS` من 6 إلى **8** لكل تخصص.
- توسيع prompt لكل حالة لتطلب أيضاً:
  - `required_devices_ar[]`: قائمة الأجهزة اللازمة
  - `medications[]`: الأدوية مع الجرعة والمدة
  - `vitals_initial`: علامات حيوية واقعية حسب الحالة والشدة
  - `lab_results`: تحاليل مخبرية مناسبة
  - `imaging_findings`: نتائج تصوير إن وُجدت
- توسيع prompt لكل بروتوكول ليطلب 6-10 خطوات + معدات مطلوبة.

### 2. بذر الأجهزة الناقصة `clinical-seed-devices` (جديد)
edge function يولّد 4-6 أجهزة لكل تخصص فارغ/ناقص:
- emergency: AED, Defibrillator, Bag-valve mask, Pulse oximeter, Crash cart
- pulmonology: Spirometer, Nebulizer, Peak flow meter, Ventilator
- nephrology: Dialysis machine, BP cuff, Urine analyzer
- endocrinology: Glucometer, Insulin pen, HbA1c analyzer
- gastro: Endoscope, Gastric tube
- pediatrics: Pediatric scale, Otoscope, Tympanometer
- obgyn: Fetal doppler, Ultrasound, CTG monitor
- dermatology: Dermatoscope, Wood's lamp
- ophthalmology: Slit lamp, Tonometer, Fundoscope
- ent: Otoscope, Audiometer, Laryngoscope
- psychiatry: PHQ-9, GAD-7, MMSE (أدوات تقييم)

### 3. بذر الأدوية المرتبطة `clinical-seed-medications` (جديد)
يولّد عناصر دواء في `clinical_interventions_catalog` (category=medication) مرتبطة بأكواد الحالات الجديدة عبر `condition_keys` ممتدة لتشمل التخصصات.

### 4. ربط آلي عند البذر
عند بذر حالة جديدة:
- إنشاء سجلات في `clinical_devices` المرتبطة عبر `case_codes[]`
- إنشاء سجلات أدوية مع `case_codes[]`

### 5. تشغيل البذر
- استدعاء `clinical-seed-medical` 3-4 مرات (resumable) حتى تكتمل كل التخصصات.
- استدعاء `clinical-seed-devices` و `clinical-seed-medications` مرة لكل تخصص.

### 6. واجهة المستخدم
- `ClinicalCases.tsx`: إخفاء الفئات الفارغة تلقائياً قبل اكتمال البذر، وإظهار حالة التحميل.
- `ClinicalCaseDetail.tsx`: عرض الأجهزة المطلوبة والأدوية المقترحة في تبويبات منفصلة.

## ملفات ستُعدَّل/تُنشَأ
- `supabase/functions/clinical-seed-medical/index.ts` (تحديث)
- `supabase/functions/clinical-seed-devices/index.ts` (جديد)
- `supabase/functions/clinical-seed-medications/index.ts` (جديد)
- `src/pages/damij/clinical/ClinicalCases.tsx` (تحديث طفيف)
- `src/pages/damij/clinical/ClinicalCaseDetail.tsx` (إضافة عرض الأجهزة/الأدوية)

## ملاحظة
البذر يستخدم Gemini ويحتاج عدة استدعاءات متتالية. سأشغّل الدوال تلقائياً بعد النشر وأتحقق من الأعداد النهائية في كل تخصص قبل التسليم.
