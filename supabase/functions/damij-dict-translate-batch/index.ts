import { geminiFetch } from "../_shared/gemini-shim.ts";
// Edge function: damij-dict-translate-batch
// Translates a list of Arabic words to a target language in one AI call.
// Returns: { translations: { [ar_word]: translated_word } }
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  words: string[];
  targetLang: string;       // BCP-47
  targetLangName?: string;  // human readable
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!Array.isArray(body?.words) || body.words.length === 0 || !body?.targetLang) {
      return new Response(JSON.stringify({ error: "missing words or targetLang" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If target is Arabic, identity map
    if (body.targetLang.startsWith("ar")) {
      const out: Record<string, string> = {};
      for (const w of body.words) out[w] = w;
      return new Response(JSON.stringify({ translations: out }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = "shim-key";
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langName = body.targetLangName ?? body.targetLang;

    // Process in chunks of 60 to stay safe
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

      const r = await geminiFetch("ai-shim", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a precise multilingual translator." },
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
        console.error("AI batch error", r.status, t);
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
