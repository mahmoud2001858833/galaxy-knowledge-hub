# خطة تطوير نظام ADHD الكامل

## 1) إصلاح شريط التنقّل المكسور

في الصورة يظهر شريط `DamijFloatingNav` فوق بطاقات الاستبيان لأنه ثابت أسفل الشاشة بدون أي padding سفلي للصفحات. سنقوم بـ:

- إضافة `pb-28` على حاوية صفحات ADHD (وكل صفحات damij الفرعية الطويلة) لمنع تغطية المحتوى.
- جعل النّاف يظهر بـ glassmorphism أنحف وحدوده شفافة، مع زر إخفاء/إظهار صغير.
- على الشاشات الصغيرة: تمرير أفقي ناعم بدل اللفّ.
- التأكّد أنه لا يظهر في الصفحات الفرعية الكاملة (Game Player, Test runner) عبر `hideOnRoutes`.

## 2) إعادة تصميم الاستبيان (Vanderbilt / SNAP-IV / ASRS)

السلوك الحالي: قائمة طويلة جامدة. الجديد:

- عرض **سؤال واحد لكل شاشة** مع شريط تقدّم دائري وعدّاد (X / N).
- **خيارات إجابة بأزرار كبيرة ملوّنة** (أبداً/أحياناً/غالباً/دائماً) مع أيقونات Emotion، تنبض عند الاختيار.
- انتقال تلقائي للسؤال التالي بعد 250ms مع `framer-motion` slide.
- زر رجوع، حفظ تلقائي في `localStorage` ضدّ فقدان التقدم.
- وضع **"تشخيص سريع"** (5 أسئلة AI-curated) مقابل **"تشخيص شامل"** (الاستبيان الكامل).

## 3) شاشة النتيجة الجديدة (Results 2.0)

بدل التقرير النصي، صفحة بصرية:

- **بطاقة هوية** (الاسم، العمر، الأداة، التاريخ).
- **مقياس قطّاعي دائري** للنتيجة الكلية مع منطقة (طبيعي / حدّي / احتمال مرتفع).
- **رادار ثلاثي**: Inattention / Hyperactivity / Impulsivity (Recharts).
- **رادار 6-محاور** عند توفر بيانات الألعاب: Attention, Impulse Control, Working Memory, Cognitive Flexibility, Reaction Time, Sustained Focus.
- **خط زمني** للمقارنة مع المحاولات السابقة.
- **توصيات AI** مرتبة حسب الأولوية (سلوكي / صفّي / إحالة طبية).
- **PDF Export** بزر واحد + رابط مشاركة آمن للأهل.
- إخلاء مسؤولية + روابط مصادر.

## 4) التشخيص عبر الألعاب (Game-Based Screening)

بطارية من 6 ألعاب مصمّمة سريرياً، كلّ لعبة تستهدف عرَضاً ADHD محدّداً، مع تسجيل لحظي لكل حركة:

| اللعبة | الجهاز | المؤشّر السريري |
|---|---|---|
| **Forest Hunter** | Sustained CPT | Sustained Attention, Omission errors |
| **Stop the Rocket** | Stop-Signal Task | Impulse Control, SSRT |
| **Color Chaos** | Stroop تفاعلي | Cognitive Flexibility |
| **Memory Garden** | Visual N-Back | Working Memory |
| **Reaction Reflex** | Simple/Choice RT | Processing Speed, Variability |
| **Switcheroo** | Task-Switching | Set-shifting, Perseveration |

كل لعبة:
- مدة 90–180 ثانية، رسوم متحركة، مؤثرات صوتية.
- جدول `adhd_game_sessions` يحفظ كل حدث (timestamp, response, correct, RT) كـ jsonb.
- Edge function `adhd-game-analyze` يحوّل الجلسات إلى Z-scores مقارنة بمعايير العمر، ويستخرج 6 مؤشرات.
- شاشة **"تشخيص باللعب"** تشغّل الـ 6 ألعاب بالتسلسل ثم تعرض **تقرير AI شامل** يدمج نتائج الألعاب + الاستبيان (إن وُجد) ويُخرج فئة DSM-5 المرشّحة.

## 5) برنامج العلاج المولّد بالذكاء الاصطناعي (نمط نظام التوحد)

نسخة كاملة من بنية `autism_programs` لكن لـ ADHD:

