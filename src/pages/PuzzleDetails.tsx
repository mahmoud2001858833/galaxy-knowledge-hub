import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Brain, CheckCircle2, XCircle, Star, Lock, Sparkles, 
  Trophy, Zap, Volume2, VolumeX, Lightbulb, ChevronDown, ChevronUp,
  ArrowLeft, BookOpen, Atom, Share2, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import PuzzleTimer from '@/components/puzzles/PuzzleTimer';

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
  hint?: string;
  explanation?: string;
  cognitive_level?: string;
}

const STORAGE_KEY_V2 = 'galaxy_active_puzzles_override_v2';
const GUEST_SOLVED_KEY = 'galaxy_guest_solved_puzzles';
const GUEST_SCORE_KEY = 'galaxy_guest_score';

const PuzzleDetails = () => {
  const { puzzleId } = useParams<{ puzzleId: string }>();
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState<PuzzleType | null>(null);
  const [nextPuzzleId, setNextPuzzleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isAlreadyAttempted, setIsAlreadyAttempted] = useState(false);
  const [previousResult, setPreviousResult] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Hint state
  const [showHint, setShowHint] = useState(false);

  // Timer & Sound states
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [earnedBonus, setEarnedBonus] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeUp, setTimeUp] = useState(false);

  const { playSuccessSound, playErrorSound, playBonusSound } = useSoundEffects();

  useEffect(() => {
    // Reset state on puzzleId change
    setSelectedOption('');
    setHasAnswered(false);
    setIsCorrect(false);
    setIsAlreadyAttempted(false);
    setPreviousResult(null);
    setShowHint(false);
    setTimeUp(false);
    setBonusPoints(0);
    setEarnedBonus(0);
    
    fetchPuzzleAndStatus();
  }, [puzzleId]);

  const fetchPuzzleAndStatus = async () => {
    if (!puzzleId) return;
    setLoading(true);
    try {
      let foundPuzzle: PuzzleType | null = null;

      // 1. Try Supabase
      const { data: dbPuzzle } = await supabase
        .from('subject_puzzles')
        .select('*')
        .eq('id', puzzleId)
        .maybeSingle();

      if (dbPuzzle) {
        foundPuzzle = dbPuzzle as unknown as PuzzleType;
      } else {
        // 2. Fallback to LocalStorage override
        try {
          const cached = localStorage.getItem(STORAGE_KEY_V2);
          if (cached) {
            const list: PuzzleType[] = JSON.parse(cached);
            const matched = list.find(p => String(p.id) === String(puzzleId));
            if (matched) {
              foundPuzzle = matched;
            }
          }
        } catch (e) {
          console.error('Failed to parse cached puzzles:', e);
        }
      }

      setPuzzle(foundPuzzle);

      // Check user session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: attemptData } = await supabase
          .from('user_solved_puzzles')
          .select('is_correct')
          .eq('user_id', user.id)
          .eq('puzzle_id', puzzleId)
          .maybeSingle();

        if (attemptData) {
          setIsAlreadyAttempted(true);
          setPreviousResult(attemptData.is_correct ?? true);
        }
      } else {
        // Guest attempt check
        try {
          const guestAttempts = JSON.parse(localStorage.getItem(GUEST_SOLVED_KEY) || '{}');
          if (guestAttempts[puzzleId]) {
            setIsAlreadyAttempted(true);
            setPreviousResult(guestAttempts[puzzleId].is_correct ?? true);
          }
        } catch {
          // ignore
        }
      }

      // Find next puzzle for smooth progression
      if (foundPuzzle) {
        findNextPuzzle(foundPuzzle);
      }
    } catch (error) {
      console.error('Error fetching puzzle:', error);
    } finally {
      setLoading(false);
    }
  };

  const findNextPuzzle = async (current: PuzzleType) => {
    try {
      // Look for another puzzle in the same subject
      const { data: others } = await supabase
        .from('subject_puzzles')
        .select('id')
        .eq('subject', current.subject)
        .neq('id', current.id)
        .limit(5);

      if (others && others.length > 0) {
        const next = others[Math.floor(Math.random() * others.length)];
        setNextPuzzleId(next.id);
      } else {
        // Check local override
        const cached = localStorage.getItem(STORAGE_KEY_V2);
        if (cached) {
          const list: PuzzleType[] = JSON.parse(cached);
          const candidate = list.find(p => String(p.id) !== String(current.id));
          if (candidate) {
            setNextPuzzleId(String(candidate.id));
          }
        }
      }
    } catch (err) {
      console.warn('Could not determine next puzzle:', err);
    }
  };

  const handleTimeUp = useCallback(() => {
    setTimeUp(true);
    if (soundEnabled) playErrorSound();
    toast.error('⏰ انتهى الوقت! لقد نفدت فرصة الإجابة لهذا اللغز');
  }, [soundEnabled, playErrorSound]);

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !puzzle || hasAnswered || timeUp) return;
    setSubmitting(true);
    const correct = selectedOption.trim() === puzzle.correct_answer.trim();
    setIsCorrect(correct);
    setHasAnswered(true);

    // Confetti on win
    if (correct) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899']
        });
      } catch {
        // confetti fallback
      }
    }

    // Sound FX
    if (soundEnabled) {
      if (correct) {
        playSuccessSound();
        if (timerEnabled && bonusPoints > 0) {
          setTimeout(() => playBonusSound(), 400);
        }
      } else {
        playErrorSound();
      }
    }

    // Points calculation
    const totalPoints = correct ? puzzle.points + (timerEnabled ? bonusPoints : 0) : 0;
    setEarnedBonus(timerEnabled ? bonusPoints : 0);

    try {
      if (userId) {
        // Persist for registered user
        await supabase.from('user_solved_puzzles').insert({
          user_id: userId,
          puzzle_id: puzzle.id,
          subject: puzzle.subject,
          is_correct: correct
        });

        if (correct) {
          await supabase.rpc('adjust_user_score', { user_id: userId, points_adjustment: totalPoints });
          
          if (timerEnabled && bonusPoints > 0) {
            toast.success(`🎉 عبقري! حصلت على ${puzzle.points} + ${bonusPoints} سرعة = ${totalPoints} نقطة!`);
          } else {
            toast.success(`🎉 إجابة صحيحة! أضيفت ${puzzle.points} نقطة إلى رصيدك.`);
          }
        } else {
          toast.error('❌ إجابة خاطئة! راجع التفسير العلمي بالأسفل للاستفادة.');
        }
      } else {
        // Guest user local persistence
        const guestAttempts = JSON.parse(localStorage.getItem(GUEST_SOLVED_KEY) || '{}');
        guestAttempts[puzzle.id] = { is_correct: correct, solved_at: new Date().toISOString() };
        localStorage.setItem(GUEST_SOLVED_KEY, JSON.stringify(guestAttempts));

        if (correct) {
          const currentScore = parseInt(localStorage.getItem(GUEST_SCORE_KEY) || '0', 10);
          localStorage.setItem(GUEST_SCORE_KEY, String(currentScore + totalPoints));
          toast.success(`🎉 أحسنت! إجابة صحيحة (+${totalPoints} نقطة تجريبية). سجّل دخولك لتثبيت ترتيبك بالمتصدرين!`);
        } else {
          toast.error('❌ إجابة غير موفقة! طالع التفسير العلمي لتتعلم القاعدة.');
        }
      }
    } catch (error) {
      console.error('Error submitting puzzle answer:', error);
      toast.info('تم حفظ إجابتك محلياً!');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'سهل': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'متوسط': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'صعب': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const getOptionStyle = (option: string) => {
    const isChosen = selectedOption === option;
    const isSolution = option === puzzle?.correct_answer;

    if (!hasAnswered && !isAlreadyAttempted && !timeUp) {
      return isChosen 
        ? 'border-primary bg-primary/15 shadow-md shadow-primary/10 ring-2 ring-primary/40' 
        : 'border-border/60 hover:border-primary/50 hover:bg-muted/40';
    }

    if (isSolution) {
      return 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold shadow-md shadow-emerald-500/20';
    }

    if ((hasAnswered || timeUp) && isChosen && !isCorrect) {
      return 'border-rose-500 bg-rose-500/20 text-rose-300 shadow-md shadow-rose-500/20';
    }

    return 'border-border/40 opacity-45';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-12" dir="rtl">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full p-8 text-center bg-card/70 backdrop-blur-xl border-border/50">
          <Brain className="h-16 w-16 mx-auto text-primary/60 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">اللغز غير متوفر حالياً</h2>
          <p className="text-muted-foreground text-sm mb-6">
            قد يكون هذا اللغز قد تم تعديله أو حذفه من قِبل إدارة المنصة.
          </p>
          <Button onClick={() => navigate('/subject-puzzles')} className="w-full">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة إلى كتالوج الألغاز
          </Button>
        </Card>
      </div>
    );
  }

  // Fallback hint & explanation if not provided
  const effectiveHint = puzzle.hint || `فكر في المبادئ الفيزيائية والكيميائية المرتبطة بـ ${puzzle.subject} واستبعد الخيارات المتطرفة أو غير المنطقية.`;
  const effectiveExplanation = puzzle.explanation || `الإجابة الصحيحة هي "${puzzle.correct_answer}". يستند هذا الحل إلى القوانين الفيزيائية والمنطقية الأساسية المقررة في منهاج ${puzzle.subject}.`;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-16" dir="rtl">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <motion.div 
          className="absolute top-16 right-16 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 9, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-16 left-16 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, delay: 3 }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-3xl">
        {/* Navigation Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex items-center justify-between mb-6 bg-card/60 backdrop-blur-md p-3 px-4 rounded-2xl border border-border/50"
        >
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/subject-puzzles')}
            className="text-muted-foreground hover:text-foreground hover:bg-primary/10 gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            كتالوج الألغاز
          </Button>

          <div className="flex items-center gap-2">
            {!userId && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs py-1">
                وضع الزائر (محلي)
              </Badge>
            )}

            {/* Sound Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-9 w-9 rounded-xl border-border/60 hover:bg-primary/10"
              title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تفعيل المؤثرات الصوتية'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
        </motion.div>

        {/* Already Attempted Banner */}
        <AnimatePresence>
          {isAlreadyAttempted && !hasAnswered && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-2xl flex items-center justify-between gap-4 border shadow-sm ${
                previousResult 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {previousResult ? (
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                    <Lock className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-base">
                    {previousResult ? 'تم حل هذا اللغز بنجاح مسبقاً! ✓' : 'تم استنفاد فرصة هذا اللغز مسبقاً'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {previousResult 
                      ? 'لقد حصدت النقاط كاملة في رصيدك الأكاديمي.' 
                      : 'وفق قواعد المسابقة، يُتاح للطالب محاولة واحدة فقط لضمان النزاهة.'}
                  </p>
                </div>
              </div>

              {nextPuzzleId && (
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/subject-puzzles/${nextPuzzleId}`)}
                  className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 text-xs shrink-0"
                >
                  اللغز التالي ⚡
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time Up Banner */}
        <AnimatePresence>
          {timeUp && !hasAnswered && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl flex items-center gap-3 bg-rose-500/15 border border-rose-500/40 text-rose-300"
            >
              <XCircle className="h-6 w-6 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold">⏰ انتهى الوقت المحدد للمحاولة!</p>
                <p className="text-xs text-muted-foreground">تم غلق إمكانية إرسال الإجابة لتجاوز الوقت المحدد للغز.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Puzzle Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-border/60 overflow-hidden shadow-2xl rounded-3xl">
            {/* Image Banner if available */}
            {puzzle.image && (
              <div className="relative w-full max-h-72 overflow-hidden bg-black/40 border-b border-border/40">
                <img 
                  src={puzzle.image} 
                  alt={puzzle.title} 
                  className="w-full h-full max-h-72 object-contain mx-auto transition-transform hover:scale-105 duration-500"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.parentElement!.style.display = 'none';
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/90 to-transparent" />
              </div>
            )}

            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Header Badges & Points */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${getDifficultyColor(puzzle.difficulty)}`}>
                      {puzzle.difficulty}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 rounded-lg">
                      {puzzle.subject}
                    </Badge>
                    {puzzle.cognitive_level && (
                      <Badge variant="outline" className="bg-secondary/20 text-secondary-foreground text-xs px-2 py-0.5 rounded-lg">
                        {puzzle.cognitive_level}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-snug">
                    {puzzle.title}
                  </h1>
                </div>

                {/* Points Pill */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-primary/20 border border-amber-500/30 px-3.5 py-1.5 rounded-2xl shadow-inner">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span className="font-black text-amber-400 text-lg">{puzzle.points}</span>
                    <span className="text-xs text-muted-foreground mr-0.5">نقطة</span>
                  </div>

                  {timerEnabled && bonusPoints > 0 && !hasAnswered && !timeUp && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold"
                    >
                      <Zap className="h-3 w-3 fill-emerald-400" />
                      <span>+{bonusPoints} سرعة</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Timer Bar */}
              {!isAlreadyAttempted && (
                <div className="bg-muted/20 p-3 rounded-2xl border border-border/40">
                  <PuzzleTimer
                    isActive={!loading && !!puzzle}
                    onTimeUp={handleTimeUp}
                    onBonusChange={setBonusPoints}
                    difficulty={puzzle.difficulty}
                    hasAnswered={hasAnswered}
                    isEnabled={timerEnabled}
                    onToggle={setTimerEnabled}
                  />
                </div>
              )}

              {/* Question Text Box */}
              <div className="bg-muted/30 p-5 md:p-6 rounded-2xl border border-border/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-primary" />
                <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground select-text">
                  {puzzle.question}
                </p>
              </div>

              {/* Smart Hint Accordion */}
              {!hasAnswered && !isAlreadyAttempted && (
                <div className="border border-amber-500/30 bg-amber-500/5 rounded-2xl overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="w-full p-3.5 px-4 flex items-center justify-between text-amber-400 hover:bg-amber-500/10 transition-colors text-sm font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-400" />
                      <span>💡 تلميح استرشادي ذكي</span>
                      <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-300 border-amber-500/20 mr-2">
                        بدون خصم نقاط
                      </Badge>
                    </div>
                    {showHint ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 pt-1 text-sm text-foreground/80 leading-relaxed border-t border-amber-500/20"
                      >
                        <p className="bg-background/60 p-3 rounded-xl border border-amber-500/20">
                          {effectiveHint}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Options Radio List */}
              <div className="space-y-3 pt-2">
                <RadioGroup
                  value={selectedOption}
                  onValueChange={setSelectedOption}
                  disabled={hasAnswered || isAlreadyAttempted || timeUp}
                  className="space-y-3"
                >
                  {puzzle.options.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <Label
                        htmlFor={`option-${index}`}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${getOptionStyle(option)} ${
                          hasAnswered || isAlreadyAttempted || timeUp ? 'cursor-default' : 'hover:scale-[1.01]'
                        }`}
                      >
                        <RadioGroupItem 
                          value={option} 
                          id={`option-${index}`} 
                          disabled={hasAnswered || isAlreadyAttempted || timeUp}
                          className="h-5 w-5"
                        />
                        <span className="flex-1 text-base leading-relaxed">{option}</span>
                        
                        {/* Status Icons */}
                        {(hasAnswered || isAlreadyAttempted || timeUp) && option === puzzle.correct_answer && (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-500/20 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>الإجابة المعتمدة</span>
                          </div>
                        )}
                        {(hasAnswered || timeUp) && selectedOption === option && !isCorrect && (
                          <div className="flex items-center gap-1 text-rose-400 text-xs bg-rose-500/20 px-2.5 py-1 rounded-lg">
                            <XCircle className="h-4 w-4" />
                            <span>إجابتك</span>
                          </div>
                        )}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </div>

              {/* Submit Button */}
              {!hasAnswered && !isAlreadyAttempted && !timeUp && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption || submitting}
                  className="w-full py-6 text-lg rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 animate-spin" />
                      جاري التحقق من إجابتك...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      تأكيد واعتماد الإجابة
                    </span>
                  )}
                </Button>
              )}

              {/* Result Celebration / Explanation Card */}
              <AnimatePresence>
                {(hasAnswered || timeUp) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`p-6 md:p-8 rounded-3xl border-2 space-y-5 ${
                      isCorrect 
                        ? 'bg-gradient-to-b from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/50 shadow-xl shadow-emerald-500/10' 
                        : 'bg-gradient-to-b from-rose-500/20 via-rose-500/10 to-transparent border-rose-500/50 shadow-xl shadow-rose-500/10'
                    }`}
                  >
                    {isCorrect ? (
                      <div className="text-center space-y-3">
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          transition={{ type: 'spring', bounce: 0.6 }}
                          className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400"
                        >
                          <Trophy className="h-10 w-10 animate-pulse" />
                        </motion.div>
                        <h3 className="text-2xl md:text-3xl font-black text-emerald-400">
                          🎉 إجابة عبقرية وصحيحة!
                        </h3>
                        
                        <div className="flex items-center justify-center gap-4 bg-background/50 p-3 rounded-2xl border border-emerald-500/20 max-w-sm mx-auto text-sm">
                          <div>
                            <span className="text-muted-foreground block text-xs">النقاط الأساسية</span>
                            <span className="font-bold text-foreground text-base">+{puzzle.points}</span>
                          </div>
                          {earnedBonus > 0 && (
                            <div className="border-r border-border/50 pr-4">
                              <span className="text-emerald-400 block text-xs font-semibold">مكافأة السرعة</span>
                              <span className="font-bold text-emerald-400 text-base">+{earnedBonus}</span>
                            </div>
                          )}
                          <div className="border-r border-border/50 pr-4">
                            <span className="text-primary block text-xs font-bold">المجموع الكلي</span>
                            <span className="font-black text-primary text-lg">+{puzzle.points + earnedBonus}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400">
                          <XCircle className="h-9 w-9" />
                        </div>
                        <h3 className="text-2xl font-bold text-rose-400">
                          {timeUp ? '⏰ انتهى الوقت المحدد' : 'إجابة غير صحيحة'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          الإجابة الصحيحة هي:{' '}
                          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                            {puzzle.correct_answer}
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Scientific Rationale Card */}
                    <div className="bg-card/90 p-5 rounded-2xl border border-border/50 text-right space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <BookOpen className="h-4 w-4" />
                        <span>التحليل والتفسير العلمي:</span>
                      </div>
                      <p className="text-sm md:text-base leading-relaxed text-foreground/90">
                        {effectiveExplanation}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      {nextPuzzleId && (
                        <Button 
                          onClick={() => navigate(`/subject-puzzles/${nextPuzzleId}`)} 
                          className="w-full sm:flex-1 py-5 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          التحدي التالي
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/subject-puzzles')} 
                        className="w-full sm:w-auto px-6 py-5 rounded-xl border-border/60 hover:bg-muted"
                      >
                        العودة لقائمة الألغاز
                      </Button>
                    </div>
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
