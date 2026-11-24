import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUESTION_BANK: QuizQuestion[] = [
  {
    id: 1,
    question: 'ما هو ناتج تفاعل الهيدروجين مع الأكسجين؟',
    options: ['الماء (H₂O)', 'ثاني أكسيد الكربون (CO₂)', 'الأمونيا (NH₃)', 'الميثان (CH₄)'],
    correctAnswer: 0,
    explanation: 'تفاعل الهيدروجين مع الأكسجين (2H₂ + O₂ → 2H₂O) ينتج الماء في تفاعل طارد للحرارة.',
  },
  {
    id: 2,
    question: 'أي من التفاعلات التالية طارد للحرارة؟',
    options: ['البناء الضوئي', 'احتراق المغنيسيوم', 'تكوين الأوزون', 'تحلل الماء كهربائياً'],
    correctAnswer: 1,
    explanation: 'احتراق المغنيسيوم تفاعل طارد للحرارة ينتج ضوءاً أبيض ساطعاً وطاقة حرارية كبيرة.',
  },
  {
    id: 3,
    question: 'ما هي الصيغة الكيميائية للأمونيا؟',
    options: ['NH₂', 'NH₃', 'NH₄', 'N₂H'],
    correctAnswer: 1,
    explanation: 'الأمونيا (NH₃) تتكون من ذرة نيتروجين واحدة مرتبطة بثلاث ذرات هيدروجين.',
  },
  {
    id: 4,
    question: 'ما نوع الرابطة بين ذرتي الأكسجين في جزيء O₂؟',
    options: ['رابطة أحادية', 'رابطة ثنائية', 'رابطة ثلاثية', 'رابطة أيونية'],
    correctAnswer: 1,
    explanation: 'جزيء الأكسجين (O₂) يحتوي على رابطة تساهمية ثنائية بين ذرتي الأكسجين.',
  },
  {
    id: 5,
    question: 'أي من الجزيئات التالية يحتوي على رابطة تساهمية ثلاثية؟',
    options: ['H₂O', 'CO₂', 'N₂', 'CH₄'],
    correctAnswer: 2,
    explanation: 'جزيء النيتروجين (N₂) يحتوي على رابطة تساهمية ثلاثية قوية جداً بين ذرتي النيتروجين.',
  },
  {
    id: 6,
    question: 'ماذا يفعل العامل الحفّاز (Catalyst) في التفاعل الكيميائي؟',
    options: [
      'يُستهلك بالكامل مع النواتج',
      'يُخفض طاقة التنشيط فيُسرّع التفاعل دون أن يُستهلك كيميائياً',
      'يوقف التفاعل نهائياً',
      'يغيّر نوع العناصر الناتجة',
    ],
    correctAnswer: 1,
    explanation: 'العامل الحفّاز يوفّر مساراً بديلاً ذا طاقة تنشيط أقل، مما يرفع سرعة التفاعل مع بقائه دون تغير كيميائي في النهاية.',
  },
  {
    id: 7,
    question: 'ما هو ناتج الاحتراق الكامل لغاز الميثان (CH₄) في وفرة من الأكسجين؟',
    options: ['أول أكسيد الكربون والهيدروجين', 'ثاني أكسيد الكربون (CO₂) وبخار الماء (H₂O)', 'الأمونيا والنيتروجين', 'ملح الطعام والماء'],
    correctAnswer: 1,
    explanation: 'الاحتراق الكامل لأي هيدروكربون مثل الميثان يعطي CO₂ و H₂O وطاقة حرارية: CH₄ + 2O₂ → CO₂ + 2H₂O.',
  },
  {
    id: 8,
    question: 'في تفاعل التعادل بين حمض الهيدروكلوريك (HCl) وهيدروكسيد الصوديوم (NaOH)، ما هما الناتجان؟',
    options: ['كلوريد الصوديوم (NaCl) والماء (H₂O)', 'الأكسجين والهيدروجين فقط', 'الكربون والماء', 'الأمونيا والملح'],
    correctAnswer: 0,
    explanation: 'تفاعل حمض قوي مع قاعدة قوية يُنتج ملحاً وماءً: HCl + NaOH → NaCl + H₂O.',
  },
  {
    id: 9,
    question: 'ما هي المعادلة الموزونة الصحيحة لعملية هابر لتحضير الأمونيا؟',
    options: ['N₂ + H₂ → NH₃', 'N₂ + 3H₂ ⇌ 2NH₃', '2N₂ + H₂ → 2NH₃', 'N₂ + 2H₂ → 2NH₃'],
    correctAnswer: 1,
    explanation: 'لتحقيق قانون حفظ الكتلة: ذرتا نيتروجين و6 ذرات هيدروجين في المتفاعلات تُنتج جزيئين من NH₃.',
  },
  {
    id: 10,
    question: 'ماذا يعني أن التغير في المحتوى الحراري للتفاعل (ΔH) يحمل إشارة سالبة (ΔH < 0)؟',
    options: ['التفاعل ماص للحرارة', 'التفاعل طارد للحرارة', 'التفاعل متوقف', 'لا توجد طاقة متبادلة'],
    correctAnswer: 1,
    explanation: 'الإشارة السالبة لـ ΔH تعني أن طاقة النواتج أقل من المتفاعلات وأن التفاعل يطلق حرارة للوسط المحيط.',
  },
  {
    id: 11,
    question: 'ما اسم العملية التي يحدث فيها فقدان للإلكترونات وزيادة في عدد التأكسد؟',
    options: ['الاختزال', 'التأكسد (الأكسدة)', 'التعادل', 'الترسيب'],
    correctAnswer: 1,
    explanation: 'التأكسد هو عملية فقدان الإلكترونات، بينما الاختزال هو عملية اكتساب الإلكترونات.',
  },
  {
    id: 12,
    question: 'أي من القوانين التالية يفسر ضرورة موازنة المعادلات الكيميائية؟',
    options: ['قانون أوم', 'قانون حفظ الكتلة (لافوازييه)', 'قانون كولوم', 'قانون هوك'],
    correctAnswer: 1,
    explanation: 'ينص قانون حفظ الكتلة على أن المادة لا تفنى ولا تُستحدث، لذلك يجب أن يتساوى عدد ذرات كل عنصر في طرفي المعادلة.',
  },
  {
    id: 13,
    question: 'ما نوع الرابطة الكيميائية في ملح الطعام (كلوريد الصوديوم NaCl)؟',
    options: ['رابطة تساهمية قطبية', 'رابطة أيونية', 'رابطة فلزية', 'رابطة هيدروجينية'],
    correctAnswer: 1,
    explanation: 'يفقد الصوديوم إلكتروناً لصالح الكلور فتتجاذب الأيونات Na⁺ و Cl⁻ كهربائياً برابطة أيونية قوية.',
  },
  {
    id: 14,
    question: 'ما الذي يصف «طاقة التنشيط» (Activation Energy) في التفاعل الكيميائي؟',
    options: [
      'أقل طاقة لازمة لكسر الروابط الأولية وبدء التفاعل',
      'الطاقة الناتجة بعد انتهاء التفاعل فقط',
      'درجة انصهار الناتج النهائي',
      'حجم الجزيئات المتفاعلة',
    ],
    correctAnswer: 0,
    explanation: 'طاقة التنشيط هي الحاجز الطاقي الأدنى الذي يجب أن تمتلكه الجزيئات المتصادمة لكي يتحول التصادم إلى تفاعل فعّال.',
  },
  {
    id: 15,
    question: 'ما هو الشكل الهندسي ثلاثي الأبعاد لجزيء الميثان (CH₄)؟',
    options: ['خطي (180°)', 'رباعي السطوح منتظم (Tetrahedral - 109.5°)', 'مثلث مستوٍ', 'منحنٍ بزاوية 90°'],
    correctAnswer: 1,
    explanation: 'تتنافر أزواج الإلكترونات الأربعة حول ذرة الكربون بالتساوي لتشكل رباعي سطوح بزاوية 109.5°.',
  },
  {
    id: 16,
    question: 'كيف يؤثر رفع درجة الحرارة عادةً على سرعة التفاعلات الكيميائية؟',
    options: [
      'يُبطئ التفاعل دائماً',
      'يزيد الطاقة الحركية للجزيئات فيرتفع عدد التصادمات الفعّالة وتزداد السرعة',
      'لا يؤثر على سرعة التفاعل أبداً',
      'يحوّل كل التفاعلات إلى تفاعلات نووية',
    ],
    correctAnswer: 1,
    explanation: 'رفع الحرارة يزيد نسبة الجزيئات التي تتجاوز طاقتها طاقة التنشيط فتتضاعف سرعة التفاعل.',
  },
  {
    id: 17,
    question: 'ما نوع التفاعل في المعادلة: CaCO₃(s) → CaO(s) + CO₂(g) عند التسخين؟',
    options: ['تفاعل اتحاد مباشر', 'تفاعل تفكك حراري (تحلل)', 'تفاعل إحلال مزدوج', 'تفاعل احتراق'],
    correctAnswer: 1,
    explanation: 'تفكك مركب واحد (كربونات الكالسيوم) إلى مادتين أبسط بالحرارة يُصنّف كتفاعل تفكك حراري.',
  },
  {
    id: 18,
    question: 'لماذا تكون زاوية الرابطة في جزيء الماء (H₂O) نحو 104.5° بدلاً من 180°؟',
    options: [
      'لوجود زوجين من الإلكترونات غير الرابطة على ذرة الأكسجين تدفعان الروابط للانحناء',
      'لأن الهيدروجين أثقل من الأكسجين',
      'لأن الماء مادة صلبة دائماً',
      'لعدم وجود إلكترونات تكافؤ في الأكسجين',
    ],
    correctAnswer: 0,
    explanation: 'أزواج الإلكترونات غير الرابطة (Lone Pairs) تُحدث تنافراً أكبر من الأزواج الرابطة، فتضغط زاوية H–O–H إلى 104.5°.',
  },
  {
    id: 19,
    question: 'ما الغاز الذي يتصاعد عند تفاعل فلز الخارصين (Zn) مع حمض الهيدروكلوريك المخفف (HCl)؟',
    options: ['غاز الأكسجين (O₂)', 'غاز الهيدروجين (H₂)', 'غاز النيتروجين (N₂)', 'غاز ثاني أكسيد الكربون (CO₂)'],
    correctAnswer: 1,
    explanation: 'يحل الخارصين محل الهيدروجين في تفاعل إحلال أحادي: Zn + 2HCl → ZnCl₂ + H₂↑.',
  },
  {
    id: 20,
    question: 'ما هو الشرط الأساسي لحدوث «تصادم فعّال» بين جزيئين متفاعلين وفق نظرية التصادم؟',
    options: [
      'أن يكون التوجيه الفراغي مناسباً والطاقة الحركية تساوي أو تفوق طاقة التنشيط',
      'أن يكونا في الحالة الصلبة فقط',
      'أن يكون لونهما متشابهاً',
      'أن تكون درجة الحرارة صفر مئوي',
    ],
    correctAnswer: 0,
    explanation: 'تتطلب نظرية التصادم شرطين معاً: طاقة كافية (≥ Ea) واتجاه تصادم صحيح لكسر الروابط القديمة وتكوين الجديدة.',
  },
];

