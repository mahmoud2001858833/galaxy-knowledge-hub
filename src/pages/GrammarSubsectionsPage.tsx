import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Library, ArrowRight } from 'lucide-react';

const GrammarSubsectionsPage = () => {
  const navigate = useNavigate();

  const subsections = [
    {
      id: 'basics',
      title: 'مساعد للإعراب',
      subtitle: 'مساعد ذكي للإعراب النحوي الدقيق',
      icon: <BookOpen className="w-12 h-12" />,
      gradient: 'from-amber-900/40 via-yellow-800/30 to-amber-700/40',
      borderGradient: 'from-amber-500 to-yellow-600',
      textColor: 'text-amber-200',
      path: '/arabic-platform/grammar/basics'
    },
    {
      id: 'library',
      title: 'مكتبة القواعد',
      subtitle: 'مكتبة شاملة لأساسيات النحو',
      icon: <Library className="w-12 h-12" />,
      gradient: 'from-emerald-900/40 via-teal-800/30 to-emerald-700/40',
      borderGradient: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-200',
      path: '/arabic-platform/grammar/library'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900 text-right relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(217, 119, 6, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)',
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
            onClick={() => navigate('/arabic-platform/grammar')}
            className="mb-8 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/90 transition-all duration-300"
          >
            <ArrowRight className="w-5 h-5" />
            العودة إلى النحو
          </motion.button>

          <motion.div 
            initial={{ y: -30, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.8, ease: "easeOut" }} 
            className="mb-16 text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              علم النحو
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-4 rounded-full" />
            <p className="text-xl text-amber-100/70">
              اختر القسم المناسب
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {subsections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                onClick={() => navigate(section.path)}
                className="group relative h-[320px] rounded-2xl overflow-hidden cursor-pointer"
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
                    <h3 className={`text-3xl font-bold ${section.textColor} group-hover:text-white transition-colors duration-300 mb-2`}>
                      {section.title}
                    </h3>
                    <p className="text-white/70 text-base mb-4">
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

export default GrammarSubsectionsPage;
