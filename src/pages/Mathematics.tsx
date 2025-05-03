
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Calculator from '@/components/mathematics/Calculator';
import MathAIAssistant from '@/components/mathematics/MathAIAssistant';
import MathPuzzles from '@/components/mathematics/MathPuzzles';
import GraphVisualizer from '@/components/mathematics/GraphVisualizer';
import MathematiciansGallery from '@/components/mathematics/MathematiciansGallery';
import { Button } from '@/components/ui/button';
import { ArrowDown, Brain, Calculator as CalculatorIcon, PuzzlePiece } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const Mathematics = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  
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

  // Handle card selection
  const handleCardSelect = (component: string) => {
    setSelectedComponent(component);
    setTimeout(() => {
      document.getElementById('selected-component')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  };

  // Back to cards
  const handleBackToCards = () => {
    setSelectedComponent(null);
    setTimeout(() => {
      document.getElementById('math-content')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
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

  // Graph visualization animation data
  const graphPoints = [
    { x: 10, y: 50 },
    { x: 20, y: 30 },
    { x: 30, y: 70 },
    { x: 40, y: 20 },
    { x: 50, y: 60 },
    { x: 60, y: 40 },
    { x: 70, y: 80 },
    { x: 80, y: 10 },
    { x: 90, y: 50 }
  ];
  
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
            <motion.div
              className="mb-16 relative w-full max-w-2xl h-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              {/* Mathematics Platform Logo */}
              <div className="absolute inset-0 flex justify-center items-center">
                <img 
                  src="https://sdmntprsouthcentralus.oaiusercontent.com/files/00000000-0e58-61f7-8efe-aa9fd8a59c7a/raw?se=2025-05-03T13%3A50%3A25Z&sp=r&sv=2024-08-04&sr=b&scid=c725ed43-1deb-5989-ad2e-8e45df1c63ae&skoid=fa7966e7-f8ea-483c-919a-13acfd61d696&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-05-02T20%3A35%3A20Z&ske=2025-05-03T20%3A35%3A20Z&sks=b&skv=2024-08-04&sig=e3pTLmVb8mzHluQ3bC3Dx2uZJFMLr0fNdCRpCIS7XL0%3D"
                  alt="Mathematics Platform Logo"
                  className="max-w-full max-h-full object-contain rounded-lg z-10"
                />
              </div>

              {/* Interactive Graph Visualization */}
              <svg 
                className="absolute inset-0 w-full h-full opacity-40" 
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <motion.path
                  d={`M ${graphPoints.map(point => `${point.x},${point.y}`).join(' L ')}`}
                  stroke="rgba(155, 135, 245, 0.8)"
                  strokeWidth="0.8"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
                
                {graphPoints.map((point, i) => (
                  <motion.circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r="1.5"
                    fill="#9b87f5"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  />
                ))}
              </svg>
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-space-neon-blue via-white to-space-vivid-purple"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              عالم الرياضيات
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <Button 
                onClick={handleStartExperience}
                className="text-xl bg-space-deep-purple hover:bg-space-neon-blue text-white px-8 py-6 rounded-full flex items-center gap-3 transform transition-all hover:scale-110"
              >
                ابدأ التجربة
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowDown className="h-6 w-6" />
                </motion.div>
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
            className="min-h-[80vh]"
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

            {!selectedComponent ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                {/* AI Assistant Card */}
                <CategoryCard 
                  title="المساعد الذكي"
                  description="اطرح أسئلة متعلقة بالرياضيات واحصل على إجابات فورية من المساعد الذكي"
                  bgColor="from-space-deep-purple/80 to-space-deep-purple/30"
                  iconColor="bg-space-neon-blue/20 text-space-neon-blue"
                  icon={<Brain className="h-6 w-6" />}
                  onClick={() => handleCardSelect('assistant')}
                />
                
                {/* Math Puzzles Card */}
                <CategoryCard 
                  title="ألغاز رياضية"
                  description="اختبر معلوماتك في الرياضيات مع مجموعة متنوعة من الألغاز والتحديات"
                  bgColor="from-space-neon-blue/80 to-space-neon-blue/30"
                  iconColor="bg-white/20 text-white"
                  icon={<PuzzlePiece className="h-6 w-6" />}
                  onClick={() => handleCardSelect('puzzles')}
                />
                
                {/* Calculator Card */}
                <CategoryCard 
                  title="الآلة الحاسبة"
                  description="أداة حاسبة متقدمة لإجراء العمليات الحسابية والمعادلات الرياضية"
                  bgColor="from-green-600/80 to-green-600/30"
                  iconColor="bg-white/20 text-white"
                  icon={<CalculatorIcon className="h-6 w-6" />}
                  onClick={() => handleCardSelect('calculator')}
                />

                {/* Graph Visualization Card */}
                <CategoryCard 
                  title="التمثيل البياني"
                  description="رسم وتحليل الدوال والمعادلات الرياضية بيانيًا بطريقة تفاعلية"
                  bgColor="from-amber-600/80 to-amber-600/30"
                  iconColor="bg-white/20 text-white"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <path d="M3 3v18h18"></path>
                      <path d="m19 9-5 5-4-4-3 3"></path>
                    </svg>
                  }
                  onClick={() => handleCardSelect('graph')}
                />

                {/* Mathematicians Gallery Card */}
                <CategoryCard 
                  title="علماء الرياضيات"
                  description="تعرف على أهم علماء الرياضيات عبر التاريخ وإسهاماتهم العلمية"
                  bgColor="from-purple-600/80 to-purple-600/30"
                  iconColor="bg-white/20 text-white"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  }
                  onClick={() => handleCardSelect('mathematicians')}
                />
              </div>
            ) : (
              <motion.div
                id="selected-component"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={selectedComponent}
              >
                <button 
                  onClick={handleBackToCards}
                  className="text-space-neon-blue hover:text-space-bright-blue mb-6 text-right flex items-center gap-2"
                >
                  العودة إلى الخيارات
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </button>

                {selectedComponent === 'assistant' && <MathAIAssistant />}
                {selectedComponent === 'puzzles' && <MathPuzzles />}
                {selectedComponent === 'calculator' && <Calculator />}
                {selectedComponent === 'graph' && <GraphVisualizer />}
                {selectedComponent === 'mathematicians' && <MathematiciansGallery />}
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

// Reusable Category Card Component
interface CategoryCardProps {
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  title, 
  description, 
  bgColor, 
  iconColor, 
  icon, 
  onClick 
}) => {
  return (
    <motion.div
      className={cn("bg-gradient-to-br", bgColor, "p-6 rounded-2xl border border-white/10 hover:border-white/30 cursor-pointer transition-all hover:shadow-lg hover:shadow-space-neon-blue/20 h-full")}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={onClick}
    >
      <div className={cn("h-12 w-12 rounded-full flex items-center justify-center mb-4", iconColor)}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-2 text-right">{title}</h3>
      <p className="text-white/70 text-right">{description}</p>
    </motion.div>
  );
};

export default Mathematics;
