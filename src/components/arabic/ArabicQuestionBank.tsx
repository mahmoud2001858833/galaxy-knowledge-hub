import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileQuestion, Download, Loader2 } from 'lucide-react';

interface GeneratedQuestion {
  question: string;
  answer: string;
  difficulty: string;
  grammarRule?: string;
}

const ArabicQuestionBank = () => {
  const [description, setDescription] = useState('');
  const [grammarRules, setGrammarRules] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const { toast } = useToast();

  const generateQuestions = async () => {
    if (!description.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء وصف نوع الأسئلة المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (questionCount < 1 || questionCount > 50) {
      toast({
        title: "خطأ",
        description: "عدد الأسئلة يجب أن يكون بين 1 و 50",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('arabic-question-bank', {
        body: {
          description,
          grammarRules,
          questionCount,
          difficulty
        }
      });

      if (error) throw error;

      setQuestions(data.questions);
      toast({
        title: "تم إنشاء الأسئلة",
        description: `تم إنشاء ${data.questions.length} سؤال بنجاح`,
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الأسئلة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportQuestions = () => {
    if (questions.length === 0) return;

    let content = '=== بنك الأسئلة - اللغة العربية ===\n\n';
    
    questions.forEach((q, index) => {
      content += `السؤال ${index + 1}:\n`;
      content += `${q.question}\n\n`;
      content += `الإجابة:\n${q.answer}\n\n`;
      if (q.grammarRule) {
        content += `القاعدة: ${q.grammarRule}\n\n`;
      }
      content += `المستوى: ${q.difficulty}\n`;
      content += '-------------------\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arabic-questions-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "تم التصدير",
      description: "تم تصدير الأسئلة بنجاح",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileQuestion className="h-6 w-6" />
            مولد بنك الأسئلة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              وصف نوع الأسئلة المطلوبة
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: أسئلة حول الإعراب والنحو، أسئلة عن الشعر العربي، أسئلة عن البلاغة..."
              className="min-h-[120px] bg-white/5 border-white/20 text-white"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              القواعد النحوية المحددة (اختياري)
            </label>
            <Textarea
              value={grammarRules}
              onChange={(e) => setGrammarRules(e.target.value)}
              placeholder="مثال: الفاعل والمفعول به، التمييز، الحال، الإضافة..."
              className="min-h-[100px] bg-white/5 border-white/20 text-white"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                عدد الأسئلة (1-50)
              </label>
              <Input
                type="number"
                min={1}
                max={50}
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="bg-white/5 border-white/20 text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                مستوى الصعوبة
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/20 text-white"
                disabled={loading}
              >
                <option value="easy">سهل</option>
                <option value="medium">متوسط</option>
                <option value="hard">صعب</option>
              </select>
            </div>
          </div>

          <Button
            onClick={generateQuestions}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري إنشاء الأسئلة...
              </>
            ) : (
              <>
                <FileQuestion className="mr-2 h-4 w-4" />
                إنشاء الأسئلة
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              الأسئلة المُنشأة ({questions.length})
            </h3>
            <Button
              onClick={exportQuestions}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              تصدير الأسئلة
            </Button>
          </div>

          {questions.map((q, index) => (
            <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  السؤال {index + 1}
                  <span className="text-sm font-normal text-white/70 mr-2">
                    ({q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-blue-300 mb-1">السؤال:</p>
                  <p className="text-white">{q.question}</p>
                </div>
                <div>
                  <p className="font-medium text-green-300 mb-1">الإجابة:</p>
                  <p className="text-white whitespace-pre-wrap">{q.answer}</p>
                </div>
                {q.grammarRule && (
                  <div>
                    <p className="font-medium text-purple-300 mb-1">القاعدة النحوية:</p>
                    <p className="text-white">{q.grammarRule}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ArabicQuestionBank;
