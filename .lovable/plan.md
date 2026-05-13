# خطة تحسين شاملة لمختبر المحاكاة السريرية

## ١. الصفحة الرئيسية (`ClinicalHome.tsx`)
- حذف كل أزرار التوسيع: "توليد الحالات والبروتوكولات"، "توسيع المحتوى الطبي"، "ابدأ تجربة جديدة"، وكل ما يستدعي `clinical-seed-*`.
- حذف بانر "المختبر فارغ".
- شريط واحد أنيق بإحصائيات + 5 بطاقات (الحالات، تجربة حرّة، لوحة جلساتي، مقارنة، تقاريري) بتصميم أنعم وأيقونات أكبر.

## ٢. مكتبة الحالات (`ClinicalCases.tsx`)
- حذف كل الفلاتر (المجموعة، الفئة، الشدّة، العمر) — حقل بحث واحد فقط بسيط.
- كل حالة تظهر **كبطاقة معروفة جاهزة** بتصميم أنيق:
  - أفاتار/أيقونة فريدة مولّدة من اسم الحالة + لون مميّز للفئة (gradient ring).
  - اسم المريض كبير + سطر العمر/الجنس + شريط الفئة الملوّن + شدّة.
  - hover effect أنيق مع الانتقال بسرعة للحالة.
- شبكة 3 أعمدة على الديسكتوب مع padding أوسع وظلال ناعمة.

## ٣. صفحة تفاصيل الحالة (`ClinicalCaseDetail.tsx`)
هوية بصرية خاصة لكل حالة + **كل الموارد جاهزة ومعروضة قبل بدء الجلسة**:
- Header مع gradient حسب الفئة + أيقونة كبيرة فريدة + اسم/عمر/شدة/تشخيص.
- 8 صناديق أنيقة بأيقونات مرتّبة (تُسحب من `clinical_interventions_catalog` بتصفية `condition_keys` + الفئة):
  1. 💊 الأدوية (الحالية + الموصى بها)
  2. 🧠 العلاج السلوكي
  3. 🎧 التدخّلات الحسّية
  4. 💬 التواصل البديل (AAC)
  5. 👁 الوسائل البصرية
  6. 👂 الوسائل السمعية
  7. 📋 الإجراءات التربوية
  8. 🩺 الأجهزة المتاحة (icons grid)
- زر بدء الجلسة كبير في الأعلى + قائمة بروتوكولات أنيقة في الأسفل.

## ٤. تحسين الواقعية والترابط (الحلقة الأهم)

### أ. حالة حيوية مشتركة (`vitals_state` في `clinical_sessions`)
حقل JSONB جديد يحتوي قراءات حيّة دائمة: `{ hr, bp_sys, bp_dia, spo2, rr, temp, glucose, pain, mood }`.
- تُهيَّأ من `vitals_initial` للحالة عند البدء.
- كل **محادثة، تدخّل، إعطاء دواء، استخدام جهاز** قد يحدّثها.
- كل قراءات الأجهزة تُسحب من `vitals_state` بدل قيم ثابتة.

### ب. تحديث `clinical-patient-turn`
- قراءة `vitals_state` + آخر القراءات + آخر التدخّلات وتمريرها لـ Gemini.
- إضافة `vitals_delta` للـ schema: تغييرات واقعية على HR/BP/SpO2/RR/temp/pain/mood حسب طبيعة الكلام:
  - كلام مخيف/عدائي → ↑ HR، ↑ BP، ↑ anxiety، ↓ mood.
  - كلام مطمئن/تعزيز → ↓ HR، ↓ anxiety، ↑ mood.
  - تجاهل ألم → ↑ pain.
- تطبيق `vitals_delta` على `vitals_state` وحفظه.
- إدراج حدث `vitals_change` يظهر في السجل ("ارتفع نبض المريض إلى 112 بسبب ...").

### ج. تحديث `clinical-intervention-trial`
- يقرأ `vitals_state` الحالي ويرجع `vitals_delta` متماسك (مثلاً: Salbutamol ↓ wheeze، ↑ HR قليلاً، ↑ SpO2).
- عند الاعتماد، يُحدّث `vitals_state`.
- موانع متبادلة: إن أعطى الطالب دواءين متضاربين، النتيجة سلبية ومسجّلة في الأمان.

