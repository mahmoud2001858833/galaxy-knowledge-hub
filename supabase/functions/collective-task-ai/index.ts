// Collective tasks (المهام الجماعية) — planning and sending.
//
// Actions (POST JSON):
//   { action: "plan", task_id }      admin only. Gemini turns the goals + final vision + days + people
//                                    into a day-by-day plan: subtasks with one owner each, acceptance
//                                    criteria, dependencies, milestones and risks. Saves it (status "planned").
//   { action: "send_now", task_id }  admin only. Sends the emails right away (status "active").
//   { action: "dispatch" }           called every minute by pg_cron (collective_dispatch_due). Claims the
//                                    scheduled tasks whose send time has come and emails them. Safe for
//                                    anyone to call: a task is only ever sent once.
//   { action: "assist", messages, draft }  admin only. The admin describes the task in their own words
//                                    (typed or spoken); returns the filled fields + what is still missing.
//   { action: "command", messages }  admin only. The Central Task AI: an agent with tools over collective
//                                    tasks and team tasks (list, follow up, create drafts, build plans...).
//                                    Anything that emails people comes back as pending_action, never runs.
//   { action: "confirm", pending }   admin only. Runs a pending_action the admin approved (send / schedule).
//
// Secrets: GOOGLE_API_KEY (Gemini), RESEND_API_KEY, TEAM_EMAIL_FROM, SITE_URL.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Cheapest models available to new Google keys; 3.5 only if 3.1 is not available (404).
const MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite"];
// Planning happens once per task and decides everything after it, so it uses a stronger model
// (a plan costs a few cents); Flash-Lite stays as the fallback. Everything else stays on Flash-Lite.
const PLAN_MODELS = ["gemini-flash-latest", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

type Task = {
  id: string; title: string; goals: string; final_vision: string; duration_days: number;
  send_at: string | null; status: string; plan: Plan | null; planner_notes?: string | null;
  postpone_policy?: string; project_slug?: string | null; batch_through?: string | null;
};
type Member = { id: string; email: string; focus: string | null; work_start?: string; work_end?: string; work_days?: number[] };
type PlanSubtask = {
  title: string; detail: string; assignee_email: string; day_from: number; day_to: number;
  acceptance: string[]; depends_on: number[]; covers: string[]; effort_hours: number;
};
type Plan = {
  summary: string;
  requirements: { id: string; text: string }[];
  uncovered?: string[];
  days: { day: number; focus: string; milestones: string[] }[];
  subtasks: PlanSubtask[];
  risks: { risk: string; mitigation: string }[];
  final_check: string[];
};

// ---------------------------------------------------------------- who is calling
async function requireAdmin(req: Request): Promise<string | Response> {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data, error } = await service.auth.getUser(token);
  if (error || !data?.user) return json({ error: "سجّل الدخول أولاً" }, 401);
  const { data: ok } = await service.rpc("collective_is_admin", { p_user_id: data.user.id });
  if (ok !== true) return json({ error: "هذه العملية للأدمن فقط" }, 403);
  return data.user.id;
}

// ---------------------------------------------------------------- Gemini
const PLAN_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    requirements: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { id: { type: "STRING" }, text: { type: "STRING" } },
        required: ["id", "text"],
      },
    },
    days: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          day: { type: "INTEGER" },
          focus: { type: "STRING" },
          milestones: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["day", "focus", "milestones"],
      },
    },
    subtasks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          detail: { type: "STRING" },
          assignee_email: { type: "STRING" },
          day_from: { type: "INTEGER" },
          day_to: { type: "INTEGER" },
          acceptance: { type: "ARRAY", items: { type: "STRING" } },
          depends_on: { type: "ARRAY", items: { type: "INTEGER" } },
          covers: { type: "ARRAY", items: { type: "STRING" } },
          effort_hours: { type: "NUMBER" },
        },
        required: ["title", "detail", "assignee_email", "day_from", "day_to", "acceptance", "depends_on", "covers", "effort_hours"],
      },
    },
    risks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { risk: { type: "STRING" }, mitigation: { type: "STRING" } },
        required: ["risk", "mitigation"],
      },
    },
    final_check: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["summary", "requirements", "days", "subtasks", "risks", "final_check"],
};

