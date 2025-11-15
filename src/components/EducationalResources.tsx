
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BookIcon, CalendarDays, Puzzle, Video, Atom, Newspaper } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const EducationalResources = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  
  const resources = [
    {
      title: t.resources.studyOrganizer,
      icon: CalendarDays,
      description: t.resources.explorationTools,
      link: '/study-organization',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: t.resources.scientificJournals,
      icon: BookIcon,
      description: t.resources.explorationTools,
      link: '/scientific-journal',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: t.resources.visualLearning,
      icon: BookOpen,
      description: t.resources.explorationTools,
      link: '/visual-library',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: t.resources.educationalPuzzles,
      icon: Puzzle,
      description: t.resources.explorationTools,
      link: '/subject-puzzles',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: "التجارب العلمية",
      icon: Atom,
      description: "محاكاة وتجارب علمية تفاعلية",
      link: '/scientific-simulations',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      title: "الدروس المسجلة",
      icon: Video,
      description: "دروس مسجلة من المعلمين يمكن مشاهدتها في أي وقت",
      link: '/recorded-lessons',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: "مجلة مدرسة عنبه",
      icon: Newspaper,
      description: "آخر أخبار وفعاليات المدرسة",
      link: '/school-magazine',
      gradient: 'from-rose-500 to-pink-500'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "backOut"
      }
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.7 }}
      className="py-16 w-full max-w-7xl mx-auto px-4"
      dir={dir}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-16 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-500 mb-4">
          {t.resources.title}
        </h2>
        <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 mx-auto mt-6 rounded-full"></div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {resources.map((resource, index) => {
          const IconComponent = resource.icon;
          return (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(resource.link)}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-md cursor-pointer border-2 border-blue-500/30 hover:border-blue-400/60 transition-all duration-500 h-[280px]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Animated Background Gradient */}
              <motion.div 
                className="absolute inset-0 opacity-20"
                animate={{
                  background: [
                    `linear-gradient(135deg, transparent 0%, transparent 100%)`,
                    `linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, transparent 100%)`,
                    `linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.3) 100%)`,
                    `linear-gradient(135deg, transparent 0%, transparent 100%)`,
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {/* Content Container */}
              <div className="relative h-full p-8 flex flex-col items-center justify-center text-center z-10">
                {/* Icon with Gradient Background */}
                <motion.div 
                  className={`mb-6 p-6 rounded-2xl bg-gradient-to-br ${resource.gradient} shadow-2xl`}
                  whileHover={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1,
                    transition: { duration: 0.5 }
                  }}
                >
                  <IconComponent className="w-12 h-12 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                  {resource.title}
                </h3>
                
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  {resource.description}
                </p>
                
                {/* Arrow Indicator */}
                <motion.div
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
                  animate={{
                    y: [0, 8, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="text-blue-400 text-2xl">↓</div>
                </motion.div>
              </div>

              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className={`absolute inset-0 bg-gradient-to-tr ${resource.gradient} opacity-20 blur-xl`}></div>
              </div>

              {/* Shine Effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                initial={{ x: '-100%', skewX: -20 }}
                whileHover={{ 
                  x: '200%',
                  transition: { duration: 0.8, ease: "easeInOut" }
                }}
              >
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
};

export default EducationalResources;