### د. تحديث `DeviceLauncher` + simulators
- كل القراءات (ECG/BP/SpO2/Thermo/GCS/Stetho…) تستخدم `vitals_state` الحالي بدل المعاملات الثابتة.
- بعد كل turn/intervention، الأجهزة تتحدّث تلقائياً بدون refresh.

## ٥. لوحة الأجهزة (داخل الجلسة)
- حذف خانة "عرض الكل" — الأجهزة المعروضة هي فقط المتاحة للحالة (مرتبطة بـ `applicable_specialties`).
- شبكة أنيقة 3 أعمدة، كل جهاز ببطاقة:
  - أيقونة كبيرة دائرية ملوّنة حسب الفئة (vital signs أزرق، cardiac أحمر، respiratory سماوي، neuro بنفسجي…).
  - اسم الجهاز + سطر وصف.
  - شارة مفعّل/متاح.
- المحاكيات المباشرة (Always-On) في صف علوي مميّز فوق الشبكة.
- الجهاز المختار يفتح في panel أنيق جانبي بدل أن يدفع المحتوى للأسفل.

## ٦. التجربة الحرّة (`ClinicalFreeExperiment.tsx`)
- إضافة **مكتبة أمثلة جاهزة لكل نوع** (4-6 لكل نوع):
  - دواء: Salbutamol للربو، Methylphenidate لـ ADHD، Insulin، Paracetamol…
  - علاج سلوكي: تعزيز إيجابي مجدول، نمذجة، تشكيل، إطفاء سلوك…
  - تدخّل حسّي: سماعات عازلة، كرة ضغط، استراحة حسّية…
  - تواصل بديل: PECS، تطبيق Proloquo2Go، لوحة رموز…
  - وسيلة بصرية: جدول مرئي يومي، قصة اجتماعية، مؤقّت بصري…
  - وسيلة سمعية: Hearing aid، FM system…
  - إجراء تربوي: تكييف منهج، مهام مجزّأة، تعليمات مرئية…
- في الخطوة 2: يظهر صف "أمثلة جاهزة" قابل للنقر يملأ الحقول، **وقابل للتعديل بحرية بعدها**.
- تحسين تصميم الـ stepper بأيقونات وأسماء واضحة.
- زر "ابدأ من الصفر" بجانب الأمثلة.

## ٧. الملفات

### تعديلات
- `src/pages/damij/clinical/ClinicalHome.tsx` — حذف أزرار التوسيع، تصميم أنعم.
- `src/pages/damij/clinical/ClinicalCases.tsx` — حذف الفلاتر، بطاقات حالة أنيقة.
- `src/pages/damij/clinical/ClinicalCaseDetail.tsx` — هوية بصرية، 8 موارد جاهزة، عرض الأدوية والأجهزة.
- `src/pages/damij/clinical/ClinicalLabSession.tsx` — تنسيق أنيق، loop تحديث القراءات الحيّة.
- `src/pages/damij/clinical/ClinicalFreeExperiment.tsx` — أمثلة جاهزة قابلة للتعديل.
- `src/features/clinical/devices/DeviceLauncher.tsx` — حذف "عرض الكل"، شبكة أنيقة بأيقونات ملوّنة.
- `src/features/clinical/devices/simulators.tsx` — قراءة `vitals_state` بدل props ثابتة.
- `src/features/clinical/InterventionTryPanel.tsx` — تطبيق التدخّل يحدّث vitals_state.
- `src/features/clinical/types.ts` — إضافة `vitals_state` و`VitalsState`.
- `supabase/functions/clinical-patient-turn/index.ts` — إضافة vitals_state + vitals_delta + سياق التدخّلات الأخيرة.
- `supabase/functions/clinical-intervention-trial/index.ts` — إرجاع vitals_delta واقعي وتحديث الحالة.

### Migration واحدة
- إضافة عمود `vitals_state JSONB` على `clinical_sessions`.
- backfill بسيط من `clinical_cases.vitals_initial` للجلسات النشطة.

## ٨. ملاحظات تقنية
- لا تغيير على الـ schema للأدوات والـ catalog؛ فقط استخدام `condition_keys` لتصفية موارد كل حالة.
- استخدام مفاتيح Gemini المباشرة الموجودة (ممنوع Lovable AI).
- تحديث القراءات في الجلسة عبر invalidation/reload فورية بعد كل turn/trial/device.
- الحفاظ على HSL tokens من `index.css` (لا ألوان مباشرة).
