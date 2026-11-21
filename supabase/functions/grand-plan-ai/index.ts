// «مساعد المهام الكبرى»: an AI that knows the team's master schedule (every scheduled team task, the
// programmers' collective tasks, rest days) and edits it on the principal's request.
//
// POST {messages:[{role,content}]} with the principal's Bearer token → {reply, changed}
//
// Safety: only platform admins; the AI may change only tasks that were not sent yet (publish_at in the
// future) and are not done; deletions and bulk moves are confirmed with the admin first (prompt rule).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const service = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

type Row = Record<string, any>;
const ROLE: Record<string, string> = {
  page_manager: "مسؤول الصفحة", file_manager: "رفع الملفات", speaker: "المتكلم", auditor: "المدقق",
  ai_manager: "مسؤول الذكاء الاصطناعي", supervisor: "المشرف", principal: "الرئيس",
};
const SUP_TAG = "__SUPERVISOR_TASK__";
const PLAN_FROM = "2026-11-21T21:00:00Z"; // 22/11 00:00 Amman
const PLAN_TO = "2026-12-05T21:00:00Z";   // 6/12 00:00 Amman
const amman = (iso: string | null) => iso
  ? new Date(iso).toLocaleString("ar-JO", { timeZone: "Asia/Amman", weekday: "long", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })
  : "—";
const isoAmman = (date: string, time = "20:00") => new Date(`${date}T${time}:00+03:00`).toISOString();
const detailsText = (t: Row) => {
  if (t.extra_requirements?.includes(SUP_TAG)) { try { return JSON.parse(t.details).details ?? ""; } catch { return t.details ?? ""; } }
  return t.details ?? "";
};

async function snapshot() {
  const [{ data: tasks }, { data: members }, { data: marks }] = await Promise.all([
    service.from("team_tasks").select("id,title,details,assignee_role,assignee_user_id,status,publish_at,due_at,points,extra_requirements,completed_at")
      .or(`publish_at.gte.${PLAN_FROM},due_at.gte.${PLAN_FROM}`).lt("publish_at", PLAN_TO).order("publish_at"),
    service.from("team_members").select("user_id,email,display_name,role"),
    service.from("team_plan_marks").select("*").order("day"),
  ]);
  const byUser = new Map((members ?? []).map((m: Row) => [m.user_id, m]));
  const now = Date.now();
  const lines = (tasks ?? []).filter((t: Row) => !(t.extra_requirements ?? []).includes("__TEAM_DAY_OFF__")).map((t: Row) => {
    const m = byUser.get(t.assignee_user_id) as Row | undefined;
    const who = t.extra_requirements?.includes(SUP_TAG) ? `المشرف ${m?.display_name ?? ""}` : m ? `${m.display_name} (${ROLE[t.assignee_role] ?? t.assignee_role})` : `أي ${ROLE[t.assignee_role] ?? t.assignee_role}`;
    const state = t.status === "done" ? "منجزة" : t.publish_at && Date.parse(t.publish_at) > now ? "مجدولة" : "وصلت";
    return `${String(t.id).slice(0, 8)} | ${amman(t.publish_at)} | ${who} | ${t.title} | ${t.points ?? 0} نقطة | ${state}`;
  });
  const markLines = (marks ?? []).map((k: Row) => `${String(k.id).slice(0, 8)} | ${k.day} | ${k.member_email ?? ROLE[k.role] ?? k.role} | ${k.label} (${k.kind})`);
  const people = (members ?? []).map((m: Row) => `${m.display_name} <${m.email}> ${ROLE[m.role] ?? m.role}`);
  return { tasks: (tasks ?? []) as Row[], members: (members ?? []) as Row[], text:
    `المهام (id مختصر | وقت الإرسال بعمّان | لمين | العنوان | النقاط | الحالة):\n${lines.join("\n")}\n\nعلامات الجدول (استراحات/ملاحظات):\n${markLines.join("\n") || "لا يوجد"}\n\nالأعضاء:\n${people.join("\n")}` };
}

