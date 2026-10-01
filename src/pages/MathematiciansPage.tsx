
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import MathematiciansGallery from '@/components/mathematics/MathematiciansGallery';
import { useLanguage } from '@/i18n/LanguageContext';

const MathematiciansPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-purple-900/40 to-blue-950 bg-fixed" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={300} />
      </div>
      
      <Navbar />
      
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-2 sm:px-6 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <Button
            onClick={() => navigate('/mathematics')}
            variant="ghost"
            className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30 gap-2 self-start"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            العودة لعالم الرياضيات
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <MathematiciansGallery />
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MathematiciansPage;
