// Hook that returns the gesture vocabulary for ANY platform language.
// - If a hand-curated SystemVocab exists for the sign system → use it instantly.
// - Otherwise, translate the ASL English baseline into the system's primary
//   language via the damij-translate edge function and cache the result in
//   localStorage. Subsequent loads are instant.
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  GESTURE_VOCABULARY, getSystemVocab, type SystemVocab, type GestureId, type VocabEntry,
} from './gestureVocab';
import { SIGN_SYSTEM_PRIMARY_LANG } from './signSystems';

const CACHE_KEY = (lang: string) => `damij_gesture_vocab_${lang}`;

const ENGLISH_BASE: SystemVocab = GESTURE_VOCABULARY.ASL;

const loadCache = (lang: string): SystemVocab | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY(lang));
    return raw ? (JSON.parse(raw) as SystemVocab) : null;
  } catch { return null; }
};
const saveCache = (lang: string, v: SystemVocab) => {
  try { localStorage.setItem(CACHE_KEY(lang), JSON.stringify(v)); } catch { /* quota */ }
};

// Resolve the spoken language code (just the base, e.g. "fr" from "fr-FR").
const langOf = (signSystem: string): string => {
  const meta = SIGN_SYSTEM_PRIMARY_LANG[signSystem];
  const code = meta?.code || 'en-US';
  return code.split('-')[0];
};

const translateVocab = async (targetLang: string): Promise<SystemVocab | null> => {
  const ids = Object.keys(ENGLISH_BASE) as GestureId[];
  // Build a unique text list (words + descriptions) to translate in one call.
  const texts: string[] = [];
  ids.forEach(id => {
    texts.push(ENGLISH_BASE[id].text);
    texts.push(ENGLISH_BASE[id].description);
  });

  const { data, error } = await supabase.functions.invoke('damij-translate', {
    body: { texts, target: targetLang, source: 'en' },
  });
  if (error || !data?.translations) {
    console.warn('[useGestureVocab] translate error', error);
    return null;
  }
  const map: Record<string, string> = data.translations;
  const out = {} as SystemVocab;
  ids.forEach(id => {
    const tText = map[ENGLISH_BASE[id].text] || ENGLISH_BASE[id].text;
    const tDesc = map[ENGLISH_BASE[id].description] || ENGLISH_BASE[id].description;
    out[id] = { text: tText, description: tDesc, emoji: ENGLISH_BASE[id].emoji };
  });
  return out;
};

export interface UseGestureVocabResult {
  vocab: SystemVocab;
  isLoading: boolean;
  langCode: string;
}

export function useGestureVocab(signSystem: string): UseGestureVocabResult {
  const lang = langOf(signSystem);
  const hasStatic = !!GESTURE_VOCABULARY[signSystem];

  const [vocab, setVocab] = useState<SystemVocab>(() => {
    if (hasStatic) return getSystemVocab(signSystem);
    return loadCache(lang) || ENGLISH_BASE;
  });
  const [isLoading, setLoading] = useState<boolean>(() => !hasStatic && !loadCache(lang));

  useEffect(() => {
    let alive = true;
    if (hasStatic) { setVocab(getSystemVocab(signSystem)); setLoading(false); return; }
    const cached = loadCache(lang);
    if (cached) { setVocab(cached); setLoading(false); return; }
    setLoading(true);
    setVocab(ENGLISH_BASE);
    (async () => {
      const fresh = await translateVocab(lang);
      if (!alive) return;
      if (fresh) {
        saveCache(lang, fresh);
        setVocab(fresh);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [signSystem, lang, hasStatic]);

  return useMemo(() => ({ vocab, isLoading, langCode: lang }), [vocab, isLoading, lang]);
}

export function gestureFromVocab(v: SystemVocab, gestureId: string): VocabEntry | undefined {
  return (v as any)[gestureId];
}