async function gemini(prompt: string, system: string, models = MODELS): Promise<{ text: string; model: string }> {
  const key = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("مفتاح Google غير مضبوط على الخادم (GOOGLE_API_KEY)");
  let last = "";
  for (const model of models) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 16000,
          responseMimeType: "application/json",
          responseSchema: PLAN_SCHEMA,
        },
      }),
      signal: AbortSignal.timeout(90_000),
    });
    if (r.status === 404) { last = `${model}: 404`; continue; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${j?.error?.message ?? "error"}`);
    const text = (j?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
    if (!text) throw new Error("Gemini returned an empty plan");
    return { text, model };
  }
  throw new Error(`no Gemini model available (${last})`);
}

const SYSTEM = `أنت مدير مشاريع تقني خبير ودقيق جداً لمنصة "ذروة العلم" التعليمية الأردنية.
تستلم مهمة جماعية فيها "التصور النهائي" وقد يكون مواصفات مشروع كاملة (أقسام، مكونات، نصوص، ألوان، سلوك تفاعلي).
مهمتك تحويلها إلى خطة تنفيذ يومية دقيقة لا يضيع فيها أي بند.

الخطوة 1 — تحليل المواصفات (requirements):
- فكّك الأهداف والتصور النهائي إلى متطلبات مرقّمة R1، R2، ... كل متطلب بند واحد قابل للتحقق.
  كن دقيقاً جداً: كل عنوان، وكل زر، وكل خيار، وكل سؤال، وكل رقم يُحسب، وكل بطاقة، وكل بند في قائمة،
  وكل لون أو شرط (التجاوب، التخزين المحلي...) متطلب مستقل. المواصفات المتوسطة تعطي عادةً 15-30 متطلباً
  (مثال: "R4: زر «ابدأ رحلة التطوع الآن 🚀» ينزل تلقائياً لمعالج البوصلة").
- انسخ النصوص الحرفية المطلوبة (عناوين، أزرار، روابط) كما هي داخل نص المتطلب.
- لا تهمل أي قسم أو مكوّن أو شرط (التجاوب مع الجوال، التخزين المحلي، الألوان...).

الخطوة 2 — المهام الفرعية (subtasks):
- كل مهمة فرعية لها مالك واحد فقط من قائمة البريد المعطاة حرفياً، ولا تخترع بريداً.
- covers: أرقام المتطلبات التي تنجزها المهمة (مثل ["R3","R4"]). يجب أن يُغطّى كل متطلب بمهمة واحدة على الأقل.
- مهام ملموسة تقنياً: ماذا يُبنى بالضبط (مكوّن، قسم، منطق، بيانات، اختبار)، وليس "العمل على التصميم".
- detail: خطوات التنفيذ المختصرة + النصوص الحرفية المطلوبة من المواصفات.
- acceptance: 2-4 معايير قبول قابلة للتحقق مأخوذة من المواصفات نفسها (لا عبارات عامة).
- effort_hours: تقدير واقعي بالساعات. لا تتجاوز ~6 ساعات عمل للشخص في اليوم الواحد.
- وزّع العمل بعدل وحسب "التركيز" المكتوب بجانب كل شخص.
- العمل متوازٍ: كل شخص لديه عمل في كل يوم من أيام المهمة (إلا إذا قالت تعليمات الأدمن غير ذلك)،
  ولا تترك أحداً بلا مهمة بينما يعمل غيره. اهدف إلى (عدد الأشخاص × عدد الأيام) مهمة فرعية على الأقل.
- الأولوية التقنية إلزامية: البيانات والباك إند (الجداول، الصلاحيات، الدوال، الواجهات البرمجية) أولاً، ثم الأساس
  والهوية البصرية، ثم الفرونت إند (الأقسام والمكونات)، ثم الربط بين الواجهة والبيانات والتفاعل، ثم التجاوب والاختبار، ثم المراجعة النهائية.
  كل مهمة فرونت إند تستعمل بيانات أو دالة يجب أن تعتمد (depends_on) على مهمة الباك إند التي تبنيها.
- التسليم آلي ومُوقّت: كل مهمة تصل لصاحبها فقط داخل "وقت عمله" المكتوب بجانبه، وفقط بعد اكتمال كل ما تعتمد عليه؛
  وإلا تتأجل ويُبلَّغ بالسبب. لذلك: اجعل الاعتماديات حقيقية وضرورية فقط (لا تربط مهاماً مستقلة)، وضع المهام التي
  يعتمد عليها الآخرون عند أشخاص وقتهم مبكر في اليوم، ولا تعطِ أي شخص في اليوم أكثر من ساعات وقته.
- day_from وday_to بين 1 وعدد الأيام، وday_to >= day_from. اترك آخر يوم (أو آخر 20% من المدة) للاختبار والمراجعة والدمج.
- depends_on: أرقام ترتيب (تبدأ من 0) لمهام يجب أن تنتهي قبلها فقط (لا تعتمد مهمة على نفسها أو على ما بعدها).

الخطوة 3 — الجدول والمخاطر:
- days: سطر لكل يوم من 1 إلى عدد الأيام: تركيز اليوم ومعالم يجب أن تتحقق في نهايته.
- risks: المخاطر الحقيقية لهذا المشروع وكيف نتجنبها.
- final_check: قائمة فحص نهائية تقارن الناتج بالتصور النهائي بنداً بنداً.
- summary: ملخص الخطة في 3-4 أسطر.

اكتب بالعربية الفصحى الواضحة والمختصرة.`;

function buildPrompt(t: Task, members: Member[]) {
  const DAYS = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
  const people = members.map((m) => {
    const hours = m.work_start && m.work_end ? ` · وقت العمل ${m.work_start.slice(0, 5)}–${m.work_end.slice(0, 5)} (${((toMin(m.work_end) - toMin(m.work_start)) / 60).toFixed(1)} ساعة)` : "";
    const days = m.work_days && m.work_days.length < 7 ? ` · أيامه: ${m.work_days.map((d) => DAYS[d]).join("، ")}` : "";
    return `- ${m.email}${m.focus ? ` (التركيز: ${m.focus})` : ""}${hours}${days}`;
  }).join("\n");
  return `المهمة: ${t.title}
عدد الأيام: ${t.duration_days}

الأهداف:
${t.goals}

التصور النهائي (شكل النتيجة في النهاية):
${t.final_vision}

المشاركون (استعمل هذه العناوين حرفياً في assignee_email):
${people}${t.planner_notes?.trim() ? `

تعليمات الأدمن لتوزيع العمل (التزم بها بدقة):
${t.planner_notes.trim()}` : ""}`;
}

/** Keeps the model honest: owners from the list, days in range, dependencies only backwards. */
function cleanPlan(raw: Plan, t: Task, members: Member[]): Plan {
  const emails = new Map(members.map((m) => [m.email.toLowerCase(), m.email]));
  const firstEmail = members[0]?.email ?? "";
  const clampDay = (d: number) => Math.min(Math.max(Math.round(Number(d) || 1), 1), t.duration_days);
  const requirements = (raw.requirements ?? []).slice(0, 150)
    .map((r, i) => ({ id: String(r.id ?? `R${i + 1}`).trim().toUpperCase().slice(0, 10), text: String(r.text ?? "").trim().slice(0, 1000) }))
    .filter((r) => r.text);
  const reqIds = new Set(requirements.map((r) => r.id));
  const subtasks = (raw.subtasks ?? []).slice(0, 150).map((s, i) => {
    const from = clampDay(s.day_from), to = Math.max(from, clampDay(s.day_to));
    return {
      title: String(s.title ?? "").trim().slice(0, 300) || `مهمة ${i + 1}`,
      detail: String(s.detail ?? "").trim().slice(0, 4000),
      assignee_email: emails.get(String(s.assignee_email ?? "").toLowerCase()) ?? firstEmail,
      day_from: from,
      day_to: to,
      acceptance: (s.acceptance ?? []).map((a) => String(a).trim()).filter(Boolean).slice(0, 8),
      depends_on: [...new Set((s.depends_on ?? []).map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d < i))],
      covers: [...new Set((s.covers ?? []).map((c) => String(c).trim().toUpperCase()).filter((c) => reqIds.has(c)))],
      effort_hours: Math.min(200, Math.max(0, Math.round((Number(s.effort_hours) || 0) * 10) / 10)),
    };
  });
  const covered = new Set(subtasks.flatMap((s) => s.covers));
  const days = Array.from({ length: t.duration_days }, (_, k) => {
    const d = (raw.days ?? []).find((x) => Number(x.day) === k + 1);
    return { day: k + 1, focus: String(d?.focus ?? "").trim(), milestones: (d?.milestones ?? []).map(String).slice(0, 10) };
  });
  return {
    summary: String(raw.summary ?? "").trim(),
    requirements,
    uncovered: requirements.filter((r) => !covered.has(r.id)).map((r) => r.id),
    days,
    subtasks,
    risks: (raw.risks ?? []).slice(0, 15).map((r) => ({ risk: String(r.risk ?? ""), mitigation: String(r.mitigation ?? "") })),
    final_check: (raw.final_check ?? []).map(String).filter(Boolean).slice(0, 20),
  };
}

async function loadTask(id: string) {
  const { data: t, error } = await service.from("collective_tasks").select("*").eq("id", id).maybeSingle();
  if (error || !t) throw new Error("المهمة غير موجودة");
  const { data: members } = await service.from("collective_task_members").select("id,email,focus,work_start,work_end,work_days").eq("task_id", id).order("created_at");
  return { task: t as Task, members: (members ?? []) as Member[] };
}

class UserError extends Error { constructor(msg: string, public status = 400) { super(msg); } }

async function plan(taskId: string) {
  return json(await planCore(taskId));
}

async function planCore(taskId: string) {
  const { task, members } = await loadTask(taskId);
  if (!members.length) throw new UserError("أضف بريداً واحداً على الأقل قبل طلب الخطة");
  if (!["draft", "planned"].includes(task.status)) throw new UserError("لا يمكن تغيير خطة مهمة أُرسلت", 409);

  const { text, model } = await gemini(buildPrompt(task, members), SYSTEM, PLAN_MODELS);
  let raw: Plan;
  try { raw = JSON.parse(text); } catch { throw new UserError("رد الذكاء الاصطناعي ليس JSON صالحاً، جرّب مرة أخرى", 502); }
  const p = cleanPlan(raw, task, members);

  await service.from("collective_subtasks").delete().eq("task_id", taskId);
  if (p.subtasks.length) {
    const { error } = await service.from("collective_subtasks").insert(
      p.subtasks.map((s, i) => ({ task_id: taskId, position: i, ...s })),
    );
    if (error) throw error;
  }
  const { error } = await service.from("collective_tasks")
    .update({ plan: { ...p, model }, plan_generated_at: new Date().toISOString(), status: "planned" })
    .eq("id", taskId);
  if (error) throw error;
  return { ok: true, model, subtasks: p.subtasks.length };
}

// ---------------------------------------------------------------- email
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const nl = (s: string) => esc(s).replace(/\n/g, "<br>");

const AMMAN_OFFSET = "+03:00"; // Jordan stays on UTC+3 all year

type SubRow = {
  id: string; position: number; title: string; detail: string | null; acceptance: string[]; assignee_email: string | null;
  day_from: number; day_to: number; depends_on: number[]; covers: string[]; effort_hours: number | null; status: string;
  team_task_id: string | null; delivered_at: string | null; due_at: string | null; completed_at: string | null;
  on_time: boolean | null; postponed_at: string | null; postponed_count: number;
};
type MemberRow = { id: string; email: string; work_start: string; work_end: string; work_days: number[] };
type Person = { user_id: string; role: string; name: string | null };

const WORKER_ROLES = new Set(["speaker", "page_manager", "auditor", "ai_manager", "file_manager"]);
const SUB_COLS = "id,position,title,detail,acceptance,assignee_email,day_from,day_to,depends_on,covers,effort_hours,status,team_task_id,delivered_at,due_at,completed_at,on_time,postponed_at,postponed_count";

// ---------------------------------------------------------------- Amman clock and work windows
const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
function amman(d = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Amman", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23",
  }).formatToParts(d).map((p) => [p.type, p.value]));
  return { ymd: `${parts.year}-${parts.month}-${parts.day}`, dow: DOW[parts.weekday] ?? 0, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}
const hhmm = (t: string) => t.slice(0, 5);
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const atAmman = (ymd: string, t: string) => new Date(`${ymd}T${hhmm(t)}:00${AMMAN_OFFSET}`);
const fmtTime = (iso: string) => new Date(iso).toLocaleString("ar-JO", { timeZone: "Asia/Amman", weekday: "long", hour: "2-digit", minute: "2-digit" });

function inWindow(m: MemberRow, now = new Date()) {
  const a = amman(now);
  return m.work_days.includes(a.dow) && a.minutes >= toMin(m.work_start) && a.minutes < toMin(m.work_end);
}
/** The person's current window (if inside one) or their next one, as { start, end }. */
function windowFor(m: MemberRow, now = new Date()) {
  for (let i = 0; i < 8; i++) {
    const a = amman(new Date(now.getTime() + i * 86_400_000));
    if (!m.work_days.includes(a.dow)) continue;
    const start = atAmman(a.ymd, m.work_start), end = atAmman(a.ymd, m.work_end);
    if (end.getTime() > now.getTime()) return { start, end };
  }
  return null;
}
const currentDay = (t: Task) => Math.floor((Date.now() - new Date(t.send_at!).getTime()) / 86_400_000) + 1;

// ---------------------------------------------------------------- one task card (email)
function card(s: SubRow, reqs: Map<string, string>, note: string, urgent: boolean) {
  const covers = s.covers.filter((c) => reqs.has(c));
  return `
    <div style="border:1px solid ${urgent ? "#fca5a5" : "#e2e8f0"};border-radius:12px;padding:14px 16px;margin:10px 0">
      <div style="font-size:12px;color:${urgent ? "#dc2626" : "#2563eb"};font-weight:bold">${esc(note)}${s.effort_hours ? ` · نحو ${s.effort_hours} ساعة` : ""}</div>
      <div style="font-size:15px;font-weight:bold;margin:4px 0">#${s.position} ${esc(s.title)}</div>
      ${s.detail ? `<div style="color:#334155;line-height:1.8;font-size:14px">${nl(s.detail)}</div>` : ""}
      ${s.acceptance.length ? `<div style="margin-top:8px;font-size:13px;color:#475569">تُعتبر منجزة عندما:</div><ul style="margin:4px 0 0;padding-right:18px;color:#334155;font-size:13px">${s.acceptance.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}
      ${covers.length ? `<div style="margin-top:8px;font-size:12px;color:#64748b">من المواصفات: ${covers.map((c) => `<b>${esc(c)}</b> ${esc((reqs.get(c) ?? "").slice(0, 140))}`).join(" · ")}</div>` : ""}
    </div>`;
}
function mailHtml(t: Task, to: string, heading: string, body: string, site: string) {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(t.title)}</title></head>
<body style="margin:0;background:#f1f5f9;padding:24px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#0f172a">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:22px 24px;color:#fff">
      <div style="font-size:13px;opacity:.9">ذروة العلم · مهمة جماعية · ${esc(to)}</div>
      <h1 style="margin:6px 0 0;font-size:21px;line-height:1.5">${esc(t.title)}</h1>
      <div style="font-size:14px;margin-top:6px">${esc(heading)}</div>
    </div>
    <div style="padding:24px">${body}
      <div style="margin-top:26px;text-align:center">
        <a href="${site}/team" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:12px">فتح لوحة الفريق</a>
      </div>
    </div>
  </div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return { ok: false, reason: "no_resend_key" };
  const from = Deno.env.get("TEAM_EMAIL_FROM") ?? "ذروة العلم <onboarding@resend.dev>";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (r.ok) return { ok: true };
  const text = await r.text();
  return { ok: false, reason: /testing emails|verify a domain|domain is not verified/i.test(text) ? "domain_unverified" : "send_failed", detail: text.slice(0, 200) };
}

