// Edge function: damij-dict-translate-batch
// Translates Arabic words to a target language. Uses direct Gemini key rotation;
// falls back to Lovable AI only when all Gemini keys fail.
import { aiCallWithFallback, parseJson } from "../_shared/sign-ai-call.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  words: string[];
  targetLang: string;
  targetLangName?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!Array.isArray(body?.words) || body.words.length === 0 || !body?.targetLang) {
      return new Response(JSON.stringify({ error: "missing words or targetLang" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.targetLang.startsWith("ar")) {
      const out: Record<string, string> = {};
      for (const w of body.words) out[w] = w;
      return new Response(JSON.stringify({ translations: out }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langName = body.targetLangName ?? body.targetLang;
    const chunkSize = 60;
    const final: Record<string, string> = {};

    for (let i = 0; i < body.words.length; i += chunkSize) {
      const chunk = body.words.slice(i, i + chunkSize);
      const numbered = chunk.map((w, idx) => `${idx + 1}. ${w}`).join("\n");

      const prompt = `Translate each of the following Arabic words to ${langName} (BCP-47: ${body.targetLang}). Use the native script of the target language.

RULES:
- Output ONLY valid minified JSON: {"items":[{"i":1,"t":"..."},{"i":2,"t":"..."}]}
- Preserve the order and the same number of items.
- Use the most common single-word equivalent. If multi-word, keep it short (2-3 words max).
- No transliteration unless the language uses Latin script.
- No quotes inside translations.

Words:
${numbered}`;

      const raw = await aiCallWithFallback(prompt, true);
      if (!raw) continue;
      const parsed = parseJson(raw);
      const items = parsed?.items;
      if (Array.isArray(items)) {
        for (const it of items) {
          const idx = (it?.i ?? 0) - 1;
          if (idx >= 0 && idx < chunk.length && typeof it?.t === "string") {
            final[chunk[idx]] = it.t.trim();
          }
        }
      }
    }

    return new Response(JSON.stringify({ translations: final }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
