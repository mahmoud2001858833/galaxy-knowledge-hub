// World sign-language systems (the linguistic standards we map gestures to).
export interface SignSystem {
  code: string;
  name: string;        // English name
  nativeName: string;  // Native/Arabic label
  region: string;
}

// Maps each sign system to its single primary spoken language.
// In the unified UI, when the user picks a sign system we lock the spoken
// language to this value — no mixing of other languages.
export const SIGN_SYSTEM_PRIMARY_LANG: Record<string, { code: string; name: string; nativeName: string; flag: string }> = {
  ArSL:   { code: 'ar-SA', name: 'Arabic',              nativeName: 'العربية',     flag: '🇸🇦' },
  ASL:    { code: 'en-US', name: 'English (US)',        nativeName: 'English',     flag: '🇺🇸' },
  BSL:    { code: 'en-GB', name: 'English (UK)',        nativeName: 'English (UK)', flag: '🇬🇧' },
  LSF:    { code: 'fr-FR', name: 'French',              nativeName: 'Français',    flag: '🇫🇷' },
  DGS:    { code: 'de-DE', name: 'German',              nativeName: 'Deutsch',     flag: '🇩🇪' },
  LSE:    { code: 'es-ES', name: 'Spanish',             nativeName: 'Español',     flag: '🇪🇸' },
  LIS:    { code: 'it-IT', name: 'Italian',             nativeName: 'Italiano',    flag: '🇮🇹' },
  JSL:    { code: 'ja-JP', name: 'Japanese',            nativeName: '日本語',       flag: '🇯🇵' },
  KSL:    { code: 'ko-KR', name: 'Korean',              nativeName: '한국어',       flag: '🇰🇷' },
  CSL:    { code: 'zh-CN', name: 'Chinese',             nativeName: '中文',        flag: '🇨🇳' },
  ISL:    { code: 'hi-IN', name: 'Hindi',               nativeName: 'हिन्दी',       flag: '🇮🇳' },
  PSL:    { code: 'ur-PK', name: 'Urdu',                nativeName: 'اردو',        flag: '🇵🇰' },
  TSL:    { code: 'tr-TR', name: 'Turkish',             nativeName: 'Türkçe',      flag: '🇹🇷' },
  RSL:    { code: 'ru-RU', name: 'Russian',             nativeName: 'Русский',     flag: '🇷🇺' },
  Auslan: { code: 'en-AU', name: 'English (AU)',        nativeName: 'English (AU)', flag: '🇦🇺' },
  NZSL:   { code: 'en-NZ', name: 'English (NZ)',        nativeName: 'English (NZ)', flag: '🇳🇿' },
  Libras: { code: 'pt-BR', name: 'Portuguese (BR)',     nativeName: 'Português',   flag: '🇧🇷' },
  LSM:    { code: 'es-MX', name: 'Spanish (MX)',        nativeName: 'Español (MX)', flag: '🇲🇽' },
  IS:     { code: 'en-US', name: 'English (Intl.)',     nativeName: 'English',     flag: '🌐' },
};

export const SIGN_SYSTEMS: SignSystem[] = [
  { code: 'ArSL',  name: 'Arabic Sign Language (Unified)',  nativeName: 'لغة الإشارة العربية الموحّدة', region: 'الوطن العربي' },
  { code: 'ASL',   name: 'American Sign Language',          nativeName: 'الإشارة الأمريكية',          region: 'أمريكا/كندا' },
  { code: 'BSL',   name: 'British Sign Language',           nativeName: 'الإشارة البريطانية',         region: 'المملكة المتحدة' },
  { code: 'LSF',   name: 'Langue des Signes Française',     nativeName: 'الإشارة الفرنسية',           region: 'فرنسا' },
  { code: 'DGS',   name: 'Deutsche Gebärdensprache',        nativeName: 'الإشارة الألمانية',          region: 'ألمانيا' },
  { code: 'LSE',   name: 'Lengua de Signos Española',       nativeName: 'الإشارة الإسبانية',          region: 'إسبانيا' },
  { code: 'LIS',   name: 'Lingua dei Segni Italiana',       nativeName: 'الإشارة الإيطالية',          region: 'إيطاليا' },
  { code: 'JSL',   name: 'Japanese Sign Language',          nativeName: 'الإشارة اليابانية',          region: 'اليابان' },
  { code: 'KSL',   name: 'Korean Sign Language',            nativeName: 'الإشارة الكورية',            region: 'كوريا' },
  { code: 'CSL',   name: 'Chinese Sign Language',           nativeName: 'الإشارة الصينية',            region: 'الصين' },
  { code: 'ISL',   name: 'Indian Sign Language',            nativeName: 'الإشارة الهندية',            region: 'الهند' },
  { code: 'PSL',   name: 'Pakistan Sign Language',          nativeName: 'الإشارة الباكستانية',        region: 'باكستان' },
  { code: 'TSL',   name: 'Turkish Sign Language',           nativeName: 'الإشارة التركية',            region: 'تركيا' },
  { code: 'RSL',   name: 'Russian Sign Language',           nativeName: 'الإشارة الروسية',            region: 'روسيا' },
  { code: 'Auslan',name: 'Australian Sign Language',        nativeName: 'الإشارة الأسترالية',         region: 'أستراليا' },
  { code: 'NZSL',  name: 'New Zealand Sign Language',       nativeName: 'الإشارة النيوزيلندية',       region: 'نيوزيلندا' },
  { code: 'Libras',name: 'Brazilian Sign Language',         nativeName: 'الإشارة البرازيلية',         region: 'البرازيل' },
  { code: 'LSM',   name: 'Mexican Sign Language',           nativeName: 'الإشارة المكسيكية',          region: 'المكسيك' },
  { code: 'IS',    name: 'International Sign',              nativeName: 'الإشارة الدولية',            region: 'عالمي' },
];
