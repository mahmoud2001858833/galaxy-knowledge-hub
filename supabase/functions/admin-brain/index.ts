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

let PAGES: { title: string; path: string }[] = [];
const normAr = (x: string) => x.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[ًٌٍَُِّْـ]/g, "");

const SERVER_TOOLS: Record<string, (a: any) => Promise<unknown>> = {
  async find_page({ query }) {
    const words = normAr(String(query ?? "")).split(/[\s/,-]+/).filter((w) => w.length > 1);
    const scored = PAGES.map((p) => {
      const hay = normAr(`${p.title} ${p.path.replace(/[-/]/g, " ")}`);
      return { ...p, score: words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0) };
    }).filter((p) => p.score > 0).sort((a, b) => b.score - a.score);
    return { matches: scored.slice(0, 8).map(({ title, path }) => ({ title, path })) };
  },
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
  fn("find_page", "Find platform pages/experiments by words (Arabic or English), returns title+path to use with navigate_to.", { query: { type: "string" } }, ["query"]),
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
  fn("read_controls", "List the sliders, number boxes, selects, switches and tabs on the current page (an experiment's variables) with their current values and ids.")
  ,fn("set_control", "Change one control on the current page: a slider/number to a value, a select to an option, a switch on/off, or open a tab. Use the id or name from read_controls.", {
    control: { type: "string", description: "id (number) or name from read_controls" },
    value: { type: "string", description: "number, option text, or on/off (ignored for tabs)" },
  }, ["control"]),
  fn("read_page_text", "Read the visible text of the current page: results, readouts, explanations. Use it after changing an experiment to explain what happened."),
  fn("send_team_message", "Send a message in the team chat (team_messages), to the whole group or privately to one member. Waits for the admin's confirmation.", {
    text: { type: "string" }, to: { type: "string", description: "member name or email; empty = the whole team group" },
  }, ["text"]),
  fn("terminal_run", "Type a command into the platform's real terminal (/terminal, opened automatically) as the admin and return its output. Examples: 'help', 'stats', 'users', 'db tables', 'antigravity <task>', 'claude <task>', 'sh <shell command>'. Account-changing or deleting commands wait for confirmation.", {
    command: { type: "string" },
  }, ["command"]),
  fn("terminal_read", "Read the latest lines of the terminal (e.g. while an agent is still working).", { lines: { type: "number" } }),
  fn("run_experiment", "Run a real scientific simulation (computed with physics/chemistry/biology equations) and show the admin its chart and results.", {
    experiment: { type: "string", enum: ["projectile", "pendulum", "free_fall_drag", "ohms_law", "radioactive_decay", "ideal_gas", "spring_oscillator", "titration", "population_growth", "galvanic_cell"] },
    params: { type: "object", description: "Optional numeric parameters, e.g. {v0:20, angle:45} for projectile; {length:1} pendulum; {mass:70, drag:0.25} free_fall_drag; {voltage:12, resistance:10} ohms_law; {half_life:5, n0:1000} radioactive_decay; {moles:1, volume:0.0224} ideal_gas; {k:50, mass:2, amplitude:0.1, damping:0.3} spring_oscillator; {acid_conc:0.1, acid_volume:25, base_conc:0.1} titration; {r:0.4, K:1000, n0:10} population_growth; {anode:'Zn', cathode:'Cu', anode_conc:1, cathode_conc:1, temperature:298} galvanic_cell (electrochemical/chemical cell; metals: Li,K,Mg,Al,Zn,Fe,Ni,Sn,Pb,Cu,Ag,Au)" },
  }, ["experiment"]),
];
const CLIENT_TOOLS = new Set([
  "navigate_to", "go_back", "scroll_page", "read_screen", "click_element", "type_into", "run_experiment",
  "read_controls", "set_control", "read_page_text", "send_team_message", "terminal_run", "terminal_read",
]);

