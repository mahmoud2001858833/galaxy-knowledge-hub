## تحسين شامل لمنصة دامج

### تنبيه أمني مهم
شاركت مفتاح Gemini API في الشات (`AIzaSy...QIQI`) — أصبح مكشوفاً وعليك **إلغاؤه فوراً** من Google AI Studio. لن أحفظه في الكود. عندنا بدائل آمنة جاهزة في Secrets:
- `GEMINI_API_KEY` و `GEMINI_API_KEY_NEW` و `LOVABLE_API_KEY` (Lovable AI Gateway)

سأستخدم هذه فقط، عبر Edge Functions.

---

### 1) شعار دامج 3D + شرح
- إنشاء شعار 3D باستخدام `@react-three/fiber` + `@react-three/drei`: كرة/أيقونة دامج متعددة الطبقات بألوان `--damij-primary`/`--damij-accent` تدور ببطء، مع تأثير Glow وParallax عند تحريك الفأرة.
- بجانب الشعار: عنوان "دامج" + شرح مختصر متحرك (Framer Motion typing effect) + 4 chips للقيم الأساسية.
- مكوّن جديد: `src/components/damij/DamijHero3D.tsx` يحلّ محل القسم العلوي في `DamijLanding.tsx`.

### 2) قائمة التنقل السريعة المُحسَّنة
- إعادة بناء `DamijFloatingNav.tsx`:
  - Glassmorphism متقدم + حدود متدرّجة + Active indicator يتحرك بـ`layoutId` (Framer Motion).
  - Tooltips بالعربي/الإنجليزي عند Hover، مؤشرات نشطة بـ Glow ملوّن لكل قسم.
  - زر اختصارات (Cmd+K) لفتح Command Palette سريع للقفز بين الأقسام.
  - تكيّف للموبايل بشكل أنظف (Bottom dock).

### 3) نظام ترجمة 15 لغة (شامل المنصة بالكامل)
- إنشاء سياق ترجمة جديد للدامج: `src/features/damij/i18n/`
  - `DamijLanguageContext.tsx` — Provider مع localStorage و RTL/LTR auto.
  - ملفات لكل لغة: `ar, en, fr, es, de, tr, ur, hi, fa, he, ru, zh, ja, ko, pt` (15 لغة).
  - مفاتيح مُهيكلة: `nav.*`, `hero.*`, `sign.*`, `sensory.*`, `autism.*`, `adhd.*`, `braille.*`, `clinical.*`, `assistant.*`, `loader.*`.
- مبدّل لغة في الـ Navbar مع علم + اسم اللغة + بحث.
- اللغتان الأساسيتان (عربي/إنجليزي) مكتوبتان يدوياً بدقة. الـ13 الباقية تُولَّد عبر Edge Function `damij-translate-bundle` مرّة واحدة (يخزّنها في الكود)، فلا تكلفة تشغيل لاحقة.
- ربط جميع صفحات `/damij/*` بالنصوص المترجمة (استبدال السلاسل العربية الثابتة بـ `t('key')`).

### 4) المرشد الذكي العائم في الزاوية
- مكوّن جديد: `src/components/damij/DamijSmartGuide.tsx`
  - **الشكل البصري**: كرة طاقة 3D زجاجية متوهجة (Three.js)، تتنفّس بأنيميشن، تتوسّع وتُصدر موجات عند التحدّث، Particles محيطة بـ Framer Motion.
  - **التفاعل**: نقرة → تفتح بطاقة شات أنيقة بنفس هوية دامج، إدخال نصي + ميكروفون (Web Speech API).
  - **الذكاء**: Edge Function `damij-guide-chat` تستخدم `LOVABLE_API_KEY` مع Gemini، بـ System Prompt يحوي **خريطة كاملة** لجميع أقسام دامج (المسارات، الميزات، شروحاتها).
  - **التنقّل التلقائي**: المرشد يردّ بـ JSON يحوي اقتراح وجهة (مثل `{ navigate: '/damij/sign' }`) فيتم التنقل تلقائياً عند موافقة المستخدم.
  - يعرف اللغة الحالية ويردّ بها.

### 5) أنيميشن تحميل محسّن
- مكوّن `DamijLoader.tsx`: حلقة دامج تدور باستمرار + شعار صغير في المنتصف ينبض + جسيمات مدارية. CSS-only للسرعة.
- استبدال جميع شاشات التحميل في `/damij/*` به.

### 6) تحسينات تجربة عامة
- خلفية `DamijLayout` مع تدرّجات Mesh متحركة خفيفة.
- Page transitions بين أقسام دامج (Framer Motion AnimatePresence).
- Skeleton loaders بدل الفراغ.
- Focus states واضحة للوصولية + ARIA.
- Footer دامج محدّث بالنص الرسمي للمدرسة (موجود).

### الملفات الجديدة/المعدّلة الرئيسية
```
new   src/components/damij/DamijHero3D.tsx
new   src/components/damij/DamijSmartGuide.tsx
new   src/components/damij/DamijLoader.tsx
new   src/components/damij/DamijLanguageSwitcher.tsx
new   src/features/damij/i18n/DamijLanguageContext.tsx
new   src/features/damij/i18n/translations/{ar,en,fr,es,de,tr,ur,hi,fa,he,ru,zh,ja,ko,pt}.ts
new   supabase/functions/damij-guide-chat/index.ts
new   supabase/functions/damij-translate-bundle/index.ts
edit  src/components/damij/DamijFloatingNav.tsx
edit  src/pages/damij/DamijLayout.tsx        (إضافة Provider + المرشد + Loader)
edit  src/pages/damij/DamijLanding.tsx       (دمج Hero3D + استخدام t())
edit  جميع صفحات /damij/*Home.tsx            (استخدام t() للنصوص الرئيسية)
```

### الحزم المضافة
- `@react-three/fiber@^8.18` و `three@^0.160` و `@react-three/drei@^9.122` (مع الالتزام بـ React 18).

### ملاحظة على نطاق العمل
هذا نطاق كبير. سأنفّذه على ضربتين متتاليتين دون توقّف:
1. الشعار 3D + النافبار + الـ Loader + المرشد الذكي + بنية الترجمة (ar/en كاملاً، باقي اللغات تُولَّد).
2. نشر دفعة الـ13 لغة المتبقية + ربط النصوص في كل صفحات `/damij/*`.
