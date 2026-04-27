
## ملخص التعديلات على منصة "مستقبل التكنولوجيا" (/gju-competition)

سأقوم بتنفيذ ٨ تعديلات رئيسية على القسم. كلها تخص مسار GJU 3030 فقط ولن تؤثر على ذروة العلم.

---

### 1. حذف المتجر الذكي المنفصل ودمجه مع الدفع بالوجه
- إزالة بطاقة "🛍️ المتجر الذكي" من قائمة `aiTools` في `src/pages/GJUCompetition.tsx`.
- داخل صفحة `/face-pay` (FacePayAI) سيظهر تبويب/قسم جديد "المتجر" يفتح تجربة `Store.tsx` المضمّنة بدل أن تكون صفحة منفصلة.
- التسوّق سيستخدم نفس حساب FacePay (نفس وجه المستخدم) وعند الدفع يستخدم Face Verify.

### 2. تشديد التعرّف على الوجه — فقط الوجه المسجَّل يفتح الحساب
- الكاميرا ستركّز على الوجه الذي يقع في **مركز الإطار** (Region of Interest حول مركز الفيديو) وتتجاهل الوجوه الجانبية/الخلفية.
- في `FaceScanner.tsx` (وضع `verify`):
  - رفع `MATCH_THRESHOLD` وزيادة `REQUIRED_MATCHES` لتأكيد أعلى.
  - إضافة فحص "single-face-in-center": إذا اكتُشف أكثر من وجه أو الوجه ليس قرب مركز الإطار ⇒ رفض.
  - زيادة حساسية الرفض (`REJECT_STREAK` أقل) لمنع تمرير وجه آخر.
- في خطوة الدفع (`FacePayCheckout.tsx`) سنستدعي نفس FaceScanner مع `expectedEmbedding` الخاص بالحساب الحالي فقط، ونمنع المتابعة عند `mismatch`.

### 3. زر الرجوع في "المساعد الطبي الذكي" يعود إلى مستقبل التكنولوجيا
- في `src/pages/MedicalAssistant.tsx` نستخدم نفس نمط `useSimulationBack` (فحص `sessionStorage.gju_mode`):
  - إذا `gju_mode === 'true'` ⇒ يعود إلى `/gju-competition#ai`.
  - وإلا يعود لذروة العلم كما هو.

### 4. إعادة تصميم "باني المنصات بالـ AI" + توحيد شكل المنصات المُولَّدة
سيُحدَّث برومبت توليد الواجهات (`platform-stage-ui` edge function) بحيث كل منصة تُنتَج بالقالب التالي:
```text
┌──────────────────────────────────────┐
│  Header أنيق متدرّج بلون الموضوع       │
├──────────────────────────────────────┤
│  صورة Hero مولَّدة متعلّقة بالموضوع     │
│  فوقها overlay فيه اسم المنصة + شرح    │
├──────────────────────────────────────┤
│  بطاقات: "خيارات المنصة" / "اكتشف      │
│  أقسامها" / "ابدأ الآن" ...            │
└──────────────────────────────────────┘
```
- استخدام `ai-image-generator` لتوليد صورة hero من اسم/وصف المنصة وحقنها في `<img>` داخل القالب.
- إضافة قسم CTA موحَّد في أسفل كل صفحة منصة مولَّدة.

### 5. مساعد البرمجة الذكي — خياران فقط من ذروة العلم
عند الدخول إلى `/btec/it/programming?tab=ai-assistant` من منصة GJU، تُعرض نسخة مبسّطة بتصميم أنيق فيها فقط:
- **تصحيح الكود** (Code Fixer)
- **تقييم المنصة** (تقييم/Review جديد للمنصات)

سيتم الكشف بـ `sessionStorage.gju_mode` داخل `ProgrammingSection.tsx` لإخفاء بقية التبويبات وتطبيق ستايل GJU.

