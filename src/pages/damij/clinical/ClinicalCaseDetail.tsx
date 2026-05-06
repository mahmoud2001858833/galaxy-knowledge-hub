import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowRight, Play, BookOpen, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ClinicalCase, ClinicalProtocol, CATEGORY_LABEL, SEVERITY_LABEL } from '@/features/clinical/types';

const ClinicalCaseDetail: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [c, setC] = useState<ClinicalCase | null>(null);
  const [protocols, setProtocols] = useState<ClinicalProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => { (async () => {
    if (!caseId) return;
    const { data: cd } = await supabase.from('clinical_cases').select('*').eq('id', caseId).maybeSingle();
    setC(cd as any);
    if (cd) {
      const { data: ps } = await supabase.from('clinical_protocols').select('*').eq('category', (cd as any).category).order('name_ar');
      setProtocols((ps as any) || []);
    }
    setLoading(false);
  })(); }, [caseId]);

  const startSession = async (protocolId: string) => {
    setStarting(protocolId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('سجّل الدخول أولاً'); navigate('/auth'); return; }
      const { data, error } = await supabase.from('clinical_sessions').insert({
        user_id: user.id, case_id: caseId!, protocol_id: protocolId,
      }).select('id').single();
      if (error) throw error;
      navigate(`/damij/clinical/lab/${data.id}`);
    } catch (e: any) { toast.error(e?.message ?? 'تعذّر بدء الجلسة'); }
    finally { setStarting(null); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  if (!c) return <div className="text-center pt-20">الحالة غير موجودة</div>;

  return (
    <div className="px-6 pt-10 pb-16 max-w-5xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/clinical/cases')}
        className="px-3 py-1.5 mb-4 rounded-lg bg-white border text-sm flex items-center gap-1">
        <ArrowRight className="w-4 h-4" /> الحالات
      </button>

      <header className="mb-6 p-6 rounded-3xl bg-gradient-to-br from-[hsl(var(--damij-accent-2))]/10 to-[hsl(var(--damij-primary))]/5 border">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-xs px-2 py-1 rounded-full bg-white border font-bold text-[hsl(var(--damij-primary))]">{CATEGORY_LABEL[c.category]}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">{SEVERITY_LABEL[c.severity]}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-white border">{c.age_years} سنة • {c.gender}</span>
        </div>
        <h1 className="text-2xl font-bold text-[hsl(var(--damij-primary))]">{c.name_ar}</h1>
        <p className="text-slate-700 mt-2">{c.summary_ar}</p>
      </header>

      <section className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white border">
          <h3 className="font-bold flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4" /> التاريخ المرضي</h3>
          <p className="text-sm text-slate-700">{c.history_ar}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border">
          <h3 className="font-bold flex items-center gap-2 mb-2"><ClipboardList className="w-4 h-4" /> العلامات الظاهرة</h3>
          <ul className="text-sm text-slate-700 list-disc pr-4 space-y-1">
            {(c.presenting_signs_ar || []).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div className="p-5 rounded-2xl bg-white border md:col-span-2">
          <h3 className="font-bold mb-2">الملف الحسّي</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            {Object.entries(c.sensory_profile || {}).map(([k, v]) => (
              <div key={k} className="p-2 rounded-lg bg-slate-50 border">
                <div className="text-xs text-slate-500">{k}</div>
                <div className="font-bold">{v as string}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <h2 className="text-xl font-bold text-[hsl(var(--damij-primary))] mb-3">اختر بروتوكولاً لبدء الجلسة</h2>
      {protocols.length === 0 ? (
        <div className="text-center text-slate-500 py-10 border-2 border-dashed rounded-2xl">لا بروتوكولات لهذه الفئة بعد.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {protocols.map(p => (
            <div key={p.id} className="p-4 rounded-2xl bg-white border flex flex-col">
              <div className="font-bold text-[hsl(var(--damij-primary))]">{p.name_ar}</div>
              <div className="text-xs text-slate-500 mb-1">{p.short_ar}</div>
              <p className="text-sm text-slate-700 flex-1">{p.goal_ar}</p>
              <div className="text-xs text-slate-500 mt-2">{(p.steps || []).length} خطوات</div>
              <button onClick={() => startSession(p.id)} disabled={!!starting}
                className="mt-3 px-4 py-2 rounded-xl bg-[hsl(var(--damij-accent-2))] text-white text-sm font-bold flex items-center justify-center gap-1 disabled:opacity-60">
                {starting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                ابدأ التجربة
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ClinicalCaseDetail;
