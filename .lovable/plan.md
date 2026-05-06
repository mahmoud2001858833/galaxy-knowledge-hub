## الهدف

1. إضافة خيار **"تجربة حرة"** (Free Experiment) في صفحة المختبر السريري — يبدأ من فكرة المستخدم (جهاز/تدخل) ويوجّهه عبر شاشات حتى تشغيل المحاكاة الفعلية ورؤية النتائج.
2. إصلاح **مكتبة الحالات الافتراضية** بحيث تظهر فيها فعلياً حالات القلب، العظام، والتخصصات الطبية الأخرى المولّدة من `clinical-seed-medical` (حالياً مفقودة لأن الفلاتر تعرض 5 فئات فقط من ذوي الاحتياجات).

---

## 1) مكتبة الحالات — إصلاح ظهور التخصصات الطبية

**المشكلة:** `src/features/clinical/types.ts` يُعرّف 5 فئات فقط (`asd, adhd, hearing, visual, learning_other`)، لكن قاعدة البيانات تحتوي 15 تخصصاً إضافياً (cardiology, orthopedics, neurology…). صفحة `ClinicalCases.tsx` تستخدم هذه القائمة في القائمة المنسدلة وفي عرض البطاقة (الإيموجي/الاسم)، فالحالات الطبية موجودة لكن بدون تسمية وقد لا تظهر إن كان فلتر الفئة لا يعرضها.

**الإصلاح:**
- في `types.ts` نضيف 15 تخصصاً جديداً مع إيموجي:
  - cardiology ❤️ "أمراض القلب"
  - orthopedics 🦴 "العظام والمفاصل"
  - neurology 🧠 "الأعصاب"
  - pulmonology 🫁 "الجهاز التنفسي"
  - nephrology 💧 "الكلى"
  - endocrinology ⚖️ "الغدد والسكري"
  - gastro 🩺 "الجهاز الهضمي"
  - emergency 🚑 "الطوارئ"
  - pediatrics 👶 "الأطفال"
  - obgyn 🤰 "النساء والولادة"
  - dermatology 🧴 "الجلدية"
  - ophthalmology 👁️ "العيون"
  - ent 👂 "الأنف والأذن والحنجرة"
  - psychiatry 💭 "الطب النفسي"
  - internal 🩻 "الباطنية"
- نقسم القائمة في `ClinicalCases.tsx` إلى مجموعتين في الـ select: "ذوو الاحتياجات الخاصة" و"التخصصات الطبية" (`<optgroup>`).
- نضيف فلتر سريع بأزرار للأقسام الكبرى (الكل / تربية خاصة / طبي).

**ملف:** `ClinicalHome.tsx` — نضيف زراً "توسيع المحتوى الطبي" يستدعي `clinical-seed-medical` (موجود) عندما تكون الفئات الطبية فارغة.

---

## 2) تجربة حرة (Free Experiment)

تدفّق جديد بثلاث شاشات:

```text
المختبر السريري
   │
   ├─ "تجربة جاهزة" → اختر حالة → اختر بروتوكول → جلسة (التدفّق الحالي)
   │
   └─ "تجربة حرّة" (جديد) ────────────────────────────────────
        ① اختر نوع التدخّل/الجهاز (Stethoscope, ECG, AED, دواء,
            تمرين، تقنية تواصل، حسّي، سلوكي …)
        ② صندوق محادثة يصف فيه التفاصيل (الجرعة/التقنية/المعاملات)
            + أزرار سريعة لإضافة قراءات الأجهزة
        ③ اختر المريض من المكتبة (أي حالة من 200+)
        ④ تشغيل: يفتح جلسة حقيقية + يطبّق التدخّل تلقائياً
            ويعرض النتائج (vitals, ردّ المريض، تفسير AI)
            ويتيح المتابعة في الجلسة (chat + أجهزة) كالمعتاد
```

### الواجهات الجديدة (فرونت إند فقط)

