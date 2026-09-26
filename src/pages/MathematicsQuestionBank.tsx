import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import QuestionBank from '@/components/shared/QuestionBank';

const MathematicsQuestionBank = () => {
  return (
    <div className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white transition-colors duration-300" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={300} />
      </div>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 dark:from-purple-400 dark:via-white dark:to-purple-300">
            بنك الأسئلة - الرياضيات
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            أنشئ أسئلة رياضية مخصصة مع إجاباتها النموذجية
          </p>
        </motion.div>
        
        <QuestionBank subject="mathematics" functionName="science-question-bank" />
      </main>
      
      <Footer />
    </div>
  );
};

export default MathematicsQuestionBank;
