

# خطة إضافة 5 أدوات ذكاء اصطناعي متقدمة لمحور AI & Machine Learning

## الأدوات الخمسة المقترحة

### 1. محلل المستندات الذكي (AI Document Analyzer)
- رفع صور/مستندات والحصول على ملخص شامل + استخراج النقاط الرئيسية + أسئلة مراجعة تلقائية
- يستخدم Gemini Vision لتحليل الصور والنصوص
- يدعم العربية والإنجليزية

### 2. مترجم فوري ذكي مع صوت (AI Real-time Translator)
- ترجمة فورية بين العربية والإنجليزية مع نطق صوتي
- تصحيح القواعد تلقائياً + اقتراح بدائل أفضل
- وضع محادثة ثنائي اللغة

### 3. مولّد الاختبارات الذكي (AI Smart Quiz Generator)
- إدخال موضوع → يولّد اختبار كامل (اختيار متعدد + صح/خطأ + مقالي)
- تصحيح تلقائي + تقييم الإجابات المقالية بالذكاء الاصطناعي
- 3 مستويات صعوبة

### 4. مراجع الأكواد الذكي (AI Code Reviewer)
- لصق كود → تحليل شامل: أخطاء، تحسينات، أمان، أداء
- اقتراح حلول بديلة مع شرح
- دعم Python, JavaScript, Java, C++

### 5. باحث ذكي متقدم (AI Research Assistant)
- إدخال موضوع بحثي → تقرير بحثي منظم مع مقدمة وفصول وخاتمة
- توليد مخطط بياني للمعلومات
- تصدير كملف نصي

---

## التنفيذ التقني

### صفحات جديدة (5 ملفات)
- `src/pages/AIDocumentAnalyzer.tsx`
- `src/pages/AISmartTranslator.tsx`
- `src/pages/AIQuizGenerator.tsx`
- `src/pages/AICodeReviewer.tsx`
- `src/pages/AIResearchAssistant.tsx`

### Edge Functions جديدة (5 ملفات)
- `supabase/functions/ai-document-analyzer/index.ts`
- `supabase/functions/ai-smart-translator/index.ts`
- `supabase/functions/ai-quiz-generator/index.ts`
- `supabase/functions/ai-code-reviewer/index.ts`
- `supabase/functions/ai-research-assistant/index.ts`

كل Edge Function تستخدم مفتاح Google AI المقدم (`AIzaSyBMqKjLqlQGEFQNok0_Cf9uOQqhzb0FAnA`) مع Gemini API، مع fallback للـ Lovable AI Gateway.

### تحديثات على ملفات موجودة
- **`App.tsx`**: إضافة 5 routes جديدة
- **`GJUCompetition.tsx`**: إضافة الأدوات الـ5 لمصفوفة `aiTools` مع تحسين عرض الكروت (تصميم أكبر وأكثر تفاعلية للأدوات الجديدة مع badge "جديد")
- **`supabase/config.toml`**: إضافة 5 functions مع `verify_jwt = false`

### تحسين العرض
- إضافة badge "🆕 جديد" على الأدوات الخمس الجديدة
- تصميم كروت أكبر حجماً للأدوات المتقدمة مع وصف أطول
- تأثيرات hover أقوى وألوان gradient مميزة

### حفظ مفتاح API
- حفظ المفتاح كـ Supabase secret باسم `GJU_AI_API_KEY`

