// Blind Eye - Intelligent Conversational Visual Companion for the Visually Impaired
// Powered by Lovable AI Gateway (Gemini 2.5 Flash / Pro, GPT-4o)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODELS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-3-flash-preview",
  "openai/gpt-4o",
];

type Lang = "en" | "ar";

const SYSTEM = (lang: Lang) => lang === "ar"
  ? `أنت "عين الأعمى" (Blind Eye)، رفيق بصري ذكي وفائق الإدراك لمساعدة المكفوفين وضعاف البصر أثناء حركتهم وحياتهم اليومية.
أنت بمثابة صديق بصير يسير بجانب الكفيف ويمده بالرؤية الحية الدقيقة:

قواعد الإجابة:
1. الوضوح والأمان أولاً: إذا كان هناك أي خطر أو عائق حرج، اذكر التحذير فوراً في بداية جملتك مع الاتجاه الآمن (يمين/يسار/توقف).
2. في وصف المشهد ("صف ما أمامي"): قدم جولة وصفية ثرية وواضحة (3-5 جمل): نوع المكان، العوائق الرئيسية ومسافاتها التقريبية، الممر الآمن المفتوح، والإضاءة أو الأشخاص.
3. في قراءة النصوص والأدوية ("اقرأ"): اقرأ النص بدقة واذكر اسم الدواء والجرعة وتاريخ الصلاحية إن وجد بوضوح تام.
4. في التعرف على النقود والأغراض ("كم دينار؟" / "ما هذا؟"): حدد فئة العملة بدقة (مثل: 10 دنانير أردنية، 50 ريالاً، 20 دولاراً) أو لون الغرض وموقعه النسبي.
5. في الأسئلة السريعة أثناء المشي: أجب بجمل مباشرة وسلسة (10-30 كلمة) مناسبة للنطق الصوتي الفوري.
6. اللغة: عربية فصيحة سلسة ودافئة، وتفهم جميع اللهجات العامية (الأردنية، الشامية، الخليجية، المصرية، المغاربية).
7. اقترح دائماً في قائمة suggestions خيارين أو ثلاثة أسئلة ذكية ومفيدة تناسب ما تراه في الكاميرا.`
  : `You are "Blind Eye", an ultra-intelligent, caring visual companion walking alongside a blind or visually impaired person.
You act as their personal eyes, providing vivid, accurate, and safety-focused guidance:

Rules:
1. Safety First: If there is an imminent obstacle or hazard, warn them immediately with an escape direction.
2. In Scene Description ("Describe what is in front of me"): Provide a vivid, practical 3-5 sentence walkthrough: room/environment type, main obstacles and distances, clear walking path, lighting and people.
3. In Text & Medicine Reading ("Read"): Read all visible text with high precision, prioritizing medicine names, dosages, expiry dates, or room numbers.
4. In Currency & Object Recognition: Identify exact currency denomination (e.g. 10 JOD, 50 SAR, 100 USD) and colors/positions of objects.
5. In Walking Queries: Keep answers direct, reassuring, and concise (10-30 words) optimized for clear speech.
6. Always provide 2-3 contextual suggestions relevant to the live camera view.`;

const speakTool = {
  type: "function",
  function: {
    name: "speak",
    description: "Return high-quality spoken response for the blind user with contextual follow-up suggestions",
    parameters: {
      type: "object",
      properties: {
        spoken: {
          type: "string",
          description: "Warm, crystal-clear, highly informative sentence(s) to be spoken out loud to the user.",
        },
        suggestions: {
          type: "array",
          minItems: 0,
          maxItems: 3,
          items: { type: "string" },
          description: "Follow-up questions or actions the user might want to ask next.",
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
  intent?: string,
) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");

  const messages: any[] = [{ role: "system", content: SYSTEM(lang) }];
  for (const m of history.slice(-6)) {
    if (!m?.text) continue;
    messages.push({ role: m.role, content: m.text });
  }

  const ctxLabel = lang === "ar" ? "[سياق المشهد الحي من الكاميرا]" : "[Live camera visual context]";
  const askLabel = lang === "ar" ? "[طلب المستخدم الكفيف]" : "[Blind user request]";
  const intentLine = intent
    ? (lang === "ar" ? `\n[الهدف المحدد]: ${intent}` : `\n[Intent]: ${intent}`)
    : "";
  const prefixText = visualContext
    ? `${ctxLabel}: ${visualContext}${intentLine}\n\n${askLabel}: ${userText}`
    : `${intentLine}\n${userText}`.trim();

  const userContent: any[] = [{ type: "text", text: prefixText }];
  if (imageDataUrl) userContent.push({ type: "image_url", image_url: { url: imageDataUrl } });
  messages.push({ role: "user", content: userContent });

  const body = {
    model,
    max_tokens: 500,
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
  return {
    spoken: typeof txt === "string" ? txt.slice(0, 400) : (lang === "ar" ? "أنا معك، الطريق أمامك مراقب." : "I am with you, watching the path."),
    suggestions: [],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text, image, history, visualContext, lang, intent } = await req.json();
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
        const result = await callGateway(
          model,
          text,
          useLang,
          image,
          safeHistory,
          typeof visualContext === "string" ? visualContext : undefined,
          typeof intent === "string" ? intent : undefined
        );
        return new Response(JSON.stringify({ ok: true, model, lang: useLang, ...result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "RATE_LIMIT") {
          return new Response(JSON.stringify({ error: "rate_limit", message: useLang === "ar" ? "النظام مزدحم مؤقتاً" : "System busy" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (msg === "PAYMENT_REQUIRED") {
          return new Response(JSON.stringify({ error: "payment_required", message: useLang === "ar" ? "نفذت الأرصدة، يرجى الشحن" : "Out of credits" }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        lastErr = msg;
        console.warn(`Chat model ${model} failed:`, msg);
      }
    }

    return new Response(JSON.stringify({ error: "All chat models failed", details: lastErr }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("blind-eye-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
