import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, FileBarChart, ClipboardList, ArrowLeft, Sparkles, Loader2, GitCompare, LayoutDashboard, Beaker, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const cards = [
  { to: '/damij/clinical/cases', icon: ClipboardList, title: 'مكتبة الحالات الافتراضية', desc: 'أكثر من 200 حالة في 5 فئات تربية خاصة و15 تخصصاً طبياً.' },
  { to: '/damij/clinical/free', icon: Beaker, title: 'تجربة حرّة', desc: 'صمّم تجربتك: اختر التدخّل، أدخل التفاصيل، اختر المريض، شاهد النتائج.' },
  { to: '/damij/clinical/dashboard', icon: LayoutDashboard, title: 'لوحة جلساتي', desc: 'كل جلساتك وتقاريرك السابقة مع رسوم تقدّمك السريري.' },
  { to: '/damij/clinical/compare', icon: GitCompare, title: 'مقارنة بين تجارب', desc: 'حلّل تطوّر مهاراتك بمقارنة جلستين أو أكثر بـ AI.' },
  { to: '/damij/clinical/reports', icon: FileBarChart, title: 'تقاريري', desc: 'كل التقارير الكاملة جاهزة للعرض والتنزيل PDF والمشاركة.' },
];

const ClinicalHome: React.FC = () => {
  const [stats, setStats] = useState({ cases: 0, protocols: 0 });
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { (async () => {
    const [{ count: cases }, { count: protocols }] = await Promise.all([
      supabase.from('clinical_cases').select('*', { count: 'exact', head: true }),
      supabase.from('clinical_protocols').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ cases: cases || 0, protocols: protocols || 0 });
  })(); }, [seeding]);

  const seed = async () => {
    setSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('clinical-seed-content', { body: { force: false } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(data?.skipped ? 'المحتوى موجود بالفعل' : `تم توليد ${data?.cases || 0} حالة و${data?.protocols || 0} بروتوكول`);
    } catch (e: any) { toast.error(e?.message ?? 'تعذّر توليد المحتوى'); }
    finally { setSeeding(false); }
  };

  const [seedingMed, setSeedingMed] = useState(false);
  const seedMedical = async () => {
    setSeedingMed(true);
    try {
      const { data, error } = await supabase.functions.invoke('clinical-seed-medical', { body: {} });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const total = (data?.status || []).reduce((a: number, s: any) => a + (s.added_cases || 0), 0);
      toast.success(`تم إضافة ${total} حالة طبية جديدة`);
    } catch (e: any) { toast.error(e?.message ?? 'تعذّر التوليد'); }
    finally { setSeedingMed(false); }
  };

  const empty = stats.cases === 0;

  return (
    <div className="px-6 pt-12 pb-16 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-3">مختبر المحاكاة السريرية</h1>
      <p className="text-lg text-[hsl(var(--damij-text))]/75 mb-6 max-w-3xl">
        بيئة افتراضية احترافية لتدريب طلاب التربية الخاصة والبحث العلمي. حالات افتراضية، بروتوكولات معتمدة، مريض ذكي حواري، وتقارير PDF قابلة للمشاركة.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-10">
        <span className="px-4 py-2 rounded-xl bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-primary))] text-sm font-bold">
          {stats.cases} حالة • {stats.protocols} بروتوكول
        </span>
        <button onClick={seed} disabled={seeding}
          className="px-4 py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60">
          {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {empty ? 'توليد الحالات والبروتوكولات' : 'توسيع المحتوى'}
        </button>
        <button onClick={seedMedical} disabled={seedingMed}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60">
          {seedingMed ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
          توسيع المحتوى الطبي (قلب، عظام…)
        </button>
        <Link to="/damij/clinical/lab" className="px-4 py-2 rounded-xl bg-[hsl(var(--damij-accent-2))] text-white text-sm font-bold flex items-center gap-2">
          <FlaskConical className="w-4 h-4" /> ابدأ تجربة جديدة
        </Link>
      </div>

      {empty && (
        <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          المختبر فارغ حالياً. اضغط <b>توليد الحالات والبروتوكولات</b> لإعداد 60 حالة و40 بروتوكولاً (يستغرق دقيقة تقريباً، يحدث مرة واحدة فقط).
        </div>
      )}

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
