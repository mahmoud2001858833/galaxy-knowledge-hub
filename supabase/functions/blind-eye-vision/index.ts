// Blind Eye - Vision navigation assistant for blind users
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

// spoken MUST be a single short directional command — never describe what's seen.
// Arabic: يسار | يمين | أمام | قف | استمر | تراجع
// English: Left | Right | Ahead | Stop | Continue | Back
const POINTS_PROMPT = (lang: Lang, target?: string) => {
  const targetLine = target
    ? (lang === "ar"
        ? `\n- المستخدم يريد الذهاب إلى: "${target}". إذا رأيته اضبط target_seen=true، target_bearing=(left|center|right)، target_distance=(far|mid|near|arrived)، next_step_ar أمر واحد قصير: يسار/يمين/أمام/قف/وصلت. وإلا target_seen=false و next_step_ar=أدر الكاميرا.`
        : `\n- User wants: "${target}". If seen: target_seen=true, target_bearing, target_distance, next_step_ar=one short Arabic command. Else target_seen=false.`)
    : "";
  return lang === "ar"
    ? `أنت "عين الأعمى". أعد كائنات الإطار بإحداثيات مركز 0-1 وأبعاد 0-1.
- objects: حتى 6 عناصر، label كلمة واحدة، hazard low|medium|high، proximity 0-100.
- best_path: left|center|right
- global_proximity 0-100
- spoken: أمر واحد فقط من: "يسار" "يمين" "أمام" "قف" "استمر" "تراجع". لا تصف أي شيء.
  قواعد: global_proximity≥70 → "قف". خطر جانبي → الاتجاه الآمن. مسار حر مباشر → "أمام" أو "استمر".
- obstacles_summary: 3-6 كلمات (للعرض فقط، لن تُنطق).${targetLine}
كن سريعاً.`
    : `You are "Blind Eye". Return frame objects.
- objects: up to 6, label one word, hazard low|medium|high, proximity 0-100.
- best_path: left|center|right
- global_proximity 0-100
- spoken: EXACTLY one Arabic command word: "يسار" "يمين" "أمام" "قف" "استمر" "تراجع". Never describe.
  Rules: global_proximity>=70 → "قف". Side hazard → safe direction. Clear → "أمام" or "استمر".
- obstacles_summary: 3-6 words (display only, NOT spoken).${targetLine}
Be fast.`;
};

const GUIDANCE_FAST_PROMPT = (lang: Lang) => lang === "ar"
  ? `أنت "عين الأعمى".
- best_path: left|center|right
- global_proximity 0-100
- spoken: أمر واحد فقط: "يسار"/"يمين"/"أمام"/"قف"/"استمر"/"تراجع". لا تصف.
- obstacles_summary: 3-6 كلمات للعرض فقط
- top_hazards: 1-2`
  : `You are "Blind Eye".
- best_path: left|center|right
- global_proximity 0-100
- spoken: ONE Arabic command word only: "يسار"/"يمين"/"أمام"/"قف"/"استمر"/"تراجع". Never describe.
- obstacles_summary: 3-6 words for display only
- top_hazards: 1-2`;

const GUIDANCE_DETAILED_PROMPT = (lang: Lang) => lang === "ar"
  ? `أنت "عين الأعمى". شبكة 3×3 (TL TC TR / ML MC MR / BL BC BR).
لكل خانة object/label/proximity 0-100/hazard.
أرجع best_path, global_proximity, spoken (أمر واحد فقط)، obstacles_summary للعرض.`
  : `You are "Blind Eye". 3×3 grid (TL TC TR / ML MC MR / BL BC BR).
Per cell: object/label/proximity 0-100/hazard.
Return best_path, global_proximity, spoken (ONE command word only), obstacles_summary for display.`;

const CALIBRATION_PROMPT = (lang: Lang) => lang === "ar"
  ? `معايرة سريعة. أي إطار للمشي → position_ok=true. spoken: كلمة واحدة "جاهز".`
  : `Quick calibration. Any walkable frame → position_ok=true. spoken: ONE word "جاهز".`;


