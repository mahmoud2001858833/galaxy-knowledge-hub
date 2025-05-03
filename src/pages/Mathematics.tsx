import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Calculator from '@/components/mathematics/Calculator';
import MathAIAssistant from '@/components/mathematics/MathAIAssistant';
import MathPuzzles from '@/components/mathematics/MathPuzzles';
import GraphVisualizer from '@/components/mathematics/GraphVisualizer';
import MathematiciansGallery from '@/components/mathematics/MathematiciansGallery';
import { Button } from '@/components/ui/button';
import { ArrowDown, Brain } from 'lucide-react';

const Mathematics = () => {
  const [selectedTab, setSelectedTab] = useState("assistant");
  const [showIntro, setShowIntro] = useState(true);
  const [showContent, setShowContent] = useState(false);
  
  // Handle start experience button click
  const handleStartExperience = () => {
    setShowIntro(false);
    setTimeout(() => {
      setShowContent(true);
      // Scroll to content section
      document.getElementById('math-content')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 500);
  };
  
  // Floating math symbols with animation and updated positioning
  const mathSymbols = [
    { symbol: "π", top: "15%", left: "8%", size: "text-4xl", animationDelay: "0s", rotate: 0 },
    { symbol: "∑", top: "25%", left: "92%", size: "text-5xl", animationDelay: "0.5s", rotate: 15 },
    { symbol: "√", top: "70%", left: "5%", size: "text-5xl", animationDelay: "1s", rotate: -10 },
    { symbol: "∫", top: "80%", left: "93%", size: "text-4xl", animationDelay: "1.5s", rotate: 5 },
    { symbol: "≠", top: "40%", left: "7%", size: "text-3xl", animationDelay: "2s", rotate: -5 },
    { symbol: "∞", top: "50%", left: "95%", size: "text-5xl", animationDelay: "2.5s", rotate: 0 },
    { symbol: "θ", top: "30%", left: "15%", size: "text-4xl", animationDelay: "1.8s", rotate: 10 },
    { symbol: "λ", top: "60%", left: "88%", size: "text-4xl", animationDelay: "2.3s", rotate: -8 },
    { symbol: "Δ", top: "20%", left: "80%", size: "text-5xl", animationDelay: "1.2s", rotate: 12 },
    { symbol: "∂", top: "75%", left: "20%", size: "text-4xl", animationDelay: "0.8s", rotate: -15 },
    { symbol: "∇", top: "45%", left: "85%", size: "text-3xl", animationDelay: "1.6s", rotate: 8 }
  ];

  // Equation animation variants
  const equationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.3,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };
  
  return (
    <div className="min-h-screen flex flex-col text-right" dir="rtl">
      <StarField />
      
      {/* Floating Math Symbols with enhanced animation */}
      {mathSymbols.map((symbol, index) => (
        <motion.div 
          key={index}
          className={`absolute text-space-neon-blue/30 ${symbol.size} pointer-events-none`}
          style={{ top: symbol.top, left: symbol.left }}
          initial={{ opacity: 0, scale: 0, rotate: symbol.rotate }}
          animate={{ 
            opacity: [0.2, 0.6, 0.2], 
            scale: [0.8, 1.2, 0.8],
            rotate: [symbol.rotate, symbol.rotate + 5, symbol.rotate]
          }}
          transition={{ 
            delay: parseFloat(symbol.animationDelay), 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {symbol.symbol}
        </motion.div>
      ))}
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {showIntro && (
          <motion.div 
            className="min-h-[80vh] flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-space-neon-blue via-white to-space-vivid-purple"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              عالم الرياضيات
            </motion.h1>
            
            <div className="space-y-8 mb-16 text-center">
              {/* Animated equations */}
              <motion.div 
                className="text-2xl md:text-4xl text-white/80"
                custom={0}
                initial="hidden"
                animate="visible"
                variants={equationVariants}
              >
                E = mc<sup>2</sup>
              </motion.div>
              
              <motion.div 
                className="text-2xl md:text-4xl text-white/80"
                custom={1}
                initial="hidden"
                animate="visible"
                variants={equationVariants}
              >
                F(x) = ∫<sub>a</sub><sup>b</sup> f(x) dx
              </motion.div>
              
              <motion.div 
                className="text-2xl md:text-4xl text-white/80"
                custom={2}
                initial="hidden"
                animate="visible"
                variants={equationVariants}
              >
                e<sup>iπ</sup> + 1 = 0
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.8 }}
            >
              <Button 
                onClick={handleStartExperience}
                className="text-xl bg-space-deep-purple hover:bg-space-neon-blue text-white px-8 py-6 rounded-full flex items-center gap-3 transform transition-all hover:scale-110"
              >
                ابدأ التجربة
                <ArrowDown className="animate-bounce h-6 w-6" />
              </Button>
            </motion.div>
          </motion.div>
        )}
        
        {showContent && (
          <motion.div 
            id="math-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-space-neon-blue via-white to-space-vivid-purple">
                منصة الرياضيات
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                استكشف عالم الرياضيات من خلال أدوات تفاعلية، مساعد ذكي، وتمثيل بياني
              </p>
            </motion.div>

            {/* Math Sections as Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <motion.div 
                className="bg-gradient-to-br from-space-deep-purple/80 to-space-deep-purple/30 p-6 rounded-2xl border border-white/10 hover:border-white/30 cursor-pointer transition-all hover:shadow-lg hover:shadow-space-neon-blue/20"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => {
                  setSelectedTab("assistant");
                  document.getElementById('math-tabs')?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
              >
                <div className="h-12 w-12 bg-space-neon-blue/20 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-space-neon-blue" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 text-right">المساعد الذكي</h3>
                <p className="text-white/70 text-right">اطرح أسئلة متعلقة بالرياضيات واحصل على إجابات فورية من المساعد الذكي</p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-space-neon-blue/80 to-space-neon-blue/30 p-6 rounded-2xl border border-white/10 hover:border-white/30 cursor-pointer transition-all hover:shadow-lg hover:shadow-space-neon-blue/20"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => {
                  setSelectedTab("puzzles");
                  document.getElementById('math-tabs')?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
              >
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 text-right">ألغاز رياضية</h3>
                <p className="text-white/70 text-right">اختبر معلوماتك في الرياضيات مع مجموعة متنوعة من الألغاز والتحديات</p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-green-600/80 to-green-600/30 p-6 rounded-2xl border border-white/10 hover:border-white/30 cursor-pointer transition-all hover:shadow-lg hover:shadow-green-500/20"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => {
                  setSelectedTab("calculator");
                  document.getElementById('math-tabs')?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
              >
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                    <line x1="8" x2="16" y1="6" y2="6"></line>
                    <line x1="16" x2="16" y1="14" y2="18"></line>
                    <path d="M16 10h.01"></path>
                    <path d="M12 10h.01"></path>
                    <path d="M8 10h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M8 14h.01"></path>
                    <path d="M12 18h.01"></path>
                    <path d="M8 18h.01"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 text-right">الآلة الحاسبة</h3>
                <p className="text-white/70 text-right">أداة حاسبة متقدمة لإجراء العمليات الحسابية والمعادلات الرياضية</p>
              </motion.div>
            </div>
            
            <div id="math-tabs" className="mb-8">
              <Tabs 
                defaultValue="assistant"
                value={selectedTab}
                onValueChange={setSelectedTab}
                className="w-full"
              >
                <TabsList className="flex justify-center mb-8 bg-white/5 p-1 rounded-lg w-full sm:w-fit mx-auto">
                  <TabsTrigger 
                    value="assistant"
                    className="text-white data-[state=active]:bg-space-deep-purple data-[state=active]:text-white"
                  >
                    المساعد الذكي
                  </TabsTrigger>
                  <TabsTrigger 
                    value="puzzles"
                    className="text-white data-[state=active]:bg-space-deep-purple data-[state=active]:text-white"
                  >
                    ألغاز رياضية
                  </TabsTrigger>
                  <TabsTrigger 
                    value="calculator"
                    className="text-white data-[state=active]:bg-space-deep-purple data-[state=active]:text-white"
                  >
                    الآلة الحاسبة
                  </TabsTrigger>
                  <TabsTrigger 
                    value="graph"
                    className="text-white data-[state=active]:bg-space-deep-purple data-[state=active]:text-white"
                  >
                    التمثيل البياني
                  </TabsTrigger>
                  <TabsTrigger 
                    value="mathematicians"
                    className="text-white data-[state=active]:bg-space-deep-purple data-[state=active]:text-white"
                  >
                    علماء الرياضيات
                  </TabsTrigger>
                </TabsList>
                
                <motion.div
                  key={selectedTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <TabsContent value="assistant" className="mt-0">
                    <MathAIAssistant />
                  </TabsContent>
                  
                  <TabsContent value="puzzles" className="mt-0">
                    <MathPuzzles />
                  </TabsContent>
                  
                  <TabsContent value="calculator" className="mt-0">
                    <Calculator />
                  </TabsContent>
                  
                  <TabsContent value="graph" className="mt-0">
                    <GraphVisualizer />
                  </TabsContent>
                  
                  <TabsContent value="mathematicians" className="mt-0">
                    <MathematiciansGallery />
                  </TabsContent>
                </motion.div>
              </Tabs>
            </div>
          </motion.div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Mathematics;
