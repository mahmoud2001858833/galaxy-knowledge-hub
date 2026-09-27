import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Play, Pause, RotateCcw, Maximize2, Minimize2, 
  Sparkles, BookOpen, Layers, Target, CheckCircle2, 
  ArrowRight, X, Gauge, Activity, Flame
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
    question: 'أين تكون السرعة اللحظية والطاقة الحركية للمتزلج أكبر ما يمكن في المسار المقعر المنحني؟',
    options: [
      'عند أعلى نقطة على حافة المسار',
      'عند أدنى نقطة في قاع المسار حيث تكون طاقة الوضع في حدها الأدنى',
      'في منتصف المسار تماماً بين القمة والقاع',
      'السرعة ثابتة في جميع النقاط'
    ],
    correctIndex: 1,
    explanation: 'وفقاً لقانون حفظ الطاقة الميكانيكية، تتحول طاقة الوضع التثاقلية بالكامل إلى طاقة حركية عند أخفض نقطة في المسار، فتصل السرعة إلى قيمتها القصوى.'
  },
  {
    id: 2,
    question: 'عند تفعيل قوة الاحتكاك بين عجلات لوح التزلج والمسار، ماذا يحدث للطاقة الكلية للنظام؟',
    options: [
      'تختفي الطاقة كلياً وتفنى',
      'تزداد الطاقة الميكانيكية تدريجياً',
      'تبقى الطاقة الكلية محفوظة، ولكن يتحول جزء من الطاقة الميكانيكية إلى طاقة حرارية',
      'تتحول الطاقة الميكانيكية إلى طاقة نووية'
    ],
    correctIndex: 2,
    explanation: 'الطاقة لا تفنى ولا تستحدث من العدم؛ الاحتكاك يبذل شغلاً سالباً يحول الطاقة الميكانيكية (الحركية والوضع) إلى طاقة حرارية تؤدي لتوقف المتزلج في النهاية.'
  },
  {
    id: 3,
    question: 'إذا تضاعفت كتلة المتزلج في غياب الاحتكاك، ماذا يحدث لأقصى ارتفاع يبلغه المتزلج على الطرف المقابل؟',
    options: [
      'يصل إلى نصف الارتفاع فقط',
      'يصل إلى نفس الارتفاع الأصلي تماماً لأن الكتلة تختصر من طرفي معادلة الطاقة',
      'يصل إلى ضعف الارتفاع السابق',
      'يتوقف ولا يستطيع الصعود'
    ],
    correctIndex: 1,
    explanation: 'من معادلة حفظ الطاقة: m·g·h = 0.5·m·v²، نلاحظ أن الكتلة m تختصر من طرفي المعادلة، مما يعني أن الارتفاع والسرعة مستقلان تماماً عن كتلة المتزلج.'
  }
];

const LAB_MISSIONS = [
  {
    id: 'm1',
    title: 'التحقق من حفظ الطاقة الميكانيكية',
    target: 'اضبط الاحتكاك على (معدوم)، ثم حرر المتزلج من قمة المسار وراقب ثبات عمود الطاقة الكلية في المخطط البياني.',
    condition: 'بقاء مجموع الطاقة الحركية والوضعية ثابتاً طوال مسار التذبذب.'
  },
  {
    id: 'm2',
    title: 'تأثير قوة الجاذبية الكونية',
    target: 'قارن بين حركة المتزلج وسرعته عند التبديل بين بيئات الجاذبية: القمر (1.6 م/ث²)، الأرض (9.8 م/ث²)، والمشتري (24.8 م/ث²).',
    condition: 'ملاحظة تضاعف السرعة القصوى وزيادة التردد بزيادة تسارع الجاذبية.'
  },
  {
    id: 'm3',
    title: 'الاحتكاك والتبدد الحراري',
    target: 'زد الاحتكاك تدريجياً وراقب تحول الطاقة الميكانيكية إلى طاقة حرارية حتى يسكن المتزلج في قاع المنحنى.',
    condition: 'تحول كامل الطاقة الميكانيكية إلى طاقة حرارية واستقرار المتزلج عند أدنى نقطة.'
  }
];

