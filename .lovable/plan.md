## 1) دمج لوحة جلساتي + مقارنة بين تجارب + تقاريري تحت «حقيبتي»

في `ClinicalHome.tsx` ستبقى البطاقات الأساسية:
- مكتبة الحالات الافتراضية
- تجربة سريرية حرّة
- **حقيبتي** (جديدة — تجمع الثلاث)

«حقيبتي» = صفحة جديدة `/damij/clinical/portfolio` (`ClinicalPortfolio.tsx`) فيها 3 بطاقات أنيقة بصور AI خاصة بكل واحدة:
- **لوحة جلساتي** — صورة AI: لوحة بيانات طبية مع رسوم بيانية → `/damij/clinical/dashboard`
- **مقارنة بين تجارب** — صورة AI: ميزان/مخططان متقابلان → `/damij/clinical/compare`
- **تقاريري** — صورة AI: ملف طبي مع أوراق وختم → `/damij/clinical/reports`

تخطيط بطاقات كبيرة 3D-tilt مع overlay متدرّج، إحصائية سريعة لكل بطاقة (عدد الجلسات/المقارنات/التقارير)، شارة آخر نشاط، تنسيق shadcn متكامل بـ semantic tokens.

## 2) منظار العين الواقعي + أجهزة عيون إضافية

الحالي (`SimOphthalmo`) = `ScopePanel` مشترك يعرض دائرة ملوّنة فقط — غير واقعي.

سيُستبدل بـ`InteractiveOphthalmoscope.tsx` مخصّص يحاكي قاع العين فعلياً:
- canvas يرسم **fundus** واقعي: قرص بصري + شبكة أوعية متفرعة + بقعة صفراء + خلفية برتقالية مع texture
- نتائج مرضية متغيّرة حسب الحالة:
  - سكري → microaneurysms + hemorrhages + exudates
  - ضغط → cotton wool spots + AV nicking
  - زرق → cupping للقرص البصري
  - انفصال شبكية → tear + detached folds
- تكبير/تصغير + تحريك المنظار + ضبط الإضاءة
- زر "التقاط صورة fundus" + قراءة سريرية تفصيلية

**أجهزة عيون جديدة** تُضاف إلى `simulators.tsx` وتُسجَّل في `registry.ts` + تُضاف إلى جدول `clinical_devices` عبر migration:
- **Snellen Chart** (مخطط سنيلن) — قياس حدة البصر تفاعلي
- **Tonometer** (مقياس ضغط العين) — قياس IOP مع اكتشاف الزرق
- **Slit Lamp** (المصباح الشقي) — فحص القرنية والقزحية بطبقات
- **Color Vision Test** (Ishihara) — فحص عمى الألوان بأرقام مخفية
- **Pupillary Reflex Test** — فحص استجابة الحدقة للضوء

كلها بمنطق `ctx.category==='ophthalmology'` لتُظهر النتائج المرضية المناسبة.

## 3) Emojis ذكر/أنثى فقط للحالات

في `src/features/clinical/types.ts`:
- `caseAvatarFromName(name, gender?)` يصبح: إن كان `gender==='female'` → `'👩'`، وإلا → `'👨'`.
- إزالة `pool` الكامل (🧒🧑🧓...).
- جميع الاستدعاءات في `ClinicalCases.tsx` و`ClinicalFreeExperiment.tsx` و`ClinicalDashboard.tsx` ستمرّر `case.gender`.

## 4) فحص شامل لكل التدخلات (أجهزة + علاجات)

سأمشي على كل عنصر في `DEVICE_REGISTRY` (28 جهاز) و`InterventionTryPanel.tsx`:

| الفحص | الإجراء |
|-------|---------|
| كل جهاز يُنفّذ `onApply` ويعيد `reading_ar` | إصلاح أي جهاز لا يستدعي `onApply` |
| كل جهاز يستجيب لـ`ctx.category` بنتيجة مرضية مختلفة | إضافة فروع للحالات الناقصة |
| التدخّلات الدوائية تُسجَّل في `clinical_session_events` | التحقق من INSERT صحيح |
| التدخلات السلوكية/الحسية تُحدّث attention/anxiety/progress | التحقق |
| أزرار "اعتمد القراءة" موجودة وتعمل | إضافة حيث ناقصة |
| رسائل toast واضحة عند النجاح/الفشل | توحيد |

نتيجة الفحص: تقرير قصير في الـchat بعد التنفيذ يذكر ما كان معطّلاً وما أُصلح.

## 5) تحسين بيئة العمل في مختبر المحاكاة

في `ClinicalLabSession.tsx` و`DeviceLauncher.tsx`:
- استبدال الـstack العمودي بـ**workspace grid ثلاثي** على الديسكتوب:
  - عمود يسار (مع RTL = يمين): بطاقة المريض + الحيويات الحيّة (مثبّتة، sticky)
  - عمود وسط واسع: المحاكيات النشطة (drag-to-reorder، tabs لكل جهاز مفتوح)
  - عمود يمين: chips التدخلات + ملاحظات + توقيت الجلسة
- المحاكيات الحيّة (`AlwaysOnSimulators`) تصبح **شريط أفقي قابل للطي** بدل grid عمودي
- كل جهاز مفتوح يفتح في **panel منفصل قابل للسحب والإغلاق** بدل تكديس عمودي
- transitions ناعمة + skeleton أثناء التحميل
- breakpoints موبايل: tabs بين الأعمدة الثلاثة بدل grid

## تفاصيل تقنية

- **صور AI**: 3 صور لـ«حقيبتي» (1024×768 jpg، semantic، بدون نصوص عربية) في `src/assets/clinical/`.
- **Migration**: إدراج 5 صفوف جديدة في `clinical_devices` (Snellen, Tonometer, SlitLamp, Ishihara, PupilReflex) بـ`category='ophthalmo'` و`applicable_specialties=['ophthalmology']`.
- **Routing**: إضافة `/damij/clinical/portfolio` في `App.tsx`.
- **بدون تغيير DB schema** خارج إدراج الصفوف.
- **لا تعديل** على GJU/منصة اللغة العربية/Capacitor.
- **لا استخدام Lovable AI** (الحظر العام).

## الملفات المتأثرة

- `src/pages/damij/clinical/ClinicalHome.tsx` (تعديل: استبدال 3 بطاقات ببطاقة حقيبتي)
- `src/pages/damij/clinical/ClinicalPortfolio.tsx` (جديد)
- `src/pages/damij/clinical/ClinicalLabSession.tsx` (إعادة تخطيط)
- `src/features/clinical/types.ts` (تبسيط avatar)
- `src/features/clinical/devices/simulators.tsx` (5 أجهزة جديدة + تحسينات)
- `src/features/clinical/devices/InteractiveOphthalmoscope.tsx` (جديد)
- `src/features/clinical/devices/registry.ts` (تسجيل الجديد)
- `src/features/clinical/devices/DeviceLauncher.tsx` (تحسين العرض)
- `src/features/clinical/InterventionTryPanel.tsx` (فحص + إصلاحات)
- `src/App.tsx` (route جديد)
- `src/assets/clinical/portfolio-*.jpg` × 3 (صور AI)
- migration: إدراج 5 أجهزة عيون

