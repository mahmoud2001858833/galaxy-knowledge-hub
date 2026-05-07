## المشكلة
دالة `fetchUrlText` في `supabase/functions/braille-convert/index.ts` تعتمد على `fetch` مباشر بـ User-Agent مخصص "DamijBrailleBot"، وكثير من المواقع:
- ترفض الطلب (403/406/429) لأن الـ User-Agent غير متصفح حقيقي.
- ترجع صفحة JS فارغة (SPA) فلا يوجد نص قابل للاستخراج.
- تستخدم `<body>` بدون `<article>/<main>` فالاستخراج يلتقط قوائم/أزرار بلا محتوى.
- روابط بـ HTTPS تطلب headers إضافية (Accept-Language, sec-fetch).

## الحل

### 1) تحسين `fetchUrlText` في `supabase/functions/braille-convert/index.ts`
- استخدام User-Agent متصفح حقيقي (Chrome على ماك) + `Accept-Language`, `Accept-Encoding: identity`, `Cache-Control`.
- إعطاء مهلة (AbortController, 15s).
- التعامل مع `Content-Type` غير HTML: إذا كان `text/plain` أرجعه كما هو، وإذا كان `application/pdf` أو غير نصي ارفض برسالة واضحة.
- تحسين الاستخراج (Readability خفيف):
  - إزالة `<header>`, `<footer>`, `<nav>`, `<aside>`, `<form>`, `<svg>`, `<iframe>`, التعليقات.
  - تفضيل `<article>` ثم `<main>` ثم أكبر `<div>` يحتوي أكبر تجميع نصوص (>500 حرف) ثم `<body>`.
  - فك المزيد من HTML entities (`&#x...;`, `&apos;`, `&copy;` ...).
  - الحفاظ على فواصل الأسطر بين `<p>`, `<br>`, `<li>`, `<h1-6>`.

### 2) Fallback إلى خدمة Readable Proxy عند الفشل/قلة النص
- إذا فشل الجلب المباشر (status != 2xx) أو كان النص الناتج < 200 حرف:
  - جرّب `https://r.jina.ai/https://...` (خدمة عامة تُرجع نص نظيف للصفحة بأي لغة).
  - مع نفس الـ headers ومهلة 20s.
- إذا فشل الاثنان: ارجع برسالة عربية واضحة: "تعذّر جلب صفحة الويب. قد يكون الموقع يحجب الجلب التلقائي أو يعتمد على JavaScript".

### 3) إرجاع رسائل خطأ واضحة للواجهة
- عند 403/401: "الموقع يرفض الجلب التلقائي".
- عند 404: "الصفحة غير موجودة".
- عند timeout: "انتهت مهلة الجلب".
- الواجهة (`UniversalBrailleConverter.tsx`) تعرضها كما هي عبر `toast.error` (تعمل أصلاً).

### 4) تحسين بسيط في الواجهة (اختياري بسيط)
- في `UniversalBrailleConverter.tsx` قَبول الروابط بدون `http(s)://` بإضافتها تلقائياً (`https://`) بدل رمي خطأ مباشر.

## الملفات المتأثرة
- `supabase/functions/braille-convert/index.ts` — استبدال `fetchUrlText` كاملةً + توسيع رسائل خطأ `fetch_url`.
- `src/pages/damij/braille/UniversalBrailleConverter.tsx` — تطبيع الـ URL قبل الإرسال.

لا تغييرات على قواعد البيانات أو أي ملفات أخرى.