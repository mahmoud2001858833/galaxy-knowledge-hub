import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    question: 'ما هو ناتج تفاعل الهيدروجين مع الأكسجين؟',
    options: ['الماء (H₂O)', 'ثاني أكسيد الكربون (CO₂)', 'الأمونيا (NH₃)', 'الميثان (CH₄)'],
    correctAnswer: 0,
    explanation: 'تفاعل الهيدروجين مع الأكسجين ينتج الماء (H₂O) في تفاعل طارد للحرارة.',
  },
  {
    question: 'أي من التفاعلات التالية طارد للحرارة؟',
    options: ['البناء الضوئي', 'احتراق المغنيسيوم', 'تكوين الأوزون', 'تحلل الماء'],
    correctAnswer: 1,
    explanation: 'احتراق المغنيسيوم تفاعل طارد للحرارة ينتج ضوءاً أبيض ساطعاً وطاقة حرارية.',
  },
  {
    question: 'ما هي الصيغة الكيميائية للأمونيا؟',
    options: ['NH₂', 'NH₃', 'NH₄', 'N₂H'],
    correctAnswer: 1,
    explanation: 'الأمونيا (NH₃) تتكون من ذرة نيتروجين واحدة وثلاث ذرات هيدروجين.',
  },
  {
    question: 'ما نوع الرابطة بين ذرتي الأكسجين في جزيء O₂؟',
    options: ['رابطة أحادية', 'رابطة ثنائية', 'رابطة ثلاثية', 'رابطة أيونية'],
    correctAnswer: 1,
    explanation: 'جزيء الأكسجين (O₂) يحتوي على رابطة تساهمية ثنائية بين ذرتي الأكسجين.',
  },
  {
    question: 'أي من الجزيئات التالية يحتوي على رابطة ثلاثية؟',
    options: ['H₂O', 'CO₂', 'N₂', 'CH₄'],
    correctAnswer: 2,
    explanation: 'جزيء النيتروجين (N₂) يحتوي على رابطة تساهمية ثلاثية قوية جداً بين ذرتي النيتروجين.',
  },
];

export const ChemicalQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === quizQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    return (
      <Card className="p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold text-foreground">انتهى الاختبار!</h2>
        <div className="text-6xl font-bold text-primary">
          {score} / {quizQuestions.length}
        </div>
        <p className="text-xl text-muted-foreground">
          {score === quizQuestions.length && 'ممتاز! لقد أجبت على جميع الأسئلة بشكل صحيح!'}
          {score >= quizQuestions.length * 0.7 && score < quizQuestions.length && 'جيد جداً! أداء رائع!'}
          {score >= quizQuestions.length * 0.5 && score < quizQuestions.length * 0.7 && 'جيد! يمكنك التحسن أكثر.'}
          {score < quizQuestions.length * 0.5 && 'حاول مرة أخرى وراجع المعلومات.'}
        </p>
        <Button onClick={handleRestart} size="lg">
          إعادة الاختبار
        </Button>
      </Card>
    );
  }

  const question = quizQuestions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">
          السؤال {currentQuestion + 1} من {quizQuestions.length}
        </h3>
        <div className="text-sm text-muted-foreground">
          النقاط: {score}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xl text-foreground font-medium">
          {question.question}
        </p>

        <div className="space-y-2">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = index === question.correctAnswer;
            
            let buttonClasses = 'w-full justify-start text-right h-auto py-4 px-6 ';
            
            if (showExplanation) {
              if (isCorrectOption) {
                buttonClasses += 'bg-green-500/20 border-green-500 hover:bg-green-500/30';
              } else if (isSelected && !isCorrect) {
                buttonClasses += 'bg-red-500/20 border-red-500 hover:bg-red-500/30';
              }
            } else if (isSelected) {
              buttonClasses += 'bg-primary/20 border-primary';
            }

            return (
              <Button
                key={index}
                variant={isSelected && !showExplanation ? 'default' : 'outline'}
                className={buttonClasses}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
              >
                <span className="flex items-center gap-3 w-full">
                  <span className="flex-1 text-base">{option}</span>
                  {showExplanation && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </span>
              </Button>
            );
          })}
        </div>

        {showExplanation && (
          <Card className={`p-4 ${isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              )}
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  {isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {question.explanation}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {showExplanation && (
        <Button onClick={handleNext} size="lg" className="w-full">
          {currentQuestion < quizQuestions.length - 1 ? 'السؤال التالي' : 'إنهاء الاختبار'}
        </Button>
      )}
    </Card>
  );
};