const TOOLS = [
  { type: "function", function: { name: "move_tasks", description: "Move tasks that were not sent yet to another date (and optionally time, Amman). Due date shifts by the same amount.",
    parameters: { type: "object", properties: { ids: { type: "array", items: { type: "string" }, description: "short ids (8 chars) or full ids" }, date: { type: "string", description: "YYYY-MM-DD" }, time: { type: "string", description: "HH:mm, default 20:00" } }, required: ["ids", "date"] } } },
  { type: "function", function: { name: "update_task", description: "Change a task that was not sent yet: title, points, append text to its details, or due time.",
    parameters: { type: "object", properties: { id: { type: "string" }, title: { type: "string" }, points: { type: "integer" }, append_details: { type: "string" }, due_date: { type: "string" }, due_time: { type: "string" } }, required: ["id"] } } },
  { type: "function", function: { name: "reassign_task", description: "Give a task that was not sent yet to another member (by email).",
    parameters: { type: "object", properties: { id: { type: "string" }, member_email: { type: "string" } }, required: ["id", "member_email"] } } },
  { type: "function", function: { name: "create_task", description: "Schedule a new task. Default send time 20:00 Amman, due 23:59 same day.",
    parameters: { type: "object", properties: { member_email: { type: "string", description: "one person; omit to give it to anyone with the role" }, role: { type: "string", enum: ["page_manager", "file_manager", "speaker", "auditor", "ai_manager"] }, date: { type: "string" }, time: { type: "string" }, due_date: { type: "string" }, due_time: { type: "string" }, title: { type: "string" }, details: { type: "string" }, points: { type: "integer" } }, required: ["role", "date", "title", "details"] } } },
  { type: "function", function: { name: "delete_task", description: "Delete a task that was not sent yet. Only after the admin confirmed in the chat.",
    parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } } },
  { type: "function", function: { name: "add_mark", description: "Add a rest day / note / event to the schedule for a role or a person.",
    parameters: { type: "object", properties: { date: { type: "string" }, role: { type: "string" }, member_email: { type: "string" }, label: { type: "string" }, kind: { type: "string", enum: ["rest", "note", "event"] } }, required: ["date", "label", "kind"] } } },
  { type: "function", function: { name: "remove_mark", description: "Remove a schedule mark by id.", parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } } },
];

async function resolve(tasks: Row[], id: string) {
  const t = tasks.find((x) => x.id === id || String(x.id).startsWith(String(id).trim()));
  if (!t) return { error: `ما لقيت مهمة ${id}` };
  if (t.status === "done") return { error: `«${t.title}» منجزة، ما بتتعدّل` };
  if (t.publish_at && Date.parse(t.publish_at) <= Date.now()) return { error: `«${t.title}» وصلت لصاحبها، ما بتتعدّل من هون` };
  return { t };
}

