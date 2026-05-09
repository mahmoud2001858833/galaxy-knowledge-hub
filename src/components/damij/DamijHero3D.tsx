import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import DamijBrandLogo from './DamijBrandLogo';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

const DamijHero3D: React.FC = () => {
  const { t, dir } = useDamijLang();

  return (
    <section className="relative overflow-hidden pt-20 pb-14 px-6 border-b border-[hsl(var(--damij-border))]">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--damij-bg))_0%,hsl(var(--damij-bg-2))_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--damij-primary))]/20 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center lg:text-start"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[hsl(var(--damij-primary))]/8 text-[hsl(var(--damij-primary))] mb-6 border border-[hsl(var(--damij-primary))]/15">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold tracking-wide">{t.hero.badge}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-[hsl(var(--damij-primary))] mb-4 tracking-tight">
            {t.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-[hsl(var(--damij-primary-2))] font-semibold mb-5">
            {t.hero.tagline}
          </p>
          <p className="text-base text-[hsl(var(--damij-muted))] leading-relaxed max-w-xl mx-auto lg:mx-0 mb-7">
            {t.hero.desc}
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-7">
            {t.hero.chips.map((c) => (
              <span
                key={c}
                className="px-3 py-1 text-[11px] font-semibold rounded-md bg-white border border-[hsl(var(--damij-border))] text-[hsl(var(--damij-primary))]"
              >
                {c}
              </span>
            ))}
          </div>
          <a
            href="#systems"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-sm font-bold shadow-md hover:bg-[hsl(var(--damij-primary))]/92 transition-colors"
          >
            {t.hero.cta}
            <ArrowLeft className={`w-4 h-4 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center"
        >
          <div className="p-8 rounded-2xl bg-white border border-[hsl(var(--damij-border))] shadow-sm">
            <DamijBrandLogo size={260} showText={false} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DamijHero3D;

