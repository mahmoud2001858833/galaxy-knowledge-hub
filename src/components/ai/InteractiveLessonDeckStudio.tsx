import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Presentation, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Maximize2, 
  Minimize2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Atom, 
  ExternalLink, 
  Printer, 
  RotateCcw, 
  Layers, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  Check, 
  Share2,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { geminiMultimodalService, type LessonSlideData } from '@/services/geminiMultimodalService';

// Default Curriculum Lesson Deck (Kepler's Laws & Gravitation)
const DEFAULT_LESSON_DECK: LessonSlideData[] = [
  {
    id: 'slide-1',
    title: 'قوانين كبلر والحركة الدائرية في الفلك',
    subtitle: 'التهيئة الحافزة ونواتج التعلم الأساسية',
    type: 'objectives',
    content: {
      explanation: 'كيف استطاع يوهانس كبلر صياغة حركة الكواكب بدقة مذهلة دون حتى أن يمتلك تلسكوباً متطوراً؟ وما علاقة ذلك بمدارات الأقمار الصناعية الأردنية المعاصرة؟',
      bullets: [
        'توضيح المدارات الإهليلجية وموقع الشمس في إحدى البؤرتين (القانون الأول).',
        'استنتاج تغير سرعة الكوكب بحسب قربه أو بعده عن الشمس (القانون الثاني).',
        'تطبيق النسبة الرياضية بين مربع زمن الدورة ومكعب نصف القطر المداري (القانون الثالث).'
      ]
    }
  },
  {
    id: 'slide-2',
    title: 'البناء النظري والقانون الثالث لكبلر',
    subtitle: 'التأصيل الرياضي والعلاقات الفيزيائية',
    type: 'concept',
    content: {
      keyFormula: 'T² / r³ = 4π² / (G · M)',
      explanation: 'يربط القانون الثالث لكبلر بين الزمن الدوري للكوكب وبعده عن مركز الكتلة الجاذبة، مما يسمح بحساب كتل النجوم والكواكب البعيدة.',
      bullets: [
        'T: الزمن الدوري للكوكب بالثواني (s).',
        'r: متوسط نصف قطر المدار أو نصف المحور الأكبر بالمتر (m).',
        'G: ثابت الجذب العام لنيوتن (6.67 × 10⁻¹¹ N·m²/kg²).',
        'M: كتلة الجرم المركزي (الشمس أو الكوكب) بالكيلوغرام (kg).'
      ]
    }
  },
  {
    id: 'slide-3',
    title: 'المختبر الافتراضي: محاكاة المدارات والجاذبية 3D',
    subtitle: 'التجريب الاستقصائي المباشر',
    type: 'simulation',
    content: {
      simulationSlug: 'my-solar-system',
      simulationTitle: 'محاكي المجموعة الشمسية والمدارات الجاذبية 3D',
      explanation: 'استخدم شريط السرعة المدارية لملاحظة كيف يتحول المدار من دائري إلى إهليلجي، ولاحظ زيادة السرعة اللحظية عند الحضيض (Perihelion) ونقصانها عند الأوج (Aphelion).'
    }
  },
  {
    id: 'slide-4',
    title: 'تطبيقات هندسية ومفاهيم مغلوطة شائعة',
    subtitle: 'تثبيت المفهوم والتحذير من أخطاء الاختبارات',
    type: 'misconceptions',
    content: {
      explanation: 'فهم دقيق للجاذبية في الفضاء ومسارات الأقمار الصناعية لنظام تحديد المواقع GPS.',
      misconceptions: [
        {
          misconception: 'رواد الفضاء يطفون في محطة الفضاء الدولية لانعدام الجاذبية تماماً.',
          correction: 'الجاذبية موجودة عند مدار المحطة بنسبة تقارب 90% من سطح الأرض، لكن الرواد في حالة "سقوط حر مستمر" (Free Fall) حول الأرض.'
        },
        {
          misconception: 'مدارات جميع الكواكب دائرية تماماً.',
          correction: 'كافة المدارات قطوع ناقصة (إهليلجية)، لكن انحراف بعضها قليل جداً بحيث تبدو قريبة من الدائرة.'
        }
      ]
    }
  },
  {
    id: 'slide-5',
    title: 'تذكرة الخروج التقييمية (Exit Ticket)',
    subtitle: 'التحقق من نواتج التعلم خلال آخر 5 دقائق',
    type: 'exit_ticket',
    content: {
      explanation: 'أجب عن السؤالين التاليين لتثبيت نقاط الحصة بنجاح:',
      quiz: [
        {
          question: 'إذا تضاعف نصف قطر مدار كوكب حول الشمس 4 مرات، كم مرة يتضاعف زمنه الدوري T؟',
          options: ['مرتان (2)', '4 مرات', '8 مرات', '16 مرة'],
          correctIndex: 2,
          explanation: 'بحسب القانون الثالث T² يتناسب مع r³. عند ضرب r في 4، فإن r³ تصبح 4³ = 64. وجذر 64 هو 8 مرات.'
        },
        {
          question: 'أين تكون سرعة الكوكب المدارية في أقصى قيمتها؟',
          options: ['عند نقطة الأوج (أبعد نقطة عن الشمس)', 'عند نقطة الحضيض (أقرب نقطة للشمس)', 'السرعة ثابتة دائماً على طول المدار', 'في منتصف المسافة بين البؤرتين'],
          correctIndex: 1,
          explanation: 'بحسب قانون المساحات الثاني لكبلر وحفظ الزخم الزاوي، تزداد السرعة كلما اقترب الكوكب من الشمس ليمسح مساحات متساوية في أزمنة متساوية.'
        }
      ]
    }
  }
];

