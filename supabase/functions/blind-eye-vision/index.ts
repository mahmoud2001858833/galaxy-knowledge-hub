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

type Lang =
  | "en" | "ar" | "fr" | "es" | "de" | "pt" | "ru" | "tr"
  | "fa" | "ur" | "he" | "hi" | "ja" | "ko" | "zh";

const COMMANDS: Record<Lang, { left: string; right: string; ahead: string; stop: string; back: string; continue_: string }> = {
  en: { left: "Left", right: "Right", ahead: "Ahead", stop: "Stop", back: "Back", continue_: "Continue" },
  ar: { left: "يسار", right: "يمين", ahead: "أمام", stop: "قف", back: "تراجع", continue_: "استمر" },
  fr: { left: "Gauche", right: "Droite", ahead: "Avancez", stop: "Stop", back: "Reculez", continue_: "Continuez" },
  es: { left: "Izquierda", right: "Derecha", ahead: "Adelante", stop: "Alto", back: "Atrás", continue_: "Continúa" },
  de: { left: "Links", right: "Rechts", ahead: "Geradeaus", stop: "Halt", back: "Zurück", continue_: "Weiter" },
  pt: { left: "Esquerda", right: "Direita", ahead: "Em frente", stop: "Pare", back: "Recue", continue_: "Continue" },
  ru: { left: "Налево", right: "Направо", ahead: "Прямо", stop: "Стоп", back: "Назад", continue_: "Продолжайте" },
  tr: { left: "Sol", right: "Sağ", ahead: "İleri", stop: "Dur", back: "Geri", continue_: "Devam" },
  fa: { left: "چپ", right: "راست", ahead: "جلو", stop: "بایست", back: "عقب", continue_: "ادامه" },
  ur: { left: "بائیں", right: "دائیں", ahead: "آگے", stop: "رکو", back: "پیچھے", continue_: "جاری رکھیں" },
  he: { left: "שמאלה", right: "ימינה", ahead: "קדימה", stop: "עצור", back: "אחורה", continue_: "המשך" },
  hi: { left: "बाएं", right: "दाएं", ahead: "आगे", stop: "रुको", back: "पीछे", continue_: "जारी रखें" },
  ja: { left: "左", right: "右", ahead: "前へ", stop: "止まれ", back: "後ろ", continue_: "進め" },
  ko: { left: "왼쪽", right: "오른쪽", ahead: "앞으로", stop: "멈춰", back: "뒤로", continue_: "계속" },
  zh: { left: "左", right: "右", ahead: "前进", stop: "停", back: "后退", continue_: "继续" },
};

// spoken MUST be a single short directional command in the user's language.
// Never describe what's seen.
function cmdList(lang: Lang): string {
  const c = COMMANDS[lang] || COMMANDS.en;
  return `"${c.left}" "${c.right}" "${c.ahead}" "${c.stop}" "${c.back}" "${c.continue_}"`;
}

const POINTS_PROMPT = (lang: Lang, target?: string) => {
  const c = COMMANDS[lang] || COMMANDS.en;
  const targetLine = target
    ? `\n- User destination: "${target}". If seen: target_seen=true, target_bearing=(left|center|right), target_distance=(far|mid|near|arrived), next_step_ar=one short command word in language "${lang}". Else target_seen=false.`
    : "";
  return `You are "Blind Eye" helping a blind user. Reply strictly in language "${lang}".
- objects: up to 6, label one word in language "${lang}", hazard low|medium|high, proximity 0-100, coordinates 0-1.
- best_path: left|center|right
- global_proximity 0-100
- spoken: EXACTLY one word from: ${cmdList(lang)}. Never describe.
  Rules: global_proximity>=70 → "${c.stop}". Side hazard → safe direction. Clear → "${c.ahead}" or "${c.continue_}".
- obstacles_summary: 3-6 words in language "${lang}" (display only, NOT spoken).${targetLine}
Be fast.`;
};

const GUIDANCE_FAST_PROMPT = (lang: Lang) => {
  return `You are "Blind Eye". Reply strictly in language "${lang}".
- best_path: left|center|right
- global_proximity 0-100
- spoken: EXACTLY one word from: ${cmdList(lang)}. Never describe.
- obstacles_summary: 3-6 words in "${lang}" for display only
- top_hazards: 1-2`;
};

const GUIDANCE_DETAILED_PROMPT = (lang: Lang) => {
  return `You are "Blind Eye". 3×3 grid (TL TC TR / ML MC MR / BL BC BR). Reply strictly in language "${lang}".
Per cell: object/label/proximity 0-100/hazard.
Return best_path, global_proximity, spoken (ONE word from ${cmdList(lang)}), obstacles_summary for display.`;
};