/** A notification for ONE person (only they and the leads see it). */
async function notifyPerson(person: Person | undefined, message: string, taskId: string | null = null) {
  if (!person) return;
  await service.from("team_notifications").insert({
    recipient_role: person.role, recipient_user_id: person.user_id, task_id: taskId, message: message.slice(0, 500),
  });
}

// ---------------------------------------------------------------- delivery of one subtask
async function deliverSubtask(task: Task, s: SubRow, m: MemberRow, person: Person | undefined, dueIso: string, reqs: Map<string, string>, site: string) {
  const covers = s.covers.filter((c) => reqs.has(c)).map((c) => `${c}: ${reqs.get(c)}`);
  let teamTaskId: string | null = null;
  if (person && WORKER_ROLES.has(person.role)) {
    const details = [
      `مهمة جماعية: «${task.title}» — سلّمها قبل ${fmtTime(dueIso)}${s.effort_hours ? ` · نحو ${s.effort_hours} ساعة` : ""}`,
      s.detail ?? "",
      s.acceptance.length ? `تُعتبر منجزة عندما:\n${s.acceptance.map((a) => `• ${a}`).join("\n")}` : "",
      covers.length ? `من المواصفات:\n${covers.map((c) => `• ${c}`).join("\n")}` : "",
    ].filter(Boolean).join("\n\n").slice(0, 8000);
    const { data: tt, error } = await service.from("team_tasks").insert({
      title: `[جماعية] ${s.title}`.slice(0, 200),
      details,
      assignee_role: person.role,
      assignee_user_id: person.user_id,
      due_at: dueIso,
      emailed_at: new Date().toISOString(), // our own email covers it; team-task-email must not send again
      created_by: null,
    }).select("id").single();
    if (error) console.error("team_tasks insert", error);
    teamTaskId = (tt as any)?.id ?? null;
    await notifyPerson(person, `مهمة جديدة لك الآن: #${s.position} ${s.title} — سلّمها قبل ${fmtTime(dueIso)}`, teamTaskId);
  }
  await service.from("collective_subtasks")
    .update({ delivered_at: new Date().toISOString(), due_at: dueIso, team_task_id: teamTaskId })
    .eq("id", s.id).is("delivered_at", null);
  const res = await sendEmail(m.email, `مهمة جديدة لك الآن: ${s.title}`,
    mailHtml(task, m.email, `مهمة جديدة — سلّمها قبل ${fmtTime(dueIso)}`, card(s, reqs, `ابدأ الآن · الموعد ${fmtTime(dueIso)}`, false), site));
  return { delivered: s.position, email: res.ok ? "ok" : res.reason };
}

