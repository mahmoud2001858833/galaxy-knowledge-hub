import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import SafeBoundary from '@/components/common/SafeBoundary';
import MultimodalTutorHub from '@/components/ai/MultimodalTutorHub';

export const MultimodalTutorPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070919] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300" dir="rtl">
      <SEO 
        title="المعلم الصوتي والبصري الذكي | منصة ذروة العلم 2.0"
        description="حل مسائل الفيزياء والكيمياء والرياضيات المكتوبة بخط اليد بالصورة والكاميرا، والتفاعل الصوتي المباشر مع المعلم الذكي وفق المناهج الأردنية ومسارات BTEC."
      />

      <SafeBoundary name="Navbar">
        <Navbar />
      </SafeBoundary>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <SafeBoundary name="MultimodalTutorHub">
          <MultimodalTutorHub />
        </SafeBoundary>
      </main>

      <SafeBoundary name="Footer">
        <Footer />
      </SafeBoundary>
    </div>
  );
};

export default MultimodalTutorPage;
