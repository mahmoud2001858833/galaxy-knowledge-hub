export type DamijLangCode =
  | 'ar' | 'en' | 'fr' | 'es' | 'de' | 'tr' | 'ur' | 'hi'
  | 'fa' | 'he' | 'ru' | 'zh' | 'ja' | 'ko' | 'pt';

export interface DamijLangMeta {
  code: DamijLangCode;
  name: string;        // native name
  english: string;     // english name
  flag: string;        // emoji flag
  dir: 'rtl' | 'ltr';
}

export const DAMIJ_LANGS: DamijLangMeta[] = [
  { code: 'ar', name: 'العربية',     english: 'Arabic',     flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', name: 'English',     english: 'English',    flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', name: 'Français',    english: 'French',     flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Español',     english: 'Spanish',    flag: '🇪🇸', dir: 'ltr' },
  { code: 'de', name: 'Deutsch',     english: 'German',     flag: '🇩🇪', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe',      english: 'Turkish',    flag: '🇹🇷', dir: 'ltr' },
  { code: 'ur', name: 'اردو',         english: 'Urdu',       flag: '🇵🇰', dir: 'rtl' },
  { code: 'hi', name: 'हिन्दी',       english: 'Hindi',      flag: '🇮🇳', dir: 'ltr' },
  { code: 'fa', name: 'فارسی',       english: 'Persian',    flag: '🇮🇷', dir: 'rtl' },
  { code: 'he', name: 'עברית',       english: 'Hebrew',     flag: '🇮🇱', dir: 'rtl' },
  { code: 'ru', name: 'Русский',     english: 'Russian',    flag: '🇷🇺', dir: 'ltr' },
  { code: 'zh', name: '中文',        english: 'Chinese',    flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: '日本語',      english: 'Japanese',   flag: '🇯🇵', dir: 'ltr' },
  { code: 'ko', name: '한국어',      english: 'Korean',     flag: '🇰🇷', dir: 'ltr' },
  { code: 'pt', name: 'Português',   english: 'Portuguese', flag: '🇵🇹', dir: 'ltr' },
];

export interface DamijDict {
  nav: {
    home: string; sign: string; sensory: string; autism: string;
    adhd: string; braille: string; clinical: string; carbon: string;
    show: string; hide: string;
  };
  hero: {
    badge: string;
    title: string;
    tagline: string;
    desc: string;
    cta: string;
    chips: string[];
  };
  sections: {
    sign: { title: string; desc: string };
    sensory: { title: string; desc: string };
    autism: { title: string; desc: string };
    adhd: { title: string; desc: string };
    braille: { title: string; desc: string };
    clinical: { title: string; desc: string };
  };
  sources: { title: string; desc: string; cta: string };
  loader: { loading: string; preparing: string };
  assistant: {
    title: string;
    subtitle: string;
    placeholder: string;
    welcome: string;
    send: string;
    listen: string;
    open: string;
    close: string;
    navigate: string;
    thinking: string;
    error: string;
    suggestions: string[];
  };
  langSwitch: { label: string; search: string };
  footer: string;
}
