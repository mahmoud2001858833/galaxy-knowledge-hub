// Braille OCR — converts a photo/screenshot of Braille into text using
// direct Google Gemini API only.
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
  return `You are a world-class Braille OCR + linguistics engine. The attached image may be a close photo, a scan, or a screenshot that contains a Braille page/panel somewhere inside it.

IMPORTANT VISUAL TASK:
- Search the ENTIRE image for Braille dot cells, including cropped pages, embedded previews inside an app screenshot, rotated/tilted photos, low-contrast embossed dots, or Unicode Braille characters.
- Ignore browser chrome, chat UI, buttons, captions, and normal printed/digital text unless they help infer language.
- If ANY Braille cells are visible, decode the visible Braille region and set "is_braille": true, even if the image also contains non-Braille UI.
- Set "is_braille": false ONLY when there are no visible Braille cells/dot patterns anywhere in the image.
- If the image is not Braille, write the "notes" field in Arabic and leave "text" empty.

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

Cap "cells" to first 200. Notes must be Arabic unless ${langCode} is explicitly a non-Arabic UI language.`;
};

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

const makeEmptyResult = (body: Body, notes: string) => ({
  is_braille: false,
  language: body.language ?? "ar",
  grade: body.grade ?? 1,
  confidence: 0,
  lines: [],
  text: "",
  cells: [],
  notes,
});

const normalizeResult = (parsed: any, body: Body) => {
  const out = parsed && typeof parsed === "object" ? parsed : {};
  out.is_braille = out.is_braille !== false;
  out.language = typeof out.language === "string" ? out.language : (body.language ?? "ar");
  out.grade = out.grade === 2 ? 2 : 1;
  out.confidence = Number.isFinite(Number(out.confidence))
    ? Math.max(0, Math.min(100, Math.round(Number(out.confidence))))
    : 0;
  out.text = typeof out.text === "string" ? out.text : "";
  out.lines = Array.isArray(out.lines) ? out.lines.map(String) : (out.text ? out.text.split(/\r?\n/) : []);
  out.cells = Array.isArray(out.cells) ? out.cells.slice(0, 200) : [];
  out.notes = typeof out.notes === "string" ? out.notes : "";
  if (out.is_braille === false && !out.notes) out.notes = "لم تظهر خلايا بريل واضحة داخل الصورة.";
  return out;
};

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

    const geminiKey =
      Deno.env.get("BRAILLE_GEMINI_API_KEY") ||
      Deno.env.get("GEMINI_API_KEY") ||
      Deno.env.get("GOOGLE_AI_API_KEY");

    if (!geminiKey) {
      return new Response(JSON.stringify({
        result: makeEmptyResult(body, "مفتاح Gemini الخاص بتحويل صور بريل غير مهيأ."),
        error: "missing_gemini_key",
        fallback: true,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = buildPrompt(body);

    let raw = "";
    let lastError = "";

    // Primary: direct Gemini (project rule: do not use Lovable AI Gateway)
    // Speed priority: fastest model first.
    const models = ["gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"];
    for (const mdl of models) {
      try {
        raw = await geminiVision(mdl, geminiKey, prompt, mime, b64, true);
        if (raw && raw.trim()) break;
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        console.warn("gemini model failed", mdl, lastError);
      }
    }

    if (!raw) {
      return new Response(JSON.stringify({
        result: makeEmptyResult(body, "تعذّر تحليل الصورة حالياً. جرّب صورة أوضح أو أعد المحاولة."),
        error: "ai_unavailable",
        detail: lastError,
        fallback: true,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let parsed: any = null;
    try { parsed = JSON.parse(raw); }
    catch {
      const m2 = raw.match(/\{[\s\S]*\}/);
      if (m2) { try { parsed = JSON.parse(m2[0]); } catch {} }
    }
    if (!parsed) {
      return new Response(JSON.stringify({
        result: makeEmptyResult(body, "عاد التحليل بصيغة غير مفهومة. أعد المحاولة بصورة أوضح."),
        error: "invalid_ai_json",
        raw: raw.slice(0, 500),
        fallback: true,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    parsed = normalizeResult(parsed, body);

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
    return new Response(JSON.stringify({
      result: makeEmptyResult({ imageBase64: "" }, "حدث خطأ أثناء تحليل الصورة. أعد المحاولة بصورة أوضح."),
      error: e instanceof Error ? e.message : "unknown",
      fallback: true,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
