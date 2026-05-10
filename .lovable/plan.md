## المشكلة
- جدول `clinical_devices` فارغ حاليًا → لا تظهر أي أجهزة في تجارب القلب/العظام/الطوارئ.
- صفحة تفاصيل الحالة `ClinicalCaseDetail` لا تعرض الأدوية الحالية للمريض ولا قائمة الأجهزة المتاحة قبل بدء الجلسة.
- جدول `clinical_cases` لا يحتوي عمودًا للأدوية.

## الحل المقترح

### 1) إضافة عمود الأدوية إلى الحالات (DB Schema)
- إضافة `current_medications text[]` على `clinical_cases` بقيمة افتراضية `[]`.
- تعبئة افتراضية ذكية حسب فئة الحالة لكل الحالات الموجودة:
  - قلب: أسبرين، أتورفاستاتين، ميتوبرولول
  - عظام: إيبوبروفين، باراسيتامول، كالسيوم+فيتامين د
  - تنفس: سالبوتامول، بوديزونيد
  - غدد: ميتفورمين، إنسولين
  - كلى/أعصاب/جهاز هضمي/جلد/نفسي/عيون/أذن/نساء/أطفال (دواء افتراضي مناسب لكل فئة)

### 2) بذر مكتبة الأجهزة بـ 22 جهازًا (DB Data)
أجهزة مغطية لكل التخصصات:

**القلب والطوارئ (8)**: ECG 12-lead، AED، Holter، Echo، مقياس ضغط، Pulse Oximeter، تروبونين سريع، سمّاعة إلكترونية.

**التنفس (5)**: Spirometer، Nebulizer، Capnograph، Oxygen Concentrator، Peak Flow.

**العظام والأشعة (5)**: X-Ray، MRI، CT، Goniometer، Ultrasound MSK.

**الأعصاب وعام (4)**: EEG، مطرقة منعكسات، شوكة رنانة، مقياس غلاسكو GCS.

**تخصصات أخرى (5)**: Glucometer (سكر)، Otoscope (أذن)، Ophthalmoscope (عين)، Doppler وعائي، شريط فحص بول، ترمومتر بالأشعة.

كل جهاز سيشمل: `key, name_ar/en, category, ui_kind, applicable_specialties, default_params, description_ar, safety_ar, icon`.

### 3) تحديث صفحة الحالة `ClinicalCaseDetail.tsx` (Frontend)
- جلب الأدوية مع الحالة وعرضها في قسم جديد "الأدوية الحالية" بأيقونة 💊.
- جلب `clinical_devices` المرتبطة بفئة الحالة وعرضها في قسم "الأجهزة المتاحة" قبل أزرار البروتوكولات (شبكة بطاقات بأيقونة + اسم + وصف مختصر).
- عند عدم وجود أجهزة مرتبطة بالفئة → عرض كل الأجهزة كاحتياط.

## التفاصيل التقنية

```text
clinical_cases  ──+ current_medications (text[])
clinical_devices ─ seed 22 rows (ON CONFLICT key DO UPDATE)
ClinicalCaseDetail.tsx
   ├─ fetch case + medications
   ├─ fetch protocols (existing)
   ├─ fetch devices filtered by category   ← جديد
   ├─ section: 💊 الأدوية الحالية         ← جديد
   ├─ section: 🩺 الأجهزة المتاحة لهذه الحالة ← جديد
   └─ section: البروتوكولات (existing)
```

- الأجهزة التفاعلية الحالية (`InteractiveECG/AED/Stethoscope`) ستستفيد تلقائيًا من القيم الجديدة عبر `DeviceLauncher` داخل الجلسة.
- لا تغييرات على Edge Functions ولا على `DeviceLauncher` لأن منطقه يقرأ من نفس الجدول.

## الأثر
- ستظهر 22 جهازًا داخل كل جلسة سريرية (تتفاعل مع نوع الحالة).
- ستظهر الأدوية والأجهزة داخل صفحة الحالة قبل بدء الجلسة.
- لا توجد ثغرات أمنية أو تغييرات على RLS.