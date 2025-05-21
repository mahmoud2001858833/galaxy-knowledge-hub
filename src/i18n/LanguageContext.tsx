
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ar } from './translations/ar';
import { en } from './translations/en';

type Language = 'ar' | 'en';
type Translations = typeof ar;

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: Translations;
  dir: 'rtl' | 'ltr';
}

const translations = {
  ar,
  en
};

const defaultLanguage: Language = 'ar';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage === 'en' || savedLanguage === 'ar') ? savedLanguage : defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'ar' ? 'en' : 'ar'));
  };

  const value = {
    language,
    toggleLanguage,
    t: translations[language],
    dir: language === 'ar' ? 'rtl' : 'ltr'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
