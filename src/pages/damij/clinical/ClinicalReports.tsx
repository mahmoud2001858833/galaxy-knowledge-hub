import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ClinicalReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('clinical_reports')
      .select('*, clinical_sessions(clinical_cases(name_ar), clinical_protocols(name_ar))')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    setReports(data || []); setLoading(false);
  })(); }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-6">تقاريري السريرية</h1>
      {reports.length === 0 ? (
        <div className="text-center text-slate-500 py-16 border-2 border-dashed rounded-2xl">لا تقارير بعد. ابدأ تجربة من المختبر.</div>
      ) : (
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
      )}
    </div>
  );
};
export default ClinicalReports;
