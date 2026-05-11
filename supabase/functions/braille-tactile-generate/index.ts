import { geminiFetch } from "../_shared/gemini-shim.ts";
// supabase/functions/braille-tactile-generate/index.ts
// Modes: generate (text→figure), convert_image (image→figure), describe (image→description)
// Uses BRAILLE_TACTILE_GEMINI_API_KEY (Gemini direct), falls back to Lovable AI Gateway.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_KEY = Deno.env.get("BRAILLE_TACTILE_GEMINI_API_KEY");
const LOVABLE_KEY = "shim-key";

const SYSTEM = `You are a tactile graphics designer producing figures for blind students.
Follow BANA tactile graphics guidelines:
- Black ink on white only, NO shading or gradients.
- Simplify shapes; remove unnecessary detail.
- Maximum 7 labels per figure.
- Labels are short codes (a, b, c, 1, 2, 3) placed near elements with optional straight leader lines (no curves).
- Use millimeters; figures fit inside the requested paper size with 15mm safe margin.
- For chemistry molecules: atoms = circles with element letter inside (use text element), bonds = lines.
- For maps: simplified outlines as polygons/polylines.
- For graphs: axes as lines + curve as polyline; mark key points.
- Always provide an Arabic description and a legend mapping each label code to full text + braille.
You MUST respond ONLY by calling the provided function with the structured figure.`;

const figureSchema = {
  name: "emit_tactile_figure",
  description: "Emit a structured tactile figure ready for embossed printing.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string", description: "Arabic description of the figure" },
      paper: { type: "string", enum: ["A4", "A3", "Letter"] },
      width_mm: { type: "number" },
      height_mm: { type: "number" },
      elements: {
        type: "array",
        items: {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["circle", "polygon", "polyline", "path", "line", "point", "text"] },
            coords: { type: "array", items: { type: "number" } },
            label_id: { type: "string" },
            stroke_mm: { type: "number" },
            dashed: { type: "boolean" },
            fill: { type: "boolean" },
            text: { type: "string" },
          },
          required: ["kind", "coords"],
        },
      },
      labels: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            text: { type: "string" },
            braille: { type: "string", description: "Unicode braille glyphs" },
            position: { type: "array", items: { type: "number" } },
            leader_to: { type: "array", items: { type: "number" } },
          },
          required: ["id", "text", "braille", "position"],
        },
      },
      legend: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            text: { type: "string" },
            braille: { type: "string" },
            notes: { type: "string" },
          },
          required: ["id", "text", "braille"],
        },
      },
      safety_notes: { type: "string" },
    },
    required: ["title", "description", "paper", "width_mm", "height_mm", "elements", "labels", "legend"],
  },
};

const describeSchema = {
  name: "emit_description",
  description: "Describe a tactile/braille figure",
  parameters: {
    type: "object",
    properties: {
      figure_type: { type: "string" },
      description: { type: "string" },
      decoded_labels: {
        type: "array",
        items: {
          type: "object",
          properties: { braille: { type: "string" }, text: { type: "string" } },
          required: ["braille", "text"],
        },
      },
      narration: { type: "string" },
      sign_keywords: {
        type: "array",
        items: { type: "string" },
        description: "5-10 short Arabic keywords summarizing the figure for sign-language rendering",
      },
    },
    required: ["figure_type", "description", "decoded_labels", "narration"],
  },
};

const translateSchema = {
  name: "emit_translation",
  description: "Translate text fields to a target language",
  parameters: {
    type: "object",
    properties: {
      description: { type: "string" },
      narration: { type: "string" },
    },
    required: ["description", "narration"],
  },
};

async function callGemini(parts: any[], schema: any) {
  if (!GEMINI_KEY) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: "user", parts }],
    tools: [{ functionDeclarations: [schema] }],
    toolConfig: { functionCallingConfig: { mode: "ANY", allowedFunctionNames: [schema.name] } },
  };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    console.error("Gemini error", r.status, await r.text());
    return null;
  }
  const j = await r.json();
  const call = j?.candidates?.[0]?.content?.parts?.find((p: any) => p.functionCall)?.functionCall;
  return call?.args ?? null;
}

