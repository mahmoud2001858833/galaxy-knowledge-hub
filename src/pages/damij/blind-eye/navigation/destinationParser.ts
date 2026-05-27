// Parses user voice text (Arabic-first) into a navigation destination.
// Returns either a local landmark (in-room object) or an external place name.

export type LocalLandmark =
  | 'door' | 'chair' | 'table' | 'stairs' | 'window'
  | 'person' | 'bed' | 'sink' | 'toilet' | 'desk' | 'sofa' | 'car';

export type ParsedDestination =
  | { kind: 'local'; landmark: LocalLandmark; arabic: string }
  | { kind: 'geo'; query: string }
  | null;

// Arabic landmark dictionary -> canonical landmark + spoken Arabic word.
const LOCAL_MAP: Array<[RegExp, LocalLandmark, string]> = [
  [/\b(الباب|باب)\b/, 'door', 'الباب'],
  [/\b(الكرسي|كرسي)\b/, 'chair', 'الكرسي'],
  [/\b(الطاوله|الطاولة|طاوله|طاولة|الطابله|طابله)\b/, 'table', 'الطاولة'],
  [/\b(المكتب|مكتب)\b/, 'desk', 'المكتب'],
  [/\b(الدرج|درج|السلم|سلم)\b/, 'stairs', 'الدرج'],
  [/\b(النافذه|النافذة|الشباك|شباك|نافذه|نافذة)\b/, 'window', 'النافذة'],
  [/\b(السرير|سرير)\b/, 'bed', 'السرير'],
  [/\b(المغسله|المغسلة|الحوض)\b/, 'sink', 'المغسلة'],
  [/\b(الحمام|التواليت|المرحاض)\b/, 'toilet', 'الحمام'],
  [/\b(الكنب|الكنبه|الكنبة|الاريكه|الأريكة)\b/, 'sofa', 'الكنبة'],
  [/\b(السياره|السيارة|سياره|سيارة)\b/, 'car', 'السيارة'],
  [/\b(الشخص|الرجل|الولد|الانسان|الإنسان)\b/, 'person', 'الشخص'],
  // English fallback
  [/\b(door)\b/i, 'door', 'الباب'],
  [/\b(chair)\b/i, 'chair', 'الكرسي'],
  [/\b(table)\b/i, 'table', 'الطاولة'],
  [/\b(stairs?)\b/i, 'stairs', 'الدرج'],
  [/\b(window)\b/i, 'window', 'النافذة'],
];

// Trigger phrases for "I want to go to ..."
const GO_TRIGGERS = [
  /^(?:.*?)(?:بدي|أبغى|أبغي|أريد|اريد|عاوز|عايز|ودي)\s+(?:أن\s+)?(?:أ?روح|اذهب|أذهب|أمشي|نروح)\s+(?:إلى|الى|على|ع|ل|لعند|عند|الي)\s+(.+)$/i,
  /^(?:خذني|وجهني|وجّهني|دلني|دلّني|رشدني)\s+(?:إلى|الى|على|ع|ل|لعند|عند)\s+(.+)$/i,
  /^(?:بدي|أريد|اريد)\s+(?:أصل|اصل|أوصل|اوصل)\s+(?:إلى|الى|على|ع|ل|لعند|عند|الي)\s+(.+)$/i,
  /^(?:go|take me|guide me|navigate)\s+to\s+(.+)$/i,
];

export function extractGoToText(raw: string): string | null {
  const t = (raw || '').trim().replace(/[.!؟?،,]+$/, '');
  for (const rx of GO_TRIGGERS) {
    const m = t.match(rx);
    if (m && m[1]) return m[1].trim();
  }
  // Also accept bare "للباب" / "للمدرسة" if user is laconic
  if (/^(?:لـ|ل|إلى|الى|على)\s*\S+/.test(t)) return t.replace(/^(?:لـ|ل|إلى|الى|على)\s*/, '').trim();
  return null;
}

export function parseDestination(raw: string): ParsedDestination {
  const target = extractGoToText(raw);
  if (!target) return null;
  for (const [rx, lm, ar] of LOCAL_MAP) {
    if (rx.test(target)) return { kind: 'local', landmark: lm, arabic: ar };
  }
  // Default: treat as external place name (مدرسة, مسجد, صيدلية, مستشفى, اسم مكان…)
  return { kind: 'geo', query: target };
}

export const LANDMARK_AR: Record<LocalLandmark, string> = {
  door: 'الباب', chair: 'الكرسي', table: 'الطاولة', stairs: 'الدرج',
  window: 'النافذة', person: 'الشخص', bed: 'السرير', sink: 'المغسلة',
  toilet: 'الحمام', desk: 'المكتب', sofa: 'الكنبة', car: 'السيارة',
};
