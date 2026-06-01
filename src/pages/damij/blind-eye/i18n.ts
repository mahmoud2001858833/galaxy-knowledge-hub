// Blind Eye multilingual strings — supports every Damij platform language.
export type BELang =
  | 'en' | 'ar' | 'fr' | 'es' | 'de' | 'pt' | 'ru' | 'tr'
  | 'fa' | 'ur' | 'he' | 'hi' | 'ja' | 'ko' | 'zh';

export const BE_BCP47: Record<BELang, string> = {
  en: 'en-US', ar: 'ar-SA', fr: 'fr-FR', es: 'es-ES', de: 'de-DE',
  pt: 'pt-PT', ru: 'ru-RU', tr: 'tr-TR', fa: 'fa-IR', ur: 'ur-PK',
  he: 'he-IL', hi: 'hi-IN', ja: 'ja-JP', ko: 'ko-KR', zh: 'zh-CN',
};

// Localized directional commands the AI must use (and that we speak locally).
export const BE_COMMANDS: Record<BELang, {
  left: string; right: string; ahead: string; stop: string; back: string; continue_: string;
}> = {
  en: { left: 'Left', right: 'Right', ahead: 'Ahead', stop: 'Stop', back: 'Back', continue_: 'Continue' },
  ar: { left: 'يسار', right: 'يمين', ahead: 'أمام', stop: 'قف', back: 'تراجع', continue_: 'استمر' },
  fr: { left: 'Gauche', right: 'Droite', ahead: 'Avancez', stop: 'Stop', back: 'Reculez', continue_: 'Continuez' },
  es: { left: 'Izquierda', right: 'Derecha', ahead: 'Adelante', stop: 'Alto', back: 'Atrás', continue_: 'Continúa' },
  de: { left: 'Links', right: 'Rechts', ahead: 'Geradeaus', stop: 'Halt', back: 'Zurück', continue_: 'Weiter' },
  pt: { left: 'Esquerda', right: 'Direita', ahead: 'Em frente', stop: 'Pare', back: 'Recue', continue_: 'Continue' },
  ru: { left: 'Налево', right: 'Направо', ahead: 'Прямо', stop: 'Стоп', back: 'Назад', continue_: 'Продолжайте' },
  tr: { left: 'Sol', right: 'Sağ', ahead: 'İleri', stop: 'Dur', back: 'Geri', continue_: 'Devam' },
  fa: { left: 'چپ', right: 'راست', ahead: 'جلو', stop: 'بایست', back: 'عقب', continue_: 'ادامه' },
  ur: { left: 'بائیں', right: 'دائیں', ahead: 'آگے', stop: 'رکو', back: 'پیچھے', continue_: 'جاری رکھیں' },
  he: { left: 'שמאלה', right: 'ימינה', ahead: 'קדימה', stop: 'עצור', back: 'אחורה', continue_: 'המשך' },
  hi: { left: 'बाएं', right: 'दाएं', ahead: 'आगे', stop: 'रुको', back: 'पीछे', continue_: 'जारी रखें' },
  ja: { left: '左', right: '右', ahead: '前へ', stop: '止まれ', back: '後ろ', continue_: '進め' },
  ko: { left: '왼쪽', right: '오른쪽', ahead: '앞으로', stop: '멈춰', back: '뒤로', continue_: '계속' },
  zh: { left: '左', right: '右', ahead: '前进', stop: '停', back: '后退', continue_: '继续' },
};

type Dict = {
  back: string; stop: string; start: string; scan: string;
  listening: string; silent: string; companion: string; blind: string;
  calibrating: string; guiding: string; idle: string; navigating: string;
  stopped: string; starting: string; rateLimit: string; outOfCredits: string;
  cameraDenied: string; cameraFailed: string; busy: string; switchedLang: string;
  greet: string; startNow: string; starting2: string; readyAsk: string;
  stopping: string; scanningArea: string; scanning: string; stop_loud: string;
  systemBusy: string; navCancelled: string; navStartLocal: string; navStartGeo: string;
  navNotFound: string; navGpsDenied: string; navArrived: string; navHere: string;
  langToggleTitle: string; suggestionsTitle: string; ariaSwitchLang: string;
  ariaScan: string; ariaToggleCompanion: string; ariaEyesOff: string; ariaPower: string;
};

