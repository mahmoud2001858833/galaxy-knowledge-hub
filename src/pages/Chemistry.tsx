
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MathPuzzles from '@/pages/MathPuzzles';

const Chemistry = () => {
  const [selectedTab, setSelectedTab] = useState("puzzles");
  
  // Floating chemistry symbols
  const chemistrySymbols = [
    { symbol: "H", top: "15%", left: "8%", size: "text-4xl", animationDelay: "0s" },
    { symbol: "O", top: "25%", left: "92%", size: "text-5xl", animationDelay: "0.5s" },
    { symbol: "C", top: "70%", left: "5%", size: "text-5xl", animationDelay: "1s" },
    { symbol: "N", top: "80%", left: "93%", size: "text-4xl", animationDelay: "1.5s" },
    { symbol: "Fe", top: "40%", left: "7%", size: "text-3xl", animationDelay: "2s" },
    { symbol: "Cu", top: "50%", left: "95%", size: "text-5xl", animationDelay: "2.5s" }
  ];
  
  return (
    <div className="min-h-screen flex flex-col text-right" dir="rtl">
      <StarField />
      
      {/* Floating Chemistry Symbols */}
      {chemistrySymbols.map((symbol, index) => (
        <div 
          key={index}
          className={`absolute text-green-500/30 ${symbol.size} math-symbol pointer-events-none`}
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-white to-emerald-500">
            منصة الكيمياء
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            استكشف عالم الكيمياء من خلال ألغاز تفاعلية، مساعد ذكي، وحسابات كيميائية
          </p>
        </motion.div>
        
        <div className="mb-8">
          <Tabs 
            defaultValue="puzzles"
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="flex justify-center mb-8 bg-white/5 p-1 rounded-lg w-full sm:w-fit mx-auto">
              <TabsTrigger 
                value="puzzles"
                className="text-white data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
              >
                ألغاز الكيمياء
              </TabsTrigger>
              <TabsTrigger 
                value="assistant"
                className="text-white data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
              >
                المساعد الذكي
              </TabsTrigger>
              <TabsTrigger 
                value="scientists"
                className="text-white data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
              >
                علماء الكيمياء
              </TabsTrigger>
              <TabsTrigger 
                value="calculations"
                className="text-white data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
              >
                الحسابات الكيميائية
              </TabsTrigger>
            </TabsList>
            
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <TabsContent value="puzzles" className="mt-0">
                <MathPuzzles />
              </TabsContent>
              
              <TabsContent value="assistant" className="mt-0">
                <div className="text-center py-12">
                  <p className="text-white/70">سيتم إضافة المساعد الذكي قريباً</p>
                </div>
              </TabsContent>
              
              <TabsContent value="scientists" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-colors border border-white/10">
                      <div className="mb-4 w-full aspect-square overflow-hidden rounded-lg">
                        <img 
                          src="https://i0.wp.com/www.ibelieveinsci.com/wp-content/uploads/learn-chemistry-lessons-online.jpg?fit=640%2C484&ssl=1" 
                          alt="Chemistry Scientist" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-white">عالم الكيمياء {i+1}</h3>
                      <p className="text-white/70 mt-2">وصف مختصر عن إنجازات العالم واكتشافاته في مجال الكيمياء.</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="calculations" className="mt-0">
                <div className="text-center py-12">
                  <p className="text-white/70">سيتم إضافة الحسابات الكيميائية قريباً</p>
                </div>
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Chemistry;
