import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NUCLEAR_QUIZ } from '@/data/nuclear-data';
import { CheckCircle2, XCircle, RotateCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const QUESTIONS_PER_ROUND = 4;

const shuffleArray = <T,>(items: T[]): T[] => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const pickNextRound = (seenIds: number[], lastRoundIds: number[]) => {
  const unseen = NUCLEAR_QUIZ.filter((q) => !seenIds.includes(q.id));
  if (unseen.length >= QUESTIONS_PER_ROUND) {
    const picked = shuffleArray(unseen).slice(0, QUESTIONS_PER_ROUND);
    return {
      questions: picked,
      nextSeenIds: [...seenIds, ...picked.map((q) => q.id)],
    };
  }
  const pool = shuffleArray(
    NUCLEAR_QUIZ.filter((q) => !unseen.some((u) => u.id === q.id) && !lastRoundIds.includes(q.id)),
  );
  const picked = [...shuffleArray(unseen), ...pool].slice(0, QUESTIONS_PER_ROUND);
  return {
    questions: picked,
    nextSeenIds: picked.map((q) => q.id),
  };
};

export const NuclearQuiz = () => {
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundQuestions, setRoundQuestions] = useState(() => NUCLEAR_QUIZ.slice(0, QUESTIONS_PER_ROUND));
  const [seenIds, setSeenIds] = useState<number[]>(() => NUCLEAR_QUIZ.slice(0, QUESTIONS_PER_ROUND).map((q) => q.id));

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = roundQuestions[currentQuestion] ?? roundQuestions[0];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    setShowExplanation(true);

    if (index === question.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < roundQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
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
    setShowExplanation(false);
    setScore(0);
    setCompleted(false);
    toast.success(`بدأت الجولة ${roundNumber + 1} بـ ${QUESTIONS_PER_ROUND} أسئلة جديدة ومختلفة!`);
  };

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="relative">
          <motion.div
            className="text-8xl"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            🏆
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <div>
          <h3 className="text-3xl font-bold mb-2">أحسنت! 🎉</h3>
          <p className="text-xl text-muted-foreground">لقد أكملت الجولة {roundNumber} بنجاح</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 inline-block">
          <div className="text-5xl font-bold text-yellow-400">
            {score} / {roundQuestions.length}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            نسبة النجاح: {Math.round((score / roundQuestions.length) * 100)}%
          </div>
        </div>

        <div>
          <Button
            onClick={handleNewRound}
            size="lg"
            className="gap-2 font-bold"
            style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#ffffff' }}
          >
            <RotateCcw className="w-5 h-5" />
            إعادة الاختبار (أسئلة جديدة ومختلفة)
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* شريط التقدم */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              السؤال {currentQuestion + 1} من {roundQuestions.length}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-bold text-purple-300">
              <Sparkles className="w-3 h-3" />
              الجولة {roundNumber}
            </span>
          </div>
          <span>النقاط: {score}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / roundQuestions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* السؤال */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${roundNumber}-${currentQuestion}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <h3 className="text-xl font-bold mb-4">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === null
                      ? 'border-border hover:border-purple-500/50 hover:bg-purple-500/5'
                      : index === question.correctAnswer
                      ? 'border-green-500 bg-green-500/10'
                      : selectedAnswer === index
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-border opacity-50'
                  }`}
                  whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                  whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {selectedAnswer !== null && (
                      <span>
                        {index === question.correctAnswer ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : selectedAnswer === index ? (
                          <XCircle className="w-6 h-6 text-red-500" />
                        ) : null}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>

          {/* التفسير */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card
                  className={`p-6 ${
                    selectedAnswer === question.correctAnswer
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{selectedAnswer === question.correctAnswer ? '✅' : '💡'}</div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-2">
                        {selectedAnswer === question.correctAnswer ? 'إجابة صحيحة!' : 'تفسير:'}
                      </h4>
                      <p className="text-sm text-muted-foreground">{question.explanation}</p>
                    </div>
                  </div>
                </Card>

                <div className="flex justify-center mt-4">
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="font-bold"
                    style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#ffffff' }}
                  >
                    {currentQuestion < roundQuestions.length - 1 ? 'السؤال التالي' : 'إنهاء الاختبار'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
