# خطة تحسينات "عين الأعمى"

## 1) تسريع الاستيعاب عند تغيير اتجاه الكاميرا (Scene Change)
- في `BlindEyeNavigator.tsx`، الحلقة الحالية ترفع `sceneChangePendingRef` فقط عند حركة جيرو > 45، وتقلل `minGap` إلى 140ms. سنجعلها أكثر حساسية وأسرع:
  - خفض عتبة الجيرو من 45 إلى ~18، وإضافة كشف من `localVision` (`stats.sceneChange > 0.18` بدل 0.28).
  - عند اكتشاف تغيير المشهد:
    - مسح فوري لقائمة النقاط (`setPoints([])`) و `lastGuideRef` حتى لا تبقى صناديق قديمة على الشاشة.
    - إلغاء أي كلام جارٍ غير حرج (`cancelAllSpeech()` ما لم تكن هناك أوامر critical في الطابور).
    - إطلاق طلبَيْ AI متوازيين فوراً (`runAI('points')` + استهداف) مع `minGap = 0` لدورة واحدة.
  - رفع حد التوازي `inflightRef` من 4 إلى 6 خلال نافذة scene-change لمدة 1.5 ثانية.
  - تقليل دقة/جودة الإطار أثناء scene-change (`quality=0.35`, `w=480`) لتقليل زمن الرفع.

## 2) إعادة صياغة تنبيه "قف"
- اليوم: يقول "يسار/يمين/أمام/قف" فقط (أمر واحد). المطلوب نمط مختلف عند `global_proximity ≥ 75`:
  1. نطق "قف. قف." (مرتين متتاليتين، critical، يُقاطع كل شيء).
  2. ثم بعد ~250ms نطق وصف العائق مرة واحدة فقط (مثل: "شخص أمامك" أو "جدار قريب") مأخوذًا من `obstacles_summary` أو من `objects[0].label` المُعرَّب.
  3. ثم بعد ~250ms نطق التعليمة (مثل: "اذهب يميناً" / "تراجع") بناءً على `best_path`.
- التنفيذ:
  - في `runAI` داخل فرع الخطر العالي، استبدال `speakDedup(g.spoken,…)` بسلسلة `enqueueSpeech` ثلاث مرات (stop → label → action) مع debounce ≥ 1500ms حتى لا تتكرر.
  - تحديث برومبت `blind-eye-vision` لإرجاع حقل جديد `hazard_label_ar` (كلمة واحدة عربية للعائق الأقرب) إضافة إلى `spoken` و `best_path`، مع الحفاظ على القاعدة: لا وصف عند الحالات العادية.

## 3) المقاطعة الفورية عند تحدث المستخدم
- المشكلة الحالية: `rec.onresult` يتجاهل النتائج إذا `isSpeaking()` صحيح، فلا يبدأ التعرف إلا بعد توقف الكلام.
- التغييرات:
  - تفعيل `rec.interimResults = true` ومعالجة أول نتيجة جزئية (interim) بطول حرفين فأكثر:
    - استدعاء `cancelAllSpeech()` فوراً.
    - رفع علم `userSpeakingRef = true` ومنع `runAI` من نطق أي شيء حتى انتهاء جملة المستخدم.
  - تمرير النص النهائي (`isFinal`) إلى `handleVoiceInput` كالعادة.
  - تعديل `sendChat`: مع كل أمر مستخدم استخدم `priority: 'critical'` للرد كي يقاطع أي إرشاد جارٍ، ويُجاوب فوراً.
  - تقليل cooldown داخل `parseCommand/commandAllowed` من 1200 إلى 500ms للأوامر التفاعلية فقط.

## 4) تبديل اللغة الفوري لكل لغات المنصة (15 لغة)
- المنصة فيها 15 لغة في `src/features/damij/i18n/translations/` بينما عين الأعمى يدعم فقط `ar/en` عبر `BELang` و `BE_BCP47`.
- التحديثات:
  - توسيع `BELang` و `BE_BCP47` لتشمل كل اللغات الـ15 (en, ar, fr, es, de, pt, ru, tr, fa, ur, he, hi, ja, ko, zh) مع الرموز BCP-47 الصحيحة (مستوردة من `features/damij/i18n/bcp47.ts`).
  - في `voiceCommands.ts`: إضافة أنماط `SWITCH_LANG_*` لكل لغة (مثل "switch to french" / "حوّل إلى الفرنسية" / "passe au français" …)، وأمر عام `SWITCH_LANG_TO <lang>` يستخرج اسم اللغة من النص ويُرجع `target_lang`.
  - `handleVoiceInput`: استدعاء `switchLang(target_lang)` فور التعرف على الأمر دون انتظار أي طلب AI.
  - `switchLang`: بالإضافة لما يفعله الآن، تحديث `rec.lang = BE_BCP47[next]` وإعادة تشغيل التعرف الصوتي مباشرة (`stop()` + `start()`) لتفعيل لغة الإدخال الجديدة فوراً.
  - تحديث برومبت `blind-eye-vision` ليُرجع `spoken` بأي لغة `lang` يستقبلها (وليس فقط ar/en)، مع قاموس أوامر مُترجَم لكل لغة (Left/Right/Stop/Ahead/Back/Continue) داخل البرومبت.
  - استخدام `BE_STRINGS` كاحتياط: إن كانت اللغة المختارة غير معرّفة في `i18n.ts` المحلي لعين الأعمى، نستورد جملها من `features/damij/i18n/translations/<lang>.ts` (الحقول المشتركة فقط: starting2, switchedLang, …).

## ملاحظات تقنية
- لا تغيير على واجهة المستخدم.
- لا أصوات/اهتزاز جديدة — التزام بقاعدة "صوت TTS فقط".
- الملفات المتأثرة:
  - `src/pages/damij/blind-eye/BlindEyeNavigator.tsx`
  - `src/pages/damij/blind-eye/speechQueue.ts` (دعم لغات إضافية في `voicesCache`)
  - `src/pages/damij/blind-eye/voiceCommands.ts`
  - `src/pages/damij/blind-eye/i18n.ts`
  - `supabase/functions/blind-eye-vision/index.ts` (برومبت متعدد اللغات + حقل `hazard_label`)
