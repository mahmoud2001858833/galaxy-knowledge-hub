# خطة: إكمال اختبارات التقييم العصبي-النفسي

بناء الاختبارات الثلاثة المتبقية في `ADHDAssessmentHub` بمعايير معتمدة، مع حفظ النتائج في `adhd_neuro_tests` وعرضها في `ADHDDashboard`.

## 1) N-Back (الذاكرة العاملة)
**المرجع:** Kirchner 1958 / Jaeggi et al. 2008.
**التصميم:**
- وضعان: 1-Back و 2-Back (يختار المستخدم)
- 30 محفّزاً (حروف عربية: ا ب ت ث ج ح خ د) كل 2.5 ثانية، عرض 500ms
- المستخدم يضغط "تطابق" حين يطابق المحفّز الذي قبل n خطوات
- 33% targets

**المقاييس المحفوظة:**
- `hits`, `misses`, `falseAlarms`, `correctRejections`
- `accuracy %`, `dPrime` (إشارة-ضوضاء)، `meanRT`, `rtSD`

**الملف:** `src/pages/damij/adhd/ADHDNBackTask.tsx`

## 2) Stroop (الكفّ المعرفي)
**المرجع:** Stroop 1935 / Golden Stroop Test.
**التصميم:** ثلاث مراحل × 20 محفّزاً
- **Word:** اسم لون أسود (قراءة)
- **Color:** XXXX ملوّن (تسمية اللون)
- **Interference:** كلمة لون بلون مختلف (تسمية اللون لا قراءة الكلمة)
- 4 ألوان: أحمر/أخضر/أزرق/أصفر — اختيار من أزرار

**المقاييس:**
- زمن استجابة + دقة لكل مرحلة
- **Stroop Effect** = `meanRT(Interference) − meanRT(Color)` بالـ ms
- نسبة الأخطاء في مرحلة التداخل

**الملف:** `src/pages/damij/adhd/ADHDStroopTask.tsx`

## 3) Go / No-Go (التحكم بالاندفاع)
**المرجع:** Donders / Newman 1985.
**التصميم:**
- 60 محاولة، 75% Go (دائرة خضراء — اضغط) / 25% No-Go (مربع أحمر — لا تضغط)
- 1500ms عرض + 500ms ISI
- المهلة 1000ms للاستجابة

**المقاييس:**
- `goAccuracy`, `noGoAccuracy` (= ضبط الاندفاع)
- `commissionErrors` (الضغط على No-Go) — المؤشر الأهم في ADHD
- `omissionErrors`, `meanRT_Go`, `rtVariability`
- `dPrime` للحساسية

**الملف:** `src/pages/damij/adhd/ADHDGoNoGoTask.tsx`

## 4) البنية المشتركة
- مكوّن `NeuroTestShell` بسيط: شاشة تعليمات → عدّ تنازلي 3..1 → تشغيل → نتيجة
- مكوّن `NeuroResultCard`: عرض المقاييس + مقارنة بالمعدلات الطبيعية (من الأدبيات) + زر "حفظ النتيجة" + زر "إعادة"
- حفظ في `adhd_neuro_tests` مع `test_type` ∈ `{cpt, nback, stroop, gonogo}` و `metrics` JSONB

## 5) التحديثات المطلوبة
- `ADHDAssessmentHub.tsx`: تفعيل البطاقات الثلاث (`ready: true`) + روابط
- `App.tsx`: إضافة 3 مسارات
  - `/damij/adhd/assessment/nback`
  - `/damij/adhd/assessment/stroop`
  - `/damij/adhd/assessment/gonogo`
- `ADHDDashboard.tsx`: 3 رسوم بيانية إضافية (N-Back accuracy، Stroop effect، Go/No-Go commission)
- `ADHDResources.tsx`: إضافة مراجع Kirchner، Stroop، Newman

## 6) تفاصيل تقنية
- Framer Motion للانتقالات
- Tailwind + رموز التصميم `--damij-primary`, `--damij-warm`
- لا تغييرات على RLS — الجدول `adhd_neuro_tests` موجود بالفعل
- لا حاجة لـ Edge Functions — كل المنطق في الواجهة

## 7) خارج النطاق
- وحدات التدريب (Dual N-Back، Stop-Signal، إدراك الوقت) — لاحقاً
- Daily Report Card — لاحقاً
- معايرة معيارية لعمر/جنس — يُعرض دليل عام فقط
