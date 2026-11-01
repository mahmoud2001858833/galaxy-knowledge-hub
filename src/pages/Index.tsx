import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookMarked,
  ClipboardCheck,
  FileDown,
  FileUp,
  Globe,
  GraduationCap,
  Handshake,
  Image as ImageIcon,
  Lightbulb,
  ListChecks,
  School,
  ShieldCheck,
  SlidersHorizontal,
  Table2,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageShell, PageSection } from '@/components/layout/PageShell';
import { CORE_SECTIONS, FUTURE_PROJECTS, FUTURE_PROJECTS_PATH } from '@/config/platformSections';
import logo from '@/assets/logo.png';

/**
 * Home page. Built only from design tokens and src/config/platformSections.ts,
 * so the sections shown here always match the navbar and the section hubs.
 * See docs/PLATFORM_IDENTITY.md and docs/DESIGN_SYSTEM.md.
 */

const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 font-bold text-card-foreground transition hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const Hero: React.FC = () => (
  <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-5 py-12 sm:px-12 sm:py-16 text-center">
    <div
      aria-hidden
      className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-from/20 to-brand-to/20 blur-3xl"
    />
    <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6">
      <span className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-xs font-semibold text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
        منصة أردنية · مدرسة عنبه الثانوية الشاملة للبنين
      </span>
      <img src={logo} alt="" className="h-16 w-16 rounded-2xl border border-border bg-background p-2 shadow-sm" />
      <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
        ذروة العلم
        <span className="mt-2 block bg-gradient-to-l from-brand-from to-brand-to bg-clip-text text-transparent text-2xl sm:text-4xl">
          منصة تعليمية ذكية للطالب والمعلم والمدرسة
        </span>
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        تعلّم المنهاج الأردني بفهم مع مساعد يشرح من الكتاب المدرسي، أنشئ امتحاناً بنمط الوزارة من ملفك في دقائق، وجرّب العلوم في
        مختبرات تفاعلية.
      </p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link to="/learn" className={primaryButton}>
          ابدأ التعلّم
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
        <Link to="/exam-creator" className={secondaryButton}>
          <ClipboardCheck className="h-4 w-4" aria-hidden />
          أنشئ امتحاناً
        </Link>
      </div>
    </div>
  </section>
);

