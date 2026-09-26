import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, ArrowRight, Atom, Beaker, Dna, Calculator, Sparkles, ChevronLeft, Layers } from 'lucide-react';
import { SEO } from '@/components/SEO';

const ScientificPlatforms = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  
  const platforms = [
    {
      title: t.platforms?.physics || "منصة الفيزياء التفاعلية",
      tagline: "ميكانيكا نيوتن، البصريات، الكهرومغناطيسية، والفيزياء الذكية 3D",
      icon: <Atom className="w-8 h-8 text-blue-500" />,
      image: "https://www.chemixlab.com/wp-content/uploads/2024/01/Thomsons-Model-of-an-Atom-Atomic-Model-History-Limitations-Example.jpg",
      color: "from-blue-600 to-cyan-600",
      accentBorder: "border-blue-200 dark:border-blue-800/40",
      badge: "مختبر 3D حي",
      experimentsCount: "38+ تجربة",
      link: "/physics"
    },
    {
      title: t.platforms?.chemistry || "منصة الكيمياء الرقمية",
      tagline: "الاتزان الكيميائي، المعايرة، التفاعلات الجزيئية، والجدول الدوري التفاعلي",
      icon: <Beaker className="w-8 h-8 text-purple-500" />,
      image: "https://www.ra2ed.com/UserFiles/cq5dam.lcover.jpeg",
      color: "from-purple-600 to-pink-600",
      accentBorder: "border-purple-200 dark:border-purple-800/40",
      badge: "بيئة محاكاة آمنة",
      experimentsCount: "25+ تفاعل",
      link: "/chemistry"
    },
    {
      title: t.platforms?.biology || "منصة العلوم الحياتية",
      tagline: "الخلية الحية، علم الوراثة، تقنية CRISPR، والمجهر الإلكتروني الافتراضي",
      icon: <Dna className="w-8 h-8 text-emerald-500" />,
      image: "https://th.bing.com/th/id/OIP.GmUR4ZRzF9gWiCj7wukbuwAAAA?cb=iwc2&rs=1&pid=ImgDetMain",
      color: "from-emerald-600 to-teal-600",
      accentBorder: "border-emerald-200 dark:border-emerald-800/40",
      badge: "مجهر رقمي",
      experimentsCount: "19+ نموذج",
      link: "/biology"
    },
    {
      title: t.platforms?.mathematics || "منصة الرياضيات المتقدمة",
      tagline: "الهندسة الفضائية 3D، سلاسل فورييه، حساب التفاضل والتكامل، والتحليل البياني",
      icon: <Calculator className="w-8 h-8 text-amber-500" />,
      image: "https://digital-brilliance.online/wp-content/uploads/2024/05/7bb1a96e-fbeb-4aac-8ce9-dde1e408f1a0.webp",
      color: "from-amber-500 to-orange-600",
      accentBorder: "border-amber-200 dark:border-amber-800/40",
      badge: "نمذجة هندسية",
      experimentsCount: "16+ أداة",
      link: "/mathematics"
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060919] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300" dir={dir}>
      <SEO 
        title="المنصات العلمية والمختبرات الافتراضية 3D | ذروة العلم"
        description="استكشف المنصات العلمية في ذروة العلم - الفيزياء، الكيمياء، الأحياء، والرياضيات مع محاكاة تفاعلية ثلاثية الأبعاد ومساعدين أذكياء للمنهاج الأردني."
        keywords="المنصات العلمية, مختبرات فيزياء, تجارب كيمياء, أحياء 3D, رياضيات تفاعلية, المنهاج الأردني, ذروة العلم"
      />
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link to="/education-section" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            قسم التعليم
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            المنصات العلمية
          </span>
        </div>

        {/* Hero Banner Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl p-6 sm:p-10 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>المختبرات الافتراضية الرائدة</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.scientificPlatforms?.title || "المنصات العلمية والمختبرات الافتراضية"}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.scientificPlatforms?.subtitle || "بيئات محاكاة تفاعلية تتيح للطلبة والمعلمين إجراء التجارب العلمية بدقة متناهية، أمان تام، ودون تكاليف مواد مستهلكة."}
            </p>
          </div>
        </motion.div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              whileHover={{ y: -6 }}
              onClick={() => navigate(platform.link)}
              className={`group relative bg-white dark:bg-slate-900 rounded-3xl border ${platform.accentBorder} shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between p-6`}
            >
              {/* Image Preview Banner */}
              <div className="relative h-44 -mx-6 -mt-6 mb-5 overflow-hidden">
                <img 
                  src={platform.image} 
                  alt={platform.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                  {platform.badge}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-800/90 p-2.5 rounded-2xl shadow">
                  {platform.icon}
                </div>
                <div className="absolute bottom-3 left-3 text-xs font-semibold text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {platform.experimentsCount}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {platform.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {platform.tagline}
                </p>
              </div>

              {/* Bottom Action CTA */}
              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  دخول المختبر الافتراضي
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
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

export default ScientificPlatforms;
