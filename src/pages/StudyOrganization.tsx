
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { Book } from 'lucide-react';

const StudyOrganization = () => {
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-green-900/40 to-green-950" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-white to-green-500 mb-8">
            تنظيم الدراسة
          </h1>
          
          <p className="text-white text-lg mb-8">
            مرحبًا بك في قسم تنظيم الدراسة! هنا يمكنك العثور على نصائح وأدوات تساعدك على تنظيم دراستك بشكل فعال.
          </p>

          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Book className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-green-300 text-xl">
                قريبًا سيتم إضافة المزيد من المحتوى والأدوات هنا...
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudyOrganization;
