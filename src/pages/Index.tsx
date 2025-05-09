
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Atom, FlaskConical, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EducationalResources from '@/components/EducationalResources';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
        <motion.div 
          className="flex flex-col items-center justify-center max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mb-10 relative"
          >
            {/* Circular space-themed frame - reduced size */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-cyan-500/30 p-1 -m-2 blur-md"></div>
            <div className="absolute inset-0 rounded-full animate-pulse-glow opacity-50 bg-gradient-to-r from-cyan-500/20 via-blue-400/10 to-purple-600/20 -m-1"></div>
            
            {/* Animated ring - reduced size */}
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-blue-400/50 -m-1"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.7, 1, 0.7],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity,
                ease: "linear"
              }}
            ></motion.div>
            
            {/* Logo - reduced size */}
            <div className="w-40 h-40 md:w-44 md:h-44 rounded-full p-2 bg-blue-900/30 backdrop-blur-sm border border-blue-500/30 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-60"></div>
              <img 
                src="https://i.postimg.cc/mr48sKY6/image.png" 
                alt="فلك المعرفة" 
                className="w-36 h-36 md:w-40 md:h-40 object-contain object-center filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] z-10" 
              />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-500"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            فلك المعرفة
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white/70 text-center mb-12 max-w-2xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            منصة تفاعلية للتعلم الذكي في مجالات العلوم الأساسية
          </motion.p>
          
          {/* Subject Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.7 }}
          >
            {/* Mathematics */}
            <Link to="/mathematics">
              <Card className="h-64 overflow-hidden relative hover:border-blue-400/50 transition-all duration-300 hover:-translate-y-1 border-blue-500/20 rounded-2xl">
                <div className="absolute inset-0">
                  <img 
                    src="https://cdn.sotor.com/thumbs/fit630x300/21018/1578422030/%D8%AA%D8%B9%D8%B1%D9%8A%D9%81_%D8%B9%D9%84%D9%85_%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6%D9%8A%D8%A7%D8%AA.jpg" 
                    alt="الرياضيات"
                    className="w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/60 to-blue-900/80" />
                </div>
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-6 relative z-10">
                  <div className="mb-6 p-4 rounded-full bg-blue-900/50 backdrop-blur-sm">
                    <Calculator className="w-12 h-12 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">الرياضيات</h3>
                  <p className="text-white/90 mb-4">استكشف عالم الأرقام والمعادلات</p>
                  <span className="inline-block px-4 py-1 bg-blue-500/40 text-blue-100 text-sm rounded-full">
                    ابدأ التعلم
                  </span>
                </CardContent>
              </Card>
            </Link>
            
            {/* Physics */}
            <Link to="/physics">
              <Card className="h-64 overflow-hidden relative hover:border-purple-400/50 transition-all duration-300 hover:-translate-y-1 border-purple-500/20 rounded-2xl">
                <div className="absolute inset-0">
                  <img 
                    src="https://modo3.com/thumbs/fit630x300/11168/1630299222/%D8%AA%D8%B9%D8%B1%D9%8A%D9%81_%D8%B9%D9%84%D9%85_%D8%A7%D9%84%D9%81%D9%8A%D8%B2%D9%8A%D8%A7%D8%A1.jpg" 
                    alt="الفيزياء"
                    className="w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/60 to-purple-900/80" />
                </div>
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-6 relative z-10">
                  <div className="mb-6 p-4 rounded-full bg-purple-900/50 backdrop-blur-sm">
                    <Atom className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">الفيزياء</h3>
                  <p className="text-white/90 mb-4">تعرف على قوانين الكون والطاقة</p>
                  <span className="inline-block px-4 py-1 bg-purple-500/40 text-purple-100 text-sm rounded-full">
                    ابدأ التعلم
                  </span>
                </CardContent>
              </Card>
            </Link>
            
            {/* Chemistry */}
            <Link to="/chemistry">
              <Card className="h-64 overflow-hidden relative hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 border-cyan-500/20 rounded-2xl">
                <div className="absolute inset-0">
                  <img 
                    src="https://adminassets.devops.arabiaweather.com/sites/default/files/field/image/chemistry.jpg" 
                    alt="الكيمياء"
                    className="w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/60 to-cyan-900/80" />
                </div>
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-6 relative z-10">
                  <div className="mb-6 p-4 rounded-full bg-cyan-900/50 backdrop-blur-sm">
                    <FlaskConical className="w-12 h-12 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">الكيمياء</h3>
                  <p className="text-white/90 mb-4">اكتشف عالم المركبات والتفاعلات</p>
                  <span className="inline-block px-4 py-1 bg-cyan-500/40 text-cyan-100 text-sm rounded-full">
                    ابدأ التعلم
                  </span>
                </CardContent>
              </Card>
            </Link>
            
            {/* Biology */}
            <Link to="/biology">
              <Card className="h-64 overflow-hidden relative hover:border-green-400/50 transition-all duration-300 hover:-translate-y-1 border-green-500/20 rounded-2xl">
                <div className="absolute inset-0">
                  <img 
                    src="https://png.pngtree.com/thumb_back/fh260/background/20230704/pngtree-d-rendered-chromosomes-against-a-scientific-backdrop-exploring-life-and-biology-image_3739831.jpg" 
                    alt="الأحياء"
                    className="w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/60 to-green-900/80" />
                </div>
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-6 relative z-10">
                  <div className="mb-6 p-4 rounded-full bg-green-900/50 backdrop-blur-sm">
                    <Leaf className="w-12 h-12 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">الأحياء</h3>
                  <p className="text-white/90 mb-4">اكتشف أسرار الحياة والكائنات الحية</p>
                  <span className="inline-block px-4 py-1 bg-green-500/40 text-green-100 text-sm rounded-full">
                    ابدأ التعلم
                  </span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Add the Educational Resources section */}
        <EducationalResources />
      </main>
      
      <Footer />
      
      {/* Enhanced Starfield Animation with more stars and space elements */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white opacity-20 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Add some nebula-like elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/5 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute top-2/3 right-1/4 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>
    </div>
  );
};

export default Index;
