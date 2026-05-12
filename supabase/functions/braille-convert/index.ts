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

const DIGITS_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(DIGITS)
    .filter(([digit]) => /[0-9]/.test(digit))
    .map(([digit, cell]) => [cell, digit]),
);

function reverseMap(table: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [char, cell] of Object.entries(table)) {
    if (cell && !out[cell]) out[cell] = char;
  }
  return out;
}

const ARABIC_REVERSE = reverseMap(ARABIC);
const LATIN_REVERSE = reverseMap({ ...LATIN, ...LATIN_ACCENT });
const RUSSIAN_REVERSE = reverseMap(RUSSIAN);
const GREEK_REVERSE = reverseMap(GREEK);
const PUNCT_REVERSE = reverseMap(PUNCT);

function deterministicReverseBraille(braille: string, langCode = "ar"): string {
  const lc = langCode.toLowerCase();
  const primary = lc.startsWith("ar") || lc.startsWith("fa") || lc.startsWith("ur")
    ? ARABIC_REVERSE
    : lc.startsWith("ru") || lc.startsWith("uk") || lc.startsWith("be")
      ? RUSSIAN_REVERSE
      : lc.startsWith("el")
        ? GREEK_REVERSE
        : LATIN_REVERSE;

  let out = "";
  let inNumber = false;
  let capitalizeNext = false;

  for (const cell of braille) {
    if (cell === NUMSIGN) { inNumber = true; continue; }
    if (cell === CAPSIGN) { capitalizeNext = true; continue; }
    if (cell === "⠀") { out += " "; inNumber = false; capitalizeNext = false; continue; }
    if (cell === " " || cell === "\n" || cell === "\t") { out += cell; inNumber = false; capitalizeNext = false; continue; }

    if (inNumber && DIGITS_REVERSE[cell]) {
      out += DIGITS_REVERSE[cell];
      continue;
    }
    inNumber = false;

    let decoded = primary[cell]
      ?? PUNCT_REVERSE[cell]
      ?? ARABIC_REVERSE[cell]
      ?? LATIN_REVERSE[cell]
      ?? RUSSIAN_REVERSE[cell]
      ?? GREEK_REVERSE[cell]
      ?? cell;

    if (capitalizeNext && decoded.length === 1) decoded = decoded.toUpperCase();
    capitalizeNext = false;
    out += decoded;
  }
  return out.trim();
}

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

// ── Grade 2 (contracted) — uses Gemini direct API ─────────────────────────
async function grade2Convert(text: string, langName: string, langCode: string): Promise<string> {
  const userKey = Deno.env.get("BRAILLE_GEMINI_API_KEY");
  if (!userKey) throw new Error("missing_key");

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
  if (r.status === 429) throw new Error("rate_limited");
  if (!r.ok) {
    const t = await r.text();
    console.error("Gemini grade2 error", r.status, t);
    throw new Error("ai_error");
  }
  const j = await r.json();
  const out = j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!out) throw new Error("empty_response");
  return cleanBraille(out);
}

async function reverseBraille(braille: string, langName: string, langCode: string): Promise<string> {
  const userKey = Deno.env.get("BRAILLE_GEMINI_API_KEY");
  if (!userKey) throw new Error("missing_key");

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
  if (r.status === 429) throw new Error("rate_limited");
  if (!r.ok) {
    const t = await r.text();
    console.error("Gemini reverse error", r.status, t);
    throw new Error("ai_error");
  }
  const j = await r.json();
  const out = j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!out) throw new Error("empty_response");
  return out.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
}

async function refineDecodedText(text: string, langName: string): Promise<string> {
  const userKey = Deno.env.get("BRAILLE_GEMINI_API_KEY");
  if (!userKey || !text.trim()) return text;
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
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${userKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: refinePrompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
        }),
      },
    );
    if (!r.ok) { console.warn("refine failed", r.status); return text; }
    const j = await r.json();
    const refined = (j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim()
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
const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
  "Accept-Encoding": "identity",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&copy;/g, "©").replace(/&reg;/g, "®").replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—").replace(/&ndash;/g, "–")
    .replace(/&laquo;/g, "«").replace(/&raquo;/g, "»")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => { try { return String.fromCodePoint(parseInt(h, 16)); } catch { return ""; } })
    .replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(parseInt(n, 10)); } catch { return ""; } });
}

