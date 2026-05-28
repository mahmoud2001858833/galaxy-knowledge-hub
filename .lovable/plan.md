## الهدف
1. تغيير شاشة اختيار طريقة التشخيص لتعرض **خياري تعرّف أوّلي فقط** (استبيان ولي الأمر أو ألعاب أوّلية)، ثم يبني الذكاء الاصطناعي حزمة ألعاب تشخيصية مخصّصة بناءً عليها.
2. ضمان أن جميع ألعاب مرحلة التشخيص الفعلي **ألعاب تفاعلية** (لا أسئلة استبيانية مكتوبة).
3. إصلاح لعبة **انظر إلى الوجه** ليقع الوجه تمامًا فوق العنصر.
4. إصلاح لعبة **تتبّع الفقاعات** بحيث تستجيب لكل ضغطة وتصبح أكثر تفاعلية.

---

## 1) إعادة هيكلة تدفّق التشخيص — `AutismDiagnosis.tsx`

### تدفّق جديد
```
intro (الاسم/العمر) 
   → path  (اختيار طريقة التعرّف الأوّلي)
        ├─ "استبيان ولي الأمر"  → questionnaire (سريع، ~10 أسئلة فقط لاستخراج صورة أولية)
        └─ "ألعاب تعرّف أوّلية"  → discovery_games (2–3 ألعاب قصيرة من القالب الجاهز)
   → (تحويل التعرّف الأوّلي إلى ملف اهتمام/قدرات للطفل)
   → ai_games  (الذكاء الاصطناعي يولّد بطارية ألعاب تشخيصية مخصّصة من معطيات التعرّف)
   → analyzing → report
```

### تعديلات `path` step
- استبدال الخيارين الحاليين بخيارين:
  - **استبيان ولي الأمر** (أيقونة `ClipboardList`) — «أجب على أسئلة قصيرة عن طفلك، يستخدمها الذكاء الاصطناعي لتفصيل الألعاب».
  - **ألعاب تعرّف أوّلية** (أيقونة `Gamepad2`) — «ألعاب تفاعلية قصيرة تستخرج اهتمامات ومستوى الطفل تلقائيًا».
- إزالة خيار «الألعاب الأساسية الجاهزة» المنفرد وخيار «AI مباشر بدون تعرّف» — كلاهما يصب الآن في نفس مسار AI.

### مرحلة `discovery_games` (جديدة)
- تشغيل 2–3 ألعاب قصيرة من قوالب `templates/` (مثل `CategoryMatch`، `EmotionCards`، `LookWithMe`) بهدف **استخراج تفضيلات/قدرات** فقط (سرعة الاستجابة، الفئة المفضّلة، التركيز).
- النتائج تُجمّع في كائن `discoveryProfile`:
  ```ts
  { preferred_categories, avg_response_ms, attention_span_sec, social_score, accuracy }
  ```

### اختصار الاستبيان عند اختياره كتعرّف أوّلي
- تشغيل أوّل 8–10 أسئلة فقط من `getItemsForTrack(track)` بدل القائمة الكاملة، مع شارة «تعرّف أوّلي سريع».
- النتائج تُحوّل إلى `discoveryProfile` بنفس البنية.

### تمرير التعرّف الأوّلي إلى مولّد ألعاب AI
- تعديل استدعاء `startAiGames`:
  ```ts
  supabase.functions.invoke('autism-generate-diagnostic-games', {
    body: { ageMonths, ageTrack, respondent, name,
            discoveryProfile,                         // ⟵ جديد
            discoverySource: 'questionnaire' | 'games', // ⟵ جديد
            questionnaireResult: qr }
  })
  ```
- النتيجة: ألعاب AI مولّدة بأسلوب/مواضيع متوافقة مع اهتمامات الطفل (مثلًا إن أحبّ الحيوانات تظهر الحيوانات في الأمثلة).

### تحديث الخطوات (`STEP_LABELS`)
```
البيانات → الطريقة → (تعرّف أوّلي) → ألعاب AI → التقرير
```

---

