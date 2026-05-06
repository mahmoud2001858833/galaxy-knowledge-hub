import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, Video, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AIAssistantTab = () => {
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    "كيف أنشئ دالة لحساب المتوسط الحسابي؟",
    "ما الفرق بين المصفوفة والقائمة؟",
    "كيف أتعامل مع الأخطاء في البرمجة؟",
    "ما هي البرمجة الكائنية وكيف أستخدمها؟",
    "كيف أستخدم الحلقات التكرارية بشكل صحيح؟",
    "ما هي أفضل الممارسات لكتابة كود نظيف؟",
  ];

  const recommendedVideos = [
    { title: "أساسيات البرمجة للمبتدئين", url: "https://youtube.com/watch?v=example1" },
    { title: "شرح الخوارزميات بالتفصيل", url: "https://youtube.com/watch?v=example2" },
    { title: "البرمجة الكائنية من الصفر", url: "https://youtube.com/watch?v=example3" },
    { title: "هياكل البيانات المهمة", url: "https://youtube.com/watch?v=example4" },
  ];

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({ 
        title: "تنبيه", 
        description: "الرجاء إدخال سؤالك أولاً",
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    setAnswer('');
    
    try {
      console.log('Sending question:', question);
      const { data, error } = await supabase.functions.invoke('dev-assistant-service', {
        body: { action: 'programming-assistant', prompt: question }
      });

      console.log('Response data:', data);
      console.log('Response error:', error);

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }
      
      if (data && data.response) {
        setAnswer(data.response);
        toast({ 
          title: "✅ تم الحصول على الإجابة", 
          description: "تم معالجة سؤالك بنجاح"
        });
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        console.error('Invalid response format:', data);
        throw new Error('لم يتم استلام إجابة صحيحة من الخادم');
      }
    } catch (error: any) {
      console.error('AI Assistant Error:', error);
      setAnswer('حدث خطأ: ' + (error.message || 'خطأ غير معروف'));
      toast({ 
        title: "خطأ", 
        description: error.message || "حدث خطأ أثناء معالجة السؤال",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Left Side - Question Input */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Bot className="w-6 h-6 text-blue-400" />
            اسأل المساعد الذكي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="اكتب سؤالك البرمجي هنا... مثلاً: كيف أنشئ قاعدة بيانات؟"
            className="min-h-[200px] bg-white/5 border-white/10 text-lg"
            disabled={isLoading}
          />
          
          <Button 
            onClick={handleAskQuestion}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg py-6"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                جاري التفكير...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                إرسال السؤال
              </>
            )}
          </Button>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              أسئلة مقترحة:
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-500/20 border-blue-500/30 px-3 py-1.5 text-xs"
                  onClick={() => setQuestion(q)}
                >
                  {q}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Video className="w-4 h-4" />
              فيديوهات تعليمية مقترحة:
            </h3>
            <div className="space-y-2">
              {recommendedVideos.map((video, idx) => (
                <a
                  key={idx}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-400" />
                    <span className="text-sm">{video.title}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Side - Answer Display */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-purple-400" />
            الإجابة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {answer ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-invert max-w-none"
            >
              <div className="bg-white/5 rounded-lg p-6 border border-purple-500/20">
                <pre className="whitespace-pre-wrap text-gray-200 text-base leading-relaxed font-sans">
                  {answer}
                </pre>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
              <Bot className="w-20 h-20 mb-4 opacity-50" />
              <p className="text-center text-lg">
                {isLoading 
                  ? "المساعد الذكي يفكر في إجابتك..." 
                  : "اطرح سؤالك وسيظهر الجواب هنا"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIAssistantTab;
