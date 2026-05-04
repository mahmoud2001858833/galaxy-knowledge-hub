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
  const grade = b.grade ?? 1;
  return `You are a world-class Braille OCR engine. The attached image is a photograph or scan of a printed/embossed Braille page.

TASK:
1. Detect every Braille cell (6-dot, possibly 8-dot) on the page in correct reading order (left-to-right, top-to-bottom).
2. Decode the cells using ${lang} Braille (BCP-47: ${b.language ?? "ar"}) at Grade ${grade} ${grade === 2 ? "(contracted/literary)" : "(uncontracted)"}.
3. Reconstruct the text faithfully, preserving line breaks, spaces and punctuation.
4. If the photo is skewed, blurry, partially cut, or low contrast, do your best and report a confidence score.
5. If the page is NOT Braille, set "is_braille": false and explain briefly.

OUTPUT — return ONLY minified JSON (no markdown fences):
{
  "is_braille": true,
  "language": "${b.language ?? "ar"}",
  "grade": ${grade},
  "confidence": 0-100,
  "lines": ["line 1", "line 2"],
  "text": "<full reconstructed text in ${lang} with newlines>",
  "cells": [ { "line": 1, "index": 1, "dots": "1,3,5", "char": "ل" } ],
  "notes": "<brief Arabic quality notes>"
}

Cap "cells" to the first 200 entries. "text" and "lines" must be complete.`;
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
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
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
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    return new Response(JSON.stringify({ result: parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