- `src/pages/damij/clinical/ClinicalFreeExperiment.tsx` — Wizard من 3-4 خطوات بـ `framer-motion`:
  1. اختيار نوع التجربة (شبكة بطاقات: جهاز / دواء / تدخل سلوكي / تدخل حسّي / تمرين بدني / تواصل).
  2. صندوق محادثة (Textarea + chips للقراءات): اسم/جرعة/مدة/ملاحظات. AI تحقق سريع.
  3. اختيار المريض: نفس واجهة بطاقات `ClinicalCases` مصغّرة، مع بحث وفلاتر (قسم طبي، عمر، شدّة).
  4. شاشة التشغيل: تنشئ جلسة جديدة عبر صفّ `clinical_sessions` (ببروتوكول وهمي/حر) ثم تستدعي إجراء التدخّل وتفتح صفحة `ClinicalLabSession` بنفس المسار الحالي مع علم `freeMode=true`.

- `ClinicalLab.tsx`: نحوّله إلى صفحة اختيار بين زرّين كبيرين: **تجربة جاهزة** و **تجربة حرّة** بدلاً من الإعادة المباشرة لمكتبة الحالات.

- `ClinicalHome.tsx`: نضيف بطاقة خامسة "تجربة حرّة" بجانب البطاقات الأربع الموجودة.

### الباك إند

- نعيد استخدام:
  - `clinical-device-use` للأجهزة (يعمل أصلاً مع أي جلسة).
  - `clinical-intervention-trial` للتدخلات الدوائية/السلوكية (موجودة من البذور `clinical-seed-interventions`).
  - `clinical-patient-turn` للمحادثة بعد تطبيق التجربة.
  - `clinical-finalize-report` لإنشاء تقرير في النهاية (نفس التدفّق).

- **هجرة بسيطة (migration واحدة):**
  - إضافة عمود `mode TEXT DEFAULT 'guided'` على `clinical_sessions` لتمييز `free` من `guided`.
  - السماح بأن يكون `protocol_id` قابلاً للقيمة NULL (في حال التجربة الحرّة بلا بروتوكول رسمي).
  - لا تغييرات على RLS — تبقى نفس السياسات.

- **Edge function جديدة (اختيارية صغيرة):** `clinical-free-start` تستقبل `{ caseId, intent, details, deviceKey?, interventionKey? }` تنشئ جلسة `mode='free'`، تسجّل حدثاً افتتاحياً، وتعيد `sessionId` ثم تستدعي داخلياً `clinical-device-use` أو `clinical-intervention-trial` لتطبيق التدخل الأوّل.

### في صفحة الجلسة `ClinicalLabSession`

- إذا `session.mode === 'free'`: نخفي شريط خطوات البروتوكول، ونعرض بدلاً منه شريط "نوع التجربة" والمعاملات الأولى، مع إبقاء كل شيء آخر (المحادثة، DeviceLauncher، InterventionTryPanel، إنهاء التقرير).

---

## الملفات المُعدّلة/الجديدة

**مُعدّلة:**
- `src/features/clinical/types.ts` — توسيع CATEGORIES.
- `src/pages/damij/clinical/ClinicalCases.tsx` — `<optgroup>` + فلاتر مجموعات.
- `src/pages/damij/clinical/ClinicalHome.tsx` — بطاقة "تجربة حرّة" + زر بذر طبي.
- `src/pages/damij/clinical/ClinicalLab.tsx` — اختيار بين جاهزة/حرّة.
- `src/pages/damij/clinical/ClinicalLabSession.tsx` — دعم وضع `free`.
- `src/App.tsx` — مسار `/damij/clinical/free`.

**جديدة:**
- `src/pages/damij/clinical/ClinicalFreeExperiment.tsx` — Wizard 4 خطوات.
- `supabase/functions/clinical-free-start/index.ts` — تهيئة جلسة حرّة.
- `supabase/migrations/<ts>_clinical_free_mode.sql` — `mode` + nullable protocol.

---

## ملاحظات تنفيذية

- لا يوجد تعديل على نظام التوحد/فرط الحركة.
- لا تعديل على الويب الأساسي خارج قسم Damij السريري.
- نلتزم بلون التصميم (`hsl(var(--damij-*))`) وعدم استعمال ألوان مباشرة.
- النصوص بالعربية ودعم RTL مفعّل.
