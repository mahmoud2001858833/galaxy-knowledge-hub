# خطة تحسين متجر لغة الإشارة الذكي

## 1) حذف الميزات غير المرغوبة
- حذف صفحة **قاموس الإشارة العالمي**: `src/pages/damij/sign/SignDictionary.tsx`.
- حذف صفحة **تعلّم لغة الإشارة**: `src/pages/damij/sign/SignLearn.tsx` و `src/features/sign-language/LearnSignsTab.tsx` و `HandSignCard.tsx` و `WordDetailSheet.tsx` (مستخدمة فقط ضمن القاموس/التعلّم).
- إزالة المسارات المرتبطة من `src/App.tsx` (`/damij/sign/dictionary`, `/damij/sign/learn`).
- تبسيط `SignHome.tsx` ليعرض بطاقة واحدة فقط: **المترجم الفوري**، وتحديث العنوان والوصف ليعكسا التركيز على الترجمة الثنائية الاتجاه.

## 2) إعادة هيكلة المترجم الفوري `SignTranslatorPro.tsx`

### أ. خطوة اختيار اللغة أولاً (Gate)
- عند فتح المترجم تظهر شاشة اختيار قبل أي شيء:
  - **نظام لغة الإشارة المصدر/الهدف** (ArSL, ASL, BSL, LSF, DGS, LSE, LIS, JSL, KSL, CSL, ISL, PSL, TSL, RSL, Auslan, NZSL, Libras, LSM, IS).
  - **اللغة المنطوقة/المكتوبة** (عربي، إنجليزي، فرنسي، ألماني، إسباني، إيطالي، ياباني، كوري، صيني، هندي، تركي، روسي، برتغالي…).
- لا يتم عرض تبويبَي «كاميرا → نص» و «نص → إشارة» إلا بعد التأكيد.
- زر «تغيير اللغة» يبقى ظاهراً في الأعلى لإعادة الاختيار.
- حفظ الاختيار في `localStorage` لتذكّره عند العودة.

### ب. كاميرا → نص (Sign → Text)
- عند الترجمة يتم تمرير `signSystem` و `spokenLang` للنموذج، فيتم تفسير الإشارات حسب رموز النظام المختار فقط (ArSL ≠ ASL ≠ BSL).
- عرض اسم النظام النشط أعلى الكاميرا للوضوح.

### ج. نص → إشارة (Text → Sign) — تحسين شامل
**واجهة وأدوات جديدة في `TextToSignTab.tsx`:**
- إدخال نص + إدخال صوتي (Speech-to-Text) باللغة المنطوقة المختارة.
- شريط أدوات: سرعة العرض (0.5x–2x)، تكرار، إيقاف/تشغيل، تنقّل كلمة-كلمة، عكس اتجاه اليد (يمنى/يسرى)، حجم الأفاتار، خلفية فاتحة/داكنة.
- زر تنزيل الترجمة كـ GIF/فيديو قصير، وزر مشاركة.
- محرّر تتابع: يعرض الكلمات كبطاقات مرتّبة، يمكن سحبها لإعادة الترتيب أو حذف كلمة.
- مكتبة مفضلات لحفظ الجمل المتكرّرة.

**محرّك ترجمة موسّع (`signGlyphs.ts` جديد):**
- قاموس داخلي لكل نظام إشارة يربط الكلمة/الحرف بـ glyph (صورة SVG/إيموجي يدّ + وصف حركة).
- تغطية كاملة:
  - الأبجدية والأرقام لكل نظام.
  - +500 كلمة شائعة لكل لغة منطوقة (تحيّات، عائلة، طعام، مدرسة، طوارئ، مشاعر، أفعال، ضمائر، أيام/أشهر، ألوان، وسائل نقل، أرقام كبيرة…).
  - علامات ترقيم وتعابير وجه (سؤال/تعجّب/نفي).
- خوارزمية fallback: إن لم تتوفّر إشارة لكلمة → تهجئة بالأبجدية اليدوية للنظام المختار (Fingerspelling) بدلاً من تجاهلها.
- استدعاء Edge Function `sign-translate` عند الحاجة لمعالجة الجمل الطويلة (Glossing) عبر LLM، مع تمرير `signSystem` ضمن الـ prompt.

### د. توحيد البيانات
- `signSystems.ts` يبقى مرجع الأنظمة.
- إضافة `spokenLanguages.ts` يضم اللغات المنطوقة المدعومة (code, name, nativeName, rtl).
- إضافة `signGlyphs/<system>.json` لكل نظام (يبدأ بمحتوى أساسي ويُوسَّع تدريجياً، مع وسم coverage لإظهار نسبة التغطية للمستخدم).

## 3) Edge Function (اختياري لكن مُوصى به)
- `supabase/functions/sign-translate/index.ts`: يستقبل `{ text, signSystem, spokenLang, direction }` ويعيد قائمة tokens (كل token = كلمة + glyph_id + fallback fingerspell). يستخدم Lovable AI Gateway.

## ملفات التأثير
- جديدة: `src/features/sign-language/spokenLanguages.ts`, `src/features/sign-language/signGlyphs/*.ts`, `supabase/functions/sign-translate/index.ts`.
- معدّلة: `src/App.tsx`, `src/pages/damij/sign/SignHome.tsx`, `src/pages/damij/sign/SignTranslator.tsx`, `src/features/sign-language/SignTranslatorPro.tsx`, `src/features/sign-language/TextToSignTab.tsx`, `src/features/sign-language/SignGlyph.tsx`.
- محذوفة: `SignDictionary.tsx`, `SignLearn.tsx`, `LearnSignsTab.tsx`, `HandSignCard.tsx`, `WordDetailSheet.tsx`.

## ملاحظة واقعية
لا يمكن تقنياً تضمين «كل إشارة لكل لغة» في إصدار واحد (الأنظمة تحوي عشرات الآلاف من المفردات). الخطة توفّر:
1) قاموس glyphs أساسي واسع لكل نظام (>500 كلمة + الأبجدية + الأرقام).
2) Fingerspelling fallback يضمن ترجمة أي كلمة حتى لو لم تكن في القاموس.
3) Edge Function تستفيد من LLM لتفكيك الجمل المعقّدة.
هل توافق على هذه الخطة لأبدأ التنفيذ؟