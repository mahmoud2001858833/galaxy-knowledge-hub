import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle, XCircle, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizSectionProps {
  questions: QuizQuestion[];
  title?: string;
}

const QuizSection: React.FC<QuizSectionProps> = ({
  questions,
  title = 'اختبر معلوماتك',
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === questions[currentQuestion].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
  };

  const question = questions[currentQuestion];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border border-slate-600/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <HelpCircle className="w-5 h-5" />
          <span className="font-bold">{title}</span>
        </div>
        <div className="text-sm text-slate-400">
          {currentQuestion + 1} / {questions.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="text-white mb-4 leading-relaxed">{question.question}</p>

            <div className="space-y-2 mb-4">
              {question.options.map((option, index) => {
                let bgColor = 'bg-slate-700/50 hover:bg-slate-700';
                let borderColor = 'border-slate-600/50';
                
                if (showResult) {
                  if (index === question.correctIndex) {
                    bgColor = 'bg-green-600/30';
                    borderColor = 'border-green-500';
                  } else if (index === selectedAnswer && index !== question.correctIndex) {
                    bgColor = 'bg-red-600/30';
                    borderColor = 'border-red-500';
                  }
                } else if (selectedAnswer === index) {
                  bgColor = 'bg-cyan-600/30';
                  borderColor = 'border-cyan-500';
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={`w-full p-3 rounded-lg text-right transition-all ${bgColor} border ${borderColor}`}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-200">{option}</span>
                      {showResult && index === question.correctIndex && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      {showResult && index === selectedAnswer && index !== question.correctIndex && (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {showResult && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-slate-700/30 rounded-lg mb-4"
                >
                  <p className="text-xs text-slate-300">💡 {question.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button
                  onClick={handleNext}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  {currentQuestion < questions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة'}
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-white mb-2">أحسنت!</h3>
            <p className="text-slate-300 mb-4">
              حصلت على {score} من {questions.length}
            </p>
            
            <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(score / questions.length) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`h-full rounded-full ${
                  score === questions.length ? 'bg-green-500' :
                  score >= questions.length / 2 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
              />
            </div>

            <Button
              onClick={handleReset}
              variant="outline"
              className="border-cyan-500 text-cyan-400"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              إعادة الاختبار
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizSection;
