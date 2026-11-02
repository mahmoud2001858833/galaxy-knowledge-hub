// "العقل المركزي" — opens a live OpenAI Realtime voice session for a platform admin.
// The browser never sees the OpenAI key: it gets a short-lived client secret (10 min) whose
// instructions and tools are fixed here, server side. Only is_platform_admin users get one.
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const TOOLS = [
  {
    type: "function",
    name: "navigate_to",
    description: "Open a page of the platform. Use a path from the page list in your instructions.",
    parameters: {
      type: "object",
      properties: { path: { type: "string", description: "Route path, e.g. /chemistry" } },
      required: ["path"],
    },
  },
  {
    type: "function",
    name: "go_back",
    description: "Go back to the previous page.",
    parameters: { type: "object", properties: {} },
  },
  {
    type: "function",
    name: "scroll_page",
    description: "Scroll the current page.",
    parameters: {
      type: "object",
      properties: { direction: { type: "string", enum: ["up", "down", "top", "bottom"] } },
      required: ["direction"],
    },
  },
  {
    type: "function",
    name: "read_screen",
    description: "Get the page title, headings, buttons, links and inputs currently visible on the admin's screen. Call it before clicking when you are not sure what is on screen.",
    parameters: { type: "object", properties: {} },
  },
  {
    type: "function",
    name: "click_element",
    description: "Click a button, link or tab on the screen by its visible text. Actions that delete, publish, send or pay are held until the admin confirms by voice or on screen.",
    parameters: {
      type: "object",
      properties: { text: { type: "string", description: "Visible text of the element (as returned by read_screen)" } },
      required: ["text"],
    },
  },
  {
    type: "function",
    name: "type_into",
    description: "Type text into an input or search box identified by its label or placeholder.",
    parameters: {
      type: "object",
      properties: {
        field: { type: "string", description: "Label or placeholder of the input" },
        text: { type: "string" },
        submit: { type: "boolean", description: "Press Enter after typing" },
      },
      required: ["field", "text"],
    },
  },
];

function instructions(pages: { title: string; path: string }[], current: string) {
  const list = pages.slice(0, 150).map((p) => `- ${p.title}: ${p.path}`).join("\n");
  return `أنتِ "العقل المركزي" لمنصة ذروة العلم التعليمية. تتحدثين فقط مع مدير المنصة.
الشخصية: ذكية، دافئة، واثقة، سريعة البديهة. تتكلمين بلهجة عربية طبيعية قريبة من الأردنية، بجمل قصيرة كأنك إنسان حقيقي، وبدون مقدمات طويلة. إذا تكلم المدير بالإنجليزية فردّي بالإنجليزية.

تتحكمين بشاشة المدير عبر الأدوات:
- "وديني على X" أو "افتح X": استعملي navigate_to فوراً، ثم قولي جملة قصيرة مثل "تفضل، هاي صفحة الكيمياء".
- لتعرفي ما على الشاشة استعملي read_screen، ثم click_element أو type_into.
- إذا أرجعت أداة needs_confirmation فاسألي المدير بوضوح عن التأكيد وانتظري. لا تعيدي المحاولة بنفسك؛ النظام ينفذ تلقائياً عندما يؤكد.
- لا تخترعي صفحات أو أرقاماً أو بيانات. إذا لم تتوفر لك أداة لشيء ما فقولي ذلك بصراحة.

الصفحة الحالية: ${current}
صفحات المنصة:
${list}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: u, error: uErr } = await service.auth.getUser(token);
    if (uErr || !u?.user) return json({ error: "not signed in" }, 401);
    const { data: isAdmin, error: aErr } = await service.rpc("is_platform_admin", { _user_id: u.user.id });
    if (aErr || isAdmin !== true) return json({ error: "admins only" }, 403);

    const key = Deno.env.get("OPENAI_REALTIME_API_KEY");
    if (!key) return json({ error: "OPENAI_REALTIME_API_KEY is not set" }, 500);

    const body = await req.json().catch(() => ({}));
    const pages = Array.isArray(body?.pages)
      ? body.pages
          .filter((p: any) => typeof p?.title === "string" && typeof p?.path === "string" && p.path.startsWith("/"))
          .map((p: any) => ({ title: p.title.slice(0, 60), path: p.path.slice(0, 80) }))
      : [];
    const current = typeof body?.current === "string" ? body.current.slice(0, 120) : "/";

    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        expires_after: { anchor: "created_at", seconds: 600 },
        session: {
          type: "realtime",
          model: "gpt-realtime",
          instructions: instructions(pages, current),
          audio: {
            input: {
              transcription: { model: "gpt-4o-mini-transcribe", language: "ar" },
              turn_detection: { type: "semantic_vad", eagerness: "high" },
              noise_reduction: { type: "near_field" },
            },
            output: { voice: "marin" },
          },
          tools: TOOLS,
          tool_choice: "auto",
        },
      }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j?.value) {
      console.error("client_secrets failed", r.status, JSON.stringify(j).slice(0, 400));
      return json({ error: "could not open a voice session", status: r.status }, 502);
    }
    return json({ client_secret: j.value, expires_at: j.expires_at });
  } catch (e) {
    console.error("admin-brain-session", e);
    return json({ error: "internal error" }, 500);
  }
});
