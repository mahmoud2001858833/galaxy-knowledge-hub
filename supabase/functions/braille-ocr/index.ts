import { geminiFetch } from "../_shared/gemini-shim.ts";
// Braille OCR — converts a photo of a Braille page into text using
// Gemini vision, with Lovable AI Gateway fallback on quota errors.
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
- For Arabic: use the official Arabic Braille (LBU/UNESCO 2013) — 28 letters + Tashkeel + Hamza variants + Arabic-Indic digits with the number sign ⠼.
- For English/French/Spanish/German: apply UEB (English) or the relevant national contracted code at Grade ${grade}.
- For Russian/Greek/Cyrillic/CJK: use the standard national Braille code for ${lang}.
- Recognize the number indicator (⠼), capital indicator (⠠), italic/letter signs, and Grade-2 contractions (whole-word, group-sign, short-form).

PIPELINE (perform internally, do NOT output the steps):
1. Auto-rotate / deskew the page mentally; identify rows and Braille cells with consistent dot spacing.
2. Detect every cell (6-dot, possibly 8-dot) in correct reading order (left-to-right, top-to-bottom; right-to-left output is still encoded LTR in Braille — decode as LTR cells then reconstruct ${lang} text in its natural script direction).
3. Decode each cell using ${lang} Braille (BCP-47: ${langCode}) at Grade ${grade} ${grade === 2 ? "(contracted/literary — fully expand contractions)" : "(uncontracted/literal)"}.
4. POST-PROCESS the decoded text using your knowledge of ${lang}:
   - Fix obvious cell-misreads using vocabulary, morphology, spelling, and surrounding context.
   - Restore correct word boundaries and punctuation.
   - Reattach diacritics/Tashkeel where unambiguous (Arabic).
   - Preserve original line breaks unless they break a single word across two lines (then merge).
5. If multiple readings are possible, pick the one that yields a grammatical, well-spelled ${lang} sentence.
6. If the page is NOT Braille, set "is_braille": false and explain briefly in Arabic.

QUALITY RULES:
- The "text" field MUST be clean, natural, well-punctuated ${lang} — NOT a transliteration and NOT raw cell glyphs.
- Do not invent content not implied by the dots; when truly illegible, write [غير واضح] in Arabic context (or [unclear] otherwise).
- Confidence reflects YOUR estimate of the text accuracy after post-processing (0–100).

OUTPUT — return ONLY minified JSON (no markdown fences):
{
  "is_braille": true,
  "language": "${langCode}",
  "grade": ${grade},
  "confidence": 0-100,
  "lines": ["line 1", "line 2"],
  "text": "<full reconstructed ${lang} text with newlines>",
  "cells": [ { "line": 1, "index": 1, "dots": "1,3,5", "char": "ل" } ],
  "notes": "<brief Arabic notes about image quality / corrections applied>"
}

Cap "cells" to the first 200 entries. "text" and "lines" must be complete and human-readable.`;
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

    const directKey = Deno.env.get("BRAILLE_GEMINI_API_KEY");
    const lovableKey = "shim-key";
    if (!directKey && !lovableKey) {
      return new Response(JSON.stringify({ error: "no API key configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let raw = "";
    let lastError = "";

    // 1) Try direct Gemini first
    if (directKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${directKey}`;
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: buildPrompt(body) },
                { inline_data: { mime_type: mime, data: b64 } },
              ],
            }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
          }),
        });
        if (r.ok) {
          const data = await r.json();
          raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        } else {
          lastError = `gemini ${r.status}`;
          console.error("Gemini direct failed", r.status, (await r.text()).slice(0, 300));
        }
      } catch (e) {
        lastError = `gemini ex ${e instanceof Error ? e.message : ""}`;
        console.error("Gemini direct exception", e);
      }
    }

    // 2) Fallback to Lovable Gateway
    if (!raw && lovableKey) {
      const r = await geminiFetch("ai-shim", {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are a precise Braille OCR engine for the Damij inclusive education platform." },
            { role: "user", content: [
              { type: "text", text: buildPrompt(body) },
              { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
            ] },
          ],
        }),
      });
      if (r.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول بعد دقيقة." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (r.status === 402) {
        return new Response(JSON.stringify({ error: "نفذ رصيد Lovable AI. أضف رصيداً." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (!r.ok) {
        const t = await r.text();
        console.error("Gateway error", r.status, t.slice(0, 300));
        return new Response(JSON.stringify({ error: "OCR gateway error", detail: lastError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const data = await r.json();
      raw = data?.choices?.[0]?.message?.content ?? "";
    }

    if (!raw) {
      return new Response(JSON.stringify({ error: "OCR returned no content", detail: lastError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    // ── 3) Refinement pass: polish the decoded text using linguistic context ──
    if (parsed?.is_braille !== false && typeof parsed?.text === "string" && parsed.text.trim()) {
      try {
        const langName = body.languageName ?? body.language ?? "Arabic";
        const refinePrompt = `أنت مدقّق لغوي خبير في ${langName}. النص التالي ناتج عن OCR لصفحة بريل وقد يحتوي أخطاء طفيفة في الإملاء، التشكيل، الفواصل، أو حدود الكلمات.
أعد كتابته كنص ${langName} طبيعي وصحيح لغوياً، مع:
- الحفاظ التام على المعنى وعدم الإضافة أو الحذف.
- الحفاظ على فواصل الأسطر الأصلية ما لم تكسر كلمة واحدة.
- تصحيح الإملاء وإصلاح الفواصل وعلامات الترقيم.
- إعادة وصل الكلمات المكسورة وفك الكلمات الملتصقة.
- إعادة التشكيل (في العربية) فقط حين يكون واضحاً من السياق.

أعد النص النظيف فقط، بدون أي شرح أو علامات اقتباس أو سور تعليمات.

النص:
${parsed.text}

النص المنقّح:`;

        if (lovableKey) {
          const rr = await geminiFetch("ai-shim", {
            method: "POST",
            headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: `Output only the polished ${langName} text. No prefixes, no quotes, no explanations.` },
                { role: "user", content: refinePrompt },
              ],
            }),
          });
          if (rr.ok) {
            const jj = await rr.json();
            const refined = (jj?.choices?.[0]?.message?.content ?? "").trim()
              .replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();
            if (refined && refined.length > 0) {
              parsed.refined_text = refined;
              parsed.original_text = parsed.text;
              parsed.text = refined;
              parsed.lines = refined.split(/\r?\n/);
            }
          } else {
            console.warn("refine pass failed", rr.status);
          }
        }
      } catch (e) {
        console.warn("refine pass exception", e);
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
