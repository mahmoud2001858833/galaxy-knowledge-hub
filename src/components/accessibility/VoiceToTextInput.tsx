import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VoiceToTextInputProps {
  onTranscript: (text: string) => void;
  language?: 'ar' | 'en';
  className?: string;
  disabled?: boolean;
}

export const VoiceToTextInput: React.FC<VoiceToTextInputProps> = ({
  onTranscript,
  language = 'ar',
  className,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'خطأ في الوصول للميكروفون',
        description: 'يرجى السماح بالوصول للميكروفون',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // تحويل الصوت إلى base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      // إرسال للـ Edge Function
      const { data, error } = await supabase.functions.invoke('universal-speech-to-text', {
        body: { audio: base64Audio, language },
      });

      if (error) throw error;

      if (data?.text) {
        onTranscript(data.text);
        toast({
          title: 'تم التحويل بنجاح',
          description: 'تم تحويل الكلام إلى نص',
        });
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: 'خطأ في تحويل الصوت',
        description: 'حدث خطأ أثناء تحويل الكلام إلى نص',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      type="button"
      variant={isRecording ? 'destructive' : 'outline'}
      size="icon"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={cn(
        'relative transition-all duration-300',
        isRecording && 'animate-pulse ring-2 ring-red-500',
        className
      )}
      title={isRecording ? 'إيقاف التسجيل' : 'بدء التسجيل الصوتي'}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      
      {/* مؤشر التسجيل */}
      {isRecording && (
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping" />
      )}
    </Button>
  );
};
