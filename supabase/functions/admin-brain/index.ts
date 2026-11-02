// "العقل المركزي" (no-OpenAI-key engine): the admin talks, the browser transcribes (Web Speech),
// this function thinks (AI gateway, Gemini) and speaks (gateway TTS).
// - action "chat":  runs the model with two kinds of tools:
//     server tools  -> read the platform's data with the service role (admin-verified here) and loop;
//     client tools  -> returned to the browser (navigate, click, run an experiment...), which runs
//                      them and calls back with the results.
// - action "speak": text -> audio (wav).
// Only is_platform_admin users get anything. All data tools are read-only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MODEL = "google/gemini-2.5-flash";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const service = createClient(SB_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------- what the brain knows about the database ----------
// Tables worth watching, with what they mean (any other public table can still be read by name).
const CATALOG: Record<string, string> = {
  profiles: "المستخدمون المسجلون (الاسم، تاريخ التسجيل)",
  jordanian_assistant_chat_history: "محادثات الطلاب مع المساعد الأردني الذكي",
  jordanian_conversations: "عناوين محادثات المساعد الأردني",
  messages: "الرسائل بين المستخدمين",
  team_messages: "رسائل فريق العمل",
  team_notifications: "إشعارات الفريق",
  community_forum_messages: "رسائل المنتدى المجتمعي",
  contact_messages: "رسائل تواصل معنا",
  institutional_partnerships: "طلبات الشراكات المؤسسية",
  ai_builder_projects: "مشاريع منشئ التطبيقات بالذكاء الاصطناعي",
  ai_builder_conversations: "محادثات منشئ التطبيقات",
  user_solved_puzzles: "الألغاز التي حلها الطلاب",
  subject_puzzles: "الألغاز التعليمية",
  school_news: "أخبار المدرسة",
  school_news_comments: "تعليقات الأخبار",
  btec_student_projects: "مشاريع طلاب BTEC",
  btec_project_comments: "تعليقات مشاريع BTEC",
  art_projects: "المشاريع الفنية",
  tawjihi_files: "ملفات التوجيهي المرفوعة",
  spaced_reviews: "مراجعات التكرار المتباعد",
  student_assistant_usage: "استخدام المساعد الطلابي",
  terminal_command_logs: "أوامر الطرفية التي نُفذت",
  bridge_jobs: "مهام الجسر المحلي",
  admin_audit_logs: "سجل تدقيق عمليات الإدارة",
  admin_teacher_access: "صلاحيات المدراء والمعلمين",
  clinical_sessions: "جلسات البرنامج العلاجي",
  adhd_training_sessions: "جلسات تدريب ADHD",
};
const CONVERSATION_TABLES = [
  "jordanian_assistant_chat_history", "messages", "team_messages", "community_forum_messages",
  "contact_messages", "ai_builder_conversations",
];
const SECRET_COL = /pass|token|secret|api_?key|hash|otp|session_key|private/i;

function clean(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (SECRET_COL.test(k)) continue;
    if (typeof v === "string") out[k] = v.length > 280 ? v.slice(0, 280) + "…" : v;
    else if (v && typeof v === "object") {
      const s = JSON.stringify(v);
      out[k] = s.length > 200 ? s.slice(0, 200) + "…" : v;
    } else out[k] = v;
  }
  return out;
}

const sinceIso = (hours: number) => new Date(Date.now() - Math.max(1, Math.min(24 * 90, hours)) * 3600_000).toISOString();

async function countSince(table: string, since?: string) {
  let q = service.from(table).select("*", { count: "exact", head: true });
  if (since) q = q.gte("created_at", since);
  const { count, error } = await q;
  return error ? null : count ?? 0;
}

async function latest(table: string, limit: number, since?: string, search?: string) {
  const run = async (ordered: boolean) => {
    let q = service.from(table).select("*").limit(limit);
    if (ordered) q = q.order("created_at", { ascending: false });
    if (since && ordered) q = q.gte("created_at", since);
    return await q;
  };
  let { data, error } = await run(true);
  if (error) ({ data, error } = await run(false)); // table without created_at
  if (error) return { error: error.message };
  let rows = (data ?? []).map(clean);
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(s));
  }
  return { table, rows };
}

let emailCache: { at: number; map: Map<string, string> } | null = null;
async function emails() {
  if (emailCache && Date.now() - emailCache.at < 5 * 60_000) return emailCache.map;
  const map = new Map<string, string>();
  for (let page = 1; page <= 5; page++) {
    const { data } = await service.auth.admin.listUsers({ page, perPage: 1000 });
    const users = data?.users ?? [];
    users.forEach((u) => map.set(u.id, u.email ?? ""));
    if (users.length < 1000) break;
  }
  emailCache = { at: Date.now(), map };
  return map;
}

