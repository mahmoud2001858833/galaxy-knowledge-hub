import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Atom, Waves, Play, Pause, RotateCcw, Maximize2, Minimize2, 
  Sparkles, BookOpen, Layers, Target, CheckCircle2, AlertCircle, 
  ArrowRight, X, HelpCircle, ExternalLink, Award, Lightbulb, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { labSound } from '@/utils/labAudio';

// Physical constants & presets
const PLANCK_H = 6.62607015e-34; // J·s

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
    question: 'ما الذي يحدث لنمط التداخل عند وضع كواشف لمعرفة المسار (Which-Way Detectors) على الشقين؟',
    options: [
      'يزداد وضوح نمط التداخل ويتضاعف عدد الأهداب',
      'يختفي نمط التداخل كلياً ويتحول إلى حزمتين كلاسيكيتين بسبب انهيار دالة الموجة',
      'تتحول الأهداب إلى ألوان قوس قزح فقط',
      'تتوقف الجسيمات عن الحركة تماماً'
    ],
    correctIndex: 1,
    explanation: 'وفقاً لمبدأ التكامل في ميكانيكا الكم، يؤدي قياس أو رصد مسار الجسيم إلى انهيار دالة الموجة (Wavefunction Collapse) وزوال خاصية التراكب الموجي.'
  },
  {
    id: 2,
    question: 'حسب معادلة دي برولي (λ = h / p)، إذا زادت سرعة الإلكترونات المنبعثة، ماذا يحدث لطول موجتها؟',
    options: [
      'يزداد الطول الموجي وتتباعد أهداب التداخل',
      'يقل الطول الموجي وتتقارب أهداب التداخل',
      'يبقى الطول الموجي ثابتاً دائماً',
      'يصبح الطول الموجي سالباً'
    ],
    correctIndex: 1,
    explanation: 'العلاقة بين الطول الموجي λ والزخم p عكسية (λ = h / mv). بزيادة السرعة يزداد الزخم فيقل الطول الموجي وتتقارب أهداب التداخل على الشاشة.'
  },
  {
    id: 3,
    question: 'عند إطلاق الجسيمات واحداً تلو الآخر بمعدل بطيء جداً، ما الذي يتشكل على شاشة الكاشف بمرور الوقت؟',
    options: [
      'حزمتان متوازيتان فقط تشبهان مسار الرصاصات الكلاسيكية',
      'توزيع عشوائي متجانس لا يحمل أي نمط منظم',
      'يتراكم نمط تداخل موجي كامل يثبت أن كل جسيم يتداخل مع ذاته احتمالياً',
      'تختفي الشاشة ولا تسجل أي نقطة'
    ],
    correctIndex: 2,
    explanation: 'كل جسيم يعبر كلا الشقين كدالة موجية احتمالية ويتداخل مع نفسه، وتتراكم نقاط الارتطام لتشكل نمط تداخل دي برولي الشهير.'
  }
];

const LAB_MISSIONS = [
  {
    id: 'm1',
    title: 'تأكيد الطبيعة الموجية للإلكترونات',
    target: 'اختر مصدر الإلكترونات وافتح كلا الشقين وراقب تشكل نمط التداخل.',
    condition: 'ظهور أهداب التداخل المضيئة والمعتمة على شاشة الكاشف.'
  },
  {
    id: 'm2',
    title: 'اختبار انهيار الدالة الموجية',
    target: 'ضع كاشفاً على أحد الشقين ولاحظ تحول النمط من تداخل إلى توزيع نقطي كلاسيكي.',
    condition: 'اختفاء أهداب التداخل وتجمع الضربات أمام الشق المفتوح.'
  },
  {
    id: 'm3',
    title: 'مقارنة أطوال موجات الجسيمات الثقيلة',
    target: 'قارن بين تداخل الإلكترونات وذرات الهيليوم مع ثبات السرعة ولاحظ تقارب الأهداب للجسيمات الأثقل.',
    condition: 'تحقق من صغر طول موجة ذرات الهيليوم مقارنة بالإلكترونات بسبب كبر كتلتها.'
  }
];