### 6. زر الرجوع داخل أقسام GJU يعيدك إلى نفس القسم
- تعديل `useSimulationBack` و كل أزرار "العودة" في الصفحات الفرعية (المحاكيات، أدوات AI، الاستدامة، إلخ) لتقرأ القسم المُخزَّن.
- عند فتح بطاقة من track معيّن نخزّن `sessionStorage.gju_last_track = 'ai'|'simulations'|...`.
- زر الرجوع يعود إلى `/gju-competition#<track>` ويسكرول تلقائياً بفضل `scroll-mt-28` الموجود.

### 7. ترجمة كاملة للإنجليزية
- توسعة `src/pages/gju/translations.ts`:
  - إضافة كل العناوين الناقصة في `toolTranslationsEn` (FacePay, Lumina, Cancer Detection, Medical Assistant, Platform Builder, Robotics Generator, Jordan Digital Twin... إلخ).
  - إضافة ترجمات جديدة للأقسام التي ستضاف (مزايا المنصة، الهيدر، الأزرار).
- التأكد أن `TrackSection`, `SimulationsShowcase`, `GJUFooter` كلها تستخدم `lang` لعرض الترجمة، ولا يتبقى نص عربي ثابت.

### 8. نقل "التعلّم الدامج" تحت "الذكاء الاصطناعي" + المحاكيات تحت التعلّم الدامج
إعادة ترتيب مصفوفة `tracks` في `GJUCompetition.tsx` إلى:
1. الذكاء الاصطناعي
2. التعلّم الدامج
3. المحاكيات التفاعلية
4. الروبوتات والبناء الذكي
5. التقنيات المستدامة

تحديث `Mission Control` و التنقّل بنفس الترتيب الجديد.

### 9. قسم "مزايا منصة مستقبل التكنولوجيا" في نهاية الصفحة
إضافة سكشن جديد قبل `GJUFooter` بعنوان **"مزايا منصة مستقبل التكنولوجيا"** يعرض كل قسم وأدواته بشرح مختصر. مبني ديناميكياً من نفس مصفوفات `aiTools / inclusiveTools / simulationTools / roboticsTools / sustainabilityTools` لضمان أنه يبقى محدَّثاً تلقائياً.

شكل البطاقة لكل قسم:
```text
[أيقونة]  اسم القسم
وصف مختصر للقسم
─────────────────────
• اسم الأداة — شرح قصير جداً (1 سطر)
• اسم الأداة — ...
```

---

## التفاصيل التقنية للملفات

| الملف | التعديل |
|---|---|
| `src/pages/GJUCompetition.tsx` | حذف بطاقة Store، إعادة ترتيب tracks، إضافة قسم "مزايا المنصة"، حفظ `gju_last_track` عند فتح أي بطاقة |
| `src/pages/FacePayAI.tsx` | إضافة تبويب "المتجر" يحمّل مكون Store داخلياً |
| `src/components/facepay/Store.tsx` | تعديلات لتعمل ضمن FacePay (نفس الحساب) بدل صفحة مستقلة |
| `src/components/facepay/FaceScanner.tsx` | فحص مركز الإطار + رفع عتبات المطابقة + رفض تعدد الوجوه |
| `src/components/facepay/FacePayCheckout.tsx` | استدعاء FaceScanner مع embedding الحساب الحالي فقط |
| `src/pages/MedicalAssistant.tsx` | زر الرجوع يحترم `gju_mode` |
| `src/components/btec/ProgrammingSection.tsx` | عرض Code Fixer + Platform Review فقط في GJU mode، ستايل أنيق |
| إضافة `src/components/btec/programming/PlatformReviewTab.tsx` | تبويب جديد لتقييم المنصات |
| `src/hooks/useSimulationBack.ts` | قراءة `gju_last_track` للعودة للقسم الصحيح |
| `supabase/functions/platform-stage-ui/index.ts` | برومبت موحَّد: header + hero image + cards |
| `src/pages/gju/translations.ts` | إكمال جميع الترجمات الإنجليزية |

لن أعدّل أي صفحة من ذروة العلم الأصلية ولن أكسر أي عزل تقني خاص بـ GJU 3030.
