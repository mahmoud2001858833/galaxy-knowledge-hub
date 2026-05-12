// Braille OCR — converts a photo of a Braille page into text using
// direct Google Gemini API only (Lovable AI is forbidden).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  imageBase64: string;
  mimeType?: string;
  language?: string;
  languageName?: string;
  grade?: 1 | 2;
}

const buildPrompt = (b: Body) => {
  const lang = b.languageName ?? b.language ?? "Arabic";
  const langCode = b.language ?? "ar";
  const grade = b.grade ?? 1;
  return `You are a world-class Braille OCR + linguistics engine. The attached image is a photograph or scan of a printed/embossed Braille page.

CONTEXT — Braille standards to apply:
- For Arabic: official Arabic Braille (LBU/UNESCO 2013) — 28 letters + Tashkeel + Hamza variants + Arabic-Indic digits with the number sign ⠼.
- For English/French/Spanish/German: UEB or relevant national contracted code at Grade ${grade}.
- For Russian/Greek/Cyrillic/CJK: standard national Braille code for ${lang}.
- Recognize the number indicator (⠼), capital indicator (⠠), italic/letter signs, and Grade-2 contractions.

PIPELINE (perform internally):
1. Auto-rotate / deskew the page mentally; identify rows and Braille cells.
2. Detect every cell (6/8-dot) in correct reading order (LTR cells; reconstruct ${lang} text in its natural script direction).
3. Decode each cell using ${lang} Braille (${langCode}) at Grade ${grade} ${grade === 2 ? "(contracted — fully expand contractions)" : "(uncontracted)"}.
4. Post-process: fix misreads using vocabulary/morphology, restore word boundaries, punctuation, and Tashkeel.
5. If multiple readings possible, pick the most grammatical one.
6. If page is NOT Braille, set "is_braille": false.

QUALITY RULES:
- "text" MUST be clean, natural, well-punctuated ${lang}.
- When truly illegible, write [غير واضح] (Arabic) or [unclear].
- Confidence is your accuracy estimate after post-processing (0–100).

OUTPUT — return ONLY minified JSON (no markdown):
{"is_braille":true,"language":"${langCode}","grade":${grade},"confidence":0,"lines":["line"],"text":"...","cells":[{"line":1,"index":1,"dots":"1,3,5","char":"ل"}],"notes":""}

Cap "cells" to first 200.`;
};

async function lovableVision(model: string, lovableKey: string, prompt: string, mime: string, b64: string, json = true): Promise<string> {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "user", content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
        ] },
      ],
      ...(json ? { response_format: { type: "json_object" } } : {}),
      temperature: 0.1,
      max_tokens: 8192,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`lovable ${model} ${r.status}: ${t.slice(0, 200)}`);
  }
  const data = await r.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

async function lovableText(model: string, lovableKey: string, prompt: string): Promise<string> {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 4096,
    }),
  });
  if (!r.ok) throw new Error(`lovable refine ${model} ${r.status}`);
  const data = await r.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

async function geminiVision(model: string, key: string, prompt: string, mime: string, b64: string, json = true) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: b64 } }] }],
      generationConfig: json
        ? { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 8192 }
        : { temperature: 0.2, maxOutputTokens: 4096 },
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`${model} ${r.status}: ${t.slice(0, 200)}`);
  }
  const data = await r.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function geminiText(model: string, key: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    }),
  });
  if (!r.ok) throw new Error(`refine ${model} ${r.status}`);
  const data = await r.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body?.imageBase64) {
      return new Response(JSON.stringify({ error: "missing imageBase64" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let b64 = body.imageBase64;
    let mime = body.mimeType ?? "image/jpeg";
    const m = b64.match(/^data:(.+?);base64,(.*)$/);
    if (m) { mime = m[1]; b64 = m[2]; }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const geminiKey =
      Deno.env.get("BRAILLE_GEMINI_API_KEY") ||
      Deno.env.get("GEMINI_API_KEY") ||
      Deno.env.get("GOOGLE_AI_API_KEY");

    if (!lovableKey && !geminiKey) {
      return new Response(JSON.stringify({ error: "لا يوجد مفتاح ذكاء اصطناعي مهيأ" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(body);

    let raw = "";
    let lastError = "";

    // Primary: Lovable AI Gateway (per user request, this is the only function allowed to use it)
    if (lovableKey) {
      const lovModels = ["google/gemini-2.5-pro", "google/gemini-2.5-flash", "google/gemini-3-flash-preview"];
      for (const mdl of lovModels) {
        try {
          raw = await lovableVision(mdl, lovableKey, prompt, mime, b64, true);
          if (raw && raw.trim()) break;
        } catch (e) {
          lastError = e instanceof Error ? e.message : String(e);
          console.warn("lovable model failed", mdl, lastError);
        }
      }
    }

    // Fallback: direct Gemini
    if (!raw && geminiKey) {
      const models = ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"];
      for (const mdl of models) {
        try {
          raw = await geminiVision(mdl, geminiKey, prompt, mime, b64, true);
          if (raw && raw.trim()) break;
        } catch (e) {
          lastError = e instanceof Error ? e.message : String(e);
          console.warn("gemini model failed", mdl, lastError);
        }
      }
    }

    if (!raw) {
      return new Response(JSON.stringify({ error: "تعذّر الاتصال بالذكاء الاصطناعي", detail: lastError }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let parsed: any = null;
    try { parsed = JSON.parse(raw); }
    catch {
      const m2 = raw.match(/\{[\s\S]*\}/);
      if (m2) { try { parsed = JSON.parse(m2[0]); } catch {} }
    }
    if (!parsed) {
      return new Response(JSON.stringify({ error: "AI returned invalid JSON", raw: raw.slice(0, 500) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Refinement pass (optional, best-effort)
    if (parsed?.is_braille !== false && typeof parsed?.text === "string" && parsed.text.trim()) {
      try {
        const langName = body.languageName ?? body.language ?? "Arabic";
        const refinePrompt = `أنت مدقّق لغوي خبير في ${langName}. النص ناتج عن OCR لصفحة بريل.
أعد كتابته كنص ${langName} طبيعي دون تغيير المعنى، مع تصحيح الإملاء والترقيم والتشكيل (إن أمكن) والحفاظ على فواصل الأسطر.
أعد النص النظيف فقط بدون أي شرح.

النص:
${parsed.text}`;
        const refineFn = async () => {
          if (lovableKey) {
            try { return await lovableText("google/gemini-2.5-flash", lovableKey, refinePrompt); }
            catch (e) { console.warn("lovable refine failed:", e); }
          }
          if (geminiKey) return await geminiText("gemini-2.5-flash", geminiKey, refinePrompt);
          return "";
        };
        const refined = (await refineFn())
          .trim().replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();
        if (refined) {
          parsed.original_text = parsed.text;
          parsed.refined_text = refined;
          parsed.text = refined;
          parsed.lines = refined.split(/\r?\n/);
        }
      } catch (e) {
        console.warn("refine pass skipped:", e instanceof Error ? e.message : e);
      }
    }

    return new Response(JSON.stringify({ result: parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
