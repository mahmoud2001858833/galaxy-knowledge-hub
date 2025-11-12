import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import managementBg from '@/assets/management-section.jpg';

const clickSound = '/message-notification.mp3';

const ManagementSection = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };
  const { t, dir } = useLanguage();

  const platforms = [
    {
      title: t.platformCategories.communicationBridge,
      icon: "🌉",
      description: t.platformCategories.communicationBridgeDescription,
      image: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-teal-600/20 to-cyan-600/20",
      borderColor: "border-teal-500/30",
      link: "/communication-bridge"
    },
    {
      title: "المشرفون والمعلمون",
      icon: "👨‍🏫",
      description: "منصة خاصة للمشرفين والمعلمين لإدارة المشاريع والمتابعة",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-amber-600/20 to-yellow-600/20",
      borderColor: "border-amber-500/30",
      link: "/administrators-teachers"
    }
  ];

  return (
    <div className="min-h-screen relative" dir={dir}>
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={managementBg} 
          alt="Management Section"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/85 to-blue-950/90" />
      </div>

      <Navbar />
      <audio ref={audioRef} src={clickSound} preload="auto" />

      {/* Platforms Grid */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              قسم الإدارة
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-amber-500 to-yellow-500 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.5 + index * 0.15,
                }}
                whileHover={{ y: -10 }}
                onClick={() => {
                  playSound();
                  navigate(platform.link);
                }}
                className={`group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer border-2 ${platform.borderColor} transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/40`}
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
                      'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 50%, rgba(251, 191, 36, 0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.4) 0%, transparent 50%)',
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

                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-amber-300 transition-colors">
                    {platform.title}
                  </h3>

                  <p className="text-white/90 text-lg leading-relaxed mb-6 max-w-md">
                    {platform.description}
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(251, 191, 36, 0.6)" }}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-600/50 to-yellow-600/50 border border-amber-400/50 rounded-full text-white font-semibold backdrop-blur-sm"
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

export default ManagementSection;