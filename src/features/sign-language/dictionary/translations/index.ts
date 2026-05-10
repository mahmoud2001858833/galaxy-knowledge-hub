// Lazy-loaded translations for ArSL dictionary words (Arabic word -> target language).
// Each language file is ~80-120KB and is fetched on demand via Vite dynamic import.
import { useEffect, useState, useCallback } from 'react';
import { normalizeWord } from '../../useSignDictionary';

export type SignLangCode = string;

const LOADERS: Record<string, () => Promise<{ default: Record<string, string> }>> = {
  en: () => import('./en.json'),
  fr: () => import('./fr.json'),
  es: () => import('./es.json'),
  de: () => import('./de.json'),
  tr: () => import('./tr.json'),
  ur: () => import('./ur.json'),
  hi: () => import('./hi.json'),
  fa: () => import('./fa.json'),
  he: () => import('./he.json'),
  ru: () => import('./ru.json'),
  zh: () => import('./zh.json'),
  ja: () => import('./ja.json'),
  ko: () => import('./ko.json'),
  pt: () => import('./pt.json'),
  it: () => import('./it.json'),
  nl: () => import('./nl.json'),
  pl: () => import('./pl.json'),
  sv: () => import('./sv.json'),
  no: () => import('./no.json'),
  da: () => import('./da.json'),
  fi: () => import('./fi.json'),
  is: () => import('./is.json'),
  el: () => import('./el.json'),
  cs: () => import('./cs.json'),
  sk: () => import('./sk.json'),
  hu: () => import('./hu.json'),
  ro: () => import('./ro.json'),
  bg: () => import('./bg.json'),
  sr: () => import('./sr.json'),
  hr: () => import('./hr.json'),
  bs: () => import('./bs.json'),
  sl: () => import('./sl.json'),
  mk: () => import('./mk.json'),
  sq: () => import('./sq.json'),
  uk: () => import('./uk.json'),
  be: () => import('./be.json'),
  lt: () => import('./lt.json'),
  lv: () => import('./lv.json'),
  et: () => import('./et.json'),
  mt: () => import('./mt.json'),
  ga: () => import('./ga.json'),
  cy: () => import('./cy.json'),
  gd: () => import('./gd.json'),
  eu: () => import('./eu.json'),
  ca: () => import('./ca.json'),
  gl: () => import('./gl.json'),
  lb: () => import('./lb.json'),
  fo: () => import('./fo.json'),
  la: () => import('./la.json'),
  eo: () => import('./eo.json'),
  ku: () => import('./ku.json'),
  ckb: () => import('./ckb.json'),
  ps: () => import('./ps.json'),
  sd: () => import('./sd.json'),
  ug: () => import('./ug.json'),
  az: () => import('./az.json'),
  ka: () => import('./ka.json'),
  hy: () => import('./hy.json'),
  kk: () => import('./kk.json'),
  ky: () => import('./ky.json'),
  uz: () => import('./uz.json'),
  tk: () => import('./tk.json'),
  tg: () => import('./tg.json'),
  mn: () => import('./mn.json'),
  bn: () => import('./bn.json'),
  pa: () => import('./pa.json'),
  ta: () => import('./ta.json'),
  te: () => import('./te.json'),
  ml: () => import('./ml.json'),
  kn: () => import('./kn.json'),
  gu: () => import('./gu.json'),
  mr: () => import('./mr.json'),
  or: () => import('./or.json'),
  as: () => import('./as.json'),
  ne: () => import('./ne.json'),
  si: () => import('./si.json'),
  dv: () => import('./dv.json'),
  th: () => import('./th.json'),
  vi: () => import('./vi.json'),
  id: () => import('./id.json'),
  ms: () => import('./ms.json'),
  tl: () => import('./tl.json'),
};

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
