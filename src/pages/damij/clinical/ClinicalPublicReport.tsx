import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ClinicalPublicReport: React.FC = () => {
  const { token } = useParams();
  const [r, setR] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    if (!token) return;
    const { data } = await supabase.from('clinical_reports').select('*').eq('share_token', token).maybeSingle();
    setR(data); setLoading(false);
  })(); }, [token]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  if (!r) return <div className="text-center pt-20">رابط غير صالح</div>;

  return (
    <div className="px-4 sm:px-6 pt-10 pb-20 max-w-3xl mx-auto" dir="rtl">
      <header className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-sky-50 border mb-4">
        <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">تقرير سريري</h1>
        <div className="text-3xl font-extrabold text-emerald-700 mt-3">{Math.round(r.score)}/100</div>
        {r.diagnosis_ar && <div className="text-sm mt-2"><b>الانطباع التشخيصي:</b> {r.diagnosis_ar}</div>}
        <p className="text-slate-700 mt-3">{r.summary_ar}</p>
      </header>
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          ['نقاط القوة', r.strengths_ar, 'emerald'],
          ['نقاط الضعف', r.weaknesses_ar, 'amber'],
          ['التوصيات', r.recommendations_ar, 'sky'],
        ].map(([title, items, color]: any) => (
          <div key={title} className={`p-4 rounded-2xl border bg-${color}-50 border-${color}-200`}>
            <div className="font-bold mb-2">{title}</div>
            <ul className="text-sm list-disc pr-4 space-y-1">{(items || []).map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ClinicalPublicReport;
