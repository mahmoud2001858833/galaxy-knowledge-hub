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

async function plan(taskId: string) {
  const { task, members } = await loadTask(taskId);
  if (!members.length) return json({ error: "أضف بريداً واحداً على الأقل قبل طلب الخطة" }, 400);
  if (!["draft", "planned"].includes(task.status)) return json({ error: "لا يمكن تغيير خطة مهمة أُرسلت" }, 409);

  const { text, model } = await gemini(buildPrompt(task, members), SYSTEM);
  let raw: Plan;
  try { raw = JSON.parse(text); } catch { return json({ error: "رد الذكاء الاصطناعي ليس JSON صالحاً، جرّب مرة أخرى" }, 502); }
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
  return json({ ok: true, model, subtasks: p.subtasks.length });
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
  const now = new Date().toISOString();
  const { data, error } = await service.from("collective_tasks")
    .update({ emailed_at: now, send_at: now, status: "active" })
    .eq("id", taskId).in("status", ["planned", "scheduled"]).is("emailed_at", null)
    .select("*").maybeSingle();
  if (error) throw error;
  if (!data) return json({ error: "المهمة أُرسلت من قبل أو ليست جاهزة (اطلب الخطة أولاً)" }, 409);
  return json({ ok: true, report: await sendTask(data as Task) });
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
    const taskId = String(body?.task_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(taskId)) return json({ error: "task_id مطلوب" }, 400);
    if (action === "plan") return await plan(taskId);
    if (action === "send_now") return await sendNow(taskId);
    return json({ error: "unknown action" }, 400);
  } catch (e) {
    console.error("collective-task-ai", e);
    return json({ error: String((e as Error)?.message ?? e).slice(0, 300) }, 500);
  }
});