const QUESTIONS_PER_ROUND = 5;

const shuffleArray = <T,>(items: T[]): T[] => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const pickNextRound = (seenIds: number[], lastRoundIds: number[]) => {
  const unseen = QUESTION_BANK.filter((q) => !seenIds.includes(q.id));
  if (unseen.length >= QUESTIONS_PER_ROUND) {
    const picked = shuffleArray(unseen).slice(0, QUESTIONS_PER_ROUND);
    return {
      questions: picked,
      nextSeenIds: [...seenIds, ...picked.map((q) => q.id)],
    };
  }
  const pool = shuffleArray(
    QUESTION_BANK.filter((q) => !unseen.some((u) => u.id === q.id) && !lastRoundIds.includes(q.id)),
  );
  const picked = [...shuffleArray(unseen), ...pool].slice(0, QUESTIONS_PER_ROUND);
  return {
    questions: picked,
    nextSeenIds: picked.map((q) => q.id),
  };
};

export const ChemicalQuiz = () => {
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundQuestions, setRoundQuestions] = useState<QuizQuestion[]>(() => QUESTION_BANK.slice(0, QUESTIONS_PER_ROUND));
  const [seenIds, setSeenIds] = useState<number[]>(() => QUESTION_BANK.slice(0, QUESTIONS_PER_ROUND).map((q) => q.id));

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const question = roundQuestions[currentQuestion] ?? roundQuestions[0];

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    if (answerIndex === question.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < roundQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
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
    setQuizCompleted(false);
    toast.success(`بدأت الجولة ${roundNumber + 1} بـ ${QUESTIONS_PER_ROUND} أسئلة كيميائية جديدة ومختلفة!`);
  };

  if (quizCompleted) {
    return (
      <Card className="p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold text-foreground">انتهت الجولة {roundNumber}!</h2>
        <div className="text-6xl font-bold text-primary">
          {score} / {roundQuestions.length}
        </div>
        <p className="text-xl text-muted-foreground">
          {score === roundQuestions.length && 'ممتاز! لقد أجبت على جميع الأسئلة بشكل صحيح!'}
          {score >= roundQuestions.length * 0.7 && score < roundQuestions.length && 'جيد جداً! أداء رائع!'}
          {score >= roundQuestions.length * 0.5 && score < roundQuestions.length * 0.7 && 'جيد! يمكنك التحسن أكثر.'}
          {score < roundQuestions.length * 0.5 && 'حاول جولة جديدة وراجع المعلومات.'}
        </p>
        <Button
          onClick={handleNewRound}
          size="lg"
          className="gap-2 font-bold"
          style={{ backgroundImage: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#ffffff' }}
        >
          <RefreshCw className="w-5 h-5" />
          إعادة الأسئلة (مجموعة جديدة ومختلفة)
        </Button>
      </Card>
    );
  }

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            السؤال {currentQuestion + 1} من {roundQuestions.length}
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3 h-3" />
            الجولة {roundNumber}
          </span>
        </div>
        <div className="text-sm font-bold text-muted-foreground">النقاط: {score}</div>
      </div>

      <div className="space-y-4">
        <p className="text-xl text-foreground font-medium">{question.question}</p>

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
                  {showExplanation && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {showExplanation && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
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
                <p className="font-semibold text-foreground">{isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}</p>
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {showExplanation && (
        <Button onClick={handleNext} size="lg" className="w-full">
          {currentQuestion < roundQuestions.length - 1 ? 'السؤال التالي' : 'إنهاء الاختبار'}
        </Button>
      )}
    </Card>
  );
};
