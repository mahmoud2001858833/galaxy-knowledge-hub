// Shared Gemini direct API helpers for Damij edge functions.
// NEVER use Lovable AI Gateway here - direct provider calls only.

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function getKey(): string {
  const k = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY");
  if (!k) throw new Error("GEMINI_API_KEY is not configured");
  return k;
}

async function geminiFetch(model: string, body: unknown, retries = 5): Promise<any> {
  const key = getKey();
  const url = `${BASE}/${model}:generateContent?key=${key}`;
  let lastErr = "";
  for (let i = 0; i < retries; i++) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) return await r.json();
    const t = await r.text();
    lastErr = `${r.status}: ${t.slice(0, 300)}`;
    if (r.status === 429 || r.status >= 500) {
      const wait = Math.min(2000 * Math.pow(2, i), 30000);
      console.warn(`Gemini ${r.status}, retry in ${wait}ms`);
      await new Promise((res) => setTimeout(res, wait));
      continue;
    }
    throw new Error(`Gemini ${lastErr}`);
  }
  throw new Error(`Gemini failed after retries: ${lastErr}`);
}

export interface CallOpts {
  model?: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  responseSchema?: any;
}

/** Plain text completion */
export async function callGeminiText(prompt: string, opts: CallOpts = {}): Promise<string> {
  const model = opts.model || "gemini-2.5-flash";
  const parts: any[] = [];
  if (opts.system) parts.push({ text: `${opts.system}\n\n${prompt}` });
  else parts.push({ text: prompt });

  const body: any = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxTokens ?? 2048,
    },
  };
  if (opts.json) body.generationConfig.responseMimeType = "application/json";
  if (opts.responseSchema) {
    body.generationConfig.responseMimeType = "application/json";
    body.generationConfig.responseSchema = opts.responseSchema;
  }
  const j = await geminiFetch(model, body);
  return j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/** JSON output (auto-parse) */
export async function callGeminiJSON<T = any>(prompt: string, opts: CallOpts = {}): Promise<T> {
  const txt = await callGeminiText(prompt, { ...opts, json: true });
  try {
    return JSON.parse(txt);
  } catch {
    const m = txt.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Gemini returned non-JSON: " + txt.slice(0, 200));
  }
}

/** Vision: analyze image + prompt */
export async function callGeminiVision(
  prompt: string,
  imageBase64: string,
  mimeType = "image/jpeg",
  opts: CallOpts = {}
): Promise<string> {
  const model = opts.model || "gemini-2.5-flash";
  // strip data URL prefix if present
  const data = imageBase64.replace(/^data:[^;]+;base64,/, "");
  const sys = opts.system ? `${opts.system}\n\n` : "";
  const body: any = {
    contents: [
      {
        role: "user",
        parts: [
          { text: sys + prompt },
          { inlineData: { mimeType, data } },
        ],
      },
    ],
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxTokens ?? 2048,
    },
  };
  if (opts.json) body.generationConfig.responseMimeType = "application/json";
  if (opts.responseSchema) {
    body.generationConfig.responseMimeType = "application/json";
    body.generationConfig.responseSchema = opts.responseSchema;
  }
  const j = await geminiFetch(model, body);
  return j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/** Audio (STT): transcribe audio */
export async function callGeminiAudio(
  prompt: string,
  audioBase64: string,
  mimeType = "audio/webm",
  opts: CallOpts = {}
): Promise<string> {
  const model = opts.model || "gemini-2.5-flash";
  const data = audioBase64.replace(/^data:[^;]+;base64,/, "");
  const body: any = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data } },
        ],
      },
    ],
    generationConfig: {
      temperature: opts.temperature ?? 0.2,
      maxOutputTokens: opts.maxTokens ?? 4096,
    },
  };
  const j = await geminiFetch(model, body);
  return j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/** Image generation -> data:image/png;base64 URL */
export async function callGeminiImage(prompt: string, model = "gemini-2.5-flash-image"): Promise<string> {
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
  };
  const j = await geminiFetch(model, body);
  const parts = j?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    if (p?.inlineData?.data) {
      const mt = p.inlineData.mimeType || "image/png";
      return `data:${mt};base64,${p.inlineData.data}`;
    }
  }
  throw new Error("No image in Gemini response");
}

/** Image edit: takes input image + prompt */
export async function callGeminiImageEdit(
  prompt: string,
  imageBase64: string,
  mimeType = "image/png",
  model = "gemini-2.5-flash-image"
): Promise<string> {
  const data = imageBase64.replace(/^data:[^;]+;base64,/, "");
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data } },
        ],
      },
    ],
    generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
  };
  const j = await geminiFetch(model, body);
  const parts = j?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    if (p?.inlineData?.data) {
      const mt = p.inlineData.mimeType || "image/png";
      return `data:${mt};base64,${p.inlineData.data}`;
    }
  }
  throw new Error("No image in Gemini response");
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
