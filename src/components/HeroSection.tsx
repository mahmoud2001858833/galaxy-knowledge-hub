import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import logo from '@/assets/logo.png';

const HeroSection = () => {
  const { dir } = useLanguage();


  const scrollToSections = () => {
    const element = document.getElementById('platform-sections');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4" dir={dir}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ 
            background: [
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Large Logo with Rotating Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative w-full h-[500px] flex items-center justify-center">
            {/* Central Logo - Large and Static */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: 0.3
              }}
              className="relative z-10"
            >
              {/* Glowing Background */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.4, 0.3]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 blur-3xl rounded-full"
              />

              {/* Logo - Large and Static */}
              <img 
                src={logo} 
                alt="ذروة العلم" 
                className="relative w-[400px] h-[400px] object-contain drop-shadow-2xl"
              />
            </motion.div>

            {/* Rotating Circle - No Icons */}
            <motion.div
              animate={{ 
                rotate: 360,
              }}
              transition={{ 
                duration: 50,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-[480px] h-[480px] rounded-full border border-dashed border-blue-400/30" />
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Platform Description */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center lg:text-right space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-6 leading-tight">
              ذروة العلم
            </h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full mb-8 shadow-lg shadow-blue-500/50"
            />

            <p className="text-2xl md:text-3xl text-white/95 font-medium leading-relaxed mb-4">
              منصتك التعليمية الشاملة
            </p>

            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              رحلة تعليمية مبتكرة تجمع العلوم، الرياضيات، اللغات، والتكنولوجيا
              <br />
              <span className="text-blue-300">مع مساعد ذكي يرافقك في كل خطوة</span>
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col items-center lg:items-end gap-4"
            >
              <div className="flex items-center gap-6 text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm">8+ منصات تعليمية</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm">مساعد ذكي متقدم</span>
                </div>
              </div>

              <motion.button
                onClick={scrollToSections}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600/50 to-purple-600/50 hover:from-blue-600/70 hover:to-purple-600/70 border border-blue-400/50 rounded-full text-white font-bold text-lg backdrop-blur-sm shadow-2xl shadow-blue-500/30 transition-all"
              >
                <span>استكشف المنصات</span>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.div>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          onClick={scrollToSections}
          className="cursor-pointer"
        >
          <ChevronDown className="w-8 h-8 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;