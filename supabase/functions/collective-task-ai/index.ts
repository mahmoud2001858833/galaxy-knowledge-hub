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

type Task = {
  id: string; title: string; goals: string; final_vision: string; duration_days: number;
  send_at: string | null; status: string; plan: Plan | null;
};
type Member = { id: string; email: string; focus: string | null };
type PlanSubtask = {
  title: string; detail: string; assignee_email: string; day_from: number; day_to: number;
  acceptance: string[]; depends_on: number[];
};
type Plan = {
  summary: string;
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
        },
        required: ["title", "detail", "assignee_email", "day_from", "day_to", "acceptance", "depends_on"],
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
  required: ["summary", "days", "subtasks", "risks", "final_check"],
};

async function gemini(prompt: string, system: string): Promise<{ text: string; model: string }> {
  const key = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("مفتاح Google غير مضبوط على الخادم (GOOGLE_API_KEY)");
  let last = "";
  for (const model of MODELS) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
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

const SYSTEM = `أنت مدير مشاريع خبير ودقيق جداً لمنصة "ذروة العلم" التعليمية الأردنية.
مهمتك تحويل مهمة جماعية إلى خطة تنفيذ يومية دقيقة قابلة للقياس.
قواعد صارمة:
- كل مهمة فرعية لها مالك واحد فقط من قائمة البريد المعطاة حرفياً، ولا تخترع بريداً.
- وزّع العمل بعدل على الجميع، مع مراعاة "التركيز" المكتوب بجانب كل شخص إن وُجد.
- كل مهمة فرعية صغيرة بما يكفي لتُنجز في يوم إلى ثلاثة أيام، ومعها 2-4 معايير قبول قابلة للتحقق (لا عبارات عامة مثل "جودة عالية").
- day_from وday_to بين 1 وعدد الأيام، وday_to >= day_from.
- depends_on أرقام ترتيب (تبدأ من 0) لمهام فرعية يجب أن تنتهي قبلها، ولا تعتمد مهمة على نفسها أو على مهمة بعدها.
- اترك آخر يوم (أو آخر 20% من المدة) للمراجعة والاختبار والدمج.
- days: سطر لكل يوم من 1 إلى عدد الأيام، فيه تركيز اليوم ومعالم يجب أن تتحقق في نهايته.
- final_check: قائمة تحقق نهائية تقارن الناتج بـ "التصور النهائي" بنداً بنداً.
- اكتب بالعربية الفصحى الواضحة والمختصرة.`;

function buildPrompt(t: Task, members: Member[]) {
  const people = members.map((m) => `- ${m.email}${m.focus ? ` (التركيز: ${m.focus})` : ""}`).join("\n");
  return `المهمة: ${t.title}
عدد الأيام: ${t.duration_days}

الأهداف:
${t.goals}

التصور النهائي (شكل النتيجة في النهاية):
${t.final_vision}

المشاركون (استعمل هذه العناوين حرفياً في assignee_email):
${people}`;
}

/** Keeps the model honest: owners from the list, days in range, dependencies only backwards. */
function cleanPlan(raw: Plan, t: Task, members: Member[]): Plan {
  const emails = new Map(members.map((m) => [m.email.toLowerCase(), m.email]));
  const firstEmail = members[0]?.email ?? "";
  const clampDay = (d: number) => Math.min(Math.max(Math.round(Number(d) || 1), 1), t.duration_days);
  const subtasks = (raw.subtasks ?? []).slice(0, 120).map((s, i) => {
    const from = clampDay(s.day_from), to = Math.max(from, clampDay(s.day_to));
    return {
      title: String(s.title ?? "").trim().slice(0, 300) || `مهمة ${i + 1}`,
      detail: String(s.detail ?? "").trim().slice(0, 4000),
      assignee_email: emails.get(String(s.assignee_email ?? "").toLowerCase()) ?? firstEmail,
      day_from: from,
      day_to: to,
      acceptance: (s.acceptance ?? []).map((a) => String(a).trim()).filter(Boolean).slice(0, 8),
      depends_on: [...new Set((s.depends_on ?? []).map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d < i))],
    };
  });
  const days = Array.from({ length: t.duration_days }, (_, k) => {
    const d = (raw.days ?? []).find((x) => Number(x.day) === k + 1);
    return { day: k + 1, focus: String(d?.focus ?? "").trim(), milestones: (d?.milestones ?? []).map(String).slice(0, 10) };
  });
  return {
    summary: String(raw.summary ?? "").trim(),
    days,
    subtasks,
    risks: (raw.risks ?? []).slice(0, 15).map((r) => ({ risk: String(r.risk ?? ""), mitigation: String(r.mitigation ?? "") })),
    final_check: (raw.final_check ?? []).map(String).filter(Boolean).slice(0, 20),
  };
}

