import { useEffect } from 'react';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';
import { DAMIJ_BCP47 as BCP47 } from '@/features/damij/i18n/bcp47';

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
