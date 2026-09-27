import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, Maximize2, Minimize2, 
  Sparkles, BookOpen, Layers, Target, CheckCircle2, 
  ArrowRight, X, Atom, Sun, Compass
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
    question: 'وفقاً لنموذج بور لذرة الهيدروجين، متى ينبعث فوتون ضوئي من الذرة؟',
    options: [
      'عندما يمتص الإلكترون طاقة ويهرب خارج الذرة كلياً',
      'عندما يقفز الإلكترون هابطاً من مستوى طاقة علوي إلى مستوى طاقة أدنى (hν = E_high - E_low)',
      'عندما يسكن الإلكترون تماماً في مكانه دون حركة',
      'عندما ينشطر البروتون داخل النواة'
    ],
    correctIndex: 1,
    explanation: 'تكميم الطاقة يعني أن الذرة تشع طاقة على شكل فوتون مفرد بطول موجي محدد فقط عند انتقال الإلكترون من مدار طاقة أعلى إلى مدار أدنى، وتساوي طاقة الفوتون فرق الطاقة بين المدارين.'
  },
  {
    id: 2,
    question: 'لماذا فشل نموذج رذرفورد الكلاسيكي للذرة (النظام الشمسي الكلاسيكي)؟',
    options: [
      'لأنه لم يفترض وجود نواة في مركز الذرة',
      'لأنه وفقاً للكهروديناميكا الكلاسيكية، فإن أي جسيم مشحون متسارع كالإلكترون يجب أن يشع طاقة باستمرار ويهوي في النواة خلال 10⁻¹¹ ثانية وتنهار المادة',
      'لأن الإلكترونات كانت أثقل من البروتونات في نموذجه',
      'لأنه افترض وجود جسيمات مضادة'
    ],
    correctIndex: 1,
    explanation: 'الفيزياء الكلاسيكية تقضي بأن الإلكترون أثناء دورانه المتسارع سيفقد طاقته تدريجياً ويسقط في النواة بشكل لولبي، وهو ما يناقض استقرار الذرات الفعلي في الطبيعة.'
  },
  {
    id: 3,
    question: 'في الميكانيكا الموجية لشرودنغر، ماذا تمثل السحابة المدارية (Orbital) المحيطة بالنواة؟',
    options: [
      'مساراً دائرياً محدداً بدقة يسير فيه الإلكترون ككوكب حول الشمس',
      'منطقة ثلاثية الأبعاد في الفضاء تدل كثافتها على مربع الدالة الموجية |ψ|² (كثافة احتمالية العثور على الإلكترون)',
      'طبقة من الغازات تحمي النواة من الاصطدامات الخارجية',
      'حلقة مغناطيسية صلبة غير قابلة للاختراق'
    ],
    correctIndex: 1,
    explanation: 'لا يمتلك الإلكترون في ميكانيكا الكم مساراً محدداً؛ بل تصف الدالة الموجية ψ التوزيع الاحتمالي، وتمثل السحابة المدارية المنطقة التي تزيد احتمالية وجود الإلكترون فيها عن 90%.'
  }
];

const LAB_MISSIONS = [
  {
    id: 'm1',
    title: 'مقارنة نماذج الذرة التاريخية',
    target: 'انتقل بين نماذج الذرة (دالتون، طومسون، رذرفورد، بور، دي بروي، شرودنغر) وشغّل مصدر الضوء لملاحظة كيفية تفسير كل نموذج للتفاعل مع الفوتونات.',
    condition: 'ملاحظة الفرق بين التنبؤ الكلاسيكي المستمر وتكميم الطيف في النماذج الكمية.'
  },
  {
    id: 'm2',
    title: 'إثارة الإلكترون بالضوء أحادي اللون',
    target: 'اضبط الضوء على الوضع أحادي اللون (Monochromatic) عند الطول الموجي 122 نانومتر (فوق بنفسجي) لإثارة الإلكترون من n=1 إلى n=2.',
    condition: 'امتصاص الإلكترون للفوتون وانتقاله إلى المدار الثاني ثم هبوطه مشعاً فوتوناً.'
  },
  {
    id: 'm3',
    title: 'استكشاف الأشكال المدارية في نموذج شرودنغر',
    target: 'اختر نموذج شرودنغر وتصفح حالات أعداد الكم (n, l, m) لمشاهدة التغير الهندسي للمدار من كروي (s) إلى فصي (p).',
    condition: 'عرض المدارات الفراغية ثلاثية الأبعاد بتوزيعاتها الاحتمالية.'
  }
];

