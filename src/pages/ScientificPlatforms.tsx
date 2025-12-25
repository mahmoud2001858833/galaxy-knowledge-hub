import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import scientificSimulationsImg from '@/assets/scientific-simulations-card.jpg';

const ScientificPlatforms = () => {
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
    },
    {
      title: "التجارب العلمية التفاعلية",
      icon: "🔬",
      image: scientificSimulationsImg,
      color: "from-cyan-600/20 to-purple-600/20",
      borderColor: "border-cyan-500/30",
      hoverBorderColor: "hover:border-cyan-500/50",
      link: "/scientific-simulations-hub"
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950`} dir={dir}>
      <SEO 
        title="المنصات العلمية"
        description="استكشف المنصات العلمية في فلك المعرفة - الفيزياء، الكيمياء، الأحياء، والرياضيات مع أدوات تفاعلية ومساعدين أذكياء للمنهاج الأردني"
        keywords="المنصات العلمية, الفيزياء, الكيمياء, الأحياء, الرياضيات, تعلم العلوم, المنهاج الأردني, منصات تعليمية علمية"
      />
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
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-500">
                {t.scientificPlatforms.title}
              </h1>
              <div className="w-16 h-1 bg-blue-500/50 mx-auto mb-4"></div>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                {t.scientificPlatforms.subtitle}
              </p>
            </div>
          </motion.div>

          {/* Platforms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                onClick={() => navigate(platform.link)}
                className={`group relative h-[200px] md:h-[240px] rounded-xl overflow-hidden cursor-pointer ${platform.borderColor} ${platform.hoverBorderColor} border transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105`}
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
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ScientificPlatforms;
