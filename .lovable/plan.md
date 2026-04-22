
# خطة شاملة لتحديثات قسم مستقبل التكنولوجيا والذكاء الاصطناعي

## 1. صفحة "مستقبل التكنولوجيا" (`/gju-competition`)
- **حذف بطاقة "تقييم الرسومات بالذكاء الاصطناعي"** من قائمة `aiTools` في `GJUCompetition.tsx` (السطر 35).
- **حذف الأيقونات العائمة** من `GJUFloatingNav.tsx`:
  - إزالة `<AccessibilityPanel />` (أيقونة إعدادات الوصول).
  - إزالة أيقونة "المرشد الذكي" إن وُجدت ضمن نفس الـ Nav (التحقق وحذفها).
  - الإبقاء فقط على زر "العودة لمستقبل التكنولوجيا".
- **إضافة بطاقة جديدة "المساعد الطبي"** ضمن `aiTools`:
  - أيقونة `Stethoscope`، تدرّج `from-rose-500 to-red-600`، رابط `/medical-assistant`.
  - وصف: "مساعد طبي ذكي للإسعافات الأولية والتحليل التشخيصي".

## 2. مساعد البرمجة الذكي – فتح خيار البرمجة فوراً
- في `GJUCompetition.tsx` (السطر 36): تغيير رابط "مساعد البرمجة الذكي" من `/btec/information-technology` إلى `/btec/it/programming?tab=ai-assistant`.
- في `ProgrammingSection.tsx`: قراءة `?tab=` من URL وتعيين التبويب النشط فوراً (افتراضياً `ai-assistant`).

## 3. كتابة الكود بالذكاء الاصطناعي – يكتب الكود فعلياً
- **المشكلة**: في `tech-ai-code-gen/index.ts` يتم استخراج الكود ضمن `code` لكن الواجهة لا تعرضه بشكل صحيح. تحديث:
  - تعديل system prompt في `tech-ai-code-gen` ليلزم النموذج بإرجاع بلوك كود كامل دائماً (حتى لو كان قصيراً).
  - في `BuildPlatformTab.tsx` / المكون المستخدم: التأكد من عرض حقل `code` المرجع داخل `<pre>` مع syntax highlighting، وليس فقط `explanation`.
  - تحسين الـ regex لاستخراج الكود ليتعامل مع لغات متعددة وأكواد متعددة الأسطر.

## 4. زر "معاينة" – معاينة حقيقية
- في مكون عرض الكود (داخل تبويب "كتابة الكود بالذكاء الاصطناعي"): إضافة زر **معاينة** يفتح `<iframe srcDoc={generatedCode}>` لـ HTML/CSS/JS، أو sandbox تنفيذ لـ JS عبر `Function()` آمن، مع تبويب يبدّل بين "الكود" و"المعاينة الحية" (نفس فكرة `BuilderPreview.tsx`).

## 5. "بناء المنصة بالذكاء الاصطناعي" – إصلاح كامل
- المشكلة الحالية: `AIPlatformBuilder.tsx` يتطلب صلاحية admin/super_admin → غير المسؤولين يرون "غير مصرح".
- **الحل**: 
  - فتح الوصول لجميع المستخدمين المسجّلين في وضع GJU (إزالة شرط `accessLevel === 'admin'` عند `gju_mode === 'true'`).
  - التأكد من أن `ai-code-generator` Edge Function يعمل: إضافة fallback من Lovable Gateway → Gemini Direct بنفس استراتيجية تدوير المفاتيح.
  - معالجة 429/402 وعرض toast واضح بدلاً من فشل صامت.
  - التأكد من أن الملفات تُحفظ في `ai_builder_files` وتُعرض في المعاينة.

## 6. كشف السرطانات – تنبيه واضح وكبير
- في `CancerDetection.tsx` بعد تحميل النتيجة: عند `result.risk_level === 'عالي'` أو `risk_score >= 70`:
  - إضافة **بانر علوي عريض** بتصميم وشاح أحمر متحرّك (gradient + animate-pulse) يحوي:
    - نص ضخم (text-5xl/7xl): **"⚠️ تم اكتشاف سرطان: {result.suspected_type}"** (مثلاً "سرطان الجلد").
    - أيقونة `AlertTriangle` كبيرة + حدود حمراء مضيئة.
  - عند `متوسط`: وشاح أصفر/برتقالي بنفس الحجم لكن نص "اشتباه عالي بـ {type}".

## 7. تحسين توليد الصور بالذكاء الاصطناعي
- في `AIImageGenerator.tsx`: 
  - توحيد التصميم ليطابق `GJUCompetition.tsx` (gradient violet/cyan، StarField، نفس الكروت).
  - الترقية لنموذج `google/gemini-3.1-flash-image-preview` (Nano Banana 2) لجودة أعلى.
  - إضافة خيارات: نمط الصورة، النسبة، الجودة.
  - معرض للصور المُنشأة سابقاً.

