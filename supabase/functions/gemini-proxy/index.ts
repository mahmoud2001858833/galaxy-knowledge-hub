// Server-side relay to the Gemini API so the Google key never reaches the browser.
// The request body is a normal Gemini `generateContent` payload; the response
// (JSON or SSE stream) is passed back unchanged so existing client parsing keeps working.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Only Flash-class models: cheap, and enough for the platform's tutoring use.
const ALLOWED_MODELS = new Set([
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
]);
const DEFAULT_MODEL = "gemini-flash-latest";
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

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json(500, { error: { message: "AI key is not configured on the server" } });

  const url = new URL(req.url);
  const requested = url.searchParams.get("model") ?? DEFAULT_MODEL;
  // Old names (gemini-1.5-*, gemini-2.0-*) and anything unknown fall back to the default.
  const model = ALLOWED_MODELS.has(requested) ? requested : DEFAULT_MODEL;
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
  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(payload),
      signal: req.signal,
    },
  );

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      ...corsHeaders,
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
      "x-gemini-model": model,
    },
  });
});
