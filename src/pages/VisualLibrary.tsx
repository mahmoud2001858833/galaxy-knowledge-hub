
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';

const VisualLibrary = () => {
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-500 mb-8">
            المكتبة المرئية
          </h1>
          
          <p className="text-white text-lg mb-8">
            مرحبًا بك في المكتبة المرئية! هنا يمكنك العثور على صور تعليمية لمختلف المواضيع العلمية.
          </p>

          <div className="flex justify-center items-center h-64">
            <p className="text-blue-300 text-xl">
              قريبًا سيتم إضافة المزيد من الصور والمحتوى التعليمي هنا...
            </p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VisualLibrary;
