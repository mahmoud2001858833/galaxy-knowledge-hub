# نظام فريق العمل والمهام

نظام لإدارة فريق المسابقة. قاعدة البيانات: `supabase/migrations/20261101200000_team_management.sql`، والواجهة: `src/components/team/`.

## أين يظهر
- لوحة الأدمن ← **لوحة تحكم الموظفين** (للرئيس والمشرفين فقط).
- صفحة `/team`، ورابطها في قائمة الحساب ("فريق العمل ومهامي").
- الملف الشخصي `/profile`: تبويب لكل دور يحمله المستخدم.

## الأدوار
| الدور | ما يلزم لإغلاق المهمة | أين تذهب النتيجة |
|---|---|---|
| المتكلم | صور الزيارة + اسم المدرسة + أسماء المعلمات | الإدارة |
| مسؤول الصفحة | وصف تفصيلي (20 حرفاً+) + صورة | الإدارة |
| مسؤول رفع الملفات | وصف تفصيلي + صورة | الإدارة |
| المدقق | تفاصيل المشكلة + مكانها + صورة | الإدارة |
| مسؤول الذكاء الاصطناعي | وصف ما قام به (صورة اختيارية) | الإدارة |

- **كل النتائج تذهب للإدارة فقط** (الرئيس + المشرف). لا يوجد تحويل تلقائي بين الأدوار: الإدارة تقرأ تقرير المدقق أو زيارة المتكلم، ثم تُسند المهمة التالية بنفسها (منذ 2026-11-09).
- **الرئيس** ثابت (`jowmahmoud6@gmail.com`)، لا يمكن حذفه أو تعديله.
- **الرئيس والمشرف**:
  - يضيفون الأعضاء ويسندون المهام.
  - يضيفون متطلبات إضافية، ويعيدون فتح المهام أو يحذفونها.
  - يقرؤون كل المحادثات، العامة والخاصة. الأعضاء يرون تنبيهاً بذلك في المحادثة.

## قواعد مهمة
- **ربط الدور بالحساب:** يُربط الدور بالحساب (`user_id`) لحظة الإضافة، لذلك يجب أن يكون صاحب الإيميل قد سجّل في المنصة. السبب أن تأكيد الإيميل تلقائي في المشروع: لو اعتمدنا على نص الإيميل وحده، لاستطاع أي شخص أن يسجّل إيميلاً مضافاً لم يُسجَّل بعد ويأخذ دوره.
- **التحقق داخل قاعدة البيانات:** إغلاق المهام يتم فقط عبر `team_complete_task()`، التي تتحقق من متطلبات كل دور. الواجهة لا تستطيع تجاوزها.
- **الصور:** في حاوية خاصة `team-files`. كل عضو يرفع إلى مجلده فقط، وكل أعضاء الفريق يستطيعون القراءة.
- **المهام المتأخرة:** هي المهام غير المنجزة التي تجاوزت موعد التسليم.

## First one to take a task wins (2026-11-05)
Tasks left to a whole role (`assignee_user_id` NULL) go to whoever presses «ابدأ» first: `team_start_task()` locks the row, and a member who comes later gets `TASK_TAKEN` («سبقك زميلك… انتظر المهمة القادمة»). The claimer's tab also sends a Realtime broadcast on `team-task-claims`, so the others' lists refresh and an open dialog for that task closes with the same message (RLS hides the claimed row from them, which postgres_changes does not announce).

## Scheduled tasks (2026-11-09)
Migration `20261109100000_team_leads_only_and_scheduled_tasks.sql`.
- A lead can set «وقت إرسال المهمة للعضو» (`team_tasks.publish_at`), e.g. the «الساعة 8 صباحاً» button. Empty = send now.
- Before that time the task is visible to the leads only (column «مهام مجدولة»); RLS hides it from members, and `team_start_task()` / `team_complete_task()` refuse it.
- pg_cron job `team-scheduled-tasks` runs every minute: `team_dispatch_scheduled_tasks()` calls the `team-task-email` Edge Function with `{scheduled: true}` only when a task is due. The function claims due rows by setting `emailed_at` (so each is sent once) and emails them. The row update also reaches members through Realtime; their task list also re-reads every minute.
- «أرسلها الآن» in the task dialog sets `publish_at = now()`; the scheduler sends it within a minute.
