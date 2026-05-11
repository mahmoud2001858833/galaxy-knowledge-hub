import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import './autism-tokens.css';

export type AgeBucket = 'young' | 'kid' | 'teen';
export type SensoryMode = 'default' | 'calm';

interface ChildProfile {
  child_name?: string;
  age_years?: number;
  support_level?: 1 | 2 | 3 | null;
  functional_profile?: string | null;
  cognitive_profile?: string | null;
}

interface AutismAdaptiveValue {
  profile: ChildProfile | null;
  ageBucket: AgeBucket;
  sensoryMode: SensoryMode;
  setSensoryMode: (m: SensoryMode) => void;
  // helpers
  isYoung: boolean;
  iconSizeClass: string;
  baseTextClass: string;
  reduceMotion: boolean;
}

const Ctx = createContext<AutismAdaptiveValue | null>(null);

export function ageToBucket(years?: number | null): AgeBucket {
  const a = Number(years ?? 6);
  if (a <= 5) return 'young';
  if (a <= 9) return 'kid';
  return 'teen';
}

export const AutismAdaptiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [sensoryMode, setSensoryModeState] = useState<SensoryMode>(() => {
    return (localStorage.getItem('autism_sensory_mode') as SensoryMode) || 'default';
  });

  const refreshProfile = () => {
    try {
      const raw = localStorage.getItem('autism_active_profile');
      setProfile(raw ? JSON.parse(raw) : null);
    } catch { setProfile(null); }
  };

  useEffect(() => {
    refreshProfile();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'autism_active_profile') refreshProfile();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setSensoryMode = (m: SensoryMode) => {
    setSensoryModeState(m);
    localStorage.setItem('autism_sensory_mode', m);
  };

  const ageBucket = useMemo(() => ageToBucket(profile?.age_years), [profile]);

  // Apply data attributes on the body for tokens to take effect
  useEffect(() => {
    document.body.dataset.autismMode = sensoryMode;
    document.body.dataset.autismAge = ageBucket;
    return () => {
      delete document.body.dataset.autismMode;
      delete document.body.dataset.autismAge;
    };
  }, [sensoryMode, ageBucket]);

  const value: AutismAdaptiveValue = {
    profile,
    ageBucket,
    sensoryMode,
    setSensoryMode,
    isYoung: ageBucket === 'young',
    iconSizeClass: ageBucket === 'young' ? 'w-12 h-12' : ageBucket === 'kid' ? 'w-9 h-9' : 'w-7 h-7',
    baseTextClass: ageBucket === 'young' ? 'text-lg' : ageBucket === 'kid' ? 'text-base' : 'text-sm',
    reduceMotion: sensoryMode === 'calm',
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAutismAdaptive(): AutismAdaptiveValue {
  const v = useContext(Ctx);
  if (v) return v;
  // Fallback: read directly without provider so isolated pages still work.
  let profile: ChildProfile | null = null;
  try {
    const raw = localStorage.getItem('autism_active_profile');
    profile = raw ? JSON.parse(raw) : null;
  } catch { /* noop */ }
  const sensoryMode = (localStorage.getItem('autism_sensory_mode') as SensoryMode) || 'default';
  const ageBucket = ageToBucket(profile?.age_years);
  return {
    profile,
    ageBucket,
    sensoryMode,
    setSensoryMode: (m) => localStorage.setItem('autism_sensory_mode', m),
    isYoung: ageBucket === 'young',
    iconSizeClass: ageBucket === 'young' ? 'w-12 h-12' : ageBucket === 'kid' ? 'w-9 h-9' : 'w-7 h-7',
    baseTextClass: ageBucket === 'young' ? 'text-lg' : ageBucket === 'kid' ? 'text-base' : 'text-sm',
    reduceMotion: sensoryMode === 'calm',
  };
}
