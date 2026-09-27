import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, Maximize2, Minimize2, 
  Sparkles, BookOpen, Layers, Target, CheckCircle2, 
  ArrowRight, X, Dna, Activity, Droplets
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
    question: 'أي من الجزيئات التالية يمكنها عبور طبقة الفسفوليبيد الثنائية عن طريق الانتشار البسيط دون الحاجة لبروتين ناقل؟',
    options: [
      'الأيونات المشحونة مثل الصوديوم (Na⁺) والبوتاسيوم (K⁺)',
      'الجزيئات الغازية الصغيرة غير القطبية مثل الأكسجين (O₂) وثاني أكسيد الكربون (CO₂)',
      'جزيئات السكر الضخمة مثل الغلوكوز',
      'جزيئات الـ ATP الكبيرة'
    ],
    correctIndex: 1,
    explanation: 'تستطيع الغازات غير القطبية الصغيرة الذوبان في اللب الكاره للماء لطبقة الفسفوليبيد والعبور بحرية تامة مع تدرج التركيز بالانتشار البسيط.'
  },
  {
    id: 2,
    question: 'كم عدد أيونات الصوديوم والبوتاسيوم التي تنقلها مضخة (Na⁺/K⁺ ATPase) في كل دورة استهلاك لجزيء ATP واحد؟',
    options: [
      'ضخ 3 أيونات صوديوم لخارج الخلية وإدخال أيوني بوتاسيوم لداخلها',
      'ضخ أيوني صوديوم للداخل و 3 أيونات بوتاسيوم للخارج',
      'ضخ أيون صوديوم واحد وأيون بوتاسيوم واحد فقط',
      'نقل 5 أيونات صوديوم دون نقل أي بوتاسيوم'
    ],
    correctIndex: 0,
    explanation: 'تعمل مضخة الصوديوم-البوتاسيوم على نقل 3 أيونات Na⁺ عكس تدرج تركيزها إلى خارج الخلية وإدخال أيوني K⁺ إلى داخلها باستهلاك جزيء ATP واحد، مما يولد فرق جهد كهربائي سالب داخل الخلية.'
  },
  {
    id: 3,
    question: 'ما الفرق الجوهري بين الانتشار الميسر (Facilitated Diffusion) والنقل النشط (Active Transport)؟',
    options: [
      'الانتشار الميسر لا يتطلب بروتينات بينما النقل النشط يتطلبها',
      'الانتشار الميسر يحدث مع تدرج التركيز ولا يستهلك طاقة ATP، بينما النقل النشط ينقل المواد ضد تدرج التركيز ويستهلك ATP',
      'الانتشار الميسر ينقل المواد الصلبة فقط والنقل النشط ينقل السوائل',
      'كلاهما يتطلب استهلاك كميات متطابقة من طاقة ATP'
    ],
    correctIndex: 1,
    explanation: 'الانتشار الميسر عملية سلبية (Passive) تعتمد على الطاقة الحركية للجزيئات لنقلها عبر القنوات من التركيز الأعلى إلى الأقل، بينما النقل النشط يضخ المواد قسراً ضد تدرج التركيز مستهلكاً طاقة الخلية.'
  }
];

const LAB_MISSIONS = [
  {
    id: 'm1',
    title: 'توازن الانتشار البسيط للغازات',
    target: 'أضف كمية كبيرة من جزيئات الأكسجين خارج الخلية وراقب حركتها العشوائية حتى يتساوى تركيزها على جانبي الغشاء.',
    condition: 'وصول النظام إلى حالة اتزان ديناميكي تتساوى فيها معدلات الدخول والخروج.'
  },
  {
    id: 'm2',
    title: 'تفعيل قنوات التسريب الأيونية',
    target: 'أضف قنوات تسريب الصوديوم والبوتاسيوم إلى الغشاء الخلوي ولاحظ حركة الأيونات مع تدرج تركيزها.',
    condition: 'تدفق أيونات Na⁺ إلى الداخل وتدفق K⁺ إلى الخارج عبر قنواتها المخصصة.'
  },
  {
    id: 'm3',
    title: 'إعادة بناء تدرج التركيز بالمضخة النشطة',
    target: 'ضع مضخة الصوديوم-البوتاسيوم وزوّدها بطاقة ATP لضخ أيونات الصوديوم إلى الخارج واستعادة الجهد الغشائي الطبيعي.',
    condition: 'تراكم الصوديوم خارج الخلية والبوتاسيوم داخلها.'
  }
];

