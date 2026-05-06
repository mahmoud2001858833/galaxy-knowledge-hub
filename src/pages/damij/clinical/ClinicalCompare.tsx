import React, { useEffect, useState } from 'react';
import { Loader2, GitCompare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ClinicalCompare: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('clinical_reports')
      .select('id, score, summary_ar, session_id, rubric, clinical_sessions(clinical_cases(name_ar), clinical_protocols(name_ar))')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    setReports(data || []); setLoading(false);
  })(); }, []);

  const toggle = (sid: string) => setPicked(p => p.includes(sid) ? p.filter(x => x !== sid) : [...p, sid]);

  const run = async () => {
    if (picked.length < 2) { toast.error('اختر جلستين على الأقل'); return; }
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('clinical-compare-sessions', { body: { sessionIds: picked } });
      if (error) throw error; if (data?.error) throw new Error(data.error);
      setAnalysis(data); toast.success('تمت المقارنة');
    } catch (e: any) { toast.error(e?.message ?? 'تعذّر'); }
    finally { setRunning(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  const radarData = analysis?.analysis?.radar?.length
    ? analysis.analysis.radar[0].values.map((_: any, i: number) => {
        const row: any = { dim: '' };
        analysis.analysis.radar.forEach((d: any) => { row.dim = d.dimension; });
        return null;
      }).filter(Boolean)
    : [];

  // Better: pivot
  const pivoted = analysis?.analysis?.radar
    ? analysis.analysis.radar.map((d: any) => {
        const row: any = { dim: d.dimension };
        d.values.forEach((v: number, i: number) => { row[`جلسة ${i + 1}`] = v; });
        return row;
      })
    : [];

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-5xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-2">مقارنة بين تجارب</h1>
      <p className="text-slate-600 text-sm mb-4">اختر جلستين أو أكثر ثم احصل على تحليل AI مقارن.</p>

      <div className="space-y-2 mb-4">
        {reports.map(r => (
          <label key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${picked.includes(r.session_id) ? 'bg-[hsl(var(--damij-accent-2))]/10 border-[hsl(var(--damij-accent-2))]' : 'bg-white border-slate-200'}`}>
            <input type="checkbox" checked={picked.includes(r.session_id)} onChange={() => toggle(r.session_id)} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{r.clinical_sessions?.clinical_cases?.name_ar} • {r.clinical_sessions?.clinical_protocols?.name_ar}</div>
              <div className="text-xs text-slate-500 line-clamp-1">{r.summary_ar}</div>
            </div>
            <div className="text-emerald-700 font-bold">{Math.round(r.score)}</div>
          </label>
        ))}
      </div>

      <button onClick={run} disabled={running || picked.length < 2}
        className="w-full py-3 rounded-2xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60">
        {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        قارن باستخدام AI
      </button>

      {analysis && (
        <section className="mt-6 p-5 rounded-3xl bg-white border space-y-4">
          <h2 className="text-xl font-bold text-[hsl(var(--damij-primary))]">{analysis.analysis.title_ar}</h2>
          <p className="text-sm text-slate-700">{analysis.analysis.overall_trend_ar}</p>
          {pivoted.length > 0 && (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={pivoted}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} />
                  {analysis.analysis.radar[0].values.map((_: any, i: number) => (
                    <Radar key={i} dataKey={`جلسة ${i + 1}`} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.25} />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm">
              <div className="font-bold mb-1 text-emerald-800">رؤى</div>
              <ul className="list-disc pr-4 space-y-1">{(analysis.analysis.insights_ar || []).map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sm">
              <div className="font-bold mb-1 text-sky-800">التركيز التالي</div>
              <ul className="list-disc pr-4 space-y-1">{(analysis.analysis.next_focus_ar || []).map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
export default ClinicalCompare;
