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
  ChevronRight,
  Flame,
  Volume2,
  VolumeX,
  Layers,
  GraduationCap,
  Shield,
  Activity,
  Smile
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { resilientStreamingService } from '@/services/resilientStreamingService';
import { SIMULATION_REGISTRY } from '@/components/PlatformGuideAssistant';

interface AIAssistantCard {
  id: string;
  category: 'psychology' | 'science' | 'tech' | 'medical';
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
  featured?: boolean;
  features: string[];
}

export const AIAssistantSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'all' | 'psychology' | 'science' | 'tech' | 'medical'>('all');
  const [activeQuery, setActiveQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [answeredTopic, setAnsweredTopic] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [thoughtStep, setThoughtStep] = useState<string | null>(null);
  const [matchedSimulation, setMatchedSimulation] = useState<any | null>(null);

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
      category: 'psychology',
      title: "مرشدك النفسي الذكي (واحة السكينة)",
      subtitle: "Emotional Wellbeing & CBT Guide",
      badge: "دعم وجداني • تنظيم قلق الامتحانات",
      icon: Heart,
      featured: true,
      description: "منظومة إرشاد نفسي متقدمة قائمة على العلاج المعرفي السلوكي (CBT) وعلم النفس العصبي. تساعدك في تفريغ الضغط الدراسي، خفض قلق الامتحانات، استعادة التركيز، وممارسة تقنيات التنفس والتأريض الحسي.",
      color: "from-teal-500 via-emerald-600 to-cyan-600",
      gradient: "from-teal-600/20 via-emerald-600/10 to-transparent",
      bgLight: "bg-teal-50 dark:bg-teal-950/20",
      borderColor: "border-teal-300 dark:border-teal-700/50",
      link: "/psychological-guide",
      features: [
        "تمارين التنفس الصندوقي 4-4-4-4 مع مؤشر بصري وصوتي حي",
        "بروتوكول التأريض الحسي 5-4-3-2-1 لإيقاف نوبات الهلع الفورية",
        "مختبر إعادة التأطير المعرفي لتبديد الأفكار الانهزامية السامة",
        "آيات السكينة والتأمل القلبي بدون موسيقى لراحة النفس"
      ]
    },
    {
      id: 'falak',
      category: 'science',
      title: "فلك المعرفة والذكاء العلمي",
      subtitle: "Scientific & Astronomical AI Tutor",
      badge: "الفيزياء الكونية والعلوم المتقدمة",
      icon: Sparkles,
      description: "رفيقك العلمي الذكي لشرح أعمق النظريات في الفيزياء الكونية، النسبية، ميكانيكا الكم، والربط التفاعلي المباشر مع مختبرات الـ 3D والمناهج المدرسية والجامعية.",
      color: "from-indigo-500 via-cyan-600 to-blue-600",
      gradient: "from-indigo-600/20 via-cyan-600/10 to-transparent",
      bgLight: "bg-indigo-50 dark:bg-indigo-950/20",
      borderColor: "border-indigo-300 dark:border-indigo-800/40",
      link: "/falak-knowledge-ai",
      features: [
        "تفسير المفاهيم الفيزيائية خطوة بخطوة بالمعادلات الرياضية",
        "تحليل صور ومعادلات المناهج المدرسية عبر الرؤية الحاسوبية",
        "ربط فوري بالمختبرات ثلاثية الأبعاد لمحاكاة التجربة عملياً",
        "توليد أسئلة بلوم المتدرجة للاختبار الذاتي الفوري"
      ]
    },
    {
      id: 'medical',
      category: 'medical',
      title: "المساعد الطبي المدرسي الذكي",
      subtitle: "School Health & Emergency First-Aid AI",
      badge: "إسعافات وطوارئ فورية 24/7",
      icon: Stethoscope,
      description: "مساعد صحي وإسعافي موجه للطلاب والمعلمين للتعامل الفوري مع الحالات المدرسية الطارئة (رعاف، إغماء، جروح، تشنجات، حساسية) مع ميزة التشخيص الإرشادي بالكاميرا.",
      color: "from-red-500 via-rose-600 to-amber-600",
      gradient: "from-red-600/20 via-rose-600/10 to-transparent",
      bgLight: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-300 dark:border-red-800/40",
      link: "/medical-assistant",
      features: [
        "كاشف الحالات الطارئة عبر الرؤية الحاسوبية والكاميرا",
        "إرشادات تفصيلية واضحة خطوة بخطوة للطالب والمعلم",
        "بروتوكولات الإسعافات الأولية المعتمدة طبياً",
        "أرقام الطوارئ السريعة وتنبيه المشرف الصحي"
      ]
    },
    {
      id: 'code-fixer',
      category: 'tech',
      title: "مصحح الأكواد والبرمجة بالذكاء الاصطناعي",
      subtitle: "BTEC & Advanced Code Debugger",
      badge: "برمجة وهندسة برمجيات BTEC",
      icon: Code2,
      description: "مساعد متخصص لطلبة BTEC ومبرمجي المستقبل لاكتشاف الأخطاء وتصحيحها فورياً، وتحليل كفاءة الخوارزميات وشرح الشيفرات بلغات Python، JavaScript، C++ وSQL.",
      color: "from-blue-500 via-cyan-600 to-teal-600",
      gradient: "from-blue-600/20 via-cyan-600/10 to-transparent",
      bgLight: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-300 dark:border-blue-800/40",
      link: "/btec/it/code-fixer",
      features: [
        "تصحيح أخطاء الـ Syntax والـ Logic مع الشرح التعليمي",
        "تحويل المنطق الرياضي إلى شيفرة برمجية نظيفة",
        "شرح الكود سطراً بسطر مع نصائح الأداء والذاكرة",
        "توليد اختبارات الوحدة (Unit Tests) للمشاريع الطلابية"
      ]
    },
    {
      id: 'robotics-ai',
      category: 'tech',
      title: "مساعد الروبوتات والأنظمة الذكية",
      subtitle: "Robotics & Kinematics AI CoPilot",
      badge: "أنظمة ROS2 & LiDAR والميكانيكا",
      icon: Cpu,
      description: "مساعد هندسي متقدم يدعم حسابات حركيات الأذرع الروبوتية (Forward/Inverse Kinematics)، تحليل سحب النقاط من مستشعرات الـ LiDAR، وبرمجة متحكمات الروبوت الذاتية.",
      color: "from-amber-500 via-orange-600 to-yellow-600",
      gradient: "from-amber-600/20 via-orange-600/10 to-transparent",
      bgLight: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-300 dark:border-amber-800/40",
      link: "/robotics-section",
      features: [
        "توليد ومراجعة نصوص برمجية للـ ROS2 وبايثون",
        "حساب المصفوفات الحركية المعقدة للأذرع 6-DOF",
        "تفسير قراءات الخرائط والملاحة وتفادي العوائق",
        "إرشادات توصيل الدوائر والمحركات السيرفو ومتحكمات ESP32"
      ]
    },
    {
      id: 'sign-ai',
      category: 'medical',
      title: "مترجم لغة الإشارة بالرؤية الحاسوبية",
      subtitle: "Damij AI Sign Vision & Inclusion",
      badge: "دامج للتعليم الشامل والتربية الخاصة",
      icon: Eye,
      description: "تقنية رؤية حاسوبية رائدة تتعرف على حركات وإيماءات اليد والأصابع عبر الكاميرا وتحولها فورياً إلى نصوص عربية مفهومة لتسهيل التواصل والدمج المدرسي الشامل.",
      color: "from-teal-500 via-emerald-600 to-cyan-600",
      gradient: "from-teal-600/20 via-emerald-600/10 to-transparent",
      bgLight: "bg-teal-50 dark:bg-teal-950/20",
      borderColor: "border-teal-300 dark:border-teal-800/40",
      link: "/damij/sign",
      features: [
        "كشف فوري للإيماءات عبر كاميرا الويب بدون أي تأخير",
        "قاموس إشاري عربي متكامل ونماذج ثلاثية الأبعاد",
        "معالجة محلية بالكامل على جهاز المستخدم لحماية الخصوصية",
        "مطابقة كاملة لمعايير الشمولية الرقمية WCAG 2.1 AA"
      ]
    }
  ];

  const presetQuestions = [
    {
      q: "أشعر برهبة وتوتر شديد قبل امتحان التوجيهي، كيف أهدئ عقلي فورياً؟",
      category: "المرشد النفسي",
      assistantId: 'psychological',
      a: "أهلاً بك يا بطل 💙 توترك رد فعل طبيعي يدل على حرصك ونبل هدفك، لكنه يحتاج توجيهاً لطيفاً.\n\nإليك خطة الـ 3 دقائق الآن:\n1. طبّق «التنفس الصندوقي 4-4-4-4»: شهيق 4 ثوانٍ، احبس 4 ثوانٍ، زفير 4 ثوانٍ، سكون 4 ثوانٍ (كررها 3 مرات).\n2. اشرب كوب ماء بارد: يخفض هرمون الكورتيزول ويوقف استجابة القتال أو الهروب في دماغك.\n3. تذكّر: الامتحان يقيس تحصيلك في يوم معين ولا يحدد قيمتك الإنسانية.\n\nانقر على زر «مرشدك النفسي» الآن لنبدأ معاً جلسة هدوء كاملة ومخصصة لأجلك!"
    },
    {
      q: "ما هو تمدد الزمن وفق النظرية النسبية الخاصة لأينشتاين؟",
      category: "فلك المعرفة",
      assistantId: 'falak',
      a: "تمدد الزمن (Time Dilation) ظاهرة حقيقية مثبتة علمياً، تنص على أن الساعة المتحركة بالنسبة لمراقب ساكن تدق بمعدل أبطأ كلما اقتربت سرعتها من سرعة الضوء \\( c \\).\n\nالمعادلة الرياضية وفق تحويلات لورنتز:\n\\[ \\Delta t' = \\frac{\\Delta t}{\\sqrt{1 - v^2/c^2}} \\]\n\nيمكنك الآن استكشاف هذه الظاهرة عملياً في محاكاة النسبية الخاصة ومصادم الهدرونات في منصتنا!"
    },
    {
      q: "ما هو التصرف الصحيح الفوري عند حدوث إغماء أو دوخة مفاجئة لطالب؟",
      category: "المساعد الطبي",
      assistantId: 'medical',
      a: "1. ضع المصاب مستلقياً على ظهره وارفع ساقيه للأعلى بزاوية 30 درجة (حوالي 30 سم) لتدفق الدم للمخ.\n2. أرخِ أي ملابس ضيقة حول العنق والصدر، وتأكد من وجود تهوية جيدة.\n3. لا تعطِ المصاب أي ماء أو طعام وهو فاقد للوعي لمنع الاختناق.\n4. إذا لم يستعد وعيه خلال دقيقة واحدة، اتصل بالطوارئ فوراً. راجع دليل الإسعافات في «المساعد الطبي المدرسي»."
    },
    {
      q: "كيف أكتب كود البحث الثنائي Binary Search بلغة بايثون بكفاءة؟",
      category: "مصحح الأكواد BTEC",
      assistantId: 'code-fixer',
      a: "البحث الثنائي يمتلك تعقيداً زمنياً فائق السرعة \\( O(\\log n) \\) ويعمل على القوائم المرتبة.\n\n```python\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n```\nيمكنك لصق كودك في «مصحح الأكواد BTEC» لتشغيله وتصحيح أي أخطاء سطراً بسطر!"
    }
  ];

  const handleAskQuestion = (question: string, _fallbackAnswer?: string) => {
    setActiveQuery(question);
    handleCustomQuery(question);
  };

  const handleCustomQuery = async (overrideText?: string) => {
    const textToAsk = (overrideText || activeQuery).trim();
    if (!textToAsk) return;

    setActiveQuery(textToAsk);
    setIsTyping(true);
    setAiAnswer('');
    setAnsweredTopic(textToAsk);
    setThoughtStep('استيعاب السؤال وتحديد الإطار الأكاديمي والمنهجي...');

    // Detect matched simulation from platform catalog
    const lower = textToAsk.toLowerCase();
    const foundSim = SIMULATION_REGISTRY.find(sim =>
      sim.tags?.some(tag => lower.includes(tag.toLowerCase())) ||
      lower.includes(sim.title.toLowerCase())
    );
    setMatchedSimulation(foundSim || null);

    const systemInstruction = `أنت "المرشد الذكي الشامل" (Omniscient Academic Mentor) في منصة "ذروة العلم 2.0" بمدرسة عنبه الثانوية الشاملة للبنين (وزارة التربية والتعليم، الأردن).
قواعد التفكير والإجابة الصارمة:
1. التفكير العميق والتفصيل المخصص 100%: اقرأ سؤال المستخدم بعناية وأجب عنه بإجابة علمية حقيقية، راقية، وذكية مصممة خصيصاً لسؤاله. لا تستخدم قوالب مسبقة أو ردوداً سطحية عامة.
2. التنسيق الأكاديمي المنهجي:
   - ابدأ بفقرة تمهيدية راقية تحدد المفهوم وجوهره بدقة.
   - إذا كان السؤال عن الفيزياء، الكيمياء، الرياضيات، أو الفلك: استخرج القوانين بالرموز الرياضية المنظمة، واشرح الخطوات بدقة مع مثال واقعي أو تطبيق عملي.
   - إذا كان استفساراً برمجياً: اعرض الكود نظيفاً مع التعليقات وبيان التعقيد الزمني والمكاني.
   - إذا كان سؤالاً نفسياً أو عن قلق الامتحانات: أجب بتعاطف علمي رصين مبني على العلاج المعرفي السلوكي (CBT) وخطوات عملية محددة.
   - إذا كان سؤالاً طبياً أو إسعافياً: أجب بدقة بروتوكولات الإسعاف الأولي المعتمدة.
3. اختتم بنصيحة ذكية موجهة وسؤال تحفيزي لطيف يفتح آفاق تفكير الطالب.
اللغة: لغة عربية فصحى أنيقة، محكمة، وسلسة.`;

    try {
      setThoughtStep('تحليل المفاهيم واستحضار النماذج العلمية والتطبيقات...');

      await resilientStreamingService.streamAI({
        prompt: textToAsk,
        systemInstruction,
        onChunk: (_delta, fullText) => {
          setThoughtStep(null);
          setAiAnswer(fullText);
        },
        onComplete: (full) => {
          setAiAnswer(full);
          setThoughtStep(null);
          setIsTyping(false);
        }
      });
    } catch (err) {
      console.error('Error generating AI answer:', err);
      setThoughtStep(null);
      setIsTyping(false);
      setAiAnswer('عذراً، حدث تعثر مؤقت أثناء استدعاء المحرك التوليدي. يرجى إعادة المحاولة.');
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_\\()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const filteredAssistants = activeCategory === 'all'
    ? assistants
    : assistants.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060818] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300" dir={dir}>
      <SEO
        title="مركز المساعدين الأذكياء والذكاء الاصطناعي | منصة ذروة العلم"
        description="مركز الذكاء الاصطناعي الشامل في منصة ذروة العلم: المرشد النفسي لتنظيم القلق وتفريغ التوتر، فلك المعرفة للعلوم والفضاء، المساعد الطبي المدرسي، ومصحح الأكواد البرمجية."
        keywords="مرشد ذكي, مرشد نفسي, ذكاء اصطناعي, فلك المعرفة, مساعد طبي مدرسي, تصحيح الأكواد, ذروة العلم"
      />
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            مركز المساعدين الأذكياء والمرشد التفاعلي
          </span>
        </div>

        {/* Hero Banner with Futuristic AI Glassmorphism */}
        <section className="relative rounded-3xl p-6 sm:p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-cyan-500/20 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-500/10 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>منظومة المرشد الذكي والمساعدين التخصصيين 2.0</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
                مركز{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
                  المرشد الذكي
                </span>{' '}
                والمساعدين الأكاديميين
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed font-normal max-w-3xl">
                بوابتك التفاعلية لمساعدين أذكياء مخصصين للدعم النفسي، استكشاف العلوم، الإسعاف المدرسي، تصحيح الأكواد، وأنظمة الروبوتات والشمولية؛ مصممة بعناية لتجيب على تساؤلاتك وتصحبك خطوة بخطوة نحو التفوق وراحة البال.
              </p>
            </div>

            {/* Quick Live Telemetry Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono" dir="ltr">25+</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">أداة ونموذج ذكي</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono" dir="ltr">&lt; 28ms</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">زمن الاستجابة</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono" dir="ltr">100%</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">خصوصية وأمان تام</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono" dir="ltr">CBT & AI</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">دعم معرفي ونفسي</div>
              </div>
            </div>
          </div>
        </section>

        {/* SPECIAL SPOTLIGHT: المرشد النفسي والوجداني (Hero Spotlight Banner) */}
        <section className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-teal-950/60 via-slate-900 to-cyan-950/60 border border-teal-500/30 shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-lg shrink-0">
                <Heart className="w-8 h-8 animate-pulse text-cyan-200" />
              </div>
              <div className="space-y-1.5 text-right">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-bold">
                  <span>مساحتك الآمنة للتفريغ والسكينة</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  مرشدك النفسي الذكي: خفف توتر الامتحانات واستعد هدوءك في دقائق
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                  جلسة إرشادية تفاعلية قائمة على العلاج المعرفي السلوكي (CBT)، مزودة بتمارين التنفس الصندوقي 4-4-4-4، التأريض الحسي 5-4-3-2-1، وآيات السكينة لخفض التوتر والقلق الدراسي.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto justify-end">
              <Button
                onClick={() => navigate('/psychological-guide')}
                className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm px-6 h-12 shadow-lg flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                <span>دخول جلسة الإرشاد النفسي</span>
                <ArrowLeft className="w-4 h-4 rtl:rotate-0 rotate-180" />
              </Button>
            </div>
          </div>
        </section>

        {/* Interactive Query Simulator Playground */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>المختبر التفاعلي للاستفسارات الفورية</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                جرّب طرح أي سؤال أكاديمي أو استشارة نفسية أو استفسار برمجي واشهد دقة الاستجابة وسرعتها.
              </p>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold font-mono">
              محرك ذروة المعرفي 2.0
            </span>
          </div>

          {/* Preset Questions Chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              نماذج أسئلة شائعة للاختبار السريع:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {presetQuestions.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskQuestion(pq.q, pq.a)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-slate-200/80 dark:border-slate-700 text-right transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between group shadow-sm"
                >
                  <span className="line-clamp-1">{pq.q}</span>
                  <Badge variant="outline" className="text-[10px] shrink-0 mr-2 bg-white dark:bg-slate-900 font-bold">
                    {pq.category}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input Bar */}
          <div className="flex items-center gap-2 pt-2">
            <Input
              value={activeQuery}
              onChange={(e) => setActiveQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomQuery()}
              placeholder="اكتب سؤالك الأكاديمي، استفسارك البرمجي، أو ما تشعر به هنا..."
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs sm:text-sm rounded-2xl h-12 px-4 focus:ring-2 focus:ring-cyan-500"
            />
            <Button
              onClick={handleCustomQuery}
              disabled={isTyping || !activeQuery.trim()}
              className="rounded-2xl px-5 h-12 bg-cyan-600 hover:bg-cyan-500 text-white shrink-0 font-bold text-xs gap-1.5 shadow-md"
            >
              {isTyping ? 'جاري التحليل...' : 'إرسال'}
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Thinking / Reasoning Indicator */}
          <AnimatePresence>
            {isTyping && thoughtStep && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2.5 text-xs text-indigo-700 dark:text-indigo-300 font-medium"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping shrink-0" />
                <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-bold">مسار التفكير والاستنباط العلمي:</span>
                <span className="animate-pulse">{thoughtStep}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Answer Card */}
          <AnimatePresence>
            {aiAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 sm:p-6 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-300/80 dark:border-cyan-800/50 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs font-bold text-cyan-700 dark:text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>إجابة المرشد الذكي الشامل:</span>
                    {answeredTopic && (
                      <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mr-1.5 hidden sm:inline">
                        (حول: {answeredTopic})
                      </span>
                    )}
                  </span>
                  
                  <button
                    onClick={() => speakText(aiAnswer)}
                    className="flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'إيقاف الصوت' : 'استماع صوتي'}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                  {aiAnswer}
                </p>

                {matchedSimulation && (
                  <div className="mt-4 pt-3 border-t border-cyan-200/60 dark:border-cyan-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-cyan-200/50 dark:border-cyan-800/30">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          🔬 مختبر ومحاكاة 3D مقترحة ذات صلة: {matchedSimulation.title}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {matchedSimulation.description}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={matchedSimulation.route}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shrink-0 transition-all shadow-sm flex items-center gap-1"
                    >
                      <span>تشغيل المختبر</span>
                      <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Category Filter Pills */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                المساعدون الأذكياء المتاحون
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                اختر المساعد المتخصص للدخول إلى جلسته الحوارية وأدواته العملية المتطورة
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar self-stretch sm:self-auto">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                الكل (6)
              </button>
              <button
                onClick={() => setActiveCategory('psychology')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'psychology'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                الإرشاد النفسي
              </button>
              <button
                onClick={() => setActiveCategory('science')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'science'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                العلوم والفيزياء
              </button>
              <button
                onClick={() => setActiveCategory('tech')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'tech'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                البرمجة والروبوتات BTEC
              </button>
              <button
                onClick={() => setActiveCategory('medical')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'medical'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                الصحة والشمولية
              </button>
            </div>
          </div>

          {/* Assistants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssistants.map((ast, index) => {
              const Icon = ast.icon;
              return (
                <motion.div
                  key={ast.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(ast.link)}
                  className={`group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl border ${ast.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden p-6 sm:p-7 ${
                    ast.featured ? 'ring-2 ring-rose-500/30' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ast.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>

                      <div className="text-left">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {ast.badge}
                        </span>
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
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
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Launch action footer */}
                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:underline">
                      بدء الجلسة والاستشارة
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-cyan-600 group-hover:text-white transition-colors flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <ArrowLeft className="w-4 h-4 rtl:rotate-0 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AIAssistantSection;