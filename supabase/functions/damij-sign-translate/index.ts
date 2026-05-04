// Damij Sign Translator AI helper.
// Modes:
//   - "translate": translate Arabic text to a target language.
//   - "correct"  : grammatically correct + clean an Arabic gesture-stream sentence.
//   - "text2sign": describe how to perform the given text in a chosen sign system.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  text: string;
  mode: "translate" | "correct" | "text2sign";
  targetLang?: string;   // BCP-47 e.g. "en-US"
  targetLangName?: string; // human readable e.g. "English (US)"
  signSystem?: string;   // e.g. "ASL"
}

const buildPrompt = (b: Body) => {
  if (b.mode === "translate") {
    return `Translate the following Arabic text into ${b.targetLangName ?? b.targetLang} faithfully and naturally. Return ONLY the translated text, no quotes, no commentary.\n\nText: ${b.text}`;
  }
  if (b.mode === "correct") {
    return `أنت مدقّق لغوي عربي. لديك تتابع كلمات نُتجت من ترجمة لغة الإشارة وقد تكون مفككة. أعد صياغتها كجملة عربية فصيحة قصيرة وواضحة، دون إضافة معلومات جديدة. أعد فقط النص المصحَّح بدون أي شرح.\n\nالنص: ${b.text}`;
  }
  // text2sign
  return `أنت خبير في لغات الإشارة العالمية. اشرح بإيجاز كيف يؤدي الشخص الجملة التالية بنظام "${b.signSystem ?? "ArSL"}". قسّم الإجابة إلى نقاط مرقّمة، كل نقطة كلمة + الإيماءة المقابلة بشرح حركي مختصر (سطر واحد لكل كلمة). أعد النص فقط دون مقدمات.\n\nالجملة: ${b.text}`;
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

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise linguistic assistant for the Damij inclusive education platform." },
          { role: "user", content: buildPrompt(body) },
        ],
      }),
    });

    if (r.status === 429) {
      return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول بعد دقيقة." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (r.status === 402) {
      return new Response(JSON.stringify({ error: "نفذت رصيد Lovable AI. أضف رصيداً من الإعدادات." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!r.ok) {
      const t = await r.text();
      console.error("AI error", r.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const result = data?.choices?.[0]?.message?.content?.trim() ?? "";
    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
