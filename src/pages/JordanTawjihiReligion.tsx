import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { useSearchParams } from 'react-router-dom';
import TawjihiSubjectLayout from '@/components/tawjihi/TawjihiSubjectLayout';
import { FileQuestion, BookOpen, FileText, ClipboardList } from 'lucide-react';
import tawjihiLogo from '@/assets/tawjihi-logo.jpg';

const JordanTawjihiReligion = () => {
  const [searchParams] = useSearchParams();
  const grade = searchParams.get('grade') || 'first';

  const categories = [
    { id: 'question-bank', label: 'بنك أسئلة', icon: FileQuestion, gradient: 'from-green-600/20 to-emerald-600/20', borderColor: 'border-green-500/30', iconColor: 'text-green-400' },
    { id: 'review', label: 'مراجعة', icon: BookOpen, gradient: 'from-blue-600/20 to-cyan-600/20', borderColor: 'border-blue-500/30', iconColor: 'text-blue-400' },
    { id: 'handouts', label: 'دوسيات', icon: FileText, gradient: 'from-purple-600/20 to-pink-600/20', borderColor: 'border-purple-500/30', iconColor: 'text-purple-400' },
    { id: 'exams', label: 'امتحانات', icon: ClipboardList, gradient: 'from-amber-600/20 to-yellow-600/20', borderColor: 'border-amber-500/30', iconColor: 'text-amber-400' }
  ];

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-green-900/40 to-blue-950 bg-fixed" dir="rtl">
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex justify-center"
          >
            <img 
              src={tawjihiLogo} 
              alt="التوجيهي الأردني" 
              className="h-24 w-auto rounded-xl shadow-xl shadow-green-500/50"
            />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            التربية الإسلامية - {grade === 'first' ? 'الصف الأول ثانوي' : 'الصف الثاني ثانوي'}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            جميع المواد التعليمية لمادة التربية الإسلامية
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <TawjihiSubjectLayout
            subject="religion"
            grade={grade}
            categories={categories}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JordanTawjihiReligion;
