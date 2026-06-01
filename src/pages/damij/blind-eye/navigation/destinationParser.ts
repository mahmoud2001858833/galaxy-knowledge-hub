// Parses user voice text (Arabic-first, with English fallback) into a navigation destination.
// Returns either a local landmark (in-room object) or an external place name.
// Designed to be VERY tolerant: short bare answers like "الباب" or "kitchen" still parse.

export type LocalLandmark =
  | 'door' | 'chair' | 'table' | 'stairs' | 'window'
  | 'person' | 'bed' | 'sink' | 'toilet' | 'desk' | 'sofa' | 'car'
  | 'kitchen' | 'fridge' | 'tv' | 'closet' | 'light_switch'
  | 'computer' | 'balcony' | 'elevator' | 'plant';

export type ParsedDestination =
  | { kind: 'local'; landmark: LocalLandmark; arabic: string }
  | { kind: 'geo'; query: string }
  | null;

// Arabic + English landmark dictionary -> canonical landmark + spoken Arabic word.
// Patterns are intentionally loose (no \b on Arabic since \b doesn't work with Arabic letters in JS).
const LOCAL_MAP: Array<[RegExp, LocalLandmark, string]> = [
  [/(الباب|باب|البوابه|البوابة|المدخل|المخرج)/, 'door', 'الباب'],
  [/(الكرسي|كرسي|الكراسي)/, 'chair', 'الكرسي'],
  [/(الطاوله|الطاولة|طاوله|طاولة|الطابله|طابله|السفره|السفرة)/, 'table', 'الطاولة'],
  [/(المكتب|مكتب|المكتبه|المكتبة)/, 'desk', 'المكتب'],
  [/(الدرج|درج|السلم|سلم|السلالم|الدرجات)/, 'stairs', 'الدرج'],
  [/(النافذه|النافذة|الشباك|شباك|نافذه|نافذة|الشبابيك)/, 'window', 'النافذة'],
  [/(السرير|سرير|التخت|تخت)/, 'bed', 'السرير'],
  [/(المغسله|المغسلة|الحوض|المجلى)/, 'sink', 'المغسلة'],
  [/(الحمام|التواليت|المرحاض|دوره المياه|دورة المياه|التوالت)/, 'toilet', 'الحمام'],
  [/(الكنب|الكنبه|الكنبة|الاريكه|الأريكة|الصوفا|الصوفه)/, 'sofa', 'الكنبة'],
  [/(السياره|السيارة|سياره|سيارة|العربيه|العربية)/, 'car', 'السيارة'],
  [/(الشخص|الرجل|الولد|الانسان|الإنسان|الشخص اللي قدامي)/, 'person', 'الشخص'],
  [/(المطبخ|الكزينه|الكوزينه|الكوزينة|كوزينه)/, 'kitchen', 'المطبخ'],
  [/(الثلاجه|الثلاجة|البراد|الفريزر)/, 'fridge', 'الثلاجة'],
  [/(التلفزيون|التلفاز|الشاشه|الشاشة|التلفون الكبير|التي في)/, 'tv', 'التلفاز'],
  [/(الخزانه|الخزانة|الدولاب|الكبت|الكبتات|الكبات|خزانه|خزانة)/, 'closet', 'الخزانة'],
  [/(مفتاح النور|مفتاح الكهرباء|مفتاح الإناره|المفتاح|الزر|زر النور)/, 'light_switch', 'مفتاح النور'],
  [/(الكمبيوتر|الحاسوب|اللاب توب|اللابتوب|الحاسبه|الحاسبة|الشاشه الذكيه)/, 'computer', 'الكمبيوتر'],
  [/(البلكون|البلكونه|البلكونة|الشرفه|الشرفة|الترسه|التراسه)/, 'balcony', 'الشرفة'],
  [/(المصعد|الاسانسير|الأسانسير|الليفت)/, 'elevator', 'المصعد'],
  [/(النبته|النبتة|الزرع|الشجره|الشجرة|الورد|الأصيص|الاصيص)/, 'plant', 'النبتة'],

  // English fallback
  [/\b(door|gate|entrance|exit)\b/i, 'door', 'الباب'],
  [/\b(chair|seat)\b/i, 'chair', 'الكرسي'],
  [/\b(table|dining table)\b/i, 'table', 'الطاولة'],
  [/\b(desk)\b/i, 'desk', 'المكتب'],
  [/\b(stair|stairs|staircase|steps)\b/i, 'stairs', 'الدرج'],
  [/\b(window)\b/i, 'window', 'النافذة'],
  [/\b(bed)\b/i, 'bed', 'السرير'],
  [/\b(sink|basin)\b/i, 'sink', 'المغسلة'],
  [/\b(toilet|bathroom|wc|restroom)\b/i, 'toilet', 'الحمام'],
  [/\b(sofa|couch|settee)\b/i, 'sofa', 'الكنبة'],
  [/\b(car|vehicle)\b/i, 'car', 'السيارة'],
  [/\b(kitchen)\b/i, 'kitchen', 'المطبخ'],
  [/\b(fridge|refrigerator)\b/i, 'fridge', 'الثلاجة'],
  [/\b(tv|television)\b/i, 'tv', 'التلفاز'],
  [/\b(closet|wardrobe|cabinet|cupboard)\b/i, 'closet', 'الخزانة'],
  [/\b(light switch|switch)\b/i, 'light_switch', 'مفتاح النور'],
  [/\b(computer|laptop|pc)\b/i, 'computer', 'الكمبيوتر'],
  [/\b(balcony|terrace)\b/i, 'balcony', 'الشرفة'],
  [/\b(elevator|lift)\b/i, 'elevator', 'المصعد'],
  [/\b(plant|tree|flower)\b/i, 'plant', 'النبتة'],
];

