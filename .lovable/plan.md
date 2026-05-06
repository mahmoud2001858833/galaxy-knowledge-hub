# خطة تطوير نظام فرط الحركة وتشتت الانتباه (ADHD) — احترافية ومبنية على مصادر موثّقة

النظام الحالي بسيط جدًا (3 صفحات، شاشة واحدة لكل قسم). الخطة التالية تحوّله إلى منصّة سريرية‑تربوية متكاملة مبنية على أدوات تشخيص وعلاج معتمدة عالميًا.

## المصادر العلمية المعتمدة

- **DSM‑5‑TR** — معايير تشخيص ADHD الرسمية (APA 2022).
- **Vanderbilt ADHD Diagnostic Rating Scale (NICHQ)** — للأطفال 6–12، نسخ والد ومعلّم.
- **Conners‑3** و **SNAP‑IV (26 بند)** — مقاييس سلوكية معتمدة.
- **ASRS‑v1.1 (WHO)** — للراشدين والمراهقين.
- **CDC ADHD Clinical Practice Guidelines (AAP 2019)**.
- **NICE Guideline NG87** (المملكة المتحدة) — للتدخلات الدوائية والسلوكية.
- **CHADD** و **Russell Barkley** — للتمارين التنفيذية وإدارة السلوك.
- **Conners CPT‑3 / TOVA** — كنماذج لاختبارات الأداء المستمر (CPT).

## 1) الهيكل العام للنظام

```text
/damij/adhd
├── /home                لوحة دخول مع 6 وحدات رئيسية
├── /screening           تشخيص متعدد المراحل
│   ├── vanderbilt-parent
│   ├── vanderbilt-teacher
│   ├── snap-iv
│   ├── asrs-adult
│   └── report           تقرير AI تفريقي + توصيات
├── /assessment          اختبارات أداء عصبي‑نفسي
│   ├── cpt              Continuous Performance Task
│   ├── stroop           اختبار سترووب للكفّ
│   ├── n-back           الذاكرة العاملة
│   └── go-no-go         التحكم بالاندفاع
├── /training            تمارين علاجية تكيّفية
│   ├── focus-builder    جلسات Pomodoro متدرّجة
│   ├── working-memory   مهام Dual N-Back
│   ├── inhibition       ألعاب Stop‑Signal
│   └── time-management  تدريب إدراك الوقت
├── /interventions       تدخلات سلوكية/بيئية/دوائية
│   ├── behavioral       جداول تعزيز، Token Economy
│   ├── classroom        تكييفات صفّية (CDC/CHADD)
│   ├── home-routines    روتين منزلي + Visual schedules
│   └── medication-info  معلومات تثقيفية فقط (Stimulant/Non‑stimulant)
├── /dashboard           متابعة طولية
│   ├── parent           تقارير الوالد
│   ├── teacher          تقارير المعلم
│   └── clinician        رسوم بيانية للأعراض/الأداء عبر الزمن
└── /resources           مكتبة مصادر PDF + فيديوهات
```

## 2) وحدة التشخيص (Screening)

- 4 استبيانات فعلية مرقمنة (Vanderbilt 55 بند + SNAP‑IV 26 + ASRS‑v1.1 18 بند + Vanderbilt Teacher 43 بند).
- نظام تسجيل تلقائي حسب cut‑off scores الأصلية.
- تصنيف الأنماط الثلاثة (Inattentive / Hyperactive‑Impulsive / Combined) مع شدّة (mild/moderate/severe).
- شاشات استبعاد للحالات المتشابهة (قلق، اكتئاب، اضطراب نوم، صعوبات تعلّم).
- تقرير AI نهائي (Gemini عبر Lovable Gateway) يدمج النتائج ويولّد:
  - ملخّص تفريقي مع مصادر مقتبسة.
  - علم أحمر للإحالة الطبية عند تجاوز حدّ معيّن.
  - خطة تدخّل أولية مخصّصة.

## 3) وحدة التقييم العصبي‑نفسي (Assessment)

اختبارات تفاعلية حقيقية في المتصفّح:

- **CPT (Continuous Performance Task)**: عرض حروف عشوائية 8–14 دقيقة، يضغط على كل حرف عدا X. قياس: Omissions, Commissions, Reaction Time, RT Variability.
- **Stroop**: كلمات ألوان متضاربة، يقيس الكفّ المعرفي.
- **N‑Back (1‑back, 2‑back, 3‑back)**: ذاكرة عاملة.
- **Go/No‑Go**: التحكم بالاندفاع، يقيس d‑prime.

