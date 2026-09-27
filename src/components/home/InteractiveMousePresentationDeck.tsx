import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Atom, 
  Cpu, 
  HeartHandshake, 
  GraduationCap, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  ArrowLeft, 
  Layers, 
  Compass, 
  Activity,
  Bot,
  ExternalLink,
  Presentation,
  CheckCircle2,
  MousePointer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface SlideData {
  id: string;
  tag: string;
  badgeColor: string;
  title: string;
  highlightText: string;
  description: string;
  bullets: string[];
  metrics: { label: string; value: string }[];
  actionLabel: string;
  actionUrl: string;
  icon: React.ElementType;
  gradient: string;
  accentColor: string;
  previewGraphic: {
    title: string;
    sub: string;
    pills: string[];
  };
}

const PRESENTATION_SLIDES: SlideData[] = [
  {
    id: 'vision-ecosystem',
    tag: 'الرؤية والمنظومة الوطنية',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    title: 'البنية الرقمية الرائدة في العالم العربي للتعليم التفاعلي 2.0',
    highlightText: 'ذروة العلم',
    description: 'منظومة وطنية رائدة متكاملة تجمع بين المحاكاة ثلاثية الأبعاد فائقة الدقة، الذكاء الاصطناعي التطبيقي، وحلول الشمولية والتربية الخاصة مع مسارات BTEC المهنية المعتمدة دولياً.',
    bullets: [
      'أكثر من 150,000 طالب وباحث يستفيدون من المنظومة',
      'دقة قياس فيزيائي وكيميائي تصل إلى 99.8%',
      'درع حماية مؤسسي A+ يتحمل 120,000+ مستخدم متزامن'
    ],
    metrics: [
      { label: 'مختبراً تفاعلياً 3D', value: '49+' },
      { label: 'دقة المحاكاة والقياس', value: '99.8%' },
      { label: 'شمولية رقمية (دامج)', value: '100%' },
      { label: 'أداة ذكاء اصطناعي', value: '25+' }
    ],
    actionLabel: 'استكشاف المنظومة الشاملة',
    actionUrl: '/experiments-section',
    icon: Atom,
    gradient: 'from-blue-600/20 via-indigo-600/10 to-transparent',
    accentColor: '#3B82F6',
    previewGraphic: {
      title: 'محرك المحاكاة النووي والفيزيائي',
      sub: 'حسابات حركية وكهرومغناطيسية فورية',
      pills: ['Physics 3D', 'Quantum Mechanics', 'Relativity', 'Thermodynamics']
    }
  },
  {
    id: 'labs-simulations',
    tag: 'المختبرات والفيزياء 3D',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    title: 'مختبرات افتراضية تحاكي أحدث المراكز العلمية العالمية',
    highlightText: 'محاكاة ثلاثية الأبعاد',
    description: 'تمكّن الطلاب من إجراء التجارب المعقدة والخطرة افتراضياً، مثل مصادم الهدرونات الكبير LHC، التفاعلات النووية، الدوائر الكهربائية المتقدمة، وسلوك الجسيمات دون الذرية.',
    bullets: [
      'مختبرات مطابقة لمناهج وزارة التربية والتعليم وجامعات التكنولوجيا',
      'أجهزة قياس دقيقة حية: أوسيلوسكوب، ليزر، موازين رقمية',
      'إمكانية تصدير الرسوم البيانية والجداول والبيانات بصيغة CSV'
    ],
    metrics: [
      { label: 'تجارب تفاعلية حية', value: '49' },
      { label: 'فريمات الرسوميات', value: '60 FPS' },
      { label: 'تفاعل فيزيائي حقيقي', value: '100%' },
      { label: 'استجابة لحظية', value: '< 28ms' }
    ],
    actionLabel: 'دخول كتالوج المختبرات',
    actionUrl: '/experiments-section',
    icon: Compass,
    gradient: 'from-cyan-600/20 via-blue-600/10 to-transparent',
    accentColor: '#06B6D4',
    previewGraphic: {
      title: 'بيئة التجارب المعملية الرقمية',
      sub: 'معايرة لحظية للجهد والتيار والتردد',
      pills: ['LHC Collider', 'Hooke Law', 'Spectroscopy', 'Optics Lab']
    }
  },
  {
    id: 'ai-ecosystem',
    tag: 'الذكاء الاصطناعي التوليدي',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    title: 'أكثر من 25 أداة ذكاء اصطناعي وأتمتة مخصصة لخدمة الطالب والباحث',
    highlightText: 'المرشد والذكاء الاصطناعي',
    description: 'مساعدون أذكياء مدعومون بنماذج متقدمة (Gemini) يقدّمون شروحات موجهة بالمناهج الوطنية، توليد أسئلة تكيّفية، فحص امتحانات بالرؤية الحاسوبية OCR، وتصحيح الأكواد البرمجية.',
    bullets: [
      'المساعد الأردني المتخصص بالمناهج ومصادر التوجيهي المعتمدة',
      'مساعد فلك المعرفي للاستكشاف العلمي المتقدم',
      'مصحح الأكواد والبرمجيات لمسارات تكنولوجيا المعلومات'
    ],
    metrics: [
      { label: 'أدوات ذكاء اصطناعي', value: '25+' },
      { label: 'تغطية للمناهج', value: '100%' },
      { label: 'نماذج رؤية حاسوبية OCR', value: '3' },
      { label: 'دقة المرجع والتوثيق', value: '99.5%' }
    ],
    actionLabel: 'تجربة المرشد الذكي',
    actionUrl: '/ai-assistant-section',
    icon: Bot,
    gradient: 'from-purple-600/20 via-indigo-600/10 to-transparent',
    accentColor: '#A855F7',
    previewGraphic: {
      title: 'شبكة المساعدين الأكاديميين',
      sub: 'توليد أسئلة وشروحات فورية موثقة',
      pills: ['Falak AI', 'Jordanian Tutor', 'Code Fixer', 'Exam OCR']
    }
  },
  {
    id: 'damij-inclusion',
    tag: 'الشمولية والتربية الخاصة',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    title: 'أول منصة وطنية تدمج ذوي الإعاقة مع التعليم الأكاديمي المتطور',
    highlightText: 'مشروع دامج الوطني',
    description: 'حلول رائدة لخدمة المكفوفين بنظام برايل التفاعلي، الصم بمترجم لغة الإشارة بالذكاء الاصطناعي، وتشخيص ودعم أطفال التوحد واضطراب فرط الحركة وتشتت الانتباه (ADHD).',
    bullets: [
      'أداة العين المبصرة (Blind Eye Navigator) للمكفوفين وضعاف البصر',
      'مترجم لغة الإشارة العربي والرسوم الإشارية ثلاثية الأبعاد',
      'مقاييس تشخيصية سريرية وخطط علاج سلوكي معرفي فردية'
    ],
    metrics: [
      { label: 'شمولية رقمية معتمدة', value: '100%' },
      { label: 'محولات برايل ذكية', value: '4' },
      { label: 'معيار سهولة الوصول', value: 'WCAG 2.1' },
      { label: 'عزل وحماية السجلات', value: 'HIPAA' }
    ],
    actionLabel: 'استكشاف منصة دامج',
    actionUrl: '/damij',
    icon: HeartHandshake,
    gradient: 'from-teal-600/20 via-emerald-600/10 to-transparent',
    accentColor: '#14B8A6',
    previewGraphic: {
      title: 'بوابة الدمج والشمولية الرقمية',
      sub: 'تعليم تكيفي بحسب قدرات كل طالب',
      pills: ['Braille Hub', 'Sign Language', 'Autism Care', 'ADHD Suite']
    }
  },
  {
    id: 'btec-partnerships',
    tag: 'مسارات بتك والشراكة المؤسسية',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    title: 'جسر مهني وأكاديمي يربط المدارس والجامعات وسوق العمل التكنولوجي',
    highlightText: 'بتك BTEC والشراكات',
    description: 'بيئة تطبيقية لمسارات بتك BTEC في تكنولوجيا المعلومات والهندسة، مدعومة بمشاريع حية، وتوثيق رسمي للشراكة المؤسسية واعتماد الأمان السيبراني بدرجة A+ لتحمل 120k+ مستخدم.',
    bullets: [
      'حاضنة لمشاريع الطلاب البرمجية والحلول الابتكارية',
      'ربط مؤسسي مع الجامعات الأردنية والمدارس الشريكة',
      'شهادات تدقيق معتمدة في الأمان السيبراني وقوة التحمل'
    ],
    metrics: [
      { label: 'مسارات بتك BTEC', value: '14' },
      { label: 'تحمل المستخدمين', value: '120k+' },
      { label: 'مستوى الأمان المعتمد', value: 'A+' },
      { label: 'جهات شريكة ومؤسسية', value: '45+' }
    ],
    actionLabel: 'الشراكة المؤسسية والاعتماد',
    actionUrl: '/institutional-partnerships',
    icon: GraduationCap,
    gradient: 'from-amber-600/20 via-orange-600/10 to-transparent',
    accentColor: '#F59E0B',
    previewGraphic: {
      title: 'منظومة التأهيل المهني والتقني',
      sub: 'بناء مشاريع برمجية واقعية وحلول ذكية',
      pills: ['IT & Coding', 'Robotics & AI', 'Super Admin', 'Security A+']
    }
  }
];

