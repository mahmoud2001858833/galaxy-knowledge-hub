import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Loader2, Check, X, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';

const AIQuizGenerator = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState('10');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!topic.trim()) { toast({ title: 'أدخل الموضوع', variant: 'destructive' }); return; }
    setIsGenerating(true);
    setQuiz(null); setAnswers({}); setShowResults(false);
    try {
      const { data, error } = await supabase.functions.invoke('ai-quiz-generator', {
        body: { topic, difficulty, questionCount: parseInt(questionCount), language: 'ar' }
      });
      if (error) throw error;
      setQuiz(data);
    } catch { toast({ title: 'حدث خطأ', variant: 'destructive' }); }
    finally { setIsGenerating(false); }
  };

  const selectAnswer = (qId: number, answer: any) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const calculateScore = () => {
    if (!quiz?.questions) return 0;
    let score = 0;
    quiz.questions.forEach((q: any) => {
      const userAnswer = answers[q.id];
      if (q.type === 'trueFalse') {
        if (userAnswer === q.correctAnswer) score += q.points;
      } else if (q.type === 'mcq') {
        if (userAnswer === q.correctAnswer) score += q.points;
      }
    });
    return score;
  };

  const handleSubmit = () => setShowResults(true);
  const handleReset = () => { setQuiz(null); setAnswers({}); setShowResults(false); setTopic(''); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(222,84%,5%)] via-[hsl(230,60%,8%)] to-[hsl(222,84%,5%)]" dir="rtl">
      <StarField />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate('/gju-competition')} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-6">
          <ArrowRight className="w-4 h-4" /><span>العودة للمسابقة</span>
        </button>

        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">🆕 أداة جديدة</Badge>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
            <GraduationCap className="inline w-10 h-10 ml-3 text-emerald-400" />
            مولّد الاختبارات الذكي
          </h1>
          <p className="text-white/50 text-lg">أدخل أي موضوع واحصل على اختبار كامل مع تصحيح تلقائي</p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {!quiz ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-4">
                <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="أدخل الموضوع (مثل: الثورة الصناعية، الفيزياء النووية...)" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-lg h-14" />
                <div className="flex gap-4 flex-wrap">
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">سهل</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="hard">صعب</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 أسئلة</SelectItem>
                      <SelectItem value="10">10 أسئلة</SelectItem>
                      <SelectItem value="15">15 سؤال</SelectItem>
                      <SelectItem value="20">20 سؤال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-l from-emerald-600 to-teal-600 h-12 text-lg">
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <GraduationCap className="w-5 h-5 ml-2" />}
                  {isGenerating ? 'جاري إنشاء الاختبار...' : 'أنشئ الاختبار'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {showResults && (
                <Card className="bg-gradient-to-l from-amber-900/30 to-amber-800/20 border-amber-500/30">
                  <CardContent className="p-6 text-center">
                    <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-white mb-1">النتيجة: {calculateScore()} / {quiz.totalPoints || 100}</h2>
                    <p className="text-white/50">
                      {calculateScore() >= (quiz.totalPoints || 100) * 0.8 ? '🎉 ممتاز!' : calculateScore() >= (quiz.totalPoints || 100) * 0.5 ? '👍 جيد' : '📚 حاول مرة أخرى'}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {quiz.questions?.map((q: any, idx: number) => (
                  <Card key={q.id} className={`bg-white/5 border-white/10 ${showResults ? (answers[q.id] === q.correctAnswer ? 'border-emerald-500/30' : answers[q.id] !== undefined ? 'border-red-500/30' : '') : ''}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="bg-white/10 text-white/70 rounded-full w-8 h-8 flex items-center justify-center text-sm flex-shrink-0">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{q.question}</p>
                          <Badge variant="outline" className="text-white/40 border-white/10 text-xs mt-1">{q.type === 'mcq' ? 'اختيار متعدد' : q.type === 'trueFalse' ? 'صح/خطأ' : 'مقالي'} • {q.points} نقاط</Badge>
                        </div>
                      </div>

                      {q.type === 'mcq' && q.options?.map((opt: string, i: number) => (
                        <button key={i} onClick={() => selectAnswer(q.id, opt)}
                          className={`w-full text-right p-3 rounded-lg mb-2 border transition-all text-sm ${
                            showResults
                              ? opt === q.correctAnswer ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : answers[q.id] === opt ? 'bg-red-500/20 border-red-500/40 text-red-300'
                              : 'border-white/5 text-white/40'
                            : answers[q.id] === opt ? 'bg-white/10 border-white/30 text-white' : 'border-white/5 text-white/60 hover:bg-white/5'
                          }`}>
                          {opt}
                          {showResults && opt === q.correctAnswer && <Check className="inline w-4 h-4 mr-2" />}
                          {showResults && answers[q.id] === opt && opt !== q.correctAnswer && <X className="inline w-4 h-4 mr-2" />}
                        </button>
                      ))}

                      {q.type === 'trueFalse' && (
                        <div className="flex gap-3">
                          {[true, false].map(val => (
                            <button key={String(val)} onClick={() => selectAnswer(q.id, val)}
                              className={`flex-1 p-3 rounded-lg border text-sm transition-all ${
                                showResults
                                  ? val === q.correctAnswer ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                  : answers[q.id] === val ? 'bg-red-500/20 border-red-500/40 text-red-300'
                                  : 'border-white/5 text-white/40'
                                : answers[q.id] === val ? 'bg-white/10 border-white/30 text-white' : 'border-white/5 text-white/60 hover:bg-white/5'
                              }`}>
                              {val ? '✓ صح' : '✕ خطأ'}
                            </button>
                          ))}
                        </div>
                      )}

                      {q.type === 'essay' && (
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                          <p className="text-white/40 text-xs mb-1">الإجابة النموذجية:</p>
                          <p className="text-white/70 text-sm">{q.modelAnswer}</p>
                        </div>
                      )}

                      {showResults && q.explanation && (
                        <div className="mt-3 bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                          <p className="text-blue-300 text-xs">💡 {q.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3">
                {!showResults && (
                  <Button onClick={handleSubmit} className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-600 h-12">تسليم الاختبار</Button>
                )}
                <Button onClick={handleReset} variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12">
                  <RotateCcw className="w-4 h-4 ml-2" />اختبار جديد
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuizGenerator;
