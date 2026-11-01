# الطرفية (Remote Terminal)

ترسل طلبات من صفحة `/terminal` في المنصة إلى **Claude Code** أو **Antigravity** على جهاز رئيس المنصة.

## المكوّنات
- **قاعدة البيانات:** `supabase/migrations/20261101210000_remote_terminal.sql`، وفيها جداول `remote_devices` و`remote_jobs` و`remote_job_chunks` ودوال `remote_bridge_*`.
- **الصفحة:** `src/pages/terminal/TerminalPage.tsx`، ومعها `src/components/terminal/`.
- **الجسر:** `public/zarwa-bridge.mjs`، ملف Node واحد بلا مكتبات، يُنزَّل من `https://<الموقع>/zarwa-bridge.mjs`.

## التشغيل
1. من `/terminal` اضغط **ربط جهاز**، وانسخ الأوامر الثلاثة التي تظهر.
2. على الجهاز:
   ```bash
   mkdir -p ~/.zarwa-bridge && curl -fsSL https://<الموقع>/zarwa-bridge.mjs -o ~/.zarwa-bridge/zarwa-bridge.mjs
   cd ~/مجلد-المشروع && node ~/.zarwa-bridge/zarwa-bridge.mjs pair <الرمز>
   node ~/.zarwa-bridge/zarwa-bridge.mjs            # أو install-service ليعمل دائماً
   ```
3. الأمر `node ~/.zarwa-bridge/zarwa-bridge.mjs check` يفحص الإعداد والأدوات والاتصال، دون أن يلمس أي طلب.

## الإعداد (`~/.zarwa-bridge/config.json`)
| الحقل | الافتراضي | المعنى |
|---|---|---|
| `workdir` | المجلد الذي نُفّذ فيه `pair` | المجلد الذي يعمل فيه Claude |
| `permissionMode` | `acceptEdits` | يقرأ ويعدّل الملفات. أوامر الطرفية تحتاج `allowedTools`. القيمة `plan` للقراءة فقط، و`bypassPermissions` تسمح بكل شيء (بحذر) |
| `allowedTools` | `[]` | مثل `["Bash(npm run build)", "Bash(git status)"]` |
| `maxMinutes` | `30` | الحد الأقصى لمدة الطلب الواحد |
| `model` | — | نموذج محدد لـ Claude (اختياري) |

## الأمان
- **لا اتصال وارد:** الجسر يسأل المنصة كل ثانيتين، ولا يفتح أي منفذ على الجهاز.
- **من يرسل:** رئيس المنصة فقط يستطيع ربط الأجهزة وإرسال الطلبات، وهذا مفروض في سياسات RLS.
- **سر الجهاز:** يُولَّد في المتصفح، ويُحفظ في المتصفح وعلى الجهاز فقط. قاعدة البيانات تحفظ بصمة SHA-256 لمفتاح الدخول المشتق منه فقط، ولا تسمح بقراءتها.
- **توقيع كل طلب:** يُوقَّع بـ HMAC-SHA256 بسر الجهاز. الجسر يرفض الطلب غير الموقّع، أو الأقدم من 10 دقائق، أو المنفَّذ سابقاً. لذلك سرقة جلسة المنصة أو الوصول لقاعدة البيانات لا يكفيان لتشغيل أي شيء.
- **الإلغاء:** "إلغاء الربط" يوقف الجهاز فوراً، و"إيقاف" يقتل عملية Claude الجارية.

## Antigravity
يُفتح الطلب بأمر `antigravity-ide chat --mode agent`. الوكيل يعمل داخل التطبيق ويظهر ردّه هناك، لأن Antigravity لا يوفّر وضعاً يعيد الرد إلى الطرفية كما يفعل Claude Code.
