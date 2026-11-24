import { useState } from 'react';
import { motion } from 'framer-motion';
import { quizQuestions } from '@/data/lhc-educational-content';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Award, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const QUESTIONS_PER_ROUND = 5;

const shuffleArray = <T,>(items: T[]): T[] => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/** Picks a brand-new set of 5 questions different from previously seen ones (and never repeats the last round). */
const pickNextRound = (seenIds: number[], lastRoundIds: number[]) => {
  const unseen = quizQuestions.filter((q) => !seenIds.includes(q.id));
  if (unseen.length >= QUESTIONS_PER_ROUND) {
    const picked = shuffleArray(unseen).slice(0, QUESTIONS_PER_ROUND);
    return {
      questions: picked,
      nextSeenIds: [...seenIds, ...picked.map((q) => q.id)],
    };
  }

  // If fewer than 5 unseen remain, use all remaining unseen + fresh questions excluding last round
  const pool = shuffleArray(
    quizQuestions.filter((q) => !unseen.some((u) => u.id === q.id) && !lastRoundIds.includes(q.id)),
  );
  const picked = [...shuffleArray(unseen), ...pool].slice(0, QUESTIONS_PER_ROUND);
  return {
    questions: picked,
    nextSeenIds: picked.map((q) => q.id),
  };
};

export const QuizSection = () => {
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundQuestions, setRoundQuestions] = useState(() => quizQuestions.slice(0, QUESTIONS_PER_ROUND));
  const [seenIds, setSeenIds] = useState<number[]>(() => quizQuestions.slice(0, QUESTIONS_PER_ROUND).map((q) => q.id));

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  const question = roundQuestions[currentQuestion] ?? roundQuestions[0];

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === question.correctAnswer && !answeredQuestions.includes(currentQuestion)) {
      setScore((prev) => prev + 1);
      setAnsweredQuestions((prev) => [...prev, currentQuestion]);
    }
  };

  const handleNext = () => {
    if (currentQuestion < roundQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleNewRound = () => {
    const lastIds = roundQuestions.map((q) => q.id);
    const { questions: nextSet, nextSeenIds } = pickNextRound(seenIds, lastIds);
    setRoundQuestions(nextSet);
    setSeenIds(nextSeenIds);
    setRoundNumber((r) => r + 1);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions([]);
    toast.success(`بدأت الجولة ${roundNumber + 1} بمجموعة أسئلة جديدة ومختلفة!`);
  };

  const isLastQuestion = currentQuestion === roundQuestions.length - 1;

  return (
    <motion.div
      className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md p-6 rounded-xl border border-border shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-foreground">اختبر معلوماتك</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-3 w-3" />
            الجولة {roundNumber}
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full">
          <Award className="text-primary" size={20} />
          <span className="font-bold text-foreground">
            {score} / {roundQuestions.length}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-background/50 p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              السؤال {currentQuestion + 1} من {roundQuestions.length}
            </span>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / roundQuestions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <h4 className="text-lg font-semibold text-foreground mb-4">{question.question}</h4>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const revealCorrect = showResult && isCorrect;
              const revealWrong = showResult && isSelected && !isCorrect;

              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                    revealCorrect
                      ? 'border-green-500 bg-green-500/20'
                      : revealWrong
                      ? 'border-red-500 bg-red-500/20'
                      : isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background/50 hover:border-primary/50'
                  }`}
                  whileHover={{ scale: showResult ? 1 : 1.02 }}
                  whileTap={{ scale: showResult ? 1 : 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{option}</span>
                    {revealCorrect && <CheckCircle2 className="text-green-500 shrink-0" size={20} />}
                    {revealWrong && <XCircle className="text-red-500 shrink-0" size={20} />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {showResult && (
            <motion.div
              className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-foreground">{question.explanation}</p>
            </motion.div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="flex-1">
            السابق
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleNewRound}
              className="flex-1 gap-2 font-bold"
              style={{ backgroundImage: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#ffffff' }}
            >
              <RefreshCw className="w-4 h-4" />
              إعادة الأسئلة (أسئلة جديدة)
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!showResult}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
            >
              التالي
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
