import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { cn } from '@/lib/utils';

interface AIResponseWithTTSProps {
  text: string;
  autoRead?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const AIResponseWithTTS: React.FC<AIResponseWithTTSProps> = ({
  text,
  autoRead = false,
  className,
  children,
}) => {
  const { settings } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasAutoRead = useRef(false);

  const getVoice = () => {
    const voices = speechSynthesis.getVoices();
    const isArabic = settings.preferredVoice.includes('-ar');
    return voices.find(v => 
      isArabic ? v.lang.startsWith('ar') : v.lang.startsWith('en')
    ) || voices[0];
  };

  const speak = () => {
    if (!text) return;

    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    const voice = getVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = settings.readingSpeed;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const togglePause = () => {
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    } else {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // القراءة التلقائية عند تفعيل الإعداد
  useEffect(() => {
    if (autoRead && settings.textToSpeech && text && !hasAutoRead.current) {
      hasAutoRead.current = true;
      // تأخير قصير للتأكد من تحميل الأصوات
      const timer = setTimeout(() => {
        speak();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [text, autoRead, settings.textToSpeech]);

  // تنظيف عند إزالة المكون
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  if (!settings.textToSpeech) {
    return <>{children || text}</>;
  }

  return (
    <div className={cn("relative group", className)}>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          {children || text}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isSpeaking ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={togglePause}
                title={isPaused ? "استئناف" : "إيقاف مؤقت"}
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={stop}
                title="إيقاف القراءة"
              >
                <VolumeX className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={speak}
              title="قراءة النص"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {isSpeaking && (
        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary animate-pulse rounded-full" />
      )}
    </div>
  );
};