function systemPrompt(pages: { title: string; path: string }[], current: string) {
  // Groq's free tier allows 8k tokens/minute, so the prompt stays small: only the main sections here,
  // every other page (≈260, incl. 70 experiments) is found with the find_page tool.
  const list = pages.filter((p) => !p.title.startsWith("تجربة:")).slice(0, 25).map((p) => `${p.title} ${p.path}`).join(" | ");
  const tables = Object.keys(CATALOG).join(", ");
  return `أنتِ "العقل المركزي" لمنصة ذروة العلم. تتحدثين فقط مع مدير المنصة، وكلامك سيُقرأ بصوت عالٍ.
المدير رجل: خاطبيه دائماً بصيغة المذكّر (مثل: تفضّل، شو بدّك، جرّب).
الشخصية: ذكية، دافئة، واثقة، سريعة البديهة. لهجة عربية طبيعية قريبة من الأردنية، جمل قصيرة كإنسان حقيقي، بلا مقدمات ولا تعداد طويل ولا رموز Markdown. أرقام قليلة ومهمة فقط. إذا تكلم بالإنجليزية فردّي بالإنجليزية.

ما تستطيعين فعله (نفّذي بنفسك، لا تطلبي من المدير أن يفعل شيئاً تقدرين عليه):
- معرفة كل ما يحدث في المنصة: platform_activity، latest_conversations، read_table و count_rows (أي جدول)، find_user. استعمليها قبل أي جواب عن البيانات ولا تخترعي أرقاماً.
- التنقل والتحكم: navigate_to ثم read_screen، click_element، type_into، scroll_page.
- التجارب على صفحات المنصة (صفحات "تجربة:" في القائمة): افتحي الصفحة بـ navigate_to، ثم read_controls لتري المتغيرات، ثم set_control لتغييرها (مثلاً الحرارة أو التركيز أو الزاوية)، ثم read_page_text لتقرئي النتيجة، واشرحي للمدير ماذا تغيّر ولماذا علمياً. إذا قال "غيّر/زيد/نقّص X" فغيّريه فوراً.
- تجارب محسوبة بسرعة مع رسم: run_experiment.
- رسائل الفريق: send_team_message (للمجموعة كلها أو لعضو). لا تحاولي الكتابة في صفحات أخرى لإرسال رسائل.
- الطرفية: terminal_run يكتب الأمر في الطرفية الحقيقية بصلاحيات المدير. أوامرها: help، stats، users، sessions، db health|tables|migrations، logs، quota؛ و "antigravity <المهمة بالتفصيل>" لتكليف Antigravity، و "claude <المهمة>" لتكليف Claude، و "sh <أمر>" لأوامر الجهاز. بعد تكليف وكيل استعملي terminal_read لمتابعة رده. أي تعديل كود يحتاج موافقة المدير من /admin?tab=terminal قبل أن يُرفع.

قواعد مهمة:
- لا تقولي "تم" أو "ضغطت" إلا إذا أرجعت الأداة ok. إذا فشلت أداة جربي طريقة ثانية (read_screen، read_controls، أداة أخرى) قبل أن تسألي المدير، وقولي له بصدق ما الذي لم ينجح.
- إذا أرجعت أداة needs_confirmation فاسألي المدير عن التأكيد بجملة واحدة وانتظري؛ النظام ينفذ عندما يؤكد.
- لا ترفضي طلبات المدير العادية (صور، نصوص، مواضيع عامة)؛ أنت مساعدته الكاملة. الرفض فقط لما يضر أحداً.
- لا تكشفي كلمات مرور أو مفاتيح.

الصفحة الحالية: ${current}
صفحات رئيسية: ${list}
لأي صفحة أو تجربة أخرى استعملي find_page أولاً (مثلاً find_page("موجات") ثم navigate_to).
جداول مهمة (read_table): ${tables}`;
}

// ---------- which model answers ----------
// Tried in order; a provider that fails is skipped for 5 minutes so it never slows every request.
//  1. any OpenAI-compatible API you configure (fastest free option: Groq; Cloudflare Workers AI works too)
//       ADMIN_BRAIN_LLM_URL   e.g. https://api.groq.com/openai/v1/chat/completions
//                             or   https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/ai/v1/chat/completions
//       ADMIN_BRAIN_LLM_KEY   the API key / token
//       ADMIN_BRAIN_LLM_MODEL e.g. openai/gpt-oss-120b (Groq) or @cf/meta/llama-4-scout-17b-16e-instruct (Cloudflare)
//  2. Google Gemini directly (ADMIN_BRAIN_GEMINI_KEY, needs billing on that Google project)
type Provider = { name: string; url: string; key: string; model: string };
const skipUntil = new Map<string, number>();

