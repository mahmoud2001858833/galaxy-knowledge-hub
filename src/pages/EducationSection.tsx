import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, ArrowRight, GraduationCap, Sparkles, BookOpen, Layers, Cpu, Compass } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';

const clickSound = '/message-notification.mp3';

const EducationSection = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };
  const { t, dir } = useLanguage();

  const platforms = [
    {
      title: t.platformCategories.environmental,
      icon: "🌱",
      badge: "الاستدامة والبيئة",
      description: t.platformCategories.environmentalDescription,
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-emerald-500 to-green-600",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/20",
      borderColor: "border-emerald-200 dark:border-emerald-800/40",
      link: "/environmental-sustainability"
    },
    {
      title: "بتك BTEC المهني",
      icon: "💻",
      badge: "تكنولوجيا المعلومات والبرمجة",
      description: "منصة التعليم المهني والتقني المتطور - تكنولوجيا المعلومات، هندسة البرمجيات، والأمن السيبراني.",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-blue-600 to-indigo-600",
      bgLight: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800/40",
      link: "/btec"
    },
    {
      title: t.platformCategories.literary,
      icon: "📚",
      badge: "اللغات والآداب",
      description: t.platformCategories.literaryDescription,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-purple-600 to-pink-600",
      bgLight: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800/40",
      link: "/literary-platforms"
    },
    {
      title: t.platformCategories.scientific,
      icon: "🔬",
      badge: "المختبرات العلمية 3D",
      description: t.platformCategories.scientificDescription,
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-cyan-600 to-blue-600",
      bgLight: "bg-cyan-50 dark:bg-cyan-950/20",
      borderColor: "border-cyan-200 dark:border-cyan-800/40",
      link: "/scientific-platforms"
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060919] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300" dir={dir}>
      <SEO
        title="قسم التعليم والمنصات التفاعلية | ذروة العلم"
        description="استكشف الأقسام التعليمية التفاعلية: الاستدامة البيئية، مسار BTEC المهني، المنصات الأدبية، والمختبرات العلمية ثلاثية الأبعاد."
        keywords="تعليم تفاعلي, BTEC, الاستدامة البيئية, المنصات الأدبية, مختبرات علمية 3D, ذروة العلم"
      />
      <Navbar />
      <audio ref={audioRef} src={clickSound} preload="auto" />

      {/* Hero Header */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            قسم التعليم والمسارات الأكاديمية
          </span>
        </div>

        {/* Section Title Banner */}
        <div className="relative rounded-3xl p-6 sm:p-10 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden text-center sm:text-right">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>المسارات التعليمية التفاعلية</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              بوابة المنصات التعليمية المتقدمة
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              اختر مسارك الأكاديمي للاستفادة من المناهج الرقمية المعززة بالمحاكاة ثلاثية الأبعاد، أدوات الذكاء الاصطناعي التفاعلية، والتجارب المعملية الذكية المطابقة للمناهج الحديثة.
            </p>
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => {
                playSound();
                navigate(platform.link);
              }}
              className={`group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl border ${platform.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden p-6`}
            >
              {/* Top Image Preview Banner */}
              <div className="relative h-44 -mx-6 -mt-6 mb-5 overflow-hidden">
                <img 
                  src={platform.image} 
                  alt={platform.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                  {platform.badge}
                </div>
                <div className="absolute bottom-3 right-3 text-3xl filter drop-shadow">
                  {platform.icon}
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-2 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {platform.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {platform.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span className="group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  دخول المنصة
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all">
                  {dir === 'rtl' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EducationSection;