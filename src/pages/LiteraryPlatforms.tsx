import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import arabicCalligraphy from '@/assets/arabic-calligraphy.jpg';

const LiteraryPlatforms = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  
  const platforms = [
    {
      title: t.literaryPlatforms.arabic,
      icon: "🎭",
      image: arabicCalligraphy,
      color: "from-amber-600/20 to-orange-600/20",
      borderColor: "border-amber-500/30",
      hoverBorderColor: "hover:border-amber-500/50",
      description: t.literaryPlatforms.arabicDescription,
      link: "https://alarobh.store/",
      isExternal: true
    },
    {
      title: t.literaryPlatforms.english,
      icon: "🌍",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80",
      color: "from-indigo-600/20 to-purple-600/20",
      borderColor: "border-indigo-500/30",
      hoverBorderColor: "hover:border-indigo-500/50",
      description: t.literaryPlatforms.englishDescription,
      link: "/english-language",
      isExternal: false
    },
    {
      title: "التربية الإسلامية",
      icon: "🕌",
      image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop",
      color: "from-emerald-600/20 to-teal-600/20",
      borderColor: "border-emerald-500/30",
      hoverBorderColor: "hover:border-emerald-500/50",
      description: "استكشف التاريخ الإسلامي والأحداث الهجرية وقارن بين الفترات التاريخية",
      link: "/islamic-education",
      isExternal: false
    }
  ];

  const handlePlatformClick = (platform: typeof platforms[0]) => {
    if (platform.isExternal) {
      window.open(platform.link, '_blank', 'noopener,noreferrer');
    } else {
      navigate(platform.link);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col text-right bg-gradient-to-b from-purple-900/40 to-purple-950`} dir={dir}>
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header with back button */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              {t.common.back}
            </button>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-purple-500">
                {t.literaryPlatforms.title}
              </h1>
              <div className="w-16 h-1 bg-purple-500/50 mx-auto mb-4"></div>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                {t.literaryPlatforms.subtitle}
              </p>
            </div>
          </motion.div>

          {/* Platforms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.2, duration: 0.5 }}
                onClick={() => handlePlatformClick(platform)}
                className={`group relative h-[300px] md:h-[350px] rounded-xl overflow-hidden cursor-pointer ${platform.borderColor} ${platform.hoverBorderColor} border transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-105`}
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                  <img 
                    src={platform.image} 
                    alt={platform.title} 
                    className="w-full h-full object-cover object-center"
                  />
                  <div className={`absolute inset-0 bg-gradient-radial ${platform.color} opacity-90`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 to-transparent"></div>
                </div>
                
                <div className="absolute inset-0 p-6 z-10 flex flex-col justify-center items-center text-center">
                  <span className="text-5xl md:text-6xl mb-4">
                    {platform.icon}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                    {platform.title}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base mb-6 leading-relaxed">
                    {platform.description}
                  </p>
                  <button 
                    className="px-6 py-2 bg-purple-600/30 border border-purple-500/50 rounded-full text-purple-300 hover:bg-purple-600/50 transition-all duration-300 hover:scale-105"
                  >
                    {t.platforms.explore}
                  </button>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/0 via-purple-400/10 to-purple-500/0"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-400/20 to-transparent"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LiteraryPlatforms;
