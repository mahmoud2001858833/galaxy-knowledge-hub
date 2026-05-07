import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Home, Hand, Layers, Brain, Activity, Eye, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react';

const items = [
  { to: '/damij', icon: Home, label: 'الرئيسية' },
  { to: '/damij/sign', icon: Hand, label: 'إشارة' },
  { to: '/damij/sensory', icon: Layers, label: 'حسّي' },
  { to: '/damij/autism', icon: Brain, label: 'توحّد' },
  { to: '/damij/adhd', icon: Activity, label: 'ADHD' },
  { to: '/damij/braille', icon: Eye, label: 'بريل' },
  { to: '/damij/clinical', icon: FlaskConical, label: 'مختبر' },
];

// Routes where the floating nav should be hidden (full-screen tasks/games)
const HIDDEN_PATTERNS = [
  /^\/damij\/adhd\/screening\/[^/]+$/,
  /^\/damij\/adhd\/games\/play\/[^/]+/,
  /^\/damij\/adhd\/program\/[^/]+\/day\/[^/]+/,
  /^\/damij\/adhd\/assessment\/(cpt|nback|stroop|gonogo)/,
  /^\/damij\/autism\/program\/[^/]+\/day\//,
  /^\/damij\/autism\/play/,
];

const DamijFloatingNav: React.FC = () => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (HIDDEN_PATTERNS.some((re) => re.test(pathname))) return null;

  const navContent = (
    <nav
      className="flex items-center justify-center gap-1.5 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 bg-gradient-to-t from-[hsl(var(--damij-bg-2))] via-[hsl(var(--damij-bg-2))]/85 to-transparent pointer-events-auto"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="bg-[hsl(var(--damij-primary))] text-white rounded-full w-9 h-9 flex-shrink-0 flex items-center justify-center shadow-lg"
        aria-label={collapsed ? 'إظهار التنقل' : 'إخفاء التنقل'}
      >
        {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {!collapsed && (
        <div className="bg-white/95 backdrop-blur-md shadow-2xl border border-[hsl(var(--damij-primary))]/15 rounded-2xl px-2 py-1.5 flex items-center gap-1 max-w-[92vw] overflow-x-auto">
          {items.map(({ to, icon: Icon, label }) => {
            const active = pathname === to || (to !== '/damij' && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all min-w-[52px] ${
                  active
                    ? 'bg-[hsl(var(--damij-primary))] text-white shadow-md'
                    : 'text-[hsl(var(--damij-primary))] hover:bg-[hsl(var(--damij-primary))]/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-semibold whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );

  if (typeof document === 'undefined') return navContent;
  return createPortal(navContent, document.body);
};

export default DamijFloatingNav;
