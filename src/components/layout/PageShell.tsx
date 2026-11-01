import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, type LucideIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

/**
 * Platform page building blocks. Colors come only from the design tokens in
 * src/index.css (bg-background, bg-card, text-muted-foreground, border-border,
 * brand-from/brand-to), so every page looks the same in light and dark mode.
 * See docs/DESIGN_SYSTEM.md.
 */

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  /** Hide navbar/footer for full-screen tools (labs, exam runners) */
  bare?: boolean;
}

export const PageShell: React.FC<PageShellProps> = ({ children, className, bare = false }) => (
  <div className="min-h-screen flex flex-col bg-background text-foreground font-sans" dir="rtl">
    {!bare && <Navbar />}
    <main className={cn('flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10', className)}>{children}</main>
    {!bare && <Footer />}
  </div>
);

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon: Icon, crumbs, actions }) => (
  <header className="mb-8 sm:mb-10">
    {crumbs && crumbs.length > 0 && (
      <nav aria-label="مسار الصفحة" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {crumbs.map((c, i) => (
          <React.Fragment key={`${c.label}-${i}`}>
            {i > 0 && <ChevronLeft className="h-3.5 w-3.5" aria-hidden />}
            {c.to ? (
              <Link to={c.to} className="hover:text-foreground transition-colors">
                {c.label}
              </Link>
            ) : (
              <span className="text-foreground font-semibold">{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    )}
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-from to-brand-to text-white flex items-center justify-center shadow-lg shadow-brand-to/20">
            <Icon className="h-7 w-7" aria-hidden />
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  </header>
);

interface PageCardLinkProps {
  to: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
}

export const PageCardLink: React.FC<PageCardLinkProps> = ({ to, title, description, icon: Icon, badge }) => (
  <Link
    to={to}
    className="group relative flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <div className="flex items-start justify-between gap-3">
      {Icon && (
        <div className="h-11 w-11 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      )}
      {badge && (
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{badge}</span>
      )}
    </div>
    <div>
      <h3 className="font-bold text-card-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  </Link>
);

export const PageSection: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className,
}) => (
  <section className={cn('mb-10', className)}>
    {title && <h2 className="mb-4 text-lg font-bold">{title}</h2>}
    {children}
  </section>
);
