
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Microscope, Atom, Flask } from 'lucide-react';
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

  // Newton's Laws animation
  const newtonLaws = [
    { law: "القوة = الكتلة × التسارع", direction: 1 },
    { law: "الفعل = رد الفعل", direction: -1 },
    { law: "الجسم يبقى في حالته ما لم تؤثر عليه قوة", direction: 1 }
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
            
            <div className="relative h-64 mb-12">
              {newtonLaws.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: item.direction * 100, opacity: 0 }}
                  animate={{ 
                    x: [item.direction * 100, 0, 0, -item.direction * 100],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{ 
                    duration: 5,
                    times: [0, 0.2, 0.8, 1],
                    repeat: Infinity,
                    repeatDelay: index * 2
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <p className="text-2xl md:text-4xl font-semibold text-subject-physics-primary shadow-glow-purple">
                    {item.law}
                  </p>
                </motion.div>
              ))}
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
                <Flask className="h-16 w-16 text-subject-physics-primary mb-4" />
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
          <Tabs 
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="mb-8 bg-white/5 p-1 rounded-lg w-full sm:w-fit mx-auto">
              <TabsTrigger 
                value="puzzles"
                className="text-white data-[state=active]:bg-subject-physics-primary data-[state=active]:text-white"
              >
                ألغاز الفيزياء
              </TabsTrigger>
              <TabsTrigger 
                value="assistant"
                className="text-white data-[state=active]:bg-subject-physics-primary data-[state=active]:text-white"
              >
                المساعد الذكي
              </TabsTrigger>
              <TabsTrigger 
                value="scientists"
                className="text-white data-[state=active]:bg-subject-physics-primary data-[state=active]:text-white"
              >
                علماء الفيزياء
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="puzzles" className="mt-0">
              <PhysicsPuzzles />
            </TabsContent>
            
            <TabsContent value="assistant" className="mt-0">
              <PhysicsAIAssistant />
            </TabsContent>
            
            <TabsContent value="scientists" className="mt-0">
              <PhysicsScientists />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Physics;
