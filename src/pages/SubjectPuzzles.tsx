
import React from 'react';
import { motion } from 'framer-motion';
import SubjectPuzzlesComponent from '@/components/subjectPuzzles/SubjectPuzzlesComponent';

const SubjectPuzzles = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center">الألغاز التعليمية</h1>
        <SubjectPuzzlesComponent />
      </motion.div>
    </div>
  );
};

export default SubjectPuzzles;
