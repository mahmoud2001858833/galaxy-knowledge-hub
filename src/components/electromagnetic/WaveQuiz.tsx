import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Award, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface WaveQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUESTION_BANK: WaveQuestion[] = [
  {
    id: 1,
    question: 'ما هي سرعة جميع الموجات الكهرومغناطيسية في الفراغ؟',
    options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', 'تختلف حسب التردد'],
    correctAnswer: 1,
    explanation: 'جميع الموجات الكهرومغناطيسية تنتقل بسرعة الضوء الثابتة (3×10⁸ m/s) في الفراغ!',
  },
  {
    id: 2,
    question: 'أي نوع من الموجات الكهرومغناطيسية له أعلى طاقة وأقصر طول موجي؟',
    options: ['الأشعة فوق البنفسجية', 'الأشعة السينية', 'أشعة غاما', 'الضوء المرئي'],
    correctAnswer: 2,
    explanation: 'أشعة غاما لها أعلى تردد وبالتالي أعلى طاقة فوتون (E = hf) وأقصر طول موجي في الطيف.',
  },
  {
    id: 3,
    question: 'ما هي العلاقة بين التردد والطول الموجي للموجة الكهرومغناطيسية في الفراغ؟',
    options: ['علاقة طردية', 'علاقة عكسية', 'لا توجد علاقة', 'علاقة تربيعية'],
    correctAnswer: 1,
    explanation: 'العلاقة عكسية تماماً: كلما زاد التردد قل الطول الموجي وفق المعادلة λ = c / f.',
  },
  {
    id: 4,
    question: 'أي نوع من الإشعاع يُستخدم في أفران الميكروويف لتسخين الطعام؟',
    options: ['موجات الراديو', 'الموجات الميكروية', 'الأشعة تحت الحمراء', 'الأشعة السينية'],
    correctAnswer: 1,
    explanation: 'تستخدم أفران الميكروويف موجات ميكروية (2.45 GHz) تُحفّز دوران جزيئات الماء فتُنتج حرارة.',
  },
  {
    id: 5,
    question: 'ما هو الجزء الوحيد من الطيف الكهرومغناطيسي الذي يمكن للعين البشرية رؤيته؟',
    options: ['الأشعة فوق البنفسجية', 'الضوء المرئي', 'الأشعة تحت الحمراء', 'الأشعة السينية'],
    correctAnswer: 1,
    explanation: 'الضوء المرئي (بين 400 و790 THz تقريباً، أي 380–750 nm) هو النطاق الوحيد المرئي للعين البشرية.',
  },
  {
    id: 6,
    question: 'ما الزاوية بين المجال الكهربائي (E) والمجال المغناطيسي (B) واتجاه انتشار الموجة الكهرومغناطيسية؟',
    options: ['0° (متوازية)', '45°', '90° (متعامدة جميعها)', '180°'],
    correctAnswer: 2,
    explanation: 'الموجات الكهرومغناطيسية موجات مستعرضة يتعامد فيها E و B مع بعضهما ومع اتجاه الانتشار (90°).',
  },
  {
    id: 7,
    question: 'من هو العالم الذي وحّد الكهرباء والمغناطيسية والضوء في أربع معادلات رياضية شهيرة؟',
    options: ['إسحاق نيوتن', 'جيمس كليرك ماكسويل', 'غاليليو غاليلي', 'ديمتري مندليف'],
    correctAnswer: 1,
    explanation: 'أثبت جيمس كليرك ماكسويل أن الضوء موجة كهرومغناطيسية واشتق سرعته من ثابتَي العازلية والنفاذية.',
  },
  {
    id: 8,
    question: 'أي لون في الضوء المرئي يمتلك أعلى تردد وأعلى طاقة فوتون؟',
    options: ['الأحمر', 'الأصفر', 'الأخضر', 'البنفسجي'],
    correctAnswer: 3,
    explanation: 'الضوء البنفسجي (~380–440 nm) له أقصر طول موجي وأعلى تردد بين ألوان الطيف المرئي.',
  },
  {
    id: 9,
    question: 'ما هي الأشعة المسؤولة بشكل رئيسي عن التصوير الحراري والكشف عن حرارة الأجسام ليلاً؟',
    options: ['أشعة غاما', 'الأشعة تحت الحمراء', 'الأشعة السينية', 'الأشعة فوق البنفسجية'],
    correctAnswer: 1,
    explanation: 'تُشع الأجسام الدافئة بقوة في نطاق الأشعة تحت الحمراء، وهو ما تلتقطه الكاميرات الحرارية.',
  },
  {
    id: 10,
    question: 'ماذا يمثل متجه بوينتنج (S = (1/μ₀) E × B) في الكهرومغناطيسية؟',
    options: ['كتلة الفوتون', 'اتجاه وكثافة تدفق الطاقة الكهرومغناطيسية لكل وحدة مساحة', 'شحنة الإلكترون', 'مقاومة السلك'],
    correctAnswer: 1,
    explanation: 'يُحدد متجه بوينتنج مقدار الطاقة المنقولة عبر وحدة المساحة في الثانية (W/m²) واتجاه انتشارها.',
  },
  {
    id: 11,
    question: 'لماذا تنتقل الموجات الكهرومغناطيسية عبر الفضاء الخارجي بخلاف الموجات الصوتية؟',
    options: [
      'لأنها أثقل من الصوت',
      'لأنها لا تحتاج إلى وسط مادي وتنتشر عبر تذبذب مجالات كهربائية ومغناطيسية متجددة',
      'لأن الفضاء يحتوي هواءً كثيفاً',
      'لأن ترددها صفر',
    ],
    correctAnswer: 1,
    explanation: 'المجال الكهربائي المتغير يولّد مجالاً مغناطيسياً متغيراً والعكس، لذا تنتشر ذاتياً في الفراغ.',
  },
  {
    id: 12,
    question: 'أي نوع من الأشعة يُستخدم في تعقيم الأدوات الطبية ومياه الشرب بفعالية عالية؟',
    options: ['موجات الراديو AM', 'الأشعة فوق البنفسجية (UV-C)', 'الضوء الأحمر', 'الموجات الصوتية'],
    correctAnswer: 1,
    explanation: 'الأشعة فوق البنفسجية القصيرة UV-C تُحطّم الحمض النووي للبكتيريا والفيروسات فتُعقّم الأسطح والمياه.',
  },
  {
    id: 13,
    question: 'إذا تضاعف تردد موجة كهرومغناطيسية مرتين في الفراغ، فماذا يحدث لطاقة الفوتون الواحد فيها؟',
    options: ['تقل للنصف', 'تبقى ثابتة', 'تتضاعف مرتين', 'تتضاعف أربع مرات'],
    correctAnswer: 2,
    explanation: 'وفق علاقة بلانك E = hf، تتناسب طاقة الفوتون طردياً مع التردد f.',
  },
  {
    id: 14,
    question: 'ماذا يعني الاستقطاب الخطي (Linear Polarization) للموجة الكهرومغناطيسية؟',
    options: [
      'تذبذب المجال الكهربائي في مستوى واحد ثابت فقط',
      'توقف المجال المغناطيسي تماماً',
      'تحول الموجة إلى موجة طولية',
      'انخفاض سرعة الضوء إلى النصف في الفراغ',
    ],
    correctAnswer: 0,
    explanation: 'في الاستقطاب الخطي يهتز متجه المجال الكهربائي E على خط ومستوى ثابتين أثناء انتشار الموجة.',
  },
  {
    id: 15,
    question: 'أي نطاق من الطيف الكهرومغناطيسي يمتلك أطول طول موجي (قد يصل لمئات الأمتار أو الكيلومترات)؟',
    options: ['الأشعة السينية', 'موجات الراديو', 'الضوء الأزرق', 'أشعة غاما'],
    correctAnswer: 1,
    explanation: 'موجات الراديو تقع عند أدنى تردد في الطيف الكهرومغناطيسي، لذا تمتلك أطول أطوال موجية.',
  },
  {
    id: 16,
    question: 'لماذا تُستخدم الأشعة السينية (X-rays) لتصوير العظام دون الأنسجة الرخوة؟',
    options: [
      'لأنها تنعكس عن الجلد فقط',
      'لأن طاقتها العالية تسمح لها باختراق الأنسجة الرخوة بينما يمتصها الكالسيوم الكثيف في العظام',
      'لأن طولها الموجي أكبر من متر',
      'لأنها غير كهرومغناطيسية',
    ],
    correctAnswer: 1,
    explanation: 'تمتص ذرات الكالسيوم عالية العدد الذري في العظام الأشعة السينية بشدة فتظهر العظام واضحة في الصورة.',
  },
  {
    id: 17,
    question: 'ما هو التردد التقريبي للضوء الأخضر الذي تبلغ ذروة حساسية العين البشرية عنده (~550 nm)؟',
    options: ['55 Hz', '5.5 GHz', '545 THz', '545 EHz'],
    correctAnswer: 2,
    explanation: 'بحساب f = c / λ = (3×10⁸) / (550×10⁻⁹) ≈ 5.45×10¹⁴ Hz = 545 THz.',
  },
  {
    id: 18,
    question: 'ماذا يحدث لسرعة الموجة الكهرومغناطيسية عندما تنتقل من الفراغ إلى الزجاج أو الماء؟',
    options: ['تزداد سرعتها', 'تنخفض سرعتها وطولها الموجي بينما يبقى التردد ثابتاً', 'يتغير التردد وتثبت السرعة', 'تتوقف تماماً'],
    correctAnswer: 1,
    explanation: 'في الوسط الشفاف تصبح السرعة v = c / n فينقص الطول الموجي، بينما يبقى التردد ثابتاً لأنه يعتمد على المصدر.',
  },
  {
    id: 19,
    question: 'ما الذي تحمينا منه طبقة الأوزون (O₃) في الغلاف الجوي بشكل أساسي؟',
    options: ['موجات الراديو', 'معظم الأشعة فوق البنفسجية الضارة (UV-B و UV-C)', 'الضوء المرئي الأخضر', 'موجات Wi-Fi'],
    correctAnswer: 1,
    explanation: 'تمتص طبقة الأوزون معظم الأشعة فوق البنفسجية عالية الطاقة وتحمي الكائنات الحية من تلف الحمض النووي.',
  },
  {
    id: 20,
    question: 'كيف تعمل الألياف الضوئية في نقل الإنترنت بسرعات هائلة عبر القارات؟',
    options: [
      'عبر موجات صوتية',
      'عبر نبضات ضوئية/تحت حمراء تنعكس داخلياً كلياً داخل ليف زجاجي فائق النقاء',
      'عبر أشعة غاما',
      'عبر تيار كهربائي مباشر فقط',
    ],
    correctAnswer: 1,
    explanation: 'تستخدم الألياف الضوئية ظاهرة الانعكاس الكلي الداخلي لنقل نبضات الأشعة تحت الحمراء القريبة بفقد ضئيل جداً.',
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

const WaveQuiz = () => {
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundQuestions, setRoundQuestions] = useState<WaveQuestion[]>(() => QUESTION_BANK.slice(0, QUESTIONS_PER_ROUND));
  const [seenIds, setSeenIds] = useState<number[]>(() => QUESTION_BANK.slice(0, QUESTIONS_PER_ROUND).map((q) => q.id));

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
    toast.success(`بدأت الجولة ${roundNumber + 1} بـ 5 أسئلة علمية جديدة ومختلفة!`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">الاختبار العلمي</h3>
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

              {currentQuestion === roundQuestions.length - 1 ? (
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
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WaveQuiz;
