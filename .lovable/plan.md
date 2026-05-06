# خطة تطوير نظام ألعاب التوحد الذكي

## 1) قاعدة البيانات (Supabase)

جداول جديدة:
- `autism_programs`: البرنامج الكامل لكل طفل (child_profile_id, share_token فريد، start_date, total_days، status). يُولَّد **مرة واحدة** ويُحفَظ.
- `autism_program_days`: يوم رقم N داخل البرنامج (program_id, day_index, theme_ar, focus_skill).
- `autism_program_games`: قائمة الألعاب لكل يوم (day_id, order_index, template_id, title_ar, instructions_ar, difficulty, duration_sec, target_skill, ai_config jsonb).
- `autism_game_moves`: تتبّع كل حركة يقوم بها الطفل أثناء اللعبة (session_id, t_ms, event_type, payload jsonb, is_correct).
- `autism_day_reports`: تقرير AI يومي (day_id, summary_ar, strengths, weaknesses, score, generated_at).
- `autism_progress_snapshots`: مؤشرات تطور أسبوعية/شهرية مقارنة ببداية البرنامج.

تعديلات:
- `autism_game_sessions`: إضافة `program_id`, `day_id`, `move_count`, `wrong_attempts`, `time_to_first_action_ms`.

سياسات RLS: كل طفل يخص ولي أمره (user_id). صفحة المشاركة تُقرأ عبر `share_token` ضمن سياسة عامة محدودة (select فقط على الجداول اللازمة).

## 2) Edge Functions

- `autism-generate-program` (جديدة): تأخذ ملف الطفل + مدة البرنامج (أسابيع/أشهر) وتُولّد الجدول الكامل دفعة واحدة بنموذج Gemini مع تنوّع قوالب الألعاب وتدرّج الصعوبة، وتُخزّنه في `autism_programs/days/games`. لا يعاد التوليد لاحقًا.
- `autism-analyze-day` (جديدة): تستقبل سجلات `autism_game_moves` لليوم وتنتج تقرير أداء + توصيات.
- `autism-analyze-progress` (جديدة): تقارن آخر أسبوع/شهر مع البداية وتعطي مؤشرات تطور.
- `autism-screen-analyze` (تحسين): استبيان أعمق (أسئلة سلوكية + قياسات من ألعاب الفحص الحالية) لرفع دقة تحديد المستوى الوظيفي.

كل الوظائف تستخدم Lovable AI Gateway (لا نضع أي API key مكشوف؛ سنتجاهل المفتاح المُرسَل في الرسالة لأسباب أمنية).

## 3) قوالب ألعاب جديدة لتقليل التكرار

نضيف قوالب جديدة عالية الجودة بجانب الموجودة:
- `memory_grid` ذاكرة بصرية، `cause_effect` سبب/نتيجة، `sorting_categories` تصنيف، `feelings_story` قصة مشاعر، `breath_balloon` تنظيم تنفس، `mirror_draw` تقليد رسم، `daily_routine` تسلسل يومي، `safe_choices` سلامة، `eye_contact_focus` تركيز على الوجوه.

كل قالب يبلّغ الـAI بكل حركة عبر `onMove({type, payload, isCorrect})` يتم تجميعها في batch وحفظها في `autism_game_moves`.

تحديث `templates/types.ts` لإضافة `onMove`، وتحديث `AutismGamePlayer` لتمرير المُسجِّل وحفظ الحركات.

## 4) الواجهات (Frontend)

- `AutismProgramSetup.tsx`: اختيار مدة البرنامج (أسبوعين/شهر/شهرين/3 أشهر) → استدعاء `autism-generate-program` مرة واحدة.
- `AutismProgramCalendar.tsx` (الصفحة الرئيسية بعد التوليد): جدول كامل بكل الأيام مع حالة (مكتمل/جاري/مغلق حتى تاريخه)، نسبة الإنجاز، زر دخول لكل يوم.
- `AutismDayView.tsx`: قائمة ألعاب اليوم مع تقدّم، أزرار تشغيل، وعند انتهاء آخر لعبة يظهر تقرير اليوم.
- تحديث `AutismGamePlayer.tsx`: بعد إنهاء اللعبة يظهر زرّان: **اللعبة التالية في نفس اليوم** و **العودة لقائمة اليوم** بدون إعادة توليد.
- `AutismChildPage.tsx` (`/autism/c/:shareToken`): صفحة دائمة لكل طفل تعرض البرنامج كاملاً + تقدمه.
- `AutismProgressDashboard.tsx`: رسوم بيانية لتطور المهارات، توقّع التحسن بعد شهر مبني على ميل الأداء.
- زر **نسخ الرابط المختصر** في صفحة الطفل (يستخدم `share_token`).
- أيقونة في هيدر `DamijLayout` (طفل) → تفتح صفحة الطفل النشط مباشرة.
- مشغّل موسيقى خلفية هادئة (تشغيل/إيقاف/مستوى صوت) كمكوّن `BackgroundMusicPlayer` متاح داخل صفحات الألعاب، مع 3-4 مقاطع هادئة في `public/autism-music/`.

## 5) تتبّع AI لكل حركة

- خطّاف `useGameMoveLogger(sessionId)` يجمع الأحداث محليًا ثم يرسلها دفعة عند انتهاء اللعبة.
- `autism-analyze-day` يستقبل كل حركات اليوم (صحيحة وخاطئة) ويصدر:
  - الأنماط (تسرّع، تردّد، نوع الأخطاء المتكررة).
  - مهارات تحسّنت/تحتاج تركيز.
  - توصيات للجلسة التالية.

## 6) تحسين اختبار الفحص

- إضافة محاور: حسّي، حركي دقيق، لغوي، تواصل بصري، مرونة معرفية.
- مزج درجات الاستبيان مع مقاييس ألعاب الفحص (زمن الاستجابة، ثبات الانتباه) لإصدار **مستوى دعم DSM-5 أدق + ملف وظيفي مفصّل** يُغذّي مولّد البرنامج.

## تفاصيل تقنية

```text
[Setup] -> generate-program (1x) -> programs/days/games  ──┐
                                                           ▼
[Calendar] -> [Day] -> [Game] --moves--> game_moves -> analyze-day -> day_reports
                                                           │
                                              analyze-progress -> snapshots
```

- **حول مفتاح Gemini المُرسَل**: لن نخزّنه في الكود لأسباب أمنية. سنعتمد `LOVABLE_API_KEY` الموجود (Lovable AI Gateway) ونمائل آلية fallback القائمة.
- جميع التعديلات تحترم RLS وتعزل بيانات كل ولي أمر، مع مسار قراءة عام عبر `share_token` فقط.
- لا تغييرات على بنية القسم الرئيسي للمنصة، التغييرات محصورة داخل `damij/autism`.

## نقاط تحتاج تأكيدك

1. مدة البرنامج الافتراضية المعروضة في الخيارات: (أسبوعان / شهر / شهران / 3 أشهر) — هل نضيف **مخصص**؟
2. الموسيقى: هل تريدها تعمل تلقائيًا عند بدء كل لعبة، أم تشغيل يدوي فقط؟
3. الرابط المختصر: عام (يفتح بدون تسجيل دخول للقراءة فقط) أم يتطلب تسجيل دخول ولي الأمر؟
