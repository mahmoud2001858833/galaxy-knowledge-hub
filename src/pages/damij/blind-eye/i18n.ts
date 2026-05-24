// Blind Eye bilingual strings (English default + Arabic toggle)
export type BELang = 'en' | 'ar';

export const BE_BCP47: Record<BELang, string> = {
  en: 'en-US',
  ar: 'ar-SA',
};

type Dict = {
  back: string;
  stop: string;
  start: string;
  scan: string;
  listening: string;
  silent: string;
  companion: string;
  blind: string;
  calibrating: string;
  guiding: string;
  stopped: string;
  starting: string;
  rateLimit: string;
  outOfCredits: string;
  cameraDenied: string;
  cameraFailed: string;
  busy: string;
  switchedLang: string;
  // Spoken
  greet: string;
  startNow: string;
  starting2: string;
  stopping: string;
  scanningArea: string;
  scanning: string;
  stop_loud: string;
  systemBusy: string;
  // Helper labels
  langToggleTitle: string;
  suggestionsTitle: string;
  ariaSwitchLang: string;
  ariaScan: string;
  ariaToggleCompanion: string;
  ariaEyesOff: string;
  ariaPower: string;
};

const EN: Dict = {
  back: 'Back',
  stop: 'Stop',
  start: 'Start',
  scan: 'Scan',
  listening: 'Listening',
  silent: 'Silent',
  companion: 'Companion',
  blind: 'Blind',
  calibrating: 'Aligning',
  guiding: 'Guiding',
  stopped: 'Stopped',
  starting: 'Starting',
  rateLimit: 'System busy',
  outOfCredits: 'Out of credits',
  cameraDenied: 'Camera permission denied',
  cameraFailed: 'Could not open the camera',
  busy: 'Busy',
  switchedLang: 'Switched to English',
  greet: 'Hello, hold the phone level so I can see the path.',
  startNow: 'Starting now',
  starting2: 'Started. You can talk to me anytime.',
  stopping: 'Stopped',
  scanningArea: 'One moment, scanning the area',
  scanning: 'Scanning',
  stop_loud: 'Stop!',
  systemBusy: 'System is a little busy',
  langToggleTitle: 'Switch language',
  suggestionsTitle: 'Try asking',
  ariaSwitchLang: 'Switch language',
  ariaScan: 'Scan area',
  ariaToggleCompanion: 'Companion mode',
  ariaEyesOff: 'Screen off',
  ariaPower: 'Power',
};

const AR: Dict = {
  back: 'رجوع',
  stop: 'إيقاف',
  start: 'تشغيل',
  scan: 'مسح',
  listening: 'يستمع',
  silent: 'صامت',
  companion: 'مرافق',
  blind: 'كفيف',
  calibrating: 'معايرة',
  guiding: 'إرشاد',
  stopped: 'متوقف',
  starting: 'يبدأ',
  rateLimit: 'النظام مزدحم',
  outOfCredits: 'نفذت الأرصدة',
  cameraDenied: 'الرجاء السماح بالوصول للكاميرا',
  cameraFailed: 'تعذّر فتح الكاميرا',
  busy: 'مشغول',
  switchedLang: 'تم التحويل إلى العربية',
  greet: 'مرحباً، أمسك الهاتف باستقامة لأرى الطريق.',
  startNow: 'سأبدأ الآن',
  starting2: 'بدأنا. تستطيع التحدث معي في أي وقت.',
  stopping: 'تم الإيقاف',
  scanningArea: 'لحظة، أمسح المنطقة الآن',
  scanning: 'أمسح',
  stop_loud: 'قف!',
  systemBusy: 'النظام مشغول قليلاً',
  langToggleTitle: 'تغيير اللغة',
  suggestionsTitle: 'جرّب أن تسأل',
  ariaSwitchLang: 'تغيير اللغة',
  ariaScan: 'مسح المنطقة',
  ariaToggleCompanion: 'وضع المرافق',
  ariaEyesOff: 'إيقاف الشاشة',
  ariaPower: 'تشغيل/إيقاف',
};

export const BE_STRINGS: Record<BELang, Dict> = { en: EN, ar: AR };

export const defaultSuggestions: Record<BELang, string[]> = {
  en: ['What is in front of me?', 'Is the path clear?', 'Read any text you see'],
  ar: ['ماذا أمامي؟', 'هل الطريق آمن؟', 'اقرأ أي نص تراه'],
};
