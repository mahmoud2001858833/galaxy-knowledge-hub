import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronDown, 
  Atom, 
  Sparkles, 
  Compass, 
  BookOpen, 
  HeartHandshake, 
  Building2,
  GraduationCap,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import logo from '@/assets/logo.png';

const HeroSection: React.FC = () => {
  const { dir } = useLanguage();
  const navigate = useNavigate();

  const scrollToSections = () => {
    const element = document.getElementById('platform-sections');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickJumpLinks = [
    { label: 'المختبرات 3D', icon: Atom, link: '/experiments-section', color: 'hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40' },
    { label: 'الروبوتات و AI', icon: Zap, link: '/robotics-section', color: 'hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/40' },
    { label: 'مسارات BTEC', icon: GraduationCap, link: '/btec', color: 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/40' },
    { label: 'المرشد الذكي', icon: Sparkles, link: '/ai-assistant-section', color: 'hover:text-cyan-500 dark:hover:text-cyan-400 hover:border-cyan-500/40' },
    { label: 'المكتبة العلمية', icon: BookOpen, link: '/sources-library', color: 'hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40' },
    { label: 'المدينة الذكية', icon: Building2, link: '/smart-city', color: 'hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/40' }
  ];

  return (
    <section className="relative min-h-[94vh] flex items-center justify-center overflow-hidden py-16 sm:py-24 px-4 sm:px-6" dir={dir}>
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-600/15 via-blue-500/15 to-indigo-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
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
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs sm:text-sm font-semibold shadow-md dark:shadow-lg shadow-cyan-500/15 backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping" />
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>الجيل الجديد من التعليم التفاعلي والذكاء الاصطناعي 2.0</span>
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              منصة{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 drop-shadow-sm">
                ذروة العلم
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-700 dark:text-slate-200 font-medium">
              بوابتك نحو استكشاف أسرار الكون، الفيزياء، الكيمياء والذكاء الاصطناعي
            </p>
          </div>

          {/* Subtitle / Description */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300/90 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
            منظومة تعليمية متكاملة تجمع بين أكثر من 45 مختبراً تفاعلياً ثلاثي الأبعاد، نماذج محاكاة علمية فائقة الدقة، مساعدات ذكية متقدمة مدعومة بـ Gemini، وحلول الشمولية والتربية الخاصة مع منصة دامج والمكتبة الموثقة.
          </p>

          {/* Quick Metrics / Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 max-w-xl mx-auto lg:mx-0">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-500/20 shadow-sm backdrop-blur-md text-center hover:border-cyan-500/40 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-300 font-mono" dir="ltr">49+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">مختبراً تفاعلياً 3D</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-blue-500/20 shadow-sm backdrop-blur-md text-center hover:border-blue-500/40 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-300 font-mono" dir="ltr">99.8%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">دقة المحاكاة والقياس</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-emerald-500/20 shadow-sm backdrop-blur-md text-center hover:border-emerald-500/40 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-300 font-mono" dir="ltr">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">شمولية رقمية (دامج)</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-purple-500/20 shadow-sm backdrop-blur-md text-center hover:border-purple-500/40 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-300 font-mono" dir="ltr">25+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">أداة ذكاء اصطناعي</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <motion.button
              onClick={() => navigate('/experiments-section')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 hover:text-white font-black text-base rounded-2xl shadow-xl shadow-cyan-500/25 transition-all duration-300 border border-cyan-400/40"
            >
              <Atom className="w-5 h-5 animate-spin-slow" />
              <span>المختبرات والمحاكاة 3D</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/damij')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-7 py-4 bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-850 border border-teal-500/40 hover:border-teal-500 rounded-2xl text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-white font-bold text-base backdrop-blur-md shadow-md dark:shadow-lg transition-all duration-300"
            >
              <HeartHandshake className="w-5 h-5 text-teal-500 dark:text-teal-400" />
              <span>منصة دامج الذكية</span>
            </motion.button>

            <motion.button
              onClick={scrollToSections}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-4 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-sm font-semibold transition-colors"
            >
              <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>استعراض الأقسام</span>
            </motion.button>
          </div>

          {/* Direct Quick Jump Chips */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">وصول سريع:</span>
            {quickJumpLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(item.link)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-all ${item.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Right Side (on Desktop) - High-Tech Glowing Centerpiece Logo with Floating Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 flex justify-center items-center relative"
        >
          <div className="relative w-[340px] sm:w-[440px] h-[340px] sm:h-[440px] flex items-center justify-center">
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/25 via-blue-600/25 to-purple-600/25 rounded-full blur-3xl animate-pulse" />

            {/* Orbiting Tech Rings */}
            <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/30 animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-10 rounded-full border border-purple-500/20 animate-[spin_40s_linear_infinite_reverse]" />

            {/* Central Glow Card */}
            <div className="relative z-10 p-6 sm:p-8 rounded-full bg-slate-950/80 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl shadow-cyan-500/20 group">
              <img
                src={logo}
                alt="شعار ذروة العلم"
                className="w-52 h-52 sm:w-64 sm:h-64 object-contain drop-shadow-[0_15px_35px_rgba(6,182,212,0.4)] transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
            </div>

            {/* Floating Tech Pill 1 - Top Left */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 start-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-cyan-400/40 text-cyan-300 text-xs font-bold shadow-lg shadow-cyan-500/10 backdrop-blur-md"
            >
              <Atom className="w-4 h-4 text-cyan-400" />
              <span>مختبرات كمية وذرية 3D</span>
            </motion.div>

            {/* Floating Tech Pill 2 - Bottom Right */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-2 end-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-teal-400/40 text-teal-300 text-xs font-bold shadow-lg shadow-teal-500/10 backdrop-blur-md"
            >
              <HeartHandshake className="w-4 h-4 text-teal-400" />
              <span>مترجم برايل ولغة الإشارة</span>
            </motion.div>

            {/* Floating Tech Pill 3 - Top Right */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-16 -end-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-purple-400/40 text-purple-300 text-xs font-bold shadow-lg backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>مرشد ذكي صوتي 2.0</span>
            </motion.div>
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