## الهدف

ترقية قسم بريل في منصة "دامج" بمحوّل عالمي احترافي يحوّل **أي ملف** (PDF, Word, PowerPoint, Excel, TXT, صورة بالـ OCR) أو **أي صفحة ويب** إلى بريل بـ **مئة لغة**، مع دعم **المستويين الأول (Grade 1) والثاني (Grade 2 - الاختزالي)**، وإمكانية تنزيل الناتج كـ `.brf` أو PDF أو طباعة.

## ملاحظة أمنية حول مفتاح Gemini

المفتاح `AIzaSyD4...` لا يجب أن يوضع في الكود (سيُسرَّب علناً في الواجهة الأمامية). سأخزّنه كـ **secret** بإسم `BRAILLE_GEMINI_API_KEY` في Supabase ويُستخدم فقط داخل Edge Function. (إن أردت سأستخدم `LOVABLE_API_KEY` المجاني بديلاً ولكن طلبت مفتاحك صراحة، فسأعتمد مفتاحك مع fallback تلقائي للـ Lovable Gateway عند 429.)

## الواجهة الجديدة `/damij/braille/universal`

تبويب واحد في `BrailleHome` بعنوان "محوّل بريل العالمي" يفتح صفحة فيها 3 مصادر إدخال:

1. **ملف** — يدعم `.pdf .docx .pptx .xlsx .txt .md .rtf .csv .html .epub` + صور `.png .jpg .webp` (OCR).
2. **رابط ويب** — لصق URL لجلب نصّ الصفحة.
3. **نص مباشر** — للصق سريع.

خيارات:
- **اللغة**: قائمة 100+ لغة (نعيد استخدام `SPOKEN_LANGUAGES` من مترجم الإشارة).
- **المستوى**: Grade 1 (حرف-حرف) أو Grade 2 (اختزالي قياسي UEB/عربي/فرنسي…).
- **الكود**: 6-dot أو 8-dot (Computer Braille).
- **الاتجاه**: LTR/RTL تلقائي حسب اللغة.

عرض النتائج:
- نص بريل بالرموز Unicode `⠁⠃⠉` بخط كبير قابل للنسخ.
- النص الأصلي بجانبه (مزامنة سطر-بسطر).
- أزرار: نسخ، تنزيل `.brf`، تنزيل PDF (A4 مجهَّز للطباعة بمسافات بريل قياسية)، طباعة، نطق صوتي.

## التنفيذ التقني

```text
client (UniversalBrailleConverter.tsx)
  ├─ اختيار المصدر (file / url / text)
  ├─ استخراج النص محلياً عند الإمكان
  │    ├─ pdf  → pdfjs-dist
  │    ├─ docx → mammoth
  │    ├─ xlsx → xlsx (sheetjs)
  │    ├─ pptx → jszip + xml parse
  │    ├─ html/url → DOMParser (عبر edge function لتجاوز CORS)
  │    └─ image → Tesseract.js (OCR متعدد اللغات)
  ├─ POST /functions/v1/braille-convert
  │    body: { text, lang, grade, dots }
  └─ يعرض الناتج + تنزيل
```

### Edge Function: `supabase/functions/braille-convert/index.ts`
- يستقبل `{ text, lang, grade, dots }`.
- لمستوى **Grade 1**: تحويل حتمي محلي عبر جدول mapping داخل الـ function (ASCII-Braille + جداول عربي/فرنسي/روسي… المضمّنة).
- لمستوى **Grade 2** (الاختزالي): يستدعي Gemini عبر مفتاحك مع برومبت دقيق يطلب الإخراج بصيغة Unicode Braille فقط مع التزام معايير LBU/UEB/Arabic Braille Authority؛ يضيف verification step للتأكد من أن كل المحارف من نطاق `U+2800–U+28FF`.
- عند 429 → fallback تلقائي إلى Lovable AI Gateway (`google/gemini-2.5-flash`).
- لجلب الويب: مسار إضافي `mode: "fetch_url"` يُنزّل الصفحة على السيرفر ويُعيد النص النظيف.

### Edge Function: `supabase/functions/braille-fetch-url/index.ts`
- يجلب صفحة الويب (لتجاوز CORS) ويستخرج النص الأساسي عبر Readability-like بسيط.

## الملفات

**جديدة:**
- `src/pages/damij/braille/UniversalBrailleConverter.tsx`
- `src/features/braille/brailleTables.ts` (جداول Grade 1 لـ ar/en/fr/es/ru/de/it…)
- `src/features/braille/extractText.ts` (PDF/DOCX/XLSX/PPTX/Image)
- `src/features/braille/brailleExport.ts` (`.brf` + PDF عبر jsPDF)
- `supabase/functions/braille-convert/index.ts`
- `supabase/functions/braille-fetch-url/index.ts`

**تعديل:**
- `src/pages/damij/braille/BrailleHome.tsx` (إضافة بطاقة "محوّل بريل العالمي")
- `src/App.tsx` (إضافة المسار)
- `supabase/config.toml` (تسجيل الـ functions)

**Secret يُضاف:** `BRAILLE_GEMINI_API_KEY` = المفتاح المُقدَّم.

## الحزم المطلوب تثبيتها
`pdfjs-dist`, `mammoth`, `xlsx`, `tesseract.js`, `jszip`, `jspdf` (موجود غالباً).

## خارج النطاق
- لا نتعامل مع طابعات بريل فيزيائية (BRF جاهز للإرسال إليها).
- لا نخزّن الملفات المرفوعة في Supabase Storage (معالجة فورية في الذاكرة).

اعتمد لأبدأ التنفيذ.
