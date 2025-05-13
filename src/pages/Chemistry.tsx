
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, FlaskConical, User, HelpCircle, Table2 } from "lucide-react";
import ChemistryAssistant from '@/components/chemistry/ChemistryAssistant';
import ChemistryCalculations from '@/components/chemistry/ChemistryCalculations';
import ChemistryScientists from '@/components/chemistry/ChemistryScientists';
import SmartPeriodicTable from '@/components/chemistry/SmartPeriodicTable';

const Chemistry = () => {
  const [selectedTab, setSelectedTab] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [electrons, setElectrons] = useState<{ x: number, y: number, angle: number, speed: number, radius: number }[]>([]);
  
  useEffect(() => {
    // Create electrons with different angles, speeds, and radiuses
    const electronCount = 6;
    const newElectrons = [];
    
    for (let i = 0; i < electronCount; i++) {
      newElectrons.push({
        x: 0,
        y: 0,
        angle: (Math.PI * 2 / electronCount) * i,
        speed: 0.5 + Math.random() * 0.5,
        radius: 80 + (i % 3) * 40
      });
    }
    
    setElectrons(newElectrons);
  }, []);
  
  // Chemistry symbols floating - reduced number for performance
  const chemistrySymbols = [
    { symbol: "H", top: "15%", left: "8%", size: "text-4xl", animationDelay: "0s" },
    { symbol: "O", top: "25%", left: "92%", size: "text-5xl", animationDelay: "0.5s" },
    { symbol: "C", top: "70%", left: "5%", size: "text-5xl", animationDelay: "1s" },
    { symbol: "N", top: "80%", left: "93%", size: "text-4xl", animationDelay: "1.5s" }
  ];
  
  const optionCards = [
    {
      title: "الحسابات الكيميائية",
      icon: <Calculator className="w-12 h-12 text-cyan-400" />,
      color: "from-cyan-500/20 to-blue-500/30",
      tab: "calculations"
    },
    {
      title: "علماء الكيمياء",
      icon: <User className="w-12 h-12 text-cyan-400" />,
      color: "from-blue-500/20 to-cyan-500/30",
      tab: "scientists"
    },
    {
      title: "المساعد الذكي",
      icon: <HelpCircle className="w-12 h-12 text-cyan-400" />,
      color: "from-cyan-400/20 to-blue-600/30",
      tab: "assistant"
    },
    {
      title: "الجدول الدوري الذكي",
      icon: <Table2 className="w-12 h-12 text-cyan-400" />,
      color: "from-cyan-500/20 to-blue-400/30",
      tab: "periodic-table"
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950 bg-fixed" dir="rtl">
      {/* Limited number of stars for better performance */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={300} />
      </div>
      
      {/* Floating Chemistry Symbols - reduced for performance */}
      {chemistrySymbols.map((symbol, index) => (
        <div 
          key={index}
          className={`absolute text-cyan-500/30 ${symbol.size} math-symbol pointer-events-none`}
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
      
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center relative z-10">
        {!showOptions ? (
          <motion.div 
            className="flex flex-col items-center justify-center max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-16 text-center text-glow-cyan bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-blue-500"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              عالم الكيمياء
            </motion.h1>

            {/* Animated Atom */}
            <motion.div 
              className="relative w-64 h-64 mb-16"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              {/* Nucleus */}
              <motion.div 
                className="absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full shadow-lg shadow-cyan-500/50"
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 15px 5px rgba(56, 189, 248, 0.3)", 
                    "0 0 20px 8px rgba(56, 189, 248, 0.5)", 
                    "0 0 15px 5px rgba(56, 189, 248, 0.3)"
                  ] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
              
              {/* Electron Orbits - only render a few for performance */}
              {electrons.slice(0, 3).map((electron, index) => (
                <React.Fragment key={index}>
                  {/* Orbit Path */}
                  <motion.div 
                    className="absolute top-1/2 left-1/2 rounded-full border border-cyan-500/20"
                    style={{ 
                      width: electron.radius * 2, 
                      height: electron.radius * 2, 
                      marginLeft: -electron.radius, 
                      marginTop: -electron.radius,
                      transform: `rotate(${index * 30}deg)`
                    }}
                  />
                  
                  {/* Electron */}
                  <motion.div 
                    className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-md shadow-cyan-500/50"
                    animate={{
                      x: [
                        Math.cos(0) * electron.radius,
                        Math.cos(Math.PI / 2) * electron.radius,
                        Math.cos(Math.PI) * electron.radius,
                        Math.cos(3 * Math.PI / 2) * electron.radius,
                        Math.cos(2 * Math.PI) * electron.radius
                      ],
                      y: [
                        Math.sin(0) * electron.radius,
                        Math.sin(Math.PI / 2) * electron.radius,
                        Math.sin(Math.PI) * electron.radius,
                        Math.sin(3 * Math.PI / 2) * electron.radius,
                        Math.sin(2 * Math.PI) * electron.radius
                      ]
                    }}
                    transition={{
                      duration: 4 / electron.speed,
                      ease: "linear",
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                    style={{
                      top: "calc(50% - 8px)",
                      left: "calc(50% - 8px)"
                    }}
                  />
                </React.Fragment>
              ))}
            </motion.div>
            
            {/* Start Experience Button */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.7 }}
            >
              <Button 
                onClick={() => setShowOptions(true)}
                className="text-xl px-8 py-6 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700 text-white rounded-full shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300"
              >
                ابدأ الآن
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <div className="w-full">
            {selectedTab === "" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-cyan-400 mb-4 text-glow-cyan">اختر الخدمة</h2>
                  <p className="text-xl text-white/80">استكشف عالم الكيمياء من خلال خدماتنا المتنوعة</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {optionCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      onClick={() => setSelectedTab(card.tab)}
                    >
                      <Card className={`h-64 cursor-pointer overflow-hidden relative bg-gradient-to-br ${card.color} border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 shadow-glow-sm shadow-cyan-500/10`}>
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                        </div>
                        <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                          <div className="mb-6 p-4 rounded-full bg-blue-900/30 backdrop-blur-sm shadow-glow-sm shadow-cyan-500/20">
                            {card.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2 text-glow-cyan">{card.title}</h3>
                          <div className="mt-auto">
                            <span className="inline-block px-4 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-full">
                              استكشف الآن
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div>
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={() => setSelectedTab("")}
                    variant="ghost"
                    className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
                  >
                    &larr; العودة للخيارات
                  </Button>
                </motion.div>
                
                <motion.div
                  key={selectedTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-900/20 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-6 shadow-glow-sm shadow-cyan-500/10"
                >
                  {selectedTab === "calculations" && <ChemistryCalculations />}
                  {selectedTab === "scientists" && <ChemistryScientists />}
                  {selectedTab === "assistant" && <ChemistryAssistant />}
                  {selectedTab === "periodic-table" && <SmartPeriodicTable />}
                </motion.div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Chemistry;
