// Universal Braille Converter
// Modes:
//   - "convert" : convert text → Unicode Braille (Grade 1 deterministic, Grade 2 via AI)
//   - "fetch_url": fetch a URL and return its readable text
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Grade-1 deterministic tables (Unicode Braille U+2800–U+28FF) ──────────
// Latin (English / French / Spanish / German basic letters)
const LATIN: Record<string, string> = {
  a: "⠁", b: "⠃", c: "⠉", d: "⠙", e: "⠑", f: "⠋", g: "⠛", h: "⠓",
  i: "⠊", j: "⠚", k: "⠅", l: "⠇", m: "⠍", n: "⠝", o: "⠕", p: "⠏",
  q: "⠟", r: "⠗", s: "⠎", t: "⠞", u: "⠥", v: "⠧", w: "⠺", x: "⠭",
  y: "⠽", z: "⠵",
};
// Accented Latin (UEB / French / Spanish basics)
const LATIN_ACCENT: Record<string, string> = {
  "à": "⠷", "â": "⠡", "ç": "⠯", "é": "⠿", "è": "⠮", "ê": "⠣", "ë": "⠫",
  "î": "⠩", "ï": "⠻", "ô": "⠹", "œ": "⠪", "ù": "⠾", "û": "⠱", "ü": "⠳",
  "á": "⠷", "í": "⠌", "ó": "⠬", "ú": "⠾", "ñ": "⠻",
  "ä": "⠜", "ö": "⠪", "ß": "⠮",
};
// Arabic letters (Arabic Braille — Authority of the Blind / UNESCO 2013)
const ARABIC: Record<string, string> = {
  "ا": "⠁", "ب": "⠃", "ت": "⠞", "ث": "⠹", "ج": "⠚", "ح": "⠱", "خ": "⠭",
  "د": "⠙", "ذ": "⠮", "ر": "⠗", "ز": "⠵", "س": "⠎", "ش": "⠩", "ص": "⠯",
  "ض": "⠫", "ط": "⠾", "ظ": "⠰", "ع": "⠷", "غ": "⠣", "ف": "⠋", "ق": "⠟",
  "ك": "⠅", "ل": "⠇", "م": "⠍", "ن": "⠝", "ه": "⠓", "و": "⠺", "ي": "⠽",
  "ى": "⠽", "ئ": "⠯", "ؤ": "⠳", "ء": "⠡", "إ": "⠷", "أ": "⠷", "آ": "⠰⠁",
  "ة": "⠡",
  // diacritics (Tashkeel)
  "َ": "⠂", "ِ": "⠆", "ُ": "⠌", "ً": "⠢", "ٍ": "⠦", "ٌ": "⠬", "ْ": "⠈", "ّ": "⠠",
  "ـ": "",
};
// Russian Cyrillic
const RUSSIAN: Record<string, string> = {
  "а": "⠁", "б": "⠃", "в": "⠺", "г": "⠛", "д": "⠙", "е": "⠑", "ё": "⠡",
  "ж": "⠚", "з": "⠵", "и": "⠊", "й": "⠯", "к": "⠅", "л": "⠇", "м": "⠍",
  "н": "⠝", "о": "⠕", "п": "⠏", "р": "⠗", "с": "⠎", "т": "⠞", "у": "⠥",
  "ф": "⠋", "х": "⠓", "ц": "⠉", "ч": "⠟", "ш": "⠱", "щ": "⠳", "ъ": "⠷",
  "ы": "⠮", "ь": "⠾", "э": "⠪", "ю": "⠳", "я": "⠫",
};
// Greek
const GREEK: Record<string, string> = {
  "α": "⠁", "β": "⠃", "γ": "⠛", "δ": "⠙", "ε": "⠑", "ζ": "⠵", "η": "⠓",
  "θ": "⠹", "ι": "⠊", "κ": "⠅", "λ": "⠇", "μ": "⠍", "ν": "⠝", "ξ": "⠭",
  "ο": "⠕", "π": "⠏", "ρ": "⠗", "σ": "⠎", "ς": "⠎", "τ": "⠞", "υ": "⠥",
  "φ": "⠋", "χ": "⠯", "ψ": "⠽", "ω": "⠺",
};
// Numbers (number sign + a-j)
const NUMSIGN = "⠼";
const DIGITS: Record<string, string> = {
  "0": "⠚", "1": "⠁", "2": "⠃", "3": "⠉", "4": "⠙", "5": "⠑",
  "6": "⠋", "7": "⠛", "8": "⠓", "9": "⠊",
  // Arabic-Indic digits
  "٠": "⠚", "١": "⠁", "٢": "⠃", "٣": "⠉", "٤": "⠙", "٥": "⠑",
  "٦": "⠋", "٧": "⠛", "٨": "⠓", "٩": "⠊",
};
const PUNCT: Record<string, string> = {
  ".": "⠲", ",": "⠂", ";": "⠆", ":": "⠒", "?": "⠦", "!": "⠖",
  "'": "⠄", "\"": "⠐⠂", "(": "⠐⠣", ")": "⠐⠜", "-": "⠤", "/": "⠌",
  "؟": "⠦", "،": "⠂", "؛": "⠆", "—": "⠤⠤",
  " ": " ", "\n": "\n", "\t": " ",
};
const CAPSIGN = "⠠";

