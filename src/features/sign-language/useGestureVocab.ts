// Hook that returns the gesture vocabulary for ANY platform language.
//
// Resolution order (highest priority wins):
//   1. Manual override stored in `sign_vocab_overrides` (admin-curated)
//   2. Hand-curated SystemVocab in gestureVocab.ts
//   3. AI-translated cache in localStorage (TTL + version aware)
//   4. English baseline while translation streams in (chunked progress)
//
// Cache invalidation:
//   • CACHE_VERSION bumped in code on dictionary updates
//   • TTL of 14 days
//   • Server-side `sign_vocab_version.version` (auto-bumped on admin save)
//   • BroadcastChannel('damij-vocab') notifies open tabs instantly
//
// Streaming UX:
//   • Translation runs in chunks of 5 gestures
//   • Each chunk patches the live `vocab` so the UI shows partial results
//   • `progress` (0..1) lets callers render a progress bar
//   • Until the new dictionary is fully ready, the previous one stays visible
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  GESTURE_VOCABULARY, getSystemVocab, type SystemVocab, type GestureId, type VocabEntry,
} from './gestureVocab';
import { SIGN_SYSTEM_PRIMARY_LANG } from './signSystems';

// Bump on every code-side dictionary change.
const CACHE_VERSION = 3;
const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const CHUNK_SIZE = 5;
const SERVER_VERSION_KEY = 'damij_gesture_vocab_server_v';
const BROADCAST_NAME = 'damij-vocab';

interface CacheEnvelope {
  v: number;          // CACHE_VERSION at write time
  sv: number;         // server version at write time
  t: number;          // unix ms
  vocab: SystemVocab;
}

const CACHE_KEY = (lang: string) => `damij_gesture_vocab_${lang}`;

const ENGLISH_BASE: SystemVocab = GESTURE_VOCABULARY.ASL;

const getServerVersion = (): number => {
  try { return parseInt(localStorage.getItem(SERVER_VERSION_KEY) || '1', 10); } catch { return 1; }
};
const setServerVersion = (v: number) => {
  try { localStorage.setItem(SERVER_VERSION_KEY, String(v)); } catch { /* quota */ }
};

const loadCache = (lang: string): SystemVocab | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY(lang));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope | SystemVocab;
    // legacy entries (no envelope) → ignore so they get refetched
    if (!('vocab' in (parsed as any))) return null;
    const env = parsed as CacheEnvelope;
    if (env.v !== CACHE_VERSION) return null;
    if (env.sv !== getServerVersion()) return null;
    if (Date.now() - env.t > CACHE_TTL_MS) return null;
    return env.vocab;
  } catch { return null; }
};
const saveCache = (lang: string, vocab: SystemVocab) => {
  const env: CacheEnvelope = { v: CACHE_VERSION, sv: getServerVersion(), t: Date.now(), vocab };
  try { localStorage.setItem(CACHE_KEY(lang), JSON.stringify(env)); } catch { /* quota */ }
};

/** Wipe one or every cached dictionary. Use after admin edits. */
export function invalidateGestureVocabCache(lang?: string) {
  try {
    if (lang) {
      localStorage.removeItem(CACHE_KEY(lang));
    } else {
      Object.keys(localStorage)
        .filter(k => k.startsWith('damij_gesture_vocab_') && k !== SERVER_VERSION_KEY)
        .forEach(k => localStorage.removeItem(k));
    }
  } catch { /* ignore */ }
}

/** Resolve the spoken language code (just the base, e.g. "fr" from "fr-FR"). */
const langOf = (signSystem: string): string => {
  const meta = SIGN_SYSTEM_PRIMARY_LANG[signSystem];
  const code = meta?.code || 'en-US';
  return code.split('-')[0];
};

/** Pull manual override for a language (null if none). */
const fetchOverride = async (lang: string): Promise<SystemVocab | null> => {
  try {
    const { data, error } = await supabase
      .from('sign_vocab_overrides')
      .select('vocab')
      .eq('lang_code', lang)
      .maybeSingle();
    if (error || !data?.vocab) return null;
    // Merge with English base so any missing gesture id falls back gracefully.
    const merged: SystemVocab = { ...ENGLISH_BASE, ...(data.vocab as Partial<SystemVocab>) } as SystemVocab;
    return merged;
  } catch { return null; }
};

/** Sync the server cache version so deployments / admin edits invalidate caches. */
const syncServerVersion = async (): Promise<number> => {
  try {
    const { data } = await supabase
      .from('sign_vocab_version').select('version').eq('id', 1).maybeSingle();
    const v = (data?.version as number | undefined) ?? 1;
    if (v !== getServerVersion()) {
      setServerVersion(v);
      // any cache from a previous server version is now considered stale.
    }
    return v;
  } catch { return getServerVersion(); }
};

interface ChunkedTranslateOptions {
  signal: AbortSignal;
  onPartial: (partial: SystemVocab) => void;
  onProgress: (p: number) => void;
}

const translateVocabChunked = async (
  targetLang: string,
  { signal, onPartial, onProgress }: ChunkedTranslateOptions,
): Promise<SystemVocab | null> => {
  const ids = Object.keys(ENGLISH_BASE) as GestureId[];
  const chunks: GestureId[][] = [];
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) chunks.push(ids.slice(i, i + CHUNK_SIZE));

  const out: SystemVocab = { ...ENGLISH_BASE };
  let done = 0;
  for (const chunk of chunks) {
    if (signal.aborted) return null;
    const texts: string[] = [];
    chunk.forEach(id => { texts.push(ENGLISH_BASE[id].text); texts.push(ENGLISH_BASE[id].description); });
    try {
      const { data, error } = await supabase.functions.invoke('damij-translate', {
        body: { texts, target: targetLang, source: 'en' },
      });
      if (!error && data?.translations) {
        const map: Record<string, string> = data.translations;
        chunk.forEach(id => {
          const tText = map[ENGLISH_BASE[id].text] || ENGLISH_BASE[id].text;
          const tDesc = map[ENGLISH_BASE[id].description] || ENGLISH_BASE[id].description;
          out[id] = { text: tText, description: tDesc, emoji: ENGLISH_BASE[id].emoji };
        });
        if (signal.aborted) return null;
        onPartial({ ...out });
      }
    } catch (e) {
      console.warn('[useGestureVocab] chunk translate failed', e);
    }
    done += chunk.length;
    onProgress(Math.min(1, done / ids.length));
  }
  return out;
};

