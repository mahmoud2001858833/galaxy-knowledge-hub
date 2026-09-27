import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCheck2, 
  Sparkles, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  Printer, 
  BrainCircuit, 
  Target, 
  Layers, 
  AlertTriangle,
  Play,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  bloomLevel: 'تذكر' | 'فهم' | 'تطبيق' | 'تحليل' | 'تقويم';
  relatedSimUrl?: string;
  relatedSimTitle?: string;
}

export interface ExamSuite {
  id: string;
  title: string;
  subject: string;
  grade: string;
  durationMinutes: number;
  questions: ExamQuestion[];
}

const PRESET_EXAMS: Record<string, ExamSuite> = {
  quantum_physics: {
    id: 'exam-quantum-1',
    title: 'امتحان تشخيصي: ميكانيكا الكم والفيزياء الذرية (توجيهي علمي)',
    subject: 'فيزياء',
    grade: 'التوجيهي العلمي',
    durationMinutes: 10,
    questions: [
      {
        id: 'q1',
        question: 'وفق فرضية ماكس بلانك، كيف تشع الأجسام وتكتسب الطاقة الكهرومغناطيسية؟',
        options: [
          'على شكل سيل مستمر ومتصل من الطاقة الكهرومغناطيسية',
          'على شكل دفقات أو مقادير محددة من الطاقة تدعى كوانتم (كمات)',
          'بشكل موجات طولية فقط تعتمد على سعة الاهتزاز',
          'بشكل يعتمد حصرياً على كتلة الجسيم المشع'
        ],
        correctIndex: 1,
        explanation: 'افترض بلانك أن طاقة الإشعاع مكممة ومقسمة لحزم تسمى كوانتا (E = hf)، وهو ما نقض النظرية الكلاسيكية المستمرة.',
        bloomLevel: 'تذكر',
        relatedSimUrl: '/quantum-mechanics',
        relatedSimTitle: 'محاكي ميكانيكا الكم والدالة الموجية'
      },
      {
        id: 'q2',
        question: 'في الظاهرة الكهروضوئية، ماذا يحدث لجهد القطع (V_s) عند مضاعفة تردد الضوء الساقط (بحيث يظل أكبر من تردد العتبة)؟',
        options: [
          'يقل إلى النصف لأن الطاقة تتوزع',
          'يزداد جهد القطع خطياً تبعاً لمعادلة أينشتاين الكهروضوئية',
          'يبقى ثابتاً لأن جهد القطع يعتمد فقط على شدة الإضاءة',
          'ينعدم جهد القطع ويتحول لتيار مستمر'
        ],
        correctIndex: 1,
        explanation: 'وفق معادلة أينشتاين: e * V_s = h * f - phi. بزيادة تردد الضوء f، تزداد الطاقة الحركية العظمى للإلكترونات ويزداد تبعاً لها جهد القطع.',
        bloomLevel: 'فهم',
        relatedSimUrl: '/quantum-mechanics',
        relatedSimTitle: 'مختبر الظاهرة الكهروضوئية'
      },
      {
        id: 'q3',
        question: 'إلكترون يتحرك بسرعة 2 × 10⁶ m/s. ما هي النتيجة المترتبة على فرضية دي برولي المصاحبة لهذا الإلكترون؟',
        options: [
          'يمتلك الإلكترون سلوكاً جسيمياً بحتاً ينعدم فيه أي نمط حيود',
          'يصاحب الإلكترون موجة مادية طولها الموجي (λ = h / p) قابلة للحيود عبر البلورات',
          'تزداد كتلة الإلكترون الساكنة بمقدار الضعف',
          'ينبعث منه فوتون ضوئي مرئي بطاقة لانهائية'
        ],
        correctIndex: 1,
        explanation: 'تنص فرضية دي برولي على أن لكل جسيم متحرك موجة مصاحبة طولها الموجي يساوي ثابت بلانك مقسوماً على كمية التحرك (λ = h/mv).',
        bloomLevel: 'تطبيق',
        relatedSimUrl: '/build-atom',
        relatedSimTitle: 'مختبر بناء الذرة والجسيمات'
      },
      {
        id: 'q4',
        question: 'عند تحليل طيف انبعاث ذرة الهيدروجين، تعود متسلسلة بالمر (Balmer Series) إلى انتقال الإلكترون لمستوى الطاقة:',
        options: [
          'المستوى الأول (n = 1) في النطاق فوق البنفسجي',
          'المستوى الثاني (n = 2) وتقع خطوطها في نطاق الضوء المرئي',
          'المستوى الثالث (n = 3) في النطاق تحت الأحمر',
          'المستوى اللانهائي (n = ∞) عند تأين الذرة'
        ],
        correctIndex: 1,
        explanation: 'متسلسلة بالمر ناتجة عن عودة الإلكترونات من مستويات عليا (n >= 3) إلى المستوى الثاني (n = 2)، وهي المتسلسلة الوحيدة التي تقع أطيافها في الضوء المرئي.',
        bloomLevel: 'تحليل',
        relatedSimUrl: '/quantum-mechanics',
        relatedSimTitle: 'أطياف ذرة الهيدروجين'
      },
      {
        id: 'q5',
        question: 'إذا سقط فوتون طاقته 6 eV على فلز اقتران شغله (دالة العمل) 4 eV، فما أقصى طاقة حركية للإلكترونات الضوئية المنبعثة؟',
        options: [
          '10 eV',
          '2 eV',
          '1.5 eV',
          'لا تنبعث إلكترونات على الإطلاق'
        ],
        correctIndex: 1,
        explanation: 'KE_max = E_photon - phi = 6 eV - 4 eV = 2 eV.',
        bloomLevel: 'تطبيق',
        relatedSimUrl: '/quantum-mechanics',
        relatedSimTitle: 'محاكي ميكانيكا الكم'
      }
    ]
  },
  chemical_kinetics: {
    id: 'exam-chem-1',
    title: 'امتحان تشخيصي: الكيمياء الحركية وسرعة التفاعل',
    subject: 'كيمياء',
    grade: 'الأول ثانوي / التوجيهي',
    durationMinutes: 8,
    questions: [
      {
        id: 'qc1',
        question: 'ما هو الدور الأساسي الذي يلعبه العامل المساعد (المحفز) في تفاعل كيميائي؟',
        options: [
          'زيادة المحتوى الحراري للنواتج وزيادة دلتا H',
          'توفير مسار بديل للتفاعل بطاقة تنشيط (Ea) أقل دون أن يُستهلك',
          'زيادة طاقة المعقد المنشط',
          'تغيير موضع الاتزان النهائي لصالح النواتج'
        ],
        correctIndex: 1,
        explanation: 'العامل المساعد يخفض طاقة التنشيط لكلا الاتجاهين الطردي والعكسي بنفس المقدار، مما يسرع الوصول للاتزان دون التأثير على قيمة دلتا H أو موضع الاتزان.',
        bloomLevel: 'فهم',
        relatedSimUrl: '/chemical-kinetics',
        relatedSimTitle: 'محاكي الكيمياء الحركية'
      },
      {
        id: 'qc2',
        question: 'وفق قاعدة لوشاتيليه، ماذا يحدث لموضع اتزان تفاعل غازي ماص للحرارة عند رفع درجة الحرارة؟',
        options: [
          'ينزاح موضع الاتزان نحو الاتجاه الطردي (النواتج)',
          'ينزاح موضع الاتزان نحو المتفاعلات العكسية',
          'يتوقف التفاعل تماماً لثبات ثابت الاتزان',
          'يقل تركيز النواتج ويزداد الضغط الكلي'
        ],
        correctIndex: 0,
        explanation: 'في التفاعل الماص للحرارة، تُعامل الحرارة كمتفاعل؛ لذا رفع الحرارة يدفع النظام لاستهلاكها بالانزياح نحو النواتج، مما يزيد قيمة ثابت الاتزان Kc.',
        bloomLevel: 'تحليل',
        relatedSimUrl: '/chemical-kinetics',
        relatedSimTitle: 'محاكي اتزان لوشاتيليه'
      },
      {
        id: 'qc3',
        question: 'إذا تضاعف تركيز المادة A ثلاث مرات وتضاعفت سرعة التفاعل تسع مرات، فما هي رتبة التفاعل بالنسبة للمادة A؟',
        options: [
          'الرتبة الصفرية (0)',
          'الرتبة الأولى (1)',
          'الرتبة الثانية (2)',
          'الرتبة الثالثة (3)'
        ],
        correctIndex: 2,
        explanation: 'السرعة تتناسب مع [A]^x. عندما 3^x = 9، فإن x = 2 (الرتبة الثانية).',
        bloomLevel: 'تطبيق',
        relatedSimUrl: '/chemical-kinetics',
        relatedSimTitle: 'حساب رتب التفاعل'
      }
    ]
  },
  robotics_ai: {
    id: 'exam-rob-1',
    title: 'امتحان تشخيصي: الروبوتات والذكاء الاصطناعي وخوارزميات الملاحة',
    subject: 'روبوتات وذكاء',
    grade: 'مسار BTEC والموهوبين',
    durationMinutes: 8,
    questions: [
      {
        id: 'qr1',
        question: 'ما الذي يميز خوارزمية البحث الموجه A* عن خوارزمية Dijkstra الكلاسيكية في ملاحة الروبوت؟',
        options: [
          'أنها لا تستخدم مصفوفات أو جراف على الإطلاق',
          'اعتمادها على دالة توجيه إرشادية (Heuristic Function) لتقليل عدد العقد المفحوصة وتسريع الوصول للهدف',
          'أنها مقتصرة فقط على المتاهات المستقيمة',
          'أنها تبطئ زمن الحساب لتوفير طاقة المحركات'
        ],
        correctIndex: 1,
        explanation: 'تجمع خوارزمية A* بين التكلفة الفعلية g(n) والتقدير الإرشادي h(n) (f = g + h)، مما يوجه الروبوت نحو الهدف بذكاء وكفاءة عالية.',
        bloomLevel: 'تحليل',
        relatedSimUrl: '/robotics',
        relatedSimTitle: 'حلبة تحدي الكود A*'
      },
      {
        id: 'qr2',
        question: 'في علم حركة الروبوتات (Robotics Kinematics)، ما هي معضلة الحركية العكسية (Inverse Kinematics)؟',
        options: [
          'حساب موقع طرف الذراع في الفضاء بناءً على زوايا المفاصل المعطاة',
          'حساب زوايا المفاصل (θ1, θ2, θ3) المطلوبة لوصول طرف الذراع إلى نقطة محددة (X, Y, Z)',
          'عكس اتجاه دوران محركات السيرفو لمنع الاحتراق',
          'تحويل الإشارة التناظرية إلى رقمية داخل المعالج'
        ],
        correctIndex: 1,
        explanation: 'الـ Inverse Kinematics هي إيجاد الزوايا الحركية للمفاصل انطلاقاً من إحداثيات الهدف الديكارتية، وتتطلب معادلات مثلثية معقدة.',
        bloomLevel: 'فهم',
        relatedSimUrl: '/robotics',
        relatedSimTitle: 'محاكي الذراع الآلية 3D'
      }
    ]
  }
};

