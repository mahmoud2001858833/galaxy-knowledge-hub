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

// ── Gemini multi-model helper with automatic fallback ────────────────────
// Tries each model in order. On 429/5xx/quota → next model. Throws only when
// every model fails (so callers can decide whether to use a deterministic fallback).
async function callGemini(
  models: string[],
  prompt: string,
  opts: { temperature?: number; maxOutputTokens?: number; mimeType?: string } = {},
): Promise<string> {
  const userKey = Deno.env.get("BRAILLE_GEMINI_API_KEY");
  if (!userKey) throw new Error("missing_key");

  let lastErr = "ai_error";
  for (const model of models) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${userKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: opts.temperature ?? 0.1,
              maxOutputTokens: opts.maxOutputTokens ?? 8192,
              ...(opts.mimeType ? { responseMimeType: opts.mimeType } : {}),
            },
          }),
        },
      );
      if (r.status === 429 || r.status === 503) {
        lastErr = "rate_limited";
        const t = await r.text().catch(() => "");
        console.warn(`Gemini ${model} ${r.status} → fallback`, t.slice(0, 200));
        continue;
      }
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        console.error(`Gemini ${model} ${r.status}`, t.slice(0, 300));
        lastErr = "ai_error";
        continue;
      }
      const j = await r.json();
      const out = j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (out) return out;
      lastErr = "empty_response";
    } catch (e: any) {
      console.error(`Gemini ${model} exception`, e?.message);
      lastErr = "ai_error";
    }
  }
  throw new Error(lastErr);
}

// ── Grade 2 (contracted) — uses Gemini with multi-model fallback ─────────
async function grade2Convert(text: string, langName: string, langCode: string): Promise<string> {
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
  const out = await callGemini(
    ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"],
    prompt,
    { temperature: 0.1, maxOutputTokens: 8192 },
  );
  return cleanBraille(out);
}

async function reverseBraille(braille: string, langName: string, langCode: string): Promise<string> {
  const prompt = `You are a world-class Braille decoding + linguistics engine, specialized in ${langName} (BCP-47: ${langCode}).

═══ BRAILLE STANDARDS YOU MUST APPLY ═══
- ARABIC: official Arabic Braille (LBU/UNESCO 2013) — 28 letters + Tashkeel + Hamza variants (ء أ إ آ ؤ ئ) + Arabic-Indic digits with number sign ⠼. Note: ع=⠷, ح=⠱, ظ=⠰, خ=⠭, ث=⠹, ذ=⠮, ش=⠩, ص=⠯, ض=⠫, ط=⠾, غ=⠣.
- ENGLISH: Unified English Braille (UEB) 2013 — fully expand Grade-2 contractions:
  · Alphabetic wordsigns: but(b), can(c), do(d), every(e), from(f), go(g), have(h), just(j), knowledge(k), like(l), more(m), not(n), people(p), quite(q), rather(r), so(s), that(t), us(u), very(v), will(w), it(x), you(y), as(z).
  · Strong wordsigns: child(ch=⠡), shall(sh=⠩), this(th=⠹), which(wh=⠱), out(ou=⠳), still(st=⠌).
  · Strong groupsigns: and(⠯), for(⠿), of(⠷), the(⠮), with(⠾).
  · Lower wordsigns: be, enough, were, his, in, was. Lower groupsigns: ea, bb, cc, dd, ff, gg, be, con, dis, en, in.
  · Final-letter groupsigns: -ound, -ance, -sion, -less, -ount, -ence, -ong, -ful, -tion, -ness, -ment, -ity.
  · Initial-letter contractions: day, ever, father, here, know, lord, mother, name, one, part, question, right, some, time, under, work, young, there, character, through, where, ought, work.
  · Short-form words: about(ab), above(abv), according(ac), across(acr), after(af), afternoon(afn), afterward(afw), again(ag), against(agst), almost(alm), already(alr), also(al), although(alth), altogether(alt), always(alw), because(bec), before(bef), behind(beh), below(bel), beneath(ben), beside(bes), between(bet), beyond(bey), blind(bl), braille(brl), children(chn), conceive(concv), could(cd), deceive(dcv), declare(dcl), either(ei), friend(fr), first(fst), good(gd), great(grt), him(hm), himself(hmf), herself(hrf), immediate(imm), itself(xf), its(xs), letter(lr), little(ll), much(mch), must(mst), myself(myf), necessary(nec), neither(nei), oneself(onef), ourselves(ourvs), paid(pd), perceive(percv), perhaps(perh), quick(qk), receive(rcv), rejoice(rjc), said(sd), should(shd), such(sch), themselves(themvs), thyself(thyf), today(td), together(tgr), tomorrow(tm), tonight(tn), would(wd), your(yr), yourself(yrf), yourselves(yrvs).
- FRENCH: Braille français abrégé (when contractions are present).
- SPANISH / GERMAN / ITALIAN / PORTUGUESE / RUSSIAN / GREEK: official national Braille code.
- CJK / KOREAN: Japanese Tenji, Korean Hangul Braille, Mainland Chinese Braille.
- INDICATORS: number sign ⠼, capital sign ⠠ (single letter) / ⠠⠠ (whole word), letter sign ⠰, italic/emphasis indicators.

═══ DECODING PIPELINE (perform internally, output NOTHING about it) ═══
1. Tokenize Braille left-to-right into cells, words separated by space (⠀ or normal space).
2. For each word: try Grade-2 contraction expansion FIRST (longest match), then literal Grade-1 if no contraction matches.
3. Apply indicators in order: number ⠼ activates digits until next space; capital ⠠ capitalizes next letter (⠠⠠ next word).
4. Fully expand EVERY Grade-2 contraction into the spelled-out word.
5. LINGUISTIC POST-PROCESSING in ${langName}:
   · Restore correct word boundaries, capitalization, and punctuation.
   · For Arabic: reattach Tashkeel ONLY when 100% unambiguous from morphology; fix Hamza forms (ء أ إ آ ؤ ئ); never add diacritics by guess.
   · Merge words hyphenated across line breaks.
   · For ambiguous cells: pick the reading that yields a real, grammatically correct ${langName} word.
   · Fix obvious OCR-style misreads using ${langName} spelling.
6. RTL languages (Arabic/Hebrew/Persian) — Braille is written LTR but the natural text is RTL; output in natural script direction.
7. Ensure final text is FLUENT, NATURAL, and PUBLISHABLE ${langName}.

═══ OUTPUT — STRICT ═══
- Return ONLY the final clean ${langName} text.
- NO romanization, NO Braille glyphs, NO explanation, NO prefix/suffix, NO code fences, NO quotes, NO labels.
- Preserve line breaks (except merged hyphenated words).
- For truly illegible passages: [غير واضح] in Arabic, [unclear] otherwise.

Braille input:
${braille}

Final decoded ${langName} text:`;

  const out = await callGemini(
    ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"],
    prompt,
    { temperature: 0.05, maxOutputTokens: 8192, mimeType: "text/plain" },
  );
  return out.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
}

