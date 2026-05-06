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
  targetLang?: string;
  targetLangName?: string;
  signSystem?: string;
  // text2sign extras
  outputLang?: string;       // BCP-47 of the language to render the sign translation in
  outputLangName?: string;   // human readable name
}

const buildPrompt = (b: Body) => {
  if (b.mode === "translate") {
    const lang = b.targetLangName ?? b.targetLang ?? "English";
    const code = b.targetLang ?? "en";
    return `You are a professional translator. Translate the Arabic text below into ${lang} (BCP-47: ${code}).\n\nSTRICT RULES:\n- Output ONLY in ${lang}. Do NOT reply in Arabic unless ${lang} is Arabic.\n- Use the native script of ${lang}.\n- Keep it natural, faithful, concise. No quotes, no commentary, no labels.\n\nArabic text: ${b.text}\n\n${lang} translation:`;
  }
  if (b.mode === "correct") {
    return `أنت مدقّق لغوي عربي. لديك تتابع كلمات نُتجت من ترجمة لغة الإشارة وقد تكون مفككة. أعد صياغتها كجملة عربية فصيحة قصيرة وواضحة، دون إضافة معلومات جديدة. أعد فقط النص المصحَّح بدون أي شرح.\n\nالنص: ${b.text}`;
  }
  // text2sign: structured JSON
  const lang = b.outputLangName ?? b.outputLang ?? "Arabic";
  const langCode = b.outputLang ?? "ar";
  const sys = b.signSystem ?? "ArSL";
  const HANDSHAPES = [
    // ASL fingerspelling
    "asl_a","asl_b","asl_c","asl_d","asl_e","asl_f","asl_g","asl_h","asl_i","asl_j",
    "asl_k","asl_l","asl_m","asl_n","asl_o","asl_p","asl_q","asl_r","asl_s","asl_t",
    "asl_u","asl_v","asl_w","asl_x","asl_y","asl_z",
    // primitives
    "open_palm","flat_hand","flat_hand_down","fist","thumbs_up","thumbs_down",
    "point","point_up","point_down","point_right","point_left",
    "victory","three","four","five","one","two",
    "ok","love","call_me","rock","pinch","claw","bent_hand","spread_hand",
    "prayer","wave","finger_gun","crossed_fingers",
  ].join(", ");
  const MOVEMENTS = "none, tap, wave_h, wave_v, circle, push, pull, up, down";
  return `You are an elite professional sign language interpreter and lexicographer with deep, authoritative knowledge of every major sign language system in the world, including but not limited to: ASL (American), BSL (British), ArSL (Arabic Unified), LSF (French), DGS (German), LSE (Spanish), LIS (Italian), JSL (Japanese), KSL (Korean), CSL (Chinese), Auslan (Australian), NZSL, Libras (Brazilian), LSM (Mexican), ISL (Indian), PSL (Pakistani), TSL (Turkish), RSL (Russian), and International Sign (IS).

ABSOLUTE PRIORITY: Use the AUTHENTIC, NATIVE sign(s) of the "${sys}" system for EVERY word. Do NOT confuse systems — ASL ≠ BSL ≠ ArSL. Each system has its own grammar, handshapes, locations, movements, and non-manual markers; honor them faithfully.

TASK: Convert the user's text into a professional step-by-step sign language guide using the "${sys}" sign system. Render ALL textual fields in ${lang} (BCP-47: ${langCode}).

PROCEDURE:
1. If the input is not in ${lang}, FIRST translate it accurately to ${lang} preserving meaning, register and tone. Strip filler particles when sign-language grammar of ${sys} normally omits them (e.g., articles in ASL).
2. Re-order the sequence following ${sys} sign grammar (Topic-Comment, time markers first, etc.) when it differs significantly from spoken ${lang}.
3. Split the resulting sequence into individual SIGNS (each entry below = one sign, in performance order).
4. For EACH sign, produce:
   - "word": the gloss in ${lang} script (UPPER CASE convention is fine for English-style glosses).
   - "handshape_id": MUST be exactly ONE of: ${HANDSHAPES}. Pick the closest visual primitive to the actual handshape used in ${sys}.
   - "movement": MUST be exactly ONE of: ${MOVEMENTS}. The principal motion of the sign in ${sys}.
   - "two_handed": boolean — true if the sign uses both hands in ${sys}.
   - "sign_emoji": single best-matching emoji (✋ 👆 👍 🤟 🙏 👋 🤲 🫳 🫶 🤝 ✊ 👌 ✌️ 👏 🤜 🤛 etc.).
   - "description": ONE concise line in ${lang} describing handshape + location + movement + (optional) facial expression, exactly as performed in ${sys}.
   - "fingerspelling": include ONLY if the word is a proper noun, number, brand, or has no standard sign in ${sys}. Provide the manual alphabet of ${sys} (or its closest equivalent) as an array of {"letter": <single grapheme in ${lang} script>, "handshape_id": one of the asl_* ids that visually matches, "sign": short tag/emoji}. If a standard sign exists, return [].
5. Also return "alphabet_chart": one entry per UNIQUE letter that appears in the translated sentence (in ${lang} script), using the manual alphabet of ${sys}: {"letter", "handshape_id" (closest asl_* primitive), "sign" (short ${lang} description of the handshape in ${sys}), "emoji"}.
6. Coverage guarantee: NEVER skip a token. If you genuinely don't know the sign, fall back to fingerspelling for that token.
7. Cultural fidelity: respect the regional dialect (e.g., for ArSL prefer the Unified Arab Sign Dictionary; for BSL use two-handed manual alphabet; for ASL use one-handed; for JSL respect kanji-based signs; for CSL use Chinese conventions, etc.).

OUTPUT FORMAT — return ONLY valid minified JSON, no markdown, no commentary:
{
  "translated_text": "<full translated sentence in ${lang}>",
  "language": "${langCode}",
  "sign_system": "${sys}",
  "words": [ { "word": "...", "handshape_id": "...", "movement": "...", "two_handed": false, "sign_emoji": "...", "description": "...", "fingerspelling": [] } ],
  "alphabet_chart": [ { "letter": "...", "handshape_id": "...", "sign": "...", "emoji": "..." } ]
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
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a precise linguistic assistant for the Damij inclusive education platform." },
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
