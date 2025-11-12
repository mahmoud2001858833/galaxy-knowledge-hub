import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, Brain } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import aiAssistantBg from '@/assets/ai-assistant-section.jpg';

const AIAssistantSection = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const platforms = [
    {
      title: "مرشدك النفسي",
      icon: "💙",
      description: "دعم نفسي ذكي يساعدك في فهم مشاعرك ويوجهك للقسم المناسب",
      image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-pink-600/20 to-purple-600/20",
      borderColor: "border-pink-500/30",
      link: "/psychological-guide"
    },
    {
      title: t.platformCategories.falakAI,
      icon: "🌌",
      description: t.platformCategories.falakAIDescription,
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-indigo-600/20 to-purple-600/20",
      borderColor: "border-indigo-500/30",
      link: "/falak-knowledge-ai"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden" dir={dir}>
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src={aiAssistantBg} 
            alt="AI Assistant Section"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/50 to-transparent" />
        </motion.div>

        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="inline-block mb-6 p-6 rounded-full bg-purple-500/20 backdrop-blur-sm"
            >
              <Brain className="w-16 h-16 text-purple-400" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              قسم مساعدك الذكي
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8">
              مساعدون أذكياء لدعمك في رحلتك التعليمية
            </p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "12rem" }}
              transition={{ duration: 1, delay: 0.8 }}
              className="h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-500 mx-auto rounded-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Platforms Grid */}
      <section className="py-20 px-4" dir={dir}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, rotateX: -45 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.05, rotateX: 5 }}
                onClick={() => navigate(platform.link)}
                className={`group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer border-2 ${platform.borderColor} transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/40`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Background Image */}
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
                  <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-90`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-950/50 to-transparent" />
                </motion.div>

                {/* Glow Effect */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Content */}
                <div className="absolute inset-0 p-8 z-10 flex flex-col justify-center items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.3, rotate: [0, -15, 15, -15, 0] }}
                    transition={{ duration: 0.6 }}
                    className="text-8xl mb-6 filter drop-shadow-2xl"
                  >
                    {platform.icon}
                  </motion.div>

                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                    {platform.title}
                  </h3>

                  <p className="text-white/90 text-lg leading-relaxed mb-6 max-w-md">
                    {platform.description}
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(168, 85, 247, 0.6)" }}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600/50 to-indigo-600/50 border border-purple-400/50 rounded-full text-white font-semibold backdrop-blur-sm"
                  >
                    <span>استكشف الآن</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIAssistantSection;