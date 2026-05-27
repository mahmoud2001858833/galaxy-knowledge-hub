
## الهدف

تطوير نظام التوحد بثلاث محاور:
1. **نموذج تعريف موحّد** للطفل وولي الأمر يُملأ مرة واحدة عند الدخول، ولا يُطلب من جديد عند التشخيص أو العلاج.
2. **تدفّق تشخيص محسّن** بخيارين: استبيان أولي من ولي الأمر → ألعاب مخصّصة بالذكاء الاصطناعي، أو الذهاب مباشرة للألعاب التشخيصية.
3. **10 ألعاب تشخيص/علاج** عالية التفاعلية مع نطق الأسئلة، استخدام اسم الطفل، وتكيّف ديناميكي حسب الحالة.

---

## 1) نموذج المعلومات الموحّد (Onboarding مرة واحدة)

### التغييرات
- توسيع `AutismOnboardingModal` ليشمل:
  - اسم الطفل ✅ (موجود)
  - عمر الطفل بالسنوات ✅ (موجود)
  - **اسم ولي الأمر** (جديد)
  - بريد ولي الأمر ✅ (موجود)
- إضافة عمود `parent_name` إلى جدول `autism_child_profiles` عبر migration.
- حفظ كامل في `localStorage` تحت `autism_active_profile` + في الجدول.
- **منع إعادة طلب البيانات**: عند الدخول إلى `/damij/autism/diagnosis` أو `/therapy`، إذا كان البروفايل موجوداً → استخدم البيانات مباشرة بدون أي نموذج إضافي.
- ربط البريد والاسم تلقائياً بكل تقرير جلسة/يومي يُرسَل.

---

## 2) تدفّق التشخيص الجديد

عند الضغط على "التشخيص" في `/damij/autism`:

```text
┌─────────────────────────────────────────┐
│ AutismDiagnosisChoice (صفحة جديدة)      │
├─────────────────────────────────────────┤
│  خيار A: 📝 استبيان أولي لولي الأمر     │
│   → 8-12 سؤال ذكي (سلوك, لغة, حسي)     │
│   → يولّد AI ألعاب مخصّصة 100% للطفل   │
│                                         │
│  خيار B: 🎮 ابدأ بالألعاب مباشرة        │
│   → 10 ألعاب تشخيصية كاملة             │
│   → تستخلص AI الحالة من نتائج الألعاب  │
└─────────────────────────────────────────┘
```

- **خيار A** (`ParentIntakeQuestionnaire`): يعرض أسئلة قابلة للنطق، يُرسل الإجابات لـ edge function `autism-generate-diagnostic-games` مع `parentIntake` كسياق إضافي → يولّد قائمة ألعاب موزونة على نقاط الضعف.
- **خيار B**: ينطلق مباشرة في تشغيل قائمة الألعاب العشر القياسية.
- **في الحالتين** ينتهي المسار بـ `AutismDiagnosisReport` يجمع نتائج الألعاب + الاستبيان (إن وُجد) ويولّد تقريراً نهائياً ويرسله لبريد ولي الأمر.

---

## 3) محرك الألعاب التشخيصية المحسّن

### تحسينات عرضية (تُطبّق على كل لعبة)
- **شاشة تمهيد قبل البدء**: زر «🔊 اسمع التعليمات» يقرأ النص بصوت عربي عبر `useArabicSpeech` / ElevenLabs.
- **نطق الخيارات والأسئلة أثناء اللعب** (toggle قابل للتحكم من الإعدادات).
- **استخدام اسم الطفل** في كل تشجيع، تعليمات، رسائل نجاح/فشل (`childName` props موجودة في `GameTemplateProps` — توسيع استخدامها لكل لعبة).
- **مؤشّر تقدّم** (1/10, 2/10...).
- **تكيّف ديناميكي**: إذا أخفق الطفل مرتين → تبسيط تلقائي للصعوبة. إذا نجح بسرعة → رفع الصعوبة. (`adaptiveDifficulty` helper).
- **تسجيل مفصّل** لكل محاولة: زمن الاستجابة، عدد المحاولات، الدقة، النمط (مع `useGameMoveLogger` الموجود).

### الألعاب العشر (مع ربط بالقوالب الموجودة/الجديدة)

