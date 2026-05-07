## المشكلة

من سجلات Edge Function لوظيفة `sensory-image-tactile` السبب واضح: المفتاح الوحيد `SENSORY_TACTILE_GEMINI_KEY` يرجع باستمرار خطأ **429 (Quota exceeded)** على نموذج `gemini-2.0-flash` (الحصة المجانية = 0)، فيفشل تحليل الصورة دائماً.

الوظيفة الحالية لا تملك أي fallback (لا مفاتيح بديلة ولا نموذج بديل ولا Lovable Gateway)، عكس باقي وظائف المشروع.

## الحل

تعديل `supabase/functions/sensory-image-tactile/index.ts` فقط، بدون أي تغيير في الواجهة:

### 1) Fallback متعدد المفاتيح + متعدد النماذج لـ Gemini مباشرة
المرور بكل تركيبة (نموذج × مفتاح) وعند 429/5xx ينتقل للتالي:

- النماذج بالترتيب: `gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-2.0-flash` → `gemini-1.5-flash`
- المفاتيح بالترتيب (كلها موجودة فعلياً في الأسرار):
  `SENSORY_TACTILE_GEMINI_KEY` → `GEMINI_API_KEY` → `GEMINI_API_KEY_NEW` → `GOOGLE_AI_API_KEY` → `BRAILLE_GEMINI_API_KEY` → `MEDICAL_AI_KEY` → `ROBOTICS_AI_KEY`

### 2) Fallback نهائي إلى Lovable AI Gateway (multimodal)
إن فشلت كل تركيبات Gemini، استخدم `LOVABLE_API_KEY` عبر:
`https://ai.gateway.lovable.dev/v1/chat/completions`
بنموذج `google/gemini-2.5-flash` مع رسالة multimodal (text + image_url يحمل `data:<mime>;base64,...`) و `response_format: { type: 'json_object' }`.

### 3) تحسين متانة الاستجابة
- استخراج JSON حتى لو غُلِّف بـ ```json fences``` (regex لاستخراج أول كتلة `{...}`).
- فحص أن الحجم القاعدي للصورة معقول (< ~6MB base64 ≈ 4.5MB ملف) وإلا إرجاع رسالة عربية واضحة.
- لوغ مختصر لكل محاولة فاشلة لتسهيل التشخيص لاحقاً.
- رسائل خطأ عربية أوضح للواجهة (انتهت الحصة، الصورة كبيرة، الصورة غير صالحة).

### 4) Timeout لكل طلب
`AbortController` مع 45 ثانية لكل محاولة، حتى لا تعلق الواجهة.

## الملفات المتأثرة

- **معدّل**: `supabase/functions/sensory-image-tactile/index.ts` (إعادة كتابة منطق الاستدعاء فقط، نفس شكل الـ JSON المُعاد للواجهة)
- **بدون تعديل**: `src/pages/damij/sensory/SensoryImageTactile.tsx` (لا حاجة)
- **بدون تعديل**: قاعدة البيانات أو الأسرار (المفاتيح المستخدمة موجودة بالفعل)

## التحقق بعد التنفيذ
1. نشر `sensory-image-tactile`.
2. استدعاء عبر `curl_edge_functions` بصورة تجريبية صغيرة base64.
3. مراجعة `edge_function_logs` للتأكد من نجاح أحد المحاولات أو الانتقال السلس إلى Gateway عند 429.
