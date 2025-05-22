
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const EducationalPlatforms = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  
  const platforms = [
    {
      title: t.platforms.physics,
      icon: "🔭",
      image: "https://www.chemixlab.com/wp-content/uploads/2024/01/Thomsons-Model-of-an-Atom-Atomic-Model-History-Limitations-Example.jpg",
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      hoverBorderColor: "hover:border-blue-500/50",
      link: "/physics"
    },
    {
      title: t.platforms.chemistry,
      icon: "🧪",
      image: "https://www.ra2ed.com/UserFiles/cq5dam.lcover.jpeg",
      color: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500/30",
      hoverBorderColor: "hover:border-purple-500/50",
      link: "/chemistry"
    },
    {
      title: t.platforms.biology,
      icon: "🧬",
      image: "https://th.bing.com/th/id/OIP.GmUR4ZRzF9gWiCj7wukbuwAAAA?cb=iwc2&rs=1&pid=ImgDetMain",
      color: "from-green-600/20 to-emerald-600/20",
      borderColor: "border-green-500/30",
      hoverBorderColor: "hover:border-green-500/50",
      link: "/biology"
    },
    {
      title: t.platforms.mathematics,
      icon: "🔢",
      image: "https://digital-brilliance.online/wp-content/uploads/2024/05/7bb1a96e-fbeb-4aac-8ce9-dde1e408f1a0.webp",
      color: "from-yellow-600/20 to-orange-600/20",
      borderColor: "border-yellow-500/30",
      hoverBorderColor: "hover:border-yellow-500/50",
      link: "/mathematics"
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
          {t.platforms.title}
        </h2>
        <div className="w-16 h-1 bg-blue-500/50 mx-auto mt-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platforms.map((platform, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
            onClick={() => navigate(platform.link)}
            className={`group relative h-[200px] md:h-[240px] rounded-xl overflow-hidden cursor-pointer ${platform.borderColor} ${platform.hoverBorderColor} border transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img 
                src={platform.image} 
                alt={platform.title} 
                className="w-full h-full object-cover object-center"
              />
              <div className={`absolute inset-0 bg-gradient-radial ${platform.color} opacity-90`}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-transparent"></div>
            </div>
            
            <div className="absolute inset-x-0 bottom-0 p-4 z-10 flex flex-col items-center text-center">
              <span className="text-3xl mb-1">
                {platform.icon}
              </span>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {platform.title}
              </h3>
              <button 
                className="px-4 py-1 bg-blue-600/30 border border-blue-500/50 rounded-full text-blue-300 text-sm hover:bg-blue-600/50 transition-colors mt-2"
              >
                {t.platforms.explore}
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

export default EducationalPlatforms;
