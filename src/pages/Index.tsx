import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { SEO } from '@/components/SEO';
import SafeBoundary from '@/components/common/SafeBoundary';

// Executive Product Tour 5-Section Architecture
import ProductTourHero from '@/components/home/ProductTourHero';
import PlatformMissionSection from '@/components/home/PlatformMissionSection';
import EcosystemBentoGrid from '@/components/home/EcosystemBentoGrid';
import InteractiveCapabilitiesDemo from '@/components/home/InteractiveCapabilitiesDemo';
import StrategicRoadmapSection from '@/components/home/StrategicRoadmapSection';
import EducationalResources from '@/components/EducationalResources';

const Index = () => {
  let dir = 'rtl';
  try {
    const lang = useLanguage();
    if (lang && lang.dir) dir = lang.dir;
  } catch {
    dir = 'rtl';
  }
  
  return (
    <div 
      className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white relative selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900 transition-colors duration-300 font-sans" 
      dir={dir}
    >
      <SEO 
        title="ذروة العلم - المنظومة الوطنية للتعليم التفاعلي والمحاكاة 3D"
        description="منصة ذروة العلم - البنية التحتية الرقمية الرائدة للمختبرات العلمية ثلاثية الأبعاد (3D)، الذكاء الاصطناعي التطبيقي، وحلول الشمولية والتربية الخاصة مع مشروع دامج."
        keywords="ذروة العلم, منصة ذروة العلم, محاكاة علمية 3D, فيزياء, كيمياء, أحياء, رياضيات, الذكاء الاصطناعي, روبوتات, دامج, تعليم تفاعلي"
        canonicalUrl="https://yoursite.lovable.app/"
      />

      <SafeBoundary name="Navbar">
        <Navbar />
      </SafeBoundary>
      
      <main className="flex-1 relative z-10 space-y-4">
        {/* Section 1: Hero & Vision (المقدمة والترحيب المؤسسي) */}
        <SafeBoundary name="ProductTourHero">
          <ProductTourHero />
        </SafeBoundary>
        
        {/* Section 2: Mission & Core Value (هدف المنصة ورسالتها الأكاديمية) */}
        <SafeBoundary name="PlatformMissionSection">
          <PlatformMissionSection />
        </SafeBoundary>
        
        {/* Section 3: Educational Ecosystem & Platforms (منظومة المنصات التعليمية - Bento Grid) */}
        <SafeBoundary name="EcosystemBentoGrid">
          <EcosystemBentoGrid />
        </SafeBoundary>
        
        {/* Section 4: Interactive Demos & Capabilities (المختبرات والتجارب العملية الحية) */}
        <SafeBoundary name="InteractiveCapabilitiesDemo">
          <InteractiveCapabilitiesDemo />
        </SafeBoundary>
        
        {/* Section 5: Future Strategic Initiatives (المشاريع المستقبلية - مبادرة "دمج" الاستراتيجية) */}
        <SafeBoundary name="StrategicRoadmapSection">
          <StrategicRoadmapSection />
        </SafeBoundary>

        {/* Auxiliary Learning Tools & Resources */}
        <SafeBoundary name="EducationalResources">
          <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8">
            <EducationalResources />
          </div>
        </SafeBoundary>
      </main>
      
      <SafeBoundary name="Footer">
        <Footer />
      </SafeBoundary>
    </div>
  );
};

export default Index;
