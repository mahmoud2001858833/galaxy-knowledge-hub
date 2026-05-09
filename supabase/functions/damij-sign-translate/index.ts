// Damij Sign Translator AI helper.
// Modes:
//   - "translate": translate Arabic text to a target language.
//   - "correct"  : grammatically correct + clean an Arabic gesture-stream sentence.
//   - "text2sign": professional structured text-to-sign translation in any language.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  text: string;
  mode: "translate" | "correct" | "text2sign";
  // translate
  sourceLang?: string;
  sourceLangName?: string;
  targetLang?: string;
  targetLangName?: string;
  // correct
  lang?: string;
  langName?: string;
  // text2sign
  signSystem?: string;
  outputLang?: string;
  outputLangName?: string;
}

const buildPrompt = (b: Body) => {
  if (b.mode === "translate") {
    const tgt = b.targetLangName ?? b.targetLang ?? "English";
    const tgtCode = b.targetLang ?? "en";
    const src = b.sourceLangName ?? b.sourceLang ?? "Arabic";
    return `You are a professional translator. Translate the text from ${src} into ${tgt} (BCP-47: ${tgtCode}).\n\nSTRICT RULES:\n- Output ONLY in ${tgt}. Use the native script of ${tgt}.\n- Keep it natural, faithful, concise. No quotes, no commentary, no labels.\n- If the source text is already in ${tgt}, return it as-is, lightly cleaned.\n\nSource (${src}): ${b.text}\n\n${tgt} translation:`;
  }
  if (b.mode === "correct") {
    const lang = b.langName ?? b.lang ?? "Arabic";
    return `You are a professional proofreader for ${lang}. The text below is a stream of words produced by a sign-language gesture recognizer and may be fragmented. Rewrite it as ONE short, natural, fluent sentence in ${lang} ONLY, without adding new information. Output ONLY the corrected sentence — no explanation, no quotes, no language labels.\n\nText: ${b.text}`;
  }
  // text2sign: structured JSON — REAL signs only, no emoji/letter fallbacks.
  const lang = b.outputLangName ?? b.outputLang ?? "Arabic";
  const langCode = b.outputLang ?? "ar";
  const sys = b.signSystem ?? "ArSL";
  const HANDSHAPES = [
    "open_palm","flat_hand","flat_hand_down","fist","thumbs_up","thumbs_down",
    "point","point_up","point_down","point_right","point_left",
    "victory","three","four","five","one","two",
    "ok","love","call_me","rock","pinch","claw","bent_hand","spread_hand",
    "prayer","wave","finger_gun","crossed_fingers",
  ].join(", ");
  const MOVEMENTS = "none, tap, wave_h, wave_v, circle, push, pull, up, down";
  return `You are an elite professional sign-language interpreter for "${sys}". Convert the user's text into a step-by-step REAL sign-language performance guide in "${sys}".

ABSOLUTE RULES (must obey, no exceptions):
1. Use ONLY the authentic native signs of "${sys}". Do NOT mix with other sign systems.
2. "translated_text" and every "word" / "description" MUST be in ${lang} (BCP-47: ${langCode}) ONLY. If the input is in another language, FIRST translate it accurately to ${lang}, then build the gloss sequence from the ${lang} translation.
3. Verify every gloss preserves the meaning of the original input. If unsure of an authentic sign for a token in "${sys}", set "known": false and explain in "description" — do NOT invent or fingerspell.
4. NEVER fall back to fingerspelling individual letters. NEVER produce a per-letter alphabet.
5. NEVER use emojis as a stand-in for a sign.
6. Re-order tokens to follow the natural grammar of "${sys}" (Topic-Comment, time first, etc.) and drop articles/fillers when "${sys}" normally omits them.

For EACH sign, return:
- "word": the gloss in ${lang} script.
- "handshape_id": EXACTLY ONE of: ${HANDSHAPES}.
- "movement": EXACTLY ONE of: ${MOVEMENTS}.
- "two_handed": boolean.
- "description": ONE concise sentence in ${lang}: handshape + location + movement.
- "known": boolean.
- "fingerspelling": ALWAYS [].
- "sign_emoji": ALWAYS "".

Also return:
- "translated_text": the full sentence in ${lang}.
- "alphabet_chart": ALWAYS [].

OUTPUT FORMAT — return ONLY valid minified JSON, no markdown, no commentary:
{
  "translated_text": "...",
  "language": "${langCode}",
  "sign_system": "${sys}",
  "words": [ { "word": "...", "handshape_id": "...", "movement": "...", "two_handed": false, "sign_emoji": "", "description": "...", "known": true, "fingerspelling": [] } ],
  "alphabet_chart": []
}

Input text: ${b.text}`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body?.text || !body?.mode) {
      return new Response(JSON.stringify({ error: "missing text or mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isJson = body.mode === "text2sign";
    const payload: any = {
      model: isJson ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a precise multilingual linguistic and sign-language expert assistant for the Damij inclusive education platform." },
        { role: "user", content: buildPrompt(body) },
      ],
    };
    if (isJson) payload.response_format = { type: "json_object" };

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (r.status === 429) {
      return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول بعد دقيقة." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (r.status === 402) {
      return new Response(JSON.stringify({ error: "نفذت رصيد Lovable AI. أضف رصيداً من الإعدادات." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!r.ok) {
      const t = await r.text();
      console.error("AI error", r.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() ?? "";

    if (isJson) {
      let parsed: any = null;
      try { parsed = JSON.parse(raw); } catch {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
      }
      if (!parsed) {
        return new Response(JSON.stringify({ error: "AI returned invalid JSON", raw }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ result: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result: raw }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