function isLatinLike(ch: string) { return /[a-zA-ZÀ-ÿœŒßẞ]/.test(ch); }
function isArabic(ch: string) { return /[\u0600-\u06FF]/.test(ch); }
function isCyrillic(ch: string) { return /[\u0400-\u04FF]/.test(ch); }
function isGreek(ch: string) { return /[\u0370-\u03FF]/.test(ch); }
function isDigit(ch: string) { return /[0-9٠-٩]/.test(ch); }

function grade1Convert(text: string): string {
  let out = "";
  let inNumber = false;
  for (const raw of text) {
    const ch = raw;
    if (isDigit(ch)) {
      if (!inNumber) { out += NUMSIGN; inNumber = true; }
      out += DIGITS[ch] || "";
      continue;
    }
    inNumber = false;
    if (isLatinLike(ch)) {
      const lower = ch.toLowerCase();
      const cap = ch !== lower;
      const cell = LATIN[lower] || LATIN_ACCENT[lower] || "";
      if (cell) out += (cap ? CAPSIGN : "") + cell;
      else out += ch;
    } else if (isArabic(ch)) {
      out += ARABIC[ch] ?? "";
    } else if (isCyrillic(ch)) {
      const lower = ch.toLowerCase();
      const cap = ch !== lower;
      const cell = RUSSIAN[lower];
      if (cell) out += (cap ? CAPSIGN : "") + cell;
      else out += ch;
    } else if (isGreek(ch)) {
      out += GREEK[ch.toLowerCase()] ?? ch;
    } else if (PUNCT[ch] !== undefined) {
      out += PUNCT[ch];
    } else if (/\s/.test(ch)) {
      out += ch;
    } else {
      // unknown -> keep
      out += ch;
    }
  }
  return out;
}

