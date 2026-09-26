import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Atom, Sparkles, Compass, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import logo from '@/assets/logo.png';

const HeroSection = () => {
  const { dir } = useLanguage();
  const navigate = useNavigate();

  const scrollToSections = () => {
    const element = document.getElementById('platform-sections');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden py-16 sm:py-24 px-4 sm:px-6" dir={dir}>
      {/* Ambient background glows - pure CSS for max performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/15 to-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Side (on Desktop) - Platform Presentation & Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-7 text-center lg:text-right space-y-6"
        >
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-medium shadow-lg shadow-cyan-500/10 backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>الجيل الجديد من التعليم التفاعلي والذكاء الاصطناعي</span>
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              منصة{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-sm">
                ذروة العلم
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-200 font-medium">
              بوابتك نحو استكشاف أسرار الكون، الفيزياء، الكيمياء والذكاء الاصطناعي
            </p>
          </div>

          {/* Subtitle / Description */}
          <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
            منظومة تعليمية متكاملة تجمع بين أكثر من 45 مختبراً تفاعلياً ثلاثي الأبعاد، نماذج محاكاة علمية فائقة الدقة، مساعدات ذكية متقدمة مدعومة بـ Gemini، وحلول الشمولية والتربية الخاصة.
          </p>

          {/* Quick Metrics / Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 max-w-xl mx-auto lg:mx-0">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-center">
              <div className="text-2xl sm:text-3xl font-black text-cyan-300">45+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">محاكاة 3D</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-center">
              <div className="text-2xl sm:text-3xl font-black text-purple-300">25+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">أداة AI</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-center">
              <div className="text-2xl sm:text-3xl font-black text-teal-300">دامج</div>
              <div className="text-xs text-slate-400 font-medium mt-1">تعليم خاص ذكي</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">تفاعلي ومجاني</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <motion.button
              onClick={() => navigate('/experiments-section')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 hover:text-white font-extrabold text-base rounded-2xl shadow-xl shadow-cyan-500/25 transition-all duration-300 border border-cyan-400/40"
            >
              <Atom className="w-5 h-5 animate-spin-slow" />
              <span>المختبرات والمحاكاة 3D</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/ai-assistant-section')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-7 py-4 bg-slate-900/80 hover:bg-slate-850 border border-white/15 hover:border-purple-400/50 rounded-2xl text-white font-bold text-base backdrop-blur-md shadow-lg transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>المساعد الذكي (AI)</span>
            </motion.button>

            <motion.button
              onClick={scrollToSections}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-4 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>استعراض الأقسام</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Right Side (on Desktop) - High-Tech Glowing Centerpiece Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 flex justify-center items-center relative"
        >
          <div className="relative w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] flex items-center justify-center">
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/25 via-blue-600/25 to-purple-600/25 rounded-full blur-3xl animate-pulse" />

            {/* Orbiting Tech Rings */}
            <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/30 animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-10 rounded-full border border-purple-500/20 animate-[spin_40s_linear_infinite_reverse]" />

            {/* Central Glow Card */}
            <div className="relative z-10 p-6 sm:p-8 rounded-full bg-slate-950/70 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl shadow-cyan-500/20 group">
              <img
                src={logo}
                alt="شعار ذروة العلم"
                className="w-52 h-52 sm:w-64 sm:h-64 object-contain drop-shadow-[0_15px_35px_rgba(6,182,212,0.4)] transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modern Down Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <motion.button
          onClick={scrollToSections}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          aria-label="الانتقال إلى الأقسام"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.button>
      </div>
    </section>
  );
};

export default HeroSection;