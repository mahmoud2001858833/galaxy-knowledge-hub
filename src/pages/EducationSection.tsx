import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, GraduationCap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import educationBg from '@/assets/education-section.jpg';

const EducationSection = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const platforms = [
    {
      title: t.platformCategories.environmental,
      icon: "🌱",
      description: t.platformCategories.environmentalDescription,
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-green-600/20 to-emerald-600/20",
      borderColor: "border-green-500/30",
      link: "/environmental-sustainability"
    },
    {
      title: "بتك BTEC",
      icon: "💻",
      description: "منصة التعليم المهني - تكنولوجيا المعلومات، البرمجة، والتطوير",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-orange-600/20 to-red-600/20",
      borderColor: "border-orange-500/30",
      link: "/btec"
    },
    {
      title: t.platformCategories.literary,
      icon: "📚",
      description: t.platformCategories.literaryDescription,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500/30",
      link: "/literary-platforms"
    },
    {
      title: t.platformCategories.scientific,
      icon: "🔬",
      description: t.platformCategories.scientificDescription,
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      link: "/scientific-platforms"
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
            src={educationBg} 
            alt="Education Section"
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
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6 p-6 rounded-full bg-green-500/20 backdrop-blur-sm"
            >
              <GraduationCap className="w-16 h-16 text-green-400" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              قسم التعليم
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8">
              منصات تعليمية شاملة في جميع المجالات
            </p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "12rem" }}
              transition={{ duration: 1, delay: 0.8 }}
              className="h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 mx-auto rounded-full"
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  type: "spring"
                }}
                whileHover={{ scale: 1.05, y: -10 }}
                onClick={() => navigate(platform.link)}
                className={`group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer border-2 ${platform.borderColor} transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/40`}
              >
                {/* Background Image */}
                <motion.div 
                  className="absolute inset-0"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.6 }}
                >
                  <img 
                    src={platform.image} 
                    alt={platform.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-90`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-950/60 to-transparent" />
                </motion.div>

                {/* Content */}
                <div className="absolute inset-0 p-6 z-10 flex flex-col justify-end items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.3, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="text-7xl mb-4 filter drop-shadow-2xl"
                  >
                    {platform.icon}
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors">
                    {platform.title}
                  </h3>

                  <p className="text-white/80 text-sm leading-relaxed mb-4">
                    {platform.description}
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600/50 to-emerald-600/50 border border-green-400/50 rounded-full text-white text-sm font-semibold backdrop-blur-sm"
                  >
                    <span>استكشف</span>
                    <ArrowRight className="w-4 h-4" />
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

export default EducationSection;