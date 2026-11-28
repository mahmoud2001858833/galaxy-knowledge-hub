// "العقل الموسوعي" (omni-mind): a unified AI teaching assistant, admin-only for now.
// Every answer is grounded in the platform's uploaded reference books first (_shared/reference-
// knowledge.ts) — the model is told to say so plainly when no book covers the question, never to
// invent a citation. Four extra abilities run as CLIENT tools, exactly like admin-brain's pattern:
//   generate_image      -> the browser calls ai-image-generator and shows the picture
//   generate_mindmap    -> the model's own structured node tree, rendered by InteractiveMindMap
//   generate_concept_map-> the model's own node/edge graph, rendered by the new ConceptGraph
//   show_experiment     -> a known inline simulation (admin-brain/experiments.ts) or a deep link
//                          to a real lab page, chosen only from a list the browser actually sent
// Conversations persist in omni_mind_sessions / omni_mind_messages so they survive a reload.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callGateway, geminiProvider } from "../_shared/ai-gateway.ts";
import { speak as speakShared } from "../_shared/tts.ts";
import { formatReferenceContext, searchReferenceBooks } from "../_shared/reference-knowledge.ts";

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

let CURRENT_USER: string | null = null;
// experiment/lab pages the browser sent for this request (admin-brain/simulationPages.ts entries)
let PAGES: { title: string; path: string }[] = [];

const normAr = (x: string) => x.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[ًٌٍَُِّْـ]/g, "");

// ---------- tools ----------
const fn = (name: string, description: string, properties: Record<string, unknown> = {}, required: string[] = []) => ({
  type: "function",
  function: { name, description, parameters: { type: "object", properties, required } },
});

// Same ids as admin-brain/experiments.ts's runExperiment whitelist — the browser runs the actual
// computation; the model only ever picks a name here, never a free-text id.
const INLINE_EXPERIMENTS = [
  "projectile", "pendulum", "free_fall_drag", "ohms_law", "radioactive_decay",
  "ideal_gas", "spring_oscillator", "titration", "population_growth", "galvanic_cell",
];

const TOOLS = [
  fn("find_experiment", "Find a real lab/simulation page by words (Arabic or English). Use this BEFORE show_experiment with kind=\"link\" — never invent a path yourself.", { query: { type: "string" } }, ["query"]),
  fn("generate_image", "Generate one educational illustration (no text/labels inside the image) and show it to the admin inline in the chat.", {
    prompt: { type: "string", description: "What to draw, in detail" },
    subject: { type: "string", enum: ["physics", "chemistry", "biology", "math", "arabic", "english", "geography", "history", "islamic"] },
  }, ["prompt"]),
  fn("generate_mindmap", "Build a hierarchical mind map (parent/child tree) of a lesson's concepts and show it inline. Ground it in the reference context you were given; do not invent facts the reference does not support.", {
    rootTitle: { type: "string" },
    subjectTitle: { type: "string" },
    nodes: {
      type: "array",
      description: "Top-level branches. Each node: {id, label, category, color (hex), description?, formula?, children?: same shape}.",
      items: { type: "object" },
    },
  }, ["rootTitle", "nodes"]),
  fn("generate_concept_map", "Build a relationship graph (NOT hierarchical) between concepts, e.g. \"يؤثر على\" / \"يعتمد على\" / \"يسبّب\", and show it inline. Use this when the admin asks for a relationships/connections map between several concepts, as opposed to a single lesson's outline (use generate_mindmap for that).", {
    title: { type: "string" },
    nodes: { type: "array", description: "Each: {id, label, color (hex)}.", items: { type: "object" } },
    edges: { type: "array", description: "Each: {from: node id, to: node id, label: relationship in Arabic, e.g. يؤثر على}.", items: { type: "object" } },
  }, ["title", "nodes", "edges"]),
  fn("show_experiment", "Show a real interactive experiment for the topic. kind=\"inline\": a quick computed simulation (pick experiment from the fixed list). kind=\"link\": a full lab page — path MUST be one returned by find_experiment in this same conversation, never guessed.", {
    kind: { type: "string", enum: ["inline", "link"] },
    experiment: { type: "string", enum: INLINE_EXPERIMENTS, description: "Required when kind=inline" },
    params: { type: "object", description: "Optional numeric params for the inline experiment" },
    title: { type: "string", description: "Required when kind=link: the exact title from find_experiment" },
    path: { type: "string", description: "Required when kind=link: the exact path from find_experiment" },
  }, ["kind"]),
];
const CLIENT_TOOLS = new Set(["generate_image", "generate_mindmap", "generate_concept_map", "show_experiment"]);

