
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast, useToast } from '@/components/ui/use-toast';

interface FormValues {
  question: string;
}

const BiologyAIAssistant = () => {
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<FormValues>();
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExampleQuestions, setShowExampleQuestions] = useState(true);
  const { toast } = useToast();
  
  const exampleQuestions = [
    "ما هي عملية البناء الضوئي؟",
    "كيف يعمل الجهاز المناعي في جسم الإنسان؟",
    "ما هي نظرية التطور لداروين؟",
    "ما هو دور الحمض النووي DNA في الخلية؟",
    "كيف تتكاثر البكتيريا؟"
  ];
  
  const handleQuestionClick = (question: string) => {
    reset({ question });
    setShowExampleQuestions(false);
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!data.question.trim()) {
      toast.error({
        title: "لا يمكن إرسال سؤال فارغ",
        description: "يرجى كتابة سؤالك قبل الإرسال"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setResponse('');
      
      const { data: responseData, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          prompt: data.question,
          subject: 'biology'
        }
      });
      
      if (error) throw error;
      
      setResponse(responseData.result);
      setShowExampleQuestions(false);
    } catch (error: any) {
      console.error('Error calling AI assistant:', error);
      toast.error({
        title: "حدث خطأ",
        description: "لم نتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center md:text-right">
        <h2 className="text-2xl font-bold text-glow-green mb-2">المساعد الذكي للأحياء</h2>
        <p className="text-white/70">استخدم المساعد الذكي للإجابة على أسئلتك في مجال الأحياء</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Textarea
            {...register('question')}
            placeholder="اكتب سؤالك هنا..."
            className="min-h-[120px] bg-white/5 border-subject-biology-primary/30 focus:border-subject-biology-primary focus-visible:ring-subject-biology-primary/20"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoading}
            className="bg-subject-biology-primary hover:bg-subject-biology-secondary"
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
                className="border-subject-biology-primary/30 hover:bg-subject-biology-primary/20 hover:text-white"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {(response || isLoading) && (
        <Card className="p-6 bg-white/5 border-subject-biology-primary/30 mt-6">
          <h3 className="text-xl font-semibold mb-4 text-subject-biology-primary">الإجابة:</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-subject-biology-primary" />
              <span className="mr-3 text-white/70">جاري التفكير...</span>
            </div>
          ) : (
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br>') }}
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default BiologyAIAssistant;
