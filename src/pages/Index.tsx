import React from 'react';
import { motion } from 'framer-motion';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EducationalResources from '@/components/EducationalResources';
import PlatformCategories from '@/components/PlatformCategories';
import SchoolMagazineSection from '@/components/SchoolMagazineSection';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/i18n/LanguageContext';
import { SEO } from '@/components/SEO';

const Index = () => {
  const { dir } = useLanguage();
  
  return (
    <div className={`min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950`} dir={dir}>
      <SEO 
        title="الصفحة الرئيسية - منصة تعليمية تفاعلية شاملة"
        description="ذروة العلم - أفضل منصة تعليمية سعودية تفاعلية شاملة لتعلم الفيزياء والكيمياء والأحياء والرياضيات واللغة العربية والإنجليزية مع مساعد ذكي AI وأدوات تعليمية متطورة وألغاز تفاعلية ومحاكاة علمية وفيديوهات تعليمية ومشاريع بيئية وBTEC تكنولوجيا المعلومات"
        keywords="ذروة العلم, منصة ذروة العلم, ذروة العلم التعليمية, موقع ذروة العلم, تطبيق ذروة العلم, منصة تعليمية سعودية, منصة تعليمية عربية, منصة تعليمية شاملة, منصة تعليمية تفاعلية, تعليم إلكتروني, تعليم رقمي, تعليم ذكي, أفضل منصة تعليمية, تعلم الفيزياء, تعلم الكيمياء, تعلم الأحياء, تعلم الرياضيات, تعلم اللغة العربية, تعلم الإنجليزية, مساعد ذكي, AI تعليمي, ذكاء اصطناعي, ألغاز تعليمية, فيديوهات تعليمية, الجدول الدوري, محاكاة الذرة, حسابات علمية, آلة حاسبة علمية, بنك الأسئلة, الاستدامة البيئية, حاسبة الكربون, BTEC, تكنولوجيا المعلومات, البرمجة, جسر التواصل, المشرفون والمعلمين, لوحة التحكم, مشاريع الطلاب, المكتبة البصرية, المجلة العلمية, الفن والتصميم, تنظيم الدراسة, المرشد النفسي, التعليم السعودي, المناهج السعودية, وزارة التعليم"
        canonicalUrl="https://yoursite.lovable.app/"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section with Logo and Orbiting Icons */}
        <HeroSection />
        
        {/* Hero and Magazine Section Side by Side */}
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
          <div className="order-2 lg:order-1">
            <SchoolMagazineSection />
          </div>
        </div>
        
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
