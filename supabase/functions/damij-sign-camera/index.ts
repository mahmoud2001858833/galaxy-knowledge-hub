// Camera-based sign-language recognition using DIRECT Gemini Vision API.
// Receives a base64 image of a person performing a sign (or a short burst of
// frames concatenated) and returns the recognized Arabic word/phrase.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const KEY =
  Deno.env.get("SIGN_TRANSLATE_GEMINI_KEY") ||
  Deno.env.get("GEMINI_API_KEY") ||
  Deno.env.get("GOOGLE_AI_API_KEY") ||
  Deno.env.get("GEMINI_API_KEY_NEW");

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];

async function geminiVision(imageBase64: string, mime: string, prompt: string) {
  if (!KEY) throw new Error("missing_gemini_key");
  let lastErr: any = null;
  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mime, data: imageBase64 } },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 256,
            responseMimeType: "application/json",
          },
        }),
      });
      if (!res.ok) { lastErr = new Error(`${model} ${res.status}`); continue; }
      const j = await res.json();
      const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      try { return JSON.parse(txt); } catch {
        const m = txt.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]);
        return { word: "", confidence: 0, notes: "تعذّر تفسير المخرجات." };
      }
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("ai_unavailable");
}

const PROMPT = `أنت خبير في لغة الإشارة العربية (ArSL) ولغة الإشارة الأمريكية (ASL).
انظر إلى الصورة (يد/يدين شخص يؤدّي إشارة) وحدّد الكلمة أو العبارة العربية الأقرب التي يعنيها المؤدّي.
- إذا لم تظهر أي يد بوضوح، أعد {"word":"","confidence":0,"notes":"لم تُكتشف يد واضحة."}
- إذا الإشارة هي حرف هجاء (تهجئة)، أعد الحرف العربي الواحد في "word".
- إذا الإشارة كلمة شائعة (مثل: مرحبا، شكرا، نعم، لا، أحب، أنا، أنت، مدرسة، ماء، أكل)، أعد الكلمة العربية الكاملة.
- لا تُترجم إلى الإنجليزية. الإخراج عربي فقط.
أعد JSON صرف بالشكل: {"word":"...","confidence":0.0-1.0,"notes":"..."}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { image, mime = "image/jpeg" } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "missing_image" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const b64 = String(image).replace(/^data:[^;]+;base64,/, "");
    const result = await geminiVision(b64, mime, PROMPT);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg, word: "", confidence: 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
