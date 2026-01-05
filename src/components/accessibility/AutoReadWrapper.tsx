import React, { useEffect, useCallback, useRef } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface AutoReadWrapperProps {
  children: React.ReactNode;
}

export const AutoReadWrapper: React.FC<AutoReadWrapperProps> = ({ children }) => {
  const { settings } = useAccessibility();
  const lastSpokenText = useRef<string>('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // تحميل الأصوات
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const isArabic = settings.preferredVoice.includes('-ar');
      
      voiceRef.current = voices.find(v => 
        isArabic ? v.lang.startsWith('ar') : v.lang.startsWith('en')
      ) || voices[0];
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [settings.preferredVoice]);

  const speakText = useCallback((text: string) => {
    if (!text || text === lastSpokenText.current || text.length > 100) return;
    
    // تنظيف النص
    const cleanText = text.trim().replace(/\s+/g, ' ');
    if (!cleanText || cleanText.length < 2) return;

    lastSpokenText.current = cleanText;
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    utterance.rate = settings.readingSpeed;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    speechSynthesis.speak(utterance);
  }, [settings.readingSpeed]);

  useEffect(() => {
    if (!settings.textToSpeech) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // تجاهل العناصر التي لا تحتوي على نص مباشر
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'SVG' ||
        target.tagName === 'IMG' ||
        target.closest('[data-no-tts]')
      ) {
        return;
      }

      // الحصول على النص المباشر فقط (بدون النصوص الفرعية)
      let text = '';
      for (const node of target.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent || '';
        }
      }

      // إذا لم يكن هناك نص مباشر، نأخذ innerText للعناصر الصغيرة
      if (!text.trim() && target.innerText && target.children.length === 0) {
        text = target.innerText;
      }

      if (text.trim()) {
        // debounce لتجنب القراءة المتكررة
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
          speakText(text.trim());
        }, 200);
      }
    };

    const handleMouseOut = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      speechSynthesis.cancel();
    };
  }, [settings.textToSpeech, speakText]);

  // اختصارات لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + S = إيقاف القراءة
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        speechSynthesis.cancel();
      }
      // Escape = إيقاف القراءة
      if (e.key === 'Escape') {
        speechSynthesis.cancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <>{children}</>;
};