function providers(): Provider[] {
  const list: Provider[] = [];
  const u = Deno.env.get("ADMIN_BRAIN_LLM_URL"), k = Deno.env.get("ADMIN_BRAIN_LLM_KEY");
  // ADMIN_BRAIN_LLM_MODEL may list several models, comma-separated; on Groq each model has its own
  // free 8k-tokens/minute budget, so gpt-oss-20b is added as a backup automatically.
  let models = (Deno.env.get("ADMIN_BRAIN_LLM_MODEL") ?? "").split(",").map((m) => m.trim()).filter(Boolean);
  if (u?.includes("groq.com") && !models.includes("openai/gpt-oss-20b")) models = [...models, "openai/gpt-oss-20b"];
  if (u && k) for (const m of models) list.push({ name: m.split("/").pop()!, url: u, key: k, model: m });
  // Cloudflare Workers AI: a second free pool (its own daily allowance)
  const cfAcc = Deno.env.get("ADMIN_BRAIN_CF_ACCOUNT_ID"), cfTok = Deno.env.get("ADMIN_BRAIN_CF_TOKEN");
  if (cfAcc && cfTok) list.push({
    name: "cloudflare",
    url: `https://api.cloudflare.com/client/v4/accounts/${cfAcc}/ai/v1/chat/completions`,
    key: cfTok,
    model: Deno.env.get("ADMIN_BRAIN_CF_MODEL") || "@cf/meta/llama-4-scout-17b-16e-instruct",
  });
  const g = (Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("ADMIN_BRAIN_GEMINI_KEY"));
  if (g) list.push({ name: "gemini", url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", key: g, model: Deno.env.get("ADMIN_BRAIN_GEMINI_MODEL") || "gemini-3.1-flash-lite" });
  return list;
}

const timing: { provider?: string; ms: number[] } = { ms: [] };

async function gateway(messages: unknown[]) {
  const list = providers();
  if (!list.length) throw new Error("ما في أي مزوّد ذكاء اصطناعي مضبوط");
  const errors: string[] = [];
  const now = Date.now();
  // providers that failed recently go last instead of being skipped entirely
  const ordered = [...list.filter((p) => (skipUntil.get(p.name) ?? 0) <= now), ...list.filter((p) => (skipUntil.get(p.name) ?? 0) > now)];
  // one pass over every provider; if they are all only rate-limited for a few seconds (Groq's
  // per-minute budget refills continuously), wait for the soonest one and try again instead of failing
  const call = async (p: Provider) => {
    const t = Date.now();
    const r = await fetch(p.url, {
      signal: AbortSignal.timeout(25_000),
      method: "POST",
      headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: p.model, messages, tools: TOOLS, tool_choice: "auto", max_tokens: 500, temperature: 0.6,
        // gpt-oss on Groq: little hidden reasoning = answers in well under a second
        ...(/gpt-oss/.test(p.model) ? { reasoning_effort: "low" } : {}),
      }),
    });
    if (r.status === 429) {
      const body = await r.text();
      const secs = Number(r.headers.get("retry-after")) || Number(/try again in ([\d.]+)s/i.exec(body)?.[1]) || 10;
      return { wait: secs };
    }
    if (!r.ok) {
      const body = (await r.text()).slice(0, 140);
      return { error: r.status === 402 ? `${p.name}: الرصيد خلص (402)` : r.status === 413 ? `${p.name}: الطلب كبير (413)` : `${p.name} ${r.status}: ${body}`, status: r.status };
    }
    const j = await r.json();
    const msg = j?.choices?.[0]?.message;
    if (!msg) return { error: `${p.name}: رد فاضي` };
    timing.provider = p.name;
    timing.ms.push(Date.now() - t);
    return { msg };
  };

  let soonest: { p: Provider; wait: number } | null = null;
  for (const p of ordered) {
    try {
      const res: any = await call(p);
      if (res.msg) { skipUntil.delete(p.name); return res.msg; }
      if (res.wait) {
        errors.push(`${p.name}: حد الدقيقة (بعد ${Math.ceil(res.wait)}ث)`);
        skipUntil.set(p.name, Date.now() + res.wait * 1000);
        if (!soonest || res.wait < soonest.wait) soonest = { p, wait: res.wait };
        continue;
      }
      errors.push(res.error);
      skipUntil.set(p.name, Date.now() + (res.status === 402 ? 30 * 60_000 : 60_000));
    } catch (e) {
      errors.push(`${p.name}: ${String(e).slice(0, 100)}`);
      skipUntil.set(p.name, Date.now() + 60_000);
    }
  }
  if (soonest && soonest.wait <= 20) {
    await new Promise((s) => setTimeout(s, soonest!.wait * 1000 + 300));
    try {
      const res: any = await call(soonest.p);
      if (res.msg) { skipUntil.delete(soonest.p.name); return res.msg; }
    } catch { /* fall through */ }
  }
  console.warn("admin-brain providers failed", errors);
  throw new Error(errors.join(" · ") || "AI busy");
}

