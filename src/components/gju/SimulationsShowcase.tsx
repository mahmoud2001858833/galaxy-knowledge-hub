import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Sparkles, ArrowLeft, FlaskConical, Atom, Beaker, Dna, Microscope, Calculator, Globe, Zap, type LucideIcon } from 'lucide-react';

type SimTool = {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  link: string;
};

type Category = {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: LucideIcon;
  /** keywords matched against the Arabic title */
  keywords: string[];
  accent: string;
};

const CATEGORIES: Category[] = [
  { id: 'all', labelAr: 'جميع المحاكيات', labelEn: 'All Simulations', icon: Sparkles, keywords: [], accent: 'from-fuchsia-500 via-cyan-400 to-emerald-400' },
  { id: 'physics', labelAr: 'الفيزياء', labelEn: 'Physics', icon: Atom, keywords: ['فيزياء','المقذوفات','الكهرباء','الكهرومغناطيس','الموجات','البصر','الديناميكا','الموائع','الحركة','النسبية','التداخل','البلازما','النووي','المقاومة','الدوائر','الجسم الأسود','مصادم','الكم','الذرة'], accent: 'from-violet-500 to-blue-500' },
  { id: 'chemistry', labelAr: 'الكيمياء', labelEn: 'Chemistry', icon: Beaker, keywords: ['الكيمياء','التفاعل','الأحماض','حالات المادة','حركية'], accent: 'from-emerald-500 to-cyan-500' },
  { id: 'biology', labelAr: 'الأحياء', labelEn: 'Biology', icon: Dna, keywords: ['الوراثة','البيولوجيا','جسم الإنسان','الخلية','الانقسام','التمثيل الضوئي','المناعي','التطور','النظام البيئي'], accent: 'from-pink-500 to-rose-500' },
  { id: 'math', labelAr: 'الرياضيات', labelEn: 'Mathematics', icon: Calculator, keywords: ['فورييه','الدوال','الهندسة الفراغية','الاحتمالات'], accent: 'from-amber-500 to-orange-500' },
  { id: 'earth', labelAr: 'الأرض والفضاء', labelEn: 'Earth & Space', icon: Globe, keywords: ['الأرض','الفلك','النظام الشمسي','الصواريخ'], accent: 'from-sky-500 to-indigo-500' },
  { id: 'engineering', labelAr: 'الهندسة', labelEn: 'Engineering', icon: Microscope, keywords: ['الإلكترونيات','المواد','الميكانيكية','الروبوتات','بناء الدوائر'], accent: 'from-zinc-400 to-stone-500' },
];

const matchesCategory = (tool: SimTool, cat: Category) => {
  if (cat.id === 'all') return true;
  return cat.keywords.some(k => tool.title.includes(k));
};

interface Props {
  tools: SimTool[];
  lang: 'ar' | 'en';
  toolTranslations: Record<string, { title: string; description: string }>;
}

