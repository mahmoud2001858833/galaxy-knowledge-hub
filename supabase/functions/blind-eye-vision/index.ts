// Blind Eye - Advanced Vision Navigation Engine for the Visually Impaired
// Gemini direct (fast, no thinking) with the AI gateway as fallback

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODELS = [
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-3-flash-preview",
];

type Lang =
  | "en" | "ar" | "fr" | "es" | "de" | "pt" | "ru" | "tr"
  | "fa" | "ur" | "he" | "hi" | "ja" | "ko" | "zh";

// Structured Tool Definitions
const pointsTool = {
  type: "function",
  function: {
    name: "describe_points",
    description: "Real-time obstacle detection and human-like natural navigation advice",
    parameters: {
      type: "object",
      properties: {
        objects: {
          type: "array",
          maxItems: 8,
          items: {
            type: "object",
            properties: {
              x: { type: "number", description: "0..1 left coordinate" },
              y: { type: "number", description: "0..1 top coordinate" },
              w: { type: "number", description: "0..1 width" },
              h: { type: "number", description: "0..1 height" },
              label: { type: "string", description: "Obstacle name in user's language" },
              hazard: { type: "string", enum: ["low", "medium", "high"] },
              proximity: { type: "number", description: "0..100 closeness" },
              distance_hint: { type: "string", description: "Approximate distance like 1 meter / 2 steps" },
            },
            required: ["x", "y", "w", "h", "label", "hazard", "proximity"],
            additionalProperties: false,
          },
        },
        best_path: { type: "string", enum: ["left", "center", "right"] },
        global_proximity: { type: "number", description: "0..100 overall collision danger" },
        spoken: {
          type: "string",
          description: "Natural, crystal-clear, highly practical spoken instruction for the blind user (concise 4-12 words in user's language). Never robotic. Tell them where to step or warn of exact obstacle.",
        },
        obstacles_summary: { type: "string", description: "Short descriptive summary for companion display" },
        target_seen: { type: "boolean" },
        target_bearing: { type: "string", enum: ["left", "center", "right"] },
        target_distance: { type: "string", enum: ["far", "mid", "near", "arrived"] },
        next_step_ar: { type: "string", description: "Guidance sentence toward target" },
      },
      required: ["objects", "best_path", "global_proximity", "spoken", "obstacles_summary"],
      additionalProperties: false,
    },
  },
};

const describeSceneTool = {
  type: "function",
  function: {
    name: "describe_scene_full",
    description: "Full panoramic spatial scene description for a blind user",
    parameters: {
      type: "object",
      properties: {
        spoken: {
          type: "string",
          description: "A vivid, reassuring, highly informative 3-5 sentence walkthrough in user's language: 1) Environment/room type, 2) Key obstacles & distance, 3) Clear safe walking corridor, 4) Lighting, doors, or people.",
        },
        scene_title: { type: "string", description: "Short title of the scene" },
        safe_path: { type: "string", enum: ["left", "center", "right"] },
        top_obstacles: {
          type: "array",
          items: { type: "string" },
          description: "Main items/obstacles seen",
        },
        lighting_condition: { type: "string", description: "Bright, normal, dim, or dark" },
      },
      required: ["spoken", "scene_title", "safe_path"],
      additionalProperties: false,
    },
  },
};

const ocrTool = {
  type: "function",
  function: {
    name: "read_text_full",
    description: "Accurate OCR reader for signs, documents, labels, medication, and packaging",
    parameters: {
      type: "object",
      properties: {
        spoken: {
          type: "string",
          description: "Fluent reading aloud of the text in user's language, stating the type of sign/document first, then the content and any crucial safety or dosage info.",
        },
        title: { type: "string", description: "Type of text (e.g. Door Sign, Medicine Box, Invoice)" },
        full_text: { type: "string", description: "Exact extracted text" },
        key_instruction: { type: "string", description: "Any key warning, expiry date, or room number" },
      },
      required: ["spoken", "full_text"],
      additionalProperties: false,
    },
  },
};

const identifyItemTool = {
  type: "function",
  function: {
    name: "identify_item",
    description: "Identify currency notes, handheld objects, clothing colors, and items",
    parameters: {
      type: "object",
      properties: {
        spoken: {
          type: "string",
          description: "Clear statement of what is held or seen: exact currency denomination and country (e.g. 10 Jordanian Dinars, 50 Saudi Riyals), or object name, color, and location.",
        },
        category: { type: "string", enum: ["currency", "medicine", "electronics", "clothing", "document", "food", "general"] },
        denomination: { type: "string", description: "If currency, exact value like '10 JOD'" },
        primary_color: { type: "string", description: "Item color in user's language" },
      },
      required: ["spoken", "category"],
      additionalProperties: false,
    },
  },
};

