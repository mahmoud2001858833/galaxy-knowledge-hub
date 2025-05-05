
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Microscope, Atom, FlaskConical, Magnet } from 'lucide-react';
import PhysicsScientists from '@/components/physics/PhysicsScientists';
import PhysicsPuzzles from '@/components/physics/PhysicsPuzzles';
import PhysicsAIAssistant from '@/components/physics/PhysicsAIAssistant';

const Physics = () => {
  const [showMainContent, setShowMainContent] = useState(false);
  const [selectedTab, setSelectedTab] = useState("puzzles");
  const navigate = useNavigate();
  
  // Floating physics symbols with reduced animation for performance
  const physicsSymbols = [
    { symbol: "E=mc²", top: "15%", left: "8%", size: "text-4xl", animationDelay: "0s" },
    { symbol: "⚛", top: "25%", left: "92%", size: "text-5xl", animationDelay: "0.5s" },
    { symbol: "Ω", top: "70%", left: "5%", size: "text-5xl", animationDelay: "1s" },
    { symbol: "∆", top: "80%", left: "93%", size: "text-4xl", animationDelay: "1.5s" },
    { symbol: "λ", top: "40%", left: "7%", size: "text-3xl", animationDelay: "2s" },
    { symbol: "∞", top: "50%", left: "95%", size: "text-5xl", animationDelay: "2.5s" }
  ];
  
  if (!showMainContent) {
    return (
      <div className="min-h-screen flex flex-col text-right bg-space-cosmic-black" dir="rtl">
        <StarField starCount={200} speed={0.2} />
        <Navbar />
        
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-12 max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-glow-purple">
              عالم الفيزياء
            </h1>
            
            {/* Magnetic Field Animation */}
            <div className="relative h-80 mb-12">
              <motion.div 
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-subject-physics-primary/10 rounded-full blur-3xl transform scale-150 animate-pulse-glow"></div>
                  <div className="absolute inset-0 bg-subject-physics-primary/5 rounded-full blur-2xl transform scale-[2] animate-pulse-glow animation-delay-200"></div>
                  <div className="absolute inset-0 bg-subject-physics-primary/5 rounded-full blur-xl transform scale-[2.5] animate-pulse-glow animation-delay-400"></div>
                  
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="relative z-10"
                  >
                    <Magnet className="h-24 w-24 md:h-32 md:w-32 text-subject-physics-primary" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.8, 0],
                      scale: [0.8, 1.2, 1.5]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                    className="absolute inset-0 border-2 border-subject-physics-primary/50 rounded-full"
                  ></motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.6, 0],
                      scale: [1, 1.5, 2]
                    }}
                    transition={{ 
                      duration: 3,
                      delay: 0.5,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                    className="absolute inset-0 border border-subject-physics-primary/30 rounded-full"
                  ></motion.div>
                </div>
              </motion.div>
            </div>
            
            <Button 
              size="lg"
              onClick={() => setShowMainContent(true)}
              className="bg-subject-physics-primary hover:bg-subject-physics-secondary text-white text-xl px-8 py-6 rounded-xl shadow-glow-purple hover:shadow-glow-md transition-all duration-300"
            >
              ابدأ التجربة
            </Button>
          </motion.div>
        </main>
        
        {/* Floating Physics Symbols - limited number */}
        {physicsSymbols.slice(0, 4).map((symbol, index) => (
          <div 
            key={index}
            className={`absolute ${symbol.size} text-subject-physics-primary/30 math-symbol pointer-events-none`}
            style={{ 
              top: symbol.top, 
              left: symbol.left, 
              animationDelay: symbol.animationDelay 
            }}
          >
            {symbol.symbol}
          </div>
        ))}
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col text-right" dir="rtl">
      <StarField starCount={150} speed={0.2} />
      
      {/* Floating Physics Symbols - reduced for performance */}
      {physicsSymbols.slice(0, 3).map((symbol, index) => (
        <div 
          key={index}
          className={`absolute ${symbol.size} text-subject-physics-primary/30 math-symbol pointer-events-none`}
          style={{ 
            top: symbol.top, 
            left: symbol.left, 
            animationDelay: symbol.animationDelay 
          }}
        >
          {symbol.symbol}
        </div>
      ))}
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-glow-purple">
            منصة الفيزياء
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            استكشف عالم الفيزياء من خلال ألغاز تفاعلية، مساعد ذكي، وموسوعة علمية
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="col-span-1"
          >
            <Card className="h-full glass-card border-subject-physics-primary/30 hover:shadow-glow-purple transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Atom className="h-16 w-16 text-subject-physics-primary mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-glow-purple">ألغاز الفيزياء</h3>
                <p className="text-white/70 mb-4">اختبر معرفتك بالفيزياء من خلال تحديات متنوعة</p>
                <Button 
                  onClick={() => setSelectedTab("puzzles")}
                  className="bg-subject-physics-primary hover:bg-subject-physics-secondary"
                >
                  استكشف الألغاز
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03 }}
            className="col-span-1"
          >
            <Card className="h-full glass-card border-subject-physics-primary/30 hover:shadow-glow-purple transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <FlaskConical className="h-16 w-16 text-subject-physics-primary mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-glow-purple">المساعد الذكي</h3>
                <p className="text-white/70 mb-4">اسأل المساعد الذكي أي سؤال عن الفيزياء</p>
                <Button 
                  onClick={() => setSelectedTab("assistant")}
                  className="bg-subject-physics-primary hover:bg-subject-physics-secondary"
                >
                  تحدث مع المساعد
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            className="col-span-1"
          >
            <Card className="h-full glass-card border-subject-physics-primary/30 hover:shadow-glow-purple transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Microscope className="h-16 w-16 text-subject-physics-primary mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-glow-purple">علماء الفيزياء</h3>
                <p className="text-white/70 mb-4">تعرف على أبرز علماء الفيزياء عبر التاريخ</p>
                <Button 
                  onClick={() => setSelectedTab("scientists")}
                  className="bg-subject-physics-primary hover:bg-subject-physics-secondary"
                >
                  استكشف العلماء
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          {selectedTab === "puzzles" && <PhysicsPuzzles />}
          {selectedTab === "assistant" && <PhysicsAIAssistant />}
          {selectedTab === "scientists" && <PhysicsScientists />}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Physics;
