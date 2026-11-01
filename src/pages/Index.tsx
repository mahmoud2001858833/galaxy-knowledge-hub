import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Handshake, Lightbulb } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageShell } from '@/components/layout/PageShell';
import { HomeHero } from '@/components/home/HomeHero';
import { SectionsShowcase } from '@/components/home/SectionsShowcase';
import { PlatformTour } from '@/components/home/PlatformTour';
import { AudienceSwitcher } from '@/components/home/AudienceSwitcher';
import { FUTURE_PROJECTS, FUTURE_PROJECTS_PATH } from '@/config/platformSections';

/**
 * Home page. Built only from design tokens and src/config/platformSections.ts,
 * so the sections shown here always match the navbar and the section hubs.
 * See docs/PLATFORM_IDENTITY.md and docs/DESIGN_SYSTEM.md.
 */

const ClosingBand: React.FC = () => (
  <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-l from-brand-from to-brand-to px-6 py-12 text-center text-white sm:px-12 sm:py-16">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:20px_20px]"
    />
    <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
      <h2 className="text-3xl font-black leading-tight sm:text-4xl">جاهز تبدأ؟</h2>
      <p className="text-base leading-relaxed text-white/85 sm:text-lg">أنشئ حسابك مجاناً وابدأ بأول درس أو أول امتحان اليوم.</p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link
          to="/auth"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 font-bold text-[hsl(var(--brand-to))] shadow-lg transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          أنشئ حسابك
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          to="/learn"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/40 px-7 py-3.5 font-bold transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          تصفّح المنصة أولاً
        </Link>
      </div>
    </div>
  </section>
);

const MoreLinks: React.FC = () => (
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
    <Link
      to="/institutional-partnerships"
      className="group flex items-center gap-4 rounded-[2rem] border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Handshake className="h-6 w-6" aria-hidden />
      </span>
      <span className="flex-1">
        <span className="block text-lg font-black">الشراكات المؤسسية</span>
        <span className="text-sm text-muted-foreground">مدرسة أو جامعة؟ استخدم المنصة مع طلبتك ومعلميك.</span>
      </span>
      <ArrowLeft className="h-5 w-5 text-primary transition-transform group-hover:-translate-x-1" aria-hidden />
    </Link>
    <Link
      to={FUTURE_PROJECTS_PATH}
      className="group flex items-center gap-4 rounded-[2rem] border border-dashed border-border bg-background p-6 transition hover:-translate-y-0.5 hover:border-primary/40"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
        <Lightbulb className="h-6 w-6" aria-hidden />
      </span>
      <span className="flex-1">
        <span className="block text-lg font-black">مشاريع مستقبلية</span>
        <span className="text-sm text-muted-foreground">
          {FUTURE_PROJECTS.length} مشروعاً تجريبياً، منها {FUTURE_PROJECTS.slice(0, 2).map((p) => p.title.split(':')[0]).join(' و')}.
        </span>
      </span>
      <ArrowLeft className="h-5 w-5 text-primary transition-transform group-hover:-translate-x-1" aria-hidden />
    </Link>
  </div>
);

const Index: React.FC = () => (
  <PageShell className="flex flex-col gap-20 sm:gap-24">
    <SEO
      title="منصة ذروة العلم | منصة تعليمية أردنية للطالب والمعلم والمدرسة"
      description="ذروة العلم منصة تعليمية أردنية: المنهاج الأردني مع مساعد ذكي، إنشاء امتحانات بنمط الوزارة من ملف المعلم، ومختبرات علمية تفاعلية."
      keywords="ذروة العلم, منصة تعليمية أردنية, المنهاج الأردني, التوجيهي, منشئ الامتحانات, محاكاة علمية, فيزياء, كيمياء, أحياء, رياضيات"
    />
    <HomeHero />
    <SectionsShowcase />
    <PlatformTour />
    <AudienceSwitcher />
    <MoreLinks />
    <ClosingBand />
  </PageShell>
);

export default Index;
