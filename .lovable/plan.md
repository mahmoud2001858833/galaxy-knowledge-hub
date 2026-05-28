# خطة تحسين "عين الأعمى"

سأطبّق 5 تحسينات مترابطة على وحدة Blind Eye فقط، مع الإبقاء على بقية المنصة كما هي.

## 1) صمت كامل عدا الصوت — لا أصوات إلا الأوامر/الإرشاد

في `speechQueue.ts`:
- إزالة كل `earcons.*` و `vibrate()` نهائياً (تحويلها إلى `no-op`).
- حذف كل `AudioContext` و `StereoPannerNode` و `tone()` — لن تخرج أي نغمة من الجهاز.

في `BlindEyeNavigator.tsx`:
- حذف كل مناداة لـ `earcons.scanTick / hazard / approach / away / pointLeft / pointRight / pointAhead / sceneChange` و كل `vibrate(...)`.
- إبقاء `cancelAllSpeech` و `enqueueSpeech` فقط كقناة صوت واحدة.

النتيجة: لا نغمات تنبيه، لا اهتزاز، لا أي صوت سوى TTS.

## 2) صوت واحد منسّق وأنيق

في `speechQueue.ts`:
- اختيار صوت ثابت لكل لغة عند الإقلاع وتخزينه (`voicesCache`).
- ترتيب صارم للأفضلية: `Google` ثم `Microsoft Natural` ثم أي عربي/إنجليزي.
- توحيد المعاملات: `rate=1.05 (en)/1.0 (ar)`، `pitch=1.0`، `volume=1` لكل النطق (إزالة تغييرات pitch/rate عند الخطر) ليكون النفس واحد.
- منع التداخل: إلغاء أي نطق سابق فور وصول أمر `critical` (موجود مسبقاً، نُبقيه).

## 3) المرشد لا يصف، فقط يأمر بالاتجاه

تعديل برومبت `blind-eye-vision` (`POINTS_PROMPT` و `GUIDANCE_FAST_PROMPT`):
- `spoken` يصبح **أمر اتجاه فقط** من قاموس مغلق:
  - عربي: `يسار` / `يمين` / `أمام` / `قف` / `استمر` / `تراجع`
  - إنجليزي: `Left` / `Right` / `Ahead` / `Stop` / `Continue` / `Back`
- إلغاء `obstacles_summary` من النطق (تبقى في الـ JSON للعرض فقط، لا تُقرأ).
- قاعدة: عند `global_proximity ≥ 70` → `قف`. عند مسار جانبي → الاتجاه فقط. عند مسار حر → `أمام`/`استمر`.

في `BlindEyeNavigator.tsx`:
- إزالة قراءة `obstacles_summary` من أي مكان.
- `sendChat` (محادثة المستخدم) يبقى كما هو — هذا فقط لمنطق المرشد التلقائي.

## 4) استجابة فورية (latency منخفض جداً)

في `BlindEyeNavigator.tsx`:
- `minGap` الجديد: `score≥70 → 180ms`، `score≥40 → 280ms`، عادي `500ms`، calibrating `600ms` (حالياً 350/500/1200).
- خفض `cooldownUntilRef` بعد 429 من 6000ms إلى 2500ms.
- رفع `inflightRef` المسموح من 3 إلى 4.
- إزالة شرط `heartbeatSilent` و خفض نافذة `tooRecent` من 6s إلى 1.2s للأوامر، و 400ms للحالة الحرجة.
- `speakDedup` window: critical 600ms، directional 1500ms (بدل 1500/3500).
- التقاط الإطار في وضع `points` بعرض 256px (بدل 320) لتسريع الإرسال.

في `blind-eye-vision/index.ts`:
- استخدام `google/gemini-3-flash-preview` أولاً مع `max_tokens: 120` للحدّ من زمن التوليد.
- تقصير البرومبت (إزالة شرح الإحداثيات الطويل لأن JSON schema يضبطها).

## 5) ملاح خارجي مستقل وقوي (مثال: "أريد الذهاب إلى مدرسة عنبه الثانوية")

ملف جديد `src/pages/damij/blind-eye/navigation/turnByTurn.ts`:
- جلب مسار حقيقي من **OSRM العام** `https://router.project-osrm.org/route/v1/foot/{from};{to}?steps=true&geometries=geojson&overview=full`.
- بناء قائمة خطوات (`maneuver.type`, `maneuver.modifier`, `distance`, `name`) وتحويلها لجمل عربية قصيرة عبر `maneuverToAr()`:
  - `turn-left` → `انعطف يساراً بعد X متر في شارع Y`
  - `turn-right` / `slight-left` / `roundabout` / `arrive` ...
- `advanceStep(userPos)`: عند الاقتراب <15m من نقطة المناورة، انطق الخطوة التالية، وتقدّم للخطوة التي تليها.

تعديل `GO_TO` (`kind:'geo'`) في `BlindEyeNavigator.tsx`:
- بعد `geocodePlace` ناجح → استدعاء `fetchRoute(userPos, dest)`.
- إن نجح المسار: نطق ملخص أولي `سنسير X كيلومتر، Y خطوة. الخطوة الأولى: …`، ثم تتبع GPS يستدعي `advanceStep` على كل تحديث.
- في حال فشل OSRM → fallback للسلوك الحالي (اتجاه نسبي + مسافة).
- نطق المسافة المتبقية كل 100 متر فقط (لا كل ثانية) لتجنّب الإزعاج.
- عبارات مفتاح مدعومة (موجودة في `destinationParser`): "أريد أن أذهب إلى …" / "خذني إلى …" / "وجّهني إلى …".

## ملفات ستتغير

- `src/pages/damij/blind-eye/speechQueue.ts` (حذف earcons/vibrate/audio، توحيد الصوت)
- `src/pages/damij/blind-eye/BlindEyeNavigator.tsx` (حذف نداءات earcons، تسريع الحلقة، دمج turn-by-turn)
- `src/pages/damij/blind-eye/navigation/turnByTurn.ts` *(جديد)*
- `supabase/functions/blind-eye-vision/index.ts` (برومبت أوامر قصيرة + max_tokens)

لا تغييرات على قاعدة البيانات، لا على GJU، لا على Android، ولا على بقية مكونات Damij.