const ModelsOfHydrogenAtomSimulation: React.FC = () => {
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-600 flex items-center justify-center shadow-md shadow-fuchsia-500/20">
              <Atom className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm text-white tracking-tight">
                  نماذج ذرة الهيدروجين
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-950/80 text-fuchsia-300 font-bold border border-fuchsia-800/60 hidden md:inline">
                  مختبر ذروة العلم 2.0
                </span>
              </div>
              <div className="text-[10.5px] text-slate-400 hidden lg:block">
                التطور التاريخي للنماذج الذرية • أطياف الانبعاث والامتصاص • نموذج بور وميكانيكا الكم لشرودنغر
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
            className="h-8.5 px-3 text-xs gap-1.5 rounded-xl border-fuchsia-500/30 bg-fuchsia-950/20 text-fuchsia-300 hover:bg-fuchsia-900/40 hover:text-fuchsia-200"
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
          src="/simulations/models-of-the-hydrogen-atom.html?initialScreen=1"
          title="نماذج ذرة الهيدروجين | منصة ذروة العلم 2.0"
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
                  <div className="w-8 h-8 rounded-lg bg-fuchsia-600 text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">الدليل العلمي والتحديات المعملية</h3>
                    <p className="text-[11px] text-slate-400">الفيزياء الذرية وميكانيكا الكم</p>
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
                      ? 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  الأساس العلمي
                </button>
                <button
                  onClick={() => setActiveGuideTab('missions')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    activeGuideTab === 'missions' 
                      ? 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  المهمات والتجارب
                </button>
                <button
                  onClick={() => setActiveGuideTab('quiz')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    activeGuideTab === 'quiz' 
                      ? 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/40' 
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
                        <Sun className="w-4 h-4 text-amber-400" />
                        نموذج بور وتكميم مستويات الطاقة
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-300">
                        افترض نيلز بور عام 1913 أن الإلكترونات تدور في مدارات دائرية محددة ذات طاقة مكممة دون أن تشع طاقة. تعطى طاقة المدار n بالعلاقة:
                      </p>
                      <div className="my-2.5 p-2.5 rounded-lg bg-slate-950/80 border border-fuchsia-500/20 font-mono text-xs text-center text-fuchsia-300" dir="ltr">
                        E_n = -13.6 eV / n²
                      </div>
                      <p className="text-[11.5px] text-slate-400">
                        يشع الإلكترون فوتوناً فقط عند هبوطه من مدار علوي n_initial إلى مدار سفلي n_final بطاقة:
                      </p>
                      <div className="my-1.5 font-mono text-xs text-center text-cyan-300" dir="ltr">
                        ΔE = h · ν = h · c / λ
                      </div>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-400" />
                        موجات دي بروي والميكانيكا الموجية
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-300">
                        اقترح لويس دي بروي عام 1924 أن الإلكترون يسلك سلوك موجة مستقرة (Standing Wave) في مداره، بحيث يجب أن يكون محيط المدار مساوياً لعدد صحيح من أطوال موجة دي بروي (2πr = nλ)، مما يفسر تكميم المدارات بشكل طبيعي.
                      </p>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Atom className="w-4 h-4 text-fuchsia-400" />
                        نموذج شرودنغر والأعداد الكمية الثلاثة
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-300">
                        تصف معادلة شرودنغر الإلكترون كسحابة احتمالية تحددها ثلاثة أعداد كمية:
                      </p>
                      <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-300 mt-2">
                        <li><strong className="text-white">العدد الكمي الرئيسي (n):</strong> يحدد مستوى الطاقة ومتوسط بعد السحابة عن النواة.</li>
                        <li><strong className="text-white">العدد الكمي المداري (l):</strong> يحدد الشكل الهندسي للسحابة المدارية (s كروي، p فصي...).</li>
                        <li><strong className="text-white">العدد الكمي المغناطيسي (m):</strong> يحدد اتجاه المدار في الفضاء ثلاثي الأبعاد.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeGuideTab === 'missions' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      نفّذ التحديات المعملية التالية داخل المحاكاة لاكتشاف أسرار الفيزياء الذرية:
                    </p>
                    {LAB_MISSIONS.map((m, idx) => (
                      <div key={m.id} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-fuchsia-400">المهمة {idx + 1}: {m.title}</span>
                          <Target className="w-4 h-4 text-fuchsia-400" />
                        </div>
                        <p className="text-xs text-slate-300">{m.target}</p>
                        <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80 text-[11px] text-slate-400">
                          <span className="text-fuchsia-400 font-bold">معيار التحقق: </span>{m.condition}
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
                              btnStyle = "bg-fuchsia-900/50 border-fuchsia-500 text-fuchsia-200";
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
                            <span className="text-fuchsia-400 font-bold">التفسير العلمي: </span>{q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                        className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs h-10 rounded-xl"
                      >
                        تسليم الإجابات وتقييم الفهم
                      </Button>
                    ) : (
                      <div className="p-4 bg-fuchsia-950/40 border border-fuchsia-600/40 rounded-xl text-center space-y-2">
                        <h4 className="font-bold text-fuchsia-300">النتيجة: {quizScore} من {QUIZ_QUESTIONS.length}</h4>
                        <p className="text-xs text-slate-300">
                          {quizScore === QUIZ_QUESTIONS.length 
                            ? 'إنجاز علمي مذهل! استوعبت تطور النماذج الذرية وميكانيكا الكم بجدارة.' 
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

export default ModelsOfHydrogenAtomSimulation;