const spinScanTool = {
  type: "function",
  function: {
    name: "spin_scan_summary",
    description: "Summarize a 360° rotation around the blind user",
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
    description: "Immediate emergency obstacle warning with exact escape direction",
    parameters: {
      type: "object",
      properties: {
        spoken: { type: "string", description: "e.g. 'Stop! Chair directly in front, step right.'" },
        label: { type: "string" },
        side: { type: "string", enum: ["left", "center", "right"] },
      },
      required: ["spoken"],
      additionalProperties: false,
    },
  },
};

// Room mapping: every object with its horizontal extent in the frame and a metric distance, so the
// client can place it on a virtual map using the phone's compass heading.
const MAP_KINDS = [
  "door", "doorway", "window", "stairs", "wall", "chair", "table", "desk", "sofa", "bed", "closet",
  "shelf", "fridge", "stove", "counter", "sink", "toilet", "shower", "tv", "computer", "plant", "lamp",
  "person", "pet", "bag", "box", "bin", "rug", "step", "pillar", "car", "elevator", "other",
] as const;

const mapTool = {
  type: "function",
  function: {
    name: "map_objects",
    description: "Objects in view with position and distance, for building a room map",
    parameters: {
      type: "object",
      properties: {
        place: { type: "string", description: "Room or place type in the user's language (e.g. kitchen, corridor)" },
        objects: {
          type: "array",
          maxItems: 12,
          items: {
            type: "object",
            properties: {
              kind: { type: "string", enum: [...MAP_KINDS] },
              label: { type: "string", description: "Short name in the user's language, with color if useful (e.g. red chair)" },
              x0: { type: "number", description: "Left edge, 0..1 of image width" },
              x1: { type: "number", description: "Right edge, 0..1 of image width" },
              y1: { type: "number", description: "Bottom edge, 0..1 of image height" },
              distance_m: { type: "number", description: "Estimated distance from the camera in meters" },
              obstacle: { type: "boolean", description: "True if it stands on the floor and could block walking" },
            },
            required: ["kind", "label", "x0", "x1", "y1", "distance_m", "obstacle"],
            additionalProperties: false,
          },
        },
      },
      required: ["place", "objects"],
      additionalProperties: false,
    },
  },
};

type Mode = "map" | "points" | "describe_scene" | "ocr" | "identify" | "spin_scan" | "describe_hazard" | "calibration" | "detailed" | "fast";

