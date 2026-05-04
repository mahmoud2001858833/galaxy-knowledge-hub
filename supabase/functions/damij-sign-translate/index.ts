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
  return `You are a world-class sign language interpreter expert in 100+ sign systems including ASL, BSL, ArSL, LSF, DGS, JSL, CSL, Auslan, ISL, LSE, and many more.

TASK: Convert the user's text into a professional step-by-step sign language guide using the "${sys}" sign system. Render ALL textual fields in ${lang} (BCP-47: ${langCode}).

PROCEDURE:
1. If the input is not in ${lang}, FIRST translate it accurately to ${lang}, preserving meaning and tone.
2. Split the translated sentence into individual words (in order).
3. For EACH word, produce:
   - "word": the word in ${lang} script
   - "sign_emoji": a single best-matching emoji that visually represents the sign motion (✋ 👆 👍 🤟 🙏 👋 🤲 🫳 🫶 🤝 ✊ 👌 ✌️ etc.)
   - "description": a concise one-line motion description in ${lang} (how to perform the sign in ${sys})
   - "fingerspelling": ONLY include if the word is a proper noun, number, or has no standard sign — array of {"letter": <single grapheme in ${lang} script>, "sign": <emoji or short tag>}. Otherwise return [].
4. Also produce a top-level "alphabet_chart" array of EACH unique letter in the translated sentence (in ${lang} script) with {"letter", "sign": short description of the handshape in ${sys}, "emoji"}.

OUTPUT FORMAT — return ONLY valid minified JSON, no markdown, no commentary:
{
  "translated_text": "<full translated sentence in ${lang}>",
  "language": "${langCode}",
  "sign_system": "${sys}",
  "words": [ { "word": "...", "sign_emoji": "...", "description": "...", "fingerspelling": [] } ],
  "alphabet_chart": [ { "letter": "...", "sign": "...", "emoji": "..." } ]
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
