
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calculator, ChartLine, User, Brain, FileQuestion } from "lucide-react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { useLanguage } from '@/i18n/LanguageContext';

const Mathematics = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Card data with navigation paths
  const cards = [
    {
      title: 'الحاسبة الرياضية',
      icon: <Calculator className="w-12 h-12 text-purple-400" />,
      description: 'حاسبة متقدمة للعمليات الرياضية المختلفة',
      path: '/mathematics/calculator'
    },
    {
      title: 'معرض الرسوم البيانية',
      icon: <ChartLine className="w-12 h-12 text-purple-400" />,
      description: 'عرض الدوال الرياضية برسوم بيانية تفاعلية',
      path: '/mathematics/graph-visualizer'
    },
    {
      title: 'أعلام الرياضيات',
      icon: <User className="w-12 h-12 text-purple-400" />,
      description: 'تعرف على أشهر علماء الرياضيات وإنجازاتهم',
      path: '/mathematics/mathematicians'
    },
    {
      title: 'المساعد الذكي للرياضيات',
      icon: <Brain className="w-12 h-12 text-purple-400" />,
      description: 'مساعد ذكي لحل المسائل الرياضية والإجابة على الأسئلة',
      path: '/mathematics/ai-assistant'
    },
    {
      title: 'بنك الأسئلة',
      icon: <FileQuestion className="w-12 h-12 text-purple-400" />,
      description: 'أنشئ أسئلة رياضية مخصصة مع إجاباتها النموذجية',
      path: '/mathematics/question-bank',
      isNew: true
    }
  ];
  
  // Handle card click to navigate
  const handleCardClick = (path: string) => {
    navigate(path);
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
            استكشف جمال وقوة الرياضيات من خلال أدوات تفاعلية ومساعد ذكي
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className="glass-card overflow-hidden relative cursor-pointer group transition-all duration-300 hover:-translate-y-1 border border-purple-500/20 hover:border-purple-400 hover:shadow-glow-purple"
              onClick={() => handleCardClick(card.path)}
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Mathematics;
