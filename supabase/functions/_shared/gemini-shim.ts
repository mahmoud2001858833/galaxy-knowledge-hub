// OpenAI-compatible shim that calls Google Gemini directly.
// Drop-in replacement for `fetch("https://ai.gateway.lovable.dev/v1/chat/completions", ...)`.
// Accepts OpenAI chat-completions payloads (messages, tools, tool_choice, modalities)
// and returns an OpenAI-style Response so existing edge-function code keeps working.

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function getKey(): string {
  const k =
    Deno.env.get("GEMINI_API_KEY") ||
    Deno.env.get("GOOGLE_AI_API_KEY") ||
    Deno.env.get("BRAILLE_LEARN_GEMINI_KEY");
  if (!k) throw new Error("GEMINI_API_KEY not configured");
  return k;
}

// Map OpenAI-style model id -> Gemini model id
function mapModel(m?: string): string {
  if (!m) return "gemini-2.5-flash";
  if (m.includes("image")) return "gemini-2.5-flash-image";
  if (m.includes("flash-lite")) return "gemini-2.5-flash-lite";
  if (m.includes("pro")) return "gemini-2.5-pro";
  if (m.includes("flash")) return "gemini-2.5-flash";
  // strip provider prefix e.g. google/xxx
  const tail = m.split("/").pop() || m;
  if (tail.startsWith("gemini-")) return tail;
  return "gemini-2.5-flash";
}

function messagesToGemini(messages: any[]): { contents: any[]; systemInstruction?: any } {
  const contents: any[] = [];
  let system = "";
  for (const m of messages || []) {
    if (m.role === "system") {
      const t = typeof m.content === "string"
        ? m.content
        : (m.content || []).map((c: any) => c.text || "").join("\n");
      system += (system ? "\n\n" : "") + t;
      continue;
    }
    const role = m.role === "assistant" ? "model" : "user";
    const parts: any[] = [];
    if (typeof m.content === "string") {
      parts.push({ text: m.content });
    } else if (Array.isArray(m.content)) {
      for (const c of m.content) {
        if (c.type === "text" && c.text) parts.push({ text: c.text });
        else if (c.type === "image_url" && c.image_url?.url) {
          const url: string = c.image_url.url;
          const match = url.match(/^data:([^;]+);base64,(.+)$/);
          if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
          else parts.push({ text: `[image url: ${url}]` });
        } else if (c.type === "input_audio" && c.input_audio?.data) {
          parts.push({
            inlineData: {
              mimeType: `audio/${c.input_audio.format || "webm"}`,
              data: c.input_audio.data,
            },
          });
        }
      }
    }
    if (parts.length) contents.push({ role, parts });
  }
  return system
    ? { contents, systemInstruction: { role: "system", parts: [{ text: system }] } }
    : { contents };
}

function toolsToGemini(tools: any[]): any[] {
  if (!tools?.length) return [];
  const fns = tools
    .filter((t) => t.type === "function" && t.function)
    .map((t) => {
      // Gemini doesn't allow some JSON-schema fields; strip them.
      const params = sanitizeSchema(t.function.parameters || { type: "object", properties: {} });
      return {
        name: t.function.name,
        description: t.function.description || "",
        parameters: params,
      };
    });
  return [{ functionDeclarations: fns }];
}

function sanitizeSchema(s: any): any {
  if (!s || typeof s !== "object") return s;
  if (Array.isArray(s)) return s.map(sanitizeSchema);
  const out: any = {};
  for (const [k, v] of Object.entries(s)) {
    if (k === "additionalProperties" || k === "$schema" || k === "exclusiveMinimum" || k === "exclusiveMaximum") continue;
    out[k] = sanitizeSchema(v);
  }
  return out;
}

