import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpLeft } from 'lucide-react';
import { CORE_SECTIONS, type PlatformSection } from '@/config/platformSections';
import { cn } from '@/lib/utils';

const SectionCard: React.FC<{ section: PlatformSection; featured?: boolean; index: number }> = ({ section, featured, index }) => {
  const { title, tagline, path, icon: Icon, pages } = section;
  const shown = pages.slice(0, featured ? 9 : 3);

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl sm:p-7',
        featured && 'md:col-span-2',
      )}
    >
      {/* hover glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-brand-from/0 to-brand-to/0 blur-3xl transition-all duration-500 group-hover:from-brand-from/20 group-hover:to-brand-to/20"
      />
      <span aria-hidden className="absolute left-6 top-5 font-black text-5xl text-muted-foreground/10 sm:text-6xl">
        0{index + 1}
      </span>

      <div className="relative flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from to-brand-to text-white shadow-lg shadow-brand-to/20 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
          <Icon className="h-7 w-7" aria-hidden />
        </div>
        <div>
          <h3 className="text-xl font-black text-card-foreground">{title}</h3>
          <span className="text-xs font-semibold text-muted-foreground">{pages.length} صفحة وأداة</span>
        </div>
      </div>

      <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">{tagline}</p>

      <ul className={cn('relative mt-5 grid gap-2', featured ? 'sm:grid-cols-2 lg:grid-cols-3' : '')}>
        {shown.map((page) => (
          <li key={page.path}>
            <Link
              to={page.path}
              className="flex items-center gap-2.5 rounded-xl border border-transparent bg-muted/60 px-3 py-2 text-sm font-semibold transition hover:border-border hover:bg-background"
            >
              <page.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="truncate">{page.title}</span>
              <ArrowUpLeft className="mr-auto h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <Link to={path} className="relative mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-primary hover:underline">
        استكشف القسم
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden />
      </Link>
    </article>
  );
};

export const SectionsShowcase: React.FC = () => (
  <section aria-labelledby="sections-title">
    <div className="mb-8 flex flex-col items-center gap-3 text-center">
      <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">أقسام المنصة</span>
      <h2 id="sections-title" className="text-3xl font-black tracking-tight sm:text-4xl">
        كل ما تحتاجه في خمسة أقسام
      </h2>
      <p className="max-w-2xl text-muted-foreground">من فهم الدرس إلى الامتحان والتجربة العملية، كل أداة في مكانها الصحيح.</p>
    </div>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {CORE_SECTIONS.map((s, i) => (
        <SectionCard key={s.id} section={s} featured={i === 0} index={i} />
      ))}
    </div>
  </section>
);