async function callLovable(userText: string, imageDataUrl: string | null, schema: any) {
  if (!LOVABLE_KEY) throw new Error("AI keys missing");
  const userContent: any[] = [{ type: "text", text: userText }];
  if (imageDataUrl) userContent.push({ type: "image_url", image_url: { url: imageDataUrl } });
  const body = {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userContent },
    ],
    tools: [{ type: "function", function: schema }],
    tool_choice: { type: "function", function: { name: schema.name } },
  };
  const r = await geminiFetch("ai-shim", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (r.status === 429) throw new Error("rate_limited");
  if (r.status === 402) throw new Error("payment_required");
  if (!r.ok) throw new Error(`AI error ${r.status}`);
  const j = await r.json();
  const tc = j.choices?.[0]?.message?.tool_calls?.[0];
  if (!tc) throw new Error("no_tool_call");
  return JSON.parse(tc.function.arguments);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const reqBody = await req.json();
    const { mode, prompt, category, language, grade, paper, image_data_url } = reqBody;

    const paperLine = `Paper: ${paper || "A4"}. Use sensible width_mm/height_mm fitting that paper minus 15mm margins.`;
    const langLine = `Language for labels: ${language || "ar"}. Grade: ${grade || 1}.`;

    if (mode === "generate") {
      const userText = `Category: ${category}\nUser request (Arabic): ${prompt}\n${paperLine}\n${langLine}\nProduce the tactile figure now.`;
      const parts = [{ text: userText }];
      let args = await callGemini(parts, figureSchema);
      if (!args) args = await callLovable(userText, null, figureSchema);
      return new Response(JSON.stringify({ figure: args }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "convert_image") {
      if (!image_data_url) throw new Error("image_data_url required");
      const userText = `Convert the attached figure into a simplified tactile diagram.\nCategory hint: ${category || "auto"}\n${paperLine}\n${langLine}\nKeep only essential outlines and label key parts with short codes.`;
      // Gemini direct (vision)
      const b64 = image_data_url.split(",")[1];
      const mime = image_data_url.match(/^data:([^;]+);/)?.[1] || "image/png";
      const parts = [
        { text: userText },
        { inlineData: { mimeType: mime, data: b64 } },
      ];
      let args = await callGemini(parts, figureSchema);
      if (!args) args = await callLovable(userText, image_data_url, figureSchema);
      return new Response(JSON.stringify({ figure: args }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "describe") {
      if (!image_data_url) throw new Error("image_data_url required");
      const userText = `Describe this tactile/braille figure for a sighted teacher (Arabic). Identify figure type, decode any visible braille labels into text, and provide a short narration suitable for read-aloud. Also include a "sign_keywords" array of 5–10 short Arabic keywords that summarize the figure for sign-language rendering.`;
      const b64 = image_data_url.split(",")[1];
      const mime = image_data_url.match(/^data:([^;]+);/)?.[1] || "image/png";
      const parts = [{ text: userText }, { inlineData: { mimeType: mime, data: b64 } }];
      let args = await callGemini(parts, describeSchema);
      if (!args) args = await callLovable(userText, image_data_url, describeSchema);
      return new Response(JSON.stringify({ result: args }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "translate") {
      const text: string = reqBody.text || "";
      const narrationIn: string = reqBody.narration || "";
      const target_lang: string = reqBody.target_lang || "en";
      if (!text && !narrationIn) {
        return new Response(JSON.stringify({ error: "no text" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userText = `Translate the following two fields to language code "${target_lang}". Preserve meaning, keep it natural and professional.\n\nDESCRIPTION:\n${text}\n\nNARRATION:\n${narrationIn}`;
      let args = await callGemini([{ text: userText }], translateSchema);
      if (!args) args = await callLovable(userText, null, translateSchema);
      return new Response(JSON.stringify({ translation: args }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "unknown mode" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    const status = msg === "rate_limited" ? 429 : msg === "payment_required" ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
