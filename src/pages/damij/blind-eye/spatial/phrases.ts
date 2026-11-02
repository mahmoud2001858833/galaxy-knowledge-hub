// Fixed sentences, prepared in the natural voice ahead of time (see blind-eye-voice).

// obstacle right in front: fixed sentences so they play instantly in the same voice
export const HAZARD_PHRASES: Record<'ar' | 'en', string[]> = {
  ar: ['قف! يوجد شيء أمامك مباشرة.', 'تحرك إلى اليمين.', 'تحرك إلى اليسار.'],
  en: ['Stop! Something is right in front of you.', 'Move to the right.', 'Move to the left.'],
};

// said often: fetched in the natural voice before they are needed
export const COMMON_PHRASES: Record<'ar' | 'en', string[]> = {
  ar: [
    'مرحباً، أنا عين الأعمى.',
    'سأتعرف على المكان من حولك. أمسك الهاتف أمام صدرك والكاميرا للأمام، واستدر حول نفسك ببطء دورة كاملة. ستسمع نقرة مع كل لقطة.',
    'استمر بالدوران', 'نصف الدورة، استمر', 'انتهى المسح.', 'تحدث، أنا أستمع...',
    'لحظة، أصف ما أمامك...', 'لحظة، أقرأ النص...', 'لحظة، أتعرف على ما أمامك...', 'تم إلغاء التوجيه',
  ],
  en: [
    'Hello, this is Blind Eye.', 'Keep turning', 'Halfway, keep turning', 'Scan complete.', 'Speak, I am listening...',
  ],
};