export const InteractiveLessonDeckStudio: React.FC = () => {
  // Input State
  const [topicInput, setTopicInput] = useState<string>('قوانين كبلر والحركة الدائرية في الفلك');
  const [gradeLevel, setGradeLevel] = useState<string>('توجيهي علمي');
  const [discipline, setDiscipline] = useState<string>('فيزياء');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Deck State
  const [slides, setSlides] = useState<LessonSlideData[]>(DEFAULT_LESSON_DECK);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Exit Ticket Answers State
  const [userQuizAnswers, setUserQuizAnswers] = useState<{ [qIdx: number]: number }>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToNextSlide();
      } else if (e.key === 'ArrowRight') {
        goToPrevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        if (!e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement)) {
          setIsFullscreen(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length]);

  const goToNextSlide = () => {
    setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
  };

  const goToPrevSlide = () => {
    setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
  };

  // Generate with AI
  const handleGenerateDeck = async () => {
    if (!topicInput.trim()) {
      toast.error('يرجى كتابة عنوان الدرس المطلوب');
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await geminiMultimodalService.generateInteractiveLessonDeck(
        topicInput,
        gradeLevel,
        discipline
      );

      if (generated && generated.slides && generated.slides.length > 0) {
        setSlides(generated.slides);
        setCurrentSlideIndex(0);
        setUserQuizAnswers({});
        setIsQuizSubmitted(false);
        toast.success('تم توليد شرائح الدرس التفاعلية بنجاح!');
      }
    } catch (err: any) {
      toast.error(err?.message || 'تعذر توليد شرائح الدرس');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div className="w-full space-y-6 text-slate-900 dark:text-slate-100 font-sans" dir="rtl">
      
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-bold">
                استوديو الدروس الذكية والشرائح 2.0 (Interactive Lesson Decks)
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 font-bold">
                تضمين محاكاة 3D + تذكرة خروج
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              استوديو توليد الحصص التفاعلية في 60 ثانية
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              توليد عروض صفية متكاملة لمدارس التوجيهي و BTEC: تهيئة، قوانين، محاكاة علمية ثلاثية الأبعاد، وتذكرة خروج لتقييم استيعاب الطلاب فورياً.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-white/15 border-white/30 text-white hover:bg-white/25 rounded-2xl text-xs gap-1.5 self-start md:self-center"
          >
            <Maximize2 className="w-4 h-4" />
            <span>نمط العرض الصفي الكامل (F)</span>
          </Button>
        </div>
      </div>

      {/* Lesson Generator Bar */}
      <div className="p-4 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>موضوع الدرس أو الوحدة الدراسية:</span>
            </label>
            <Input
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="مثال: الانكسار وقانون سنل، الحث الكهرومغناطيسي، حموض وقواعد..."
              className="h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              المرحلة:
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              <option value="توجيهي علمي">توجيهي علمي</option>
              <option value="BTEC هندسة">مسار BTEC هندسة</option>
              <option value="BTEC تكنولوجيا">BTEC تكنولوجيا معلومات</option>
              <option value="أول ثانوي علمي">أول ثانوي علمي</option>
              <option value="الصف العاشر">الصف العاشر الأساسي</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              التخصص:
            </label>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              <option value="فيزياء">فيزياء</option>
              <option value="كيمياء">كيمياء</option>
              <option value="رياضيات">رياضيات</option>
              <option value="أحياء">أحياء</option>
              <option value="روبوتات">روبوتات وهندسة</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <Button
              onClick={handleGenerateDeck}
              disabled={isGenerating}
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-teal-500/25 gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>توليد الدرس...</span>
                </>
              ) : (
                <>
                  <Presentation className="w-4 h-4" />
                  <span>توليد شرائح الدرس 🚀</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Slide Presentation Stage */}
      <div 
        className={`rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none p-8' : 'min-h-[580px] p-6 sm:p-8'
        }`}
      >
        {/* Top Slide Meta Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
              الشريحة {currentSlideIndex + 1} من {slides.length}
            </span>
            <span className="text-xs text-slate-400 font-bold hidden sm:inline">
              {currentSlide.subtitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="rounded-xl border-slate-800 text-slate-300 hover:text-white h-8 px-2.5"
              title="طباعة الشرائح"
            >
              <Printer className="w-3.5 h-3.5" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-xl border-slate-800 text-slate-300 hover:text-white h-8 px-2.5"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Dynamic Slide Content Display */}
        <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full my-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id || currentSlideIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Slide Title */}
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  {currentSlide.type === 'objectives' && '🎯 الأهداف المعيارية والتهيئة'}
                  {currentSlide.type === 'concept' && '📐 المفاهيم والقوانين العلمية'}
                  {currentSlide.type === 'simulation' && '🧪 التجريب والاستقصاء ثلاثي الأبعاد'}
                  {currentSlide.type === 'misconceptions' && '⚠️ المفاهيم المغلوطة وتصحيحها'}
                  {currentSlide.type === 'exit_ticket' && '🎫 تذكرة الخروج (Exit Ticket)'}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  {currentSlide.title}
                </h2>
              </div>

              {/* Explanation Paragraph */}
              {currentSlide.content.explanation && (
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  {currentSlide.content.explanation}
                </p>
              )}

              {/* Key Formula Card (if present) */}
              {currentSlide.content.keyFormula && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/40 text-center space-y-1">
                  <span className="text-[11px] text-cyan-400 font-bold">العلاقة الرياضية الأساسية:</span>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-300" dir="ltr">
                    {currentSlide.content.keyFormula}
                  </div>
                </div>
              )}

              {/* Bullet Points */}
              {currentSlide.content.bullets && currentSlide.content.bullets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentSlide.content.bullets.map((bullet, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">{bullet}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 3D Simulation Card */}
              {currentSlide.type === 'simulation' && (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-cyan-900/40 border border-cyan-500/40 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                    <Atom className="w-8 h-8 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white">
                      {currentSlide.content.simulationTitle || 'المختبر الافتراضي المقترح'}
                    </h3>
                    <p className="text-xs text-slate-300 max-w-lg mx-auto">
                      يمكنك تشغيل المحاكاة الآن لاختبار المتغيرات عملياً مع طلاب الصف.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={() => {
                        const slug = currentSlide.content.simulationSlug || 'faraday';
                        window.open(`/${slug}`, '_blank');
                      }}
                      className="rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs gap-2 h-11 px-6 shadow-lg shadow-cyan-500/25"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>فتح المحاكاة 3D في نافذة مستقلة</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Misconceptions Grid */}
              {currentSlide.content.misconceptions && (
                <div className="space-y-3">
                  {currentSlide.content.misconceptions.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2 text-rose-400 font-bold">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>مفهوم مغلوط شائع: "{item.misconception}"</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400 font-bold mr-6">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>التصحيح العلمي الدقيق: {item.correction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Exit Ticket Quiz */}
              {currentSlide.type === 'exit_ticket' && currentSlide.content.quiz && (
                <div className="space-y-4">
                  {currentSlide.content.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <p className="font-bold text-xs sm:text-sm text-white">
                        سؤال {qIdx + 1}: {q.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userQuizAnswers[qIdx] === optIdx;
                          const isCorrect = q.correctIndex === optIdx;
                          let btnStyle = 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800';

                          if (isQuizSubmitted) {
                            if (isCorrect) btnStyle = 'bg-emerald-600/30 text-emerald-300 border-emerald-500';
                            else if (isSelected && !isCorrect) btnStyle = 'bg-rose-600/30 text-rose-300 border-rose-500';
                          } else if (isSelected) {
                            btnStyle = 'bg-cyan-600 text-white border-cyan-500';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isQuizSubmitted}
                              onClick={() => setUserQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                              className={`p-3 rounded-xl border text-xs text-right font-medium transition-all ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isQuizSubmitted && (
                        <p className="text-[11px] text-cyan-300 bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-500/30">
                          💡 التفسير: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end gap-2 pt-2">
                    {!isQuizSubmitted ? (
                      <Button
                        onClick={() => setIsQuizSubmitted(true)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        تصحيح تذكرة الخروج والتحقق من الإجابات
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setIsQuizSubmitted(false);
                          setUserQuizAnswers({});
                        }}
                        variant="outline"
                        className="rounded-xl border-slate-700 text-slate-300 text-xs"
                      >
                        إعادة المحاولة
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPrevSlide}
              disabled={currentSlideIndex === 0}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-800 text-slate-300 hover:text-white h-9 px-3 gap-1 text-xs"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </Button>

            <Button
              onClick={goToNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-800 text-slate-300 hover:text-white h-9 px-3 gap-1 text-xs"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Slide dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlideIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentSlideIndex 
                    ? 'w-7 bg-cyan-400' 
                    : 'w-2 bg-slate-800 hover:bg-slate-700'
                }`}
                title={`انتقل للشريحة ${i + 1}`}
              />
            ))}
          </div>

          <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
            استخدم الأسهم ◀ ▶ أو مفتاح F لملء الشاشة
          </div>
        </div>
      </div>

    </div>
  );
};

export default InteractiveLessonDeckStudio;
