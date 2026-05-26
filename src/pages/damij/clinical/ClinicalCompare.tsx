import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, GitCompare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import ClinicalListLayout, { SessionCard } from '@/features/clinical/ui/ClinicalListLayout';
import { FiltersRow } from './ClinicalDashboard';
import { CATEGORY_EMOJI, CATEGORY_LABEL } from '@/features/clinical/types';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ClinicalCompare: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('all');

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('clinical_reports')
      .select('id, score, summary_ar, session_id, rubric, created_at, clinical_sessions(clinical_cases(name_ar,category), clinical_protocols(name_ar))')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    setReports(data || []); setLoading(false);
  })(); }, []);

  const filtered = useMemo(() => reports.filter(r => {
    if (cat !== 'all' && r.clinical_sessions?.clinical_cases?.category !== cat) return false;
    if (q && !`${r.clinical_sessions?.clinical_cases?.name_ar} ${r.clinical_sessions?.clinical_protocols?.name_ar} ${r.summary_ar}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [reports, cat, q]);

  const toggle = (sid: string) => setPicked(p => p.includes(sid) ? p.filter(x => x !== sid) : [...p, sid]);
  const cats = Array.from(new Set(reports.map(r => r.clinical_sessions?.clinical_cases?.category).filter(Boolean)));

  const run = async () => {
    if (picked.length < 2) { toast.error('اختر جلستين على الأقل'); return; }
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('clinical-compare-sessions', { body: { sessionIds: picked } });
      if (error) throw error; if ((data as any)?.error) throw new Error((data as any).error);
      setAnalysis(data); toast.success('تمت المقارنة');
      setTimeout(() => document.getElementById('cmp-result')?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e: any) { toast.error(e?.message ?? 'تعذّر'); }
    finally { setRunning(false); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  const pivoted = analysis?.analysis?.radar
    ? analysis.analysis.radar.map((d: any) => {
        const row: any = { dim: d.dimension };
        d.values.forEach((v: number, i: number) => { row[`جلسة ${i + 1}`] = v; });
        return row;
      })
    : [];

  return (
    <ClinicalListLayout
      backTo="/damij/clinical"
      icon={<GitCompare className="w-6 h-6" />}
      title="مقارنة بين تجارب"
      subtitle="اختر جلستين أو أكثر، ثم احصل على تحليل مقارن بالذكاء الاصطناعي يُظهر تطوّر مهاراتك."
      stats={[
        { label: 'الجلسات المتاحة', value: reports.length, tone: 'primary' },
        { label: 'مُختارة', value: picked.length, tone: 'info' },
      ]}
      filters={<FiltersRow q={q} setQ={setQ} cat={cat} setCat={setCat} catsInData={cats as string[]} />}
    >
      <div className="space-y-2 mb-4">
        {filtered.map(r => (
          <SessionCard key={r.id}
            caseName={r.clinical_sessions?.clinical_cases?.name_ar || '—'}
            protocolName={r.clinical_sessions?.clinical_protocols?.name_ar}
            date={r.created_at}
            score={Number(r.score)}
            summary={r.summary_ar}
            selected={picked.includes(r.session_id)}
            onClick={() => toggle(r.session_id)}
            badge={r.clinical_sessions?.clinical_cases?.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {CATEGORY_EMOJI[r.clinical_sessions.clinical_cases.category]} {CATEGORY_LABEL[r.clinical_sessions.clinical_cases.category]}
              </span>
            )}
            right={<div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs font-bold ${picked.includes(r.session_id) ? 'bg-[hsl(var(--damij-accent-2))] text-white border-[hsl(var(--damij-accent-2))]' : 'border-slate-300'}`}>{picked.includes(r.session_id) ? '✓' : ''}</div>}
          />
        ))}
      </div>

      <button onClick={run} disabled={running || picked.length < 2}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-[hsl(var(--damij-primary))] to-sky-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg">
        {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        قارن باستخدام AI ({picked.length})
      </button>

      {analysis && (
        <section id="cmp-result" className="mt-6 p-5 rounded-3xl bg-white border space-y-4">
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
    </ClinicalListLayout>
  );
};
export default ClinicalCompare;
