import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import QuestionBank from '@/components/shared/QuestionBank';

const MathematicsQuestionBank = () => {
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
            بنك الأسئلة - الرياضيات
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
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
