import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Activity, Hand, FlaskConical, Layers, BookMarked, Eye, Sparkles, Users, ShieldCheck, Heart, Globe2, BookOpen, ExternalLink } from 'lucide-react';
import SystemCard from '@/components/damij/SystemCard';
import DamijHero3D from '@/components/damij/DamijHero3D';
import DamijSEO from '@/components/damij/DamijSEO';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

const STATS = [
  { icon: Users,        value: '7+',   label: 'أنظمة دعم متكاملة', accent: 'hsl(var(--damij-primary))' },
  { icon: Globe2,       value: '15',   label: 'لغة مدعومة',         accent: 'hsl(var(--damij-primary-2))' },
  { icon: ShieldCheck,  value: '100%', label: 'مرجعية علميّة موثّقة', accent: 'hsl(var(--damij-success))' },
  { icon: Heart,        value: 'AAA',  label: 'وصول شامل (WCAG)',     accent: 'hsl(var(--damij-warm))' },
];

const PRINCIPLES = [
  {
    icon: Sparkles,
    title: 'تصميم شامل',
    text: 'كل واجهة قابلة للتكيّف مع القدرات الحسّية والحركية والإدراكية، دون الحاجة لإعدادات خفيّة.',
  },
  {
    icon: ShieldCheck,
    title: 'مرجعية سريريّة',
    text: 'كل أداة مبنيّة على معايير معترف بها (DSM-5-TR, AAP, WHO, NICE) مع مصادر مباشرة قابلة للتحقّق.',
  },
  {
    icon: Heart,
    title: 'احترام للإنسان',
    text: 'لغة محايدة، صور تمثيلية لائقة، ولا تشخيص قاطع — الأدوات للدعم لا للاستبدال.',
  },
];

