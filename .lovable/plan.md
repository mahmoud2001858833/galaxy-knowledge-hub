# خطة: تحويل أي ملف/رابط ويب إلى بريل (المستوى 1 و2)

## الهدف
في صفحة "محوّل بريل العالمي" (`/damij/braille/converter`)، إضافة قسم جديد يسمح للمستخدم برفع أي ملف أو لصق رابط صفحة ويب، استخراج النص منه، ثم تحويله إلى بريل قياسي 1 (حرفي) أو قياسي 2 (اختزالي) بأي لغة من اللغات المدعومة، مع التصدير (نسخ / TXT / BRF / PDF) ونطق صوتي.

## نطاق التغيير

تعديل ملف واحد فقط:
- `src/pages/damij/braille/UniversalBrailleConverter.tsx`

(إعادة استخدام البنية التحتية الموجودة دون أي تعديل لها):
- `src/features/braille/extractText.ts` — يدعم أصلاً TXT, MD, CSV, RTF, HTML, JSON, PDF, DOCX, XLSX, PPTX, والصور (OCR بـ tesseract.js).
- Edge function `braille-convert` (mode: `convert`) — يحوّل النص إلى بريل بحسب اللغة والمستوى 1/2.
- `brailleToBrf`, `brailleToPdf`, `downloadText` للتصدير.

## واجهة المستخدم الجديدة (داخل نفس الصفحة)

تبويبان أعلى الصفحة:
1. **بريل ← نص** (الوضع الحالي، يبقى كما هو).
2. **ملف/رابط ← بريل** (الجديد).

محتوى التبويب الجديد:
- منطقة **سحب وإفلات** + زر "اختر ملفًا" تقبل: PDF, DOCX, PPTX, XLSX/XLS, TXT/MD/CSV/RTF/HTML/JSON, والصور (JPG/PNG/WEBP) مع OCR.
- حقل **رابط صفحة ويب** + زر "جلب".
- اختيار **اللغة** (يستخدم نفس قائمة `SPOKEN_LANGUAGES` الموجودة).
- اختيار **المستوى** (1 حرفي / 2 اختزالي) — نفس عناصر الواجهة الحالية.
- زر **"حوّل إلى بريل"** يعرض شريط تقدم (`step`) أثناء الاستخراج والتحويل.
- بطاقة النتيجة تعرض:
  - النص المستخرج (مع نسخ ونطق وتنزيل TXT).
  - ناتج بريل (مع نسخ، تنزيل BRF، تنزيل PDF).
  - عدد المحارف وعدد كلمات النص الأصلي.

## آلية العمل (تقني)

### استخراج النص
- **الملفات**: استدعاء `extractFromFile(file, langCode, onProgress)` من `src/features/braille/extractText.ts` — جاهز ويعمل محلياً في المتصفح (PDF.js, mammoth, xlsx, jszip, tesseract.js).
- **روابط الويب**: استدعاء edge function جديد خفيف `fetch-web-text` يجلب الصفحة عبر السيرفر (لتجنّب CORS) ويعيد نصاً نظيفاً بعد إزالة `<script>/<style>` والوسوم. *(ملاحظة: قد توجد بدائل مثل r.jina.ai، لكن نُفضّل edge function داخلي للموثوقية)*.

### التحويل إلى بريل
استدعاء الدالة الموجودة:
```ts
supabase.functions.invoke("braille-convert", {
  body: { mode: "convert", text, grade, langCode, langName }
})
```
وعرض `data.braille`.

### التصدير
استخدام `brailleToBrf`, `brailleToPdf`, `downloadText` مباشرةً.

## القيود والملاحظات
- حد أقصى لحجم الملف 25MB (تحقق على الواجهة).
- النصوص الطويلة جداً تُقسَّم تلقائياً قبل الإرسال إلى edge function (تقطيع لكل ~6000 حرف ثم دمج الناتج).
- صفحات الويب التي تتطلب JavaScript قد لا يُستخرج محتواها بالكامل (تحذير للمستخدم).
- زر "الرجوع إلى بريل" الحالي يبقى كما هو.

## Edge Function جديد
`supabase/functions/fetch-web-text/index.ts`:
- يستقبل `{ url }`.
- يجلب الصفحة بـ `fetch` مع User-Agent عادي.
- يُنظّف HTML ويُعيد `{ text, title }`.
- CORS headers قياسية.
