import { useCallback, useRef, useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export const useTextToSpeech = () => {
  const { settings } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getVoice = useCallback(() => {
    const voices = speechSynthesis.getVoices();
    
    // البحث عن صوت عربي أو إنجليزي حسب الإعداد
    const isArabic = settings.preferredVoice.includes('-ar');
    const isFemale = settings.preferredVoice.includes('female');
    
    let preferredVoice = voices.find(voice => {
      if (isArabic) {
        return voice.lang.startsWith('ar') && 
          (isFemale ? voice.name.toLowerCase().includes('female') : true);
      } else {
        return voice.lang.startsWith('en') && 
          (isFemale ? voice.name.toLowerCase().includes('female') : true);
      }
    });

    // إذا لم نجد الصوت المفضل، نستخدم أي صوت عربي أو إنجليزي
    if (!preferredVoice) {
      preferredVoice = voices.find(v => isArabic ? v.lang.startsWith('ar') : v.lang.startsWith('en'));
    }

    return preferredVoice || voices[0];
  }, [settings.preferredVoice]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!text || !settings.textToSpeech) return;

    // إيقاف أي قراءة سابقة
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // تحميل الأصوات إذا لم تكن محملة
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = () => {
        utterance.voice = getVoice();
      };
    } else {
      utterance.voice = getVoice();
    }

    utterance.rate = settings.readingSpeed;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [settings.textToSpeech, settings.readingSpeed, getVoice]);

  const speakImmediate = useCallback((text: string) => {
    if (!text) return;

    // إيقاف أي قراءة سابقة
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (speechSynthesis.getVoices().length > 0) {
      utterance.voice = getVoice();
    }

    utterance.rate = settings.readingSpeed;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [settings.readingSpeed, getVoice]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    speechSynthesis.resume();
  }, []);

  return {
    speak,
    speakImmediate,
    stop,
    pause,
    resume,
    isSpeaking,
  };
};