const CALIBRATION_PROMPT = (lang: Lang) => `Quick calibration. Any walkable frame → position_ok=true. spoken: ONE short ready-word in language "${lang}".`;


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

const spinScanTool = {
  type: "function",
  function: {
    name: "spin_scan_summary",
    description: "Summarize a 360° look around the user",
    parameters: {
      type: "object",
      properties: {
        place_type: { type: "string" },
        landmarks: { type: "array", maxItems: 6, items: { type: "string" } },
        open_directions: { type: "array", maxItems: 4, items: { type: "string" } },
        warnings: { type: "array", maxItems: 4, items: { type: "string" } },
        summary_spoken: { type: "string" },
      },
      required: ["place_type", "summary_spoken"],
      additionalProperties: false,
    },
  },
};

const describeHazardTool = {
  type: "function",
  function: {
    name: "describe_hazard",
    description: "One short sentence describing the obstacle directly in front",
    parameters: {
      type: "object",
      properties: {
        spoken: { type: "string" },
        label: { type: "string" },
        side: { type: "string", enum: ["left","center","right"] },
      },
      required: ["spoken"],
      additionalProperties: false,
    },
  },
};

type Mode = "calibration" | "fast" | "detailed" | "points" | "spin_scan" | "describe_hazard";

const SPIN_SCAN_PROMPT = (lang: Lang) => `You are "Blind Eye". The blind user just rotated 360°. From these snapshots, give ONE warm short summary in language "${lang}" (<= 25 words) saying place_type, key landmarks, open directions, and any clear warnings. summary_spoken must be ready-to-speak in language "${lang}".`;

const DESCRIBE_HAZARD_PROMPT = (lang: Lang) => `You are "Blind Eye". Describe ONLY the closest obstacle directly in front of the blind user in <= 8 words in language "${lang}". Include a short safe action (e.g. step right/back). No extra text.`;

async function callGateway(model: string, imageDataUrl: string | string[], mode: Mode, lang: Lang, extraContext?: string, target?: string) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");

  let sys: string;
  let tool: any;
  if (mode === "calibration") { sys = CALIBRATION_PROMPT(lang); tool = calibTool; }
  else if (mode === "detailed") { sys = GUIDANCE_DETAILED_PROMPT(lang); tool = guidanceDetailedTool; }
  else if (mode === "points") { sys = POINTS_PROMPT(lang, target); tool = pointsTool; }
  else if (mode === "spin_scan") { sys = SPIN_SCAN_PROMPT(lang); tool = spinScanTool; }
  else if (mode === "describe_hazard") { sys = DESCRIBE_HAZARD_PROMPT(lang); tool = describeHazardTool; }
  else { sys = GUIDANCE_FAST_PROMPT(lang); tool = guidanceFastTool; }


  const userText = extraContext
    ? `Context: ${extraContext}\nAnalyze in language "${lang}".`
    : `Analyze in language "${lang}".`;

  const images = Array.isArray(imageDataUrl) ? imageDataUrl : [imageDataUrl];
  const userContent: any[] = [{ type: "text", text: userText }];
  for (const url of images) userContent.push({ type: "image_url", image_url: { url } });

  const body = {
    model,
    max_tokens: mode === "spin_scan" ? 220 : mode === "describe_hazard" ? 60 : 200,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: userContent },
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
    const { image, images, context, mode, lang, target } = await req.json();
    const imgInput: string | string[] | null =
      Array.isArray(images) && images.length ? images.filter((i: any) => typeof i === "string") :
      typeof image === "string" ? image : null;
    if (!imgInput || (Array.isArray(imgInput) && imgInput.length === 0)) {
      return new Response(JSON.stringify({ error: "image required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let useMode: Mode = "points";
    if (mode === "calibration") useMode = "calibration";
    else if (mode === "detailed") useMode = "detailed";
    else if (mode === "fast") useMode = "fast";
    else if (mode === "points") useMode = "points";
    else if (mode === "spin_scan") useMode = "spin_scan";
    else if (mode === "describe_hazard") useMode = "describe_hazard";
    else if (mode === "guidance") useMode = "fast";

    const useLang: Lang = (typeof lang === "string" && lang in COMMANDS) ? (lang as Lang) : "en";

    let lastErr = "";
    for (const model of MODELS) {
      try {
        const result = await callGateway(model, imgInput, useMode, useLang, context, typeof target === 'string' ? target : undefined);
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