async function loadTask(id: string) {
  const { data: t, error } = await service.from("collective_tasks").select("*").eq("id", id).maybeSingle();
  if (error || !t) throw new Error("المهمة غير موجودة");
  const { data: members } = await service.from("collective_task_members").select("id,email,focus").eq("task_id", id).order("created_at");
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

  const { text, model } = await gemini(buildPrompt(task, members), SYSTEM);
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

type SubRow = { position: number; title: string; detail: string | null; acceptance: string[]; assignee_email: string | null; day_from: number; day_to: number };

function emailHtml(t: Task, to: string, mine: SubRow[], all: number, site: string) {
  const start = t.send_at ? new Date(t.send_at) : new Date();
  const dayDate = (d: number) =>
    new Date(start.getTime() + (d - 1) * 86_400_000).toLocaleDateString("ar-JO", { timeZone: "Asia/Amman", weekday: "long", day: "numeric", month: "long" });
  const rows = mine.map((s) => `
    <div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin:10px 0">
      <div style="font-size:12px;color:#2563eb;font-weight:bold">اليوم ${s.day_from}${s.day_to > s.day_from ? `–${s.day_to}` : ""} · ${esc(dayDate(s.day_from))}</div>
      <div style="font-size:15px;font-weight:bold;margin:4px 0">${esc(s.title)}</div>
      ${s.detail ? `<div style="color:#334155;line-height:1.8;font-size:14px">${nl(s.detail)}</div>` : ""}
      ${s.acceptance.length ? `<div style="margin-top:8px;font-size:13px;color:#475569">تُعتبر منجزة عندما:</div><ul style="margin:4px 0 0;padding-right:18px;color:#334155;font-size:13px">${s.acceptance.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}
    </div>`).join("");
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(t.title)}</title></head>
<body style="margin:0;background:#f1f5f9;padding:24px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#0f172a">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:22px 24px;color:#fff">
      <div style="font-size:13px;opacity:.9">ذروة العلم · مهمة جماعية لـ ${esc(to)}</div>
      <h1 style="margin:6px 0 0;font-size:21px;line-height:1.5">${esc(t.title)}</h1>
      <div style="font-size:13px;opacity:.9;margin-top:6px">المدة ${t.duration_days} يوم · ${all} مهمة فرعية للفريق، منها ${mine.length} لك</div>
    </div>
    <div style="padding:24px">
      <h3 style="margin:0 0 6px;font-size:15px">الأهداف</h3>
      <div style="line-height:1.9;color:#334155">${nl(t.goals)}</div>
      <h3 style="margin:18px 0 6px;font-size:15px">التصور النهائي</h3>
      <div style="line-height:1.9;color:#334155">${nl(t.final_vision)}</div>
      ${t.plan?.summary ? `<h3 style="margin:18px 0 6px;font-size:15px">ملخص الخطة</h3><div style="line-height:1.9;color:#334155">${nl(t.plan.summary)}</div>` : ""}
      <h3 style="margin:22px 0 4px;font-size:16px">مهامك</h3>
      ${rows || '<div style="color:#64748b">لا توجد مهام فرعية باسمك في الخطة؛ تابع مع الأدمن.</div>'}
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

async function sendTask(task: Task) {
  const site = (Deno.env.get("SITE_URL") ?? "https://althrow.com").replace(/\/$/, "");
  const { data: members } = await service.from("collective_task_members").select("id,email").eq("task_id", task.id);
  const { data: subs } = await service.from("collective_subtasks")
    .select("position,title,detail,acceptance,assignee_email,day_from,day_to").eq("task_id", task.id).order("position");
  const rows = (subs ?? []) as SubRow[];
  const report: Record<string, unknown> = {};
  for (const m of members ?? []) {
    const mine = rows.filter((s) => (s.assignee_email ?? "").toLowerCase() === m.email.toLowerCase());
    const res = await sendEmail(m.email, `مهمة جماعية: ${task.title}`, emailHtml(task, m.email, mine, rows.length, site));
    report[m.email] = res;
    if (res.ok) await service.from("collective_task_members").update({ emailed_at: new Date().toISOString() }).eq("id", m.id);
  }
  await service.from("collective_tasks").update({ email_report: report }).eq("id", task.id);
  return report;
}

async function dispatchDue() {
  // Claim first (one UPDATE), so a task can never be emailed twice even if two calls overlap.
  const { data, error } = await service.from("collective_tasks")
    .update({ emailed_at: new Date().toISOString(), status: "active" })
    .eq("status", "scheduled").is("emailed_at", null).lte("send_at", new Date().toISOString())
    .select("*");
  if (error) throw error;
  const sent: Record<string, unknown> = {};
  for (const t of (data ?? []) as Task[]) sent[t.id] = await sendTask(t);
  return json({ ok: true, sent });
}

async function sendNow(taskId: string) {
  return json(await sendNowCore(taskId));
}

async function sendNowCore(taskId: string) {
  const now = new Date().toISOString();
  const { data, error } = await service.from("collective_tasks")
    .update({ emailed_at: now, send_at: now, status: "active" })
    .eq("id", taskId).in("status", ["planned", "scheduled"]).is("emailed_at", null)
    .select("*").maybeSingle();
  if (error) throw error;
  if (!data) throw new UserError("المهمة أُرسلت من قبل أو ليست جاهزة (اطلب الخطة أولاً)", 409);
  return { ok: true, report: await sendTask(data as Task) };
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
const AMMAN_OFFSET = "+03:00"; // Jordan stays on UTC+3 all year

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
    .map((x: any) => ({ role: x.role, content: String(x.content).slice(0, 6000) }));

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
    missing: { type: "array", items: { type: "string" } },
    ready: { type: "boolean" },
  },
  required: ["reply", "title", "goals", "final_vision", "duration_days", "people", "send_at_local", "approval_rule", "missing", "ready"],
};

async function assist(body: any) {
  const people = await teamPeople();
  const draft = body?.draft && typeof body.draft === "object" ? body.draft : {};
  const system = `أنت مساعد الأدمن في منصة "ذروة العلم" لإنشاء "مهمة جماعية" (عمل كبير لفريق كامل).
يصف الأدمن المهمة بكلامه (قد يكون كلاماً منطوقاً بالعامية الأردنية). مهمتك تعبئة الحقول بدقة:
- title: عنوان قصير واضح.
- goals: الأهداف، هدف في كل سطر، قابلة للقياس.
- final_vision: كيف يبدو الناتج في النهاية بالضبط.
- duration_days: عدد الأيام (1-90). "أسبوع"=7، "أسبوعين"=14، "شهر"=30.
- people: المشاركون. حوّل الأسماء إلى البريد من قائمة الفريق أدناه فقط؛ وإذا ذكر بريداً صريحاً خذه كما هو. focus: ما يركّز عليه الشخص إن ذُكر وإلا "".
- send_at_local: موعد الإرسال بتوقيت عمّان بالشكل YYYY-MM-DDTHH:mm، أو "" إن لم يُذكر. الوقت الآن في عمّان: ${ammanNow()}.
- approval_rule: members_then_admin افتراضياً، all_members إذا قال "الكل لازم يوافق"، majority إذا قال "الأغلبية".
- احتفظ بقيم المسودة الحالية ما لم يغيّرها الأدمن.
- missing: ما زال ناقصاً من (العنوان، الأهداف، التصور النهائي، المدة، المشاركون، موعد الإرسال).
- ready: true فقط إذا لم ينقص شيء أساسي (موعد الإرسال ليس إلزامياً).
- reply: رد قصير ودود بالعربية: ماذا فهمت، وسؤال واحد واضح عن أهم شيء ناقص. لا تخترع أهدافاً لم تُذكر؛ يمكنك صياغتها بشكل أوضح فقط.

قائمة الفريق:
${teamText(people)}

المسودة الحالية (JSON):
${JSON.stringify(draft).slice(0, 6000)}`;
  const msg = await geminiChat({
    messages: [{ role: "system", content: system }, ...cleanHistory(body?.messages)],
    temperature: 0.2,
    response_format: { type: "json_schema", json_schema: { name: "collective_draft", schema: ASSIST_SCHEMA } },
  });
  let out: any;
  try { out = JSON.parse(String(msg.content ?? "{}")); } catch { throw new UserError("رد الذكاء الاصطناعي غير مفهوم، أعد صياغة طلبك", 502); }
  const emailOk = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
  return {
    reply: String(out.reply ?? ""),
    draft: {
      title: String(out.title ?? "").slice(0, 200),
      goals: String(out.goals ?? "").slice(0, 8000),
      final_vision: String(out.final_vision ?? "").slice(0, 8000),
      duration_days: Math.min(90, Math.max(1, Math.round(Number(out.duration_days) || Number(draft.duration_days) || 7))),
      people: (Array.isArray(out.people) ? out.people : [])
        .map((p: any) => ({ email: String(p?.email ?? "").trim().toLowerCase(), focus: String(p?.focus ?? "").slice(0, 300) }))
        .filter((p: any) => emailOk(p.email)),
      send_at: ammanLocalToIso(out.send_at_local),
      approval_rule: ["members_then_admin", "all_members", "majority"].includes(out.approval_rule) ? out.approval_rule : "members_then_admin",
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
  }, ["title", "goals", "final_vision", "duration_days", "emails"]),
  tool("update_collective_task", "Change a draft/planned collective task (only fields given). emails replaces the people list.", {
    task_id: { type: "string" }, title: { type: "string" }, goals: { type: "string" }, final_vision: { type: "string" },
    duration_days: { type: "integer" }, emails: { type: "array", items: { type: "string" } },
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
      for (const k of ["title", "goals", "final_vision", "approval_rule"]) if (typeof a?.[k] === "string" && a[k].trim()) fields[k] = a[k].trim();
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
        await service.from("collective_task_members").delete().eq("task_id", taskId);
        if (emails.length) await service.from("collective_task_members").insert(emails.map((email) => ({ task_id: taskId, email })));
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
        : { type: "send_now", task_id: id, label: `إرسال «${task.title}» الآن لكل المشاركين` };
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
    const msg = await geminiChat({ messages, tools: COMMAND_TOOLS, tool_choice: "auto", temperature: 0.3, max_tokens: 1500 });
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
    return { ok: true, reply: failed.length ? `أُرسلت، لكن تعذّر الوصول إلى: ${failed.join("، ")}` : "تم إرسال المهمة لكل المشاركين ✅", report: r.report };
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
    return json({ error: "unknown action" }, 400);
  } catch (e) {
    if (e instanceof UserError) return json({ error: e.message }, e.status);
    console.error("collective-task-ai", e);
    return json({ error: String((e as Error)?.message ?? e).slice(0, 300) }, 500);
  }
});
