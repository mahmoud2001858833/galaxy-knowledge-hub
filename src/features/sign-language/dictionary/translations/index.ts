// Lazy-loaded translations for ArSL dictionary words (Arabic word -> target language).
// Each language file is ~80-120KB and is fetched on demand via Vite dynamic import.
import { useEffect, useState, useCallback } from 'react';
import { normalizeWord } from '../../useSignDictionary';

export type SignLangCode = string;

const SUPPORTED_LANGS = new Set([
  'en','fr','es','de','tr','ur','hi','fa','he','ru','zh','ja','ko','pt','it','nl','pl','sv','no','da',
  'fi','is','el','cs','sk','hu','ro','bg','sr','hr','bs','sl','mk','sq','uk','be','lt','lv','et','mt',
  'ga','cy','gd','eu','ca','gl','lb','fo','la','eo','ku','ckb','ps','sd','ug','az','ka','hy','kk','ky',
  'uz','tk','tg','mn','bn','pa','ta','te','ml','kn','gu','mr','or','as','ne','si','dv','th','vi','id',
  'ms','tl',
]);

async function loadJson(lang: string): Promise<Record<string, string>> {
  // Served from /public to avoid bundling 7+MB of JSON at build time (causes OOM).
  const base = (import.meta as any).env?.BASE_URL || '/';
  const res = await fetch(`${base}sign-translations/${lang}.json`);
  if (!res.ok) return {};
  return await res.json();
}

const cache = new Map<string, Record<string, string>>();
const inflight = new Map<string, Promise<Record<string, string>>>();

export async function loadSignTranslations(lang: SignLangCode): Promise<Record<string, string>> {
  if (lang === 'ar') return {};
  if (cache.has(lang)) return cache.get(lang)!;
  if (inflight.has(lang)) return inflight.get(lang)!;
  const loader = LOADERS[lang];
  if (!loader) return {};
  const p = loader().then((m) => {
    const data = (m as any).default || (m as any);
    // Build a normalized lookup so we tolerate diacritics / ا variants.
    const enriched: Record<string, string> = { ...data };
    for (const k of Object.keys(data)) {
      const n = normalizeWord(k);
      if (n && !enriched[n]) enriched[n] = data[k];
    }
    cache.set(lang, enriched);
    inflight.delete(lang);
    return enriched;
  });
  inflight.set(lang, p);
  return p;
}

export function translateSignSync(word: string, lang: SignLangCode): string | null {
  if (lang === 'ar') return word;
  const map = cache.get(lang);
  if (!map) return null;
  return map[word] || map[normalizeWord(word)] || null;
}

export function useSignTranslations(lang: SignLangCode) {
  const [ready, setReady] = useState(lang === 'ar' || cache.has(lang));
  useEffect(() => {
    let cancelled = false;
    if (lang === 'ar') { setReady(true); return; }
    if (cache.has(lang)) { setReady(true); return; }
    setReady(false);
    loadSignTranslations(lang).then(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [lang]);

  const translate = useCallback((word: string): string => {
    if (!word) return word;
    if (lang === 'ar') return word;
    return translateSignSync(word, lang) || word;
  }, [lang, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ready, translate, lang };
}
