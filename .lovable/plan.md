
## الهدف

إصلاح تجربة "تمارين الذكاء الاصطناعي" في **نظام التوحد الذكي** و**نظام فرط الحركة وتشتّت الانتباه** بحيث:

1. بعد التشخيص يفتح المستخدم على **جدول 3 أشهر (90 يوماً)**، كل يوم **10 ألعاب مختلفة** ومتنوّعة (لأن التوحد طيف، وكذلك أعراض ADHD متباينة).
2. الجدول **يُحفظ مرّة واحدة** في قاعدة البيانات؛ عند الرجوع لاحقاً للزرّ نفسه يُفتح فوراً من الـ DB **بدون أي إعادة توليد**.
3. كل لعبة لُعبت تظهر عليها علامة "تم اللعب" (✓) ولا تُلعب مرّة أخرى افتراضياً (مع زرّ "إعادة" اختياري).
4. تحسين التجربة العامة: مكتبة ألعاب موحّدة، شريط تقدّم لليوم/البرنامج، تحميل سريع، حالة فارغة واضحة.

---

## 1) نظام التوحد الذكي

### تدفّق المستخدم الجديد
- التشخيص → عند الدخول على بطاقة **"العلاج التفاعلي / تمارين الذكاء الاصطناعي"** (`/damij/autism/therapy` و`/damij/autism/plan`):
  - إن وُجد `autism_programs` نشط للطفل ⇒ تحويل فوري إلى `/damij/autism/program/:id` (الجدول).
  - إن لم يوجد ⇒ شاشة قصيرة "إنشاء البرنامج لأول مرة" بزرّ واحد يولّد 90 يوماً × 10 ألعاب ثم يحفظها ويفتح الجدول.
  - **حذف** السلوك الحالي الذي يستدعي `autism-generate-therapy-plan` في كل دخول.

### قالب البرنامج (90 يوم × 10 ألعاب)
- تحديث `autism-generate-program`:
  - الافتراضي يصبح `totalDays = 90`، وكل يوم يحتوي **10 ألعاب** (بدلاً من 3-4).
  - تنويع إجباري: لا يتكرّر `template_id` أكثر من مرّتين في اليوم نفسه، ولا يتجاوز ٤ ظهور في أسبوع واحد.
  - توسيع قائمة القوالب المسموحة (الحالية 12 + إضافة 7 وهمية مذكورة في الكود → نضمن أن جميعها مسجّلة في `TEMPLATE_REGISTRY`؛ ما لا يوجد له مكوّن نُحوِّله إلى أقرب قالب موجود في طبقة الإدراج).
  - تدرّج الصعوبة: أسبوع 1-2 easy، 3-6 medium، 7-12 hard مع مزج.
  - التوليد بقطع (chunks) من 7 أيام (10 ألعاب × 7 = 70 لعبة) لتفادي حدود الاستجابة، مع نفس استراتيجية الـ fallback (Gemini عدّة مفاتيح ثم Lovable Gateway).

### الحفظ والاسترجاع السريع
- البرنامج محفوظ مسبقاً في `autism_programs / autism_program_days / autism_program_games` (موجود).
- إضافة:
  - فهرس على `autism_programs(child_profile_id, status)` للسرعة.
  - `localStorage` cache صغير: `autism_active_program_id` لتجنّب استعلام البحث في كل دخول.
- شاشة الإنشاء `AutismProgramSetup` تتحقّق دائماً من البرنامج النشط أولاً وتحوّل بدون توليد (موجود بشكل جزئي → نضمن تنفيذه قبل أي زرّ).

### علامة "تم اللعب"
- الجدول الموجود `autism_game_sessions` يحوي `program_game_id`. سنعتمد عليه:
  - في `AutismDayView`: العلامة موجودة بالفعل (`completed.has(g.id)`) — نحسّن الأيقونة (✓ أخضر بارز + شريط "أُنجزت") ونعطّل زرّ "ابدأ" ونستبدله بـ "إعادة (اختياري)".
  - شريط تقدّم اليوم: `x/10`.
  - شريط تقدّم البرنامج في `AutismProgramCalendar`: ألعاب مكتملة من أصل 900.

### تحسينات تجربة
- Skeleton loader أنيق أثناء جلب 90 يوماً.
- بحث/فلتر سريع في صفحة اليوم: "الكل / غير مكتمل / مكتمل".
- إشعار Toast واضح لو حاول المستخدم لعب لعبة مكتملة: "تم لعبها سابقاً — متابعة على أي حال؟".

---

## 2) نظام فرط الحركة وتشتّت الانتباه (ADHD)

نفس المبدأ:

### التدفّق
- بطاقة **"البرنامج العلاجي"** (`/damij/adhd/program/setup`):
  - عند الفتح: استعلام `adhd_programs` للمستخدم الحالي بحالة `active`.
  - إن وُجد ⇒ تحويل فوري إلى `/damij/adhd/program/:id`.
  - إن لم يوجد ⇒ النموذج الحالي + الإعدادات الافتراضية تصبح **12 أسبوعاً (~ 90 يوم)** و **10 ألعاب/يوم**.
- إضافة بطاقة "متابعة البرنامج الحالي" في `ADHDHome` تظهر فقط عند وجود برنامج نشط.

