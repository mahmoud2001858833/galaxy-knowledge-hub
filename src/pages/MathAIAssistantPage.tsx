
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import MathAIAssistant from '@/components/mathematics/MathAIAssistant';
import { useLanguage } from '@/i18n/LanguageContext';

const MathAIAssistantPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
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
          className="mb-8"
        >
          <Button
            onClick={() => navigate('/mathematics')}
            variant="ghost"
            className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30 mb-6"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة لعالم الرياضيات
          </Button>
          
          <h1 className="text-4xl md:text-6xl font-bold text-glow-purple mb-4">
            المساعد الذكي للرياضيات
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">
            مساعد ذكي لحل المسائل الرياضية والإجابة على الأسئلة
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 shadow-glow-sm shadow-purple-500/10"
        >
          <MathAIAssistant />
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MathAIAssistantPage;
