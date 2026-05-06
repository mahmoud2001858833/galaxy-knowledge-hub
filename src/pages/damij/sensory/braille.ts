// Arabic + Latin Braille basic mapping (Unicode Braille dot patterns).
// Used by the unified communication tool for synchronous text → Braille rendering.

const ARABIC_BRAILLE: Record<string, string> = {
  'ا': '⠁', 'ب': '⠃', 'ت': '⠞', 'ث': '⠹', 'ج': '⠚', 'ح': '⠓', 'خ': '⠭',
  'د': '⠙', 'ذ': '⠮', 'ر': '⠗', 'ز': '⠵', 'س': '⠎', 'ش': '⠩', 'ص': '⠯',
  'ض': '⠫', 'ط': '⠾', 'ظ': '⠷', 'ع': '⠷', 'غ': '⠣', 'ف': '⠋', 'ق': '⠟',
  'ك': '⠅', 'ل': '⠇', 'م': '⠍', 'ن': '⠝', 'ه': '⠓', 'و': '⠺', 'ي': '⠽',
  'ى': '⠽', 'ة': '⠞', 'أ': '⠁', 'إ': '⠁', 'آ': '⠜', 'ء': '⠘',
  'ؤ': '⠺', 'ئ': '⠽',
};
const LATIN_BRAILLE: Record<string, string> = {
  a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑', f: '⠋', g: '⠛', h: '⠓',
  i: '⠊', j: '⠚', k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕', p: '⠏',
  q: '⠟', r: '⠗', s: '⠎', t: '⠞', u: '⠥', v: '⠧', w: '⠺', x: '⠭',
  y: '⠽', z: '⠵',
};
const NUM_BRAILLE: Record<string, string> = {
  '0': '⠚', '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙', '5': '⠑',
  '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊',
};
const NUM_PREFIX = '⠼';

export function textToBraille(input: string): string {
  if (!input) return '';
  let out = '';
  let inNumber = false;
  for (const raw of input) {
    const ch = raw.toLowerCase();
    if (NUM_BRAILLE[ch]) {
      if (!inNumber) { out += NUM_PREFIX; inNumber = true; }
      out += NUM_BRAILLE[ch];
      continue;
    }
    inNumber = false;
    if (ARABIC_BRAILLE[raw]) out += ARABIC_BRAILLE[raw];
    else if (LATIN_BRAILLE[ch]) out += LATIN_BRAILLE[ch];
    else if (raw === ' ') out += ' ';
    else if (raw === '\n') out += '\n';
    else if (/[.,!?؟،:;]/.test(raw)) out += '⠲';
    else out += raw; // pass through unknown
  }
  return out;
}

// Reverse map for Arabic + Latin (best-effort; first match wins).
const REVERSE: Record<string, string> = {};
Object.entries(ARABIC_BRAILLE).forEach(([k, v]) => { if (!REVERSE[v]) REVERSE[v] = k; });
Object.entries(LATIN_BRAILLE).forEach(([k, v]) => { if (!REVERSE[v]) REVERSE[v] = k; });

export function brailleToText(input: string): string {
  if (!input) return '';
  let out = '';
  let inNumber = false;
  for (const raw of input) {
    if (raw === NUM_PREFIX) { inNumber = true; continue; }
    if (inNumber) {
      const num = Object.entries(NUM_BRAILLE).find(([, v]) => v === raw);
      if (num) { out += num[0]; continue; }
      inNumber = false;
    }
    if (raw === ' ' || raw === '\n') { out += raw; continue; }
    if (raw === '⠲') { out += '.'; continue; }
    out += REVERSE[raw] ?? raw;
  }
  return out;
}