// Trigger phrases for "I want to go to ..."
const GO_TRIGGERS = [
  // Standard "I want to go to X" / "أريد أن أذهب إلى ..."
  /(?:بدي|بدّي|أبغى|أبغي|أريد|اريد|عاوز|عايز|ودي|نفسي|بحب)\s+(?:أن\s+)?(?:أ?روح|اروح|اذهب|أذهب|أمشي|نروح|نمشي|نوصل|أصل|اصل|أوصل|اوصل)\s+(?:إلى|الى|على|ع|ل|لـ|لعند|عند|الي|لال)?\s*(.+)$/i,
  // "Take/guide/lead me to X"
  /^(?:خذني|خدني|وجهني|وجّهني|دلني|دلّني|رشدني|ودّيني|وديني|طلعني)\s+(?:إلى|الى|على|ع|ل|لـ|لعند|عند|الي|لال)?\s*(.+)$/i,
  // English
  /^(?:go|take me|guide me|navigate|lead me|bring me)\s+to\s+(.+)$/i,
  /^i\s+want\s+to\s+go\s+to\s+(.+)$/i,
  // Bare prefixed forms like "للباب" / "ع المطبخ" / "للسياره"
  /^(?:لـ|ل|إلى|الى|على|ع|عند|لعند|لال|الى عند)\s+(.+)$/i,
];

export function extractGoToText(raw: string): string | null {
  const t = (raw || '').trim().replace(/[.!؟?،,]+$/, '');
  if (!t) return null;
  for (const rx of GO_TRIGGERS) {
    const m = t.match(rx);
    if (m && m[1]) return m[1].trim();
  }
  return null;
}

// Strip filler words so a bare answer like "الباب يا أخي" still matches.
const cleanBare = (s: string): string =>
  (s || '')
    .replace(/[.!؟?،,]+/g, ' ')
    .replace(/\b(يا|من\s+فضلك|لو\s+سمحت|please|the|a|an)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function matchLocal(target: string): { landmark: LocalLandmark; arabic: string } | null {
  const t = cleanBare(target);
  for (const [rx, lm, ar] of LOCAL_MAP) {
    if (rx.test(t)) return { landmark: lm, arabic: ar };
  }
  return null;
}

// Standard parser: requires a trigger ("بدي أروح ...") for safety in free chat.
export function parseDestination(raw: string): ParsedDestination {
  const target = extractGoToText(raw);
  if (!target) return null;
  const local = matchLocal(target);
  if (local) return { kind: 'local', ...local };
  return { kind: 'geo', query: target };
}

// Tolerant parser: used right after the system asked "where do you want to go?".
// Treats the entire utterance as the destination — even a single word like "الباب".
export function parseDestinationLoose(raw: string): ParsedDestination {
  const t = cleanBare(raw);
  if (!t) return null;
  // Try the strict parser first (handles "بدي أروح على الباب").
  const strict = parseDestination(raw);
  if (strict) return strict;
  // Strip any leading prefix.
  const stripped = t.replace(/^(?:لـ|ل|إلى|الى|على|ع|عند|لعند|لال|to|the|a|an)\s+/i, '').trim();
  const local = matchLocal(stripped) || matchLocal(t);
  if (local) return { kind: 'local', ...local };
  // Anything else (e.g. "مدرسة عنبة", "Starbucks") becomes a geo place name.
  if (stripped.length >= 2) return { kind: 'geo', query: stripped };
  return null;
}

export const LANDMARK_AR: Record<LocalLandmark, string> = {
  door: 'الباب', chair: 'الكرسي', table: 'الطاولة', stairs: 'الدرج',
  window: 'النافذة', person: 'الشخص', bed: 'السرير', sink: 'المغسلة',
  toilet: 'الحمام', desk: 'المكتب', sofa: 'الكنبة', car: 'السيارة',
  kitchen: 'المطبخ', fridge: 'الثلاجة', tv: 'التلفاز', closet: 'الخزانة',
  light_switch: 'مفتاح النور', computer: 'الكمبيوتر', balcony: 'الشرفة',
  elevator: 'المصعد', plant: 'النبتة',
};
