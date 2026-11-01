# الطرفية السحابية (`/terminal`)

طرفية تعمل بالكامل في المتصفح باستخدام xterm.js، ولا تحتاج أي برنامج على جهاز المستخدم. الأوامر تُنفَّذ في Edge Function اسمها `web-terminal-exec`.

## المكوّنات
| الجزء | الملف |
|---|---|
| قاعدة البيانات | `supabase/migrations/20261101220000_web_terminal.sql` |
| الدالة السحابية | `supabase/functions/web-terminal-exec/index.ts` |
| الطرفية | `src/components/terminal/WebTerminal.tsx` و`src/pages/terminal/TerminalPage.tsx` |
| لوحة الأدمن | `src/components/admin/TerminalAdminPanel.tsx`، في تبويب "الطرفية والصلاحيات" ضمن `/admin?tab=terminal` |

النشر: `supabase functions deploy web-terminal-exec --use-api --project-ref esifpjjehdnpkhyilctv`

## كيف يُنفَّذ الأمر
1. يرسل المتصفح الأمر مع JWT المستخدم.
2. تتحقق الدالة من الـ JWT.
3. تستدعي الدالة `terminal_begin_command()`، وهي تتحقق داخل قاعدة البيانات وفي عملية واحدة من خمسة أشياء:
   - الجلسة نشطة ولم تنتهِ مدتها.
   - الصلاحية مفعّلة.
   - الحساب غير محظور.
   - لم يُتجاوز الحد اليومي ولا الكلي.
   - لم يُتجاوز حد الأوامر في الدقيقة.
   
   ثم تعدّ الأمر وتسجّله.
4. يُنفَّذ الأمر من قائمة الأوامر المعرّفة في الدالة، وتُبث المخرجات سطراً سطراً (NDJSON).
5. تُستدعى `terminal_finish_command()` لتسجيل النتيجة.

دوال العدّ والتسجيل لا يستدعيها إلا `service_role`، أي الدالة السحابية فقط. المتصفح يقرأ صفوفه فقط، ولا يكتب في هذه الجداول.

**لا يوجد shell:** لا تُنفَّذ أوامر نظام ولا SQL حر، وأي أمر خارج القائمة يُرفض.

## الأوامر
- **للجميع:** `help` و`whoami` و`status` و`quota` و`history [n]` و`date` و`echo` و`sections`، إضافة إلى `clear` و`exit` (محليّان ولا يُحتسبان).
- **للرئيس فقط:**
  - `stats` و`db health|tables|migrations` و`sessions` و`users`.
  - `grant <email> [daily]` و`revoke <email>` و`limit <email> <daily> [total]`.
  - `kill <email|session> [--ban] [reason]` و`unban <email>` و`logs [email] [n]`.

## الصلاحيات والحصص
- **الرئيس** (`team_members` بدور principal): بلا حدود وبلا انتهاء جلسة، ولا يمكن حظره.
- **المستخدمون الآخرون:** يحتاجون صفاً في `usage_quotas` يضيفه الرئيس. يرتبط الصف بالحساب لحظة الإضافة، لذلك يجب أن يكون صاحب الإيميل مسجلاً.
- **الحدود:** يومي (يُصفَّر بتوقيت عمّان)، وكلي، وبالدقيقة، ومدة الجلسة.
- **زر الإيقاف:** ينفّذه `terminal_kill()`. تغيّر حالة الجلسة يصل للمتصفح عبر Realtime فيقفل الطرفية فوراً، وكذلك سحب الصلاحية أو الحظر من الجدول، عبر trigger.
- **الجداول:**
  - `usage_quotas` للصلاحيات والحصص.
  - `user_terminal_sessions` للجلسات.
  - `terminal_command_logs` لكل الأوامر، بما فيها المرفوضة.

## ملاحظة عن اللغة
مخرجات الطرفية بالإنجليزية لأن xterm لا يعرض العربية من اليمين لليسار. الأسباب والرسائل العربية تظهر في واجهة الصفحة نفسها.
