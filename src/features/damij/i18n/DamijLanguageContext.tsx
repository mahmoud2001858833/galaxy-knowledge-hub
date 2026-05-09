import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { DAMIJ_LANGS, DamijLangCode, DamijDict } from './types';
import { ar } from './translations/ar';
import { en } from './translations/en';
import { fr } from './translations/fr';
import { es } from './translations/es';
import { de } from './translations/de';
import { tr } from './translations/tr';
import { ur } from './translations/ur';
import { hi } from './translations/hi';
import { fa } from './translations/fa';
import { he } from './translations/he';
import { ru } from './translations/ru';
import { zh } from './translations/zh';
import { ja } from './translations/ja';
import { ko } from './translations/ko';
import { pt } from './translations/pt';

const DICTS: Record<DamijLangCode, DamijDict> = { ar, en, fr, es, de, tr, ur, hi, fa, he, ru, zh, ja, ko, pt };

interface Ctx {
  lang: DamijLangCode;
  setLang: (l: DamijLangCode) => void;
  t: DamijDict;
  dir: 'rtl' | 'ltr';
  langs: typeof DAMIJ_LANGS;
}

const DamijLangContext = createContext<Ctx | undefined>(undefined);

const STORAGE_KEY = 'damij_lang';

export const DamijLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<DamijLangCode>(() => {
    if (typeof window === 'undefined') return 'ar';
    const saved = localStorage.getItem(STORAGE_KEY) as DamijLangCode | null;
    return saved && DICTS[saved] ? saved : 'ar';
  });

  const meta = useMemo(() => DAMIJ_LANGS.find((l) => l.code === lang)!, [lang]);

  useEffect(() => {
    document.documentElement.dir = meta.dir;
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, meta.dir]);

  const setLang = useCallback((l: DamijLangCode) => {
    if (DICTS[l]) setLangState(l);
  }, []);

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang,
    t: DICTS[lang] ?? en,
    dir: meta.dir,
    langs: DAMIJ_LANGS,
  }), [lang, meta.dir, setLang]);

  return <DamijLangContext.Provider value={value}>{children}</DamijLangContext.Provider>;
};

export const useDamijLang = (): Ctx => {
  const ctx = useContext(DamijLangContext);
  if (!ctx) throw new Error('useDamijLang must be used within DamijLanguageProvider');
  return ctx;
};
