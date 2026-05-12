## المشكلة

دالة `braille-convert` تحاول أولاً استخدام مفتاح `BRAILLE_GEMINI_API_KEY` (Gemini مباشر) لتحويل المستوى الثاني (الاختزالي) وفك الترميز من بريل إلى نص، ثم تسقط على Lovable AI Gateway. لكن:

1. مفتاح `BRAILLE_GEMINI_API_KEY` غير مضاف حالياً في الـ Secrets، لذلك يحاول التحويل عبر Lovable AI.
2. حسب قاعدة المشروع: **استخدام Lovable AI ممنوع منعاً باتاً**، لذا الاستدعاء يفشل ولا يعود أي بريل اختزالي ولا يتم فك الترميز.
3. النتيجة: المستوى الثاني لا يعمل في (ملف / رابط ويب / نص مباشر)، وخيار "بريل → نص" أيضاً لا يعمل.

## الخطة

### 1) تخزين مفتاح Gemini الذي زودتني به
أضيف Secret جديد باسم `BRAILLE_GEMINI_API_KEY` بالقيمة `AIzaSyDVHrMAsh-jY04ZWsdbFxVDZRZRmkUqAGk` عبر أداة الأسرار الآمنة (لن يُكتب في الكود).

### 2) إعادة كتابة `supabase/functions/braille-convert/index.ts`
- إزالة كل الاستدعاءات إلى `geminiFetch`/Lovable AI (`shim-key`) من دالتي `grade2Convert` و`reverseBraille` و`refineDecodedText` — لأنها مخالفة لقاعدة المشروع وتسبب الفشل.
- جعل المفتاح `BRAILLE_GEMINI_API_KEY` إجبارياً لمسارات الذكاء الاصطناعي:
  - **Grade 2 (الاختزالي)**: يستخدم `gemini-2.5-flash` مباشرة عبر `generativelanguage.googleapis.com`. عند الفشل أو غياب المفتاح يرجع رسالة خطأ واضحة بالعربية بدلاً من السقوط الصامت إلى Grade 1.
  - **Reverse (بريل → نص)**: يستخدم `gemini-2.5-pro` مباشرة، ثم تنقيح اختياري بـ `gemini-2.5-flash` بنفس المفتاح المباشر (بدل Lovable AI).
- إضافة معالجة أفضل للأخطاء (429 / 4xx / شبكة) مع رسائل عربية.
- الإبقاء على منطق `fetch_url` و`grade1Convert` كما هو.

### 3) النشر والتحقق
- نشر الدالة `braille-convert`.
- اختبار سريع عبر `curl_edge_functions`:
  - `mode: convert, grade: 2, text: "مرحبا بالعالم", langCode: ar` → يجب أن يعود بريل اختزالي يحتوي محارف U+2800.
  - `mode: reverse, braille: "⠠⠓⠑⠇⠇⠕"` بالإنجليزية → يجب أن يعود "Hello".

## الملفات المتأثرة
- `supabase/functions/braille-convert/index.ts` (تعديل)
- إضافة Secret `BRAILLE_GEMINI_API_KEY` (لا تغيير في الكود)

لا تغييرات على الواجهة (`UniversalBrailleConverter.tsx`)، السلوك الحالي يستدعي نفس الـ endpoints وسيعمل تلقائياً بمجرد إصلاح الـ backend.
