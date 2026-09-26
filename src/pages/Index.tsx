import React from 'react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EducationalResources from '@/components/EducationalResources';
import PlatformCategories from '@/components/PlatformCategories';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/i18n/LanguageContext';
import { SEO } from '@/components/SEO';

const Index = () => {
  const { dir } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col text-right bg-white dark:bg-gradient-to-b dark:from-[#050714] dark:via-[#090e28] dark:to-[#040612] text-slate-900 dark:text-white relative selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-300" dir={dir}>
      <SEO 
        title="ذروة العلم - منصة الابتكار والتعليم التفاعلي ثلاثي الأبعاد"
        description="منصة ذروة العلم - منظومة تعليمية عربية شاملة للمحاكاة العلمية ثلاثية الأبعاد (3D)، الذكاء الاصطناعي، الفيزياء، الكيمياء، الأحياء، الرياضيات، والتربية الخاصة مع منصة دامج."
        keywords="ذروة العلم, منصة ذروة العلم, محاكاة علمية 3D, فيزياء, كيمياء, أحياء, رياضيات, الذكاء الاصطناعي, دامج, فالك المعرفة, تعليم تفاعلي"
        canonicalUrl="https://yoursite.lovable.app/"
      />
      <div className="dark:opacity-100 opacity-20 pointer-events-none transition-opacity duration-300">
        <StarField />
      </div>
      <Navbar />
      
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Platform Categories */}
        <PlatformCategories />
        
        {/* Educational Resources */}
        <EducationalResources />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
