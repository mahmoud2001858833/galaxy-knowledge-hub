import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NUCLEAR_QUIZ } from '@/data/nuclear-data';
import { CheckCircle2, XCircle, Trophy, RotateCcw } from 'lucide-react';

export const NuclearQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = NUCLEAR_QUIZ[currentQuestion];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < NUCLEAR_QUIZ.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setCompleted(false);
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
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 0.5,
              repeat: 3
            }}
          >
            🏆
          </motion.div>
          
          <motion.div
            className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          />
        </div>

        <div>
          <h3 className="text-3xl font-bold mb-2">أحسنت! 🎉</h3>
          <p className="text-xl text-muted-foreground">
            لقد أكملت الاختبار بنجاح
          </p>
        </div>

        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 inline-block">
          <div className="text-5xl font-bold text-yellow-400">
            {score} / {NUCLEAR_QUIZ.length}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            نسبة النجاح: {Math.round((score / NUCLEAR_QUIZ.length) * 100)}%
          </div>
        </div>

        <Button
          onClick={handleReset}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          إعادة الاختبار
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* شريط التقدم */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>السؤال {currentQuestion + 1} من {NUCLEAR_QUIZ.length}</span>
          <span>النقاط: {score}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / NUCLEAR_QUIZ.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* السؤال */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
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
                <Card className={`p-6 ${
                  selectedAnswer === question.correctAnswer
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {selectedAnswer === question.correctAnswer ? '✅' : '💡'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-2">
                        {selectedAnswer === question.correctAnswer ? 'إجابة صحيحة!' : 'تفسير:'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="flex justify-center mt-4">
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {currentQuestion < NUCLEAR_QUIZ.length - 1 ? 'السؤال التالي' : 'إنهاء الاختبار'}
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
