import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Play, Pause, RotateCcw, Maximize2, Minimize2, 
  Sparkles, BookOpen, Layers, Target, CheckCircle2, 
  ArrowRight, X, Cpu, Gauge, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { labSound } from '@/utils/labAudio';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'عند إضافة مقاوم إضافي على التوالي في دائرة كهربائية بسيطة مع ثبات جهد البطارية، ماذا يحدث للتيار الكلي المار؟',
    options: [
      'يزداد التيار الكلي بسبب زيادة عدد المقاومات',
      'يقل التيار الكلي لأن المقاومة المكافئة للدائرة تزداد (Req = R1 + R2)',
      'يبقى التيار ثابتاً ولا يتغير',
      'ينعكس اتجاه التيار فوراً'
    ],
    correctIndex: 1,
    explanation: 'وفقاً لقانون أوم (I = V / Req)، في التوصيل على التوالي تزداد المقاومة المكافئة (Req = R1 + R2)، مما يؤدي لنقصان شدة التيار الكلي المار في الدائرة.'
  },
  {
    id: 2,
    question: 'كيف يجب توصيل جهاز الفولتميتر لقياس فرق الجهد الكهربائي بين طرفي مصباح في الدائرة؟',
    options: [
      'على التوازي مباشرة بين طرفي المصباح',
      'على التوالي بقطع السلك ووضع الجهاز في مسار التيار',
      'في أي مكان عشوائي دون الحاجة لتوصيل السلكين',
      'توصيله مع القطب السالب فقط'
    ],
    correctIndex: 0,
    explanation: 'يوصل الفولتميتر دائماً على التوازي لقياس فرق الجهد بين نقطتين، ويتميز بمقاومة داخلية عالية جداً حتى لا يسحب تياراً من الدائرة الأصلية.'
  },
  {
    id: 3,
    question: 'ما الوظيفة الأساسية للمنصهر الكهربائي (Fuse) في الدوائر الإلكترونية؟',
    options: [
      'تخزين الشحنات الكهربائية لاستخدامها لاحقاً',
      'حماية عناصر الدائرة والأسلاك من الاحتراق عند حدوث قصر دارة (Short Circuit) بقطع التيار فوراً',
      'زيادة شدة إضاءة المصابيح',
      'تحويل التيار المستمر إلى تيار متناوب'
    ],
    correctIndex: 1,
    explanation: 'المنصهر يحتوي على سلك فلزي رقيق ينصهر وينقطع عند مرور تيار يتجاوز حده المقنن، مما يفتح الدائرة ويمنع نشوب حرائق أو تلف المكونات الحساسة.'
  }
];

const LAB_MISSIONS = [
  {
    id: 'm1',
    title: 'التحقق من قانون أوم عملياً',
    target: 'ابنِ دائرة تحتوي على بطارية 9 فولت ومقاوم 10 أوم، ثم قس شدة التيار باستخدام الأميتر وتأكد من مطابقتها للقيمة النظرية (0.9 أمبير).',
    condition: 'قراءة أميتر مستقرة تساوي 0.90 A.'
  },
  {
    id: 'm2',
    title: 'المقارنة بين التوصيل على التوالي والتوازي',
    target: 'وصّل مصباحين متماثلين أولاً على التوالي ثم على التوازي، وقارن بين شدة إضاءة المصابيح وقراءة التيار في الحالتين.',
    condition: 'ملاحظة إضاءة أشد في التوازي وثبات فرق الجهد على كل مصباح مساوياً لجهد البطارية.'
  },
  {
    id: 'm3',
    title: 'اختبار قصر الدارة وأمان المنصهر',
    target: 'أضف منصهر كهربائي بقيمة 4 أمبير في الدائرة، ثم اصنع سلكاً مباشراً يقصر طرفي البطارية ولاحظ انصهار الفيوز وحماية الدائرة.',
    condition: 'انقطاع سلك المنصهر فور تجاوز التيار للحد الأقصى.'
  }
];