const MembraneTransportSimulation: React.FC = () => {
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm text-white tracking-tight">
                  النقل عبر الغشاء الخلوي
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-300 font-bold border border-sky-800/60 hidden md:inline">
                  مختبر ذروة العلم 2.0
                </span>
              </div>
              <div className="text-[10.5px] text-slate-400 hidden lg:block">
                الانتشار البسيط والميسر • النقل النشط ومضخة Na⁺/K⁺ • الجهد الغشائي وقنوات الأيونات
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
            className="h-8.5 px-3 text-xs gap-1.5 rounded-xl border-sky-500/30 bg-sky-950/20 text-sky-300 hover:bg-sky-900/40 hover:text-sky-200"
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
          src="/simulations/membrane-transport.html?initialScreen=1"
          title="النقل عبر الغشاء الخلوي | منصة ذروة العلم 2.0"
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
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">الدليل العلمي والتحديات المعملية</h3>
                    <p className="text-[11px] text-slate-400">آليات النقل الحيوي والفسيولوجيا الخلوية</p>
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
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  الأساس العلمي
                </button>
                <button
                  onClick={() => setActiveGuideTab('missions')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    activeGuideTab === 'missions' 
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  المهمات والتجارب
                </button>
                <button
                  onClick={() => setActiveGuideTab('quiz')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    activeGuideTab === 'quiz' 
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/40' 
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
                        <Droplets className="w-4 h-4 text-sky-400" />
                        الانتشار البسيط (Simple Diffusion)
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-300">
                        حركة تلقائية للجزيئات الصغيرة غير المشحونة (مثل O₂ و CO₂) عبر طبقة الفسفوليبيد الثنائية من منطقة التركيز المرتفع إلى التركيز المنخفض حتى الوصول لحالة الاتزان الديناميكي دون استهلاك أي طاقة خلوية.
                      </p>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        الانتشار الميسر (Facilitated Diffusion)
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-300">
                        يحدث للمواد القطبية أو الأيونات المشحونة (مثل Na⁺ و K⁺ والغلوكوز) التي لا تستطيع اختراق طبقة الليبيدات بمفردها، فتستعين بقنوات بروتينية متخصصة أو نواقل جزيئية، ويتم دائماً مع تدرج التركيز ودون استهلاك ATP.
                      </p>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        النقل النشط ومضخة (Na⁺/K⁺ Pump)
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-300">
                        ضخ المواد عكس تدرج التركيز الطبيعي (من التركيز المنخفض إلى المرتفع). تستهلك مضخة الصوديوم والبوتاسيوم جزيء ATP لتضخ 3 أيونات Na⁺ للخارج وتدخل أيوني K⁺ للداخل، مما يحافظ على استقطاب الغشاء وإمكانية توليد السيالات العصبية.
                      </p>
                    </div>
                  </div>
                )}

                {activeGuideTab === 'missions' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      نفّذ التحديات المعملية التالية داخل المحاكاة لإتقان آليات النقل الحيوي:
                    </p>
                    {LAB_MISSIONS.map((m, idx) => (
                      <div key={m.id} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-sky-400">المهمة {idx + 1}: {m.title}</span>
                          <Target className="w-4 h-4 text-sky-400" />
                        </div>
                        <p className="text-xs text-slate-300">{m.target}</p>
                        <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80 text-[11px] text-slate-400">
                          <span className="text-sky-400 font-bold">معيار التحقق: </span>{m.condition}
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
                              btnStyle = "bg-sky-900/50 border-sky-500 text-sky-200";
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
                            <span className="text-sky-400 font-bold">التفسير العلمي: </span>{q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-10 rounded-xl"
                      >
                        تسليم الإجابات وتقييم الفهم
                      </Button>
                    ) : (
                      <div className="p-4 bg-sky-950/40 border border-sky-600/40 rounded-xl text-center space-y-2">
                        <h4 className="font-bold text-sky-300">النتيجة: {quizScore} من {QUIZ_QUESTIONS.length}</h4>
                        <p className="text-xs text-slate-300">
                          {quizScore === QUIZ_QUESTIONS.length 
                            ? 'أداء علمي باهر! لقد أتقنت آليات النقل عبر الأغشية الخلوية بدقة.' 
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

export default MembraneTransportSimulation;