const SYSTEM_PROMPTS = {
  points: (lang: Lang, target?: string) => `You are "Blind Eye" (عين الأعمى), an elite, caring visual navigator guiding a blind or visually impaired person in real time. Reply strictly in language "${lang}".
- Detect up to 8 obstacles with coordinates (0..1), labels in "${lang}", hazard levels, and distance estimations.
- Determine best_path: left | center | right.
- Determine global_proximity: 0..100 (where 0=completely clear hallway, 40-60=approaching object, 75+=imminent collision).
- spoken: MUST be a natural, warm, highly practical guidance sentence (4 to 12 words) in "${lang}".
  * If global_proximity >= 75: Start with urgent stop/caution and name the obstacle and safe move: e.g. "انتبه! كرسي أمامك على بعد خطوة، اتجه يميناً" or "قف! شخص قادم في مواجهتك، خذ أقصى اليمين".
  * If global_proximity >= 40: Give a smooth navigational cue: e.g. "طاولة على يسارك، استمر نحو اليمين" or "الباب مفتوح أمامك على بعد مترين".
  * If global_proximity < 40 (clear path): Reassure the user: e.g. "الطريق سالك تماماً أمامك، استمر للأمام" or "الممر مفتوح، تابع المشي بأمان".
${target ? `- Target Destination: "${target}". If visible: target_seen=true, target_bearing=(left|center|right), target_distance=(far|mid|near|arrived), next_step_ar=helpful navigation instruction.` : ""}`,

  describe_scene: (lang: Lang) => `You are "Blind Eye" (عين الأعمى), the personal visual companion for a blind individual. The user asked "Describe what is in front of me" (صف ما أمامي).
Provide an intelligent, vivid, highly spatial description in language "${lang}".
Include:
1. Environment type (e.g. living room, hospital corridor, office, outdoor sidewalk, classroom).
2. Key furniture, objects, or obstacles and their approximate distances (e.g. "طاولة خشبية في المنتصف على بعد مترين").
3. The clearest safe walking corridor (where they can step without tripping).
4. Lighting conditions, windows, doors, or people in the room.
Keep the spoken response warm, natural, and directly actionable (3 to 5 sentences).`,

  ocr: (lang: Lang) => `You are "Blind Eye" (عين الأعمى) text reading assistant for the blind.
Examine the image and read all visible text with utmost precision in language "${lang}".
Identify the document type (e.g. Medicine packaging, Street sign, Room label, Printed letter, Price tag, Screen).
Extract the text accurately. In "spoken", deliver a fluent, clean, natural reading. Highlight crucial safety information like medicine dosage, expiration dates, warnings, or room names first.`,

  identify: (lang: Lang) => `You are "Blind Eye" (عين الأعمى). The blind user is holding an item, currency note, or asking what something is.
Identify with 100% precision in language "${lang}":
- If CURRENCY/MONEY: Specify the exact country and denomination (e.g. "عشرة دنانير أردنية" or "خمسون ريالاً سعودياً" or "ورقة مئة دولار"). Note security features or color if helpful.
- If MEDICINE: Name the medication, strength (e.g. 500mg), and purpose.
- If OBJECT: State what it is, its color, and relative position.
In "spoken", speak directly and clearly to the user.`,

  spin_scan: (lang: Lang) => `You are "Blind Eye". The blind user completed a 360° turn. Provide a warm, comprehensive spatial overview in language "${lang}" (< 35 words): place type, key landmarks around them, open walking exits, and any safety warnings.`,

  describe_hazard: (lang: Lang) => `You are "Blind Eye". Describe ONLY the immediate obstacle directly blocking the blind user in <= 10 words in "${lang}", giving an immediate safe evasion direction (e.g. "انتبه! عتبة أمامك، توقف وخطُ للأعلى").`,

  map: (lang: Lang) => `You map rooms for a blind person's navigation app. The image is from a phone held at chest height, camera facing forward.
List every meaningful object and structural element (doors, doorways/openings, windows, stairs, furniture, appliances, people, and floor obstacles). Skip tiny items on tables.
- label: short name in language "${lang}" (add color/material when it helps tell objects apart).
- x0/x1: horizontal extent in the image (0 = left edge, 1 = right edge). y1: bottom edge (0 = top, 1 = bottom).
- distance_m: realistic distance in meters from the camera to the object's nearest point. Use room scale cues (doors ~2 m tall, chairs ~0.9 m). Be accurate, never 0.
- obstacle: true for things standing on the floor in a walking area.
Return at most 12 objects, most important first. Return an empty list if the image is dark or blurred.`,

  calibration: (lang: Lang) => `Quick phone calibration. Confirm if phone camera angle covers walking path ahead. position_ok=true if walkable floor/path is visible. spoken: Short ready phrase in "${lang}".`,
};

// Direct Gemini (no thinking, JSON schema): much faster than the gateway; the gateway stays as fallback.
function toGeminiSchema(s: any): any {
  if (Array.isArray(s)) return s.map(toGeminiSchema);
  if (!s || typeof s !== "object") return s;
  const out: any = {};
  for (const [k, v] of Object.entries(s)) {
    if (k === "additionalProperties" || k === "description") continue;
    out[k] = toGeminiSchema(v);
  }
  return out;
}

const DIRECT_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
// flash-lite misnames objects too often (window -> TV, cabinet -> door); use full flash where the
// answer is what the user acts on, keep lite first only for split-second hazard calls.
const ACCURATE_FIRST = new Set(["map", "identify", "ocr", "describe_scene", "spin_scan"]);
const orderFor = (mode: string, list: string[]) =>
  ACCURATE_FIRST.has(mode) ? [...list.filter((m) => !m.endsWith("flash-lite")), ...list.filter((m) => m.endsWith("flash-lite"))] : list;
// after a quota error the direct key is skipped for a minute (saves a wasted round trip per call)
let directBlockedUntil = 0;

