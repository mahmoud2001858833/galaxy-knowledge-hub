import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { BELang } from './i18n';

type Ctx = {
  lang: BELang;
  setLang: (l: BELang) => void;
  toggle: () => void;
};

const BlindEyeLangCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = 'blindEye.lang';

export const BlindEyeLangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<BELang>(() => {
    if (typeof window === 'undefined') return 'ar';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'ar' || stored === 'en' ? stored : 'ar';
  });

  const setLang = useCallback((l: BELang) => {
    setLangState(l);
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  const toggle = useCallback(() => setLang(lang === 'en' ? 'ar' : 'en'), [lang, setLang]);

  useEffect(() => {
    // Reflect on the document only while a Blind Eye page is mounted; restore on unmount.
    const prevDir = document.documentElement.getAttribute('dir');
    const prevLang = document.documentElement.getAttribute('lang');
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    return () => {
      if (prevDir) document.documentElement.setAttribute('dir', prevDir); else document.documentElement.removeAttribute('dir');
      if (prevLang) document.documentElement.setAttribute('lang', prevLang); else document.documentElement.removeAttribute('lang');
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, toggle }), [lang, setLang, toggle]);
  return <BlindEyeLangCtx.Provider value={value}>{children}</BlindEyeLangCtx.Provider>;
};

export const useBlindEyeLang = (): Ctx => {
  const ctx = useContext(BlindEyeLangCtx);
  if (!ctx) throw new Error('useBlindEyeLang must be inside BlindEyeLangProvider');
  return ctx;
};
