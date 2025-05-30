
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const PlatformCategories = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  
  const categories = [
    {
      title: t.platformCategories.scientific,
      icon: "🔬",
      description: t.platformCategories.scientificDescription,
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      hoverBorderColor: "hover:border-blue-500/50",
      link: "/scientific-platforms"
    },
    {
      title: t.platformCategories.literary,
      icon: "📚",
      description: t.platformCategories.literaryDescription,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSFj1QS-_1v4Ha7SJrFEW5JswcI6L4G5psQg&s",
      color: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500/30",
      hoverBorderColor: "hover:border-purple-500/50",
      link: "/literary-platforms"
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.7 }}
      className="py-12 w-full max-w-6xl mx-auto"
      dir={dir}
    >
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-500">
          {t.platformCategories.title}
        </h2>
        <div className="w-16 h-1 bg-blue-500/50 mx-auto mt-4"></div>
        <p className="text-white/70 mt-4 max-w-2xl mx-auto">
          {t.platformCategories.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {categories.map((category, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 + index * 0.2, duration: 0.5 }}
            onClick={() => navigate(category.link)}
            className={`group relative h-[280px] md:h-[320px] rounded-xl overflow-hidden cursor-pointer ${category.borderColor} ${category.hoverBorderColor} border transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img 
                src={category.image} 
                alt={category.title} 
                className="w-full h-full object-cover object-center"
              />
              <div className={`absolute inset-0 bg-gradient-radial ${category.color} opacity-90`}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-transparent"></div>
            </div>
            
            <div className="absolute inset-0 p-6 z-10 flex flex-col justify-center items-center text-center">
              <span className="text-5xl md:text-6xl mb-4">
                {category.icon}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                {category.title}
              </h3>
              <p className="text-white/80 text-sm md:text-base mb-6 leading-relaxed">
                {category.description}
              </p>
              <button 
                className="px-6 py-2 bg-blue-600/30 border border-blue-500/50 rounded-full text-blue-300 hover:bg-blue-600/50 transition-all duration-300 hover:scale-105"
              >
                {t.platformCategories.explore}
              </button>
            </div>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-blue-400/10 to-blue-500/0"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-400/20 to-transparent"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default PlatformCategories;