async function callDirect(model: string, sysPrompt: string, userText: string, images: string[], tool: any, maxTokens: number) {
  const key = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY");
  if (!key) throw new Error("no gemini key");
  const parts: any[] = [{ text: userText }];
  for (const url of images) {
    const m = url.match(/^data:([^;]+);base64,(.+)$/);
    if (m) parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sysPrompt }] },
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: Math.max(maxTokens, 900),
          responseMimeType: "application/json",
          responseSchema: toGeminiSchema(tool.function.parameters),
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });
    if (r.status === 429) { directBlockedUntil = Date.now() + 60_000; throw new Error("direct quota"); }
    if (!r.ok) throw new Error(`direct ${model} ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    const txt = j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") ?? "";
    if (!txt) throw new Error(`direct ${model}: empty`);
    return JSON.parse(txt);
  } finally {
    clearTimeout(timer);
  }
}

function buildPrompt(mode: Mode, lang: Lang, target?: string) {
  if (mode === "map") return { sysPrompt: SYSTEM_PROMPTS.map(lang), tool: mapTool, maxTokens: 900 };
  if (mode === "describe_scene" || mode === "detailed") return { sysPrompt: SYSTEM_PROMPTS.describe_scene(lang), tool: describeSceneTool, maxTokens: 650 };
  if (mode === "ocr") return { sysPrompt: SYSTEM_PROMPTS.ocr(lang), tool: ocrTool, maxTokens: 650 };
  if (mode === "identify") return { sysPrompt: SYSTEM_PROMPTS.identify(lang), tool: identifyItemTool, maxTokens: 450 };
  if (mode === "spin_scan") return { sysPrompt: SYSTEM_PROMPTS.spin_scan(lang), tool: spinScanTool, maxTokens: 300 };
  if (mode === "describe_hazard") return { sysPrompt: SYSTEM_PROMPTS.describe_hazard(lang), tool: describeHazardTool, maxTokens: 120 };
  if (mode === "calibration") return { sysPrompt: SYSTEM_PROMPTS.calibration(lang), tool: pointsTool, maxTokens: 150 };
  return { sysPrompt: SYSTEM_PROMPTS.points(lang, target), tool: pointsTool, maxTokens: 400 };
}

async function callGateway(
  model: string,
  imageDataUrl: string | string[],
  mode: Mode,
  lang: Lang,
  extraContext?: string,
  target?: string
) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");

  const { sysPrompt, tool, maxTokens } = buildPrompt(mode, lang, target);

  const userText = extraContext
    ? `Context: ${extraContext}\nAnalyze the scene for the blind user in language "${lang}".`
    : `Analyze the scene for the blind user in language "${lang}".`;

  const images = Array.isArray(imageDataUrl) ? imageDataUrl : [imageDataUrl];
  const userContent: any[] = [{ type: "text", text: userText }];
  for (const url of images) userContent.push({ type: "image_url", image_url: { url } });

  const body = {
    model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: sysPrompt },
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
    if (mode === "map") useMode = "map";
    else if (mode === "describe_scene" || mode === "detailed") useMode = "describe_scene";
    else if (mode === "ocr" || mode === "read_text") useMode = "ocr";
    else if (mode === "identify" || mode === "currency") useMode = "identify";
    else if (mode === "spin_scan") useMode = "spin_scan";
    else if (mode === "describe_hazard") useMode = "describe_hazard";
    else if (mode === "calibration") useMode = "calibration";
    else useMode = "points";

    const useLang: Lang = (typeof lang === "string" && ["en","ar","fr","es","de","pt","ru","tr","fa","ur","he","hi","ja","ko","zh"].includes(lang))
      ? (lang as Lang)
      : "ar";

    let lastErr = "";
    const frames = Array.isArray(imgInput) ? imgInput : [imgInput];
    const { sysPrompt, tool, maxTokens } = buildPrompt(useMode, useLang, typeof target === "string" ? target : undefined);
    const userText = context
      ? `Context: ${context}\nAnalyze the scene for the blind user in language "${useLang}".`
      : `Analyze the scene for the blind user in language "${useLang}".`;
    for (const model of Date.now() < directBlockedUntil ? [] : orderFor(useMode, DIRECT_MODELS)) {
      try {
        const result = await callDirect(model, sysPrompt, userText, frames, tool, maxTokens);
        return new Response(
          JSON.stringify({ ok: true, mode: useMode, model, lang: useLang, ...result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
        console.warn("blind-eye-vision direct failed:", lastErr);
        if (Date.now() < directBlockedUntil) break;
      }
    }
    for (const model of orderFor(useMode, MODELS)) {
      try {
        const result = await callGateway(
          model,
          imgInput,
          useMode,
          useLang,
          context,
          typeof target === "string" ? target : undefined
        );
        return new Response(
          JSON.stringify({ ok: true, mode: useMode, model, lang: useLang, ...result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "RATE_LIMIT") {
          return new Response(
            JSON.stringify({
              error: "rate_limit",
              message: useLang === "ar" ? "النظام مزدحم مؤقتاً، أواصل التوجيه المحلي" : "System busy, continuing local guidance",
            }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (msg === "PAYMENT_REQUIRED") {
          return new Response(
            JSON.stringify({
              error: "payment_required",
              message: useLang === "ar" ? "نفذت الأرصدة، يرجى الشحن" : "Out of credits",
            }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        lastErr = msg;
        console.warn(`Model ${model} failed in blind-eye-vision:`, msg);
      }
    }

    return new Response(JSON.stringify({ error: "All vision models failed", details: lastErr }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("blind-eye-vision error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
