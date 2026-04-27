## المشكلة

يوجد بانيان للمنصات في المشروع وكلاهما يعاني من نفس الأعراض (شاشة سوداء/فارغة):

1. **`TechCodingPlatform > PlatformBuilder`** (المستخدم في GJU) — يستدعي `tech-ai-platform-builder` ويعرض HTML واحد في `<iframe srcDoc>`.
2. **`AIPlatformBuilderPro`** — يولّد ٢٠+ ملف ويعرضها عبر `LivePreview`.

### الأسباب الجذرية

- **Builder (A)**: الـ iframe يستخدم `srcDoc` بدون أي fallback CSS، إذا أنتج النموذج HTML بدون `background` صريح للـ body فالخلفية تُورث من والدها الأسود ⇒ شاشة سوداء حتى لو كان المحتوى موجوداً. كذلك `document.write` في تبويب جديد يفشل أحياناً (cross-origin / popup blocker / تفريغ الـ document بعد الكتابة).
- **Builder (B)**: داخل `srcDoc` لا يوجد URL أساسي، فـ `fetch('pages/home.html')` في `pageHome` يفشل دائماً ⇒ يُعرض fallback صغير جداً يبدو وكأن الصفحة فارغة. الأسوأ أن الـ hero الفاخر المُولّد بالـ AI (`brand.hero`) موجود في `window.__PROJECT_PAGES__['home']` لكن لا أحد يقرأه.
- مشكلة عامة: لا يوجد آلية كشف "لم يُرسم شيء بعد X مللي ثانية" لعرض رسالة خطأ واضحة بدلاً من شاشة سوداء.

## الحل

### ١. إصلاح PlatformBuilder في `TechCodingPlatform.tsx`
- لفّ كل HTML مُستلم بـ `wrapWithSafeShell()` تضمن:
  - وجود `<!doctype html>` و`<head>` و`<meta viewport>`.
  - حقن CSS أساسي: `html,body{background:#fff;color:#0f172a;margin:0;font-family:system-ui,'Cairo',sans-serif;min-height:100%}` قبل أي ستايل من النموذج.
  - حقن interceptor للأخطاء يرسل `postMessage` للأب لعرض رسالة بدل الشاشة السوداء.
- استبدال "فتح في تبويب جديد" بطريقة آمنة: إنشاء `Blob` من HTML المُغلَّف ثم `window.open(URL.createObjectURL(blob))` (بدلاً من `document.write`).
- إضافة شريط متصفح أنيق حول الـ iframe (مثل `LivePreview`): أزرار تحكم ملوّنة + شريط عنوان وهمي + ظلال احترافية + تدرّج خلفي حول الإطار.
- إضافة "watchdog": إذا لم يصل أي `console.log` أو لم يُحقن DOM داخل الـ iframe خلال ٣ ثوانٍ بعد التحميل، نعرض شارة "لم تُحمّل المعاينة — اضغط لإعادة المحاولة".

### ٢. إصلاح `pageHome` المُولَّد في `supabase/functions/platform-stage-files/index.ts`
- في `appJs`، استبدال:
  ```js
  try { const r = await fetch('pages/home.html'); if (r.ok) hero = await r.text(); } catch {}
  ```
  بـ:
  ```js
  hero = (window.__PROJECT_PAGES__ && window.__PROJECT_PAGES__['home']) || '';
  ```
  بحيث يُحمّل الـ hero الفاخر فوراً من الـ object العام (يعمل في srcDoc وفي blob URL وفي تبويب جديد).
- نفس الإصلاح لأي `fetch('pages/...')` آخر في الراوتر/الصفحات (تعديل `routerJs` ليستخدم `window.__PROJECT_PAGES__` كأولوية).
- ضمان أن `<body>` يحمل خلفية افتراضية حتى قبل تحميل الـ CSS: تعديل `indexHtml` ليتضمّن `<style>html,body{background:#0f0f23;color:#fff;margin:0;min-height:100vh}</style>` في الـ head.

### ٣. تحسين `LivePreview.tsx`
- إضافة watchdog بعد ٢٫٥ ثانية: إن لم يصل أي log من iframe ولم يتم رسم شيء، نظهر زر "إعادة المحاولة + فتح في تبويب جديد" مع رسالة واضحة.
- التأكد من أن fallback الخلفية البيضاء يُحقن دائماً (وليس فقط إذا لم تُذكر `background` في أول 2KB).
- استخدام `Blob URL` لـ "فتح في تبويب جديد" كحل أساسي بدلاً من `document.write` (أكثر استقراراً).

### ٤. تحسين `tech-ai-platform-builder` (اختياري لكن موصى به)
- إضافة fallback في حال فشل استخراج كود HTML من رد النموذج: إن لم يحتوِ على `<html` نلفّه تلقائياً بقالب جاهز يحتوي على Tailwind + خلفية بيضاء + Cairo + رسالة الـ AI كنص.

## الملفات المُعدَّلة

```text
src/pages/TechCodingPlatform.tsx              (PlatformBuilder: shell + watchdog + شريط متصفح)
src/components/platform-builder/LivePreview.tsx   (watchdog + Blob URL للتبويب الجديد + خلفية أصلب)
supabase/functions/platform-stage-files/index.ts  (pageHome من window.__PROJECT_PAGES__ + خلفية افتراضية)
supabase/functions/tech-ai-platform-builder/index.ts (fallback wrapping إذا لم يكن HTML كاملاً)
```

## النتيجة المتوقعة

- ستظهر المعاينة بخلفية بيضاء/داكنة حسب التصميم المُولَّد، لا شاشة سوداء أبداً.
- الـ Hero الفاخر المُولَّد بالـ AI سيظهر فوراً في الصفحة الرئيسية للبناء متعدد الملفات.
- "فتح في تبويب جديد" سيعرض المنصة كاملة دون شاشة بيضاء/سوداء.
- في حال أي خطأ سيظهر إشعار واضح + زر إعادة محاولة بدلاً من فراغ صامت.
- إطار معاينة احترافي بشريط متصفح مصغّر وظلال ملوّنة في كلا البانيين.
