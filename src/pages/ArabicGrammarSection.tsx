import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Book, Scroll, ArrowRight } from 'lucide-react';

const ArabicGrammarSection = () => {
  const navigate = useNavigate();

  const grammarTools = [
    { 
      id: 'ai-assistant',
      title: 'المساعد الذكي للغة العربية',
      icon: <Sparkles className="w-8 h-8" />,
      description: 'مساعد ذكي لفهم قواعد اللغة العربية',
      gradient: 'from-emerald-900/30 via-teal-800/20 to-emerald-700/30',
      textColor: 'text-emerald-200',
      path: '/arabic-platform/grammar/ai-assistant'
    },
    { 
      id: 'smart-syntax',
      title: 'المساعد الذكي للإعراب',
      icon: <Book className="w-8 h-8" />,
      description: 'أداة ذكية لإعراب الجمل والكلمات',
      gradient: 'from-cyan-900/30 via-blue-800/20 to-cyan-700/30',
      textColor: 'text-cyan-200',
      path: '/arabic-platform/grammar/smart-syntax'
    },
    { 
      id: 'foundation',
      title: 'أساسيات النحو',
      icon: <Scroll className="w-8 h-8" />,
      description: 'تعلم أساسيات النحو من الصفر',
      gradient: 'from-sky-900/30 via-indigo-800/20 to-sky-700/30',
      textColor: 'text-sky-200',
      path: '/arabic-platform/grammar/foundation'
    }
  ];

  const floatingChars = ['ا', 'ل', 'ن', 'ح', 'و'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900 text-right relative overflow-hidden" dir="rtl">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
        }}></div>
      </div>

      {/* الحروف العائمة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingChars.map((char, idx) => (
          <motion.div
            key={idx}
            className="absolute text-6xl font-bold text-emerald-500/10"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              rotate: Math.random() * 360
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
              rotate: Math.random() * 360
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          >
            {char}
          </motion.div>
        ))}
      </div>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-16 text-center"
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              علم النحو
            </motion.h1>
            <motion.div 
              className="w-24 h-1.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto mb-6 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
            <motion.p 
              className="text-xl md:text-2xl text-emerald-100/80 max-w-3xl mx-auto font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              اختر الأداة المناسبة لتعلم وإتقان قواعد النحو
            </motion.p>
          </motion.div>

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/arabic-platform')}
            className="mb-8 px-8 py-4 elegant-card rounded-xl text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-3 group"
          >
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-semibold">رجوع</span>
          </motion.button>

          {/* Grammar Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {grammarTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                onClick={() => navigate(tool.path)}
                className="group relative h-[320px] rounded-2xl overflow-hidden cursor-pointer elegant-card"
              >
                {/* الخلفية */}
                <div className="absolute inset-0">
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} backdrop-blur-sm`}></div>
                  <div className={`absolute inset-0 bg-gradient-to-t ${tool.gradient} opacity-60`}></div>
                </div>

                {/* إطار متدرج */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                {/* المحتوى */}
                <div className="absolute inset-0 p-8 z-10 flex flex-col justify-between">
                  <div className={`${tool.textColor} group-hover:scale-110 transition-transform duration-300 self-end`}>
                    {tool.icon}
                  </div>
                  
                  <div className="text-right">
                    <h3 className={`text-2xl font-bold ${tool.textColor} group-hover:text-white transition-colors duration-300 mb-3 arabic-glow`}>
                      {tool.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">{tool.description}</p>
                    
                    <motion.div 
                      className="mt-4 h-1 bg-gradient-to-l from-emerald-500 to-cyan-500 rounded-full"
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* تأثير التألق عند التمرير */}
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

export default ArabicGrammarSection;
