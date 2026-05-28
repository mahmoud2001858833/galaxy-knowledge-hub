import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, LayoutDashboard, GitCompare, FileBarChart, Briefcase, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DamijSEO from '@/components/damij/DamijSEO';
import dashboardImg from '@/assets/clinical/portfolio-dashboard.jpg';
import compareImg from '@/assets/clinical/portfolio-compare.jpg';
import reportsImg from '@/assets/clinical/portfolio-reports.jpg';

const ITEMS = [
  {
    to: '/damij/clinical/dashboard',
    icon: LayoutDashboard,
    title: 'لوحة جلساتي',
    desc: 'كل جلساتك السابقة مع رسوم تطوّر مهاراتك السريرية لحظةً بلحظة.',
    image: dashboardImg,
    tone: 'from-emerald-500 to-teal-600',
    accent: 'bg-emerald-500',
    counterKey: 'sessions' as const,
    counterLabel: 'جلسة',
  },
  {
    to: '/damij/clinical/compare',
    icon: GitCompare,
    title: 'مقارنة بين تجارب',
    desc: 'حلّل تطوّرك بمقارنة جلستين أو أكثر بمساعدة الذكاء الاصطناعي.',
    image: compareImg,
    tone: 'from-amber-500 to-orange-600',
    accent: 'bg-amber-500',
    counterKey: 'reports' as const,
    counterLabel: 'تقرير قابل للمقارنة',
  },
  {
    to: '/damij/clinical/reports',
    icon: FileBarChart,
    title: 'تقاريري',
    desc: 'كل التقارير جاهزة للعرض والتنزيل والمشاركة والإرسال بالبريد.',
    image: reportsImg,
    tone: 'from-violet-500 to-purple-600',
    accent: 'bg-violet-500',
    counterKey: 'reports' as const,
    counterLabel: 'تقرير',
  },
];

const ClinicalPortfolio: React.FC = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ sessions: 0, reports: 0 });
  const [lastReport, setLastReport] = useState<any>(null);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [sRes, rRes, lastRes] = await Promise.all([
      supabase.from('clinical_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('clinical_reports').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('clinical_reports').select('id, score, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    setCounts({ sessions: (sRes as any).count || 0, reports: (rRes as any).count || 0 });
    setLastReport((lastRes as any).data || null);
  })(); }, []);

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-6xl mx-auto" dir="rtl">
      <DamijSEO
        title="حقيبتي — مختبر المحاكاة السريرية"
        description="حقيبتي السريرية: لوحة جلساتك، مقارنة تجاربك، وكل تقاريرك في مكان واحد أنيق."
        path="/damij/clinical/portfolio"
        keywords="حقيبة سريرية, تقارير, جلسات, مقارنة, دامج"
      />

      <button onClick={() => navigate('/damij/clinical')}
        className="px-3 py-1.5 mb-5 rounded-lg bg-white border border-slate-200 text-sm flex items-center gap-1 hover:bg-slate-50 transition">
        <ArrowRight className="w-4 h-4" /> المختبر السريري
      </button>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[hsl(var(--damij-primary))] via-emerald-700 to-teal-800 text-white p-6 sm:p-9 mb-8 shadow-2xl">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Briefcase className="w-9 h-9" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">حقيبتي</h1>
            <p className="text-white/85 text-sm mt-1">كل تجاربك ومقارناتك وتقاريرك في مكان واحد منظَّم.</p>
          </div>
        </div>
        <div className="relative mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          <StatChip icon={<LayoutDashboard className="w-4 h-4" />} value={counts.sessions} label="جلسة" />
          <StatChip icon={<FileBarChart className="w-4 h-4" />} value={counts.reports} label="تقرير" />
          <StatChip icon={<Sparkles className="w-4 h-4" />} value={lastReport ? Math.round(lastReport.score || 0) : 0} label="آخر درجة" />
        </div>
      </section>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {ITEMS.map(({ to, icon: Icon, title, desc, image, tone, accent, counterKey, counterLabel }) => {
          const count = counts[counterKey];
          return (
            <Link key={to} to={to}
              className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 hover:border-transparent shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={image} alt={title} loading="lazy" width={1024} height={768}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className={`absolute inset-0 bg-gradient-to-t ${tone} opacity-60 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-white/95 backdrop-blur flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-slate-800" />
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-bold text-slate-800 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${accent}`} /> {count} {counterLabel}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-extrabold text-[hsl(var(--damij-primary))] mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1">{desc}</p>
                <div className={`inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${tone} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                  <span>افتح الآن</span><ArrowLeft className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const StatChip: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({ icon, value, label }) => (
  <div className="px-3 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
    <div className="flex items-center gap-1.5 text-white/70 text-[11px] font-bold">{icon} {label}</div>
    <div className="text-2xl font-extrabold mt-0.5">{value}</div>
  </div>
);

export default ClinicalPortfolio;
