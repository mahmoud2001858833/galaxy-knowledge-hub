import React, { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Cpu, 
  Compass, 
  Atom, 
  HeartHandshake, 
  Puzzle, 
  Video, 
  Brain, 
  CalendarDays, 
  MessageSquare, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  Stethoscope, 
  Leaf, 
  BookMarked,
  Code2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import simulationsBg from '@/assets/simulations-3d-section.jpg';
import roboticsBg from '@/assets/robotics-ai-section.jpg';
import damijBg from '@/assets/damij-section.jpg';
import educationBg from '@/assets/education-section.jpg';
import aiAssistantBg from '@/assets/ai-assistant-section.jpg';
import sourcesLibraryBg from '@/assets/sources-library-section.jpg';

const clickSound = '/message-notification.mp3';

interface EducationalPlatform {
  id: string;
  title: string;
  category: 'stem' | 'btec' | 'tech' | 'skills' | 'support';
  categoryLabel: string;
  badge: string;
  description: string;
  icon: string;
  color: string;
  bgLight: string;
  borderColor: string;
  link: string;
  features: string[];
}

const EducationSection: React.FC = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const playSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch {
      // Ignore audio autoplay restrictions
    }
  };

  let dir = 'rtl';
  try {
    const lang = useLanguage();
    if (lang && lang.dir) dir = lang.dir;
  } catch {
    dir = 'rtl';
  }

  const platforms: EducationalPlatform[] = [
    {
      id: 'simulations',
      title: 'المختبرات والمحاكاة 3D',
      category: 'stem',
      categoryLabel: 'مختبرات وتجارب STEM',
      badge: '49 مختبراً تفاعلياً',
      description: 'أكبر مكتبة للمختبرات الافتراضية ثلاثية الأبعاد: ميكانيكا الكم، النسبية، تعديل الجينات CRISPR، الدوائر الكهربائية، والكيمياء العضوية.',
      icon: '🔬',
      color: 'from-cyan-600 to-blue-600',
      bgLight: 'bg-cyan-50 dark:bg-cyan-950/20',
      borderColor: 'border-cyan-200 dark:border-cyan-800/40',
      link: '/experiments-section',
      features: ['فيزياء ذرية وكمية', 'كيمياء تفاعلية وتفاعلات حية', 'أحياء وهندسة جينات', 'رياضيات وحساب التفاضل']
    },
    {
      id: 'btec',
      title: 'مسارات بتك BTEC المهنية',
      category: 'btec',
      categoryLabel: 'التعليم المهني والتقني',
      badge: 'معايير Pearson الدولية',
      description: 'بوابة التعليم المهني المعتمد: تكنولوجيا المعلومات، هندسة البرمجيات، الفن والتصميم، وإدارة الأعمال بمشاريع عملية واقعية.',
      icon: '💻',
      color: 'from-blue-600 to-indigo-600',
      bgLight: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800/40',
      link: '/btec',
      features: ['تكنولوجيا المعلومات والبرمجة', 'الهندسة والروبوتات الميكانيكية', 'الفن والتصميم الرقمي', 'إدارة المشاريع والريادة']
    },
    {
      id: 'robotics',
      title: 'الروبوتات والذكاء الاصطناعي 2.0',
      category: 'tech',
      categoryLabel: 'الهندسة والتقنيات الذكية',
      badge: 'أنظمة ROS2 & LiDAR',
      description: 'بيئة هندسية تحاكي حركيات الأذرع الروبوتية المتقدمة (Kinematics)، أجهزة استشعار LiDAR 360°، وبرمجة متحكمات ROS2 بلغة Python.',
      icon: '🤖',
      color: 'from-indigo-600 to-purple-600',
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800/40',
      link: '/robotics-section',
      features: ['تحريك الأذرع الروبوتية 6-DOF', 'رسم الخرائط بالـ LiDAR', 'برمجة ROS2 التفاعلية', 'تتبع المسارات الذكي']
    },
    {
      id: 'damij',
      title: 'منصة دامج — التعليم الخاص والدمج',
      category: 'support',
      categoryLabel: 'التربية الخاصة والشمولية',
      badge: 'مبادرة شمولية وطنية',
      description: 'المنصة الوطنية للدمج: كاشف لغة الإشارة بالكاميرا، مترجم برايل اللمسي والصوتي، أدوات دعم طيف التوحد، واختبارات فرط الحركة ADHD مع المكتبة العلمية المعتمدة.',
      icon: '🤝',
      color: 'from-teal-600 to-emerald-600',
      bgLight: 'bg-teal-50 dark:bg-teal-950/20',
      borderColor: 'border-teal-200 dark:border-teal-800/40',
      link: '/damij',
      features: ['مترجم لغة الإشارة بالكاميرا', 'نظام برايل التفاعلي', 'دعم التوحد وتشتت الانتباه ADHD', 'المكتبة العلمية والمصادر الموثقة']
    },
    {
      id: 'ai-assistant',
      title: 'المرشد الذكي والذكاء الاصطناعي',
      category: 'tech',
      categoryLabel: 'المساعدون الأذكياء',
      badge: 'دعم ذكي 24/7',
      description: 'مركز المساعدين الموجهين: المرشد النفسي لتنظيم القلق، فلك المعرفة للنظريات العلمية، ومساعد تصحيح الأكواد والرياضيات.',
      icon: '🧠',
      color: 'from-violet-600 to-purple-600',
      bgLight: 'bg-violet-50 dark:bg-violet-950/20',
      borderColor: 'border-violet-200 dark:border-violet-800/40',
      link: '/ai-assistant-section',
      features: ['مرشد نفسي لتنظيم الضغط والامتحانات', 'فلك المعرفة للعلوم والفضاء', 'مساعد تصحيح الأكواد والحلول', 'توجيه أكاديمي شخصي']
    },
    {
      id: 'medical-assistant',
      title: 'المساعد الطبي المدرسي المتقدم',
      category: 'support',
      categoryLabel: 'الصحة المدرسية والطوارئ',
      badge: 'بروتوكولات طوارئ فورية',
      description: 'دليل تفاعلي شامل لإسعاف الحالات المدرسية الطارئة، فحص فوري بالكاميرا، وإرشادات سريعة ليعرف الطالب والمعلم كيفية التصرف بدقة وثقة.',
      icon: '🩺',
      color: 'from-rose-600 to-red-600',
      bgLight: 'bg-rose-50 dark:bg-rose-950/20',
      borderColor: 'border-rose-200 dark:border-rose-800/40',
      link: '/medical-assistant',
      features: ['كاشف الحالات بالكاميرا', 'بروتوكولات الإسعافات الأولية', 'إرشادات فورية للطالب والمعلم', 'أرقام الطوارئ السريعة']
    },
    {
      id: 'subject-puzzles',
      title: 'بنك ودوري الألغاز والتحديات',
      category: 'skills',
      categoryLabel: 'التفكير النقدي والتنافس',
      badge: 'تحديات ذكاء متجددة',
      description: 'ألغاز علمية وفكرية مشوقة في الرياضيات، الفيزياء، الكيمياء، والمنطق مع نظام أوسمة ونقاط لتعزيز روح المنافسة الأكاديمية.',
      icon: '🧩',
      color: 'from-amber-600 to-yellow-600',
      bgLight: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-800/40',
      link: '/subject-puzzles',
      features: ['ألغاز رياضية ومنطقية', 'تحديات فيزيائية تفاعلية', 'لوحة صدارة الأبطال', 'نقاط خبرة وأوسمة تميز']
    },
    {
      id: 'environmental',
      title: 'الاستدامة البيئية والطاقة البديلة',
      category: 'stem',
      categoryLabel: 'البيئة والعلوم التطبيقية',
      badge: 'مشاريع ومبادرات خضراء',
      description: 'حساب البصمة الكربونية، مشاريع إعادة التدوير المدرسية والمنزلية، ونماذج محاكاة الطاقة الشمسية والرياح من أجل كوكب مستدام.',
      icon: '🌱',
      color: 'from-emerald-500 to-green-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800/40',
      link: '/environmental-sustainability',
      features: ['حاسبة البصمة الكربونية', 'مشاريع إعادة التدوير المدرسية', 'محاكاة الطاقة المتجددة', 'مؤشر الاستدامة الشخصي']
    },
    {
      id: 'literary',
      title: 'المنصات الأدبية واللغات',
      category: 'skills',
      categoryLabel: 'اللغات والآداب',
      badge: 'اللغة العربية والإنجليزية',
      description: 'منصات إثرائية لتعلم النحو، البلاغة، الأدب العربي، وقواعد اللغة الإنجليزية مع تمارين تفاعلية ونصوص أدبية محللة بدقة.',
      icon: '📚',
      color: 'from-purple-600 to-pink-600',
      bgLight: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800/40',
      link: '/literary-platforms',
      features: ['قواعد النحو والإعراب التفاعلي', 'تحليل النصوص الأدبية', 'تدريبات اللغة الإنجليزية المتدرجة', 'معاجم وبلاغة لغوية']
    },
    {
      id: 'visual-library',
      title: 'المكتبة البصرية العلمية 3D',
      category: 'stem',
      categoryLabel: 'المكتبات والمراجع المرئية',
      badge: 'مخططات ومجسمات ثلاثية الأبعاد',
      description: 'أرشيف بصري ضخم يضم رسومات ثلاثية الأبعاد، مخططات توضيحية عالية الدقة، ورسوم بيانية تشرح أعقد النظريات بطريقة بصرية ممتعة.',
      icon: '👁️',
      color: 'from-blue-500 to-cyan-600',
      bgLight: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800/40',
      link: '/visual-library',
      features: ['تشريح الأعضاء والخلايا 3D', 'مخططات التركيب الذري والجزيئي', 'رسوم متحركة للنظريات الكونية', 'تحميل المخططات بجودة عالية']
    },
    {
      id: 'spaced-repetition',
      title: 'نظام المراجعة الذكي Spaced Repetition',
      category: 'skills',
      categoryLabel: 'استراتيجيات الاستذكار',
      badge: 'خوارزمية مكافحة النسيان',
      description: 'نظام علمي قائم على منحنى النسيان (Ebbinghaus) يجدول مراجعاتك في الأوقات المثالية لترسيخ المعلومات في الذاكرة طويلة المدى.',
      icon: '⏱️',
      color: 'from-indigo-500 to-violet-600',
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800/40',
      link: '/spaced-repetition',
      features: ['خوارزمية SM-2 العلمية', 'بطاقات استذكار ذكية (Flashcards)', 'تنبيهات المراجعة الدورية', 'إحصائيات قوة الذاكرة']
    },
    {
      id: 'community-forum',
      title: 'منتدى مجتمع الطلبة التفاعلي',
      category: 'support',
      categoryLabel: 'التعلم التشاركي والأقران',
      badge: 'مجتمع أكاديمي نشط',
      description: 'مساحة تفاعلية آمنة تجمع الطلاب لمناقشة المسائل المعقدة، تبادل الملاحظات الدراسية، وطرح الاستفسارات بمساعدة نخبة المعلمين.',
      icon: '💬',
      color: 'from-sky-600 to-blue-700',
      bgLight: 'bg-sky-50 dark:bg-sky-950/20',
      borderColor: 'border-sky-200 dark:border-sky-800/40',
      link: '/student-community-forum',
      features: ['غرف نقاش علمية متخصصة', 'تبادل التلخيصات والملاحظات', 'إشراف معلمين معتمدين', 'طرح ومناقشة المسائل الصعبة']
    },
    {
      id: 'scientific-journal',
      title: 'المجلة العلمية والأبحاث المحكمة',
      category: 'stem',
      categoryLabel: 'الأبحاث والإنتاج العلمي',
      badge: 'مقالات وأوراق علمية',
      description: 'نافذة علمية دورية تنشر مقالات مبسطة للأبحاث المعاصرة في الذكاء الاصطناعي، الفلك، الطاقة المتجددة، والعلوم الحيوية.',
      icon: '📖',
      color: 'from-slate-700 to-slate-900',
      bgLight: 'bg-slate-50 dark:bg-slate-800/20',
      borderColor: 'border-slate-300 dark:border-slate-700',
      link: '/scientific-journal',
      features: ['أحدث اكتشافات الفلك والفيزياء', 'تطبيقات الذكاء الاصطناعي المعاصرة', 'مقالات بقلم أساتذة ومختصين', 'أرشيف أبحاث قابل للبحث']
    },
    {
      id: 'study-organization',
      title: 'منظم ومخطط الدراسة التفاعلي',
      category: 'skills',
      categoryLabel: 'إدارة الوقت والتفوق',
      badge: 'تنظيم الحصص والمهام',
      description: 'أداة مرنة لبناء جدول مذاكرة متوازن، تتبع إنجاز المهام والواجبات اليومية، وتحديد أهداف دراسية أسبوعية قابلة للقياس.',
      icon: '📅',
      color: 'from-purple-500 to-indigo-600',
      bgLight: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800/40',
      link: '/study-organization',
      features: ['صانع جداول المذاكرة الذكية', 'قائمة مهام يومية وأسبوعية', 'مؤقت بومودورو للتركيز', 'تقارير الإنجاز الأكاديمي']
    }
  ];

  const filteredPlatforms = useMemo(() => {
    return platforms.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
      );
      return matchesCategory && matchesSearch;
    });
  }, [platforms, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060919] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300" dir={dir}>
      <SEO
        title="بوابة المنصات والمسارات الأكاديمية الشاملة | ذروة العلم"
        description="استكشف جميع أقسام ومنصات ذروة العلم: المختبرات العلمية 3D، مسارات BTEC المهنية، الروبوتات والذكاء الاصطناعي، منصة دامج، المرشد الذكي، والمساعد الطبي المدرسي."
        keywords="تعليم شامل, BTEC, محاكاة علمية 3D, روبوتات, ذكاء اصطناعي, دامج, مرشد نفسي, مساعد طبي مدرسي, استدامة بيئية, ذروة العلم"
      />
      <Navbar />
      <audio ref={audioRef} src={clickSound} preload="auto" />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            قسم التعليم والمسارات الأكاديمية الشاملة
          </span>
        </div>

        {/* Section Title Banner */}
        <div className="relative rounded-3xl p-6 sm:p-10 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden text-center sm:text-right">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>المنظومة الأكاديمية والمهنية المتكاملة (14 منصة ومساراً)</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              بوابة المنصات والمسارات التعليمية المتقدمة
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              اختر مسارك الأكاديمي للاستفادة من المناهج الرقمية المعززة بالمحاكاة ثلاثية الأبعاد، أدوات الذكاء الاصطناعي التفاعلية، مسارات BTEC المهنية، وتقنيات الشمولية مع مشروع دامج.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <div className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400">14 منصة</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">مسارات ومختبرات تخصصية</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">49 مختبراً</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">محاكاة 3D معتمدة</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">BTEC Pearson</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">تعليم مهني تطبيقي</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">100% شمولية</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">مشروع دامج للتربية الخاصة</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Segmented Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
              }`}
            >
              جميع المنصات ({platforms.length})
            </button>
            <button
              onClick={() => setSelectedCategory('stem')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === 'stem'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
              }`}
            >
              🔬 المختبرات والعلوم (STEM)
            </button>
            <button
              onClick={() => setSelectedCategory('btec')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === 'btec'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
              }`}
            >
              💻 مسارات بتك BTEC
            </button>
            <button
              onClick={() => setSelectedCategory('tech')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === 'tech'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
              }`}
            >
              🤖 الذكاء الاصطناعي والروبوتات
            </button>
            <button
              onClick={() => setSelectedCategory('skills')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === 'skills'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
              }`}
            >
              🧩 المهارات والتنافس
            </button>
            <button
              onClick={() => setSelectedCategory('support')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === 'support'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
              }`}
            >
              🤝 الرعاية والدمج
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المنصات أو المسارات..."
              className="ps-9 pe-4 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredPlatforms.map((platform, index) => (
              <motion.div
                key={platform.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                whileHover={{ y: -5 }}
                onClick={() => {
                  playSound();
                  navigate(platform.link);
                }}
                className={`group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl border ${platform.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden p-6`}
              >
                <div>
                  {/* Top Bar with Icon and Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm">
                      {platform.icon}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {platform.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {platform.categoryLabel}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2 mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {platform.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {platform.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 mb-6">
                    {platform.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Launch Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:underline">
                    استكشف المسار الآن
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-cyan-600 group-hover:text-white transition-colors flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state if search has no results */}
        {filteredPlatforms.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              لم نتمكن من العثور على أي نتائج مطابقة
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              جرب البحث بكلمات أخرى أو قم بإلغاء الفلتر لعرض جميع المنصات.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              variant="outline"
              className="rounded-xl mt-2 text-xs"
            >
              عرض جميع المنصات
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EducationSection;