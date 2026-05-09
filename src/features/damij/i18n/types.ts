// Damij i18n: 100+ language registry
// Note: only a curated subset has hand-written dictionaries; all others are
// translated on the fly by DamijAutoTranslator (Lovable AI) and cached in
// localStorage. Speech uses BCP47 mapping with fallback to closest voice.

export type DamijLangCode = string;

export interface DamijLangMeta {
  code: DamijLangCode;
  name: string;        // native name
  english: string;     // english name
  flag: string;        // emoji flag
  dir: 'rtl' | 'ltr';
}

export const DAMIJ_LANGS: DamijLangMeta[] = [
  // Core / hand-translated
  { code: 'ar', name: 'العربية', english: 'Arabic', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', name: 'English', english: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', name: 'Français', english: 'French', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Español', english: 'Spanish', flag: '🇪🇸', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', english: 'German', flag: '🇩🇪', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', english: 'Turkish', flag: '🇹🇷', dir: 'ltr' },
  { code: 'ur', name: 'اردو', english: 'Urdu', flag: '🇵🇰', dir: 'rtl' },
  { code: 'hi', name: 'हिन्दी', english: 'Hindi', flag: '🇮🇳', dir: 'ltr' },
  { code: 'fa', name: 'فارسی', english: 'Persian', flag: '🇮🇷', dir: 'rtl' },
  { code: 'he', name: 'עברית', english: 'Hebrew', flag: '🇮🇱', dir: 'rtl' },
  { code: 'ru', name: 'Русский', english: 'Russian', flag: '🇷🇺', dir: 'ltr' },
  { code: 'zh', name: '中文', english: 'Chinese (Simplified)', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: '日本語', english: 'Japanese', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ko', name: '한국어', english: 'Korean', flag: '🇰🇷', dir: 'ltr' },
  { code: 'pt', name: 'Português', english: 'Portuguese', flag: '🇵🇹', dir: 'ltr' },

  // European
  { code: 'it', name: 'Italiano', english: 'Italian', flag: '🇮🇹', dir: 'ltr' },
  { code: 'nl', name: 'Nederlands', english: 'Dutch', flag: '🇳🇱', dir: 'ltr' },
  { code: 'pl', name: 'Polski', english: 'Polish', flag: '🇵🇱', dir: 'ltr' },
  { code: 'sv', name: 'Svenska', english: 'Swedish', flag: '🇸🇪', dir: 'ltr' },
  { code: 'no', name: 'Norsk', english: 'Norwegian', flag: '🇳🇴', dir: 'ltr' },
  { code: 'da', name: 'Dansk', english: 'Danish', flag: '🇩🇰', dir: 'ltr' },
  { code: 'fi', name: 'Suomi', english: 'Finnish', flag: '🇫🇮', dir: 'ltr' },
  { code: 'is', name: 'Íslenska', english: 'Icelandic', flag: '🇮🇸', dir: 'ltr' },
  { code: 'el', name: 'Ελληνικά', english: 'Greek', flag: '🇬🇷', dir: 'ltr' },
  { code: 'cs', name: 'Čeština', english: 'Czech', flag: '🇨🇿', dir: 'ltr' },
  { code: 'sk', name: 'Slovenčina', english: 'Slovak', flag: '🇸🇰', dir: 'ltr' },
  { code: 'hu', name: 'Magyar', english: 'Hungarian', flag: '🇭🇺', dir: 'ltr' },
  { code: 'ro', name: 'Română', english: 'Romanian', flag: '🇷🇴', dir: 'ltr' },
  { code: 'bg', name: 'Български', english: 'Bulgarian', flag: '🇧🇬', dir: 'ltr' },
  { code: 'sr', name: 'Српски', english: 'Serbian', flag: '🇷🇸', dir: 'ltr' },
  { code: 'hr', name: 'Hrvatski', english: 'Croatian', flag: '🇭🇷', dir: 'ltr' },
  { code: 'bs', name: 'Bosanski', english: 'Bosnian', flag: '🇧🇦', dir: 'ltr' },
  { code: 'sl', name: 'Slovenščina', english: 'Slovenian', flag: '🇸🇮', dir: 'ltr' },
  { code: 'mk', name: 'Македонски', english: 'Macedonian', flag: '🇲🇰', dir: 'ltr' },
  { code: 'sq', name: 'Shqip', english: 'Albanian', flag: '🇦🇱', dir: 'ltr' },
  { code: 'uk', name: 'Українська', english: 'Ukrainian', flag: '🇺🇦', dir: 'ltr' },
  { code: 'be', name: 'Беларуская', english: 'Belarusian', flag: '🇧🇾', dir: 'ltr' },
  { code: 'lt', name: 'Lietuvių', english: 'Lithuanian', flag: '🇱🇹', dir: 'ltr' },
  { code: 'lv', name: 'Latviešu', english: 'Latvian', flag: '🇱🇻', dir: 'ltr' },
  { code: 'et', name: 'Eesti', english: 'Estonian', flag: '🇪🇪', dir: 'ltr' },
  { code: 'mt', name: 'Malti', english: 'Maltese', flag: '🇲🇹', dir: 'ltr' },
  { code: 'ga', name: 'Gaeilge', english: 'Irish', flag: '🇮🇪', dir: 'ltr' },
  { code: 'cy', name: 'Cymraeg', english: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', dir: 'ltr' },
  { code: 'gd', name: 'Gàidhlig', english: 'Scottish Gaelic', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', dir: 'ltr' },
  { code: 'eu', name: 'Euskara', english: 'Basque', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ca', name: 'Català', english: 'Catalan', flag: '🇪🇸', dir: 'ltr' },
  { code: 'gl', name: 'Galego', english: 'Galician', flag: '🇪🇸', dir: 'ltr' },
  { code: 'lb', name: 'Lëtzebuergesch', english: 'Luxembourgish', flag: '🇱🇺', dir: 'ltr' },
  { code: 'fo', name: 'Føroyskt', english: 'Faroese', flag: '🇫🇴', dir: 'ltr' },
  { code: 'la', name: 'Latina', english: 'Latin', flag: '🏛️', dir: 'ltr' },
  { code: 'eo', name: 'Esperanto', english: 'Esperanto', flag: '🟢', dir: 'ltr' },

  // Middle East / Central Asia
  { code: 'ku', name: 'Kurdî', english: 'Kurdish', flag: '🇮🇶', dir: 'ltr' },
  { code: 'ckb', name: 'کوردی', english: 'Central Kurdish (Sorani)', flag: '🇮🇶', dir: 'rtl' },
  { code: 'ps', name: 'پښتو', english: 'Pashto', flag: '🇦🇫', dir: 'rtl' },
  { code: 'sd', name: 'سنڌي', english: 'Sindhi', flag: '🇵🇰', dir: 'rtl' },
  { code: 'ug', name: 'ئۇيغۇرچە', english: 'Uyghur', flag: '🇨🇳', dir: 'rtl' },
  { code: 'az', name: 'Azərbaycan', english: 'Azerbaijani', flag: '🇦🇿', dir: 'ltr' },
  { code: 'ka', name: 'ქართული', english: 'Georgian', flag: '🇬🇪', dir: 'ltr' },
  { code: 'hy', name: 'Հայերեն', english: 'Armenian', flag: '🇦🇲', dir: 'ltr' },
  { code: 'kk', name: 'Қазақша', english: 'Kazakh', flag: '🇰🇿', dir: 'ltr' },
  { code: 'ky', name: 'Кыргызча', english: 'Kyrgyz', flag: '🇰🇬', dir: 'ltr' },
  { code: 'uz', name: 'Oʻzbekcha', english: 'Uzbek', flag: '🇺🇿', dir: 'ltr' },
  { code: 'tk', name: 'Türkmençe', english: 'Turkmen', flag: '🇹🇲', dir: 'ltr' },
  { code: 'tg', name: 'Тоҷикӣ', english: 'Tajik', flag: '🇹🇯', dir: 'ltr' },
  { code: 'mn', name: 'Монгол', english: 'Mongolian', flag: '🇲🇳', dir: 'ltr' },

  // South Asia
  { code: 'bn', name: 'বাংলা', english: 'Bengali', flag: '🇧🇩', dir: 'ltr' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', english: 'Punjabi', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ta', name: 'தமிழ்', english: 'Tamil', flag: '🇮🇳', dir: 'ltr' },
  { code: 'te', name: 'తెలుగు', english: 'Telugu', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ml', name: 'മലയാളം', english: 'Malayalam', flag: '🇮🇳', dir: 'ltr' },
  { code: 'kn', name: 'ಕನ್ನಡ', english: 'Kannada', flag: '🇮🇳', dir: 'ltr' },
  { code: 'gu', name: 'ગુજરાતી', english: 'Gujarati', flag: '🇮🇳', dir: 'ltr' },
  { code: 'mr', name: 'मराठी', english: 'Marathi', flag: '🇮🇳', dir: 'ltr' },
  { code: 'or', name: 'ଓଡ଼ିଆ', english: 'Odia', flag: '🇮🇳', dir: 'ltr' },
  { code: 'as', name: 'অসমীয়া', english: 'Assamese', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ne', name: 'नेपाली', english: 'Nepali', flag: '🇳🇵', dir: 'ltr' },
  { code: 'si', name: 'සිංහල', english: 'Sinhala', flag: '🇱🇰', dir: 'ltr' },
  { code: 'dv', name: 'ދިވެހި', english: 'Dhivehi', flag: '🇲🇻', dir: 'rtl' },

  // Southeast Asia
  { code: 'th', name: 'ไทย', english: 'Thai', flag: '🇹🇭', dir: 'ltr' },
  { code: 'vi', name: 'Tiếng Việt', english: 'Vietnamese', flag: '🇻🇳', dir: 'ltr' },
  { code: 'id', name: 'Bahasa Indonesia', english: 'Indonesian', flag: '🇮🇩', dir: 'ltr' },
  { code: 'ms', name: 'Bahasa Melayu', english: 'Malay', flag: '🇲🇾', dir: 'ltr' },
  { code: 'tl', name: 'Filipino', english: 'Filipino (Tagalog)', flag: '🇵🇭', dir: 'ltr' },
  { code: 'my', name: 'မြန်မာ', english: 'Burmese', flag: '🇲🇲', dir: 'ltr' },
  { code: 'km', name: 'ខ្មែរ', english: 'Khmer', flag: '🇰🇭', dir: 'ltr' },
  { code: 'lo', name: 'ລາວ', english: 'Lao', flag: '🇱🇦', dir: 'ltr' },
  { code: 'jv', name: 'Basa Jawa', english: 'Javanese', flag: '🇮🇩', dir: 'ltr' },
  { code: 'su', name: 'Basa Sunda', english: 'Sundanese', flag: '🇮🇩', dir: 'ltr' },

  // East Asia (extras)
  { code: 'zh-TW', name: '繁體中文', english: 'Chinese (Traditional)', flag: '🇹🇼', dir: 'ltr' },
  { code: 'yue', name: '廣東話', english: 'Cantonese', flag: '🇭🇰', dir: 'ltr' },

  // Africa
  { code: 'sw', name: 'Kiswahili', english: 'Swahili', flag: '🇰🇪', dir: 'ltr' },
  { code: 'am', name: 'አማርኛ', english: 'Amharic', flag: '🇪🇹', dir: 'ltr' },
  { code: 'ti', name: 'ትግርኛ', english: 'Tigrinya', flag: '🇪🇷', dir: 'ltr' },
  { code: 'so', name: 'Soomaali', english: 'Somali', flag: '🇸🇴', dir: 'ltr' },
  { code: 'ha', name: 'Hausa', english: 'Hausa', flag: '🇳🇬', dir: 'ltr' },
  { code: 'yo', name: 'Yorùbá', english: 'Yoruba', flag: '🇳🇬', dir: 'ltr' },
  { code: 'ig', name: 'Igbo', english: 'Igbo', flag: '🇳🇬', dir: 'ltr' },
  { code: 'zu', name: 'isiZulu', english: 'Zulu', flag: '🇿🇦', dir: 'ltr' },
  { code: 'xh', name: 'isiXhosa', english: 'Xhosa', flag: '🇿🇦', dir: 'ltr' },
  { code: 'st', name: 'Sesotho', english: 'Sesotho', flag: '🇱🇸', dir: 'ltr' },
  { code: 'tn', name: 'Setswana', english: 'Tswana', flag: '🇧🇼', dir: 'ltr' },
  { code: 'sn', name: 'chiShona', english: 'Shona', flag: '🇿🇼', dir: 'ltr' },
  { code: 'ny', name: 'Chichewa', english: 'Chichewa', flag: '🇲🇼', dir: 'ltr' },
  { code: 'rw', name: 'Kinyarwanda', english: 'Kinyarwanda', flag: '🇷🇼', dir: 'ltr' },
  { code: 'mg', name: 'Malagasy', english: 'Malagasy', flag: '🇲🇬', dir: 'ltr' },
  { code: 'af', name: 'Afrikaans', english: 'Afrikaans', flag: '🇿🇦', dir: 'ltr' },

  // Americas / Other
  { code: 'ht', name: 'Kreyòl Ayisyen', english: 'Haitian Creole', flag: '🇭🇹', dir: 'ltr' },
  { code: 'qu', name: 'Runa Simi', english: 'Quechua', flag: '🇵🇪', dir: 'ltr' },
  { code: 'gn', name: "Avañe'ẽ", english: 'Guarani', flag: '🇵🇾', dir: 'ltr' },
  { code: 'ay', name: 'Aymar aru', english: 'Aymara', flag: '🇧🇴', dir: 'ltr' },
  { code: 'haw', name: 'ʻŌlelo Hawaiʻi', english: 'Hawaiian', flag: '🌺', dir: 'ltr' },
  { code: 'mi', name: 'Te Reo Māori', english: 'Maori', flag: '🇳🇿', dir: 'ltr' },
  { code: 'sm', name: 'Gagana Samoa', english: 'Samoan', flag: '🇼🇸', dir: 'ltr' },
  { code: 'to', name: 'Lea Faka-Tonga', english: 'Tongan', flag: '🇹🇴', dir: 'ltr' },
  { code: 'fj', name: 'Vosa Vakaviti', english: 'Fijian', flag: '🇫🇯', dir: 'ltr' },
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
  hoverSpeak: { label: string; on: string; off: string; hint: string };
  footer: string;
}