async function refineDecodedText(text: string, langName: string, langCode: string): Promise<string> {
  if (!text.trim()) return text;
  const isArabic = langCode.toLowerCase().startsWith("ar");
  const refinePrompt = `You are an expert ${langName} linguistic proofreader and editor.
The text below was produced by decoding a Braille document and may contain residual errors in spelling, punctuation, word boundaries, capitalization, or ${isArabic ? "Tashkeel/Hamza forms" : "diacritics"}.

Rewrite it as PUBLISHABLE-quality ${langName} prose, applying:
- FULL preservation of meaning — no additions, no deletions, no paraphrasing of ideas.
- Fix spelling, punctuation, capitalization, and word boundaries.
- Restore natural sentence flow and correct grammar.
${isArabic
  ? "- Fix Hamza forms (ء أ إ آ ؤ ئ ة) using surrounding context.\n- Add Tashkeel ONLY where it is unambiguous and naturally written; never guess.\n- Use correct Arabic punctuation (، ؛ ؟ «»)."
  : "- Use standard punctuation and capitalization for the language.\n- Restore diacritics only when unambiguous."}
- Preserve original line breaks unless they split a single word.
- Output the polished text ONLY — no explanation, no quotes, no code fences, no labels.

Text to polish:
${text}

Polished ${langName} text:`;

  try {
    const refined = await callGemini(
      ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"],
      refinePrompt,
      { temperature: 0.15, maxOutputTokens: 8192 },
    );
    return refined.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim() || text;
  } catch (e) {
    console.warn("refine failed, returning original", (e as any)?.message);
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
      const grade: 1 | 2 = body?.grade === 2 ? 2 : 1;
      if (!braille.trim()) {
        return new Response(JSON.stringify({ error: "missing braille" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const fallbackText = deterministicReverseBraille(braille, langCode);
      if (grade === 1) {
        return new Response(JSON.stringify({ text: fallbackText, original_text: fallbackText, refined_text: fallbackText, langCode }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        if (fallbackText) return new Response(JSON.stringify({ text: fallbackText, original_text: fallbackText, refined_text: fallbackText, langCode, fallback: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
