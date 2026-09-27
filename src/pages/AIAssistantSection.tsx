import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  ArrowLeft, 
  Brain, 
  Sparkles, 
  Send, 
  Bot, 
  Heart, 
  Stethoscope, 
  Code2, 
  Cpu, 
  Eye, 
  CheckCircle2, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Compass,
  CornerDownLeft,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import aiAssistantBg from '@/assets/ai-assistant-section.jpg';

const clickSound = '/message-notification.mp3';

interface AIAssistantCard {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  color: string;
  gradient: string;
  bgLight: string;
  borderColor: string;
  link: string;
  features: string[];
}

export const AIAssistantSection: React.FC = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeQuery, setActiveQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [answeredTopic, setAnsweredTopic] = useState<string | null>(null);

  const playSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch {
      // Audio autoplay restrictions
    }
  };

  let dir = 'rtl';
  try {
    const lang = useLanguage();
    if (lang && lang.dir) dir = lang.dir;
  } catch {
    dir = 'rtl';
  }

  const assistants: AIAssistantCard[] = [
    {
      id: 'psychological',
      title: "مرشدك النفسي الذكي",
      subtitle: "Emotional Wellbeing & Calm Guide",
      badge: "دعم وجداني وتنظيم التوتر",
      icon: Heart,
      description: "مساعد نفسي متقدم يساعد الطلاب في تفريغ الضغط الدراسي، تنظيم قلق الامتحانات، وتطبيق تقنيات التنفس الصندوقي 4-4-4-4 والتأريض المعرفي.",
      color: "from-pink-500 to-rose-600",
      gradient: "from-pink-600/20 via-purple-600/10 to-transparent",
      bgLight: "bg-pink-50 dark:bg-pink-950/20",
      borderColor: "border-pink-300 dark:border-pink-800/40",
      link: "/psychological-guide",
      features: [
        "تمارين التنفس الصندوقي 4-4-4-4 التفاعلية",
        "مسح الحالة الشعورية (6 حالات وجدانية)",
        "حقيبة الإسعاف النفسي السريع SOS",
        "تلاوات قرآنية مهدئة بدون موسيقى"
      ]
    },
    {
      id: 'falak',
      title: "فلك المعرفة والذكاء الاصطناعي",
      subtitle: "Scientific & Astronomical AI",
      badge: "العلوم الطبيعية والفضاء",
      icon: Sparkles,
      description: "رفيقك العلمي الذكي لشرح أعمق النظريات في الفيزياء الكونية، النسبية، ميكانيكا الكم، والربط التفاعلي مع المناهج العلمية المتقدمة.",
      color: "from-indigo-500 to-purple-600",
      gradient: "from-indigo-600/20 via-purple-600/10 to-transparent",
      bgLight: "bg-indigo-50 dark:bg-indigo-950/20",
      borderColor: "border-indigo-300 dark:border-indigo-800/40",
      link: "/falak-knowledge-ai",
      features: [
        "تفسير المفاهيم الفيزيائية خطوة بخطوة",
        "تحليل صور ومعادلات المناهج المدرسية",
        "ربط فوري بالمختبرات ثلاثية الأبعاد",
        "توليد أسئلة بلوم المتدرجة للاختبار الذاتي"
      ]
    },
    {
      id: 'medical',
      title: "المساعد الطبي المدرسي",
      subtitle: "School Health & Emergency AI",
      badge: "إسعافات وطوارئ فورية",
      icon: Stethoscope,
      description: "مساعد صحي ذكي موجه للطلاب والمعلمين للتعامل الفوري مع الحالات المدرسية الطارئة (رعاف، إغماء، جروح، تشنجات) مع ميزة الفحص بالكاميرا.",
      color: "from-rose-500 to-red-600",
      gradient: "from-rose-600/20 via-red-600/10 to-transparent",
      bgLight: "bg-rose-50 dark:bg-rose-950/20",
      borderColor: "border-rose-300 dark:border-rose-800/40",
      link: "/medical-assistant",
      features: [
        "كاشف الحالات الطارئة عبر الكاميرا",
        "إرشادات تفصيلية واضحة للطالب والمعلم",
        "بروتوكولات الإسعافات الأولية المعتمدة",
        "أرقام الطوارئ والتنبيه السريع"
      ]
    },
    {
      id: 'code-fixer',
      title: "مصحح الأكواد والبرمجة بالذكاء الاصطناعي",
      subtitle: "BTEC AI Code Assistant",
      badge: "برمجة وهندسة برمجيات",
      icon: Code2,
      description: "مساعد متخصص لطلبة BTEC وهواة البرمجة لاكتشاف الأخطاء وتصحيحها فورياً، وشرح حلول المسائل بلغات Python، JavaScript، وC++.",
      color: "from-blue-500 to-cyan-600",
      gradient: "from-blue-600/20 via-cyan-600/10 to-transparent",
      bgLight: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-300 dark:border-blue-800/40",
      link: "/btec/it/code-fixer",
      features: [
        "تصحيح أخطاء الـ Syntax والـ Logic",
        "تحويل المنطق الرياضي إلى كود برمجي",
        "شرح الكود سطراً بسطر",
        "نصائح لتحسين كفاءة الخوارزميات"
      ]
    },
    {
      id: 'robotics-ai',
      title: "مساعد الروبوتات والأنظمة الذكية",
      subtitle: "Robotics & Kinematics AI CoPilot",
      badge: "أنظمة ROS2 & LiDAR",
      description: "مساعد مهني يدعم حسابات حركيات الأذرع الروبوتية (Forward/Inverse Kinematics)، تحليل بيانات مستشعرات الـ LiDAR، وبرمجة متحكمات الروبوت.",
      color: "from-amber-500 to-orange-600",
      gradient: "from-amber-600/20 via-orange-600/10 to-transparent",
      bgLight: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-300 dark:border-amber-800/40",
      link: "/robotics-section",
      features: [
        "توليد ومراجعة نصوص برمجية للـ ROS2",
        "حساب المصفوفات الحركية 6-DOF",
        "تفسير قراءات الخرائط والملاحة",
        "إرشادات تصميم الدوائر والمحركات"
      ]
    },
    {
      id: 'sign-ai',
      title: "مترجم لغة الإشارة بالرؤية الحاسوبية",
      subtitle: "Damij AI Sign Vision",
      badge: "دامج للتعليم الشامل",
      icon: Eye,
      description: "تقنية رؤية حاسوبية ذكية تتعرف على حركات وإيماءات اليد والأصابع عبر الكاميرا وتحولها فورياً إلى نصوص عربية مفهومة لتسهيل التواصل.",
      color: "from-teal-500 to-emerald-600",
      gradient: "from-teal-600/20 via-emerald-600/10 to-transparent",
      bgLight: "bg-teal-50 dark:bg-teal-950/20",
      borderColor: "border-teal-300 dark:border-teal-800/40",
      link: "/damij/sign",
      features: [
        "كشف فوري للإيماءات عبر كاميرا الويب",
        "قاموس إشاري عربي متكامل ومتحرك",
        "معالجة محلية بالكامل على جهاز المستخدم",
        "متوافق مع معايير الوصول الشامل WCAG"
      ]
    }
  ];

  const presetQuestions = [
    {
      q: "ما هو تمدد الزمن وفق النظرية النسبية الخاصة؟",
      category: "فيزياء",
      a: "تمدد الزمن (Time Dilation) هو ظاهرة فيزيائية تنص على أن الزمن يمر بمعدل أبطأ بالنسبة لمراقب يتحرك بسرعة قريبة من سرعة الضوء مقارنة بمراقب ساكن. يُحسب وفق معادلة معامل لورنتز: \\( \\Delta t' = \\frac{\\Delta t}{\\sqrt{1 - v^2/c^2}} \\). يمكنك استكشاف ذلك عملياً في محاكاة النسبية الخاصة في منصتنا!"
    },
    {
      q: "أشعر بقلق وتوتر شديد قبل موعد الامتحان، كيف أهدأ؟",
      category: "مرشد نفسي",
      a: "أهلاً بك يا بطل 💙 توترك رد فعل طبيعي يدل على حرصك واهتمامك. جرب الآن تقنية «التنفس الصندوقي 4-4-4-4»: خذ شهيقاً في 4 ثوانٍ، احبس النفس 4 ثوانٍ، اخرج الزفير في 4 ثوانٍ، ثم انتظر 4 ثوانٍ. كررها 3 مرات. وتذكر: أنت بذلت جهدك، والنتيجة توفيق من الله. ادخل إلى «مرشدك النفسي» الآن لنخوض الجلسة كاملة معاً!"
    },
    {
      q: "ما هو التصرف الصحيح الفوري في حالة الرعاف المدرسي؟",
      category: "إسعاف مدرسي",
      a: "1. اجلس واحنِ رأسك للأمام قليلاً (لا ترجع رأسك للخلف أبداً لمنع بلع الدم). 2. اضغط بلطف على الجزء المرن اللحمي من الأنف لمدة 10 دقائق متواصلة بدون توقف. 3. تنفس من فمك وضع كمادة باردة على جسر الأنف. يمكنك مراجعة دليل الإسعافات المصور في «المساعد الطبي المدرسي»."
    },
    {
      q: "كيف يعمل خوارزمية البحث الثنائي Binary Search؟",
      category: "برمجة BTEC",
      a: "البحث الثنائي يعمل فقط على المصفوفات المرتبة (Sorted Array). الفكرة الأساسية هي تقسيم مجال البحث إلى النصف في كل خطوة ومقارنة العنصر الأوسط بالهدف. كفاءته الزمنية مذهلة \\( O(\\log n) \\). تفضل بتجربة مصحح الأكواد في مسار BTEC لنحول ذلك إلى كود كامل!"
    }
  ];

  const handleAskQuestion = (question: string, answer: string) => {
    playSound();
    setActiveQuery(question);
    setIsTyping(true);
    setAiAnswer(null);
    setAnsweredTopic(question);

    setTimeout(() => {
      setIsTyping(false);
      setAiAnswer(answer);
    }, 600);
  };

  const handleCustomQuery = () => {
    if (!activeQuery.trim()) return;
    playSound();
    setIsTyping(true);
    setAiAnswer(null);
    setAnsweredTopic(activeQuery);

    setTimeout(() => {
      setIsTyping(false);
      setAiAnswer(
        `شكراً لسؤالك الذكي: «${activeQuery}». مساعدونا الأذكياء المتخصصون جاهزون لمساعدتك بعمق! يمكنك توجيه هذا الاستفسار إلى "فلك المعرفة" أو "مرشدك النفسي" أو "مساعد BTEC البرمجي" للحصول على استجابة فورية ونماذج عملية.`
      );
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060919] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300" dir={dir}>
      <SEO
        title="مركز المساعد الذكي والذكاء الاصطناعي | ذروة العلم"
        description="مركز الذكاء الاصطناعي الشامل في ذروة العلم: المرشد النفسي لتنظيم القلق، فلك المعرفة للعلوم والفضاء، المساعد الطبي المدرسي، ومصحح الأكواد البرمجية."
        keywords="مرشد ذكي, مرشد نفسي, ذكاء اصطناعي, فلك المعرفة, مساعد طبي مدرسي, تصحيح الأكواد, ذروة العلم"
      />
      <Navbar />
      <audio ref={audioRef} src={clickSound} preload="auto" />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            مركز المساعدين الأذكياء والذكاء الاصطناعي
          </span>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl p-6 sm:p-12 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold">
              <Brain className="w-4 h-4" />
              <span>منظومة الذكاء المعرفي التفاعلي (AI Command Center)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              مركز المساعدين الأذكياء
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              منظومة متطورة تضم 6 مساعدين أذكياء متخصصين في الدعم النفسي، العلوم الطبيعية، الإسعاف المدرسي، تصحيح الأكواد، وأنظمة الروبوتات والشمولية لخدمة الطالب والمعلم على مدار الساعة.
            </p>

            {/* Interactive Query Simulator Box */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  اختبر المساعد الذكي مباشرة بسؤال تجريبي:
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold">
                  استجابة فورية
                </span>
              </div>

              {/* Preset Question Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presetQuestions.map((pq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskQuestion(pq.q, pq.a)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 text-right transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between group"
                  >
                    <span className="line-clamp-1">{pq.q}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0 mr-2">
                      {pq.category}
                    </Badge>
                  </button>
                ))}
              </div>

              {/* Custom Input Bar */}
              <div className="flex items-center gap-2 pt-2">
                <Input
                  value={activeQuery}
                  onChange={(e) => setActiveQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomQuery()}
                  placeholder="أو اكتب سؤالك الأكاديمي أو استفسارك هنا..."
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs sm:text-sm rounded-xl"
                />
                <Button
                  onClick={handleCustomQuery}
                  disabled={isTyping || !activeQuery.trim()}
                  className="rounded-xl px-4 bg-purple-600 hover:bg-purple-700 text-white shrink-0 font-bold text-xs"
                >
                  {isTyping ? 'جاري التفكير...' : 'اسأل'}
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                </Button>
              </div>

              {/* AI Answer Display */}
              <AnimatePresence>
                {aiAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        إجابة المساعد الذكي:
                      </span>
                      <span className="text-[10px] text-slate-400">نموذج ذروة المعرفي</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                      {aiAnswer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Specialized Assistants Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                المساعدون الأذكياء المتاحون
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                اختر المساعد المتخصص للدخول إلى جلسته الحوارية وأدواته العملية
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              6 أنظمة ذكية متخصصة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assistants.map((ast, index) => {
              const Icon = ast.icon;
              return (
                <motion.div
                  key={ast.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  whileHover={{ y: -6 }}
                  onClick={() => {
                    playSound();
                    navigate(ast.link);
                  }}
                  className={`group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl border ${ast.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden p-6 sm:p-7`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ast.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>

                      <div className="text-left">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {ast.badge}
                        </span>
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {ast.title}
                      </h3>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                        {ast.subtitle}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {ast.description}
                    </p>

                    {/* Features checklist */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      {ast.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Launch action footer */}
                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:underline">
                      بدء المحادثة والاستشارة
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIAssistantSection;