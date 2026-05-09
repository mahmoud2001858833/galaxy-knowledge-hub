import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import DamijLogo3D from './DamijLogo3D';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

const DamijHero3D: React.FC = () => {
  const { t, dir } = useDamijLang();

  return (
    <section className="relative overflow-hidden pt-16 pb-12 px-6">
      <div className="absolute inset-0 -z-10 opacity-60 pointer-events-none">
        <div className="absolute top-1/4 -start-20 w-96 h-96 rounded-full bg-[hsl(var(--damij-primary))]/15 blur-3xl" />
        <div className="absolute bottom-0 -end-20 w-96 h-96 rounded-full bg-[hsl(var(--damij-accent-2))]/15 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: dir === 'rtl' ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-start"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--damij-accent))]/20 text-[hsl(var(--damij-primary))] mb-5">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">{t.hero.badge}</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-br from-[hsl(var(--damij-primary))] via-[hsl(var(--damij-accent-2))] to-[hsl(var(--damij-warm))] bg-clip-text text-transparent mb-3 leading-none">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-[hsl(var(--damij-accent-2))] font-bold mb-4">
            {t.hero.tagline}
          </p>
          <p className="text-base md:text-lg text-[hsl(var(--damij-text))]/75 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-6">
            {t.hero.desc}
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
            {t.hero.chips.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="px-3 py-1.5 text-xs font-bold rounded-full bg-white border border-[hsl(var(--damij-primary))]/15 text-[hsl(var(--damij-primary))] shadow-sm"
              >
                {c}
              </motion.span>
            ))}
          </div>
          <a
            href="#systems"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-l from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            {t.hero.cta}
            <ArrowLeft className={`w-4 h-4 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-center"
        >
          <DamijLogo3D size={360} />
        </motion.div>
      </div>
    </section>
  );
};

export default DamijHero3D;