/** Keep the history short, never starting in the middle of a tool exchange. */
function trim(history: any[]) {
  let h = history.slice(-16);
  while (h.length && h[0].role !== "user") h = h.slice(1);
  // only the current turn keeps full tool results; older ones are cut so the request stays small
  let lastUser = -1;
  h.forEach((m, i) => { if (m.role === "user") lastUser = i; });
  return h.map((m, i) => {
    if (i >= lastUser) return m;
    if (m.role === "tool" && typeof m.content === "string" && m.content.length > 300) return { ...m, content: m.content.slice(0, 300) + "…" };
    if (m.role === "assistant" && typeof m.content === "string" && m.content.length > 500) return { ...m, content: m.content.slice(0, 500) + "…" };
    return m;
  });
}

async function chat(body: any) {
  const pages = Array.isArray(body?.pages)
    ? body.pages.slice(0, 400).filter((p: any) => typeof p?.title === "string" && typeof p?.path === "string" && p.path.startsWith("/"))
        .map((p: any) => ({ title: p.title.slice(0, 60), path: p.path.slice(0, 80) }))
    : [];
  const current = typeof body?.current === "string" ? body.current.slice(0, 120) : "/";
  PAGES = pages.slice(0, 400);
  const history: any[] = trim(Array.isArray(body?.messages) ? body.messages : []);
  const added: any[] = [];

  const t0 = Date.now();
  timing.ms = [];
  timing.provider = undefined;
  const took = () => ({ provider: timing.provider, model_ms: timing.ms, total_ms: Date.now() - t0 });
  for (let round = 0; round < 8 && Date.now() - t0 < 90_000; round++) {
    const msg = await gateway([{ role: "system", content: systemPrompt(pages, current) }, ...history, ...added]);
    if (!msg) throw new Error("empty answer");
    const calls: any[] = msg.tool_calls ?? [];
    const assistant = { role: "assistant", content: msg.content ?? "", ...(calls.length ? { tool_calls: calls } : {}) };
    added.push(assistant);
    if (!calls.length) return { reply: String(msg.content ?? "").trim(), added, took: took() };

    const clientCalls: any[] = [];
    for (const c of calls) {
      const name = c.function?.name;
      let args: any = {};
      try { args = JSON.parse(c.function?.arguments || "{}"); } catch { /* empty */ }
      if (CLIENT_TOOLS.has(name)) { clientCalls.push({ id: c.id, name, args }); continue; }
      let out: unknown;
      try {
        out = SERVER_TOOLS[name]
          ? await Promise.race([SERVER_TOOLS[name](args), new Promise((_, rej) => setTimeout(() => rej(new Error("tool timeout")), 20_000))])
          : { error: `unknown tool ${name}` };
      }
      catch (e) { out = { error: String(e).slice(0, 200) }; }
      added.push({ role: "tool", tool_call_id: c.id, content: JSON.stringify(out).slice(0, 2500) });
    }
    // the browser runs screen tools, appends their results and calls us again
    if (clientCalls.length) return { client_calls: clientCalls, say: String(msg.content ?? "").trim(), added, took: took() };
  }
  return { reply: "خلّيني أوقف هون، الطلب طوّل علي. شو بدك بالضبط؟", added };
}

// ---------- voice ----------
// Same girl as Blind Eye (blind-eye-voice): gateway gpt-4o-mini-tts voice "nova" with the same style,
// and Gemini TTS "Sulafat" as the backup, exactly like there.
const VOICE = "nova";
const VOICE_STYLE = "تحدثي بالعربية الفصحى المبسطة بصوت أنثوي دافئ وهادئ وواضح، كصديقة قريبة تتكلم بثقة. لا تستعجلي.";

