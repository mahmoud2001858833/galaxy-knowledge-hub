import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GlobalVoiceInput } from '@/components/accessibility/GlobalVoiceInput';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface FormValues {
  question: string;
}

const PhysicsAIAssistant = () => {
  const { register, handleSubmit, formState: { isSubmitting }, reset, setValue, watch } = useForm<FormValues>();
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExampleQuestions, setShowExampleQuestions] = useState(true);
  const [isSpeakingResponse, setIsSpeakingResponse] = useState(false);
  const { toast } = useToast();
  const { settings, speakText, stopSpeaking } = useAccessibility();
  
  const questionValue = watch('question');
  
  const exampleQuestions = [
    "ما هو قانون نيوتن الثالث للحركة؟",
    "كيف تعمل الثقوب السوداء؟",
    "ما هي النظرية النسبية لأينشتاين؟",
    "كيف يعمل المسرع الجزيئي؟",
    "ما هو الفرق بين الطاقة الحركية والطاقة الكامنة؟"
  ];
  
  const handleQuestionClick = (question: string) => {
    reset({ question });
    setShowExampleQuestions(false);
  };

  const handleVoiceTranscript = (text: string) => {
    const currentValue = questionValue || '';
    setValue('question', currentValue + (currentValue ? ' ' : '') + text);
    setShowExampleQuestions(false);
  };

  const handleSpeakResponse = () => {
    if (isSpeakingResponse) {
      stopSpeaking();
      setIsSpeakingResponse(false);
    } else {
      // تنظيف النص من HTML
      const cleanText = response.replace(/<[^>]*>/g, '').replace(/\n+/g, '. ');
      speakText(cleanText);
      setIsSpeakingResponse(true);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!data.question.trim()) {
      toast({
        title: "لا يمكن إرسال سؤال فارغ",
        description: "يرجى كتابة سؤالك قبل الإرسال",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setResponse('');
      setIsSpeakingResponse(false);
      
      const { data: responseData, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          prompt: data.question,
          subject: 'physics',
          useGemini: true
        }
      });
      
      if (error) throw error;
      
      setResponse(responseData.result);
      setShowExampleQuestions(false);

      // قراءة الرد تلقائياً إذا كان الإعداد مفعلاً
      if (settings.textToSpeech) {
        const cleanText = responseData.result.replace(/<[^>]*>/g, '').replace(/\n+/g, '. ');
        speakText(cleanText);
        setIsSpeakingResponse(true);
      }
    } catch (error: any) {
      console.error('Error calling AI assistant:', error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center md:text-right">
        <h2 className="text-2xl font-bold text-glow-purple mb-2">المساعد الذكي للفيزياء</h2>
        <p className="text-white/70">استخدم المساعد الذكي للإجابة على أسئلتك في مجال الفيزياء</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Textarea
            {...register('question')}
            placeholder="اكتب سؤالك هنا..."
            className="min-h-[120px] bg-white/5 border-subject-physics-primary/30 focus:border-subject-physics-primary focus-visible:ring-subject-physics-primary/20"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          {/* زر الميكروفون */}
          <GlobalVoiceInput 
            onTranscript={handleVoiceTranscript}
            disabled={isLoading}
            size="md"
          />
          
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoading}
            className="bg-subject-physics-primary hover:bg-subject-physics-secondary"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            إرسال السؤال
          </Button>
        </div>
      </form>
      
      {showExampleQuestions && !response && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3 text-white/90">أسئلة مقترحة:</h3>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((question, index) => (
              <Button 
                key={index} 
                variant="outline" 
                onClick={() => handleQuestionClick(question)}
                className="border-subject-physics-primary/30 hover:bg-subject-physics-primary/20 hover:text-white"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {(response || isLoading) && (
        <Card className="p-6 bg-white/5 border-subject-physics-primary/30 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-subject-physics-primary">الإجابة:</h3>
            {response && settings.textToSpeech && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSpeakResponse}
                className="text-subject-physics-primary hover:text-subject-physics-secondary"
                title={isSpeakingResponse ? "إيقاف القراءة" : "قراءة الإجابة"}
              >
                {isSpeakingResponse ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-subject-physics-primary" />
              <span className="mr-3 text-white/70">جاري التفكير...</span>
            </div>
          ) : (
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(response.replace(/\n/g, '<br>')) }}
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default PhysicsAIAssistant;
