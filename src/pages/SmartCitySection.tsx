import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, ArrowLeft, Building2, Bot, Palette, ChevronLeft, Sparkles, Compass } from 'lucide-react';
import { SEO } from '@/components/SEO';

const platforms = [
  {
    id: 'architectural',
    title: 'منصة التصميم المعماري الذكي',
    description: 'استخدم الذكاء الاصطناعي لتحليل موقع البناء والمناخ واحتياجات السكان واقتراح تصميمات مستدامة وجمالية موفرة للطاقة.',
    icon: Building2,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-200 dark:border-cyan-800/40',
    link: '/smart-city/architectural-design',
    features: ['تصميم توليدي', 'محاكاة الطاقة', 'تقييم الكفاءة'],
  },
  {
    id: 'robotic',
    title: 'روبوت البناء التفاعلي 3D',
    description: 'تعرّف على تقنيات البناء الروبوتي المؤتمت والطباعة الإنشائية ثلاثية الأبعاد وسبل تسريع التشييد المستدام.',
    icon: Bot,
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-200 dark:border-blue-800/40',
    link: '/smart-city/robotic-construction',
    features: ['طباعة 3D إنشائية', 'CAD/CAM', 'مساعد ذكي'],
  },
  {
    id: 'interior',
    title: 'التصميم الداخلي التفاعلي',
    description: 'أداة ذكية للديكور الداخلي توفّر توصيات متكاملة لتوزيع الإضاءة، المواد الصديقة للبيئة، وتخطيط المساحات الذكية.',
    icon: Palette,
    gradient: 'from-indigo-500 to-purple-600',
    borderColor: 'border-indigo-200 dark:border-indigo-800/40',
    link: '/smart-city/interior-design',
    features: ['توصيات ديناميكية', 'تصميم توليدي', 'واقع معزز'],
  },
];

const SmartCitySection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060919] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300" dir="rtl">
      <SEO
        title="قسم المدينة الذكية والعمارة المستقبلية | ذروة العلم"
        description="منصات معمارية وتصميمية تعتمد على الذكاء الاصطناعي، الطباعة الإنشائية ثلاثية الأبعاد، والتصميم الداخلي التوليدي."
        keywords="المدينة الذكية, تصميم معماري بالذكاء الاصطناعي, روبوتات البناء, تصميم داخلي ذكي, ذروة العلم"
      />
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            قسم المدينة الذكية
          </span>
        </div>

        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl p-6 sm:p-10 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold">
              <Building2 className="w-4 h-4" />
              <span>تقنيات العمارة والبناء المستقبلي</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              قسم المدينة الذكية والابتكار المعماري
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              منظومة متكاملة من أدوات الذكاء الاصطناعي التوليدي والنمذجة الإنشائية لتمكين المهندسين والمبتكرين من تصميم مدن مستدامة، بيئية، وشديدة الكفاءة.
            </p>
          </div>
        </motion.div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(platform.link)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer border ${platform.borderColor} bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-8`}
              >
                <div className="space-y-6">
                  {/* Icon Header */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${platform.gradient} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {platform.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {platform.description}
                    </p>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {platform.features.map((feature, i) => (
                      <span key={i} className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200/80 dark:border-slate-700">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span className="group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    استكشف المنصة
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SmartCitySection;