## 8. ذروة العلم الذكي – إصلاح المايك (Speech-to-Text)
- المشكلة: `universal-speech-to-text` يعتمد على OpenAI Whisper أو Gemini مباشرة وقد يفشل صامتاً.
- **الحل في `universal-speech-to-text/index.ts`**:
  - إضافة Lovable Gateway كأولوية أولى مع `google/gemini-2.5-flash` و audio modality.
  - تحسين معالجة الأخطاء: إرجاع رسالة واضحة بدل null.
  - في `GlobalVoiceInput.tsx`: عرض toast تفصيلي بسبب الفشل + إعادة محاولة تلقائية مرة واحدة.
  - تحديد لغة "ar" صراحةً في الطلب لتحسين دقة العربية.

## 9. روبوتات وبناء ذكي – التصميم المعماري + الداخلي يولّدان صوراً
- المشكلة: `generate3DImage` في `AIArchitecturalDesign.tsx` يستدعي `ai.gateway.lovable.dev` مباشرة من العميل → سيفشل دون auth header.
- **الحل**:
  - إنشاء Edge Function جديد `smart-city-image-gen` يستخدم `LOVABLE_API_KEY` مع `google/gemini-2.5-flash-image` و fallback لـ `gemini-3.1-flash-image-preview`.
  - تحديث `AIArchitecturalDesign.tsx` و `AIInteriorDesign.tsx` لاستدعاء `supabase.functions.invoke('smart-city-image-gen', { body: { prompt } })`.
  - عرض الصورة في Modal كبير مع زر تحميل.

## 10. حاسبة البصمة الكربونية + مؤشر الاستدامة – تحسينات إضافية
- إضافة:
  - **مقارنة عالمية حية**: عرض موضع المستخدم على خريطة عالمية (Top 10%, متوسط، إلخ).
  - **خط زمني (Timeline)** يظهر تطور بصمة المستخدم عبر الجلسات السابقة (حفظ في localStorage).
  - **Gamification**: شارات إنجاز عند تحقيق أهداف (تخفيض 10%، 25%، 50%).
  - **تصدير PDF محسّن** بشعار المنصة وتصميم احترافي.
  - **مقارنة الأقران**: متوسط بصمات المستخدمين الآخرين على المنصة (anonymous aggregate).

## التفاصيل التقنية

| الملف | التغيير |
|-------|--------|
| `src/pages/GJUCompetition.tsx` | حذف Rate Art tool، إضافة Medical Assistant، تحديث رابط مساعد البرمجة |
| `src/components/gju/GJUFloatingNav.tsx` | حذف AccessibilityPanel والمرشد الذكي |
| `src/components/btec/ProgrammingSection.tsx` | قراءة `?tab=` من useSearchParams |
| `supabase/functions/tech-ai-code-gen/index.ts` | تقوية system prompt لإرجاع كود دائماً |
| `src/components/btec/programming/BuildPlatformTab.tsx` | عرض الكود + زر معاينة (iframe srcDoc) |
| `src/pages/AIPlatformBuilder.tsx` | فتح الوصول لمستخدمي GJU، تحسين معالجة الأخطاء |
| `supabase/functions/ai-code-generator/index.ts` | Fallback Gateway → Gemini direct، 429/402 handling |
| `src/pages/CancerDetection.tsx` | بانر تنبيه عريض عند الخطر العالي/المتوسط |
| `src/pages/AIImageGenerator.tsx` | إعادة تصميم بنفس Theme، ترقية النموذج |
| `supabase/functions/universal-speech-to-text/index.ts` | إضافة Lovable Gateway كأولوية، لغة عربية |
| `src/components/accessibility/GlobalVoiceInput.tsx` | toast تفصيلي + retry |
| `supabase/functions/smart-city-image-gen/index.ts` | **جديد** – توليد صور آمن من الخادم |
| `src/pages/AIArchitecturalDesign.tsx` + `AIInteriorDesign.tsx` | استخدام Edge Function الجديد |
| `src/pages/EnhancedCarbonCalculator.tsx` + `PersonalSustainabilityIndex.tsx` | Timeline، شارات، مقارنة عالمية، PDF محسّن |

## الترتيب المقترح للتنفيذ
1. تنظيف صفحة `/gju-competition` (حذف Rate Art + الأيقونات + إضافة Medical Assistant).
2. إصلاح مساعد البرمجة (التبويب الفوري + كتابة الكود + زر المعاينة).
3. إصلاح بناء المنصة (الصلاحيات + Edge Function).
4. تنبيه السرطان الكبير.
5. توليد صور المعماري/الداخلي عبر Edge Function آمن.
6. إصلاح المايك في ذروة العلم الذكي.
7. تحسين توليد الصور والحاسبات.
