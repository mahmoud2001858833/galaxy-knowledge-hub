// Edge function: damij-dict-lookup
// Returns rich detail for a single Arabic word in a chosen sign system + display language.
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

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise multilingual sign-language lexicographer." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (r.status === 429) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (r.status === 402) {
      return new Response(JSON.stringify({ error: "credits_exhausted" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!r.ok) {
      const t = await r.text();
      console.error("AI lookup error", r.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() ?? "{}";
    let parsed: any = null;
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
    }
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