## 2) تعديل Edge Function `autism-generate-diagnostic-games`
- استقبال الحقلين الجديدين `discoveryProfile` و `discoverySource`.
- تحديث system prompt: «أنشئ بطارية 4–6 ألعاب تشخيصية **تفاعلية فقط** من قوالب: BubbleTracking, LookWithMe, CategoryMatch, EmotionCards, MagicMirror, SpeechBubbles. استخدم اهتمامات الطفل المستخرجة لاختيار المواضيع والصعوبة. **ممنوع** إنشاء أسئلة استبيانية نصية».
- إجبار schema على `template_id ∈` (قوالب التفاعلية فقط) بحيث لا يمكن للنموذج إنتاج لعبة غير لعبة.
- ضمان وجود `difficulty` متدرّجة بناءً على `discoveryProfile.accuracy`.

---

## 3) إصلاح لعبة «انظر إلى الوجه» — `templates/LookWithMe.tsx`

المشكلة الحالية: قيم `x` ثابتة (`-80/-25/25/80`) لا تتطابق مع مواقع الأزرار الأربعة، ولا يوجد سهم/زاوية واضحة.

### الحل
- وضع الوجه في حاوية بنفس عرض شبكة الأزرار (`grid-cols-4` بعرض ثابت 4×88px مثلًا).
- حساب موقع الوجه ديناميكيًا فوق الزر الهدف عبر `ref` لكل زر ثم تحريك `motion.div` إلى `targetRef.current.offsetLeft + width/2 - faceWidth/2`.
- إضافة دوران بصري بسيط: عين/سهم يميل بزاوية نحو الهدف لتأكيد الاتجاه.
- زيادة مدة التحريك إلى 0.8s مع `easeOut` لتلتزم بمحاذاة دقيقة.

---

## 4) إصلاح لعبة «تتبّع الفقاعات» — `templates/BubbleTracking.tsx`

المشاكل:
- `animate={{ y: [0, -8, 0] }}` مع `transition repeat: Infinity` على `motion.button` يمنع تسجيل النقر أحيانًا.
- طبقة `<div onClick=misses>` تغطي الفقاعات بـ `inset-0` (z-index 0 بنفس مستوى الفقاعات في بعض المتصفّحات) وتسرق النقرات.
- وتيرة ظهور الفقاعات بطيئة (1.4s) ولا تنفجر بصريًا.

### الحل
- استبدال `repeat: Infinity` على عنصر الزر بانفصال: حركة العوم تجري على `<motion.span>` داخلي، بينما يبقى `<motion.button>` بدون أنيميشن متكرّر يضمن `pointer-events`.
- إضافة `style={{ touchAction: 'manipulation' }}` و `onPointerDown` بدل `onClick` لاستجابة فورية على الموبايل.
- نقل طبقة `misses` لتكون `pointer-events-none` على الفقاعات أو استخدام `onClick` على الخلفية فقط مع `z-index` أصغر ضمنًا.
- تقليل فترة الظهور إلى 900ms، رفع عدد الفقاعات المسموح في الشاشة إلى 8، وإضافة:
  - تأثير انفجار (`scale 0 → 1.4` + جزيئات `★` صغيرة).
  - صوت `pop` خفيف (Web Audio oscillator قصير).
  - عدّاد كومبو يزيد عند النقر السريع المتتالي لزيادة التفاعلية.
- إصلاح حساب `accuracy`: تجاهل النقرات على الخلفية إن جاءت قبل ظهور أي فقاعة.

---

## ملفات سيتم تعديلها
- `src/pages/damij/autism/AutismDiagnosis.tsx` — تدفّق جديد + مرحلة `discovery_games` + تمرير `discoveryProfile`.
- `src/features/autism/games/templates/LookWithMe.tsx` — محاذاة الوجه الديناميكية.
- `src/features/autism/games/templates/BubbleTracking.tsx` — استجابة فورية + تفاعلية محسّنة.
- `supabase/functions/autism-generate-diagnostic-games/index.ts` — استقبال profile + prompt جديد + قيود schema.

## ملفات قد تُضاف
- `src/features/autism/discoveryProfile.ts` — أنواع ومحوّلات (questionnaire→profile, games→profile).

## لن يتغيّر
- مولّد التقرير `autism-screen-analyze`، التخزين، شكل التقرير، باقي القوالب.
