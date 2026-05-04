// Lightweight Unicode-Braille helpers. The edge function returns braille labels
// already encoded; this is the local fallback used for legend display.

const cell = (...dots: number[]) =>
  String.fromCodePoint(0x2800 + dots.reduce((a, d) => a | (1 << (d - 1)), 0));

// English Grade-1 (UEB) base letters
const EN: Record<string, string> = {
  a: cell(1), b: cell(1, 2), c: cell(1, 4), d: cell(1, 4, 5), e: cell(1, 5),
  f: cell(1, 2, 4), g: cell(1, 2, 4, 5), h: cell(1, 2, 5), i: cell(2, 4), j: cell(2, 4, 5),
  k: cell(1, 3), l: cell(1, 2, 3), m: cell(1, 3, 4), n: cell(1, 3, 4, 5), o: cell(1, 3, 5),
  p: cell(1, 2, 3, 4), q: cell(1, 2, 3, 4, 5), r: cell(1, 2, 3, 5), s: cell(2, 3, 4), t: cell(2, 3, 4, 5),
  u: cell(1, 3, 6), v: cell(1, 2, 3, 6), w: cell(2, 4, 5, 6), x: cell(1, 3, 4, 6),
  y: cell(1, 3, 4, 5, 6), z: cell(1, 3, 5, 6),
  " ": " ", ".": cell(2, 5, 6), ",": cell(2), "?": cell(2, 3, 6), "!": cell(2, 3, 5),
  "-": cell(3, 6), "'": cell(3),
};
const NUM_PREFIX = cell(3, 4, 5, 6);
const CAP_PREFIX = cell(6);
const DIGITS = "0123456789";
const DIGIT_LETTER = "jabcdefghi";

// Arabic letters (Unified Arabic Braille subset)
const AR: Record<string, string> = {
  "ا": cell(1), "ب": cell(1, 2), "ت": cell(2, 3, 4, 5), "ث": cell(1, 4, 5, 6),
  "ج": cell(2, 4, 5), "ح": cell(1, 5, 6), "خ": cell(1, 3, 4, 6),
  "د": cell(1, 4, 5), "ذ": cell(2, 3, 4, 6), "ر": cell(1, 2, 3, 5),
  "ز": cell(1, 3, 5, 6), "س": cell(2, 3, 4), "ش": cell(1, 4, 6),
  "ص": cell(1, 2, 3, 4, 6), "ض": cell(1, 2, 4, 6), "ط": cell(2, 3, 4, 5, 6),
  "ظ": cell(1, 2, 3, 4, 5, 6), "ع": cell(1, 2, 4, 5, 6), "غ": cell(1, 2, 6),
  "ف": cell(1, 2, 4), "ق": cell(1, 2, 3, 4, 5), "ك": cell(1, 3),
  "ل": cell(1, 2, 3), "م": cell(1, 3, 4), "ن": cell(1, 3, 4, 5),
  "ه": cell(1, 2, 5), "و": cell(2, 4, 5, 6), "ي": cell(2, 4),
  "ى": cell(2, 4), "ة": cell(1, 6), "ء": cell(3),
  "أ": cell(1) + cell(3), "إ": cell(1) + cell(3), "آ": cell(3, 4) + cell(1),
  "ؤ": cell(2, 4, 5, 6) + cell(3), "ئ": cell(2, 4) + cell(3),
};

export function toBraille(input: string, lang: "ar" | "en" = "en"): string {
  let out = "";
  let inNum = false;
  for (const raw of input) {
    const ch = raw;
    if (DIGITS.includes(ch)) {
      if (!inNum) { out += NUM_PREFIX; inNum = true; }
      out += EN[DIGIT_LETTER[Number(ch)]];
      continue;
    }
    inNum = false;
    if (lang === "ar" && AR[ch]) { out += AR[ch]; continue; }
    const lower = ch.toLowerCase();
    if (EN[lower]) {
      if (lang === "en" && ch !== lower) out += CAP_PREFIX;
      out += EN[lower];
    } else if (ch === "\n") {
      out += "\n";
    } else {
      out += " ";
    }
  }
  return out;
}
