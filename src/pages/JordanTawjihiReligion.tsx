import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileQuestion, BookOpen, FileText, ClipboardList } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import TawjihiFileUpload from '@/components/tawjihi/TawjihiFileUpload';
import TawjihiFilesGrid from '@/components/tawjihi/TawjihiFilesGrid';

const JordanTawjihiReligion = () => {
  const [searchParams] = useSearchParams();
  const grade = searchParams.get('grade') || 'first';
  const [activeCategory, setActiveCategory] = useState('question-bank');

  const categories = [
    { id: 'question-bank', label: 'بنك أسئلة', icon: FileQuestion },
    { id: 'review', label: 'مراجعة', icon: BookOpen },
    { id: 'handouts', label: 'دوسيات', icon: FileText },
    { id: 'exams', label: 'امتحانات', icon: ClipboardList }
  ];

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
            التربية الإسلامية - {grade === 'first' ? 'الصف الأول ثانوي' : 'الصف الثاني ثانوي'}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            جميع المواد التعليمية لمادة التربية الإسلامية
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} dir="rtl">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id}>
                <div className="space-y-6">
                  <TawjihiFileUpload 
                    subject="religion" 
                    category={cat.id}
                    grade={grade}
                  />
                  <TawjihiFilesGrid 
                    subject="religion" 
                    category={cat.id}
                    grade={grade}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JordanTawjihiReligion;
