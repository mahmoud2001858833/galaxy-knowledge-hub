import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Share2, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const labels: Record<string,string> = {
  attention: 'الانتباه المستمر', impulse: 'التحكم بالاندفاع', working_memory: 'الذاكرة العاملة',
  flexibility: 'المرونة المعرفية', reaction: 'زمن الاستجابة', sustained: 'ثبات الأداء',
};

const ADHDDiagnosticReport: React.FC = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [r, setR] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const { data } = await supabase.from('adhd_diagnostic_reports').select('*').eq('id', reportId).maybeSingle();
    setR(data); setLoading(false);
  })(); }, [reportId]);

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  if (!r) return <div className="p-12 text-center" dir="rtl">لم يُعثر على التقرير</div>;

  const axes = r.metrics?.axes ?? {};
  const radarData = Object.keys(labels).map(k => ({ axis: labels[k], value: axes[k] ?? 0 }));

  const share = async () => {
    const url = `${window.location.origin}/damij/adhd/share/diagnostic/${r.share_token}`;
    await navigator.clipboard.writeText(url);
    toast.success('تم نسخ رابط المشاركة');
  };

  return (
    <div className="px-4 sm:px-6 pt-10 pb-32 max-w-4xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/adhd/games')} className="flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-4 text-sm">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> رجوع
      </button>

      <motion.header initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-gradient-to-l from-violet-600 to-fuchsia-600 text-white rounded-3xl p-6 mb-6">
        <h1 className="text-3xl font-bold mb-1">تقرير التشخيص باللعب</h1>
        <p className="text-sm opacity-90">دمج 6 ألعاب · فئة DSM-5: <strong>{r.dsm_category || '—'}</strong></p>
      </motion.header>

      <div className="bg-white rounded-3xl p-6 shadow-md mb-6">
        <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-3">المؤشرات الستة</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[0,100]} tick={false} />
              <Radar dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {r.ai_report && (
        <div className="bg-white rounded-3xl p-6 shadow-md mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[hsl(var(--damij-primary))]"><FileText className="w-5 h-5" /><h3 className="font-bold">التقرير التفصيلي</h3></div>
            <button onClick={share} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))]"><Share2 className="w-3.5 h-3.5" /> مشاركة</button>
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-loose">{r.ai_report}</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={() => navigate('/damij/adhd/games?tab=therapy')} className="p-4 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition">
          <Sparkles className="w-5 h-5" /> ابدأ العلاج بالألعاب الآن
        </button>
        <button onClick={() => navigate('/damij/adhd/program/setup')} className="p-4 rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition">
          <FileText className="w-5 h-5" /> برنامج علاجي مخصّص بالذكاء الاصطناعي
        </button>
      </div>
    </div>
  );
};
export default ADHDDiagnosticReport;