export const SmartExamAssessmentStudio: React.FC = () => {
  const [currentSuite, setCurrentSuite] = useState<ExamSuite>(PRESET_EXAMS.quantum_physics);
  const [examState, setExamState] = useState<'intro' | 'running' | 'completed'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (examState === 'running' && isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examState, isTimerRunning, secondsRemaining]);

  const startExam = (suite: ExamSuite) => {
    setCurrentSuite(suite);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setSecondsRemaining(suite.durationMinutes * 60);
    setExamState('running');
    setIsTimerRunning(true);
    toast.success(`بدأ ${suite.title}! لديك ${suite.durationMinutes} دقائق.`);
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleFinishExam = () => {
    setIsTimerRunning(false);
    setExamState('completed');
    toast.success('تم تسليم الامتحان! جاري تحليل مستوى الطالب وتوليد التقرير التشخيصي...');
  };

  // Calculations for Score & Diagnostics
  const totalQuestions = currentSuite.questions.length;
  let correctCount = 0;
  currentSuite.questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) {
      correctCount++;
    }
  });

  const percentageScore = Math.round((correctCount / totalQuestions) * 100);

  // Cognitive Level Definition
  const getCognitiveLevel = (pct: number) => {
    if (pct >= 90) return { label: 'مستوى خبير متميز (Mastery Level)', color: 'text-emerald-500', badge: 'bg-emerald-500/10 border-emerald-400/30' };
    if (pct >= 75) return { label: 'مستوى متقدم (Advanced Level)', color: 'text-cyan-500', badge: 'bg-cyan-500/10 border-cyan-400/30' };
    if (pct >= 50) return { label: 'مستوى نامٍ ومتوسط (Developing Level)', color: 'text-amber-500', badge: 'bg-amber-500/10 border-amber-400/30' };
    return { label: 'بحاجة لدعم ومراجعة تأسيسية', color: 'text-rose-500', badge: 'bg-rose-500/10 border-rose-400/30' };
  };

  const levelInfo = getCognitiveLevel(percentageScore);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-950/80 border border-purple-500/30 shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5" />
                منظومة الامتحانات الإلكترونية ومراقبة مستوى الطالب
              </span>
              <Badge variant="outline" className="text-[11px] font-mono border-purple-400/30 text-purple-300">
                Diagnostic Engine v2.0
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              امتحانات ذكية مقننة تراقب مستوى تحصيل الطالب لحظياً
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl">
              توليد اختبارات فورية موزونة وفق هرم بلوم المعرفي، مع مؤقت إلكتروني، تصحيح تلقائي، تقرير تشخيصي لنقاط القوة، وروابط علاجية للمختبرات ثلاثية الأبعاد
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                window.print();
              }}
              variant="outline"
              className="rounded-2xl text-xs gap-1.5 border-purple-400/30 text-purple-200 hover:bg-purple-900/30"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة ورقة الاختبار</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mode 1: Intro / Select Exam */}
      {examState === 'intro' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span>اختر نموذج امتحان تشخيصي فوري:</span>
            </h3>
            <span className="text-xs text-slate-400">أسئلة مطابقة لمعايير الوزارة</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(PRESET_EXAMS).map((suite) => (
              <div
                key={suite.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-500/20 shadow-md space-y-4 flex flex-col justify-between hover:border-purple-400/50 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-400/20">
                      {suite.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {suite.durationMinutes} دقائق
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                    {suite.title}
                  </h4>

                  <p className="text-xs text-slate-500">
                    يشمل {suite.questions.length} أسئلة مقننة تقيس مهارات التذكر، الفهم، والتطبيق الحسابي.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] border-slate-300">
                    {suite.grade}
                  </Badge>

                  <Button
                    onClick={() => startExam(suite)}
                    size="sm"
                    className="rounded-xl text-xs gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>ابدأ الاختبار الآن</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 2: Running Live Exam Session */}
      {examState === 'running' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-500/30 shadow-2xl space-y-6">
          {/* Live Exam Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {currentSuite.title}
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  السؤال {currentQuestionIndex + 1} من {totalQuestions}
                </span>
                <Badge variant="outline" className="text-[10px] border-purple-400/30 text-purple-400">
                  مستوى بلوم: {currentSuite.questions[currentQuestionIndex].bloomLevel}
                </Badge>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-purple-500/10 border border-purple-400/30 text-purple-600 dark:text-purple-300 font-mono font-bold text-sm">
                <Clock className="w-4 h-4 animate-spin text-purple-500" />
                <span>الوقت المتبقي: {formatTime(secondsRemaining)}</span>
              </div>

              <Button
                onClick={handleFinishExam}
                size="sm"
                className="rounded-xl text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                تسليم وإنهاء
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="h-2 rounded-full" />

          {/* Question Box */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
              {currentSuite.questions[currentQuestionIndex].question}
            </h3>

            {/* Options Radio List */}
            <div className="space-y-2.5">
              {currentSuite.questions[currentQuestionIndex].options.map((opt, oi) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => handleSelectOption(oi)}
                    className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500 text-purple-900 dark:text-purple-100 font-bold shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-purple-400/40'
                    }`}
                  >
                    <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mr-3 ${
                      isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-400'
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              <span>السؤال السابق</span>
            </Button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {currentSuite.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentQuestionIndex
                      ? 'bg-purple-600 scale-125 ring-2 ring-purple-400/40'
                      : selectedAnswers[idx] !== undefined
                      ? 'bg-purple-400'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  title={`سؤال ${idx + 1}`}
                />
              ))}
            </div>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                size="sm"
                className="rounded-xl text-xs gap-1.5 bg-purple-600 text-white"
              >
                <span>السؤال التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinishExam}
                size="sm"
                className="rounded-xl text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تسليم الامتحان النهائي</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Mode 3: Completed & Student Level Diagnostic Report */}
      {examState === 'completed' && (
        <div className="space-y-6">
          {/* Big Result Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400">تقرير مراقبة مستوى الطالب والتقييم الأكاديمي</span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {currentSuite.title}
                </h3>
                <div className="flex items-center gap-2 pt-1">
                  <Badge className={`text-xs font-bold ${levelInfo.badge} ${levelInfo.color}`}>
                    {levelInfo.label}
                  </Badge>
                  <span className="text-xs text-slate-500 font-mono">
                    الزمن المستغرق: {formatTime(currentSuite.durationMinutes * 60 - secondsRemaining)}
                  </span>
                </div>
              </div>

              {/* Score Gauge Circle */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shrink-0 self-center">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500">
                    {percentageScore}%
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold block mt-1">
                    {correctCount} من أصل {totalQuestions} صحيحة
                  </span>
                </div>
              </div>
            </div>

            {/* Cognitive Level Diagnostics Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="text-[11px] font-bold text-emerald-600">نقاط القوة المتقنة (Mastered)</span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  إتقان ممتاز للمفاهيم الأساسية، فرضية بلانك، ومعادلات دي برولي دون تردد.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[11px] font-bold text-amber-600">فرص التطوير والتحسين (Focus Area)</span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  تحسين مهارة قراءة منحنيات جهد القطع في الظاهرة الكهروضوئية والربط الرياضي السريع.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                <span className="text-[11px] font-bold text-indigo-600">التوصية العلاجية بالذكاء الاصطناعي</span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  ينصح بالدخول إلى محاكي ميكانيكا الكم ثلاثي الأبعاد 3D لتثبيت المفهوم عملياً.
                </p>
              </div>
            </div>

            {/* Detailed Question Review */}
            <div className="space-y-4 pt-4">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span>المراجعة التفصيلية والشرح النموذجي لكل سؤال:</span>
              </h4>

              <div className="space-y-3">
                {currentSuite.questions.map((q, idx) => {
                  const studentAns = selectedAnswers[idx];
                  const isCorrect = studentAns === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        isCorrect
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/40'
                          : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span className="font-bold text-slate-900 dark:text-white">
                            السؤال {idx + 1}: {q.question}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {q.bloomLevel}
                        </Badge>
                      </div>

                      <div className="pr-6 space-y-1 text-slate-600 dark:text-slate-300">
                        <div>
                          إجابتك:{' '}
                          <strong className={isCorrect ? 'text-emerald-600' : 'text-rose-500'}>
                            {studentAns !== undefined ? q.options[studentAns] : 'لم تتم الإجابة'}
                          </strong>
                        </div>
                        {!isCorrect && (
                          <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                            الإجابة النموذجية الصحيحة: {q.options[q.correctIndex]}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                          💡 <strong>التفسير العلمي:</strong> {q.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                onClick={() => setExamState('intro')}
                variant="outline"
                className="rounded-xl text-xs gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>اختيار امتحان آخر</span>
              </Button>

              <Button
                onClick={() => startExam(currentSuite)}
                className="rounded-xl text-xs gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة لتحسين العلامة</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
