import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, FileText, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ClinicalListLayout, { SessionCard } from '@/features/clinical/ui/ClinicalListLayout';
import EmailReportDialog from '@/features/clinical/ui/EmailReportDialog';
import { CATEGORY_EMOJI, CATEGORY_LABEL } from '@/features/clinical/types';
import { FiltersRow } from './ClinicalDashboard';

const ClinicalReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('all');

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('clinical_reports')
      .select('*, clinical_sessions(clinical_cases(name_ar,category), clinical_protocols(name_ar))')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    setReports(data || []); setLoading(false);
  })(); }, []);

  const filtered = useMemo(() => reports.filter(r => {
    if (cat !== 'all' && r.clinical_sessions?.clinical_cases?.category !== cat) return false;
    if (q && !`${r.clinical_sessions?.clinical_cases?.name_ar} ${r.clinical_sessions?.clinical_protocols?.name_ar} ${r.summary_ar}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [reports, cat, q]);

  const cats = Array.from(new Set(reports.map(r => r.clinical_sessions?.clinical_cases?.category).filter(Boolean)));
  const avg = reports.length ? Math.round(reports.reduce((a, r) => a + Number(r.score || 0), 0) / reports.length) : 0;
  const best = reports.length ? Math.max(...reports.map(r => Math.round(r.score))) : 0;

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  return (
    <ClinicalListLayout
      backTo="/damij/clinical"
      icon={<FileText className="w-6 h-6" />}
      title="تقاريري السريرية"
      subtitle="كل التقارير جاهزة للمراجعة والتنزيل والمشاركة وإرسالها بالبريد لولي الأمر أو المشرف."
      stats={[
        { label: 'إجمالي', value: reports.length, tone: 'primary' },
        { label: 'متوسط الدرجة', value: avg, tone: 'info' },
        { label: 'أعلى درجة', value: best, tone: 'success' },
        { label: 'تخصّصات', value: cats.length, tone: 'warn' },
      ]}
      filters={<FiltersRow q={q} setQ={setQ} cat={cat} setCat={setCat} catsInData={cats as string[]} />}
    >
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-slate-500 py-16 border-2 border-dashed rounded-2xl bg-white">لا تقارير مطابقة.</div>
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
export default ClinicalReports;