export const InteractiveMousePresentationDeck: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Mouse 3D perspective tracking
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0, normX: 0, normY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const currentSlide = PRESENTATION_SLIDES[currentSlideIndex];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || isHovered) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % PRESENTATION_SLIDES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered]);

  // Handle mouse move across container to calculate 3D tilt & dynamic specular glare
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = ((x / rect.width) - 0.5) * 2; // -1 to 1
    const normY = ((y / rect.height) - 0.5) * 2; // -1 to 1

    setMouseOffset({ x, y, normX, normY });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseOffset({ x: 0, y: 0, normX: 0, normY: 0 });
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % PRESENTATION_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + PRESENTATION_SLIDES.length) % PRESENTATION_SLIDES.length);
  };

  // Dynamic 3D rotation angles calculated from mouse position
  const rotateX = -mouseOffset.normY * 9; // up/down tilt
  const rotateY = mouseOffset.normX * 9;  // left/right tilt

  return (
    <section 
      id="platform-presentation-deck"
      className={`relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 transition-all duration-500 overflow-hidden ${
        isTheaterMode 
          ? 'fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-center items-center py-6 px-4' 
          : 'bg-gradient-to-b from-transparent via-slate-100/50 to-slate-200/50 dark:via-slate-950/40 dark:to-[#040612]'
      }`}
      dir="rtl"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-500/10 dark:from-blue-600/15 dark:via-purple-600/15 dark:to-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto space-y-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300">
              <Presentation className="w-3.5 h-3.5 text-cyan-500" />
              <span>العرض التقديمي التفاعلي للمنصة (3D Motion Deck)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              تعرّف على منظومة{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                ذروة العلم
              </span>{' '}
              في عرض ثلاثي الأبعاد تفاعلي
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-normal">
              حرك مؤشر الماوس فوق البطاقة لاستكشاف العمق التفاعلي والتنقل السلس بين ركائز المنظومة الوطنية.
            </p>
          </div>

          {/* Quick Deck Controls */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs gap-1.5 h-9"
              title={isPlaying ? "إيقاف التشغيل التلقائي" : "تشغيل العرض التلقائي"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
              <span className="hidden sm:inline">{isPlaying ? 'إيقاف مؤقت' : 'تشغيل تلقائي'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className="rounded-xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs gap-1.5 h-9"
              title={isTheaterMode ? "إغلاق وضع المسرح" : "وضع العرض المكبر (Theater Mode)"}
            >
              {isTheaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-blue-500" />}
              <span className="hidden sm:inline">{isTheaterMode ? 'تصغير' : 'وضع المسرح'}</span>
            </Button>
          </div>
        </div>

        {/* Slide Navigation Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {PRESENTATION_SLIDES.map((slide, idx) => {
            const isCurrent = idx === currentSlideIndex;
            const Icon = slide.icon;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isCurrent
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-105'
                    : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-cyan-400 dark:text-blue-600' : 'opacity-70'}`} />
                <span>{slide.tag}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Parallax Canvas Container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 1200 }}
          className="relative w-full rounded-3xl cursor-grab active:cursor-grabbing transition-transform duration-200"
        >
          {/* Main 3D Tilted Card */}
          <motion.div
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transformStyle: 'preserve-3d'
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-[#070A1E]/95 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl backdrop-blur-2xl p-6 sm:p-10 transition-colors"
          >
            {/* Dynamic Cursor Light Glare / Reflection following mouse */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25 transition-opacity"
              style={{
                background: `radial-gradient(circle 380px at ${mouseOffset.x}px ${mouseOffset.y}px, rgba(56, 189, 248, 0.25), transparent 75%)`
              }}
            />

            {/* Subtle Grid Architectural Texture */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.4) 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.98 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
              >
                {/* Left/Main Column: Presentation Storytelling */}
                <div className="lg:col-span-7 space-y-6 text-right">
                  {/* Slide Top Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentSlide.badgeColor}`}>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{currentSlide.tag}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
                      شريحة {currentSlideIndex + 1} من {PRESENTATION_SLIDES.length}
                    </span>
                  </div>

                  {/* Headline & Highlighting */}
                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                      {currentSlide.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {currentSlide.description}
                    </p>
                  </div>

                  {/* Bullet Highlights */}
                  <ul className="space-y-2 pt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {currentSlide.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* 4 Metrics Telemetry in Slide */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    {currentSlide.metrics.map((m, mIdx) => (
                      <div 
                        key={mIdx}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-center"
                      >
                        <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono" dir="ltr">
                          {m.value}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Launcher Button */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Button
                      onClick={() => navigate(currentSlide.actionUrl)}
                      className="rounded-2xl font-bold text-xs sm:text-sm px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-md flex items-center gap-2 group"
                    >
                      <span>{currentSlide.actionLabel}</span>
                      <ArrowLeft className="w-4 h-4 rtl:rotate-0 rotate-180 transition-transform group-hover:-translate-x-1" />
                    </Button>
                    
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <MousePointer className="w-3 h-3 text-cyan-500 animate-pulse" />
                      <span>حرك الماوس للتفاعل ثلاثي الأبعاد</span>
                    </span>
                  </div>
                </div>

                {/* Right Column: 3D Holographic Display Showcase */}
                <div 
                  style={{
                    transform: `translateZ(30px)`,
                    transformStyle: 'preserve-3d'
                  }}
                  className="lg:col-span-5 flex justify-center items-center"
                >
                  <div className="relative w-full max-w-sm rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-white/10 shadow-2xl overflow-hidden space-y-5">
                    {/* Glowing Accent Orb */}
                    <div 
                      className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40"
                      style={{ backgroundColor: currentSlide.accentColor }}
                    />

                    {/* Top Branding Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-white/10 p-1 flex items-center justify-center">
                          <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xs font-mono font-bold tracking-wider text-slate-300">
                          GALAXY • 2.0
                        </span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>

                    {/* Central 3D Icon Graphic */}
                    <div className="py-4 flex flex-col items-center justify-center text-center space-y-3">
                      <div 
                        className="w-16 h-16 rounded-2xl p-3 flex items-center justify-center shadow-lg border border-white/20 transition-transform duration-300 hover:scale-110"
                        style={{ 
                          backgroundColor: `${currentSlide.accentColor}25`,
                          color: currentSlide.accentColor 
                        }}
                      >
                        <currentSlide.icon className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white">
                          {currentSlide.previewGraphic.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {currentSlide.previewGraphic.sub}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Pills Matrix */}
                    <div className="flex flex-wrap gap-1.5 justify-center pt-1 border-t border-white/10">
                      {currentSlide.previewGraphic.pills.map((pill, pIdx) => (
                        <span 
                          key={pIdx}
                          className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-semibold"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>

                    {/* Live Telemetry Ping Footer */}
                    <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>FPS: 60.0 LERP: STABLE</span>
                      <span className="text-cyan-400">ACTIVE PERSPECTIVE 3D</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Deck Navigation Bar */}
            <div className="pt-6 sm:pt-8 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
              {/* Prev Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSlide}
                className="rounded-xl text-xs gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-0 rotate-180" />
                <span>الشريحة السابقة</span>
              </Button>

              {/* Progress Dots */}
              <div className="flex items-center gap-2">
                {PRESENTATION_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlideIndex 
                        ? 'w-7 bg-blue-600 dark:bg-cyan-400 shadow-sm' 
                        : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                    }`}
                    aria-label={`الانتقال إلى الشريحة ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSlide}
                className="rounded-xl text-xs gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <span>الشريحة التالية</span>
                <ChevronLeft className="w-4 h-4 rtl:rotate-0 rotate-180" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMousePresentationDeck;
