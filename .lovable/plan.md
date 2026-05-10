## المشكلة الحالية

من الفحص الفعلي للكود وقاعدة البيانات:
- **28 جهازًا** في الجدول، لكن **3 فقط** لها واجهة تفاعلية حقيقية (ECG, AED, السماعة).
- باقي الـ 25 جهازًا (الأشعة، MRI، CT، السكر، الأكسجين، الضغط، الحرارة، التنفس، EEG، المنظار، شريط البول، السبيرومتر…) كلها `ui_kind = 'generic'` — أي مجرد نموذج إدخال وزر "استخدم الجهاز" يستدعي AI ويعرض نص. لا يتغيّر شيء بصريًا حسب الحالة.
- حالة "قطع اليد / نزيف" (orthopedics/emergency) تُظهر افتراضيًا فقط ECG + سماعة قلب — لا أدوات إيقاف نزيف، لا ضغط دم متحرّك، لا SpO₂ نابض، لا أشعة لليد.
- المحاكيات الدائمة (`AlwaysOnSimulators`) تعرض قيم ثابتة (HR=75) ولا تقرأ من علامات الحالة الحقيقية.
- زر "اعتمد كحدث" يعمل فقط بعد طلب AI، فإذا فشل AI لا يحدث شيء.

## الهدف

تجربة كاملة 100٪، كل جهاز يعمل بصريًا وصوتيًا وتفاعليًا، ويُظهر قراءات منطقية مرتبطة بنوع الحالة وعلاماتها — حتى بدون AI.

## خطة التنفيذ

### 1) إنشاء 12 محاكيًا تفاعليًا جديدًا

`src/features/clinical/devices/` — مكوّن مستقل لكل جهاز، Canvas/Web Audio/SVG، يستقبل `caseContext` ويولّد قراءات منطقية محليًا:

| الجهاز | المحاكاة |
|---|---|
| `InteractiveBPMonitor` | كفّ ينفخ، عقرب يرتفع، صوت Korotkoff، يعرض 120/80 أو قيم حسب شدة الحالة |
| `InteractivePulseOx` | إصبع + موجة PPG نابضة + SpO₂% + HR متغيّر |
| `InteractiveGlucometer` | قطرة دم + شريط + عد تنازلي 5 ثوان + قراءة mg/dL |
| `InteractiveThermometer` | IR gun + شعاع ليزر + قراءة °C + لون حسب الحمى |
| `InteractiveSpirometer` | منحنى FEV1/FVC حي + رسم Flow-Volume loop |
| `InteractivePeakFlow` | مؤشر يقفز عند النفخ |
| `InteractiveNebulizer` | بخار متحرّك + مؤقت 10 دقائق |
| `InteractiveO2` | منظم تدفق L/min + قناع/كانيولا |
| `InteractiveXRay` / `InteractiveCT` / `InteractiveMRI` | عرض صور تشريحية SVG حسب نوع الحالة (يد مكسورة، رئة بيضاء…) مع تكبير وتعليق |
| `InteractiveOtoscope` / `InteractiveOphthalmoscope` | عدسة دائرية تكشف صورة شبكية/طبلة الأذن |
| `InteractiveEEG` | 8 قنوات موجات Canvas (alpha/beta/theta) |
| `InteractiveReflexHammer` | ساق تتحرك عند النقر + درجة 0-4 |
| `InteractiveGCS` | 3 قوائم منسدلة (Eye/Verbal/Motor) + مجموع تلقائي |
| `InteractiveUrineStrip` | شريط بـ 10 مربعات تتلوّن (pH, Glucose, Protein…) |
| `InteractiveTroponin` | شريط RDT بخطين + مؤقت 15 دقيقة |
| `InteractiveDoppler` | موجة صوتية + صوت تدفق نبضي |
| `InteractiveHolter` | شريط ECG طويل 24 ساعة قابل للتمرير |
| `InteractiveEcho` | فيديو SVG لقلب نابض ذو 4 حجرات |
| `InteractiveCapnograph` | منحنى CO₂ تنفسي مربع |
| `InteractiveTuningFork` | رنين 256/512 Hz + Web Audio |
| `InteractiveGoniometer` | مفصل قابل للسحب + قراءة درجة |

