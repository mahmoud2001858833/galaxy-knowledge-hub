import { useEffect } from 'react';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

const BCP47: Record<string, string> = {
  ar: 'ar-SA', en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE',
  tr: 'tr-TR', ur: 'ur-PK', hi: 'hi-IN', fa: 'fa-IR', he: 'he-IL',
  ru: 'ru-RU', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', pt: 'pt-PT',
};

/**
 * While mounted, intercepts `window.speechSynthesis.speak` calls and
 * forces the utterance language + matching voice to follow the active
 * Damij UI language. This makes every existing TTS call across all
 * Damij pages (Sign, Clinical, Sensory, Braille...) speak in the
 * currently selected language without per-page edits.
 */
const DamijSpeechAutowire: React.FC = () => {
  const { lang } = useDamijLang();

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const original = synth.speak.bind(synth);

    const target = BCP47[lang] || lang;
    const prefix = target.split('-')[0];

    const pickVoice = () => {
      const voices = synth.getVoices();
      return (
        voices.find((v) => v.lang.toLowerCase() === target.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(prefix.toLowerCase()))
      );
    };

    (synth as any).speak = (utterance: SpeechSynthesisUtterance) => {
      try {
        utterance.lang = target;
        const v = pickVoice();
        if (v) utterance.voice = v;
      } catch {
        /* ignore */
      }
      return original(utterance);
    };

    return () => {
      (synth as any).speak = original;
    };
  }, [lang]);

  return null;
};

export default DamijSpeechAutowire;
