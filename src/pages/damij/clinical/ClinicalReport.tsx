import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowRight, Download, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { exportElementToPdf } from '@/lib/pdfExport';
import EmailReportDialog from '@/features/clinical/ui/EmailReportDialog';

const ClinicalReport: React.FC = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [r, setR] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { (async () => {
    if (!reportId) return;
    const { data } = await supabase.from('clinical_reports')
      .select('*, clinical_sessions(case_id, protocol_id, attention, anxiety, progress, started_at, ended_at, clinical_cases(name_ar, age_years, category), clinical_protocols(name_ar))')
      .eq('id', reportId).maybeSingle();
    setR(data); setLoading(false);
  })(); }, [reportId]);

  const exportPdf = async () => {
    if (!ref.current) return;
    setExporting(true);
    try { await exportElementToPdf(ref.current, `clinical-report-${r?.id}.pdf`); toast.success('تم التنزيل'); }
    catch { toast.error('تعذّر التصدير'); } finally { setExporting(false); }
  };

  const copyShare = async () => {
    const url = `${window.location.origin}/clinical/r/${r.share_token}`;
    await navigator.clipboard.writeText(url);
    toast.success('تم نسخ رابط المشاركة', { action: { label: 'فتح', onClick: () => window.open(url, '_blank') } });
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  if (!r) return <div className="text-center pt-20">التقرير غير موجود</div>;

  const session = r.clinical_sessions;
  const radarData = Object.entries(r.rubric || {}).map(([k, v]) => ({ dim: k, score: Number(v) || 0 }));

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-4xl mx-auto" dir="rtl">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => navigate('/damij/clinical/dashboard')} className="px-3 py-1.5 rounded-lg bg-white border text-sm flex items-center gap-1">
          <ArrowRight className="w-4 h-4" /> لوحة الجلسات
        </button>
        <button onClick={copyShare} className="px-3 py-1.5 rounded-lg bg-white border text-sm flex items-center gap-1">
          <Copy className="w-4 h-4" /> نسخ رابط المشاركة
        </button>
        <a href={`/clinical/r/${r.share_token}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-white border text-sm flex items-center gap-1">
          <ExternalLink className="w-4 h-4" /> الصفحة العامة
        </a>
        <EmailReportDialog reportId={r.id} />
        <button onClick={exportPdf} disabled={exporting} className="px-3 py-1.5 rounded-lg bg-[hsl(var(--damij-primary))] text-white text-sm font-bold flex items-center gap-1">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} تصدير PDF
        </button>
      </div>

      <div ref={ref} className="space-y-4">
        <header className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200">
          <div className="text-xs text-slate-500">{session?.clinical_cases?.name_ar} • {session?.clinical_protocols?.name_ar}</div>
          <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mt-1">التقرير السريري النهائي</h1>
          <div className="text-3xl font-extrabold text-emerald-700 mt-3">{Math.round(r.score)}/100</div>
          {r.diagnosis_ar && <div className="text-sm mt-2"><b>الانطباع التشخيصي:</b> {r.diagnosis_ar}</div>}
          <p className="text-slate-700 mt-3">{r.summary_ar}</p>
        </header>

        {radarData.length > 0 && (
          <section className="p-5 rounded-3xl bg-white border">
            <h2 className="font-bold text-[hsl(var(--damij-primary))] mb-3">رادار المهارات</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar dataKey="score" stroke="hsl(var(--damij-accent-2))" fill="hsl(var(--damij-accent-2))" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <div className="grid sm:grid-cols-3 gap-3">
          <Block color="emerald" title="نقاط القوة" items={r.strengths_ar} />
          <Block color="amber" title="نقاط الضعف" items={r.weaknesses_ar} />
          <Block color="sky" title="التوصيات" items={r.recommendations_ar} />
        </div>

        {(r.references_ar?.length || 0) > 0 && (
          <section className="p-5 rounded-3xl bg-white border">
            <h2 className="font-bold text-[hsl(var(--damij-primary))] mb-2">المراجع</h2>
            <ul className="text-sm text-slate-700 list-disc pr-5 space-y-1">
              {r.references_ar.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

const Block: React.FC<{ color: string; title: string; items: string[] }> = ({ color, title, items }) => {
  const map: Record<string, string> = { emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800', amber: 'bg-amber-50 border-amber-200 text-amber-800', sky: 'bg-sky-50 border-sky-200 text-sky-800' };
  return (
    <div className={`p-4 rounded-2xl border ${map[color]}`}>
      <div className="font-bold mb-2">{title}</div>
      <ul className="text-sm list-disc pr-4 space-y-1">{(items || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
    </div>
  );
};

export default ClinicalReport;