export const SimulationsShowcase: React.FC<Props> = ({ tools, lang, toolTranslations }) => {
  const [activeCat, setActiveCat] = useState<string>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const cat = CATEGORIES.find(c => c.id === activeCat) ?? CATEGORIES[0];
    const q = query.trim().toLowerCase();
    return tools.filter(t => {
      if (!matchesCategory(t, cat)) return false;
      if (!q) return true;
      const en = toolTranslations[t.title];
      const haystack = `${t.title} ${t.description} ${en?.title ?? ''} ${en?.description ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [tools, activeCat, query, toolTranslations]);

  return (
    <section id="simulations" className="py-24 md:py-32 relative scroll-mt-28">
      {/* Cinematic backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-fuchsia-600/10 via-cyan-500/8 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-500/8 to-transparent blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* ───── Header ───── */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl mb-6"
          >
            <FlaskConical className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-white/60 text-[11px] font-mono tracking-[0.25em] uppercase">{lang === 'en' ? 'Digital Science Lab' : 'مختبر علمي رقمي'}</span>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black text-white mb-5 tracking-tight leading-[1.05]">
            {lang === 'en' ? 'Interactive ' : 'المحاكيات '}
            <span className="bg-gradient-to-l from-fuchsia-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              {lang === 'en' ? 'Simulations' : 'التفاعلية'}
            </span>
          </h2>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {lang === 'en'
              ? 'A digital science lab with high-fidelity, interactive simulations across every branch of science.'
              : 'مختبر علمي رقمي بدقّة احترافية يضم محاكيات تفاعلية لجميع فروع العلوم'}
          </p>

          {/* Stats strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10">
              <span className="text-2xl font-black bg-gradient-to-l from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">{tools.length}</span>
              <span className="text-white/40 text-xs">{lang === 'en' ? 'simulations' : 'محاكاة'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10">
              <span className="text-2xl font-black bg-gradient-to-l from-cyan-300 to-emerald-300 bg-clip-text text-transparent">{CATEGORIES.length - 1}</span>
              <span className="text-white/40 text-xs">{lang === 'en' ? 'categories' : 'تصنيفات'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10">
              <span className="text-lg font-black text-emerald-300">3D</span>
              <span className="text-white/40 text-xs">{lang === 'en' ? 'real-time' : 'وقت حقيقي'}</span>
            </div>
          </div>
        </motion.div>

        {/* ───── Search ───── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="relative group">
            <Search className="absolute top-1/2 -translate-y-1/2 right-4 w-4 h-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search simulations…' : 'ابحث في المحاكيات…'}
              className="w-full pr-11 pl-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-white/30 focus:bg-white/[0.06] focus:outline-none text-white placeholder:text-white/30 text-sm transition-all"
            />
          </div>
        </motion.div>

        {/* ───── Category chips ───── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-2 mb-12"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCat === cat.id;
            const count = cat.id === 'all' ? tools.length : tools.filter(t => matchesCategory(t, cat)).length;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 ${
                  isActive
                    ? 'border-white/30 bg-white/[0.08] text-white shadow-lg shadow-white/5'
                    : 'border-white/10 bg-white/[0.02] text-white/55 hover:text-white/85 hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="simCatActive"
                    className={`absolute inset-0 rounded-full bg-gradient-to-l ${cat.accent} opacity-[0.15]`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10 text-xs font-bold tracking-wide">{lang === 'en' ? cat.labelEn : cat.labelAr}</span>
                <span className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-full font-mono ${isActive ? 'bg-white/15 text-white/90' : 'bg-white/[0.05] text-white/40'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* ───── Grid ───── */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-white/40"
            >
              {lang === 'en' ? 'No simulations match your search.' : 'لا توجد محاكيات مطابقة للبحث.'}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filtered.map((tool, i) => {
                const tr = lang === 'en' ? toolTranslations[tool.title] : null;
                const title = tr?.title ?? tool.title;
                const desc = tr?.description ?? tool.description;
                const Icon = tool.icon;
                return (
                  <motion.div
                    layout
                    key={tool.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: Math.min(i, 12) * 0.03 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link
                      to={tool.link}
                      onClick={() => sessionStorage.setItem('gju_mode', 'true')}
                      className="group relative block h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden hover:border-white/25 transition-all duration-500"
                    >
                      {/* Gradient hover halo */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br ${tool.gradient} transition-opacity duration-500`} style={{ mixBlendMode: 'overlay' }} />

                      {/* Top accent bar */}
                      <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${tool.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

                      {/* Index number watermark */}
                      <span className="absolute top-3 left-4 text-[10px] font-mono text-white/20 tracking-wider">
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <div className="p-5 relative z-10">
                        {/* Icon orb */}
                        <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} p-[1px] mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                          <div className="w-full h-full rounded-xl bg-[#0a0a18] flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${tool.gradient} blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10`} />
                        </div>

                        <h4 className="text-white font-bold text-base mb-1.5 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                          {title}
                        </h4>
                        <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-4 group-hover:text-white/60 transition-colors">
                          {desc}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5 group-hover:border-white/15 transition-colors">
                          <span className="text-[10px] font-mono text-white/30 tracking-wider uppercase">
                            {lang === 'en' ? 'Launch' : 'افتح المحاكاة'}
                          </span>
                          <ArrowLeft className="w-4 h-4 text-white/40 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SimulationsShowcase;
