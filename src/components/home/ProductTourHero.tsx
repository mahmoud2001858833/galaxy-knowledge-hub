import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronDown, 
  ShieldCheck, 
  Atom, 
  Sparkles, 
  Layers, 
  Award,
  Compass,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  Gauge,
  Bot,
  BrainCircuit,
  Search,
  Zap,
  FlaskConical,
  Calculator,
  FileText,
  Play,
  Activity,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import logo from '@/assets/logo.png';

const AnimatedCounter: React.FC<{
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}> = ({ end, decimals = 0, prefix = '', suffix = '', duration = 1800 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeOut * end;
      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  const formattedValue = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.round(count).toString();

  return (
    <span className="font-mono inline-flex items-center justify-center font-black" dir="ltr">
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

interface ProductTourHeroProps {
  onStartTour?: () => void;
}

export const ProductTourHero: React.FC<ProductTourHeroProps> = ({ onStartTour }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Quick Navigator Searchable Platforms Directory
  const searchableEntries = useMemo(() => [
    { title: 'مختبرات المحاكاة العلمية 3D (49 مختبراً)', category: 'مختبرات 3D', link: '/experiments-section', icon: Atom, color: 'text-blue-500' },
    { title: 'استوديو توليد الدروس والعروض التفاعلية AI 2.0', category: 'ذكاء اصطناعي', link: '/lesson-mindmap-studio', icon: Sparkles, color: 'text-purple-500' },
    { title: 'محاكاة حالات المادة والديناميكا الحرارية 3D', category: 'كيمياء وفيزياء', link: '/simulation/states-of-matter', icon: FlaskConical, color: 'text-cyan-500' },
    { title: 'مسارات التعليم والتدريب المهني الدولي BTEC', category: 'مسارات BTEC', link: '/btec', icon: GraduationCap, color: 'text-amber-500' },
    { title: 'منظومة دامج الوطنية للتربية الخاصة والشمولية', category: 'تربية خاصة', link: '/damij', icon: HeartHandshake, color: 'text-emerald-500' },
    { title: 'الروبوتات المتقدمة وهندسة الأتمتة ROS2 & LiDAR', category: 'روبوتات وذكاء', link: '/robotics-section', icon: Cpu, color: 'text-indigo-500' },
    { title: 'بنك أسئلة الامتحانات والمولّد الأكاديمي المتقدم', category: 'امتحانات', link: '/exam-generator', icon: FileText, color: 'text-rose-500' },
    { title: 'الآلة الحاسبة العلمية المتقدمة وتحليل المنحنيات', category: 'رياضيات', link: '/mathematics/calculator', icon: Calculator, color: 'text-teal-500' }
  ], []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return searchableEntries.filter(e => 
      e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
    );
  }, [searchQuery, searchableEntries]);

  const handleExplorePlatform = () => {
    const target = document.getElementById('tour-stage-ecosystem') || document.getElementById('mission-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/education-section');
    }
  };

  const handleScrollToNext = () => {
    const target = document.getElementById('mission-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[640px] md:min-h-[82vh] flex flex-col justify-between items-center pt-8 sm:pt-12 pb-10 px-4 sm:px-6 overflow-hidden">
      
      {/* Subtle Architectural Dot Matrix Background with Radial Falloff */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.35) 1px, transparent 0)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* Gentle Luxury Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[720px] h-[260px] sm:h-[380px] bg-gradient-to-tr from-blue-600/12 via-indigo-500/10 to-cyan-400/12 dark:from-blue-600/25 dark:via-cyan-500/20 dark:to-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-12 right-12 w-80 h-80 bg-blue-500/8 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 left-12 w-80 h-80 bg-emerald-500/8 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Center Stage Presentation Container */}
      <div className="relative z-10 max-w-6xl w-full mx-auto flex flex-col items-center text-center space-y-6 sm:space-y-8 my-auto">
        
        {/* Top Institutional Crest & Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 shadow-sm backdrop-blur-xl"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>المملكة الأردنية الهاشمية</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-blue-700 dark:text-blue-400 font-bold">مدرسة عنبه الثانوية الشاملة للبنين</span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
            المنظومة الوطنية المعتمدة 2.0
          </Badge>
        </motion.div>

        {/* Hero Title & National Visual Identity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="space-y-4 max-w-5xl px-2 w-full"
        >
          {/* Brand Logo & Academic Tag */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-1">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-md flex items-center justify-center shrink-0">
              <img src={logo} alt="ذروة العلم" className="w-full h-full object-contain" />
            </div>
            <div className="text-right">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 font-mono block">
                ZARWAT AL-ELM 2.0 • HUB
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                البنية الوطنية للمختبرات الرقمية والذكاء الاصطناعي
              </span>
            </div>
          </div>

          {/* Main Title with Refined Royal Gradient */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.18]">
            منصة{' '}
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-cyan-300 dark:to-white bg-clip-text text-transparent drop-shadow-sm">
              ذروة العلم 2.0
            </span>
          </h1>

          {/* Impact Value Proposition */}
          <div className="max-w-3xl mx-auto space-y-2 pt-1 text-center">
            <p className="text-base sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-200 leading-snug">
              البنية التحتية الرقمية الرائدة في العالم العربي للمختبرات التفاعلية ثلاثية الأبعاد (3D)، استوديو الذكاء الاصطناعي التوليدي، ومسارات BTEC المهنية.
            </p>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal max-w-2xl mx-auto">
              منظومة متطورة تجمع 49 مختبراً تفاعلياً فائق الدقة، استوديو توليد الدروس الفوري، مناهج التعليم المهني والتقني المعتمدة، وحلول الشمولية والتربية الخاصة مع مبادرة دامج الوطنية.
            </p>
          </div>
        </motion.div>

        {/* Executive Instant Spotlight Command Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="w-full max-w-2xl px-2 relative"
        >
          <div className="relative rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/5 backdrop-blur-xl p-1.5 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
            <div className="flex items-center gap-2 px-3">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                placeholder="ابحث فوراً: اكتب اسم تجربة 3D، مسألة، قانون، أداة ذكاء اصطناعي، أو مسار مهني..."
                className="w-full bg-transparent py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-right font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Dropdown */}
            <AnimatePresence>
              {isSearchFocused && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-right max-h-64 overflow-y-auto"
                >
                  <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    النتائج المباشرة السريعة:
                  </div>
                  {searchResults.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => navigate(item.link)}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors text-right group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 ${item.color}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-[-3px] transition-transform rtl:rotate-0 rotate-180" />
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Navigator Category Chips */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap pt-3 text-xs">
            <button
              onClick={() => navigate('/experiments-section')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 font-bold border border-blue-200 dark:border-blue-800/60 transition-all text-xs shadow-xs"
            >
              <Atom className="w-3.5 h-3.5 text-blue-600" />
              <span>49 مختبراً 3D</span>
            </button>
            <button
              onClick={() => navigate('/lesson-mindmap-studio')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50/80 hover:bg-purple-100/80 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/60 font-bold border border-purple-200 dark:border-purple-800/60 transition-all text-xs shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>استوديو AI 2.0</span>
            </button>
            <button
              onClick={() => navigate('/btec')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60 font-bold border border-amber-200 dark:border-amber-800/60 transition-all text-xs shadow-xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              <span>مسارات بتك BTEC</span>
            </button>
            <button
              onClick={() => navigate('/damij')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 font-bold border border-emerald-200 dark:border-emerald-800/60 transition-all text-xs shadow-xs"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              <span>منظومة دامج للتربية الخاصة</span>
            </button>
          </div>
        </motion.div>

        {/* Four Sovereign Suites Interactive Portal Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="w-full pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-5xl px-2 text-right"
        >
          {/* Suite 1: 3D Simulation Labs */}
          <div 
            onClick={() => navigate('/experiments-section')}
            className="group cursor-pointer p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />
            <div className="space-y-2.5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                  <Atom className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] font-bold">
                  49 مختبراً WebGL
                </Badge>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                المختبرات والمحاكاة 3D
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                بيئات فيزيائية وكيميائية وفلكية تفاعلية مع أدوات قياس دقيقة وتحكم فوري بالزمن والمتغيرات.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 mt-2">
              <span>دخول المختبرات</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-4px] transition-transform rtl:rotate-0 rotate-180" />
            </div>
          </div>

          {/* Suite 2: Generative AI Studio 2.0 */}
          <div 
            onClick={() => navigate('/lesson-mindmap-studio')}
            className="group cursor-pointer p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-purple-500/60 dark:hover:border-purple-500/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />
            <div className="space-y-2.5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </div>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-[10px] font-bold">
                  Gemini 2.5 Flash
                </Badge>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                استوديو الذكاء الاصطناعي 2.0
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                توليد فوري للدروس التفاعلية، حل المسائل المصورة بخط اليد خطوة بخطوة، والخرائط المفاهيمية.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 mt-2">
              <span>فتح الاستوديو</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-4px] transition-transform rtl:rotate-0 rotate-180" />
            </div>
          </div>

          {/* Suite 3: International BTEC Pathways */}
          <div 
            onClick={() => navigate('/btec')}
            className="group cursor-pointer p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-amber-500/60 dark:hover:border-amber-500/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />
            <div className="space-y-2.5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] font-bold">
                  معايير Pearson
                </Badge>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                مسارات BTEC المهنية
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                مناهج مهنية وهندسية دولية معتمدة لتكنولوجيا المعلومات، الروبوتات المتقدمة، وإدارة المشاريع.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 mt-2">
              <span>استكشاف المسارات</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-4px] transition-transform rtl:rotate-0 rotate-180" />
            </div>
          </div>

          {/* Suite 4: Damij Special Needs Platform */}
          <div 
            onClick={() => navigate('/damij')}
            className="group cursor-pointer p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />
            <div className="space-y-2.5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <HeartHandshake className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] font-bold">
                  شمولية 100%
                </Badge>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                منظومة دامج الشاملة
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                مبادرة وطنية شاملة لذوي الإعاقة: مترجم لغة الإشارة، نظام بريل، عين الأعمى، ودعم التوحد.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              <span>دخول منظومة دامج</span>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-4px] transition-transform rtl:rotate-0 rotate-180" />
            </div>
          </div>
        </motion.div>

        {/* Live Telemetry Metric Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="w-full pt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 max-w-4xl px-2"
        >
          {/* 1. 49+ 3D Interactive Labs */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center group hover:border-blue-500/40 hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono flex items-center justify-center gap-1">
              <AnimatedCounter end={49} suffix="+" duration={1900} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
              مختبراً تفاعلياً 3D
            </div>
          </div>

          {/* 2. 99.8% Simulation Precision */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center group hover:border-cyan-500/40 hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono flex items-center justify-center gap-1">
              <AnimatedCounter end={99.8} decimals={1} suffix="%" duration={2100} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
              دقة المحاكاة والقياس
            </div>
          </div>

          {/* 3. 100% Digital Inclusion */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center group hover:border-emerald-500/40 hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono flex items-center justify-center gap-1">
              <AnimatedCounter end={100} suffix="%" duration={1800} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
              شمولية رقمية (دامج)
            </div>
          </div>

          {/* 4. 25+ AI Tools */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm text-center group hover:border-purple-500/40 hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono flex items-center justify-center gap-1">
              <AnimatedCounter end={25} suffix="+" duration={1700} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
              أداة ذكاء اصطناعي
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Scroll Cue */}
      <div 
        onClick={handleScrollToNext}
        className="cursor-pointer group flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors pt-6"
      >
        <span className="text-[11px] font-bold tracking-wider uppercase">استكشف البنية الأكاديمية والمنظومة كاملة</span>
        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
      </div>
    </section>
  );
};

export default ProductTourHero;