كل اختبار يرسم نتيجة مقارنة مع نطاق طبيعي حسب العمر، ويُخزَّن في قاعدة البيانات للمقارنة الطولية.

## 4) وحدة التدريب (Training)

- **Focus Builder**: جلسات Pomodoro تكيّفية تبدأ من 5 دقائق وترتفع تدريجيًا (Graduated exposure).
- **Working Memory Trainer**: مهام Dual N‑Back مع مستويات صعوبة 20.
- **Inhibition Game**: لعبة Stop‑Signal بإيقاع متغيّر.
- **Time Estimator**: تدريب إدراك الوقت (مهارة ضعيفة عند ADHD حسب Barkley).

كل تمرين يُسجّل: المدّة، النتيجة، نسبة الإنجاز، ومخطط تقدّم أسبوعي.

## 5) وحدة التدخلات (Interventions)

- **Behavioral**: مولّد Token Economy charts قابل للطباعة، Daily Report Card (Pelham model).
- **Classroom Accommodations**: قائمة 30+ تكييف صفّي من CDC/CHADD مع وصف عربي.
- **Home Routines**: مولّد Visual Schedules بصور (يستخدم AI Image Gen — نصّ‑فري).
- **Medication Info**: بطاقات تثقيفية فقط (Methylphenidate, Amphetamines, Atomoxetine, Guanfacine) مع المصادر، **بدون توصية دوائية**.

## 6) لوحات المتابعة (Dashboards)

- مخطّطات Recharts: شدّة الأعراض شهريًا، أداء CPT/N‑Back عبر الزمن، التزام بالتمارين.
- مقارنة قبل/بعد تدخّل معيّن.
- تصدير PDF لتقرير شامل (والد/معلم/طبيب).

## 7) القسم التقني

### قاعدة البيانات (Supabase migrations)

- `adhd_assessments` — حفظ نتائج الاستبيانات (scores JSONB, subtype, severity).
- `adhd_neuro_tests` — نتائج CPT/N‑Back/Stroop/Go‑NoGo (metrics JSONB).
- `adhd_training_sessions` — جلسات التدريب ومدّتها ونتائجها.
- `adhd_interventions` — تدخلات نشطة لكل مستخدم.
- `adhd_daily_reports` — Daily Report Card اليومي.
- جميعها مع RLS: المستخدم يقرأ/يكتب بياناته فقط.

### Edge Functions

- `adhd-screening-report` — يُنتج تقرير AI تفريقي من نتائج الاستبيانات (Gemini via Lovable Gateway, fallback عند 429).
- `adhd-intervention-plan` — يولّد خطة تدخّل مخصّصة بناء على النمط والشدّة.
- `adhd-visual-schedule` — يولّد Visual Schedule بصور AI (text‑free).

### Frontend

- `src/features/adhd/` لكل المكوّنات الجديدة:
  - `screening/` (مكوّنات الاستبيانات + scoring engine).
  - `assessment/` (محرّكات اختبارات CPT/Stroop/NBack/GoNoGo بـ Canvas + RAF).
  - `training/` (المهام التكيّفية).
  - `interventions/` (المولّدات والقوائم).
  - `dashboard/` (مكوّنات Recharts).
- Routing داخل `App.tsx` تحت `/damij/adhd/*`.
- التزام كامل بـ Design Tokens (HSL، `--damij-warm`, `--damij-primary`).
- RTL، الخطوط العربية، أنيميشن خفيف Framer Motion.

## 8) ضمان الجودة

- جميع نقاط القطع (cut‑off) موثّقة مع رابط المصدر داخل المكوّن.
- زر "المصدر" بجانب كل استبيان واختبار.
- Disclaimer واضح: التطبيق أداة دعم وليس بديلاً عن التقييم السريري.

## 9) خطة التنفيذ على مراحل

1. **المرحلة 1** — قاعدة البيانات + إعادة هيكلة `ADHDHome` بـ 6 وحدات + Routing.
2. **المرحلة 2** — وحدة Screening الكاملة (4 استبيانات + Edge Function للتقرير).
3. **المرحلة 3** — وحدة Assessment (CPT + N‑Back أولًا، ثم Stroop/Go‑NoGo).
4. **المرحلة 4** — وحدة Training (Focus Builder + Working Memory).
5. **المرحلة 5** — وحدة Interventions + مولّد Visual Schedule.
6. **المرحلة 6** — Dashboards + تصدير PDF + مكتبة المصادر.

كل مرحلة قابلة للتسليم مستقلة. سأبدأ بالمرحلة 1 و2 في أول دفعة بعد الاعتماد.
