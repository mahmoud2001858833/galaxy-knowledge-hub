import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

interface Ctx {
  eco: boolean;
  toggle: () => void;
  setEco: (v: boolean) => void;
  /** Estimated grams of CO2 saved during this session by enabling eco mode */
  savedCo2g: number;
  /** Timestamp (ms) when eco mode was last enabled */
  enabledAt: number | null;
}

const EcoCtx = createContext<Ctx | undefined>(undefined);
const KEY = 'damij_eco_mode';

/**
 * Approximate web carbon emissions:
 *   ~0.5 g CO2 per page view in standard mode (Website Carbon Calculator avg.)
 * Eco mode disables animations, blurs, gradients, video autoplay, and large images
 * which reduces CPU/GPU and network usage. We estimate 35% reduction => ~0.18 g/min saved
 * for a continuously open tab. This is a directional estimate, not a measurement.
 */
const SAVED_G_PER_MINUTE = 0.18;

export const EcoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [eco, setEcoState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(KEY) === '1';
  });
  const [enabledAt, setEnabledAt] = useState<number | null>(null);
  const [savedCo2g, setSavedCo2g] = useState<number>(0);
  const tickRef = useRef<number | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  // Apply / unapply eco class + side-effects
  useEffect(() => {
    const root = document.documentElement;
    if (eco) root.classList.add('damij-eco'); else root.classList.remove('damij-eco');
    localStorage.setItem(KEY, eco ? '1' : '0');

    if (eco) {
      setEnabledAt(Date.now());
      // Pause and mute all videos; force preload=none on background video sources
      const applyMedia = () => {
        document.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
          try { v.pause(); v.muted = true; v.removeAttribute('autoplay'); v.preload = 'none'; } catch {}
        });
        document.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
          if (!img.loading) img.loading = 'lazy';
          img.decoding = 'async';
        });
        document.querySelectorAll<HTMLIFrameElement>('iframe').forEach((f) => {
          if (!f.loading) f.loading = 'lazy';
        });
      };
      applyMedia();
      observerRef.current = new MutationObserver(applyMedia);
      observerRef.current.observe(document.body, { subtree: true, childList: true });

      // Tick savings every 10s
      const start = Date.now();
      tickRef.current = window.setInterval(() => {
        const minutes = (Date.now() - start) / 60000;
        setSavedCo2g(Number((minutes * SAVED_G_PER_MINUTE).toFixed(2)));
      }, 10000);
    } else {
      setEnabledAt(null);
      setSavedCo2g(0);
    }

    return () => {
      if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
      if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null; }
    };
  }, [eco]);

  const toggle = useCallback(() => setEcoState((v) => !v), []);
  const setEco = useCallback((v: boolean) => setEcoState(v), []);

  return (
    <EcoCtx.Provider value={{ eco, toggle, setEco, savedCo2g, enabledAt }}>{children}</EcoCtx.Provider>
  );
};

export const useEcoMode = (): Ctx => {
  const ctx = useContext(EcoCtx);
  if (!ctx) throw new Error('useEcoMode must be used within EcoModeProvider');
  return ctx;
};
