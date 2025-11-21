import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Scale, ArrowRight } from 'lucide-react';

const MorphologySubsectionsPage = () => {
  const navigate = useNavigate();

  const subsections = [
    {
      id: 'basics',
      title: 'أساسيات الصرف',
      subtitle: 'مساعد ذكي في علم الصرف',
      icon: <Sparkles className="w-12 h-12" />,
      gradient: 'from-purple-900/40 via-violet-800/30 to-purple-700/40',
      borderGradient: 'from-purple-500 to-violet-600',
      textColor: 'text-purple-200',
      path: '/arabic-platform/morphology/basics'
    },
    {
      id: 'derivatives',
      title: 'المشتقات',
      subtitle: 'أداة المشتقات الصرفية',
      icon: <FileText className="w-12 h-12" />,
      gradient: 'from-pink-900/40 via-rose-800/30 to-pink-700/40',
      borderGradient: 'from-pink-500 to-rose-600',
      textColor: 'text-pink-200',
      path: '/arabic-platform/morphology/derivatives'
    },
    {
      id: 'roots',
      title: 'الجذور والأوزان',
      subtitle: 'أداة تحليل الجذور والأوزان',
      icon: <Scale className="w-12 h-12" />,
      gradient: 'from-cyan-900/40 via-blue-800/30 to-cyan-700/40',
      borderGradient: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-200',
      path: '/arabic-platform/morphology/roots'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900 text-right relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
        }}></div>
      </div>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/arabic-platform/morphology')}
            className="mb-8 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/90 transition-all duration-300"
          >
            <ArrowRight className="w-5 h-5" />
            العودة إلى الصرف
          </motion.button>

          <motion.div 
            initial={{ y: -30, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.8, ease: "easeOut" }} 
            className="mb-16 text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-purple-200 to-purple-500">
              علم الصرف
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mb-4 rounded-full" />
            <p className="text-xl text-purple-100/70">
              اختر القسم المناسب
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subsections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                onClick={() => navigate(section.path)}
                className="group relative h-[340px] rounded-2xl overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0">
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} backdrop-blur-sm`}></div>
                </div>
                
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${section.borderGradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl`}></div>
                
                <div className="absolute inset-0 p-8 z-10 flex flex-col justify-between">
                  <div className={`${section.textColor} group-hover:scale-110 transition-transform duration-300 self-end`}>
                    {section.icon}
                  </div>
                  
                  <div className="text-right">
                    <h3 className={`text-2xl font-bold ${section.textColor} group-hover:text-white transition-colors duration-300 mb-2`}>
                      {section.title}
                    </h3>
                    <p className="text-white/70 text-sm mb-4">
                      {section.subtitle}
                    </p>
                    <motion.div 
                      className={`h-1 bg-gradient-to-l ${section.borderGradient} rounded-full`}
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default MorphologySubsectionsPage;
