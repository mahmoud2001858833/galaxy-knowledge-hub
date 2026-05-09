## خطة التحسين الشامل لمنصة دامج

### 1) شعار رسمي مرتبط بهوية المنصة
- إنشاء `DamijBrandLogo.tsx` جديد: شعار SVG رسمي يجمع رمزَين دالّين على «الدمج»:
  - دائرتان متشابكتان (تمثيل الدمج/التكامل) تحوي إحداهما يداً مبسّطة (لغة الإشارة) والأخرى ست نقاط بريل.
  - حلقة خارجية رفيعة بلون رسمي (Navy + Teal) ترمز للشمولية.
- استبدال `DamijLogo3D` التجريبي في الواجهة الرئيسية بهذا الشعار الرسمي + نسخة 3D مهذّبة (دوران بطيء، بدون أشكال غريبة).
- توحيد استخدامه في: الـHero، شريط التنقل، الفوتر، favicon (`public/`).

### 2) لوحة ألوان رسمية ومحترفة
تحديث `--damij-*` في `src/index.css`:
```text
--damij-primary:    220 60% 22%   (Deep Navy)
--damij-primary-2:  186 70% 38%   (Teal)
--damij-accent:     38  85% 55%   (Refined Gold)
--damij-bg:         210 30% 98%
--damij-bg-2:       210 25% 95%
--damij-text:       220 30% 15%
--damij-muted:      215 15% 45%
```
- إزالة التدرّجات الزائدة، اعتماد ظلال خفيفة، حدود hairline، خطوط Tajawal/Inter بأوزان أرسم.
- إعادة تنسيق `SystemCard`، `DamijHero3D`، `DamijFloatingNav` بمظهر مؤسسي (زوايا 16px، borders، ظلال smooth).

### 3) ترجمة فعلية لكل أجزاء المنصة (15 لغة)
المشكلة الحالية: القاموس يغطي صفحة الهبوط فقط. الحل:
- توسيع `DamijDict` في `i18n/types.ts` ليشمل مفاتيح لكل قسم: `sign.*`, `sensory.*`, `autism.*`, `adhd.*`, `braille.*`, `clinical.*`, `common.*` (أزرار، حالات، رسائل، tooltips، نماذج).
- إنشاء قاموسَين كاملَين ar + en يدوياً لكل المفاتيح.
- توليد القواميس الـ13 المتبقية مرة واحدة عبر Edge Function `damij-translate-bundle` (Lovable AI / Gemini) ثم حفظ النتائج كـ TS ثابتة (لا تكلفة وقت تشغيل).
- استبدال السلاسل الثابتة (Hardcoded) في كل صفحات `/damij/*` (SignHome, SensoryHome, AutismHome, ADHDHome, BrailleHome, ClinicalHome, SignTranslator, Sources, …) باستدعاءات `t.*`.
- إضافة `<html lang dir>` تلقائياً (موجود) + Hook `useDocumentTitle(t.x.title)` لكل صفحة لتغيير العنوان.

### 4) أصوات TTS متعدّدة اللغات
- إنشاء Hook موحّد `useDamijSpeech.ts` يستخدم Web Speech API مع اختيار صوت يطابق `lang` الحالي من `DamijLanguageContext` (`speechSynthesis.getVoices().find(v => v.lang.startsWith(lang))`).
- استبدال كل `new SpeechSynthesisUtterance(...)` و`useTextToSpeech` المستخدمة في:
  - `SignTranslator.tsx` (نطق الترجمة)
  - وحدات `clinical/devices/*` و`InterventionTryPanel`
  - أي مكان آخر داخل `/damij/*`
- خيار اختياري: تمرير `lang` إلى ElevenLabs عند توفّره، مع fallback Web Speech.

### 5) «حافظ الكربون» (Carbon Saver) – نسخة على غرار جائزة زايد للاستدامة
صفحة جديدة `/damij/carbon` بتصميم مؤسسي (هيدر هادئ، إحصاءات Hero، ألوان أخضر/Navy):
- حاسبة بصمة كربون تفاعلية (نقل، طاقة، استهلاك، نفايات، تعليم رقمي بدلاً من ورقي).
- لوحة «أثرك التعليمي» مع KPIs ودوائر تقدم.
- شارات إنجاز + مقارنة مع متوسط المدرسة.
- اقتراحات ذكية لتقليل البصمة (Edge Function `damij-carbon-advisor`).
- جداول وأرسوم Recharts (شريطية + خطية).
- زر تنزيل PDF رسمي للتقرير.
- مدخل من الواجهة الرئيسية (بطاقة سابعة) ومن شريط التنقل.

### 6) تحسينات تجربة عامة
- ميكرو-انيميشن أهدأ (بدون أشكال 3D صاخبة).
- Skeleton loaders لكل صفحة.
- تحسين `DamijFloatingNav`: تسميات مترجمة، تباين أعلى، نسخة موبايل سفلية، اختصار `Cmd+K`.
- ضبط `DamijSmartGuide` ليستخدم اللغة النشطة في الردود وفي التعرّف على الصوت.
- فوتر رسمي متعدّد الأعمدة + سطر العزو الإلزامي.

### تفاصيل تقنية
- ملفات جديدة: `DamijBrandLogo.tsx`, `useDamijSpeech.ts`, `pages/damij/carbon/CarbonSaverHome.tsx`, `pages/damij/carbon/CarbonReport.tsx`, Edge Functions `damij-translate-bundle`, `damij-carbon-advisor`.
- ملفات معدّلة: `index.css` (tokens), كل صفحات `/damij/*` لاستخدام `t.*`, `DamijFloatingNav.tsx`, `DamijHero3D.tsx`, `DamijLanding.tsx`, `App.tsx` (route جديد).
- لا تغييرات على schema قاعدة البيانات.
- مفاتيح موجودة مسبقاً (LOVABLE_API_KEY, ELEVENLABS_API_KEY) — لا حاجة لمفاتيح جديدة.

### تنفيذ على مرحلتين
- **المرحلة 1**: الشعار الرسمي + الألوان + توسيع القاموس ar/en + ربطه بكل الصفحات + Hook الصوت متعدّد اللغات.
- **المرحلة 2**: توليد 13 لغة دفعة واحدة + بناء قسم «حافظ الكربون» الكامل + لمسات UX النهائية.
