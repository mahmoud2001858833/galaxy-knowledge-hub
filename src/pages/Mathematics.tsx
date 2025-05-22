
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calculator, ChartLine, User, Puzzle, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import GraphVisualizer from '@/components/mathematics/GraphVisualizer';
import Calculator3D from '@/components/mathematics/Calculator';
import MathematiciansGallery from '@/components/mathematics/MathematiciansGallery';
import MathPuzzles from '@/components/mathematics/MathPuzzles';
import MathematicsVideos from '@/components/shared/videos/MathematicsVideos';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';

const Mathematics = () => {
  const { t } = useLanguage();
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Component map for easier rendering
  const components: Record<string, React.ReactNode> = {
    calculator: <Calculator3D />,
    visualizer: <GraphVisualizer />,
    mathematicians: <MathematiciansGallery />,
    puzzles: <MathPuzzles />,
    videos: <MathematicsVideos />
  };
  
  // Card data
  const cards = [
    {
      title: 'الحاسبة الرياضية',
      icon: <Calculator className="w-12 h-12 text-purple-400" />,
      description: 'حاسبة متقدمة للعمليات الرياضية المختلفة',
      key: 'calculator'
    },
    {
      title: 'معرض الرسوم البيانية',
      icon: <ChartLine className="w-12 h-12 text-purple-400" />,
      description: 'عرض الدوال الرياضية برسوم بيانية تفاعلية',
      key: 'visualizer'
    },
    {
      title: 'أعلام الرياضيات',
      icon: <User className="w-12 h-12 text-purple-400" />,
      description: 'تعرف على أشهر علماء الرياضيات وإنجازاتهم',
      key: 'mathematicians'
    },
    {
      title: 'ألغاز رياضية',
      icon: <Puzzle className="w-12 h-12 text-purple-400" />,
      description: 'تحديات وألغاز رياضية متنوعة لاختبار مهاراتك',
      key: 'puzzles'
    },
    {
      title: 'فيديوهات تعليمية',
      icon: <Video className="w-12 h-12 text-purple-400" />,
      description: 'دروس فيديو مرئية لمختلف المفاهيم الرياضية',
      key: 'videos'
    }
  ];
  
  // Handle card click
  const handleCardClick = (key: string) => {
    setSelectedComponent(key);
  };
  
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-purple-900/40 to-blue-950 bg-fixed" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={300} />
      </div>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-glow-purple mb-4">
            عالم الرياضيات
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            استكشف جمال وقوة الرياضيات من خلال أدوات تفاعلية وألغاز ممتعة
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className={`glass-card overflow-hidden relative cursor-pointer group transition-all duration-300 hover:-translate-y-1 border ${selectedComponent === card.key ? 'border-purple-400 shadow-glow-purple' : 'border-purple-500/20'}`}
              onClick={() => handleCardClick(card.key)}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="p-6 flex flex-col items-center text-center h-full">
                <div className="mb-4 p-3 rounded-full bg-purple-900/30 backdrop-blur-sm">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-white/70 mb-4">{card.description}</p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                    استكشف
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {selectedComponent && (
          <motion.div
            key={selectedComponent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 shadow-glow-sm shadow-purple-500/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-300">
                {cards.find(card => card.key === selectedComponent)?.title}
              </h2>
              <button
                onClick={() => setSelectedComponent(null)}
                className="text-white/70 hover:text-white"
              >
                &times; إغلاق
              </button>
            </div>
            {components[selectedComponent]}
          </motion.div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Mathematics;
