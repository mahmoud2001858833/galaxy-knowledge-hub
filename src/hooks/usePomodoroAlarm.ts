import { useCallback, useRef } from 'react';

export const usePomodoroAlarm = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playLoudAlarm = useCallback(() => {
    // إنشاء AudioContext جديد إذا لم يكن موجوداً
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    
    // تشغيل صوت عالي ومتكرر 5 مرات
    const playBeep = (startTime: number, frequency: number = 800, duration: number = 0.3) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      // رفع الصوت تدريجياً ثم خفضه
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.8, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.8, startTime + duration - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const currentTime = ctx.currentTime;
    
    // تسلسل صوتي متكرر ومميز
    // 5 تنبيهات بفواصل قصيرة
    for (let i = 0; i < 5; i++) {
      // صوت أول بتردد عالي
      playBeep(currentTime + i * 0.6, 880, 0.15);
      // صوت ثاني بتردد أعلى
      playBeep(currentTime + i * 0.6 + 0.2, 1100, 0.15);
    }

    // تأثير إضافي - صوت طويل في النهاية
    setTimeout(() => {
      if (audioContextRef.current) {
        const finalCtx = audioContextRef.current;
        const oscillator = finalCtx.createOscillator();
        const gainNode = finalCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(finalCtx.destination);
        
        oscillator.frequency.value = 660;
        oscillator.type = 'sine';
        
        const now = finalCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.6, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.6, now + 0.8);
        gainNode.gain.linearRampToValueAtTime(0, now + 1);
        
        oscillator.start(now);
        oscillator.stop(now + 1);
      }
    }, 3500);

    // محاولة تشغيل الاهتزاز إذا كان مدعوماً
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200, 100, 200, 100, 400]);
    }
  }, []);

  const playShortBeep = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.02);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
    
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }, []);

  return { playLoudAlarm, playShortBeep };
};
