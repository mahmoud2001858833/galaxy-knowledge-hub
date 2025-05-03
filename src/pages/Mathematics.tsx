
import React, { useState } from 'react';
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

const Mathematics = () => {
  const [selectedTab, setSelectedTab] = useState("assistant");
  
  // Floating math symbols
  const mathSymbols = [
    { symbol: "π", top: "15%", left: "8%", size: "text-4xl", animationDelay: "0s" },
    { symbol: "∑", top: "25%", left: "92%", size: "text-5xl", animationDelay: "0.5s" },
    { symbol: "√", top: "70%", left: "5%", size: "text-5xl", animationDelay: "1s" },
    { symbol: "∫", top: "80%", left: "93%", size: "text-4xl", animationDelay: "1.5s" },
    { symbol: "≠", top: "40%", left: "7%", size: "text-3xl", animationDelay: "2s" },
    { symbol: "∞", top: "50%", left: "95%", size: "text-5xl", animationDelay: "2.5s" }
  ];
  
  return (
    <div className="min-h-screen flex flex-col text-right" dir="rtl">
      <StarField />
      
      {/* Floating Math Symbols */}
      {mathSymbols.map((symbol, index) => (
        <div 
          key={index}
          className={`absolute text-space-neon-blue/30 ${symbol.size} math-symbol pointer-events-none`}
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-space-neon-blue via-white to-space-vivid-purple">
            منصة الرياضيات
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            استكشف عالم الرياضيات من خلال أدوات تفاعلية، مساعد ذكي، وتمثيل بياني
          </p>
        </motion.div>
        
        <div className="mb-8">
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Mathematics;