async function runTool(name: string, a: Row, snap: { tasks: Row[]; members: Row[] }, admin: string) {
  const memberId = (email?: string) => snap.members.find((m) => m.email?.toLowerCase() === String(email ?? "").toLowerCase())?.user_id;
  switch (name) {
    case "move_tasks": {
      const done: string[] = [], errs: string[] = [];
      for (const id of a.ids ?? []) {
        const r = await resolve(snap.tasks, id);
        if (r.error) { errs.push(r.error); continue; }
        const t = r.t!;
        const pub = isoAmman(a.date, a.time || "20:00");
        if (Date.parse(pub) <= Date.now()) { errs.push("الوقت الجديد لازم يكون بالمستقبل"); continue; }
        const shift = t.publish_at ? Date.parse(pub) - Date.parse(t.publish_at) : 0;
        const due = t.due_at ? new Date(Date.parse(t.due_at) + shift).toISOString() : null;
        const { error } = await service.from("team_tasks").update({ publish_at: pub, due_at: due }).eq("id", t.id);
        error ? errs.push(error.message) : done.push(t.title);
      }
      return { moved: done, errors: errs };
    }
    case "update_task": {
      const r = await resolve(snap.tasks, a.id); if (r.error) return r;
      const t = r.t!; const patch: Row = {};
      if (a.title) patch.title = String(a.title).slice(0, 200);
      if (Number.isInteger(a.points) && a.points >= 0 && a.points <= 200) patch.points = a.points;
      if (a.append_details) {
        if (t.extra_requirements?.includes(SUP_TAG)) {
          let p: Row = {}; try { p = JSON.parse(t.details); } catch { /* */ }
          patch.details = JSON.stringify({ ...p, details: `${p.details ?? ""}\n\n${a.append_details}` });
        } else patch.details = `${t.details ?? ""}\n\n${a.append_details}`.slice(0, 8000);
      }
      if (a.due_date) patch.due_at = isoAmman(a.due_date, a.due_time || "23:59");
      const { error } = await service.from("team_tasks").update(patch).eq("id", t.id);
      return error ? { error: error.message } : { updated: t.title, fields: Object.keys(patch) };
    }
    case "reassign_task": {
      const r = await resolve(snap.tasks, a.id); if (r.error) return r;
      const m = snap.members.find((x) => x.email?.toLowerCase() === String(a.member_email).toLowerCase());
      if (!m) return { error: "ما لقيت هالعضو" };
      const { error } = await service.from("team_tasks").update({ assignee_user_id: m.user_id, assignee_role: r.t!.extra_requirements?.includes(SUP_TAG) ? r.t!.assignee_role : m.role }).eq("id", r.t!.id);
      return error ? { error: error.message } : { reassigned: r.t!.title, to: m.display_name };
    }
    case "create_task": {
      const pub = isoAmman(a.date, a.time || "20:00");
      if (Date.parse(pub) <= Date.now()) return { error: "وقت الإرسال لازم يكون بالمستقبل" };
      const uid = a.member_email ? memberId(a.member_email) : null;
      if (a.member_email && !uid) return { error: "ما لقيت هالعضو" };
      const { data, error } = await service.from("team_tasks").insert({
        title: String(a.title).slice(0, 200), details: String(a.details).slice(0, 8000), assignee_role: a.role, assignee_user_id: uid,
        publish_at: pub, due_at: isoAmman(a.due_date || a.date, a.due_time || "23:59"),
        points: Number.isInteger(a.points) ? a.points : null, created_by: admin,
      }).select("id").single();
      return error ? { error: error.message } : { created: a.title, id: String(data.id).slice(0, 8) };
    }
    case "delete_task": {
      const r = await resolve(snap.tasks, a.id); if (r.error) return r;
      const { error } = await service.from("team_tasks").delete().eq("id", r.t!.id);
      return error ? { error: error.message } : { deleted: r.t!.title };
    }
    case "add_mark": {
      const { data, error } = await service.from("team_plan_marks").insert({
        day: a.date, role: a.role || null, member_email: a.member_email || null, label: String(a.label).slice(0, 200), kind: a.kind,
      }).select("id").single();
      return error ? { error: error.message } : { added: a.label, id: String(data.id).slice(0, 8) };
    }
    case "remove_mark": {
      const { data } = await service.from("team_plan_marks").select("id,label");
      const m = (data ?? []).find((x: Row) => String(x.id).startsWith(String(a.id)));
      if (!m) return { error: "ما لقيت العلامة" };
      await service.from("team_plan_marks").delete().eq("id", m.id);
      return { removed: m.label };
    }
  }
  return { error: "أداة غير معروفة" };
}

