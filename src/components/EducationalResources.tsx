
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BookIcon, CalendarDays, Puzzle, MessageSquare, Video } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const EducationalResources = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  
  const resources = [
    {
      title: t.resources.studyOrganizer,
      icon: <CalendarDays className="h-6 w-6 text-blue-400" />,
      description: t.resources.explorationTools,
      link: '/study-organization'
    },
    {
      title: t.resources.scientificJournals,
      icon: <BookIcon className="h-6 w-6 text-blue-400" />,
      description: t.resources.explorationTools,
      link: '/scientific-journal'
    },
    {
      title: t.resources.visualLearning,
      icon: <BookOpen className="h-6 w-6 text-blue-400" />,
      description: t.resources.explorationTools,
      link: '/visual-library'
    },
    {
      title: t.resources.educationalPuzzles,
      icon: <Puzzle className="h-6 w-6 text-blue-400" />,
      description: t.resources.explorationTools,
      link: '/subject-puzzles'
    },
    {
      title: t.resources.chatRooms,
      icon: <MessageSquare className="h-6 w-6 text-blue-400" />,
      description: t.resources.explorationTools,
      link: '/chat-rooms'
    },
    {
      title: t.resources.educationalVideos,
      icon: <Video className="h-6 w-6 text-blue-400" />,
      description: t.resources.explorationTools,
      link: '/educational-videos'
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.7 }}
      className="py-12 w-full max-w-6xl mx-auto"
      dir={dir}
    >
      <div className={`mb-10 text-center`}>
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-500">
          {t.resources.title}
        </h2>
        <div className="w-16 h-1 bg-blue-500/50 mx-auto mt-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {resources.map((resource, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
            onClick={() => navigate(resource.link)}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-blue-900/30 to-blue-950/60 p-5 backdrop-blur-sm cursor-pointer border border-blue-500/20 hover:border-blue-500/40 transition-all h-full"
          >
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-blue-400/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className={`flex ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'} items-center mb-4`}>
              <div className="p-2 rounded-full bg-blue-900/50 flex-shrink-0">
                {resource.icon}
              </div>
              <h3 className={`${dir === 'rtl' ? 'mr-3' : 'ml-3'} text-xl font-semibold text-white group-hover:text-blue-300 transition-colors`}>
                {resource.title}
              </h3>
            </div>
            
            <p className="text-white/70 mb-4 text-sm">
              {resource.description}
            </p>
            
            <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
              <span className="text-blue-400 text-sm group-hover:text-blue-300 transition-colors flex items-center">
                {t.resources.viewMore} 
                {dir === 'rtl' ? 
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg> : 
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                }
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default EducationalResources;
