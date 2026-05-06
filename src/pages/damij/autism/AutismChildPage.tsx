import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AutismChildPage: React.FC = () => {
  const { token } = useParams();
  const [program, setProgram] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [reports, setReports] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    if (!token) return;
    const { data: prog } = await supabase.from('autism_programs').select('*').eq('share_token', token).maybeSingle();
    setProgram(prog);
    if (prog) {
      const { data: ds } = await supabase.from('autism_program_days').select('*').eq('program_id', prog.id).order('day_index');
      setDays(ds || []);
      const { data: rs } = await supabase.from('autism_day_reports').select('*').in('day_id', (ds || []).map((d: any) => d.id));
      const map: Record<string, any> = {};
      (rs || []).forEach((r: any) => { map[r.day_id] = r; });
      setReports(map);
    }
    setLoading(false);
  })(); }, [token]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  if (!program) return <div className="text-center pt-20">رابط غير صالح</div>;

  const completedCount = Object.keys(reports).length;
  const avgScore = Object.values(reports).reduce((a: number, r: any) => a + (r.score ?? 0), 0) / Math.max(1, completedCount);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-20" dir="rtl">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))]">{program.title_ar}</h1>
        <p className="text-slate-600 mt-2">{program.summary_ar}</p>
        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('تم نسخ الرابط'); }}
          className="mt-4 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm inline-flex items-center gap-1">
          <Copy className="w-4 h-4" /> نسخ الرابط
        </button>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="p-4 rounded-2xl bg-white border text-center">
          <div className="text-2xl font-bold">{program.total_days}</div>
          <div className="text-xs text-slate-500">إجمالي الأيام</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
          <div className="text-2xl font-bold text-emerald-700">{completedCount}</div>
          <div className="text-xs text-slate-500">مكتمل</div>
        </div>
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-center">
          <div className="text-2xl font-bold text-sky-700">{Math.round(avgScore)}</div>
          <div className="text-xs text-slate-500">متوسط الأداء</div>
        </div>
      </div>

      <div className="space-y-2">
        {days.map(d => {
          const r = reports[d.id];
          return (
            <div key={d.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--damij-accent-2))]/10 text-[hsl(var(--damij-primary))] font-bold flex items-center justify-center">{d.day_index}</div>
              <div className="flex-1">
                <div className="font-bold text-sm">{d.theme_ar}</div>
                <div className="text-xs text-slate-500">{d.focus_skill_ar}</div>
              </div>
              {r && <div className="flex items-center gap-1 text-emerald-700 text-sm font-bold"><CheckCircle2 className="w-4 h-4" /> {Math.round(r.score)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AutismChildPage;
