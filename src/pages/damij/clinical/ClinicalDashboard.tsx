import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText, GitCompare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ClinicalDashboard: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('clinical_reports')
      .select('*, clinical_sessions(clinical_cases(name_ar,category), clinical_protocols(name_ar), started_at)')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    setReports(data || []); setLoading(false);
  })(); }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  const trend = [...reports].reverse().map((r, i) => ({ name: `#${i + 1}`, score: Math.round(r.score) }));
  const avg = reports.length ? Math.round(reports.reduce((a, r) => a + Number(r.score || 0), 0) / reports.length) : 0;

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-5xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-6">لوحة جلساتي السريرية</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="عدد التقارير" value={reports.length} />
        <Stat label="متوسط الأداء" value={avg} />
        <Stat label="أعلى درجة" value={reports.length ? Math.max(...reports.map(r => Math.round(r.score))) : 0} />
      </div>

      <section className="p-5 rounded-3xl bg-white border mb-6">
        <h2 className="font-bold text-[hsl(var(--damij-primary))] mb-3">منحنى تطوّرك</h2>
        {trend.length === 0 ? <div className="text-center text-slate-500 py-8 text-sm">لا تقارير بعد.</div> : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--damij-accent-2))" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="flex justify-end mb-3">
        <Link to="/damij/clinical/compare" className="px-3 py-1.5 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-sm font-bold flex items-center gap-1">
          <GitCompare className="w-4 h-4" /> قارن جلسات
        </Link>
      </div>

      <div className="space-y-2">
        {reports.map(r => (
          <Link key={r.id} to={`/damij/clinical/report/${r.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-white border hover:border-[hsl(var(--damij-accent-2))]/40">
            <FileText className="w-5 h-5 text-[hsl(var(--damij-primary))]" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{r.clinical_sessions?.clinical_cases?.name_ar} • {r.clinical_sessions?.clinical_protocols?.name_ar}</div>
              <div className="text-xs text-slate-500 line-clamp-1">{r.summary_ar}</div>
            </div>
            <div className="text-emerald-700 font-bold">{Math.round(r.score)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-white border text-center">
    <div className="text-2xl font-bold text-[hsl(var(--damij-primary))]">{value}</div>
    <div className="text-xs text-slate-500">{label}</div>
  </div>
);
export default ClinicalDashboard;
