import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { SEO } from '@/components/SEO';
import SafeBoundary from '@/components/common/SafeBoundary';

// Executive Product Tour Enhanced Architecture
import ProductTourHero from '@/components/home/ProductTourHero';
import PlatformMissionSection from '@/components/home/PlatformMissionSection';
import InteractivePersonaTour from '@/components/home/InteractivePersonaTour';
import EcosystemBentoGrid from '@/components/home/EcosystemBentoGrid';
import InteractiveCapabilitiesDemo from '@/components/home/InteractiveCapabilitiesDemo';
import PlatformBenchmarkMatrix from '@/components/home/PlatformBenchmarkMatrix';
import FuturePlatformsShowcase from '@/components/home/FuturePlatformsShowcase';
import EducationalResources from '@/components/EducationalResources';
import InteractiveTourGuideModal from '@/components/home/InteractiveTourGuideModal';

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
      className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white relative selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900 transition-colors duration-300 font-sans overflow-x-hidden w-full max-w-full" 
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
      
      <main className="flex-1 relative z-10 space-y-4 w-full max-w-full overflow-x-hidden">
        {/* Stage 1: Hero & Vision (المقدمة والرؤية المؤسسية) */}
        <SafeBoundary name="ProductTourHero">
          <ProductTourHero />
        </SafeBoundary>
        
        {/* Stage 2: Mission & Core Value (الرسالة الأكاديمية والمفتش الحي) */}
        <SafeBoundary name="PlatformMissionSection">
          <PlatformMissionSection />
        </SafeBoundary>

        {/* Stage 3: Tailored User Journeys (مسارات التجربة التفاعلية حسب المستخدم) */}
        <SafeBoundary name="InteractivePersonaTour">
          <InteractivePersonaTour />
        </SafeBoundary>
        
        {/* Stage 4: Educational Ecosystem & Platforms (شبكة المنصات والمسارات - Bento Grid) */}
        <SafeBoundary name="EcosystemBentoGrid">
          <EcosystemBentoGrid />
        </SafeBoundary>
        
        {/* Stage 5: Interactive Demos & Capabilities (المختبرات والتجارب العملية الحية) */}
        <SafeBoundary name="InteractiveCapabilitiesDemo">
          <InteractiveCapabilitiesDemo />
        </SafeBoundary>

        {/* Stage 6: Strategic Benchmark Matrix (المقارنة المعيارية: التعليم التقليدي vs ذروة العلم) */}
        <SafeBoundary name="PlatformBenchmarkMatrix">
          <PlatformBenchmarkMatrix />
        </SafeBoundary>
        
        {/* Stage 7: Future Platforms & Strategic Suites (قسم المنصات المستقبلية والخطط الاستراتيجية مع مشروع دامج) */}
        <SafeBoundary name="FuturePlatformsShowcase">
          <FuturePlatformsShowcase />
        </SafeBoundary>

        {/* Stage 8: Auxiliary Learning Tools & Resources (الأدوات المساندة والمكتبات) */}
        <SafeBoundary name="EducationalResources">
          <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8">
            <EducationalResources />
          </div>
        </SafeBoundary>
      </main>
      
      <SafeBoundary name="Footer">
        <Footer />
      </SafeBoundary>

      {/* Global Interactive Walkthrough Spotlight Modal */}
      <SafeBoundary name="InteractiveTourGuideModal">
        <InteractiveTourGuideModal />
      </SafeBoundary>
    </div>
  );
};

export default Index;