// ── Grade 2 (contracted) — uses AI for accuracy ────────────────────────────
async function grade2Convert(text: string, langName: string, langCode: string): Promise<string> {
  const userKey = Deno.env.get("BRAILLE_GEMINI_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  const prompt = `You are an expert in worldwide Braille standards (UEB, Arabic Braille (LBU 2013), French Braille abrégé, Spanish, Russian, etc.).
Convert the following ${langName} (${langCode}) text into CONTRACTED Grade-2 Braille.
Output STRICT RULES:
- Output ONLY Unicode Braille characters in the range U+2800 to U+28FF, plus normal whitespace and line breaks.
- Use the official Grade-2 contractions for ${langName}.
- Preserve line breaks of the input.
- Do NOT include any explanation, prefix, suffix, romanization, code fences, or quotes.

Text:
${text}

Braille:`;

  // Try user-provided Gemini key first (Google AI Studio API)
  if (userKey) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${userKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
          }),
        },
      );
      if (r.ok) {
        const j = await r.json();
        const out = j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (out) return cleanBraille(out);
      } else if (r.status !== 429) {
        console.warn("Gemini direct error", r.status, await r.text());
      }
    } catch (e) { console.warn("Gemini direct failed", e); }
  }

  // Fallback: Lovable AI Gateway
  if (!lovableKey) throw new Error("No AI key available");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "Output only Unicode Braille characters." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (r.status === 429) throw new Error("rate_limited");
  if (r.status === 402) throw new Error("payment_required");
  if (!r.ok) throw new Error("ai_error");
  const j = await r.json();
  const out = j?.choices?.[0]?.message?.content?.trim() ?? "";
  return cleanBraille(out);
}

async function reverseBraille(braille: string, langName: string, langCode: string): Promise<string> {
  const userKey = Deno.env.get("BRAILLE_GEMINI_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  const prompt = `You are a world-class Braille decoding + linguistics engine.

CONTEXT — Braille standards to apply for ${langName} (BCP-47: ${langCode}):
- Arabic: official Arabic Braille (LBU/UNESCO 2013) — 28 letters + Tashkeel + Hamza variants (ء أ إ آ ؤ ئ) + Arabic-Indic digits with the number sign ⠼.
- English: UEB (Unified English Braille). Handle Grade-2 contractions: whole-word signs (the, and, of, for, with, ch, sh, th, wh, ou, st, ar, ed, er, gh, ing…), group-signs, short-form words.
- French: Braille français abrégé (contracted) when applicable.
- Spanish / German / Italian / Portuguese / Russian / Greek / other: use the official national Braille code.
- CJK / Korean: standard national Braille (e.g. Japanese Tenji, Korean Hangul Braille, Mainland Chinese Braille).
- Recognize: number indicator (⠼), capital indicator (⠠), letter sign (⠰), italic/emphasis, and Grade-2 contractions.

PIPELINE (perform internally, do NOT output the steps):
1. Read every Braille cell left-to-right, top-to-bottom.
2. Decode each cell using ${langName} Braille at BOTH Grade-1 (literal) and Grade-2 (contracted); pick the reading that yields a grammatical, well-spelled ${langName} word.
3. Fully expand all Grade-2 contractions into normal words.
4. POST-PROCESS using your knowledge of ${langName}:
   - Restore correct word boundaries and punctuation.
   - Reattach diacritics/Tashkeel (Arabic) where unambiguous.
   - Merge words split across two lines (hyphen at line-end).
   - Use spelling, morphology, and surrounding context to fix ambiguous cells.
5. If multiple readings are possible, pick the one that yields a grammatical, well-spelled ${langName} sentence.
6. For RTL languages (Arabic/Hebrew/Persian) the Braille is encoded LTR — reconstruct the text in its natural script direction.

OUTPUT — STRICT RULES:
- Output ONLY the final clean ${langName} text. NO romanization, NO Braille glyphs, NO explanation, NO prefix/suffix, NO code fences, NO quotes.
- Preserve original line breaks (except merged hyphenated words).
- The text MUST be natural, well-punctuated ${langName} ready for a human reader.
- When truly illegible, write [غير واضح] in Arabic or [unclear] otherwise.

Braille:
${braille}

Decoded ${langName} text:`;

  if (userKey) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${userKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.05, maxOutputTokens: 8192, responseMimeType: "text/plain" },
          }),
        },
      );
      if (r.ok) {
        const j = await r.json();
        const out = j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (out) return out.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
      } else if (r.status !== 429) {
        console.warn("Gemini reverse error", r.status, await r.text());
      }
    } catch (e) { console.warn("Gemini reverse failed", e); }
  }

  if (!lovableKey) throw new Error("No AI key available");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: `You are an expert Braille decoder and ${langName} linguist. Output only the polished decoded ${langName} text.` },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (r.status === 429) throw new Error("rate_limited");
  if (r.status === 402) throw new Error("payment_required");
  if (!r.ok) throw new Error("ai_error");
  const j = await r.json();
  return (j?.choices?.[0]?.message?.content?.trim() ?? "").replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
}

async function refineDecodedText(text: string, langName: string): Promise<string> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableKey || !text.trim()) return text;
  const refinePrompt = `You are an expert ${langName} linguistic proofreader. The text below was produced by decoding a Braille document and may contain minor errors in spelling, punctuation, diacritics, or word boundaries.
Rewrite it as natural, grammatically correct ${langName}, with:
- FULL preservation of meaning — no additions, no deletions, no paraphrasing.
- Preserve original line breaks unless they break a single word.
- Fix spelling, punctuation, and word boundaries.
- For Arabic: re-add Tashkeel only when unambiguous from context; fix Hamza forms.
- Output the polished text ONLY — no explanation, no quotes, no code fences, no prefix.

Text:
${text}

Polished ${langName} text:`;
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
    if (!r.ok) { console.warn("refine failed", r.status); return text; }
    const j = await r.json();
    const refined = (j?.choices?.[0]?.message?.content ?? "").trim()
      .replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();
    return refined || text;
  } catch (e) {
    console.warn("refine exception", e);
    return text;
  }
}

function cleanBraille(s: string): string {
  // Strip code fences, quotes, accidental Latin if mixed
  return s.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
}

// ── Fetch URL: extract readable text ───────────────────────────────────────
async function fetchUrlText(url: string): Promise<string> {
  const r = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DamijBrailleBot/1.0)",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!r.ok) throw new Error(`URL fetch failed: ${r.status}`);
  const html = await r.text();
  // crude readability: strip script/style, then tags
  const noScript = html.replace(/<script[\s\S]*?<\/script>/gi, " ")
                       .replace(/<style[\s\S]*?<\/style>/gi, " ")
                       .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  // capture title
  const titleMatch = noScript.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  // prefer <article> / <main>
  const main = noScript.match(/<(article|main)[^>]*>([\s\S]*?)<\/\1>/i)?.[2] ?? noScript;
  const text = main.replace(/<[^>]+>/g, " ")
                   .replace(/&nbsp;/g, " ")
                   .replace(/&amp;/g, "&")
                   .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                   .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
                   .replace(/[ \t]+/g, " ")
                   .replace(/\n{3,}/g, "\n\n")
                   .trim();
  return (title ? title + "\n\n" : "") + text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const mode = body?.mode ?? "convert";

    if (mode === "fetch_url") {
      if (!body?.url) {
        return new Response(JSON.stringify({ error: "missing url" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await fetchUrlText(String(body.url));
      // Hard cap to avoid runaway payloads
      const trimmed = text.slice(0, 200_000);
      return new Response(JSON.stringify({ text: trimmed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "reverse") {
      const braille: string = String(body?.braille ?? "");
      const langCode: string = body?.langCode ?? "ar";
      const langName: string = body?.langName ?? "Arabic";
      if (!braille.trim()) {
        return new Response(JSON.stringify({ error: "missing braille" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        const text = await reverseBraille(braille, langName, langCode);
        return new Response(JSON.stringify({ text, langCode }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e: any) {
        const msg = String(e?.message);
        if (msg === "rate_limited") return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول لاحقاً." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (msg === "payment_required") return new Response(JSON.stringify({ error: "نفذ الرصيد. أضف رصيداً من الإعدادات." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw e;
      }
    }

    // mode === "convert"
    const text: string = String(body?.text ?? "");
    const grade: 1 | 2 = body?.grade === 2 ? 2 : 1;
    const langCode: string = body?.langCode ?? "ar";
    const langName: string = body?.langName ?? "Arabic";

    if (!text.trim()) {
      return new Response(JSON.stringify({ error: "missing text" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (text.length > 50_000) {
      return new Response(JSON.stringify({ error: "text too long (max 50k chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let braille = "";
    if (grade === 2) {
      try {
        braille = await grade2Convert(text, langName, langCode);
      } catch (e: any) {
        if (String(e?.message) === "rate_limited") {
          return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول لاحقاً." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (String(e?.message) === "payment_required") {
          return new Response(JSON.stringify({ error: "نفذ الرصيد. أضف رصيداً من الإعدادات." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Fall back to Grade 1 if AI fails entirely
        braille = grade1Convert(text);
      }
    } else {
      braille = grade1Convert(text);
    }

    return new Response(JSON.stringify({ braille, grade, langCode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("braille-convert error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