const SERVER_TOOLS: Record<string, (a: Record<string, unknown>) => Promise<unknown>> = {
  // deno-lint-ignore require-await
  async find_experiment({ query }) {
    const words = normAr(String(query ?? "")).split(/[\s/,-]+/).filter((w) => w.length > 1);
    const scored = PAGES.map((p) => {
      const hay = normAr(`${p.title} ${p.path.replace(/[-/]/g, " ")}`);
      return { ...p, score: words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0) };
    }).filter((p) => p.score > 0).sort((a, b) => b.score - a.score);
    return { matches: scored.slice(0, 8).map(({ title, path }) => ({ title, path })) };
  },
};

function systemPrompt(referenceContext: string, memoryNote: string) {
  return `أنتِ "العقل الموسوعي" لمنصة ذروة العلم: مساعد تعليمي شامل، للمدير (الأدمن) فقط حالياً كمرحلة تجربة قبل أي طرح للطلاب.
الشخصية: دقيقة، صبورة، تشرح كمعلّمة محترفة. عربية فصيحة مبسطة قريبة من الأردنية عند الحديث العادي.

القاعدة الأهم: ارتكزي على "مراجع من مكتبة المنصة" أدناه إن وُجدت وكانت ذات صلة بالسؤال، واذكري اسم الكتاب
والصفحة عند الاقتباس منها. إن لم توجد مراجع ذات صلة بهذا السؤال بالذات، صرّحي بوضوح أنك لم تجدي ذلك
بالكتب المرفوعة حالياً قبل أن تجيبي من معرفتك العامة — لا تنسبي معلومة لكتاب لم يُرفع أو لم يَرِد في المراجع.

تنسيق الجواب (نص نظيف يُقرأ مباشرة، لا رموز مصدر خام):
- ممنوع نهائياً أي صيغة LaTeX مثل $H^+$ أو \\rightarrow أو \\frac{}{}. اكتبي الرموز العلمية بأحرف Unicode
  جاهزة للقراءة مباشرة: الأس العلوي H⁺ Na⁺ x² ، الأس السفلي H₂O CO₂ ، الأسهم → ⇌ ، الحرارة Δ، الدرجة °.
- استعملي Markdown عادياً للتنظيم عند الحاجة فقط: **تمييز** لكلمة مهمة، عناوين فرعية قصيرة، قوائم نقطية،
  وجدول Markdown عند مقارنة عدة عناصر. لا تبالغي بالعناوين والرموز التعبيرية (الإيموجي)؛ وضوح لا زخرفة.
- جملة قصيرة في النهاية فقط إن كان هناك اقتراح طبيعي للمتابعة (خريطة، صورة، تجربة)، لا تسأليه بعد كل جواب.

قدراتك الإضافية (استعمليها كل ما كانت تخدم السؤال، لا تنتظري أن يُطلب صريحاً كل مرة):
- رسم تعليمي: generate_image.
- خريطة ذهنية هرمية لدرس واحد: generate_mindmap.
- خريطة علاقات/مفاهيم (غير هرمية) بين عدة مفاهيم متصلة: generate_concept_map.
- تجربة تفاعلية: ابحثي أولاً بـ find_experiment، ثم show_experiment (inline لتجربة محسوبة فورية، أو link لمختبر كامل بالمسار الذي أعاده find_experiment حرفياً — لا تخترعي مساراً أبداً).
- قد يُرفق المدير صورة أو ملفاً مع سؤاله؛ إن وُجد صف "محتوى مرفق" بالرسالة فحلّليه وأجيبي بناءً عليه.

${memoryNote}${referenceContext}`;
}

/** Keep the history short, never starting in the middle of a tool exchange. */
function trim(history: { role: string; content?: unknown }[]) {
  let h = history.slice(-20);
  while (h.length && h[0].role !== "user") h = h.slice(1);
  return h;
}

