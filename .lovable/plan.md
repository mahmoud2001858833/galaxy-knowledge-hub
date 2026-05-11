## الهدف
تحويل جميع دوال منصة دامج (23 دالة) من Lovable AI Gateway إلى Google Gemini API مباشرة، ثم اختبارها كلها للتأكد من عملها.

## المفتاح المستخدم
سيتم تخزين مفتاح Gemini كـ Secret في Supabase باسم `GEMINI_API_KEY` (المفتاح: `AIzaSyBfN_N1FgwizYWQ9o9P6gQWWqnkF3t_VtE`).
*(دالة `braille-tutor-ai` تستخدم بالفعل `BRAILLE_LEARN_GEMINI_KEY` — سنوحّدها على `GEMINI_API_KEY` ونحذف fallback إلى Lovable.)*

## القائمة الكاملة للدوال (23)
**نص/تحليل (chat completions):**
1. adhd-combined-report
2. adhd-day-analyze
3. adhd-screening-report
4. autism-generate-diagnostic-games
5. autism-generate-therapy-plan
6. autism-screen-analyze
7. braille-tutor-ai
8. damij-carbon-advisor
9. damij-dict-lookup
10. damij-dict-translate-batch
11. damij-guide-chat
12. damij-translate
13. damij-youtube-sign
14. medical-condition-checker
15. enhanced-speech-analysis

**رؤية (Vision — صور):**
16. cancer-detection-ai
17. autism-screen-analyze (إن لزم)
18. braille-ocr
19. damij-sign-translate
20. sensory-bridge-transform

**توليد صور (Image generation):**
21. braille-convert (إن كانت تولّد صور)
22. braille-tactile-generate
23. sensory-image-tactile

**صوت/STT:**
- universal-speech-to-text → Gemini يدعم الصوت عبر `inlineData` بصيغة base64

## خطة التنفيذ

### المرحلة 1: إعداد المفتاح
- إضافة `GEMINI_API_KEY` كـ Secret في Supabase.

### المرحلة 2: إنشاء مكتبة مشتركة
إنشاء `supabase/functions/_shared/gemini-direct.ts` تحتوي على:
- `callGeminiText(prompt, opts)` — لاستدعاءات النص.
- `callGeminiJSON(prompt, schema?)` — للمخرجات المنظمة (`responseMimeType: application/json`).
- `callGeminiVision(prompt, imageBase64, mimeType)` — لتحليل الصور.
- `callGeminiImage(prompt)` — لتوليد الصور عبر `gemini-2.5-flash-image`.
- `callGeminiAudio(prompt, audioBase64, mimeType)` — للصوت/STT.
- معالجة 429 مع backoff تصاعدي (6 محاولات).
- النموذج الافتراضي: `gemini-2.5-flash` للنص، `gemini-2.5-flash-lite` للمخرجات الخفيفة، `gemini-2.5-flash-image` للصور.

### المرحلة 3: تحويل الدوال (23)
لكل دالة:
- إزالة كل استدعاءات `https://ai.gateway.lovable.dev/...`.
- إزالة `LOVABLE_API_KEY` و fallback إلى Lovable.
- استبدالها بدالة من المكتبة المشتركة.
- الحفاظ على نفس شكل الـ request/response تماماً (لا تغيير في الواجهة الأمامية).
- ترجمة `tool_calls` (الموجودة في `damij-carbon-advisor` و `autism-generate-*`) إلى `responseSchema` في Gemini.
- ترجمة `modalities: ['image','text']` إلى `gemini-2.5-flash-image` مع استخراج `inlineData.data` من الرد.

### المرحلة 4: النشر
نشر جميع الدوال الـ23 دفعة واحدة عبر `deploy_edge_functions`.

### المرحلة 5: الاختبار
- استخدام `curl_edge_functions` لاختبار كل دالة بـ payload نموذجي.
- جدول نتائج (نجح/فشل + سبب الفشل).
- إصلاح أي إخفاقات (عادةً اختلاف في شكل الرد) وإعادة الاختبار.
- مراجعة logs عبر `edge_function_logs` لأي 500.

### المرحلة 6: التحقق النهائي
- `rg "ai.gateway.lovable.dev|LOVABLE_API_KEY" supabase/functions/{دوال دامج}` يجب أن يعطي صفر نتائج.
- تقرير نهائي بحالة كل دالة.

## ملاحظات تقنية
- Gemini direct يستخدم endpoint:  
  `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=...`
- الحد المجاني: ~15 طلب/دقيقة لـ flash و ~30 لـ flash-lite — سنضيف backoff.
- الصور المُولّدة تأتي كـ base64 في `candidates[0].content.parts[].inlineData.data` — نُحوّلها إلى `data:image/png;base64,...` للحفاظ على نفس شكل الرد.
- الصوت عبر Gemini مدعوم بصيغ: wav/mp3/aiff/aac/ogg/flac.

## المخاطر
- اختلاف جودة بعض المخرجات (خصوصاً `tool_calls` → `responseSchema`).
- حدود معدّل Gemini المجانية أقل من Lovable AI — قد نحتاج تأخيراً بين الطلبات في حالة الاستخدام المكثف.
