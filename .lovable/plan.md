## خطة تطوير نظام التوحد (دامج)

تحسين شامل عبر 5 محاور مع الحفاظ على البنية الحالية. كل التحسينات الـ AI ستستخدم Gemini مباشرة (لا Lovable AI).

---

### 1) تحسين التصميم (UI/UX) — تكيّفي حسب العمر

**هوية بصرية جديدة لقسم التوحد:**
- لوحة ألوان هادئة صديقة للحس (Sensory-friendly): أزرق سماوي، أخضر نعناعي، خوخي ناعم — مع وضع "هدوء حسي" يقلل التباين والحركة.
- خطوط أكبر، حواف دائرية، زر واحد رئيسي واضح في كل شاشة.
- إضافة `AgeAdaptiveContext` يقرأ عمر الطفل من ملفه ويبدّل تلقائياً بين 3 أوضاع:
  - **2-5**: أيقونات ضخمة، صور فقط، أصوات تشجيع، لا نصوص طويلة.
  - **6-9**: أيقونات + نصوص قصيرة، أنيميشن متوسط، شارات مكافآت.
  - **10+**: واجهة أنظف، تفاصيل أكثر، إحصائيات للطفل ووالديه.
- إضافة أنيميشن `fade-in` و`scale-in` على البطاقات، وتحويلات سلسة بين الشاشات.
- شريط تقدم بصري ثابت أعلى الشاشات (يوم X من Y، نسبة الإنجاز).

**شاشات يتم تحديثها:**
`AutismHome`, `AutismChildPage`, `AutismProfile`, `AutismProgramSetup`, `AutismDayView`, `AutismGamePlayer`, `AutismTherapy`, `AutismTherapyPlan`, `AutismProgramCalendar`, `AutismDiagnosis`, `AutismProgressDashboard`.

---

### 2) ألعاب التشخيص ودقة النتائج

**تحسين الألعاب الـ6 الموجودة:**
- `EmotionRecognition`, `JointAttention`, `PatternVsSocial`, `RepetitiveMatch`, `ResponseToName`, `SensoryTolerance`.
- إضافة قياسات سلوكية أدق داخل كل لعبة عبر `useGameMoveLogger`:
  - زمن الاستجابة لكل محاولة (RT mean/variance).
  - معدّل التراجع/التكرار، الأنماط التكرارية، تجاهل النداء، فترات الانتباه.
  - عدد المحاولات حتى أول نجاح، استقرار الأداء عبر الجولات.
- تحسين تصميم كل لعبة: رسوم متحركة، أصوات نجاح/فشل، تعليمات بصرية بدل النصية للأطفال الصغار.

**محرك التقييم `scoringEngine.ts`:**
- إعادة كتابة لتعتمد ميزات سلوكية متعددة (response time, joint attention rate, name response latency, repetitive pattern index, sensory tolerance score).
- مخرجات: درجة لكل بُعد من أبعاد DSM-5 (التواصل الاجتماعي، السلوكيات المتكررة، الحساسية الحسية)، مع ثقة (confidence) لكل بُعد.

**Edge Function `autism-screen-analyze`:**
- إرسال M-CHAT-R/F + بيانات اللعب الخام + مخرجات scoringEngine إلى Gemini.
- Gemini يعيد تقريراً منظّماً (responseSchema) يحتوي:
  - مستوى الخطر (low/medium/high)، مع الأدلة من البيانات.
  - تحليل لكل بُعد من DSM-5 مع شواهد رقمية.
  - توصيات عملية لولي الأمر، ومتى يجب الإحالة لمختص.
- إضافة "تقرير ولي الأمر" PDF محسّن مع رسوم بيانية (radar chart).

---

### 3) جداول العلاج (Therapy Plan / Calendar)

**تحسينات `AutismTherapy`, `AutismTherapyPlan`, `AutismProgramCalendar`, `AutismDayView`:**
- تقويم بصري شهري/أسبوعي بألوان لكل نوع جلسة (تواصل، حسي، حركي، اجتماعي).
- مؤشر "اليوم الحالي" بارز، مع شارات للأيام المكتملة.
- لكل يوم: بطاقة تعرض الهدف اليومي، الوقت المقدّر، عدد التمارين، شريط تقدم.
- إمكانية إعادة جدولة يوم (سحب وإفلات بسيط أو زر "أجّل").
- تنبيهات/إشعارات قبل الجلسة (Notifications API).
- "وضع ولي الأمر": ملخص يومي + ملاحظات + تقييم الجلسة بنجوم.
- عرض "Streak" (سلسلة الأيام المتتالية) لتحفيز الالتزام.

