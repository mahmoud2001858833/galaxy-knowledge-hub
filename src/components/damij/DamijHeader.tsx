import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Home, Hand, Layers, Brain, Activity, Eye, FlaskConical, Leaf, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DamijBrandLogo from './DamijBrandLogo';
import DamijLanguageSwitcher from './DamijLanguageSwitcher';
import DamijUserMenu from './DamijUserMenu';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';
import { useEcoMode } from '@/features/damij/EcoModeContext';

const HIDDEN_PATTERNS = [
  /^\/damij\/adhd\/screening\/[^/]+$/,
  /^\/damij\/adhd\/games\/play\/[^/]+/,
  /^\/damij\/adhd\/program\/[^/]+\/day\/[^/]+/,
  /^\/damij\/adhd\/assessment\/(cpt|nback|stroop|gonogo)/,
  /^\/damij\/autism\/program\/[^/]+\/day\//,
  /^\/damij\/autism\/play/,
];

const DamijHeader: React.FC = () => {
  const { t } = useDamijLang();
  const { eco, toggle } = useEcoMode();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (HIDDEN_PATTERNS.some((re) => re.test(pathname))) return null;

  const items = [
    { to: '/damij',          icon: Home,         label: t.nav.home },
    { to: '/damij/sign',     icon: Hand,         label: t.nav.sign },
    { to: '/damij/sensory',  icon: Layers,       label: t.nav.sensory },
    { to: '/damij/autism',   icon: Brain,        label: t.nav.autism },
    { to: '/damij/adhd',     icon: Activity,     label: t.nav.adhd },
    { to: '/damij/braille',  icon: Eye,          label: t.nav.braille },
    { to: '/damij/clinical', icon: FlaskConical, label: t.nav.clinical },
  ];

  return (
    <header
      data-damij-no-translate
      className="sticky top-0 z-40 w-full border-b border-[hsl(var(--damij-border))] bg-white/90 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link to="/damij" className="flex items-center gap-2 shrink-0">
          <DamijBrandLogo size={36} showText={false} />
          <span className="font-extrabold text-[hsl(var(--damij-primary))] text-lg tracking-tight hidden sm:inline">
            {t.hero.title}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 mx-auto">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/damij'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))]'
                    : 'text-[hsl(var(--damij-muted))] hover:text-[hsl(var(--damij-primary))] hover:bg-[hsl(var(--damij-bg-2))]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 ms-auto">
          <button
            onClick={toggle}
            title="Eco mode"
            aria-pressed={eco}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              eco
                ? 'bg-[hsl(var(--damij-success))] text-white border-[hsl(var(--damij-success))]'
                : 'bg-white text-[hsl(var(--damij-success))] border-[hsl(var(--damij-border))] hover:border-[hsl(var(--damij-success))]'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eco</span>
          </button>
          <DamijLanguageSwitcher />
          <DamijUserMenu />
          <button
            className="lg:hidden p-2 rounded-lg border border-[hsl(var(--damij-border))] text-[hsl(var(--damij-primary))]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-[hsl(var(--damij-border))] bg-white"
          >
            <div className="px-4 py-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
              {items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/damij'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                      isActive
                        ? 'bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))]'
                        : 'text-[hsl(var(--damij-muted))] hover:bg-[hsl(var(--damij-bg-2))]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default DamijHeader;
