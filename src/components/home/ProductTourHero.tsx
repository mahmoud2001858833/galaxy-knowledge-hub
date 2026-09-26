import React from 'react';
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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface ProductTourHeroProps {
  onStartTour?: () => void;
}

export const ProductTourHero: React.FC<ProductTourHeroProps> = ({ onStartTour }) => {
  const navigate = useNavigate();

  const handleScrollToNext = () => {
    if (onStartTour) {
      onStartTour();
      return;
    }
    const target = document.getElementById('mission-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-between items-center pt-16 sm:pt-24 pb-12 px-4 sm:px-6 overflow-hidden">
      {/* Subtle Architectural Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.25) 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Gentle Institutional Gradient Glow (Subtle & Restrained) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[340px] bg-gradient-to-tr from-slate-200/50 via-blue-100/30 to-slate-100/20 dark:from-blue-950/20 dark:via-slate-900/30 dark:to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Center Content Area */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 flex-1 flex flex-col justify-center items-center">
        
        {/* Executive Institutional Badge */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
        >
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          <span className="tracking-tight">المنظومة الوطنية الموحدة للمحاكاة العلمية والتعليم التفاعلي 2.0</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
            EST. 2026
          </span>
        </motion.div>

        {/* Brand Emblem & Headline Group */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-sm flex items-center justify-center">
              <img src={logo} alt="ذروة العلم" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono">
              GALAXY ENTERPRISE SUITE
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            منصة{' '}
            <span className="text-slate-900 dark:text-slate-100 border-b-4 border-blue-600 dark:border-blue-500 pb-1">
              ذروة العلم
            </span>
          </h1>

          {/* Two Authoritative Impact Taglines */}
          <div className="max-w-3xl mx-auto space-y-2 pt-2">
            <p className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-200 leading-snug">
              البنية التحتية الرقمية الرائدة في العالم العربي للمختبرات العلمية ثلاثية الأبعاد والذكاء الاصطناعي التطبيقي.
            </p>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              منظومة معتمدة تمكّن أكثر من 150,000 طالب وباحث عبر 49 مختبراً افتراضياً عالي الدقة، ومسارات تطبيقية متقدمة، وحلول الشمولية والتربية الخاصة مع مبادرة دامج الوطنية.
            </p>
          </div>
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
        >
          <Button
            size="lg"
            onClick={handleScrollToNext}
            className="h-12 px-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold text-sm shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <span>ابدأ الجولة التعريفية</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/experiments-section')}
            className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-semibold text-sm shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <Atom className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>المختبرات والمحاكاة 3D</span>
          </Button>

          <Button
            size="lg"
            variant="ghost"
            onClick={() => navigate('/damij')}
            className="h-12 px-5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors flex items-center gap-1.5"
          >
            <span>مبادرة دامج للتربية الخاصة</span>
            <ArrowLeft className="w-4 h-4 rtl:rotate-0 rotate-180" />
          </Button>
        </motion.div>

        {/* Executive Metric Telemetry Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="w-full pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl"
        >
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.03)] text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">49+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">مختبراً تفاعلياً 3D</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.03)] text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">99.8%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">دقة المحاكاة والقياس</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.03)] text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">100%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">شمولية رقمية (دامج)</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.03)] text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">25+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">أداة ذكاء اصطناعي</div>
          </div>
        </motion.div>
      </div>

      {/* Subtle Bottom Scroll Cue */}
      <div 
        onClick={handleScrollToNext}
        className="cursor-pointer group flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors pt-6"
      >
        <span className="text-[11px] font-semibold tracking-wider uppercase">استكشف أقسام الجولة</span>
        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
      </div>
    </section>
  );
};

export default ProductTourHero;
