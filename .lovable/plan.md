

# خطة تحسين التنقل والميزات في "مستقبل التكنولوجيا"

## المطلوب (ملخص)

عدة تعديلات على صفحة مستقبل التكنولوجيا والصفحات المرتبطة بها:

1. حذف زر "العودة لذروة العلم" من صفحة GJU Competition
2. تعديل أزرار الرجوع في جميع الصفحات الفرعية لتعود إلى `/gju-competition` عند تفعيل GJU mode
3. إصلاح رابط "تقييم الرسومات" (404) → تغييره إلى `/art-design`
4. تغيير رابط "مساعد البرمجة" ليفتح BTEC IT مباشرة `/btec/information-technology`
5. تغيير رابط "تحليل الصور التعليمية" ليفتح `/jordanian-assistant` (مع إصلاح الرجوع)
6. إضافة أزرار رجوع لمستقبل التكنولوجيا في صفحات المدينة الذكية والاستدامة
7. تغيير رابط "قاموس لغة الإشارة" ليفتح القاموس مباشرة بدل الكاميرا
8. تحسين دقة قراءة اليد في SignLanguagePage
9. إضافة خاصية توليد صورة 3D للتصاميم المعمارية والداخلية باستخدام مفتاح AI جديد

---

## التغييرات التفصيلية

### 1. حذف زر "العودة لذروة العلم" (GJUCompetition.tsx)
- حذف الـ motion.button في سطور 490-500 بالكامل

### 2. تعديل التنقل في GJU mode عبر جميع الصفحات الفرعية
**الملفات المتأثرة:**
- `FalakKnowledgeAI.tsx` - تغيير زر الرجوع ليرجع لـ `/gju-competition` عند GJU mode
- `AIImageGenerator.tsx` - نفس التعديل
- `BTECInformationTechnology.tsx` - تغيير النص والرابط
- `ProgrammingSection.tsx` - تغيير النص والرابط
- `JordanianAssistant.tsx` - إضافة زر رجوع
- `AIArchitecturalDesign.tsx` - تغيير الرجوع لـ `/gju-competition` عند GJU mode
- `AIInteriorDesign.tsx` - نفس التعديل
- `SmartCitySection.tsx` - نفس التعديل
- `SignLanguagePage.tsx` - تعديل زر الرجوع
- جميع صفحات الاستدامة البيئية (6 صفحات) - إضافة/تعديل زر رجوع
- `ArtDesign.tsx` - إضافة زر رجوع

**النمط الموحد:** فحص `sessionStorage.getItem('gju_mode') === 'true'` وتوجيه الرجوع وفقاً لذلك

### 3. إصلاح روابط GJU Competition
- `drawing-challenge` → `/art-design` (لأنه لا يوجد route لـ `/drawing-challenge` بدون roomId)
- `btec` → `/btec/information-technology` (يفتح قسم التكنولوجيا مباشرة)

### 4. قاموس لغة الإشارة - فتح القاموس مباشرة
- تغيير رابط "قاموس لغة الإشارة التفاعلي" من `/sign-language` إلى `/sign-language?tab=dictionary`
- تعديل `SignLanguagePage.tsx` لقراءة query parameter وضبط الـ default tab

### 5. تحسين دقة قراءة اليد (SignLanguagePage.tsx)
- تحسين `classifyGesture`: إضافة فحوصات أدق للمسافات بين الأصابع
- تقليل stability threshold من 2 frames إلى 1 frame للاستجابة الأسرع
- تقليل gesture cooldown من 450ms إلى 300ms
- تحسين confidence threshold من 0.35 إلى 0.25
- إضافة فحوصات إضافية لزوايا الأصابع بدل الاعتماد على y-axis فقط
- تحسين thumb detection باستخدام زوايا بدل مقارنة بسيطة

### 6. توليد صور 3D للتصاميم (AIArchitecturalDesign.tsx + AIInteriorDesign.tsx)
- إضافة زر "إنشاء صورة ثلاثية الأبعاد" بجانب كل تصميم مُقترح
- استخدام مفتاح AI: `AIzaSyCiB3CDvu2iUSTk29l3KXDEDyXdMajmkeA`
- استدعاء Google Gemini image generation model لإنشاء صور 3D بناءً على وصف التصميم
- عرض الصورة المولّدة في modal مع خيار التحميل

---

## الملفات التي ستُعدّل

| الملف | التغيير |
|-------|---------|
| `GJUCompetition.tsx` | حذف زر العودة + إصلاح روابط |
| `FalakKnowledgeAI.tsx` | GJU mode back nav |
| `AIImageGenerator.tsx` | GJU mode back nav |
| `BTECInformationTechnology.tsx` | GJU mode back nav + نص |
| `ProgrammingSection.tsx` | GJU mode back nav + نص |
| `JordanianAssistant.tsx` | إضافة GJU mode back nav |
| `AIArchitecturalDesign.tsx` | GJU mode back + زر توليد صورة 3D |
| `AIInteriorDesign.tsx` | GJU mode back + زر توليد صورة 3D |
| `SmartCitySection.tsx` | GJU mode back nav |
| `SignLanguagePage.tsx` | default tab + تحسين قراءة اليد |
| `ArtDesign.tsx` | GJU mode back nav |
| 6 صفحات استدامة | GJU mode back nav |