function providers() {
  const list: { name: string; url: string; key: string; model: string }[] = [];
  const u = Deno.env.get("ADMIN_BRAIN_LLM_URL"), k = Deno.env.get("ADMIN_BRAIN_LLM_KEY");
  let models = (Deno.env.get("ADMIN_BRAIN_LLM_MODEL") ?? "").split(",").map((m) => m.trim()).filter(Boolean);
  if (u?.includes("groq.com") && !models.includes("openai/gpt-oss-20b")) models = [...models, "openai/gpt-oss-20b"];
  if (u && k) for (const m of models) list.push({ name: m.split("/").pop()!, url: u, key: k, model: m });
  const g = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("ADMIN_BRAIN_GEMINI_KEY");
  if (g) list.push({ name: "gemini", url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", key: g, model: Deno.env.get("ADMIN_BRAIN_GEMINI_MODEL") || "gemini-3.1-flash-lite" });
  return list;
}

const SYSTEM = (plan: string, today: string) => `أنت «مساعد المهام الكبرى» لمدير منصة ذروة العلم. تعرف جدول مهام الفريق كامل (تحت) وتعدّله لما يطلب المدير.
احكِ بلهجة أردنية واضحة ومختصرة. اليوم ووقته بعمّان: ${today}.
قواعد:
- كل المهام بتنبعت الساعة 8:00 المسا بتوقيت عمّان، إلا إذا المدير طلب غير هيك.
- بتقدر تعدّل بس المهام اللي لسا ما وصلت (مجدولة). المنجزة واللي وصلت ما بتتعدّل؛ قول هيك.
- قبل الحذف، أو قبل تعديل أكثر من 5 مهام مرة وحدة: اعرض شو رح تعمل واطلب «نعم» صريحة من المدير، وبعدها نفّذ.
- لما تنفّذ أي تعديل، لخّص بسطر شو تغيّر.
- للأسئلة (مين عنده شو، كم نقطة، شو بكرة…) جاوب من الجدول بدقة، ولا تخترع إشي مش موجود.
- التواريخ بصيغة YYYY-MM-DD لما تستعمل الأدوات. المهام اللي لأي شخص بالدور ما إلها عضو.

${plan}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: u } = await service.auth.getUser(token);
    if (!u?.user) return json({ error: "سجّل الدخول" }, 401);
    const { data: isAdmin } = await service.rpc("is_platform_admin", { _user_id: u.user.id });
    if (isAdmin !== true) return json({ error: "للمدير فقط" }, 403);

    const body = await req.json().catch(() => ({}));
    const msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-16)
      .map((m: Row) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content ?? "").slice(0, 2000) }))
      .filter((m: Row) => m.content);
    if (!msgs.length) return json({ error: "اكتب طلبك" }, 400);

    let snap = await snapshot();
    const today = new Date().toLocaleString("ar-JO", { timeZone: "Asia/Amman", dateStyle: "full", timeStyle: "short" });
    const convo: Row[] = [{ role: "system", content: SYSTEM(snap.text, today) }, ...msgs];
    let changed = false;
    for (const p of providers()) {
      try {
        for (let step = 0; step < 6; step++) {
          const r = await fetch(p.url, {
            method: "POST", headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: p.model, temperature: 0.2, max_tokens: 1200, messages: convo, tools: TOOLS, tool_choice: "auto" }),
            signal: AbortSignal.timeout(45_000),
          });
          if (!r.ok) throw new Error(`${p.name} ${r.status}`);
          const j = await r.json();
          service.from("ai_usage_log").insert({ fn: "grand-plan-ai", kind: "chat", provider: p.name, model: p.model, user_id: u.user.id,
            tokens_in: j?.usage?.prompt_tokens ?? 0, tokens_out: j?.usage?.completion_tokens ?? 0 }).then(() => {}, () => {});
          const msg = j?.choices?.[0]?.message;
          const calls = msg?.tool_calls ?? [];
          if (!calls.length) return json({ reply: String(msg?.content ?? "").trim() || "تم.", changed });
          convo.push({ role: "assistant", content: msg.content ?? "", tool_calls: calls });
          for (const c of calls) {
            let args: Row = {};
            try { args = JSON.parse(c.function?.arguments || "{}"); } catch { /* */ }
            const out = await runTool(c.function?.name, args, snap, u.user.id);
            if (!("error" in out)) changed = true;
            convo.push({ role: "tool", tool_call_id: c.id, content: JSON.stringify(out) });
          }
          if (changed) snap = await snapshot();
        }
        return json({ reply: "خلّصت التعديلات.", changed });
      } catch (e) {
        console.warn("grand-plan-ai", (e as Error).message);
        if (changed) return json({ reply: "نفّذت جزء من التعديلات، وصار خطأ بالباقي. راجع الجدول وجرّب مرة ثانية.", changed });
      }
    }
    return json({ error: "المساعد مش متاح هلأ، جرّب بعد شوي." }, 503);
  } catch (e) {
    console.error(e);
    return json({ error: "خطأ غير متوقع" }, 500);
  }
});
