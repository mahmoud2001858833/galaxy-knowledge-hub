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

interface EnglishQuestionBankProps {
  language: 'ar' | 'en';
}

const EnglishQuestionBank: React.FC<EnglishQuestionBankProps> = ({ language }) => {
  const [description, setDescription] = useState('');
  const [grammarRules, setGrammarRules] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const { toast } = useToast();

  const t = {
    ar: {
      title: 'مولد بنك الأسئلة',
      description: 'وصف نوع الأسئلة المطلوبة',
      descriptionPlaceholder: 'مثال: أسئلة حول القواعد والنحو، أسئلة عن الأدب الإنجليزي، أسئلة عن المفردات...',
      grammarRules: 'القواعد النحوية المحددة (اختياري)',
      grammarPlaceholder: 'مثال: Past Simple, Present Perfect, Passive Voice, Conditionals...',
      questionCount: 'عدد الأسئلة (1-50)',
      difficulty: 'مستوى الصعوبة',
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب',
      generate: 'إنشاء الأسئلة',
      generating: 'جاري إنشاء الأسئلة...',
      generatedQuestions: 'الأسئلة المُنشأة',
      export: 'تصدير الأسئلة',
      question: 'السؤال',
      answer: 'الإجابة',
      grammarRule: 'القاعدة النحوية',
      enterDescription: 'الرجاء وصف نوع الأسئلة المطلوبة',
      countError: 'عدد الأسئلة يجب أن يكون بين 1 و 50',
      questionsGenerated: 'تم إنشاء الأسئلة',
      questionsGeneratedDesc: 'تم إنشاء {count} سؤال بنجاح',
      error: 'خطأ',
      errorGenerating: 'حدث خطأ أثناء إنشاء الأسئلة',
      exported: 'تم التصدير',
      exportedDesc: 'تم تصدير الأسئلة بنجاح'
    },
    en: {
      title: 'Question Bank Generator',
      description: 'Describe the type of questions needed',
      descriptionPlaceholder: 'Example: Questions about grammar, questions about English literature, vocabulary questions...',
      grammarRules: 'Specific Grammar Rules (optional)',
      grammarPlaceholder: 'Example: Past Simple, Present Perfect, Passive Voice, Conditionals...',
      questionCount: 'Number of Questions (1-50)',
      difficulty: 'Difficulty Level',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      generate: 'Generate Questions',
      generating: 'Generating Questions...',
      generatedQuestions: 'Generated Questions',
      export: 'Export Questions',
      question: 'Question',
      answer: 'Answer',
      grammarRule: 'Grammar Rule',
      enterDescription: 'Please describe the type of questions needed',
      countError: 'Question count must be between 1 and 50',
      questionsGenerated: 'Questions Generated',
      questionsGeneratedDesc: '{count} questions generated successfully',
      error: 'Error',
      errorGenerating: 'Error generating questions',
      exported: 'Exported',
      exportedDesc: 'Questions exported successfully'
    }
  };

  const content = t[language];

  const generateQuestions = async () => {
    if (!description.trim()) {
      toast({
        title: content.error,
        description: content.enterDescription,
        variant: "destructive",
      });
      return;
    }

    if (questionCount < 1 || questionCount > 50) {
      toast({
        title: content.error,
        description: content.countError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('english-question-bank', {
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
        title: content.questionsGenerated,
        description: content.questionsGeneratedDesc.replace('{count}', data.questions.length.toString()),
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: content.error,
        description: content.errorGenerating,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportQuestions = () => {
    if (questions.length === 0) return;

    let contentText = '=== Question Bank - English Language ===\n\n';
    
    questions.forEach((q, index) => {
      contentText += `Question ${index + 1}:\n`;
      contentText += `${q.question}\n\n`;
      contentText += `Answer:\n${q.answer}\n\n`;
      if (q.grammarRule) {
        contentText += `Grammar Rule: ${q.grammarRule}\n\n`;
      }
      contentText += `Level: ${q.difficulty}\n`;
      contentText += '-------------------\n\n';
    });

    const blob = new Blob([contentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `english-questions-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: content.exported,
      description: content.exportedDesc,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileQuestion className="h-6 w-6" />
            {content.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {content.description}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={content.descriptionPlaceholder}
              className="min-h-[120px] bg-white/5 border-white/20 text-white"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {content.grammarRules}
            </label>
            <Textarea
              value={grammarRules}
              onChange={(e) => setGrammarRules(e.target.value)}
              placeholder={content.grammarPlaceholder}
              className="min-h-[100px] bg-white/5 border-white/20 text-white"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {content.questionCount}
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
                {content.difficulty}
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/20 text-white"
                disabled={loading}
              >
                <option value="easy">{content.easy}</option>
                <option value="medium">{content.medium}</option>
                <option value="hard">{content.hard}</option>
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
                {content.generating}
              </>
            ) : (
              <>
                <FileQuestion className="mr-2 h-4 w-4" />
                {content.generate}
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
              {content.generatedQuestions} ({questions.length})
            </h3>
            <Button
              onClick={exportQuestions}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {content.export}
            </Button>
          </div>

          {questions.map((q, index) => (
            <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  {content.question} {index + 1}
                  <span className="text-sm font-normal text-white/70 mr-2">
                    ({q.difficulty === 'easy' ? content.easy : q.difficulty === 'medium' ? content.medium : content.hard})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-blue-300 mb-1">{content.question}:</p>
                  <p className="text-white">{q.question}</p>
                </div>
                <div>
                  <p className="font-medium text-green-300 mb-1">{content.answer}:</p>
                  <p className="text-white whitespace-pre-wrap">{q.answer}</p>
                </div>
                {q.grammarRule && (
                  <div>
                    <p className="font-medium text-purple-300 mb-1">{content.grammarRule}:</p>
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

export default EnglishQuestionBank;