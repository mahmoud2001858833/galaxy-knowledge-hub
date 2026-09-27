import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AccessibilityMode = 'standard' | 'visual' | 'hearing' | 'motor' | 'cognitive';
export type FontSize = 'small' | 'medium' | 'large' | 'xl';
export type PreferredVoice = 'female-ar' | 'male-ar' | 'female-en' | 'male-en';

export interface AccessibilitySettings {
  accessibilityMode: AccessibilityMode;
  fontSize: FontSize;
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  voiceInput: boolean;
  signLanguage: boolean;
  textToSpeech: boolean;
  readingGuide: boolean;
  largeCursor: boolean;
  dyslexiaFont: boolean;
  highlightLinks: boolean;
  readingSpeed: number;
  preferredVoice: PreferredVoice;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  isLoading: boolean;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  activeFeaturesCount: number;
}

// All accessibility settings are OFF / DEFAULT initially
export const defaultAccessibilitySettings: AccessibilitySettings = {
  accessibilityMode: 'standard',
  fontSize: 'medium',
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  voiceInput: false,
  signLanguage: false,
  textToSpeech: false,
  readingGuide: false,
  largeCursor: false,
  dyslexiaFont: false,
  highlightLinks: false,
  readingSpeed: 1.0,
  preferredVoice: 'female-ar',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'galaxy_accessibility_settings_v2';

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultAccessibilitySettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastSpokenElementRef = useRef<HTMLElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load Settings on start
  useEffect(() => {
    loadSettings();
  }, []);

  // Apply Settings to DOM whenever they change
  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  // Count how many features are currently turned ON
  const activeFeaturesCount = [
    settings.accessibilityMode !== 'standard',
    settings.fontSize !== 'medium',
    settings.highContrast,
    settings.reduceMotion,
    settings.screenReader,
    settings.voiceInput,
    settings.signLanguage,
    settings.textToSpeech,
    settings.readingGuide,
    settings.largeCursor,
    settings.dyslexiaFont,
    settings.highlightLinks
  ].filter(Boolean).length;

  const loadSettings = async () => {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...defaultAccessibilitySettings, ...parsed });
      }

      // Check DB if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_accessibility_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          const dbSettings: Partial<AccessibilitySettings> = {
            accessibilityMode: (data.accessibility_mode as AccessibilityMode) || 'standard',
            fontSize: (data.font_size as FontSize) || 'medium',
            highContrast: Boolean(data.high_contrast),
            reduceMotion: Boolean(data.reduce_motion),
            screenReader: Boolean(data.screen_reader),
            voiceInput: Boolean(data.voice_input),
            signLanguage: Boolean(data.sign_language),
            textToSpeech: Boolean(data.text_to_speech),
            readingSpeed: Number(data.reading_speed) || 1.0,
            preferredVoice: (data.preferred_voice as PreferredVoice) || 'female-ar',
          };
          setSettings(prev => ({ ...prev, ...dbSettings }));
        }
      }
    } catch (error) {
      console.warn('Error loading accessibility settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AccessibilitySettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_accessibility_settings').upsert({
          user_id: user.id,
          accessibility_mode: newSettings.accessibilityMode,
          font_size: newSettings.fontSize,
          high_contrast: newSettings.highContrast,
          reduce_motion: newSettings.reduceMotion,
          screen_reader: newSettings.screenReader,
          voice_input: newSettings.voiceInput,
          sign_language: newSettings.signLanguage,
          text_to_speech: newSettings.textToSpeech,
          reading_speed: newSettings.readingSpeed,
          preferred_voice: newSettings.preferredVoice,
        });
      }
    } catch (error) {
      console.warn('Error saving accessibility settings:', error);
    }
  };

  const applySettings = (currentSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // 1. Font Size Scaling (Clean rem scaling on document element)
    if (currentSettings.fontSize === 'large') {
      root.style.fontSize = '112.5%'; // ~18px
    } else if (currentSettings.fontSize === 'xl') {
      root.style.fontSize = '125%';   // ~20px
    } else if (currentSettings.fontSize === 'small') {
      root.style.fontSize = '90%';    // ~14.4px
    } else {
      root.style.fontSize = '';       // Default 100% natural
    }

    // 2. High Contrast
    if (currentSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 3. Reduce Motion
    if (currentSettings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // 4. Highlight Links
    if (currentSettings.highlightLinks) {
      root.classList.add('accessibility-highlight-links');
    } else {
      root.classList.remove('accessibility-highlight-links');
    }

    // 5. Dyslexia / Enhanced Line Spacing
    if (currentSettings.dyslexiaFont) {
      root.classList.add('accessibility-dyslexia');
    } else {
      root.classList.remove('accessibility-dyslexia');
    }

    // 6. Large Cursor
    if (currentSettings.largeCursor) {
      root.classList.add('accessibility-large-cursor');
    } else {
      root.classList.remove('accessibility-large-cursor');
    }

    // 7. Mode attribute
    root.setAttribute('data-accessibility-mode', currentSettings.accessibilityMode);
  };

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  };

  // Turn ALL settings completely OFF (Back to 100% natural default)
  const resetSettings = () => {
    stopSpeaking();
    setSettings(defaultAccessibilitySettings);
    saveSettings(defaultAccessibilitySettings);
  };

  // Web Speech API Voice Selection & Utterance
  const speakText = useCallback((text: string) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const isArabic = settings.preferredVoice.includes('-ar');
      const isFemale = settings.preferredVoice.includes('female');

      utterance.lang = isArabic ? 'ar-SA' : 'en-US';
      utterance.rate = settings.readingSpeed || 1.0;
      utterance.pitch = isFemale ? 1.1 : 0.95;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => {
        const matchesLang = isArabic ? v.lang && (v.lang.startsWith('ar') || v.lang.includes('Arabic')) : v.lang && v.lang.startsWith('en');
        if (!matchesLang) return false;
        const nameLower = v.name.toLowerCase();
        if (isFemale) {
          return nameLower.includes('female') || nameLower.includes('laila') || nameLower.includes('mariam') || nameLower.includes('zira');
        } else {
          return nameLower.includes('male') || nameLower.includes('tarik') || nameLower.includes('maged');
        }
      }) || voices.find(v => isArabic ? v.lang && v.lang.startsWith('ar') : v.lang && v.lang.startsWith('en'));

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (lastSpokenElementRef.current) {
          lastSpokenElementRef.current.classList.remove('tts-speaking-outline');
        }
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        if (lastSpokenElementRef.current) {
          lastSpokenElementRef.current.classList.remove('tts-speaking-outline');
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsSpeaking(false);
    }
  }, [settings.readingSpeed, settings.preferredVoice]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (lastSpokenElementRef.current) {
      lastSpokenElementRef.current.classList.remove('tts-speaking-outline');
      lastSpokenElementRef.current = null;
    }
  }, []);

  // Global Interactive Text-To-Speech (Triggered when user lights up textToSpeech)
  useEffect(() => {
    if (!settings.textToSpeech) {
      stopSpeaking();
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Ignore buttons inside settings panel or inputs
      if (target.closest('[data-no-tts="true"]') || target.closest('input') || target.closest('textarea')) {
        return;
      }

      // Check readable text tags
      const readableTarget = target.closest('p, h1, h2, h3, h4, h5, h6, li, [data-readable="true"]') as HTMLElement | null;
      if (!readableTarget) return;

      const rawText = readableTarget.innerText?.trim();
      if (!rawText || rawText.length < 2 || rawText.length > 500) return;

      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

      hoverTimeoutRef.current = setTimeout(() => {
        if (lastSpokenElementRef.current) {
          lastSpokenElementRef.current.classList.remove('tts-speaking-outline');
        }
        readableTarget.classList.add('tts-speaking-outline');
        lastSpokenElementRef.current = readableTarget;
        speakText(rawText);
      }, 400); // 400ms hover delay prevents jitter
    };

    const handleMouseOut = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (lastSpokenElementRef.current) {
        lastSpokenElementRef.current.classList.remove('tts-speaking-outline');
      }
    };
  }, [settings.textToSpeech, speakText, stopSpeaking]);

  return (
    <AccessibilityContext.Provider value={{ 
      settings, 
      updateSettings, 
      resetSettings, 
      isLoading,
      speakText,
      stopSpeaking,
      isSpeaking,
      activeFeaturesCount
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
