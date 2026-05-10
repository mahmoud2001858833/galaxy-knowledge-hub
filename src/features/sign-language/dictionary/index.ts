// Unified sign dictionary: lookup local ArSL entries fast, with normalization.
import { ARSL_DICTIONARY, ARSL_DICTIONARY_SIZE, type ArSLEntry } from './arslDictionary';
import { normalizeWord } from '../useSignDictionary';

export type { ArSLEntry } from './arslDictionary';

export const DICTIONARY_BY_SYSTEM: Record<string, ArSLEntry[]> = {
  ArSL: ARSL_DICTIONARY,
};

const buildIndex = (entries: ArSLEntry[]) => {
  const m = new Map<string, ArSLEntry>();
  for (const e of entries) m.set(normalizeWord(e.word), e);
  return m;
};

const INDEXES: Record<string, Map<string, ArSLEntry>> = {
  ArSL: buildIndex(ARSL_DICTIONARY),
};

export function lookupSign(word: string, system: string = 'ArSL'): ArSLEntry | null {
  const idx = INDEXES[system] || INDEXES.ArSL;
  if (!idx) return null;
  const n = normalizeWord(word);
  if (idx.has(n)) return idx.get(n)!;
  // try without leading verb prefix "ي" (eat/drink/etc.) → exact word also tried
  if (n.startsWith('ي') && idx.has(n.slice(1))) return idx.get(n.slice(1))!;
  return null;
}

export function getDictionarySize(system: string = 'ArSL'): number {
  if (system === 'ArSL') return ARSL_DICTIONARY_SIZE;
  return DICTIONARY_BY_SYSTEM[system]?.length || 0;
}
