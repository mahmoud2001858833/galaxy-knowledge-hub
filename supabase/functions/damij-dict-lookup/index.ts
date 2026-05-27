// Edge function: damij-dict-lookup
// Returns rich detail for a single Arabic word in a chosen sign system + display language.
// Uses direct Gemini key rotation; falls back to Lovable AI only when all Gemini keys fail.
import { aiCallWithFallback, parseJson } from "../_shared/sign-ai-call.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  ar_word: string;
  target_lang: string;
  target_lang_name?: string;
  sign_system?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body?.ar_word || !body?.target_lang) {
      return new Response(JSON.stringify({ error: "missing ar_word or target_lang" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sys = body.sign_system ?? "ArSL";
    const lang = body.target_lang_name ?? body.target_lang;
    const langCode = body.target_lang;

    const prompt = `You are a world-class sign language interpreter and lexicographer. Generate a rich dictionary entry for the Arabic word below.

Word (Arabic): ${body.ar_word}
Sign system: ${sys}
Display language: ${lang} (BCP-47: ${langCode})

Return ONLY minified JSON in this exact shape (all text fields in ${lang} unless marked):
{
  "primary": "<the word translated to ${lang}>",
  "phonetic": "<short phonetic hint in Latin letters, optional>",
  "description": "<2-3 sentences in ${lang} describing how to perform the sign in ${sys}: handshape, location, movement, orientation>",
  "fingerspelling": [{"letter":"<grapheme in ${lang} script>","sign":"<short handshape hint>"}],
  "synonyms": ["<2-4 synonyms in ${lang}>"],
  "example_sentence": "<one short example sentence using the word in ${lang}>",
  "example_translation_ar": "<Arabic translation of the example>",
  "translations": {
    "en": "...", "fr": "...", "es": "...", "de": "...", "tr": "...", "zh": "...", "ru": "...", "ja": "..."
  },
  "tips": "<one tip in ${lang} about common confusion or context>"
}

Keep fingerspelling array empty [] if the word has a standard whole-word sign and is not a proper noun/number.`;

    const raw = await aiCallWithFallback(prompt, true);
    if (!raw) {
      return new Response(JSON.stringify({ error: "AI providers unavailable" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = parseJson(raw);
    if (!parsed) {
      return new Response(JSON.stringify({ error: "invalid AI JSON" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