/**
 * The scheduler for one active task, run every minute. For each subtask not yet delivered, in order:
 *   dependencies done + inside the owner's window (or policy "immediate") -> deliver, due at the window's end;
 *   dependencies NOT done while the owner's window is open -> one "postponed" notice per window to the
 *   owner, and one "a colleague is waiting for you" notice to whoever is late.
 * When everything is done the task moves to review.
 */
async function tickTask(task: Task) {
  const site = (Deno.env.get("SITE_URL") ?? "https://althrow.com").replace(/\/$/, "");
  const [{ data: subs }, { data: members }] = await Promise.all([
    service.from("collective_subtasks").select(SUB_COLS).eq("task_id", task.id).order("position"),
    service.from("collective_task_members").select("id,email,work_start,work_end,work_days").eq("task_id", task.id),
  ]);
  const rows = (subs ?? []) as SubRow[];
  if (!rows.length) return { note: "no subtasks" };
  const memberBy = new Map(((members ?? []) as MemberRow[]).map((m) => [m.email.toLowerCase(), m]));
  const emails = [...memberBy.keys()];
  const { data: team } = emails.length
    ? await service.from("team_members").select("email,user_id,role,display_name").in("email", emails)
    : { data: [] };
  const personBy = new Map((team ?? []).map((p: any) => [String(p.email).toLowerCase(), { user_id: p.user_id, role: p.role, name: p.display_name } as Person]));
  const byPos = new Map(rows.map((r) => [r.position, r]));
  const reqs = new Map((task.plan?.requirements ?? []).map((r) => [r.id, r.text]));
  const now = new Date();
  const day = currentDay(task);
  const done: unknown[] = [];

  const batch = await maybeRequestBatch(task, rows, personBy, day);
  if (rows.every((r) => r.status === "done")) {
    await service.from("collective_tasks").update({ status: "review" }).eq("id", task.id).eq("status", "active");
    return { closed: "all subtasks done -> review", batch };
  }

  for (const s of rows) {
    if (s.delivered_at || s.status === "done" || s.day_from > day) continue;
    const owner = (s.assignee_email ?? "").toLowerCase();
    const m = memberBy.get(owner);
    if (!m) continue;
    const person = personBy.get(owner);
    const blockers = s.depends_on.map((p) => byPos.get(p)).filter((d): d is SubRow => !!d && d.status !== "done");
    const open = inWindow(m, now);
    if (!blockers.length) {
      const w = windowFor(m, now);
      if (!w) continue;
      if (open) done.push(await deliverSubtask(task, s, m, person, w.end.toISOString(), reqs, site));
      else if (task.postpone_policy === "immediate" && (s.postponed_count > 0)) done.push(await deliverSubtask(task, s, m, person, w.end.toISOString(), reqs, site));
      continue;
    }
    // blocked: tell the owner once per window, and the late colleague(s)
    const w = windowFor(m, now);
    if (!open || !w) continue;
    if (s.postponed_at && new Date(s.postponed_at).getTime() >= w.start.getTime()) continue;
    const who = blockers.map((b) => `${personBy.get((b.assignee_email ?? "").toLowerCase())?.name ?? b.assignee_email} (#${b.position} ${b.title})`).join("، ");
    const reason = `بانتظار أن يُنهي ${who}`;
    await service.from("collective_subtasks").update({
      postponed_at: now.toISOString(), postponed_count: s.postponed_count + 1, postponed_reason: reason.slice(0, 500),
    }).eq("id", s.id);
    await notifyPerson(person, `مهمتك #${s.position} «${s.title}» مؤجّلة: ${reason}. ستصلك تلقائياً فور إنجازها ضمن وقتك.`);
    await sendEmail(m.email, `مهمتك مؤجّلة قليلاً: ${s.title}`, mailHtml(task, m.email, "مهمتك مؤجّلة قليلاً",
      `<p style="line-height:1.9">مهمتك <b>#${s.position} ${esc(s.title)}</b> تعتمد على عمل زميل لم يكتمل بعد: ${esc(who)}.<br>ستصلك تلقائياً فور إنجازه، ضمن وقت عملك.</p>`, site));
    for (const b of blockers) {
      const bp = personBy.get((b.assignee_email ?? "").toLowerCase());
      await notifyPerson(bp, `${person?.name ?? m.email} بانتظار إنهائك #${b.position} «${b.title}» حتى يبدأ مهمته.`, b.team_task_id);
    }
    done.push({ postponed: s.position, reason });
  }
  return done;
}