const CircuitConstructionKitDcSimulation: React.FC = () => {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'theory' | 'missions' | 'quiz'>('theory');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleResetIframe = () => {
    setIframeKey(prev => prev + 1);
    try { labSound?.click(); } catch(e) {}
  };

  const handleAnswerQuiz = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    try { labSound?.click(); } catch(e) {}
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score === QUIZ_QUESTIONS.length) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="h-screen w-screen bg-[#030712] text-slate-100 flex flex-col overflow-hidden select-none" dir="rtl">
      
      {/* Sleek Top Laboratory Workbench Bar */}
      <header className="h-14 bg-slate-950/95 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 backdrop-blur-md">
        
        {/* Right side: Back button & Lab Identity */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/experiments')}
            className="text-slate-300 hover:text-white hover:bg-slate-800/80 gap-1.5 text-xs px-2.5 h-8.5 rounded-xl border border-slate-800"
          >
            <ArrowRight className="w-4 h-4 ml-0.5" />
            <span className="hidden sm:inline">العودة لدليل التجارب</span>
            <span className="sm:hidden">رجوع</span>
          </Button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-orange-600 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm text-white tracking-tight">
                  بناء الدوائر الكهربائية (DC)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 font-bold border border-amber-800/60 hidden md:inline">
                  مختبر ذروة العلم 2.0
                </span>
              </div>
              <div className="text-[10.5px] text-slate-400 hidden lg:block">
                قانون أوم (V = I·R) • قوانين كيرشوف للجهد والتيار • التوصيل على التوالي والتوازي
              </div>
            </div>
          </div>
        </div>

        {/* Left side: Quick Workbench Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGuideOpen(true)}
            className="h-8.5 px-3 text-xs gap-1.5 rounded-xl border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-900/40 hover:text-amber-200"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">دليل ومهمات التجربة</span>
            <span className="sm:hidden">الدليل</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetIframe}
            className="h-8.5 w-8.5 p-0 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            title="إعادة تشغيل التجربة"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFullscreen}
            className="h-8.5 w-8.5 p-0 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </header>

      {/* Main Simulation Viewport (Edge-to-Edge Direct Immersion) */}
      <main className="flex-1 w-full h-[calc(100vh-56px)] bg-black relative overflow-hidden">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src="/simulations/circuit-construction-kit-dc.html?initialScreen=1"
          title="بناء الدوائر الكهربائية (DC) | منصة ذروة العلم 2.0"
          className="w-full h-full border-0 block"
          allow="fullscreen; autoplay; clipboard-write"
          loading="eager"
        />
      </main>

      {/* Slide-over Lab Manual Drawer */}
      <AnimatePresence>
        {isGuideOpen && (
          <div className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-lg h-full bg-slate-900/98 border-l border-slate-800 shadow-2xl flex flex-col text-right overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">الدليل العلمي والتحديات المعملية</h3>
                    <p className="text-[11px] text-slate-400">بناء الدوائر الكهربائية وقوانين كيرشوف</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGuideOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-3 p-2 bg-slate-950/40 border-b border-slate-800 gap-1">
                <button
                  onClick={() => setActiveGuideTab('theory')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    activeGuideTab === 'theory' 
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  الأساس العلمي
                </button>
                <button
                  onClick={() => setActiveGuideTab('missions')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    activeGuideTab === 'missions' 
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  المهمات والتجارب
                </button>
                <button
                  onClick={() => setActiveGuideTab('quiz')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    activeGuideTab === 'quiz' 
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  اختبار الفهم
                </button>
              </div>

              {/* Drawer Content Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-slate-300">
                {activeGuideTab === 'theory' && (
                  <div className="space-y-4">
                    <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        قانون أوم الأساسي
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-300">
                        ينص قانون أوم على أن شدة التيار المار في موصل تتناسب طردياً مع فرق الجهد بين طرفيه وعكسياً مع مقاومته:
                      </p>
                      <div className="my-2.5 p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/20 font-mono text-xs text-center text-amber-300" dir="ltr">
                        V = I · R &nbsp;|&nbsp; I = V / R &nbsp;|&nbsp; R = V / I
                      </div>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        التوالي مقابل التوازي
                      </h4>
                      <ul className="text-xs space-y-2 list-disc list-inside text-slate-300">
                        <li>
                          <strong className="text-white">التوصيل على التوالي:</strong> يمر نفس التيار في جميع المقاومات، بينما يتجزأ الجهد:
                          <div className="font-mono text-cyan-300 my-1 text-center" dir="ltr">R_eq = R_1 + R_2 + ...</div>
                        </li>
                        <li>
                          <strong className="text-white">التوصيل على التوازي:</strong> يتساوى فرق الجهد على جميع الفروع، بينما يتجزأ التيار الكلي:
                          <div className="font-mono text-cyan-300 my-1 text-center" dir="ltr">1/R_eq = 1/R_1 + 1/R_2 + ...</div>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        قصر الدارة والأمان الكهربائي
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-300">
                        عند توصيل قطبي المصدر بسلك عديم المقاومة، تقترب المقاومة الكلية من الصفر وتتصاعد شدة التيار إلى ما لا نهاية نظرياً، مما يولد حرارة شديدة قد تشعل حرائق ما لم يتوفر منصهر قاطع.
                      </p>
                    </div>
                  </div>
                )}

                {activeGuideTab === 'missions' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      نفّذ التحديات المعملية التالية داخل المحاكاة لإتقان تصميم وتحليل الدوائر:
                    </p>
                    {LAB_MISSIONS.map((m, idx) => (
                      <div key={m.id} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-amber-400">المهمة {idx + 1}: {m.title}</span>
                          <Target className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-xs text-slate-300">{m.target}</p>
                        <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80 text-[11px] text-slate-400">
                          <span className="text-amber-400 font-bold">معيار التحقق: </span>{m.condition}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeGuideTab === 'quiz' && (
                  <div className="space-y-5">
                    {QUIZ_QUESTIONS.map(q => (
                      <div key={q.id} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-3">
                        <h4 className="text-xs font-bold text-white">{q.id}. {q.question}</h4>
                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = quizAnswers[q.id] === oIdx;
                            const isCorrect = q.correctIndex === oIdx;
                            let btnStyle = "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800";
                            if (quizSubmitted) {
                              if (isCorrect) btnStyle = "bg-emerald-950/80 border-emerald-600 text-emerald-200";
                              else if (isSelected) btnStyle = "bg-rose-950/80 border-rose-600 text-rose-200";
                            } else if (isSelected) {
                              btnStyle = "bg-amber-900/50 border-amber-500 text-amber-200";
                            }
                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleAnswerQuiz(q.id, oIdx)}
                                className={`w-full text-right p-2.5 text-xs rounded-lg border transition-all ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                            <span className="text-amber-400 font-bold">التفسير العلمي: </span>{q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-10 rounded-xl"
                      >
                        تسليم الإجابات وتقييم الفهم
                      </Button>
                    ) : (
                      <div className="p-4 bg-amber-950/40 border border-amber-600/40 rounded-xl text-center space-y-2">
                        <h4 className="font-bold text-amber-300">النتيجة: {quizScore} من {QUIZ_QUESTIONS.length}</h4>
                        <p className="text-xs text-slate-300">
                          {quizScore === QUIZ_QUESTIONS.length 
                            ? 'أداء متميز جداً! أصبحت خبيراً في هندسة الدوائر الكهربائية وقوانين كيرشوف.' 
                            : 'يمكنك مراجعة الأساس العلمي وإعادة التجربة لتحقيق الدرجة الكاملة.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CircuitConstructionKitDcSimulation;