async function geminiCall(model: string, body: any, retries = 5): Promise<any> {
  const url = `${BASE}/${model}:generateContent?key=${getKey()}`;
  let lastErr = "";
  for (let i = 0; i < retries; i++) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) return await r.json();
    const t = await r.text();
    lastErr = `${r.status}: ${t.slice(0, 400)}`;
    console.warn(`gemini ${model} -> ${r.status}`);
    if (r.status === 429 || r.status >= 500) {
      await new Promise((res) => setTimeout(res, Math.min(2000 * Math.pow(2, i), 30000)));
      continue;
    }
    throw new Error(`Gemini ${lastErr}`);
  }
  throw new Error(`Gemini failed: ${lastErr}`);
}

/**
 * Drop-in replacement for OpenAI chat completions.
 * Returns a `Response` object so callers can use `if (!resp.ok)` and `await resp.json()`.
 */
export async function geminiChatCompletions(payload: any): Promise<Response> {
  try {
    const isImage = (payload.modalities || []).includes("image") || /image/i.test(payload.model || "");
    const model = mapModel(payload.model);

    const { contents, systemInstruction } = messagesToGemini(payload.messages || []);
    const generationConfig: any = {};
    if (payload.temperature != null) generationConfig.temperature = payload.temperature;
    if (payload.max_tokens) generationConfig.maxOutputTokens = payload.max_tokens;
    if (payload.response_format?.type === "json_object") {
      generationConfig.responseMimeType = "application/json";
    }

    const body: any = { contents };
    if (systemInstruction) body.systemInstruction = systemInstruction;
    if (Object.keys(generationConfig).length) body.generationConfig = generationConfig;

    if (isImage) {
      body.generationConfig = body.generationConfig || {};
      body.generationConfig.responseModalities = ["IMAGE", "TEXT"];
    }

    let toolForced: string | null = null;
    if (payload.tools?.length) {
      body.tools = toolsToGemini(payload.tools);
      if (payload.tool_choice?.function?.name) {
        toolForced = payload.tool_choice.function.name;
        body.toolConfig = {
          functionCallingConfig: { mode: "ANY", allowedFunctionNames: [toolForced] },
        };
      }
    }

    const j = await geminiCall(model, body);
    const cand = j?.candidates?.[0];
    const parts = cand?.content?.parts || [];

    let text = "";
    const images: any[] = [];
    const toolCalls: any[] = [];
    for (const p of parts) {
      if (p.text) text += p.text;
      if (p.inlineData?.data) {
        images.push({
          image_url: { url: `data:${p.inlineData.mimeType || "image/png"};base64,${p.inlineData.data}` },
        });
      }
      if (p.functionCall) {
        toolCalls.push({
          id: `call_${toolCalls.length}`,
          type: "function",
          function: {
            name: p.functionCall.name,
            arguments: JSON.stringify(p.functionCall.args || {}),
          },
        });
      }
    }

    // If a tool was forced but Gemini returned only text, try to parse JSON from text as args.
    if (toolForced && !toolCalls.length && text) {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        toolCalls.push({
          id: "call_0",
          type: "function",
          function: { name: toolForced, arguments: m[0] },
        });
      }
    }

    const message: any = { role: "assistant", content: text || null };
    if (toolCalls.length) message.tool_calls = toolCalls;
    if (images.length) message.images = images;

    const openaiResp = {
      id: `chatcmpl-gemini-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{ index: 0, message, finish_reason: cand?.finishReason?.toLowerCase() || "stop" }],
      usage: {
        prompt_tokens: j?.usageMetadata?.promptTokenCount || 0,
        completion_tokens: j?.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: j?.usageMetadata?.totalTokenCount || 0,
      },
    };

    return new Response(JSON.stringify(openaiResp), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const msg = e?.message || String(e);
    let status = 500;
    if (/^Gemini 429/.test(msg)) status = 429;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Replacement for the literal fetch call. Use this whenever code did:
 *   fetch("https://ai.gateway.lovable.dev/v1/chat/completions", { ... })
 */
export async function geminiFetch(_url: string, init: RequestInit): Promise<Response> {
  let payload: any = {};
  try { payload = JSON.parse(init.body as string); } catch { /* ignore */ }
  return await geminiChatCompletions(payload);
}
