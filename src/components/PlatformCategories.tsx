
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Settings, GraduationCap, Brain } from 'lucide-react';

const PlatformCategories = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  
  const sections = [
    {
      id: 'management',
      title: 'قسم الإدارة',
      icon: <Settings className="w-8 h-8" />,
      color: 'from-amber-600/20 to-yellow-600/20',
      borderColor: 'border-amber-500/30',
      hoverBorderColor: 'hover:border-amber-500/60',
      platforms: [
        {
          title: t.platformCategories.communicationBridge,
          icon: "🌉",
          description: t.platformCategories.communicationBridgeDescription,
          image: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          color: "from-teal-600/20 to-cyan-600/20",
          borderColor: "border-teal-500/30",
          hoverBorderColor: "hover:border-teal-500/50",
          link: "/communication-bridge"
        },
        {
          title: "المشرفون والمعلمون",
          icon: "👨‍🏫",
          description: "منصة خاصة للمشرفين والمعلمين لإدارة المشاريع والمتابعة",
          image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          color: "from-amber-600/20 to-yellow-600/20",
          borderColor: "border-amber-500/30",
          hoverBorderColor: "hover:border-amber-500/50",
          link: "/administrators-teachers"
        }
      ]
    },
    {
      id: 'education',
      title: 'قسم التعليم',
      icon: <GraduationCap className="w-8 h-8" />,
      color: 'from-green-600/20 to-emerald-600/20',
      borderColor: 'border-green-500/30',
      hoverBorderColor: 'hover:border-green-500/60',
      platforms: [
        {
          title: t.platformCategories.environmental,
          icon: "🌱",
          description: t.platformCategories.environmentalDescription,
          image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          color: "from-green-600/20 to-emerald-600/20",
          borderColor: "border-green-500/30",
          hoverBorderColor: "hover:border-green-500/50",
          link: "/environmental-sustainability"
        },
        {
          title: "بتك BTEC",
          icon: "💻",
          description: "منصة التعليم المهني - تكنولوجيا المعلومات، البرمجة، والتطوير",
          image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          color: "from-orange-600/20 to-red-600/20",
          borderColor: "border-orange-500/30",
          hoverBorderColor: "hover:border-orange-500/50",
          link: "/btec"
        },
        {
          title: t.platformCategories.literary,
          icon: "📚",
          description: t.platformCategories.literaryDescription,
          image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          color: "from-purple-600/20 to-pink-600/20",
          borderColor: "border-purple-500/30",
          hoverBorderColor: "hover:border-purple-500/50",
          link: "/literary-platforms"
        }
      ]
    },
    {
      id: 'ai-assistant',
      title: 'قسم مساعدك الذكي',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-purple-600/20 to-indigo-600/20',
      borderColor: 'border-purple-500/30',
      hoverBorderColor: 'hover:border-purple-500/60',
      platforms: [
        {
          title: "مرشدك النفسي",
          icon: "💙",
          description: "دعم نفسي ذكي يساعدك في فهم مشاعرك ويوجهك للقسم المناسب",
          image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          color: "from-pink-600/20 to-purple-600/20",
          borderColor: "border-pink-500/30",
          hoverBorderColor: "hover:border-pink-500/50",
          link: "/psychological-guide"
        },
        {
          title: t.platformCategories.falakAI,
          icon: "🌌",
          description: t.platformCategories.falakAIDescription,
          image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          color: "from-indigo-600/20 to-purple-600/20",
          borderColor: "border-indigo-500/30",
          hoverBorderColor: "hover:border-indigo-500/50",
          link: "/falak-knowledge-ai"
        },
        {
          title: t.platformCategories.scientific,
          icon: "🔬",
          description: t.platformCategories.scientificDescription,
          image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          color: "from-blue-600/20 to-cyan-600/20",
          borderColor: "border-blue-500/30",
          hoverBorderColor: "hover:border-blue-500/50",
          link: "/scientific-platforms"
        }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "backOut"
      }
    }
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-16 w-full max-w-7xl mx-auto px-4"
      dir={dir}
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-500 mb-4">
          {t.platformCategories.title}
        </h2>
        <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 mx-auto mt-6 rounded-full"></div>
        <p className="text-white/70 mt-6 max-w-2xl mx-auto text-lg">
          {t.platformCategories.subtitle}
        </p>
      </motion.div>

      <div className="space-y-16">
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={section.id}
            variants={sectionVariants}
            className="space-y-6"
          >
            {/* Section Header */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sectionIndex * 0.3, duration: 0.6 }}
              className={`flex items-center gap-4 mb-8 p-6 rounded-2xl bg-gradient-to-r ${section.color} border ${section.borderColor} backdrop-blur-sm`}
            >
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                {section.icon}
              </div>
              <h3 className="text-3xl font-bold text-white">{section.title}</h3>
            </motion.div>

            {/* Platforms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.platforms.map((platform, platformIndex) => (
                <motion.div
                  key={platformIndex}
                  variants={cardVariants}
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 5,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(platform.link)}
                  className={`group relative h-[320px] rounded-2xl overflow-hidden cursor-pointer ${platform.borderColor} ${platform.hoverBorderColor} border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Background Image with Parallax Effect */}
                  <motion.div 
                    className="absolute inset-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <img 
                      src={platform.image} 
                      alt={platform.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-radial ${platform.color} opacity-90`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-950/50 to-transparent"></div>
                  </motion.div>
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 z-10 flex flex-col justify-center items-center text-center">
                    <motion.span 
                      className="text-6xl mb-6"
                      whileHover={{ 
                        scale: 1.2, 
                        rotate: 360,
                        transition: { duration: 0.6 }
                      }}
                    >
                      {platform.icon}
                    </motion.span>
                    
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors duration-300">
                      {platform.title}
                    </h4>
                    
                    <p className="text-white/80 text-sm mb-6 leading-relaxed px-2">
                      {platform.description}
                    </p>
                    
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600/40 to-cyan-600/40 border border-blue-400/50 rounded-full text-blue-200 hover:bg-blue-600/60 transition-all duration-300 font-semibold backdrop-blur-sm"
                    >
                      {t.platformCategories.explore}
                    </motion.button>
                  </div>
                  
                  {/* Animated Glow Effect */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    animate={{
                      background: [
                        'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                        'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  ></motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default PlatformCategories;