- **إعداد البرنامج** (`/damij/adhd/program/setup`): عمر، شدة، أعراض غالبة، وقت يومي متاح، أهداف الأهل/المعلم → يُرسل لـ `adhd-program-generate` (Gemini 2.5 Pro) ينشئ خطة 4–12 أسبوعاً.
- **يومياً**: 3–5 ألعاب علاجية مولّدة ديناميكياً (تختلف عن ألعاب التشخيص — ألعاب تدريب: Pomodoro Quest, Calm Breath, Token Hunt, Mindful Maze, Working-Memory Builder...).
- **تتبّع 100%**: كل نقرة، RT، إجابة، نسبة النجاح، الوقت المستغرق → `adhd_game_sessions`.
- **تقرير يوم تلقائي** عبر `adhd-day-analyze`: نقاط قوة، تحديات، توصية لليوم التالي.
- **تكيّف ذكي**: إذا فشل الطفل في لعبة 3 أيام متتالية، edge function `adhd-program-adapt` يبدّلها بأخرى أبسط.
- **لوحة الأهل** (`/damij/adhd/program/[id]`): تقويم كامل، شارات إنجاز، رسوم تقدّم 6-محاور أسبوعياً، رابط مشاركة للمعلم.

## 6) جدول الصفحات والمسارات الجديدة

```
/damij/adhd                    → Home (محدّث + بطاقة "تشخيص باللعب" + بطاقة "البرنامج العلاجي")
/damij/adhd/screening          → اختيار الأداة (محدّث)
/damij/adhd/screening/:key     → الاستبيان الجديد (سؤال/شاشة)
/damij/adhd/screening/result/:id → النتيجة 2.0
/damij/adhd/games              → بطارية الألعاب التشخيصية (جديد)
/damij/adhd/games/:gameId      → اللعبة المنفردة
/damij/adhd/games/report/:sid  → التقرير الموحّد (ألعاب + استبيان)
/damij/adhd/program/setup      → إنشاء برنامج علاجي (جديد)
/damij/adhd/program/:id        → لوحة البرنامج
/damij/adhd/program/:id/day/:d → يوم العلاج (تشغيل الألعاب)
/damij/adhd/program/share/:tok → عرض عام للأهل/المعلم
```

## التفاصيل التقنية

**جداول جديدة (Postgres):**
- `adhd_game_sessions` (user_id, child_profile_id, game_key, mode 'screening'|'therapy', events jsonb, summary jsonb, score, started_at, ended_at)
- `adhd_screening_results` (user_id, instrument_key, answers jsonb, totals jsonb, ai_report text, created_at)
- `adhd_programs` (user_id, child_profile_id, weeks, focus_areas[], status, share_token, ai_plan jsonb)
- `adhd_program_days` (program_id, day_index, scheduled_for, status, summary jsonb)
- `adhd_program_games` (day_id, game_key, params jsonb, order_index, target_metric, completed bool)
- `adhd_day_reports` (program_id, day_id, ai_report, metrics jsonb, recommendations text)
- جميعها بـ RLS (owner-only) + سياسة قراءة عامة عبر `share_token` للبرامج/الأيام/التقارير.

**Edge Functions جديدة:**
- `adhd-game-analyze` — يحوّل events → metrics (mean RT, RT-CV, omission/commission errors, d-prime).
- `adhd-screening-report` — Gemini Flash يولّد تقرير تفسيري للاستبيان.
- `adhd-combined-report` — يدمج ألعاب + استبيان → فئة DSM-5 مرجّحة + توصيات.
- `adhd-program-generate` — Gemini 2.5 Pro ينشئ خطة كاملة (أيام × ألعاب × معاملات).
- `adhd-day-analyze` — تقرير يومي.
- `adhd-program-adapt` — تعديل البرنامج بناءً على الأداء.

**مكوّنات React جديدة:**
- `QuestionRunner.tsx` — محرّك السؤال-بشاشة.
- `ResultDashboard.tsx` — صفحة النتيجة 2.0 مع Recharts.
- `games/` — 6 ألعاب تشخيص + 5 ألعاب علاج (canvas/framer-motion).
- `useGameLogger.ts` — Hook لتسجيل كل حدث لحظياً ودفعه عند انتهاء اللعبة.
- `ProgramCalendar.tsx` — تقويم البرنامج العلاجي.

**إصلاح النّاف:** `DamijFloatingNav` يستقبل prop `hideOnRoutes` ويُضاف padding سفلي عام `<Outlet>` wrapper بـ `pb-28`.

## الترتيب المُقترح للتنفيذ
1. إصلاح النّاف + padding (سريع).
2. الهجرة (الجداول الستة + RLS).
3. QuestionRunner + ResultDashboard.
4. بطارية الألعاب التشخيصية الست + edge function التحليل.
5. مولّد البرنامج العلاجي + الألعاب العلاجية + التقارير اليومية.
6. لوحة الأهل + رابط المشاركة + تصدير PDF.