/**
 * Batched approval: when every subtask due so far (day_from <= today) is done and some finished since the
 * last batch, ask the project's bridge for ONE approval request with all the changes, naming tasks and people.
 */
async function maybeRequestBatch(task: Task, rows: SubRow[], personBy: Map<string, Person>, day: number) {
  if (!task.project_slug) return null;
  const due = rows.filter((r) => r.day_from <= day);
  if (!due.length || due.some((r) => r.status !== "done")) return null;
  const since = task.batch_through ? new Date(task.batch_through).getTime() : 0;
  const fresh = due.filter((r) => r.completed_at && new Date(r.completed_at).getTime() > since);
  if (!fresh.length) return null;
  const through = new Date(Math.max(...fresh.map((r) => new Date(r.completed_at!).getTime()))).toISOString();
  // claim this batch once (two scheduler runs must not both request it)
  let claim = service.from("collective_tasks").update({ batch_through: through }).eq("id", task.id);
  claim = task.batch_through ? claim.eq("batch_through", task.batch_through) : claim.is("batch_through", null);
  const { data: claimed } = await claim.select("id");
  if (!claimed?.length) return null;
  const lines = fresh.map((r) => {
    const who = personBy.get((r.assignee_email ?? "").toLowerCase())?.name ?? r.assignee_email ?? "—";
    return `• #${r.position} ${r.title} — ${who}${r.on_time === false ? " (متأخرة)" : ""}`;
  });
  const head = `«${task.title}» — اليوم ${day}: أنهى الفريق ${fresh.length} مهمة`;
  const { data: proj } = await service.from("bridge_projects").select("batch_note,batch_requested_at").eq("slug", task.project_slug).maybeSingle();
  const prev = (proj as any)?.batch_requested_at ? String((proj as any)?.batch_note ?? "") : "";
  const note = [prev, `${head}\n${lines.join("\n")}`].filter(Boolean).join("\n\n").slice(0, 4000);
  await service.from("bridge_projects").update({ batch_requested_at: new Date().toISOString(), batch_note: note }).eq("slug", task.project_slug);
  await service.from("team_notifications").insert({
    recipient_role: "lead", task_id: null,
    message: `${head}. أُرسل طلب موافقة واحد بكل التعديلات لمشروع ${task.project_slug} — راجعه من المعاينة الحيّة ثم وافق.`.slice(0, 500),
  });
  return { batch: fresh.length };
}

async function dispatchDue() {
  // 1) scheduled tasks whose time came -> active (claim with one UPDATE so it happens once)
  await service.from("collective_tasks")
    .update({ emailed_at: new Date().toISOString(), status: "active" })
    .eq("status", "scheduled").is("emailed_at", null).lte("send_at", new Date().toISOString());
  // 2) every active task: deliver / postpone what is due right now
  const { data } = await service.from("collective_tasks").select("*").eq("status", "active").lte("send_at", new Date().toISOString());
  const out: Record<string, unknown> = {};
  for (const t of (data ?? []) as Task[]) {
    try { out[t.id] = await tickTask(t); } catch (e) { console.error("tick", t.id, e); out[t.id] = String((e as Error)?.message ?? e); }
  }
  return json({ ok: true, out });
}

async function sendNow(taskId: string) {
  return json(await sendNowCore(taskId));
}

/** Admin: run the scheduler for this task now, and email again the delivered tasks that are not done yet. */
async function resendToday(taskId: string) {
  const { task } = await loadTask(taskId);
  if (task.status !== "active" || !task.send_at) throw new UserError("المهمة ليست قيد التنفيذ", 409);
  const site = (Deno.env.get("SITE_URL") ?? "https://althrow.com").replace(/\/$/, "");
  const report: Record<string, unknown> = { tick: await tickTask(task) };
  const { data: open } = await service.from("collective_subtasks").select(SUB_COLS).eq("task_id", taskId)
    .not("delivered_at", "is", null).neq("status", "done").order("position");
  const reqs = new Map((task.plan?.requirements ?? []).map((r) => [r.id, r.text]));
  for (const s of (open ?? []) as SubRow[]) {
    if (!s.assignee_email) continue;
    const res = await sendEmail(s.assignee_email, `تذكير: ${s.title}`,
      mailHtml(task, s.assignee_email, "تذكير بمهمتك", card(s, reqs, s.due_at ? `الموعد ${fmtTime(s.due_at)}` : "قيد العمل", !!s.due_at && new Date(s.due_at) < new Date()), site));
    report[`#${s.position}`] = res.ok ? "ok" : res.reason;
  }
  return { ok: true, report };
}

async function sendNowCore(taskId: string) {
  const now = new Date().toISOString();
  const { data, error } = await service.from("collective_tasks")
    .update({ emailed_at: now, send_at: now, status: "active" })
    .eq("id", taskId).in("status", ["planned", "scheduled"]).is("emailed_at", null)
    .select("*").maybeSingle();
  if (error) throw error;
  if (!data) throw new UserError("المهمة أُرسلت من قبل أو ليست جاهزة (اطلب الخطة أولاً)", 409);
  return { ok: true, report: await tickTask(data as Task) };
}

async function scheduleCore(taskId: string, sendAtIso: string) {
  const when = new Date(sendAtIso);
  if (Number.isNaN(when.getTime())) throw new UserError("موعد الإرسال غير صالح");
  if (when.getTime() < Date.now() - 60_000) throw new UserError("موعد الإرسال في الماضي");
  const { data, error } = await service.from("collective_tasks")
    .update({ send_at: when.toISOString(), status: "scheduled" })
    .eq("id", taskId).in("status", ["planned", "scheduled"]).select("id").maybeSingle();
  if (error) throw error;
  if (!data) throw new UserError("ابنِ الخطة أولاً قبل الجدولة", 409);
  return { ok: true, send_at: when.toISOString() };
}

