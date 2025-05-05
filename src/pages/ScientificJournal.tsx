
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { FileText } from 'lucide-react';

const ScientificJournal = () => {
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-purple-900/40 to-purple-950" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-purple-500 mb-8">
            المجلة العلمية
          </h1>
          
          <p className="text-white text-lg mb-8">
            مرحبًا بك في المجلة العلمية! هنا يمكنك العثور على مقالات ودراسات علمية في مختلف التخصصات.
          </p>

          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-300 text-xl">
                قريبًا سيتم إضافة المزيد من المقالات والدراسات العلمية هنا...
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ScientificJournal;
