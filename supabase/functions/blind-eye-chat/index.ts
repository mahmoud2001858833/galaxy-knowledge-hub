// Blind Eye - Always-on chat with the visual assistant
// Uses Gemini direct API (NEVER Lovable AI)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const KEYS = ["GEMINI_API_KEY", "GOOGLE_AI_API_KEY", "GEMINI_API_KEY_NEW"];

function getKey(): string {
  for (const k of KEYS) {
    const v = Deno.env.get(k);
    if (v) return v;
  }
  throw new Error("No Gemini API key configured");
}

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];

const SYSTEM = `أنت "عين الأعمى"، مساعد صوتي ودود للمكفوفين. تتحدث معهم في أي وقت أثناء المشي.

قواعد صارمة:
- ردود قصيرة جداً (جملة واحدة، ٥-٢٥ كلمة) لأنها ستُنطق صوتياً.
- عربية فصحى بسيطة وواضحة.
- إن أُرفقت صورة، استخدمها لوصف ما يراه الكفيف بدقة.
- إن طلب وصف ما أمامه: صف الأشخاص، العقبات، الطريق، اللافتات، باختصار.
- إن طلب قراءة نص: اقرأ ما تراه فقط بدون تعليق.
- لا تذكر "كصورة" أو "في الصورة"، تحدث وكأنك ترى مباشرة.
- لا ترفض أو تعتذر إلا لضرورة قصوى.

أعد JSON فقط: { "spoken": "ردك القصير" }`;

async function callGemini(model: string, userText: string, imageB64?: string) {
  const key = getKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const parts: any[] = [{ text: `${SYSTEM}\n\nسؤال المستخدم: ${userText}` }];
  if (imageB64) {
    const data = imageB64.replace(/^data:[^;]+;base64,/, "");
    parts.push({ inlineData: { mimeType: "image/jpeg", data } });
  }

  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 200,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: { spoken: { type: "string" } },
        required: ["spoken"],
      },
    },
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Gemini ${model} ${r.status}: ${t.slice(0, 200)}`);
  }
  const j = await r.json();
  const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  try {
    return JSON.parse(txt);
  } catch {
    const m = txt.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    return { spoken: txt.slice(0, 200) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text, image } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let lastErr = "";
    for (const model of MODELS) {
      try {
        const result = await callGemini(model, text, image);
        return new Response(JSON.stringify({ ok: true, ...result, model }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
        console.warn(`Model ${model} failed:`, lastErr);
        continue;
      }
    }

    return new Response(JSON.stringify({ error: "All models failed", details: lastErr }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("blind-eye-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
