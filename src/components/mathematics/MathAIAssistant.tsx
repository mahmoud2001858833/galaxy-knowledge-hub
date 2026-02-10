
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { GlobalVoiceInput } from '@/components/accessibility/GlobalVoiceInput';

const MathAIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the edge function which uses Lovable AI Gateway
      const { data, error: funcError } = await supabase.functions.invoke('math-ai-assistant', {
        body: {
          question: prompt,
          currentValue: '0'
        }
      });
      
      if (funcError) {
        throw new Error(funcError.message || 'خطأ في الاتصال بالمساعد الذكي');
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const result = data.answer || 'لا يوجد رد من المساعد الذكي';
      
      setResponse(result);
      toast.success('تم استلام الإجابة بنجاح!');
    } catch (err: any) {
      console.error('Error calling AI assistant:', err);
      setError(err.message || 'حدث خطأ أثناء معالجة طلبك');
      setResponse('');
      toast.error('فشل الاتصال بالمساعد الذكي');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="w-12 h-1 bg-space-neon-blue/50 rounded-full"></div>
        <h2 className="text-2xl font-bold text-white">المساعد الذكي للرياضيات</h2>
        <div className="w-12 h-1 bg-space-neon-blue/50 rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="md:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اسأل أي سؤال عن الرياضيات..."
              className="bg-white/5 border-white/20 text-white h-40 text-right"
            />
            
            <div className="flex gap-2">
              <GlobalVoiceInput 
                onTranscript={(text) => setPrompt(prev => prev + (prev ? ' ' : '') + text)}
                disabled={isLoading}
                size="md"
              />
              <Button 
                type="submit"
                className="flex-1 bg-space-deep-purple hover:bg-space-deep-purple/80 text-white flex items-center justify-center gap-2"
                disabled={isLoading || !prompt.trim()}
              >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  جاري التفكير...
                </>
              ) : (
                <>
                  إرسال
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
              </Button>
            </div>
          </form>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-white mb-2 text-right font-bold">نصائح للأسئلة:</h3>
            <ul className="list-disc list-inside marker:text-space-neon-blue space-y-2 text-right text-white/70">
              <li>كيف أحل معادلة من الدرجة الثانية؟</li>
              <li>اشرح نظرية فيثاغورس</li>
              <li>ما هو التفاضل والتكامل؟</li>
              <li>كيف أحسب مساحة المثلث؟</li>
            </ul>
          </div>
        </div>
        
        <div className="md:col-span-7">
          <div className="bg-white/5 border border-white/10 rounded-lg p-5 h-full">
            <h3 className="text-white mb-4 text-right font-bold flex items-center gap-2">
              <div className="h-2 w-2 bg-space-neon-blue rounded-full"></div>
              الإجابة
            </h3>
            
            {error ? (
              <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-4 text-right">
                {error}
              </div>
            ) : response ? (
              <motion.div 
                className="text-white/90 text-right whitespace-pre-line overflow-auto max-h-[500px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {response}
              </motion.div>
            ) : (
              <div className="text-white/50 text-right italic">
                اكتب سؤالًا وسأحاول الإجابة عليه...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathAIAssistant;
