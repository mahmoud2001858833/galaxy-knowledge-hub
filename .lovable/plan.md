# تطوير ضخم لباني المنصات + إصلاح خطأ كلمة المرور

## 1) إصلاح خطأ "الحقل password_hash مطلوب"

**السبب الجذري**: مولّد الـ schema يُسمّي حقل المستخدم `password_hash`، لكن `Auth.register` في `assets/js/auth.js` يُدخل الحقل باسم `password`. فيفشل التحقق `validate()` ويظهر التوست الأحمر.

**الحل**: في `platform-stage-files/index.ts` سأقوم بـ:
- توحيد أسماء حقول users قبل التوليد (normalization): يُعاد تسمية أي حقل من `password` / `password_hash` / `pwd` إلى **`password`** قياسياً، وحذف التكرار.
- ضمان وجود `email` و `name` و `role` و `created_at` كحقول قياسية.
- تحديث `Auth.register/login` لاستخدام نفس الأسماء الموحّدة.
- التحقق من أن `validate()` لا يُلزم حقولاً مخفية (`hidden:true`) من جهة المستخدم.

نتيجة: التسجيل يعمل من أول مرة في كل منصة مولَّدة.

## 2) تطوير ضخم للمولّد (×3 ملفات وميزات)

**الهدف**: بدل 14 ملفاً، نُولّد **30+ ملفاً** بمشروع شبه إنتاجي.

### ملفات جديدة تُضاف لكل مشروع:

```text
index.html
404.html                       ← صفحة جديدة
assets/
  css/
    theme.css                  ← مُحسَّن بـ design tokens كاملة
    main.css
    components.css
    animations.css             ← جديد: keyframes + transitions
    responsive.css             ← جديد: breakpoints احترافية
  js/
    utils.js
    toast.js                   ← مُحسَّن (أنواع، مدة قابلة للتخصيص)
    db.js                      ← مُحسَّن (search, pagination, joins)
    seed.js                    ← seed واقعي عربي (5-10 صفوف لكل جدول)
    auth.js                    ← Fix password + reset password + sessions
    ai.js                      ← مع context-aware system prompt
    router.js                  ← مع transitions وحماية routes
    app.js                     ← shell + theme toggle + lang toggle
    notifications.js           ← جديد: نظام إشعارات
    search.js                  ← جديد: بحث عام عبر كل الجداول
    upload.js                  ← جديد: رفع صور (base64 → localStorage)
    export.js                  ← جديد: تصدير/استيراد JSON
    i18n.js                    ← جديد: عربي/إنجليزي
    modules/<table>.js         ← ملف لكل جدول
  components/
    navbar.js                  ← جديد: مكوّن
    sidebar.js                 ← جديد: مكوّن
    modal.js                   ← جديد: مكوّن
    floating-ai.js             ← جديد: زر AI عائم في كل الصفحات
pages/
  home.html, login.html, signup.html, profile.html
  settings.html, ai-chat.html, about.html, contact.html
  faq.html, search.html
  <table>.html × N
README.md
```

النتيجة: **30–40 ملفاً منظماً** لكل مشروع.

### تحسينات DB engine:
- `search(table, query)` بحث نصّي.
- `paginate(table, page, perPage)`.
- `join(tableA, tableB, fk)` بسيط للعرض.
- `subscribe(table, callback)` لتحديث UI تلقائياً عند تغيّر البيانات.
- صادرة/مُستوردة JSON كاملة.

### تحسينات Auth:
- إصلاح كلمة المرور (مذكور أعلاه).
- "تذكرني" + Session expiry قابل للتخصيص.
- تعديل البروفايل وتغيير كلمة المرور من صفحة Profile.
- صورة بروفايل (base64 رفع محلي).

### Floating AI (في كل صفحة):
- زر دائري في الزاوية اليسرى السفلى.
- يفتح Drawer بمحادثة.
- يرسل سياق المنصة (الجداول + إحصائيات + المستخدم الحالي) للـ AI.

## 3) تطوير ضخم للمعاينة الحية

المعاينة الحالية تعمل عبر iframe بـ `srcDoc`. المشاكل:
- بطيء عند الملفات الكبيرة.
- لا يوجد device toolbar (mobile/tablet/desktop).
- لا يوجد تحكم بإعادة التحميل / فتح في تبويب / Console مدمج.
- Inlining كل الكود يُفقد القدرة على debug ملف بعينه.

**التحسينات**:
- **Device Toolbar**: أزرار 📱 📟 💻 لتغيير عرض المعاينة (375 / 768 / 100%).
- **زر Reload** للمعاينة دون إعادة بناء.
- **Console مدمج**: نلتقط `console.log/error` من iframe عبر `postMessage` ونعرضها في لوحة سفلية.
- **Loading skeleton** أثناء تحميل المعاينة.
- **Open in new tab** يُنشئ Blob URL محسَّن.
- **Fullscreen mode** للمعاينة (يأخذ كل الشاشة).
- **Status bar**: حجم HTML النهائي + عدد الملفات + زمن البناء.
- شارة "محدّث" خضراء عند انتهاء build جديد.

### تحسين معاينة الكود (FilesExplorer):
- **Syntax highlighting حقيقي** عبر `highlight.js` (لا فقط نص أبيض).
- **Line numbers** في جانب الكود.
- **زر "نسخ السطر"** عند المرور.
- **Breadcrumbs** للمسار الكامل.
- **حجم الملف** بالـ KB مع حساب gzip تقديري.

## 4) التفاصيل التقنية

### ملفات معدَّلة:
- `supabase/functions/platform-stage-files/index.ts` — توحيد users schema، إضافة 15+ ملفاً جديداً، Floating AI، notifications/search/i18n/upload modules، إصلاح Auth.
- `supabase/functions/platform-stage-schema/index.ts` — توحيد اسم الحقل إلى `password`، إضافة جداول قياسية (notifications, settings) إن لم تكن موجودة.
- `src/pages/AIPlatformBuilderPro.tsx` — Device toolbar، Console panel، Reload، Fullscreen، Status bar.
- `src/components/platform-builder/FilesExplorer.tsx` — Syntax highlighting (highlight.js)، line numbers، breadcrumbs.

### تبعيات جديدة:
- `highlight.js` — للـ syntax highlighting في معاينة الكود.

### لا تغييرات DB:
نستخدم `localStorage` فقط داخل المنصات المولَّدة، ولا حاجة لجداول Supabase جديدة.

## 5) ما سيراه المستخدم

1. يكتب الوصف ويضغط "ابدأ البناء".
2. خلال 30–60 ثانية يحصل على **30+ ملف** منظم في شجرة احترافية.
3. **معاينة حية** بـ device toolbar وconsole مدمج وreload.
4. **معاينة كود** بـ syntax highlighting وأرقام أسطر.
5. **التسجيل وتسجيل الدخول يعملان من أول محاولة** (إصلاح password).
6. زر AI عائم في كل صفحة من المنصة المولَّدة.
7. تحميل ZIP يحتوي بنية مشروع جاهزة للنشر فوراً.