كل محاكي:
- يعرض شاشة/قراءة فورًا (لا ينتظر AI).
- يقرأ من `caseContext` (category, severity, presenting_signs) لاختيار قراءات منطقية.
- يعطي زر "اعتمد كحدث" يعمل دومًا (يكتب الحدث محليًا → DB).

### 2) أداة "إيقاف النزيف" للحالات الإصابية

محاكي خطوات: ضغط مباشر → رفع الطرف → عاصبة (إن لزم) → غيار معقّم → تقطيب. شريط تقدّم + تحذيرات (لا تستخدم العاصبة أكثر من ساعتين…).

### 3) إعادة كتابة `DeviceLauncher`

- استبدال `switch (ui_kind)` بسجل (registry) يربط 28 مفتاحًا إلى مكوّن.
- الأجهزة بدون مكوّن خاص تستخدم `GenericInteractiveDevice` (يحاكي شاشة جهاز مع LED + صوت + قراءة افتراضية).
- تمرير `caseContext` لكل جهاز.
- زر "اعتمد كحدث" يعمل من أي مكوّن عبر callback موحّد، ولا يتطلّب AI.

### 4) إعادة كتابة `AlwaysOnSimulators` ذكية حسب التخصص

| الفئة | المحاكيات الدائمة |
|---|---|
| cardiology | ECG + BP + SpO₂ + سمّاعة قلب |
| emergency/trauma/orthopedics | BP + SpO₂ + مقياس ألم + مجموعة إيقاف النزيف |
| pulmonology | SpO₂ + Capnograph + سمّاعة رئة |
| neurology | GCS + EEG مصغّر + ردود الأفعال |
| pediatrics | حرارة + SpO₂ + وزن |
| autism/adhd | Biofeedback (HR/breath) + مقياس توتر |

تستخدم قيم من `clinical_cases.severity` و`presenting_signs_ar` لضبط القراءات.

### 5) ترقية قاعدة البيانات

Migration واحد:
- `UPDATE clinical_devices SET ui_kind = ...` لربط كل جهاز بنوع المحاكي الصحيح.
- إضافة عمود `vitals_initial jsonb` في `clinical_cases` (افتراضيات حسب الحالة) ليتم استخدامه من المحاكيات.
- Backfill لكل الحالات الموجودة بقيم منطقية حسب `category` و`severity`.

### 6) تحسين Edge Function `clinical-device-use`

- إضافة fallback محلي: إذا فشل AI (429/timeout)، يُرجع قراءة افتراضية مبنية على `device.default_params` + علامات الحالة، حتى لا تتعطّل التجربة أبدًا.

### 7) فحص شامل

- اختبار يدوي على 4 حالات (قلبية، نزيف، تنفسية، عصبية): كل جهاز ينتج قراءة بصرية مختلفة.
- التحقق أن "اعتمد كحدث" يكتب في `clinical_session_events` لكل جهاز.
- التحقق أن المحاكيات الدائمة تظهر مناسبة للتخصص.

## التفاصيل التقنية

- لا تغييرات على معمارية AI / RLS / الأمان.
- جميع المحاكيات Canvas/SVG/Web Audio خالصة — لا أصول خارجية.
- نظام التصميم: استخدام `hsl(var(--damij-*))` فقط.
- بنية الملفات: `src/features/clinical/devices/<DeviceName>.tsx` + `registry.ts`.

## الملفات المتأثرة

- جديد: 22 ملف `Interactive*.tsx` + `registry.ts` + `WoundControlKit.tsx` + `GenericInteractiveDevice.tsx`.
- تعديل: `DeviceLauncher.tsx` (إعادة كتابة), `ClinicalCaseDetail.tsx` (تمرير caseContext), `clinical-device-use/index.ts` (fallback).
- Migration: `clinical_devices` (ui_kind), `clinical_cases` (vitals_initial + backfill).

## غير مشمول

- لا تغيير على نموذج البيانات الأساسي للجلسات.
- لا أصوات/صور خارجية (كل شيء مولّد برمجيًا).
- لا تغيير على الأقسام الأخرى من المنصة.