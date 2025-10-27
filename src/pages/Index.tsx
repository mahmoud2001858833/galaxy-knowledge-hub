
import React from 'react';
import { motion } from 'framer-motion';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EducationalResources from '@/components/EducationalResources';
import PlatformCategories from '@/components/PlatformCategories';
import { useLanguage } from '@/i18n/LanguageContext';
import { SEO } from '@/components/SEO';

const Index = () => {
  const { t, dir } = useLanguage();
  
  return (
    <div className={`min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950`} dir={dir}>
      <SEO 
        title="الصفحة الرئيسية"
        description="فلك المعرفة - منصة تعليمية تفاعلية شاملة لتعلم العلوم والرياضيات واللغات مع مساعد ذكي وأدوات تعليمية متطورة"
        keywords="فلك المعرفة, منصة تعليمية, تعلم الفيزياء, تعلم الكيمياء, تعلم الأحياء, تعلم الرياضيات, تعلم اللغة العربية, تعلم الإنجليزية, مساعد ذكي, ألغاز تعليمية, فيديوهات تعليمية, الاستدامة البيئية"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
        <motion.div 
          className="flex flex-col items-center justify-center max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mb-10 relative"
          >
            {/* Circular space-themed frame - reduced size */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-cyan-500/30 p-1 -m-2 blur-md"></div>
            <div className="absolute inset-0 rounded-full animate-pulse-glow opacity-50 bg-gradient-to-r from-cyan-500/20 via-blue-400/10 to-purple-600/20 -m-1"></div>
            
            {/* Animated ring - reduced size */}
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-blue-400/50 -m-1"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.7, 1, 0.7],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity,
                ease: "linear"
              }}
            ></motion.div>
            
            {/* Logo - reduced size */}
            <div className="w-40 h-40 md:w-44 md:h-44 rounded-full p-2 bg-blue-900/30 backdrop-blur-sm border border-blue-500/30 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-60"></div>
              <img 
                src="https://i.postimg.cc/mr48sKY6/image.png" 
                alt={t.home.title} 
                className="w-36 h-36 md:w-40 md:h-40 object-contain object-center filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] z-10" 
              />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-500"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            {t.home.title}
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white/70 text-center mb-12 max-w-2xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            {t.home.subtitle}
          </motion.p>
        </motion.div>
        
        {/* Add the Platform Categories section */}
        <PlatformCategories />
        
        {/* Add the Educational Resources section */}
        <EducationalResources />
      </main>
      
      <Footer />
      
      {/* Enhanced Starfield Animation with more stars and space elements */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white opacity-20 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Add some nebula-like elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/5 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute top-2/3 right-1/4 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>
    </div>
  );
};

export default Index;