**Edge Function `autism-regenerate-day`:** تحسين الـ prompt ليأخذ أداء الأيام السابقة ويعدّل صعوبة اليوم تلقائياً.

---

### 4) مولّد ألعاب العلاج بالـ AI

**تحسين `autism-generate-diagnostic-games` و`autism-generate-program` و`autism-generate-therapy-plan`:**
- Prompt جديد منظّم بـ DSM-5 ويأخذ:
  - عمر الطفل، شدة الأعراض لكل بُعد، الاهتمامات (من الملف)، نتائج الأيام السابقة.
- مخرجات JSON صارمة عبر `responseSchema`:
  - عنوان اللعبة، الهدف العلاجي، البُعد المستهدف، التعليمات، الصعوبة 1-5، المدة، معايير النجاح.
- استدعاء Gemini لتوليد صور تعليمية خالية من النصوص (متماشٍ مع قاعدة المنصة) عند الحاجة.
- إضافة "بنك ألعاب جاهزة" كاحتياطي عند فشل الـ AI لضمان عدم تعطّل التجربة.
- آلية تنويع: لا تكرار نفس اللعبة لأكثر من مرة كل 3 أيام.

---

### 5) ميزات جديدة مقترحة

- **Progress Dashboard محسّن** (`AutismProgressDashboard`): رسوم خطية لكل بُعد عبر الزمن، مقارنة قبل/بعد، تصدير PDF.
- **شارات ومكافآت** للطفل (نجوم، ميداليات) مع أصوات.
- **وضع ولي الأمر** منفصل: ملاحظات، تقييم يومي، تواصل مع المختص (نص حر يُحفظ).
- **تقرير PDF شامل** قابل للمشاركة مع المختصين (يستخدم `share_token` الموجود في `get_public_autism_program`).
- **وضع الهدوء الحسي**: زر سريع يخفض الألوان والأصوات والحركة فوراً.

---

### تفاصيل تقنية

**ملفات Frontend:**
```text
src/pages/damij/autism/*.tsx        ← إعادة تصميم كل الشاشات
src/features/autism/scoringEngine.ts ← إعادة كتابة محرك التقييم
src/features/autism/games/*.tsx      ← تحسين 6 ألعاب + قياسات سلوكية
src/features/autism/games/useGameMoveLogger.ts ← قياسات إضافية
src/features/autism/ReportView.tsx   ← تقرير محسّن + radar chart
src/contexts/AutismAgeAdaptiveContext.tsx ← (جديد) وضع تكيّفي حسب العمر
src/features/autism/ui/                   ← (جديد) مكونات مشتركة
src/features/autism/pdf/                  ← (جديد) تقارير PDF
```

**Edge Functions (Gemini مباشرة عبر `gemini-shim.ts` الموجود):**
```text
autism-screen-analyze              ← responseSchema جديد + DSM-5
autism-generate-diagnostic-games   ← prompt + schema محسّن
autism-generate-program            ← يأخذ أداء سابق
autism-generate-therapy-plan       ← schema صارم
autism-regenerate-day              ← تكييف الصعوبة
autism-analyze-day                 ← تحليل سلوكي أعمق
```

**قاعدة البيانات (إن لزم):** قد نحتاج عمود `behavior_metrics jsonb` على `autism_day_reports` لتخزين القياسات الخام، وعمود `parent_notes text` و`parent_rating int`. سيُعرض migration للموافقة عند التنفيذ.

**تبعيات إضافية:** `recharts` (موجود غالباً) لرسم البيانات، `jspdf` + `jspdf-autotable` لتقارير PDF.

---

### تنفيذ مرحلي

1. سياق العمر التكيّفي + هوية بصرية + تحديث `AutismHome` و`AutismChildPage`.
2. تحسين الألعاب الـ6 + `useGameMoveLogger` + `scoringEngine`.
3. تحديث `autism-screen-analyze` + تقرير DSM-5 + ReportView جديد + PDF.
4. تحسين Therapy/Calendar/DayView + إشعارات + Streak.
5. تحسين مولّدات الـ AI الثلاثة + بنك احتياطي.
6. Progress Dashboard + شارات + وضع ولي الأمر + وضع الهدوء الحسي.