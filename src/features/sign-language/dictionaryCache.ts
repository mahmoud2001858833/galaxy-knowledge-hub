import { supabase } from '@/integrations/supabase/client';
import { DICTIONARY } from './dictionary';

const VERSION = 'v1';
const titleKey = (lang: string) => `damij_dict_titles_${VERSION}_${lang}`;
const detailKey = (lang: string, system: string, ar: string) =>
  `damij_dict_detail_${VERSION}_${lang}_${system}_${ar}`;
const favKey = `damij_dict_favorites_${VERSION}`;

export type TitleMap = Record<string, string>; // ar -> translated

export const loadTitles = (lang: string): TitleMap => {
  if (lang.startsWith('ar')) {
    const m: TitleMap = {};
    for (const w of DICTIONARY) m[w.ar] = w.ar;
    return m;
  }
  try {
    const raw = localStorage.getItem(titleKey(lang));
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
};

export const saveTitles = (lang: string, map: TitleMap) => {
  try { localStorage.setItem(titleKey(lang), JSON.stringify(map)); } catch {}
};

export const fetchTitlesIfNeeded = async (
  lang: string,
  langName: string,
  onProgress?: (done: number, total: number) => void,
): Promise<TitleMap> => {
  if (lang.startsWith('ar')) return loadTitles(lang);
  const cached = loadTitles(lang);
  const missing = DICTIONARY.filter(w => !cached[w.ar]).map(w => w.ar);
  if (missing.length === 0) return cached;

  // Fetch in batches of 60 (function does its own internal chunking too)
  const final: TitleMap = { ...cached };
  const batchSize = 60;
  let done = 0;
  for (let i = 0; i < missing.length; i += batchSize) {
    const slice = missing.slice(i, i + batchSize);
    try {
      const { data, error } = await supabase.functions.invoke('damij-dict-translate-batch', {
        body: { words: slice, targetLang: lang, targetLangName: langName },
      });
      if (error) throw error;
      const translations = (data as any)?.translations as TitleMap | undefined;
      if (translations) {
        Object.assign(final, translations);
        saveTitles(lang, final);
      }
    } catch (e) {
      console.warn('batch translate failed', e);
    }
    done += slice.length;
    onProgress?.(Math.min(done, missing.length), missing.length);
  }
  return final;
};

export interface WordDetail {
  primary: string;
  phonetic?: string;
  description: string;
  fingerspelling: { letter: string; sign: string }[];
  synonyms: string[];
  example_sentence: string;
  example_translation_ar: string;
  translations: Record<string, string>;
  tips: string;
}

export const loadDetail = (lang: string, system: string, ar: string): WordDetail | null => {
  try {
    const raw = localStorage.getItem(detailKey(lang, system, ar));
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

export const saveDetail = (lang: string, system: string, ar: string, d: WordDetail) => {
  try { localStorage.setItem(detailKey(lang, system, ar), JSON.stringify(d)); } catch {}
};

export const fetchDetail = async (
  ar: string,
  lang: string,
  langName: string,
  system: string,
): Promise<WordDetail> => {
  const cached = loadDetail(lang, system, ar);
  if (cached) return cached;
  const { data, error } = await supabase.functions.invoke('damij-dict-lookup', {
    body: { ar_word: ar, target_lang: lang, target_lang_name: langName, sign_system: system },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  const result = (data as any).result as WordDetail;
  saveDetail(lang, system, ar, result);
  return result;
};

// favorites
export const getFavorites = (): string[] => {
  try { return JSON.parse(localStorage.getItem(favKey) || '[]'); } catch { return []; }
};
export const toggleFavorite = (id: string): string[] => {
  const cur = getFavorites();
  const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
  try { localStorage.setItem(favKey, JSON.stringify(next)); } catch {}
  return next;
};
