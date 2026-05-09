import { useCallback, useEffect, useState } from 'react';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';
import { DAMIJ_BCP47 as BCP47 } from '@/features/damij/i18n/bcp47';

/**
 * Web Speech API TTS wrapper that automatically selects a voice
 * matching the active Damij language. Falls back to default voice if none found.
 */
export const useDamijSpeech = () => {
  const { lang } = useDamijLang();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener?.('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', load);
  }, []);

  const pickVoice = useCallback(
    (langCode: string) => {
      const target = BCP47[langCode] || langCode;
      const prefix = target.split('-')[0];
      return (
        voices.find((v) => v.lang.toLowerCase() === target.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(prefix.toLowerCase())) ||
        voices[0]
      );
    },
    [voices],
  );

  const speak = useCallback(
    (text: string, opts?: { lang?: string; rate?: number; pitch?: number; volume?: number }) => {
      if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const langCode = opts?.lang || lang;
      const target = BCP47[langCode] || langCode;
      u.lang = target;
      const v = pickVoice(langCode);
      if (v) u.voice = v;
      u.rate = opts?.rate ?? 1;
      u.pitch = opts?.pitch ?? 1;
      u.volume = opts?.volume ?? 1;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [lang, pickVoice],
  );

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, voices, currentBcp47: BCP47[lang] || lang };
};
