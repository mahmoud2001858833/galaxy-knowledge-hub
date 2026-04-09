import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Bot, Palette, ChevronLeft } from 'lucide-react';

const platforms = [
  {
    id: 'architectural',
    title: 'منصة التصميم المعماري الذكي',
    description: 'استخدم الذكاء الاصطناعي لتحليل موقع البناء والمناخ واحتياجات السكان واقتراح تصميمات مستدامة وجمالية',
    icon: Building2,
    gradient: 'from-cyan-500 to-blue-600',
    link: '/smart-city/architectural-design',
    features: ['تصميم توليدي', 'محاكاة الطاقة', 'تقييم الكفاءة'],
  },
  {
    id: 'robotic',
    title: 'روبوت البناء التفاعلي',
    description: 'تعرّف على تقنيات البناء الروبوتي والطباعة ثلاثية الأبعاد وكيف تُحدث ثورة في عالم العمارة',
    icon: Bot,
    gradient: 'from-blue-500 to-indigo-600',
    link: '/smart-city/robotic-construction',
    features: ['طباعة ثلاثية الأبعاد', 'CAD/CAM', 'مساعد ذكي'],
  },
  {
    id: 'interior',
    title: 'التصميم الداخلي التفاعلي',
    description: 'أداة ذكية للديكور الداخلي توفّر توصيات متكاملة للألوان والإضاءة والأثاث بالذكاء الاصطناعي',
    icon: Palette,
    gradient: 'from-indigo-500 to-purple-600',
    link: '/smart-city/interior-design',
    features: ['توصيات ديناميكية', 'تصميم توليدي', 'واقع معزز'],
  },
];

const SmartCitySection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950 text-white" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8 pb-4 px-4"
      >
        <button
          onClick={() => {
            const isGJU = sessionStorage.getItem('gju_mode') === 'true';
            navigate(isGJU ? '/gju-competition' : '/');
          }}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
        >
          <ArrowRight className="w-5 h-5" />
          <span>{sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة للرئيسية'}</span>
        </button>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            <Building2 className="w-6 h-6 text-cyan-400" />
            <span className="text-cyan-300 font-semibold">المدينة الذكية</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            قسم المدينة الذكية
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            منصات معمارية وتصميمية تعتمد على الذكاء الاصطناعي لبناء مستقبل أفضل
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.15 }}
                onClick={() => navigate(platform.link)}
                className="group relative rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-cyan-500/40 transition-all duration-500 bg-white/5 backdrop-blur-sm hover:shadow-2xl hover:shadow-cyan-500/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                
                <div className="relative p-8 flex flex-col items-center text-center min-h-[400px] justify-between">
                  <div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      className={`mb-6 p-5 rounded-2xl bg-gradient-to-br ${platform.gradient} shadow-lg`}
                    >
                      <Icon className="w-12 h-12 text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-white mb-3">{platform.title}</h3>
                    <p className="text-white/60 leading-relaxed mb-6">{platform.description}</p>
                  </div>

                  <div className="w-full">
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {platform.features.map((f, i) => (
                        <span key={i} className="px-3 py-1 text-sm rounded-full bg-white/10 text-white/80 border border-white/10">
                          {f}
                        </span>
                      ))}
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full py-3 rounded-xl bg-gradient-to-r ${platform.gradient} text-white font-bold flex items-center justify-center gap-2`}
                    >
                      <span>استكشف المنصة</span>
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SmartCitySection;
