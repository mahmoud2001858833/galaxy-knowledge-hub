
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Microscope, Leaf, TestTube } from 'lucide-react';
import BiologyScientists from '@/components/biology/BiologyScientists';
import BiologyPuzzles from '@/components/biology/BiologyPuzzles';
import BiologyAIAssistant from '@/components/biology/BiologyAIAssistant';

const Biology = () => {
  const [showMainContent, setShowMainContent] = useState(false);
  const [selectedTab, setSelectedTab] = useState("puzzles");
  const navigate = useNavigate();
  
  // Floating biology symbols - reduced for performance
  const biologySymbols = [
    { symbol: "🧬", top: "15%", left: "8%", size: "text-4xl", animationDelay: "0s" },
    { symbol: "🔬", top: "25%", left: "92%", size: "text-5xl", animationDelay: "0.5s" },
    { symbol: "🦠", top: "70%", left: "5%", size: "text-5xl", animationDelay: "1s" },
    { symbol: "🧫", top: "80%", left: "93%", size: "text-4xl", animationDelay: "1.5s" },
    { symbol: "🌱", top: "40%", left: "7%", size: "text-3xl", animationDelay: "2s" }
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
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-glow-green">
              عالم الأحياء
            </h1>
            
            <div className="relative h-64 mb-12 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-48 h-auto"
              >
                {/* Human Skeleton SVG - simplified and stylized */}
                <svg viewBox="0 0 100 200" className="w-full h-full">
                  <g className="text-subject-biology-primary">
                    <path d="M50,10 C45,20 45,30 50,40 C55,30 55,20 50,10" fill="currentColor" />
                    <path d="M50,40 L50,70" stroke="currentColor" strokeWidth="2" />
                    <path d="M50,50 L30,65" stroke="currentColor" strokeWidth="2" />
                    <path d="M50,50 L70,65" stroke="currentColor" strokeWidth="2" />
                    <path d="M50,70 L35,100" stroke="currentColor" strokeWidth="2" />
                    <path d="M50,70 L65,100" stroke="currentColor" strokeWidth="2" />
                    <circle cx="50" cy="25" r="10" fill="currentColor" />
                  </g>
                </svg>
              </motion.div>
            </div>
            
            <Button 
              size="lg"
              onClick={() => setShowMainContent(true)}
              className="bg-subject-biology-primary hover:bg-subject-biology-secondary text-white text-xl px-8 py-6 rounded-xl shadow-glow-green hover:shadow-glow-md transition-all duration-300"
            >
              استكشف عالم الأحياء
            </Button>
          </motion.div>
        </main>
        
        {/* Floating Biology Symbols - limited for performance */}
        {biologySymbols.slice(0, 3).map((symbol, index) => (
          <div 
            key={index}
            className={`absolute ${symbol.size} text-subject-biology-primary/30 math-symbol pointer-events-none`}
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
      
      {/* Floating Biology Symbols - reduced for performance */}
      {biologySymbols.slice(0, 3).map((symbol, index) => (
        <div 
          key={index}
          className={`absolute ${symbol.size} text-subject-biology-primary/30 math-symbol pointer-events-none`}
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-glow-green">
            منصة الأحياء
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            استكشف عالم الأحياء من خلال ألغاز تفاعلية، مساعد ذكي، وموسوعة علمية
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
            <Card className="h-full glass-card border-subject-biology-primary/30 hover:shadow-glow-green transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Leaf className="h-16 w-16 text-subject-biology-primary mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-glow-green">ألغاز الأحياء</h3>
                <p className="text-white/70 mb-4">اختبر معرفتك بالأحياء من خلال تحديات متنوعة</p>
                <Button 
                  onClick={() => setSelectedTab("puzzles")}
                  className="bg-subject-biology-primary hover:bg-subject-biology-secondary"
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
            <Card className="h-full glass-card border-subject-biology-primary/30 hover:shadow-glow-green transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <TestTube className="h-16 w-16 text-subject-biology-primary mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-glow-green">المساعد الذكي</h3>
                <p className="text-white/70 mb-4">اسأل المساعد الذكي أي سؤال عن الأحياء</p>
                <Button 
                  onClick={() => setSelectedTab("assistant")}
                  className="bg-subject-biology-primary hover:bg-subject-biology-secondary"
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
            <Card className="h-full glass-card border-subject-biology-primary/30 hover:shadow-glow-green transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Microscope className="h-16 w-16 text-subject-biology-primary mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-glow-green">علماء الأحياء</h3>
                <p className="text-white/70 mb-4">تعرف على أبرز علماء الأحياء عبر التاريخ</p>
                <Button 
                  onClick={() => setSelectedTab("scientists")}
                  className="bg-subject-biology-primary hover:bg-subject-biology-secondary"
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
          <Tabs 
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="mb-8 bg-white/5 p-1 rounded-lg w-full sm:w-fit mx-auto">
              <TabsTrigger 
                value="puzzles"
                className="text-white data-[state=active]:bg-subject-biology-primary data-[state=active]:text-white"
              >
                ألغاز الأحياء
              </TabsTrigger>
              <TabsTrigger 
                value="assistant"
                className="text-white data-[state=active]:bg-subject-biology-primary data-[state=active]:text-white"
              >
                المساعد الذكي
              </TabsTrigger>
              <TabsTrigger 
                value="scientists"
                className="text-white data-[state=active]:bg-subject-biology-primary data-[state=active]:text-white"
              >
                علماء الأحياء
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="puzzles" className="mt-0">
              <BiologyPuzzles />
            </TabsContent>
            
            <TabsContent value="assistant" className="mt-0">
              <BiologyAIAssistant />
            </TabsContent>
            
            <TabsContent value="scientists" className="mt-0">
              <BiologyScientists />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Biology;