const EN: Dict = {
  back: 'Back', stop: 'Stop', start: 'Start', scan: 'Scan',
  listening: 'Listening', silent: 'Silent', companion: 'Companion', blind: 'Blind',
  calibrating: 'Aligning', guiding: 'Guiding', idle: 'Ready', navigating: 'Navigating',
  stopped: 'Stopped', starting: 'Starting', rateLimit: 'System busy', outOfCredits: 'Out of credits',
  cameraDenied: 'Camera permission denied', cameraFailed: 'Could not open the camera',
  busy: 'Busy', switchedLang: 'Switched to English',
  greet: 'Hello, hold the phone level so I can see the path.',
  startNow: 'Ready', starting2: 'I am ready. Tell me where you want to go.',
  readyAsk: 'I am ready. Tell me where you want to go.',
  stopping: 'Stopped', scanningArea: 'One moment, scanning', scanning: 'Scanning',
  stop_loud: 'Stop!', systemBusy: 'System is a little busy', navCancelled: 'Navigation cancelled',
  navStartLocal: 'Guiding you to', navStartGeo: 'Guiding you to',
  navNotFound: 'Place not found, try another name', navGpsDenied: 'Location permission denied',
  navArrived: 'You have arrived', navHere: 'You are at your current location',
  langToggleTitle: 'Switch language', suggestionsTitle: 'Try asking',
  ariaSwitchLang: 'Switch language', ariaScan: 'Scan area',
  ariaToggleCompanion: 'Companion mode', ariaEyesOff: 'Screen off', ariaPower: 'Power',
};

const AR: Dict = {
  back: 'رجوع', stop: 'إيقاف', start: 'تشغيل', scan: 'مسح',
  listening: 'يستمع', silent: 'صامت', companion: 'مرافق', blind: 'كفيف',
  calibrating: 'معايرة', guiding: 'إرشاد', idle: 'جاهز', navigating: 'يوجّه',
  stopped: 'متوقف', starting: 'يبدأ', rateLimit: 'النظام مزدحم', outOfCredits: 'نفذت الأرصدة',
  cameraDenied: 'الرجاء السماح بالوصول للكاميرا', cameraFailed: 'تعذّر فتح الكاميرا',
  busy: 'مشغول', switchedLang: 'تم التحويل إلى العربية',
  greet: 'مرحباً، أمسك الهاتف باستقامة لأرى الطريق.',
  startNow: 'جاهز', starting2: 'أنا جاهز. قل لي إلى أين تريد الذهاب.',
  readyAsk: 'أنا جاهز. قل لي إلى أين تريد الذهاب.',
  stopping: 'تم الإيقاف', scanningArea: 'لحظة، أمسح المنطقة', scanning: 'أمسح',
  stop_loud: 'قف!', systemBusy: 'النظام مشغول قليلاً', navCancelled: 'تم إلغاء التوجيه',
  navStartLocal: 'سأرشدك إلى', navStartGeo: 'سأرشدك إلى',
  navNotFound: 'لم أجد المكان، حاول باسم آخر', navGpsDenied: 'الرجاء السماح بالوصول إلى الموقع',
  navArrived: 'وصلت', navHere: 'أنت في موقعك الحالي',
  langToggleTitle: 'تغيير اللغة', suggestionsTitle: 'جرّب أن تسأل',
  ariaSwitchLang: 'تغيير اللغة', ariaScan: 'مسح المنطقة',
  ariaToggleCompanion: 'وضع المرافق', ariaEyesOff: 'إيقاف الشاشة', ariaPower: 'تشغيل/إيقاف',
};

