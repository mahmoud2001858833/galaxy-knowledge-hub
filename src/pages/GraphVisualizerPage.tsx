
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import GraphVisualizer from '@/components/mathematics/GraphVisualizer';
import { useLanguage } from '@/i18n/LanguageContext';

const GraphVisualizerPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-purple-900/40 to-blue-950 bg-fixed" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={300} />
      </div>
      
      <Navbar />
      
      <main className="flex-1 max-w-[1800px] w-full mx-auto px-2 sm:px-6 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <Button
              onClick={() => navigate('/mathematics')}
              variant="ghost"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30 mb-2 gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              العودة لعالم الرياضيات
            </Button>
            
            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 mb-2">
              معرض الرسوم البيانية الفائق والمصمم الذكي
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-3xl">
              تمثيل بياني موسّع عالي الدقة مع دعم أكثر من 100 دالة وعملية رياضية، ومولد معادلات فوري مدعوم بالذكاء الاصطناعي
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <GraphVisualizer />
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GraphVisualizerPage;
