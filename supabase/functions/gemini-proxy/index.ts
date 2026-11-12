// Server-side relay to the Gemini API so the Google key never reaches the browser.
// The request body is a normal Gemini `generateContent` payload; the response
// (JSON or SSE stream) is passed back unchanged so existing client parsing keeps working.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Flash-Lite only: the cheapest models available to new Google keys
// (gemini-2.5-* is closed to new accounts). 3.1 first; 3.5 if 3.1 answers 404 for this key.
const MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite"];
const MAX_BODY_BYTES = 8 * 1024 * 1024; // room for one inline image
const MAX_OUTPUT_TOKENS = 8192;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: { message: "Method not allowed" } });

  const apiKey = Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json(500, { error: { message: "AI key is not configured on the server" } });

  const url = new URL(req.url);
  // The requested model is ignored on purpose: every call uses the cheap Flash-Lite list above.
  const stream = url.searchParams.get("stream") === "1";

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: { message: "Request too large" } });

  let payload: Record<string, any>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json(400, { error: { message: "Invalid JSON" } });
  }
  if (!Array.isArray(payload?.contents) || payload.contents.length === 0) {
    return json(400, { error: { message: "contents is required" } });
  }

  payload.generationConfig = { ...(payload.generationConfig ?? {}) };
  const asked = Number(payload.generationConfig.maxOutputTokens) || MAX_OUTPUT_TOKENS;
  payload.generationConfig.maxOutputTokens = Math.min(asked, MAX_OUTPUT_TOKENS);

  const method = stream ? "streamGenerateContent?alt=sse" : "generateContent";
  let upstream: Response | null = null;
  let model = MODELS[0];
  for (const m of MODELS) {
    model = m;
    upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(payload),
      signal: req.signal,
    });
    if (upstream.status !== 404) break; // 404 = model not available for this key
  }
  upstream = upstream!;

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      ...corsHeaders,
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
      "x-gemini-model": model,
    },
  });
});