const EnergySkateParkSimulation: React.FC = () => {
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm text-white tracking-tight">
                  حديقة التزلج وحفظ الطاقة
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800/60 hidden md:inline">
                  مختبر ذروة العلم 2.0
                </span>
              </div>
              <div className="text-[10.5px] text-slate-400 hidden lg:block">
                حفظ الطاقة الميكانيكية (E = Ek + Ep) • تحول الطاقة الحركية والوضعية • تأثير قوة الاحتكاك والجاذبية
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
            className="h-8.5 px-3 text-xs gap-1.5 rounded-xl border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/40 hover:text-emerald-200"
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
          src="/simulations/energy-skate-park.html?initialScreen=1"
          title="حديقة التزلج وحفظ الطاقة | منصة ذروة العلم 2.0"
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
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">الدليل العلمي والتحديات المعملية</h3>
                    <p className="text-[11px] text-slate-400">حديقة التزلج وحفظ الطاقة الميكانيكية</p>
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
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  الأساس العلمي
                </button>
                <button
                  onClick={() => setActiveGuideTab('missions')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    activeGuideTab === 'missions' 
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  المهمات والتجارب
                </button>
                <button
                  onClick={() => setActiveGuideTab('quiz')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    activeGuideTab === 'quiz' 
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40' 
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
                        <Activity className="w-4 h-4 text-emerald-400" />
                        قانون حفظ الطاقة الميكانيكية
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-300">
                        في أي نظام معزول لا تؤثر فيه قوى غير محافظة (كالاحتكاك)، تظل الطاقة الميكانيكية الكلية ثابتة:
                      </p>
                      <div className="my-2.5 p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/20 font-mono text-xs text-center text-emerald-300" dir="ltr">
                        E_total = E_k + E_p = ثابت
                      </div>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        الطاقة الحركية وطاقة الوضع
                      </h4>
                      <ul className="text-xs space-y-2 list-disc list-inside text-slate-300">
                        <li>
                          <strong className="text-white">طاقة الوضع التثاقلية (Ep):</strong> ترتبط بالارتفاع الرأسي h عن سطح الإسناد:
                          <div className="font-mono text-cyan-300 my-1 text-center" dir="ltr">E_p = m · g · h</div>
                        </li>
                        <li>
                          <strong className="text-white">الطاقة الحركية (Ek):</strong> ترتبط بسرعة حركة المتزلج:
                          <div className="font-mono text-cyan-300 my-1 text-center" dir="ltr">E_k = 0.5 · m · v²</div>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-rose-400" />
                        الاحتكاك والتبدد الحراري
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-300">
                        عند وجود احتكاك، تُبذل قوة مقاومة تحول الطاقة الميكانيكية تدريجياً إلى طاقة حرارية (Thermal Energy). يبقى المجموع الكلي للطاقة محفوظاً ولكن الطاقة الميكانيكية تتناقص حتى يتوقف المتزلج.
                      </p>
                    </div>
                  </div>
                )}

                {activeGuideTab === 'missions' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      نفّذ التحديات المعملية التالية داخل المحاكاة لإتقان مفاهيم حركة الطاقة:
                    </p>
                    {LAB_MISSIONS.map((m, idx) => (
                      <div key={m.id} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-emerald-400">المهمة {idx + 1}: {m.title}</span>
                          <Target className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-xs text-slate-300">{m.target}</p>
                        <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80 text-[11px] text-slate-400">
                          <span className="text-emerald-400 font-bold">معيار التحقق: </span>{m.condition}
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
                              btnStyle = "bg-emerald-900/50 border-emerald-500 text-emerald-200";
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
                            <span className="text-emerald-400 font-bold">التفسير العلمي: </span>{q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 rounded-xl"
                      >
                        تسليم الإجابات وتقييم الفهم
                      </Button>
                    ) : (
                      <div className="p-4 bg-emerald-950/40 border border-emerald-600/40 rounded-xl text-center space-y-2">
                        <h4 className="font-bold text-emerald-300">النتيجة: {quizScore} من {QUIZ_QUESTIONS.length}</h4>
                        <p className="text-xs text-slate-300">
                          {quizScore === QUIZ_QUESTIONS.length 
                            ? 'أداء استثنائي! لقد استوعبت مبادئ حفظ الطاقة بدقة متناهية.' 
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

export default EnergySkateParkSimulation;
