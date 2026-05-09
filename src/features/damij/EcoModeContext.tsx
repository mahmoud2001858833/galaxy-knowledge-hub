import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface Ctx {
  eco: boolean;
  toggle: () => void;
  setEco: (v: boolean) => void;
}

const EcoCtx = createContext<Ctx | undefined>(undefined);
const KEY = 'damij_eco_mode';

export const EcoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [eco, setEcoState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(KEY) === '1';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (eco) root.classList.add('damij-eco'); else root.classList.remove('damij-eco');
    localStorage.setItem(KEY, eco ? '1' : '0');
  }, [eco]);

  const toggle = useCallback(() => setEcoState((v) => !v), []);
  const setEco = useCallback((v: boolean) => setEcoState(v), []);

  return <EcoCtx.Provider value={{ eco, toggle, setEco }}>{children}</EcoCtx.Provider>;
};

export const useEcoMode = (): Ctx => {
  const ctx = useContext(EcoCtx);
  if (!ctx) throw new Error('useEcoMode must be used within EcoModeProvider');
  return ctx;
};
