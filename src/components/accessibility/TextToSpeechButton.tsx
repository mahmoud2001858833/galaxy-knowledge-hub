import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
  showControls?: boolean;
}

const voiceOptions = [
  { id: 'Aria', name: 'أريا (أنثى)', lang: 'ar' },
  { id: 'Roger', name: 'روجر (ذكر)', lang: 'ar' },
  { id: 'Sarah', name: 'سارة (أنثى)', lang: 'en' },
  { id: 'Charlie', name: 'تشارلي (ذكر)', lang: 'en' },
];

export const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({
  text,
  className,
  showControls = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { settings } = useAccessibility();

  const getVoiceFromSettings = () => {
    switch (settings.preferredVoice) {
      case 'female-ar':
        return 'Aria';
      case 'male-ar':
        return 'Roger';
      case 'female-en':
        return 'Sarah';
      case 'male-en':
        return 'Charlie';
      default:
        return 'Aria';
    }
  };

  const speak = useCallback(async (voiceId?: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const selectedVoice = voiceId || getVoiceFromSettings();
      
      const { data, error } = await supabase.functions.invoke('accessibility-text-to-speech', {
        body: { 
          text, 
          voice: selectedVoice,
          speed: settings.readingSpeed 
        },
      });

      if (error) throw error;

      if (data?.audioContent) {
        // إنشاء عنصر صوتي
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        const audio = new Audio(audioUrl);
        audio.playbackRate = settings.readingSpeed;
        audioRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);
          setIsPaused(false);
        };

        audio.onpause = () => {
          setIsPaused(true);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };

        audio.onerror = () => {
          setIsPlaying(false);
          toast({
            title: 'خطأ في التشغيل',
            description: 'حدث خطأ أثناء تشغيل الصوت',
            variant: 'destructive',
          });
        };

        await audio.play();
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      toast({
        title: 'خطأ في تحويل النص',
        description: 'حدث خطأ أثناء تحويل النص إلى كلام',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [text, settings.readingSpeed, settings.preferredVoice, toast]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) {
      speak();
      return;
    }

    if (isPaused) {
      audioRef.current.play();
    } else if (isPlaying) {
      audioRef.current.pause();
    } else {
      speak();
    }
  }, [isPaused, isPlaying, speak]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);

  if (!showControls) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => speak()}
        disabled={isLoading || !text.trim()}
        className={cn('h-8 w-8', className)}
        title="استمع للنص"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        disabled={isLoading || !text.trim()}
        className="h-8 w-8"
        title={isPlaying && !isPaused ? 'إيقاف مؤقت' : 'تشغيل'}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying && !isPaused ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {isPlaying && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={stop}
          className="h-8 w-8"
          title="إيقاف"
        >
          <VolumeX className="h-4 w-4" />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="اختر الصوت"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {voiceOptions.map((voice) => (
            <DropdownMenuItem
              key={voice.id}
              onClick={() => speak(voice.id)}
            >
              {voice.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
