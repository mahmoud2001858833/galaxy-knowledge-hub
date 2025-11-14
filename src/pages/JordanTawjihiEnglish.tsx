import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { useSearchParams } from 'react-router-dom';
import TawjihiSubjectLayout from '@/components/tawjihi/TawjihiSubjectLayout';
import { FileQuestion, BookOpen, FileText, ClipboardList, PenTool } from 'lucide-react';
import EnglishEssayWriter from '@/components/english/EnglishEssayWriter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import tawjihiLogo from '@/assets/tawjihi-logo.jpg';

const JordanTawjihiEnglish = () => {
  const [searchParams] = useSearchParams();
  const grade = searchParams.get('grade') || 'first';

  const categories = [
    { id: 'question-bank', label: 'بنك أسئلة', icon: FileQuestion, gradient: 'from-blue-600/20 to-cyan-600/20', borderColor: 'border-blue-500/30', iconColor: 'text-blue-400' },
    { id: 'review', label: 'مراجعة', icon: BookOpen, gradient: 'from-purple-600/20 to-pink-600/20', borderColor: 'border-purple-500/30', iconColor: 'text-purple-400' },
    { id: 'handouts', label: 'دوسيات', icon: FileText, gradient: 'from-amber-600/20 to-yellow-600/20', borderColor: 'border-amber-500/30', iconColor: 'text-amber-400' },
    { id: 'exams', label: 'امتحانات', icon: ClipboardList, gradient: 'from-green-600/20 to-emerald-600/20', borderColor: 'border-green-500/30', iconColor: 'text-green-400' }
  ];

  const additionalContent = (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <Card className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-2 border-indigo-500/30 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <PenTool className="w-8 h-8 text-indigo-400" />
            تصحيح التعبير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnglishEssayWriter language="ar" />
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950 bg-fixed" dir="rtl">
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
              className="h-24 w-auto rounded-xl shadow-xl shadow-blue-500/50"
            />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            اللغة الإنجليزية - {grade === 'first' ? 'الصف الأول ثانوي' : 'الصف الثاني ثانوي'}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            جميع المواد التعليمية لمادة اللغة الإنجليزية
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <TawjihiSubjectLayout
            subject="english"
            grade={grade}
            categories={categories}
            additionalContent={additionalContent}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JordanTawjihiEnglish;
