import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import HandheldCalculator from '@/components/mathematics/HandheldCalculator';
import { useLanguage } from '@/i18n/LanguageContext';

const CalculatorPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 bg-fixed" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={200} />
      </div>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              الحاسبة الرياضية المتقدمة
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            حاسبة علمية متكاملة مع دعم العمليات الحسابية والمثلثية واللوغاريتمية والمساعد الذكي
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <HandheldCalculator />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => navigate('/mathematics')}
            variant="outline"
            className="group border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 gap-2"
          >
            العودة لعالم الرياضيات
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rotate-180" />
          </Button>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CalculatorPage;
