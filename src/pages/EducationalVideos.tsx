
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import EducationalVideos from '@/components/shared/EducationalVideos';
import { useLanguage } from '@/i18n/LanguageContext';

const EducationalVideosPage = () => {
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      <StarField starCount={200} />
      <Navbar />

      <main className="flex-1 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-500">
              {t.resources.educationalVideos}
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              {t.resources.educationalVideosDescription}
            </p>
          </div>

          <EducationalVideos />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default EducationalVideosPage;