const DamijLanding: React.FC = () => {
  const { t } = useDamijLang();
  return (
    <div>
      <DamijSEO
        title="منصة دامج — للدمج التعليمي الشامل لذوي الإعاقة"
        description="منصة دامج هي المنصة العربية الأولى للدمج التعليمي لذوي الإعاقة: لغة الإشارة، بريل، عين الأعمى، دعم التوحد و ADHD، الجسر الحسّي العكسي، وتجارب سريرية افتراضية ضمن منظومة واحدة."
        path="/damij"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'منصة دامج',
          alternateName: ['Damij', 'دامج'],
          url: 'https://yoursite.lovable.app/damij',
          inLanguage: 'ar',
          publisher: { '@type': 'EducationalOrganization', name: 'ذروة العلم' },
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://yoursite.lovable.app/damij?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      <DamijHero3D />

      {/* Blind Eye hero card */}
      <section className="px-6 mt-6 mb-10">
        <motion.a
          href="/damij/blind-eye"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.01 }}
          className="relative block max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl group"
          style={{ background: 'linear-gradient(135deg, hsl(160 84% 18%), hsl(190 90% 28%))' }}
          aria-label="افتح عين الأعمى"
        >
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 30% 40%, hsl(160 90% 60% / 0.4), transparent 60%), radial-gradient(circle at 80% 70%, hsl(190 90% 70% / 0.35), transparent 55%)' }} />
          <div className="relative p-7 md:p-9 flex flex-col md:flex-row items-center gap-6 text-white">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0 border border-white/25"
            >
              <Eye className="w-12 h-12 md:w-14 md:h-14" />
            </motion.div>
            <div className="flex-1 text-center md:text-right">
              <div className="text-xs md:text-sm font-bold tracking-widest opacity-80 mb-1">DAMIJ · BLIND EYE</div>
              <h3 className="text-2xl md:text-3xl font-extrabold leading-tight mb-2">
                عين الأعمى — مرشدك للمشي بأمان
              </h3>
              <p className="text-sm md:text-base opacity-90 max-w-2xl md:mr-0 mx-auto">
                مساعد ذكي بصوت عربي يرى الطريق نيابة عنك. قل له «خذني إلى الباب» أو «وين مدرستي» — يقودك خطوة بخطوة.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-900 font-extrabold shadow-lg group-hover:shadow-xl transition shrink-0">
              افتح عيني
              <Eye className="w-4 h-4" />
            </span>
          </div>
        </motion.a>
      </section>

      {/* Documentation hub CTA */}
      <section className="px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <Link
            to="/damij/docs"
            className="group block relative rounded-3xl overflow-hidden border-2 border-[hsl(var(--damij-primary))]/20 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 hover:border-[hsl(var(--damij-primary))]/50 transition-all shadow-sm hover:shadow-xl"
          >
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 30%, hsl(var(--damij-primary) / 0.25), transparent 55%), radial-gradient(circle at 80% 70%, hsl(var(--damij-primary-2) / 0.2), transparent 50%)' }} />
            <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[hsl(var(--damij-primary))] text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                <BookOpen className="w-9 h-9 md:w-11 md:h-11" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <div className="text-xs font-bold tracking-widest text-[hsl(var(--damij-primary))]/70 mb-1">DAMIJ · DOCUMENTATION</div>
                <h3 className="text-2xl md:text-3xl font-black text-[hsl(var(--damij-primary))] mb-1.5 leading-tight">
                  توثيق منصة دامج
                </h3>
                <p className="text-sm md:text-base text-[hsl(var(--damij-muted))] max-w-2xl md:mr-0 mx-auto leading-relaxed">
                  كل شيء عن المنصة في مكان واحد: الأنظمة الثمانية، التقنيات واللغات البرمجية، المصادر العلمية، وروابط مباشرة لكل صفحة.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] font-bold">8 أنظمة</span>
                  <span className="px-2.5 py-1 rounded-full bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] font-bold">60+ صفحة</span>
                  <span className="px-2.5 py-1 rounded-full bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] font-bold">15 لغة</span>
                  <span className="px-2.5 py-1 rounded-full bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] font-bold">مرجعية علمية موثّقة</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-extrabold shadow-md group-hover:shadow-lg transition shrink-0">
                استكشف التوثيق
                <ExternalLink className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </motion.div>
      </section>




      {/* Stats strip */}
      <section className="px-6 -mt-6 mb-14">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[hsl(var(--damij-border))] shadow-sm"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
                style={{ background: s.accent }}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-[hsl(var(--damij-primary))] leading-none">{s.value}</div>
                <div className="text-[11px] sm:text-xs text-[hsl(var(--damij-muted))] mt-1">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="systems" className="px-6 pb-16">
        <div className="max-w-6xl mx-auto mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[hsl(var(--damij-primary))] mb-2 tracking-tight">
            الأنظمة المتاحة
          </h2>
          <p className="text-sm md:text-base text-[hsl(var(--damij-muted))] max-w-2xl mx-auto">
            مجموعة متكاملة من الأدوات السريريّة والتربويّة، صُمّمت لتعمل معاً ضمن منظومة دعم واحدة.
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SystemCard to="/damij/sign"     icon={Hand}         title={t.sections.sign.title}     description={t.sections.sign.desc}     accent="hsl(var(--damij-primary))"  delay={0.05} />
          <SystemCard to="/damij/sensory"  icon={Layers}       title={t.sections.sensory.title}  description={t.sections.sensory.desc}  accent="hsl(var(--damij-accent-2))" delay={0.10} />
          <SystemCard to="/damij/autism"   icon={Brain}        title={t.sections.autism.title}   description={t.sections.autism.desc}   accent="hsl(var(--damij-warm))"     delay={0.15} />
          <SystemCard to="/damij/adhd"     icon={Activity}     title={t.sections.adhd.title}     description={t.sections.adhd.desc}     accent="hsl(var(--damij-accent-2))" delay={0.20} />
          <SystemCard to="/damij/braille"  icon={Eye}          title={t.sections.braille.title}  description={t.sections.braille.desc}  accent="hsl(var(--damij-primary))"  delay={0.25} />
          <SystemCard to="/damij/clinical" icon={FlaskConical} title={t.sections.clinical.title} description={t.sections.clinical.desc} accent="hsl(var(--damij-warm))"     delay={0.30} />
        </div>
      </section>

      {/* Principles */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[hsl(var(--damij-primary))] mb-2 tracking-tight">
              مبادئنا
            </h2>
            <p className="text-sm md:text-base text-[hsl(var(--damij-muted))] max-w-2xl mx-auto">
              ثلاثة التزامات تحكم كل قرار تصميمي وتقني داخل المنصّة.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRINCIPLES.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-white border border-[hsl(var(--damij-border))] hover:border-[hsl(var(--damij-primary))]/30 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] flex items-center justify-center mb-3">
                  <p.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[hsl(var(--damij-primary))] mb-1.5">{p.title}</h3>
                <p className="text-sm text-[hsl(var(--damij-muted))] leading-relaxed">{p.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Sources CTA */}
      <section className="px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto p-8 rounded-3xl bg-white border border-[hsl(var(--damij-primary))]/15 text-center shadow-sm"
        >
          <BookMarked className="w-10 h-10 mx-auto mb-3 text-[hsl(var(--damij-primary))]" />
          <h2 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">{t.sources.title}</h2>
          <p className="text-[hsl(var(--damij-text))]/75 mb-4">{t.sources.desc}</p>
          <a
            href="/damij/sources"
            className="inline-block px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold hover:bg-[hsl(var(--damij-primary))]/92 transition-colors"
          >
            {t.sources.cta}
          </a>
        </motion.div>
      </section>
    </div>
  );
};

export default DamijLanding;
