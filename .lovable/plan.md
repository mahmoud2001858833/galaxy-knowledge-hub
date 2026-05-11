## Goal

في "مترجم لغة الإشارة الذكي" (`SignTranslatorPro`) و"المترجم الفوري ليوتيوب" (`YouTubeSignTranslator`):
1. توسيع قائمة الإشارات المعروضة في **الوضع التجريبي** (Demo Mode) لتشمل إشارات إضافية يقدر يجرّبها المستخدم بدون كاميرا.
2. إصلاح بطاقة **"الجملة بعد التصحيح اللغوي"** وبطاقة **الترجمة** (بما فيها الترجمة إلى العربية) اللي تظهر فاضية أو تفشل.
3. تحويل دوال الذكاء الاصطناعي للترجمة من Lovable AI Gateway المحظور إلى **Gemini API المباشر** باستخدام مفتاح Gemini الذي زوّد المستخدم به.

---

## التغييرات

### 1) إضافة سرّ `GEMINI_API_KEY`
- استدعاء `secrets--add_secret` لطلب من المستخدم إدخال مفتاح Gemini الذي زوّدنا به (`AIzaSy…`) بشكل آمن، بدل تخزينه في الكود.
- ملاحظة: الذاكرة تحظر `LOVABLE_API_KEY` / `gateway.lovable.dev` — التحويل إلى Gemini المباشر متوافق مع هذا القيد.

### 2) إعادة كتابة `supabase/functions/damij-sign-translate/index.ts`
- إزالة `geminiFetch` و `shim-key`.
- استدعاء Gemini مباشرة:
  - text endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}` لوضعَي `correct` و `translate`.
  - JSON endpoint: `gemini-2.5-pro` لوضع `text2sign` مع `responseMimeType: "application/json"`.
- نفس الـ prompts الحالية (لأنها مظبوطة)، نفس شكل الاستجابة `{ result }` حتى لا تتأثر الواجهة.
- معالجة أخطاء واضحة: 429 → "حد الطلبات"، 400/403 → رسالة مفهومة، خلاف ذلك → 500 مع log.

### 3) إعادة كتابة `supabase/functions/damij-youtube-sign/index.ts`
- نفس الاستبدال: استدعاء Gemini المباشر بدل `geminiFetch("ai-shim", …)` في الموضعَين (السطر 166 و 215).
- الإبقاء على نفس بنية الـ payload وعقد الاستجابة.

### 4) توسيع الوضع التجريبي
- الوضع التجريبي حالياً يعرض كل مفاتيح `liveVocab` (~20 إيماءة). نقوم بـ:
  - تحسين الترتيب: تجميع حسب الفئة (تحيات / أرقام / مشاعر / اتجاهات / حروف).
  - إضافة بطاقة لكل **إدخال من قاموس ArSL** المرتبط بنظام الإشارة المحدد عبر `searchSigns(... 60)` لإثراء الكلمات المتاحة للنقر، مع عرضها في شبكة قابلة للبحث.
  - حقل بحث صغير + شارة "إيماءة كاميرا" مقابل "كلمة من القاموس" حتى يتضح الفرق.
- في `YouTubeSignTranslator` نضيف وضع تجريبي مماثل لمعرض الإشارات (نفس النمط المختصر).

### 5) إصلاح بطاقة "بعد التصحيح" + "الترجمة إلى العربية"
- السبب الفعلي للظهور الفارغ هو فشل استدعاء `damij-sign-translate` بسبب Lovable AI Gateway. بعد التحويل لـ Gemini المباشر سيعمل.
- إضافات صغيرة في `SignTranslatorPro.tsx`:
  - عرض رسالة الخطأ الفعلية تحت البطاقتين عند الفشل (بدل البقاء فاضية).
  - في حالة `targetLang.code === sourceLang.code === 'ar'` نتأكد أن `setTranslatedText(corrected)` يُستدعى دائماً.
  - زر "إعادة المحاولة" صغير بجانب علامة التحميل عند وجود خطأ.
  - تحديث النص السفلي من "Lovable AI Gateway · Gemini" إلى "Gemini AI".

### 6) فحوصات
- نشر الدالتين عبر `supabase--deploy_edge_functions`.
- اختبار بسيط عبر `curl_edge_functions` لوضع `correct` و `translate` للتأكد من رجوع نص.

---

## ملفات ستتغير

```
supabase/functions/damij-sign-translate/index.ts        (إعادة كتابة)
supabase/functions/damij-youtube-sign/index.ts          (استبدال نقاط geminiFetch)
src/features/sign-language/SignTranslatorPro.tsx        (توسيع Demo + رسائل خطأ)
src/pages/damij/sign/YouTubeSignTranslator.tsx          (توسيع Demo)
```

سرّ جديد: `GEMINI_API_KEY`.

---

هل تريدني أبدأ التنفيذ؟