function wav(pcm: Uint8Array, rate = 24000): Uint8Array {
  const h = new DataView(new ArrayBuffer(44));
  const w = (o: number, s: string) => [...s].forEach((c, i) => h.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); h.setUint32(4, 36 + pcm.length, true); w(8, "WAVE");
  w(12, "fmt "); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true);
  h.setUint32(24, rate, true); h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true);
  w(36, "data"); h.setUint32(40, pcm.length, true);
  const out = new Uint8Array(44 + pcm.length);
  out.set(new Uint8Array(h.buffer), 0);
  out.set(pcm, 44);
  return out;
}

async function speakGemini(text: string): Promise<Uint8Array> {
  const key = (Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("ADMIN_BRAIN_GEMINI_KEY")) || Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY");
  if (!key) throw new Error("no gemini key");
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`, {
    signal: AbortSignal.timeout(20_000),
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${VOICE_STYLE}\n${text}` }] }],
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Sulafat" } } } },
    }),
  });
  if (!r.ok) throw new Error(`gemini tts ${r.status}`);
  const j = await r.json();
  const part = j?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
  if (!part) throw new Error("gemini tts: no audio");
  const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType ?? "")?.[1] ?? 24000);
  return wav(Uint8Array.from(atob(part.inlineData.data), (c) => c.charCodeAt(0)), rate);
}

// Groq's Arabic voice (needs its terms accepted once in the Groq console)
async function speakGroq(text: string): Promise<Uint8Array> {
  const key = Deno.env.get("ADMIN_BRAIN_LLM_KEY");
  if (!key || !Deno.env.get("ADMIN_BRAIN_LLM_URL")?.includes("groq.com")) throw new Error("no groq");
  let voice = Deno.env.get("ADMIN_BRAIN_TTS_VOICE") || "noura"; // women: noura, lulwa, aisha
  for (let i = 0; i < 2; i++) {
    const r = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      signal: AbortSignal.timeout(20_000),
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "canopylabs/orpheus-arabic-saudi", voice, input: text.slice(0, 1000), response_format: "wav" }),
    });
    if (r.ok) return new Uint8Array(await r.arrayBuffer());
    const err = await r.text();
    // unknown voice: the error lists the valid ones, take the first
    const valid = /voice[^\[]*\[([^\]]+)\]/i.exec(err)?.[1]?.split(",")[0]?.replace(/["'\s]/g, "");
    if (i === 0 && valid && valid !== voice) { voice = valid; continue; }
    throw new Error(`groq tts ${r.status}: ${err.slice(0, 120)}`);
  }
  throw new Error("groq tts failed");
}

// The exact Blind Eye girl: OpenAI's own gpt-4o-mini-tts "nova" with the same style, paid by a
// direct OpenAI key (ADMIN_BRAIN_OPENAI_KEY) instead of Lovable credit. Same model, same voice.
async function speakOpenAI(text: string): Promise<Uint8Array> {
  const key = Deno.env.get("ADMIN_BRAIN_OPENAI_KEY");
  if (!key) throw new Error("no openai key");
  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    signal: AbortSignal.timeout(20_000),
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice: VOICE, input: text, instructions: VOICE_STYLE, response_format: "wav" }),
  });
  if (!r.ok) throw new Error(`openai tts ${r.status}: ${(await r.text()).slice(0, 120)}`);
  return new Uint8Array(await r.arrayBuffer());
}

const ttsSkip = new Map<string, number>();
async function speak(text: string) {
  const errors: string[] = [];
  for (const [name, fn] of [["openai", speakOpenAI], ["groq", speakGroq], ["gemini", speakGemini]] as const) {
    if ((ttsSkip.get(name) ?? 0) > Date.now()) continue;
    try { return await fn(text); } catch (e) {
      errors.push(`${name}: ${String(e).slice(0, 120)}`);
      ttsSkip.set(name, Date.now() + (/402|terms|quota|429/.test(String(e)) ? 15 * 60_000 : 30_000));
    }
  }
  console.warn("admin-brain voice failed", errors);
  throw new Error(errors.join(" · ") || "no voice available");
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
      const text = typeof body.text === "string" ? body.text.trim().slice(0, 400) : "";
      if (!text) return json({ error: "no text" }, 400);
      const audio = await speak(text);
      return new Response(audio, { headers: { ...cors, "Content-Type": "audio/wav" } });
    }
    return json(await chat(body));
  } catch (e) {
    console.error("admin-brain", e);
    return json({ error: String(e).slice(0, 300) }, 500);
  }
});
