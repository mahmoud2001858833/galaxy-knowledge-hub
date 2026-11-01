import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, BookOpenCheck, CheckCircle2, ClipboardCheck, FileDown, FlaskConical, Sparkles, type LucideIcon } from 'lucide-react';
import { CORE_SECTIONS } from '@/config/platformSections';
import logo from '@/assets/logo.png';

const QUICK_STARTS: { label: string; to: string; icon: LucideIcon }[] = [
  { label: 'أراجع درساً', to: '/jordanian-assistant', icon: BookOpenCheck },
  { label: 'أنشئ امتحاناً', to: '/exam-creator', icon: ClipboardCheck },
  { label: 'أجرّب تجربة علمية', to: '/experiments-section', icon: FlaskConical },
  { label: 'أنظّم دراستي', to: '/study-organization', icon: Sparkles },
];

const pageCount = CORE_SECTIONS.reduce((n, s) => n + s.pages.length, 0);

const STATS = [
  { value: `${CORE_SECTIONS.length}`, label: 'أقسام أساسية' },
  { value: `${pageCount}`, label: 'أداة وصفحة تعليمية' },
  { value: '+90', label: 'تجربة تفاعلية' },
  { value: '1–12', label: 'الصفوف والتوجيهي وBTEC' },
];

/** Floating preview cards: a glimpse of the assistant, the exam creator and the labs. */
const HeroVisual: React.FC = () => {
  const reduce = useReducedMotion();
  const float = (delay: number) =>
    reduce ? {} : { animate: { y: [0, -8, 0] }, transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const, delay } };

  return (
    <div className="relative mx-auto h-[380px] w-full max-w-md" aria-hidden>
      <div className="absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-from/25 to-brand-to/25 blur-3xl" />

      <motion.div {...float(0)} className="absolute right-0 top-2 w-72 rounded-3xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-from to-brand-to text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          المساعد الأردني
        </div>
        <div className="mb-2 mr-auto w-fit max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-xs">اشرح قانون نيوتن الثاني</div>
        <div className="w-fit max-w-[90%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-xs leading-relaxed text-primary-foreground">
          القوة المحصّلة تساوي الكتلة × التسارع (ق = ك × ت)…
          <div className="mt-1.5 text-[10px] opacity-80">المصدر: كتاب الفيزياء، الوحدة الثانية</div>
        </div>
      </motion.div>

      <motion.div {...float(1.2)} className="absolute bottom-6 left-0 w-60 rounded-3xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur">
        <div className="mb-3 flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5">
            <ClipboardCheck className="h-4 w-4 text-primary" /> امتحان الوحدة الثالثة
          </span>
        </div>
        {['30 سؤالاً من ملفك', 'نمط الوزارة', 'رابط إلكتروني'].map((t) => (
          <div key={t} className="mb-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {t}
          </div>
        ))}
        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-[11px] font-bold text-primary-foreground">
          <FileDown className="h-3.5 w-3.5" /> تنزيل PDF
        </div>
      </motion.div>

      <motion.div {...float(2.4)} className="absolute bottom-0 right-10 w-44 rounded-3xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur">
        <div className="mb-1 text-[11px] font-bold">مختبر المقذوفات</div>
        <svg viewBox="0 0 160 70" className="w-full">
          <path d="M5 65 Q 80 -20 155 65" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeDasharray="4 4" />
          <circle cx="80" cy="22" r="5" fill="hsl(var(--brand-to))" />
          <line x1="0" y1="65" x2="160" y2="65" stroke="hsl(var(--border))" strokeWidth="2" />
        </svg>
      </motion.div>
    </div>
  );
};

export const HomeHero: React.FC = () => (
  <section className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card">
    {/* dotted grid + brand glows */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
    />
    <div aria-hidden className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-brand-from/20 blur-3xl" />
    <div aria-hidden className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-brand-to/20 blur-3xl" />

    <div className="relative grid items-center gap-10 px-5 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:px-14 lg:py-20">
      <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-right">
        <span className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur">
          <img src={logo} alt="" className="h-5 w-5 rounded-md" />
          منصة أردنية · مدرسة عنبه الثانوية الشاملة للبنين
        </span>

        <h1 className="text-4xl font-black leading-[1.25] tracking-tight sm:text-5xl lg:text-6xl">
          تعلّم أعمق،
          <br />
          <span className="bg-gradient-to-l from-brand-from to-brand-to bg-clip-text text-transparent">وتعليم أذكى</span>
        </h1>

        <p className="max-w-xl text-base leading-loose text-muted-foreground sm:text-lg">
          <span className="font-bold text-foreground">ذروة العلم</span> منصة تعليمية ذكية للطالب والمعلم والمدرسة: مساعد يشرح من الكتاب
          المدرسي الأردني، منشئ امتحانات بنمط الوزارة من ملفك، ومختبرات علمية تفاعلية.
        </p>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/learn"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-brand-from to-brand-to px-7 py-3.5 font-bold text-white shadow-lg shadow-brand-to/25 transition hover:opacity-95 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            ابدأ التعلّم
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href="#platform-tour"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-7 py-3.5 font-bold transition hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            جولة في المنصة
          </a>
        </div>

        <div className="w-full">
          <div className="mb-2 text-xs font-semibold text-muted-foreground">ماذا تريد اليوم؟</div>
          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            {QUICK_STARTS.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3.5 py-1.5 text-sm font-semibold transition hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <HeroVisual />
      </div>
    </div>

    <dl className="relative grid grid-cols-2 border-t border-border bg-background/60 backdrop-blur sm:grid-cols-4">
      {STATS.map((s, i) => (
        <div key={s.label} className={`px-4 py-5 text-center ${i > 0 ? 'sm:border-r sm:border-border' : ''} ${i % 2 === 1 ? 'border-r border-border sm:border-r' : ''} ${i >= 2 ? 'border-t border-border sm:border-t-0' : ''}`}>
          <dt className="sr-only">{s.label}</dt>
          <dd>
            <span className="block bg-gradient-to-l from-brand-from to-brand-to bg-clip-text text-2xl font-black text-transparent sm:text-3xl" dir="ltr">
              {s.value}
            </span>
            <span className="text-xs font-semibold text-muted-foreground sm:text-sm">{s.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  </section>
);