function htmlToReadableText(html: string): { title: string; text: string } {
  // Remove non-content blocks
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    .replace(/<form[\s\S]*?<\/form>/gi, " ");

  const titleMatch = cleaned.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).replace(/\s+/g, " ").trim() : "";

  // Pick best content container: <article>, then <main>, then largest <div> with most text, else body
  const article = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1];
  const main = cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  let container = article || main;

  if (!container) {
    // Find the largest <div> by inner text length
    const divRegex = /<div[^>]*>([\s\S]*?)<\/div>/gi;
    let best = ""; let bestLen = 0; let m: RegExpExecArray | null;
    while ((m = divRegex.exec(cleaned)) !== null) {
      const inner = m[1];
      const txtLen = inner.replace(/<[^>]+>/g, "").length;
      if (txtLen > bestLen) { bestLen = txtLen; best = inner; }
    }
    if (bestLen > 500) container = best;
  }

  if (!container) {
    container = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || cleaned;
  }

  // Preserve line breaks for block elements
  const withBreaks = container
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|article|section|blockquote)\s*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ");

  const text = decodeEntities(withBreaks.replace(/<[^>]+>/g, " "))
    .replace(/[ \t\u00A0]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { title, text };
}

async function fetchWithTimeout(url: string, ms: number, headers: Record<string, string>): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { headers, redirect: "follow", signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

async function fetchUrlText(url: string): Promise<string> {
  let directError: string | null = null;
  let directText = "";
  let directTitle = "";

  // 1) Try direct fetch with browser-like headers
  try {
    const r = await fetchWithTimeout(url, 15000, BROWSER_HEADERS);
    if (!r.ok) {
      if (r.status === 403 || r.status === 401) directError = "الموقع يرفض الجلب التلقائي (403)";
      else if (r.status === 404) directError = "الصفحة غير موجودة (404)";
      else if (r.status === 429) directError = "تم تجاوز حد الطلبات للموقع (429)";
      else directError = `فشل الجلب (${r.status})`;
    } else {
      const ct = (r.headers.get("content-type") || "").toLowerCase();
      const raw = await r.text();
      if (ct.includes("text/plain") || (!ct.includes("html") && !ct.includes("xml"))) {
        if (raw.trim().length > 0 && !ct.includes("pdf") && !ct.includes("octet-stream")) {
          return raw.trim();
        }
      }
      const { title, text } = htmlToReadableText(raw);
      directTitle = title;
      directText = text;
    }
  } catch (e: any) {
    directError = e?.name === "AbortError" ? "انتهت مهلة الجلب" : (e?.message || "فشل الاتصال بالموقع");
  }

  if (directText && directText.length >= 200) {
    return (directTitle ? directTitle + "\n\n" : "") + directText;
  }

  // 2) Fallback: r.jina.ai readability proxy (returns clean text for any page)
  try {
    const proxyUrl = `https://r.jina.ai/${url}`;
    const r = await fetchWithTimeout(proxyUrl, 20000, {
      "User-Agent": BROWSER_HEADERS["User-Agent"],
      "Accept": "text/plain, text/markdown, */*",
      "Accept-Language": BROWSER_HEADERS["Accept-Language"],
    });
    if (r.ok) {
      const txt = (await r.text()).trim();
      if (txt.length > 50) return txt;
    }
  } catch {
    // ignore — handled below
  }

  // 3) If we have any direct text (even short), return it
  if (directText && directText.length > 0) {
    return (directTitle ? directTitle + "\n\n" : "") + directText;
  }

  throw new Error(directError || "تعذّر جلب صفحة الويب. قد يكون الموقع يحجب الجلب التلقائي أو يعتمد على JavaScript.");
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
        const decoded = await reverseBraille(braille, langName, langCode);
        const refined = await refineDecodedText(decoded, langName);
        return new Response(JSON.stringify({ text: refined, original_text: decoded, refined_text: refined, langCode }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e: any) {
        const msg = String(e?.message);
        if (msg === "rate_limited") return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول لاحقاً." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (msg === "missing_key") return new Response(JSON.stringify({ error: "مفتاح Gemini غير مهيأ. يرجى إضافة BRAILLE_GEMINI_API_KEY." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ error: "فشل فك ترميز بريل. حاول مرة أخرى." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
        const msg = String(e?.message);
        if (msg === "rate_limited") {
          return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول لاحقاً." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (msg === "missing_key") {
          return new Response(JSON.stringify({ error: "مفتاح Gemini غير مهيأ. يرجى إضافة BRAILLE_GEMINI_API_KEY." }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ error: "فشل تحويل المستوى الثاني (الاختزالي). حاول مرة أخرى." }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
