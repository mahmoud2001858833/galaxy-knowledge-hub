
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Platform Card Component
const PlatformCard = ({ 
  title, 
  icon, 
  color, 
  path, 
  delay 
}: { 
  title: string; 
  icon: string; 
  color: string; 
  path: string;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.5 }}
      className="group"
    >
      <Link to={path} className="block">
        <div className="platform-card h-64 w-full sm:w-72 md:h-80 md:w-80">
          <div className="glow-effect" />
          <div 
            className="platform-icon"
            style={{ color }}
          >
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-white text-center mb-2">{title}</h3>
          <p className="text-white/70 text-center text-sm">استكشف عالم {title}</p>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <span className="px-4 py-1 rounded-full bg-white/10 text-white/80 text-xs">
              دخول المنصة
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Secondary Options Component
const SecondaryOption = ({ 
  title, 
  icon, 
  path, 
  delay 
}: { 
  title: string; 
  icon: string; 
  path: string;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay, duration: 0.5 }}
    >
      <Link to={path} className="flex items-center space-x-2 space-x-reverse bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors">
        <div className="text-2xl text-space-neon-blue">{icon}</div>
        <span className="text-white">{title}</span>
      </Link>
    </motion.div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col text-right" dir="rtl">
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section with Logo */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <motion.div
                className="absolute inset-0 rounded-full bg-space-neon-blue/10"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <img
                src="https://sdmntprsouthcentralus.oaiusercontent.com/files/00000000-0e58-61f7-8efe-aa9fd8a59c7a/raw?se=2025-05-03T13%3A50%3A25Z&sp=r&sv=2024-08-04&sr=b&scid=c725ed43-1deb-5989-ad2e-8e45df1c63ae&skoid=fa7966e7-f8ea-483c-919a-13acfd61d696&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-05-02T20%3A35%3A20Z&ske=2025-05-03T20%3A35%3A20Z&sks=b&skv=2024-08-04&sig=e3pTLmVb8mzHluQ3bC3Dx2uZJFMLr0fNdCRpCIS7XL0%3D"
                alt="فلك المعرفة"
                className="w-full h-full object-contain z-10 relative"
              />
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-space-neon-blue/0 via-space-neon-blue/10 to-space-deep-purple/0 rounded-full z-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute -inset-8 bg-gradient-to-r from-space-vivid-purple/0 via-space-vivid-purple/5 to-space-neon-blue/0 rounded-full z-0"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-space-neon-blue via-white to-space-vivid-purple">
            فلك المعرفة
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            منصة تعليمية تفاعلية تجمع بين المعرفة العلمية والتكنولوجيا الحديثة بتصميم فضائي مميز
          </p>
        </motion.div>
        
        {/* Main Platforms */}
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white mb-8 text-right"
          >
            منصات الصفحة
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            <PlatformCard 
              title="الكيمياء" 
              icon="🧪" 
              color="#33C3F0" 
              path="/chemistry" 
              delay={0.1}
            />
            <PlatformCard 
              title="الرياضيات" 
              icon="📐" 
              color="#9b87f5" 
              path="/mathematics" 
              delay={0.2}
            />
            <PlatformCard 
              title="الفيزياء" 
              icon="⚛️" 
              color="#F06292" 
              path="/physics" 
              delay={0.3}
            />
            <PlatformCard 
              title="الأحياء" 
              icon="🧬" 
              color="#66BB6A" 
              path="/biology" 
              delay={0.4}
            />
          </div>
        </div>
        
        {/* Secondary Options */}
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-white mb-8 text-right"
          >
            خيارات الصفحة
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SecondaryOption 
              title="الدردشة الذكية" 
              icon="💬" 
              path="/chat" 
              delay={0.6}
            />
            <SecondaryOption 
              title="تنظيم الوقت" 
              icon="🗓️" 
              path="/scheduler" 
              delay={0.7}
            />
            <SecondaryOption 
              title="المكتبة المرئية" 
              icon="🗄️" 
              path="/library" 
              delay={0.8}
            />
            <SecondaryOption 
              title="المجلة العلمية" 
              icon="📓" 
              path="/journal"
              delay={0.9}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