const CoreSections: React.FC = () => (
  <PageSection title="أقسام المنصة" className="mb-0">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {CORE_SECTIONS.map(({ id, title, tagline, path, icon: Icon, pages }) => (
        <article
          key={id}
          className="group flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from to-brand-to text-white">
              <Icon className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="text-lg font-bold text-card-foreground">{title}</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{tagline}</p>
          <ul className="flex flex-wrap gap-2">
            {pages.slice(0, 4).map((page) => (
              <li key={page.path}>
                <Link
                  to={page.path}
                  className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to={path}
            className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            كل صفحات القسم ({pages.length})
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
        </article>
      ))}
    </div>
  </PageSection>
);

const EXAM_STEPS: { icon: LucideIcon; label: string }[] = [
  { icon: FileUp, label: 'اختر من المكتبة أو ارفع ملفك' },
  { icon: ListChecks, label: 'اختر الوحدات' },
  { icon: SlidersHorizontal, label: 'حدّد الأسئلة وطلبك' },
  { icon: FileDown, label: 'نزّل PDF' },
  { icon: Globe, label: 'شارك رابطاً إلكترونياً' },
];

const EXAM_FEATURES: { icon: LucideIcon; text: string }[] = [
  { icon: ListChecks, text: 'امتحان حتى 100 سؤال، أو بنك أسئلة حتى 1000 سؤال تسحب منه امتحانات عشوائية متعددة' },
  { icon: BookMarked, text: 'اختر من مكتبة ملفات المنصة بلا رفع، أو ادمج عدة ملفات في امتحان واحد' },
  { icon: ShieldCheck, text: 'أسئلة من ملفك فقط، وكل سؤال مرفق باقتباس يثبت إجابته ويُدقَّق آلياً' },
  { icon: Table2, text: 'جداول تُنقل من ملفك خلية بخلية وتُدقَّق مقابله' },
  { icon: ImageIcon, text: 'أشكال علمية تُقصّ من ملفك الأصلي بدقة، بلا رسوم مولَّدة قد تخطئ' },
];

const ExamCreatorShowcase: React.FC = () => (
  <section aria-labelledby="exam-creator-title" className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
    <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-5">
        <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">للمعلمين</span>
        <h2 id="exam-creator-title" className="text-2xl font-black leading-tight sm:text-3xl">
          إنشاء الامتحانات بالذكاء الاصطناعي من ملفك
        </h2>
        <p className="text-muted-foreground">
          ارفع الكتاب أو الملزمة، يقسّمه الذكاء الاصطناعي إلى وحدات، تختار منها، ثم تحصل على امتحان جاهز للطباعة أو للإجابة
          إلكترونياً.
        </p>
        <ul className="space-y-2">
          {EXAM_FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
        <Link to="/exam-creator" className={primaryButton}>
          ابدأ إنشاء امتحان
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <ol className="space-y-2">
        {EXAM_STEPS.map(({ icon: Icon, label }, i) => (
          <li key={label} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-semibold">
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

const AUDIENCES: { icon: LucideIcon; title: string; text: string; to: string; cta: string }[] = [
  { icon: GraduationCap, title: 'الطالب', text: 'افهم الدرس، تدرّب على الأسئلة، وجرّب العلوم في المختبرات.', to: '/learn', cta: 'التعلّم والمنهاج' },
  { icon: ClipboardCheck, title: 'المعلم', text: 'أنشئ امتحانات بنمط الوزارة وصحّحها، وتابع صفك.', to: '/exams', cta: 'الامتحانات والتقييم' },
  { icon: Users, title: 'ولي الأمر', text: 'تابع واجبات ابنك وملاحظات معلميه وتواصل معهم.', to: '/communication-bridge', cta: 'جسر التواصل' },
  { icon: School, title: 'المدرسة', text: 'أخبار المدرسة ومجتمعها ومشاريع طلبتها في مكان واحد.', to: '/school', cta: 'المجتمع المدرسي' },
];

const Audiences: React.FC = () => (
  <PageSection title="لمن المنصة؟" className="mb-0">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {AUDIENCES.map(({ icon: Icon, title, text, to, cta }) => (
        <Link
          key={title}
          to={to}
          className="group flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <h3 className="font-bold text-card-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-primary">
            {cta}
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      ))}
    </div>
  </PageSection>
);

const ClosingLinks: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Handshake className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-lg font-bold">الشراكات المؤسسية</h2>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        مدرسة أو جامعة أو مؤسسة تعليمية؟ انضم شريكاً واستخدم المنصة مع طلبتك ومعلميك.
      </p>
      <Link to="/institutional-partnerships" className={`${secondaryButton} mt-auto self-start`}>
        اطلب شراكة
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </Link>
    </section>
    <section className="flex flex-col gap-4 rounded-3xl border border-dashed border-border bg-background p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <Lightbulb className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-lg font-bold">مشاريع مستقبلية</h2>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        مشاريع تجريبية خارج الأقسام الأساسية، متاحة للاطلاع:{' '}
        {FUTURE_PROJECTS.slice(0, 3)
          .map((p) => p.title)
          .join('، ')}{' '}
        وغيرها.
      </p>
      <Link to={FUTURE_PROJECTS_PATH} className="mt-auto inline-flex items-center gap-1 self-start text-sm font-bold text-primary hover:underline">
        تصفّح المشاريع ({FUTURE_PROJECTS.length})
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  </div>
);

const Index: React.FC = () => (
  <PageShell className="flex flex-col gap-12 sm:gap-14">
    <SEO
      title="منصة ذروة العلم | منصة تعليمية أردنية للطالب والمعلم والمدرسة"
      description="ذروة العلم منصة تعليمية أردنية: المنهاج الأردني مع مساعد ذكي، إنشاء امتحانات بنمط الوزارة من ملف المعلم، ومختبرات علمية تفاعلية."
      keywords="ذروة العلم, منصة تعليمية أردنية, المنهاج الأردني, التوجيهي, منشئ الامتحانات, محاكاة علمية, فيزياء, كيمياء, أحياء, رياضيات"
    />
    <Hero />
    <CoreSections />
    <ExamCreatorShowcase />
    <Audiences />
    <ClosingLinks />
  </PageShell>
);

export default Index;
