## الهدف
في صفحة **الجسر الحسي العكسي → المحول الحسي العام** (`SensoryUpload.tsx`)، تحسين زر **«استمع»** الموجود بجانب «النص المبسّط» ليصبح:

1. **يقرأ فقط النص المبسّط** (`simplifiedText`) — وليس `narration` كما يحدث الآن.
2. **صوت أوضح ومخارج حروف عربية سليمة** عبر استخدام ElevenLabs (نموذج `eleven_multilingual_v2`) بدلاً من `speechSynthesis` المتصفح الذي يعطي نطقًا ضعيفًا للعربية.
3. **سقوط آمن** إلى `speechSynthesis` إذا فشل ElevenLabs (بدون مفتاح أو رصيد) مع رسالة واضحة.

## التغييرات

### 1) `src/pages/damij/sensory/SensoryUpload.tsx`
- تعديل زر «استمع» (سطر ~207) ليستدعي دالة جديدة `speakSimplified()` تُمرّر فقط `result.simplifiedText`.
- إضافة دالة `speakSimplified()`:
  - تنظّف النص (إزالة الرموز/الـ markdown، تطبيع الفواصل، فصل علامات الترقيم لإيقاعٍ أفضل).
  - تنادي edge function الموجودة `accessibility-text-to-speech` بصوت عربي مناسب وسرعة من `profile.speechRate`.
  - تشغّل الصوت عبر `Audio` من `data:audio/mpeg;base64,...`.
  - عند الفشل: تستخدم `speak()` الحالي (Web Speech) مع `lang = ar-SA` كاحتياط.
- ربط حالة `speaking` بحدث `onended/onpause` للعنصر `Audio` ليعمل زر «إيقاف».
- زر «استمع للوصف» يبقى كما هو (Web Speech) لأن المطلوب يخصّ النص المبسّط فقط.

### 2) `supabase/functions/accessibility-text-to-speech/index.ts`
- لا حاجة لتعديل: الدالة موجودة وتستخدم `eleven_multilingual_v2` الذي يدعم العربية بمخارج سليمة.
- التأكد من توفر `ELEVENLABS_API_KEY` كسرّ. إذا لم يكن متاحًا، الاحتياط التلقائي يتكفّل.

## تفاصيل تقنية مختصرة

```text
[زر استمع]
   │
   ▼
speakSimplified(simplifiedText)
   │  ├─ تنظيف النص (markdown / رموز / تطبيع)
   │  ├─ POST → accessibility-text-to-speech { text, voice: 'Sarah', speed }
   │  │     └─ نجاح → تشغيل MP3 (مخارج عربية واضحة)
   │  └─ فشل → speechSynthesis.speak(u) كاحتياط
```

- لن يُمرَّر `narration` أبدًا لزر النص المبسّط.
- `speed` يُحوَّل من `slow/normal/fast` إلى `0.85 / 1.0 / 1.15` (ضمن مدى ElevenLabs 0.7–1.2).

## ملاحظة للمستخدم
لتجربة الجودة الأعلى، يجب أن يكون مفتاح **ELEVENLABS_API_KEY** مضافًا في Lovable Cloud → Secrets. إذا لم يكن مضافًا سيعمل الزر باستخدام صوت المتصفح الافتراضي (أقل جودة).