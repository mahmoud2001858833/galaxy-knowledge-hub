import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Settings, GraduationCap, Brain, ChevronDown } from 'lucide-react';

const PlatformCategories = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const sections = [
    {
      id: 'management',
      title: 'قسم الإدارة',
      icon: Settings,
      color: 'from-amber-600/20 to-yellow-600/20',
      borderColor: 'border-amber-500/30',
      glowColor: 'shadow-amber-500/50',
      iconBg: 'bg-amber-500/20',
      platforms: [
        {
          title: t.platformCategories.communicationBridge,
          icon: "🌉",
          description: t.platformCategories.communicationBridgeDescription,
          color: "from-teal-600/20 to-cyan-600/20",
          borderColor: "border-teal-500/30",
          link: "/communication-bridge"
        },
        {
          title: "المشرفون والمعلمون",
          icon: "👨‍🏫",
          description: "منصة خاصة للمشرفين والمعلمين لإدارة المشاريع والمتابعة",
          color: "from-amber-600/20 to-yellow-600/20",
          borderColor: "border-amber-500/30",
          link: "/administrators-teachers"
        }
      ]
    },
    {
      id: 'education',
      title: 'قسم التعليم',
      icon: GraduationCap,
      color: 'from-green-600/20 to-emerald-600/20',
      borderColor: 'border-green-500/30',
      glowColor: 'shadow-green-500/50',
      iconBg: 'bg-green-500/20',
      platforms: [
        {
          title: t.platformCategories.environmental,
          icon: "🌱",
          description: t.platformCategories.environmentalDescription,
          color: "from-green-600/20 to-emerald-600/20",
          borderColor: "border-green-500/30",
          link: "/environmental-sustainability"
        },
        {
          title: "بتك BTEC",
          icon: "💻",
          description: "منصة التعليم المهني - تكنولوجيا المعلومات، البرمجة، والتطوير",
          color: "from-orange-600/20 to-red-600/20",
          borderColor: "border-orange-500/30",
          link: "/btec"
        },
        {
          title: t.platformCategories.literary,
          icon: "📚",
          description: t.platformCategories.literaryDescription,
          color: "from-purple-600/20 to-pink-600/20",
          borderColor: "border-purple-500/30",
          link: "/literary-platforms"
        },
        {
          title: t.platformCategories.scientific,
          icon: "🔬",
          description: t.platformCategories.scientificDescription,
          color: "from-blue-600/20 to-cyan-600/20",
          borderColor: "border-blue-500/30",
          link: "/scientific-platforms"
        }
      ]
    },
    {
      id: 'ai-assistant',
      title: 'قسم مساعدك الذكي',
      icon: Brain,
      color: 'from-purple-600/20 to-indigo-600/20',
      borderColor: 'border-purple-500/30',
      glowColor: 'shadow-purple-500/50',
      iconBg: 'bg-purple-500/20',
      platforms: [
        {
          title: "مرشدك النفسي",
          icon: "💙",
          description: "دعم نفسي ذكي يساعدك في فهم مشاعرك ويوجهك للقسم المناسب",
          color: "from-pink-600/20 to-purple-600/20",
          borderColor: "border-pink-500/30",
          link: "/psychological-guide"
        },
        {
          title: t.platformCategories.falakAI,
          icon: "🌌",
          description: t.platformCategories.falakAIDescription,
          color: "from-indigo-600/20 to-purple-600/20",
          borderColor: "border-indigo-500/30",
          link: "/falak-knowledge-ai"
        }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const sectionHeaderVariants = {
    hidden: { 
      opacity: 0, 
      y: 100,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    }
  };

  const platformCardVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.5,
      rotateY: -90
    },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: i * 0.1,
        duration: 0.6
      }
    }),
    exit: {
      opacity: 0,
      scale: 0.5,
      rotateY: 90,
      transition: {
        duration: 0.3
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="py-20 w-full max-w-7xl mx-auto px-4"
      dir={dir}
    >
      <motion.div 
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 1 
        }}
        className="mb-20 text-center relative"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl"
        />
        
        <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-6 relative z-10">
          {t.platformCategories.title}
        </h2>
        
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: "8rem" }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 mx-auto rounded-full shadow-lg shadow-blue-500/50"
        />
        
        <p className="text-white/80 mt-8 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed relative z-10">
          {t.platformCategories.subtitle}
        </p>
      </motion.div>

      <div className="space-y-8">
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={section.id}
            variants={sectionHeaderVariants}
            className="relative"
          >
            {/* Section Header - Clickable */}
            <motion.button
              onClick={() => toggleSection(section.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-r ${section.color} border-2 ${section.borderColor} backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:${section.glowColor} relative overflow-hidden group`}
            >
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              <div className="flex items-center gap-6 relative z-10">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className={`p-5 rounded-2xl ${section.iconBg} backdrop-blur-sm shadow-lg`}
                >
                  <section.icon className="w-10 h-10 text-white" />
                </motion.div>
                
                <div className="text-right">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {section.title}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {section.platforms.length} منصات متاحة
                  </p>
                </div>
              </div>

              <motion.div
                animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <ChevronDown className="w-8 h-8 text-white/80" />
              </motion.div>
            </motion.button>

            {/* Platforms Grid - Expandable */}
            <AnimatePresence>
              {expandedSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 px-2">
                    {section.platforms.map((platform, platformIndex) => (
                      <motion.div
                        key={platformIndex}
                        custom={platformIndex}
                        variants={platformCardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ 
                          scale: 1.05,
                          rotateY: 5,
                          z: 50
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(platform.link)}
                        className={`group relative h-[280px] rounded-3xl overflow-hidden cursor-pointer ${platform.borderColor} border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/40`}
                        style={{ 
                          transformStyle: 'preserve-3d',
                          perspective: '1000px'
                        }}
                      >
                        {/* Animated Background Gradient */}
                        <motion.div 
                          className={`absolute inset-0 bg-gradient-to-br ${platform.color}`}
                          animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-950/50 to-transparent backdrop-blur-sm" />
                        
                        {/* Glow Effect */}
                        <motion.div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                          animate={{
                            background: [
                              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
                              'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
                              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
                            ]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        
                        {/* Content */}
                        <div className="absolute inset-0 p-6 z-10 flex flex-col justify-center items-center text-center">
                          <motion.div
                            whileHover={{ 
                              scale: 1.3,
                              rotate: [0, -10, 10, -10, 0],
                            }}
                            transition={{ duration: 0.5 }}
                            className="text-7xl mb-5 filter drop-shadow-2xl"
                          >
                            {platform.icon}
                          </motion.div>
                          
                          <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                            {platform.title}
                          </h4>
                          
                          <p className="text-white/90 text-sm leading-relaxed px-2 mb-5">
                            {platform.description}
                          </p>
                          
                          <motion.div
                            whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)" }}
                            whileTap={{ scale: 0.9 }}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600/50 to-purple-600/50 border border-blue-400/50 rounded-full text-blue-100 font-semibold backdrop-blur-sm shadow-lg"
                          >
                            {t.platformCategories.explore}
                          </motion.div>
                        </div>

                        {/* Particles Effect */}
                        <motion.div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100"
                          animate={{
                            background: [
                              'radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 20%)',
                              'radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 20%)',
                              'radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 20%)',
                            ]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default PlatformCategories;