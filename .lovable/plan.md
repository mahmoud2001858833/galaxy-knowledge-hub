## ترجمة قاموس الإشارات إلى كل لغات المنصة (115 لغة)

تم بالفعل ترجمة 14 لغة. المتبقي **100 لغة** (it, nl, pl, sv, no, da, fi, is, el, cs, sk, hu, ro, bg, sr, hr, bs, sl, mk, sq, uk, be, lt, lv, et, mt, ga, cy, gd, eu, ca, gl, lb, fo, la, eo, ku, ckb, ps, sd, ug, az, ka, hy, kk, ky, uz, tk, tg, mn, bn, pa, ta, te, ml, kn, gu, mr, or, as, ne, si, dv, th, vi, id, ms, tl, my, km, lo, jv, su, zh-TW, yue, sw, am, ti, so, ha, yo, ig, zu, xh, st, tn, sn, ny, rw, mg, af, ht, qu, gn, ay, haw, mi, sm, to, fj).

### 1. التوليد بالدفعات
- استخدام نفس السكربت `/tmp/translateArSL.mjs` (يدعم الاستئناف، resume).
- تشغيل اللغات في 5 موجات (20 لغة لكل موجة، 4 متوازية بداخلها) لتجنّب timeout الـ600 ثانية للأمر الواحد.
- لكل لغة: 3,341 كلمة ÷ 80 = 42 دفعة، prompt احترافي محدد لكل لغة بالاسم الكامل (English/French/etc.).

### 2. ضمان الجودة
- نظام الـ prompt يفرض: ترجمة قاموسية احترافية، صياغة قصيرة مناسبة كـ gloss للإشارة، الحفاظ على نوع الكلمة (فعل/اسم).
- إعادة محاولة تلقائية حتى 4 مرات على فشل JSON أو 429.
- pass تكميلي لأي لغة تنقصها كلمات (مثل ما عملنا مع hi/he).

### 3. تحديث وحدة التحميل
- توسيع `LOADERS` في `src/features/sign-language/dictionary/translations/index.ts` ليشمل كل اللغات الـ100 الجديدة (`import('./{lang}.json')`).
- التحميل lazy لكل لغة (Vite code-splitting) — لا يزيد bundle الأولي.
- الكاش بالذاكرة موجود — يبقى كما هو.

### 4. ملاحظات تقنية
- **حجم الملفات**: ~80-200KB لكل لغة (لغات مع scripts غير لاتينية مثل ta/ml/ka/hy تكون أكبر قليلاً) → إجمالي إضافي ~10MB في المستودع، **لا يُحمَّل** للمستخدم إلا اللغة الحالية فقط.
- **زمن التوليد المقدّر**: 5 موجات × ~8-10 دقائق = ~45-50 دقيقة إجمالاً.
- **التكلفة**: ~4,200 طلب AI Gateway. كل طلب صغير (~80 كلمة).
- **العرض**: لا تغييرات إضافية على الواجهات — الكود الحالي في YouTubeSignTranslator و SignSequencePlayer سيلتقط أي لغة تلقائياً عبر `useSignTranslations(uiLang)`.
- **المعالجة على فشل الـ 402**: السكربت يخرج فوراً ويُعلِم المستخدم.