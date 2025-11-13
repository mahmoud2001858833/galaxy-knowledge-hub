import React from 'react';
import { motion } from 'framer-motion';
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
        
        {/* Platform Categories */}
        <PlatformCategories />
        
        {/* Educational Resources */}
        <EducationalResources />
      </main>
      
      <Footer />
      
      {/* Enhanced Starfield Animation with more stars and space elements */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            className="absolute rounded-full bg-white opacity-20 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Add some nebula-like elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/5 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute top-2/3 right-1/4 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>
    </div>
  );
};

export default Index;
