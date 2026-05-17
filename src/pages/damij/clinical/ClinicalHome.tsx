import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileBarChart, ClipboardList, ArrowLeft, GitCompare, LayoutDashboard, Beaker } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DamijSEO from '@/components/damij/DamijSEO';

const cards = [
  { to: '/damij/clinical/cases',     icon: ClipboardList,   title: 'مكتبة الحالات الافتراضية', desc: 'حالات جاهزة بهوية بصرية مميّزة لكل مريض، مع كل الأدوية والأجهزة والتدخّلات.' },
  { to: '/damij/clinical/free',      icon: Beaker,          title: 'تجربة سريرية حرّة',        desc: 'صمّم تدخّلك من الصفر أو ابدأ من مكتبة أمثلة جاهزة وعدّلها بحرية.' },
  { to: '/damij/clinical/dashboard', icon: LayoutDashboard, title: 'لوحة جلساتي',              desc: 'كل جلساتك السابقة مع رسوم تطوّر مهاراتك السريرية.' },
  { to: '/damij/clinical/compare',   icon: GitCompare,      title: 'مقارنة بين تجارب',         desc: 'حلّل تطوّرك بمقارنة جلستين أو أكثر بمساعدة الذكاء الاصطناعي.' },
  { to: '/damij/clinical/reports',   icon: FileBarChart,    title: 'تقاريري',                  desc: 'كل التقارير الكاملة جاهزة للعرض والتنزيل والمشاركة.' },
];

const ClinicalHome: React.FC = () => {
  const [stats, setStats] = useState({ cases: 0, protocols: 0 });

  useEffect(() => { (async () => {
    const [{ count: cases }, { count: protocols }] = await Promise.all([
      supabase.from('clinical_cases').select('*', { count: 'exact', head: true }),
      supabase.from('clinical_protocols').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ cases: cases || 0, protocols: protocols || 0 });
  })(); }, []);

  return (
    <div className="px-6 pt-12 pb-16 max-w-6xl mx-auto" dir="rtl">
      <DamijSEO
        title="مختبر المحاكاة السريرية — منصة دامج"
        description="مختبر المحاكاة السريرية من منصة دامج: مرضى افتراضيون، أجهزة طبية تفاعلية، وتدخّلات دوائية وسلوكية وحسّية لتدريب طلاب التربية الخاصة والطب."
        path="/damij/clinical"
        keywords="محاكاة سريرية, تدريب طبي, تربية خاصة, منصة دامج السريرية"
      />
      <h1 className="text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-3">مختبر المحاكاة السريرية</h1>
      <p className="text-lg text-[hsl(var(--damij-text))]/75 mb-6 max-w-3xl">
        بيئة احترافية لتدريب طلاب التربية الخاصة والطب: مرضى افتراضيون أذكياء، أجهزة طبية تفاعلية، تدخّلات دوائية وسلوكية وحسّية، وتقارير قابلة للمشاركة.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-10">
        <span className="px-4 py-2 rounded-xl bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-primary))] text-sm font-bold">
          {stats.cases} حالة • {stats.protocols} بروتوكول
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map(({ to, icon: Icon, title, desc }) => (
          <Link key={to} to={to} className="group p-7 rounded-3xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 hover:border-[hsl(var(--damij-primary))]/40 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--damij-accent-2))]/15 text-[hsl(var(--damij-accent-2))] flex items-center justify-center mb-5">
              <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[hsl(var(--damij-primary))] mb-2">{title}</h3>
            <p className="text-[hsl(var(--damij-text))]/70 leading-relaxed mb-4">{desc}</p>
            <div className="flex items-center gap-2 text-[hsl(var(--damij-accent-2))] font-semibold group-hover:gap-3 transition-all">
              <span>افتح</span><ArrowLeft className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default ClinicalHome;
