
## الهدف
تحويل "عين الأعمى" من مساعد بصري عام إلى **نظام ملاحة لحظي موجَّه بالطلب** بالعربية أولاً، يفهم وجهة المستخدم (داخلية: "الباب"، أو خارجية: "مدرستي")، ثم يرشده خطوة خطوة بالصوت. وإبراز الميزة في واجهة دامج الرئيسية ببطاقة أنيقة.

## التغييرات

### 1) اللغة العربية افتراضية
- `BlindEyeLangContext.tsx`: تغيير الافتراضي من `'en'` إلى `'ar'`.
- `i18n.ts`: إضافة مفاتيح جديدة للحوار الملاحي (التعليمات الاتجاهية، أسئلة الوجهة، تأكيد الوصول…).
- جميع تعليمات النموذج (prompts) تُولَّد بالعربية افتراضياً.

### 2) وضع "صامت يراقب" حتى يطلب المستخدم
- إضافة حالة `Phase = 'idle_listening'` (افتراضية بعد المعايرة).
- في هذا الوضع: الكاميرا تعمل + التحليل المحلي خفيف (motion/edges) + استماع دائم — **بدون كلام تلقائي** إلا عند خطر حاد جداً (proximity > 90).
- بعد المعايرة الصوت الأول الوحيد: "أنا جاهز، قل لي إلى أين تريد الذهاب."

### 3) محرك الوجهة والملاحة الموجَّهة
- معالج صوتي جديد يفهم نوايا الوجهة بالعربية:
  - **داخلي**: "بدي أروح للباب / للكرسي / للطاولة / للدرج / للنافذة" → يخزَّن `targetObject` ويبدأ Phase `'navigating_local'`.
  - **خارجي**: "بدي أروح لمدرسة X / مستشفى / صيدلية / البيت" → Phase `'navigating_geo'`.
  - **استكشاف**: "صف ما حولي / اقرأ النص" → سلوك حالي.
- خلال `navigating_local`:
  - كل تحليل AI يعيد، إضافة لما هو موجود، `target_seen: bool`, `target_bearing: 'left'|'center'|'right'`, `target_distance_estimate: 'far'|'mid'|'near'|'arrived'`, `next_step_ar: string` (مثال: "خطوتان للأمام ثم انعطف يميناً").
  - منطق توجيهي يُلفظ تعليمة قصيرة كل 1.5-2.5 ث ("للأمام"، "يمين قليلاً"، "توقف، الباب أمامك").
  - عند `arrived` → نغمة + "وصلت إلى الباب".
- خلال `navigating_geo`:
  - استخدام `navigator.geolocation.watchPosition` + Nominatim (OpenStreetMap) لتحويل اسم المكان لإحداثيات، وحساب bearing/distance لحظياً.
  - تعليمات صوتية: "اتجه شمالاً 80 متراً"، ثم تحديث كل تغيُّر heading > 20° أو كل 10 ث.
  - دمج مع تحذيرات الكاميرا (عوائق قريبة لها أولوية على تعليمات GPS).

### 4) تحسين دقة الرؤية (في حدود متصفح)
- زيادة معدل لقطات AI أثناء `navigating_local` من ~1 Hz إلى ~2 Hz (مع backoff عند 429).
- تحديث prompt الـ vision ليرجع أيضاً قائمة `landmarks` (door, chair, table, stairs, window, person) مع `bearing` و`approx_meters` تقديري من حجم الصندوق.
- خوارزمية اختيار: يطابق `targetObject` المطلوب مع `landmarks` ويُولِّد `next_step`.

### 5) Edge function `blind-eye-vision`
- إضافة حقول جديدة في الرد: `landmarks[]`, `target_match`, `target_bearing`, `target_distance`, `next_step_ar`.
- إضافة معامل `target` في الطلب (اسم الكائن المرغوب بالعربية).
- الاحتفاظ بـ Lovable AI Gateway (استثناء عين الأعمى المعتمد).

### 6) بطاقة "عين الأعمى" أنيقة في واجهة دامج الرئيسية
- في `DamijLanding.tsx`: إضافة قسم Hero ثانوي/بطاقة كبيرة بارزة فوق `STATS` بعنوان "عين الأعمى — مرشدك للمشي بأمان"، تدرج لوني emerald→cyan، أيقونة Eye مع نبضة، CTA كبير "افتح عيني" يقود إلى `/damij/blind-eye`.
- مدعومة بدعائم Motion (framer-motion) وتصميم زجاجي يطابق هوية دامج.

### 7) أوامر صوتية جديدة في `voiceCommands.ts`
- `GO_TO` (يلتقط الوجهة بعد "بدي أروح / خذني / وجّهني إلى …")
- `ARRIVED_QUERY` ("هل وصلت؟")
- `CANCEL_NAV` ("ألغِ التوجيه / اوقف الإرشاد")
- `WHERE_AM_I` ("وين أنا الآن؟")

## تفاصيل تقنية موجزة
- ملفات تُعدَّل: `BlindEyeLangContext.tsx`, `i18n.ts`, `BlindEyeNavigator.tsx`, `voiceCommands.ts`, `HudOverlay.tsx`, `DamijLanding.tsx`, `supabase/functions/blind-eye-vision/index.ts`.
- ملفات تُنشأ: `src/pages/damij/blind-eye/navigation/geo.ts` (haversine + bearing + Nominatim wrapper)، `src/pages/damij/blind-eye/navigation/destinationParser.ts` (استخراج الوجهة من النص العربي)، `src/pages/damij/blind-eye/navigation/localGuidance.ts` (يحول landmark+target → تعليمة صوتية).
- لا تغييرات قاعدة بيانات ولا أسرار جديدة.
- يبقى استخدام Lovable AI مقتصراً على عين الأعمى كما في القاعدة الحالية.

## خارج النطاق (مرحلة لاحقة إن أردت)
- YOLOv8/MiDaS محلياً (يحتاج WebGPU/Onnx ضخم — مكلف على الموبايل).
- كشف السقوط عبر DeviceMotion.
- إرسال موقع للطوارئ.
- OCR/تعرّف وجوه/عملات.

سأنفذ كل ما سبق دفعة واحدة عند الموافقة.