// ---------------------------------------------------------------- shared context for the AI

function ammanNow() {
  return new Date().toLocaleString("ar-JO", { timeZone: "Asia/Amman", dateStyle: "full", timeStyle: "short" });
}
/** "2026-11-16T08:00" (Amman wall clock) -> ISO; anything else -> null */
function ammanLocalToIso(v: unknown): string | null {
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})$/.exec(String(v ?? "").trim());
  if (!m) return null;
  const d = new Date(`${m[1]}T${m[2]}:00${AMMAN_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

type TeamPerson = { email: string; name: string | null; role: string };
async function teamPeople(): Promise<TeamPerson[]> {
  const { data } = await service.from("team_members").select("email, display_name, role").order("created_at");
  return (data ?? []).map((m: any) => ({ email: String(m.email).toLowerCase(), name: m.display_name, role: m.role }));
}
const teamText = (people: TeamPerson[]) =>
  people.length
    ? people.map((p) => `- ${p.name ?? "(بلا اسم)"} <${p.email}> — ${p.role}`).join("\n")
    : "(لا يوجد أعضاء فريق مسجلون)";

/** OpenAI-compatible chat call to Gemini (supports tools), with the 3.1 -> 3.5 fallback. */
async function geminiChat(payload: Record<string, unknown>): Promise<any> {
  const key = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("مفتاح Google غير مضبوط على الخادم (GOOGLE_API_KEY)");
  let last = "";
  for (const model of MODELS) {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, model }),
      signal: AbortSignal.timeout(90_000),
    });
    if (r.status === 404) { last = `${model}: 404`; continue; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${(Array.isArray(j) ? j[0] : j)?.error?.message ?? "error"}`);
    return j?.choices?.[0]?.message ?? {};
  }
  throw new Error(`no Gemini model available (${last})`);
}

type ChatMsg = { role: "user" | "assistant"; content: string };
const cleanHistory = (m: unknown): ChatMsg[] =>
  (Array.isArray(m) ? m : [])
    .filter((x: any) => (x?.role === "user" || x?.role === "assistant") && typeof x?.content === "string" && x.content.trim())
    .slice(-20)
    .map((x: any) => ({ role: x.role, content: String(x.content).slice(0, 20000) }));

// ---------------------------------------------------------------- assist: talk, and the form fills itself
const ASSIST_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    title: { type: "string" },
    goals: { type: "string" },
    final_vision: { type: "string" },
    duration_days: { type: "integer" },
    people: {
      type: "array",
      items: { type: "object", properties: { email: { type: "string" }, focus: { type: "string" } }, required: ["email", "focus"] },
    },
    send_at_local: { type: "string" },
    approval_rule: { type: "string", enum: ["members_then_admin", "all_members", "majority"] },
    planner_notes: { type: "string" },
    missing: { type: "array", items: { type: "string" } },
    ready: { type: "boolean" },
  },
  required: ["reply", "title", "goals", "final_vision", "duration_days", "people", "send_at_local", "approval_rule", "planner_notes", "missing", "ready"],
};

async function assist(body: any) {
  const people = await teamPeople();
  const draft = body?.draft && typeof body.draft === "object" ? body.draft : {};
  const system = `أنت مساعد الأدمن في منصة "ذروة العلم" لإنشاء "مهمة جماعية" (عمل كبير لفريق كامل).
يصف الأدمن المهمة بكلامه (قد يكون كلاماً منطوقاً بالعامية الأردنية). مهمتك تعبئة الحقول بدقة:
- title: عنوان قصير واضح.
- goals: الأهداف، هدف في كل سطر، قابلة للقياس.
- final_vision: كيف يبدو الناتج في النهاية بالضبط. إذا لصق الأدمن مواصفات مفصّلة (أقسام، نصوص، ألوان، مكونات)
  فانسخها كما هي حرفياً بكامل تفاصيلها وترتيبها، ولا تختصرها أبداً؛ يمكنك فقط إصلاح التنسيق.
- duration_days: عدد الأيام (1-90). "أسبوع"=7، "أسبوعين"=14، "شهر"=30.
- people: المشاركون. حوّل الأسماء إلى البريد من قائمة الفريق أدناه فقط؛ وإذا ذكر بريداً صريحاً خذه كما هو. focus: ما يركّز عليه الشخص إن ذُكر وإلا "".
- send_at_local: موعد الإرسال بتوقيت عمّان بالشكل YYYY-MM-DDTHH:mm، أو "" إن لم يُذكر. الوقت الآن في عمّان: ${ammanNow()}.
- approval_rule: members_then_admin افتراضياً، all_members إذا قال "الكل لازم يوافق"، majority إذا قال "الأغلبية".
- planner_notes: كل تعليمات الأدمن عن طريقة توزيع العمل وأولوياته (مثل "وزّع بالتساوي لكن أصعب المهام لمحمد"، "أحمد متاح آخر الأسبوع فقط"، "ابدأ بالتصميم"). اجمع كل التعليمات المذكورة عبر المحادثة، ولا تحذف تعليمات سابقة.
- إذا لم يذكر الأهداف صراحةً فاستخلصها من التصور النهائي (أهداف قابلة للقياس).
- احتفظ بقيم المسودة الحالية ما لم يغيّرها الأدمن.
- missing: ما زال ناقصاً من (العنوان، الأهداف، التصور النهائي، المدة، المشاركون، موعد الإرسال).
- ready: true فقط إذا لم ينقص شيء أساسي (موعد الإرسال ليس إلزامياً).
- reply: رد قصير ودود بالعربية: ماذا عبّأت، وسؤال واحد واضح عن أهم شيء ناقص. لا تخترع أهدافاً لم تُذكر.
  مهم جداً: أنت تعبّئ النموذج فقط. لم تُنشئ خطة ولم توزّع مهاماً ولم تجدول ولم ترسل شيئاً، فلا تدّعِ ذلك أبداً
  ولا تذكر أعداد مهام أو توزيعاً. عندما يكتمل الأساسي قل له: «اكبس زر "احفظ وابنِ الخطة" تحت الشات، وبتطلع الخطة والجدول اليومي».

قائمة الفريق:
${teamText(people)}

المسودة الحالية (JSON):
${JSON.stringify(draft).slice(0, 30000)}`;
  const msg = await geminiChat({
    messages: [{ role: "system", content: system }, ...cleanHistory(body?.messages)],
    temperature: 0.2,
    max_tokens: 16000, // room to copy a long pasted spec into final_vision word for word
    response_format: { type: "json_schema", json_schema: { name: "collective_draft", schema: ASSIST_SCHEMA } },
  });
  let out: any;
  try { out = JSON.parse(String(msg.content ?? "{}")); } catch { throw new UserError("رد الذكاء الاصطناعي غير مفهوم، أعد صياغة طلبك", 502); }
  const emailOk = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
  return {
    reply: String(out.reply ?? ""),
    draft: {
      title: String(out.title ?? "").slice(0, 200),
      goals: String(out.goals ?? "").slice(0, 20000),
      final_vision: String(out.final_vision ?? "").slice(0, 20000),
      duration_days: Math.min(90, Math.max(1, Math.round(Number(out.duration_days) || Number(draft.duration_days) || 7))),
      people: (Array.isArray(out.people) ? out.people : [])
        .map((p: any) => ({ email: String(p?.email ?? "").trim().toLowerCase(), focus: String(p?.focus ?? "").slice(0, 300) }))
        .filter((p: any) => emailOk(p.email)),
      send_at: ammanLocalToIso(out.send_at_local),
      approval_rule: ["members_then_admin", "all_members", "majority"].includes(out.approval_rule) ? out.approval_rule : "members_then_admin",
      planner_notes: String(out.planner_notes ?? "").trim().slice(0, 4000),
    },
    missing: (Array.isArray(out.missing) ? out.missing : []).map(String).slice(0, 10),
    ready: out.ready === true,
  };
}

