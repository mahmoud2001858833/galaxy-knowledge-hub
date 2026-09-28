import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

const AnimatedCounter: React.FC<{
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}> = ({ end, decimals = 0, prefix = '', suffix = '', duration = 1900 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth ease-out cubic curve (starts fast, lands gently)
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
    <span className="font-mono inline-flex items-center justify-center" dir="ltr">
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

interface ProductTourHeroProps {
  onStartTour?: () => void;
}

export const ProductTourHero: React.FC<ProductTourHeroProps> = ({ onStartTour }) => {
  const navigate = useNavigate();

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
    <section className="relative min-h-[580px] md:min-h-[76vh] flex flex-col justify-between items-center pt-8 sm:pt-14 pb-8 px-4 sm:px-6 overflow-hidden">
      {/* Subtle Architectural Dot Matrix Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.3) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Gentle Ambient Blue/Cyan Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[620px] h-[260px] sm:h-[340px] bg-gradient-to-tr from-blue-600/10 via-cyan-500/10 to-indigo-500/10 dark:from-blue-600/20 dark:via-cyan-500/15 dark:to-indigo-500/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -top-10 right-10 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-72 h-72 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Center Stage Presentation Container */}
      <div className="relative z-10 max-w-5xl w-full mx-auto flex flex-col items-center text-center space-y-7 sm:space-y-8 my-auto">
        
        {/* Top Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            المنظومة الوطنية الأردنية للتعليم التفاعلي ثلاثي الأبعاد 2.0
          </span>
        </motion.div>

        {/* Hero Title & Identity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="space-y-4 max-w-4xl px-2 w-full"
        >
          {/* Brand Logo & Sub-tag */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-sm flex items-center justify-center shrink-0">
              <img src={logo} alt="ذروة العلم" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono">
              GALAXY KNOWLEDGE HUB • PLATFORM
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            منصة{' '}
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-cyan-300 dark:to-white bg-clip-text text-transparent">
              ذروة العلم
            </span>
          </h1>

          {/* Impact Descriptions */}
          <div className="max-w-3xl mx-auto space-y-2.5 pt-1">
            <p className="text-base sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-200 leading-snug">
              البنية التحتية الرقمية الرائدة في العالم العربي للمختبرات العلمية ثلاثية الأبعاد والذكاء الاصطناعي التطبيقي.
            </p>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal max-w-2xl mx-auto">
              منظومة معتمدة تمكّن أكثر من 150,000 طالب وباحث عبر 49 مختبراً تفاعلياً فائق الدقة، مسارات BTEC المهنية، وحلول الشمولية والتربية الخاصة مع مبادرة دامج الوطنية.
            </p>
          </div>
        </motion.div>

        {/* Primary Action Buttons Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full max-w-2xl px-2"
        >
          {/* Platform Explore Launcher */}
          <Button
            size="lg"
            onClick={handleExplorePlatform}
            className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 dark:text-blue-600 transition-transform group-hover:rotate-12" />
            <span>استكشاف المنظومة</span>
          </Button>

          {/* 3D Simulations Launcher */}
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/experiments-section')}
            className="w-full sm:w-auto h-11 sm:h-12 px-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Atom className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>المختبرات والمحاكاة 3D</span>
          </Button>

          {/* BTEC Launcher */}
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/btec')}
            className="w-full sm:w-auto h-11 sm:h-12 px-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>مسارات بتك BTEC</span>
          </Button>

          {/* Damij Special Ed Launcher */}
          <Button
            size="lg"
            variant="ghost"
            onClick={() => navigate('/damij')}
            className="w-full sm:w-auto h-11 sm:h-12 px-4 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <HeartHandshake className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>مبادرة دامج للتربية الخاصة</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 rotate-180" />
          </Button>
        </motion.div>

        {/* Telemetry Metric Cards with Animated Count-Up Counters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="w-full pt-6 sm:pt-8 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 max-w-4xl px-2"
        >
          {/* 1. 49+ 3D Interactive Labs */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center group hover:border-blue-500/40 hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono flex items-center justify-center gap-1">
              <AnimatedCounter end={49} suffix="+" duration={1900} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              مختبراً تفاعلياً 3D
            </div>
          </div>

          {/* 2. 99.8% Simulation & Measurement Precision */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center group hover:border-cyan-500/40 hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono flex items-center justify-center gap-1">
              <AnimatedCounter end={99.8} decimals={1} suffix="%" duration={2100} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              دقة المحاكاة والقياس
            </div>
          </div>

          {/* 3. 100% Digital Inclusion (Damij) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center group hover:border-emerald-500/40 hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono flex items-center justify-center gap-1">
              <AnimatedCounter end={100} suffix="%" duration={1800} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              شمولية رقمية (دامج)
            </div>
          </div>

          {/* 4. 25+ AI Tools */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center group hover:border-purple-500/40 hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono flex items-center justify-center gap-1">
              <AnimatedCounter end={25} suffix="+" duration={1700} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
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
        <span className="text-[11px] font-semibold tracking-wider uppercase">استكشف أقسام المنظومة</span>
        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
      </div>
    </section>
  );
};

export default ProductTourHero;
