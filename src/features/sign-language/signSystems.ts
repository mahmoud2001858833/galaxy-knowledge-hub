// World sign-language systems (the linguistic standards we map gestures to).
export interface SignSystem {
  code: string;
  name: string;        // English name
  nativeName: string;  // Native/Arabic label
  region: string;
}

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
