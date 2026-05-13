## الهدف
تحويل ميزة "عين الأعمى" بالكامل إلى **Lovable AI Gateway** (استثناء خاص لهذه الميزة فقط)، مع تحسين الكشف ليغطّي **كامل المنطقة أمام الكفيف عبر شبكة مكانية 9 خانات (3×3)** تحدّد العقبات في كل نقطة من مجال الكاميرا، وإصلاح المشاكل التشغيلية الحالية.

## الخطوات

### 1) تحديث الذاكرة
- تعديل `mem://constraints/no-lovable-ai-usage` و `mem://index.md` لإضافة استثناء صريح:
  > يُسمح باستخدام Lovable AI **حصراً** في ميزة "عين الأعمى" (`blind-eye-vision`, `blind-eye-chat`). يبقى ممنوعاً في باقي المنصة.

### 2) إعادة كتابة edge function: `blind-eye-vision`
- التحويل من Gemini المباشر إلى **Lovable AI Gateway** (`https://ai.gateway.lovable.dev/v1/chat/completions`) باستخدام `LOVABLE_API_KEY`.
- النموذج الافتراضي: `google/gemini-2.5-flash` (رؤية + سرعة)، مع fallback إلى `google/gemini-3-flash-preview`.
- استخراج المخرج المُهيكل عبر **tool calling** (لا اعتماد على `responseMimeType`).
- معالجة 429 / 402 وإرجاع رسائل واضحة للعميل.
- **مخطط جديد للكشف الشبكي (Spatial Grid 3×3)**:
  ```
  cells: [
    { id:"TL"|"TC"|"TR"|"ML"|"MC"|"MR"|"BL"|"BC"|"BR",
      label: "وصف قصير لما في هذه الخانة",
      object: "person|wall|pole|step|door|car|table|hole|chair|sign|open|unknown",
      proximity: 0-100,        // قرب التهديد
      hazard: "low|medium|high"
    } × 9
  ]
  best_path: "left|center|right"          // أفضل مسار للمشي
  global_proximity: 0-100                  // أعلى قرب من بين الخانات
  spoken: "جملة عربية قصيرة (٣-١٠ كلمات) للنطق الفوري"
  obstacles_summary: "وصف موجز جداً لأهم 1-2 عقبة"
  ```
- الـ prompt يطلب من النموذج تقسيم الإطار ذهنياً إلى 3 صفوف × 3 أعمدة وملء كل خانة.

### 3) إعادة كتابة edge function: `blind-eye-chat`
- نفس التحويل إلى Lovable AI Gateway مع نفس النماذج والـ fallback.
- إبقاء واجهة الإدخال/الإخراج كما هي (`{ text, image } → { spoken }`).

### 4) تحديث `BlindEyeNavigator.tsx` (الواجهة + التجربة)
- **Overlay شبكي شفاف** فوق الفيديو يرسم خطوط 3×3 ويلوّن كل خانة حسب `hazard` (أخضر/أصفر/أحمر) مع أيقونة العقبة وكلمة وصفية مختصرة.
- مؤشّر "أفضل مسار" (سهم كبير: يسار/أمام/يمين) مبني على `best_path`.
- استخدام `global_proximity` بدلاً من `proximity_score` لمنطق العاجلية والاهتزاز.
- **تحسين الموثوقية**:
  - إصلاح حلقة التشغيل: التأكد من تشغيل الكاميرا قبل بدء الـ tick، ومنع الـ ticks المتراكبة عبر `busy` ref حقيقي (ليس state).
  - معالجة أخطاء 429/402 بإطفاء التحليل مؤقتاً (5 ثوانٍ) ونطق "النظام مشغول، سأحاول بعد قليل".
  - تحسين dedupe عبر مقارنة `obstacles_summary + best_path` بدل النص فقط.
  - زيادة جودة الإطار إلى 720px وjpeg quality 0.78 لتحسين الكشف.
  - إعادة بدء `SpeechRecognition` عند `no-speech` أو `aborted` فوراً.
- **TTS**: محاولة استخدام صوت عربي (`ar-*`) موجود في `getVoices()`، fallback افتراضي.

### 5) `supabase/config.toml`
- التأكد من تسجيل `blind-eye-vision` و `blind-eye-chat` مع `verify_jwt = false` (ميزة عامة قيد المشي، لا تتطلب جلسة مفعّلة لتجنّب الانقطاع).

### 6) التحقق
- نشر الـ functions ثم استدعاؤها بـ `supabase--curl_edge_functions` بصورة اختبارية لقياس الاستجابة.
- مراجعة `supabase--edge_function_logs` للتأكد من عدم وجود أخطاء.
- اختبار يدوي في المعاينة (تشغيل/إيقاف/تكلّم).

## الملفات المتأثرة
- `supabase/functions/blind-eye-vision/index.ts` (إعادة كتابة كاملة + شبكة 3×3)
- `supabase/functions/blind-eye-chat/index.ts` (إعادة كتابة كاملة)
- `src/pages/damij/blind-eye/BlindEyeNavigator.tsx` (Overlay شبكي + إصلاحات)
- `supabase/config.toml` (تأكيد التسجيل)
- `mem://constraints/no-lovable-ai-usage`, `mem://index.md` (استثناء عين الأعمى)

## ملاحظات تقنية
- `LOVABLE_API_KEY` مُهيّأ تلقائياً في Supabase secrets — لا حاجة لإضافة شيء.
- استخدام `tool_choice` لإجبار النموذج على إرجاع JSON مهيكل دقيق (أفضل من responseMimeType مع OpenAI-compatible gateway).
