import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Settings, GraduationCap, Brain, ArrowLeft } from 'lucide-react';

const PlatformCategories = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  
  const sections = [
    {
      id: 'management',
      title: 'قسم الإدارة',
      icon: Settings,
      description: 'إدارة شاملة ومتكاملة للمنصة التعليمية',
      color: 'from-amber-600/20 to-yellow-600/20',
      borderColor: 'border-amber-500/30',
      glowColor: 'shadow-amber-500/50',
      iconBg: 'bg-amber-500/20',
      link: '/management-section',
      platformCount: 2
    },
    {
      id: 'education',
      title: 'قسم التعليم',
      icon: GraduationCap,
      description: 'منصات تعليمية شاملة في جميع المجالات',
      color: 'from-green-600/20 to-emerald-600/20',
      borderColor: 'border-green-500/30',
      glowColor: 'shadow-green-500/50',
      iconBg: 'bg-green-500/20',
      link: '/education-section',
      platformCount: 4
    },
    {
      id: 'ai-assistant',
      title: 'قسم مساعدك الذكي',
      icon: Brain,
      description: 'مساعدون أذكياء لدعمك في رحلتك التعليمية',
      color: 'from-purple-600/20 to-indigo-600/20',
      borderColor: 'border-purple-500/30',
      glowColor: 'shadow-purple-500/50',
      iconBg: 'bg-purple-500/20',
      link: '/ai-assistant-section',
      platformCount: 2
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const sectionVariants = {
    hidden: { 
      opacity: 0, 
      y: 100,
      scale: 0.8,
      rotateX: -30
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        duration: 0.8
      }
    }
  };

  return (
    <motion.section
      id="platform-sections"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="py-20 w-full max-w-7xl mx-auto px-4"
      dir={dir}
    >
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-16 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-4">
          {t.platformCategories.title}
        </h2>
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: "10rem" }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 mx-auto rounded-full shadow-lg shadow-blue-500/50"
        />
        <p className="text-white/70 mt-6 max-w-2xl mx-auto text-lg">
          {t.platformCategories.subtitle}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            variants={sectionVariants}
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              z: 50
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(section.link)}
            className={`group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer border-2 ${section.borderColor} transition-all duration-500 hover:shadow-2xl hover:${section.glowColor}`}
            style={{ 
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            {/* Animated Background */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${section.color}`}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-950/60 to-transparent backdrop-blur-sm" />
            
            {/* Glow Effect */}
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              animate={{
                background: [
                  'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 70% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity
              }}
            />

            {/* Content */}
            <div className="absolute inset-0 p-8 z-10 flex flex-col items-center justify-center text-center">
              {/* Icon */}
              <motion.div
                whileHover={{ 
                  rotate: 360,
                  scale: 1.2
                }}
                transition={{ duration: 0.6 }}
                className={`mb-8 p-8 rounded-3xl ${section.iconBg} backdrop-blur-md shadow-2xl`}
              >
                <section.icon className="w-16 h-16 text-white" />
              </motion.div>

              {/* Title */}
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                {section.title}
              </h3>

              {/* Description */}
              <p className="text-white/80 text-base leading-relaxed mb-6 max-w-xs">
                {section.description}
              </p>

              {/* Platform Count Badge */}
              <div className="mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-white/90 text-sm font-semibold">
                  {section.platformCount} منصات
                </span>
              </div>

              {/* Button */}
              <motion.div
                whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600/50 to-purple-600/50 border border-blue-400/50 rounded-full text-white font-bold backdrop-blur-sm shadow-xl"
              >
                <span>استكشف القسم</span>
                <ArrowLeft className="w-5 h-5" />
              </motion.div>
            </div>

            {/* Floating Particles */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              animate={{
                background: [
                  'radial-gradient(circle at 15% 25%, rgba(255, 255, 255, 0.08) 0%, transparent 15%)',
                  'radial-gradient(circle at 85% 75%, rgba(255, 255, 255, 0.08) 0%, transparent 15%)',
                  'radial-gradient(circle at 15% 25%, rgba(255, 255, 255, 0.08) 0%, transparent 15%)',
                ]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default PlatformCategories;