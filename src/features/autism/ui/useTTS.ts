import { useCallback, useEffect, useRef, useState } from 'react';

const PREF_KEY = 'autism_tts_enabled';

export function useTTS() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const v = localStorage.getItem(PREF_KEY);
    return v == null ? true : v === '1';
  });
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!supported) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => v.lang?.toLowerCase().startsWith('ar')) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ||
        voices[0] || null;
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
  }, [supported]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(PREF_KEY, enabled ? '1' : '0');
  }, [enabled]);

  const stop = useCallback(() => {
    if (!supported) return;
    try { window.speechSynthesis.cancel(); } catch {}
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback((text: string, opts?: { force?: boolean; rate?: number }) => {
    if (!supported || !text) return;
    if (!enabled && !opts?.force) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = voiceRef.current?.lang || 'ar-SA';
      u.rate = opts?.rate ?? 0.95;
      u.pitch = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    } catch {}
  }, [supported, enabled]);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  return { enabled, speaking, supported, speak, stop, toggle, setEnabled };
}
