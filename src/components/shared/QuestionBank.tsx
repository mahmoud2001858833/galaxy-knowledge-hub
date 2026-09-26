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
  topic?: string;
}

interface QuestionBankProps {
  subject: 'chemistry' | 'physics' | 'biology' | 'mathematics';
  functionName: string;
}

const QuestionBank: React.FC<QuestionBankProps> = ({ subject, functionName }) => {
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const { toast } = useToast();

  const subjectNames = {
    chemistry: { ar: 'الكيمياء', en: 'Chemistry' },
    physics: { ar: 'الفيزياء', en: 'Physics' },
    biology: { ar: 'الأحياء', en: 'Biology' },
    mathematics: { ar: 'الرياضيات', en: 'Mathematics' }
  };

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
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          description,
          topics,
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

    let content = `=== بنك الأسئلة - ${subjectNames[subject].ar} ===\n\n`;
    
    questions.forEach((q, index) => {
      content += `السؤال ${index + 1}:\n`;
      content += `${q.question}\n\n`;
      content += `الإجابة:\n${q.answer}\n\n`;
      if (q.topic) {
        content += `الموضوع: ${q.topic}\n\n`;
      }
      content += `المستوى: ${q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}\n`;
      content += '-------------------\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subject}-questions-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "تم التصدير",
      description: "تم تصدير الأسئلة بنجاح",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-none">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <FileQuestion className="h-6 w-6 text-primary" />
            مولد بنك الأسئلة - {subjectNames[subject].ar}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              وصف نوع الأسئلة المطلوبة
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`مثال: أسئلة حول ${subjectNames[subject].ar}، حسابات، نظريات، تعاريف...`}
              className="min-h-[120px] bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              المواضيع المحددة (اختياري)
            </label>
            <Textarea
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="مثال: قوانين نيوتن، الطاقة الحركية، الموجات..."
              className="min-h-[100px] bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                عدد الأسئلة (1-50)
              </label>
              <Input
                type="number"
                min={1}
                max={50}
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="bg-slate-50 dark:bg-slate-950/60 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                مستوى الصعوبة
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="w-full px-4 py-2 rounded-md bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                disabled={loading}
              >
                <option value="easy" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">سهل</option>
                <option value="medium" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">متوسط</option>
                <option value="hard" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">صعب</option>
              </select>
            </div>
          </div>

          <Button
            onClick={generateQuestions}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-sm"
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
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              الأسئلة المُنشأة ({questions.length})
            </h3>
            <Button
              onClick={exportQuestions}
              variant="outline"
              className="gap-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              تصدير الأسئلة
            </Button>
          </div>

          {questions.map((q, index) => (
            <Card key={index} className="bg-white/95 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white text-lg">
                  السؤال {index + 1}
                  <span className="text-sm font-normal text-slate-500 dark:text-slate-400 mr-2">
                    ({q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                  <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">السؤال:</p>
                  <p className="text-slate-800 dark:text-slate-100">{q.question}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">الإجابة:</p>
                  <p className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{q.answer}</p>
                </div>
                {q.topic && (
                  <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                    <p className="font-medium text-purple-700 dark:text-purple-300 mb-1">الموضوع:</p>
                    <p className="text-slate-800 dark:text-slate-100">{q.topic}</p>
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

export default QuestionBank;