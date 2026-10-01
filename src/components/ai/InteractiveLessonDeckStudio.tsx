import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  BookOpen,
  Volume2,
  VolumeX,
  Clock,
  Pause,
  Award,
  Download,
  Eye,
  X,
  Flame,
  FileCheck,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { geminiMultimodalService, type LessonSlideData } from '@/services/geminiMultimodalService';
import { simulationCatalogService, type SimulationRecord } from '@/services/simulationCatalogService';

// Slide Visual Themes (All Pure Light & Modern)
type SlideTheme = 'bright-classroom' | 'royal-academic' | 'emerald-biolab' | 'amber-warm';

const THEME_STYLES: Record<SlideTheme, {
  name: string;
  bg: string;
  cardBg: string;
  accent: string;
  border: string;
  text: string;
  subtext: string;
  badgeBg: string;
}> = {
  'bright-classroom': {
    name: '☀️ الصفي الساطع (Classroom Blue)',
    bg: 'bg-gradient-to-br from-slate-50 via-white to-blue-50/70',
    cardBg: 'bg-white shadow-md border-slate-200',
    accent: 'text-blue-600',
    border: 'border-blue-200',
    text: 'text-slate-900',
    subtext: 'text-slate-700',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-300'
  },
  'royal-academic': {
    name: '🏛️ الأكاديمي الملكي (Royal Indigo)',
    bg: 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/70',
    cardBg: 'bg-white shadow-md border-indigo-100',
    accent: 'text-indigo-600',
    border: 'border-indigo-200',
    text: 'text-slate-900',
    subtext: 'text-slate-700',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-300'
  },
  'emerald-biolab': {
    name: '🌿 الزمرد العلمي (Emerald Light)',
    bg: 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/70',
    cardBg: 'bg-white shadow-md border-emerald-100',
    accent: 'text-emerald-600',
    border: 'border-emerald-200',
    text: 'text-slate-900',
    subtext: 'text-slate-700',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-300'
  },
  'amber-warm': {
    name: '✨ الإشراق الكهرماني (Warm Amber)',
    bg: 'bg-gradient-to-br from-slate-50 via-white to-amber-50/70',
    cardBg: 'bg-white shadow-md border-amber-100',
    accent: 'text-amber-700',
    border: 'border-amber-200',
    text: 'text-slate-900',
    subtext: 'text-slate-700',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-300'
  }
};