| # | اللعبة | النوع | القالب |
|---|--------|------|--------|
| 1 | تمييز المشاعر | ⭐ كلاهما | `emotion_cards` (موجود) — تحسين |
| 2 | التركيز البصري (ما الذي تغيّر؟) | 🔍 تشخيص | `spot_difference` (موجود) — تحسين |
| 3 | ترتيب القصة | ⭐ كلاهما | `story_sequence` (موجود) — تحسين |
| 4 | المطابقة والتصنيف | 🔍 تشخيص | **`category_match` (جديد)** |
| 5 | محادثة مع شخصية | 💚 علاج | `social_choice` (موجود) — توسيع للحوار |
| 6 | الإيقاع والتقليد | ⭐ كلاهما | `rhythm_turns` (موجود) — تحسين |
| 7 | ضبط الاندفاع (Go/No-Go) | ⭐ كلاهما | **`impulse_control` (جديد)** |
| 8 | فقاعات الكلام | 💚 علاج | **`speech_bubbles` (جديد)** |
| 9 | تتبّع النظرة | 🔍 تشخيص | `look_with_me` (موجود) — تحسين |
| 10 | الأحاسيس والألوان | ⭐ كلاهما | **`feelings_colors` (جديد)** |

→ 4 قوالب جديدة + تحسين 6 قوالب قائمة.

### تنويع حسب الطفل
- التسلسل، الصعوبة الابتدائية، ومدة كل لعبة تُحسب من:
  - عمر الطفل
  - نتائج الاستبيان (إن وُجد)
  - تاريخ الجلسات السابقة في `autism_game_sessions`
- يُنفّذ في edge function `autism-generate-diagnostic-games` (موجودة — توسيعها لإعادة 10 ألعاب بدل 4-5).

---

## التفاصيل التقنية

### قاعدة البيانات (migration واحد)
```sql
ALTER TABLE public.autism_child_profiles 
  ADD COLUMN IF NOT EXISTS parent_name TEXT;

ALTER TABLE public.autism_child_profiles 
  ADD COLUMN IF NOT EXISTS intake_answers JSONB DEFAULT '{}'::jsonb;
```
(GRANTs و RLS موجودة سابقاً على الجدول.)

### الملفات الجديدة
- `src/pages/damij/autism/AutismDiagnosisChoice.tsx`
- `src/pages/damij/autism/ParentIntakeQuestionnaire.tsx`
- `src/pages/damij/autism/AutismDiagnosisReport.tsx`
- `src/features/autism/games/templates/CategoryMatch.tsx`
- `src/features/autism/games/templates/ImpulseControl.tsx`
- `src/features/autism/games/templates/SpeechBubbles.tsx`
- `src/features/autism/games/templates/FeelingsColors.tsx`
- `src/features/autism/ui/GameIntroScreen.tsx` (شاشة التمهيد + نطق)
- `src/features/autism/ui/useGameSpeech.ts` (hook موحّد للنطق)
- `src/features/autism/ui/adaptiveDifficulty.ts`

### الملفات المُعدَّلة
- `src/components/damij/AutismOnboardingModal.tsx` — إضافة حقل `parent_name`.
- `src/features/autism/games/templates/registry.ts` — تسجيل القوالب الأربعة الجديدة.
- `src/features/autism/games/templates/types.ts` — إضافة meta للجديد.
- `src/pages/damij/autism/AutismLayout.tsx` — توجيه التشخيص للصفحة الجديدة وتجاوز طلب البيانات إن وُجدت.
- `src/pages/damij/autism/AutismGamePlayer.tsx` — دمج `GameIntroScreen` قبل بدء كل لعبة + شريط تقدّم.
- 6 ملفات قوالب موجودة لتحسين التفاعلية والنطق.
- `supabase/functions/autism-generate-diagnostic-games/index.ts` — إخراج 10 ألعاب موزونة على مدخلات الاستبيان.

### Routing الجديد
```
/damij/autism/diagnosis           → AutismDiagnosisChoice
/damij/autism/diagnosis/intake    → ParentIntakeQuestionnaire
/damij/autism/diagnosis/games     → AutismGamePlayer (في وضع تشخيص متسلسل)
/damij/autism/diagnosis/report    → AutismDiagnosisReport
```

### النطق
- استخدام Web Speech API (`speechSynthesis`) كافتراضي مجاني.
- زر تشغيل/إيقاف عام في الـ Layout (يحفظ التفضيل في `localStorage`).
- (اختياري لاحقاً) ElevenLabs لجودة أعلى عبر edge function.

---

## ترتيب التنفيذ المقترح

1. Migration: `parent_name` + `intake_answers`.
2. تحديث `AutismOnboardingModal` + منع تكرار الطلب في صفحات التشخيص/العلاج.
3. صفحة `AutismDiagnosisChoice` + Routing.
4. `useGameSpeech` + `GameIntroScreen` + `adaptiveDifficulty`.
5. القوالب الأربعة الجديدة + تسجيلها في الـ registry.
6. تحسين القوالب الستة الموجودة (نطق + اسم الطفل + تكيّف).
7. `ParentIntakeQuestionnaire` + توسيع edge function لتوليد 10 ألعاب.
8. `AutismDiagnosisReport` + ربط البريد التلقائي.