const pointsTool = {
  type: "function",
  function: {
    name: "describe_points",
    description: "Return detected objects with normalized 0-1 coordinates",
    parameters: {
      type: "object",
      properties: {
        objects: {
          type: "array", maxItems: 6,
          items: {
            type: "object",
            properties: {
              x: { type: "number" }, y: { type: "number" },
              w: { type: "number" }, h: { type: "number" },
              label: { type: "string" },
              hazard: { type: "string", enum: ["low","medium","high"] },
              proximity: { type: "number" },
            },
            required: ["x","y","w","h","label","hazard","proximity"],
            additionalProperties: false,
          },
        },
        best_path: { type: "string", enum: ["left","center","right"] },
        global_proximity: { type: "number" },
        spoken: { type: "string" },
        obstacles_summary: { type: "string" },
        target_seen: { type: "boolean" },
        target_bearing: { type: "string", enum: ["left","center","right"] },
        target_distance: { type: "string", enum: ["far","mid","near","arrived"] },
        next_step_ar: { type: "string" },
      },
      required: ["objects","best_path","global_proximity","spoken","obstacles_summary"],
      additionalProperties: false,
    },
  },
};

const guidanceFastTool = {
  type: "function",
  function: {
    name: "describe_scene_fast",
    description: "Fast spatial analysis",
    parameters: {
      type: "object",
      properties: {
        best_path: { type: "string", enum: ["left", "center", "right"] },
        global_proximity: { type: "number" },
        spoken: { type: "string" },
        obstacles_summary: { type: "string" },
        top_hazards: {
          type: "array", maxItems: 2,
          items: {
            type: "object",
            properties: {
              id: { type: "string", enum: ["TL","TC","TR","ML","MC","MR","BL","BC","BR"] },
              label: { type: "string" },
              hazard: { type: "string", enum: ["low","medium","high"] },
            },
            required: ["id","label","hazard"],
            additionalProperties: false,
          },
        },
      },
      required: ["best_path","global_proximity","spoken","obstacles_summary","top_hazards"],
      additionalProperties: false,
    },
  },
};

const guidanceDetailedTool = {
  type: "function",
  function: {
    name: "describe_scene",
    description: "Full 3x3 spatial grid analysis",
    parameters: {
      type: "object",
      properties: {
        cells: {
          type: "array", minItems: 9, maxItems: 9,
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

type Mode = "calibration" | "fast" | "detailed" | "points";

async function callGateway(model: string, imageDataUrl: string, mode: Mode, lang: Lang, extraContext?: string, target?: string) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");

  let sys: string;
  let tool: any;
  if (mode === "calibration") { sys = CALIBRATION_PROMPT(lang); tool = calibTool; }
  else if (mode === "detailed") { sys = GUIDANCE_DETAILED_PROMPT(lang); tool = guidanceDetailedTool; }
  else if (mode === "points") { sys = POINTS_PROMPT(lang, target); tool = pointsTool; }
  else { sys = GUIDANCE_FAST_PROMPT(lang); tool = guidanceFastTool; }

  const userText = extraContext
    ? (lang === "ar" ? `سياق: ${extraContext}\nحلل.` : `Context: ${extraContext}\nAnalyze.`)
    : (lang === "ar" ? "حلل." : "Analyze.");

  const body = {
    model,
    max_tokens: 200,
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
    const { image, context, mode, lang, target } = await req.json();
    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "image required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let useMode: Mode = "points";
    if (mode === "calibration") useMode = "calibration";
    else if (mode === "detailed") useMode = "detailed";
    else if (mode === "fast") useMode = "fast";
    else if (mode === "points") useMode = "points";
    else if (mode === "guidance") useMode = "fast";

    const useLang: Lang = lang === "ar" ? "ar" : "en";

    let lastErr = "";
    for (const model of MODELS) {
      try {
        const result = await callGateway(model, image, useMode, useLang, context, typeof target === 'string' ? target : undefined);
        return new Response(JSON.stringify({ ok: true, mode: useMode, model, lang: useLang, ...result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "RATE_LIMIT") {
          return new Response(JSON.stringify({ error: "rate_limit", message: useLang === "ar" ? "النظام مزدحم، حاول بعد قليل" : "System busy, try again shortly" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (msg === "PAYMENT_REQUIRED") {
          return new Response(JSON.stringify({ error: "payment_required", message: useLang === "ar" ? "نفذت الأرصدة، يرجى الشحن" : "Out of credits, please top up" }), {
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