export interface UseGestureVocabResult {
  vocab: SystemVocab;
  isLoading: boolean;
  /** 0..1 — only meaningful while isLoading is true */
  progress: number;
  /** language code currently displayed (e.g. 'fr') */
  langCode: string;
  /** Whether `vocab` originates from a manual admin override */
  fromOverride: boolean;
  /** Force a full refetch: clears cache + retranslates. */
  refresh: () => void;
}

export function useGestureVocab(signSystem: string): UseGestureVocabResult {
  const lang = langOf(signSystem);
  const hasStatic = !!GESTURE_VOCABULARY[signSystem];

  const [vocab, setVocab] = useState<SystemVocab>(() => {
    if (hasStatic) return getSystemVocab(signSystem);
    return loadCache(lang) || ENGLISH_BASE;
  });
  const [isLoading, setLoading] = useState<boolean>(() => !hasStatic && !loadCache(lang));
  const [progress, setProgress] = useState(0);
  const [fromOverride, setFromOverride] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  // Keep last successful vocab to display until new one is ready.
  const prevVocabRef = useRef<SystemVocab>(vocab);

  useEffect(() => { prevVocabRef.current = vocab; }, [vocab]);

  useEffect(() => {
    let alive = true;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      // 1) Sync server version FIRST so stale caches are recognised.
      await syncServerVersion();
      if (!alive || ac.signal.aborted) return;

      // 2) Manual override always wins.
      const override = await fetchOverride(lang);
      if (!alive || ac.signal.aborted) return;
      if (override) {
        setVocab(override);
        setFromOverride(true);
        setLoading(false);
        setProgress(1);
        return;
      }
      setFromOverride(false);

      // 3) Static curated vocab (no network needed).
      if (hasStatic) {
        setVocab(getSystemVocab(signSystem));
        setLoading(false);
        setProgress(1);
        return;
      }

      // 4) Fresh cache hit.
      const cached = loadCache(lang);
      if (cached) {
        setVocab(cached);
        setLoading(false);
        setProgress(1);
        return;
      }

      // 5) Stream-translate while keeping the previous vocab visible.
      setLoading(true);
      setProgress(0);
      // Show the prior vocab (English baseline if first run) immediately.
      setVocab(prevVocabRef.current);
      const fresh = await translateVocabChunked(lang, {
        signal: ac.signal,
        onPartial: (partial) => { if (alive && !ac.signal.aborted) setVocab(partial); },
        onProgress: (p) => { if (alive && !ac.signal.aborted) setProgress(p); },
      });
      if (!alive || ac.signal.aborted) return;
      if (fresh) {
        saveCache(lang, fresh);
        setVocab(fresh);
      }
      setLoading(false);
      setProgress(1);
    })();

    return () => { alive = false; ac.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signSystem, lang, hasStatic, refreshTick]);

  // Listen for cross-tab invalidation broadcasts (admin edits, version bumps).
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel(BROADCAST_NAME);
    const onMsg = (e: MessageEvent) => {
      const data = e.data || {};
      if (data.type === 'invalidate') {
        if (!data.lang || data.lang === lang) {
          invalidateGestureVocabCache(data.lang);
          setRefreshTick(x => x + 1);
        }
      } else if (data.type === 'server-version' && typeof data.version === 'number') {
        if (data.version !== getServerVersion()) {
          setServerVersion(data.version);
          invalidateGestureVocabCache();
          setRefreshTick(x => x + 1);
        }
      }
    };
    bc.addEventListener('message', onMsg);
    return () => { bc.removeEventListener('message', onMsg); bc.close(); };
  }, [lang]);

  const refresh = () => {
    invalidateGestureVocabCache(lang);
    setRefreshTick(x => x + 1);
  };

  return useMemo(
    () => ({ vocab, isLoading, progress, langCode: lang, fromOverride, refresh }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vocab, isLoading, progress, lang, fromOverride],
  );
}

/** Notify all open tabs that a vocab cache should be invalidated. */
export function broadcastVocabInvalidation(lang?: string) {
  invalidateGestureVocabCache(lang);
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(BROADCAST_NAME);
      bc.postMessage({ type: 'invalidate', lang });
      bc.close();
    }
  } catch { /* ignore */ }
}

/** Bump the server-side cache version (admin action). */
export async function bumpServerVocabVersion(): Promise<number | null> {
  try {
    const current = await syncServerVersion();
    const next = current + 1;
    const { error } = await supabase
      .from('sign_vocab_version')
      .update({ version: next, updated_at: new Date().toISOString() })
      .eq('id', 1);
    if (error) { console.warn(error); return null; }
    setServerVersion(next);
    invalidateGestureVocabCache();
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(BROADCAST_NAME);
      bc.postMessage({ type: 'server-version', version: next });
      bc.close();
    }
    return next;
  } catch (e) { console.warn(e); return null; }
}

export function gestureFromVocab(v: SystemVocab, gestureId: string): VocabEntry | undefined {
  return (v as any)[gestureId];
}

export { ENGLISH_BASE };
