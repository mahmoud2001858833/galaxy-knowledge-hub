import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, FlaskConical, User, HelpCircle, Atom } from "lucide-react";
import ChemistryAssistant from '@/components/chemistry/ChemistryAssistant';
import ChemistryCalculations from '@/components/chemistry/ChemistryCalculations';
import ChemistryScientists from '@/components/chemistry/ChemistryScientists';
import EnhancedPeriodicTable from '@/components/chemistry/EnhancedPeriodicTable';
import QuestionBank from '@/components/shared/QuestionBank';
import { SEO } from '@/components/SEO';

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
      title: "الجدول الدوري التفاعلي",
      icon: <Atom className="w-12 h-12 text-cyan-400" />,
      color: "from-cyan-500/20 to-blue-500/30",
      tab: "periodic-table"
    },
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
      title: "بنك الأسئلة",
      icon: <FlaskConical className="w-12 h-12 text-cyan-400" />,
      color: "from-teal-500/20 to-cyan-500/30",
      tab: "questions"
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white transition-colors duration-300" dir="rtl">
      <SEO 
        title="منصة الكيمياء"
        description="اكتشف عالم الكيمياء مع منصة ذروة العلم - الجدول الدوري التفاعلي، حسابات كيميائية، علماء الكيمياء، والمساعد الذكي للمنهاج الأردني"
        keywords="الكيمياء, تعلم الكيمياء, الجدول الدوري, التفاعلات الكيميائية, العناصر الكيميائية, المركبات, الأحماض والقواعد, الكيمياء العضوية, علماء الكيمياء, المنهاج الأردني"
      />
      {/* Limited number of stars for better performance */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={300} />
      </div>
      
      {/* Floating Chemistry Symbols - reduced for performance */}
      {chemistrySymbols.map((symbol, index) => (
        <div 
          key={index}
          className={`absolute text-cyan-600/20 dark:text-cyan-500/30 ${symbol.size} math-symbol pointer-events-none`}
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
              className="text-5xl md:text-7xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 dark:from-cyan-400 dark:via-white dark:to-blue-500"
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
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-cyan-400 mb-4">اختر الخدمة</h2>
                  <p className="text-xl text-slate-600 dark:text-slate-300">استكشف عالم الكيمياء من خلال خدماتنا المتنوعة</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {optionCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      onClick={() => setSelectedTab(card.tab)}
                    >
                      <Card className="h-64 cursor-pointer overflow-hidden relative bg-white/95 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-cyan-500/20 hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none hover:shadow-md">
                        <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
                          <div className={`absolute inset-0 bg-gradient-to-br ${card.color}`} />
                        </div>
                        <CardContent className="flex flex-col items-center justify-center h-full text-center p-6 relative z-10">
                          <div className="mb-6 p-4 rounded-full bg-cyan-50 dark:bg-blue-900/30 backdrop-blur-sm shadow-sm dark:shadow-none">
                            {card.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                          <div className="mt-auto">
                            <span className="inline-block px-4 py-1 bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-sm font-medium rounded-full">
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
                    className="text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 hover:bg-cyan-100/50 dark:hover:bg-blue-900/30"
                  >
                    &larr; العودة للخيارات
                  </Button>
                </motion.div>
                
                <motion.div
                  key={selectedTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/95 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-cyan-500/30 p-6 shadow-sm dark:shadow-none"
                >
                  {selectedTab === "periodic-table" && <EnhancedPeriodicTable />}
                  {selectedTab === "calculations" && <ChemistryCalculations />}
                  {selectedTab === "scientists" && <ChemistryScientists />}
                  {selectedTab === "assistant" && <ChemistryAssistant />}
                  {selectedTab === "questions" && <QuestionBank subject="chemistry" functionName="science-question-bank" />}
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
