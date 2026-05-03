import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Eye, Brain, Activity, LayoutDashboard } from 'lucide-react';

const items = [
  { to: '/damij', icon: Home, label: 'الرئيسية' },
  { to: '/damij/braille', icon: Eye, label: 'بريل' },
  { to: '/damij/autism', icon: Brain, label: 'التوحد' },
  { to: '/damij/adhd', icon: Activity, label: 'ADHD' },
  { to: '/damij/dashboard', icon: LayoutDashboard, label: 'اللوحة' },
];

const DamijFloatingNav: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[hsl(var(--damij-surface))]/95 backdrop-blur-md shadow-2xl border border-[hsl(var(--damij-primary))]/15 rounded-2xl px-3 py-2 flex items-center gap-1">
      {items.map(({ to, icon: Icon, label }) => {
        const active = pathname === to || (to !== '/damij' && pathname.startsWith(to));
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px] ${
              active
                ? 'bg-[hsl(var(--damij-primary))] text-white shadow-md'
                : 'text-[hsl(var(--damij-primary))] hover:bg-[hsl(var(--damij-primary))]/10'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default DamijFloatingNav;
