import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Award } from 'lucide-react';

const WaveQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  const questions = [
    {
      question: 'ما هي سرعة جميع الموجات الكهرومغناطيسية في الفراغ؟',
      options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', 'تختلف حسب التردد'],
      correctAnswer: 1,
      explanation: 'جميع الموجات الكهرومغناطيسية تنتقل بسرعة الضوء (3×10⁸ m/s) في الفراغ!'
    },
    {
      question: 'أي نوع من الموجات له أعلى طاقة؟',
      options: ['الأشعة فوق البنفسجية', 'الأشعة السينية', 'أشعة غاما', 'الضوء المرئي'],
      correctAnswer: 2,
      explanation: 'أشعة غاما لها أعلى تردد وبالتالي أعلى طاقة في الطيف الكهرومغناطيسي.'
    },
    {
      question: 'ما هي العلاقة بين التردد والطول الموجي؟',
      options: ['علاقة طردية', 'علاقة عكسية', 'لا توجد علاقة', 'علاقة تربيعية'],
      correctAnswer: 1,
      explanation: 'العلاقة عكسية: كلما زاد التردد، قل الطول الموجي (λ = c / f)'
    },
    {
      question: 'أي نوع من الإشعاع يُستخدم في أفران الميكروويف؟',
      options: ['موجات الراديو', 'الموجات الميكروية', 'الأشعة تحت الحمراء', 'الضوء المرئي'],
      correctAnswer: 1,
      explanation: 'أفران الميكروويف تستخدم الموجات الميكروية التي تُسخّن الطعام بتحريك جزيئات الماء.'
    },
    {
      question: 'ما هو الجزء الوحيد من الطيف الكهرومغناطيسي الذي يمكن للإنسان رؤيته؟',
      options: ['الأشعة فوق البنفسجية', 'الضوء المرئي', 'الأشعة تحت الحمراء', 'الأشعة السينية'],
      correctAnswer: 1,
      explanation: 'الضوء المرئي (430-770 THz) هو الجزء الوحيد الذي يمكن لأعيننا رؤيته.'
    }
  ];

  const question = questions[currentQuestion];

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === question.correctAnswer && !answeredQuestions.includes(currentQuestion)) {
      setScore(prev => prev + 1);
      setAnsweredQuestions(prev => [...prev, currentQuestion]);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">اختبر معلوماتك</h3>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full">
              <Award className="text-primary" size={20} />
              <span className="font-bold text-foreground">{score} / {questions.length}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-background/50 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  السؤال {currentQuestion + 1} من {questions.length}
                </span>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              
              <h4 className="text-lg font-semibold text-foreground mb-4">{question.question}</h4>

              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === question.correctAnswer;
                  const showFeedback = showResult && isSelected;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showResult}
                      className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                        showFeedback
                          ? isCorrect
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-red-500 bg-red-500/20'
                          : isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-background/50 hover:border-primary/50'
                      }`}
                      whileHover={{ scale: showResult ? 1 : 1.02 }}
                      whileTap={{ scale: showResult ? 1 : 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">{option}</span>
                        {showFeedback && (
                          isCorrect ? (
                            <CheckCircle2 className="text-green-500" size={20} />
                          ) : (
                            <XCircle className="text-red-500" size={20} />
                          )
                        )}
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
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1"
              >
                السابق
              </Button>
              
              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleReset}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                >
                  إعادة الاختبار
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
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WaveQuiz;
