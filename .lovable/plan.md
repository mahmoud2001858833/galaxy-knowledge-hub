## الهدف
إنشاء منصة فرعية معزولة بالكامل داخل ذروة العلم باسم مقترح: **"دامج" (Damij) — منصة التعليم الدامج والتشخيص الذكي**، تكون صفحاتها وتنقلها وهويتها البصرية مستقلة تماماً عن منصة ذروة العلم الرئيسية (لا روابط رجوع إلى الرئيسية، لا Navbar/Footer العام، نمط GJU 3030 المعزول).

ملاحظة مهمة: سيتم إنشاء **البنية الكاملة (الواجهات والصفحات والتنقل والـ routes)** فقط، بدون أي منطق ذكاء اصطناعي حقيقي أو edge functions أو جداول قاعدة بيانات — كل الأقسام تكون جاهزة للبناء لاحقاً (Placeholders + UI كامل).

## البنية المقترحة

### 1) Routes جديدة (تُسجّل في `src/App.tsx` خارج layout الرئيسي تماماً، على نمط GJU)
- `/damij` — البوابة الرئيسية (Landing)
- `/damij/braille` — نظام دمج لغة بريل
  - `/damij/braille/text-to-braille`
  - `/damij/braille/braille-to-text`
  - `/damij/braille/learn`
- `/damij/autism` — نظام التوحد
  - `/damij/autism/diagnosis` (تحديد النوع — placeholder)
  - `/damij/autism/therapy` (الألعاب التفاعلية — placeholder)
  - `/damij/autism/profile` (ملف الطفل)
- `/damij/adhd` — نظام ADHD
  - `/damij/adhd/screening` (التشخيص التفريقي — placeholder)
  - `/damij/adhd/training` (تمارين علاجية — placeholder)
- `/damij/dashboard` — لوحة المختص/ولي الأمر (Placeholder)

### 2) العزل الكامل (نفس استراتيجية GJU 3030)
- توسيع شرط `isGJURoute` في `RootLayout` ليشمل `/damij` ⇒ يخفي `WelcomeGuide`, `PlatformGuideAssistant`, `AccessibilityPanel`، ولا يظهر Navbar/Footer العام.
- تعيين `sessionStorage.setItem('damij_mode', 'true')` عند الدخول.
- `DamijLayout` خاص (Outlet + DamijFloatingNav + DamijFooter مصغّر داخلي فقط).
- لا يوجد أي زر "العودة إلى ذروة العلم" داخل المنصة (حسب memory: GJU isolation pattern).

### 3) الملفات الجديدة

```text
src/pages/damij/
  DamijLanding.tsx           ← بوابة + 3 بطاقات للأنظمة الثلاثة
  DamijLayout.tsx            ← layout معزول (خلفية، خط، تنقل)
  braille/
    BrailleHome.tsx
    TextToBraille.tsx        ← UI input/output placeholder
    BrailleToText.tsx        ← UI رفع صورة/نص placeholder
    BrailleLearn.tsx         ← شبكة حروف بريل تعليمية (ثابتة)
  autism/
    AutismHome.tsx
    AutismDiagnosis.tsx      ← نموذج أسئلة تجريبي + شاشة نتيجة placeholder
    AutismTherapy.tsx        ← شبكة ألعاب علاجية (بطاقات placeholder)
    AutismProfile.tsx
  adhd/
    ADHDHome.tsx
    ADHDScreening.tsx        ← استبيان placeholder
    ADHDTraining.tsx         ← تمارين تركيز placeholder
  dashboard/
    DamijDashboard.tsx       ← بطاقات إحصاءات placeholder

src/components/damij/
  DamijFloatingNav.tsx       ← تنقل عائم بين الأنظمة الثلاثة
  DamijHero.tsx
  SystemCard.tsx             ← بطاقة نظام (أيقونة/عنوان/وصف/CTA)
  FeatureCard.tsx
  PlaceholderPanel.tsx       ← لوحة "قيد التطوير" أنيقة لكل أداة

src/i18n/damij/translations.ts  ← (اختياري) نصوص عربية مركزية
```

### 4) الهوية البصرية (مستقلة)
- لوحة ألوان دافئة هادئة مناسبة للتعليم الخاص: أزرق هادئ (#2C5F8D)، أخضر فيروزي (#3CAEA3)، أصفر دافئ (#F6D55C)، خلفية كريمية (#FAF6EE).
- خط عربي واضح كبير (Tajawal/Cairo) مع تباين عالٍ ودعم Dyslexic-friendly.
- زر تبديل سريع لـ "وضع الراحة البصرية" (Cream/Dark) داخل DamijLayout فقط.
- جميع الصفحات RTL.

### 5) محتوى البوابة `/damij` (Landing)
- Hero: اسم المنصة + شعار "تعليم يحتضن كل طفل".
- 3 بطاقات كبيرة متساوية: بريل / التوحد / ADHD — كل بطاقة تأخذ المستخدم لفرعها.
- شريط مزايا (4 أيقونات): تشخيص ذكي، علاج تفاعلي، تحويل إشارة↔نص، تقارير لولي الأمر.
- خاتمة: "تم إنشاء المنصة بواسطة مدرسة عنبه الثانية الشاملة للبنين" (حسب القاعدة الثابتة).

### 6) إضافة مدخل في صفحة ذروة العلم الرئيسية
- بطاقة جديدة في `src/components/PlatformCategories.tsx` بعنوان "دامج — التعليم الخاص الذكي" تُحوّل إلى `/damij` (تفتح في نفس النافذة لكن المنصة معزولة بصرياً).

### 7) ما سيكون Placeholder صراحةً
- كل أزرار "ابدأ التشخيص"، "حلل النص"، "ابدأ اللعبة" تعرض `PlaceholderPanel` بنص: "هذه الأداة قيد التطوير — البنية جاهزة لربط النموذج لاحقاً."
- لا استدعاءات Supabase أو AI Gateway في هذه الجولة.

## ما هو خارج النطاق (لاحقاً)
- منطق تحويل بريل الفعلي / كاميرا OCR.
- نماذج تشخيص التوحد و ADHD وقاعدة الأسئلة المعتمدة سريرياً.
- ألعاب علاجية تفاعلية فعلية.
- جداول قاعدة بيانات وحسابات مستخدمين.
- تعديل أي شيء في GJU 3030 أو Capacitor.

## ملفات سيتم تعديلها
1. `src/App.tsx` — إضافة imports + Route group لـ `/damij/*` خارج RootLayout الافتراضي + توسيع `isGJURoute` لتغطية `/damij`.
2. `src/components/PlatformCategories.tsx` — إضافة بطاقة "دامج".
3. إنشاء كل الملفات في `src/pages/damij/**` و `src/components/damij/**` كما في الشجرة أعلاه.

هل تعتمد هذه البنية بهذا الاسم ("دامج") والمسار `/damij`؟