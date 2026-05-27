// Saved favorite places + emergency contact, stored locally in the browser.
// Used by Blind Eye so users can say: "وديني عالبيت" / "احفظ هذا المكان كالمدرسة" / "نجدة".

import type { LatLng } from './geo';

export type SavedPlace = {
  name: string;        // canonical Arabic name (e.g. "البيت", "المدرسة")
  query?: string;      // optional free-text place query for re-geocoding
  coords?: LatLng;     // optional cached coords
  createdAt: number;
};

const PLACES_KEY = 'damij.blindEye.savedPlaces.v1';
const EMERGENCY_KEY = 'damij.blindEye.emergencyPhone.v1';

// Common synonyms users might say → canonical name.
const PLACE_SYNONYMS: Array<[RegExp, string]> = [
  [/\b(البيت|بيتي|المنزل|الدار)\b/, 'البيت'],
  [/\b(المدرسة|مدرستي)\b/, 'المدرسة'],
  [/\b(الجامعة|جامعتي)\b/, 'الجامعة'],
  [/\b(العمل|الشغل|المكتب)\b/, 'العمل'],
  [/\b(المسجد|الجامع)\b/, 'المسجد'],
  [/\b(الصيدلية|الصيدليه)\b/, 'الصيدلية'],
  [/\b(المستشفى|المستشفي|المشفى)\b/, 'المستشفى'],
  [/\b(السوبر ?ماركت|البقالة|الدكان|السوبرماركت)\b/, 'البقالة'],
];

export function canonicalizePlaceName(raw: string): string {
  const t = (raw || '').trim();
  for (const [rx, name] of PLACE_SYNONYMS) if (rx.test(t)) return name;
  return t;
}

function readAll(): SavedPlace[] {
  try {
    const raw = localStorage.getItem(PLACES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function writeAll(list: SavedPlace[]) {
  try { localStorage.setItem(PLACES_KEY, JSON.stringify(list)); } catch {}
}

export function listPlaces(): SavedPlace[] { return readAll(); }

export function getPlace(name: string): SavedPlace | null {
  const c = canonicalizePlaceName(name);
  return readAll().find(p => p.name === c) ?? null;
}

export function savePlace(name: string, opts: { query?: string; coords?: LatLng } = {}): SavedPlace {
  const c = canonicalizePlaceName(name);
  const list = readAll().filter(p => p.name !== c);
  const entry: SavedPlace = { name: c, query: opts.query, coords: opts.coords, createdAt: Date.now() };
  list.push(entry);
  writeAll(list);
  return entry;
}

export function removePlace(name: string): boolean {
  const c = canonicalizePlaceName(name);
  const list = readAll();
  const next = list.filter(p => p.name !== c);
  if (next.length === list.length) return false;
  writeAll(next);
  return true;
}

// Extract "save this as X" intent from Arabic / English text.
const SAVE_PATTERNS: RegExp[] = [
  /^(?:احفظ|إحفظ|سجل|سجّل)\s+(?:هذا|هاد|هذه|هاي)?\s*(?:المكان|الموقع)?\s*(?:كـ|كـال|ك|باسم|اسمه|اسمها)?\s*(.+)$/i,
  /^save (?:this )?(?:place|location)?\s*(?:as)\s+(.+)$/i,
];

export function extractSaveAsName(raw: string): string | null {
  const t = (raw || '').trim().replace(/[.!؟?،,]+$/, '');
  for (const rx of SAVE_PATTERNS) {
    const m = t.match(rx);
    if (m && m[1]) return canonicalizePlaceName(m[1].trim());
  }
  return null;
}

// Emergency contact (phone in E.164 ideally).
export function setEmergencyPhone(phone: string) {
  try { localStorage.setItem(EMERGENCY_KEY, phone.trim()); } catch {}
}
export function getEmergencyPhone(): string | null {
  try { return localStorage.getItem(EMERGENCY_KEY); } catch { return null; }
}
