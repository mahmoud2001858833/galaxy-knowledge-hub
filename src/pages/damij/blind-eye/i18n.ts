// Blind Eye bilingual strings (Arabic default + English toggle)
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
  idle: string;
  navigating: string;
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
  readyAsk: string;        // "أنا جاهز، قل لي إلى أين تريد الذهاب"
  stopping: string;
  scanningArea: string;
  scanning: string;
  stop_loud: string;
  systemBusy: string;
  navCancelled: string;
  navStartLocal: string;   // "سأرشدك إلى {x}"
  navStartGeo: string;     // "سأرشدك إلى {x}"
  navNotFound: string;     // "لم أجد الموقع، حاول باسم آخر"
  navGpsDenied: string;
  navArrived: string;      // "وصلت إلى {x}"
  navHere: string;         // "أنت الآن في موقعك الحالي"
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
  idle: 'Ready',
  navigating: 'Navigating',
  stopped: 'Stopped',
  starting: 'Starting',
  rateLimit: 'System busy',
  outOfCredits: 'Out of credits',
  cameraDenied: 'Camera permission denied',
  cameraFailed: 'Could not open the camera',
  busy: 'Busy',
  switchedLang: 'Switched to English',
  greet: 'Hello, hold the phone level so I can see the path.',
  startNow: 'Ready',
  starting2: 'I am ready. Tell me where you want to go.',
  readyAsk: 'I am ready. Tell me where you want to go.',
  stopping: 'Stopped',
  scanningArea: 'One moment, scanning the area',
  scanning: 'Scanning',
  stop_loud: 'Stop!',
  systemBusy: 'System is a little busy',
  navCancelled: 'Navigation cancelled',
  navStartLocal: 'Guiding you to',
  navStartGeo: 'Guiding you to',
  navNotFound: 'Place not found, try another name',
  navGpsDenied: 'Location permission denied',
  navArrived: 'You have arrived',
  navHere: 'You are at your current location',
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
  idle: 'جاهز',
  navigating: 'يوجّه',
  stopped: 'متوقف',
  starting: 'يبدأ',
  rateLimit: 'النظام مزدحم',
  outOfCredits: 'نفذت الأرصدة',
  cameraDenied: 'الرجاء السماح بالوصول للكاميرا',
  cameraFailed: 'تعذّر فتح الكاميرا',
  busy: 'مشغول',
  switchedLang: 'تم التحويل إلى العربية',
  greet: 'مرحباً، أمسك الهاتف باستقامة لأرى الطريق.',
  startNow: 'جاهز',
  starting2: 'أنا جاهز. قل لي إلى أين تريد الذهاب.',
  readyAsk: 'أنا جاهز. قل لي إلى أين تريد الذهاب.',
  stopping: 'تم الإيقاف',
  scanningArea: 'لحظة، أمسح المنطقة الآن',
  scanning: 'أمسح',
  stop_loud: 'قف!',
  systemBusy: 'النظام مشغول قليلاً',
  navCancelled: 'تم إلغاء التوجيه',
  navStartLocal: 'سأرشدك إلى',
  navStartGeo: 'سأرشدك إلى',
  navNotFound: 'لم أجد المكان، حاول باسم آخر',
  navGpsDenied: 'الرجاء السماح بالوصول إلى الموقع',
  navArrived: 'وصلت',
  navHere: 'أنت في موقعك الحالي',
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
  en: ['Take me to the door', 'Take me to the chair', 'What is around me?'],
  ar: ['خذني إلى الباب', 'خذني إلى الكرسي', 'ماذا حولي؟'],
};
