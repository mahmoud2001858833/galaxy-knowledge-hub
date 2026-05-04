import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Hand, Layers, Brain, Activity, Eye, FlaskConical } from 'lucide-react';

const items = [
  { to: '/damij', icon: Home, label: 'الرئيسية' },
  { to: '/damij/sign', icon: Hand, label: 'إشارة' },
  { to: '/damij/sensory', icon: Layers, label: 'حسّي' },
  { to: '/damij/autism', icon: Brain, label: 'توحّد' },
  { to: '/damij/adhd', icon: Activity, label: 'ADHD' },
  { to: '/damij/braille', icon: Eye, label: 'بريل' },
  { to: '/damij/clinical', icon: FlaskConical, label: 'مختبر' },
];

const DamijFloatingNav: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[hsl(var(--damij-surface))]/95 backdrop-blur-md shadow-2xl border border-[hsl(var(--damij-primary))]/15 rounded-2xl px-2 py-2 flex items-center gap-1 max-w-[95vw] overflow-x-auto">
      {items.map(({ to, icon: Icon, label }) => {
        const active = pathname === to || (to !== '/damij' && pathname.startsWith(to));
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[58px] ${
              active
                ? 'bg-[hsl(var(--damij-primary))] text-white shadow-md'
                : 'text-[hsl(var(--damij-primary))] hover:bg-[hsl(var(--damij-primary))]/10'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[11px] font-semibold whitespace-nowrap">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default DamijFloatingNav;
