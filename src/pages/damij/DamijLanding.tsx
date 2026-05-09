import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, Hand, FlaskConical, Layers, BookMarked, Eye } from 'lucide-react';
import SystemCard from '@/components/damij/SystemCard';
import DamijHero3D from '@/components/damij/DamijHero3D';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

const DamijLanding: React.FC = () => {
  const { t } = useDamijLang();
  return (
    <div>
      <DamijHero3D />

      <section id="systems" className="px-6 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SystemCard to="/damij/sign"     icon={Hand}         title={t.sections.sign.title}     description={t.sections.sign.desc}     accent="hsl(var(--damij-primary))"  delay={0.05} />
          <SystemCard to="/damij/sensory"  icon={Layers}       title={t.sections.sensory.title}  description={t.sections.sensory.desc}  accent="hsl(var(--damij-accent-2))" delay={0.10} />
          <SystemCard to="/damij/autism"   icon={Brain}        title={t.sections.autism.title}   description={t.sections.autism.desc}   accent="hsl(var(--damij-warm))"     delay={0.15} />
          <SystemCard to="/damij/adhd"     icon={Activity}     title={t.sections.adhd.title}     description={t.sections.adhd.desc}     accent="hsl(var(--damij-accent-2))" delay={0.20} />
          <SystemCard to="/damij/braille"  icon={Eye}          title={t.sections.braille.title}  description={t.sections.braille.desc}  accent="hsl(var(--damij-primary))"  delay={0.25} />
          <SystemCard to="/damij/clinical" icon={FlaskConical} title={t.sections.clinical.title} description={t.sections.clinical.desc} accent="hsl(var(--damij-warm))"     delay={0.30} />
        </div>
      </section>

      <section className="px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-[hsl(var(--damij-accent-2))]/5 border border-[hsl(var(--damij-primary))]/10 text-center backdrop-blur-sm"
        >
          <BookMarked className="w-10 h-10 mx-auto mb-3 text-[hsl(var(--damij-primary))]" />
          <h2 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">{t.sources.title}</h2>
          <p className="text-[hsl(var(--damij-text))]/75 mb-4">{t.sources.desc}</p>
          <a href="/damij/sources" className="inline-block px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold hover:scale-105 transition">
            {t.sources.cta}
          </a>
        </motion.div>
      </section>
    </div>
  );
};

export default DamijLanding;
