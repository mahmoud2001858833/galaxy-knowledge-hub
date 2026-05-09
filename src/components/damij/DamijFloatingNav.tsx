import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Hand, Layers, Brain, Activity, Eye, FlaskConical, Leaf, ChevronDown, ChevronUp } from 'lucide-react';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

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
  const { t } = useDamijLang();
  const [collapsed, setCollapsed] = useState(false);

  if (HIDDEN_PATTERNS.some((re) => re.test(pathname))) return null;

  const items = [
    { to: '/damij',          icon: Home,         label: t.nav.home,     glow: 'hsl(var(--damij-primary))' },
    { to: '/damij/sign',     icon: Hand,         label: t.nav.sign,     glow: 'hsl(var(--damij-primary-2))' },
    { to: '/damij/sensory',  icon: Layers,       label: t.nav.sensory,  glow: 'hsl(var(--damij-accent-2))' },
    { to: '/damij/autism',   icon: Brain,        label: t.nav.autism,   glow: 'hsl(var(--damij-accent))' },
    { to: '/damij/adhd',     icon: Activity,     label: t.nav.adhd,     glow: 'hsl(var(--damij-warm))' },
    { to: '/damij/braille',  icon: Eye,          label: t.nav.braille,  glow: 'hsl(var(--damij-success))' },
    { to: '/damij/clinical', icon: FlaskConical, label: t.nav.clinical, glow: 'hsl(var(--damij-primary))' },
    { to: '/damij/carbon',   icon: Leaf,         label: t.nav.carbon,   glow: 'hsl(var(--damij-success))' },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-end gap-1.5">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="bg-gradient-to-br from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] text-white rounded-full w-9 h-9 flex items-center justify-center shadow-xl ring-2 ring-white/40"
        aria-label={collapsed ? t.nav.show : t.nav.hide}
      >
        {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60 rounded-2xl px-2 py-1.5 flex items-center gap-1 max-w-[92vw] overflow-x-auto"
            style={{
              boxShadow: '0 20px 50px -10px rgba(124, 58, 237, 0.25), 0 0 0 1px rgba(255,255,255,0.6) inset',
            }}
          >
            {items.map(({ to, icon: Icon, label, glow }) => {
              const active = pathname === to || (to !== '/damij' && pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[56px] group"
                  title={label}
                >
                  {active && (
                    <motion.span
                      layoutId="damij-nav-active"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${glow}, ${glow}cc)`,
                        boxShadow: `0 8px 22px -6px ${glow}99`,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative w-4 h-4 transition-transform group-hover:scale-110 ${
                      active ? 'text-white' : 'text-[hsl(var(--damij-primary))]'
                    }`}
                  />
                  <span
                    className={`relative text-[10px] font-semibold whitespace-nowrap ${
                      active ? 'text-white' : 'text-[hsl(var(--damij-primary))]'
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default DamijFloatingNav;
