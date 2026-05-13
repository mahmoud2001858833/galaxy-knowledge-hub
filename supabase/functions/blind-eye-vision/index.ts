// Blind Eye - Vision navigation assistant for blind users
// Uses Gemini Vision direct API (NEVER Lovable AI)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const KEYS = [
  "GEMINI_API_KEY",
  "GOOGLE_AI_API_KEY",
  "GEMINI_API_KEY_NEW",
];

function getKey(): string {
  for (const k of KEYS) {
    const v = Deno.env.get(k);
    if (v) return v;
  }
  throw new Error("No Gemini API key configured");
}

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];

const SYSTEM_PROMPT = `أنت مرشد بصري للمكفوفين باسم "عين الأعمى". تحلّل الصورة من كاميرا الهاتف الخلفية الموجّهة للأمام، وتعطي تعليمات ملاحة فورية بالعربية الفصحى البسيطة.

قواعد صارمة:
- نص "spoken" قصير جداً (٣-١٢ كلمة فقط)، يُنطق فوراً.
- ركّز على: العقبات (أشخاص، سيارات، أعمدة، حُفر، درج، أبواب، جدران، طاولات)، اتجاه الطريق المفتوح، المسافة التقريبية.
- إذا كانت هناك عقبة قريبة جداً أو خطر → urgency: "high".
- استعمل عبارات مثل: "امشِ للأمام بأمان"، "توقف، شخص أمامك"، "التف يميناً قليلاً"، "حذار، درج نازل"، "الطريق مفتوح".
- لا تذكر ألوان أو تفاصيل ديكور لا تفيد الكفيف.

أعد JSON فقط بهذا الشكل:
{
  "direction": "forward" | "left" | "right" | "stop" | "back",
  "obstacle": "وصف العقبة أو null",
  "distance": "near" | "mid" | "far" | null,
  "urgency": "low" | "medium" | "high",
  "spoken": "الجملة العربية القصيرة التي ستُنطق"
}`;

async function callGemini(model: string, imageB64: string, extraContext?: string) {
  const key = getKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const data = imageB64.replace(/^data:[^;]+;base64,/, "");

  const userText = extraContext
    ? `سياق إضافي: ${extraContext}\n\nحلّل الصورة وأعطِ تعليمة الملاحة.`
    : "حلّل الصورة وأعطِ تعليمة الملاحة الفورية.";

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${SYSTEM_PROMPT}\n\n${userText}` },
          { inlineData: { mimeType: "image/jpeg", data } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 256,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          direction: { type: "string", enum: ["forward", "left", "right", "stop", "back"] },
          obstacle: { type: "string", nullable: true },
          distance: { type: "string", enum: ["near", "mid", "far"], nullable: true },
          urgency: { type: "string", enum: ["low", "medium", "high"] },
          spoken: { type: "string" },
        },
        required: ["direction", "urgency", "spoken"],
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
    throw new Error("Gemini returned non-JSON: " + txt.slice(0, 200));
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { image, context } = await req.json();
    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "image (base64) required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let lastErr = "";
    for (const model of MODELS) {
      try {
        const result = await callGemini(model, image, context);
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
    console.error("blind-eye-vision error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
