import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Brain, Dumbbell, ListChecks, BookMarked, BarChart3, ShieldCheck } from 'lucide-react';

const MODULES = [
  {
    to: '/damij/adhd/screening',
    icon: ListChecks,
    title: 'الفحص التشخيصي',
    description: 'استبيانات معتمدة: Vanderbilt و SNAP-IV و ASRS-v1.1 مع تقرير AI تفريقي.',
    accent: 'from-amber-400 to-orange-500',
    badge: 'DSM-5-TR',
  },
  {
    to: '/damij/adhd/assessment',
    icon: Brain,
    title: 'التقييم العصبي-النفسي',
    description: 'اختبارات أداء فعلية: CPT لقياس الانتباه و N-Back للذاكرة العاملة و Stroop و Go/No-Go.',
    accent: 'from-violet-500 to-fuchsia-500',
    badge: 'CPT · N-Back',
  },
  {
    to: '/damij/adhd/training',
    icon: Dumbbell,
    title: 'التدريب العلاجي التكيّفي',
    description: 'جلسات Pomodoro متدرّجة، تدريب الذاكرة العاملة، ومهام Stop-Signal للكفّ المعرفي.',
    accent: 'from-emerald-500 to-teal-500',
    badge: 'Barkley · CHADD',
  },
  {
    to: '/damij/adhd/interventions',
    icon: ShieldCheck,
    title: 'التدخلات السلوكية والصفّية',
    description: 'Token Economy، Daily Report Card، تكييفات صفّية (CDC/AAP) ومولّد جداول مرئية.',
    accent: 'from-sky-500 to-blue-600',
    badge: 'AAP 2019',
  },
  {
    to: '/damij/adhd/dashboard',
    icon: BarChart3,
    title: 'لوحة المتابعة الطولية',
    description: 'مخطّطات تطوّر الأعراض والأداء عبر الزمن مع تقارير قابلة للتصدير للأهل والمعلم.',
    accent: 'from-rose-500 to-pink-600',
    badge: 'Recharts',
  },
  {
    to: '/damij/adhd/resources',
    icon: BookMarked,
    title: 'مكتبة المصادر العلمية',
    description: 'مراجع موثّقة من APA و NICHQ و WHO و NICE و CHADD مع شرح مبسّط.',
    accent: 'from-indigo-500 to-purple-600',
    badge: 'Evidence-Based',
  },
];

const ADHDHome: React.FC = () => (
  <div className="min-h-screen px-4 sm:px-6 pt-12 pb-16 max-w-6xl mx-auto" dir="rtl">
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[hsl(var(--damij-warm))] to-orange-500 text-white flex items-center justify-center mx-auto mb-5 shadow-xl shadow-orange-500/30">
        <Activity className="w-12 h-12" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--damij-primary))] mb-3">
        نظام فرط الحركة وتشتّت الانتباه
      </h1>
      <p className="text-base sm:text-lg text-[hsl(var(--damij-text))]/75 max-w-2xl mx-auto leading-relaxed">
        منصّة سريرية‑تربوية متكاملة مبنية على معايير DSM‑5‑TR وإرشادات AAP و NICE،
        تجمع الفحص والتقييم والتدريب والتدخلات والمتابعة في تجربة واحدة.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mt-5 text-[11px] font-medium">
        {['DSM-5-TR', 'NICHQ Vanderbilt', 'WHO ASRS', 'AAP 2019', 'NICE NG87', 'CHADD'].map((s) => (
          <span key={s} className="px-3 py-1 rounded-full bg-white border border-[hsl(var(--damij-primary))]/15 text-[hsl(var(--damij-primary))]">
            {s}
          </span>
        ))}
      </div>
    </motion.header>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {MODULES.map((m, i) => (
        <motion.div
          key={m.to}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 * i }}
        >
          <Link
            to={m.to}
            className="group block h-full p-6 rounded-3xl bg-white border border-[hsl(var(--damij-primary))]/10 hover:border-[hsl(var(--damij-warm))]/40 shadow-sm hover:shadow-xl transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.accent} text-white flex items-center justify-center mb-4 shadow-lg`}>
              <m.icon className="w-7 h-7" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-[hsl(var(--damij-primary))] group-hover:text-[hsl(var(--damij-warm))] transition">
                {m.title}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--damij-surface))] text-[hsl(var(--damij-text))]/70">
                {m.badge}
              </span>
            </div>
            <p className="text-sm text-[hsl(var(--damij-text))]/70 leading-relaxed">{m.description}</p>
          </Link>
        </motion.div>
      ))}
    </div>

    <div className="mt-10 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm leading-relaxed">
      <strong className="block mb-1">إخلاء مسؤولية:</strong>
      جميع الأدوات في هذا النظام للتثقيف ودعم القرار، ولا تُغني بأي شكل عن التقييم السريري
      من قِبل طبيب أو أخصائي نفسي مرخّص. يُوصى بمراجعة المختصّ عند ظهور أي علامة حمراء.
    </div>
  </div>
);

export default ADHDHome;
