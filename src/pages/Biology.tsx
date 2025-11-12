
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Microscope, TestTube, Heart, Calculator, FileQuestion } from 'lucide-react';
import BiologyScientists from '@/components/biology/BiologyScientists';
import BiologyAIAssistant from '@/components/biology/BiologyAIAssistant';
import DiseasesEncyclopedia from '@/components/biology/DiseasesEncyclopedia';
import BiologyCalculations from '@/components/biology/BiologyCalculations';
import QuestionBank from '@/components/shared/QuestionBank';

const Biology = () => {
  const [showMainContent, setShowMainContent] = useState(false);
  const [selectedTab, setSelectedTab] = useState("calculations");
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
            
            <div className="relative h-96 mb-12 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-64 h-auto"
              >
                {/* جسم الإنسان بشكل أكثر تفصيلًا */}
                <svg viewBox="0 0 200 400" className="w-full h-full">
                  <g className="text-subject-biology-primary">
                    {/* الرأس */}
                    <circle cx="100" cy="50" r="40" fill="currentColor" fillOpacity="0.7" />
                    <ellipse cx="100" cy="45" rx="25" ry="20" fill="#00120b" />
                    
                    {/* العنق */}
                    <rect x="90" y="90" width="20" height="20" fill="currentColor" />
                    
                    {/* الجذع */}
                    <path d="M70,110 L130,110 L140,230 L60,230 Z" fill="currentColor" fillOpacity="0.7" />
                    
                    {/* القلب (يظهر داخل الجذع) */}
                    <path d="M95,150 C85,140 70,150 70,165 C70,185 100,195 100,195 C100,195 130,185 130,165 C130,150 115,140 105,150 C100,145 95,150 95,150 Z" 
                          fill="#ff4d4d" fillOpacity="0.7" />
                    
                    {/* الأذرع */}
                    <path d="M70,115 L40,180 L55,190 L80,140 Z" fill="currentColor" fillOpacity="0.7" />
                    <path d="M130,115 L160,180 L145,190 L120,140 Z" fill="currentColor" fillOpacity="0.7" />
                    
                    {/* الأيدي */}
                    <circle cx="40" cy="190" r="10" fill="currentColor" />
                    <circle cx="160" cy="190" r="10" fill="currentColor" />
                    
                    {/* الساقان */}
                    <path d="M80,230 L60,350 L80,350 L95,230 Z" fill="currentColor" fillOpacity="0.7" />
                    <path d="M120,230 L140,350 L120,350 L105,230 Z" fill="currentColor" fillOpacity="0.7" />
                    
                    {/* القدمان */}
                    <ellipse cx="70" cy="360" rx="20" ry="10" fill="currentColor" />
                    <ellipse cx="130" cy="360" rx="20" ry="10" fill="currentColor" />

                    {/* DNA شريط في الخلفية */}
                    <path d="M30,50 C40,70 60,90 30,110 C60,130 40,150 30,170 C40,190 60,210 30,230" 
                          stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" fill="none"/>
                    <path d="M170,50 C160,70 140,90 170,110 C140,130 160,150 170,170 C160,190 140,210 170,230" 
                          stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" fill="none"/>
                          
                    {/* خطوط توصيل DNA */}
                    <line x1="30" y1="50" x2="170" y2="50" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                    <line x1="30" y1="110" x2="170" y2="110" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                    <line x1="30" y1="170" x2="170" y2="170" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                    <line x1="30" y1="230" x2="170" y2="230" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
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
        
        {/* Floating Biology Symbols */}
        {biologySymbols.map((symbol, index) => (
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
      
      {/* Floating Biology Symbols */}
      {biologySymbols.map((symbol, index) => (
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
            منصة الأحياء المتطورة
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            استكشف عالم الأحياء من خلال الحسابات الحيوية والمساعد الذكي وموسوعة علمية وطبية شاملة
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="col-span-1"
          >
            <Card className="h-full glass-card border-subject-biology-primary/30 hover:shadow-glow-green transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Calculator className="h-16 w-16 text-subject-biology-primary mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-glow-green">الحسابات الحيوية</h3>
                <p className="text-white/70 mb-4">20+ حساب حيوي وطبي مع شرح مفصل</p>
                <Button 
                  onClick={() => setSelectedTab("calculations")}
                  className="bg-subject-biology-primary hover:bg-subject-biology-secondary transition-all duration-300"
                >
                  ابدأ الحسابات
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
                  className="bg-subject-biology-primary hover:bg-subject-biology-secondary transition-all duration-300"
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
                  className="bg-subject-biology-primary hover:bg-subject-biology-secondary transition-all duration-300"
                >
                  استكشف العلماء
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.03 }}
            className="col-span-1"
          >
            <Card className="h-full glass-card border-subject-biology-primary/30 hover:shadow-glow-green transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <Heart className="h-16 w-16 text-subject-biology-primary mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-glow-green">موسوعة الأمراض</h3>
                <p className="text-white/70 mb-4">دليل شامل للأمراض وأعراضها وعلاجها</p>
                <Button 
                  onClick={() => setSelectedTab("diseases")}
                  className="bg-subject-biology-primary hover:bg-subject-biology-secondary transition-all duration-300"
                >
                  استكشف الموسوعة
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.03 }}
            className="col-span-1"
          >
            <Card className="h-full glass-card border-subject-biology-primary/30 hover:shadow-glow-green transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <FileQuestion className="h-16 w-16 text-subject-biology-primary mb-4" />
                <h3 className="text-2xl font-bold mb-2 text-glow-green">بنك الأسئلة</h3>
                <p className="text-white/70 mb-4">أنشئ أسئلة مخصصة مع إجاباتها النموذجية</p>
                <Button 
                  onClick={() => setSelectedTab("questionbank")}
                  className="bg-subject-biology-primary hover:bg-subject-biology-secondary transition-all duration-300"
                >
                  أنشئ الأسئلة
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
          {selectedTab === "calculations" && <BiologyCalculations />}
          {selectedTab === "assistant" && <BiologyAIAssistant />}
          {selectedTab === "scientists" && <BiologyScientists />}
          {selectedTab === "diseases" && <DiseasesEncyclopedia />}
          {selectedTab === "questionbank" && <QuestionBank subject="biology" functionName="science-question-bank" />}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Biology;