// For languages without a hand-written dictionary, we fall back to English UI strings
// but localized switchedLang and spoken commands (handled by BE_COMMANDS).
const fallbackDict = (label: string): Dict => ({ ...EN, switchedLang: label });

export const BE_STRINGS: Record<BELang, Dict> = {
  en: EN,
  ar: AR,
  fr: fallbackDict('Langue changée en français'),
  es: fallbackDict('Idioma cambiado a español'),
  de: fallbackDict('Sprache auf Deutsch geändert'),
  pt: fallbackDict('Idioma alterado para português'),
  ru: fallbackDict('Язык изменён на русский'),
  tr: fallbackDict('Dil Türkçeye değiştirildi'),
  fa: fallbackDict('زبان به فارسی تغییر کرد'),
  ur: fallbackDict('زبان اردو میں تبدیل ہو گئی'),
  he: fallbackDict('השפה שונתה לעברית'),
  hi: fallbackDict('भाषा हिंदी में बदल दी गई'),
  ja: fallbackDict('日本語に切り替えました'),
  ko: fallbackDict('한국어로 전환되었습니다'),
  zh: fallbackDict('已切换到中文'),
};

export const defaultSuggestions: Record<BELang, string[]> = {
  en: ['Take me to the door', 'What is around me?', 'Switch to Arabic'],
  ar: ['خذني إلى الباب', 'ماذا حولي؟', 'حوّل إلى الإنجليزية'],
  fr: ['Emmène-moi à la porte', "Qu'y a-t-il autour ?", "Passe à l'anglais"],
  es: ['Llévame a la puerta', '¿Qué hay alrededor?', 'Cambia al inglés'],
  de: ['Bring mich zur Tür', 'Was ist um mich herum?', 'Wechsle zu Englisch'],
  pt: ['Leve-me até a porta', 'O que há ao redor?', 'Mude para inglês'],
  ru: ['Отведи меня к двери', 'Что вокруг меня?', 'Переключи на английский'],
  tr: ['Beni kapıya götür', 'Etrafımda ne var?', 'İngilizceye geç'],
  fa: ['مرا به در ببر', 'اطرافم چیست؟', 'به انگلیسی تغییر بده'],
  ur: ['مجھے دروازے پر لے چلو', 'میرے ارد گرد کیا ہے؟', 'انگریزی پر جائیں'],
  he: ['קח אותי לדלת', 'מה סביבי?', 'עבור לאנגלית'],
  hi: ['मुझे दरवाजे तक ले चलो', 'मेरे आसपास क्या है?', 'अंग्रेज़ी में बदलो'],
  ja: ['ドアまで案内して', '周りに何がある？', '英語に切り替えて'],
  ko: ['문으로 안내해', '주변에 뭐가 있어?', '영어로 전환해'],
  zh: ['带我去门口', '我周围有什么？', '切换到英语'],
};

// Spin-scan onboarding strings (AR/EN only — other langs fall back to EN).
export const BE_SPIN: Record<BELang, {
  ask: string; progress: (p: number) => string; quarter: string;
  done: string; askDestination: string; skip: string;
}> = (() => {
  const en = {
    ask: 'Please turn slowly in a full circle so I can learn the area.',
    progress: (p: number) => `${Math.round(p * 100)} percent.`,
    quarter: 'Keep going.',
    done: 'Scan complete.',
    askDestination: 'Where would you like to go?',
    skip: 'Scan skipped.',
  };
  const ar = {
    ask: 'من فضلك استدر ببطء دورة كاملة حتى أتعرف على المكان.',
    progress: (p: number) => `${Math.round(p * 100)} بالمئة.`,
    quarter: 'استمر.',
    done: 'انتهى المسح.',
    askDestination: 'إلى أين تريد أن تذهب؟',
    skip: 'تم تخطي المسح.',
  };
  const all: any = {};
  (['en','fr','es','de','pt','ru','tr','fa','ur','he','hi','ja','ko','zh'] as BELang[]).forEach(l => { all[l] = en; });
  all.ar = ar;
  return all;
})();

