// Blind Eye - Vision navigation assistant for blind users
// Uses Lovable AI Gateway (exception granted only for Blind Eye feature)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODELS = ["google/gemini-2.5-flash", "google/gemini-3-flash-preview"];

const GUIDANCE_PROMPT = `أنت "عين الأعمى"، مرشد بصري للمكفوفين. سأعطيك صورة من كاميرا الهاتف الموجّهة للأمام.

قسّم الصورة ذهنياً إلى شبكة 3×3 (٣ صفوف × ٣ أعمدة):
- الصف العلوي: TL (يسار), TC (وسط), TR (يمين)
- الصف الأوسط: ML, MC, MR
- الصف السفلي: BL, BC, BR (الأقرب للقدمين)

لكل خانة من الـ 9: حدّد ما يوجد فيها، نوع الجسم، ومدى قربه/خطره.

ثم حدّد:
- best_path: أفضل اتجاه للمشي (يسار/أمام/يمين) بناءً على الخانات الأقل خطراً.
- global_proximity: أعلى قرب من بين كل الخانات (0=بعيد آمن، 100=ملاصق خطر).
- spoken: جملة عربية فصحى قصيرة جداً (٣-١٠ كلمات) للنطق الفوري. عند الخطر العالي ابدأ بـ "قف!".
- obstacles_summary: وصف مختصر جداً (5-15 كلمة) لأهم 1-2 عقبة.

استخدم استدعاء الأداة describe_scene لإرجاع النتيجة.`;

const CALIBRATION_PROMPT = `أنت "عين الأعمى" في وضع المعايرة السريعة. لديك حد أقصى ٣ محاولات لمساعدة كفيف على وضع الهاتف بشكل مقبول للمشي.

الوضعية المقبولة (ليست مثالية بالضرورة):
- الكاميرا الخلفية للأمام، تظهر الأرض/الطريق أو الأشخاص أو المساحة المحيطة.
- ليست للسماء بالكامل، وليست مغطاة/مظلمة كلياً.
- الصورة فيها تفاصيل مرئية كافية لتمييز الأشياء.

كن متساهلاً: إن كانت الصورة فيها أي محتوى مرئي مفيد للمشي → position_ok = true.

افحص الصورة:
- سماء كاملة → spoken: "أمل الهاتف للأسفل قليلاً" — adjustment فارغ.
- صورة سوداء/مغطاة → spoken: "اكشف الكاميرا" — adjustment فارغ.
- مقبولة → position_ok = true، spoken: "ممتاز! بدأنا الآن."

spoken يجب أن تكون قصيرة جداً: ٣ إلى ٨ كلمات فقط، اتجاه واحد فقط في كل مرة، بدون شرح.

استخدم استدعاء الأداة calibrate لإرجاع النتيجة.`;

const guidanceTool = {
  type: "function",
  function: {
    name: "describe_scene",
    description: "Return spatial 3x3 grid analysis of the camera view",
    parameters: {
      type: "object",
      properties: {
        cells: {
          type: "array",
          minItems: 9,
          maxItems: 9,
          items: {
            type: "object",
            properties: {
              id: { type: "string", enum: ["TL","TC","TR","ML","MC","MR","BL","BC","BR"] },
              label: { type: "string" },
              object: { type: "string" },
              proximity: { type: "number" },
              hazard: { type: "string", enum: ["low","medium","high"] },
            },
            required: ["id","label","object","proximity","hazard"],
            additionalProperties: false,
          },
        },
        best_path: { type: "string", enum: ["left","center","right"] },
        global_proximity: { type: "number" },
        spoken: { type: "string" },
        obstacles_summary: { type: "string" },
      },
      required: ["cells","best_path","global_proximity","spoken","obstacles_summary"],
      additionalProperties: false,
    },
  },
};

const calibTool = {
  type: "function",
  function: {
    name: "calibrate",
    description: "Phone position calibration result",
    parameters: {
      type: "object",
      properties: {
        position_ok: { type: "boolean" },
        issue: { type: "string" },
        adjustment: { type: "string" },
        spoken: { type: "string" },
      },
      required: ["position_ok","spoken"],
      additionalProperties: false,
    },
  },
};

async function callGateway(model: string, imageDataUrl: string, mode: "calibration"|"guidance", extraContext?: string) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");

  const isCalib = mode === "calibration";
  const sys = isCalib ? CALIBRATION_PROMPT : GUIDANCE_PROMPT;
  const tool = isCalib ? calibTool : guidanceTool;
  const userText = extraContext ? `سياق: ${extraContext}\n\nحلّل الصورة.` : "حلّل الصورة الآن.";

  const body = {
    model,
    messages: [
      { role: "system", content: sys },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ],
    tools: [tool],
    tool_choice: { type: "function", function: { name: tool.function.name } },
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
  if (!args) throw new Error("No tool call in response");
  return JSON.parse(args);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { image, context, mode } = await req.json();
    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "image required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const useMode = mode === "calibration" ? "calibration" : "guidance";

    let lastErr = "";
    for (const model of MODELS) {
      try {
        const result = await callGateway(model, image, useMode, context);
        return new Response(JSON.stringify({ ok: true, mode: useMode, model, ...result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "RATE_LIMIT") {
          return new Response(JSON.stringify({ error: "rate_limit", message: "النظام مزدحم، حاول بعد قليل" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (msg === "PAYMENT_REQUIRED") {
          return new Response(JSON.stringify({ error: "payment_required", message: "نفذت الأرصدة، يرجى الشحن" }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        lastErr = msg;
        console.warn(`Model ${model} failed:`, msg);
      }
    }

    return new Response(JSON.stringify({ error: "All models failed", details: lastErr }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("blind-eye-vision error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
