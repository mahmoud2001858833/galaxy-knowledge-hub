import React, { lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { SEO } from '@/components/SEO';
import SafeBoundary from '@/components/common/SafeBoundary';

// Immediate First Contentful Paint: Critical Above-the-Fold Stage
import ProductTourHero from '@/components/home/ProductTourHero';
import ExamCreatorShowcase from '@/components/home/ExamCreatorShowcase';
import PlatformMissionSection from '@/components/home/PlatformMissionSection';

// High-Performance Lazy Loading for Below-the-Fold Stages (eliminates initial main-thread jank)
const InteractivePersonaTour = lazy(() => import('@/components/home/InteractivePersonaTour'));
const EcosystemBentoGrid = lazy(() => import('@/components/home/EcosystemBentoGrid'));
const InteractiveCapabilitiesDemo = lazy(() => import('@/components/home/InteractiveCapabilitiesDemo'));
const PlatformBenchmarkMatrix = lazy(() => import('@/components/home/PlatformBenchmarkMatrix'));
const FuturePlatformsShowcase = lazy(() => import('@/components/home/FuturePlatformsShowcase'));
const EducationalResources = lazy(() => import('@/components/EducationalResources'));
const InstitutionalPartnershipSection = lazy(() => import('@/components/home/InstitutionalPartnershipSection'));
const InteractiveMousePresentationDeck = lazy(() => import('@/components/home/InteractiveMousePresentationDeck'));

const StageSkeleton = () => (
  <div className="w-full max-w-6xl mx-auto py-10 px-4 animate-pulse">
    <div className="h-7 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl w-44 mx-auto mb-3" />
    <div className="h-4 bg-slate-200/40 dark:bg-slate-800/40 rounded-xl w-72 mx-auto mb-8" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="h-44 bg-slate-200/40 dark:bg-slate-800/40 rounded-3xl" />
      <div className="h-44 bg-slate-200/40 dark:bg-slate-800/40 rounded-3xl" />
      <div className="h-44 bg-slate-200/40 dark:bg-slate-800/40 rounded-3xl" />
    </div>
  </div>
);

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
        title="منصة ذروة العلم | المنظومة الوطنية للتعليم التفاعلي والمحاكاة 3D"
        description="منصة ذروة العلم - البنية التحتية الرقمية الرائدة للمختبرات العلمية ثلاثية الأبعاد (3D)، الذكاء الاصطناعي التطبيقي، وحلول الشمولية والتربية الخاصة مع مشروع دامج."
        keywords="ذروة العلم, منصة ذروة العلم, محاكاة علمية 3D, فيزياء, كيمياء, أحياء, رياضيات, الذكاء الاصطناعي, روبوتات, دامج, تعليم تفاعلي"
        canonicalUrl="https://yoursite.lovable.app/"
      />

      <SafeBoundary name="Navbar">
        <Navbar />
      </SafeBoundary>
      
      <main className="flex-1 relative z-10 space-y-4 w-full max-w-full overflow-x-hidden">
        {/* Stage 1: Hero & Vision (المقدمة والرؤية المؤسسية - فوري فائق السرعة) */}
        <div id="tour-stage-hero">
          <SafeBoundary name="ProductTourHero">
            <ProductTourHero />
          </SafeBoundary>
        </div>
        
        {/* إنشاء الامتحانات من ملف المعلم */}
        <SafeBoundary name="ExamCreatorShowcase">
          <ExamCreatorShowcase />
        </SafeBoundary>

        {/* Stage 2: Mission & Core Value (الرسالة الأكاديمية والمفتش الحي) */}
        <SafeBoundary name="PlatformMissionSection">
          <PlatformMissionSection />
        </SafeBoundary>

        {/* Stage 3: Tailored User Journeys (مسارات التجربة التفاعلية حسب المستخدم) */}
        <Suspense fallback={<StageSkeleton />}>
          <SafeBoundary name="InteractivePersonaTour">
            <InteractivePersonaTour />
          </SafeBoundary>
        </Suspense>
        
        {/* Stage 4: Educational Ecosystem & Platforms (شبكة المنصات والمسارات - Bento Grid) */}
        <div id="tour-stage-ecosystem">
          <Suspense fallback={<StageSkeleton />}>
            <SafeBoundary name="EcosystemBentoGrid">
              <EcosystemBentoGrid />
            </SafeBoundary>
          </Suspense>
        </div>
        
        {/* Stage 5: Interactive Demos & Capabilities (المختبرات والتجارب العملية الحية) */}
        <div id="tour-stage-capabilities">
          <Suspense fallback={<StageSkeleton />}>
            <SafeBoundary name="InteractiveCapabilitiesDemo">
              <InteractiveCapabilitiesDemo />
            </SafeBoundary>
          </Suspense>
        </div>

        {/* Stage 6: Strategic Benchmark Matrix (المقارنة المعيارية: التعليم التقليدي vs ذروة العلم) */}
        <Suspense fallback={<StageSkeleton />}>
          <SafeBoundary name="PlatformBenchmarkMatrix">
            <PlatformBenchmarkMatrix />
          </SafeBoundary>
        </Suspense>
        
        {/* Stage 7: Future Platforms & Strategic Suites (قسم المنصات المستقبلية والخطط الاستراتيجية مع مشروع دامج) */}
        <div id="tour-stage-future">
          <Suspense fallback={<StageSkeleton />}>
            <SafeBoundary name="FuturePlatformsShowcase">
              <FuturePlatformsShowcase />
            </SafeBoundary>
          </Suspense>
        </div>

        {/* Stage 8: Auxiliary Learning Tools & Resources (الأدوات المساندة والمكتبات) */}
        <div id="tour-stage-resources">
          <Suspense fallback={<StageSkeleton />}>
            <SafeBoundary name="EducationalResources">
              <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8">
                <EducationalResources />
              </div>
            </SafeBoundary>
          </Suspense>
        </div>

        {/* Stage 9: Institutional Partnerships & Enterprise Collaboration (الشراكة المؤسسية) */}
        <Suspense fallback={<StageSkeleton />}>
          <SafeBoundary name="InstitutionalPartnershipSection">
            <InstitutionalPartnershipSection />
          </SafeBoundary>
        </Suspense>

        {/* Stage 10: Interactive 3D Mouse-Parallax Platform Presentation Deck (العرض التقديمي التفاعلي ثلاثي الأبعاد) */}
        <div id="tour-stage-presentation-deck">
          <Suspense fallback={<StageSkeleton />}>
            <SafeBoundary name="InteractiveMousePresentationDeck">
              <InteractiveMousePresentationDeck />
            </SafeBoundary>
          </Suspense>
        </div>
      </main>
      
      <SafeBoundary name="Footer">
        <Footer />
      </SafeBoundary>
    </div>
  );
};

export default Index;
