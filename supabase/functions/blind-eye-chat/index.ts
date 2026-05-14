// Blind Eye - Always-on chat with the visual assistant
// Uses Lovable AI Gateway (exception granted only for Blind Eye feature)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODELS = ["google/gemini-2.5-flash", "google/gemini-3-flash-preview"];

const SYSTEM = `أنت "عين الأعمى"، رفيق صوتي ودود ودافئ للمكفوفين أثناء المشي. تتحدث معهم بطبيعية كصديق مهتم.

قواعد صارمة:
- ردود قصيرة جداً (٥-٣٠ كلمة) لأنها تُنطق صوتياً.
- عربية فصحى بسيطة وودودة، دافئة وليست رسمية.
- تذكّر السياق السابق من المحادثة (سيُمرَّر إليك).
- إن وُجد سياق بصري (visualContext)، استخدمه بثقة كأنك ترى المشهد فعلاً.
- إن أُرفقت صورة، اعتمد عليها للوصف.
- لا تقل "في الصورة" أو "كصورة"، تحدث وكأنك ترى مباشرة.
- إن سأل "ماذا حولي؟" / "صف ما أمامي" → استخدم visualContext + الصورة لوصف موجز.
- إن سأل "هل الطريق آمن؟" → استند إلى مستوى القرب والاتجاه الأفضل في visualContext.
- إن سأل سؤالاً عاماً (طقس، وقت، شعور) → جاوب بدفء وباختصار.
- اطرح سؤال متابعة قصير أحياناً ليبقى الحوار حياً.
- لا ترفض إلا لضرورة قصوى.

استخدم أداة speak لإرجاع الجملة المنطوقة.`;

const speakTool = {
  type: "function",
  function: {
    name: "speak",
    description: "Return short Arabic sentence to be spoken to the blind user",
    parameters: {
      type: "object",
      properties: { spoken: { type: "string" } },
      required: ["spoken"],
      additionalProperties: false,
    },
  },
};

type HistoryMsg = { role: "user" | "assistant"; text: string };

async function callGateway(
  model: string,
  userText: string,
  imageDataUrl?: string,
  history: HistoryMsg[] = [],
  visualContext?: string,
) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");

  const messages: any[] = [{ role: "system", content: SYSTEM }];

  // Append prior conversation (text only, last 6)
  for (const m of history.slice(-6)) {
    if (!m?.text) continue;
    messages.push({ role: m.role, content: m.text });
  }

  const userContent: any[] = [];
  const prefixText = visualContext
    ? `[سياق بصري حالي من الكاميرا]: ${visualContext}\n\n[سؤال المستخدم]: ${userText}`
    : userText;
  userContent.push({ type: "text", text: prefixText });
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
  if (args) return JSON.parse(args);
  const txt = j?.choices?.[0]?.message?.content ?? "";
  return { spoken: typeof txt === "string" ? txt.slice(0, 200) : "حسناً" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text, image, history, visualContext } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeHistory: HistoryMsg[] = Array.isArray(history)
      ? history.filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
      : [];

    let lastErr = "";
    for (const model of MODELS) {
      try {
        const result = await callGateway(model, text, image, safeHistory, typeof visualContext === "string" ? visualContext : undefined);
        return new Response(JSON.stringify({ ok: true, model, ...result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "RATE_LIMIT") {
          return new Response(JSON.stringify({ error: "rate_limit", message: "النظام مزدحم" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (msg === "PAYMENT_REQUIRED") {
          return new Response(JSON.stringify({ error: "payment_required", message: "نفذت الأرصدة" }), {
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