async function withNames(rows: Record<string, unknown>[]) {
  const ids = [...new Set(rows.flatMap((r) => [r.user_id, r.sender_id].filter((x): x is string => typeof x === "string")))];
  if (!ids.length) return rows;
  const { data } = await service.from("profiles").select("id, full_name").in("id", ids);
  const names = new Map((data ?? []).map((p: any) => [p.id, p.full_name]));
  const mails = await emails();
  return rows.map((r) => {
    const id = (r.user_id ?? r.sender_id) as string | undefined;
    return id ? { ...r, _who: names.get(id) || mails.get(id) || id.slice(0, 8) } : r;
  });
}

const SERVER_TOOLS: Record<string, (a: any) => Promise<unknown>> = {
  async platform_activity({ hours = 24 }) {
    const since = sinceIso(Number(hours) || 24);
    const entries = await Promise.all(
      Object.entries(CATALOG).map(async ([t, label]) => [t, label, await countSince(t, since)] as const),
    );
    const mails = await emails();
    const { data: newest } = await service.from("profiles").select("id, full_name, created_at")
      .gte("created_at", since).order("created_at", { ascending: false }).limit(10);
    return {
      since,
      new_rows: entries.filter(([, , n]) => n && n > 0).map(([t, label, n]) => ({ table: t, meaning: label, count: n })),
      total_users: mails.size,
      newest_users: (newest ?? []).map((p: any) => ({ name: p.full_name, email: mails.get(p.id), at: p.created_at })),
    };
  },
  async latest_conversations({ limit = 15, hours = 72, search }) {
    const since = sinceIso(Number(hours) || 72);
    const per = Math.min(20, Math.max(3, Number(limit) || 15));
    const parts = await Promise.all(CONVERSATION_TABLES.map((t) => latest(t, per, since, search)));
    const rows = parts.flatMap((p: any) => (p.rows ?? []).map((r: any) => ({ _source: CATALOG[p.table] ?? p.table, ...r })));
    rows.sort((a: any, b: any) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
    return { since, items: await withNames(rows.slice(0, per * 2)) };
  },
  async read_table({ table, limit = 10, hours, search }) {
    if (typeof table !== "string" || !/^[a-z0-9_]{2,63}$/.test(table)) return { error: "invalid table name" };
    const res: any = await latest(table, Math.min(50, Math.max(1, Number(limit) || 10)), hours ? sinceIso(Number(hours)) : undefined, search);
    if (res.rows) res.rows = await withNames(res.rows);
    return res;
  },
  async count_rows({ table, hours }) {
    if (typeof table !== "string" || !/^[a-z0-9_]{2,63}$/.test(table)) return { error: "invalid table name" };
    const n = await countSince(table, hours ? sinceIso(Number(hours)) : undefined);
    return n === null ? { error: "table not readable" } : { table, count: n, since: hours ? sinceIso(Number(hours)) : "ever" };
  },
  async find_user({ query }) {
    const q = String(query ?? "").trim().toLowerCase();
    if (q.length < 2) return { error: "query too short" };
    const mails = await emails();
    const { data } = await service.from("profiles").select("id, full_name, created_at").ilike("full_name", `%${q}%`).limit(10);
    const byName = (data ?? []).map((p: any) => ({ id: p.id, name: p.full_name, email: mails.get(p.id), joined: p.created_at }));
    const byMail = [...mails.entries()].filter(([, e]) => e.toLowerCase().includes(q)).slice(0, 10).map(([id, email]) => ({ id, email }));
    const { data: roles } = await service.from("admin_teacher_access").select("user_id, role").in("user_id", [...byName, ...byMail].map((u) => u.id));
    const role = new Map((roles ?? []).map((r: any) => [r.user_id, r.role]));
    return { users: [...byName, ...byMail].map((u) => ({ ...u, role: role.get(u.id) ?? "user" })) };
  },
};

const fn = (name: string, description: string, properties: Record<string, unknown> = {}, required: string[] = []) => ({
  type: "function",
  function: { name, description, parameters: { type: "object", properties, required } },
});

const TOOLS = [
  // server (data, read-only)
  fn("platform_activity", "What happened on the platform recently: new rows per area, newest users, total users.", { hours: { type: "number", description: "Look back this many hours (default 24)" } }),
  fn("latest_conversations", "Latest messages/conversations across the platform (student AI chats, user messages, team chat, forum, contact form).", {
    hours: { type: "number" }, limit: { type: "number" }, search: { type: "string", description: "Only items containing this text" },
  }),
  fn("read_table", "Read the newest rows of any database table by name (see the table list in your instructions).", {
    table: { type: "string" }, limit: { type: "number" }, hours: { type: "number" }, search: { type: "string" },
  }, ["table"]),
  fn("count_rows", "Count rows in a table, optionally only those created in the last N hours.", { table: { type: "string" }, hours: { type: "number" } }, ["table"]),
  fn("find_user", "Find users by part of their name or email; returns their role.", { query: { type: "string" } }, ["query"]),
  // client (screen)
  fn("navigate_to", "Open a page of the platform on the admin's screen.", { path: { type: "string", description: "Route path from the page list, e.g. /chemistry" } }, ["path"]),
  fn("go_back", "Go back to the previous page."),
  fn("scroll_page", "Scroll the current page.", { direction: { type: "string", enum: ["up", "down", "top", "bottom"] } }, ["direction"]),
  fn("read_screen", "See the title, headings, buttons, links and inputs on the admin's screen right now."),
  fn("click_element", "Click a button/link/tab by its visible text. Deleting, publishing, sending or paying waits for the admin's confirmation.", { text: { type: "string" } }, ["text"]),
  fn("type_into", "Type into an input identified by its label or placeholder.", { field: { type: "string" }, text: { type: "string" }, submit: { type: "boolean" } }, ["field", "text"]),
  fn("run_experiment", "Run a real scientific simulation (computed with physics/chemistry/biology equations) and show the admin its chart and results.", {
    experiment: { type: "string", enum: ["projectile", "pendulum", "free_fall_drag", "ohms_law", "radioactive_decay", "ideal_gas", "spring_oscillator", "titration", "population_growth"] },
    params: { type: "object", description: "Optional numeric parameters, e.g. {v0:20, angle:45} for projectile; {length:1} pendulum; {mass:70, drag:0.25} free_fall_drag; {voltage:12, resistance:10} ohms_law; {half_life:5, n0:1000} radioactive_decay; {moles:1, volume:0.0224} ideal_gas; {k:50, mass:2, amplitude:0.1, damping:0.3} spring_oscillator; {acid_conc:0.1, acid_volume:25, base_conc:0.1} titration; {r:0.4, K:1000, n0:10} population_growth" },
  }, ["experiment"]),
];
const CLIENT_TOOLS = new Set(["navigate_to", "go_back", "scroll_page", "read_screen", "click_element", "type_into", "run_experiment"]);

function systemPrompt(pages: { title: string; path: string }[], current: string) {
  const list = pages.slice(0, 160).map((p) => `- ${p.title}: ${p.path}`).join("\n");
  const tables = Object.entries(CATALOG).map(([t, d]) => `- ${t}: ${d}`).join("\n");
  return `أنتِ "العقل المركزي" لمنصة ذروة العلم. تتحدثين فقط مع مدير المنصة، وكلامك سيُقرأ بصوت عالٍ.
الشخصية: ذكية، دافئة، واثقة، سريعة البديهة. لهجة عربية طبيعية قريبة من الأردنية، جمل قصيرة كإنسان حقيقي، بلا مقدمات ولا تعداد طويل ولا رموز Markdown. أرقام قليلة ومهمة فقط. إذا تكلم بالإنجليزية فردّي بالإنجليزية.

ما تستطيعين فعله:
- معرفة كل ما يحدث في المنصة: platform_activity (ماذا حدث اليوم/هذا الأسبوع)، latest_conversations (آخر المحادثات)، read_table و count_rows (أي جدول)، find_user (أي مستخدم). استعمليها دائماً قبل الإجابة عن أي سؤال عن البيانات، ولا تخترعي أي رقم.
- التحكم بشاشة المدير: "وديني على X" → navigate_to فوراً ثم جملة قصيرة. لتعرفي ما على الشاشة read_screen ثم click_element أو type_into.
- التجارب العلمية: "اعمل تجربة/جرّب/احسب..." → run_experiment بقيم معقولة (أو قيم المدير)، ثم اشرحي النتيجة بجملتين من الأرقام التي رجعت.
- إذا أرجعت أداة needs_confirmation فاسألي المدير عن التأكيد وانتظري ولا تعيدي المحاولة؛ النظام ينفذ عندما يؤكد.
- لا تكشفي كلمات مرور أو مفاتيح. إذا لم تستطيعي فعل شيء قولي ذلك بصراحة.

الصفحة الحالية: ${current}
صفحات المنصة:
${list}

جداول مهمة في قاعدة البيانات:
${tables}`;
}

async function gateway(messages: unknown[]) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  for (let i = 0; i < 3; i++) {
    const r = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages, tools: TOOLS, tool_choice: "auto" }),
    });
    if (r.status === 429 && i < 2) { await new Promise((s) => setTimeout(s, 700 * (i + 1))); continue; }
    if (!r.ok) throw new Error(`gateway ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    return j?.choices?.[0]?.message;
  }
  throw new Error("gateway busy");
}

/** Keep the history short, never starting in the middle of a tool exchange. */
function trim(history: any[]) {
  let h = history.slice(-28);
  while (h.length && h[0].role !== "user") h = h.slice(1);
  return h;
}

async function chat(body: any) {
  const pages = Array.isArray(body?.pages)
    ? body.pages.filter((p: any) => typeof p?.title === "string" && typeof p?.path === "string" && p.path.startsWith("/"))
        .map((p: any) => ({ title: p.title.slice(0, 60), path: p.path.slice(0, 80) }))
    : [];
  const current = typeof body?.current === "string" ? body.current.slice(0, 120) : "/";
  const history: any[] = trim(Array.isArray(body?.messages) ? body.messages : []);
  const added: any[] = [];

  for (let round = 0; round < 6; round++) {
    const msg = await gateway([{ role: "system", content: systemPrompt(pages, current) }, ...history, ...added]);
    if (!msg) throw new Error("empty answer");
    const calls: any[] = msg.tool_calls ?? [];
    const assistant = { role: "assistant", content: msg.content ?? "", ...(calls.length ? { tool_calls: calls } : {}) };
    added.push(assistant);
    if (!calls.length) return { reply: String(msg.content ?? "").trim(), added };

    const clientCalls: any[] = [];
    for (const c of calls) {
      const name = c.function?.name;
      let args: any = {};
      try { args = JSON.parse(c.function?.arguments || "{}"); } catch { /* empty */ }
      if (CLIENT_TOOLS.has(name)) { clientCalls.push({ id: c.id, name, args }); continue; }
      let out: unknown;
      try { out = SERVER_TOOLS[name] ? await SERVER_TOOLS[name](args) : { error: `unknown tool ${name}` }; }
      catch (e) { out = { error: String(e).slice(0, 200) }; }
      added.push({ role: "tool", tool_call_id: c.id, content: JSON.stringify(out).slice(0, 12000) });
    }
    // the browser runs screen tools, appends their results and calls us again
    if (clientCalls.length) return { client_calls: clientCalls, say: String(msg.content ?? "").trim(), added };
  }
  return { reply: "خلّيني أوقف هون، الطلب طوّل علي. شو بدك بالضبط؟", added };
}

// ---------- voice ----------
const VOICE_STYLE = "تكلمي بالعربية بلهجة أردنية خفيفة، بصوت أنثوي دافئ وواثق وحيوي كإنسانة حقيقية، بإيقاع طبيعي غير مستعجل، مع تعابير ونبرة تتغير حسب المعنى.";
async function speak(text: string) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  let last = "";
  for (const voice of ["coral", "nova"]) {
    for (let i = 0; i < 3; i++) {
      const r = await fetch(`${GATEWAY}/audio/speech`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "openai/gpt-4o-mini-tts", voice, input: text, instructions: VOICE_STYLE, response_format: "mp3" }),
      });
      if (r.ok) return new Uint8Array(await r.arrayBuffer());
      last = `${r.status}: ${(await r.text()).slice(0, 160)}`;
      if (r.status !== 429) break;
      await new Promise((s) => setTimeout(s, 500 * (i + 1)));
    }
  }
  throw new Error(`tts ${last}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: u, error: uErr } = await service.auth.getUser(token);
    if (uErr || !u?.user) return json({ error: "not signed in" }, 401);
    const { data: isAdmin, error: aErr } = await service.rpc("is_platform_admin", { _user_id: u.user.id });
    if (aErr || isAdmin !== true) return json({ error: "admins only" }, 403);

    const body = await req.json().catch(() => ({}));
    if (body?.action === "speak") {
      const text = typeof body.text === "string" ? body.text.trim().slice(0, 900) : "";
      if (!text) return json({ error: "no text" }, 400);
      const audio = await speak(text);
      return new Response(audio, { headers: { ...cors, "Content-Type": "audio/mpeg" } });
    }
    return json(await chat(body));
  } catch (e) {
    console.error("admin-brain", e);
    return json({ error: String(e).slice(0, 300) }, 500);
  }
});
