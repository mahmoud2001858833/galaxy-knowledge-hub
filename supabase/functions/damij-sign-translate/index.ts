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
  mode: "translate" | "correct" | "text2sign" | "correct_translate";
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
    return `Translate from ${src} to ${tgt} (${tgtCode}). Output ONLY the ${tgt} translation, native script, no quotes/labels. If already in ${tgt}, return it cleaned.\n\nSource: ${b.text}`;
  }
  if (b.mode === "correct") {
    const lang = b.langName ?? b.lang ?? "Arabic";
    return `Rewrite this fragmented sign-recognizer output as ONE short fluent sentence in ${lang} only. No commentary. No quotes.\n\nText: ${b.text}`;
  }
  if (b.mode === "correct_translate") {
    const src = b.sourceLangName ?? b.sourceLang ?? "Arabic";
    const srcCode = b.sourceLang ?? "ar";
    const tgt = b.targetLangName ?? b.targetLang ?? "English";
    const tgtCode = b.targetLang ?? "en";
    return `You receive fragmented words from a sign-language recognizer in ${src}.
1) Rewrite as ONE short fluent sentence in ${src}.
2) Translate that sentence into ${tgt}.
Return ONLY minified JSON: {"corrected":"...","translated":"..."}
- "corrected" in ${src} (${srcCode}), "translated" in ${tgt} (${tgtCode}), native scripts only.
- If ${src}==${tgt}, set translated = corrected.

Text: ${b.text}`;
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

async function callGemini(prompt: string, apiKey: string, json: boolean, heavy: boolean, model: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body: any = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: json ? 0.1 : 0.3,
      maxOutputTokens: heavy ? 2048 : 256,
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

    // Try keys in order; fall back if a key is invalid / rate-limited / quota exhausted.
    const keys = [
      Deno.env.get("SIGN_TRANSLATE_GEMINI_KEY"),
      Deno.env.get("GEMINI_API_KEY"),
      Deno.env.get("GOOGLE_AI_API_KEY"),
      Deno.env.get("GEMINI_API_KEY_NEW"),
    ].filter((k): k is string => !!k && k.length > 10);

    if (keys.length === 0) {
      return new Response(JSON.stringify({ error: "No Gemini API key configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isJson = body.mode === "text2sign" || body.mode === "correct_translate";
    const heavy = body.mode === "text2sign";
    const prompt = buildPrompt(body);

    let r: Response | null = null;
    let lastErrText = "";
    for (let i = 0; i < keys.length; i++) {
      r = await callGemini(prompt, keys[i], isJson, heavy);
      if (r.ok) break;
      lastErrText = await r.text().catch(() => "");
      console.error(`Gemini key #${i} failed`, r.status, lastErrText.slice(0, 300));
      // Only fall through to next key on auth/quota/rate errors
      if (![400, 401, 403, 429, 500, 503].includes(r.status)) break;
      r = null;
    }

    if (!r || !r.ok) {
      const status = r?.status ?? 500;
      const msg = status === 429
        ? "تم تجاوز حد الطلبات لجميع المفاتيح. حاول بعد دقيقة."
        : `Gemini error ${status}: ${lastErrText.slice(0, 200)}`;
      return new Response(JSON.stringify({ error: msg }), {
        status: status === 429 ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
