// Blind Eye - Always-on chat with the visual assistant
// Uses Lovable AI Gateway (exception granted only for Blind Eye feature)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODELS = ["google/gemini-3-flash-preview", "google/gemini-2.5-flash"];

type Lang = "en" | "ar";

const SYSTEM = (lang: Lang) => lang === "ar"
  ? `أنت "عين الأعمى"، رفيق صوتي ودود ودافئ للمكفوفين أثناء المشي. تتحدث معهم بطبيعية كصديق مهتم.

قواعد:
- ردود قصيرة جداً (٥-٢٥ كلمة) لأنها تُنطق صوتياً.
- عربية فصحى بسيطة دافئة، ليست رسمية.
- استخدم visualContext بثقة كأنك ترى المشهد فعلاً، ولا تقل "في الصورة".
- إن سأل "ماذا حولي؟" → استخدم visualContext لوصف موجز.
- إن سأل "هل الطريق آمن؟" → استند إلى القرب والاتجاه الأفضل.
- لا ترفض إلا لضرورة قصوى.
- في كل ردّ، أرفق 2-3 اقتراحات قصيرة بأشياء يمكنه أن يسألها بعد ذلك.`
  : `You are "Blind Eye", a warm friendly voice companion for a blind user while they walk. Talk like a caring friend.

Rules:
- Keep replies very short (5-25 words) — they will be spoken out loud.
- Plain warm English, not formal.
- Use visualContext confidently as if you actually see the scene. Never say "in the image".
- If asked "what's around me?" → describe briefly using visualContext.
- If asked "is the path safe?" → use the proximity and best path.
- Refuse only when absolutely necessary.
- Always include 2-3 short follow-up suggestions of things the user could ask next.`;

const speakTool = {
  type: "function",
  function: {
    name: "speak",
    description: "Return short sentence to be spoken to the blind user plus follow-up suggestions",
    parameters: {
      type: "object",
      properties: {
        spoken: { type: "string" },
        suggestions: {
          type: "array",
          minItems: 0,
          maxItems: 3,
          items: { type: "string" },
        },
      },
      required: ["spoken"],
      additionalProperties: false,
    },
  },
};

type HistoryMsg = { role: "user" | "assistant"; text: string };

async function callGateway(
  model: string,
  userText: string,
  lang: Lang,
  imageDataUrl?: string,
  history: HistoryMsg[] = [],
  visualContext?: string,
) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");

  const messages: any[] = [{ role: "system", content: SYSTEM(lang) }];
  for (const m of history.slice(-4)) {
    if (!m?.text) continue;
    messages.push({ role: m.role, content: m.text });
  }

  const ctxLabel = lang === "ar" ? "[سياق بصري حالي من الكاميرا]" : "[Live visual context from camera]";
  const askLabel = lang === "ar" ? "[سؤال المستخدم]" : "[User]";
  const prefixText = visualContext
    ? `${ctxLabel}: ${visualContext}\n\n${askLabel}: ${userText}`
    : userText;

  const userContent: any[] = [{ type: "text", text: prefixText }];
  if (imageDataUrl) userContent.push({ type: "image_url", image_url: { url: imageDataUrl } });
  messages.push({ role: "user", content: userContent });

  const body = {
    model,
    messages,
    tools: [speakTool],
    tool_choice: { type: "function", function: { name: "speak" } },
  };

  const r = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (r.status === 429) throw new Error("RATE_LIMIT");
  if (r.status === 402) throw new Error("PAYMENT_REQUIRED");
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Gateway ${model} ${r.status}: ${t.slice(0, 200)}`);
  }

  const j = await r.json();
  const args = j?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (args) {
    const parsed = JSON.parse(args);
    if (!Array.isArray(parsed.suggestions)) parsed.suggestions = [];
    return parsed;
  }
  const txt = j?.choices?.[0]?.message?.content ?? "";
  return { spoken: typeof txt === "string" ? txt.slice(0, 200) : (lang === "ar" ? "حسناً" : "Okay"), suggestions: [] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text, image, history, visualContext, lang } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const useLang: Lang = lang === "ar" ? "ar" : "en";

    const safeHistory: HistoryMsg[] = Array.isArray(history)
      ? history.filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
      : [];

    let lastErr = "";
    for (const model of MODELS) {
      try {
        const result = await callGateway(model, text, useLang, image, safeHistory, typeof visualContext === "string" ? visualContext : undefined);
        return new Response(JSON.stringify({ ok: true, model, lang: useLang, ...result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "RATE_LIMIT") {
          return new Response(JSON.stringify({ error: "rate_limit", message: useLang === "ar" ? "النظام مزدحم" : "System busy" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (msg === "PAYMENT_REQUIRED") {
          return new Response(JSON.stringify({ error: "payment_required", message: useLang === "ar" ? "نفذت الأرصدة" : "Out of credits" }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        lastErr = msg;
        console.warn(`Chat model ${model} failed:`, msg);
      }
    }

    return new Response(JSON.stringify({ error: "All models failed", details: lastErr }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("blind-eye-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