### قالب البرنامج
- تحديث `adhd-program-generate`:
  - افتراضي: 12 أسبوعاً، 7 أيام/أسبوع، **10 ألعاب لكل يوم** (بدل 3-5 الحالية).
  - توزيع متنوّع على أنواع `game_key` المسجّلة في `src/features/adhd/games/registry.ts` (CPT, N-Back, Stroop, Go/No-Go, Memory, Inhibition…).
  - شرط: لا يتكرّر نفس `game_key` أكثر من مرّتين/يوم، ويُغطّى كل focusArea خلال الأسبوع.
  - توليد على دفعات أسبوعية لتجنّب timeout.

### الحفظ والاسترجاع
- البرنامج محفوظ في `adhd_programs / adhd_program_days / adhd_program_games`.
- إضافة فهرس `adhd_programs(user_id, status)`.
- زرّ "الرجوع لتمارين الذكاء الاصطناعي" يفتح الجدول من الـ DB مباشرة بدون أي استدعاء AI.

### علامة "تم اللعب"
- العمود `adhd_program_games.completed` موجود ويُحدَّث بعد جلسة اللعب (في `ADHDGamePlay`). نضمن:
  - بعد انتهاء جلسة `adhd_game_sessions` → تحديث `completed=true` و `best_score`.
  - في `ADHDProgramDay`: زرّ "ابدأ" يصبح ✓ أخضر + "تمت" مع زرّ ثانوي صغير "إعادة".
  - شريط تقدّم اليوم x/10 وشريط البرنامج.

### تحسينات تجربة
- Skeleton + رسائل تحميل واضحة.
- فلتر "غير مكتمل/مكتمل" في صفحة اليوم.
- منع فتح يوم مستقبلي (موجود) + إظهار "اليوم" بشارة.

---

## 3) قاعدة البيانات (تغييرات صغيرة)

```sql
-- فهارس لتسريع البحث عن البرنامج النشط
CREATE INDEX IF NOT EXISTS idx_autism_programs_active
  ON public.autism_programs(child_profile_id, status);

CREATE INDEX IF NOT EXISTS idx_adhd_programs_active
  ON public.adhd_programs(user_id, status);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_autism_program_games_day
  ON public.autism_program_games(day_id);
CREATE INDEX IF NOT EXISTS idx_adhd_program_games_day
  ON public.adhd_program_games(day_id);
CREATE INDEX IF NOT EXISTS idx_autism_game_sessions_pg
  ON public.autism_game_sessions(program_game_id);
```

لا حاجة لجداول جديدة؛ لا تغيير على RLS (السياسات الحالية كافية).

---

## 4) ملفات ستُعدَّل

| الملف | التغيير |
|---|---|
| `supabase/functions/autism-generate-program/index.ts` | افتراضي 90 يوم × 10 ألعاب، توليد أسبوعي (chunk=7)، قواعد تنويع |
| `supabase/functions/adhd-program-generate/index.ts` | 12 أسبوع × 7 أيام × 10 ألعاب، توليد أسبوعي، توزيع focus |
| `src/pages/damij/autism/AutismTherapy.tsx` | تحويل مباشر للبرنامج النشط أو شاشة "إنشاء لأول مرة" |
| `src/pages/damij/autism/AutismTherapyPlan.tsx` | حذف التوليد التلقائي → redirect إلى البرنامج (أو حذف الصفحة كلياً) |
| `src/pages/damij/autism/AutismProgramSetup.tsx` | افتراضي 90، فحص فوري للبرنامج النشط، تحسين شاشة التقدم |
| `src/pages/damij/autism/AutismProgramCalendar.tsx` | شريط تقدم بالـ 900 لعبة، Skeleton |
| `src/pages/damij/autism/AutismDayView.tsx` | شارة "تم اللعب" بارزة، فلتر، تعطيل اللعب المكرر مع تأكيد |
| `src/pages/damij/adhd/ADHDHome.tsx` | بطاقة "متابعة البرنامج الحالي" عند وجوده |
| `src/pages/damij/adhd/ADHDProgramSetup.tsx` | فحص برنامج نشط → تحويل، defaults: 12 أسبوع/10 ألعاب |
| `src/pages/damij/adhd/ADHDProgramCalendar.tsx` | شريط تقدّم بالألعاب الكلية، Skeleton |
| `src/pages/damij/adhd/ADHDProgramDay.tsx` | شارة "تم اللعب" + فلتر + شريط x/10 |
| `src/pages/damij/adhd/ADHDGamePlay.tsx` | ضمان تحديث `completed=true` بعد كل جلسة |
| Migration واحدة | الفهارس أعلاه |

---

## ملاحظات تقنية

- **زمن التوليد**: 90 يوم × 10 ألعاب ≈ 13 دفعة أسبوعية × ~25 ثانية = ~5 دقائق أسوأ حالة، مع شريط تقدّم واقعي. التوليد يحدث **مرّة واحدة** فقط مدى حياة الطفل.
- **fallback AI**: نفس استراتيجية المشروع (مفاتيح Gemini المتعدّدة ثم Lovable Gateway) — لا تغيير في الأسرار.
- **التراجع الآمن**: إن فشلت دفعة واحدة، نُعيد المحاولة دفعتين قبل إيقاف وإظهار رسالة، ولا نحفظ برنامجاً ناقصاً.
- **التوافق**: البيانات القديمة تبقى صالحة (الجداول لم تتغيّر هيكلياً)؛ البرامج التي عمرها أقل من 90 يوماً تُكمل كما هي.
