
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { MessageSquare } from 'lucide-react';

const ChatRooms = () => {
  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-cyan-900/40 to-cyan-950" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-cyan-500 mb-8">
            غرف المحادثة
          </h1>
          
          <p className="text-white text-lg mb-8">
            مرحبًا بك في غرف المحادثة! هنا يمكنك التواصل مع الطلاب والمعلمين لمناقشة المواضيع العلمية المختلفة.
          </p>

          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <p className="text-cyan-300 text-xl">
                قريبًا سيتم إطلاق غرف المحادثة...
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatRooms;
