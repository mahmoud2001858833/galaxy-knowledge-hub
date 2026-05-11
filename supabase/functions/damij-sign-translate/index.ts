// Damij Sign Translator AI helper — DIRECT Gemini API (no Lovable Gateway).
// Modes:
//   - "translate": translate text from sourceLang to targetLang.
//   - "correct"  : grammatically correct + clean a gesture-stream sentence.
//   - "text2sign": professional structured text-to-sign translation in any language.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  text: string;
  mode: "translate" | "correct" | "text2sign";
  sourceLang?: string;
  sourceLangName?: string;
  targetLang?: string;
  targetLangName?: string;
  lang?: string;
  langName?: string;
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

ABSOLUTE RULES:
1. Use ONLY authentic native signs of "${sys}". Do NOT mix systems.
2. "translated_text" and every "word" / "description" MUST be in ${lang} (BCP-47: ${langCode}) ONLY.
3. If unsure of an authentic sign for a token, set "known": false and explain in "description". Do NOT invent.
4. NEVER fall back to fingerspelling letters. NEVER produce a per-letter alphabet.
5. NEVER use emojis as a stand-in for a sign.
6. Re-order tokens to follow the natural grammar of "${sys}".

Each sign MUST include: word, handshape_id (one of: ${HANDSHAPES}), movement (one of: ${MOVEMENTS}), two_handed (bool), description, known (bool), fingerspelling: [], sign_emoji: "".

Also return: translated_text, language: "${langCode}", sign_system: "${sys}", alphabet_chart: [].

Return ONLY minified JSON:
{"translated_text":"...","language":"${langCode}","sign_system":"${sys}","words":[{"word":"...","handshape_id":"...","movement":"...","two_handed":false,"sign_emoji":"","description":"...","known":true,"fingerspelling":[]}],"alphabet_chart":[]}

Input text: ${b.text}`;
};

async function callGemini(prompt: string, apiKey: string, json: boolean) {
  const model = json ? "gemini-2.5-pro" : "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body: any = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: json ? 0.1 : 0.4,
    },
  };
  if (json) body.generationConfig.responseMimeType = "application/json";

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r;
}

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

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isJson = body.mode === "text2sign";
    const r = await callGemini(buildPrompt(body), apiKey, isJson);

    if (r.status === 429) {
      return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول بعد دقيقة." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!r.ok) {
      const t = await r.text();
      console.error("Gemini error", r.status, t);
      return new Response(JSON.stringify({ error: `Gemini error ${r.status}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const raw: string =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("").trim() ?? "";

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
