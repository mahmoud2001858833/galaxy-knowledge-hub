## المشاكل الحالية

1. **مترجم الإشارات (إشارة → نص):** جدول الإشارات `gestureToArabic` مُعرَّف بالعربية فقط، لذلك حتى لو اخترت "الإشارة الأمريكية + English" فإن الإشارات تتحول أولاً إلى كلمات عربية ("مرحبا، أحبك...") ثم يُسأل الذكاء الاصطناعي ترجمتها إلى الإنجليزية. النتيجة: ترجمة من العربية إلى الإنجليزية بدلاً من قراءة الإشارة الأمريكية بالإنجليزية مباشرة.

2. **نص → إشارة:** كل الإشارات تظهر دفعة واحدة في شريط أفقي، وزر "تشغيل التتابع" فقط يبرز كل بطاقة بدورها. لا يوجد عرض سينمائي يعرض إشارة واحدة كبيرة في كل مرة.

---

## الخطة

### 1) مفردات الإشارات حسب نظام الإشارة (إصلاح الترجمة العكسية)

- **ملف جديد `src/features/sign-language/gestureVocab.ts`**
  - يصدّر `GESTURE_VOCABULARY: Record<SignSystemCode, Record<GestureId, { text; emoji; description }>>`.
  - إدخالات أصلية لـ: `ArSL` (عربي)، `ASL` (إنجليزي US)، `BSL` (إنجليزي UK)، `LSF` (فرنسي)، `DGS` (ألماني)، `LSE` (إسباني)، `LIS` (إيطالي)، `JSL` (ياباني)، `KSL` (كوري)، `CSL` (صيني)، `ISL` (هندي)، `PSL` (أردو)، `TSL` (تركي)، `RSL` (روسي)، `Auslan`، `NZSL`، `Libras` (برتغالي)، `LSM` (إسباني مكسيكي)، `IS` (دولي/إنجليزي).
  - دالة `getGestureWord(signSystem, gestureId)` مع fallback ذكي إلى ASL ثم ArSL إن لم توجد ترجمة.

- **`src/features/sign-language/SignTranslatorPro.tsx`**
  - استبدال كل استخدامات `gestureToArabic[...]` بـ `getGestureWord(signSystem, gesture)`.
  - دالة `handleGestureDetected` تستخدم النص بلغة نظام الإشارة المختار.
  - الوضع التجريبي (Demo) يعرض المفردات بلغة النظام المختار حالياً.
  - تمرير `sourceLang`/`sourceLangName` (مساوية للنظام) إلى edge function في خطوتي `correct` و`translate`.
  - تبسيط: إن كانت لغة المصدر = لغة الهدف (وهو الوضع الافتراضي لأن النظام مقفل)، يُعرض "الترجمة" بنفس النص المصحَّح فوراً بدون استدعاء الـAI ثانية. إن غيّر المستخدم لاحقاً اللغة، يُعاد استدعاء `translate`.

- **`supabase/functions/damij-sign-translate/index.ts`**
  - **mode `correct`**: يقبل الآن `lang` و`langName`. التعليمات تتحول من "أنت مدقّق عربي" إلى "صحّح النص في اللغة `${langName}` فقط، أعد فقط الجملة المصحَّحة بدون شرح."
  - **mode `translate`**: يقبل `sourceLang`/`sourceLangName` بدلاً من افتراض العربية. إن تطابقت اللغتان يردّ النص كما هو.
  - إبقاء mode `text2sign` كما هو (يعمل بشكل جيد بـ `gemini-2.5-pro`).

### 2) عرض الإشارات سينمائياً (نص → إشارة)

- **ملف جديد `src/features/sign-language/SignSequencePlayer.tsx`**
  - مشغّل ملء-اللوحة (لا fullscreen متصفح، فقط لوحة كبيرة منمّقة داخل التبويب) يظهر فقط أثناء التشغيل.
  - يعرض إشارة واحدة كبيرة في المنتصف باستخدام `<HandSignCard>` بحجم كبير (≈260–320px) مع:
    - دخول من اليمين/اليسار باستخدام `framer-motion` (slide + fade + scale)
    - الكلمة بخط ضخم تحت اليد + الوصف بخط متوسط
    - شريط تقدم (Progress bar) + رقم/إجمالي
    - أزرار: إيقاف، السابق، التالي، تكرار
    - تحكم السرعة (slow/normal/fast) + خيار "تكرار تلقائي" + زر صوت
  - يستدعي `speakText(word, lang)` تلقائياً مع كل تغيير.
  - عند الانتهاء: زر "إعادة" يُظهر اللوحة الكاملة مرة أخرى.

- **`SignTranslatorPro.tsx` (تبويب نص → إشارة)**
  - تحويل شريط البطاقات الحالي إلى **شبكة معاينة مرتّبة** (grid 4–6 أعمدة) صغيرة وأنيقة، بدون حركة، ثابتة.
  - زر "تشغيل التتابع" الجديد يفتح `SignSequencePlayer` (overlay داخل البطاقة) بدلاً من تحريك البطاقات.
  - حذف الانيميشنات المربكة من الشبكة (ثبات تام، فقط اختيار الكلمة عند الضغط).
  - إبقاء قسم "تفاصيل كل كلمة" أسفل الصفحة كما هو.

- **تحسين دقّة الترجمة (نص → اللغة المختارة)**
  - في الـ edge function للـ `text2sign`: تشديد الـsystem prompt بإضافة:
    - "STRICT: translated_text MUST be in `${lang}` only. If the input is in another language, translate first then perform the gloss step."
    - "Verify each gloss word matches the meaning of the original input; if uncertain, set known=false."
  - رفع `temperature: 0.1` وإبقاء `gemini-2.5-pro`.

### 3) جودة وتجربة عامة

- زر "تغيير اللغة" يبقى كما هو، لكن شاشة التأكيد تُظهر مثالاً واقعياً للمفردات بلغة النظام المختار (preview chips من `GESTURE_VOCABULARY`) قبل الدخول.
- توست واضح عند بدء/انتهاء التشغيل السينمائي.

---

## ملاحظات تقنية (للقارئ التقني)

- لا تغييرات في قاعدة البيانات أو الأذونات.
- التغييرات محصورة في:
  - `src/features/sign-language/gestureVocab.ts` (جديد)
  - `src/features/sign-language/SignSequencePlayer.tsx` (جديد)
  - `src/features/sign-language/SignTranslatorPro.tsx` (تعديل)
  - `supabase/functions/damij-sign-translate/index.ts` (تعديل buildPrompt + قبول وسطاء جديدة)
- `framer-motion` و`lucide-react` مستخدمَان بالفعل، لا حاجة لتبعيات جديدة.