const QuantumWaveInterferenceSimulation: React.FC = () => {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'theory' | 'missions' | 'quiz'>('theory');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  // Toggle fullscreen mode
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Atom className="w-4 h-4 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm text-white tracking-tight">
                  تداخل الموجات الكمية وازدواجية المادة
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/60 hidden md:inline">
                  مختبر ذروة العلم 2.0
                </span>
              </div>
              <div className="text-[10.5px] text-slate-400 hidden lg:block">
                مبدأ دي برولي (λ = h/p) • تجربة الشق المزدوج للجسيمات • انهيار الدالة الموجية بالرصد
              </div>
            </div>
          </div>
        </div>

        {/* Left side: Quick Workbench Controls */}
        <div className="flex items-center gap-2">
          {/* Guide / Manual Drawer Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGuideOpen(true)}
            className="h-8.5 px-3 text-xs gap-1.5 rounded-xl border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-900/40 hover:text-cyan-200"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">دليل ومهمات التجربة</span>
            <span className="sm:hidden">الدليل</span>
          </Button>

          {/* Reset / Reload Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetIframe}
            className="h-8.5 w-8.5 p-0 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            title="إعادة تشغيل التجربة"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          {/* Fullscreen Button */}
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
          src="/simulations/quantum-wave-interference.html?initialScreen=1"
          title="تداخل الموجات الكمية وازدواجية المادة | منصة ذروة العلم 2.0"
          className="w-full h-full border-0 block"
          allow="fullscreen; autoplay; clipboard-write"
          loading="eager"
        />
      </main>

      {/* Slide-over Lab Manual Drawer (Theory, Missions, Quiz) */}
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
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">الدليل العلمي والتحديات المعملية</h3>
                    <p className="text-[11px] text-slate-400">تداخل الموجات الكمية وازدواجية المادة</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGuideOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950/30 p-2 gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setActiveGuideTab('theory')}
                  className={`flex-1 py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeGuideTab === 'theory' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Atom className="w-3.5 h-3.5" />
                  <span>الأساس العلمي</span>
                </button>
                <button
                  onClick={() => setActiveGuideTab('missions')}
                  className={`flex-1 py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeGuideTab === 'missions' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>مهام التحدي</span>
                </button>
                <button
                  onClick={() => setActiveGuideTab('quiz')}
                  className={`flex-1 py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeGuideTab === 'quiz' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>اختبار الفهم</span>
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-300">
                {activeGuideTab === 'theory' && (
                  <div className="space-y-3.5">
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-cyan-500/20 space-y-2">
                      <div className="font-bold text-cyan-300 flex items-center gap-1.5 text-sm">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>معادلة دي برولي للموجات المادية (de Broglie Relation)</span>
                      </div>
                      <div className="font-mono text-center text-sm sm:text-base font-bold text-white bg-slate-900/90 py-2.5 rounded-lg border border-slate-800">
                        λ = h / p = h / (m · v)
                      </div>
                      <p className="text-[11.5px] text-slate-400 leading-relaxed">
                        افترض لويس دي برولي عام 1924 أن كل جسيم مادي ذي كتلة <code className="text-cyan-300">m</code> وسرعة <code className="text-cyan-300">v</code> يمتلك خاصية موجية مصاحبة بطول موجي <code className="text-cyan-300">λ</code>.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <span>ظاهرة انهيار الدالة الموجية بالرصد (Wavefunction Collapse)</span>
                      </div>
                      <p className="text-[11.5px] text-slate-400 leading-relaxed">
                        عندما نضع كاشفاً لمعرفة المسار (Which-Way Detector) على أحد الشقين، يُجبر الجسيم على اتخاذ مسار محدد، مما يؤدي فوراً إلى تدمير خاصية التراكب الموجي وزوال أهداب التداخل وتحول التوزيع إلى نمط كلاسيكي حتمي.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-indigo-400" />
                        <span>قانون تباعد الأهداب (Young Interference Fringes)</span>
                      </div>
                      <div className="font-mono text-center text-xs font-bold text-cyan-300 bg-slate-900/90 py-1.5 rounded-lg border border-slate-800">
                        Δy = (λ · L) / d
                      </div>
                      <p className="text-[11px] text-slate-400">
                        حيث <code className="text-white">L</code> المسافة بين الحاجز والشاشة، و <code className="text-white">d</code> المسافة بين الشقين.
                      </p>
                    </div>
                  </div>
                )}

                {activeGuideTab === 'missions' && (
                  <div className="space-y-3">
                    {LAB_MISSIONS.map((m, idx) => (
                      <div key={m.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-300">المهمة {idx + 1}: {m.title}</span>
                          <Badge variant="outline" className="text-[10px] border-slate-700">تحدي علمي</Badge>
                        </div>
                        <p className="text-[11.5px] text-slate-300">{m.target}</p>
                        <div className="text-[11px] text-emerald-400 font-medium">الشرط: {m.condition}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeGuideTab === 'quiz' && (
                  <div className="space-y-4">
                    {QUIZ_QUESTIONS.map((q, qIdx) => (
                      <div key={q.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                        <div className="font-bold text-slate-200 text-xs">
                          {qIdx + 1}. {q.question}
                        </div>
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswers[q.id] === optIdx;
                            const isCorrect = q.correctIndex === optIdx;
                            let style = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';
                            if (quizSubmitted) {
                              if (isCorrect) style = 'bg-emerald-950/50 border-emerald-500 text-emerald-300 font-bold';
                              else if (isSelected) style = 'bg-rose-950/50 border-rose-500 text-rose-300';
                            } else if (isSelected) {
                              style = 'bg-cyan-950/50 border-cyan-500 text-cyan-200 font-bold';
                            }
                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleAnswerQuiz(q.id, optIdx)}
                                className={`w-full text-right p-2 rounded-lg border text-[11px] transition-all flex items-center justify-between ${style}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-900/50 text-[10.5px] text-blue-300">
                            <strong>التعليل العلمي:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-9 text-xs rounded-xl"
                      >
                        تصحيح الاختبار وعرض النتيجة
                      </Button>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-center space-y-1">
                        <div className="font-bold text-sm text-emerald-400">
                          النتيجة: {quizScore} من {QUIZ_QUESTIONS.length}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {quizScore === QUIZ_QUESTIONS.length ? 'ممتاز! إتقان تام لمفاهيم تداخل الموجات الكمية.' : 'أعد مراجعة الدليل وتكرار التجربة لتحقيق الدرجة الكاملة.'}
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

export default QuantumWaveInterferenceSimulation;
