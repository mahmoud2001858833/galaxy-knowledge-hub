import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Stat { label: string; value: React.ReactNode; tone?: 'primary' | 'success' | 'warn' | 'info'; }

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  stats?: Stat[];
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  backTo?: string;
}

const toneClass: Record<string, string> = {
  primary: 'from-sky-500/15 to-indigo-500/10 text-sky-700 border-sky-200',
  success: 'from-emerald-500/15 to-teal-500/10 text-emerald-700 border-emerald-200',
  warn:    'from-amber-500/15 to-orange-500/10 text-amber-700 border-amber-200',
  info:    'from-violet-500/15 to-fuchsia-500/10 text-violet-700 border-violet-200',
};

const ClinicalListLayout: React.FC<Props> = ({ title, subtitle, icon, stats, filters, actions, children, backTo }) => {
  return (
    <div className="px-4 sm:px-6 pt-6 pb-16 max-w-6xl mx-auto" dir="rtl">
      {backTo && (
        <Link to={backTo} className="inline-flex items-center gap-1 mb-4 text-xs px-3 py-1.5 rounded-lg bg-white border hover:border-[hsl(var(--damij-accent-2))]/40">
          <ArrowRight className="w-3 h-3" /> رجوع
        </Link>
      )}

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--damij-primary))] via-sky-600 to-indigo-700 text-white p-6 sm:p-8 mb-6 shadow-xl">
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              {icon && <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl">{icon}</div>}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
            </div>
            {subtitle && <p className="text-white/85 text-sm mt-2 max-w-2xl leading-relaxed">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </header>

      {!!stats?.length && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {stats.map((s, i) => (
            <div key={i} className={`p-4 rounded-2xl bg-gradient-to-br ${toneClass[s.tone || 'primary']} border`}>
              <div className="text-2xl font-extrabold leading-none">{s.value}</div>
              <div className="text-[11px] mt-1 font-bold opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {filters && <div className="mb-5">{filters}</div>}

      {children}
    </div>
  );
};

export default ClinicalListLayout;

export const SessionCard: React.FC<{
  href?: string;
  caseName: string;
  protocolName?: string;
  date?: string;
  score?: number;
  summary?: string;
  badge?: React.ReactNode;
  right?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}> = ({ href, caseName, protocolName, date, score, summary, badge, right, selected, onClick, children }) => {
  const scoreTone = score == null ? '' : score >= 80 ? 'bg-emerald-100 text-emerald-700' : score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
  const Wrap: any = href ? Link : 'div';
  const wrapProps: any = href ? { to: href } : { onClick };
  return (
    <Wrap {...wrapProps}
      className={`block p-4 rounded-2xl border bg-white transition-all hover:shadow-md hover:-translate-y-0.5 ${selected ? 'border-[hsl(var(--damij-accent-2))] ring-2 ring-[hsl(var(--damij-accent-2))]/20' : 'border-slate-200 hover:border-[hsl(var(--damij-accent-2))]/40'} ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-extrabold text-[hsl(var(--damij-primary))] text-sm truncate">{caseName}</span>
            {badge}
          </div>
          {protocolName && <div className="text-xs text-slate-500 truncate">{protocolName}</div>}
          {summary && <div className="text-xs text-slate-600 line-clamp-2 mt-1.5">{summary}</div>}
          {date && <div className="text-[10px] text-slate-400 mt-2">{new Date(date).toLocaleDateString('ar')}</div>}
          {children}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {score != null && (
            <span className={`px-3 py-1.5 rounded-xl font-extrabold text-sm ${scoreTone}`}>{Math.round(score)}</span>
          )}
          {right}
        </div>
      </div>
    </Wrap>
  );
};
