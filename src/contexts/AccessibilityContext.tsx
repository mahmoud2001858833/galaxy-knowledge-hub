import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AccessibilityMode = 'standard' | 'visual' | 'hearing' | 'motor' | 'cognitive';
export type FontSize = 'small' | 'medium' | 'large' | 'xl';
export type PreferredVoice = 'male-ar' | 'female-ar' | 'male-en' | 'female-en';

export interface AccessibilitySettings {
  accessibilityMode: AccessibilityMode;
  fontSize: FontSize;
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  voiceInput: boolean;
  signLanguage: boolean;
  textToSpeech: boolean;
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
}

const defaultSettings: AccessibilitySettings = {
  accessibilityMode: 'standard',
  fontSize: 'medium',
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  voiceInput: true,
  signLanguage: false,
  textToSpeech: true,
  readingSpeed: 1.0,
  preferredVoice: 'female-ar',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'accessibility_settings';

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // تحميل الإعدادات عند بدء التطبيق
  useEffect(() => {
    loadSettings();
  }, []);

  // تطبيق الإعدادات على الصفحة
  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  const loadSettings = async () => {
    try {
      // أولاً: جلب من localStorage
      const storedSettings = localStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }

      // ثانياً: إذا كان المستخدم مسجل، جلب من قاعدة البيانات
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_accessibility_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          const dbSettings: AccessibilitySettings = {
            accessibilityMode: data.accessibility_mode as AccessibilityMode,
            fontSize: data.font_size as FontSize,
            highContrast: data.high_contrast,
            reduceMotion: data.reduce_motion,
            screenReader: data.screen_reader,
            voiceInput: data.voice_input,
            signLanguage: data.sign_language,
            textToSpeech: data.text_to_speech,
            readingSpeed: Number(data.reading_speed),
            preferredVoice: data.preferred_voice as PreferredVoice,
          };
          setSettings(dbSettings);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dbSettings));
        }
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AccessibilitySettings) => {
    // حفظ في localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));

    // حفظ في قاعدة البيانات إذا كان المستخدم مسجل
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
      console.error('Error saving accessibility settings:', error);
    }
  };

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;

    // حجم الخط
    const fontSizeMap: Record<FontSize, string> = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '22px',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);

    // التباين العالي
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // تقليل الحركة
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // وضع الوصول
    root.setAttribute('data-accessibility-mode', settings.accessibilityMode);
  };

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  };

  // وظيفة قراءة النص العالمية
  const speakText = useCallback((text: string) => {
    if (!text || !settings.textToSpeech) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = speechSynthesis.getVoices();
    const isArabic = settings.preferredVoice.includes('-ar');
    const voice = voices.find(v => 
      isArabic ? v.lang.startsWith('ar') : v.lang.startsWith('en')
    ) || voices[0];
    
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = settings.readingSpeed;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [settings.textToSpeech, settings.readingSpeed, settings.preferredVoice]);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return (
    <AccessibilityContext.Provider value={{ 
      settings, 
      updateSettings, 
      resetSettings, 
      isLoading,
      speakText,
      stopSpeaking,
      isSpeaking,
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