// ---------------------------------------------------------------- command: the Central Task AI agent
const tool = (name: string, description: string, properties: Record<string, unknown> = {}, required: string[] = []) => ({
  type: "function", function: { name, description, parameters: { type: "object", properties, required } },
});
const COMMAND_TOOLS = [
  tool("list_collective_tasks", "List all collective tasks with status, dates, people and progress (done/total subtasks)."),
  tool("get_collective_task", "Full details of one collective task: goals, vision, plan summary, every subtask with owner/days/status, email report.", { task_id: { type: "string" } }, ["task_id"]),
  tool("create_collective_task", "Create a NEW collective task as a draft (nothing is sent). Use team emails exactly.", {
    title: { type: "string" }, goals: { type: "string" }, final_vision: { type: "string" },
    duration_days: { type: "integer" }, emails: { type: "array", items: { type: "string" } },
    approval_rule: { type: "string", enum: ["members_then_admin", "all_members", "majority"] },
    planner_notes: { type: "string", description: "the admin's instructions on how to split the work, e.g. hardest tasks to X" },
  }, ["title", "goals", "final_vision", "duration_days", "emails"]),
  tool("update_collective_task", "Change a draft/planned collective task (only fields given). emails replaces the people list.", {
    task_id: { type: "string" }, title: { type: "string" }, goals: { type: "string" }, final_vision: { type: "string" },
    duration_days: { type: "integer" }, emails: { type: "array", items: { type: "string" } },
    planner_notes: { type: "string" },
  }, ["task_id"]),
  tool("build_plan", "Ask the planner to build (or rebuild) the day-by-day plan of a draft/planned task.", { task_id: { type: "string" } }, ["task_id"]),
  tool("request_send", "Prepare sending a planned task: now, or at an Amman time 'YYYY-MM-DDTHH:mm'. It does NOT send: the admin must confirm.", {
    task_id: { type: "string" }, when: { type: "string", description: "'now' or 'YYYY-MM-DDTHH:mm' Amman time" },
  }, ["task_id", "when"]),
  tool("team_members", "The platform team: names, emails, roles."),
  tool("team_tasks_overview", "The everyday team tasks (not collective): counts by status and role, overdue ones, latest tasks."),
];

async function commandTool(name: string, a: any, pending: any[]): Promise<unknown> {
  const id = String(a?.task_id ?? "");
  switch (name) {
    case "list_collective_tasks": {
      const { data } = await service.from("collective_tasks").select("id,title,status,duration_days,send_at,emailed_at,created_at").order("created_at", { ascending: false }).limit(30);
      const ids = (data ?? []).map((t: any) => t.id);
      const { data: subs } = ids.length ? await service.from("collective_subtasks").select("task_id,status").in("task_id", ids) : { data: [] };
      const { data: mem } = ids.length ? await service.from("collective_task_members").select("task_id,email").in("task_id", ids) : { data: [] };
      return (data ?? []).map((t: any) => {
        const s = (subs ?? []).filter((x: any) => x.task_id === t.id);
        return { ...t, people: (mem ?? []).filter((m: any) => m.task_id === t.id).map((m: any) => m.email), subtasks_total: s.length, subtasks_done: s.filter((x: any) => x.status === "done").length };
      });
    }
    case "get_collective_task": {
      const { task, members } = await loadTask(id);
      const { data: subs } = await service.from("collective_subtasks").select("position,title,assignee_email,day_from,day_to,status,acceptance").eq("task_id", id).order("position");
      return { ...task, plan: task.plan ? { summary: task.plan.summary, days: task.plan.days, risks: task.plan.risks } : null, people: members, subtasks: subs ?? [] };
    }
    case "create_collective_task":
    case "update_collective_task": {
      const fields: Record<string, unknown> = {};
      for (const k of ["title", "goals", "final_vision", "approval_rule", "planner_notes"]) if (typeof a?.[k] === "string" && a[k].trim()) fields[k] = a[k].trim();
      if (a?.duration_days) fields.duration_days = Math.min(90, Math.max(1, Math.round(Number(a.duration_days))));
      let taskId = id;
      if (name === "create_collective_task") {
        const { data, error } = await service.from("collective_tasks").insert(fields).select("id").single();
        if (error) return { error: error.message };
        taskId = (data as any).id;
      } else {
        const { task } = await loadTask(id);
        if (!["draft", "planned"].includes(task.status)) return { error: "لا يمكن تعديل مهمة أُرسلت" };
        if (Object.keys(fields).length) {
          const { error } = await service.from("collective_tasks").update(fields).eq("id", id);
          if (error) return { error: error.message };
        }
      }
      if (Array.isArray(a?.emails)) {
        const emails = [...new Set(a.emails.map((e: unknown) => String(e).trim().toLowerCase()).filter((e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)))];
        // keep the people who stay (and their work windows); drop the others; add the new ones
        const { data: cur } = await service.from("collective_task_members").select("id,email").eq("task_id", taskId);
        const have = new Map((cur ?? []).map((m: any) => [String(m.email).toLowerCase(), m.id as string]));
        const gone = [...have.entries()].filter(([e]) => !emails.includes(e)).map(([, mid]) => mid);
        if (gone.length) await service.from("collective_task_members").delete().in("id", gone);
        const fresh = emails.filter((e) => !have.has(e as string));
        if (fresh.length) await service.from("collective_task_members").insert(fresh.map((email) => ({ task_id: taskId, email })));
      }
      return { ok: true, task_id: taskId, status: name === "create_collective_task" ? "draft" : "updated" };
    }
    case "build_plan":
      try { return await planCore(id); } catch (e) { return { error: (e as Error).message }; }
    case "request_send": {
      const { task } = await loadTask(id);
      if (!["planned", "scheduled"].includes(task.status)) return { error: "ابنِ الخطة أولاً، أو المهمة أُرسلت من قبل" };
      const when = String(a?.when ?? "").trim();
      const iso = when === "now" ? null : ammanLocalToIso(when);
      if (when !== "now" && !iso) return { error: "الموعد يجب أن يكون now أو YYYY-MM-DDTHH:mm" };
      const p = iso
        ? { type: "schedule", task_id: id, send_at: iso, label: `جدولة إرسال «${task.title}» ${new Date(iso).toLocaleString("ar-JO", { timeZone: "Asia/Amman", dateStyle: "full", timeStyle: "short" })}` }
        : { type: "send_now", task_id: id, label: `ابدأ «${task.title}» الآن (مهام اليوم 1 تصل للجميع)` };
      pending.push(p);
      return { needs_confirmation: true, waiting_for_admin: p.label };
    }
    case "team_members":
      return await teamPeople();
    case "team_tasks_overview": {
      const { data } = await service.from("team_tasks").select("title,assignee_role,status,due_at,created_at").order("created_at", { ascending: false }).limit(200);
      const rows = (data ?? []) as any[];
      const now = Date.now();
      const by = (k: string) => rows.reduce((m: Record<string, number>, r) => ({ ...m, [r[k]]: (m[r[k]] ?? 0) + 1 }), {});
      return {
        total: rows.length, by_status: by("status"), by_role: by("assignee_role"),
        overdue: rows.filter((r) => r.status !== "done" && r.due_at && new Date(r.due_at).getTime() < now).slice(0, 15),
        latest: rows.slice(0, 10),
      };
    }
  }
  return { error: `unknown tool ${name}` };
}

