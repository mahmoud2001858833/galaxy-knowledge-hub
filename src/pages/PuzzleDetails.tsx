import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Brain, CheckCircle2, XCircle, Star, Lock, Sparkles, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PuzzleType {
  id: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  points: number;
  subject: string;
  image?: string | null;
}

const PuzzleDetails = () => {
  const { puzzleId } = useParams<{ puzzleId: string }>();
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState<PuzzleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isAlreadyAttempted, setIsAlreadyAttempted] = useState(false);
  const [previousResult, setPreviousResult] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPuzzleAndStatus();
  }, [puzzleId]);

  const fetchPuzzleAndStatus = async () => {
    if (!puzzleId) return;
    setLoading(true);
    try {
      const { data: puzzleData } = await supabase.from('subject_puzzles').select('*').eq('id', puzzleId).single();
      setPuzzle(puzzleData);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: attemptData } = await supabase.from('user_solved_puzzles').select('is_correct').eq('user_id', user.id).eq('puzzle_id', puzzleId).maybeSingle();
        if (attemptData) {
          setIsAlreadyAttempted(true);
          setPreviousResult(attemptData.is_correct ?? true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !puzzle || !userId || hasAnswered) return;
    setSubmitting(true);
    const correct = selectedOption === puzzle.correct_answer;
    setIsCorrect(correct);
    setHasAnswered(true);

    try {
      await supabase.from('user_solved_puzzles').insert({
        user_id: userId,
        puzzle_id: puzzle.id,
        subject: puzzle.subject,
        is_correct: correct
      });

      if (correct) {
        await supabase.rpc('adjust_user_score', { user_id: userId, points_adjustment: puzzle.points });
        toast.success(`🎉 إجابة صحيحة! حصلت على ${puzzle.points} نقاط`);
      } else {
        toast.error('❌ إجابة خاطئة! لا يمكنك المحاولة مرة أخرى');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (d: string) => 
    d === 'سهل' ? 'bg-emerald-500/20 text-emerald-400' : 
    d === 'متوسط' ? 'bg-amber-500/20 text-amber-400' : 
    'bg-rose-500/20 text-rose-400';

  const getOptionStyle = (option: string) => {
    if (!hasAnswered && !isAlreadyAttempted) 
      return selectedOption === option ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50';
    if (option === puzzle?.correct_answer) return 'border-emerald-500 bg-emerald-500/20';
    if (hasAnswered && selectedOption === option && !isCorrect) return 'border-rose-500 bg-rose-500/20';
    return 'border-border opacity-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8" dir="rtl">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">اللغز غير موجود</h2>
          <Button onClick={() => navigate('/subject-puzzles')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للألغاز
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <motion.div 
          className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={() => navigate('/subject-puzzles')} className="mb-6">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للألغاز
          </Button>
        </motion.div>

        <AnimatePresence>
          {isAlreadyAttempted && !hasAnswered && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                previousResult ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-rose-500/20 border border-rose-500/50'
              }`}
            >
              {previousResult ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-emerald-400">تم حل هذا اللغز سابقاً ✓</p>
                    <p className="text-sm text-muted-foreground">لقد حصلت على النقاط بالفعل</p>
                  </div>
                </>
              ) : (
                <>
                  <Lock className="h-6 w-6 text-rose-400" />
                  <div>
                    <p className="font-semibold text-rose-400">تمت محاولة هذا اللغز</p>
                    <p className="text-sm text-muted-foreground">لا يمكن المحاولة مجدداً</p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-border/50 overflow-hidden">
            {puzzle.image && (
              <div className="relative h-48 overflow-hidden">
                <img src={puzzle.image} alt={puzzle.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
            )}

            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{puzzle.title}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getDifficultyColor(puzzle.difficulty)}>
                      {puzzle.difficulty}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/20 text-primary">
                      {puzzle.subject}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-primary/20 px-3 py-2 rounded-full">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                  <span className="font-bold text-primary">{puzzle.points}</span>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl">
                <p className="text-lg leading-relaxed">{puzzle.question}</p>
              </div>

              <RadioGroup
                value={selectedOption}
                onValueChange={setSelectedOption}
                disabled={hasAnswered || isAlreadyAttempted}
                className="space-y-3"
              >
                {puzzle.options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Label
                      htmlFor={`option-${index}`}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${getOptionStyle(option)} ${hasAnswered || isAlreadyAttempted ? 'cursor-default' : 'hover:scale-[1.02]'}`}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} disabled={hasAnswered || isAlreadyAttempted} />
                      <span className="flex-1">{option}</span>
                      {(hasAnswered || isAlreadyAttempted) && option === puzzle.correct_answer && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      )}
                      {hasAnswered && selectedOption === option && !isCorrect && (
                        <XCircle className="h-5 w-5 text-rose-400" />
                      )}
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>

              {!hasAnswered && !isAlreadyAttempted && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption || submitting || !userId}
                  className="w-full py-6 text-lg"
                >
                  {submitting ? 'جاري التحقق...' : !userId ? 'يجب تسجيل الدخول للإجابة' : (
                    <>
                      <Sparkles className="h-5 w-5 ml-2" />
                      تأكيد الإجابة
                    </>
                  )}
                </Button>
              )}

              <AnimatePresence>
                {hasAnswered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-xl text-center ${isCorrect ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}
                  >
                    {isCorrect ? (
                      <>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                          <Trophy className="h-16 w-16 mx-auto text-emerald-400 mb-4" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-emerald-400 mb-2">🎉 إجابة صحيحة!</h3>
                        <p className="text-muted-foreground">
                          حصلت على <span className="text-primary font-bold">{puzzle.points}</span> نقاط
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-16 w-16 mx-auto text-rose-400 mb-4" />
                        <h3 className="text-2xl font-bold text-rose-400 mb-2">إجابة خاطئة</h3>
                        <p className="text-muted-foreground mb-2">
                          الإجابة الصحيحة: <span className="text-emerald-400 font-bold">{puzzle.correct_answer}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">لا يمكنك المحاولة مرة أخرى</p>
                      </>
                    )}
                    <Button onClick={() => navigate('/subject-puzzles')} className="mt-6">
                      العودة للألغاز
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PuzzleDetails;
