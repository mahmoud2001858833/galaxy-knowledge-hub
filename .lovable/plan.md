# خطة إصلاح مترجم لغة الإشارة (3 مشاكل)

## 1) سرعة فتح الكاميرا + لا يترجم الإشارة إلى نص

**الأسباب المكتشفة:**
- النموذج (MediaPipe HandLandmarker) يُحمَّل أوّل مرة عند الضغط على «تشغيل»، فيظهر تأخير 3–8 ثوانٍ. الـ pre-warm الحالي داخل `useEffect` لا يُنفَّذ بشكل موثوق لأن `initHand` معرَّفة بعد `useEffect` (hoisting صحيح للدالّة لكن التحميل قد يتأخر إلى ما بعد التفاعل).
- في `handleGestureDetected` نُسقِط الإشارة إذا لم نجد لها كلمة في `liveVocab` ولا في القاموس الثابت. حين يكون `signSystem` غير ArSL/ASL أو يكون `vocabLoading=true` تكون النتيجة **فارغة دائماً** ⇒ "ما بترجم أبداً".
- عتبات MediaPipe (0.2) منخفضة جداً ⇒ كثير من الـ false-positives ثم الـ confidence < 0.7 يُرفض في `filterGesture` ⇒ لا تُسجَّل كلمات.

**الإصلاح في `SignTranslatorPro.tsx` و `gestureFilter.ts`:**
- تشغيل `initHand()` **فوراً عند mount** بشكل مضمون مع شريط تقدّم صغير "جاري تجهيز نموذج التعرف…" حتى يكون جاهزاً قبل ضغط المستخدم. عرض الزر معطّلاً مع رسالة "جاري التحميل…" بدلاً من البدء بالتحميل بعد النقر.
- رفع `minHandDetectionConfidence` و `minTrackingConfidence` إلى 0.5 لتقليل الضوضاء.
- **Fallback إجباري** في `handleGestureDetected`: إذا لم تتوفّر كلمة في `liveVocab` أو في قاموس النظام، نستخدم القاموس العربي الافتراضي `gestureToArabic` (الموجود أصلاً أعلى الملف) ثم نترجمه عبر AI إلى لغة النظام المختار. هكذا أي نظام إشارة سيُنتج نصاً.
- إذا كان `vocabLoading=true` نعرض شريط "جاري تجهيز قاموس {اللغة}…" داخل البطاقة بدل ترك المستخدم يظن أن الكاميرا لا تعمل.
- خفض `MIN_CONFIDENCE` في `gestureFilter` من 0.7 إلى 0.6، وخفض ثبات الإطارات من 3 إلى 2 لتسريع أول كلمة.
- إضافة مؤشّر بصري واضح "تم اكتشاف الإشارة: ✋ مرحبا" فوق الفيديو لإعطاء feedback فوري حتى قبل وصول الـ AI.

## 2) المشغّل السينمائي «الإشارة تدور حوالين نفسها»

**السبب:** في `HandSignCard.tsx` السطر 23:
```ts
circle: { rotate: [0, 360], transition: { duration: 1.6, repeat: Infinity, ease: 'linear' } }
```
أي حركة `circle` (وهي شائعة في مخرجات الذكاء الاصطناعي) تجعل اليد كلها تدور بلا توقّف وكأنها تدور حول نفسها.

**الإصلاح:**
- تغيير الحركة `circle` إلى حركة دائرية للموضع (translate على دائرة صغيرة) بدلاً من `rotate` الكامل: `{ x: [0, 8, 0, -8, 0], y: [0, -8, 0, 8, 0] }`.
- تطبيق نفس المبدأ على باقي الحركات المتكرّرة (wave_h/wave_v): استخدام تنويعات `x`/`y` بدل rotation الكامل.
- في `SignSequencePlayer` التأكّد من أن `loop=false` افتراضياً (هو كذلك) لكن إيقاف الـ animation عند الانتقال للكلمة التالية عبر `key={idx}` ⇒ موجود.

## 3) ترجمة فيديوهات YouTube: «تعذر جلب الترجمة»

**السبب:** instances الـ Piped/Invidious في `damij-youtube-sign/index.ts` معظمها معطّل أو يحجب الطلبات الآن، وصفحة watch تُرجِع نسخة بدون `captionTracks` للطلبات بدون كوكيز.

**الإصلاح في `supabase/functions/damij-youtube-sign/index.ts`:**
1. **تحديث قائمة الـ instances** بأحدث Piped/Invidious العاملة (نأخذها من قائمتهما الرسمية وقت الكتابة) وزيادة عددها إلى ~10 من كل نوع، مع إعادة المحاولة في حال 5xx/timeout.
2. **مسار جديد رئيسي:** استدعاء `https://video.google.com/timedtext?type=list&v={id}` أولاً للحصول على قائمة المسارات بدون watch page، ثم تنزيل المسار بـ `&fmt=json3`. هذا يعمل لمعظم الفيديوهات التي لديها CC يدوية.
3. **مسار `youtubei` (InnerTube)** كاحتياط: POST إلى `https://www.youtube.com/youtubei/v1/player` بـ client `ANDROID` للحصول على `captions.playerCaptionsTracklistRenderer.captionTracks` بشكل موثوق.
4. **توليد ASR ذاتي عند الفشل التام:** إذا لم تتوفّر ترجمات، نُنزِّل صوت الفيديو عبر Piped (`streams[].url` audio-only) ونمرّره إلى Gemini `audio` لتفريغه. (اختياري — خلف flag `allowAsr=true` ليبقى الزمن سريعاً).
5. تحسين رسالة الخطأ لتوضيح الفرق بين "الفيديو بدون ترجمة" و"تعذّر الوصول للخوادم"، مع إعادة `errorCode` للواجهة.

## التحقق
- فتح صفحة المترجم → الكاميرا تبدأ خلال ~1 ثانية، أوّل إشارة (open_palm) تُسجَّل كنص خلال ثانيتين.
- تحويل "مرحبا أنا أحبك" إلى إشارة وتشغيله سينمائياً ⇒ لا تدوير لانهائي.
- لصق فيديو YouTube بترجمات يدوية (مثلاً TED) ⇒ يجلب الترجمة ويُولِّد الإشارات.

## الملفات المتأثّرة
- `src/features/sign-language/SignTranslatorPro.tsx`
- `src/features/sign-language/gestureFilter.ts`
- `src/features/sign-language/HandSignCard.tsx`
- `supabase/functions/damij-youtube-sign/index.ts`
