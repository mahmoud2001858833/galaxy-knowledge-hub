import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, FileText, GitCompare, ArrowLeft, Search, LayoutDashboard, Trophy, TrendingUp, BarChart3, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import ClinicalListLayout, { SessionCard } from '@/features/clinical/ui/ClinicalListLayout';
import EmailReportDialog from '@/features/clinical/ui/EmailReportDialog';
import { CATEGORIES, CATEGORY_LABEL, CATEGORY_EMOJI } from '@/features/clinical/types';

const ClinicalDashboard: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('all');

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('clinical_reports')
      .select('*, clinical_sessions(clinical_cases(name_ar,category), clinical_protocols(name_ar), started_at)')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    setReports(data || []); setLoading(false);
  })(); }, []);

  const filtered = useMemo(() => reports.filter(r => {
    if (cat !== 'all' && r.clinical_sessions?.clinical_cases?.category !== cat) return false;
    if (q && !`${r.clinical_sessions?.clinical_cases?.name_ar} ${r.clinical_sessions?.clinical_protocols?.name_ar} ${r.summary_ar}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [reports, cat, q]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  const trend = [...reports].reverse().map((r, i) => ({ name: `#${i + 1}`, score: Math.round(r.score) }));
  const avg = reports.length ? Math.round(reports.reduce((a, r) => a + Number(r.score || 0), 0) / reports.length) : 0;
  const best = reports.length ? Math.max(...reports.map(r => Math.round(r.score))) : 0;
  const cats = Array.from(new Set(reports.map(r => r.clinical_sessions?.clinical_cases?.category).filter(Boolean)));

  return (
    <ClinicalListLayout
      backTo="/damij/clinical"
      icon={<LayoutDashboard className="w-6 h-6" />}
      title="لوحة جلساتي السريرية"
      subtitle="تتبّع تقدّمك السريري، شاهد منحنى تطوّرك، وادخل لأي تقرير بنقرة واحدة."
      actions={
        <Link to="/damij/clinical/compare" className="px-3 py-2 rounded-xl bg-white text-[hsl(var(--damij-primary))] text-sm font-bold flex items-center gap-1.5 hover:bg-white/90">
          <GitCompare className="w-4 h-4" /> قارن جلسات
        </Link>
      }
      stats={[
        { label: 'عدد التقارير', value: reports.length, tone: 'primary' },
        { label: 'متوسط الأداء', value: avg, tone: 'info' },
        { label: 'أعلى درجة', value: best, tone: 'success' },
        { label: 'تخصّصات', value: cats.length, tone: 'warn' },
      ]}
      filters={
        <FiltersRow q={q} setQ={setQ} cat={cat} setCat={setCat} catsInData={cats as string[]} />
      }
    >
      <section className="p-5 rounded-3xl bg-white border mb-6">
        <h2 className="font-extrabold text-[hsl(var(--damij-primary))] mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> منحنى تطوّرك</h2>
        {trend.length === 0 ? <div className="text-center text-slate-500 py-10 text-sm">لا تقارير بعد.</div> : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="dashG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--damij-accent-2))" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="hsl(var(--damij-accent-2))" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--damij-accent-2))" fill="url(#dashG)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <h2 className="font-extrabold text-[hsl(var(--damij-primary))] mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> الجلسات ({filtered.length})</h2>
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-slate-500 py-12 border-2 border-dashed rounded-2xl bg-white">لا جلسات مطابقة.</div>
        )}
        {filtered.map(r => (
          <SessionCard key={r.id}
            href={`/damij/clinical/report/${r.id}`}
            caseName={r.clinical_sessions?.clinical_cases?.name_ar || '—'}
            protocolName={r.clinical_sessions?.clinical_protocols?.name_ar}
            date={r.created_at}
            score={Number(r.score)}
            summary={r.summary_ar}
            badge={r.clinical_sessions?.clinical_cases?.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {CATEGORY_EMOJI[r.clinical_sessions.clinical_cases.category]} {CATEGORY_LABEL[r.clinical_sessions.clinical_cases.category]}
              </span>
            )}
            right={<EmailReportDialog reportId={r.id} trigger={
              <span className="p-2 rounded-lg bg-slate-100 hover:bg-[hsl(var(--damij-accent-2))]/15 text-slate-600 hover:text-[hsl(var(--damij-accent-2))] block"><Mail className="w-4 h-4" /></span>
            } />}
          />
        ))}
      </div>
    </ClinicalListLayout>
  );
};

export const FiltersRow: React.FC<{ q: string; setQ: (v: string) => void; cat: string; setCat: (v: string) => void; catsInData: string[] }> = ({ q, setQ, cat, setCat, catsInData }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="relative flex-1 min-w-[200px]">
      <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث في الجلسات…"
        className="w-full pr-10 pl-3 py-2 rounded-xl border bg-white text-sm" />
    </div>
    <select value={cat} onChange={e => setCat(e.target.value)}
      className="px-3 py-2 rounded-xl border bg-white text-sm">
      <option value="all">كل الفئات</option>
      {CATEGORIES.filter(c => catsInData.includes(c.key)).map(c => (
        <option key={c.key} value={c.key}>{c.emoji} {c.ar}</option>
      ))}
    </select>
  </div>
);

export default ClinicalDashboard;
