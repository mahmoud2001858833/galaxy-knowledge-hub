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

## الجسر إلى جهاز الرئيس (Claude Code وأوامر Shell)
الأوامر `claude <prompt>` و`claude` (وضع المحادثة) و`sh <command>` و`$ <command>` و`shell` (وضع الطرفية) تُنفَّذ على جهاز الرئيس عبر `scripts/local-bridge.mjs`.

- **قاعدة البيانات:** `supabase/migrations/20261101230000_terminal_bridge.sql`، وفيه جداول `bridge_devices` و`bridge_jobs` و`bridge_job_chunks`، والعمودان `allow_claude` و`allow_shell` في `usage_quotas`.
- **المسار:** يمرّ الأمر بالخطوات التالية:
  1. فحوصات `terminal_begin_command()` نفسها.
  2. التحقق من `allow_claude` أو `allow_shell`، علماً أن الرئيس مسموح له دائماً.
  3. يُنشأ صف في `bridge_jobs` موقّعاً بـ `HMAC(HMAC(BRIDGE_MASTER_KEY, 'bridge-device:'+id), payload)`.
  4. يرنّ "جرس" Realtime على القناة `bridge-<device_id>`.
  5. يستلم الجسر الأمر بمفتاح جهازه، ويتحقق من التوقيع، وينفّذ، ويبث المخرجات.
  6. يتابع المتصفح المهمة عبر Realtime، وليس عبر الدالة السحابية، لذلك لا حد زمنياً على المهام الطويلة.
- **زر الإيقاف:** إنهاء الجلسة (أو الحظر أو سحب الصلاحية أو انتهاء الوقت) يُلغي مهامها عبر trigger. الجرس يخبر الجسر فيقتل مجموعة العمليات كلها (SIGTERM ثم SIGKILL). `Ctrl+C` يوقف المهمة الحالية فقط.
- **حماية جهازك من المستخدمين الآخرين:**
  - Shell مقفل لهم في `~/.zarwa-bridge/config.json` (`shell.allowOthers: false`) حتى لو فُعّل لهم في المنصة.
  - Claude يعمل لهم بوضع `plan` للقراءة فقط (`claude.othersPermissionMode`).
  - مدة المهمة 5 دقائق لهم و30 للرئيس (`maxMinutes`).

### الإعداد لمرة واحدة
1. سر التوقيع في Edge Function secrets:
   `supabase secrets set BRIDGE_MASTER_KEY=$(openssl rand -hex 32) --project-ref esifpjjehdnpkhyilctv`
2. من `/admin?tab=terminal` اضغط **ربط جهازي**، ثم في مجلد المشروع:
   `npm run bridge -- pair <الرمز>`
3. شغّل الجسر: `npm run bridge`، أو `npm run bridge -- install-service` ليعمل دائماً في الخلفية على macOS.

الأمر `npm run bridge -- check` يفحص الإعداد والاتصال دون أن يغيّر شيئاً.
