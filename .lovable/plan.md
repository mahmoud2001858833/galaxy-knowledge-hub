## خطة تحسين مختبر المحاكاة السريرية

### 1) إعادة تصميم الصفحة الرئيسية (`ClinicalHome`)
- شريط هيرو احترافي: عنوان كبير + شعار طبي متحرّك + إحصاءات حيّة (عدد الحالات، البروتوكولات، جلساتي، آخر تقرير).
- ترتيب الخيارات بمنطق طبيعي (يسار→يمين، أساسي→متقدّم):
  1. **مكتبة الحالات** (نقطة البداية)
  2. **تجربة سريرية حرّة**
  3. **لوحة جلساتي**
  4. **مقارنة بين تجارب**
  5. **تقاريري**
- بطاقات بهوية مختلفة (gradient لكل خيار + أيقونة دائرية متحرّكة + شارة "موصى به / متقدّم").
- شريط سريع أسفل الهيرو: "ابدأ آخر جلسة • أحدث تقرير • أعلى درجة".

### 2) مكتبة الحالات — تصفّح بالفئات أولاً (`ClinicalCases`)
- **شاشة فئات أولى**: شبكة مربعات كبيرة، كل فئة (`CATEGORIES`) بصورة AI واقعية + اسم الفئة + عدد الحالات داخلها + إيموجي + خلفية الـ`CATEGORY_THEME`.
- التنقّل: نقر فئة → تنفتح قائمة حالاتها كصف منفصل (Accordion داخل نفس الصفحة) أو شاشة فرعية `/damij/clinical/cases?cat=xxx`.
- داخل الفئة: نفس بطاقات الحالات الحالية، لكن مع **صورة شخصية AI للمريض** (إن وُجدت في الحقل الجديد `avatar_url`) بدل الإيموجي.
- بحث عام يبقى ظاهر فوق الفئات (بحث متعدّد الفئات).
- شاشة فارغة لطيفة عند الفئات بدون حالات.

### 3) تجربة سريرية حرّة (`ClinicalFreeExperiment`)
- خطوات مرئية واضحة (Stepper علوي ثابت: نوع التدخّل → تفاصيله → اختر المريض → ابدأ).
- بطاقات النوع تُعرض بشكل Grid بصري ضخم (أيقونة + وصف + عدد الأمثلة).
- لوحة الأمثلة الجاهزة: بطاقات قابلة للسحب/اللصق، عند الضغط تملأ الحقول تلقائياً.
- مدخلات منظّمة (Title, Details, Dose, Duration) مع Validation + placeholder ذكي حسب النوع.
- بحث وتصفية المرضى في الخطوة 3 بصور + شارات حالة.
- زر "ابدأ التجربة" يصبح Sticky في الأسفل بمعاينة سريعة لما اخترته.

### 4) جلسة المختبر (`ClinicalLabSession`)
- **قراءات الأجهزة**: إعادة تصميم `DeviceLauncher` إلى لوحة Vitals Monitor مباشرة في الأعلى (HR, BP, SpO₂, RR, Temp) ببطاقات نابضة + ألوان حسب الحد الطبيعي، مع زر "افتح الجهاز التفاعلي" لكل قراءة.
- شريط أدوات سريع لكل التدخّلات (Quick Apply) فوق المحادثة.
- لوحة `InterventionTryPanel` بتصميم Tab Bar أفقي للفئات + بحث + بطاقات أمثلة بصور صغيرة + بانل تفاصيل الجرعة.
- المؤشّرات (الانتباه/القلق/التقدّم) بتمثيل دائري Ring بدل الأشرطة.
- زر إنهاء التقرير ثابت أسفل في الموبايل.

### 5) لوحة الجلسات + المقارنة + التقارير — هوية موحّدة
- مكوّن مشترك جديد `ClinicalListLayout` (Header موحّد + Stats Row + Filters Row + List/Cards) يستخدمه:
  - `ClinicalDashboard`
  - `ClinicalReports`
  - `ClinicalCompare`
- نفس بطاقة الجلسة/التقرير في كل الشاشات (اسم الحالة + البروتوكول + تاريخ + درجة ملوّنة + شارة الفئة).
- فلاتر مشتركة: فئة، نطاق زمني، نطاق درجات، بحث نصّي.
- زر تصدير PDF + زر إرسال بالبريد متاحان من كل شاشة.

### 6) إرسال التقارير بالبريد الإلكتروني
- استخدام بنية **Lovable Cloud Transactional Emails**: تشغيل `setup_email_infra` + `scaffold_transactional_email` ثم إضافة قالب `clinical-report` (Arabic, RTL).
- زر "📧 إرسال التقرير بالبريد" داخل `ClinicalReport` + بطاقات `ClinicalReports/Dashboard`.
- مدخل بريد الطالب (مع تذكّر آخر بريد في `localStorage`) + اختياري بريد المعلّم/المشرف.
- محتوى الإيميل: ملخّص التقرير + الدرجة + روابط (التقرير الكامل + رابط المشاركة العام عبر `share_token`) + شارة "تقرير سريري".
- تسجيل كل إرسال في `email_send_log` (مدمج تلقائياً).
- **ملاحظة**: سأطلب إعداد دومين البريد عبر زر `Set up email domain` لو لم يكن مهيأ.

### الملفات المتأثرة

**تحديث:**
- `src/pages/damij/clinical/ClinicalHome.tsx`
- `src/pages/damij/clinical/ClinicalCases.tsx`
- `src/pages/damij/clinical/ClinicalFreeExperiment.tsx`
- `src/pages/damij/clinical/ClinicalLabSession.tsx`
- `src/pages/damij/clinical/ClinicalDashboard.tsx`
- `src/pages/damij/clinical/ClinicalReports.tsx`
- `src/pages/damij/clinical/ClinicalCompare.tsx`
- `src/pages/damij/clinical/ClinicalReport.tsx`
- `src/features/clinical/InterventionTryPanel.tsx`
- `src/features/clinical/devices/DeviceLauncher.tsx`

**إنشاء:**
- `src/features/clinical/ui/ClinicalListLayout.tsx` (هوية موحّدة)
- `src/features/clinical/ui/VitalsMonitor.tsx` (شريط القراءات الحيّة)
- `src/features/clinical/ui/CategoryGrid.tsx` (شبكة فئات الحالات)
- صور AI للفئات: `src/assets/clinical/categories/*.jpg` (سأولّدها بـ imagegen).
- قالب البريد: `supabase/functions/_shared/transactional-email-templates/clinical-report.tsx`.

### خارج النطاق
- تغيير منطق `clinical-patient-turn` أو `clinical-finalize-report` (الـ AI logic يبقى كما هو).
- إعادة كتابة شاشة `ClinicalCaseDetail` (تحسينات بصرية بسيطة فقط).
- إيميلات Marketing (ممنوع — التقارير transactional فقط).

### ملاحظات تقنية
- لو دومين البريد غير مهيأ، سيظهر زر إعداد للمستخدم قبل تفعيل الإرسال.
- صور الفئات ستكون بدون نصوص (التزاماً بقاعدة المنصة).
- كل التصاميم ترتكز على تصميم Tokens الحالي (`--damij-primary`, `--damij-accent-2`, …) — لا ألوان مباشرة.
