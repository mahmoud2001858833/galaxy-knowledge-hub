// Blind Eye - Vision navigation assistant for blind users
// Uses Gemini Vision direct API (NEVER Lovable AI)

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

const GUIDANCE_PROMPT = `أنت "عين الأعمى"، مرشد بصري للمكفوفين. حلّل صورة الكاميرا الخلفية الموجّهة للأمام، وأعطِ تعليمة ملاحة فورية بالعربية الفصحى البسيطة.

قواعد:
- "spoken" قصير جداً (٣-١٠ كلمات)، يُنطق فوراً.
- ركّز على: عقبات (شخص، عمود، حفرة، درج، باب، جدار، طاولة، سيارة)، الطريق المفتوح، تقدير المسافة.
- proximity_score: 0=بعيد جداً وآمن، 100=ملاصق وخطر.
- urgency يُحدَّد من proximity_score: ≥75 → high، 40-74 → medium، <40 → low.
- نبرة عاجلة قصيرة جداً عند high (مثل "قف! شخص أمامك").
- نبرة هادئة عند low (مثل "الطريق مفتوح، تابع").
- لا ألوان ولا تفاصيل ديكور.

أعد JSON فقط:
{
  "direction": "forward"|"left"|"right"|"stop"|"back",
  "obstacle": "وصف العقبة أو null",
  "distance": "near"|"mid"|"far"|null,
  "proximity_score": 0-100,
  "urgency": "low"|"medium"|"high",
  "spoken": "الجملة العربية القصيرة"
}`;

const CALIBRATION_PROMPT = `أنت "عين الأعمى" في وضع المعايرة. الهدف: مساعدة الكفيف على وضع الهاتف بأفضل وضعية للمشي.

الوضعية المثالية:
- الكاميرا الخلفية موجّهة للأمام أفقياً.
- مائلة قليلاً للأسفل بحيث تظهر الأرض على بُعد متر إلى ثلاثة أمتار.
- ليست مائلة جداً للسماء أو للأرض.
- الصورة واضحة وغير مغطاة.

افحص الصورة:
- إن كانت الكاميرا للسماء → اطلب إمالة الهاتف للأسفل.
- إن كانت ملاصقة للأرض → اطلب رفع الهاتف قليلاً.
- إن كانت مغطاة/مظلمة → اطلب كشفها.
- إن كانت مائلة جانبياً → اطلب تعديلها.
- إن كانت ممتازة → position_ok = true.

"spoken" قصيرة وودودة (٤-١٢ كلمة). عند النجاح: "ممتاز! الوضعية مثالية، سأبدأ بمساعدتك الآن."

أعد JSON فقط:
{
  "position_ok": true|false,
  "issue": "وصف المشكلة أو null",
  "adjustment": "ما يجب فعله أو null",
  "spoken": "الجملة العربية"
}`;

async function callGemini(model: string, imageB64: string, mode: string, extraContext?: string) {
  const key = getKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const data = imageB64.replace(/^data:[^;]+;base64,/, "");

  const isCalibration = mode === "calibration";
  const systemPrompt = isCalibration ? CALIBRATION_PROMPT : GUIDANCE_PROMPT;
  const userText = extraContext
    ? `سياق: ${extraContext}\n\nحلّل الصورة.`
    : "حلّل الصورة وأعطِ التعليمة.";

  const schema = isCalibration
    ? {
        type: "object",
        properties: {
          position_ok: { type: "boolean" },
          issue: { type: "string", nullable: true },
          adjustment: { type: "string", nullable: true },
          spoken: { type: "string" },
        },
        required: ["position_ok", "spoken"],
      }
    : {
        type: "object",
        properties: {
          direction: { type: "string", enum: ["forward", "left", "right", "stop", "back"] },
          obstacle: { type: "string", nullable: true },
          distance: { type: "string", enum: ["near", "mid", "far"], nullable: true },
          proximity_score: { type: "number" },
          urgency: { type: "string", enum: ["low", "medium", "high"] },
          spoken: { type: "string" },
        },
        required: ["direction", "urgency", "spoken", "proximity_score"],
      };

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}\n\n${userText}` },
          { inlineData: { mimeType: "image/jpeg", data } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 256,
      responseMimeType: "application/json",
      responseSchema: schema,
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
    const { image, context, mode } = await req.json();
    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "image (base64) required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const useMode = mode === "calibration" ? "calibration" : "guidance";

    let lastErr = "";
    for (const model of MODELS) {
      try {
        const result = await callGemini(model, image, useMode, context);
        return new Response(JSON.stringify({ ok: true, mode: useMode, ...result, model }), {
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
