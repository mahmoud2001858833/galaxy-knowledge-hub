import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ChevronLeft, Settings, GraduationCap, Sparkles, Building2, Trees, HeartHandshake } from 'lucide-react';
import managementBg from '@/assets/management-section.jpg';
import educationBg from '@/assets/education-section.jpg';
import aiAssistantBg from '@/assets/ai-assistant-section.jpg';
import tawjihiLogo from '@/assets/tawjihi-logo.jpg';

const clickSound = '/message-notification.mp3';

const PlatformCategories = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };
  const { t, dir } = useLanguage();
  
  const categories = [
    {
      id: 'management',
      title: 'قسم الإدارة',
      icon: Settings,
      description: 'إدارة شاملة ومتكاملة للمنصة التعليمية',
      gradient: 'from-amber-600/20 to-yellow-600/20',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      glowColor: 'shadow-amber-500/50',
      link: '/management-section',
      platformsCount: 3,
      image: managementBg
    },
    {
      id: 'education',
      title: 'قسم التعليم',
      icon: GraduationCap,
      description: 'منصات تعليمية شاملة في جميع المجالات',
      gradient: 'from-green-600/20 to-emerald-600/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
      glowColor: 'shadow-green-500/50',
      link: '/education-section',
      platformsCount: 4,
      image: educationBg
    },
    {
      id: 'experiments',
      title: 'قسم التجارب',
      icon: GraduationCap,
      description: 'تجارب علمية تفاعلية متطورة في جميع المواد العلمية',
      gradient: 'from-cyan-600/20 to-purple-600/20',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      glowColor: 'shadow-cyan-500/50',
      link: '/experiments-section',
      platformsCount: 49,
      image: educationBg
    },
    {
      id: 'tawjihi',
      title: 'قسم التوجيهي',
      icon: GraduationCap,
      description: 'منصة شاملة لطلاب التوجيهي - جميع المواد والصفوف',
      gradient: 'from-orange-600/20 to-yellow-600/20',
      borderColor: 'border-orange-500/30',
      iconColor: 'text-orange-400',
      glowColor: 'shadow-orange-500/50',
      link: '/jordan-tawjihi',
      platformsCount: 4,
      customImage: true
    },
    {
      id: 'ai-assistant',
      title: 'قسم مساعدك الذكي',
      icon: Sparkles,
      description: 'مساعدون أذكياء لدعمك في رحلتك التعليمية',
      gradient: 'from-purple-600/20 to-indigo-600/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      glowColor: 'shadow-purple-500/50',
      link: '/ai-assistant-section',
      platformsCount: 2,
      image: aiAssistantBg
    },
    {
      id: 'smart-city',
      title: 'قسم المدينة الذكية',
      icon: Building2,
      description: 'منصات معمارية وتصميمية تعتمد على الذكاء الاصطناعي',
      gradient: 'from-cyan-600/20 to-blue-600/20',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
      glowColor: 'shadow-cyan-500/50',
      link: '/smart-city',
      platformsCount: 3,
      image: educationBg
    },
    {
      id: 'memory-tree',
      title: 'شجرة الذاكرة',
      icon: Trees,
      description: 'مشروع تفاعلي يجسّد المفاهيم الستة للذكاء الاصطناعي عبر شجرة ميكانيكية مُعاد تدويرها',
      gradient: 'from-emerald-700/30 to-amber-600/30',
      borderColor: 'border-amber-500/40',
      iconColor: 'text-amber-400',
      glowColor: 'shadow-amber-500/50',
      link: '/memory-tree',
      platformsCount: 1,
      image: '/memory-tree/memory-tree-hero.jpg'
    },
    {
      id: 'damij',
      title: 'دامج — التعليم الخاص الذكي',
      icon: HeartHandshake,
      description: 'منصة مستقلة لدمج بريل، تشخيص وعلاج التوحد، والتشخيص التفريقي لـ ADHD',
      gradient: 'from-sky-600/30 to-teal-600/30',
      borderColor: 'border-teal-500/40',
      iconColor: 'text-teal-300',
      glowColor: 'shadow-teal-500/50',
      link: '/damij',
      platformsCount: 3,
      image: educationBg
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="py-20 w-full max-w-7xl mx-auto px-4"
      dir={dir}
    >
      <audio ref={audioRef} src={clickSound} preload="auto" />
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
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
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                duration: 0.6,
                delay: index * 0.2,
                ease: "easeOut"
              }}
              onClick={() => {
                playSound();
                navigate(category.link);
              }}
              className={`group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer border-2 ${category.borderColor} transition-all duration-300 hover:shadow-2xl ${category.glowColor}`}
            >
              {/* Background Image */}
              <motion.div
                className="absolute inset-0"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src={category.customImage ? tawjihiLogo : category.image} 
                  alt={category.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90`} />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-950/60 to-transparent" />
              </motion.div>
              
              {/* Animated Glow Effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{
                  background: [
                    `radial-gradient(circle at 20% 50%, ${category.iconColor.replace('text-', 'rgba(')}, 0.3) 0%, transparent 50%)`,
                    `radial-gradient(circle at 80% 50%, ${category.iconColor.replace('text-', 'rgba(')}, 0.3) 0%, transparent 50%)`,
                    `radial-gradient(circle at 20% 50%, ${category.iconColor.replace('text-', 'rgba(')}, 0.3) 0%, transparent 50%)`,
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Content */}
              <div className="relative z-10 h-full p-8 flex flex-col items-center justify-center text-center">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`mb-6 p-6 rounded-full bg-white/10 backdrop-blur-sm border-2 ${category.borderColor}`}
                >
                  <IconComponent className={`w-16 h-16 ${category.iconColor}`} />
                </motion.div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:scale-105 transition-transform">
                  {category.title}
                </h3>

                {/* Description */}
                <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-md">
                  {category.description}
                </p>

                {/* Platform Count Badge */}
                <div className="mb-6 px-6 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                  <span className="text-white font-semibold">
                    {category.platformsCount} منصات
                  </span>
                </div>

                {/* Explore Button */}
                <motion.button
                  whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(255, 255, 255, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-8 py-3 bg-white/20 hover:bg-white/30 border border-white/40 rounded-full text-white font-bold backdrop-blur-sm transition-all"
                >
                  <span>استكشف القسم</span>
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Floating Particles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full ${category.iconColor.replace('text-', 'bg-')}`}
                  animate={{
                    y: [0, -100, 0],
                    x: [0, Math.random() * 50 - 25, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  style={{
                    bottom: '20%',
                    left: `${30 + i * 20}%`,
                  }}
                />
              ))}
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

export default PlatformCategories;