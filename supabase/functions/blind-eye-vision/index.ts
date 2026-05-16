// Blind Eye - Vision navigation assistant for blind users
// Uses Lovable AI Gateway (exception granted only for Blind Eye feature)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
// Fastest first
const MODELS = ["google/gemini-3-flash-preview", "google/gemini-2.5-flash"];

const POINTS_PROMPT = `أنت "عين الأعمى" مرشد بصري للمكفوفين. أرجع قائمة بكل العناصر المهمة المرئية الآن:
- objects: حتى 6 عناصر، لكل عنصر: x,y (مركز 0-1)، w,h (حجم 0-1)، label (كلمة عربية واحدة)، hazard (low|medium|high)، proximity 0-100.
- best_path: left|center|right.
- global_proximity 0-100 (أعلى قرب).
- spoken: 3-7 كلمات عربية. ابدأ بـ "قف!" عند خطر عالٍ.
- obstacles_summary: 4-10 كلمات لأهم عقبة.
أحداثيات دقيقة قدر الإمكان. كن سريعاً جداً.`;

const GUIDANCE_FAST_PROMPT = `أنت "عين الأعمى" مرشد للمكفوفين. حلل بسرعة:
- best_path: left|center|right
- global_proximity 0-100
- spoken: 3-7 كلمات عربية. عند خطر "قف!"
- obstacles_summary: 5-10 كلمات
- top_hazards: 1-2 max`;

const GUIDANCE_DETAILED_PROMPT = `أنت "عين الأعمى". حلل كشبكة 3×3 (TL TC TR / ML MC MR / BL BC BR).
لكل خانة: object/label/proximity 0-100/hazard low|medium|high.
أرجع best_path, global_proximity, spoken (3-7 كلمات), obstacles_summary.`;

const CALIBRATION_PROMPT = `معايرة سريعة. تساهل: أي صورة فيها تفاصيل للمشي → position_ok=true.
spoken: 3-6 كلمات.`;

const pointsTool = {
  type: "function",
  function: {
    name: "describe_points",
    description: "Return detected objects with normalized 0-1 coordinates",
    parameters: {
      type: "object",
      properties: {
        objects: {
          type: "array",
          maxItems: 6,
          items: {
            type: "object",
            properties: {
              x: { type: "number" },
              y: { type: "number" },
              w: { type: "number" },
              h: { type: "number" },
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
          type: "array",
          maxItems: 2,
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

type Mode = "calibration" | "fast" | "detailed" | "points";

async function callGateway(model: string, imageDataUrl: string, mode: Mode, extraContext?: string) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");

  let sys: string;
  let tool: any;
  if (mode === "calibration") { sys = CALIBRATION_PROMPT; tool = calibTool; }
  else if (mode === "detailed") { sys = GUIDANCE_DETAILED_PROMPT; tool = guidanceDetailedTool; }
  else if (mode === "points") { sys = POINTS_PROMPT; tool = pointsTool; }
  else { sys = GUIDANCE_FAST_PROMPT; tool = guidanceFastTool; }

  const userText = extraContext ? `سياق: ${extraContext}\nحلل.` : "حلل.";

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
    let useMode: Mode = "points";
    if (mode === "calibration") useMode = "calibration";
    else if (mode === "detailed") useMode = "detailed";
    else if (mode === "fast") useMode = "fast";
    else if (mode === "points") useMode = "points";
    else if (mode === "guidance") useMode = "fast";

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