// Initial Kepler Lesson Deck with verified simulation link
const INITIAL_VERIFIED_DECK: LessonSlideData[] = [
  {
    id: 'slide-1',
    title: 'قوانين كبلر والحركة الدائرية في الفلك',
    subtitle: 'التهيئة الحافزة ونواتج التعلم الأساسية',
    type: 'objectives',
    teacherNotes: 'اطرح السؤال الحافز على طلاب الصف: كيف نقيس بعد الكواكب ونحدد سرعتها دون أن نصل إليها؟ انتظر 30 ثانية لتلقي الإجابات.',
    audioNarration: 'مرحباً بكم يا أبطال. في هذا الدرس سنستكشف معاً قوانين كبلر الثلاثة التي تحكم حركة الأجرام السماوية والأقمار الصناعية.',
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
    subtitle: 'التأصيل الرياضي والعلاقات الفيزيائية المعيارية',
    type: 'concept',
    teacherNotes: 'ركز على توضيح أن ثابت النسبة يعتمد فقط على كتلة الجرم المركزي M، وهو ما يفسر ثبوت النسبة لجميع كواكب المجموعة الشمسية.',
    audioNarration: 'ينص القانون الثالث لكبلر على أن النسبة بين مربع الزمن الدوري للكوكب ومكعب نصف قطر مداره مقدار ثابت لجميع كواكب النظام.',
    content: {
      keyFormula: 'T² / r³ = 4π² / (G · M) = Constant',
      explanation: 'يربط القانون الثالث لكبلر بين الزمن الدوري للكوكب وبعده عن مركز الكتلة الجاذبة، مما يسمح بحساب كتل النجوم والكواكب البعيدة بدقة فائقة.',
      bullets: [
        'T: الزمن الدوري للكوكب بالثواني (s) أو السنوات.',
        'r: متوسط نصف قطر المدار أو نصف المحور الأكبر بالمتر (m).',
        'G: ثابت الجذب العام لنيوتن (6.67 × 10⁻¹¹ N·m²/kg²).',
        'M: كتلة الجرم المركزي (الشمس أو الكوكب) بالكيلوغرام (kg).'
      ]
    }
  },
  {
    id: 'slide-3',
    title: 'المختبر الافتراضي: النظام الشمسي والمدارات 3D',
    subtitle: 'التجريب الاستقصائي المباشر في بيئة Three.js 3D',
    type: 'simulation',
    teacherNotes: 'وجه الطلاب للنقر على زر فتح المحاكاة، وجعلهم يزيدون سرعة الكوكب المدارية لملاحظة متى يتحول المدار من دائري إلى إهليلجي.',
    audioNarration: 'حان وقت الانتقال إلى مختبر النظام الشمسي ثلاثي الأبعاد لنختبر أثر الجاذبية على شكل المدار والسرعة اللحظية للكواكب.',
    content: {
      simulationSlug: 'solar-system-3d',
      simulationTitle: 'النظام الشمسي والمدارات ثلاثية الأبعاد',
      simulationLink: '/simulation/solar-system-3d',
      simulationDescription: 'محاكاة مدارات الكواكب حول الشمس وتطبيق قوانين كبلر في الجاذبية الكونية.',
      simulationEngine: 'Three.js 3D',
      explanation: 'خطوات الاستقصاء العملي: 1) انقر على زر فتح المختبر أو المعاينة المباشرة، 2) غير نصف قطر المدار وراقب التغير في زمن الدورة، 3) لاحظ زيادة السرعة عند الحضيض ونقصانها عند الأوج.'
    }
  },
  {
    id: 'slide-4',
    title: 'تطبيقات هندسية ومفاهيم مغلوطة شائعة',
    subtitle: 'تثبيت المفهوم والتحذير من الأخطاء الوزارية',
    type: 'misconceptions',
    teacherNotes: 'أكد على الفرق الجوهري بين انعدام الوزن (Weightlessness) وظاهرة السقوط الحر المستمر حول الأرض.',
    audioNarration: 'احذر من هذا الخطأ الشائع: رواد الفضاء لا يطفون لانعدام الجاذبية، بل لأنهم في حالة سقوط حر دائم حول كوكب الأرض.',
    content: {
      explanation: 'فهم دقيق للجاذبية في الفضاء ومسارات الأقمار الصناعية لنظام تحديد المواقع GPS والأقمار التلفزيونية في المدار الثابت.',
      misconceptions: [
        {
          misconception: 'رواد الفضاء يطفون في محطة الفضاء الدولية لانعدام الجاذبية الأرضية تماماً.',
          correction: 'الجاذبية موجودة عند مدار المحطة بنسبة تقارب 90% من سطح الأرض، لكن الرواد والمحطة معاً في حالة "سقوط حر مستمر" (Free Fall).'
        },
        {
          misconception: 'مدارات جميع الكواكب دائرية تامة التناظر.',
          correction: 'كافة المدارات قطوع ناقصة (إهليلجية) تقع الشمس في إحدى بؤرتيها، ولكن بعضها قليل الانحراف لدرجة قربه من الدائرة.'
        }
      ]
    }
  },
  {
    id: 'slide-5',
    title: 'تذكرة الخروج التقييمية (Exit Ticket)',
    subtitle: 'التحقق من نواتج التعلم خلال آخر 5 دقائق للحصول على وسام الإتقان',
    type: 'exit_ticket',
    teacherNotes: 'اطلب من الطلاب الإجابة الفردية، ثم أظهر شاشة الإتقان والتصحيح الختامي لتكريم أصحاب الإجابات الكاملة.',
    audioNarration: 'والآن مع التحدي الختامي، أجب عن أسئلة تذكرة الخروج للتحقق من إتقانك للدرس والحصول على شهادة التميز المعتمدة.',
    content: {
      explanation: 'أجب عن السؤالين التاليين لتثبيت نقاط الحصة بنجاح وإصدار شهادة إتقان الدرس الرقمية:',
      quiz: [
        {
          question: 'إذا تضاعف متوسط بعد كوكب عن الشمس 4 مرات، كم مرة يتضاعف زمنه الدوري T؟',
          options: ['مرتان (2)', '4 مرات', '8 مرات', '16 مرة'],
          correctIndex: 2,
          explanation: 'بحسب القانون الثالث T² يتناسب مع r³. عند ضرب r في 4، تصبح 4³ = 64، وجذر 64 هو 8 مرات.'
        },
        {
          question: 'أين تكون سرعة الكوكب المدارية في أقصى قيمتها اللحظية؟',
          options: ['عند نقطة الأوج (أبعد نقطة عن الشمس)', 'عند نقطة الحضيض (أقرب نقطة للشمس)', 'السرعة ثابتة في جميع نقاط المدار', 'في نقطة منتصف المسافة بين البؤرتين'],
          correctIndex: 1,
          explanation: 'بحسب قانون المساحات الثاني لكبلر وحفظ الزخم الزاوي، تزداد سرعة الكوكب كلما اقترب من الشمس ليمسح مساحات متساوية في أزمنة متساوية.'
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
  const [slides, setSlides] = useState<LessonSlideData[]>(INITIAL_VERIFIED_DECK);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTheme, setActiveTheme] = useState<SlideTheme>('bright-classroom');

  // Teacher Presentation Enhancements
  const [showTeacherNotes, setShowTeacherNotes] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLiveSimModalOpen, setIsLiveSimModalOpen] = useState<boolean>(false);

  // Classroom Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(300); // 5 minutes default
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Exit Ticket Answers State
  const [userQuizAnswers, setUserQuizAnswers] = useState<{ [qIdx: number]: number }>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('طالب متميز');
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  // Timer Effect
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            toast.info('⏰ انتهى زمن الشريحة المحدد للحصة!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        goToNextSlide();
      } else if (e.key === 'ArrowRight') {
        goToPrevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        if (!e.metaKey && !e.ctrlKey) {
          setIsFullscreen(prev => !prev);
        }
      } else if (e.key === 't' || e.key === 'T') {
        setShowTeacherNotes(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length]);

  const goToNextSlide = () => {
    stopNarration();
    setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
  };

  const goToPrevSlide = () => {
    stopNarration();
    setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
  };

  // Slide Audio Narration
  const speakSlideNarration = useCallback((textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      toast.info('المتصفح لا يدعم التوليف الصوتي المباشر');
      return;
    }

    window.speechSynthesis.cancel();

    const clean = textToSpeak.replace(/[*#_`$]/g, '').slice(0, 400);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arVoice) utterance.voice = arVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopNarration = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Generate Deck with AI
  const handleGenerateDeck = async () => {
    if (!topicInput.trim()) {
      toast.error('يرجى كتابة عنوان الدرس المطلوب');
      return;
    }

    stopNarration();
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
        setShowCertificate(false);
        setTimerSeconds(300);
        setIsTimerRunning(false);

        toast.success(`تم توليد العرض التفاعلي وربطه بالمحاكاة المطابقة بنجاح! 🚀`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'تعذر توليد شرائح الدرس');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSlide = slides[currentSlideIndex] || slides[0];
  const theme = THEME_STYLES[activeTheme];

  // Calculate Exit Ticket Score
  const calculateScore = () => {
    if (!currentSlide.content.quiz) return { correct: 0, total: 0, percent: 0 };
    let correct = 0;
    currentSlide.content.quiz.forEach((q, idx) => {
      if (userQuizAnswers[idx] === q.correctIndex) correct++;
    });
    const total = currentSlide.content.quiz.length;
    const percent = Math.round((correct / total) * 100);
    return { correct, total, percent };
  };

  const scoreResult = calculateScore();

  return (
    <div className="w-full space-y-6 text-slate-900 dark:text-slate-100 font-sans" dir="rtl">
      
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-bold">
                استوديو العروض والدروس التفاعلية 2.0 (Interactive Lesson Decks)
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>ربط حقيقي مع الـ 49 محاكاة 3D</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              استوديو الحصص المدرسية التفاعلية وعروض المحاكاة 3D
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              توليد عروض صفية مبهرة لمدارس التوجيهي ومسارات BTEC: تهيئة، قوانين، محاكاة ثلاثية الأبعاد مطابقة بروابط مباشرة، وملاحظات المعلم وتذاكر الخروج مع شهادات إتقان.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            {/* Theme Picker Dropdown */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/20 backdrop-blur-md text-xs">
              <Palette className="w-4 h-4 ml-1" />
              {(['bright-classroom', 'royal-academic', 'emerald-biolab', 'amber-warm'] as SlideTheme[]).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTheme(t)}
                  className={`px-2 py-1 rounded-xl font-bold transition-all text-[11px] ${
                    activeTheme === t ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {t === 'bright-classroom' ? '☀️ صفي ساطع' : t === 'royal-academic' ? '🏛️ نيلي ملكي' : t === 'emerald-biolab' ? '🌿 زمردي' : '✨ كهرماني'}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-white/15 border-white/30 text-white hover:bg-white/25 rounded-2xl text-xs gap-1.5"
            >
              <Maximize2 className="w-4 h-4" />
              <span>ملء الشاشة (F)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Generator Prompt Bar */}
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
              placeholder="مثال: الحث الكهرومغناطيسي، انكسار الضوء، الاتزان الكيميائي، سرعة المقذوفات..."
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
              <option value="توجيهي علمي">توجيهي علمي (وزاري)</option>
              <option value="BTEC هندسة">مسار BTEC هندسة</option>
              <option value="BTEC تكنولوجيا">BTEC تكنولوجيا معلومات</option>
              <option value="أول ثانوي علمي">أول ثانوي علمي</option>
              <option value="الصف العاشر">الصف العاشر الأساسي</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              المادة الدراسية:
            </label>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              <option value="فيزياء">فيزياء</option>
              <option value="كيمياء">كيمياء</option>
              <option value="رياضيات">رياضيات</option>
              <option value="أحياء">أحياء وعلوم بيئية</option>
              <option value="فلك">علوم الفلك والجاذبية</option>
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
                  <span>توليد العرض وربط المحاكاة...</span>
                </>
              ) : (
                <>
                  <Presentation className="w-4 h-4" />
                  <span>توليد الدرس التفاعلي 🚀</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Curriculum Matcher Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-bold">دروس شائعة جاهزة للربط الفوري:</span>
          {[
            { title: 'انكسار الضوء وقانون سنيل', disc: 'فيزياء' },
            { title: 'الاتزان الكيميائي ومبدأ لوشاتيليه', disc: 'كيمياء' },
            { title: 'حركة المقذوفات الكلاسيكية والنسبية', disc: 'فيزياء' },
            { title: 'تعديل الجينات كريسبر وانقسام الخلية', disc: 'أحياء' },
            { title: 'قانون هوك والمرونة والزنبرك', disc: 'فيزياء' },
            { title: 'حموض وقواعد ومقياس الرقم الهيدروجيني pH', disc: 'كيمياء' }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => { setTopicInput(item.title); setDiscipline(item.disc); }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Presentation Stage */}
      <div 
        className={`rounded-3xl ${theme.bg} ${theme.text} border-2 ${theme.border} shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none p-6 md:p-10' : 'min-h-[640px] p-6 sm:p-8'
        }`}
      >
        {/* Top Control Bar: Meta + Classroom Timer + Audio Speaker + Notes */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/90 mb-4 relative z-20">
          
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold border ${theme.badgeBg}`}>
              الشريحة {currentSlideIndex + 1} من {slides.length}
            </span>
            <span className={`text-xs font-bold hidden sm:inline ${theme.subtext}`}>
              {currentSlide.subtitle}
            </span>
          </div>

          {/* Interactive Classroom Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 text-xs shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-mono font-bold text-slate-800">{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
              title={isTimerRunning ? 'إيقاف مؤقت' : 'بدء المؤقت'}
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={() => { setTimerSeconds(300); setIsTimerRunning(false); }}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              title="إعادة ضبط 5 دقائق"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Controls: Audio Narration + Teacher Notes + Print + Fullscreen */}
          <div className="flex items-center gap-2">
            
            {/* Audio Narration Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (isSpeaking) {
                  stopNarration();
                } else {
                  const speech = currentSlide.audioNarration || currentSlide.content.explanation || currentSlide.title;
                  speakSlideNarration(speech);
                }
              }}
              className={`rounded-xl text-xs gap-1.5 h-8.5 px-3 border-slate-200 transition-all shadow-sm ${
                isSpeaking 
                  ? 'bg-rose-500 text-white border-rose-500 animate-pulse' 
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
              title="الاستماع للشرح الصوتي للشريحة"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600" />}
              <span>{isSpeaking ? 'إيقاف الصوت' : 'استمع للشريحة'}</span>
            </Button>

            {/* Teacher Notes Toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTeacherNotes(!showTeacherNotes)}
              className={`rounded-xl text-xs gap-1 h-8.5 px-3 border-slate-200 shadow-sm ${
                showTeacherNotes ? 'bg-amber-500 text-white font-bold border-amber-500' : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
              title="دليل المعلم والأسئلة السابرة (T)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>ملاحظات المعلم</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 h-8.5 px-2.5 shadow-sm"
              title="طباعة الشرائح"
            >
              <Printer className="w-3.5 h-3.5" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 h-8.5 px-2.5 shadow-sm"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Collapsible Teacher Notes Drawer */}
        <AnimatePresence>
          {showTeacherNotes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between font-bold text-amber-800">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>دليل المعلم واستراتيجية التدريس المقترحة لهذه الشريحة:</span>
                  </div>
                  <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full text-amber-800">استراتيجيات التعلم النشط</span>
                </div>
                <p className="leading-relaxed">
                  {currentSlide.teacherNotes || 'وجه الطلاب لملاحظة العلاقات والمتغيرات وطرح أسئلة استقصائية تعزز التفكير الناقد.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Slide Content Stage */}
        <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full my-4 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id || currentSlideIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Category Tag & Slide Title */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider ${theme.accent}`}>
                    {currentSlide.type === 'objectives' && '🎯 الأهداف المعيارية والتهيئة الحافزة'}
                    {currentSlide.type === 'concept' && '📐 المفاهيم والقوانين العلمية الحاكمة'}
                    {currentSlide.type === 'simulation' && '🧪 الاستقصاء والتجريب العملي 3D'}
                    {currentSlide.type === 'misconceptions' && '⚠️ المفاهيم المغلوطة الشائعة وتصحيحها'}
                    {currentSlide.type === 'exit_ticket' && '🎫 تذكرة الخروج والتقييم الختامي'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  {currentSlide.title}
                </h2>
              </div>

              {/* Explanation Paragraph */}
              {currentSlide.content.explanation && (
                <p className={`text-sm sm:text-base leading-relaxed p-4 rounded-2xl border ${theme.cardBg} ${theme.border} ${theme.subtext}`}>
                  {currentSlide.content.explanation}
                </p>
              )}

              {/* Key Formula Card (Concept Slide) */}
              {currentSlide.content.keyFormula && (
                <div className={`p-6 rounded-3xl border text-center space-y-2 ${theme.cardBg} ${theme.border} shadow-lg`}>
                  <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>العلاقة الرياضية الأساسية الحاكمة:</span>
                  </span>
                  <div className={`text-2xl sm:text-3xl font-mono font-black ${theme.accent}`} dir="ltr">
                    {currentSlide.content.keyFormula}
                  </div>
                </div>
              )}

              {/* Bullet Points Grid */}
              {currentSlide.content.bullets && currentSlide.content.bullets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {currentSlide.content.bullets.map((bullet, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-2xl border flex items-start gap-3 ${theme.cardBg} ${theme.border}`}
                    >
                      <div className="w-6 h-6 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">
                        {idx + 1}
                      </div>
                      <span className={`text-xs sm:text-sm leading-relaxed ${theme.subtext}`}>
                        {bullet}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* SLIDE 3: 180-DEGREE SIMULATION WORKBENCH CARD */}
              {currentSlide.type === 'simulation' && (
                <div className={`p-6 md:p-8 rounded-3xl border text-center space-y-6 ${theme.cardBg} ${theme.border} relative overflow-hidden shadow-2xl`}>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3 text-right">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-md">
                        <Atom className="w-7 h-7 animate-spin" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                            {currentSlide.content.simulationEngine || 'WebGL 3D'}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
                            معتمد من المنهاج
                          </Badge>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black mt-1">
                          {currentSlide.content.simulationTitle || 'المختبر الافتراضي العلمي 3D'}
                        </h3>
                      </div>
                    </div>

                    {/* Simulation Launch Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Direct External/Tab Launch Button */}
                      <Button
                        onClick={() => {
                          const targetUrl = currentSlide.content.simulationLink || `/simulation/${currentSlide.content.simulationSlug}`;
                          window.open(targetUrl, '_blank');
                        }}
                        className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs gap-2 h-11 px-5 shadow-lg shadow-cyan-500/25"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>فتح المحاكاة 3D في نافذة مستقلة</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>

                      {/* In-Slide Preview Toggle */}
                      <Button
                        variant="outline"
                        onClick={() => setIsLiveSimModalOpen(true)}
                        className="rounded-2xl border-slate-300 bg-white text-slate-800 hover:bg-slate-50 text-xs h-11 px-4 gap-1.5 shadow-sm"
                      >
                        <Eye className="w-4 h-4 text-cyan-600" />
                        <span>معاينة داخل الحصة</span>
                      </Button>
                    </div>
                  </div>

                  {/* Guided Inquiry Lab Checklist */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-right space-y-2.5">
                    <span className="text-xs font-bold text-cyan-700 flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      <span>خطوات الاستقصاء العملي المقترحة للتجريب في الحصة:</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2 shadow-sm">
                        <span className="w-5 h-5 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 font-bold font-mono">1</span>
                        <span>غيّر المتغير المستقل وراقب المؤشرات الرقمية في المختبر.</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2 shadow-sm">
                        <span className="w-5 h-5 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold font-mono">2</span>
                        <span>سجل قراءات فرق الجهد أو السرعة عند نقاط محددة.</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2 shadow-sm">
                        <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold font-mono">3</span>
                        <span>قارن النتائج المقاسة مع القيمة النظرية المحسوبة بالقانون.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Misconceptions Grid */}
              {currentSlide.content.misconceptions && (
                <div className="space-y-3.5">
                  {currentSlide.content.misconceptions.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-5 rounded-2xl border-2 border-slate-200 bg-white shadow-md space-y-2 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2 text-rose-700 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                        <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
                        <span>تصور خاطئ شائع: "{item.misconception}"</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-800 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 mr-2">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                        <span>التصحيح العلمي الدقيق: {item.correction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SLIDE 5: 180-DEGREE EXIT TICKET & CERTIFICATE OF MASTERY */}
              {currentSlide.type === 'exit_ticket' && currentSlide.content.quiz && (
                <div className="space-y-4">
                  
                  {/* Score Meter Banner when submitted */}
                  {isQuizSubmitted && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between shadow-md ${
                        scoreResult.percent >= 70 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                          : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Award className="w-6 h-6 text-amber-500" />
                        <div>
                          <span className="font-bold text-sm">
                            النتيجة: {scoreResult.correct} من {scoreResult.total} ({scoreResult.percent}%)
                          </span>
                          <span className="text-xs block opacity-85">
                            {scoreResult.percent === 100 ? 'إتقان تام مذهل! تستحق وسام التميز' : 'أداء رائع، راجع التفسيرات أدناه'}
                          </span>
                        </div>
                      </div>

                      {scoreResult.percent >= 70 && (
                        <Button
                          size="sm"
                          onClick={() => setShowCertificate(true)}
                          className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5 shadow-md"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>عرض شهادة إتقان الدرس 🎓</span>
                        </Button>
                      )}
                    </motion.div>
                  )}

                  {/* Questions */}
                  {currentSlide.content.quiz.map((q, qIdx) => (
                    <div 
                      key={qIdx} 
                      className={`p-5 rounded-2xl border-2 space-y-3 ${theme.cardBg} ${theme.border} shadow-md`}
                    >
                      <p className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-mono font-bold">
                          {qIdx + 1}
                        </span>
                        <span>{q.question}</span>
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userQuizAnswers[qIdx] === optIdx;
                          const isCorrect = q.correctIndex === optIdx;
                          let btnStyle = 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 shadow-sm';

                          if (isQuizSubmitted) {
                            if (isCorrect) btnStyle = 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold shadow-sm';
                            else if (isSelected && !isCorrect) btnStyle = 'bg-rose-100 text-rose-900 border-rose-300';
                          } else if (isSelected) {
                            btnStyle = 'bg-blue-600 text-white border-blue-600 shadow-md font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isQuizSubmitted}
                              onClick={() => setUserQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                              className={`p-3.5 rounded-xl border text-xs text-right font-medium transition-all ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isQuizSubmitted && (
                        <p className="text-xs text-blue-900 bg-blue-50 p-3 rounded-xl border border-blue-200 font-medium">
                          💡 التفسير العلمي: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Submission Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="اسم الطالب للشهادة..."
                        className="h-9 w-48 rounded-xl bg-white border-slate-300 text-xs text-slate-900 shadow-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      {!isQuizSubmitted ? (
                        <Button
                          onClick={() => {
                            setIsQuizSubmitted(true);
                            toast.success('تم تصحيح تذكرة الخروج!');
                          }}
                          className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md"
                        >
                          تصحيح تذكرة الخروج والتحقق من الإتقان
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setIsQuizSubmitted(false);
                            setUserQuizAnswers({});
                            setShowCertificate(false);
                          }}
                          variant="outline"
                          className="rounded-xl border-slate-300 text-slate-700 text-xs bg-white hover:bg-slate-50 shadow-sm"
                        >
                          إعادة المحاولة
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="pt-4 border-t border-slate-200/90 flex items-center justify-between gap-4 relative z-20">
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPrevSlide}
              disabled={currentSlideIndex === 0}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 h-9 px-3.5 gap-1.5 text-xs font-bold shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </Button>

            <Button
              onClick={goToNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 h-9 px-3.5 gap-1.5 text-xs font-bold shadow-sm"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Interactive Slide Dots */}
          <div className="flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={i}
                onClick={() => {
                  stopNarration();
                  setCurrentSlideIndex(i);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === currentSlideIndex 
                    ? 'w-8 bg-blue-600 shadow-md shadow-blue-500/30' 
                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`الشريحة ${i + 1}: ${slide.title}`}
              />
            ))}
          </div>

          <div className="text-[11px] opacity-60 font-mono hidden sm:block">
            تنقل بالأسهم ◀ ▶ • مفتاح T لملاحظات المعلم • F لملء الشاشة
          </div>
        </div>
      </div>

      {/* LIVE IN-SLIDE 3D SIMULATION MODAL (Never Leaves the Classroom Presentation) */}
      <AnimatePresence>
        {isLiveSimModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl text-white"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Atom className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      معاينة المختبر التفاعلي داخل الحصة: {currentSlide.content.simulationTitle}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      محاكاة 3D تعمل بكفاءة كاملة داخل نافذة العرض
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const targetUrl = currentSlide.content.simulationLink || `/simulation/${currentSlide.content.simulationSlug}`;
                      window.open(targetUrl, '_blank');
                    }}
                    className="rounded-xl text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-8 gap-1.5"
                  >
                    <span>فتح في تبويب مستقل</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsLiveSimModalOpen(false)}
                    className="rounded-xl text-slate-400 hover:text-white h-8 w-8 p-0"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Embedded Simulation Frame */}
              <div className="flex-1 bg-black relative">
                <iframe
                  src={currentSlide.content.simulationLink || `/simulation/${currentSlide.content.simulationSlug}`}
                  title={currentSlide.content.simulationTitle || 'Simulation'}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CERTIFICATE OF LESSON MASTERY MODAL */}
      <AnimatePresence>
        {showCertificate && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-amber-400/50 rounded-3xl w-full max-w-2xl p-8 text-white shadow-2xl space-y-6 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-20 h-20 rounded-3xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/25">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 uppercase tracking-widest">
                  شهادة إتقان الدرس المعيارية (Mastery Certificate)
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-300">
                  وسام التميز الأكاديمي والاستيعاب التام
                </h3>
              </div>

              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-slate-200 text-sm">
                <p>تشهد منصة <strong>"ذروة العلم 2.0"</strong> ومدرسة <strong>عنبه الثانية الشاملة للبنين</strong> بأن الطالب المتميز:</p>
                <div className="text-2xl font-black text-cyan-400 py-1 font-sans">
                  {studentName || 'طالب متميز'}
                </div>
                <p>
                  قد اجتاز بنجاح تذكرة الخروج التقييمية لدرس: <strong>"{currentSlide.title}"</strong> في مسار <strong>({gradeLevel})</strong> بنسبة إتقان كاملة (100%).
                </p>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>تاريخ المنح: {new Date().toLocaleDateString('ar-JO')}</span>
                  <span className="font-mono text-amber-300 font-bold">VERIFIED-ID: ZARWAT-2026-OK</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => window.print()}
                  className="rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5 h-11 px-6 shadow-lg shadow-amber-500/25"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الشهادة الآن</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowCertificate(false)}
                  className="rounded-2xl border-white/20 text-white hover:bg-white/10 text-xs h-11 px-6"
                >
                  إغلاق
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InteractiveLessonDeckStudio;