async function loadHistory(sessionId: string) {
  const { data } = await service.from("omni_mind_messages").select("role, content, tool_calls, tool_call_id")
    .eq("session_id", sessionId).order("created_at", { ascending: true }).limit(40);
  return (data ?? []).map((m: { role: string; content: string; tool_calls: unknown; tool_call_id: string | null }) => ({
    role: m.role,
    content: m.content,
    ...(m.tool_calls ? { tool_calls: m.tool_calls } : {}),
    ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
  }));
}

async function saveMessage(sessionId: string, row: { role: string; content?: string; tool_calls?: unknown; tool_call_id?: string; attachments?: unknown }) {
  await service.from("omni_mind_messages").insert({
    session_id: sessionId, role: row.role, content: row.content ?? "",
    tool_calls: row.tool_calls ?? null, tool_call_id: row.tool_call_id ?? null, attachments: row.attachments ?? null,
  });
  await service.from("omni_mind_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
}

async function ensureSession(sessionId: string | undefined, firstMessage: string) {
  if (sessionId) {
    const { data } = await service.from("omni_mind_sessions").select("id").eq("id", sessionId).eq("user_id", CURRENT_USER).maybeSingle();
    if (data) return sessionId;
  }
  const title = firstMessage.trim().slice(0, 60) || "محادثة جديدة";
  const { data, error } = await service.from("omni_mind_sessions").insert({ user_id: CURRENT_USER, title }).select("id").single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

/** Dedup reference hits to {bookId, bookTitle, pageNumber} chips the client can show and click to view. */
function toSources(hits: { bookId: string; bookTitle: string; pageNumber: number | null }[]) {
  const seen = new Set<string>();
  const out: { bookId: string; bookTitle: string; pageNumber: number | null }[] = [];
  for (const h of hits) {
    const key = `${h.bookId}:${h.pageNumber ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ bookId: h.bookId, bookTitle: h.bookTitle, pageNumber: h.pageNumber });
    if (out.length >= 5) break;
  }
  return out;
}

/** Swap the last user message's content for a multimodal (text + image) array, for the model call only — never persisted as-is. */
function withImage(msgs: { role: string; content?: unknown }[], imageDataUrl: string) {
  const out = [...msgs];
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i].role === "user") {
      out[i] = {
        ...out[i],
        content: [
          { type: "text", text: String(out[i].content ?? "").trim() || "حلّل هذه الصورة وأجب بناءً عليها" },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      };
      break;
    }
  }
  return out;
}

async function chat(body: Record<string, unknown>) {
  PAGES = Array.isArray(body?.pages)
    ? (body.pages as unknown[]).slice(0, 200).filter((p): p is { title: string; path: string } => {
        const x = p as Record<string, unknown>;
        return typeof x?.title === "string" && typeof x?.path === "string" && (x.path as string).startsWith("/");
      }).map((p) => ({ title: p.title.slice(0, 80), path: p.path.slice(0, 100) }))
    : [];

  const userMessage = typeof body.user_message === "string" ? body.user_message.trim().slice(0, 3000) : "";
  const imageDataUrl = typeof body.image_base64 === "string" && body.image_base64.startsWith("data:image/") ? body.image_base64.slice(0, 8_000_000) : "";
  const toolResults = Array.isArray(body.tool_results) ? body.tool_results as { tool_call_id: string; content: string }[] : [];
  if (!userMessage && !imageDataUrl && !toolResults.length) return { error: "empty turn" };

  const sessionId = await ensureSession(typeof body.session_id === "string" ? body.session_id : undefined, userMessage || "صورة مرفقة");
  const history = trim(await loadHistory(sessionId));
  const added: { role: string; content?: string; tool_calls?: unknown; tool_call_id?: string }[] = [];

  if (userMessage || imageDataUrl) {
    const displayContent = imageDataUrl ? `📎 صورة مرفقة${userMessage ? ` — ${userMessage}` : ""}` : userMessage;
    const m = { role: "user", content: displayContent };
    added.push(m);
    await saveMessage(sessionId, m);
  }
  for (const t of toolResults) {
    const m = { role: "tool", tool_call_id: t.tool_call_id, content: String(t.content ?? "").slice(0, 2500) };
    added.push(m);
    await saveMessage(sessionId, m);
  }

  const refHits = userMessage ? await searchReferenceBooks(userMessage).catch(() => []) : [];
  const referenceContext = formatReferenceContext(refHits);
  const sources = toSources(refHits);
  const memoryNote = ""; // no cross-session memory yet; each session is self-contained

  const t0 = Date.now();
  for (let round = 0; round < 8 && Date.now() - t0 < 110_000; round++) {
    const providers = [geminiProvider()].filter((p): p is NonNullable<typeof p> => p !== null);
    let messages: unknown[] = [{ role: "system", content: systemPrompt(referenceContext, memoryNote) }, ...history, ...added];
    if (round === 0 && imageDataUrl) messages = withImage(messages as { role: string; content?: unknown }[], imageDataUrl);
    const msg = await callGateway({ service, providers, fnName: "omni-mind", userId: CURRENT_USER, tools: TOOLS, messages });
    if (!msg) throw new Error("empty answer");
    const calls: { id: string; function: { name: string; arguments: string } }[] = (msg as { tool_calls?: typeof calls }).tool_calls ?? [];
    const assistantMsg = { role: "assistant", content: String((msg as { content?: string }).content ?? ""), ...(calls.length ? { tool_calls: calls } : {}) };
    added.push(assistantMsg);
    await saveMessage(sessionId, { ...assistantMsg, attachments: sources.length ? { sources } : undefined });
    if (!calls.length) return { reply: assistantMsg.content.trim(), session_id: sessionId, sources };

    const clientCalls: { id: string; name: string; args: Record<string, unknown> }[] = [];
    for (const c of calls) {
      const name = c.function?.name;
      let args: Record<string, unknown> = {};
      try { args = JSON.parse(c.function?.arguments || "{}"); } catch { /* empty */ }
      if (CLIENT_TOOLS.has(name)) { clientCalls.push({ id: c.id, name, args }); continue; }
      let out: unknown;
      try {
        out = SERVER_TOOLS[name] ? await SERVER_TOOLS[name](args) : { error: `unknown tool ${name}` };
      } catch (e) { out = { error: String(e).slice(0, 200) }; }
      const toolMsg = { role: "tool", tool_call_id: c.id, content: JSON.stringify(out).slice(0, 2500) };
      added.push(toolMsg);
      await saveMessage(sessionId, toolMsg);
    }
    if (clientCalls.length) return { client_calls: clientCalls, say: assistantMsg.content.trim(), session_id: sessionId, sources };
  }
  return { reply: "خلّيني أوقف هون، الطلب طوّل علي. شو بدك بالضبط؟", session_id: sessionId };
}

async function sessions() {
  const { data, error } = await service.from("omni_mind_sessions").select("id, title, updated_at")
    .eq("user_id", CURRENT_USER).order("updated_at", { ascending: false }).limit(50);
  if (error) return { error: error.message };
  return { sessions: data };
}

async function sessionMessages(sessionId: string) {
  const { data: s } = await service.from("omni_mind_sessions").select("id").eq("id", sessionId).eq("user_id", CURRENT_USER).maybeSingle();
  if (!s) return { error: "not found" };
  const { data } = await service.from("omni_mind_messages").select("role, content, tool_calls, tool_call_id, attachments, created_at")
    .eq("session_id", sessionId).order("created_at", { ascending: true }).limit(200);
  return { messages: data ?? [] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: u, error: uErr } = await service.auth.getUser(token);
    if (uErr || !u?.user) return json({ error: "not signed in" }, 401);
    CURRENT_USER = u.user.id;
    const { data: isAdmin, error: aErr } = await service.rpc("is_platform_admin", { _user_id: u.user.id });
    if (aErr || isAdmin !== true) return json({ error: "admins only" }, 403);

    const body = await req.json().catch(() => ({}));
    if (body?.action === "speak") {
      const text = typeof body.text === "string" ? body.text.trim().slice(0, 400) : "";
      if (!text) return json({ error: "no text" }, 400);
      const audio = await speakShared(text, { service, fnName: "omni-mind", userId: CURRENT_USER });
      return new Response(audio as unknown as BodyInit, { headers: { ...cors, "Content-Type": "audio/wav" } });
    }
    if (body?.action === "sessions") return json(await sessions());
    if (body?.action === "session_messages") return json(await sessionMessages(String(body.session_id ?? "")));
    return json(await chat(body));
  } catch (e) {
    console.error("omni-mind", e);
    return json({ error: String(e).slice(0, 300) }, 500);
  }
});