async function command(body: any) {
  const people = await teamPeople();
  const system = `أنت "الذكاء الاصطناعي المركزي للمهام" في منصة "ذروة العلم". تتحدث مع الأدمن فقط.
تدير "المهام الجماعية" (عمل كبير لفريق كامل بخطة يومية) وتتابع مهام الفريق اليومية.
- استعمل الأدوات للحصول على بيانات حقيقية؛ لا تخترع أرقاماً أو مهاماً أبداً.
- عند إنشاء مهمة جماعية: اجمع العنوان والأهداف والتصور النهائي والمدة والمشاركين؛ إن نقص شيء أساسي اسأل سؤالاً واحداً. حوّل الأسماء إلى البريد من قائمة الفريق.
- بعد الإنشاء اقترح بناء الخطة (build_plan) ونفّذه إذا طلبه الأدمن أو كان واضحاً من كلامه.
- الإرسال والجدولة عبر request_send فقط؛ هو لا يرسل، بل ينتظر تأكيد الأدمن. قل له ذلك بجملة واحدة.
- عند المتابعة والتحليل: قارن المنجز بالخطة اليومية والمدة المنقضية، واذكر من المتأخر وما الخطوة التالية.
- الرد بالعربية، مختصر ومنظم (نقاط قصيرة عند الحاجة).
الوقت الآن في عمّان: ${ammanNow()}

قائمة الفريق:
${teamText(people)}`;
  const messages: any[] = [{ role: "system", content: system }, ...cleanHistory(body?.messages)];
  const pending: any[] = [];
  const touched = new Set<string>();
  for (let round = 0; round < 6; round++) {
    const msg = await geminiChat({ messages, tools: COMMAND_TOOLS, tool_choice: "auto", temperature: 0.3, max_tokens: 3000 });
    const calls: any[] = msg.tool_calls ?? [];
    messages.push({ role: "assistant", content: msg.content ?? "", ...(calls.length ? { tool_calls: calls } : {}) });
    if (!calls.length) return { reply: String(msg.content ?? "").trim(), pending, task_ids: [...touched] };
    for (const c of calls) {
      let args: any = {};
      try { args = JSON.parse(c.function?.arguments || "{}"); } catch { /* empty */ }
      let out: unknown;
      try { out = await commandTool(c.function?.name, args, pending); } catch (e) { out = { error: String((e as Error)?.message ?? e).slice(0, 200) }; }
      if ((out as any)?.task_id) touched.add((out as any).task_id);
      if (args?.task_id) touched.add(String(args.task_id));
      messages.push({ role: "tool", tool_call_id: c.id, content: JSON.stringify(out).slice(0, 6000) });
    }
  }
  return { reply: "الطلب طويل؛ قسّمه لخطوات أصغر من فضلك.", pending, task_ids: [...touched] };
}

async function confirmAction(p: any) {
  const taskId = String(p?.task_id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(taskId)) throw new UserError("طلب تأكيد غير صالح");
  if (p?.type === "send_now") {
    const r = await sendNowCore(taskId);
    const failed = Object.entries(r.report).filter(([, v]: any) => !v.ok).map(([e]) => e);
    return { ok: true, reply: failed.length ? `بدأت المهمة، لكن تعذّر الوصول إلى: ${failed.join("، ")}` : "بدأت المهمة ✅ وصلت مهام اليوم الأول لكل شخص، وكل يوم بنفس الساعة بتوصلهم مهام يومهم.", report: r.report };
  }
  if (p?.type === "schedule") {
    const r = await scheduleCore(taskId, String(p?.send_at ?? ""));
    return { ok: true, reply: `تمت الجدولة ✅ ستُرسل ${new Date(r.send_at).toLocaleString("ar-JO", { timeZone: "Asia/Amman", dateStyle: "full", timeStyle: "short" })}` };
  }
  throw new UserError("نوع تأكيد غير معروف");
}

// ---------------------------------------------------------------- entry
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");
    if (action === "dispatch") return await dispatchDue();

    const who = await requireAdmin(req);
    if (who instanceof Response) return who;
    if (action === "assist") return json(await assist(body));
    if (action === "command") return json(await command(body));
    if (action === "confirm") return json(await confirmAction(body?.pending));
    const taskId = String(body?.task_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(taskId)) return json({ error: "task_id مطلوب" }, 400);
    if (action === "plan") return await plan(taskId);
    if (action === "send_now") return await sendNow(taskId);
    if (action === "resend_day") return json(await resendToday(taskId));
    return json({ error: "unknown action" }, 400);
  } catch (e) {
    if (e instanceof UserError) return json({ error: e.message }, e.status);
    console.error("collective-task-ai", e);
    return json({ error: String((e as Error)?.message ?? e).slice(0, 300) }, 500);
  }
});
