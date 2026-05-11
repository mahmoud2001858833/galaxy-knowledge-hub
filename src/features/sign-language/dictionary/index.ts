// Unified sign dictionary: lookup local ArSL entries fast, with normalization + fuzzy search.
import { ARSL_DICTIONARY, ARSL_DICTIONARY_SIZE, ARSL_CATEGORIES, type ArSLEntry } from './arslDictionary';
import { normalizeWord } from '../useSignDictionary';
import { SIGN_SYSTEMS } from '../signSystems';

export type { ArSLEntry } from './arslDictionary';
export { ARSL_CATEGORIES };

export const DICTIONARY_BY_SYSTEM: Record<string, ArSLEntry[]> = SIGN_SYSTEMS.reduce(
  (acc, system) => {
    acc[system.code] = ARSL_DICTIONARY;
    return acc;
  },
  { ArSL: ARSL_DICTIONARY } as Record<string, ArSLEntry[]>,
);

const buildIndex = (entries: ArSLEntry[]) => {
  const m = new Map<string, ArSLEntry>();
  for (const e of entries) m.set(normalizeWord(e.word), e);
  return m;
};

const SHARED_ARSL_INDEX = buildIndex(ARSL_DICTIONARY);

const INDEXES: Record<string, Map<string, ArSLEntry>> = SIGN_SYSTEMS.reduce(
  (acc, system) => {
    acc[system.code] = SHARED_ARSL_INDEX;
    return acc;
  },
  { ArSL: SHARED_ARSL_INDEX } as Record<string, Map<string, ArSLEntry>>,
);

export function lookupSign(word: string, system: string = 'ArSL'): ArSLEntry | null {
  const idx = INDEXES[system];
  if (!idx) return null;
  const n = normalizeWord(word);
  if (!n) return null;
  if (idx.has(n)) return idx.get(n)!;
  // try without leading verb prefix "ي"
  if (n.startsWith('ي') && idx.has(n.slice(1))) return idx.get(n.slice(1))!;
  // try without leading "ال"
  if (n.startsWith('ال') && idx.has(n.slice(2))) return idx.get(n.slice(2))!;
  // strip common suffixes
  for (const suf of ['ون','ين','ات','ها','هم','نا','كم','تي']) {
    if (n.endsWith(suf) && n.length - suf.length >= 3) {
      const root = n.slice(0, -suf.length);
      if (idx.has(root)) return idx.get(root)!;
    }
  }
  return null;
}

export function searchSigns(query: string, system: string = 'ArSL', limit = 200): ArSLEntry[] {
  const list = DICTIONARY_BY_SYSTEM[system];
  if (!list) return [];
  const q = normalizeWord(query);
  if (!q) return list.slice(0, limit);
  const out: ArSLEntry[] = [];
  for (const e of list) {
    const w = normalizeWord(e.word);
    if (w === q) out.unshift(e);
    else if (w.startsWith(q) || w.includes(q)) out.push(e);
    if (out.length >= limit * 2) break;
  }
  return out.slice(0, limit);
}

export function getDictionarySize(system: string = 'ArSL'): number {
  return DICTIONARY_BY_SYSTEM[system]?.length || ARSL_DICTIONARY_SIZE;
}

export function getCategories(system: string = 'ArSL'): string[] {
  if (system === 'ArSL') return ARSL_CATEGORIES;
  const set = new Set((DICTIONARY_BY_SYSTEM[system] || []).map(e => e.category));
  return Array.from(set).sort();
}

export function getSignsByCategory(category: string, system: string = 'ArSL'): ArSLEntry[] {
  const list = DICTIONARY_BY_SYSTEM[system];
  if (!list) return [];
  return list.filter(e => e.category === category);
}
