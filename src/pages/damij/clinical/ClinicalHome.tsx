import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileBarChart, ClipboardList, ArrowLeft, GitCompare, LayoutDashboard, Beaker, Activity, Sparkles, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DamijSEO from '@/components/damij/DamijSEO';

import { Briefcase } from 'lucide-react';

const cards = [
  { to: '/damij/clinical/cases',     icon: ClipboardList,   title: 'مكتبة الحالات الافتراضية', desc: 'حالات جاهزة مصنّفة بفئات طبية واضحة، كل فئة بصورة وموارد كاملة.', gradient: 'from-sky-500 to-indigo-600',     badge: 'ابدأ من هنا' },
  { to: '/damij/clinical/free',      icon: Beaker,          title: 'تجربة سريرية حرّة',        desc: 'صمّم تدخّلك من الصفر أو من أمثلة جاهزة وعدّلها بحرية.',           gradient: 'from-fuchsia-500 to-rose-500', badge: 'إبداع' },
  { to: '/damij/clinical/portfolio', icon: Briefcase,       title: 'حقيبتي',                   desc: 'لوحة جلساتي، مقارنة تجاربي، وكل تقاريري في مكان واحد أنيق.',       gradient: 'from-emerald-500 to-teal-600',  badge: 'الكل في واحد' },
];

const ClinicalHome: React.FC = () => {
  const [stats, setStats] = useState({ cases: 0, protocols: 0, sessions: 0, bestScore: 0 });
  const [lastReport, setLastReport] = useState<any>(null);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const [{ count: cases }, { count: protocols }, sessionsRes, lastRes] = await Promise.all([
      supabase.from('clinical_cases').select('*', { count: 'exact', head: true }),
      supabase.from('clinical_protocols').select('*', { count: 'exact', head: true }),
      user ? supabase.from('clinical_reports').select('score', { count: 'exact' }).eq('user_id', user.id) : Promise.resolve({ count: 0, data: [] } as any),
      user ? supabase.from('clinical_reports').select('id,score,created_at,clinical_sessions(clinical_cases(name_ar))').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle() : Promise.resolve({ data: null } as any),
    ]);
    const scores = (sessionsRes as any).data?.map((r: any) => Number(r.score) || 0) || [];
    setStats({
      cases: cases || 0,
      protocols: protocols || 0,
      sessions: (sessionsRes as any).count || 0,
      bestScore: scores.length ? Math.max(...scores) : 0,
    });
    setLastReport((lastRes as any).data || null);
  })(); }, []);

  return (
    <div className="px-4 sm:px-6 pt-10 pb-16 max-w-6xl mx-auto" dir="rtl">
      <DamijSEO
        title="مختبر المحاكاة السريرية — منصة دامج"
        description="مختبر المحاكاة السريرية من منصة دامج: مرضى افتراضيون، أجهزة طبية تفاعلية، وتدخّلات دوائية وسلوكية وحسّية لتدريب طلاب التربية الخاصة والطب."
        path="/damij/clinical"
        keywords="محاكاة سريرية, تدريب طبي, تربية خاصة, منصة دامج السريرية"
      />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[hsl(var(--damij-primary))] via-sky-700 to-indigo-800 text-white p-6 sm:p-10 mb-8 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-fuchsia-300/15 blur-3xl" />
        <div className="absolute top-6 left-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" /> مدعوم بالذكاء الاصطناعي
        </div>

        <div className="relative flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Stethoscope className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">مختبر المحاكاة السريرية</h1>
            <div className="text-white/80 text-sm mt-1">منصة دامج • بيئة تدريب احترافية</div>
          </div>
        </div>

        <p className="relative text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl mb-6">
          مرضى افتراضيون أذكياء، أجهزة طبية تفاعلية، وتدخّلات دوائية وسلوكية وحسّية كاملة، مع تقارير قابلة للمشاركة والإرسال بالبريد لأولياء الأمور والمشرفين.
        </p>

        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <HeroStat icon={<ClipboardList className="w-4 h-4" />} value={stats.cases} label="حالة" />
          <HeroStat icon={<Activity className="w-4 h-4" />} value={stats.protocols} label="بروتوكول" />
          <HeroStat icon={<LayoutDashboard className="w-4 h-4" />} value={stats.sessions} label="جلستي" />
          <HeroStat icon={<Sparkles className="w-4 h-4" />} value={stats.bestScore} label="أعلى درجة" />
        </div>

        {lastReport && (
          <Link to={`/damij/clinical/report/${lastReport.id}`}
            className="relative mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[hsl(var(--damij-primary))] text-sm font-bold hover:bg-white/90 transition">
            <FileBarChart className="w-4 h-4" />
            آخر تقرير: {lastReport.clinical_sessions?.clinical_cases?.name_ar} • {Math.round(lastReport.score)}/100
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
      </section>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(({ to, icon: Icon, title, desc, gradient, badge }, idx) => (
          <Link key={to} to={to}
            className={`group relative overflow-hidden p-6 rounded-3xl bg-white border border-slate-200 hover:border-transparent shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${idx === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${gradient}`} />
            <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 group-hover:scale-110 transition`} />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                {badge && (
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold bg-gradient-to-r ${gradient} text-white shadow`}>
                    {badge}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-extrabold text-[hsl(var(--damij-primary))] mb-2">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4 min-h-[3rem]">{desc}</p>
              <div className={`flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                <span>افتح الآن</span><ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-[hsl(var(--damij-accent-2))]" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const HeroStat: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({ icon, value, label }) => (
  <div className="px-3 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
    <div className="flex items-center gap-1.5 text-white/70 text-[11px] font-bold">{icon} {label}</div>
    <div className="text-2xl font-extrabold mt-0.5">{value}</div>
  </div>
);

export default ClinicalHome;
